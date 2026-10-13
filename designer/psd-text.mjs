// Bounded Adobe action descriptors and Photoshop text engine dictionaries.
import {validateDocument} from './ui-model.mjs';
import {styledTextInput} from './ui-styled-text.mjs';
// Reject our optional round-trip data after another editor changes native text.
// Hash only standard fields; custom descriptor bytes never authenticate themselves.
export function psdTextFingerprint(type,effects){
 let hash=2166136261;const add=bytes=>{for(const n of bytes)hash=Math.imul(hash^n,16777619)>>>0;};
 add(new TextEncoder().encode(JSON.stringify([type.transform,type.descriptor['Txt '],effects])));add(type.descriptor.EngineData||new Uint8Array());return hash.toString(16);
}
function roundTripText(type,effects,warnings){
 const bytes=type.descriptor.VinaGenText;if(!bytes)return null;
 try{
  if(!(bytes instanceof Uint8Array)||bytes.length>65536)throw Error('Invalid metadata size.');
  const data=JSON.parse(new TextDecoder().decode(bytes));
  if(data.version!==1||data.fingerprint!==psdTextFingerprint(type,effects))throw Error('Native text has changed.');
  const box=data.box,paint=data.paint;
  if(!box||!paint||typeof data.input!=='object'||!data.input||Array.isArray(data.input))throw Error('Invalid text data.');
  // Select only rendering fields. Document identity and arbitrary JSON keys cannot enter the layer.
  const input=styledTextInput(data.input),layer={...input,id:'psd-text',parentId:'',name:'PSD text',role:'text',x:box.x,y:box.y,width:box.width,height:box.height,rotation:box.rotation};
  if(typeof layer.text!=='string'||layer.text.length>512||(layer.text||'').replace(/\r\n?/g,'\n')!==(type.descriptor['Txt ']||'').replace(/\r\n?/g,'\n'))throw Error('Invalid text content.');
  validateDocument({schema:'vinagen_ui',schemaVersion:1,name:'PSD text',width:1,height:1,layers:[layer]});
  for(const key of ['x','y','width','height'])if(!Number.isFinite(paint[key])||Math.abs(paint[key])>16384||(['width','height'].includes(key)&&(paint[key]<1||paint[key]>8192)))throw Error('Invalid cached text bounds.');
  if(paint.width*paint.height>16777216)throw Error('Invalid cached text area.');
  return {...styledTextInput(layer),psdTextBox:{x:box.x,y:box.y,width:box.width,height:box.height,rotation:box.rotation},psdTextPaint:{x:paint.x,y:paint.y,width:paint.width,height:paint.height}};
 }catch{warnings.add('VinaGen text metadata changed or is invalid; using the native Photoshop text settings.');return null;}
}
class Binary {
  constructor(bytes){this.bytes=bytes;this.view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);this.offset=0;}
  need(n){if(n<0||!Number.isSafeInteger(n)||this.offset+n>this.bytes.length)throw Error('Invalid PSD text descriptor.');}
  u16(){this.need(2);const v=this.view.getUint16(this.offset);this.offset+=2;return v;}
  u32(){this.need(4);const v=this.view.getUint32(this.offset);this.offset+=4;return v;}
  i32(){this.need(4);const v=this.view.getInt32(this.offset);this.offset+=4;return v;}
  double(){this.need(8);const v=this.view.getFloat64(this.offset);this.offset+=8;if(!Number.isFinite(v))throw Error('Invalid PSD text number.');return v;}
  take(n){this.need(n);const v=this.bytes.subarray(this.offset,this.offset+n);this.offset+=n;return v;}
  ascii(n){return new TextDecoder('latin1').decode(this.take(n));}
  unicode(){const n=this.u32();if(n>100000)throw Error('PSD text string is too long.');return new TextDecoder('utf-16be').decode(this.take(n*2)).replace(/\0$/,'');}
  id(){const n=this.u32();if(n>4096)throw Error('Invalid PSD descriptor key.');return this.ascii(n||4);}
  descriptor(depth=0){if(depth>32)throw Error('PSD descriptor nesting is too deep.');this.unicode();const out=Object.create(null);out._class=this.id();const count=this.u32();if(count>10000)throw Error('PSD descriptor is too large.');for(let i=0;i<count;i++){const key=this.id();out[key]=this.value(this.ascii(4),depth+1);}return out;}
  value(type,depth){
    if(type==='Objc'||type==='GlbO')return this.descriptor(depth);
    if(type==='TEXT')return this.unicode();
    if(type==='long')return this.i32();
    if(type==='doub')return this.double();
    if(type==='UntF')return {unit:this.ascii(4),value:this.double()};
    if(type==='bool')return !!this.take(1)[0];
    if(type==='enum')return {type:this.id(),value:this.id()};
    if(type==='tdta'||type==='alis')return this.take(this.u32());
    if(type==='type'||type==='GlbC')return {name:this.unicode(),class:this.id()};
    if(type==='VlLs'){if(depth>32)throw Error('PSD list nesting is too deep.');const n=this.u32();if(n>10000)throw Error('PSD list is too large.');return Array.from({length:n},()=>this.value(this.ascii(4),depth+1));}
    throw Error('Unsupported PSD descriptor type '+type+'.');
  }
}
export function readEngineData(bytes){
  let i=0,tokens=0;
  const space=()=>{while(i<bytes.length&&bytes[i]<=32)i++;};
  const value=(depth=0)=>{
    if(depth>40||++tokens>100000)throw Error('PSD text engine data exceeds limits.');space();
    if(bytes[i]===60&&bytes[i+1]===60){i+=2;const o=Object.create(null);while(true){space();if(bytes[i]===62&&bytes[i+1]===62){i+=2;return o;}const k=value(depth+1);if(typeof k!=='string')throw Error('Invalid PSD text engine key.');o[k]=value(depth+1);}}
    if(bytes[i]===91){i++;const a=[];while(true){space();if(bytes[i]===93){i++;return a;}a.push(value(depth+1));}}
    if(bytes[i]===40){i++;const data=[];let nesting=1;while(i<bytes.length){let c=bytes[i++];if(c===92){if(i>=bytes.length)break;c=bytes[i++];const escapes={110:10,114:13,116:9,98:8,102:12};if(c>=48&&c<=55){let n=c-48;for(let k=0;k<2&&bytes[i]>=48&&bytes[i]<=55;k++)n=n*8+bytes[i++]-48;data.push(n);}else if(c!==10&&c!==13)data.push(escapes[c]??c);continue;}if(c===40)nesting++;if(c===41&&!--nesting)break;data.push(c);}if(nesting)throw Error('Unterminated PSD text string.');const b=Uint8Array.from(data);return b[0]===254&&b[1]===255?new TextDecoder('utf-16be').decode(b.subarray(2)):new TextDecoder('utf-8').decode(b);}
    const start=i;if(bytes[i]===47)i++;while(i<bytes.length&&bytes[i]>32&&![60,62,91,93,40,41].includes(bytes[i]))i++;if(i===start)throw Error('Invalid PSD text engine token.');const s=new TextDecoder().decode(bytes.subarray(start,i));if(s[0]==='/')return s.slice(1);if(s==='true'||s==='false')return s==='true';if(s==='null')return null;const n=Number(s);if(!Number.isFinite(n))throw Error('Invalid PSD text engine value.');return n;
  };return value();
}
export function readTypeTool(bytes){
 const r=new Binary(bytes);if(r.u16()!==1)throw Error('Unsupported PSD type version.');const transform=Array.from({length:6},()=>r.double());if(r.u16()!==50||r.u32()!==16)throw Error('Unsupported PSD text version.');const descriptor=r.descriptor();
 return {transform,descriptor,engine:descriptor.EngineData?readEngineData(descriptor.EngineData):null};
}
export function readLayerEffects(bytes){const r=new Binary(bytes);if(r.u32()!==0||r.u32()!==16)throw Error('Unsupported PSD effects version.');return r.descriptor();}
// Artboard geometry is authored independently of layer pixel bounds. Large
// backgrounds and hidden alternatives may extend far beyond this rectangle.
export function readPSDArtboard(bytes){
 const r=new Binary(bytes);if(r.u32()!==16)throw Error('Unsupported PSD artboard version.');
 const data=r.descriptor(),rect=data.artboardRect;if(!rect)return null;
 const scalar=value=>typeof value==='number'?value:value?.value;
 const x=scalar(rect.Left),y=scalar(rect['Top ']),right=scalar(rect.Rght),bottom=scalar(rect.Btom),width=right-x,height=bottom-y;
 if(![x,y,right,bottom].every(Number.isFinite)||Math.max(Math.abs(x),Math.abs(y),Math.abs(right),Math.abs(bottom))>100000||width<1||height<1||width>30000||height>30000)throw Error('Invalid PSD artboard bounds.');
 const type=data.artboardBackgroundType,color=data['Clr '];
 const background=type===1?'#ffffffff':type===2?'#000000ff':type===4&&color?hex([number(color['Rd  ']),number(color['Grn ']),number(color['Bl  ']),255]):null;
 return {x,y,width,height,background};
}
const number=(v,fallback=0)=>Number.isFinite(v?.value)?v.value:Number.isFinite(v)?v:fallback;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const hex=(values)=>'#'+values.map(v=>Math.round(clamp(v,0,255)).toString(16).padStart(2,'0')).join('');
const effectColor=(c,opacity=100)=>hex([number(c?.['Rd  ']),number(c?.['Grn ']),number(c?.['Bl  ']),opacity*2.55]);
export function photoshopText(type,effects,warnings=new Set(),bounds={width:1,height:1}){
 const engine=type.engine?.EngineDict,run=engine?.StyleRun?.RunArray?.[0]?.StyleSheet?.StyleSheetData;
 if(!run)throw Error('PSD text has no supported style data.');
 const scale=Math.hypot(type.transform[2],type.transform[3]),fontSize=clamp((run.FontSize||24)*scale*(run.VerticalScale||1),1,512);
 let text=(type.descriptor['Txt ']??engine.Editor?.Text?.replace(/\r$/,'')??'').replace(/\r\n?/g,'\n');
 if(run.FontCaps===2)text=text.toUpperCase();
 if(text.length>512)throw Error('PSD text exceeds 512 characters per label.');
 const color=run.FillColor?.Values||[1,1,1,1],textColor=hex([color[1]*255,color[2]*255,color[3]*255,color[0]*255]);
 const style={faceColor:textColor,gradient:false,strokeWidth:0,outlineWidth:0,extrusionX:0,extrusionY:0};
 const enabled=(single,multi)=>effects?.masterFXSwitch===false?null:[effects?.[single],...(effects?.[multi]||[])].find(e=>e?.enab);
 const stroke=enabled('FrFX','frameFXMulti'),shadow=enabled('DrSh','dropShadowMulti'),gradient=enabled('GrFl','gradientFillMulti'),fill=enabled('SoFi','solidFillMulti');
 const effectScale=number(effects?.['Scl '],100)/100;
 if(fill){const c=effectRGBA(fill),base=style.faceColor.match(/[0-9a-f]{2}/gi).map(v=>parseInt(v,16));style.faceColor=hex([...c.slice(0,3).map((v,i)=>v*c[3]+base[i]*(1-c[3])),base[3]]);if(!normal(fill))warnings.add('Photoshop text Color Overlay blend uses a normal-blend approximation.');}
 if(stroke){
  // Photoshop stroke position: inside -> Inner Outline, center -> half outside + half inside, outside -> stroke.
  const size=clamp(number(stroke['Sz  '])*effectScale,0,64),position=stroke.Styl?.value||'OutF',strokeColor=effectColor(stroke['Clr '],number(stroke.Opct,100));
  const inside=position==='InsF'?size:position==='CtrF'?size/2:0,outside=size-inside;
  if(outside){style.strokeWidth=outside;style.strokeColor=strokeColor;}
  if(inside){style.innerOutlineWidth=inside;style.innerOutlineColor=strokeColor;}
 }
 if(shadow){const angle=number(shadow.lagl,120)*Math.PI/180,d=number(shadow.Dstn)*effectScale;style.extrusionX=clamp(-Math.cos(angle)*d,-128,128);style.extrusionY=clamp(Math.sin(angle)*d,-128,128);style.extrusionColor=effectColor(shadow['Clr '],number(shadow.Opct,100));const spread=clamp(number(shadow.Ckmt)/100,0,1),size=clamp(number(shadow.blur)*effectScale,0,64);if(spread&&size&&!stroke){style.outlineWidth=size*spread;style.outlineColor=style.extrusionColor;}if(size&&spread<1)warnings.add('Blurred Photoshop text shadows are approximated by VinaGenText extrusion.');}
 if(gradient){const ramp=psdGradient(gradient,bounds.width,bounds.height,{x:bounds.x,y:bounds.y,width:bounds.documentWidth,height:bounds.documentHeight});if(ramp){
  style.gradient=true;style.gradientMode=ramp.mode;style.gradientAngle=ramp.angle;style.gradientBlend='blend';
  const base=style.faceColor.match(/[0-9a-f]{2}/gi).map(v=>parseInt(v,16));
  const stops=ramp.keys.map(offset=>{const c=ramp.sample(ramp.a*offset+ramp.b),a=c[3];return {offset,color:hex([...c.slice(0,3).map((v,i)=>v*a+base[i]*(1-a)),255])};});
  style.faceColor='#ffffffff';style.stops=stops;
  if(ramp.approximate)warnings.add('Photoshop gradient blend, interpolation or midpoint uses an approximation.');
 }else warnings.add('Unsupported Photoshop text gradient needs visual review.');}
 if(engine.StyleRun.RunArray.length>1)warnings.add('Mixed Photoshop text styles use the first style; review this label.');
 const paragraph=engine.ParagraphRun?.RunArray?.[0]?.ParagraphSheet?.Properties||{};
 const original=roundTripText(type,effects,warnings);
 if(original){delete original.id;delete original.name;delete original.parentId;delete original.x;delete original.y;delete original.rotation;delete original.opacity;delete original.visible;delete original.clip;}
 return {...(original||{role:'text',text,textRenderer:'vinaGenText',textMeshPro:true,standaloneText:true,textStyle:style,textColor:'#ffffffff',fontSize,bold:!!run.FauxBold,textAlign:['left','right','center'][paragraph.Justification]||'left',rotation:Math.atan2(type.transform[1],type.transform[0])*180/Math.PI,fill:'#ffffff00',tmpSettings:{autoSize:false,wordWrapping:false,richText:false,italic:!!run.FauxItalic,verticalAlign:'middle',overflow:'overflow',characterSpacing:clamp((run.Tracking||0)*fontSize/1000,-1000,1000)}}),psdFontName:type.engine.ResourceDict?.FontSet?.[run.Font]?.Name||''};
}
export const psdFallbackFonts=config=>config.psdFallbackFonts??[...(config.vinaGenFonts||[]),...(config.tmpFonts||[])];
export function applyPSDFallbackFont(layer,config,key){
 const font=psdFallbackFonts(config).find(f=>f.key===key);if(!font)return null;
 layer.tmpFont=font.key;layer.textMeshPro=true;
 // Native fonts require VinaGenText; TMP sources can keep the PSD's native
 // effects renderer and are converted into the private import on completion.
 if(font.standalone){layer.standaloneText=true;layer.textRenderer='vinaGenText';}
 else if(!layer.standaloneText)layer.textRenderer='textMeshPro';
 delete layer.fontGuid;delete layer.tmpMaterial;return font;
}
export function resolvePSDFont(layer,config,warnings,fallbackKey=''){
 const name=layer.psdFontName;if(!name)return;
 if(layer.tmpFont&&[...(config.vinaGenFonts||[]),...(config.tmpFonts||[])].some(f=>f.key===layer.tmpFont)||layer.fontGuid&&(config.fonts||[]).some(f=>f.guid===layer.fontGuid)){delete layer.psdFontName;return;}
 const normalize=s=>s.toLowerCase().replace(/[^a-z0-9]/g,'').replace(/^(font)/,'').replace('montserratroman','montserrat').replace(/(sdf|tmp|vinatext|vinagentext|regular)+$/g,'');
 const key=normalize(name),font=[...(config.tmpFonts||[]),...(config.vinaGenFonts||[])].find(f=>normalize(f.name)===key);
 if(font){layer.tmpFont=font.key;if(font.standalone){layer.standaloneText=true;layer.textMeshPro=true;layer.textRenderer='vinaGenText';}}else{
  const source=(config.fonts||[]).find(f=>normalize(f.name)===key);
  if(source&&!layer.textMeshPro)layer.fontGuid=source.guid;else if(!['arialmt','arialboldmt'].includes(key)||layer.textMeshPro){
   delete layer.tmpFont;delete layer.fontGuid;delete layer.tmpMaterial;
   layer.psdMissingFontName=name;const fallback=applyPSDFallbackFont(layer,config,fallbackKey);
   warnings.add('Missing PSD font '+name+'; using '+(fallback?fallback.name:'the configured default')+'. Select the matching font in Typography.');
  }
 }
 delete layer.psdFontName;
}

