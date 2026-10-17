import { record } from "./idb.mjs";
export const PSD_PAINT_BYTES = 128 * 1024 * 1024;
export async function cacheKey(value) {
  const bytes =
    typeof value === "string" ? new TextEncoder().encode(value) : value;
  return [...new Uint8Array(await crypto.subtle.digest("SHA-256", bytes))]
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");
}
export async function fileCacheKey(file,onProgress=()=>{}) {
  const size=4194304,hashes=new Array(Math.ceil(file.size/size));
  let next=0,readBytes=0,last=0,failed=false;
  await Promise.all(Array.from({length:Math.min(4,hashes.length)},async()=>{
    try{while(!failed&&next<hashes.length){
      const index=next++,offset=index*size,end=Math.min(file.size,offset+size);
      hashes[index]=await cacheKey(await file.slice(offset,end).arrayBuffer());
      readBytes+=end-offset;
      const now=performance.now();if(now-last>100){last=now;onProgress({readBytes,sourceBytes:file.size});}
    }}catch(error){failed=true;throw error;}
  }));
  onProgress({readBytes:file.size,sourceBytes:file.size});
  return cacheKey(file.size + ":" + hashes.join(":"));
}
export async function projectCache(
  kind,
  key,
  value,
  { required = false } = {},
) {
  try {
    return value === undefined
      ? await record("cache:" + kind + ":" + key)
      : !!(await record("cache:" + kind + ":" + key, value));
  } catch (error) {
    if (required) throw error;
    return value === undefined ? undefined : false;
  }
}
export async function blobBase64(blob) {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let binary = "";
  for (let i = 0; i < bytes.length; i += 32768)
    binary += String.fromCharCode(...bytes.subarray(i, i + 32768));
  return btoa(binary);
}
export function cachedBlob(base64) {
  return new Blob([Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))], {
    type: "image/png",
  });
}
export function restoreProjectDraft(key) {
  return projectCache("ui-draft", key);
}
