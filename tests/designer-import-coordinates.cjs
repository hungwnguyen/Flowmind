// Optional private PSD regression. Artwork is only written to ignored Builds/.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'C:/Users/hanoi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async () => {
  const file = process.argv[2];
  if (!file) throw Error('Pass an existing PSD path.');
  const {readPSDFile, preparePSDImport} = await import('../tools/designer-source/psd-reader.mjs');
  const plan = preparePSDImport(await readPSDFile(await fs.openAsBlob(file)));
  const expected = plan.records.filter(r => !r.rasterEffects && !r.text?.rotation && !r.text?.psdTextBox).map(r => ({id:r.id, x:r.x, y:r.y, width:r.width, height:r.height}));
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({viewport:{width:1800,height:1100}}), errors=[];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(process.env.DESIGNER_URL || 'http://127.0.0.1:8769/tools/designer-source/');
    await page.waitForFunction(() => document.querySelector('.ui-board'));
    await page.evaluate(async () => {window.s=(await import('./ui-studio.mjs')).getUIStudio();});
    await page.waitForFunction(() => s.ready);
    const input = page.locator('.ui-studio input[type=file]');
    await input.setInputFiles(file);
    await page.waitForFunction(() => !s.busy && s.doc.layers.length > 100, null, {timeout:240000});
    const inspect = () => page.evaluate(async () => {
      await s.whenCanvasReady();
      await Promise.all(s.styledPreview?.pending(s.board) || []);
      const {worldRect} = await import('./ui-model.mjs');
      return s.doc.layers.map(l => ({id:l.id, role:l.role, x:l.x, y:l.y, width:l.width, height:l.height, rotation:l.rotation||0, parentId:l.parentId, world:worldRect(s.doc,l)}));
    });
    const cold = await inspect(), byId = new Map(cold.map(l => [l.id,l]));
    let checked=0;
    for (const record of expected) {
      const layer=byId.get(record.id);
      if (!layer) continue; // Fully transparent raster records are omitted.
      for (const key of ['x','y','width','height']) assert.ok(Math.abs(layer.world[key]-record[key]) < .001, `${record.id} world ${key}: ${layer.world[key]} != PSD ${record[key]}`);
      checked++;
    }
    assert.ok(checked > 100);
    const texts = await page.evaluate(async () => {
      const report=[];
      for (const l of s.doc.layers.filter(l=>l.role==='text')) {
        if(l.image||l.sourceTextPaint)throw Error('Editable text was rasterized: '+l.id);
        const image=s.elements.get(l.id)?.querySelector('.ui-styled-text-preview');
        if(!image)continue;
        await image.decode();
        const canvas=new OffscreenCanvas(image.naturalWidth,image.naturalHeight),ctx=canvas.getContext('2d');ctx.drawImage(image,0,0);
        const data=ctx.getImageData(0,0,canvas.width,canvas.height).data;let edges=0;
        for(let y=0;y<canvas.height;y++)for(let x=0;x<canvas.width;x++)if((!x||!y||x===canvas.width-1||y===canvas.height-1)&&data[(y*canvas.width+x)*4+3])edges++;
        report.push({id:l.id,text:l.text,edges});
      }
      return report;
    });
    assert.ok(texts.length > 50);
    assert.deepEqual(texts.filter(t=>t.edges), [], 'Text preview crops painted pixels');
    const out=path.resolve('Builds/DesignerImportFix');fs.mkdirSync(out,{recursive:true});
    await page.evaluate(async()=>{
      const {worldRect}=await import('./ui-model.mjs');
      const label=s.doc.layers.find(l=>l.text==='Activate'&&s.hierarchy.some(h=>h.layer===l)),r=worldRect(s.doc,label);
      s.selected.clear();s.zoom=1;s.autoFit=false;s.pan={x:900-r.x,y:380-r.y};s.paint();await s.whenCanvasReady();
    });
    await page.screenshot({path:path.join(out,'header-after.png')});
    // Reusing the worker's paint cache must not reapply parent offsets/effect padding.
    await input.setInputFiles(file);
    await page.getByRole('button',{name:'Replace',exact:true}).click();
    await page.getByRole('button',{name:'Import and discard',exact:true}).click();
    await page.waitForFunction(()=>!s.busy&&s.doc.layers.length>100,null,{timeout:240000});
    assert.deepEqual(await inspect(),cold,'Warm import changed layer coordinates');
    await page.evaluate(async()=>{await s.persist();});
    page.once('dialog',dialog=>dialog.accept());await page.reload();
    await page.waitForFunction(()=>document.querySelector('.ui-board'));
    await page.evaluate(async()=>{window.s=(await import('./ui-studio.mjs')).getUIStudio();});
    await page.waitForFunction(()=>s.ready);
    assert.deepEqual(await inspect(),cold,'Reload changed imported coordinates');
    assert.deepEqual(errors,[]);
    console.log(JSON.stringify({layers:cold.length,coordinatesChecked:checked,textPreviewsChecked:texts.length,warmImport:true,reload:true,errors}));
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
