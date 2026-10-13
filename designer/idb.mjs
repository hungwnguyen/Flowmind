// Shared by the editor and its PSD workers. Handles and Blobs stay on this device.
let opened;
function database() {
  return (opened ??= new Promise((resolve, reject) => {
    const request = indexedDB.open("flowmind-web-designer", 1);
    request.onupgradeneeded = () => request.result.createObjectStore("records");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  }));
}
export async function record(key, value) {
  const db = await database(),
    write = arguments.length > 1;
  return new Promise((resolve, reject) => {
    const tx = db.transaction("records", write ? "readwrite" : "readonly"),
      store = tx.objectStore("records"),
      request = write ? store.put(value, key) : store.get(key);
    let result;
    request.onsuccess = () => (result = request.result);
    tx.oncomplete = () => resolve(write ? value : result);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () =>
      reject(tx.error || Error("Browser storage transaction aborted."));
  });
}
export async function records(prefix) {
  const db = await database();
  return new Promise((resolve, reject) => {
    // Restrict the query before cloning values. PSD paint caches can contain
    // hundreds of MB and must never be scanned while restoring workspace data.
    const tx = db.transaction("records"),
      store = tx.objectStore("records");
    const range = IDBKeyRange.bound(prefix, prefix + "\uffff");
    // Bulk reads also avoid a separate browser/DB round trip for every asset.
    const keys = store.getAllKeys(range),
      values = store.getAll(range);
    tx.oncomplete = () =>
      resolve(keys.result.map((key, i) => [key, values.result[i]]));
    tx.onerror = () => reject(tx.error);
    tx.onabort = () =>
      reject(tx.error || Error("Browser storage read aborted."));
  });
}
