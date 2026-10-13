import {resourceURL} from './workspace.mjs';
// Shared folder picker, search and thumbnails. Inactive panels never request images.
export const validAssetFolder = (folder) =>
  typeof folder === "string" &&
  (!folder.startsWith("/") && !folder.includes(":")) &&
  !folder.split("/").some((part) => !part || part === ".." || part === ".") &&
  !/[:\\\0]/.test(folder);
import { html as node } from "./dom-controls.mjs";
const source = image => resourceURL(image.guid);
export function projectAssets({
  projectKey,
  api,
  icon,
  button,
  attach,
  onError,
}) {
  const storageKey = () => `vinagen-ui-assets-folder:${projectKey()}`,
    browsers = new Set(),
    cache = new Map();
  let folder = "",
    search = "",
    picking = false,
    restoredKey = "";
  const restore = () => {
    const key = storageKey();
    if (key === restoredKey) return;
    restoredKey = key;
    folder = "";
    search = "";
    cache.clear();
    try {
      const saved = localStorage.getItem(key);
      if (validAssetFolder(saved)) folder = saved;
    } catch {}
  };
  const refresh = () => {
    restore();
    for (const browser of browsers) {
      browser.sync();
      browser.load();
    }
  };
  const setFolder = (value) => {
    if (!validAssetFolder(value))
      throw Error("Choose a folder inside your workspace.");
    folder = value;
    try {
      localStorage.setItem(storageKey(), value);
    } catch {}
    refresh();
    document.dispatchEvent(
      new CustomEvent("vinagen-project-assets-changed", {
        detail: { key: storageKey(), folder },
      }),
    );
  };
  const read = async () => {
    const key = JSON.stringify([folder, search]),
      entry = cache.get(key);
    if (entry && entry.expires > Date.now()) return entry.promise;
    const promise = api("ui-assets", { folder, search })
      .then((result) => {
        if (cache.get(key)?.promise === promise)
          cache.get(key).expires = Date.now() + 2000;
        return result;
      })
      .catch((error) => {
        if (cache.get(key)?.promise === promise) cache.delete(key);
        throw error;
      });
    // Keep an in-flight read shared even when Unity takes longer than the cache TTL.
    cache.set(key, { promise, expires: Infinity });
    if (cache.size > 32) cache.delete(cache.keys().next().value);
    return promise;
  };
  const choose = async () => {
    if (picking) return null;
    picking = true;
    for (const browser of browsers) browser.sync();
    try {
      const result = await api("ui-choose-assets-folder", { folder });
      if (!result.cancelled) setFolder(result.folder);
      return result.cancelled ? null : result.folder;
    } finally {
      picking = false;
      for (const browser of browsers) browser.sync();
    }
  };
  document.addEventListener("vinagen-project-assets-changed", (event) => {
    if (
      event.detail?.key === storageKey() &&
      event.detail.folder !== folder &&
      validAssetFolder(event.detail.folder)
    ) {
      folder = event.detail.folder;
      cache.clear();
      refresh();
    }
  });
  const create = ({
    active,
    targetId,
    sidebar = false,
    ids = {},
    tileClass = "",
    onAttach,
    onDrag,
  } = {}) => {
    restore();
    const root = node("div", { class: "ui-asset-browser" }),
      controls = node("div", { class: "ui-asset-controls" }),
      input = node("input", {
        type: "search",
        "aria-label": "Search project images",
        placeholder: "Search assets…",
      }),
      field = node("label", { class: "search-field" });
    field.append(icon("search"), input);
    const folderName = node("span"),
      folderButton = button("", () => choose().catch(onError));
    folderButton.className = "ui-asset-folder";
    folderButton.setAttribute("aria-label", "Choose assets folder");
    folderButton.append(icon("folder"), folderName, icon("chevron"));
    controls.append(field, folderButton);
    const status = node("p", {
        class: "ui-hint ui-asset-status",
        role: "status",
      }),
      grid = node("div", {
        class: "ui-asset-grid" + (sidebar ? " ui-sidebar-assets" : ""),
      });
    root.append(controls, status, grid);
    for (const [key, id] of Object.entries(ids))
      ({ search: input, folder: folderButton, status, grid })[key].id = id;
    let sequence = 0,
      timer,
      signature = "";
    const invalidate = () => {
      ++sequence;
      clearTimeout(timer);
      grid.removeAttribute("aria-busy");
    };
    const browser = {
      root,
      sync: () => {
        input.value = search;
        input.disabled = !folder;
        folderButton.disabled = picking;
        folderName.textContent = picking
          ? "Choosing folder…"
          : folder || "Choose folder…";
        folderButton.title = folder || "Choose a project folder";
      },
      invalidate,
      load: async () => {
        restore();
        browser.sync();
        invalidate();
        if (!active()) return;
        if (!folder) {
          status.textContent = "Choose a folder to load its images.";
          signature = "";
          grid.replaceChildren();
          return;
        }
        const current = sequence,
          project = storageKey(),
          query = search;
        status.textContent = "Loading images…";
        grid.setAttribute("aria-busy", "true");
        try {
          const result = await read();
          if (current !== sequence || !active() || project !== storageKey())
            return;
          const next = JSON.stringify(result.images);
          if (signature !== next) {
            signature = next;
            grid.replaceChildren();
            for (const asset of result.images) {
              const tile = button("", () => {
                if (active()) (onAttach || attach)(asset, targetId);
              });
              if (tileClass) tile.className = tileClass;
              tile.append(
                node("img", {
                  src: source(asset.image),
                  alt: "",
                  loading: "lazy",
                }),
                node("span", {}, asset.image.name),
              );
              tile.title = asset.image.path || asset.image.name;
              tile.draggable = true;
              tile.ondragstart = (event) => {
                event.dataTransfer.setData(
                  "application/x-vinagen-image",
                  JSON.stringify(asset),
                );
                onDrag?.();
              };
              grid.append(tile);
            }
          }
          status.textContent = result.images.length
            ? `${result.images.length} images${result.images.length >= result.limit ? " · Narrow your search to see more." : ""}`
            : query
              ? "No images match your search."
              : "No images in this folder.";
        } catch (error) {
          if (current === sequence && active())
            status.textContent = error.message;
        } finally {
          if (current === sequence) grid.removeAttribute("aria-busy");
        }
      },
      schedule: () => {
        invalidate();
        if (active()) {
          status.textContent = "Searching…";
          timer = setTimeout(() => browser.load(), 250);
        }
      },
      dispose: () => {
        invalidate();
        browsers.delete(browser);
      },
    };
    input.oninput = () => {
      search = input.value;
      for (const browser of browsers) {
        browser.sync();
        browser.schedule();
      }
    };
    browsers.add(browser);
    browser.sync();
    return browser;
  };
  return {
    create,
    refresh,
    choose,
    invalidate: () => {
      cache.clear();
      refresh();
    },
  };
}
