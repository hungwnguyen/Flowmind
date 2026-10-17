// Exact squared Euclidean distance transform (separable lower envelopes).
// Chamfer distances create directional ridges on round Photoshop bevels.
function transform(input, output, length, sites, edges) {
  let k = 0;
  sites[0] = 0;
  edges[0] = -Infinity;
  edges[1] = Infinity;
  for (let q = 1; q < length; q++) {
    let cross;
    do {
      const p = sites[k];
      cross = (input[q] + q * q - (input[p] + p * p)) / (2 * (q - p));
      if (cross > edges[k]) break;
      k--;
    } while (k >= 0);
    sites[++k] = q;
    edges[k] = cross;
    edges[k + 1] = Infinity;
  }
  k = 0;
  for (let q = 0; q < length; q++) {
    while (edges[k + 1] < q) k++;
    const d = q - sites[k];
    output[q] = d * d + input[sites[k]];
  }
}
export function psdEdgeDistance(alpha, width, height, radius) {
  const w = width + 2,
    h = height + 2,
    grid = new Float32Array(w * h);
  const max = w * w + h * h;
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const a = alpha[y * width + x] / 255;
      grid[(y + 1) * w + x + 1] = a === 1 ? max : a * a;
    }
  const n = Math.max(w, h),
    input = new Float64Array(n),
    output = new Float64Array(n);
  const sites = new Int32Array(n),
    edges = new Float64Array(n + 1);
  for (let y = 0; y < h; y++) {
    input.set(grid.subarray(y * w, (y + 1) * w));
    transform(input, output, w, sites, edges);
    grid.set(output.subarray(0, w), y * w);
  }
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) input[y] = grid[y * w + x];
    transform(input, output, h, sites, edges);
    for (let y = 0; y < h; y++) grid[y * w + x] = output[y];
  }
  const result = new Float32Array(alpha.length);
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++)
      result[y * width + x] = Math.min(
        radius,
        Math.sqrt(grid[(y + 1) * w + x + 1]),
      );
  return result;
}

// Subpixel contour distance for soft-bevel normals. Fractional alpha describes
// coverage, not a seed at a pixel centre: the latter leaves steps on shallow
// curves even with an exact integer-grid Euclidean transform.
export function psdSignedEdgeDistance(alpha,width,height,radius){
  const xs=new Float32Array(alpha.length),ys=new Float32Array(alpha.length);
  xs.fill(NaN);ys.fill(NaN);
  const at=(x,y)=>alpha[y*width+x]/255;
  for(let y=1;y<height-1;y++)for(let x=1;x<width-1;x++){
    const i=y*width+x,a=alpha[i]/255;
    if((a===0||a===1)&&alpha[i-1]!==255-alpha[i]&&alpha[i+1]!==255-alpha[i]&&alpha[i-width]!==255-alpha[i]&&alpha[i+width]!==255-alpha[i])continue;
    let gx=at(x+1,y-1)+2*at(x+1,y)+at(x+1,y+1)-at(x-1,y-1)-2*at(x-1,y)-at(x-1,y+1);
    let gy=at(x-1,y+1)+2*at(x,y+1)+at(x+1,y+1)-at(x-1,y-1)-2*at(x,y-1)-at(x+1,y-1);
    const norm=Math.hypot(gx,gy);if(!norm)continue;gx/=norm;gy/=norm;
    let u=Math.abs(gx),v=Math.abs(gy);if(u<v)[u,v]=[v,u];
    // Invert the area of a unit pixel cut by the local straight contour.
    const corner=.5*v/u;
    let d;
    if(!v)d=.5-a;
    else if(a<corner)d=.5*(u+v)-Math.sqrt(2*u*v*a);
    else if(a>1-corner)d=-.5*(u+v)+Math.sqrt(2*u*v*(1-a));
    else d=(.5-a)*u;
    xs[i]=x+gx*d;ys[i]=y+gy*d;
  }
  const take=(i,j,x,y)=>{
    if(!Number.isFinite(xs[j]))return;
    const d=(x-xs[j])**2+(y-ys[j])**2,old=(x-xs[i])**2+(y-ys[i])**2;
    if(!Number.isFinite(old)||d<old){xs[i]=xs[j];ys[i]=ys[j];}
  };
  // Propagate contour points, measuring Euclidean distances to the points
  // themselves. Two bidirectional sweeps are a bounded nearest-point
  // approximation; never accumulate chamfer/grid-step lengths.
  for(let pass=0;pass<2;pass++){
    for(let y=1;y<height-1;y++)for(let x=1;x<width-1;x++){
      const i=y*width+x;take(i,i-1,x,y);take(i,i-width,x,y);take(i,i-width-1,x,y);take(i,i-width+1,x,y);
    }
    for(let y=height-2;y>0;y--)for(let x=width-2;x>0;x--){
      const i=y*width+x;take(i,i+1,x,y);take(i,i+width,x,y);take(i,i+width-1,x,y);take(i,i+width+1,x,y);
    }
  }
  const result=new Float32Array(alpha.length);
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
    const i=y*width+x,d=Number.isFinite(xs[i])?Math.hypot(x-xs[i],y-ys[i]):radius;
    result[i]=(alpha[i]>=128?1:-1)*Math.min(radius,d);
  }
  return result;
}
