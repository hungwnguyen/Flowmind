// Read original PNG samples for slicing. Canvas premultiplies alpha, which can
// turn a 1/255 RGB difference at a faint edge into a difference of 64/255.
// Native DecompressionStream keeps this browser-only, without a PNG dependency.
const signature = [137, 80, 78, 71, 13, 10, 26, 10];
export const sliceAnalysis = 'source-rgba-v1';

export async function sourcePixels(blob) {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  if (!signature.every((value, i) => bytes[i] === value)) {
    const bitmap = await createImageBitmap(blob);
    try {
      const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
      const context = canvas.getContext('2d', {willReadFrequently: true});
      context.drawImage(bitmap, 0, 0);
      return context.getImageData(0, 0, bitmap.width, bitmap.height);
    } finally { bitmap.close(); }
  }
  const view = new DataView(bytes.buffer), compressed = [];
  let width, height, depth, type, interlace, palette, transparency;
  for (let offset = 8; offset + 12 <= bytes.length;) {
    const length = view.getUint32(offset), end = offset + 8 + length;
    if (end + 4 > bytes.length) throw Error('Truncated PNG image.');
    const tag = String.fromCharCode(...bytes.subarray(offset + 4, offset + 8));
    const data = bytes.subarray(offset + 8, end);
    if (tag === 'IHDR') {
      if (length !== 13) throw Error('Invalid PNG header.');
      width = view.getUint32(offset + 8); height = view.getUint32(offset + 12);
      [depth, type] = data.subarray(8, 10); interlace = data[12];
      if (data[10] || data[11] || interlace > 1) throw Error('Unsupported PNG compression.');
    } else if (tag === 'PLTE') palette = data;
    else if (tag === 'tRNS') transparency = data;
    else if (tag === 'IDAT') compressed.push(data);
    else if (tag === 'IEND') break;
    offset = end + 4;
  }
  const channels = ({0: 1, 2: 3, 3: 1, 4: 2, 6: 4})[type];
  const depths = type === 3 ? [1, 2, 4, 8] : type === 0 ? [1, 2, 4, 8, 16] : [8, 16];
  if (!width || !height || width > 8192 || height > 8192 || width * height > 16777216 || !channels || !depths.includes(depth) || !compressed.length)
    throw Error('Invalid or oversized PNG image.');
  if (type === 3 && (!palette?.length || palette.length % 3)) throw Error('Invalid PNG palette.');
  const passes = interlace ? [[0,0,8,8],[4,0,8,8],[0,4,4,8],[2,0,4,4],[0,2,2,4],[1,0,2,2],[0,1,1,2]] : [[0,0,1,1]];
  const layouts = passes.map(([x,y,dx,dy]) => {
    const w = Math.max(0, Math.ceil((width - x) / dx)), h = Math.max(0, Math.ceil((height - y) / dy));
    return {x,y,dx,dy,w,h,stride: Math.ceil(w * channels * depth / 8)};
  }).filter(pass => pass.w && pass.h);
  const expected = layouts.reduce((total, pass) => total + (pass.stride + 1) * pass.h, 0);
  const reader = new Blob(compressed).stream().pipeThrough(new DecompressionStream('deflate')).getReader();
  const raw = new Uint8Array(expected); let size = 0;
  try {
    while (true) {
      const {value, done} = await reader.read(); if (done) break;
      if (size + value.length > expected) throw Error('PNG pixel data exceeds its dimensions.');
      raw.set(value, size); size += value.length;
    }
  } finally { await reader.cancel(); reader.releaseLock(); }
  if (size !== expected) throw Error('Truncated PNG pixel data.');
  const data = new Uint8ClampedArray(width * height * 4), bpp = Math.max(1, Math.ceil(channels * depth / 8));
  const transparent = transparency ? new DataView(transparency.buffer, transparency.byteOffset, transparency.byteLength) : null;
  const paeth = (a,b,c) => { const p = a+b-c, pa = Math.abs(p-a), pb = Math.abs(p-b), pc = Math.abs(p-c); return pa <= pb && pa <= pc ? a : pb <= pc ? b : c; };
  const max = 2 ** depth - 1, byte = sample => Math.round(sample * 255 / max);
  let offset = 0;
  for (const pass of layouts) {
    let previous = new Uint8Array(pass.stride);
    for (let y = 0; y < pass.h; y++) {
      const filter = raw[offset++], row = raw.slice(offset, offset + pass.stride); offset += pass.stride;
      if (filter > 4) throw Error('Invalid PNG row filter.');
      for (let i = 0; i < row.length; i++) {
        const a = i >= bpp ? row[i-bpp] : 0, b = previous[i], c = i >= bpp ? previous[i-bpp] : 0;
        row[i] += filter === 1 ? a : filter === 2 ? b : filter === 3 ? Math.floor((a+b)/2) : filter === 4 ? paeth(a,b,c) : 0;
      }
      const sample = i => depth === 16 ? row[i*2]*256 + row[i*2+1] : depth === 8 ? row[i] : (row[Math.floor(i*depth/8)] >> (8-depth-i*depth%8)) & max;
      for (let x = 0; x < pass.w; x++) {
        const index = x * channels, target = 4 * ((pass.y+y*pass.dy)*width + pass.x+x*pass.dx);
        const r = sample(index), g = sample(index+1), b = sample(index+2);
        let rgba;
        if (type === 6) rgba = [byte(r), byte(g), byte(b), byte(sample(index+3))];
        else if (type === 2) rgba = [byte(r), byte(g), byte(b), transparent?.byteLength === 6 && r === transparent.getUint16(0) && g === transparent.getUint16(2) && b === transparent.getUint16(4) ? 0 : 255];
        else if (type === 3) {
          if (r*3+2 >= palette.length) throw Error('Invalid PNG palette index.');
          rgba = [palette[r*3], palette[r*3+1], palette[r*3+2], transparency?.[r] ?? 255];
        } else rgba = [byte(r), byte(r), byte(r), type === 4 ? byte(g) : transparent?.byteLength === 2 && r === transparent.getUint16(0) ? 0 : 255];
        data.set(rgba, target);
      }
      previous = row;
    }
  }
  return {width, height, data};
}

// Authored borders remain authoritative, as with Unity's TextureImporter.
// A zero/absent axis is re-detected from original samples, not cached Canvas RGB.
export function authoredSlice(detected, authored, width, height) {
  const result = {...detected};
  if (authored?.width !== width || authored?.height !== height) return result;
  for (const [a, b, size] of [['left','right',width], ['top','bottom',height]])
    if (Number.isFinite(authored[a]) && Number.isFinite(authored[b]) && authored[a] >= 0 && authored[b] >= 0 && authored[a]+authored[b] > 0 && authored[a]+authored[b] < size) {
      result[a] = authored[a]; result[b] = authored[b];
    }
  return result;
}
