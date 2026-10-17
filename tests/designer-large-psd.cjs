// Real browser import: 15360 x 12288 RGB PSD, >500 MB, without a large JS buffer.
const assert = require("node:assert/strict");
const { chromium } = require(
  process.env.PLAYWRIGHT_MODULE ||
    "C:/Users/hanoi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright",
);
(async () => {
  const browser = await chromium.launch(),
    page = await browser.newPage({ viewport: { width: 1440, height: 950 } }),
    errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(
    process.env.DESIGNER_URL || "http://127.0.0.1:3000/tools/designer-source/",
  );
  await page.locator(".ui-studio").waitFor();
  await page.evaluate(async () => {
    globalThis.studio = (await import("./ui-studio.mjs")).getUIStudio();
  });
  await page.waitForFunction(() => studio.ready);
  const fixture = await page.evaluate(async () => {
    const width = 15360,
      height = 12288,
      number = (value, n = 4) => {
        const b = new Uint8Array(n),
          v = new DataView(b.buffer);
        if (n === 2) v.setUint16(0, value);
        else v.setUint32(0, value);
        return b;
      },
      text = (value) => new TextEncoder().encode(value);
    const planes = [];
    for (let component = 0; component < 3; component++) {
      const counts = new Uint8Array(height * 2),
        table = new DataView(counts.buffer),
        rows = [];
      for (let y = 0; y < height; y++) {
        const color =
            component === 0
              ? Math.floor(y / 64) % 256
              : component === 1
                ? 80
                : 180,
          row = new Uint8Array((width / 128) * 2);
        for (let x = 0; x < row.length; x += 2) {
          row[x] = 129;
          row[x + 1] = color;
        }
        table.setUint16(y * 2, row.length);
        rows.push(row);
      }
      planes.push(new Blob([number(1, 2), counts, ...rows]));
    }
    const name = text("Large plane"),
      extra = new Blob([
        number(0),
        number(0),
        Uint8Array.from([name.length]),
        name,
        new Uint8Array((4 - ((name.length + 1) % 4)) % 4),
      ]);
    const record = new Blob([
      number(0),
      number(0),
      number(height),
      number(width),
      number(3, 2),
      ...planes.flatMap((plane, id) => [number(id, 2), number(plane.size)]),
      text("8BIMnorm"),
      Uint8Array.from([255, 0, 0, 0]),
      number(extra.size),
      extra,
    ]);
    const layers = new Blob([number(1, 2), record, ...planes]),
      padded = new Blob([layers, new Uint8Array(layers.size % 2)]),
      mask = new Blob([number(padded.size), padded, number(0)]),
      zero = new Blob([new Uint8Array(1024 * 1024)]),
      composite = [];
    let remaining = width * height * 3;
    while (remaining) {
      const n = Math.min(remaining, zero.size);
      composite.push(zero.slice(0, n));
      remaining -= n;
    }
    const file = new File(
      [
        text("8BPS"),
        number(1, 2),
        new Uint8Array(6),
        number(3, 2),
        number(height),
        number(width),
        number(8, 2),
        number(3, 2),
        number(0),
        number(0),
        number(mask.size),
        mask,
        number(0, 2),
        ...composite,
      ],
      "Large streaming test.psd",
    );
    globalThis.largeFile = file;
    globalThis.largeImport = studio.importPSD(file);
    return { width, height, sourceBytes: file.size, pixels: width * height };
  });
  assert.ok(fixture.sourceBytes > 500 * 1024 * 1024);
  assert.ok(fixture.pixels > 16777216);
  assert.equal(await page.getByRole("button", { name: "Replace", exact: true }).count(),0,"Empty canvas imports directly");
  const imported = await page.evaluate(() =>
    Promise.race([
      largeImport,
      new Promise((_, reject) =>
        setTimeout(() => reject(Error(document.body.innerText)), 180000),
      ),
    ]),
  );
  assert.equal(imported, true);
  const result = await page.evaluate(() => ({
    width: studio.doc.width,
    height: studio.doc.height,
    layers: studio.doc.layers.length,
    tiles: studio.doc.layers.filter((l) => l.image),
    notes: studio.doc.importNotes,
  }));
  assert.equal(result.width, fixture.width);
  assert.equal(result.height, fixture.height);
  assert.equal(result.tiles.length, 180);
  assert.ok(result.tiles.every((l) => l.width <= 1024 && l.height <= 1024));
  assert.deepEqual(errors, []);
  console.log(
    JSON.stringify(
      { ...fixture, layers: result.layers, tiles: result.tiles.length, errors },
      null,
      2,
    ),
  );
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
