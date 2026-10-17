// Exercise the real production artifact, without publishing test hooks/exports.
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const http = require('node:http');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE ||
  'C:/Users/hanoi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root = path.resolve(__dirname, '..');
const types = { '.html': 'text/html', '.mjs': 'text/javascript', '.js': 'text/javascript', '.css': 'text/css', '.ttf': 'font/ttf', '.png': 'image/png' };
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    const source = url.pathname.startsWith('/source/');
    const base = source ? path.join(root, 'tools/designer-source') : url.pathname.startsWith('/applied/') ? root : path.join(root, 'dist');
    const relative = decodeURIComponent(source ? url.pathname.replace(/^\/source\/designer\//, '') : url.pathname.replace(/^\/(applied|production)\//, ''));
    let file = path.resolve(base, relative);
    if (file !== base && !file.startsWith(base + path.sep)) throw Error('Outside public root');
    if ((await fs.stat(file)).isDirectory()) file = path.join(file, 'index.html');
    res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
    res.end(await fs.readFile(file));
  } catch { res.writeHead(404).end(); }
});
let browser;
(async () => {
  await fs.access(path.join(root, 'dist/designer/index.html'));
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  for (const file of ['designer/app.mjs', 'designer/ui-studio.mjs', 'designer/psd-worker.mjs', 'designer/app.mjs.map', 'designer/README.md', 'tools/build_site.py', 'tools/build-site.mjs', 'package.json', 'tests/designer-smoke.cjs', '.git/config']) {
    assert.equal((await fetch(`${origin}/production/${file}`)).status, 404, file);
  }
  for (const file of ['app.mjs', 'ui-studio.mjs', 'psd-worker.mjs', 'app.mjs.map']) {
    assert.equal((await fetch(`${origin}/applied/designer/${file}`)).status, 404, 'Applied route: ' + file);
  }
  assert.equal((await fetch(`${origin}/production/tools/designer-source/app.mjs`)).status, 404);
  // The public checked-in route must contain the exact tested deployment files.
  for (const file of await fs.readdir(path.join(root, 'dist/designer'))) {
    if ((await fs.stat(path.join(root, 'dist/designer', file))).isFile()) {
      assert.deepEqual(await fs.readFile(path.join(root, 'designer', file)), await fs.readFile(path.join(root, 'dist/designer', file)), file);
    }
  }
  for (const file of ['index.html', 'introduction.md', 'vi/introduction.md', 'updateAvailable.json', 'playground/index.html']) {
    assert.equal((await fetch(`${origin}/production/${file}`)).status, 200, file);
  }
  browser = await chromium.launch({ headless: true });
  const results = {};
  for (const mode of ['source', 'production', 'applied']) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 950 } });
    const page = await context.newPage(), errors = [], failures = [], workers = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => { if (response.status() >= 400) failures.push(response.url()); });
    page.on('worker', worker => workers.push(worker.url()));
    const start = performance.now();
    await page.goto(`${origin}/${mode}/designer/`);
    await page.waitForFunction(() => document.querySelector('#demo')?.disabled === false);
    const startupMs = Math.round(performance.now() - start);
    await page.getByRole('button', { name: 'Demo', exact: true }).click();
    await page.waitForFunction(() => document.querySelectorAll('.ui-board .ui-layer').length === 6);
    await page.getByRole('textbox', { name: 'Document name', exact: true }).fill('Protected build test');
    await page.getByRole('textbox', { name: 'Document name', exact: true }).press('Tab');
    const downloads = {};
    for (const format of ['SVGPRO', 'PNG', 'SVG', 'PSD']) {
      await page.getByRole('button', { name: 'Export', exact: true }).click();
      await page.getByRole('combobox', { name: 'Export scope' }).selectOption('all');
      const downloaded = page.waitForEvent('download', { timeout: 60000 });
      await page.getByRole('button', { name: `Export ${format}`, exact: true }).click();
      const download = await downloaded;
      downloads[format] = await fs.readFile(await download.path());
      assert.ok(downloads[format].length > 100, `${mode}: ${format} empty`);
      await page.waitForFunction(() => !document.querySelector('dialog[open]'));
    }
    assert.equal(downloads.PSD.subarray(0, 4).toString(), '8BPS');
    await page.reload();
    await page.waitForFunction(() => document.querySelector('#demo')?.disabled === false);
    assert.equal(await page.getByRole('textbox', { name: 'Document name', exact: true }).inputValue(), 'Protected build test');
    assert.equal(await page.locator('.ui-board .ui-layer').count(), 6);
    await page.locator('.ui-studio input[type=file]').setInputFiles({
      name: 'Roundtrip.psd', mimeType: 'image/vnd.adobe.photoshop', buffer: downloads.PSD,
    });
    await page.getByRole('button', { name: 'Replace', exact: true }).click();
    await page.getByRole('button', { name: 'Import and discard', exact: true }).click();
    await page.waitForFunction(() => /Imported \d+ PSD layers/.test(document.querySelector('.ui-status')?.textContent), null, { timeout: 60000 });
    assert.ok(workers.length, 'PSD import did not use a worker');
    if (mode !== 'source') assert.ok(workers.every(url => /\/e-[\w-]+\.mjs$/.test(url)));
    const importedLayers = await page.locator('.ui-board .ui-layer').count();
    assert.ok(importedLayers >= 6, 'PSD import lost artwork');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole('button', { name: 'Settings', exact: true }).click();
    await page.getByRole('button', { name: 'Done', exact: true }).click();
    assert.deepEqual(errors, [], mode + ' runtime errors');
    assert.deepEqual(failures, [], mode + ' failed assets');
    results[mode] = { startupMs, png: downloads.PNG, workers: workers.length, importedLayers };
    await context.close();
  }
  // This verifies fonts, CSS, renderer and lazy export modules agree exactly.
  assert.deepEqual(results.production.png, results.source.png, 'Production PNG differs from source');
  assert.equal(results.production.importedLayers, results.source.importedLayers);
  assert.deepEqual(results.applied.png, results.source.png, 'Applied Designer PNG differs from source');
  assert.equal(results.applied.importedLayers, results.source.importedLayers);
  console.log(JSON.stringify({
    originalSourcePaths: '404', productionPNG: 'identical to source',
    appliedDesigner: 'protected files match dist; PNG identical to source',
    sourceStartupMs: results.source.startupMs, productionStartupMs: results.production.startupMs, appliedStartupMs: results.applied.startupMs,
    checks: ['demo', 'rename', 'SVGPRO/PNG/SVG/PSD export', 'reload persistence', 'PSD worker roundtrip', 'mobile settings'],
  }, null, 2));
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(async () => {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
});
