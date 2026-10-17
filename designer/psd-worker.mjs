import {psdTextGeometry} from './psd-text-geometry.mjs';
import {cacheKey,fileCacheKey,projectCache,blobBase64,cachedBlob} from './ui-project-cache.mjs';
import {readPSD,readPSDFile,preparePSDImport,decodeChannel,solidPixelColor,isStreamedPSDRaster} from './psd-reader.mjs';
import {paintPSDRaster} from './psd-raster-effects.mjs';
import {streamPSDTiles,PSD_TILE_SIZE} from './psd-stream.mjs';
let document,index=0,byId,source,tiled,channelCache,total=0,fileKey,paintCacheKey;
async function paintHash(png){
  if(!globalThis.crypto?.subtle)return undefined;
  const hash=new Uint8Array(await crypto.subtle.digest('SHA-256',await png.arrayBuffer()));return Array.from(hash,b=>b.toString(16).padStart(2,'0')).join('');
}
function emitPaint(layer,png,paintKey,cacheHit=false,resource){
  postMessage({type:'layer',layer,png,paintKey,cacheHit,...(resource?{resource}:{})});
}
async function postPaint(layer,png,rasterBounds,blendPaints=[],textBounds,resource){
  if(blendPaints.length){
    // A Multiply/Screen glow cannot be flattened against transparency without
    // changing its colors. Fuse its ordered paints into ONE PNG atlas and ONE
    // document image, retaining their backdrop operations as source rectangles.
    const origin={x:layer.x-(rasterBounds?.x||0),y:layer.y-(rasterBounds?.y||0)};
    const paints=[...blendPaints.map(effect=>({...effect,x:origin.x+effect.bounds.x,y:origin.y+effect.bounds.y})),
      {png,x:layer.x,y:layer.y,width:layer.width,height:layer.height,blendMode:layer.blendMode||'normal'}];
    const x=Math.min(...paints.map(p=>p.x)),y=Math.min(...paints.map(p=>p.y));
    const width=Math.max(...paints.map(p=>p.x+p.width))-x,height=Math.max(...paints.map(p=>p.y+p.height))-y;
    const count=paints.length,pad=2,vertical=height*count+pad*(count-1)<=8192;
    const atlasWidth=vertical?width:width*count+pad*(count-1),atlasHeight=vertical?height*count+pad*(count-1):height;
    if(atlasWidth>8192||atlasHeight>8192||atlasWidth*atlasHeight>16777216)throw Error('Fused PSD artwork exceeds 8192 pixels per side or 16 megapixels. Reduce this layer and its effects.');
    const atlas=new OffscreenCanvas(atlasWidth,atlasHeight),context=atlas.getContext('2d'),frames=[];
    try{
      for(let i=0;i<count;i++){
        const paint=paints[i],left=vertical?0:i*(width+pad),top=vertical?i*(height+pad):0,bitmap=await createImageBitmap(paint.png);
        try{context.drawImage(bitmap,paint.x-x+left,paint.y-y+top,paint.width,paint.height);}finally{bitmap.close();}
        frames.push({x:left,y:top,width,height,blendMode:paint.blendMode});
      }
      png=await atlas.convertToBlob({type:'image/png'});
    }finally{atlas.width=atlas.height=1;}
    if(png.size>5*1024*1024)throw Error('Fused PSD image exceeds the 5 MB PNG limit. Reduce this layer and its effects.');
    layer={...layer,x,y,width,height,imageMode:'none',blendMode:'normal',imageComposite:{width,height,atlasWidth,atlasHeight,paints:frames}};
    rasterBounds={x:x-origin.x,y:y-origin.y,width,height};
  }
  // Hash off the UI thread. Identical encoded artwork shares one upload even
  // when different branches reach it at the same time.
  const paintKey=await paintHash(png);
  if(paintCacheKey&&!tiled)await projectCache('psd-paint',paintCacheKey,{layer,png:await blobBase64(png),paintKey,rasterBounds,textBounds,resource,warnings:[...new Set(document.warnings)]});
  emitPaint(layer,png,paintKey,false,resource);
}
async function nextTile(){
  if(tiled.stream){
    const result=await tiled.stream.next();
    if(result.done){tiled=null;await next();return;}
    const {x,y,width,height,png}=result.value,layer=tiled.layer;
    await postPaint({id:layer.id+'-tile-'+x+'-'+y,parentId:layer.id,name:layer.name+' ('+x+', '+y+')',role:'image',x,y,width,height,opacity:1,visible:true,fill:'#ffffff'},png);return;
  }
  const {canvas,layer,x,y}=tiled,width=Math.min(1024,canvas.width-x),height=Math.min(1024,canvas.height-y),tile=new OffscreenCanvas(width,height);
  tile.getContext('2d').drawImage(canvas,x,y,width,height,0,0,width,height);
  const png=await tile.convertToBlob({type:'image/png'});tile.width=tile.height=1;
  await postPaint({id:layer.id+'-tile-'+x+'-'+y,parentId:layer.id,name:layer.name+' ('+x+', '+y+')',role:'image',x,y,width,height,opacity:1,visible:true,fill:'#ffffff'},png);
  tiled.x+=1024;if(tiled.x>=canvas.width){tiled.x=0;tiled.y+=1024;}if(tiled.y>=canvas.height){canvas.width=canvas.height=1;tiled=null;}
}
const channelBytes=async channel=>channel.bytes||(channelCache&&channel.offset>=channelCache.offset&&channel.offset+channel.length<=channelCache.offset+channelCache.bytes.length?channelCache.bytes.subarray(channel.offset-channelCache.offset,channel.offset-channelCache.offset+channel.length):new Uint8Array(await source.slice(channel.offset,channel.offset+channel.length).arrayBuffer()));
async function next() {
  if(tiled){await nextTile();return;}
  while(index<document.records.length) {
    let record=document.records[index++];
    postMessage({type:'progress',stage:'layer',name:record.name,index,total});
    if(!record.width||!record.height){if(!record.section)continue;}
    const group=record.section===1||record.section===2;
    const parent=byId.get(record.parentId);
    const layer={id:record.id,parentId:record.parentId,name:record.name,role:group?'empty':'image',x:record.x-(parent?.x||0),y:record.y-(parent?.y||0),width:record.width,height:record.height,opacity:record.opacity,visible:record.visible,blendMode:record.blendMode,fill:record.fill||(group?'#ffffff00':'#ffffff'),...(record.screen?{canvasRoot:true,anchor:'stretch'}:{}),...(record.artboard?{clip:true}:{}),...record.text};
    const textBox=layer.psdTextBox;delete layer.psdTextBox;delete layer.psdTextPaint;
    if(textBox)Object.assign(layer,{x:textBox.x-(parent?.x||0),y:textBox.y-(parent?.y||0),width:textBox.width,height:textBox.height,rotation:textBox.rotation,fill:'#ffffff00'});
    // Editable text never enters bitmap encoding, paint caches or tile export.
    if(record.text){
      Object.assign(layer,{role:'text',textRenderer:'vinaGenText',textMeshPro:true,standaloneText:true,fill:'#ffffff00'});
      delete layer.image;delete layer.sourceTextPaint;
      // Recover rotated glyph bounds from alpha only; never encode/upload paint.
      const alphaChannel=record.channels.find(c=>c.id===-1);
      if(!textBox&&layer.rotation&&alphaChannel&&!isStreamedPSDRaster(record)){
        channelCache=null;
        const alpha=await decodeChannel(await channelBytes(alphaChannel),record.width,record.height);
        const pixels=new Uint8ClampedArray(alpha.length*4);
        for(let p=0;p<alpha.length;p++)pixels[p*4+3]=alpha[p];
        const box=psdTextGeometry(pixels,record,layer.rotation);
        if(box)Object.assign(layer,{x:box.x-(parent?.x||0),y:box.y-(parent?.y||0),width:box.width,height:box.height});
      }
      postMessage({type:'layer',layer});return;
    }
    if(group){postMessage({type:'layer',layer});return;}
    if(record.fill){postMessage({type:'layer',layer});return;}
    if(isStreamedPSDRaster(record)){
      if(!record.channels.some(c=>c.id===0))continue;
      const count=Math.ceil(record.width/PSD_TILE_SIZE)*Math.ceil(record.height/PSD_TILE_SIZE);total+=count;
      if(total>1000)throw Error('PSD raster tiles exceed the 1000-object document limit. Split the PSD into fewer screens.');
      if(record.textEffects||record.textGroupEffects?.length||record.rasterEffects)document.warnings.push('Oversized tiled Photoshop layer effects are not baked; review their appearance.');
      Object.assign(layer,{role:'empty',x:record.x-(parent?.x||0),y:record.y-(parent?.y||0),width:record.width,height:record.height,rotation:0,text:'',fill:'#ffffff00'});
      tiled={layer,stream:streamPSDTiles(source,record,progress=>postMessage({type:'progress',stage:'raster',name:record.name,index,total,...progress}))};
      postMessage({type:'progress',stage:'layer',name:record.name,index,total});postMessage({type:'layer',layer});return;
    }
    paintCacheKey=fileKey?await cacheKey('psd-paint-v14:'+fileKey+':'+record.id):null;
    const cached=paintCacheKey?await projectCache('psd-paint',paintCacheKey):null;
    if(cached?.png&&cached.layer?.id===layer.id){try{
      const png=cachedBlob(cached.png);document.warnings.push(...(cached.warnings||[]));
      // Paint is reusable, but parent-local geometry belongs to the current plan.
      // In particular, authored artboards change the root's origin and clipping.
      const current={...cached.layer,...layer};if(cached.layer.sourceTextPaint)current.sourceTextPaint=cached.layer.sourceTextPaint;
      if(cached.layer.imageComposite)Object.assign(current,{imageComposite:cached.layer.imageComposite,imageMode:'none',blendMode:'normal'});
      if(cached.rasterBounds)Object.assign(current,{x:layer.x+cached.rasterBounds.x,y:layer.y+cached.rasterBounds.y,width:cached.rasterBounds.width,height:cached.rasterBounds.height});
      if(cached.textBounds)Object.assign(current,{x:layer.x+cached.textBounds.x,y:layer.y+cached.textBounds.y,width:cached.textBounds.width,height:cached.textBounds.height});
      emitPaint(current,png,cached.paintKey,true,cached.resource);return;
    }catch{}}
    // The PSD source UUID identifies scaled instances before any PNG upload.
    // Decode its largest safe raster; the layer keeps its own display rectangle.
    const resource=record.rasterSource?{id:record.rasterSource.id,name:record.rasterSource.name}:record.placedSource?{id:record.id,name:record.name}:undefined;
    if(record.rasterSource)record={...record,width:record.rasterSource.width,height:record.rasterSource.height,channels:record.rasterSource.channels};
    // Read adjacent compressed channels together, bounded to one layer. Avoid
    // four or five Blob/OS reads per raster without loading the whole PSD.
    channelCache=null;
    const channels=record.channels.filter(c=>[-2,-1,0,1,2].includes(c.id));
    for(const c of channels){const w=c.id===-2?record.mask?.width:record.width,h=c.id===-2?record.mask?.height:record.height;if(w&&h&&c.length>w*h*2+h*2+65536)throw Error('PSD channel payload exceeds its pixel bounds.');}
    if(source&&channels.length){const start=channels[0].offset,end=channels.at(-1).offset+channels.at(-1).length;if(end-start<=64*1024*1024)channelCache={offset:start,bytes:new Uint8Array(await source.slice(start,end).arrayBuffer())};}
    const size=record.width*record.height,pixels=new Uint8ClampedArray(size*4);for(let p=0;p<size;p++)pixels[p*4+3]=255;
    for(const channel of record.channels){if(![-1,0,1,2].includes(channel.id))continue;const decoded=await decodeChannel(await channelBytes(channel),record.width,record.height),component=channel.id===-1?3:channel.id;for(let p=0;p<size;p++)pixels[p*4+component]=decoded[p];}
    const mask=record.mask,maskChannel=record.channels.find(c=>c.id===-2);
    if(mask&&!(mask.flags&2)&&maskChannel&&mask.width&&mask.height){
      const alpha=await decodeChannel(await channelBytes(maskChannel),mask.width,mask.height),mx=mask.x+((mask.flags&1)?record.x:0),my=mask.y+((mask.flags&1)?record.y:0);
      for(let y=0;y<record.height;y++)for(let x=0;x<record.width;x++){const sx=record.x+x-mx,sy=record.y+y-my;let a=sx>=0&&sy>=0&&sx<mask.width&&sy<mask.height?alpha[sy*mask.width+sx]:mask.defaultColor;if(mask.flags&4)a=255-a;const p=(y*record.width+x)*4+3;pixels[p]=Math.round(pixels[p]*a/255);}
    }
    channelCache=null;
    if(!record.channels.some(c=>c.id===0))continue;
    let nonempty=false;for(let p=3;p<pixels.length;p+=4)if(pixels[p]){nonempty=true;break;}if(!nonempty){total--;continue;}
    const solid=solidPixelColor(pixels);
    if(solid&&!record.rasterEffects){layer.fill=solid;postMessage({type:'layer',layer});return;}
    const effects=record.rasterEffects;
    let effectPaint=effects?paintPSDRaster(pixels,record.width,record.height,effects,document.warnings,{x:record.x,y:record.y,width:document.sourceWidth||document.width,height:document.sourceHeight||document.height,separateBlendEffects:true}):null;
    if(record.rasterEffects?.masterFXSwitch!==false&&['ChFX','patternFill'].some(key=>record.rasterEffects?.[key]?.enab))document.warnings.push('Raster layer '+record.name+' has Photoshop satin or pattern effects that need visual review.');
    if(effectPaint?.useRenderer)effectPaint=null;
    const rasterBounds=effectPaint?.bounds;
    if(rasterBounds)Object.assign(layer,{x:layer.x+rasterBounds.x,y:layer.y+rasterBounds.y,width:rasterBounds.width,height:rasterBounds.height});
    let canvas=new OffscreenCanvas(effectPaint?.width||record.width,effectPaint?.height||record.height);canvas.getContext('2d').putImageData(new ImageData(effectPaint?.pixels||pixels,canvas.width,canvas.height),0,0);
    const png=await canvas.convertToBlob({type:'image/png'});
    if(png.size>5*1024*1024){const count=Math.ceil(canvas.width/1024)*Math.ceil(canvas.height/1024);total+=count;if(total>1000){canvas.width=canvas.height=1;throw Error('PSD raster tiles exceed the 1000-object import limit.');}tiled={canvas,layer,x:0,y:0};postMessage({type:'progress',stage:'layer',name:record.name,index,total});postMessage({type:'layer',layer:{...layer,fill:'#ffffff00'}});return;}
    const blendPaints=[];
    for(const effect of effectPaint?.blendPaints||[]){const effectCanvas=new OffscreenCanvas(effect.width,effect.height);effectCanvas.getContext('2d').putImageData(new ImageData(effect.pixels,effect.width,effect.height),0,0);blendPaints.push({name:effect.name,blendMode:effect.blendMode,bounds:effect.bounds,width:effect.width,height:effect.height,png:await effectCanvas.convertToBlob({type:'image/png'})});effectCanvas.width=effectCanvas.height=1;}
    canvas.width=canvas.height=1;await postPaint(layer,png,rasterBounds,blendPaints,undefined,resource);return;
  }
  postMessage({type:'done',warnings:document.warnings});document=null;byId=null;source=null;tiled=null;channelCache=null;
}
// Credits may arrive together; serialize each branch's decoder state (tiles,
// channel cache and cursor), while independent branch workers run in parallel.
let requests=Promise.resolve();
self.onmessage=event=>{requests=requests.then(async()=>{try {
  if(event.data.type==='branch'){source=event.data.file;fileKey=event.data.fileKey;document=event.data.document;byId=new Map([...(document.parents||[]),...document.records].map(r=>[r.id,r]));index=0;total=document.records.length;}
  else if(event.data.type==='read'){
    source=event.data.file||null;fileKey=source?await fileCacheKey(source,progress=>postMessage({type:'progress',stage:'hash',...progress})):null;
    const key=fileKey?await cacheKey('psd-plan-v9:'+fileKey):null,cached=key?await projectCache('psd-plan',key):null;
    document=cached?.document;
    if(!document){document=source?await readPSDFile(source,progress=>postMessage({type:'progress',...progress})):readPSD(event.data.bytes);document=preparePSDImport(document);if(key)await projectCache('psd-plan',key,{document});}
    if(event.data.plan){postMessage({type:'plan',document,fileKey});document=null;source=null;return;}
    byId=new Map(document.records.map(r=>[r.id,r]));index=0;total=document.records.length;postMessage({type:'header',width:document.width,height:document.height,total,sourceBytesRead:document.sourceBytesRead,fonts:[...new Set(document.records.map(r=>r.text?.psdFontName).filter(Boolean))]});
  }else if(event.data.type==='next'&&document)await next();
}catch(error){postMessage({error:error.message});document=null;byId=null;source=null;tiled=null;channelCache=null;}});};
