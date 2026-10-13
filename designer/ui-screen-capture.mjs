import {resourceURL} from './workspace.mjs';
// Browser-native per-root capture. Inline resources keep the SVG rasterization local and origin-safe.
import {canvasImportDocument,isScreenRoot,descendants,layerIndex,worldPose,rotatePoint,validateDocument,roots,copy} from './ui-model.mjs';
import {validateCaptureIdentity} from './editor-context.mjs';
import {fetchWebResource} from './web-errors.mjs';
const dataURL=blob=>new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(Error('Image capture resource could not be read.'));reader.readAsDataURL(blob);});
const visualStyles=('display position z-index box-sizing width height min-width min-height max-width max-height top right bottom left margin padding border border-top border-right border-bottom border-left border-radius border-image -webkit-border-image background background-blend-mode color font line-height letter-spacing word-spacing text-align text-transform text-decoration white-space word-break overflow-wrap text-overflow -webkit-text-fill-color -webkit-text-stroke -webkit-font-smoothing opacity visibility overflow overflow-x overflow-y transform transform-origin filter box-shadow text-shadow object-fit object-position flex flex-direction flex-wrap flex-shrink flex-grow flex-basis align-items align-self justify-content gap clip clip-path fill fill-rule stroke stroke-width stroke-linecap stroke-linejoin stroke-dasharray stroke-dashoffset paint-order mix-blend-mode isolation').split(' ');
function renderer(include=()=>true,{includeFonts=true,onClone=()=>{}}={}){
  const resources=new Map(),fonts=new Map();
  const inline=async url=>{if(url.startsWith('data:'))return url;if(!resources.has(url))resources.set(url,fetchWebResource(url,{unavailable:'Capture image/font resource is unavailable.'}).then(dataURL));return resources.get(url);};
  let cloned=0;
  const clone=async source=>{
    if(source.nodeType===Node.TEXT_NODE)return source.cloneNode();
    if(source.nodeType!==Node.ELEMENT_NODE)return document.createTextNode('');
    let node=source.cloneNode(false);
    if(source instanceof HTMLCanvasElement){node=document.createElement('img');node.src=source.toDataURL('image/png');}
    const style=getComputedStyle(source);for(const key of visualStyles)node.style.setProperty(key,style.getPropertyValue(key));
    node.style.animation='none';node.style.transition='none';if(!(source instanceof SVGElement))node.removeAttribute('id');
    if(source instanceof HTMLImageElement){await source.decode();node.src=await inline(source.currentSrc||source.src);node.removeAttribute('srcset');}
    if(includeFonts)for(const match of style.fontFamily.matchAll(/ui-([a-f\d]+)/gi)){const guid=match[1];fonts.set(guid,await inline(resourceURL(guid,'font')));}
    for(const property of ['background-image','border-image-source','-webkit-border-image','mask-image','-webkit-mask-image','filter']){
      let value=style.getPropertyValue(property);const images=[...value.matchAll(/url\(["']?([^"')]+)["']?\)/g)];
      for(const match of images)if(!match[1].startsWith('data:'))value=value.replace(match[1],await inline(match[1]));
      if(images.length)node.style.setProperty(property,value);
    }
    if(source instanceof SVGElement)for(const property of ['fill','stroke','clip-path']){
      const value=style.getPropertyValue(property).replace(/url\(["']?[^"')]*#([^"')]+)["']?\)/g,'url(#$1)');node.style.setProperty(property,value);
    }
    if(!(source instanceof HTMLCanvasElement))for(const child of source.childNodes)if(include(child))node.append(await clone(child));
    onClone(++cloned);if(cloned%40===0)await new Promise(resolve=>requestAnimationFrame(resolve));
    return node;
  };
  const svg=(node,sourceWidth,sourceHeight)=>{
    const css=[...fonts].map(([guid,url])=>`@font-face{font-family:ui-${guid};src:url("${url}");font-display:swap}`).join('');
    const markup=new XMLSerializer().serializeToString(node);return `<svg xmlns="http://www.w3.org/2000/svg" width="${sourceWidth}" height="${sourceHeight}" viewBox="0 0 ${sourceWidth} ${sourceHeight}"><foreignObject width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml"><style>${css}</style>${markup}</div></foreignObject></svg>`;
  };
  const raster=async(node,sourceWidth,sourceHeight,width=sourceWidth,height=sourceHeight)=>{
    const image=new Image();image.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg(node,sourceWidth,sourceHeight));await image.decode();await new Promise(resolve=>setTimeout(resolve,150));
    const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
    try{canvas.getContext('2d').drawImage(image,0,0,width,height);const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw Error('Image capture failed.');return blob;}
    finally{canvas.width=canvas.height=1;}
  };
  return {clone,raster,svg};
}

