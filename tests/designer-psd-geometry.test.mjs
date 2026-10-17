import { test } from "node:test";
import assert from "node:assert/strict";
import { psdEdgeDistance } from "../tools/designer-source/psd-distance.mjs";
import {
  psdTextGeometry,
  psdLocalPaintBounds,
} from "../tools/designer-source/psd-text-geometry.mjs";
test("Euclidean bevel distance matches a brute-force reference, including border and partial alpha", () => {
  const w = 31,
    h = 27,
    a = Uint8Array.from({ length: w * h }, (_, i) =>
      Math.hypot((i % w) - 15, Math.floor(i / w) - 13) < 12 ? 255 : 0,
    );
  a[13 * w + 15] = 128;
  const actual = psdEdgeDistance(a, w, h, 20);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      let squared = Math.min(
        (x + 1) ** 2,
        (y + 1) ** 2,
        (w - x) ** 2,
        (h - y) ** 2,
      );
      for (let yy = 0; yy < h; yy++)
        for (let xx = 0; xx < w; xx++)
          if (a[yy * w + xx] < 255)
            squared = Math.min(
              squared,
              (x - xx) ** 2 + (y - yy) ** 2 + (a[yy * w + xx] / 255) ** 2,
            );
      assert.ok(
        Math.abs(actual[y * w + x] - Math.min(20, Math.sqrt(squared))) <
          0.00001,
      );
    }
});
test("rotated text geometry preserves world center and recovers upright width", () => {
  const width = 101,
    height = 101,
    pixels = new Uint8ClampedArray(width * height * 4),
    angle = -Math.PI / 4;
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const dx = x - 50,
        dy = y - 50,
        u = Math.cos(angle) * dx + Math.sin(angle) * dy,
        v = -Math.sin(angle) * dx + Math.cos(angle) * dy;
      if (Math.abs(u) < 45 && Math.abs(v) < 10)
        pixels[(y * width + x) * 4 + 3] = 255;
    }
  const record = { x: 250, y: 120, width, height },
    box = psdTextGeometry(pixels, record, -45);
  assert.ok(box.width > box.height * 3);
  assert.equal(box.x + box.width / 2, 300.5);
  assert.equal(box.y + box.height / 2, 170.5);
  const bounds = psdLocalPaintBounds(record, box, {
    x: -3,
    y: -5,
    width: 107,
    height: 111,
  });
  assert.ok(bounds.width > 100 && bounds.height > 100);
  assert.ok(bounds.x < 0 && bounds.y < 0);
  assert.equal(psdTextGeometry(pixels, record, 0), null);
});
