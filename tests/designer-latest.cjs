// Synthetic fixtures only: latest shared PSD logic and standalone rendering.
const assert = require('node:assert/strict');
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'C:/Users/hanoi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
  const browser=await chromium.launch();
  try{
    const page=await browser.newPage({viewport:{width:1440,height:950}}),errors=[],native=[];
    page.on('pageerror',error=>errors.push(error.message));
    page.on('request',request=>{if(new URL(request.url()).pathname.includes('/api/'))native.push(request.url());});
    await page.goto(process.env.DESIGNER_URL || 'http://127.0.0.1:3000/tools/designer-source/');
    await page.waitForFunction(()=>document.querySelector('.ui-board'));
    const result=await page.evaluate(async()=>{
      const check=(value,message)=>{if(!value)throw Error(message);};
      const {getUIStudio}=await import('./ui-studio.mjs'),s=getUIStudio();
      while(!s.ready)await new Promise(requestAnimationFrame);
      const {newDocument,newLayer,validateDocument,copy}=await import('./ui-model.mjs');
      const {renderText}=await import('./web-text.mjs');
      const {workspace,resourceURL}=await import('./workspace.mjs');
      const {blobBase64,cacheKey,fileCacheKey}=await import('./ui-project-cache.mjs');
      const {imageFusionPlan}=await import('./ui-layer-actions.mjs');
      const {syncImageComponents}=await import('./image-components.mjs');
      const {captureLayerPNG}=await import('./ui-screen-capture.mjs');
      const pixels=async(blob)=>{const img=await createImageBitmap(blob),c=new OffscreenCanvas(img.width,img.height),ctx=c.getContext('2d');ctx.drawImage(img,0,0);img.close();return {width:c.width,height:c.height,data:ctx.getImageData(0,0,c.width,c.height).data};};
      const style={gradient:false,strokeWidth:0,outlineWidth:0,extrusionX:0,extrusionY:0};
      const label={...newLayer('text'),text:'HH',fontSize:48,width:160,height:80,textColor:'#ffffffff',textAlign:'left',textStyle:style,tmpSettings:{wordWrapping:false}};
      const config={vinaGenFonts:[],textStyles:[]};
      const paint=async layer=>{const out=await renderText(layer,config,resourceURL);return pixels(await fetch(out.dataUrl).then(r=>r.blob()));};
      const counts=p=>{const result={red:0,green:0,blue:0};for(let i=0;i<p.data.length;i+=4)if(p.data[i+3]>200){if(p.data[i]>200&&p.data[i+1]<30)result.red++;if(p.data[i+1]>200&&p.data[i]<30)result.green++;if(p.data[i+2]>200&&p.data[i]<30)result.blue++;}return result;};
      const runs={text:'HH',colors:[{start:0,length:1,color:'#ff0000ff'},{start:1,length:1,color:'#00ff00ff'}]};
      const colors=counts(await paint({...label,textRuns:runs}));
      check(colors.red>50&&colors.green>50,'Mixed color runs did not paint');
      const stale=counts(await paint({...label,text:'ZZ',textRuns:runs}));
      check(stale.red===0&&stale.green===0,'Edited content reused stale color runs');
      const unicode=counts(await paint({...label,text:'H𝟙H',textRuns:{text:'H𝟙H',colors:[{start:0,length:3,color:'#ff0000ff'},{start:3,length:1,color:'#00ff00ff'}]}}));
      check(unicode.red>50&&unicode.green>50,'UTF-16 color offsets were lost');
      const wrapped=counts(await paint({...label,text:'H H',width:40,tmpSettings:{wordWrapping:true},textRuns:{text:'H H',colors:[{start:0,length:2,color:'#ff0000ff'},{start:2,length:1,color:'#00ff00ff'}]}}));
      check(wrapped.red>50&&wrapped.green>50,'Wrapped color offsets were lost');
      const shadow=await paint({...label,textStyle:{...style,shadowWidth:3,shadowX:22,shadowY:12,shadowColor:'#0000ffff'}});
      check(counts(shadow).blue>100,'Independent shadow did not paint');
      const base=await paint(label);check(shadow.width>base.width,'Shadow bounds clipped');

      // Export/reimport real PSD bytes through the production worker.
      s.doc=newDocument({width:240,height:140});s.doc.name='Editable colors';
      s.doc.layers=[{...label,id:'color-label',textRuns:runs,x:20,y:20,rotation:-45}];s.version++;s.paintAll();
      await s.whenCanvasReady();
      const {exportPSD}=await import('./ui-psd-export.mjs');
      const psd=await exportPSD(s);
      s.doc=newDocument();s.version++;s.paintAll();
      await s.importPSD(new File([psd.blob],'editable-colors.psd'));
      const imported=s.doc.layers.filter(layer=>layer.role==='text');
      check(imported.length===1&&imported[0].text==='HH','PSD text was not editable');
      check(!imported[0].image&&!imported[0].sourceTextPaint,'PSD text created glyph PNGs');
      check(imported[0].textRuns.colors.length===2,'PSD text color runs were lost');
      check(Math.round(imported[0].rotation)===-45&&imported[0].width===label.width,'PSD changed rotated text geometry');

      // A packed PSD image retains Multiply then Normal paint on a backdrop.
      const atlas=new OffscreenCanvas(20,42),ctx=atlas.getContext('2d');
      ctx.fillStyle='#808080';ctx.fillRect(0,0,20,20);ctx.fillStyle='#00ff00';ctx.fillRect(0,22,10,20);
      const asset=await workspace.api('ui-image',{fileName:'atlas.png',dataBase64:await blobBase64(await atlas.convertToBlob())});
      const composite={...newLayer('image'),id:'packed',x:0,y:0,width:20,height:20,image:asset.image,imageMode:'none',fill:'#ffffffff',imageComposite:{width:20,height:20,atlasWidth:20,atlasHeight:42,paints:[{x:0,y:0,width:20,height:20,blendMode:'multiply'},{x:0,y:22,width:20,height:20,blendMode:'normal'}]}};
      const doc=newDocument({width:20,height:20});doc.layers=[{...newLayer('rectangle'),id:'backdrop',x:0,y:0,width:20,height:20,fill:'#c86432ff'},composite];validateDocument(doc);
      s.doc=doc;s.version++;s.paintAll();await s.whenCanvasReady();
      const captured=await pixels((await captureLayerPNG(s,null)).blob),at=(x,y)=>[...captured.data.slice((y*captured.width+x)*4,(y*captured.width+x)*4+4)];
      const normal=at(5,10),multiply=at(15,10);
      check(normal[1]>240&&normal[0]<10,'Normal atlas paint was lost: '+JSON.stringify({normal,multiply,width:captured.width,height:captured.height,styles:[s.elements.get('packed'),...s.elements.get('packed').querySelectorAll('*')].map(node=>{const c=getComputedStyle(node);return {tag:node.tagName,width:c.width,height:c.height,top:c.top,left:c.left,display:c.display,transform:c.transform,visibility:c.visibility};})}));
      check(Math.abs(multiply[0]-100)<3&&Math.abs(multiply[1]-50)<3,'Atlas lost backdrop blending: '+multiply);
      const atlasPackage=await workspace.unpack(await workspace.package(doc));
      check(atlasPackage.layers.find(layer=>layer.id==='packed').imageComposite.paints.length===2,'Package lost atlas paints');
      const duplicate={...copy(composite),id:'packed-copy',x:25};doc.layers.push(duplicate);
      const before=copy(doc);delete composite.imageComposite;composite.image={...asset.image,guid:'replacement'};syncImageComponents(before,doc);
      check(!duplicate.imageComposite&&duplicate.image.guid==='replacement','Shared replacement retained stale atlas metadata');

      // Fusion keeps backdrop-dependent artwork and supports a cache-only repeat.
      const fusion=newDocument({width:200,height:140});
      fusion.layers=[{...newLayer('empty'),id:'group',blendMode:'pass-through',opacity:1,width:160,height:100},
        {...newLayer('rectangle'),id:'shade',parentId:'group',width:100,height:60,fill:'#808080ff',blendMode:'multiply'},
        {...newLayer('rectangle'),id:'art-a',parentId:'group',x:10,y:10,width:35,height:35,fill:'#ff0000ff'},
        {...newLayer('rectangle'),id:'art-b',parentId:'group',x:45,y:10,width:35,height:35,fill:'#00ff00ff'}];
      check(imageFusionPlan(fusion,'group').preserveBlend,'Fusion did not preserve backdrop layers');
      s.doc=fusion;s.version++;s.paintAll();await s.whenCanvasReady();
      await s.fusionImages('group');
      check(!s.errorMessage&&s.doc.layers.some(layer=>layer.id==='shade'&&layer.blendMode==='multiply'),'Fusion lost Multiply artwork: '+s.status.textContent);
      const fused=s.doc.layers.find(layer=>layer.id===s.doc.layers[0].fusionPaintLayerId);
      check(fused?.image?.guid,'Fusion did not create a normal paint');
      await s.fusionImages('group');check(!s.errorMessage,'Cached Fusion failed: '+s.status.textContent);
      const packed=await workspace.unpack(await workspace.package(s.doc));validateDocument(packed);
      check(packed.layers.some(layer=>layer.blendMode==='multiply'),'Package lost blend layers');

      // Concurrent hashing keeps existing plan-cache identities.
      const bytes=new Uint8Array(9*1024*1024+3);bytes[4194304]=17;
      const file=new File([bytes],'hash.psd'),hashes=[];
      for(let offset=0;offset<file.size;offset+=4194304)hashes.push(await cacheKey(await file.slice(offset,offset+4194304).arrayBuffer()));
      check(await fileCacheKey(file)===await cacheKey(file.size+':'+hashes.join(':')),'Concurrent hash changed cache keys');
      await s.persist();
      return {colors,shadowPixels:counts(shadow).blue,editablePSD:imported.length,normal,multiply,fusionLayers:s.doc.layers.length};
    });
    page.once('dialog',dialog=>dialog.accept());
    await page.reload();
    await page.waitForFunction(()=>document.querySelector('.ui-board'));
    const restored=await page.evaluate(async()=>{const s=(await import('./ui-studio.mjs')).getUIStudio();while(!s.ready)await new Promise(requestAnimationFrame);return {layers:s.doc.layers.length,blend:s.doc.layers.some(layer=>layer.blendMode==='multiply')};});
    assert.equal(restored.layers,result.fusionLayers);assert.equal(restored.blend,true);
    assert.deepEqual(errors,[]);assert.deepEqual(native,[]);
    console.log(JSON.stringify({...result,errors,nativeRequests:native.length},null,2));
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
