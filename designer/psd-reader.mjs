// Bounded PSD v1 reader based on Adobe's published file format specification.
// No provider, executable, CDN, or third-party artwork is bundled.
import {readTypeTool,readLayerEffects,readPSDArtboard,readPSDPlacedSource,photoshopText,inheritPSDTextGroupEffects} from './psd-text.mjs';
const blendNames={norm:'normal',pass:'pass-through','mul ':'multiply',scrn:'screen',over:'overlay',dark:'darken',lite:'lighten','div ':'color-dodge',idiv:'color-burn',hLit:'hard-light',sLit:'soft-light',diff:'difference',smud:'exclusion','hue ':'hue','sat ':'saturation',colr:'color','lum ':'luminosity'};
// Compatibility export: file size is bounded by the file API, not a product cap.
export const PSD_MAX_SOURCE_BYTES=Infinity;
export const PSD_MAX_DIMENSION=30000;
export function validatePSDSourceSize(size) {
  if(!Number.isSafeInteger(size)||size<26)throw Error('Truncated or invalid PSD file size.');
}
export function isStreamedPSDRaster(record) {
  // Folder bounds may span many screens, but folders allocate no bitmap.
  const large=rect=>rect&&(rect.width>8192||rect.height>8192||rect.width*rect.height>16777216);
  return !record.section&&!record.fill&&record.channels.some(c=>c.id===0)&&!!(large(record)||large(record.mask));
}
export function solidPixelColor(pixels) {
  if(!pixels.length||pixels.length%4)return null;
  if(pixels.byteOffset%4===0){const words=new Uint32Array(pixels.buffer,pixels.byteOffset,pixels.length/4),first=words[0];for(let i=1;i<words.length;i++)if(words[i]!==first)return null;}
  else for(let i=4;i<pixels.length;i++)if(pixels[i]!==pixels[i%4])return null;
  return '#'+Array.from(pixels.subarray(0,4),value=>value.toString(16).padStart(2,'0')).join('');
}
class Reader {
  constructor(bytes){this.bytes=bytes instanceof Uint8Array?bytes:new Uint8Array(bytes);this.view=new DataView(this.bytes.buffer,this.bytes.byteOffset,this.bytes.byteLength);this.offset=0;this.limit=this.bytes.length;}
  need(n){if(!Number.isSafeInteger(n)||n<0||this.offset+n>this.limit)throw Error('Truncated or invalid PSD data.');}
  u8(){this.need(1);return this.bytes[this.offset++];}
  u16(){this.need(2);const n=this.view.getUint16(this.offset);this.offset+=2;return n;}
  i16(){this.need(2);const n=this.view.getInt16(this.offset);this.offset+=2;return n;}
  u32(){this.need(4);const n=this.view.getUint32(this.offset);this.offset+=4;return n;}
  i32(){this.need(4);const n=this.view.getInt32(this.offset);this.offset+=4;return n;}
  skip(n){this.need(n);this.offset+=n;}
  text(n){this.need(n);const s=String.fromCharCode(...this.bytes.subarray(this.offset,this.offset+n));this.offset+=n;return s;}
  section(){const n=this.u32();this.need(n);return this.offset+n;}
}
// One parser serves in-memory callers and file-backed workers. It yields only
// metadata ranges; channel payloads remain file offsets until a layer needs them.
function* parsePSD(size) {
  let offset=0,limit=size;
  const need=n=>{if(!Number.isSafeInteger(n)||n<0||offset+n>limit)throw Error('Truncated or invalid PSD data.');};
  function* take(n){need(n);const start=offset;offset+=n;return new Reader(yield {offset:start,length:n});}
  function* section(){const r=yield* take(4),n=r.u32();need(n);return offset+n;}
  let r=yield* take(26);
  if(r.text(4)!=='8BPS'||r.u16()!==1)throw Error('Only Photoshop PSD v1 is supported; PSB is not supported.');
  r.skip(6);const channels=r.u16(),height=r.u32(),width=r.u32(),depth=r.u16(),mode=r.u16();
  if(depth!==8||mode!==3||channels<3||channels>56)throw Error('Export the PSD in 8-bit RGB mode.');
  if(!width||!height||width>PSD_MAX_DIMENSION||height>PSD_MAX_DIMENSION)throw Error('PSD v1 dimensions must be 1–30000 pixels. Larger Photoshop documents use PSB.');
  offset=yield* section();offset=yield* section();const layerMaskEnd=yield* section();
  if(layerMaskEnd===offset)throw Error('PSD has no editable layers.');
  limit=layerMaskEnd;const layerEnd=yield* section();limit=layerEnd;r=yield* take(2);const count=Math.abs(r.i16());
  if(count>1000)throw Error('PSD supports up to 1000 layers.');
  const records=[],warnings=new Set();
  for(let index=0;index<count;index++) {
    r=yield* take(18);const top=r.i32(),left=r.i32(),bottom=r.i32(),right=r.i32(),channelCount=r.u16();
    if(channelCount>56)throw Error('Invalid PSD channel count.');
    r=yield* take(channelCount*6+16);
    const channelInfo=[];for(let c=0;c<channelCount;c++)channelInfo.push({id:r.i16(),length:r.u32()});
    if(r.text(4)!=='8BIM')throw Error('Invalid PSD layer signature.');
    let blend=r.text(4);const opacity=r.u8()/255;r.skip(1);const flags=r.u8();r.skip(1);const extraLength=r.u32();need(extraLength);const extraEnd=offset+extraLength;limit=extraEnd;
    r=yield* take(4);const maskLength=r.u32();need(maskLength);const maskEnd=offset+maskLength;let mask=null;
    if(maskLength>=18){r=yield* take(18);const top=r.i32(),left=r.i32(),bottom=r.i32(),right=r.i32(),defaultColor=r.u8(),flags=r.u8();mask={x:left,y:top,width:right-left,height:bottom-top,defaultColor,flags};if(mask.width<0||mask.height<0||mask.width>PSD_MAX_DIMENSION||mask.height>PSD_MAX_DIMENSION)throw Error('Invalid PSD mask dimensions.');}
    if(maskLength)warnings.add('Feathered and vector masks need visual review.');offset=maskEnd;offset=yield* section();
    r=yield* take(1);const nameLength=r.u8();r=yield* take(nameLength);let name=r.text(nameLength);const padding=(4-(nameLength+1)%4)%4;need(padding);offset+=padding;let sectionType=0,type=null,effects=null,artboard=null,placedSource=null,vectorMask=false,rasterEffects=false;
    while(offset+12<=extraEnd) {
      r=yield* take(12);const signature=r.text(4);if(signature!=='8BIM'&&signature!=='8B64')break;
      const key=r.text(4),length=r.u32(),end=offset+length;need(length);
      if(key==='luni'){r=yield* take(4);const n=r.u32();if(n>4096||4+n*2>length)throw Error('Invalid PSD layer name.');r=yield* take(n*2);let text='';for(let c=0;c<n;c++)text+=String.fromCharCode(r.u16());name=text;}
      if(key==='lsct'||key==='lsdk'){if(length<4)throw Error('Invalid PSD layer section.');r=yield* take(4);sectionType=r.u32();if(length>=12){r=yield* take(8);if(r.text(4)==='8BIM')blend=r.text(4);}}
      if(['artb','artd','abdd'].includes(key)){
        if(length>16*1024*1024)throw Error('PSD artboard metadata exceeds 16 MB per layer.');
        r=yield* take(length);try{artboard=readPSDArtboard(r.bytes)||artboard;}catch{warnings.add('Unsupported Photoshop artboard data; using layer bounds.');}
      }
      if(key==='TySh'||key==='lfx2'||key==='lmfx'||key==='lfxs'){
        if(length>16*1024*1024)throw Error('PSD text/effect metadata exceeds 16 MB per layer.');
        r=yield* take(length);
        if(key==='TySh'){try{type=readTypeTool(r.bytes);}catch(error){throw Error(name+': '+error.message);}}
        else{try{effects=readLayerEffects(r.bytes);}catch{warnings.add('Unsupported layer effects need visual review.');}}
      }
      if(['lfx2','lmfx','lfxs','lrFX'].includes(key))rasterEffects=true;
      if(key==='SoLd'||key==='SoLE'){
        if(length>16*1024*1024)throw Error('PSD placed layer metadata exceeds 16 MB.');
        r=yield* take(length);try{placedSource=readPSDPlacedSource(r.bytes);}catch{warnings.add('Unsupported smart object metadata retains its own raster.');}
      }
      if(key==='vmsk'||key==='vsms')vectorMask=true;
      if(['vmsk','SoLd'].includes(key))warnings.add('Vector masks and smart objects are raster imports; review their appearance.');
      offset=end+(length%2);
    }
    if(offset>extraEnd)throw Error('Invalid PSD layer metadata.');offset=extraEnd;limit=layerEnd;
    const w=right-left,h=bottom-top;
    if(w<0||h<0||w>PSD_MAX_DIMENSION||h>PSD_MAX_DIMENSION)throw Error('Invalid PSD layer dimensions.');
    if(!blendNames[blend])warnings.add('Unsupported Photoshop blend mode '+blend+' uses normal blending; review its appearance.');
    const text=type?photoshopText(type,effects,warnings,{x:left,y:top,width:w||1,height:h||1,documentWidth:width,documentHeight:height}):null;
    records.push({index,name:name||'Layer '+(index+1),x:left,y:top,width:w,height:h,opacity,visible:!(flags&2),blendMode:blendNames[blend]||'normal',section:sectionType,text,...(artboard?{artboard}:{}),...(placedSource?{placedSource}:{}),...(vectorMask?{vectorMask:true}:{}),...(text&&effects&&!text.psdTextBox?{textEffects:effects}:{}),...(!text&&!sectionType&&effects?{rasterEffects:effects}:{}),...(sectionType&&effects?{groupEffects:effects}:{}),mask,channels:channelInfo});
  }
  // Total decoded area is deliberately unrestricted: only one layer is decoded
  // at a time. A compressed, many-layer file need not fit in RAM as one bitmap.
  for(const record of records)for(const channel of record.channels){need(channel.length);channel.offset=offset;offset+=channel.length;}
  const firstSection=records.find(l=>l.section);
  const order=firstSection?.section===3?[...records].reverse():records;
  const stack=[];
  for(const record of order){if(record.section===3){stack.pop();continue;}record.id='psd-'+record.index;record.parentId=stack.at(-1)||'';if(record.section===1||record.section===2)stack.push(record.id);}
  const paintOrder=firstSection?.section===3?records:[...records].reverse();
  const children=new Map();for(const record of paintOrder){if(record.section===3)continue;const list=children.get(record.parentId)||[];list.push(record);children.set(record.parentId,list);}
  const ordered=[];
  const visit=record=>{
    ordered.push(record);const nested=children.get(record.id)||[];for(const child of nested)visit(child);
    if(record.section){if(record.artboard)Object.assign(record,{x:record.artboard.x,y:record.artboard.y,width:record.artboard.width,height:record.artboard.height});else{const bounds=nested.filter(c=>c.width&&c.height);if(bounds.length){record.x=Math.min(...bounds.map(c=>c.x));record.y=Math.min(...bounds.map(c=>c.y));record.width=Math.max(...bounds.map(c=>c.x+c.width))-record.x;record.height=Math.max(...bounds.map(c=>c.y+c.height))-record.y;}else{record.width=record.height=1;}}}
  };
  for(const record of children.get('')||[])visit(record);
  inheritPSDTextGroupEffects(ordered,warnings);
  return {width,height,sourceWidth:width,sourceHeight:height,records:ordered,warnings:[...warnings]};
}
export function readPSD(bytes) {
  validatePSDSourceSize(bytes.byteLength);
  const source=new Uint8Array(bytes),parser=parsePSD(source.length);let step=parser.next();
  while(!step.done){const {offset,length}=step.value;step=parser.next(source.subarray(offset,offset+length));}
  for(const record of step.value.records)for(const channel of record.channels)channel.bytes=source.subarray(channel.offset,channel.offset+channel.length);
  return step.value;
}
export async function readPSDFile(file,onProgress=()=>{}) {
  validatePSDSourceSize(file.size);
  const parser=parsePSD(file.size);let step=parser.next(),cache=new Uint8Array(),cacheOffset=0,readBytes=0,lastProgress=0;
  while(!step.done){
    const {offset,length}=step.value;
    if(offset<cacheOffset||offset+length>cacheOffset+cache.length){
      cacheOffset=offset;cache=new Uint8Array(await file.slice(offset,Math.min(file.size,offset+Math.max(length,64*1024))).arrayBuffer());readBytes+=cache.length;
      const now=performance.now();if(now-lastProgress>100){lastProgress=now;onProgress({stage:'metadata',readBytes,sourceBytes:file.size});}
    }
    step=parser.next(cache.subarray(offset-cacheOffset,offset-cacheOffset+length));
  }
  onProgress({stage:'metadata',readBytes,sourceBytes:file.size});
  return {...step.value,sourceBytesRead:readBytes};
}
// Detect screen containers without discarding authored folders or their compositing.
export function preparePSDImport(doc) {
  const byId=new Map(doc.records.map(r=>[r.id,r])),children=new Map();
  for(const r of doc.records){const list=children.get(r.parentId)||[];list.push(r);children.set(r.parentId,list);}
  const content=r=>r.text?!!r.text.text?.trim():!r.section&&r.width>0&&r.height>0&&r.channels.some(c=>c.id===0);
  const leaves=new Map(),states=new Map();
  for(const r of doc.records){const parent=states.get(r.parentId);states.set(r.id,{visible:r.visible&&(!parent||parent.visible),opacity:r.opacity*(parent?.opacity??1)});}
  const collect=r=>{const nested=r.section?(children.get(r.id)||[]).flatMap(collect):content(r)?[r]:[];leaves.set(r.id,nested);return nested;};
  for(const r of children.get('')||[])collect(r);
  const bounds=items=>{if(!items.length)return null;const x=Math.min(...items.map(r=>r.x)),y=Math.min(...items.map(r=>r.y));return{x,y,width:Math.max(...items.map(r=>r.x+r.width))-x,height:Math.max(...items.map(r=>r.y+r.height))-y};};
  const region=r=>{
    if(r.artboard)return r.artboard;
    const all=leaves.get(r.id)||[],visible=all.filter(l=>states.get(l.id)?.visible),pool=visible.length?visible:all;
    // Repeated large backgrounds identify a screen more reliably than hidden
    // alternatives or a text/effect extending a few pixels beyond the frame.
    const regions=new Map();for(const l of pool.filter(l=>!l.text)){const key=[l.x,l.y,l.width,l.height].join(',');const candidate=regions.get(key)||{x:l.x,y:l.y,width:l.width,height:l.height,score:0};candidate.score+=l.width*l.height;regions.set(key,candidate);}
    return [...regions.values()].sort((a,b)=>b.score-a.score)[0]||bounds(pool);
  };
  const roots=[];
  const split=r=>{
    if(!r.section||!leaves.get(r.id)?.length)return;
    if(r.artboard){roots.push({...r,...r.artboard,opacity:states.get(r.id).opacity,visible:states.get(r.id).visible,screen:true,channels:[]});return;}
    const nested=(children.get(r.id)||[]).filter(c=>c.section&&leaves.get(c.id)?.length),rect=region(r);
    const candidates=nested.map(r=>({r,rect:region(r)})).filter(c=>c.rect&&c.rect.width*c.rect.height>=rect.width*rect.height*.5);
    const overlap=(a,b)=>Math.max(0,Math.min(a.x+a.width,b.x+b.width)-Math.max(a.x,b.x))*Math.max(0,Math.min(a.y+a.height,b.y+b.height)-Math.max(a.y,b.y));
    if(candidates.length>1&&candidates.every((a,i)=>candidates.slice(i+1).every(b=>overlap(a.rect,b.rect)<Math.min(a.rect.width*a.rect.height,b.rect.width*b.rect.height)*.1))){for(const c of candidates)split(c.r);}
    else roots.push({...r,...rect,opacity:states.get(r.id).opacity,visible:states.get(r.id).visible,screen:true,channels:[]});
  };
  for(const r of children.get('')||[])split(r);
  // A document-sized loose background plus smaller folders is one screen
  // (header, popup, footer, etc.), rather than a separate Canvas per folder.
  const canvasBackground=(children.get('')||[]).some(r=>content(r)&&!r.text&&r.width>=doc.width*.95&&r.height>=doc.height*.95);
  if(canvasBackground&&!roots.some(r=>r.artboard)&&!roots.some(r=>r.width>=doc.width*.95&&r.height>=doc.height*.95))roots.length=0;
  const reference=roots.filter(r=>states.get(r.id)?.visible).reduce((sizes,r)=>{const key=r.width+','+r.height;const item=sizes.get(key)||{width:r.width,height:r.height,count:0};item.count++;sizes.set(key,item);return sizes;},new Map());
  const common=[...reference.values()].sort((a,b)=>b.count-a.count||b.width*b.height-a.width*a.height)[0];
  // Off-canvas hidden screens may contain a document-wide color fill. Prefer a
  // matching authored background over expanding that screen to the whole sheet.
  if(common)for(const root of roots)if(!root.artboard&&!states.get(root.id)?.visible){const match=(leaves.get(root.id)||[]).find(l=>!l.text&&l.width===common.width&&l.height===common.height);if(match)Object.assign(root,{x:match.x,y:match.y,width:match.width,height:match.height});}
  const rootById=new Map(roots.map(r=>[r.id,r])),assignments=new Map(),unassigned=[];
  for(const r of doc.records){
    if(!content(r))continue;
    let p=r.parentId,root=null;
    while(p){if(rootById.has(p)){root=rootById.get(p);break;}p=byId.get(p)?.parentId;}
    if(!root){const x=r.x+r.width/2,y=r.y+r.height/2;root=roots.find(root=>(!states.get(r.id).visible||root.visible)&&x>=root.x&&y>=root.y&&x<root.x+root.width&&y<root.y+root.height);}
    if(root)assignments.set(r.id,root);else unassigned.push(r);
  }
  if(unassigned.length){
    // A flat PSD is one authored screen, rather than one screen for every icon.
    const rect=roots.length?bounds(unassigned):{x:0,y:0,width:doc.width,height:doc.height},artboards=roots.some(r=>r.artboard);
    const outside=artboards&&(rect.x+rect.width<=0||rect.y+rect.height<=0||rect.x>=doc.width||rect.y>=doc.height);
    const root={id:'psd-import-screen',name:'Screen',...rect,opacity:1,visible:!outside,section:1,screen:true,channels:[],parentId:''};
    if(outside)doc.warnings.push('Loose artwork outside the Photoshop canvas is retained in a hidden screen.');
    roots.push(root);for(const r of unassigned)assignments.set(r.id,root);
  }
  const retained=new Map();
  for(const r of doc.records.filter(r=>r.section&&!rootById.has(r.id))){
    const nested=leaves.get(r.id)||[],root=assignments.get(nested[0]?.id);
    // A wrapper spanning several screens is replaced by those screen roots.
    if(root&&nested.length&&nested.every(l=>assignments.get(l.id)===root)&&!roots.some(s=>{let p=s.id;while(p){if(p===r.id)return true;p=byId.get(p)?.parentId;}return false;}))retained.set(r.id,root);
  }
  const output=[],emitted=new Set();
  const emit=(r,root)=>{
    if(emitted.has(r.id))return;
    let p=r.parentId;while(p&&p!==root.id&&!retained.has(p))p=byId.get(p)?.parentId;
    const parent=p&&retained.has(p)?byId.get(p):root;
    if(parent.id===root.id){if(!emitted.has(root.id)){
      output.push({...root,parentId:'',blendMode:root.blendMode||'normal'});emitted.add(root.id);
      if(root.artboard?.background)output.push({id:root.id+'-background',name:'Artboard background',parentId:root.id,x:root.x,y:root.y,width:root.width,height:root.height,fill:root.artboard.background,opacity:1,visible:true,blendMode:'normal',section:0,channels:[]});
    }}
    else emit(parent,root);
    const state=states.get(r.id),parentState=states.get(parent.id)||{opacity:1};
    output.push({...r,parentId:parent.id,blendMode:r.blendMode||(r.section?'pass-through':'normal'),opacity:parentState.opacity?Math.min(1,state.opacity/parentState.opacity):r.opacity,visible:state.visible});emitted.add(r.id);
  };
  for(const r of doc.records){const root=assignments.get(r.id);if(root)emit(r,root);}
  if(output.length>1000)throw Error('PSD screen containers exceed the 1000-object import limit.');
  sharePSDPlacedRasters(output);
  return {...doc,width:common?.width||roots[0]?.width||doc.width,height:common?.height||roots[0]?.height||doc.height,records:output,removedGroups:doc.records.filter(r=>r.section).length-output.filter(r=>r.section&&byId.has(r.id)).length};
}
export function sharePSDPlacedRasters(records){
 const groups=new Map();
 const crop=r=>{const s=r.placedSource,q=s.quad,sx=s.width/(q[2]-q[0]),sy=s.height/(q[5]-q[1]);return [(r.x-q[0])*sx,(r.y-q[1])*sy,r.width*sx,r.height*sy,sx,sy];};
 for(const r of records){
  if(!r.placedSource||r.section||r.text||r.mask||r.vectorMask||r.rasterEffects||isStreamedPSDRaster(r)||!r.channels.some(c=>c.id===0)||!r.width||!r.height)continue;
  const key=r.placedSource.key,list=groups.get(key)||[];list.push(r);groups.set(key,list);
 }
 for(const list of groups.values())for(const r of list){
  const a=crop(r),source=list.filter(s=>{const b=crop(s);return a.slice(0,4).every((v,i)=>Math.abs(v-b[i])<=1.5*Math.max(1,a[4+i%2],b[4+i%2]));}).sort((a,b)=>b.width*b.height-a.width*a.height||a.index-b.index)[0];
  if(source&&source!==r)r.rasterSource={id:source.id,name:source.name,width:source.width,height:source.height,channels:source.channels};
 }
}
export function unpackRLE(bytes,width,height) {
  const r=new Reader(bytes);
  const counts=[];for(let row=0;row<height;row++)counts.push(r.u16());const output=new Uint8Array(width*height);
  for(let row=0;row<height;row++){const end=r.offset+counts[row];r.need(counts[row]);let x=0;
    while(r.offset<end){const n=r.u8();if(n<=127){const length=n+1;if(x+length>width||r.offset+length>end)throw Error('Invalid PSD RLE row.');output.set(r.bytes.subarray(r.offset,r.offset+length),row*width+x);r.skip(length);x+=length;}
      else if(n>128){const length=257-n;if(x+length>width||r.offset>=end)throw Error('Invalid PSD RLE run.');output.fill(r.u8(),row*width+x,row*width+x+length);x+=length;}}
    if(x!==width)throw Error('Incomplete PSD RLE row.');
  }return output;
}
export async function decodeChannel(bytes,width,height) {
  if(!Number.isInteger(width)||!Number.isInteger(height)||width<1||height<1||width>8192||height>8192||width*height>16777216)throw Error('PSD channel dimensions exceed the import limits.');
  if(bytes.length<2)throw Error('Invalid PSD channel.');const compression=(bytes[0]<<8)|bytes[1],data=bytes.subarray(2),size=width*height;
  if(compression===0){if(data.length!==size)throw Error('Invalid raw PSD channel.');return data;}
  if(compression===1)return unpackRLE(data,width,height);
  if(compression!==2&&compression!==3)throw Error('Unsupported PSD compression.');
  if(typeof DecompressionStream==='undefined')throw Error('This browser cannot read ZIP-compressed PSDs. Save an RLE PSD from Photoshop.');
  const stream=new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate')),reader=stream.getReader(),output=new Uint8Array(size);let offset=0;
  while(true){const {done,value}=await reader.read();if(done)break;if(offset+value.length>size){await reader.cancel();throw Error('PSD ZIP channel exceeds its dimensions.');}output.set(value,offset);offset+=value.length;}
  if(offset!==size)throw Error('Incomplete ZIP PSD channel.');
  if(compression===3)for(let y=0;y<height;y++)for(let x=1;x<width;x++)output[y*width+x]=(output[y*width+x]+output[y*width+x-1])&255;
  return output;
}
