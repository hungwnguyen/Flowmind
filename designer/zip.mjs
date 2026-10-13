// Portable SVGPRO v2 ZIP. Stored output, stored/deflate input; no server or library.
const encoder = new TextEncoder(),
  decoder = new TextDecoder("utf-8", { fatal: true });
export const MAX_PACKAGE = 96 * 1024 * 1024;
export function safePath(path) {
  if (
    typeof path !== "string" ||
    !path ||
    path.length > 512 ||
    /[\\:\x00-\x1f]/.test(path) ||
    path.split("/").some((p) => !p || p === "." || p === "..")
  )
    throw Error(
      "Use a relative path inside the workspace, without .. or absolute paths.",
    );
  return path;
}
const table = Uint32Array.from({ length: 256 }, (_, i) => {
  for (let j = 0; j < 8; j++) i = (i >>> 1) ^ (i & 1 ? 0xedb88320 : 0);
  return i >>> 0;
});
export function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = table[(crc ^ byte) & 255] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}
export function writeZip(entries) {
  const local = [],
    central = [];
  let offset = 0,
    total = 0;
  for (const [name, input] of entries) {
    safePath(name);
    const data =
        typeof input === "string"
          ? encoder.encode(input)
          : new Uint8Array(input),
      label = encoder.encode(name),
      crc = crc32(data);
    total += data.length;
    if (total > MAX_PACKAGE) throw Error("SVGPRO package exceeds 96 MB.");
    const head = new Uint8Array(30 + label.length),
      v = new DataView(head.buffer);
    v.setUint32(0, 0x04034b50, true);
    v.setUint16(4, 20, true);
    v.setUint16(6, 0x800, true);
    v.setUint32(14, crc, true);
    v.setUint32(18, data.length, true);
    v.setUint32(22, data.length, true);
    v.setUint16(26, label.length, true);
    head.set(label, 30);
    local.push(head, data);
    const tail = new Uint8Array(46 + label.length),
      c = new DataView(tail.buffer);
    c.setUint32(0, 0x02014b50, true);
    c.setUint16(4, 20, true);
    c.setUint16(6, 20, true);
    c.setUint16(8, 0x800, true);
    c.setUint32(16, crc, true);
    c.setUint32(20, data.length, true);
    c.setUint32(24, data.length, true);
    c.setUint16(28, label.length, true);
    c.setUint32(42, offset, true);
    tail.set(label, 46);
    central.push(tail);
    offset += head.length + data.length;
  }
  if (entries.length > 2048) throw Error("Too many package entries.");
  const end = new Uint8Array(22),
    v = new DataView(end.buffer),
    size = central.reduce((n, x) => n + x.length, 0);
  if (offset + size + end.length > MAX_PACKAGE)
    throw Error("SVGPRO package exceeds 96 MB including its directory.");
  v.setUint32(0, 0x06054b50, true);
  v.setUint16(8, entries.length, true);
  v.setUint16(10, entries.length, true);
  v.setUint32(12, size, true);
  v.setUint32(16, offset, true);
  return new Blob([...local, ...central, end], {
    type: "application/vnd.vinagen.svgpro",
  });
}
export async function readZip(input) {
  const bytes = new Uint8Array(input);
  if (bytes.length > MAX_PACKAGE) throw Error("SVGPRO package exceeds 96 MB.");
  const v = new DataView(bytes.buffer, bytes.byteOffset, bytes.length);
  let end = -1;
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65557); i--)
    if (
      v.getUint32(i, true) === 0x06054b50 &&
      i + 22 + v.getUint16(i + 20, true) === bytes.length
    ) {
      end = i;
      break;
    }
  if (end < 0) throw Error("Invalid ZIP package.");
  const count = v.getUint16(end + 10, true);
  if (
    v.getUint16(end + 4, true) ||
    v.getUint16(end + 6, true) ||
    count > 2048 ||
    count === 65535
  )
    throw Error("Split/ZIP64 packages are unsupported.");
  let at = v.getUint32(end + 16, true),
    total = 0;
  const result = new Map();
  for (let i = 0; i < count; i++) {
    if (at + 46 > end || v.getUint32(at, true) !== 0x02014b50)
      throw Error("Invalid ZIP directory.");
    const flags = v.getUint16(at + 8, true),
      method = v.getUint16(at + 10, true),
      crc = v.getUint32(at + 16, true),
      packed = v.getUint32(at + 20, true),
      size = v.getUint32(at + 24, true),
      length = v.getUint16(at + 28, true),
      extra = v.getUint16(at + 30, true),
      comment = v.getUint16(at + 32, true),
      offset = v.getUint32(at + 42, true);
    if (
      flags & 1 ||
      ![0, 8].includes(method) ||
      size === 0xffffffff ||
      offset === 0xffffffff
    )
      throw Error("Unsupported encrypted or ZIP64 entry.");
    total += size;
    if (total > MAX_PACKAGE) throw Error("Expanded package exceeds 96 MB.");
    const name = decoder.decode(bytes.subarray(at + 46, at + 46 + length));
    at += 46 + length + extra + comment;
    if (name.endsWith("/")) {
      safePath(name.slice(0, -1));
      continue;
    }
    safePath(name);
    if (
      result.has(name) ||
      offset + 30 > bytes.length ||
      v.getUint32(offset, true) !== 0x04034b50
    )
      throw Error("Invalid or duplicate ZIP entry.");
    const start =
      offset +
      30 +
      v.getUint16(offset + 26, true) +
      v.getUint16(offset + 28, true);
    if (start + packed > bytes.length) throw Error("Truncated ZIP entry.");
    let data = bytes.slice(start, start + packed);
    if (method === 8) {
      const reader = new Blob([data])
          .stream()
          .pipeThrough(new DecompressionStream("deflate-raw"))
          .getReader(),
        chunks = [];
      let expanded = 0;
      for (;;) {
        const next = await reader.read();
        if (next.done) break;
        expanded += next.value.length;
        if (expanded > size) {
          await reader.cancel();
          throw Error("Invalid expanded ZIP size.");
        }
        chunks.push(next.value);
      }
      data = new Uint8Array(await new Blob(chunks).arrayBuffer());
    }
    if (data.length !== size || crc32(data) !== crc)
      throw Error("ZIP checksum mismatch.");
    result.set(name, data);
  }
  return result;
}
export function jsonEntry(entries, name) {
  const value = entries.get(name);
  if (!value || value.length > 8 * 1024 * 1024)
    throw Error("Missing or oversized " + name);
  return JSON.parse(decoder.decode(value));
}
