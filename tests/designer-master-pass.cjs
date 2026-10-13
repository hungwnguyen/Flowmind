// Author-only verification with a user-provided PSD. No fixture is redistributed.
const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'C:/Users/hanoi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
let browser;
(async()=>{
  const file=process.argv[2];if(!file)throw Error('Pass an existing PSD path.');
  const out=process.env.VINAGEN_MASTER_OUTPUT||'C:/Projects/vinagen/Builds/GraphWebVerification/MasterPass';fs.mkdirSync(out,{recursive:true});
  browser=await chromium.launch({headless:true,channel:'msedge'});
  const page=await browser.newPage({viewport:{width:1800,height:1100}}),errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(process.env.DESIGNER_URL||'http://127.0.0.1:8769/designer/');
  await page.waitForFunction(()=>!!document.querySelector('.ui-board'));
  await page.evaluate(async()=>{window.s=(await import('./ui-studio.mjs')).getUIStudio();});await page.waitForFunction(()=>s.ready);
  await page.locator('.ui-studio input[type=file]').setInputFiles(file);
  await page.getByRole('button',{name:'Replace',exact:true}).click();
  await page.waitForFunction(()=>!s.busy&&s.doc.name==='Master_pass'&&s.doc.layers.length>100,{},{timeout:240000});
  const initial=await page.evaluate(async()=>{
    await s.whenCanvasReady();await Promise.all([...s.board.querySelectorAll('img')].map(img=>img.decode().catch(()=>{})));
    const roots=s.doc.layers.filter(l=>!l.parentId),texts=s.doc.layers.filter(l=>l.role==='text');
    return {layers:s.doc.layers.length,texts:texts.length,roots:roots.map(({id,name,x,y,width,height,clip,visible})=>({id,name,x,y,width,height,clip,visible})),notes:s.doc.importNotes};
  });
  fs.writeFileSync(path.join(out,'import-'+(process.env.VINAGEN_MASTER_BASELINE?'before':'after')+'.json'),JSON.stringify(initial,null,2));
  await page.screenshot({path:path.join(out,'master-'+(process.env.VINAGEN_MASTER_BASELINE?'before':'after')+'.png')});
  if(!process.env.VINAGEN_MASTER_BASELINE){
    const visible=initial.roots.filter(r=>r.visible&&r.name!=='Master_pass').sort((a,b)=>a.x-b.x);
    assert.deepEqual(visible.map(r=>[r.name,r.x,r.y,r.width,r.height,r.clip]),[['Demo',0,1,1080,2340,true],['Demo2',1218,1,1080,2340,true],['Demo3',2389,1,1080,2340,true],['Demo4',3556,0,1080,2340,true],['Demo5',4736,0,1080,2340,true],['Demo6',5916,0,1080,2340,true],['Demo7',7167,1,1080,2340,true],['Demo8',8347,1,1080,2340,true]]);
    assert.equal(initial.texts,106);
    await page.evaluate(async()=>{s.select('psd-121');s.layerActions.focus();await s.whenCanvasReady();});
    await page.screenshot({path:path.join(out,'activate-after.png')});
    const label=await page.evaluate(()=>{const l=s.indexes().get('psd-121');return {font:l.tmpFont,outline:l.textStyle.outlineWidth,color:l.textStyle.outlineColor,source:!!s.elements.get(l.id).querySelector('.ui-psd-text-paint')};});
    assert.deepEqual(label,{font:'f10a12',outline:5,color:'#005e00ff',source:true});
  }
  const text=await page.evaluate(()=>s.doc.layers.find(l=>l.role==='text'&&l.text==='Master Pass')?.id||s.doc.layers.find(l=>l.role==='text'&&s.hierarchy.some(h=>h.layer===l))?.id);
  const edit=await page.evaluate(async id=>{
    const {importedTextPaint,textPaintSignature}=await import('./ui-styled-text.mjs');
    s.select(id);s.layerActions.focus();await s.whenCanvasReady();
    const layer=s.indexes().get(id),content=s.elements.get(id).firstElementChild;
    return {id,text:layer.text,visible:layer.visible,source:!!importedTextPaint(layer),signature:textPaintSignature(layer),parentId:layer.parentId,html:content.innerHTML.slice(0,250),version:s.version};
  },text);
  await page.getByRole('button',{name:'Edit text',exact:true}).click();
  await page.getByRole('textbox',{name:'Text',exact:true}).fill('Edited Master Pass');
  await page.waitForTimeout(1800);
  const after=await page.evaluate(async id=>{await s.whenCanvasReady();const content=s.elements.get(id).firstElementChild;return {text:s.indexes().get(id).text,status:content.dataset.styledTextStatus,alt:content.querySelector('img')?.alt,source:!!content.querySelector('.ui-psd-text-paint'),html:content.innerHTML.slice(0,250),version:s.version,error:s.status.textContent};},text);
  fs.writeFileSync(path.join(out,'text-'+(process.env.VINAGEN_MASTER_BASELINE?'before':'after')+'.json'),JSON.stringify({edit,after,errors},null,2));
  if(!process.env.VINAGEN_MASTER_BASELINE){
    assert.equal(after.text,'Edited Master Pass');assert.equal(after.alt,'Edited Master Pass');assert.equal(after.source,false);assert.equal(after.status,'ready');assert.deepEqual(errors,[]);
    await page.getByRole('textbox',{name:'Text',exact:true}).press('Escape');
    await page.getByRole('button',{name:'Undo',exact:true}).click();
    await page.waitForFunction(id=>s.indexes().get(id).text==='Master Pass',text);
    await page.getByRole('button',{name:'Redo',exact:true}).click();
    await page.waitForFunction(id=>s.indexes().get(id).text==='Edited Master Pass',text);
    const raster=await page.evaluate(()=>{const {x,y,width,height,image}=s.indexes().get('psd-119');return {x,y,width,height,guid:image.guid};});
    await page.locator('.ui-studio input[type=file]').setInputFiles(file);
    await page.getByRole('button',{name:'Replace',exact:true}).click();
    await page.getByRole('button',{name:'Import and discard',exact:true}).click();
    await page.waitForFunction(()=>!s.busy&&s.doc.layers.some(l=>l.id==='psd-422'&&l.text==='Master Pass'),{},{timeout:240000});
    const warmed=await page.evaluate(()=>{const {x,y,width,height,image}=s.indexes().get('psd-119');return {x,y,width,height,guid:image.guid};});assert.deepEqual(warmed,raster,'Warm paint cache retains padded sprite placement and shares the same baked PNG');
    fs.writeFileSync(path.join(out,'warm-cache.json'),JSON.stringify({raster,warmed,errors},null,2));
  }
  console.log(JSON.stringify({layers:initial.layers,texts:initial.texts,textEdit:after.status,undoRedo:!process.env.VINAGEN_MASTER_BASELINE,warmCache:!process.env.VINAGEN_MASTER_BASELINE,errors}));
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(async()=>{await browser?.close();});
