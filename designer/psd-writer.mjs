// PSD v1 / 8-bit RGBA, following Adobe's File Formats Specification.
// Inputs are individual painted layers in top-to-bottom PSD order.
import {styledTextInput} from './ui-styled-text.mjs';
import {psdTextFingerprint} from './psd-text.mjs';
const blends={normal:'norm','pass-through':'pass',multiply:'mul ',screen:'scrn',overlay:'over',darken:'dark',lighten:'lite','color-dodge':'div ','color-burn':'idiv','hard-light':'hLit','soft-light':'sLit',difference:'diff',exclusion:'smud',hue:'hue ',saturation:'sat ',color:'colr',luminosity:'lum '};
export const PSD_EXPORT_MAX_BYTES=500*1024*1024;
export function validatePSDExportSize(width,height) {
  if(!Number.isInteger(width)||!Number.isInteger(height)||width<1||height<1||width>8192||height>8192||width*height>16777216)throw Error('PSD export supports up to 8192 pixels per side and 16 megapixels. Export a smaller document.');
}
class Bytes {
  constructor(){this.parts=[];this.size=0;}
  add(bytes){this.parts.push(bytes);this.size+=bytes.length;return this;}
  number(value,size,signed=false){const b=new Uint8Array(size),v=new DataView(b.buffer);if(size===1)v.setUint8(0,value);else if(size===2)signed?v.setInt16(0,value):v.setUint16(0,value);else signed?v.setInt32(0,value):v.setUint32(0,value);return this.add(b);}
  text(text){return this.add(Uint8Array.from(text,c=>c.charCodeAt(0)&255));}
  double(value){const b=new Uint8Array(8);new DataView(b.buffer).setFloat64(0,value);return this.add(b);}
  finish(){const out=new Uint8Array(this.size);let offset=0;for(const p of this.parts){out.set(p,offset);offset+=p.length;}return out;}
}
function unicode(text){const b=new Bytes().number(text.length,4);for(let i=0;i<text.length;i++)b.number(text.charCodeAt(i),2);return b.finish();}
function block(key,bytes){const b=new Bytes().text('8BIM').text(key).number(bytes.length,4).add(bytes);if(bytes.length%2)b.number(0,1);return b.finish();}
const id=value=>new Bytes().number(value.length===4?0:value.length,4).text(value).finish();
function descriptor(classId,items){
  const b=new Bytes().add(unicode('')).add(id(classId)).number(items.length,4);
  for(const [key,type,value]of items){b.add(id(key)).text(type);if(type==='TEXT')b.add(unicode(value));else if(type==='tdta')b.number(value.length,4).add(value);else if(type==='enum')b.add(id(value[0])).add(id(value[1]));else if(type==='long')b.number(value,4,true);else if(type==='doub')b.double(value);else if(type==='Objc')b.add(value);else throw Error('Invalid PSD export descriptor type.');}
  return b.finish();
}
// Text-engine strings are UTF-16BE PostScript literals, including their BOM.
// Escape each binary delimiter; do not interpolate authored text into engine syntax.
function engineString(value){const b=new Bytes().number(254,1).number(255,1);for(let i=0;i<value.length;i++)b.number(value.charCodeAt(i),2);const out=new Bytes().text('(');for(const c of b.finish()){if([40,41,92].includes(c))out.number(92,1);out.number(c,1);}return out.text(')').finish();}
function engineValue(value){
  if(typeof value==='string')return engineString(value);
  if(typeof value==='number'){if(!Number.isFinite(value))throw Error('Invalid PSD text value.');return new Bytes().text(String(value)).finish();}
  if(typeof value==='boolean')return new Bytes().text(String(value)).finish();
  const b=new Bytes();if(Array.isArray(value)){b.text('[ ');for(const item of value)b.add(engineValue(item)).text(' ');return b.text(']').finish();}
  b.text('<< ');for(const [key,item]of Object.entries(value))b.text('/'+key+' ').add(engineValue(item)).text(' ');return b.text('>>').finish();
}
export function psdFontName(bytes,fallback='ArialMT'){
  const v=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);if(bytes.length<12)return fallback;
  const n=v.getUint16(4);if(n>4096||12+n*16>bytes.length)return fallback;
  for(let i=0;i<n;i++){const p=12+i*16;if(String.fromCharCode(...bytes.subarray(p,p+4))!=='name')continue;const start=v.getUint32(p+8),length=v.getUint32(p+12);if(length<6||start+length>bytes.length)return fallback;
    const count=v.getUint16(start+2),strings=start+v.getUint16(start+4);if(6+count*12>length)return fallback;let result;
    for(let j=0;j<count;j++){const r=start+6+j*12,platform=v.getUint16(r),nameId=v.getUint16(r+6),size=v.getUint16(r+8),offset=strings+v.getUint16(r+10);if(nameId!==6||size>1024||offset+size>start+length)continue;const name=new TextDecoder(platform===0||platform===3?'utf-16be':'latin1').decode(bytes.subarray(offset,offset+size));if(name&&!/[\x00-\x1f]/.test(name)){if(platform===3)return name;result=name;}}
    return result||fallback;
  }return fallback;
}
function typeTool(data){
  const {layer,box,paint,fontName}=data,input=styledTextInput(layer),text=(layer.text||'').replace(/\r\n?/g,'\n'),settings=layer.tmpSettings||{},style=layer.textStyle||{};
  const c=(style.faceColor||layer.textColor||'#ffffffff').replace('#',''),color=[parseInt(c.slice(6,8)||'ff',16),parseInt(c.slice(0,2),16),parseInt(c.slice(2,4),16),parseInt(c.slice(4,6),16)].map(n=>n/255);
  const run={Font:0,FontSize:layer.fontSize||24,FauxBold:!!layer.bold,FauxItalic:!!settings.italic,AutoLeading:true,Leading:0,HorizontalScale:1,VerticalScale:1,Tracking:(settings.characterSpacing||0)*1000/(layer.fontSize||24),AutoKerning:true,Kerning:0,BaselineShift:0,FontCaps:0,FontBaseline:0,Underline:false,Strikethrough:false,Ligatures:true,FillColor:{Type:1,Values:color},StrokeColor:{Type:1,Values:[1,0,0,0]},FillFlag:true,StrokeFlag:false,FillFirst:true,OutlineWidth:1};
  const paragraph={DefaultStyleSheet:0,Properties:{Justification:({left:0,right:1,center:2})[layer.textAlign]??2,FirstLineIndent:0,StartIndent:0,EndIndent:0,SpaceBefore:0,SpaceAfter:0,AutoHyphenate:false,WordSpacing:[.8,1,1.33],LetterSpacing:[0,0,0],GlyphSpacing:[1,1,1],AutoLeading:1.2,LeadingType:0,EveryLineComposer:false}};
  const resources={FontSet:[{Name:fontName,Script:0,FontType:0,Synthetic:0}],TheNormalStyleSheet:0,TheNormalParagraphSheet:0,StyleSheetSet:[{Name:'Normal',StyleSheetData:run}],ParagraphSheetSet:[paragraph],KinsokuSet:[],MojiKumiSet:[],SuperscriptSize:.583,SuperscriptPosition:.333,SubscriptSize:.583,SubscriptPosition:.333,SmallCapSize:.7};
  const content=text.replace(/\n/g,'\r')+'\r',engine=engineValue({EngineDict:{Editor:{Text:content},StyleRun:{DefaultRunData:{StyleSheet:{StyleSheetData:run}},RunArray:[{StyleSheet:{StyleSheetData:run}}],RunLengthArray:[content.length],IsJoinable:2},ParagraphRun:{DefaultRunData:{ParagraphSheet:paragraph,Adjustments:{Axis:[1,0,1],XY:[0,0]}},RunArray:content.split(/(?<=\r)/).filter(Boolean).map(()=>({ParagraphSheet:paragraph,Adjustments:{Axis:[1,0,1],XY:[0,0]}})),RunLengthArray:content.split(/(?<=\r)/).filter(Boolean).map(s=>s.length),IsJoinable:1},AntiAlias:4,UseFractionalGlyphWidths:true,Rendered:{Version:1,Shapes:{WritingDirection:0,Children:[{ShapeType:1,Procession:0,Lines:{WritingDirection:0,Children:[]},Cookie:{Photoshop:{ShapeType:1,BoxBounds:[0,0,box.width,box.height],Base:{ShapeType:1,TransformPoint0:[0,0],TransformPoint1:[1,0],TransformPoint2:[0,1]}}}}]}}},ResourceDict:resources,DocumentResources:resources});
  const a=(box.rotation||0)*Math.PI/180,cos=Math.cos(a),sin=Math.sin(a),transform=[cos,sin,-sin,cos,box.x+box.width/2-cos*box.width/2+sin*box.height/2,box.y+box.height/2-sin*box.width/2-cos*box.height/2];
  const type={transform,descriptor:{'Txt ':text.replace(/\n/g,'\r'),EngineData:engine}};
  const metadata=new TextEncoder().encode(JSON.stringify({version:1,fingerprint:psdTextFingerprint(type,null),input,box,paint}));
  const b=new Bytes().number(1,2);for(const v of transform)b.double(v);
  b.number(50,2).number(16,4).add(descriptor('TxLr',[['Txt ','TEXT',type.descriptor['Txt ']],['textGridding','enum',['textGridding','None']],['Ornt','enum',['Ornt','Hrzn']],['AntA','enum',['Annt','antiAliasSharp']],['TextIndex','long',0],['EngineData','tdta',engine],['VinaGenText','tdta',metadata]]));
  b.number(1,2).number(16,4).add(descriptor('warp',[['warpStyle','enum',['warpStyle','warpNone']],['warpValue','doub',0],['warpPerspective','doub',0],['warpPerspectiveOther','doub',0],['warpRotate','enum',['Ornt','Hrzn']]]));
  // The on-disk TySh bounds are four signed 32-bit coordinates.
  for(const v of [0,0,box.width,box.height])b.number(Math.round(v),4,true);
  return b.finish();
}
export function packBits(row) {
  const out=[];let i=0;
  while(i<row.length){
    let run=1;while(run<128&&i+run<row.length&&row[i+run]===row[i])run++;
    if(run>=3){out.push(257-run,row[i]);i+=run;continue;}
    const start=i;i+=run;
    while(i<row.length&&i-start<128){run=1;while(run<3&&i+run<row.length&&row[i+run]===row[i])run++;if(run>=3)break;i+=Math.min(run,128-(i-start));}
    out.push(i-start-1);for(let p=start;p<i;p++)out.push(row[p]);
  }
  return Uint8Array.from(out);
}
function channel(pixels,width,height,component){
  const table=new Bytes(),payload=new Bytes(),row=new Uint8Array(width);
  for(let y=0;y<height;y++){
    for(let x=0;x<width;x++)row[x]=pixels[(y*width+x)*4+component];
    const encoded=packBits(row);table.number(encoded.length,2);payload.add(encoded);
  }
  return {table:table.finish(),payload:payload.finish()};
}
function extra(layer,section){
  const name=String(layer.name||'Layer').slice(0,4096),fallback=Uint8Array.from(name.slice(0,255),c=>c.charCodeAt(0)<128?c.charCodeAt(0):63);
  const b=new Bytes().number(0,4).number(0,4).number(fallback.length,1).add(fallback);
  for(let i=(fallback.length+1)%4;i&&i<4;i++)b.number(0,1);
  b.add(block('luni',unicode(name)));
  if(layer.textData&&!section)b.add(block('TySh',typeTool(layer.textData)));
  if(section)b.add(block('lsct',new Bytes().number(section,4).text('8BIM').text(blends[layer.blendMode]||'norm').finish()));
  return b.finish();
}
export function createPSDWriter(width,height) {
  validatePSDExportSize(width,height);
  const records=[],payloads=[];let compressedBytes=0,hasSections=false;
  return {
    addLayer(layer) {
      if(records.length>=1000)throw Error('PSD export supports up to 1000 layer records, including group dividers.');
      const section=layer.section||0;if(section)hasSections=true;const w=section?0:layer.width,h=section?0:layer.height;
      if(!section){validatePSDExportSize(w,h);if(!layer.pixels||layer.pixels.length!==w*h*4)throw Error('Invalid PSD layer pixels.');}
      if(!Number.isInteger(layer.x)||!Number.isInteger(layer.y)||Math.abs(layer.x)>100000||Math.abs(layer.y)>100000)throw Error('Invalid PSD layer position.');
      if(layer.blendMode&&!blends[layer.blendMode])throw Error('Unsupported PSD blend mode '+layer.blendMode+'.');
      const channels=[],layerPayload=[];
      if(!section)for(const id of [-1,0,1,2]){
        const c=channel(layer.pixels,w,h,id===-1?3:id),bytes=new Bytes().number(1,2).add(c.table).add(c.payload).finish();
        channels.push({id,length:bytes.length});layerPayload.push(bytes);compressedBytes+=bytes.length;
        if(compressedBytes>PSD_EXPORT_MAX_BYTES)throw Error('PSD export exceeds 500 MB. Export a smaller document.');
      }
      const e=extra(layer,section),b=new Bytes().number(layer.y,4,true).number(layer.x,4,true).number(layer.y+h,4,true).number(layer.x+w,4,true).number(channels.length,2);
      for(const c of channels)b.number(c.id,2,true).number(c.length,4);
      b.text('8BIM').text(blends[layer.blendMode]||'norm').number(Math.round(Math.max(0,Math.min(1,layer.opacity??1))*255),1).number(0,1).number((layer.visible===false?2:0)|(layer.locked?1:0),1).number(0,1).number(e.length,4).add(e);
      records.push(b.finish());payloads.push(layerPayload);
    },
    finish(composite) {
      if(!records.length)throw Error('Add at least one layer before exporting PSD.');
      if(!composite||composite.length!==width*height*4)throw Error('Invalid PSD composite pixels.');
      const recordBytes=records.reduce((n,b)=>n+b.length,0),layerSize=2+recordBytes+compressedBytes,paddedLayerSize=layerSize+(layerSize%2);
      const merged=[0,1,2,3].map(c=>channel(composite,width,height,c));
      // Adobe stores the stack bottom first: bounding divider, children, folder
      // header. Reverse whole layers, preserving each layer's channel order.
      const parts=[new Bytes().text('8BPS').number(1,2).add(new Uint8Array(6)).number(4,2).number(height,4).number(width,4).number(8,2).number(3,2).number(0,4).number(0,4).number(4+paddedLayerSize+4,4).number(paddedLayerSize,4).number(-records.length,2,true).finish(),...(hasSections?[...records].reverse():records),...(hasSections?[...payloads].reverse():payloads).flat()];
      if(layerSize%2)parts.push(new Uint8Array(1));
      parts.push(new Bytes().number(0,4).number(1,2).finish(),...merged.map(c=>c.table),...merged.map(c=>c.payload));
      const size=parts.reduce((n,b)=>n+b.length,0);if(size>PSD_EXPORT_MAX_BYTES)throw Error('PSD export exceeds 500 MB. Export a smaller document.');
      return new Blob(parts,{type:'image/vnd.adobe.photoshop'});
    },
    get layerCount(){return records.length;}
  };
}
