import {html} from './dom-controls.mjs';

// Shared toolkit chrome; callers keep ownership of their actions and cancellation.
export function dialogShell(dialog,{title,description='',wide=false,workspace='UI Designer',kind='standard'}){
  dialog.classList.add('vg-modal');dialog.dataset.popupSize=wide?'wide':'compact';dialog.dataset.popupKind=kind;
  dialog.oncancel=null;
  const id=dialog.id||'ui-studio-dialog';dialog.id=id;dialog.setAttribute('aria-labelledby',id+'-heading');
  const header=html('header',{class:'vg-dialog-header'}),copy=html('div',{class:'vg-dialog-copy'});
  copy.append(html('span',{class:'vg-dialog-eyebrow'},'VINAGEN · '+workspace),html('h2',{id:id+'-heading'},title));
  const close=html('button',{type:'button',class:'vg-dialog-close','aria-label':'Close dialog',title:'Close dialog'},'×');
  close.onclick=()=>{if(dialog.dispatchEvent(new Event('cancel',{cancelable:true})))dialog.close();};
  header.append(html('img',{class:'vg-dialog-mark',src:'robot.png',alt:'',width:40,height:40}),copy,close);
  const body=html('div',{class:'vg-dialog-body'}),actions=html('footer',{class:'vg-dialog-actions'});
  if(description)body.append(html('p',{class:'vg-dialog-description'},description));
  dialog.replaceChildren(header,body,actions);return {body,actions};
}

export function prepareGraphDialog(dialog){
  dialog.classList.add('vg-modal');dialog.dataset.popupSize='compact';
  const header=dialog.querySelector('.dialog-header');
  if(!header.querySelector('.vg-dialog-mark')){
    const title=header.querySelector('#dialog-title'),copy=html('div',{class:'vg-dialog-copy'});
    title.setAttribute('role','heading');title.setAttribute('aria-level','2');
    copy.append(html('span',{class:'vg-dialog-eyebrow'},'VINAGEN · WEB GRAPH STUDIO'),title);
    header.prepend(html('img',{class:'vg-dialog-mark',src:'robot.png',alt:'',width:40,height:40}),copy);
  }
}
