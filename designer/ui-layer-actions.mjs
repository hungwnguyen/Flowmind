import {
  copy,
  uid,
  roots,
  descendants,
  layerIndex,
  worldPose,
  rotatePoint,
  moveLayers,
  canvasBounds,
  validateDocument,
} from "./ui-model.mjs";

export function assertLayersUnlocked(doc, ids) {
  const byId = layerIndex(doc);
  for (const layer of roots(doc, ids))
    for (let item = layer; item; item = byId.get(item.parentId))
      if (item.locked)
        throw Error("Unlock the selected layers and their parents first.");
}

// Text and hidden artwork remain editable. Retain their ancestor containers so
// nested coordinates, clipping, opacity, visibility and text styles stay intact.
export function imageFusionPlan(doc, id, {allowSingle=false}={}) {
  validateDocument(doc);
  const byId=layerIndex(doc),root=byId.get(id),included=descendants(doc,[id]);
  if(!root||root.role==='text')throw Error('Fusion images requires an Image, Button or group. Text cannot be fused.');
  for(const layer of doc.layers)if(included.has(layer.id)){
    if(layer.locked)throw Error('Unlock the object and its children before Fusion images.');
  }
  assertLayersUnlocked(doc,[id]);
  const images=new Set();
  for(const layer of doc.layers){
    if(!included.has(layer.id)||!['image','button'].includes(layer.role))continue;
    let hidden=false;for(let item=layer;item&&item.id!==id;item=byId.get(item.parentId))if(item.visible===false){hidden=true;break;}
    if(!hidden)images.add(layer.id);
  }
  if(!allowSingle&&![...images].some(imageId=>imageId!==id))throw Error('Add visible child images before Fusion images.');
  const retained=new Set([id]);
  const keep=id=>{for(let item=byId.get(id);item&&included.has(item.id);item=byId.get(item.parentId))retained.add(item.id);};
  for(const layer of doc.layers)if(included.has(layer.id)&&(layer.role==='text'||layer.visible===false)){
    for(const childId of descendants(doc,[layer.id]))keep(childId);keep(layer.id);
  }
  for(const thread of doc.comments||[])if(included.has(thread.layerId))keep(thread.layerId);
  return {root,included,images,retained};
}

export function applyImageFusion(doc,id,asset,bounds,{allowSingle=false}={}){
  const {root,included,images,retained}=imageFusionPlan(doc,id,{allowSingle});
  const offset=rotatePoint({x:bounds.x+bounds.width/2-root.width/2,y:bounds.y+bounds.height/2-root.height/2},root.rotation||0);
  root.x+=root.width/2+offset.x-bounds.width/2;root.y+=root.height/2+offset.y-bounds.height/2;
  root.width=bounds.width;root.height=bounds.height;
  for(const layer of doc.layers)if(included.has(layer.id)){
    if(layer.parentId===id){layer.x-=bounds.x;layer.y-=bounds.y;}
    if(!retained.has(layer.id)||layer.role==='text')continue;
    // Freeze auto layout before removing siblings, preserving authored text poses.
    if(['horizontal','vertical','grid'].includes(layer.groupType)){layer.groupType='rect';delete layer.layout;}
    if(images.has(layer.id)||layer.id===id){
      for(const key of ['image','shape','fillGradient','stroke','strokeWidth','shapeSides','starInnerRadius','shapeFlipX','shapeFlipY','imageFit','sliced'])delete layer[key];
      layer.role=layer.id===id?(layer.role==='button'?'button':'image'):'empty';layer.fill='#ffffff00';
    }
  }
  root.image=copy(asset.image);root.imageMode='none';root.fill='#ffffffff';
  for(const thread of doc.comments||[])if(thread.layerId===id){thread.x-=bounds.x;thread.y-=bounds.y;}
  doc.layers=doc.layers.filter(layer=>!included.has(layer.id)||retained.has(layer.id));
  validateDocument(doc);
}

