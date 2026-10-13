import {gradientSVG} from './ui-paints.mjs';
// Editable primitives; no external vector library or raster upload is required.
export const shapeTools=[['rectangle','Rectangle','R'],['line','Line','L'],['arrow','Arrow','Shift+L'],['ellipse','Ellipse','O'],['polygon','Polygon',''],['star','Star','']];
export const isOpenShape=layer=>['line','arrow'].includes(layer.shape);
export const shapeStrokeWidth=layer=>layer.strokeWidth??(isOpenShape(layer)?2:0);
export function shapePaintBindings(layer){
  const bindings=[];
  if(!isOpenShape(layer)){
    if(layer.fillGradient)for(const stop of layer.fillGradient.stops)bindings.push({item:stop,key:'color',fallback:'#ffffff'});
    else bindings.push({item:layer,key:'fill',fallback:'#ffffff'});
  }
  if(shapeStrokeWidth(layer)>0)bindings.push({item:layer,key:'stroke',fallback:'#000000'});
  return bindings;
}
export function setShapeType(layer,shape){
  const wasOpen=isOpenShape(layer);layer.shape=shape;
  if(isOpenShape(layer)&&!wasOpen&&shapeStrokeWidth(layer)===0)layer.strokeWidth=2;
}
export function shapePoints(layer){
  const shape=layer.shape,w=layer.width,h=layer.height,p=Math.min(shapeStrokeWidth(layer)/2,w/2,h/2),left=p,top=p,right=w-p,bottom=h-p;
  if(shape==='rectangle')return [[left,top],[right,top],[right,bottom],[left,bottom]];
  if(['line','arrow'].includes(shape))return [[layer.shapeFlipX?right:left,layer.shapeFlipY?bottom:top],[layer.shapeFlipX?left:right,layer.shapeFlipY?top:bottom]];
  const count=shape==='ellipse'?64:shape==='star'?(layer.shapeSides||5)*2:layer.shapeSides||3;
  return Array.from({length:count},(_,i)=>{const angle=-Math.PI/2+i*2*Math.PI/count,radius=shape==='star'&&i%2?(layer.starInnerRadius??.45):1;return [w/2+Math.cos(angle)*(w/2-p)*radius,h/2+Math.sin(angle)*(h/2-p)*radius];});
}
export function arrowHead(points,strokeWidth=2){
  const [a,b]=points,angle=Math.atan2(b[1]-a[1],b[0]-a[0]),length=Math.min(Math.hypot(b[0]-a[0],b[1]-a[1])*.4,Math.max(10,strokeWidth*4));
  return [b,[b[0]-Math.cos(angle-.5)*length,b[1]-Math.sin(angle-.5)*length],[b[0]-Math.cos(angle+.5)*length,b[1]-Math.sin(angle+.5)*length]];
}
export function paintShape(layer){
  const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');svg.setAttribute('class','ui-shape');svg.setAttribute('viewBox',`0 0 ${layer.width} ${layer.height}`);svg.setAttribute('preserveAspectRatio','none');
  const points=shapePoints(layer),open=isOpenShape(layer),width=shapeStrokeWidth(layer),path=document.createElementNS(ns,open?'polyline':'polygon');
  if(!open&&layer.fillGradient){const defs=document.createElementNS(ns,'defs');defs.innerHTML=gradientSVG(layer.fillGradient,'paint-'+(++paintSequence));svg.append(defs);}
  path.setAttribute('points',points.map(p=>p.join(',')).join(' '));path.setAttribute('fill',open?'none':layer.fillGradient?`url(#paint-${paintSequence})`:layer.fill||'#ffffff');path.setAttribute('stroke',layer.stroke||'#000000');path.setAttribute('stroke-width',String(width));path.setAttribute('stroke-linejoin','round');svg.append(path);
  if(layer.shape==='arrow'&&width>0){const head=document.createElementNS(ns,'polygon');head.setAttribute('points',arrowHead(points,width).map(p=>p.join(',')).join(' '));head.setAttribute('fill',layer.stroke||'#000000');svg.append(head);}
  return svg;
}
let paintSequence=0;
export function shapeHit(layer,point){
  const points=shapePoints(layer);
  if(isOpenShape(layer)){
    const width=shapeStrokeWidth(layer);if(width<=0)return false;
    const [a,b]=points,dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((point.x-a[0])*dx+(point.y-a[1])*dy)/(dx*dx+dy*dy||1)));
    if(Math.hypot(point.x-a[0]-t*dx,point.y-a[1]-t*dy)<=Math.max(4,width/2))return true;
    if(layer.shape!=='arrow')return false;return polygonHit(arrowHead(points,width),point);
  }
  return polygonHit(points,point);
}
function polygonHit(points,point){let inside=false;for(let i=0,j=points.length-1;i<points.length;j=i++){const a=points[i],b=points[j];if((a[1]>point.y)!==(b[1]>point.y)&&point.x<(b[0]-a[0])*(point.y-a[1])/(b[1]-a[1])+a[0])inside=!inside;}return inside;}