// Export selected subtrees without changing the authored document. A single
// selection uses its local coordinates; multiple roots retain their arrangement.
export function imageExportDocument(doc,selectedIds=null){
  if(!selectedIds)return doc;
  const selected=roots(doc,new Set(selectedIds));if(!selected.length)throw Error('Select an object before exporting the selection.');
  const included=descendants(doc,selected.map(layer=>layer.id)),result={...doc,name:selected.length===1?selected[0].name:doc.name+' Selection',layers:doc.layers.filter(layer=>included.has(layer.id)).map(copy)};
  const byId=layerIndex(doc),poses=new Map();let left=Infinity,top=Infinity,right=-Infinity,bottom=-Infinity;
  for(const layer of result.layers)if(selected.some(root=>root.id===layer.id)){
    const pose=worldPose(doc,byId.get(layer.id),byId,poses);layer.parentId='';
    layer.x=selected.length===1?0:pose.x-layer.width/2;layer.y=selected.length===1?0:pose.y-layer.height/2;layer.rotation=selected.length===1?0:pose.rotation;
    const angle=layer.rotation*Math.PI/180,w=Math.abs(layer.width*Math.cos(angle))+Math.abs(layer.height*Math.sin(angle)),h=Math.abs(layer.width*Math.sin(angle))+Math.abs(layer.height*Math.cos(angle));
    left=Math.min(left,layer.x+layer.width/2-w/2);top=Math.min(top,layer.y+layer.height/2-h/2);right=Math.max(right,layer.x+layer.width/2+w/2);bottom=Math.max(bottom,layer.y+layer.height/2+h/2);
  }
  for(const layer of result.layers)if(!layer.parentId){layer.x-=left;layer.y-=top;}
  result.width=Math.max(1,Math.ceil(right-left));result.height=Math.max(1,Math.ceil(bottom-top));return result;
}
export async function captureScreens(studio,request){
  validateCaptureIdentity(studio,request);
  await Promise.allSettled([...studio.fontLoads.values()]);
  await document.fonts.ready;
  const doc=studio.doc,version=studio.version,prepared=canvasImportDocument(doc),ids=request.rootIds;
  validateCaptureIdentity(studio,request);
  const roots=doc.layers.filter(layer=>isScreenRoot(layer,doc,doc)&&(!ids||ids.includes(layer.id)));
  if(!roots.length||ids?.some(id=>!roots.some(layer=>layer.id===id)))throw Error('Mark a Screen root, or specify existing screen root IDs, before capture.');
  if(roots.length>32)throw Error('Capture up to 32 screens per request.');
  if(request.expectedDocumentName&&request.expectedDocumentName!==doc.name)throw Error('The active UI document differs from the requested demo.');
  const {clone,raster}=renderer(),results=[];
  for(const root of roots){
    const source=studio.elements.get(root.id);if(!source)throw Error('Screen is not rendered yet.');
    const deadline=Date.now()+15000;
    while(source.querySelector('[data-styled-text-status="pending"]')){
      if(Date.now()>deadline)throw Error('Text preview is still pending. Wait and capture again.');
      await new Promise(resolve=>setTimeout(resolve,50));
    }
    if(source.querySelector('[data-styled-text-status="error"]'))throw Error('A Text preview failed. Repair it before capture.');
    const node=await clone(source);node.removeAttribute('hidden');Object.assign(node.style,{position:'relative',inset:'0px auto auto 0px',insetBlock:'0px auto',insetInline:'0px auto',transform:'none',display:'block',margin:'0px',width:root.width+'px',height:root.height+'px'});
    const maxEdge=Math.min(2048,Math.max(64,request.maxEdge||1024)),scale=Math.min(1,maxEdge/Math.max(root.width,root.height)),width=Math.max(1,Math.round(root.width*scale)),height=Math.max(1,Math.round(root.height*scale));
    const blob=await raster(node,root.width,root.height,width,height);
    if(studio.doc!==doc||studio.version!==version)throw Error('UI changed during capture. Capture again once editing stops.');
    const imported=prepared.layers.find(layer=>layer.id===root.id);
    results.push({layerId:root.id,name:root.name,width,height,sourceWidth:root.width,sourceHeight:root.height,visible:root.visible!==false,
      checks:{independentRoot:imported.canvasRoot===true,anchor:imported.anchor,centered:imported.x===(doc.width-root.width)/2&&imported.y===(doc.height-root.height)/2},dataBase64:(await dataURL(blob)).split(',')[1]});
  }
  return results;
}

