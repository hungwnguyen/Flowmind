import { test } from "node:test";
import assert from "node:assert/strict";
import { writeZip, readZip, safePath, jsonEntry } from "../designer/zip.mjs";
test("SVGPRO stored ZIP retains UTF-8 names and bytes", async () => {
  const blob = writeZip([
      [
        "manifest.json",
        JSON.stringify({ format: "vinagen-svgpro", version: 2 }),
      ],
      ["assets/abc/ảnh.png", Uint8Array.from([0, 1, 2, 255])],
    ]),
    entries = await readZip(await blob.arrayBuffer());
  assert.deepEqual([...entries.get("assets/abc/ảnh.png")], [0, 1, 2, 255]);
  assert.equal(jsonEntry(entries, "manifest.json").version, 2);
});
test("workspace rejects absolute paths, traversal and controls", () => {
  for (const path of [
    "../a",
    "a/../b",
    "C:/a",
    "/tmp/a",
    "a\\b",
    "a//b",
    "./a",
    "a\0b",
  ])
    assert.throws(() => safePath(path));
  assert.equal(
    safePath("Documents/Thiết kế.svgpro"),
    "Documents/Thiết kế.svgpro",
  );
});
test("corrupt CRC, truncated archive and duplicate entries are rejected", async () => {
  const bytes = new Uint8Array(
    await writeZip([["document.json", '{"layers":[]}']]).arrayBuffer(),
  );
  bytes[43] ^= 1;
  await assert.rejects(readZip(bytes));
  await assert.rejects(readZip(bytes.slice(0, 30)));
  await assert.rejects(
    readZip(
      await writeZip([
        ["a", "one"],
        ["a", "two"],
      ]).arrayBuffer(),
    ),
  );
});
test("oversized JSON and encrypted entries are rejected before parsing", async () => {
  const blob = writeZip([["document.json", " ".repeat(8 * 1024 * 1024 + 1)]]),
    entries = await readZip(await blob.arrayBuffer());
  assert.throws(() => jsonEntry(entries, "document.json"));
  const bytes = new Uint8Array(await writeZip([["a", "x"]]).arrayBuffer()),
    view = new DataView(bytes.buffer);
  const end = bytes.length - 22,
    central = view.getUint32(end + 16, true);
  view.setUint16(central + 8, 1, true);
  await assert.rejects(readZip(bytes), /encrypted/);
});
