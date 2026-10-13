// Navigate the displayed, filtered list without wrapping at its boundaries.
export function selectLayerIds(ids, selected, anchor, id, event = {}) {
  const additive = !!(event.ctrlKey || event.metaKey);
  if (event.shiftKey) {
    const start = ids.indexOf(anchor), end = ids.indexOf(id);
    if (start >= 0 && end >= 0) {
      const next = additive ? new Set(selected) : new Set();
      for (const item of ids.slice(Math.min(start, end), Math.max(start, end) + 1)) next.add(item);
      return { selected: next, anchor };
    }
  }
  const next = additive ? new Set(selected) : new Set();
  if (additive && next.has(id)) next.delete(id); else next.add(id);
  return { selected: next, anchor: id };
}

export function layerActionIds(selected, id) {
  return selected.has(id) ? [...selected] : [id];
}

// Graph node positions remain in world coordinates when the Layers tree changes.
export function graphLayerTree(nodes) {
  const byId = new Map(nodes.map(node => [node.nodeId, node])), children = new Map();
  for (const node of nodes) {
    const parent = byId.has(node.parentNodeId) ? node.parentNodeId : 0;
    if (!children.has(parent)) children.set(parent, []);
    children.get(parent).push(node);
  }
  const result = [], seen = new Set();
  const visit = (parent, depth) => { for (const node of children.get(parent) || []) {
    if (seen.has(node.nodeId)) continue;
    seen.add(node.nodeId); result.push({ node, depth, hasChildren: children.has(node.nodeId) }); visit(node.nodeId, depth + 1);
  }};
  visit(0, 0);
  return result;
}

export function graphLayerDropPlan(nodes, ids, targetId = 0, placement = 'inside', locked = new Set()) {
  const byId = new Map(nodes.map(node => [node.nodeId, node])), chosen = new Set(ids), moving = new Set();
  const ancestors = node => { const result = [], seen = new Set();
    while (node && !seen.has(node.nodeId)) { seen.add(node.nodeId); result.push(node); node = byId.get(node.parentNodeId); }
    return result;
  };
  const selected = nodes.filter(node => chosen.has(node.nodeId) && !ancestors(byId.get(node.parentNodeId)).some(parent => chosen.has(parent.nodeId)));
  if (!selected.length || !['inside','before','after'].includes(placement)) throw Error('Choose layers and a valid drop position.');
  const target = byId.get(targetId);
  if (targetId && !target || !target && placement !== 'inside') throw Error('Drop onto an existing layer.');
  if ([...selected, ...(target ? [target] : [])].some(node => ancestors(node).some(item => locked.has(item.nodeId)))) throw Error('Unlock the layers and their parents before moving them.');
  const roots = new Set(selected.map(node => node.nodeId));
  for (const node of nodes) if (ancestors(node).some(item => roots.has(item.nodeId))) moving.add(node.nodeId);
  if (moving.has(targetId)) throw Error('A layer cannot be dropped into itself or its descendants.');
  return { selected, moving, target, parentNodeId: placement === 'inside' ? targetId : target.parentNodeId || 0 };
}

export function moveGraphLayers(nodes, ids, targetId = 0, placement = 'inside', locked = new Set()) {
  const plan = graphLayerDropPlan(nodes, ids, targetId, placement, locked);
  for (const node of plan.selected) { if (plan.parentNodeId) node.parentNodeId = plan.parentNodeId; else delete node.parentNodeId; }
  const moving = nodes.filter(node => plan.moving.has(node.nodeId)), rest = nodes.filter(node => !plan.moving.has(node.nodeId));
  let index = rest.length;
  if (plan.target && placement !== 'inside') {
    index = rest.indexOf(plan.target);
    if (placement === 'after') {
      const tree = graphLayerTree(rest), depths = new Map(tree.map(item => [item.node.nodeId, item.depth]));
      const targetIndex = tree.findIndex(item => item.node === plan.target), depth = depths.get(targetId);
      const branch = new Set([targetId]);
      for (let i = targetIndex + 1; i < tree.length && tree[i].depth > depth; i++) branch.add(tree[i].node.nodeId);
      index = Math.max(...rest.map((node, i) => branch.has(node.nodeId) ? i : -1)) + 1;
    }
  }
  rest.splice(index, 0, ...moving);
  return rest;
}

