import {resourceURL} from './workspace.mjs';
// Update size: the layer's displayed image rectangle becomes the source file's pixel size.
// Resampling runs in the browser so the saved pixels match the canvas preview.
import {imageMode} from './ui-model.mjs';

export const maxResizedImageBytes=5*1024*1024;
export function imageResizeTarget(layer,sourceWidth,sourceHeight){
  let width=layer.width,height=layer.height;
  if(imageMode(layer)==='preserve_aspect'){const fit=Math.min(width/sourceWidth,height/sourceHeight);width=sourceWidth*fit;height=sourceHeight*fit;}
  width=Math.max(1,Math.round(width));height=Math.max(1,Math.round(height));
  if(width>8192||height>8192||width*height>16777216)throw Error(`${layer.name}: ${width}×${height} px exceeds 8192 px per side or 16 megapixels.`);
  return {width,height};
}
// The original file, not the 1024 px preview media, so enlarging starts from every source pixel.
export async function loadSourceImage(image){
  const source=new Image();source.decoding='async';
  source.src=resourceURL(image.guid);
  try{await source.decode();}catch{throw Error('Could not load '+(image.path||image.name||'the source image')+'. Update size supports project PNG/JPEG images.');}
  return source;
}
// Shrinking halves per pass so every source pixel contributes (no aliasing). Enlarging uses the
// browser's high-quality filter in one pass: smooth edges instead of blocky pixels.
export function resampleImage(source,width,height){
  const draw=(image,w,h)=>{const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;const context=canvas.getContext('2d');context.imageSmoothingEnabled=true;context.imageSmoothingQuality='high';context.drawImage(image,0,0,w,h);return canvas;};
  let current=source,w=source.naturalWidth,h=source.naturalHeight;
  while(w>width*2||h>height*2){w=Math.max(width,Math.ceil(w/2));h=Math.max(height,Math.ceil(h/2));current=draw(current,w,h);}
  const canvas=draw(current,width,height);
  return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(Error('Could not encode the resized image.')),'image/png'));
}
export function blobBase64(blob){
  return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result.slice(reader.result.indexOf(',')+1));reader.onerror=()=>reject(reader.error||Error('Could not read image.'));reader.readAsDataURL(blob);});
}
