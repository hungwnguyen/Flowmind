const assert = require("node:assert/strict"),
  fs = require("node:fs"),
  cp = require("node:child_process");
const {
  chromium,
} = require("C:/Users/hanoi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");
(async () => {
  const b = await chromium.launch(),
    p = await b.newPage({ viewport: { width: 1600, height: 1000 } }),
    errors = [];
  p.on("pageerror", (e) => errors.push(e.message));
  const url = process.env.DESIGNER_URL || "http://127.0.0.1:3000/tools/designer-source/";
  await p.goto(url);
  await p.locator(".ui-board").waitFor();
  const ready = async () => {
    await p.evaluate(async () => {
      window.s = (await import("./ui-studio.mjs")).getUIStudio();
    });
    await p.waitForFunction(() => s.ready);
    await p.evaluate(async () => {
      await s.whenCanvasReady?.();
      await Promise.all(
        [...s.board.querySelectorAll("img")].map((img) =>
          img.decode().catch(() => {}),
        ),
      );
    });
  };
  await ready();
  const start = Date.now();
  await p.locator(".ui-studio input[type=file]").setInputFiles(process.argv[2]);
  await p.waitForFunction(
    () =>
      s.busy ||
      [...document.querySelectorAll("dialog[open] button")].some(
        (b) => b.textContent === "Replace",
      ),
  );
  if (await p.getByRole("button", { name: "Replace", exact: true }).count())
    await p.getByRole("button", { name: "Replace", exact: true }).click();
  await p.waitForFunction(
    () => !s.busy && s.doc.name === "Master_pass" && s.doc.layers.length > 100,
    null,
    { timeout: 240000 },
  );
  await ready();
  const importMs = Date.now() - start;
  console.log("Full PSD imported in " + importMs + " ms.");
  const geometry = await p.evaluate(async () => {
    const l = s.doc.layers.find((l) => l.text === "90% Off"),
      r = s.doc.layers.find((l) => l.name === "Frame" && l.width === 774);
    window.rotatedId = l.id;
    s.select(l.id);
    s.layerActions.focus();
    await s.whenCanvasReady();
    await s.persist();
    return {
      id: l.id,
      x: l.x,
      y: l.y,
      width: l.width,
      height: l.height,
      rotation: l.rotation,
      bounds: l.sourceTextPaint?.bounds,
      frame: r?.id,
      layers: s.doc.layers.length,
    };
  });
  assert.equal(Math.round(geometry.rotation), -45);
  assert.ok(
    geometry.width > geometry.height * 2,
    "Upright text has a wide layout box, rather than its world-axis pixel bounds",
  );
  await p.screenshot({
    path: "C:/Projects/vinagen/Builds/GraphWebVerification/MasterPass/rotation-fixed.png",
  });
  const reload = async () => {
    p.once("dialog", (d) => d.accept());
    const t = Date.now();
    await p.reload();
    await p.locator(".ui-board").waitFor();
    await ready();
    const ms = Date.now() - t;
    assert.equal(await p.evaluate(() => s.doc.layers.length), geometry.layers);
    return ms;
  };
  const baselineRevision = ["HEAD:tools/designer-source/idb.mjs", "HEAD:designer/idb.mjs"]
    .map(ref => cp.spawnSync("git", ["show", ref], {
      cwd: require('node:path').resolve(__dirname, '..'), encoding: 'utf8',
    })).find(result => result.status === 0);
  assert.ok(baselineRevision, 'No committed IndexedDB baseline found');
  const baseline = baselineRevision.stdout;
  await p.route("**/idb.mjs", (route) =>
    route.fulfill({ contentType: "text/javascript", body: baseline }),
  );
  const beforeMs = await reload();
  await p.unroute("**/idb.mjs");
  const afterMs = [await reload(), await reload()];
  const restored = await p.evaluate(() => {
    const l = s.doc.layers.find((l) => l.text === "90% Off");
    return {
      x: l.x,
      y: l.y,
      width: l.width,
      height: l.height,
      rotation: l.rotation,
      bounds: l.sourceTextPaint?.bounds,
    };
  });
  for (const k of Object.keys(restored))
    assert.deepEqual(restored[k], geometry[k]);
  // Reimport through the cache must retain the unrotated local rectangle too.
  await p.locator(".ui-studio input[type=file]").setInputFiles(process.argv[2]);
  await p.getByRole("button", { name: "Replace", exact: true }).click();
  if (
    await p
      .getByRole("button", { name: "Import and discard", exact: true })
      .count()
  )
    await p
      .getByRole("button", { name: "Import and discard", exact: true })
      .click();
  await p.waitForFunction(() => !s.busy, null, { timeout: 90000 });
  const warm = await p.evaluate(() => {
    const l = s.doc.layers.find((l) => l.text === "90% Off");
    return {
      x: l.x,
      y: l.y,
      width: l.width,
      height: l.height,
      rotation: l.rotation,
      bounds: l.sourceTextPaint?.bounds,
    };
  });
  assert.deepEqual(warm, restored);
  assert.deepEqual(errors, []);
  const result = {
    importMs,
    reloadBeforeMs: beforeMs,
    reloadAfterMs: afterMs,
    geometry,
    warmCache: true,
    errors,
  };
  fs.writeFileSync(
    "C:/Projects/vinagen/Builds/GraphWebVerification/MasterPass/rotation-reload-result.json",
    JSON.stringify(result, null, 2),
  );
  console.log(JSON.stringify(result, null, 2));
  await b.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