export function nextLayerId(ids, focusedId, selectedIds, direction) {
  if(!ids.length)return null;
  let index=ids.indexOf(focusedId);
  if(index<0)index=ids.findIndex(id=>selectedIds.has(id));
  if(index<0)return direction>0?ids[0]:ids.at(-1);
  return ids[Math.max(0,Math.min(ids.length-1,index+direction))];
}
export function wrapText(text, start, end, tag, value = "") {
  start = Math.max(0, Math.min(text.length, start));
  end = Math.max(start, Math.min(text.length, end));
  const open = `<${tag}${value ? "=" + value : ""}>`,
    close = `</${tag}>`;
  return {
    text:
      text.slice(0, start) +
      open +
      text.slice(start, end) +
      close +
      text.slice(end),
    start: start + open.length,
    end: end + open.length,
  };
}

export function toggleBullets(text, start, end) {
  const first = start === 0 ? 0 : text.lastIndexOf("\n", start - 1) + 1;
  let last = text.indexOf("\n", end);
  if (last < 0) last = text.length;
  if (end > start && text[end - 1] === "\n") last = end - 1;
  const lines = text.slice(first, last).split("\n"),
    remove = lines.every((line) => /^\s*• /.test(line));
  const next = lines
    .map((line) =>
      remove
        ? line.replace(/^(\s*)• /, "$1")
        : /^\s*• /.test(line)
          ? line
          : line.replace(/^(\s*)/, "$1• "),
    )
    .join("\n");
  return {
    text: text.slice(0, first) + next + text.slice(last),
    start: first,
    end: first + next.length,
  };
}

export function moveImageSlot(node, from, to) {
  if (
    from === to ||
    from < 0 ||
    to < 0 ||
    from >= node.imageSlots.length ||
    to >= node.imageSlots.length
  )
    return false;
  const order = node.imageSlots.map((_, index) => index);
  order.splice(to, 0, order.splice(from, 1)[0]);
  node.imageSlots = order.map((index) => node.imageSlots[index]);
  const cells = order.map((_, index) => imageCellRect(node, index));
  for (const label of node.labels || [])
    if (label.targetType === 0) {
      const original = label.targetIndex,
        next = order.indexOf(original),
        from = imageCellRect(node, original),
        to = cells[next];
      label.targetIndex = next;
      if (label.position && from && to) {
        label.position = {
          x:
            to.x +
            ((label.position.x - from.x) * to.width) / Math.max(1, from.width),
          y:
            to.y +
            ((label.position.y - from.y) * to.height) / Math.max(1, from.height),
        };
      }
    }
  node.imageSlot = node.imageSlots[0];
  return true;
}

export function searchableText(node) {
  return [
    node.nodeName,
    node.nodeId,
    node.comments,
    node.summary,
    node.descriptionText,
    node.tag,
    node.category,
  ]
    .filter((value) => value != null)
    .join(" ")
    .toLowerCase();
}

// SVG transforms scale CSS units; native view fonts clamp in screen pixels.
export function viewFontSize(base, zoom, min = 8, max = 64) {
  return Math.max(min, Math.min(max, Math.round(base * zoom))) / zoom;
}

// A visible authored tint wins, exactly like the native DrawNodes/GetDefaultTint resolver.
export function flowNodeColor(node, viewSettings) {
  return node.tint?.a > 0
    ? node.tint
    : viewSettings?.defaultNodeColors?.[node.nodeKind];
}

// Unity's Design Content settings own the palette. Keep legacy node colours
// only as a fallback for snapshots that do not include settings.
export function designNodeColors(node, viewSettings = {}) {
  return {
    background: viewSettings.backgroundColor ?? node.backgroundColor ??
      { r: 0, g: 0, b: 0, a: 1 },
    text: viewSettings.textColor ?? node.descriptionTextColor ??
      { r: 0.1, g: 0.1, b: 0.1, a: 1 },
    input: viewSettings.inputColor ?? node.descriptionInputBackgroundColor ??
      node.textPanelColor ?? { r: 1, g: 1, b: 1, a: 1 },
  };
}

