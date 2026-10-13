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
