import { record } from "./idb.mjs";
export async function cacheKey(value) {
  const bytes =
    typeof value === "string" ? new TextEncoder().encode(value) : value;
  return [...new Uint8Array(await crypto.subtle.digest("SHA-256", bytes))]
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");
}
export async function fileCacheKey(file,onProgress=()=>{}) {
  const hashes = [];
  let last=0;
  for (let offset = 0; offset < file.size; offset += 4194304){
    hashes.push(
      await cacheKey(await file.slice(offset, offset + 4194304).arrayBuffer()),
    );
    const now=performance.now();if(now-last>100){last=now;onProgress({readBytes:Math.min(file.size,offset+4194304),sourceBytes:file.size});}
  }
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
