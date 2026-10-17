// Author-only browser regression: switching modes must cut both image axes.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const {pathToFileURL} = require('node:url');
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'C:/Users/hanoi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {PNG} = require('C:/Users/hanoi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs');
const crc = require('C:/Users/hanoi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs/lib/crc');
const {deflateSync} = require('node:zlib');
// Independent PNG encoder exercises packed samples, transparency, all row
// filters and Adam7 passes; pngjs supplies the reference decoded pixels.
function encodedFixture(type, depth, interlace) {
  const width=9, height=7, channels=({0:1,2:3,3:1,4:2,6:4})[type], max=2**depth-1;
  const sample=(x,y,c)=>(x*371+y*179+c*113)%Math.min(max+1,type===3?16:65536);
  const chunk=(tag,data)=>{const out=Buffer.alloc(data.length+12);out.writeUInt32BE(data.length);out.write(tag,4);data.copy(out,8);out.writeUInt32BE(crc.crc32(out.subarray(4,-4))>>>0,out.length-4);return out;};
  const header=Buffer.alloc(13);header.writeUInt32BE(width);header.writeUInt32BE(height,4);header[8]=depth;header[9]=type;header[12]=interlace;
  const entries=[Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header)];
  if(type===3){entries.push(chunk('PLTE',Buffer.from(Array.from({length:48},(_,i)=>(i*17)%256))));entries.push(chunk('tRNS',Buffer.from([0,4,127,255])));}
  if(type===0||type===2){const transparent=Buffer.alloc(channels*2);for(let c=0;c<channels;c++)transparent.writeUInt16BE(sample(1,1,c),c*2);entries.push(chunk('tRNS',transparent));}
  const passes=interlace?[[0,0,8,8],[4,0,8,8],[0,4,4,8],[2,0,4,4],[0,2,2,4],[1,0,2,2],[0,1,1,2]]:[[0,0,1,1]],rows=[];
  const paeth=(a,b,c)=>{const p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);return pa<=pb&&pa<=pc?a:pb<=pc?b:c;};
  for(const [x0,y0,dx,dy] of passes){let previous;
    const w=Math.ceil((width-x0)/dx),stride=Math.ceil(w*channels*depth/8),bpp=Math.max(1,Math.ceil(channels*depth/8));
    for(let y=y0;y<height;y+=dy){const raw=Buffer.alloc(stride);let i=0;
      for(let x=x0;x<width;x+=dx)for(let c=0;c<channels;c++,i++){const v=sample(x,y,c);if(depth===16)raw.writeUInt16BE(v,i*2);else if(depth===8)raw[i]=v;else raw[Math.floor(i*depth/8)]|=v<<(8-depth-i*depth%8);}
      const filter=y%5,encoded=Buffer.alloc(stride+1);encoded[0]=filter;
      for(let p=0;p<stride;p++){const a=p>=bpp?raw[p-bpp]:0,b=previous?.[p]||0,c=p>=bpp?previous?.[p-bpp]||0:0;encoded[p+1]=raw[p]-(filter===1?a:filter===2?b:filter===3?Math.floor((a+b)/2):filter===4?paeth(a,b,c):0);}
      rows.push(encoded);previous=raw;
    }
  }
  entries.push(chunk('IDAT',deflateSync(Buffer.concat(rows))),chunk('IEND',Buffer.alloc(0)));
  return Buffer.concat(entries);
}
const web = path.resolve(__dirname, '../tools/designer-source');
const server = http.createServer((req, res) => {
  const name = decodeURIComponent(new URL(req.url, 'http://localhost').pathname).replace(/^\/designer\//, '') || 'index.html';
  const file = path.resolve(web, name);
  if (!file.startsWith(web + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {res.writeHead(404).end(); return;}
  res.setHeader('Content-Type', name.endsWith('.html') ? 'text/html' : name.endsWith('.css') ? 'text/css' : name.endsWith('.png') ? 'image/png' : name.endsWith('.ttf') ? 'font/ttf' : 'text/javascript');
  res.end(fs.readFileSync(file));
});
let browser;
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  browser = await chromium.launch({headless: true});
  const page = await browser.newPage({viewport: {width: 1440, height: 950}}), errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/designer/`);
  await page.locator('.ui-studio').waitFor();
  await page.evaluate(async () => {globalThis.sliceStudio = (await import('./ui-studio.mjs')).getUIStudio();});
  await page.waitForFunction(() => sliceStudio?.ready);
  await page.evaluate(async () => {
    const {workspace} = await import('./workspace.mjs'), {newDocument, newLayer} = await import('./ui-model.mjs');
    globalThis.sliceStudio = (await import('./ui-studio.mjs')).getUIStudio();
    const canvas = document.createElement('canvas'); canvas.width = 64; canvas.height = 24;
    const ctx = canvas.getContext('2d'), pixels = ctx.createImageData(64, 24);
    for (let y = 0; y < 24; y++) for (let x = 0; x < 64; x++)
      pixels.data.set([x < 8 ? 32 + x * 24 : x >= 52 ? 32 + (x - 51) * 16 : 32, y < 5 ? 32 + y * 40 : y >= 17 ? 32 + (y - 16) * 24 : 32, 200, (x < 2 || x > 61) && (y < 2 || y > 21) ? 0 : 255], 4 * (y * 64 + x));
    ctx.putImageData(pixels, 0, 0);
    const asset = await workspace.api('ui-image', {fileName: 'Slice.png', dataBase64: canvas.toDataURL().split(',')[1]});
    const layer = {...newLayer('image', 20, 20), id: 'slice', width: 140, height: 50, image: asset.image, fill: '#ffffff'};
    sliceStudio.doc = {...newDocument({width: 350, height: 250}), layers: [layer]};
    sliceStudio.selected = new Set(['slice']); sliceStudio.version++; sliceStudio.paintAll();
  });
  await page.getByLabel('Image mode', {exact: true}).selectOption('nine_slice');
  await page.waitForFunction(() => !!sliceStudio.elements.get('slice')?.querySelector('.ui-slice-grid'));
  const result = await page.evaluate(async () => {
    const s = sliceStudio, node = s.elements.get('slice').querySelector('.ui-sliced-image');
    return {borders: node._borders, pixels: [...node.querySelector('canvas').getContext('2d').getImageData(70, 25, 1, 1).data], slice: s.doc.layers[0].image.slice};
  });
  assert.deepEqual(result.borders, {width: 64, height: 24, left: 10, right: 14, top: 7, bottom: 9, analysis: 'source-rgba-v1'});
  assert.deepEqual(result.pixels, [32, 32, 200, 255]);
  const fixture = new PNG({width: 64, height: 24});
  for (let y = 0; y < 24; y++) for (let x = 0; x < 64; x++) {
    const r = x < 8 ? 32 + x * 24 : x >= 52 ? 32 + (x - 51) * 16 : 31 + x % 2;
    const g = y < 5 ? 32 + y * 40 : y >= 17 ? 32 + (y - 16) * 24 : 31 + y % 2;
    fixture.data.set([r, g, 200, x === 0 || y === 0 ? 4 : 255], 4 * (y * 64 + x));
  }
  const {detectSliceBorders} = await import(pathToFileURL(path.join(web, 'ui-slice.mjs')));
  const rawBorders = detectSliceBorders(fixture);
  const alphaResult = await page.evaluate(async dataBase64 => {
    const {workspace} = await import('./workspace.mjs');
    const asset = await workspace.api('ui-image', {fileName: 'Faint-edge.png', dataBase64});
    const info = await workspace.api('ui-slice-info', {image: asset.image});
    // Old drafts cached four zero borders after the Canvas alpha conversion.
    const layer = sliceStudio.doc.layers[0];
    layer.image = {...asset.image, slice: {width:64, height:24, left:0, right:0, top:0, bottom:0}};
    layer.imageMode = 'none'; sliceStudio.version++; sliceStudio.paintAll();
    return info;
  }, PNG.sync.write(fixture).toString('base64'));
  console.log({rawBorders, alphaResult});
  assert.deepEqual(Object.fromEntries(Object.keys(rawBorders).map(key => [key, alphaResult[key]])), rawBorders, 'Faint PNG edges must detect both axes from original RGBA, like Unity');
  await page.getByLabel('Image mode', {exact: true}).selectOption('nine_slice');
  await page.waitForFunction(() => sliceStudio.doc.layers[0].image.slice.analysis === 'source-rgba-v1' && !!sliceStudio.elements.get('slice')?.querySelector('.ui-slice-grid'));
  const repaired = await page.evaluate(async () => {
    const s = sliceStudio, layer = s.doc.layers[0], {sliceImageRects} = await import('./ui-model.mjs');
    const {workspace} = await import('./workspace.mjs');
    const saved = await workspace.unpack(await workspace.package(s.doc));
    return {borders:layer.image.slice, rects:sliceImageRects(64,24,140,50,layer.image.slice).length, saved:saved.layers[0].image.slice};
  });
  assert.equal(repaired.rects, 9);
  assert.deepEqual(repaired.borders, alphaResult);
  assert.deepEqual(repaired.saved, repaired.borders);
  for (const [width,height] of [[140,50],[119.47,43.87],[140,8],[10,8],[1,1]]) {
    const resized = await page.evaluate(async ({width,height}) => {
      const s=sliceStudio, layer=s.doc.layers[0];
      s.edit(()=>{layer.width=width;layer.height=height;});await s.whenCanvasReady();
      const {sliceImageRects}=await import('./ui-model.mjs');
      const rects=sliceImageRects(64,24,width,height,layer.image.slice);
      const exported=await s.renderSliceImages(s.doc);
      const source=new Image();source.src='data:image/png;base64,'+exported[layer.id].dataBase64;await source.decode();
      const preview=s.elements.get(layer.id).querySelector('.ui-slice-grid'), canvas=document.createElement('canvas');
      canvas.width=source.naturalWidth;canvas.height=source.naturalHeight;canvas.getContext('2d').drawImage(source,0,0);
      const actual=preview.getContext('2d').getImageData(0,0,preview.width,preview.height).data;
      const expected=canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data;
      return {rects:rects.length,area:rects.reduce((sum,r)=>sum+r[6]*r[7],0),pixelsMatch:actual.length===expected.length&&actual.every((v,i)=>v===expected[i])};
    },{width,height});
    assert.ok(Math.abs(resized.area-width*height)<1e-7);
    assert.equal(resized.rects,width<24&&height<16?4:height<16?6:9);
    assert.equal(resized.pixelsMatch,true,`Preview/export match at ${width} × ${height}`);
  }
  const authored = await page.evaluate(async () => {
    const {workspace}=await import('./workspace.mjs'), image=sliceStudio.doc.layers[0].image;
    return workspace.api('ui-slice-info',{image:{...image,slice:{width:64,height:24,left:6,right:12,top:0,bottom:0}}});
  });
  assert.deepEqual(authored,{width:64,height:24,left:6,right:12,top:7,bottom:9,analysis:'source-rgba-v1'});
  const sourceCheck = await page.evaluate(async dataBase64 => {
    const {sourcePixels} = await import('./ui-slice-source.mjs');
    const bytes = Uint8Array.from(atob(dataBase64), c => c.charCodeAt(0));
    return [...(await sourcePixels(new Blob([bytes]))).data];
  }, PNG.sync.write(fixture).toString('base64'));
  assert.deepEqual(sourceCheck, [...fixture.data]);
  let formats=0;
  for (const [type, depths] of [[0,[1,2,4,8,16]],[2,[8,16]],[3,[1,2,4,8]],[4,[8,16]],[6,[8,16]]]) for (const depth of depths) for (const interlace of [0,1]) {
    const encoded=encodedFixture(type,depth,interlace), reference=PNG.sync.read(encoded);
    const actual=await page.evaluate(async base64=>{
      const {sourcePixels}=await import('./ui-slice-source.mjs');
      const pixels=await sourcePixels(new Blob([Uint8Array.from(atob(base64),c=>c.charCodeAt(0))]));
      // RGB is immaterial for fully transparent pixels, like Unity Auto9Slicer.
      for(let i=0;i<pixels.data.length;i+=4)if(!pixels.data[i+3])pixels.data.fill(0,i,i+3);
      return [...pixels.data];
    },encoded.toString('base64'));
    for(let i=0;i<reference.data.length;i+=4)if(!reference.data[i+3])reference.data.fill(0,i,i+3);
    assert.deepEqual(actual,[...reference.data],`PNG type ${type}, depth ${depth}, interlace ${interlace}`); formats++;
  }
  console.log(`Verified ${formats} PNG formats against pngjs.`);
  const privateInput=process.argv[2], privateFolder=privateInput&&(fs.statSync(privateInput).isDirectory()?privateInput:path.dirname(privateInput));let artwork=0;
  const privateNames=!privateInput?[]:fs.statSync(privateInput).isDirectory()?fs.readdirSync(privateInput).filter(name=>/\.png$/i.test(name)):[path.basename(privateInput)];
  for(const name of privateNames){
    const bytes=fs.readFileSync(path.join(privateFolder,name)), png=PNG.sync.read(bytes), expected=detectSliceBorders(png);
    const actual=await page.evaluate(async dataBase64=>{
      const {workspace}=await import('./workspace.mjs');
      const asset=await workspace.api('ui-image',{fileName:'Verification.png',dataBase64});
      return workspace.api('ui-slice-info',{image:asset.image});
    },bytes.toString('base64'));
    assert.deepEqual(Object.fromEntries(Object.keys(expected).map(key=>[key,actual[key]])),expected,`Original PNG profiles: ${name}`);artwork++;
    if(/^Btn_green\.png$/i.test(name)){
      const legacy=await page.evaluate(async ({dataBase64,width,height})=>{
        const {workspace,resourceURL}=await import('./workspace.mjs'),{newDocument,newLayer}=await import('./ui-model.mjs'),{detectSliceBorders}=await import('./ui-slice.mjs');
        const asset=await workspace.api('ui-image',{fileName:'Btn_green.png',dataBase64}),source=new Image();source.src=resourceURL(asset.image.guid);await source.decode();
        const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;const context=canvas.getContext('2d');context.drawImage(source,0,0);
        const legacy=detectSliceBorders(context.getImageData(0,0,width,height));
        const s=sliceStudio,layer={...newLayer('image',20,20),id:'btn-green',name:'Btn_green',width:width*1.5,height:height*1.5,image:{...asset.image,slice:{width,height,left:0,right:0,top:0,bottom:0}},imageMode:'none',fill:'#ffffff'};
        s.doc={...newDocument({width:1000,height:700}),layers:[layer]};s.selected=new Set([layer.id]);s.zoom=1;s.autoFit=false;s.pan={x:20,y:20};s.version++;s.paintAll();
        return legacy;
      },{dataBase64:bytes.toString('base64'),width:png.width,height:png.height});
      await page.getByLabel('Image mode',{exact:true}).selectOption('nine_slice');
      await page.waitForFunction(()=>sliceStudio.doc.layers[0].image.slice.analysis==='source-rgba-v1'&&!!sliceStudio.elements.get('btn-green')?.querySelector('.ui-slice-grid'));
      const button=await page.evaluate(async ()=>{
        const s=sliceStudio,layer=s.doc.layers[0],node=s.elements.get(layer.id).querySelector('.ui-sliced-image'),{sliceImageRects}=await import('./ui-model.mjs');
        const rects=sliceImageRects(node._sourceSize.width,node._sourceSize.height,layer.width,layer.height,node._borders);
        const exported=await s.renderSliceImages(s.doc),image=new Image();image.src='data:image/png;base64,'+exported[layer.id].dataBase64;await image.decode();
        const canvas=document.createElement('canvas');canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;canvas.getContext('2d').drawImage(image,0,0);
        const pixels=node.querySelector('canvas').getContext('2d').getImageData(0,0,canvas.width,canvas.height).data,reference=canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data;
        return {borders:node._borders,rects:rects.length,previewMatchesExport:pixels.every((v,i)=>v===reference[i])};
      });
      assert.deepEqual(Object.fromEntries(Object.keys(expected).map(key=>[key,button.borders[key]])),expected,'Btn_green UI cuts match original profiles');
      assert.equal(button.rects,9,'Btn_green preserves both axes and four corners');assert.equal(button.previewMatchesExport,true);
      console.log(JSON.stringify({image:name,source:[png.width,png.height],canvasBorders:legacy,originalBorders:expected,...button},null,2));
      if(process.env.SLICE_SCREENSHOT){fs.mkdirSync(path.dirname(process.env.SLICE_SCREENSHOT),{recursive:true});await page.locator('[data-layer-id="btn-green"]').screenshot({path:process.env.SLICE_SCREENSHOT});}
    }
  }
  if(artwork)console.log(`Verified ${artwork} private PNG images without bundling fixtures.`);
  assert.deepEqual(errors, []);
  console.log(JSON.stringify(result, null, 2));
})().catch(error => {console.error(error); process.exitCode = 1;}).finally(async () => {await browser?.close(); server.close();});