const stableFusionValue=value=>Array.isArray(value)?value.map(stableFusionValue):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(key=>[key,stableFusionValue(value[key])])):value;
export async function fusionHash(value){return [...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(stableFusionValue(value)))))].map(byte=>byte.toString(16).padStart(2,'0')).join('');}
// Only paint and its ancestor geometry affect Fusion. Text content, names,
// comments, hidden branches and the root's unbaked pose/opacity do not.
export async function imageFusionState(doc,id){
  const plan=imageFusionPlan(doc,id,{allowSingle:true}),byId=layerIndex(doc),used=new Set([id]),sources=new Set();
  for(const imageId of plan.images)for(let layer=byId.get(imageId);layer&&plan.included.has(layer.id);layer=byId.get(layer.parentId))used.add(layer.id);
  const layers=doc.layers.filter(layer=>used.has(layer.id)).map(layer=>{
    const root=layer.id===id,paint=plan.images.has(layer.id),value={id:layer.id,parentId:root?'':layer.parentId,width:layer.width,height:layer.height,clip:!!layer.clip};
    if(!root)Object.assign(value,{x:layer.x,y:layer.y,rotation:layer.rotation||0,opacity:layer.opacity??1,blendMode:layer.blendMode||'normal'});
    if(paint){
      for(const key of ['fill','fillGradient','imageMode','imageFit','sliced','shape','stroke','strokeWidth','shapeSides','starInnerRadius','shapeFlipX','shapeFlipY'])if(layer[key]!==undefined)value[key]=layer[key];
      if(layer.image){value.image={guid:layer.image.guid,localId:layer.image.localId||'',...(layer.imageMode==='nine_slice'?{slice:layer.image.slice}: {})};sources.add(layer.image.guid);}
    }
    return value;
  });
  return {signature:await fusionHash({version:1,layers}),sources:[...sources].sort(),hasChildren:[...plan.images].some(imageId=>imageId!==id),root:plan.root};
}

// Clipboard roots use world geometry, so pasting into another document retains their appearance.
export function copyLayers(doc, ids) {
  const top = roots(doc, ids),
    included = descendants(
      doc,
      top.map((layer) => layer.id),
    ),
    byId = layerIndex(doc),
    poses = new Map();
  const layers = copy(doc.layers.filter((layer) => included.has(layer.id))),
    parents = {};
  for (const source of top) {
    const layer = layers.find((item) => item.id === source.id),
      pose = worldPose(doc, source, byId, poses);
    parents[layer.id] = source.parentId || "";
    layer.parentId = "";
    layer.x = pose.x - layer.width / 2;
    layer.y = pose.y - layer.height / 2;
    layer.rotation = pose.rotation;
  }
  return { layers, parents };
}

export function pasteLayers(
  doc,
  clipboard,
  { replaceIds = null, parentId = "", offset = 24 } = {},
) {
  if (!clipboard?.layers?.length) return [];
  const draft = copy(doc),
    source = copy(clipboard.layers),
    sourceRoots = copy(
      roots(
        { layers: source },
        source.map((layer) => layer.id),
      ),
    );
  const targets = replaceIds ? roots(draft, replaceIds) : [],
    removed = replaceIds
      ? descendants(
          draft,
          targets.map((layer) => layer.id),
        )
      : new Set();
  if (replaceIds) {
    assertLayersUnlocked(draft, replaceIds);
    if (sourceRoots.length !== 1 || targets.length !== 1)
      throw Error(
        "Paste to replace requires one copied object and one selected object.",
      );
  }
  if (draft.layers.length - removed.size + source.length > 1000)
    throw Error("UI documents support up to 1000 layers.");
  const targetPose = targets.length ? worldPose(draft, targets[0]) : null,
    insertion = targets.length
      ? draft.layers
          .slice(0, draft.layers.indexOf(targets[0]))
          .filter((layer) => !removed.has(layer.id)).length
      : 0,
    map = new Map(source.map((layer) => [layer.id, uid()]));
  draft.layers = draft.layers.filter((layer) => !removed.has(layer.id));
  for (const layer of source) {
    const original = layer.id;
    layer.id = map.get(original);
    layer.parentId = map.get(layer.parentId) || "";
    if (!layer.parentId) {
      layer.x += offset;
      layer.y += offset;
    }
    draft.layers.push(layer);
  }
  const ids = sourceRoots.map((layer) => map.get(layer.id));
  for (const id of ids) {
    const layer = source.find((item) => item.id === id),
      destinationId = targets.length
        ? targets[0].parentId || ""
        : parentId;
    if (targetPose) {
      layer.x = targetPose.x - layer.width / 2;
      layer.y = targetPose.y - layer.height / 2;
      layer.rotation = targetPose.rotation;
    }
    if (destinationId) {
      const locked = layer.locked;
      layer.locked = false;
      moveLayers(draft, [layer.id], destinationId);
      layer.locked = locked;
    }
  }
  if (targets.length) {
    const replacement = new Set(source.map((layer) => layer.id)),
      rest = draft.layers.filter((layer) => !replacement.has(layer.id));
    rest.splice(
      insertion,
      0,
      ...draft.layers.filter((layer) => replacement.has(layer.id)),
    );
    draft.layers = rest;
  }
  validateDocument(draft);
  doc.layers = draft.layers;
  return ids;
}