// Sutherland–Hodgman clipping keeps rotated descendants inside rotated clip frames.
const cross=(a,b,p)=>(b.x-a.x)*(p.y-a.y)-(b.y-a.y)*(p.x-a.x);
function clipPolygon(points,clip){
  for(let i=0;i<clip.length&&points.length;i++){
    const a=clip[i],b=clip[(i+1)%clip.length],input=points;points=[];
    let previous=input.at(-1),distance=cross(a,b,previous);
    for(const point of input){const next=cross(a,b,point);
      if((next>=0)!==(distance>=0)){const t=distance/(distance-next);points.push({x:previous.x+(point.x-previous.x)*t,y:previous.y+(point.y-previous.y)*t});}
      if(next>=0)points.push(point);previous=point;distance=next;
    }
  }
  return points;
}
export function layerImageBounds(doc,root,includeChildren=true,padding=()=>0,paint=()=>true){
  const byId=layerIndex(doc),poses=new Map(),ids=includeChildren?descendants(doc,[root.id]):new Set([root.id]);
  // Export in the selected object's local coordinates, independent of board/ancestor pose.
  byId.set(root.id,{...root,parentId:'',x:0,y:0,rotation:0});
  const rectangle=(layer,pad=0)=>{const pose=worldPose(doc,byId.get(layer.id),byId,poses);return [
    {x:-layer.width/2-pad,y:-layer.height/2-pad},{x:layer.width/2+pad,y:-layer.height/2-pad},
    {x:layer.width/2+pad,y:layer.height/2+pad},{x:-layer.width/2-pad,y:layer.height/2+pad}
  ].map(point=>{const p=rotatePoint(point,pose.rotation);return{x:pose.x+p.x,y:pose.y+p.y};});};
  let left=0,top=0,right=root.width,bottom=root.height;
  const visible=new Set([root.id]);
  for(const layer of doc.layers){
    if(!ids.has(layer.id))continue;
    let hidden=false;
    for(let item=layer;item&&item.id!==root.id;item=byId.get(item.parentId))if(item.visible===false){hidden=true;break;}
    if(hidden)continue;visible.add(layer.id);
    if(!paint(layer))continue;
    let points=rectangle(layer,padding(layer));
    if(layer.clip)points=clipPolygon(points,rectangle(layer));
    for(let parent=layer.id===root.id?null:byId.get(layer.parentId);parent;parent=byId.get(parent.parentId))if(parent.clip)points=clipPolygon(points,rectangle(parent));
    for(const point of points){left=Math.min(left,point.x);top=Math.min(top,point.y);right=Math.max(right,point.x);bottom=Math.max(bottom,point.y);}
  }
  const x=Math.floor(left+1e-7),y=Math.floor(top+1e-7);
  return {x,y,width:Math.ceil(right-1e-7)-x,height:Math.ceil(bottom-1e-7)-y,ids:visible};
}
export async function captureLayerPNG(studio,layerId,{includeChildren=true,imagesOnly=false,bakeRootAppearance=true,selectedIds=null,format='png',onProgress=()=>{}}={}){
  const doc=studio.doc,version=studio.version;validateDocument(doc);
  if(!['png','svg'].includes(format))throw Error('Choose PNG or SVG for image capture.');
  const scope=imageExportDocument(doc,layerId?null:selectedIds),all=!layerId;
  let root=doc.layers.find(layer=>layer.id===layerId),source=studio.elements.get(layerId),boundsDoc=doc;
  if(all){let id='export-root';while(doc.layers.some(layer=>layer.id===id))id+='-';root={id,name:scope.name,role:'empty',x:0,y:0,width:scope.width,height:scope.height};boundsDoc={...scope,layers:[root,...scope.layers.map(layer=>({...layer,parentId:layer.parentId||id}))]};}
  if(!root||!all&&!source)throw Error('Select a rendered object before exporting PNG.');
  const current=()=>{if(studio.doc!==doc||studio.version!==version)throw Error('UI changed during PNG export. Export again once editing stops.');};
  const paint=layer=>!imagesOnly||['image','button'].includes(layer.role);
  const initial=layerImageBounds(boundsDoc,root,includeChildren,()=>0,paint),contents=[...initial.ids].filter(id=>paint(boundsDoc.layers.find(layer=>layer.id===id))).map(id=>studio.elements.get(id)?.firstElementChild).filter(Boolean);
  if(!imagesOnly){await Promise.all(studio.currentFontLoads||[]);await document.fonts.ready;}
  const deadline=Date.now()+15000;
  while(contents.some(node=>node.querySelector('[data-styled-text-status="pending"]'))){if(Date.now()>deadline)throw Error('Text previews are still pending. Wait and export again.');await new Promise(resolve=>setTimeout(resolve,50));current();}
  if(contents.some(node=>node.querySelector('[data-styled-text-status="error"]')))throw Error('A text preview failed. Repair it before exporting PNG.');
  if(!imagesOnly&&doc.layers.some(layer=>initial.ids.has(layer.id)&&layer.role==='text'&&!layer.textStyle&&studio.failedFonts?.has(layer.fontGuid)))throw Error('A text font is unavailable. Repair it before exporting PNG.');
  const bounds=layerImageBounds(boundsDoc,root,includeChildren,layer=>{
    const preview=studio.elements.get(layer.id)?.firstElementChild?.querySelector('.ui-styled-text-preview,.ui-psd-text-paint');
    return preview?Math.max(0,-parseFloat(preview.style.left)||0,-parseFloat(preview.style.top)||0,(parseFloat(preview.style.width)||0)+(parseFloat(preview.style.left)||0)-layer.width,(parseFloat(preview.style.height)||0)+(parseFloat(preview.style.top)||0)-layer.height):0;
  },paint);
  if(bounds.width>8192||bounds.height>8192||bounds.width*bounds.height>16777216)throw Error('PNG export supports up to 8192 pixels per side and 16 megapixels. Reduce this object or its children.');
  const byId=layerIndex(boundsDoc),include=node=>{
    if(node.dataset?.layerId)return bounds.ids.has(node.dataset.layerId);
    return !imagesOnly||!node.classList?.contains('ui-layer-content')||byId.get(node.parentElement?.dataset.layerId)?.role!=='text';
  };
  const count=node=>node?.nodeType===Node.ELEMENT_NODE?1+[...node.childNodes].filter(include).reduce((sum,child)=>sum+count(child),0):0;
  const totalNodes=all?scope.layers.filter(layer=>!layer.parentId&&bounds.ids.has(layer.id)).reduce((sum,layer)=>sum+count(studio.elements.get(layer.id)),0):count(source);
  onProgress('Combining child images…',0,totalNodes);
  const {clone,raster,svg}=renderer(include,{includeFonts:!imagesOnly,onClone:done=>onProgress(`Combining child images… ${done} / ${totalNodes}`,done,totalNodes)});
  current();let node;
  if(all){
    node=document.createElement('div');Object.assign(node.style,{width:root.width+'px',height:root.height+'px',isolation:'isolate'});
    for(const layer of scope.layers.filter(layer=>!layer.parentId)){
      if(!bounds.ids.has(layer.id))continue;const element=studio.elements.get(layer.id);if(!element)throw Error('An export object is not rendered yet.');
      const child=await clone(element);if(selectedIds)child.removeAttribute('hidden');Object.assign(child.style,{left:layer.x+'px',top:layer.y+'px',transform:`rotate(${layer.rotation||0}deg)`});node.append(child);
    }
  }else{node=await clone(source);node.removeAttribute('hidden');}
  Object.assign(node.style,{position:'absolute',left:-bounds.x+'px',top:-bounds.y+'px',right:'auto',bottom:'auto',transform:'none',display:'block',margin:'0px'});
  if(!bakeRootAppearance)Object.assign(node.style,{opacity:'1',mixBlendMode:'normal'});
  const board=document.createElement('div');Object.assign(board.style,{position:'relative',width:bounds.width+'px',height:bounds.height+'px',isolation:'isolate'});board.append(node);
  onProgress('Encoding image…');await new Promise(resolve=>requestAnimationFrame(resolve));
  const blob=format==='svg'?new Blob([svg(board,bounds.width,bounds.height)],{type:'image/svg+xml'}):await raster(board,bounds.width,bounds.height);current();
  return {blob,name:root.name,x:bounds.x,y:bounds.y,width:bounds.width,height:bounds.height};
}
