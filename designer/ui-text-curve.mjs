// Positive angles arch upwards. Glyphs stay rigid rather than stretching their atlas.
export function validateTextCurve(layer) {
  const curve=layer.textCurve;
  if(curve===undefined)return;
  if(layer.role!=='text'||!curve||typeof curve!=='object'||Array.isArray(curve)||
    !Number.isFinite(curve.angle)||Math.abs(curve.angle)>360)throw Error('Text curve requires a text layer and an angle between -360 and 360.');
}
export function curvePoint(x,y,centerX,centerY,width,angle) {
  if(!angle)return {x,y,rotation:0};
  const k=angle*Math.PI/180/Math.max(1,width),t=(x-centerX)*k,dy=y-centerY;
  return {x:centerX+Math.sin(t)/k-dy*Math.sin(t),y:centerY+(1-Math.cos(t))/k+dy*Math.cos(t),rotation:t*180/Math.PI};
}
export function paintTextCurve(content,layer) {
  if(!layer.textCurve?.angle)return;
  // Preserve the safe rich-text DOM and its font, color, outline and shadow inheritance.
  const walker=document.createTreeWalker(content,NodeFilter.SHOW_TEXT),nodes=[];
  while(walker.nextNode())nodes.push(walker.currentNode);
  const segmenter=globalThis.Intl?.Segmenter?new Intl.Segmenter(undefined,{granularity:'grapheme'}):null;
  for(const node of nodes){
    const fragment=document.createDocumentFragment(),characters=segmenter?[...segmenter.segment(node.data)].map(s=>s.segment):Array.from(node.data);
    for(const character of characters){if(character==='\n'){fragment.append(document.createTextNode('\n'));continue;}
      const span=document.createElement('span');span.className='ui-curve-glyph';span.textContent=character;fragment.append(span);}
    node.replaceWith(fragment);
  }
  requestAnimationFrame(()=>{
    if(!content.isConnected)return;
    for(const glyph of content.querySelectorAll('.ui-curve-glyph')){
      let x=glyph.offsetWidth/2,y=glyph.offsetHeight/2,node=glyph;
      while(node&&node!==content){x+=node.offsetLeft;y+=node.offsetTop;node=node.offsetParent;}
      const target=curvePoint(x,y,layer.width/2,layer.height/2,layer.width,layer.textCurve.angle);
      glyph.style.transform=`translate(${target.x-x}px,${target.y-y}px) rotate(${target.rotation}deg)`;
    }
  });
}