// Keep PSD-local geometry intact and place its entire footprint beyond every
// existing layer, including hidden layers, rotated objects and child overflow.
export function insertPSDDocument(doc, source, gap = 48) {
  const draft = copy(doc), imported = copy(validateDocument(copy(source)));
  const bounds = value => canvasBounds({...value, layers:value.layers.map(layer=>({...layer, visible:true}))});
  const occupied = bounds(draft), incoming = bounds(imported);
  const ids = pasteLayers(draft, {layers:imported.layers}, {offset:0});
  const dx = draft.layers.length === imported.layers.length ? 0 : occupied.x + occupied.width + gap - incoming.x;
  const dy = draft.layers.length === imported.layers.length ? 0 : occupied.y - incoming.y;
  for (const layer of draft.layers) if (ids.includes(layer.id)) { layer.x += dx; layer.y += dy; }
  draft.psdImportFolder ??= imported.psdImportFolder;
  draft.importNotes = [...new Set([...(draft.importNotes||[]), ...(imported.importNotes||[])])];
  validateDocument(draft);
  Object.assign(doc, draft);
  return ids;
}

export function ungroupLayers(doc, ids) {
  const draft = copy(doc),
    groups = roots(draft, ids).filter((layer) =>
      ["group", "empty"].includes(layer.role),
    ),
    selected = [];
  assertLayersUnlocked(
    draft,
    groups.map((layer) => layer.id),
  );
  for (const group of groups) {
    if (group.canvasRoot)
      throw Error("Uncheck Import as popup before ungrouping this parent.");
    const children = draft.layers.filter(
      (layer) => layer.parentId === group.id,
    );
    if (children.length)
      selected.push(
        ...moveLayers(
          draft,
          children.map((layer) => layer.id),
          group.id,
          "before",
        ),
      );
    draft.layers = draft.layers.filter((layer) => layer.id !== group.id);
  }
  validateDocument(draft);
  doc.layers = draft.layers;
  return selected;
}

export function reorderLayers(doc, ids, front) {
  assertLayersUnlocked(doc, ids);
  const included = descendants(
    doc,
    roots(doc, ids).map((layer) => layer.id),
  );
  const moving = doc.layers.filter((layer) => included.has(layer.id)),
    remaining = doc.layers.filter((layer) => !included.has(layer.id));
  doc.layers = front ? [...remaining, ...moving] : [...moving, ...remaining];
}

export function selectionBounds(doc, ids) {
  const byId = layerIndex(doc),
    poses = new Map(),
    rects = roots(doc, ids).map((layer) => {
      const pose = worldPose(doc, layer, byId, poses),
        angle = (pose.rotation * Math.PI) / 180,
        width =
          Math.abs(layer.width * Math.cos(angle)) +
          Math.abs(layer.height * Math.sin(angle)),
        height =
          Math.abs(layer.width * Math.sin(angle)) +
          Math.abs(layer.height * Math.cos(angle));
      return { x: pose.x - width / 2, y: pose.y - height / 2, width, height };
    });
  if (!rects.length) return null;
  const x = Math.min(...rects.map((rect) => rect.x)),
    y = Math.min(...rects.map((rect) => rect.y));
  return {
    x,
    y,
    width: Math.max(...rects.map((rect) => rect.x + rect.width)) - x,
    height: Math.max(...rects.map((rect) => rect.y + rect.height)) - y,
  };
}
