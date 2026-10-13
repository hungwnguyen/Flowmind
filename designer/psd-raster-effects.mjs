import {psdEdgeDistance} from './psd-distance.mjs';
import {paintPSDText,blurPSDAlpha} from './psd-text.mjs';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const value=(v,f=0)=>Number.isFinite(v?.value)?v.value:Number.isFinite(v)?v:f;
const enabled=(e,key,multi)=>[e[key],...(e[multi]||[])].filter(x=>x?.enab);
const color=c=>['Rd  ','Grn ','Bl  '].map(k=>clamp(value(c?.[k]),0,255));
function tint(pixels,i,c,amount,mode){
  for(let k=0;k<3;k++){const old=pixels[i+k],target=mode==='multiply'||mode==='Mltp'?old*c[k]/255:mode==='screen'||mode==='Scrn'?255-(255-old)*(255-c[k])/255:c[k];pixels[i+k]=old*(1-amount)+target*amount;}
}
function mergePaint(below,above){
  if(!above)return below;
  const x=Math.min(below.bounds.x,above.bounds.x),y=Math.min(below.bounds.y,above.bounds.y),width=Math.max(below.bounds.x+below.width,above.bounds.x+above.width)-x,height=Math.max(below.bounds.y+below.height,above.bounds.y+above.height)-y;
  if(width*height>16777216)return above;
  const pixels=new Uint8ClampedArray(width*height*4);
  for(const paint of [below,above])for(let row=0;row<paint.height;row++)for(let column=0;column<paint.width;column++){
    const from=(row*paint.width+column)*4,to=((row+paint.bounds.y-y)*width+column+paint.bounds.x-x)*4,a=paint.pixels[from+3]/255,b=pixels[to+3]/255,out=a+b*(1-a);if(!out)continue;
    for(let k=0;k<3;k++)pixels[to+k]=(paint.pixels[from+k]*a+pixels[to+k]*b*(1-a))/out;pixels[to+3]=out*255;
  }
  return {pixels,width,height,bounds:{x,y,width,height}};
}
// Raster channels exclude Photoshop's live layer styles. Preserve those styles
// during extraction; the source alpha remains the mask for inner lighting.
export function paintPSDRaster(pixels,width,height,effects,warnings=[],context={}){
  if(!effects||effects.masterFXSwitch===false)return null;
  let paint=paintPSDText(pixels,width,height,effects,warnings,context);
  if(paint?.useRenderer)return paint;
  const blendPaints=[];
  const glow=enabled(effects,'OrGl','outerGlowMulti')[0];
  if(glow){
    const glowPaint=paintPSDText(pixels,width,height,{'Scl ':effects['Scl '],DrSh:{...glow,lagl:0,Dstn:0}},warnings,{...context,shadowOnly:true});
    if(glowPaint&&!glowPaint.useRenderer){
      const blend=glow['Md  ']?.value||'normal',mode=({Mltp:'multiply',Scrn:'screen',Nrml:'normal'})[blend]||blend;
      if(context.separateBlendEffects&&['multiply','screen','overlay','darken','lighten','colorDodge','colorBurn','hardLight','softLight','difference','exclusion'].includes(mode)){
        blendPaints.push({...glowPaint,blendMode:mode.replace(/[A-Z]/g,c=>'-'+c.toLowerCase()),name:'Outer Glow'});
      }else{paint=mergePaint(glowPaint,paint||{pixels,width,height,bounds:{x:0,y:0,width,height}});if(mode!=='normal')warnings.push('Isolated Photoshop outer glow uses a normal-composite approximation.');}
    }
  }
  const bevel=enabled(effects,'ebbl','bevelEmbossMulti')[0],inner=[...enabled(effects,'IrSh','innerShadowMulti'),...enabled(effects,'IrGl','innerGlowMulti')];
  if(blendPaints.length){paint||={pixels:pixels.slice(),width,height,bounds:{x:0,y:0,width,height}};paint.blendPaints=blendPaints;}
  if(!bevel&&!inner.length)return paint;
  if(width*height>4194304){warnings.push('Large raster inner lighting exceeds the processing limit.');return paint;}
  paint||={pixels:pixels.slice(),width,height,bounds:{x:0,y:0,width,height}};
  const alpha=new Uint8Array(width*height);for(let i=0;i<alpha.length;i++)alpha[i]=pixels[i*4+3];
  const scale=clamp(value(effects['Scl '],100)/100,0,100),left=-paint.bounds.x,top=-paint.bounds.y;
  const offset=(x,y)=>((y+top)*paint.width+x+left)*4;
  for(const effect of inner){
    const size=clamp(value(effect.blur)*scale,0,64),blur=blurPSDAlpha(alpha,width,height,size),angle=value(effect.lagl,120)*Math.PI/180,distance=effect._class==='IrGl'?0:clamp(value(effect.Dstn)*scale,0,128),dx=Math.round(-Math.cos(angle)*distance),dy=Math.round(Math.sin(angle)*distance),c=color(effect['Clr ']),opacity=clamp(value(effect.Opct,100)/100,0,1);
    for(let y=0;y<height;y++)for(let x=0;x<width;x++){const a=alpha[y*width+x]/255;if(!a)continue;const sx=x-dx,sy=y-dy,shade=sx<0||sy<0||sx>=width||sy>=height?0:blur[sy*width+sx]/255;tint(paint.pixels,offset(x,y),c,(1-shade)*opacity,effect['Md  ']?.value);}
    warnings.push('Photoshop raster inner lighting uses a bounded approximation.');
  }
  if(bevel){
    if(bevel.bvlS?.value&&bevel.bvlS.value!=='InrB'){warnings.push('Photoshop outer bevel needs visual review.');return paint;}
    const size=clamp(value(bevel.blur)*scale,0,64);if(!size)return paint;
    // Euclidean edge distance avoids grid-direction facets at rounded corners.
    const distance=psdEdgeDistance(alpha,width,height,size);
    const field=bevel.bvlT?.value==='SfBL'?blurPSDAlpha(distance,width,height,.75):distance,soften=clamp(value(bevel.Sftn)*scale,0,32),angle=value(bevel.lagl,120)*Math.PI/180,alt=value(bevel.Lald,30)*Math.PI/180,depth=clamp(value(bevel.srgR,100)/100,.01,10)*(bevel.bvlD?.value==='Out '?-1:1),light=[Math.cos(angle)*Math.cos(alt),-Math.sin(angle)*Math.cos(alt),Math.sin(alt)],highlight=color(bevel.hglC),shadow=color(bevel.sdwC);
    const sample=(x,y)=>x<0||y<0||x>=width||y>=height?0:field[y*width+x];
    const highlights=new Float32Array(alpha.length),shadows=new Float32Array(alpha.length);
    for(let y=0;y<height;y++)for(let x=0;x<width;x++){
      const i=y*width+x;if(!alpha[i])continue;const nx=-(sample(x+1,y)-sample(x-1,y))*depth/4,ny=-(sample(x,y+1)-sample(x,y-1))*depth/4,length=Math.hypot(nx,ny,1),lit=(nx*light[0]+ny*light[1]+light[2])/length-light[2];
      const strength=clamp(lit/(lit>0?Math.max(.01,1-light[2]):Math.max(.01,light[2])),-1,1);
      highlights[i]=Math.max(0,strength)*alpha[i];shadows[i]=Math.max(0,-strength)*alpha[i];
    }
    // Soften the light masks after shading. Blurring the height first creates
    // a wide, saturated shelf at high depth instead of a soft bevel edge.
    // Normalize by alpha coverage so translucent/outside pixels do not darken
    // the silhouette or spread the bevel over the layer's external glow.
    const high=blurPSDAlpha(highlights,width,height,soften),low=blurPSDAlpha(shadows,width,height,soften),coverage=blurPSDAlpha(alpha,width,height,soften);
    for(let y=0;y<height;y++)for(let x=0;x<width;x++){
      const i=y*width+x;if(!alpha[i]||!coverage[i])continue;const p=offset(x,y);
      tint(paint.pixels,p,shadow,clamp(low[i]/coverage[i],0,1)*clamp(value(bevel.sdwO,100)/100,0,1),bevel.sdwM?.value);
      tint(paint.pixels,p,highlight,clamp(high[i]/coverage[i],0,1)*clamp(value(bevel.hglO,100)/100,0,1),bevel.hglM?.value);
    }
    warnings.push('Photoshop bevel lighting uses a bounded approximation.');
  }
  return paint;
}
