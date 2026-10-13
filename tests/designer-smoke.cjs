// Author test only. Runtime editor has no npm, Node, Unity or server dependency.
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const path = require("node:path");
const playwright = require(
  process.env.PLAYWRIGHT_MODULE ||
    "C:/Users/hanoi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright",
);
(async () => {
  const browser = await playwright.chromium.launch({ headless: true }),
    page = await browser.newPage({ viewport: { width: 1440, height: 950 } }),
    errors = [],
    requests = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("request", (r) => requests.push(r.url()));
  page.on("requestfailed", (r) =>
    console.error("Failed resource:", r.url(), r.failure()?.errorText),
  );
  page.on("console", (m) => {
    if (m.type() === "error" || m.text().startsWith("TEST:"))
      console.log(m.text());
  });
  await page.route("**/api/**", (route) => route.abort());
  await page.goto(
    process.env.DESIGNER_URL || "http://127.0.0.1:3000/designer/",
  );
  await page.locator(".ui-studio").waitFor();
  await page.evaluate(async () => {
    globalThis.testStudio = (await import("./ui-studio.mjs")).getUIStudio();
  });
  await page.waitForFunction(() => testStudio?.ready);
  const result = await page.evaluate(async () => {
    const { workspace, resourceURL } = await import("./workspace.mjs"),
      { getUIStudio } = await import("./ui-studio.mjs"),
      { newDocument, newLayer } = await import("./ui-model.mjs"),
      { readZip } = await import("./zip.mjs"),
      { cacheKey } = await import("./ui-project-cache.mjs"),
      s = getUIStudio();
    const doc = newDocument({ width: 960, height: 640 });
    doc.name = "Browser design";
    const background = {
      ...newLayer("rectangle", 0, 0),
      name: "Background",
      width: 960,
      height: 640,
      fill: "#171b32",
    };
    const card = {
      ...newLayer("rectangle", 80, 80),
      name: "Gradient card",
      width: 800,
      height: 480,
      fill: "#34316a",
      fillGradient: {
        type: "linear",
        angle: 30,
        stops: [
          { offset: 0, color: "#6757d8" },
          { offset: 1, color: "#202447" },
        ],
      },
    };
    const title = {
      ...newLayer("text", 140, 150),
      name: "Editable title",
      width: 680,
      height: 100,
      text: "Create in your browser",
      fontSize: 48,
      textColor: "#ffffff",
      tmpFont: "f10a11",
    };
    const caption = {
      ...newLayer("text", 140, 280),
      name: "Subtitle",
      width: 680,
      height: 80,
      text: "PSD • SVGPRO • PNG • SVG",
      fontSize: 30,
      textColor: "#d5d0ff",
      tmpFont: "f10a11",
    };
    const button = {
      ...newLayer("rectangle", 300, 400),
      name: "Button",
      width: 360,
      height: 88,
      fill: "#b8a5ff",
    };
    doc.layers = [background, card, title, caption, button];
    s.doc = doc;
    s.version++;
    s.dirty = true;
    s.selected = new Set([title.id]);
    s.paintAll();
    s.fit();
    s.persist();
    await new Promise(requestAnimationFrame);
    await Promise.all(s.styledPreview?.pending(s.board) || []);
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 32;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ff0066";
    ctx.fillRect(0, 0, 32, 32);
    const blob = await new Promise((r) => canvas.toBlob(r));
    const { blobBase64 } = await import("./ui-project-cache.mjs");
    const image = await workspace.api("ui-image", {
      fileName: "test.png",
      dataBase64: await blobBase64(blob),
    });
    const imageLayer = {
      ...newLayer("image", 820, 500),
      width: 32,
      height: 32,
      image: image.image,
    };
    s.edit(() => s.doc.layers.push(imageLayer));
    const packed = await workspace.package(s.doc),
      entries = await readZip(await packed.arrayBuffer()),
      unpacked = await workspace.unpack(packed);
    await (await import("./idb.mjs")).record("test-package", packed);
    canvas.getContext("2d").fillStyle = "#00ff66";
    canvas.getContext("2d").fillRect(0, 0, 32, 32);
    const alternate = await new Promise((r) => canvas.toBlob(r));
    await workspace.add({
      guid: image.image.guid,
      name: "alternate",
      path: "Images/alternate.png",
      type: "image",
      blob: alternate,
      width: 32,
      height: 32,
    });
    const changed = await workspace.unpack(packed);
    if (changed.layers.at(-1).image.guid === image.image.guid)
      throw Error("Package replaced a colliding resource");
    const preserved = await fetch(resourceURL(image.image.guid)).then((r) =>
      r.blob(),
    );
    if (
      (await cacheKey(await preserved.arrayBuffer())) !==
      (await cacheKey(await alternate.arrayBuffer()))
    )
      throw Error("Original resource lost on import");
    if (
      unpacked.layers.length !== 6 ||
      !entries.has("assets/" + image.image.guid + "/test_png.png")
    ) {
      throw Error("Package layers or embedded image lost");
    }
    const upstreamFont = resourceURL("f10a11");
    if (!upstreamFont.startsWith("blob:")) throw Error("Font is not local");
    const root = await navigator.storage.getDirectory(),
      handle = await root.getDirectoryHandle("test-workspace", {
        create: true,
      });
    await workspace.connect({ handle, id: "test-opfs" });
    // Re-add image resource from the package into the folder workspace, then save.
    await workspace.unpack(packed);
    const saved = await workspace.save({
        path: "Documents/Test.svgpro",
        document: unpacked,
      }),
      reopened = await workspace.read(saved.path);
    if (
      saved.revision !== reopened.revision ||
      reopened.document.layers.length !== 6
    )
      throw Error("Folder roundtrip failed");
    let conflict = false;
    try {
      await workspace.save({
        path: saved.path,
        document: unpacked,
        revision: "stale",
      });
    } catch (e) {
      conflict = e.message.includes("changed");
    }
    if (!conflict) throw Error("Revision conflict was not rejected");
    let traversal = false;
    try {
      await workspace.save({ path: "../escape.svgpro", document: unpacked });
    } catch (e) {
      traversal = true;
    }
    if (!traversal) throw Error("Traversal was not rejected");
    const target = await workspace.file(saved.path),
      writer = await target.createWritable();
    await writer.write(new Blob(["external edit"]));
    await writer.close();
    let external = false;
    try {
      await workspace.save({
        path: saved.path,
        document: unpacked,
        revision: saved.revision,
      });
    } catch (e) {
      external = e.message.includes("changed");
    }
    if (!external) throw Error("External edit was overwritten");
    // Restore portable document and its resource data for actual browser exports.
    workspace.mode = "browser";
    workspace.id = "browser";
    await (await import("./idb.mjs")).record("last-workspace", null);
    await workspace.restore();
    await workspace.unpack(packed);
    s.doc = unpacked;
    s.version++;
    s.path = "";
    s.revision = "";
    s.paintAll();
    s.fit();
    await new Promise(requestAnimationFrame);
    await Promise.all(s.styledPreview?.pending(s.board) || []);
    const { captureLayerPNG } = await import("./ui-screen-capture.mjs"),
      { exportPSD } = await import("./ui-psd-export.mjs"),
      { readPSDFile } = await import("./psd-reader.mjs");
    console.log("TEST: PNG");
    const png = await captureLayerPNG(s, null, { format: "png" });
    console.log("TEST: SVG");
    const svg = await captureLayerPNG(s, null, { format: "svg" });
    console.log("TEST: PSD");
    const psd = await exportPSD(s);
    console.log("TEST: parse PSD");
    const parsed = await readPSDFile(new File([psd.blob], "Browser.psd"));
    console.log("TEST: parsed");
    const parsedCount = parsed.records.length;
    const psdBytes = [...new Uint8Array(await psd.blob.arrayBuffer())];
    globalThis.testPSD = psdBytes;
    if (
      parsed.records[0].name !== "Background" ||
      parsed.records.at(-1).name !== "Image"
    )
      throw Error("Flat PSD layer order changed");
    const { renderText } = await import("./web-text.mjs");
    const paint = await renderText(
        {
          ...title,
          text: "TEST",
          textColor: "#ffffff",
          textStyle: {
            gradient: false,
            faceColor: "#ff0000",
            strokeWidth: 0,
            outlineWidth: 0,
            extrusionX: 0,
            extrusionY: 0,
          },
        },
        workspace.config(),
        resourceURL,
      ),
      bitmap = await createImageBitmap(
        await fetch(paint.dataUrl).then((r) => r.blob()),
      ),
      probe = document.createElement("canvas");
    probe.width = bitmap.width;
    probe.height = bitmap.height;
    const probeCtx = probe.getContext("2d");
    probeCtx.drawImage(bitmap, 0, 0);
    const paintPixels = probeCtx.getImageData(
      0,
      0,
      probe.width,
      probe.height,
    ).data;
    let red = 0;
    for (let i = 0; i < paintPixels.length; i += 4)
      if (
        paintPixels[i + 3] > 200 &&
        paintPixels[i] > 200 &&
        paintPixels[i + 1] < 10 &&
        paintPixels[i + 2] < 10
      )
        red++;
    if (red < 100) throw Error("Face color did not affect browser text");
    bitmap.close();
    const groupPSD = {
      ...unpacked,
      layers: [
        {
          ...newLayer("empty", 0, 0),
          id: "test-group",
          name: "Group",
          width: 960,
          height: 640,
        },
        ...unpacked.layers.map((l) => ({ ...l, parentId: "test-group" })),
      ],
    };
    s.doc = groupPSD;
    s.version++;
    s.paintAll();
    await new Promise(requestAnimationFrame);
    await Promise.all(s.styledPreview?.pending(s.board) || []);
    const grouped = await exportPSD(s),
      groupedParsed = await readPSDFile(
        new File([grouped.blob], "Grouped.psd"),
      );
    const groupNames = groupedParsed.records
      .filter((r) => !r.section)
      .map((r) => r.name);
    if (groupNames.join("|") !== unpacked.layers.map((l) => l.name).join("|"))
      throw Error("Grouped PSD stacking or names changed");
    s.doc = unpacked;
    s.version++;
    s.paintAll();
    await new Promise(requestAnimationFrame);
    return {
      packageBytes: packed.size,
      pngBytes: png.blob.size,
      svgBytes: svg.blob.size,
      psdBytes: psd.blob.size,
      parsedCount,
      layers: unpacked.layers.length,
      conflict,
      traversal,
      external,
      sha: await cacheKey(await packed.arrayBuffer()),
    };
  });
  assert.equal(result.layers, 6);
  assert.ok(result.parsedCount >= 6);
  assert.ok(result.pngBytes > 1000);
  assert.ok(result.svgBytes > 1000);
  assert.ok(result.psdBytes > 1000);
  console.log("TEST: worker import");
  // Exercise the real worker-driven PSD import UI from the exported PSD.
  await page.evaluate(async () => {
    const { getUIStudio } = await import("./ui-studio.mjs");
    globalThis.importResult = getUIStudio().importPSD(
      new File([Uint8Array.from(testPSD)], "Roundtrip.psd"),
    );
  });
  await page.getByRole("button", { name: "Replace", exact: true }).click();
  await page
    .getByRole("button", { name: "Import and discard", exact: true })
    .click();
  const imported = await page.evaluate(() =>
    Promise.race([
      globalThis.importResult,
      new Promise((_, reject) =>
        setTimeout(() => reject(Error(document.body.innerText)), 20000),
      ),
    ]),
  );
  assert.equal(imported, true);
  await page.evaluate(async () => {
    const { getUIStudio } = await import("./ui-studio.mjs");
    getUIStudio().persist();
  });
  await page.reload();
  await page.locator(".ui-studio").waitFor();
  await page.evaluate(async () => {
    globalThis.testStudio = (await import("./ui-studio.mjs")).getUIStudio();
  });
  await page.waitForFunction(
    () => testStudio?.ready && testStudio.doc.layers.length >= 6,
  );
  await page.waitForTimeout(500);
  await fs.mkdir(path.resolve("images/web-designer"), { recursive: true });
  await page.screenshot({
    path: path.resolve("images/web-designer/workspace.png"),
  });
  await page.evaluate(() => {
    const s = testStudio;
    s.select(s.doc.layers.find((l) => l.role === "text").id);
    s.paintAll();
  });
  await page.waitForTimeout(100);
  await page.screenshot({
    path: path.resolve("images/web-designer/inspector.png"),
  });
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await page.screenshot({
    path: path.resolve("images/web-designer/settings.png"),
  });
  await page.getByRole("button", { name: "Done", exact: true }).click();
  await page.getByRole("button", { name: "Export", exact: true }).click();
  await page.screenshot({
    path: path.resolve("images/web-designer/export.png"),
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.keyboard.press("Escape");
  await page.screenshot({
    path: path.resolve("images/web-designer/mobile.png"),
  });
  await page.setViewportSize({ width: 1440, height: 950 });
  await page.evaluate(() => {
    globalThis.beforePicker = testStudio.doc;
    window.showDirectoryPicker = () =>
      Promise.reject(new DOMException("Canceled", "AbortError"));
  });
  await page
    .getByRole("button", { name: "Choose folder", exact: true })
    .click();
  await page.waitForTimeout(100);
  assert.equal(
    await page.evaluate(() => testStudio.doc === beforePicker),
    true,
  );
  await page.evaluate(() => {
    window.showDirectoryPicker = async () => {
      const root = await navigator.storage.getDirectory();
      return root.getDirectoryHandle("chosen-workspace", { create: true });
    };
  });
  await page
    .getByRole("button", { name: "Choose folder", exact: true })
    .click();
  await page.waitForFunction(
    () =>
      testStudio.ready &&
      !testStudio.busy &&
      testStudio.doc.layers.length === 0,
  );
  assert.match(
    await page.locator("#workspace-state").innerText(),
    /Folder save/,
  );
  await page.getByRole("button", { name: "Demo", exact: true }).click();
  await page.waitForFunction(
    () => testStudio.doc.name === "Welcome to Web Designer",
  );
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Workspace-relative path" })
    .fill("Documents/UI saved demo.svgpro");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.waitForFunction(() => !testStudio.dirty && !!testStudio.path);
  const folderResult = await page.evaluate(async () => {
    const { workspace } = await import("./workspace.mjs"),
      saved = await workspace.read(testStudio.path);
    return { layers: saved.document.layers.length, path: saved.path };
  });
  assert.equal(folderResult.layers, 6);
  await page.screenshot({
    path: path.resolve("images/web-designer/folder.png"),
  });
  await page.reload();
  await page.locator(".ui-studio").waitFor();
  await page.evaluate(async () => {
    globalThis.testStudio = (await import("./ui-studio.mjs")).getUIStudio();
  });
  await page.waitForFunction(() => testStudio.ready);
  assert.match(
    await page.locator("#workspace-state").innerText(),
    /Folder save/,
  );
  assert.equal(
    await page.evaluate(() => testStudio.doc.name),
    "Welcome to Web Designer",
  );
  await page.evaluate(async () => {
    const { workspace } = await import("./workspace.mjs");
    workspace.mode = "reconnect";
    const real = workspace.handle;
    workspace.handle = { requestPermission: async () => "denied" };
    let denied = false;
    try {
      await workspace.reconnect();
    } catch {
      denied = true;
    }
    workspace.handle = real;
    if (!denied) throw Error("Denied folder permission ignored");
    await (await import("./idb.mjs")).record("last-workspace", null);
  });
  const exportDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export", exact: true }).click();
  await page
    .getByRole("button", { name: "Export SVGPRO", exact: true })
    .click();
  assert.match((await exportDownload).suggestedFilename(), /\.svgpro$/);
  await page.reload();
  await page.locator(".ui-studio").waitFor();
  await page.evaluate(async () => {
    globalThis.testStudio = (await import("./ui-studio.mjs")).getUIStudio();
  });
  await page.waitForFunction(() => testStudio.ready);
  assert.equal(await page.evaluate(() => testStudio.doc.name), "Roundtrip");
  await page.evaluate(async () => {
    const { workspace } = await import("./workspace.mjs");
    const saved = testStudio.doc;
    await testStudio.persist();
    const packed = await (await import("./idb.mjs")).record("test-package");
    const file = new File([packed], "Portable.svgpro");
    Object.defineProperty(file, "webkitRelativePath", {
      value: "Readonly/Portable.svgpro",
    });
    await workspace.importFolder([file]);
    if (workspace.mode !== "browser" || workspace.handle)
      throw Error("Imported folder became writable");
    const reopened = await workspace.read("Portable.svgpro");
    if (reopened.document.layers.length !== 6)
      throw Error("Read-only folder import lost layers");
    await workspace.save({
      path: "Portable.svgpro",
      revision: reopened.revision,
      document: reopened.document,
    });
    if (testStudio.doc !== saved)
      throw Error(
        "Folder adapter replaced the current draft without the app controller",
      );
  });
  assert.deepEqual(errors, []);
  assert.equal(
    requests.filter((url) => /\/api\/|127\.0\.0\.1:8888/.test(url)).length,
    0,
  );
  console.log(JSON.stringify({ result, errors, nativeRequests: 0 }, null, 2));
  await browser.close();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
