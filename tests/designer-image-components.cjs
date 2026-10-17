const assert = require("node:assert/strict");
const {
  chromium,
} = require("C:/Users/hanoi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");
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
  await page.waitForFunction(() => studio?.ready);
  await page.evaluate(async () => {
    const { newDocument, newLayer } = await import("./ui-model.mjs");
    const png = async (color) => {
      const canvas = new OffscreenCanvas(32, 24),
        c = canvas.getContext("2d");
      c.fillStyle = color;
      c.fillRect(0, 0, 32, 24);
      return canvas.convertToBlob({ type: "image/png" });
    };
    globalThis.redFile = new File(
      [await png("#ff0000")],
      "arbitrary-folder-red.png",
      { type: "image/png" },
    );
    globalThis.sameFile = new File(
      [redFile, new Uint8Array([1, 2, 3, 4])],
      "different-metadata.png",
      { type: "image/png" },
    );
    globalThis.blueFile = new File(
      [await png("#0000ff")],
      "other-folder-blue.png",
      { type: "image/png" },
    );
    const a = await studio.upload(redFile),
      b = await studio.upload(sameFile),
      blue = await studio.upload(blueFile);
    if (a.image.guid !== b.image.guid)
      throw Error("Identical pixels did not share a resource");
    studio.doc = newDocument();
    studio.doc.layers = [
      {
        ...newLayer("image"),
        id: "first",
        x: 50,
        y: 50,
        width: 90,
        height: 70,
        image: a.image,
      },
      {
        ...newLayer("button"),
        id: "second",
        x: 200,
        y: 150,
        width: 120,
        height: 80,
        image: b.image,
      },
      {
        ...newLayer("image"),
        id: "unrelated",
        x: 350,
        y: 50,
        image: blue.image,
      },
    ];
    studio.selected = new Set(["first"]);
    studio.undo = [];
    studio.redo = [];
    studio.paintAll();
    globalThis.original = studio.snapshot();
    globalThis.pickCount = 0;
    window.showOpenFilePicker = async (options) => {
      if (
        !options.multiple ||
        options.types[0].accept["image/png"][0] !== ".png"
      )
        throw Error("Wrong picker config");
      pickCount++;
      return [{ getFile: async () => blueFile }];
    };
  });
  await page
    .getByRole("button", { name: "Replace image from files", exact: true })
    .click();
  await page.waitForFunction(
    () => studio.doc.layers[0].image.guid === studio.doc.layers[2].image.guid,
  );
  const result = await page.evaluate(() => {
    const [a, b, c] = studio.doc.layers;
    if (
      a.image.guid !== b.image.guid ||
      a.x !== 50 ||
      b.x !== 200 ||
      a.width !== 90 ||
      b.width !== 120
    )
      throw Error("Shared replace changed geometry or missed sibling");
    studio.history(-1);
    if (studio.snapshot() !== original)
      throw Error("Undo did not restore every instance");
    studio.history(1);
    studio.edit(() => (studio.doc.layers[0].fill = "#ff00ff"));
    if (studio.doc.layers.some((l) => l.fill !== "#ff00ff"))
      throw Error("Merged component tint did not propagate");
    studio.history(-1);
    studio.history(-1);
    studio.edit(() => (studio.doc.layers[0].fill = "#00ff00"));
    if (
      studio.doc.layers[1].fill !== "#00ff00" ||
      studio.doc.layers[2].fill === "#00ff00"
    )
      throw Error("Tint affected unrelated resource");
    studio.edit(() => (studio.doc.layers[0].imageMode = "none"));
    if (studio.doc.layers[1].imageMode !== "none")
      throw Error("Image mode did not propagate");
    studio.select("first");
    return { instances: 2, pickerCalls: pickCount };
  });
  await page.evaluate(async () => {
    studio.edit(() => (studio.doc.layers[0].fill = "#ffffff"));
    await studio.whenCanvasReady?.();
  });
  await page.screenshot({ path: "images/web-designer/components.png" });
  await page.getByRole("tab", { name: "Assets", exact: true }).click();
  await page.waitForFunction(
    () => document.querySelectorAll(".ui-sidebar-assets img").length === 2,
  );
  await page.screenshot({ path: "images/web-designer/assets.png" });
  const cancelled = await page.evaluate(async () => {
    const before = studio.snapshot();
    window.showOpenFilePicker = async () => {
      throw new DOMException("Cancelled", "AbortError");
    };
    await studio.chooseImage("first");
    return before === studio.snapshot();
  });
  assert.ok(cancelled);
  await page.evaluate(() => {
    delete window.showOpenFilePicker;
  });
  const chooserPromise = page.waitForEvent("filechooser");
  await page
    .getByRole("button", { name: "Add images from files", exact: true })
    .click();
  const chooser = await chooserPromise;
  await chooser.setFiles([
    {
      name: "from-any-folder.png",
      mimeType: "image/png",
      buffer: Buffer.from(
        await page.evaluate(async () => [
          ...new Uint8Array(await redFile.arrayBuffer()),
        ]),
      ),
    },
  ]);
  await page.waitForFunction(
    () => !document.querySelector(".ui-asset-folder").disabled,
  );
  await page.evaluate(async () => {
    const { workspace } = await import("./workspace.mjs"),
      copy = await workspace.unpack(await workspace.package(studio.doc));
    if (copy.layers[0].image.guid !== copy.layers[1].image.guid)
      throw Error("Package lost shared component");
    studio.doc = copy;
    studio.edit(() => (studio.doc.layers[0].fill = "#445566"));
    if (studio.doc.layers[1].fill !== "#445566")
      throw Error("Reopened component did not propagate");
    const other = studio.doc.layers[1].image.guid;
    studio.edit(() => delete studio.doc.layers[0].image);
    if (studio.doc.layers[1].image.guid !== other)
      throw Error("Removing one instance removed shared source");
  });
  assert.deepEqual(errors, []);
  console.log(
    JSON.stringify(
      { ...result, fallbackFileExplorer: true, cancelled, errors },
      null,
      2,
    ),
  );
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