export function attachImportedImages(node, images, type, slotIndex = 0) {
  delete node.primitiveShape;delete node.primitiveColor;
  if (type === "mock_flow_graph") {
    node.demoImage = images[0].image;
    return;
  }
  node.imageSlots ||= [];
  const oldCells =
    slotIndex < 0 && node.nodeSize
      ? node.imageSlots.map((_, i) => imageCellRect(node, i))
      : [];
  const first =
    slotIndex < 0
      ? -1
      : Math.max(0, Math.min(slotIndex, node.imageSlots.length - 1));
  for (const [index, uploaded] of images.entries()) {
    const slot = {
      slotName: uploaded.name,
      image: uploaded.image,
      rect: { x: 0, y: 0, width: uploaded.width, height: uploaded.height },
    };
    if (index === 0 && node.imageSlots[first])
      Object.assign(node.imageSlots[first], slot);
    else node.imageSlots.push(slot);
  }
  node.imageSlot = node.imageSlots[0];
  for (const label of node.labels || [])
    if (label.targetType === 0 && oldCells[label.targetIndex]) {
      const old = oldCells[label.targetIndex],
        next = imageCellRect(node, label.targetIndex);
      label.position = {
        x:
          next.x +
          ((label.position.x - old.x) * next.width) / Math.max(1, old.width),
        y:
          next.y +
          ((label.position.y - old.y) * next.height) / Math.max(1, old.height),
      };
    }
}

export function imageCellRect(node, index) {
  const width = node.nodeSize.x,
    height = node.nodeSize.y;
  if (node.isBackground) return { x: 0, y: 0, width, height };
  const count = Math.max(1, node.imageSlots.length);
  const textWidth = Math.min(
    node.textPanelWidth || 300,
    Math.max(0, width - 14 - 40),
  );
  const weights = node.imageSlots.map(slot => Math.max(.001, (slot.rect?.width || 1) / (slot.rect?.height || 1)));
  const total = weights.reduce((a,b)=>a+b,0) || 1;
  const available = Math.max(0, width - 14 - textWidth - 2 * (count - 1));
  return {
    x: 8 + textWidth + available * weights.slice(0,index).reduce((a,b)=>a+b,0) / total + index * 2,
    y: 31,
    width: available * (weights[index] || 1) / total,
    height: Math.max(0, height - 37),
  };
}
// Resize each axis independently; images retain their source aspect ratio.
export function resizeDesignFrame(node, requested, axis, ratios = [], original = node) {
  const before = structuredClone(original);
  const slots = before.imageSlots || [];
  node.nodeSize = {
    x:axis === 'height' ? before.nodeSize.x : Math.max(300,requested.x),
    y:axis === 'width' ? before.nodeSize.y : Math.max(200,requested.y),
  };
  const overhead = 14 + 2*Math.max(0,slots.length-1);
  const aspects = slots.map((slot,i) => ratios[i] || (slot.rect?.width || 1)/(slot.rect?.height || 1));
  const imageWidth = Math.max(0,node.nodeSize.y-37)*aspects.reduce((sum,aspect)=>sum+aspect,0);
  // Extra horizontal space belongs to the text, rather than empty image margins.
  const textWidth = slots.some(slot=>slot.image) && axis !== 'height'
    ? node.nodeSize.x-overhead-imageWidth
    : axis === 'height' ? before.textPanelWidth
    : before.textPanelWidth*node.nodeSize.x/Math.max(1,before.nodeSize.x);
  node.textPanelWidth = Math.max(80,Math.min(node.nodeSize.x-54,textWidth));
  node.imageSlots?.forEach((slot,i)=>{
    const aspect = ratios[i] || (slot.rect?.width || 1)/(slot.rect?.height || 1);
    slot.rect = {...slot.rect,width:aspect*(slot.rect?.height || 1)};
  });
  for (const [i,label] of (node.labels || []).entries()) {
    const oldLabel = before.labels[i], old = labelTargetRect(before,oldLabel), next = labelTargetRect(node,label);
    label.position = {x:next.x+(oldLabel.position.x-old.x)*next.width/Math.max(1,old.width),
      y:next.y+(oldLabel.position.y-old.y)*next.height/Math.max(1,old.height)};
  }
}
// Empty custom text preserves legacy numbered badges.
export function labelTargetRect(node, label) {
  if (label.targetType !== 1) return imageCellRect(node, label.targetIndex);
  const image = imageCellRect(node, 0);
  return {x: 6, y: image.y, width: Math.max(0, image.x - 8), height: image.height};
}
export const labelText = (label) => String(label.text || "").trim() || String(label.number);
export const labelWidth = (label, size) => label.text?.trim() ? Math.max(size, Math.min(180, (Array.from(labelText(label)).length * 0.65 + 0.8) * size)) : size;
