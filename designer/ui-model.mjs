import {validateTextCurve} from './ui-text-curve.mjs';
import {validateComments} from './canvas-comments.mjs';
import {validateGradient} from './ui-paints.mjs';
import {validateTextStyle,resolvedTextStyle,plainTextStyleDefaults} from './ui-styled-text.mjs';
export const roles = ['button','image','text','group','empty'];
export const blendModes=['normal','pass-through','multiply','screen','overlay','darken','lighten','color-dodge','color-burn','hard-light','soft-light','difference','exclusion','hue','saturation','color','luminosity'];
export const containerRoles = ['group','empty','image','button'];
export const parentRoles = [...containerRoles,'text'];
export const groupTypes = [['rect','Group'],['horizontal','Horizontal layout'],['vertical','Vertical layout'],['grid','Grid layout']];
export const canonicalRole = role => ['background','frame','rectangle'].includes(role)?'image':role;
export const imageModes = [['preserve_aspect','Preserve Aspect'],['nine_slice','9-slice'],['none','None']];
export const imageMode = layer => layer.imageMode ?? (layer.sliced===true?'nine_slice':layer.imageFit==='stretch'?'none':'preserve_aspect');
export const textRenderers = [['text','Text'],['vinaGenText','Styled Text']];
// Read older documents through VinaGenText while preserving their authored effects.
export const textRenderer = layer => ['vinaGenStyledText','textMeshPro'].includes(layer.textRenderer)?'vinaGenText':layer.textRenderer ?? (layer.standaloneText===true?'vinaGenText':layer.textMeshPro===true?'vinaGenText':'text');
export function normalizeTextRenderer(layer) {
  for(const key of ['textMeshPro','standaloneText'])if(layer[key]!==undefined&&typeof layer[key]!=='boolean')throw Error('Invalid text renderer flag.');
  const mode=textRenderer(layer);
  if(layer.textRenderer!==undefined&&(!textRenderers.some(([value])=>value===mode)||layer.role!=='text'))throw Error('Text renderer requires a text layer and Text, TextMesh Pro or VinaGenText.');
  if(layer.role!=='text')return;
  layer.textRenderer=mode;layer.textMeshPro=mode!=='text';
  if(mode==='vinaGenText'){layer.standaloneText=true;layer.textStyle??=plainTextStyleDefaults();}
  else delete layer.standaloneText;
}
export function setTextRenderer(layer,mode) {
  if(!textRenderers.some(([value])=>value===mode))throw Error('Unknown text renderer.');
  if(textRenderer(layer)===mode)return;
  layer.textRenderer=mode;
  delete layer.tmpMaterial;
  if(mode!=='vinaGenText')delete layer.textStyle;
  normalizeTextRenderer(layer);
}
export function setImageMode(layer,mode) {
  if(!imageModes.some(([value])=>value===mode))throw Error('Unknown image scaling mode.');
  layer.imageMode=mode;delete layer.imageFit;delete layer.sliced;
}
// Shared sources are overwritten once. Use the largest layer, including non-sliced uses.
export function sliceExportLayers(doc) {
  const groups=new Map();
  for(const layer of doc.layers.filter(layer=>layer.image&&['image','button'].includes(canonicalRole(layer.role)))) {
    const key=layer.image.guid,group=groups.get(key)||[];group.push(layer);groups.set(key,group);
  }
  const area=layer=>Math.round(layer.width)*Math.round(layer.height);
  return [...groups.values()].filter(group=>group.some(layer=>imageMode(layer)==='nine_slice')).map(group=>group.sort((a,b)=>area(b)-area(a)||Number(imageMode(b)==='nine_slice')-Number(imageMode(a)==='nine_slice')||(a.id<b.id?-1:a.id>b.id?1:0))[0]);
}
export const anchorPresets = [
  ['top-left','top-center','top-right','stretch-top'],
  ['middle-left','center','middle-right','stretch-middle'],
  ['bottom-left','bottom-center','bottom-right','stretch-bottom'],
  ['stretch-left','stretch-center','stretch-right','stretch']
];
export function anchorRange(anchor='top-left') {
  const row=anchorPresets.findIndex(items=>items.includes(anchor)),column=anchorPresets[row]?.indexOf(anchor);
  if(row<0)throw Error('Unknown RectTransform anchor.');
  return {min:{x:column===3?0:column/2,y:row===3?0:row/2},max:{x:column===3?1:column/2,y:row===3?1:row/2}};
}
// Keep all four corners; only a one-pixel band crossing the center stretches.
export function centerSlice(width,height,targetWidth,targetHeight) {
  const x=Math.max(0,(width-1)/2),y=Math.max(0,(height-1)/2);
  return {x,y,borderX:Math.min(x,targetWidth/2),borderY:Math.min(y,targetHeight/2)};
}
export const copy = value => JSON.parse(JSON.stringify(value));
export const tmpSettingNumbers = [['fontSizeMin',18,1,512],['fontSizeMax',72,1,512],['characterSpacing',0,-1000,1000],['wordSpacing',0,-1000,1000],['lineSpacing',0,-1000,1000],['paragraphSpacing',0,-1000,1000],['marginLeft',0,0,8192],['marginTop',0,0,8192],['marginRight',0,0,8192],['marginBottom',0,0,8192]];
export function validateTMP(layer) {
  if(layer.textMeshPro!==undefined&&typeof layer.textMeshPro!=='boolean')throw Error('Invalid TextMesh Pro flag.');
  if(layer.textMeshPro&&layer.role!=='text')throw Error('TextMesh Pro requires a text layer.');
  for(const key of ['tmpFont'])if(layer[key]!==undefined&&typeof layer[key]!=='string')throw Error('Invalid TMP font.');
  const object=value=>value&&typeof value==='object'&&!Array.isArray(value);
  if(layer.tmpSettings!==undefined&&!object(layer.tmpSettings))throw Error('Invalid TMP settings.');
  const s=layer.tmpSettings||{};
  for(const key of ['autoSize','wordWrapping','richText','italic'])if(s[key]!==undefined&&typeof s[key]!=='boolean')throw Error('Invalid TMP '+key+'.');
  for(const [key,,min,max]of tmpSettingNumbers)if(s[key]!==undefined&&(!Number.isFinite(s[key])||s[key]<min||s[key]>max))throw Error('Invalid TMP '+key+'.');
  if((s.fontSizeMin??18)>(s.fontSizeMax??72))throw Error('TMP minimum font size exceeds maximum.');
  if(s.verticalAlign!==undefined&&!['top','middle','bottom'].includes(s.verticalAlign))throw Error('Invalid TMP vertical alignment.');
  if(s.overflow!==undefined&&!['overflow','truncate','ellipsis','masking'].includes(s.overflow))throw Error('Invalid TMP overflow.');
  if(layer.tmpMaterial!==undefined&&!object(layer.tmpMaterial))throw Error('Invalid TMP material.');
  const m=layer.tmpMaterial||{};
  if(m.preset!==undefined&&typeof m.preset!=='string')throw Error('Invalid TMP material preset.');
  for(const bucket of ['floats','colors','keywords']){
    if(m[bucket]===undefined)continue;if(!object(m[bucket]))throw Error('Invalid TMP material '+bucket+'.');
    for(const [name,value]of Object.entries(m[bucket])){
      if(bucket==='floats'&&(!Number.isFinite(value)||Math.abs(value)>1000)||bucket==='colors'&&(typeof value!=='string'||!/^#[0-9a-f]{6}([0-9a-f]{2})?$/i.test(value))||bucket==='keywords'&&(!['OUTLINE_ON','UNDERLAY_ON','UNDERLAY_INNER','GLOW_ON','BEVEL_ON'].includes(name)||typeof value!=='boolean'))throw Error('Invalid TMP material property.');
    }
  }
  if(m.keywords?.UNDERLAY_ON&&m.keywords?.UNDERLAY_INNER)throw Error('Choose one TMP underlay mode.');
}
// Use the rectangle center in its immediate parent, matching RectTransform anchors.
// Screen orientation sets the center region; nested layers still use parent-local cells.
// Portrait uses 2 x 4, landscape 4 x 2; square screens retain the existing 4 x 4.
export function automaticAnchor(layer,parent,screen=parent) {
  const centerX=screen.height>screen.width?2:4,centerY=screen.width>screen.height?2:4;
  const region=(center,size,cells)=>{const edge=(6-cells)/2;return center<size*edge/6?0:center>size*(6-edge)/6?2:1;};
  return anchorPresets[region(layer.y+layer.height/2,parent.height,centerY)][region(layer.x+layer.width/2,parent.width,centerX)];
}
export function adjustAnchors(doc,previous=null,byId=layerIndex(doc)) {
  const old=previous?layerIndex(previous):null,orientationChanged=previous&&Math.sign(doc.width-doc.height)!==Math.sign(previous.width-previous.height);
  for(const layer of doc.layers){
    const parent=byId.get(layer.parentId)||doc,before=old?.get(layer.id),oldParent=before&&(old.get(before.parentId)||previous);
    if(!before||orientationChanged||['x','y','width','height','parentId'].some(key=>layer[key]!==before[key])||parent.width!==oldParent.width||parent.height!==oldParent.height)
      layer.anchor=automaticAnchor(layer,parent,doc);
  }
}
export function sliceImageRects(width,height,targetWidth,targetHeight,borders=null) {
  const {x,y}=centerSlice(width,height,targetWidth,targetHeight);
  const left=borders?.left??x,right=borders?.right??x,top=borders?.top??y,bottom=borders?.bottom??y;
  // Unity Image.GetAdjustedBorders scales opposing borders together on each
  // axis, preserving asymmetric caps even when the center collapses to zero.
  const scaleX=left+right>targetWidth?targetWidth/(left+right):1,scaleY=top+bottom>targetHeight?targetHeight/(top+bottom):1;
  const sx=[0,left,width-right,width],sy=[0,top,height-bottom,height],dx=[0,left*scaleX,targetWidth-right*scaleX,targetWidth],dy=[0,top*scaleY,targetHeight-bottom*scaleY,targetHeight],rects=[];
  if(scaleX<1)dx[2]=dx[1];if(scaleY<1)dy[2]=dy[1];
  for(let row=0;row<3;row++)for(let column=0;column<3;column++){
    const rect=[sx[column],sy[row],sx[column+1]-sx[column],sy[row+1]-sy[row],dx[column],dy[row],dx[column+1]-dx[column],dy[row+1]-dy[row]];
    if(rect[2]>0&&rect[3]>0&&rect[6]>0&&rect[7]>0)rects.push(rect);
  }
  return rects;
}
export const uid = () => globalThis.crypto?.randomUUID?.() || 'ui-' + Date.now().toString(36) + Math.random().toString(36).slice(2);
export function newDocument(config = {}) {
  return {schema:'vinagen_ui',schemaVersion:1,name:'Untitled screen',width:config.width || 1920,height:config.height || 1080,layers:[]};
}
export function newLayer(role, x=80,y=80) {
  const curved=role==='text-path';if(curved)role='text';
  const shape=['rectangle','line','arrow','ellipse','polygon','star'].includes(role)?role:null;
  const name=shape?shape[0].toUpperCase()+shape.slice(1):null;
  if(shape)role='image';
  role=canonicalRole(role);
  return {...(curved?{textCurve:{angle:90},name:'Text on path'}:{}),...(shape?{shape,stroke:'#000000',strokeWidth:['line','arrow'].includes(shape)?2:0,shapeSides:shape==='star'?5:3,starInnerRadius:.45,shapeFlipX:false,shapeFlipY:false}:{}),...(['image','button'].includes(role)?{imageMode:'preserve_aspect'}:{}),id:uid(),name:curved?'Text on path':name||role[0].toUpperCase()+role.slice(1),role,parentId:'',x,y,width:role==='text'?280:role==='button'?240:role==='frame'?640:160,height:role==='text'?64:role==='button'?72:role==='frame'?360:160,
    fill:['text','group','empty'].includes(role) ? '#ffffff00':'#ffffff',textColor:'#ffffff',opacity:1,rotation:0,visible:true,locked:false,text:role==='text'?'Your text':'',fontSize:24,fontGuid:'',textAlign:'center',anchor:'top-left',...(role==='text'?{textRenderer:'vinaGenText',textMeshPro:true,standaloneText:true,textStyle:plainTextStyleDefaults()}: {})};
}
export function validateDocument(doc) {
  if (doc?.schema!=='vinagen_ui' || doc.schemaVersion!==1 || !Array.isArray(doc.layers) || doc.layers.length>1000) throw Error('Expected a VinaGen UI JSON document with up to 1000 layers.');
  validateComments(doc.comments);
  const ids=new Map();
  for(const key of ['width','height']) if(!Number.isFinite(doc[key]) || doc[key]<1 || doc[key]>8192) throw Error('Canvas dimensions must be 1–8192.');
  for(const layer of doc.layers) {
    if(layer)layer.role=canonicalRole(layer.role);
    if(!layer?.id || ids.has(layer.id) || !roles.includes(layer.role)) throw Error('Layer IDs must be unique and labels must be valid.');
    ids.set(layer.id,layer);
    validateGradient(layer.fillGradient);
    if(layer.blendMode!==undefined&&!blendModes.includes(layer.blendMode))throw Error('Invalid layer blend mode.');
    if(layer.fillGradient&&!['image','button'].includes(layer.role))throw Error('Gradient fills require an Image or Button.');
    if(layer.canvasRoot!==undefined&&(typeof layer.canvasRoot!=='boolean'||layer.canvasRoot&&!containerRoles.includes(layer.role)))throw Error('Canvas Root requires a container and a boolean label.');
    validateTextCurve(layer);normalizeTextRenderer(layer);validateTMP(layer);validateTextStyle(layer);
    if(layer.shape!==undefined){
      if(!['rectangle','line','arrow','ellipse','polygon','star'].includes(layer.shape)||!['image','button'].includes(layer.role)||layer.image)throw Error('Invalid editable shape.');
      for(const [key,min,max]of [['strokeWidth',0,256],['shapeSides',3,64],['starInnerRadius',.01,.99]])if(layer[key]!==undefined&&(!Number.isFinite(layer[key])||layer[key]<min||layer[key]>max||key==='shapeSides'&&!Number.isInteger(layer[key])))throw Error('Invalid shape '+key+'.');
      for(const key of ['shapeFlipX','shapeFlipY'])if(layer[key]!==undefined&&typeof layer[key]!=='boolean')throw Error('Invalid shape direction.');
      if(layer.stroke!==undefined&&!/^#[0-9a-f]{6}([0-9a-f]{2})?$/i.test(layer.stroke))throw Error('Invalid stroke color.');
    }
    if(layer.imageMode!==undefined&&!imageModes.some(([value])=>value===layer.imageMode))throw Error('Unknown image scaling mode.');
    delete layer.sliceAxis; // Legacy directional slices now use both axes.
    if(layer.imageFit!==undefined&&!['fit','stretch'].includes(layer.imageFit))throw Error('Unknown image scaling mode.');
    anchorRange(layer.anchor);
    if(layer.sliced!==undefined&&typeof layer.sliced!=='boolean')throw Error('Invalid 9-slice flag.');
    if(layer.groupType!==undefined&&(!groupTypes.some(([type])=>type===layer.groupType)||!containerRoles.includes(layer.role)))throw Error('Invalid layout type.');
    if(layer.layout!==undefined){
      const layout=layer.layout;if(!layout||!['horizontal','vertical','grid'].includes(layout.direction))throw Error('Invalid group layout.');
      for(const [key,min,max]of [['gap',0,8192],['padding',0,8192],['columns',1,1000],['cellWidth',1,8192],['cellHeight',1,8192]])if(layout[key]!==undefined&&(!Number.isFinite(layout[key])||layout[key]<min||layout[key]>max||['padding','columns'].includes(key)&&!Number.isInteger(layout[key])))throw Error('Invalid layout '+key+'.');
      if(['horizontal','vertical','grid'].includes(layer.groupType)&&layout.direction!==layer.groupType)throw Error('Group type and layout must match.');
    }
    for(const key of ['interactable','blocksRaycasts','ignoreParentGroups','canvasGroup'])if(layer[key]!==undefined&&typeof layer[key]!=='boolean')throw Error('Invalid '+key+' flag.');
    for(const key of ['x','y','width','height']) if(!Number.isFinite(layer[key]) || Math.abs(layer[key])>100000 || (['width','height'].includes(key) && (layer[key]<1 || layer[key]>8192))) throw Error('Invalid layer dimensions.');
    for(const [key,min,max] of [['opacity',0,1],['rotation',-3600,3600],['fontSize',1,512]]) if(layer[key]!==undefined&&(!Number.isFinite(layer[key])||layer[key]<min||layer[key]>max)) throw Error('Invalid '+key+'.');
  }
  for(const layer of doc.layers) { let p=layer.parentId; const seen=new Set([layer.id]); while(p) { const parent=ids.get(p); if(!parent || !parentRoles.includes(parent.role) || seen.has(p) || seen.size>64) throw Error('Invalid layer hierarchy.'); if(layer.canvasRoot&&parent.canvasRoot)throw Error('Canvas Roots cannot be nested. Remove the label from the parent or child.'); seen.add(p); p=parent.parentId; } }
  return doc;
}
// Design-board positions are independent of each popup's position in Unity.
export const screenSized=(layer,screen)=>Math.abs(layer.width-screen.width)<.01&&Math.abs(layer.height-screen.height)<.01;
export function isScreenRoot(layer,screen,doc){
  if(layer.canvasRoot===true)return true;
  if(layer.parentId||!containerRoles.includes(layer.role)||!screenSized(layer,screen))return false;
  const included=doc?descendants(doc,[layer.id]):new Set();
  return !doc?.layers.some(child=>child.id!==layer.id&&included.has(child.id)&&child.canvasRoot===true);
}
export function screenAnchors(doc){for(const layer of doc.layers)if(screenSized(layer,doc))layer.anchor='stretch';}
// Import boundaries recalculate every layer, including untouched PSD geometry.
// Keep board coordinates and hierarchy; only the Canvas copy centers screen roots.
export function recalculateAnchors(doc,autoAdjust=true) {
  if(autoAdjust)adjustAnchors(doc);
  screenAnchors(doc);
  for(const layer of doc.layers)if(isScreenRoot(layer,doc,doc))layer.anchor=screenSized(layer,doc)?'stretch':'center';
  return doc;
}
export function canvasImportDocument(doc) {
  const result=copy(validateDocument(doc));screenAnchors(result);
  const marked=result.layers.filter(layer=>isScreenRoot(layer,result,result));
  if(!marked.length)return result;
  const included=descendants(result,marked.map(layer=>layer.id));
  result.layers=result.layers.filter(layer=>included.has(layer.id));
  for(const layer of marked){layer.canvasRoot=true;layer.parentId='';layer.x=(result.width-layer.width)/2;layer.y=(result.height-layer.height)/2;layer.anchor=screenSized(layer,result)?'stretch':'center';}
  return result;
}
export function descendants(doc, ids) {
  const result = new Set(ids), children=new Map(), queue=[...result];
  for(const layer of doc.layers)if(layer.parentId){if(!children.has(layer.parentId))children.set(layer.parentId,[]);children.get(layer.parentId).push(layer.id);}
  for(let index=0;index<queue.length;index++)for(const id of children.get(queue[index])||[])if(!result.has(id)){result.add(id);queue.push(id);}
  return result;
}
// Scope indexes to one operation so in-place edits and document switches cannot leave stale parents.
export const layerIndex = doc => new Map(doc.layers.map(layer=>[layer.id,layer]));
// Unity traverses parents before children, and later siblings draw above earlier ones.
export function layerHierarchy(doc) {
  const children=new Map(),result=[];
  for(const layer of doc.layers){const parent=layer.parentId||'';if(!children.has(parent))children.set(parent,[]);children.get(parent).push(layer);}
  const visit=(parent,depth)=>{for(const [siblingIndex,layer]of (children.get(parent)||[]).entries()){result.push({layer,depth,siblingIndex});visit(layer.id,depth+1);}};
  visit('',0);return result;
}
export function layerHitStack(doc,point,imageHitTest=()=>true) {
  const byId=layerIndex(doc),poses=new Map(),hits=[],states=new Map();
  for(const {layer}of layerHierarchy(doc)){
    const parent=states.get(layer.parentId),pose=worldPose(doc,layer,byId,poses),local=rotatePoint({x:point.x-pose.x,y:point.y-pose.y},-pose.rotation);
    local.x+=layer.width/2;local.y+=layer.height/2;
    const inside=local.x>=0&&local.y>=0&&local.x<layer.width&&local.y<layer.height;
    const eligible=(!parent||parent.childrenEligible)&&!layer.locked&&layer.visible!==false&&(layer.opacity??1)>0;
    states.set(layer.id,{childrenEligible:eligible&&(!layer.clip||inside)});
    if(eligible&&inside&&imageHitTest(layer,local))hits.push(layer);
  }
  return hits.reverse();
}
// A marquee contains the complete rendered rectangle, including inherited rotation.
export function marqueeLayerIds(doc,start,end) {
  const left=Math.min(start.x,end.x),top=Math.min(start.y,end.y),right=Math.max(start.x,end.x),bottom=Math.max(start.y,end.y);
  const byId=layerIndex(doc),poses=new Map(),eligible=new Map(),ids=[];
  for(const {layer}of layerHierarchy(doc)){
    const selectable=eligible.get(layer.parentId)!==false&&!layer.locked&&layer.visible!==false&&(layer.opacity??1)>0;
    eligible.set(layer.id,selectable);if(!selectable)continue;
    const pose=worldPose(doc,layer,byId,poses),angle=pose.rotation*Math.PI/180;
    const width=Math.abs(layer.width*Math.cos(angle))+Math.abs(layer.height*Math.sin(angle)),height=Math.abs(layer.width*Math.sin(angle))+Math.abs(layer.height*Math.cos(angle));
    if(pose.x-width/2>=left-1e-7&&pose.y-height/2>=top-1e-7&&pose.x+width/2<=right+1e-7&&pose.y+height/2<=bottom+1e-7)ids.push(layer.id);
  }
  return ids;
}
export function imageSourcePoint(layer,point,width,height,borders=null) {
  const mode=imageMode(layer);
  if(mode==='nine_slice'){
    for(const [sx,sy,sw,sh,dx,dy,dw,dh]of sliceImageRects(width,height,layer.width,layer.height,borders))
      if(point.x>=dx&&point.x<dx+dw&&point.y>=dy&&point.y<dy+dh)return{x:sx+(point.x-dx)*sw/dw,y:sy+(point.y-dy)*sh/dh};
    return null;
  }
  const scale=mode==='preserve_aspect'?Math.min(layer.width/width,layer.height/height):null;
  const renderedWidth=scale===null?layer.width:width*scale,renderedHeight=scale===null?layer.height:height*scale;
  const x=(point.x-(layer.width-renderedWidth)/2)*width/renderedWidth,y=(point.y-(layer.height-renderedHeight)/2)*height/renderedHeight;
  return x>=0&&x<width&&y>=0&&y<height?{x,y}:null;
}
export function roots(doc, ids, byId=layerIndex(doc)) {const selected=new Set(ids); return doc.layers.filter(l=> {if(!selected.has(l.id)) return false; let p=l.parentId; while(p) {if(selected.has(p)) return false;p=byId.get(p)?.parentId;} return true;});}
export function duplicate(doc, ids, offset=24) {
  const top=roots(doc,ids), all=descendants(doc,top.map(l=>l.id));
  const selected=doc.layers.filter(l=>all.has(l.id));
  if(doc.layers.length+selected.length>1000) throw Error('UI documents support up to 1000 layers.');
  const map=new Map(selected.map(l=>[l.id,uid()]));
  for(const layer of selected) { const next=copy(layer);next.id=map.get(layer.id);next.name+=' copy';if(map.has(next.parentId)) next.parentId=map.get(next.parentId); else {next.x+=offset;next.y+=offset;} doc.layers.push(next); }
  return top.map(l=>map.get(l.id));
}
export function groupLayers(doc, ids, type='rect') {
  const selected=roots(doc,ids); if(!selected.length) return [];
  if(!groupTypes.some(([value])=>value===type))throw Error('Unknown layout type.');
  if(doc.layers.length>=1000) throw Error('Layer limit reached.');
  // Use the nearest shared ancestor; selected parents retain their own descendants.
  const byId=new Map(doc.layers.map(layer=>[layer.id,layer])),ancestors=layer=>{const result=[];let p=layer.parentId||'';while(p){result.push(p);p=byId.get(p)?.parentId||'';}return [...result,''];};
  if(selected.some(layer=>[layer.id,...ancestors(layer)].some(id=>byId.get(id)?.locked)))throw Error('Unlock selected layers and their parents before grouping.');
  const parentId=ancestors(selected[0]).find(id=>selected.every(layer=>ancestors(layer).includes(id))),parent=byId.get(parentId),poses=new Map(),pose=parent?worldPose(doc,parent,byId,poses):{x:0,y:0,rotation:0};
  const rects=selected.map(layer=>{const world=worldPose(doc,layer,byId,poses),center=rotatePoint({x:world.x-pose.x,y:world.y-pose.y},-pose.rotation),angle=(world.rotation-pose.rotation)*Math.PI/180,w=Math.abs(layer.width*Math.cos(angle))+Math.abs(layer.height*Math.sin(angle)),h=Math.abs(layer.width*Math.sin(angle))+Math.abs(layer.height*Math.cos(angle));return{x:center.x+(parent?parent.width/2:0)-w/2,y:center.y+(parent?parent.height/2:0)-h/2,width:w,height:h};});
  const x=Math.min(...rects.map(l=>l.x)),y=Math.min(...rects.map(l=>l.y));
  const group={...newLayer('group',x,y),groupType:type,parentId,width:Math.max(...rects.map(l=>l.x+l.width))-x,height:Math.max(...rects.map(l=>l.y+l.height))-y};
  if(group.width>8192||group.height>8192)throw Error('Group dimensions must be at most 8192.');
  doc.layers.splice(Math.min(...selected.map(l=>doc.layers.indexOf(l))),0,group);
  moveLayers(doc,selected.map(layer=>layer.id),group.id);
  if(['horizontal','vertical','grid'].includes(type))autoLayout(doc,group.id,type);
  return [group.id];
}
export function worldRect(doc, layer, byId=layerIndex(doc)) {
  let x=layer.x,y=layer.y,p=layer.parentId;
  while(p) {const parent=byId.get(p);if(!parent) break;x+=parent.x;y+=parent.y;p=parent.parentId;}
  return {x,y,width:layer.width,height:layer.height};
}
// CSS and Unity rotate about rectangle centers; reparenting preserves this world pose.
export function worldPose(doc,layer,byId=layerIndex(doc),poses=new Map()) {
  if(poses.has(layer.id))return poses.get(layer.id);
  const parent=byId.get(layer.parentId),rotation=layer.rotation||0;
  let result;
  if(!parent)result={x:layer.x+layer.width/2,y:layer.y+layer.height/2,rotation};
  else{const pose=worldPose(doc,parent,byId,poses),offset=rotatePoint({x:layer.x+layer.width/2-parent.width/2,y:layer.y+layer.height/2-parent.height/2},pose.rotation);result={x:pose.x+offset.x,y:pose.y+offset.y,rotation:pose.rotation+rotation};}
  poses.set(layer.id,result);return result;
}
// Freeze world-space geometry once per drag; the selection moves as one rigid unit.
export function moveSnapContext(doc,ids) {
  const byId=layerIndex(doc),poses=new Map(),selected=roots(doc,ids,byId),excluded=descendants(doc,selected.map(l=>l.id)),parents=new Set(selected.map(l=>l.parentId||''));
  const bounds=layer=>{const pose=worldPose(doc,layer,byId,poses),angle=pose.rotation*Math.PI/180,width=Math.abs(layer.width*Math.cos(angle))+Math.abs(layer.height*Math.sin(angle)),height=Math.abs(layer.width*Math.sin(angle))+Math.abs(layer.height*Math.cos(angle));return{id:layer.id,x:pose.x-width/2,y:pose.y-height/2,width,height};};
  const rects=selected.map(bounds);if(!rects.length)return null;
  const x=Math.min(...rects.map(r=>r.x)),y=Math.min(...rects.map(r=>r.y)),moving={x,y,width:Math.max(...rects.map(r=>r.x+r.width))-x,height:Math.max(...rects.map(r=>r.y+r.height))-y};
  const visible=layer=>{for(let item=layer;item;item=byId.get(item.parentId))if(item.visible===false)return false;return true;};
  const targets=[{id:'',x:0,y:0,width:doc.width,height:doc.height,container:true}];
  for(const layer of doc.layers)if(!excluded.has(layer.id)&&visible(layer)&&(parents.has(layer.parentId||'')||parents.has(layer.id)))targets.push({...bounds(layer),container:parents.has(layer.id)});
  const pairs={x:[],y:[]};
  for(const axis of ['x','y']){const size=axis==='x'?'width':'height',cross=axis==='x'?'y':'x',crossSize=axis==='x'?'height':'width',sorted=targets.filter(r=>!r.container).sort((a,b)=>a[axis]-b[axis]);
    for(let i=0;i<sorted.length;i++)for(let j=i+1;j<sorted.length;j++){const a=sorted[i],b=sorted[j];if(b[axis]>=a[axis]+a[size]&&Math.min(a[cross]+a[crossSize],b[cross]+b[crossSize])>Math.max(a[cross],b[cross])){pairs[axis].push([a,b]);break;}}
  }
  return {moving,targets,pairs};
}
export function snapMove(context,delta,{zoom=1,enabled=true,axis=null}={}) {
  const result={delta:{...delta},guides:[]};if(axis)result.delta[axis==='x'?'y':'x']=0;
  if(!context||!enabled)return result;
  const tolerance=6/Math.max(.001,zoom),epsilon=1e-7;
  for(const key of ['x','y']){
    if(axis&&axis!==key)continue;
    const size=key==='x'?'width':'height',cross=key==='x'?'y':'x',crossSize=key==='x'?'height':'width',moving={...context.moving,x:context.moving.x+result.delta.x,y:context.moving.y+result.delta.y};let best=null;
    const consider=candidate=>{const distance=Math.abs(candidate.offset);if(distance>tolerance)return;if(!best||distance<Math.abs(best.offset)-epsilon||Math.abs(distance-Math.abs(best.offset))<=epsilon&&candidate.rank<best.rank)best=candidate;};
    for(const target of context.targets)for(const [i,fraction]of [0,.5,1].entries())for(const [j,targetFraction]of [0,.5,1].entries()){
      const position=target[key]+target[size]*targetFraction,offset=position-(moving[key]+moving[size]*fraction),separation=Math.max(0,target[cross]-moving[cross]-moving[crossSize],moving[cross]-target[cross]-target[crossSize]);
      consider({offset,rank:(i===j?0:1)+separation*1e-6,kind:'align',target,position});
    }
    for(const [a,b]of context.pairs[key]){
      if(Math.min(moving[cross]+moving[crossSize],a[cross]+a[crossSize],b[cross]+b[crossSize])<=Math.max(moving[cross],a[cross],b[cross]))continue;
      const gap=b[key]-a[key]-a[size],between=(b[key]-a[key]-a[size]-moving[size])/2;
      if(between>=0)consider({offset:a[key]+a[size]+between-moving[key],rank:2,kind:'spacing',a,b,placement:'between'});
      consider({offset:a[key]-gap-moving[size]-moving[key],rank:2,kind:'spacing',a,b,placement:'before'});
      consider({offset:b[key]+b[size]+gap-moving[key],rank:2,kind:'spacing',a,b,placement:'after'});
    }
    if(best)result.delta[key]+=best.offset;
  }
  const moving={...context.moving,x:context.moving.x+result.delta.x,y:context.moving.y+result.delta.y};
  for(const key of ['x','y']){
    if(axis&&axis!==key)continue;
    const size=key==='x'?'width':'height',cross=key==='x'?'y':'x',crossSize=key==='x'?'height':'width';
    // Draw every coincident edge/center after both axes settle. A spacing snap
    // can also align to a neighbor, and an alignment snap can create equal gaps.
    for(const fraction of [0,.5,1]){
      const position=moving[key]+moving[size]*fraction,matches=context.targets.filter(target=>[0,.5,1].some(f=>Math.abs(target[key]+target[size]*f-position)<epsilon));
      if(matches.length)result.guides.push({kind:'align',axis:key,position,start:Math.min(moving[cross],...matches.map(t=>t[cross])),end:Math.max(moving[cross]+moving[crossSize],...matches.map(t=>t[cross]+t[crossSize])),marks:[...new Set([moving,...matches].flatMap(r=>[r[cross],r[cross]+r[crossSize]/2,r[cross]+r[crossSize]]))]});
    }
    const seen=new Set();
    for(const [a,b]of context.pairs[key]){
      const ordered=[a,b,moving].sort((a,b)=>a[key]-b[key]),low=Math.max(...ordered.map(r=>r[cross])),high=Math.min(...ordered.map(r=>r[cross]+r[crossSize]));
      const gaps=[ordered[1][key]-ordered[0][key]-ordered[0][size],ordered[2][key]-ordered[1][key]-ordered[1][size]];
      if(high<=low||gaps[0]<0||Math.abs(gaps[0]-gaps[1])>epsilon)continue;
      const position=(low+high)/2;
      for(let i=0;i<2;i++){const start=ordered[i][key]+ordered[i][size],end=ordered[i+1][key],id=`${position}:${start}:${end}`;if(seen.has(id))continue;seen.add(id);result.guides.push({kind:'spacing',axis:cross,position,start,end,distance:end-start});}
      break; // The nearest equal-gap pair is enough; avoid duplicate labels in dense rows.
    }
  }
  return result;
}
// Snap only the active edges, keeping the opposite corner/edge fixed. Rotated
// resizing keeps its local geometry rather than using axis-aligned world edges.
export function snapResize(context,rect,delta,corner,{zoom=1,enabled=true,preserveAspect=false,parentRotation=0,minimum={width:1,height:1}}={}) {
  let next=resizeLayerRect(rect,delta,corner,preserveAspect,minimum);
  if(!context||!enabled||Math.abs(parentRotation)%360>1e-7||Math.abs(rect.rotation||0)%360>1e-7)return {rect:next,guides:[]};
  const origin={x:context.moving.x-rect.x,y:context.moving.y-rect.y},west=corner.includes('w'),north=corner.includes('n'),horizontal=west||corner.includes('e'),vertical=north||corner.includes('s'),axis=horizontal&&vertical?null:horizontal?'x':'y';
  const activePoint=r=>({x:origin.x+r.x+(horizontal?(west?0:r.width):r.width/2),y:origin.y+r.y+(vertical?(north?0:r.height):r.height/2)});
  const point=activePoint(next);
  const result=snapMove({...context,moving:{...point,width:0,height:0},pairs:{x:[],y:[]}},{x:0,y:0},{zoom,axis});
  let correction=result.delta;
  if(preserveAspect){
    const ratio=rect.width/rect.height,hx=west?-1:1,hy=north?-1:1;
    const candidates=[];
    if(result.guides.some(g=>g.axis==='x'))candidates.push({x:correction.x,y:vertical?correction.x*hx*hy/ratio:0});
    if(result.guides.some(g=>g.axis==='y'))candidates.push({x:horizontal?correction.y*hx*hy*ratio:0,y:correction.y});
    correction=candidates.sort((a,b)=>Math.hypot(a.x,a.y)-Math.hypot(b.x,b.y))[0]||{x:0,y:0};
  }
  next=resizeLayerRect(rect,{x:delta.x+correction.x,y:delta.y+correction.y},corner,preserveAspect,minimum);
  const actual=activePoint(next);
  const guides=snapMove({...context,moving:{...actual,width:0,height:0},pairs:{x:[],y:[]}},{x:0,y:0},{zoom:1e9,axis}).guides;
  return {rect:next,guides};
}
export function layerDropPlan(doc,ids,targetId='',placement='inside') {
  if(!['inside','before','after'].includes(placement))throw Error('Unknown layer drop position.');
  const byId=layerIndex(doc),selected=roots(doc,ids,byId),target=byId.get(targetId);
  if(!selected.length)throw Error('Select a layer to move.');
  if(targetId&&!target||!target&&placement!=='inside')throw Error('Drop onto an existing layer.');
  const locked=layer=>{while(layer){if(layer.locked)return true;layer=byId.get(layer.parentId);}return false;};
  if(selected.some(locked))throw Error('Unlock the layer and its parents before moving it.');
  if(target&&locked(target))throw Error('Unlock the destination before moving layers.');
  if(placement==='inside'&&target&&!parentRoles.includes(target.role))throw Error('Choose an existing layer as the parent.');
  const moving=descendants(doc,selected.map(layer=>layer.id));
  if(target&&moving.has(target.id))throw Error('A layer cannot be dropped into itself or its descendants.');
  return {selected,moving,parentId:placement==='inside'?targetId:target.parentId||'',target,placement};
}
export function moveLayers(doc,ids,targetId='',placement='inside') {
  const plan=layerDropPlan(doc,ids,targetId,placement),byId=layerIndex(doc),parent=byId.get(plan.parentId),poses=new Map(),parentPose=parent?worldPose(doc,parent,byId,poses):{x:0,y:0,rotation:0};
  for(const layer of plan.selected)worldPose(doc,layer,byId,poses);
  for(const layer of plan.selected)if((layer.parentId||'')!==plan.parentId){
    const pose=poses.get(layer.id),local=rotatePoint({x:pose.x-parentPose.x,y:pose.y-parentPose.y},-parentPose.rotation);
    layer.x=local.x+(parent?parent.width/2:0)-layer.width/2;layer.y=local.y+(parent?parent.height/2:0)-layer.height/2;
    const rotation=pose.rotation-parentPose.rotation;if(rotation!==0||layer.rotation!==undefined)layer.rotation=rotation;
    layer.parentId=plan.parentId;
  }
  const moved=doc.layers.filter(layer=>plan.moving.has(layer.id)),remaining=doc.layers.filter(layer=>!plan.moving.has(layer.id));
  let index=remaining.length;
  if(plan.target){
    if(placement==='after')index=remaining.indexOf(plan.target)+1;
    else if(placement==='before')index=remaining.indexOf(plan.target);
  }
  remaining.splice(index,0,...moved);doc.layers=remaining;
  return plan.selected.map(layer=>layer.id);
}
export function alignLayers(doc, ids, mode, toParent=false) {
  const selected=roots(doc,ids);if(!selected.length)return;
  if(selected.some(l=>(l.parentId||'')!==(selected[0].parentId||'')))throw Error('Align layers with the same parent.');
  const bounds={x:Math.min(...selected.map(l=>l.x)),y:Math.min(...selected.map(l=>l.y))};
  bounds.width=Math.max(...selected.map(l=>l.x+l.width))-bounds.x;bounds.height=Math.max(...selected.map(l=>l.y+l.height))-bounds.y;
  const parent=doc.layers.find(l=>l.id===selected[0].parentId)||doc;
  if(toParent){const dx=(parent.width-bounds.width)/2-bounds.x,dy=(parent.height-bounds.height)/2-bounds.y;for(const layer of selected){layer.x+=dx;layer.y+=dy;}return;}
  const reference=selected.length===1?{x:0,y:0,width:parent.width,height:parent.height}:bounds;
  for(const layer of selected){
    if(mode==='left')layer.x=reference.x;if(mode==='center')layer.x=reference.x+(reference.width-layer.width)/2;if(mode==='right')layer.x=reference.x+reference.width-layer.width;
    if(mode==='top')layer.y=reference.y;if(mode==='middle')layer.y=reference.y+(reference.height-layer.height)/2;if(mode==='bottom')layer.y=reference.y+reference.height-layer.height;
  }
}
export function imagePlacement(doc, width, height, point, parentId='') {
  const parent=doc.layers.find(l=>l.id===parentId)||doc;
  return {x:(point?.x??parent.width/2)-width/2,y:(point?.y??parent.height/2)-height/2,width,height,parentId:parent===doc?'':parent.id};
}
export function rotatePoint(point, degrees) {
  const angle=degrees*Math.PI/180,c=Math.cos(angle),s=Math.sin(angle);
  return {x:point.x*c-point.y*s,y:point.x*s+point.y*c};
}
// Coordinates remain relative to the parent. Side handles ignore cross-axis
// motion; aspect resizing centers that axis and fixes the opposite edge midpoint.
export function resizeLayerRect(rect, delta, corner, preserveAspect=false,minimum={width:1,height:1}) {
  const hx=corner.includes('w')?-1:corner.includes('e')?1:0,hy=corner.includes('n')?-1:corner.includes('s')?1:0;
  const local=rotatePoint(delta,-(rect.rotation||0));
  let width=rect.width+hx*local.x,height=rect.height+hy*local.y;
  if(preserveAspect){
    const scale=hx&&(!hy||Math.abs(local.x/rect.width)>=Math.abs(local.y/rect.height))?width/rect.width:height/rect.height;
    const bounded=Math.max(minimum.width/rect.width,minimum.height/rect.height,Math.min(8192/Math.max(rect.width,rect.height),scale));
    width=rect.width*bounded;height=rect.height*bounded;
  }else{width=Math.max(minimum.width,Math.min(8192,width));height=Math.max(minimum.height,Math.min(8192,height));}
  const shift=rotatePoint({x:(width-rect.width)*hx/2,y:(height-rect.height)*hy/2},rect.rotation||0);
  return {x:rect.x+(rect.width-width)/2+shift.x,y:rect.y+(rect.height-height)/2+shift.y,width,height};
}
export function scaleLayerTree(doc,originals,rootId,rect,next,corner){
  let min=0,max=Infinity;
  for(const item of originals){for(const key of ['width','height']){min=Math.max(min,1/item[key]);max=Math.min(max,8192/item[key]);}if(item.role==='text'){min=Math.max(min,1/(item.fontSize||24));max=Math.min(max,512/(item.fontSize||24));}if(item.strokeWidth>0)max=Math.min(max,256/item.strokeWidth);if(item.textStyle){const style=resolvedTextStyle(item);for(const key of ['strokeWidth','outlineWidth'])if(style[key]>0)max=Math.min(max,64/style[key]);for(const key of ['extrusionX','extrusionY'])if(style[key])max=Math.min(max,128/Math.abs(style[key]));}for(const key of ['x','y'])if(item.id!==rootId&&item[key])max=Math.min(max,100000/Math.abs(item[key]));}
  const factor=Math.max(min,Math.min(max,next.width/rect.width)),hx=corner.includes('w')?-1:corner.includes('e')?1:0,hy=corner.includes('n')?-1:corner.includes('s')?1:0;
  const resized=resizeLayerRect(rect,rotatePoint({x:rect.width*(factor-1)*hx,y:rect.height*(factor-1)*hy},rect.rotation||0),corner,true),byId=layerIndex(doc);
  for(const original of originals){const item=byId.get(original.id);if(item.id===rootId)Object.assign(item,resized);else for(const key of ['x','y','width','height'])item[key]=original[key]*factor;if(item.role==='text')item.fontSize=(original.fontSize||24)*factor;if(original.strokeWidth!==undefined)item.strokeWidth=original.strokeWidth*factor;if(original.textStyle){item.textStyle={...original.textStyle};if(original.textStyle.preset)item.textStyle.scale=(original.textStyle.scale??1)*factor;else for(const key of ['strokeWidth','outlineWidth','extrusionX','extrusionY'])item.textStyle[key]=resolvedTextStyle(original)[key]*factor;}if(original.layout){item.layout={...original.layout};for(const key of ['gap','padding','cellWidth','cellHeight'])if(original.layout[key]!==undefined)item.layout[key]=key==='padding'?Math.round(original.layout[key]*factor):original.layout[key]*factor;}}
  return factor;
}
export function canvasBounds(doc) {
  const byId=layerIndex(doc),poses=new Map();let left=0,top=0,right=doc.width,bottom=doc.height;
  for(const layer of doc.layers){
    let hidden=layer.visible===false,p=layer.parentId;while(p&&!hidden){const parent=byId.get(p);hidden=parent?.visible===false;p=parent?.parentId;}
    if(hidden)continue;
    const pose=worldPose(doc,layer,byId,poses),radians=pose.rotation*Math.PI/180,w=Math.abs(layer.width*Math.cos(radians))+Math.abs(layer.height*Math.sin(radians)),h=Math.abs(layer.width*Math.sin(radians))+Math.abs(layer.height*Math.cos(radians));
    left=Math.min(left,pose.x-w/2);top=Math.min(top,pose.y-h/2);right=Math.max(right,pose.x+w/2);bottom=Math.max(bottom,pose.y+h/2);
  }
  return {x:left,y:top,width:right-left,height:bottom-top};
}
export function autoLayout(doc, parentId, direction='horizontal', gap=16, padding=16, options={}) {
  const parent=doc.layers.find(l=>l.id===parentId);if(!parent || !containerRoles.includes(canonicalRole(parent.role))) throw Error('Select a container for auto layout.');
  layoutChildren(parent,doc.layers.filter(l=>l.parentId===parentId&&l.visible!==false),direction,gap,padding,options);
}
// One layout implementation for direct commands and indexed nested reflow.
function layoutChildren(parent,children,direction,gap,padding,options) {
  if(!['horizontal','vertical','grid'].includes(direction))throw Error('Unknown layout direction.');
  let cursor=padding,cross=0;
  if(direction==='grid'){
    const columns=options.columns??Math.max(1,Math.ceil(Math.sqrt(children.length))),cellWidth=options.cellWidth??Math.max(1,...children.map(l=>l.width)),cellHeight=options.cellHeight??Math.max(1,...children.map(l=>l.height));
    children.forEach((layer,i)=>{layer.x=padding+(i%columns)*(cellWidth+gap);layer.y=padding+Math.floor(i/columns)*(cellHeight+gap);layer.width=cellWidth;layer.height=cellHeight;});
    const cols=Math.min(columns,children.length),rows=Math.ceil(children.length/columns);
    parent.width=Math.max(1,2*padding+cols*cellWidth+Math.max(0,cols-1)*gap);parent.height=Math.max(1,2*padding+rows*cellHeight+Math.max(0,rows-1)*gap);
    parent.layout={direction,gap,padding,columns,cellWidth,cellHeight};return;
  }
  for(const layer of children) {if(direction==='horizontal') {layer.x=cursor;layer.y=padding;cursor+=layer.width+gap;cross=Math.max(cross,layer.height);} else {layer.y=cursor;layer.x=padding;cursor+=layer.height+gap;cross=Math.max(cross,layer.width);} }
  parent.width=Math.max(1,direction==='horizontal'?cursor-(children.length?gap:0)+padding:cross+2*padding);
  parent.height=Math.max(1,direction==='vertical'?cursor-(children.length?gap:0)+padding:cross+2*padding);
  parent.layout={direction,gap,padding};
}
export function shortcutMatches(event, combination) {
  const parts=(combination || '').toLowerCase().split('+'); const key=parts.pop();
  if(!key)return false;
  const mod=parts.includes('mod');
  const digit=event.code?.startsWith('Digit')?event.code.slice(5):'',letter=event.code?.startsWith('Key')?event.code.slice(3).toLowerCase():'';
  const physical={Minus:'-',Equal:'=',Comma:',',Period:'.',Slash:'/',Semicolon:';',Quote:"'",BracketLeft:'[',BracketRight:']',Backslash:'\\',Backquote:'`',Space:'space'}[event.code]||'';
  return (event.key.toLowerCase()===key || digit===key || letter===key || physical===key) && (mod ? event.ctrlKey || event.metaKey : !!event.ctrlKey===parts.includes('ctrl') && !!event.metaKey===parts.includes('meta')) && !!event.shiftKey===parts.includes('shift') && !!event.altKey===parts.includes('alt');
}
// Reflow deepest containers first so nested preferred sizes reach their parents.
export function reflowGroups(doc) {
  const hierarchy=layerHierarchy(doc),children=new Map();
  for(const layer of doc.layers)if(layer.visible!==false){
    const parent=layer.parentId||'';
    if(!children.has(parent))children.set(parent,[]);
    children.get(parent).push(layer);
  }
  // Reverse parent-first traversal is postorder; unrelated siblings do not
  // affect each other's layout. Indexes live only for this operation.
  for(let index=hierarchy.length-1;index>=0;index--){
    const {layer}=hierarchy[index];
    if(!containerRoles.includes(layer.role)||!['horizontal','vertical','grid'].includes(layer.groupType))continue;
    const options=layer.layout||{};
    layoutChildren(layer,children.get(layer.id)||[],layer.groupType,options.gap??16,options.padding??16,options);
  }
}
// Match TMP's UpdateShaderRatios, then convert its SDF distance to authored pixels.
// CSS stroke width spans both sides of a glyph, just like TMP Outline Width.
export function tmpWebMaterialMetrics(font,preset,material={},fontSize=24) {
  const defaults=new Map((preset?.properties||[]).map(p=>[p.name,p.value]));
  const number=(key,fallback=0)=>{const v=material.floats?.[key]??defaults.get(key)??fallback;return Number.isFinite(Number(v))?Number(v):fallback;};
  const gradient=Math.max(1,Number(preset?.gradientScale??(font?.atlasPadding??8)+1)||9),pointSize=Math.max(1,Number(font?.pointSize)||90),faceScale=Number(font?.faceScale)||1;
  const dilate=number('_FaceDilate'),outline=Math.max(0,Math.min(1,number('_OutlineWidth'))),softness=Math.max(0,number('_OutlineSoftness')),weight=Math.max(number('_WeightNormal'),number('_WeightBold',.75))/4;
  const ratios=preset?.ratiosEnabled!==false,ratioA=ratios?(gradient-1)/(gradient*Math.max(1,weight+dilate+outline+softness)):1;
  const range=(weight+dilate)*(gradient-1),ratioB=ratios?Math.max(0,gradient-1-range)/(gradient*Math.max(1,number('_GlowOffset')+number('_GlowOuter'))):1;
  const underlayRange=Math.max(1,Math.max(Math.abs(number('_UnderlayOffsetX')),Math.abs(number('_UnderlayOffsetY')))+number('_UnderlayDilate')+number('_UnderlaySoftness'));
  const ratioC=ratios?Math.max(0,gradient-1-range)/(gradient*underlayRange):1;
  const distance=gradient*fontSize/pointSize*faceScale;
  return {ratioA,ratioB,ratioC,outlinePixels:outline*ratioA*distance,outlineEm:outline*ratioA*gradient/pointSize*faceScale,
    dilatePixels:dilate*ratioA*distance/2,softnessPixels:softness*ratioA*distance,
    underlayX:number('_UnderlayOffsetX')*ratioC*distance,underlayY:-number('_UnderlayOffsetY')*ratioC*distance,
    underlaySoftness:Math.max(0,number('_UnderlaySoftness'))*ratioC*distance,
    glowPixels:Math.max(0,number('_GlowOuter'))*ratioB*distance/2};
}
