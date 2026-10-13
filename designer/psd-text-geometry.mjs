// Photoshop channel pixels are already in world axes. Recover an upright glyph
// rectangle before applying the editable object's transform in the UI renderer.
export function psdTextGeometry(pixels, record, rotation) {
  if (!Number.isFinite(rotation) || Math.abs(rotation) < 0.001) return null;
  const angle = (rotation * Math.PI) / 180,
    c = Math.cos(angle),
    s = Math.sin(angle);
  let left = Infinity,
    top = Infinity,
    right = -Infinity,
    bottom = -Infinity;
  const halfPixel = (Math.abs(c) + Math.abs(s)) / 2;
  for (let y = 0; y < record.height; y++)
    for (let x = 0; x < record.width; x++) {
      if (!pixels[(y * record.width + x) * 4 + 3]) continue;
      const dx = x + 0.5 - record.width / 2,
        dy = y + 0.5 - record.height / 2;
      const u = c * dx + s * dy,
        v = -s * dx + c * dy;
      left = Math.min(left, u - halfPixel);
      right = Math.max(right, u + halfPixel);
      top = Math.min(top, v - halfPixel);
      bottom = Math.max(bottom, v + halfPixel);
    }
  if (!Number.isFinite(left)) return null;
  const width = Math.ceil(right - left),
    height = Math.ceil(bottom - top);
  const cx = (left + right) / 2,
    cy = (top + bottom) / 2;
  return {
    x: record.x + record.width / 2 + c * cx - s * cy - width / 2,
    y: record.y + record.height / 2 + s * cx + c * cy - height / 2,
    width,
    height,
    rotation,
  };
}
export function psdLocalPaintBounds(record, box, bounds) {
  const c = Math.cos((box.rotation * Math.PI) / 180),
    s = Math.sin((box.rotation * Math.PI) / 180);
  const points = [];
  for (const x of [record.x + bounds.x, record.x + bounds.x + bounds.width])
    for (const y of [
      record.y + bounds.y,
      record.y + bounds.y + bounds.height,
    ]) {
      const dx = x - box.x - box.width / 2,
        dy = y - box.y - box.height / 2;
      points.push({
        x: c * dx + s * dy + box.width / 2,
        y: -s * dx + c * dy + box.height / 2,
      });
    }
  const x = Math.floor(Math.min(...points.map((p) => p.x))),
    y = Math.floor(Math.min(...points.map((p) => p.y)));
  return {
    x,
    y,
    width: Math.ceil(Math.max(...points.map((p) => p.x))) - x,
    height: Math.ceil(Math.max(...points.map((p) => p.y))) - y,
  };
}
