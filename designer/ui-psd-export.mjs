import {resourceURL} from './workspace.mjs';
import {layerIndex,worldPose,validateDocument} from './ui-model.mjs';
import {createPSDWriter,validatePSDExportSize,psdFontName} from './psd-writer.mjs';
import {imageExportDocument} from './ui-screen-capture.mjs';
import {fetchWebResource} from './web-errors.mjs';
// Inline resources before SVG foreignObject rendering; no CDN or runtime server.
const styles=('display position z-index box-sizing width height min-width min-height max-width max-height top right bottom left margin padding border border-radius background background-blend-mode color font line-height letter-spacing word-spacing text-align text-transform text-decoration white-space word-break overflow-wrap text-overflow -webkit-text-fill-color -webkit-text-stroke -webkit-font-smoothing opacity visibility overflow transform transform-origin filter box-shadow text-shadow object-fit object-position flex flex-direction flex-wrap flex-shrink flex-grow flex-basis align-items align-self justify-content gap clip clip-path fill fill-rule stroke stroke-width stroke-linecap stroke-linejoin stroke-dasharray stroke-dashoffset paint-order mix-blend-mode isolation').split(' ');
const dataURL=blob=>new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(Error('PSD resource could not be read.'));r.readAsDataURL(blob);});
export function psdLayerBounds(layer,pose,padding=0) {
  const a=pose.rotation*Math.PI/180,w=layer.width+padding*2,h=layer.height+padding*2;
  const dx=(Math.abs(w*Math.cos(a))+Math.abs(h*Math.sin(a)))/2,dy=(Math.abs(w*Math.sin(a))+Math.abs(h*Math.cos(a)))/2;
  const x=Math.floor(pose.x-dx+1e-7),y=Math.floor(pose.y-dy+1e-7);
  return {x,y,width:Math.ceil(pose.x+dx-1e-7)-x,height:Math.ceil(pose.y+dy-1e-7)-y};
}
export async function exportPSD(studio,{onProgress=()=>{},selectedIds=null}={}) {
  const original=studio.doc,version=studio.version;validateDocument(original);
  const doc=imageExportDocument(original,selectedIds),sources=doc.layers.filter(layer=>!layer.parentId).map(layer=>studio.elements.get(layer.id));
  if(!doc.layers.length)throw Error('Add UI layers before exporting PSD.');
  await Promise.all(studio.currentFontLoads||[]);await document.fonts.ready;
  const previews=selectedIds?sources.flatMap(source=>studio.styledPreview?.pending(source)||[]):studio.styledPreview?.pending(studio.board)||[];
  let timeout;
  try{await Promise.race([Promise.all(previews),new Promise((_,reject)=>{timeout=setTimeout(()=>reject(Error('Text previews are still pending. Wait and export again.')),15000);})]);}finally{clearTimeout(timeout);}
  if(sources.some(source=>source?.querySelector('[data-styled-text-status="error"]')))throw Error('A text preview failed. Repair it before exporting PSD.');
  if(doc.layers.some(l=>l.role==='text'&&!l.textStyle&&studio.failedFonts?.has(l.fontGuid)))throw Error('A text font is unavailable. Repair it before exporting PSD.');
  const byId=layerIndex(doc),poses=new Map(),children=new Map(),bounds=new Map(),padding=new Map(),resources=new Map(),fonts=new Map();
  for(const layer of doc.layers){
    const list=children.get(layer.parentId||'')||[];list.push(layer);children.set(layer.parentId||'',list);
    const effect=layer.textStyle||{};let pad=layer.role==='text'?Math.ceil(Math.max(0,effect.strokeWidth||0,effect.outlineWidth||0,Math.abs(effect.extrusionX||0),Math.abs(effect.extrusionY||0)))+4:Math.ceil((layer.strokeWidth||0)/2);
    const preview=studio.elements.get(layer.id)?.querySelector('.ui-styled-text-preview,.ui-psd-text-paint');
    if(preview)pad=Math.ceil(Math.max(pad,-parseFloat(preview.style.left)||0,-parseFloat(preview.style.top)||0,(parseFloat(preview.style.width)||0)+(parseFloat(preview.style.left)||0)-layer.width,(parseFloat(preview.style.height)||0)+(parseFloat(preview.style.top)||0)-layer.height));
    padding.set(layer.id,pad);bounds.set(layer.id,psdLayerBounds(layer,worldPose(doc,layer,byId,poses),pad));
  }
  for(const layer of doc.layers){
    let parent=layer.parentId,b=bounds.get(layer.id);
    while(parent){const ancestor=byId.get(parent);if(ancestor.clip){const clip=psdLayerBounds(ancestor,poses.get(parent)),x=Math.max(b.x,clip.x),y=Math.max(b.y,clip.y),r=Math.min(b.x+b.width,clip.x+clip.width),bottom=Math.min(b.y+b.height,clip.y+clip.height);b={x,y,width:Math.max(1,r-x),height:Math.max(1,bottom-y)};}parent=ancestor.parentId;}
    bounds.set(layer.id,b);
  }
  const all=[...bounds.values()],left=Math.min(...all.map(b=>b.x)),top=Math.min(...all.map(b=>b.y)),right=Math.max(...all.map(b=>b.x+b.width)),bottom=Math.max(...all.map(b=>b.y+b.height));
  const width=right-left,height=bottom-top;validatePSDExportSize(width,height);
  const groupCount=doc.layers.filter(l=>children.has(l.id)||['empty','group'].includes(l.role)).length,visualParents=doc.layers.filter(l=>children.has(l.id)&&!['empty','group'].includes(l.role)).length;
  if(doc.layers.length+groupCount+visualParents>1000)throw Error('PSD export supports up to 1000 layer records, including group dividers.');
  const writer=createPSDWriter(width,height);
  const fontNames=new Map();
  const textFontName=async layer=>{
    const tmp=studio.tmpFontFor?.(layer),guid=tmp?.sourceFontGuid||layer.fontGuid;
    const font=(studio.config.fonts||[]).find(f=>f.guid===guid),fallback=(font?.name||tmp?.name||'').replace(/\s*(SDF|TMP)\s*$/i,'').replace(/\s/g,'')||(layer.bold?'Arial-BoldMT':'ArialMT');
    if(!guid)return fallback;
    if(!fontNames.has(guid))fontNames.set(guid,fetchWebResource(resourceURL(guid,'font'),{unavailable:'A text font is unavailable for PSD export.',read:r=>r.arrayBuffer()}).then(bytes=>psdFontName(new Uint8Array(bytes),fallback)));
    return fontNames.get(guid);
  };
  const inline=async url=>{
    if(url.startsWith('data:'))return url;
    if(!resources.has(url))resources.set(url,fetchWebResource(url,{unavailable:'An image/font is unavailable for PSD export.'}).then(dataURL));
    return resources.get(url);
  };
  const clone=async source=>{
    if(source.nodeType===Node.TEXT_NODE)return source.cloneNode();
    if(source.nodeType!==Node.ELEMENT_NODE)return document.createTextNode('');
    let node=source.cloneNode(false);if(source instanceof HTMLCanvasElement){node=document.createElement('img');node.src=source.toDataURL('image/png');}
    const computed=getComputedStyle(source);for(const key of styles)node.style.setProperty(key,computed.getPropertyValue(key));
    node.style.animation='none';node.style.transition='none';if(!(source instanceof SVGElement))node.removeAttribute('id');
    if(source instanceof HTMLImageElement){await source.decode();node.src=await inline(source.currentSrc||source.src);node.removeAttribute('srcset');}
    for(const match of computed.fontFamily.matchAll(/ui-([a-f\d]+)/gi))fonts.set(match[1],await inline(resourceURL(match[1],'font')));
    for(const property of ['background-image','border-image-source','mask-image','filter','fill','stroke','clip-path']){
      let value=computed.getPropertyValue(property);
      for(const match of [...value.matchAll(/url\(["']?([^"')]+)["']?\)/g)]){
        if(match[1].includes('#')&&(match[1].startsWith('#')||match[1].split('#')[0]===location.href.split('#')[0]))value=value.replace(match[1],'#'+match[1].split('#').pop());
        else if(!match[1].startsWith('data:'))value=value.replace(match[1],await inline(match[1]));
      }
      if(value)node.style.setProperty(property,value);
    }
    if(!(source instanceof HTMLCanvasElement))for(const child of source.childNodes)node.append(await clone(child));
    return node;
  };
  const raster=async(node,w,h)=>{
    const css=[...fonts].map(([guid,url])=>`@font-face{font-family:ui-${guid};src:url("${url}")}`).join('');
    const markup=new XMLSerializer().serializeToString(node),image=new Image();
    image.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><foreignObject width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml"><style>${css}</style>${markup}</div></foreignObject></svg>`);
    await image.decode();const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;canvas.getContext('2d').drawImage(image,0,0);return canvas;
  };
  const assertCurrent=()=>{if(studio.doc!==original||studio.version!==version)throw Error('UI changed during PSD export. Export again once editing stops.');};
  let painted=0;
  const add=async layer=>{
    assertCurrent();const nested=children.get(layer.id)||[],group=nested.length||['empty','group'].includes(layer.role),b=bounds.get(layer.id),pose=poses.get(layer.id);
    const record={name:layer.name,x:b.x-left,y:b.y-top,opacity:layer.opacity??1,visible:layer.visible!==false,locked:!!layer.locked,blendMode:layer.blendMode||'normal'};
    if(group){writer.addLayer({...record,section:1});for(const child of [...nested].reverse())await add(child);}
    if(!['empty','group'].includes(layer.role)){
      const source=studio.elements.get(layer.id)?.firstElementChild;if(!source)throw Error('A UI layer is not rendered yet.');
      const node=await clone(source),pad=padding.get(layer.id),w=Math.ceil(layer.width+pad*2),h=Math.ceil(layer.height+pad*2);
      validatePSDExportSize(w,h);validatePSDExportSize(b.width,b.height);
      Object.assign(node.style,{position:'absolute',left:pad+'px',top:pad+'px',right:'auto',bottom:'auto',width:layer.width+'px',height:layer.height+'px',transform:'none',opacity:'1',visibility:'visible'});
      const local=await raster(node,w,h),canvas=document.createElement('canvas');canvas.width=b.width;canvas.height=b.height;
      const ctx=canvas.getContext('2d');
      let parent=layer.parentId;
      while(parent){const ancestor=byId.get(parent),p=poses.get(parent)||worldPose(doc,ancestor,byId,poses);if(ancestor.clip){ctx.save();ctx.translate(p.x-b.x,p.y-b.y);ctx.rotate(p.rotation*Math.PI/180);ctx.beginPath();ctx.rect(-ancestor.width/2,-ancestor.height/2,ancestor.width,ancestor.height);ctx.restore();ctx.clip();}parent=ancestor.parentId;}
      ctx.translate(pose.x-b.x,pose.y-b.y);ctx.rotate(pose.rotation*Math.PI/180);ctx.drawImage(local,-layer.width/2-pad,-layer.height/2-pad);local.width=local.height=1;
      let textData;
      if(layer.role==='text'){
        if((layer.text||'').length>512)throw Error('PSD editable text supports up to 512 characters per label.');
        // Resolve preset values into the file; no dependency on the exporter's settings asset.
        const input={...layer};if(layer.textStyle){const preset=(studio.config.textStyles||[]).find(p=>p.key===layer.textStyle.preset);input.textStyle={...preset?.values,...layer.textStyle};delete input.textStyle.preset;}
        textData={layer:input,fontName:await textFontName(layer),box:{x:pose.x-layer.width/2-left,y:pose.y-layer.height/2-top,width:layer.width,height:layer.height,rotation:pose.rotation},paint:{x:-pad,y:-pad,width:w,height:h}};
      }
      writer.addLayer({...record,name:group?layer.name+' artwork':layer.name,opacity:group?1:record.opacity,visible:group?true:record.visible,blendMode:group?'normal':record.blendMode,width:b.width,height:b.height,pixels:ctx.getImageData(0,0,b.width,b.height).data,textData});canvas.width=canvas.height=1;
    }
    if(group)writer.addLayer({name:'</Layer group>',x:0,y:0,section:3});
    onProgress(++painted,doc.layers.length);await new Promise(resolve=>requestAnimationFrame(resolve));
  };
  for(const root of [...(children.get('')||[])].reverse())await add(root);
  assertCurrent();onProgress(doc.layers.length,doc.layers.length,'composite');
  const board=document.createElement('div');Object.assign(board.style,{position:'relative',width:width+'px',height:height+'px'});
  for(const root of children.get('')||[]){const source=studio.elements.get(root.id),node=await clone(source);Object.assign(node.style,{left:(root.x-left)+'px',top:(root.y-top)+'px',transform:`rotate(${root.rotation||0}deg)`});board.append(node);}
  const merged=await raster(board,width,height),pixels=merged.getContext('2d').getImageData(0,0,width,height).data;assertCurrent();
  const blob=writer.finish(pixels);merged.width=merged.height=1;
  return {blob,width,height,layerCount:writer.layerCount,sourceLayerCount:doc.layers.length};
}
