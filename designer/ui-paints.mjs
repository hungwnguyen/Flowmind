const hex=/^#[\da-f]{6}(?:[\da-f]{2})?$/i;
export function validateGradient(gradient){
  if(gradient===undefined)return;
  if(!gradient||!['linear','radial'].includes(gradient.type)||!Array.isArray(gradient.stops)||gradient.stops.length<2||gradient.stops.length>8)throw Error('A Linear or Radial fill needs 2–8 color stops.');
  for(const [key,min,max]of [['angle',-3600,3600],['centerX',0,1],['centerY',0,1],['radius',.01,2]])if(gradient[key]!==undefined&&(!Number.isFinite(gradient[key])||gradient[key]<min||gradient[key]>max))throw Error('Invalid gradient '+key+'.');
  let previous=-1;for(const stop of gradient.stops){if(!stop||!hex.test(stop.color)||!Number.isFinite(stop.offset)||stop.offset<previous||stop.offset<0||stop.offset>1)throw Error('Gradient stops must be ordered between 0 and 100%.');previous=stop.offset;}
}
export function gradientSVG(gradient,id='paint'){
  const stops=gradient.stops.map(stop=>`<stop offset="${stop.offset}" stop-color="${stop.color.slice(0,7)}" stop-opacity="${parseInt(stop.color.slice(7)||'ff',16)/255}"/>`).join('');
  if(gradient.type==='radial')return `<radialGradient id="${id}" cx="${gradient.centerX??.5}" cy="${gradient.centerY??.5}" r="${gradient.radius??.5}">${stops}</radialGradient>`;
  const angle=(gradient.angle??0)*Math.PI/180,x=Math.cos(angle)/2,y=Math.sin(angle)/2;
  return `<linearGradient id="${id}" x1="${.5-x}" y1="${.5-y}" x2="${.5+x}" y2="${.5+y}">${stops}</linearGradient>`;
}
export function paintURL(color='#ffffff',gradient){
  const svg=gradient?`<defs>${gradientSVG(gradient)}</defs><rect width="100%" height="100%" fill="url(#paint)"/>`:`<rect width="100%" height="100%" fill="${hex.test(color)?color:'#ffffff'}"/>`;
  return 'data:image/svg+xml,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100" preserveAspectRatio="none">${svg}</svg>`);
}
let sequence=0;
const gradientClamp=value=>Math.max(0,Math.min(1,value));
const gradientRGBA=color=>[parseInt(color.slice(1,3),16),parseInt(color.slice(3,5),16),parseInt(color.slice(5,7),16),parseInt(color.slice(7)||'ff',16)/255];
export function gradientAlphaStops(style){return style.alphaStops?.length?style.alphaStops:style.stops.map(stop=>({offset:stop.offset,alpha:gradientRGBA(stop.color)[3]}));}
function sampleTextKeys(stops,t,value,fixed){
  if(fixed)return value(stops.find(stop=>t<=stop.offset)||stops.at(-1));
  let result=value(stops[0]);
  for(let i=1;i<stops.length;i++){
    const previous=stops[i-1],next=stops[i],f=next.offset===previous.offset?(t>=next.offset?1:0):gradientClamp((t-previous.offset)/(next.offset-previous.offset)),target=value(next);
    result=result.map((number,index)=>number+(target[index]-number)*f);
  }
  return result;
}
export function evaluateTextGradient(style,t){
  const fixed=style.gradientBlend==='fixed',color=sampleTextKeys(style.stops,gradientClamp(t),stop=>gradientRGBA(stop.color),fixed);
  color[3]=sampleTextKeys(gradientAlphaStops(style),gradientClamp(t),stop=>[stop.alpha],fixed)[0];return color;
}
export function textGradientRamp(style){
  const positions=style.gradientBlend==='fixed'?[...new Set([0,1,...style.stops.map(stop=>stop.offset),...gradientAlphaStops(style).map(stop=>stop.offset)])].sort((a,b)=>a-b):Array.from({length:65},(_,index)=>index/64);
  const result=[];
  for(const t of positions){
    const color=evaluateTextGradient(style,t);result.push(`rgba(${color.join(',')}) ${t*100}%`);
    if(style.gradientBlend==='fixed'&&t<1){const after=evaluateTextGradient(style,t+1e-7);result.push(`rgba(${after.join(',')}) ${t*100}%`);}
  }
  return `linear-gradient(to right,${result.join(',')})`;
}
export const textGradientPresets=[
  {name:'Cream',stops:[{offset:0,color:'#ffffffff'},{offset:1,color:'#fff0c5ff'}]},
  {name:'Red–Green',stops:[{offset:0,color:'#e64040ff'},{offset:1,color:'#7ee344ff'}]},
  {name:'Blue–Purple',stops:[{offset:0,color:'#00baffff'},{offset:1,color:'#9b36ffff'}]},
  {name:'Sunset',stops:[{offset:0,color:'#ff523dff'},{offset:.5,color:'#f3b533ff'},{offset:1,color:'#ffe5a7ff'}]},
  {name:'Red–White',stops:[{offset:0,color:'#e64040ff'},{offset:1,color:'#ffffffff'}]},
];
export function imagePaintFilter(content,target,layer){
  if(!layer.fillGradient&&(!layer.fill||/^#ffffff(?:ff)?$/i.test(layer.fill)))return;
  const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg'),id='ui-paint-'+(++sequence);
  svg.setAttribute('width','0');svg.setAttribute('height','0');svg.style.position='absolute';svg.setAttribute('aria-hidden','true');
  const filter=document.createElementNS(ns,'filter');for(const [key,value]of Object.entries({id,x:0,y:0,width:'100%',height:'100%','color-interpolation-filters':'sRGB'}))filter.setAttribute(key,value);
  const paint=document.createElementNS(ns,'feImage');paint.setAttribute('href',paintURL(layer.fill,layer.fillGradient));paint.setAttribute('preserveAspectRatio','none');paint.setAttribute('result','paint');
  const multiply=document.createElementNS(ns,'feComposite');for(const [key,value]of Object.entries({in:'SourceGraphic',in2:'paint',operator:'arithmetic',k1:1,k2:0,k3:0,k4:0}))multiply.setAttribute(key,value);
  filter.append(paint,multiply);svg.append(filter);content.append(svg);target.style.filter=`url(#${id})`;
}
