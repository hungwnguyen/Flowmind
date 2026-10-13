import { test } from "node:test";
import assert from "node:assert/strict";
import { deflateSync } from "node:zlib";
import { openPSDChannelRows } from "../designer/psd-stream.mjs";
import {
  validatePSDSourceSize,
  PSD_MAX_SOURCE_BYTES,
} from "../designer/psd-reader.mjs";

test("source files have no 500 MB product cap; invalid lengths are rejected", () => {
  assert.equal(PSD_MAX_SOURCE_BYTES, Infinity);
  for (const size of [501 * 1024 * 1024, 5 * 1024 ** 3, 100 * 1024 ** 3])
    assert.doesNotThrow(() => validatePSDSourceSize(size));
  for (const size of [0, 25, -1, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])
    assert.throws(() => validatePSDSourceSize(size));
});
async function plane(bytes, width, height) {
  const file = new Blob([bytes]);
  return openPSDChannelRows(
    file,
    { offset: 0, length: file.size },
    width,
    height,
  );
}
test("raw scanlines preserve bytes without allocating a plane", async () => {
  const width = 12000,
    height = 3,
    data = Uint8Array.from({ length: width * height }, (_, i) => i % 251),
    reader = await plane(new Uint8Array([0, 0, ...data]), width, height);
  for (let y = 0; y < height; y++)
    assert.deepEqual(
      await reader.readRow(),
      data.slice(y * width, (y + 1) * width),
    );
  await reader.close();
});
test("RLE rows support 30000 px, NOPs and reject corrupt row sizes", async () => {
  const width = 30000,
    rows = [];
  for (const color of [10, 90]) {
    const row = [];
    let left = width;
    while (left) {
      const n = Math.min(128, left);
      row.push(257 - n, color);
      left -= n;
    }
    rows.push(Uint8Array.from(row));
  }
  const header = new Uint8Array(6),
    view = new DataView(header.buffer);
  view.setUint16(0, 1);
  for (let y = 0; y < 2; y++) view.setUint16(2 + y * 2, rows[y].length);
  const reader = await plane(
    new Uint8Array(await new Blob([header, ...rows]).arrayBuffer()),
    width,
    2,
  );
  assert.ok((await reader.readRow()).every((value) => value === 10));
  assert.ok((await reader.readRow()).every((value) => value === 90));
  await reader.close();
  const bad = await plane(Uint8Array.from([0, 1, 0, 2, 255, 80]), 10, 1);
  await assert.rejects(bad.readRow(), /Incomplete/);
});
for (const prediction of [false, true])
  test("ZIP scanlines" + (prediction ? " with prediction" : ""), async () => {
    const width = 12000,
      height = 5,
      data = Uint8Array.from({ length: width * height }, (_, i) => i % 251),
      encoded = data.slice();
    if (prediction)
      for (let y = 0; y < height; y++)
        for (let x = width - 1; x > 0; x--)
          encoded[y * width + x] =
            (data[y * width + x] - data[y * width + x - 1]) & 255;
    const reader = await plane(
      new Uint8Array(
        await new Blob([
          Uint8Array.from([0, prediction ? 3 : 2]),
          deflateSync(encoded),
        ]).arrayBuffer(),
      ),
      width,
      height,
    );
    for (let y = 0; y < height; y++)
      assert.deepEqual(
        await reader.readRow(),
        data.slice(y * width, (y + 1) * width),
      );
    await reader.close();
  });
test("ZIP overflow and truncation fail before rendering invalid pixels", async () => {
  const overflow = await plane(
    new Uint8Array(
      await new Blob([
        Uint8Array.from([0, 2]),
        deflateSync(Uint8Array.from([1, 2, 3, 4, 5])),
      ]).arrayBuffer(),
    ),
    2,
    2,
  );
  await assert.rejects(overflow.readRow(), /exceeds/);
  const short = await plane(
    new Uint8Array(
      await new Blob([
        Uint8Array.from([0, 2]),
        deflateSync(Uint8Array.from([1, 2, 3])),
      ]).arrayBuffer(),
    ),
    2,
    2,
  );
  await short.readRow();
  await assert.rejects(short.readRow(), /Incomplete/);
});
import { streamPSDTiles } from "../designer/psd-stream.mjs";
test("large tiled rasters apply absolute, relative, inverted and disabled masks", async () => {
  const previousCanvas = globalThis.OffscreenCanvas,
    previousImage = globalThis.ImageData;
  globalThis.ImageData = class {
    constructor(data, width, height) {
      Object.assign(this, { data, width, height });
    }
  };
  globalThis.OffscreenCanvas = class {
    constructor(width, height) {
      Object.assign(this, {
        width,
        height,
        pixels: new Uint8Array(width * height * 4),
      });
    }
    getContext() {
      return {
        putImageData: (row, x, y) =>
          this.pixels.set(row.data, (y * this.width + x) * 4),
      };
    }
    async convertToBlob() {
      return new Blob([this.pixels]);
    }
  };
  try {
    for (const flags of [0, 1, 4, 2]) {
      const width = 9000,
        height = 3,
        mask = {
          x: flags === 1 ? 3 : 103,
          y: flags === 1 ? 1 : 201,
          width: 2,
          height: 1,
          defaultColor: 64,
          flags,
        };
      const channels = [0, 1, 2, -1].map((id) => ({
        id,
        bytes: new Uint8Array([
          0,
          0,
          ...new Uint8Array(width * height).fill(id === -1 ? 128 : 80),
        ]),
      }));
      channels.push({ id: -2, bytes: Uint8Array.from([0, 0, 0, 255]) });
      const tiles = [];
      for await (const tile of streamPSDTiles(new Blob(), {
        x: 100,
        y: 200,
        width,
        height,
        mask,
        channels,
      }))
        tiles.push(tile);
      assert.equal(tiles.length, 9);
      const pixels = new Uint8Array(await tiles[0].png.arrayBuffer()),
        alpha = (x, y) => pixels[(y * 1024 + x) * 4 + 3];
      assert.equal(alpha(0, 0), flags === 2 ? 128 : flags === 4 ? 96 : 32);
      assert.equal(alpha(3, 1), flags === 2 || flags === 4 ? 128 : 0);
      assert.equal(alpha(4, 1), flags === 4 ? 0 : 128);
    }
  } finally {
    globalThis.OffscreenCanvas = previousCanvas;
    globalThis.ImageData = previousImage;
  }
});
