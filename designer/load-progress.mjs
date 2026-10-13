import {html} from './dom-controls.mjs';

// Tracks rendered images and required font promises without delaying interaction.
// Each opening owns a generation, so late loads cannot complete a newer document.
export function loadProgress(footer) {
  const panel=html('div',{class:'workspace-load-progress',hidden:true});
  const label=html('span',{class:'workspace-load-label'},'Loading…');
  const percent=html('span',{class:'workspace-load-percent'},'0%');
  const track=html('div',{class:'workspace-load-track',role:'progressbar','aria-label':'Loading workspace','aria-valuemin':0,'aria-valuemax':100,'aria-valuenow':0});
  track.append(html('span',{class:'workspace-load-fill'}));panel.append(label,percent,track);footer.append(panel);
  let generation=0,cleanup=()=>{},hideTimer;
  const show=value=>{percent.textContent=value+'%';track.setAttribute('aria-valuenow',value);track.style.setProperty('--load-progress',value+'%');};
  const cancel=token=>{if(token!==generation)return;cleanup();cleanup=()=>{};clearTimeout(hideTimer);hideTimer=undefined;panel.hidden=true;footer.classList.remove('workspace-loading');};
  return {
    begin(){cancel(generation);generation++;panel.hidden=false;footer.classList.add('workspace-loading');label.textContent='Loading…';show(0);return generation;},
    cancel,
    watch(root,token,{tasks=[],onError=()=>{}}={}) {
      if(token!==generation)return;
      cleanup();
      const images=new Map(),extras=tasks.map(()=>false);let observer,frame,disposed=false;
      const update=()=>{
        if(disposed||token!==generation)return;
        clearTimeout(hideTimer);hideTimer=undefined;
        const total=images.size+extras.length,done=[...images.values()].filter(item=>item.done).length+extras.filter(Boolean).length;
        const value=total?Math.min(done===total?100:99,Math.floor(20+80*done/total)):100;
        label.textContent='Loading…';show(value);
        if(done===total){
          label.textContent='Loaded';
          hideTimer=setTimeout(()=>{if(disposed||token!==generation)return;const failed=[...images.values()].filter(item=>item.failed).length;cancel(token);if(failed)onError(failed);},250);
        }
      };
      const scan=()=>{
        frame=undefined;if(disposed||token!==generation)return;
        const current=new Set([...root.querySelectorAll('img')].filter(image=>image.getAttribute('src')));
        for(const [image,item]of images)if(!current.has(image)||item.src!==image.src){item.remove();images.delete(image);}
        for(const image of current)if(!images.has(image)){
          const item={src:image.src,done:false,failed:false};images.set(image,item);
          const settle=async()=>{
            if(item.settling||disposed||images.get(image)!==item||image.src!==item.src)return;item.settling=true;
            try{if(image.naturalWidth&&image.decode)await image.decode();else if(!image.naturalWidth)throw Error('Image unavailable');}
            catch{item.failed=true;}
            if(disposed||images.get(image)!==item||image.src!==item.src)return;
            item.done=true;item.remove();update();
          };
          image.addEventListener('load',settle);image.addEventListener('error',settle);
          item.remove=()=>{image.removeEventListener('load',settle);image.removeEventListener('error',settle);};
          if(image.complete)settle();
        }
        update();
      };
      cleanup=()=>{disposed=true;observer?.disconnect();if(frame!==undefined)cancelAnimationFrame(frame);for(const item of images.values())item.remove();};
      observer=new MutationObserver(()=>{if(frame===undefined)frame=requestAnimationFrame(scan);});
      observer.observe(root,{childList:true,subtree:true,attributes:true,attributeFilter:['src']});
      tasks.forEach((task,index)=>Promise.resolve(task).catch(()=>{}).then(()=>{extras[index]=true;update();}));
      scan();
    },
  };
}
