// Optional author verification of an existing private SVGPRO. No fixture copied.
const fs = require("node:fs/promises");
const assert = require("node:assert/strict");
const { chromium } = require(
  process.env.PLAYWRIGHT_MODULE ||
    "C:/Users/hanoi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright",
);
(async () => {
  if (!process.argv[2]) throw Error("Pass an existing SVGPRO path.");
  const input = (await fs.readFile(process.argv[2])).toString("base64"),
    browser = await chromium.launch(),
    page = await browser.newPage();
  await page.goto("http://127.0.0.1:3000/tools/designer-source/");
  await page.locator(".ui-studio").waitFor();
  await page.evaluate(async () => {
    globalThis.testStudio = (await import("./ui-studio.mjs")).getUIStudio();
  });
  await page.waitForFunction(() => testStudio.ready);
  const result = await page.evaluate(async (data) => {
    const { workspace, resourceURL } = await import("./workspace.mjs"),
      { cachedBlob } = await import("./ui-project-cache.mjs"),
      doc = await workspace.unpack(cachedBlob(data));
    const images = doc.layers.filter((l) => l.image);
    if (images.some((l) => !resourceURL(l.image.guid)))
      throw Error("Missing imported image");
    const blob = await workspace.package(doc),
      again = await workspace.unpack(blob);
    return {
      layers: doc.layers.length,
      images: images.length,
      text: doc.layers.filter((l) => l.role === "text").length,
      roundtrip: again.layers.length,
      bytes: blob.size,
    };
  }, input);
  assert.equal(result.layers, result.roundtrip);
  assert.ok(result.images > 0);
  console.log(result);
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
