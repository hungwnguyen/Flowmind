// Image artwork is shared; each instance keeps its own rectangle and hierarchy.
const fields = [
  "image",
  "imageComposite",
  "fill",
  "fillGradient",
  "imageMode",
  "imageFit",
  "sliced",
];
const identity = (layer) =>
  layer?.role !== "text" && layer?.image?.guid
    ? `${layer.image.guid}:${layer.image.localId || ""}`
    : null;
const clone = (value) =>
  value === undefined ? undefined : structuredClone(value);
export function imageInstances(doc, layer) {
  const key = identity(layer);
  return key ? doc.layers.filter((item) => identity(item) === key) : [];
}
export function syncImageComponents(before, doc) {
  const previous = new Map(before.layers.map((layer) => [layer.id, layer]));
  const changes = new Map();
  for (const layer of doc.layers) {
    const old = previous.get(layer.id),
      key = identity(old);
    if (!key || !identity(layer)) continue;
    for (const field of fields) {
      if (JSON.stringify(old[field]) === JSON.stringify(layer[field])) continue;
      if (!changes.has(key)) changes.set(key, new Map());
      changes.get(key).set(field, clone(layer[field]));
    }
  }
  for (const layer of doc.layers) {
    if (!identity(layer)) continue;
    const changesForImage = changes.get(identity(previous.get(layer.id)));
    if (!changesForImage) continue;
    for (const [field, value] of changesForImage) {
      if (value === undefined) delete layer[field];
      else layer[field] = clone(value);
    }
  }
}
