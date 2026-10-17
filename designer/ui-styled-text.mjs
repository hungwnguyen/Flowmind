export const textStyleDefaults = () => ({shadowWidth:0,shadowX:0,shadowY:0,shadowColor:'#000000ff',faceColor:'#ffffffff',gradient:true,gradientMode:'vertical',gradientBlend:'blend',gradientAngle:90,topLeft:'#ffffffff',topRight:'#ffffffff',bottomLeft:'#fff0c5ff',bottomRight:'#fff0c5ff',stops:[{offset:0,color:'#ffffffff'},{offset:1,color:'#fff0c5ff'}],strokeWidth:2,strokeColor:'#521257ff',outlineWidth:4,outlineColor:'#521257ff',innerOutlineWidth:0,innerOutlineColor:'#ffffffff',extrusionX:0,extrusionY:5,extrusionColor:'#3d0943ff'});
export const plainTextStyleDefaults = () => ({gradient:false,strokeWidth:0,outlineWidth:0,extrusionX:0,extrusionY:0});
export function textEffectEnabled(style,effect){
  if(effect==='shadow')return !!(style.shadowWidth||style.shadowX||style.shadowY);
  if(effect==='gradient')return !!style.gradient;
  if(effect==='stroke')return style.strokeWidth>0;
  if(effect==='outline')return style.outlineWidth>0;
  if(effect==='inner')return style.innerOutlineWidth>0;
  if(effect==='extrusion')return !!(style.extrusionX||style.extrusionY);
  throw Error('Unknown text effect.');
}
export function setTextEffect(layer,effect,enabled,presets=[]){
  const values=resolvedTextStyle(layer,presets);
  if(textEffectEnabled(values,effect)===enabled)return;
  const style={...layer.textStyle},scale=style.scale??1;
  if(effect==='gradient')style.gradient=enabled;
  else{
    const keys=effect==='shadow'?['shadowWidth','shadowX','shadowY']:effect==='stroke'?['strokeWidth']:effect==='outline'?['outlineWidth']:effect==='inner'?['innerOutlineWidth']:['extrusionX','extrusionY'];
    // Inner outline is off by default; enabling it starts from a visible width.
    const defaults={...textStyleDefaults(),innerOutlineWidth:2,shadowWidth:4,shadowX:0,shadowY:2},saved={...style.disabledEffects};
    for(const key of keys){
      if(!enabled)saved[key]=values[key]/scale;
      const [min,max]=widthKeys.includes(key)?[0,64]:[-128,128];
      style[key]=enabled?Math.max(min/scale,Math.min(max/scale,saved[key]??defaults[key])):0;
    }
    style.disabledEffects=saved;
  }
  layer.textStyle=style;
}
// Pixel widths scaled by textStyle.scale. Inner outline never grows the glyph.
export const widthKeys=['strokeWidth','outlineWidth','innerOutlineWidth','shadowWidth'];
const scaledKeys=[...widthKeys,'extrusionX','extrusionY','shadowX','shadowY'];
export function validateTextStyle(layer) {
  if(layer.textRuns!==undefined){
    const data=layer.textRuns;
    if(layer.role!=='text'||!data||typeof data.text!=='string'||data.text.length>512||!Array.isArray(data.colors)||!data.colors.length||data.colors.length>512)throw Error('Invalid text color runs.');
    let end=0;for(const run of data.colors){if(!run||!Number.isInteger(run.start)||run.start!==end||!Number.isInteger(run.length)||run.length<1||run.start+run.length>data.text.length||typeof run.color!=='string'||!/^#[0-9a-f]{8}$/i.test(run.color))throw Error('Invalid text color run.');end+=run.length;}
    if(end!==data.text.length)throw Error('Incomplete text color runs.');
  }
  if(layer.sourceTextPaint!==undefined){
    const paint=layer.sourceTextPaint;
    if(layer.role!=='text'||!paint||typeof paint!=='object'||!layer.image||typeof layer.image.guid!=='string'||!layer.image.guid||typeof paint.signature!=='string'||paint.signature.length>32768)throw Error('Invalid imported text paint.');
    if(paint.bounds){for(const key of ['x','y','width','height'])if(!Number.isFinite(paint.bounds[key])||Math.abs(paint.bounds[key])>16384||(['width','height'].includes(key)&&(paint.bounds[key]<1||paint.bounds[key]>8192)))throw Error('Invalid imported text paint bounds.');if(paint.bounds.width*paint.bounds.height>16777216)throw Error('Invalid imported text paint area.');}
  }
  if(layer.standaloneText!==undefined&&typeof layer.standaloneText!=='boolean')throw Error('Invalid standalone text flag.');
  if(layer.standaloneText&&(layer.role!=='text'||layer.textMeshPro!==true||!layer.textStyle))throw Error('Standalone text requires a styled text layer.');
  if(layer.standaloneText&&layer.tmpSettings?.richText&&/<(?:font|material|sprite|style)(?:[=\s>])/i.test(layer.text||''))throw Error('Standalone text supports formatting tags, but not named font, material, sprite or style tags.');
  if(layer.textStyle===undefined)return;
  const s=layer.textStyle,object=value=>value&&typeof value==='object'&&!Array.isArray(value);
  if(layer.role!=='text'||!layer.textMeshPro||!object(s))throw Error('Styled text requires a TMP text layer and a textStyle object.');
  if((layer.text||'').length>512)throw Error('Styled text supports up to 512 characters per label.');
  if(layer.tmpSettings?.richText&&/<sprite(?:[=\s>])/i.test(layer.text||''))throw Error('Styled text uses font glyphs; TMP inline sprites require ordinary TMP text.');
  if(s.preset!==undefined&&typeof s.preset!=='string')throw Error('Invalid text style preset.');
  for(const [key,min,max]of [['strokeWidth',0,64],['outlineWidth',0,64],['innerOutlineWidth',0,64],['shadowWidth',0,64],['shadowX',-128,128],['shadowY',-128,128],['extrusionX',-128,128],['extrusionY',-128,128],['gradientAngle',-3600,3600],['scale',.001,512]])
    if(s[key]!==undefined&&(!Number.isFinite(s[key])||s[key]<min||s[key]>max))throw Error('Invalid text style '+key+'.');
  if(s.disabledEffects!==undefined){
    if(!object(s.disabledEffects))throw Error('Invalid disabled text effects.');
    for(const [key,value]of Object.entries(s.disabledEffects)){
      const limit=widthKeys.includes(key)?[0,64]:['extrusionX','extrusionY','shadowX','shadowY'].includes(key)?[-128,128]:null;
      if(!limit||!Number.isFinite(value)||value<limit[0]||value>limit[1])throw Error('Invalid disabled text effect '+key+'.');
    }
  }
  const color=value=>typeof value==='string'&&/^#[0-9a-f]{6}([0-9a-f]{2})?$/i.test(value);
  for(const key of ['faceColor','strokeColor','outlineColor','innerOutlineColor','extrusionColor','shadowColor','topLeft','topRight','bottomLeft','bottomRight'])if(s[key]!==undefined&&!color(s[key]))throw Error('Invalid text style color.');
  if(s.gradient!==undefined&&typeof s.gradient!=='boolean')throw Error('Invalid text gradient flag.');
  if(s.gradientMode!==undefined&&!['single','horizontal','vertical','four-corners','angle'].includes(s.gradientMode))throw Error('Invalid text gradient mode.');
  if(s.gradientBlend!==undefined&&!['blend','fixed'].includes(s.gradientBlend))throw Error('Invalid text gradient blend.');
  if(s.alphaStops!==undefined){
    if(!Array.isArray(s.alphaStops)||s.alphaStops.length<2||s.alphaStops.length>8)throw Error('Text gradients require 2–8 alpha keys.');
    let previous=-1;for(const stop of s.alphaStops){if(!object(stop)||!Number.isFinite(stop.offset)||stop.offset<previous||stop.offset<0||stop.offset>1||!Number.isFinite(stop.alpha)||stop.alpha<0||stop.alpha>1)throw Error('Invalid text gradient alpha key.');previous=stop.offset;}
  }
  if(s.stops!==undefined){
    if(!Array.isArray(s.stops)||s.stops.length<2||s.stops.length>8)throw Error('Text gradients require 2–8 stops.');
    let previous=-1;for(const stop of s.stops){if(!object(stop)||!Number.isFinite(stop.offset)||stop.offset<previous||stop.offset<0||stop.offset>1||!color(stop.color))throw Error('Invalid text gradient stop.');previous=stop.offset;}
  }
  if(layer.tmpMaterial&&Object.keys(layer.tmpMaterial).length)throw Error('Styled text uses textStyle instead of tmpMaterial overrides.');
  if(s.innerOutlineWidth>0&&!layer.standaloneText)throw Error('Inner Outline requires VinaGen standalone text; TMP styled text cannot render it.');
  if((s.shadowWidth||0)*(s.scale??1)>64||Math.abs((s.shadowX||0)*(s.scale??1))>128||Math.abs((s.shadowY||0)*(s.scale??1))>128)throw Error('Scaled text shadow exceeds its pixel limits.');
  if((s.innerOutlineWidth||0)*(s.scale??1)>64)throw Error('Scaled text style exceeds its pixel limits.');
}
export function resolvedTextStyle(layer,presets=[]) {
  const inherited={...(presets.find(p=>p.key===layer.textStyle?.preset)?.values||{}),...layer.textStyle};
  const style={...textStyleDefaults(),...inherited,gradientMode:inherited.gradientMode??(inherited.gradientAngle===undefined?'vertical':'angle')};
  for(const key of scaledKeys)style[key]*=style.scale??1;
  return style;
}
// Keep in sync with VinaGenUIStudioStyledText.PreviewInput.
export function styledTextInput(layer) {
  const input={id:'preview',name:'Text preview',role:'text',x:0,y:0,parentId:'',rotation:0,opacity:1,visible:true,clip:false};
  for(const key of ['width','height','text','fontSize','textColor','fontGuid','textAlign','bold','textMeshPro','standaloneText','textRenderer','tmpFont','tmpSettings','tmpMaterial','textStyle','textCurve','psdImportFolder'])if(layer[key]!=null)input[key]=layer[key];
  if(layer.textRuns?.text===layer.text&&!layer.tmpSettings?.richText)input.textRuns=layer.textRuns;
  return JSON.parse(JSON.stringify(input));
}
const stable=value=>Array.isArray(value)?value.map(stable):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(key=>[key,stable(value[key])])):value;
export const textPaintSignature=layer=>JSON.stringify(stable(styledTextInput(layer)));
export function importedTextPaint(layer){
  const paint=layer.sourceTextPaint;
  return layer.role==='text'&&layer.image?.guid&&paint?.signature===textPaintSignature(layer)?{...paint,image:layer.image}:null;
}
const paintKey=(input,revision)=>{try{revision=JSON.parse(revision);}catch{}return JSON.stringify(stable([input,revision]));};
// Saved rasters load like images. Unsaved edits use the exact native renderer;
// identical paint shares a capture and placement never changes its cache key.
export function styledTextPreview({request,onError=()=>{},saved=()=>null}) {
  const cache=new Map(),queue=new Map(),states=new WeakMap(),pending=new Map();let active=false,timer,cacheBytes=0;
  const remember=(key,result)=>{
    if(cache.has(key)){cacheBytes-=cache.get(key).dataUrl?.length||0;cache.delete(key);}
    cache.set(key,result);cacheBytes+=result.dataUrl?.length||0;
    while(cache.size>128||cacheBytes>16*1024*1024){const oldest=cache.keys().next().value;cacheBytes-=cache.get(oldest).dataUrl?.length||0;cache.delete(oldest);}
  };
  const schedule=(delay=16)=>{if(!active&&!timer)timer=setTimeout(flush,delay);};
  const flush=async()=>{
    timer=null;if(active||!queue.size)return;
    const [content,job]=queue.entries().next().value;queue.delete(content);
    if(states.get(content)!==job.state){job.state.settle();schedule(0);return;}
    active=true;
    try{
      const result=await request('ui-styled-text-preview',{layer:job.input});
      remember(job.key,result);
      job.apply(result);
      for(const [other,waiting]of queue)if(waiting.key===job.key){queue.delete(other);waiting.apply(result);}
    }catch(error){if(states.get(content)===job.state){content.dataset.styledTextStatus='error';job.state.image.removeAttribute('src');job.state.image.alt='Text preview unavailable';onError(error.message);}}
    finally{job.state.settle();active=false;schedule(0);}
  };
  return {
    paint(content,layer,revision='') {
      const input=styledTextInput(layer),key=paintKey(input,revision);
      let state=states.get(content);if(state?.key===key)return;
      state?.settle();
      queue.delete(content);
      let image=content.querySelector('.ui-styled-text-preview');
      if(!image){content.replaceChildren();image=document.createElement('img');image.className='ui-styled-text-preview';image.alt=layer.text||'';image.draggable=false;image.loading='eager';image.decoding='async';content.append(image);}
      let complete;const promise=new Promise(resolve=>complete=resolve);pending.set(promise,content);
      state={key,image,settle:()=>{pending.delete(promise);complete();}};states.set(content,state);content.dataset.styledTextStatus='pending';
      const apply=result=>{
        if(states.get(content)!==state)return;
        Object.assign(image.style,{position:'absolute',left:(result.left??-result.padding)+'px',top:(result.top??-result.padding)+'px',width:result.width+'px',height:result.height+'px',maxWidth:'none',objectFit:'fill',pointerEvents:'none'});
        image.src=result.dataUrl;image.alt=layer.text||'';content.dataset.styledTextStatus='ready';state.settle();
      };
      const prepared=saved(layer);
      if(prepared&&paintKey(prepared.input,prepared.revision)===key){remember(key,prepared.result);apply(prepared.result);return;}
      if(cache.has(key)){const result=cache.get(key);cache.delete(key);cache.set(key,result);apply(result);return;}
      queue.set(content,{key,input,state,apply});schedule();
    },
    pending(root){return [...pending].filter(([,content])=>!root||root.contains(content)).map(([promise])=>promise);},
    cancel(content){queue.delete(content);states.get(content)?.settle();states.delete(content);delete content.dataset.styledTextStatus;},
  };
}
