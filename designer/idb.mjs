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
    const request = db
        .transaction("records")
        .objectStore("records")
        .openCursor(),
      rows = [];
    request.onsuccess = () => {
      const cursor = request.result;
      if (!cursor) return resolve(rows);
      if (String(cursor.key).startsWith(prefix))
        rows.push([cursor.key, cursor.value]);
      cursor.continue();
    };
    request.onerror = () => reject(request.error);
  });
}
