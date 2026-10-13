import {html as el} from './dom-controls.mjs';
export const commentIcon='M5 3h14a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H9l-6 3V6a3 3 0 0 1 2-3z';
const id=()=>globalThis.crypto?.randomUUID?.()||'comment-'+Date.now().toString(36)+Math.random().toString(36).slice(2);
export function validateComments(comments) {
  if(comments===undefined)return;
  if(!Array.isArray(comments)||comments.length>1000)throw Error('Up to 1000 comment threads are supported.');
  const ids=new Set();
  const identity=value=>typeof value==='string'&&value.length>0&&value.length<=128&&!ids.has(value)&&(ids.add(value),true);
  for(const thread of comments){
    if(!thread||!identity(thread.id)||![thread.x,thread.y].every(n=>Number.isFinite(n)&&Math.abs(n)<=100000)||typeof thread.resolved!=='boolean'||
      thread.layerId!==undefined&&(typeof thread.layerId!=='string'||thread.layerId.length>128)||
      !Array.isArray(thread.messages)||!thread.messages.length||thread.messages.length>100)throw Error('Invalid comment thread.');
    for(const message of thread.messages)if(!message||!identity(message.id)||typeof message.author!=='string'||!message.author.trim()||message.author.length>80||
      typeof message.body!=='string'||!message.body.trim()||message.body.length>4000||typeof message.createdAt!=='string'||!/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)$/.test(message.createdAt)||!Number.isFinite(Date.parse(message.createdAt)))throw Error('Invalid comment message.');
  }
}
// Each host owns its document, Undo and persistence. This view never sends messages externally.
export function canvasComments({viewport,document:getDocument,view,edit,active=()=>true,anchor=p=>p,position=t=>t,changed=()=>{},report=()=>{},author=()=> 'You'}) {
  const root=el('div',{class:'canvas-comments'}),pins=el('div',{class:'comment-pins'}),panel=el('section',{class:'comment-popover',hidden:'',role:'dialog','aria-label':'Comment thread'});
  root.append(pins,panel);viewport.append(root);
  let selected=null,draft=null,panelKey='',currentDocument=null,drag=null;const pinElements=new Map();
  const documentKey=()=>{const doc=getDocument();return doc?.path||doc?.name;};
  const close=()=>{finishDrag(false);selected=null;draft=null;panelKey='';panel.hidden=true;paint();};
  const thread=()=>getDocument()?.comments?.find(t=>t.id===selected);
  const button=(label,fn)=>el('button',{type:'button',onclick:fn},label);
  const mutate=fn=>{try{edit(fn);paint();changed();}catch(error){report(error.message);}};
  // Preview without editing the document; a completed drag creates one Undo entry.
  function finishDrag(commit) {
    if(!drag)return;
    const gesture=drag;drag=null;
    if(gesture.moved)gesture.suppressClick();
    if(gesture.pin.hasPointerCapture(gesture.pointerId))gesture.pin.releasePointerCapture(gesture.pointerId);
    if(commit&&gesture.moved&&active()&&documentKey()===gesture.documentKey){
      const next=anchor(gesture.point);
      if(![next.x,next.y].every(n=>Number.isFinite(n)&&Math.abs(n)<=100000)){report('Comment position is outside the supported canvas.');paint();return;}
      mutate(()=>{const target=getDocument()?.comments?.find(t=>t.id===gesture.id);if(!target)return;
        // Re-anchor in UI Designer, or detach when dropped onto empty canvas.
        delete target.layerId;delete target.worldX;delete target.worldY;Object.assign(target,next);
      });
    }else paint();
  }
  function movePin(event) {
    if(!drag||event.pointerId!==drag.pointerId)return;
    event.stopPropagation();
    if(!active()||documentKey()!==drag.documentKey){finishDrag(false);return;}
    const dx=event.clientX-drag.startX,dy=event.clientY-drag.startY;
    if(!drag.moved&&Math.hypot(dx,dy)<4)return;
    drag.moved=true;drag.point={x:drag.origin.x+dx/view().zoom,y:drag.origin.y+dy/view().zoom};paint();
  }
  function makePin(item) {
    let ignoreClick=false;
    const pin=button('',()=>{if(ignoreClick){ignoreClick=false;return;}draft=null;selected=selected===item.id?null:item.id;panelKey='';paint();});
    pin.onpointerdown=event=>{
      if(event.button!==0||!event.isPrimary||!active())return;
      event.stopPropagation();ignoreClick=false;
      const target=getDocument()?.comments?.find(t=>t.id===item.id);if(!target)return;
      finishDrag(false);
      drag={id:item.id,pin,pointerId:event.pointerId,documentKey:documentKey(),startX:event.clientX,startY:event.clientY,origin:position(target),moved:false,suppressClick:()=>{ignoreClick=true;}};
      pin.setPointerCapture(event.pointerId);
    };
    pin.onpointermove=movePin;
    pin.onpointerup=event=>{if(drag?.pointerId!==event.pointerId)return;movePin(event);event.stopPropagation();finishDrag(true);};
    pin.onpointercancel=pin.onlostpointercapture=event=>{if(drag?.pointerId===event.pointerId)finishDrag(false);};
    return pin;
  }
  const visiblePosition=item=>drag?.moved&&drag.id===item.id?drag.point:position(item);
  function create(point) {
    if((getDocument()?.comments?.length||0)>=1000){report('Comment limit reached.');return;}
    selected=null;draft=anchor(point);panelKey='';paint();panel.querySelector('textarea')?.focus();
  }
  function buildPanel(item) {
    panel.replaceChildren();
    const heading=el('div',{class:'comment-heading'});heading.append(el('strong',{},draft?'New comment':item.resolved?'Resolved thread':'Comment thread'));
    if(item)heading.append(button(item.resolved?'Reopen':'Resolve',()=>mutate(()=>{const target=thread();if(target)target.resolved=!target.resolved;})));
    const dismiss=button('×',close);dismiss.setAttribute('aria-label','Close comment');heading.append(dismiss);panel.append(heading);
    if(item){const messages=el('div',{class:'comment-messages'});for(const message of item.messages){
      const row=el('article',{class:'comment-message'}),avatar=el('span',{class:'comment-avatar'},Array.from(message.author)[0].toUpperCase()),copy=el('div');
      const time=el('time',{datetime:message.createdAt},new Date(message.createdAt).toLocaleString([], {month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}));
      const by=el('div',{class:'comment-by'});by.append(el('strong',{},message.author),time);copy.append(by,el('p',{},message.body));row.append(avatar,copy);messages.append(row);
    }panel.append(messages);}
    const form=el('form',{class:'comment-form'}),body=el('textarea',{maxlength:4000,rows:3,'aria-label':item?'Reply':'Comment',placeholder:item?'Write a reply…':'Add a comment…'}),send=el('button',{type:'submit',disabled:''},item?'Reply':'Post comment');
    body.oninput=()=>send.disabled=!body.value.trim();
    form.onsubmit=event=>{event.preventDefault();const text=body.value.trim(),who=String(author()||'You').trim().slice(0,80)||'You';if(!text)return;
      if(thread()?.messages.length>=100){report('Reply limit reached.');return;}
      const message={id:id(),author:who,body:text,createdAt:new Date().toISOString()};
      mutate(()=>{const doc=getDocument();if(item){const target=thread();if(target)target.messages.push(message);}else{const next={id:id(),...draft,resolved:false,messages:[message]};(doc.comments??=[]).push(next);selected=next.id;draft=null;}});
    };
    body.onkeydown=event=>{if((event.ctrlKey||event.metaKey)&&event.key==='Enter'){event.preventDefault();form.requestSubmit();}};
    form.append(body,send);panel.append(form);
    if(item){const remove=button('Delete thread',()=>mutate(()=>{getDocument().comments=getDocument().comments.filter(t=>t.id!==item.id);selected=null;}));remove.className='comment-delete';panel.append(remove);}
  }
  function paint() {
    const doc=getDocument();root.hidden=!active()||!doc;if(root.hidden){finishDrag(false);return;}
    const keyDocument=documentKey();
    if(currentDocument!==keyDocument){currentDocument=keyDocument;finishDrag(false);selected=null;draft=null;panelKey='';}
    const comments=doc.comments||[],v=view(),visible=comments.filter(t=>!t.resolved||t.id===selected);
    const visibleIds=new Set(visible.map(item=>item.id));for(const [id,pin]of pinElements)if(!visibleIds.has(id)){pin.remove();pinElements.delete(id);}
    for(const item of visible){const point=visiblePosition(item);let pin=pinElements.get(item.id);
      if(!pin){pin=makePin(item);pinElements.set(item.id,pin);pins.append(pin);}
      pin.className='comment-pin'+(item.id===selected?' selected':'')+(item.resolved?' resolved':'')+(drag?.moved&&drag.id===item.id?' dragging':'');pin.dataset.commentId=item.id;pin.setAttribute('aria-label','Open comment by '+item.messages[0].author);pin.setAttribute('aria-expanded',String(item.id===selected));pin.title='Click to open; drag to move comment';
      pin.textContent=Array.from(item.messages[0].author)[0].toUpperCase();pin.style.left=(v.pan.x+point.x*v.zoom)+'px';pin.style.top=(v.pan.y+point.y*v.zoom)+'px';}
    const item=thread();if(!item&&!draft){panel.hidden=true;panelKey='';return;}
    panel.hidden=false;
    const key=JSON.stringify(item?{id:item.id,resolved:item.resolved,messages:item.messages}:draft);if(key!==panelKey){panelKey=key;buildPanel(item);}
    const point=draft?position(draft):visiblePosition(item),x=v.pan.x+point.x*v.zoom,y=v.pan.y+point.y*v.zoom;
    const width=Math.min(320,Math.max(180,viewport.clientWidth-16));panel.style.width=width+'px';
    panel.style.left=Math.max(8,Math.min(x+18,viewport.clientWidth-width-8))+'px';
    panel.style.top=Math.max(8,Math.min(y+8,viewport.clientHeight-panel.offsetHeight-8))+'px';
  }
  root.addEventListener('pointerdown',e=>e.stopPropagation());root.addEventListener('wheel',e=>e.stopPropagation());
  document.addEventListener('pointerdown',event=>{if(!active()||event.target.closest('.canvas-comments'))return;if(selected||draft)close();},true);
  document.addEventListener('keydown',event=>{if(active()&&event.key==='Escape'&&(drag||selected||draft)){event.preventDefault();event.stopImmediatePropagation();if(drag)finishDrag(false);else close();viewport.focus();}},true);
  return {root,paint,create,close};
}
