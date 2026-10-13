// One pointer interaction for every numeric control, including dynamically created dialogs.
export function scrubNumber(value, pixels, {step=1,min=-Infinity,max=Infinity,fine=false,fast=false,integer=false}={}) {
  const sensitivity=(Number.isFinite(step)&&step>0?step:1)*(fine?.1:fast?10:1);
  const next=value+pixels*sensitivity;
  return Math.max(min,Math.min(max,integer?Math.round(next):Number(next.toFixed(10))));
}
export function installNumberScrubbing(doc=document) {
  const win=doc.defaultView,controller=new win.AbortController(),options={capture:true,signal:controller.signal};let gesture;
  const finish=cancel=>{
    const g=gesture;if(!g)return;gesture=null;
    delete g.input.dataset.numberScrubbing;doc.documentElement.classList.remove('number-scrubbing');
    if(doc.documentElement.hasPointerCapture(g.pointer))doc.documentElement.releasePointerCapture(g.pointer);
    if(cancel){g.input.value=g.original;if(g.input.isConnected)g.input.dispatchEvent(new win.Event('input',{bubbles:true}));}
    if(g.input.isConnected&&g.moved&&!cancel&&g.input.value!==g.original){
      g.input.dispatchEvent(new win.Event('input',{bubbles:true}));
      g.input.dispatchEvent(new win.Event('change',{bubbles:true}));
    }
  };
  doc.addEventListener('pointerdown',e=>{
    if(e.button!==0||gesture)return;
    const label=e.target.closest('label'),input=label?.control||label?.querySelector('input[type="number"]')||(e.altKey?e.target.closest('input[type="number"]'):null);
    if(!input||input.type!=='number'||input.disabled||input.readOnly||!Number.isFinite(input.valueAsNumber))return;
    // Labels scrub; ordinary input clicks remain available for typing and native spinner arrows.
    if(e.target.closest('input,select,textarea,button')&&!e.altKey)return;
    if(!input.dispatchEvent(new win.CustomEvent('numberscrubstart',{bubbles:true,cancelable:true})))return;
    e.preventDefault();input.focus({preventScroll:true});
    gesture={input,pointer:e.pointerId,startX:e.clientX,lastX:e.clientX,value:input.valueAsNumber,original:input.value,moved:false,
      step:input.step==='any'?1:Number(input.step||1),min:input.min===''?-Infinity:Number(input.min),max:input.max===''?Infinity:Number(input.max),integer:input.dataset.integer==='true'};
    input.dataset.numberScrubbing='true';doc.documentElement.setPointerCapture(e.pointerId);
  },options);
  doc.addEventListener('pointermove',e=>{
    const g=gesture;if(!g||e.pointerId!==g.pointer)return;
    if(!g.input.isConnected){finish(true);return;}
    if(!g.moved&&Math.abs(e.clientX-g.startX)<3)return;
    e.preventDefault();g.moved=true;doc.documentElement.classList.add('number-scrubbing');
    // Accumulate fractional movement so integer fields also support fine adjustment.
    g.value=scrubNumber(g.value,e.clientX-g.lastX,{...g,integer:false,fine:e.shiftKey,fast:e.altKey});g.lastX=e.clientX;
    g.input.value=String(g.integer?Math.round(g.value):g.value);
    g.input.dispatchEvent(new win.Event('input',{bubbles:true}));
  },options);
  doc.addEventListener('pointerup',e=>{if(e.pointerId===gesture?.pointer)finish(false);},options);
  doc.addEventListener('pointercancel',e=>{if(e.pointerId===gesture?.pointer)finish(true);},options);
  doc.addEventListener('lostpointercapture',e=>{if(e.pointerId===gesture?.pointer)finish(true);},options);
  doc.addEventListener('keydown',e=>{if(gesture&&e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();finish(true);}},options);
  win.addEventListener('blur',()=>finish(true),{signal:controller.signal});
  return()=>{finish(true);controller.abort();};
}
