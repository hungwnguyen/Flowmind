// Unity Auto9Slicer profiles: tolerance 3, margin 2, center 2.
// Fully transparent RGB is ignored. No repeated band means no cut.
export function detectSliceBorders({width,height,data},{tolerance=3,margin=2,centerSize=2}={}) {
  if(!Number.isInteger(width)||!Number.isInteger(height)||width<1||height<1||data?.length!==width*height*4)throw Error('Invalid slice image pixels.');
  const band=horizontal=>{
    const length=horizontal?width:height,cross=horizontal?height:width,offset=(line,p)=>4*(horizontal?p*width+line:line*width+p);
    let start=0,end=0,run=0;
    for(let line=1;line<=length;line++){
      let same=line<length;
      if(same)for(let p=0;p<cross&&same;p++){
        const a=offset(line-1,p),b=offset(line,p),aa=data[a+3],ba=data[b+3];
        for(let c=0;c<4;c++)if(Math.abs((c<3&&!aa?0:data[a+c])-(c<3&&!ba?0:data[b+c]))>tolerance){same=false;break;}
      }
      if(!same){if(line-1-run>end-start){start=run;end=line-1;}run=line;}
    }
    start+=margin;end-=margin;
    return end>start&&end-start+1>=centerSize?{start,end}:null;
  };
  const x=band(true),y=band(false);
  return {left:x?.start??0,right:x?width-x.end-1:0,top:y?.start??0,bottom:y?height-y.end-1:0};
}
export function sliceMinimum(width,height,borders) {
  const x=borders.left||borders.right,y=borders.top||borders.bottom;
  return {width:x?Math.min(width,borders.left+borders.right+2):width,height:y?Math.min(height,borders.top+borders.bottom+2):height};
}
