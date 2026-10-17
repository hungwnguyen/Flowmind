// Author-only regression/benchmark against either shipped browser editor.
// Set VINAGEN_RENDER_WEB to Flowmind/tools/designer-source for the author copy.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { chromium } = require(process.argv[2] || 'playwright');
const web = path.resolve(process.env.VINAGEN_RENDER_WEB || path.join(__dirname, '../tools/designer-source'));
const standalone = fs.existsSync(path.join(web, 'workspace.mjs'));
const prefix = standalone ? '/designer/' : '/graph-editor/';
const empty = {schema:'vinagen_ui',schemaVersion:1,name:'Render test',width:1920,height:1080,layers:[]};
const config = {width:1920,height:1080,fonts:[],tmpFonts:[],textStyles:[],documents:[],shortcuts:[],imageFolder:'Assets/VinaGen AI Toolkit/Content/UI/Images',documentFolder:'Assets/VinaGen AI Toolkit/Content/UI/Documents'};
const server = http.createServer(async (req,res) => {
  const url = new URL(req.url,'http://localhost');
  if(url.pathname.startsWith(prefix+'api/')) {
    const route=url.pathname.slice((prefix+'api/').length);
    const data=route==='bootstrap'?{token:'test',project:'Performance verification',graphs:[],folders:['Assets']}:route==='ui-config'?config:route==='ui-read'?{document:empty,path:'',revision:''}:route==='ui-session'?{token:'test'}:route==='appearance'?{viewSettings:{}}:{images:[]};
    res.setHeader('Content-Type','application/json');res.end(JSON.stringify(data));return;
  }
  const name=decodeURIComponent(url.pathname.slice(prefix.length))||'index.html';
  const file=path.resolve(web,name);
  if(!file.startsWith(web+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404).end();return;}
  res.setHeader('Content-Type',name.endsWith('.css')?'text/css':name.endsWith('.html')?'text/html':name.endsWith('.png')?'image/png':name.endsWith('.ttf')?'font/ttf':'text/javascript');
  let source=fs.readFileSync(file);
  if(name==='ui-studio.mjs')source=source.toString()+'\nexport function performanceStudio(){return app;}\n';
  res.end(source);
});
let browser;
(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  browser=await chromium.launch({headless:true,channel:process.env.VINAGEN_BROWSER_CHANNEL||'msedge'});
  const page=await browser.newPage({viewport:{width:1600,height:1000}}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(`http://127.0.0.1:${server.address().port}${prefix}?workspace=ui`);
  await page.waitForFunction(()=>!!document.querySelector('.ui-board'));
  await page.evaluate(async()=>{window.renderStudio=(await import('./ui-studio.mjs')).performanceStudio();});
  await page.waitForFunction(()=>renderStudio.ready);
  const cdp=await page.context().newCDPSession(page);await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
  const metrics=await page.evaluate(async()=>{
    const s=renderStudio,frame=()=>new Promise(resolve=>requestAnimationFrame(resolve));
    const settle=async()=>{s.paint();if(s.whenCanvasReady)await s.whenCanvasReady();else{while(s.raf)await frame();}await frame();};
    const layers=[];
    for(let g=0;g<40;g++){
      for(let i=0;i<24;i++)layers.push({id:`child-${g}-${i}`,parentId:`group-${g}`,name:`Artwork ${g}/${i}`,role:i%4===0?'text':'image',x:i%6*64,y:Math.floor(i/6)*64,width:60,height:60,shape:i%4===0?undefined:i%2?'ellipse':'rectangle',fill:'#168dffff',text:'Layer '+i,fontSize:14,textColor:'#ffffff',textAlign:'center'});
      layers.push({id:`group-${g}`,name:'Group '+g,role:'empty',x:g%8*420,y:Math.floor(g/8)*320,width:400,height:300});
    }
    const doc={schema:'vinagen_ui',schemaVersion:1,name:'1000 layers',width:4096,height:2048,layers};
    s.doc=doc;s.version++;s.selected.clear();s.setSidebar('Layers');s.pendingLoad=s.loadProgress.begin();
    let running=true;const gaps=[];let last=performance.now();
    const tick=now=>{gaps.push(now-last);last=now;if(running)requestAnimationFrame(tick);};requestAnimationFrame(tick);
    const start=performance.now();s.paintAll();const synchronous=performance.now()-start;await settle();
    const loaded=performance.now()-start;running=false;
    const rows=[...s.layerList.children],art=s.elements.get('child-0-1'),parent=s.elements.get('group-0');
    if(s.canvasWork)throw Error('Rendering did not finish');
    const count=s.board.querySelectorAll('.ui-layer').length;
    // A geometry/property edit must retain unaffected controls and artwork.
    s.edit(()=>{doc.layers.find(l=>l.id==='child-0-2').visible=false;});await settle();
    const retainedRow=s.layerList.querySelector('[data-layer-row-id="child-0-1"]')===rows.find(row=>row.dataset.layerRowId==='child-0-1');
    const retainedArtwork=s.elements.get('child-0-1')===art;
    const times=[];
    for(let i=0;i<30;i++){const t=performance.now();s.pan.x+=3;s.zoom*=1.001;s.paintCanvas();times.push(performance.now()-t);await frame();}
    const result={synchronousMs:synchronous,loadMs:loaded,maxFrameGapMs:Math.max(...gaps),panPaintMaxMs:Math.max(...times),panPaintMeanMs:times.reduce((a,b)=>a+b,0)/times.length,count,retainedRow,retainedArtwork,parentCorrect:art.parentElement===parent,mountedRows:s.layerList.children.length};
    if(s.whenCanvasReady){
      const ensure=(condition,message)=>{if(!condition)throw Error(message);};
      ensure(s.layerList.children.length<100,'The 1000-row tree must stay bounded');
      // Scroll/keyboard/reveal/rename must use the full hierarchy, including rows
      // outside the mounted window. Search and folding must preserve its order.
      s.focusLayerRow('child-39-23');
      ensure(document.activeElement?.dataset.layerRowId==='child-39-23','Offscreen focus did not mount the target');
      s.selectLayerRow('child-39-22',{});s.navigateLayers(1);
      ensure(s.selected.has('child-39-23'),'Keyboard navigation skipped an unmounted row');
      s.navigateLayers(1);ensure(s.selected.has('child-39-23'),'Keyboard navigation wrapped past the last row');
      s.selectLayerRow('group-0',{});s.selectLayerRow('child-8-0',{shiftKey:true});
      ensure(s.selected.size===202,'Shift selection must include unmounted rows');
      s.selected.clear();s.layerActions.rename('child-39-23');
      const rename=s.layerList.querySelector('.ui-layer-rename');ensure(!!rename,'Rename did not reveal an offscreen row');
      rename.value='Renamed far artwork';rename.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}));await settle();
      ensure(doc.layers.find(l=>l.id==='child-39-23').name==='Renamed far artwork','Rename was lost');
      s.search.value='Renamed far artwork';s.paintLayers();ensure(s.visibleLayerRows.length===2&&s.layerList.children.length===2,'Search must reveal the matching ancestor');
      s.search.value='';s.paintLayers();s.collapseAllLayers();ensure(s.visibleLayerRows.length===40,'Collapsed tree has the wrong rows');
      s.collapseAllLayers();ensure(s.visibleLayerRows.length===1000,'Expanding must restore every row');
      s.focusLayerRow('child-0-1');const dragRow=s.layerRows.get('child-0-1');
      s.layerDragStart({target:dragRow,dataTransfer:{setData(){},effectAllowed:''},preventDefault(){}},s.indexes().get('child-0-1'));
      const panel=s.sidebarPanels.get('Layers');panel.scrollTop=panel.scrollHeight;s.paintLayerWindow();
      ensure(dragRow.isConnected&&dragRow.style.position==='absolute','Scrolling removed the native drag source');
      ensure(s.layerRows.has('child-39-23'),'The bottom scroll window is blank');
      s.finishLayerDrag();
      result.virtualTreeVerified=true;
      // Invalidate halfway through a large render, including a newer version
      // of the same document. Old work must never attach stale layers afterward.
      s.doc={...doc,layers:doc.layers.map(l=>({...l}))};s.version++;s.paintCanvas();
      const partial=s.board.querySelectorAll('.ui-layer').length;
      const next={...doc,name:'Replacement',layers:[{id:'replacement',name:'Replacement',role:'image',shape:'rectangle',x:0,y:0,width:80,height:80,fill:'#ff9900ff'}]};
      s.doc=next;s.version++;s.paintAll();await settle();
      result.replacementIds=[...s.elements.keys()];result.partialCount=partial;
      s.doc={...doc,layers:doc.layers.map(l=>({...l}))};s.version++;s.paintCanvas();
      s.doc.layers=s.doc.layers.slice(0,20).map(l=>({...l,parentId:''}));s.version++;s.paintAll();await settle();
      result.sameDocumentIds=[...s.elements.keys()];
      // Export starts while the final visible layer is still queued. It must
      // wait for that artwork rather than emit an incomplete image.
      s.selected.clear();s.doc={...doc,layers:doc.layers.map(l=>({...l}))};s.version++;s.paintCanvas();
      ensure(!!s.canvasWork,'The large render did not yield between frames');
      const {captureLayerPNG}=await import('./ui-screen-capture.mjs');
      const image=await captureLayerPNG(s,'child-39-23',{format:'png'});
      ensure(image.blob.size>0&&s.canvasWork===null,'Export did not await all canvas work');
      result.pendingExportVerified=true;
      s.doc={...doc,layers:doc.layers.map(l=>({...l,id:'capture-'+l.id,parentId:l.parentId?'capture-'+l.parentId:'',canvasRoot:l.id==='group-39'?true:undefined}))};s.version++;s.paintCanvas();
      ensure(!s.elements.has('capture-group-39'),'The capture fixture must have a queued screen root');
      const {captureScreens}=await import('./ui-screen-capture.mjs');
      const captures=await captureScreens(s,{rootIds:['capture-group-39'],draftVersion:s.version,maxEdge:64});
      ensure(captures.length===1&&captures[0].dataBase64.length>0,'Screen capture did not await its queued root');
      result.pendingScreenCaptureVerified=true;
      // Shared large PNGs exercise decoding/resource reuse, rather than only
      // cheap shape nodes. These are synthetic browser-only resources.
      const colors=['#ff0000','#00ff00','#0000ff','#ffff00','#ff00ff','#00ffff','#ff8800','#8844ff'],urls=[];
      const texture=document.createElement('canvas');texture.width=texture.height=2048;
      const ctx=texture.getContext('2d');
      for(const color of colors){ctx.fillStyle=color;ctx.fillRect(0,0,2048,2048);ctx.strokeStyle='#ffffff';ctx.strokeRect(0,0,2048,2048);urls.push(URL.createObjectURL(await new Promise(resolve=>texture.toBlob(resolve,'image/png'))));}
      texture.width=texture.height=1;
      const media={},imageLayers=[];
      for(let i=0;i<600;i++){
        const guid='render-texture-'+i%urls.length;media[guid+':']=urls[i%urls.length];
        imageLayers.push({id:'texture-'+i,name:'Texture '+i,role:'image',x:i%30*70,y:Math.floor(i/30)*70,width:64,height:64,fill:'#ffffffff',imageMode:'none',image:{guid}});
      }
      s.doc={...doc,name:'Large PNG preview',width:2100,height:1400,layers:imageLayers};s.preview={media};s.psdPaints={document:s.doc,images:new Map(Object.entries(media).map(([key,url])=>[key,{url,revision:''}]))};s.selected.clear();s.version++;s.paintAll();
      await settle();const pngs=[...s.board.querySelectorAll('img')];await Promise.all(pngs.map(img=>img.decode().catch(error=>{throw Error('Large PNG decode: '+error.message+' '+img.src.slice(0,100));})));
      ensure(pngs.length===600&&pngs.every(img=>img.naturalWidth===2048),'Large shared images did not decode completely');
      const exported=await captureLayerPNG(s,'texture-599',{format:'png'}).catch(error=>{throw Error('Large PNG capture: '+error.message);}),bitmap=await createImageBitmap(exported.blob);
      const sample=document.createElement('canvas');sample.width=sample.height=1;const sampleContext=sample.getContext('2d');sampleContext.drawImage(bitmap,32,32,1,1,0,0,1,1);bitmap.close();
      ensure(Array.from(sampleContext.getImageData(0,0,1,1).data).join(',')==='136,68,255,255','Export lost the image pixels');
      const {exportPSD}=await import('./ui-psd-export.mjs');s.renderVersion=-1;s.paintCanvas();
      const psd=await exportPSD(s,{selectedIds:['texture-599']}).catch(error=>{throw Error('Large PSD capture: '+error.message);});
      ensure(new TextDecoder().decode((await psd.blob.arrayBuffer()).slice(0,4))==='8BPS','PSD export did not finish');
      result.sharedLargeImagesVerified=pngs.length;result.psdExportVerified=true;
      s.fit();s.focusLayerRow('texture-599');await settle();
    }
    return result;
  });
  assert.equal(metrics.count,1000);assert.equal(metrics.parentCorrect,true);assert.equal(metrics.retainedArtwork,true);assert.deepEqual(errors,[]);
  if(!process.env.VINAGEN_RENDER_BASELINE){assert.equal(metrics.retainedRow,true);assert.deepEqual(metrics.replacementIds,['replacement']);assert.equal(metrics.sameDocumentIds.length,20);assert.equal(metrics.virtualTreeVerified,true);assert.equal(metrics.pendingExportVerified,true);assert.equal(metrics.pendingScreenCaptureVerified,true);assert.equal(metrics.sharedLargeImagesVerified,600);assert.equal(metrics.psdExportVerified,true);}
  const output=path.resolve(process.env.VINAGEN_RENDER_OUTPUT||'Builds/GraphWebVerification/UIRender/performance.json');fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify({editor:standalone?'Flowmind':'VinaGen',cpuThrottling:4,...metrics},null,2));
  await page.screenshot({path:path.join(path.dirname(output),(standalone?'flowmind':'vinagen')+'-large-preview.png')});
  console.log(JSON.stringify({editor:standalone?'Flowmind':'VinaGen',cpuThrottling:4,...metrics}));
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(async()=>{await browser?.close();await new Promise(resolve=>server.close(resolve));});
