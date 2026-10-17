// Browser text must follow native rendered-bounds/left/top preview semantics.
const assert = require('node:assert/strict');
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'C:/Users/hanoi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async () => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.goto(process.env.DESIGNER_URL || 'http://127.0.0.1:8769/tools/designer-source/');
    const result = await page.evaluate(async () => {
      const {renderText} = await import('./web-text.mjs');
      const config = {vinaGenFonts: [], textStyles: []};
      const label = {text: 'Activate', width: 280, height: 48, fontSize: 64, textAlign: 'center', textColor: '#ffffffff', textStyle: {gradient: false, strokeWidth: 0, outlineWidth: 0, extrusionX: 0, extrusionY: 0}, tmpSettings: {wordWrapping: false, overflow: 'overflow', verticalAlign: 'middle'}};
      const inspect = async layer => {
        const paint = await renderText(layer, config, () => '');
        const bitmap = await createImageBitmap(await fetch(paint.dataUrl).then(r => r.blob()));
        const canvas = new OffscreenCanvas(bitmap.width, bitmap.height), ctx = canvas.getContext('2d');
        ctx.drawImage(bitmap, 0, 0); bitmap.close();
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let left = Infinity, top = Infinity, right = -Infinity, bottom = -Infinity, edge = 0;
        for (let y = 0; y < canvas.height; y++) for (let x = 0; x < canvas.width; x++) if (data[(y * canvas.width + x) * 4 + 3]) {
          left = Math.min(left, x); right = Math.max(right, x); top = Math.min(top, y); bottom = Math.max(bottom, y);
          if (!x || !y || x === canvas.width - 1 || y === canvas.height - 1) edge++;
        }
        return {width: paint.width, height: paint.height, edge, inkWidth: right - left + 1, inkHeight: bottom - top + 1, centerY: (paint.top ?? -paint.padding) + (top + bottom + 1) / 2, left: (paint.left ?? -paint.padding) + left, top: (paint.top ?? -paint.padding) + top};
      };
      const center = await inspect(label);
      const narrow = {...label, text: 'Ágj Activate WWW', width: 45, height: 18, tmpSettings: {...label.tmpSettings, italic: true}, textStyle: {...label.textStyle, outlineWidth: 5, shadowWidth: 4, shadowX: -18, shadowY: 22, extrusionX: 8, extrusionY: 12}};
      const overflow = await inspect(narrow), wide = await inspect({...narrow, width: 1200, height: 300});
      const curved = await inspect({...narrow, textCurve: {angle: 90}});
      const masked = await inspect({...narrow, tmpSettings: {...narrow.tmpSettings, overflow: 'masking'}});
      const right = await inspect({...label, text: 'AVATAR', width: 400, textAlign: 'right', tmpSettings: {...label.tmpSettings, characterSpacing: 8}});
      return {center, overflow, wide, curved, masked, right};
    });
    assert.ok(Math.abs(result.center.centerY - 24) <= 1, 'Glyphs must align with the text rectangle: ' + JSON.stringify(result.center));
    for (const key of ['overflow', 'curved']) assert.equal(result[key].edge, 0, key + ' clips glyphs/effects at preview edges');
    assert.ok(Math.abs(result.overflow.inkWidth - result.wide.inkWidth) <= 2, 'Overflow lost horizontal glyph pixels');
    assert.ok(Math.abs(result.overflow.inkHeight - result.wide.inkHeight) <= 2, 'Overflow lost vertical glyph pixels');
    assert.ok(result.masked.inkWidth <= 45 && result.masked.inkHeight <= 18, 'Explicit masking must still clip');
    assert.ok(result.masked.left >= 0 && result.masked.top >= 0, 'Mask moved out of its layer');
    assert.ok(result.right.left + result.right.inkWidth <= 401, 'Kerning/spacing shifted right-aligned glyphs');
    console.log(JSON.stringify(result, null, 2));
  } finally { await browser.close(); }
})().catch(error => {console.error(error); process.exitCode = 1;});
