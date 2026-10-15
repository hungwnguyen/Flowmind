// Author tool: export the actual rendered editor SVGs and their computed styles.
// Run against a local static server: node tools/sync-designer-guide-icons.cjs
const fs = require('node:fs/promises');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE ||
  'C:/Users/hanoi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

(async () => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 950 } });
    await page.goto(process.env.DESIGNER_URL || 'http://127.0.0.1:3000/designer/');
    await page.locator('.ui-toolbar').waitFor();
    const icons = await page.evaluate(async () => {
      const studio = (await import('./ui-studio.mjs')).getUIStudio();
      const result = {};
      function capture(name, button) {
        const svg = button.querySelector('svg');
        const box = button.getBoundingClientRect();
        const glyph = svg.getBoundingClientRect();
        const style = getComputedStyle(button);
        const ink = getComputedStyle(svg);
        let parent = button.parentElement;
        while (parent && getComputedStyle(parent).backgroundColor === 'rgba(0, 0, 0, 0)') parent = parent.parentElement;
        const surface = getComputedStyle(parent || document.documentElement).backgroundColor;
        const radius = style.borderRadius;
        result[name] = `<svg xmlns="http://www.w3.org/2000/svg" width="${box.width}" height="${box.height}" viewBox="0 0 ${box.width} ${box.height}"><rect width="100%" height="100%" rx="${parseFloat(radius)}" fill="${surface}"/><rect width="100%" height="100%" rx="${parseFloat(radius)}" fill="${style.backgroundColor}"/><svg x="${glyph.x - box.x}" y="${glyph.y - box.y}" width="${glyph.width}" height="${glyph.height}" viewBox="0 0 24 24" fill="${ink.fill}" stroke="${ink.color}" stroke-width="${ink.strokeWidth}" stroke-linecap="${ink.strokeLinecap}" stroke-linejoin="${ink.strokeLinejoin}">${svg.innerHTML}</svg></svg>\n`;
      }
      for (const theme of ['light', 'dark']) {
        document.documentElement.dataset.theme = theme;
        for (const [name, id] of Object.entries({folder: 'open-files', save: 'save', import: 'import', export: 'export', reload: 'reload', settings: 'settings', demo: 'demo'})) {
          capture(`${name}-${theme}`, document.getElementById(id));
        }
        for (const name of ['cursor', 'hand', 'scale', 'frame', 'rectangle', 'ellipse', 'polygon', 'star', 'line', 'arrow', 'text', 'text-path', 'image', 'button', 'comment']) {
          const probe = studio.iconButton(name, name, () => {});
          studio.toolbar.append(probe);
          capture(`${name}-${theme}`, probe);
          if (name === 'cursor') {
            probe.classList.add('active');
            capture(`selected-${theme}`, probe);
          }
          probe.remove();
        }
        capture(`chevron-${theme}`, studio.toolbar.querySelector('.ui-tool-chevron'));
        const { newLayer } = await import('./ui-model.mjs');
        for (const hidden of [false, true]) {
          const layer = newLayer('rectangle');
          layer.visible = !hidden;
          layer.locked = hidden;
          const row = studio.createLayerRow({ layer, depth: 0, children: false, expanded: false });
          studio.layerList.append(row);
          const buttons = row.querySelectorAll('button');
          capture(`${hidden ? 'eyeOff' : 'eye'}-${theme}`, buttons[buttons.length - 2]);
          capture(`${hidden ? 'lock' : 'unlock'}-${theme}`, buttons[buttons.length - 1]);
          row.remove();
        }
      }
      return result;
    });
    const dir = path.resolve(__dirname, '../images/web-designer/icons');
    await fs.mkdir(dir, { recursive: true });
    for (const [name, svg] of Object.entries(icons)) await fs.writeFile(path.join(dir, name + '.svg'), svg);
    console.log(`Exported ${Object.keys(icons).length} editor icon samples (light and dark).`);
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