// Photoshop layer channels contain the glyph paint, separately from lfx2.
// Composite supported text effects on that paint, retaining the original glyphs.
const enabled=(effects,single,multi)=>effects?.masterFXSwitch===false?null:[effects?.[single],...(effects?.[multi]||[])].find(e=>e?.enab);
const effectRGBA=e=>[number(e?.['Clr ']?.['Rd  ']),number(e?.['Clr ']?.['Grn ']),number(e?.['Clr ']?.['Bl  ']),clamp(number(e?.Opct,100),0,100)/100];
const normal=e=>!e?.['Md  ']||['Nrml','normal','norm'].includes(e['Md  '].value);
// A stroke on a text-only folder belongs to the children's combined paint,
// including their shadows. Apply it after each child's own effects when their
// expanded bounds are disjoint, so the operation is equivalent to grouping.
export function inheritPSDTextGroupEffects(records,warnings){
 const children=new Map();for(const r of records){const list=children.get(r.parentId)||[];list.push(r);children.set(r.parentId,list);}
 const leaves=r=>r.section?(children.get(r.id)||[]).flatMap(leaves):[r];
 for(const group of [...records].reverse()){
  const effects=group.groupEffects,stroke=enabled(effects,'FrFX','frameFXMulti');if(!stroke)continue;
  const texts=leaves(group),radius=clamp(number(stroke['Sz  '])*number(effects['Scl '],100)/100,0,64);
  const pad=r=>radius+(r.text?.textStyle?.strokeWidth||0)+(r.text?.textStyle?.outlineWidth||0)+Math.max(Math.abs(r.text?.textStyle?.extrusionX||0),Math.abs(r.text?.textStyle?.extrusionY||0));
  const overlap=texts.some((r,i)=>texts.slice(i+1).some(s=>{const p=pad(r)+pad(s);return r.x<s.x+s.width+p&&s.x<r.x+r.width+p&&r.y<s.y+s.height+p&&s.y<r.y+r.height+p;}));
  if(group.mask||!texts.length||texts.some(r=>!r.text||r.text.psdTextBox||r.opacity!==1||r.mask||r.blendMode!=='normal')||overlap||stroke.Styl?.value&&stroke.Styl.value!=='OutF'||stroke.PntT?.value&&stroke.PntT.value!=='SClr'){
   warnings.add('Photoshop group '+group.name+' has a stroke that needs composite review.');continue;
  }
  for(const r of texts){
   (r.textGroupEffects||(r.textGroupEffects=[])).push({'Scl ':100,FrFX:{...stroke,'Sz  ':radius}});
   const style=r.text.textStyle;
   if(!style.strokeWidth){style.strokeWidth=radius;style.strokeColor=effectColor(stroke['Clr '],number(stroke.Opct,100));}
   else if(!style.outlineWidth){style.outlineWidth=radius;style.outlineColor=effectColor(stroke['Clr '],number(stroke.Opct,100));}
   else warnings.add('Multiple nested Photoshop group strokes retain cached paint; editable outlines need review.');
  }
 }
}
// Adobe angles run counterclockwise in a coordinate system with Y pointing up.
// VinaGen paint runs right/down. Canonical axes also reverse their color keys.
function psdGradient(effect,width,height,context={}){
  const colors=effect.Grad?.Clrs,transparency=effect.Grad?.Trns||[];
  if((effect.Type?.value||'Lnr ')!=='Lnr '||!colors?.length||colors.length>8||transparency.length>8||effect.Grad?.GrdF?.value==='ClNs')return null;
  const stops=colors.map(s=>({offset:clamp(number(s.Lctn)/4096,0,1),mid:clamp(number(s.Mdpn,50)/100,.01,.99),value:effectRGBA(s).slice(0,3)})).sort((a,b)=>a.offset-b.offset);
  const alpha=transparency.map(s=>({offset:clamp(number(s.Lctn)/4096,0,1),mid:clamp(number(s.Mdpn,50)/100,.01,.99),value:[clamp(number(s.Opct,100)/100,0,1)]})).sort((a,b)=>a.offset-b.offset);
  const sampleKeys=(keys,t)=>{if(t<=keys[0].offset)return keys[0].value;for(let i=1;i<keys.length;i++){if(t<=keys[i].offset){const l=keys[i-1],r=keys[i],f=clamp((t-l.offset)/(r.offset-l.offset||1),0,1),u=f<l.mid ? .5*f/l.mid : .5+.5*(f-l.mid)/(1-l.mid);return l.value.map((v,k)=>v+(r.value[k]-v)*u);}}return keys.at(-1).value;};
  const opacity=clamp(number(effect.Opct,100)/100,0,1);
  const sample=t=>[...sampleKeys(stops,clamp(t,0,1)),opacity*(alpha.length?sampleKeys(alpha,clamp(t,0,1))[0]:1)];
  const radians=number(effect.Angl,90)*Math.PI/180,snap=v=>Math.abs(v)<1e-12?0:v,cos=snap(Math.cos(radians)),sin=snap(-Math.sin(radians));
  const documentAligned=effect.Algn===false&&context.width&&context.height,frameWidth=documentAligned?context.width:width,frameHeight=documentAligned?context.height:height;
  const span=Math.max(.001,Math.abs(cos)*frameWidth+Math.abs(sin)*frameHeight),scale=clamp(number(effect['Scl '],100)/100,.01,100);
  const offset=cos*number(effect.Ofst?.Hrzn)*frameWidth/100+sin*number(effect.Ofst?.Vrtc)*frameHeight/100-(documentAligned?cos*((context.x||0)+width/2-frameWidth/2)+sin*((context.y||0)+height/2-frameHeight/2):0);
  let vx=cos*width,vy=sin*height,mode='angle',angle=Math.atan2(vy,vx)*180/Math.PI;
  const length=Math.max(.001,Math.hypot(vx,vy));let a=length/(span*scale),b=.5-.5*a-offset/(span*scale);
  if(effect.Rvrs){a=-a;b=1-b;}
  if(Math.abs(cos)<1e-6){mode='vertical';angle=90;if(vy<0){b+=a;a=-a;}}
  else if(Math.abs(sin)<1e-6){mode='horizontal';angle=0;if(vx<0){b+=a;a=-a;}}
  const keys=[...new Set([0,1,...stops.map(s=>(s.offset-b)/a),...alpha.map(s=>(s.offset-b)/a)])].filter(v=>v>=0&&v<=1).sort((a,b)=>a-b);
  let approximate=!normal(effect)||!!effect.gs99&&!['Gcls','classic'].includes(effect.gs99.value)||[...stops,...alpha].some(s=>s.mid!==.5);
  if(keys.length>8){keys.splice(0,keys.length,...Array.from({length:8},(_,i)=>i/7));approximate=true;}
  return {sample,mode,angle,a,b,keys,approximate,at:(x,y)=>{let t=.5+((x-width/2)*cos+(y-height/2)*sin-offset)/(span*scale);if(effect.Rvrs)t=1-t;return sample(t);}};
}
function over(pixels,i,c,alpha){
  const a=clamp(alpha*c[3],0,1),old=pixels[i+3]/255,out=a+old*(1-a);if(!out)return;
  for(let k=0;k<3;k++)pixels[i+k]=(c[k]*a+pixels[i+k]*old*(1-a))/out;pixels[i+3]=out*255;
}
// Circular grayscale dilation/erosion, O(width * height * radius). Horizontal
// windows use a monotone queue, avoiding a radius-squared loop per glyph pixel.
function disk(alpha,width,height,radius,erode=false){
  if(radius<=0)return alpha;
  const r=Math.ceil(radius),result=new Uint8Array(alpha.length);if(erode)result.fill(255);
  const deque=new Int32Array(width),row=new Uint8Array(width);
  for(let dy=-r;dy<=r;dy++){
    if(Math.abs(dy)>radius)continue;const rx=Math.floor(Math.sqrt(Math.max(0,radius*radius-dy*dy)));
    for(let y=0;y<height;y++){
      const sy=y+dy,base=y*width;if(sy<0||sy>=height){if(erode)result.fill(0,base,base+width);continue;}
      row.set(alpha.subarray(sy*width,(sy+1)*width));let head=0,tail=0,end=-1;
      for(let x=0;x<width;x++){
        const right=Math.min(width-1,x+rx);while(end<right){end++;while(tail>head&&(erode?row[deque[tail-1]]>=row[end]:row[deque[tail-1]]<=row[end]))tail--;deque[tail++]=end;}
        while(tail>head&&deque[head]<x-rx)head++;
        const value=erode&&(x-rx<0||x+rx>=width)?0:row[deque[head]];
        result[base+x]=erode?Math.min(result[base+x],value):Math.max(result[base+x],value);
      }
    }
  }
  return result;
}
// Three separable box passes approximate a Gaussian with bounded, linear work.
export function blurPSDAlpha(alpha,width,height,size){
  const radius=Math.ceil(size/2);if(!radius)return alpha;
  let input=Float32Array.from(alpha),output=new Float32Array(alpha.length);
  for(let pass=0;pass<3;pass++)for(let vertical=0;vertical<2;vertical++){
    const span=vertical?height:width,lines=vertical?width:height,step=vertical?width:1,divisor=radius*2+1;
    for(let line=0;line<lines;line++){
      const base=vertical?line:line*width;let sum=0;
      for(let i=0;i<=Math.min(radius,span-1);i++)sum+=input[base+i*step];
      for(let i=0;i<span;i++){output[base+i*step]=sum/divisor;const remove=i-radius,add=i+radius+1;if(remove>=0)sum-=input[base+remove*step];if(add<span)sum+=input[base+add*step];}
    }
    [input,output]=[output,input];
  }
  return input;
}
export function paintPSDText(pixels,width,height,effects,warnings=[],context={}){
  if(!effects||effects.masterFXSwitch===false)return null;
  const stroke=enabled(effects,'FrFX','frameFXMulti'),shadow=enabled(effects,'DrSh','dropShadowMulti');
  const gradient=enabled(effects,'GrFl','gradientFillMulti');
  const fill=enabled(effects,'SoFi','solidFillMulti'),fillColor=fill?effectRGBA(fill):null;
  if(fill&&!normal(fill))warnings.push('Cached Photoshop text Color Overlay blend uses a normal-blend approximation.');
  const ramp=gradient?psdGradient(gradient,width,height,context):null;
  if(gradient&&!ramp)warnings.push('Unsupported Photoshop text gradient is omitted from cached paint; review its appearance.');
  if(ramp?.approximate)warnings.push('Cached Photoshop text gradient blend, interpolation or midpoint uses an approximation.');
  const effectScale=clamp(number(effects['Scl '],100)/100,0,100);
  const strokeColor=stroke?.PntT?.value;if(stroke&&(strokeColor&&strokeColor!=='SClr'||!normal(stroke)))warnings.push('Photoshop text stroke paint/blend is approximated with its solid color.');
  const radius=stroke?clamp(number(stroke['Sz  '])*effectScale,0,64):0,position=stroke?.Styl?.value||'OutF';
  const outside=position==='InsF'?0:position==='CtrF'?radius/2:radius,inside=position==='InsF'?radius:position==='CtrF'?radius/2:0;
  const angle=number(shadow?.lagl,120)*Math.PI/180,distance=shadow?clamp(number(shadow.Dstn)*effectScale,0,128):0;
  const dx=Math.round(-Math.cos(angle)*distance),dy=Math.round(Math.sin(angle)*distance);
  const shadowSize=shadow?clamp(number(shadow.blur)*effectScale,0,64):0,spread=clamp(number(shadow?.Ckmt)/100,0,1),shadowRadius=shadowSize*spread;
  const softSize=shadowSize*(1-spread),shadowPad=shadowRadius+Math.ceil(softSize*1.5);
  if(softSize)warnings.push('Photoshop shadow soft blur uses a bounded Gaussian approximation.');
  if(shadow&&!normal(shadow))warnings.push('Photoshop shadow blend uses a normal-blend approximation.');
  if(!radius&&!distance&&!shadowSize&&!ramp&&!fill)return null;
  const left=Math.ceil(Math.max(outside,shadowPad-dx,0)),top=Math.ceil(Math.max(outside,shadowPad-dy,0)),right=Math.ceil(Math.max(outside,shadowPad+dx,0)),bottom=Math.ceil(Math.max(outside,shadowPad+dy,0));
  const w=width+left+right,h=height+top+bottom;
  if(w>8192||h>8192||w*h>16777216||w*h*(2*Math.ceil(Math.max(outside,inside,shadowRadius))+1)>128000000){warnings.push('Photoshop effects exceed the cached-paint processing limit.');return {useRenderer:true};}
  const alpha=new Uint8Array(w*h);for(let y=0;y<height;y++)for(let x=0;x<width;x++)alpha[(y+top)*w+x+left]=pixels[(y*width+x)*4+3];
  const out=new Uint8ClampedArray(w*h*4);
  if(shadow){const c=effectRGBA(shadow),shade=blurPSDAlpha(disk(alpha,w,h,shadowRadius),w,h,softSize);for(let y=0;y<h;y++)for(let x=0;x<w;x++){const sx=x-dx,sy=y-dy;if(sx>=0&&sy>=0&&sx<w&&sy<h)over(out,(y*w+x)*4,c,shade[sy*w+sx]/255);}}
  if(context.shadowOnly)return {pixels:out,width:w,height:h,bounds:{x:left?-left:0,y:top?-top:0,width:w,height:h}};
  if(radius){const grown=disk(alpha,w,h,outside),c=effectRGBA(stroke);for(let i=0;i<alpha.length;i++)over(out,i*4,c,grown[i]/255);}
  const face=inside?disk(alpha,w,h,inside,true):alpha;
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){const p=(y*width+x)*4,i=((y+top)*w+x+left)*4,c=[pixels[p],pixels[p+1],pixels[p+2],1];if(fillColor)for(let k=0;k<3;k++)c[k]=c[k]*(1-fillColor[3])+fillColor[k]*fillColor[3];if(ramp){const g=ramp.at(x+.5,y+.5);for(let k=0;k<3;k++)c[k]=c[k]*(1-g[3])+g[k]*g[3];}over(out,i,c,face[i/4]/255);}
  return {pixels:out,width:w,height:h,bounds:{x:left?-left:0,y:top?-top:0,width:w,height:h}};
}
