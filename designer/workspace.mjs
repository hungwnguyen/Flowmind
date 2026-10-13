import { record, records } from "./idb.mjs";
import { cacheKey, blobBase64, cachedBlob } from "./ui-project-cache.mjs";
import { safePath, writeZip, readZip, jsonEntry, MAX_PACKAGE } from "./zip.mjs";
import { validateDocument, copy } from "./ui-model.mjs";
import { resolvedTextStyle, textPaintSignature } from "./ui-styled-text.mjs";
import { renderText } from "./web-text.mjs";
import { detectSliceBorders } from "./ui-slice.mjs";
import { pickImageFiles } from "./image-picker.mjs";
const resources = new Map();
export function resourceURL(guid) {
  return resources.get(guid)?.url || "";
}
export function download(blob, name) {
  const url = URL.createObjectURL(blob),
    a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}
function cleanName(value) {
  return (
    String(value || "Untitled")
      .replace(/[^\p{L}\p{N}_ -]/gu, "_")
      .slice(0, 100) || "Untitled"
  );
}
async function dimensions(blob) {
  const image = await createImageBitmap(blob);
  const result = { width: image.width, height: image.height };
  image.close();
  if (
    result.width > 8192 ||
    result.height > 8192 ||
    result.width * result.height > 16777216
  )
    throw Error("Images must be at most 8192 px per side and 16 megapixels.");
  return result;
}
async function imageContentKey(blob) {
  const bitmap = await createImageBitmap(blob);
  try {
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    const context = canvas.getContext("2d", { willReadFrequently: true });
    context.drawImage(bitmap, 0, 0);
    const pixels = context.getImageData(0, 0, bitmap.width, bitmap.height).data;
    return `${bitmap.width}x${bitmap.height}:${await cacheKey(pixels)}`;
  } finally {
    bitmap.close();
  }
}
function mime(name) {
  return /\.jpe?g$/i.test(name)
    ? "image/jpeg"
    : /\.png$/i.test(name)
      ? "image/png"
      : /\.woff2$/i.test(name)
        ? "font/woff2"
        : /\.woff$/i.test(name)
          ? "font/woff"
          : /\.otf$/i.test(name)
            ? "font/otf"
            : "font/ttf";
}
const shortcuts = [
  ["save", "mod+s"],
  ["undo", "mod+z"],
  ["redo", "mod+shift+z"],
  ["duplicate", "mod+d"],
  ["select", "v"],
  ["pan", "h"],
  ["text", "t"],
  ["image", "i"],
  ["button", "b"],
  ["rectangle", "r"],
  ["ellipse", "o"],
  ["fit", "shift+1"],
  ["group", "mod+g"],
].map(([action, keys]) => ({ action, keys }));
class Workspace {
  id = "browser";
  name = "Browser workspace";
  handle = null;
  mode = "browser";
  documents = new Map();
  styles = [];
  async init() {
    try {
      const saved = await record("last-workspace");
      if (saved?.id) {
        this.id = saved.id;
        this.name = saved.name || saved.handle?.name || "Browser workspace";
      }
      if (saved?.handle) {
        this.handle = saved.handle;
        this.mode =
          (await this.handle.queryPermission({ mode: "readwrite" })) ===
          "granted"
            ? "folder"
            : "reconnect";
      }
      await this.restore();
      if (this.mode === "folder") await this.scan();
    } catch (error) {
      this.storageError = error;
      this.mode = "browser";
      this.handle = null;
      this.id = "browser";
      await this.restore();
    }
    return this;
  }
  async restore() {
    for (const resource of resources.values())
      URL.revokeObjectURL(resource.url);
    resources.clear();
    this.documents = new Map(
      (await records("doc:" + this.id + ":")).map(([key, value]) => [
        key.slice(("doc:" + this.id + ":").length),
        value,
      ]),
    );
    this.styles = (await record("styles:" + this.id)) || [];
    for (const [, resource] of await records("resource:" + this.id + ":"))
      this.install(resource);
    for (const [guid, name, file] of [
      ["f10a11", "Inter", "Inter.ttf"],
      ["f10a12", "Montserrat Black", "Montserrat-Black.ttf"],
    ]) {
      const font = await fetch(new URL("./fonts/" + file, import.meta.url));
      if (!font.ok) throw Error("Bundled font could not load: " + name);
      this.install({guid, name, path: "Fonts/" + file, type: "font", blob: await font.blob(), builtIn: true});
    }
  }
  install(resource) {
    const previous = resources.get(resource.guid);
    if (previous?.url) URL.revokeObjectURL(previous.url);
    resource = { ...resource, url: URL.createObjectURL(resource.blob) };
    resources.set(resource.guid, resource);
    return resource;
  }
  async add(resource) {
    await record("resource:" + this.id + ":" + resource.guid, resource);
    return this.install(resource);
  }
  async matchingImage(contentKey) {
    for (const resource of resources.values()) {
      if (resource.type !== "image") continue;
      resource.contentKey ||= await imageContentKey(resource.blob);
      if (resource.contentKey === contentKey) return resource;
    }
  }
  async linkImageComponents(doc) {
    const byContent = new Map();
    for (const layer of doc.layers || []) {
      if (layer.role === "text" || !layer.image) continue;
      const resource = resources.get(layer.image.guid);
      if (!resource || resource.type !== "image") continue;
      resource.contentKey ||= await imageContentKey(resource.blob);
      const shared = byContent.get(resource.contentKey);
      if (shared)
        layer.image = {
          ...layer.image,
          guid: shared.guid,
          localId: "",
          name: shared.name,
          path: shared.path,
        };
      else byContent.set(resource.contentKey, resource);
    }
    return doc;
  }
  async choose() {
    if (!window.showDirectoryPicker)
      throw Error(
        "Direct folder saving requires a supported Chromium browser on HTTPS or localhost. Use Import folder or download files instead.",
      );
    const handle = await window.showDirectoryPicker({
      mode: "readwrite",
      id: "flowmind-designer",
    });
    let id = crypto.randomUUID();
    for (const saved of (await record("workspace-handles")) || []) {
      if (await handle.isSameEntry(saved.handle)) {
        id = saved.id;
        break;
      }
    }
    return { handle, id };
  }
  async connect(selection) {
    const previous = {
      handle: this.handle,
      id: this.id,
      name: this.name,
      mode: this.mode,
    };
    try {
      this.handle = selection.handle;
      this.id = selection.id;
      this.name = this.handle.name;
      this.mode = "folder";
      await this.restore();
      await this.scan();
      const saved = { handle: this.handle, id: this.id, name: this.name },
        known = (await record("workspace-handles")) || [];
      await record("workspace-handles", [
        ...known.filter((item) => item.id !== this.id),
        saved,
      ]);
      await record("last-workspace", saved);
    } catch (error) {
      Object.assign(this, previous);
      await this.restore();
      throw error;
    }
  }
  async reconnect() {
    if (
      !this.handle ||
      (await this.handle.requestPermission({ mode: "readwrite" })) !== "granted"
    )
      throw Error("Folder access was not granted. The draft is retained.");
    this.mode = "folder";
    await this.scan();
  }
  async scan() {
    const docs = new Map();
    let count = 0;
    const walk = async (dir, prefix = "", depth = 0) => {
      if (depth > 8) return;
      for await (const [name, entry] of dir.entries()) {
        if (++count > 4000)
          throw Error(
            "Workspace has too many files. Choose a smaller folder (up to 4000 files).",
          );
        if (
          name.startsWith(".") ||
          ["node_modules", "Library", "Temp"].includes(name)
        )
          continue;
        const path = prefix + name;
        if (entry.kind === "directory")
          await walk(entry, path + "/", depth + 1);
        else if (/\.svgpro$/i.test(name)) {
          const existing = this.documents.get(path);
          docs.set(path, {
            ...existing,
            path,
            name: name.replace(/\.svgpro$/i, ""),
            disk: true,
          });
        } else if (/\.(png|jpe?g|ttf|otf|woff2?)$/i.test(name)) {
          const file = await entry.getFile();
          if (file.size > 16 * 1024 * 1024) continue;
          const guid = await cacheKey(
            this.id + ":" + path + ":" + file.lastModified + ":" + file.size,
          );
          if (!resources.has(guid)) {
            const type = /\.(png|jpe?g)$/i.test(name) ? "image" : "font";
            await this.add({
              guid,
              name: name.replace(/\.[^.]+$/, ""),
              path,
              type,
              blob: file,
              ...(type === "image" ? await dimensions(file) : {}),
            });
          }
        }
      }
    };
    await walk(this.handle);
    for (const [path, value] of this.documents)
      if (!value.disk) docs.set(path, value);
    this.documents = docs;
  }
  async file(path, create = false) {
    safePath(path);
    if (this.mode !== "folder")
      throw Error("Reconnect the selected folder before saving.");
    const parts = path.split("/"),
      name = parts.pop();
    let directory = this.handle;
    for (const part of parts)
      directory = await directory.getDirectoryHandle(part, { create });
    return directory.getFileHandle(name, { create });
  }
  config() {
    const fonts = [...resources.values()]
      .filter((r) => r.type === "font")
      .map((r) => ({
        guid: r.guid,
        key: r.guid,
        name: r.name,
        displayName: r.name,
        sourceFontGuid: r.guid,
        standalone: true,
        isDefault: r.guid === "f10a11",
      }));
    return {
      width: 1920,
      height: 1080,
      documentFolder: "Documents",
      imageFolder: "Images",
      documents: [...this.documents.values()].map(({ path, name }) => ({
        path,
        name,
      })),
      fonts,
      vinaGenFonts: fonts,
      tmpFonts: [],
      textStyles: this.styles,
      shortcuts,
      autoAdjustAnchors: false,
      commentDisplayName:
        localStorage.getItem("web-designer-author") || "Designer",
    };
  }
  normalize(input) {
    const doc = copy(input);
    for (const layer of doc.layers || []) {
      const keepPaint =
        layer.sourceTextPaint?.signature === textPaintSignature(layer);
      if (layer.groupType === "canvas") layer.groupType = "rect";
      for (const key of [
        "canvasGroup",
        "interactable",
        "blocksRaycasts",
        "ignoreParentGroups",
        "tmpMaterial",
      ])
        delete layer[key];
      if (layer.role === "text" && (layer.textMeshPro || layer.textStyle)) {
        layer.textRenderer = "vinaGenText";
        layer.textMeshPro = true;
        layer.standaloneText = true;
        layer.textStyle = resolvedTextStyle(layer, this.styles);
        delete layer.textStyle.preset;
        delete layer.textStyle.scale;
      }
      if (keepPaint)
        layer.sourceTextPaint.signature = textPaintSignature(layer);
    }
    return validateDocument(doc);
  }
  async package(document) {
    const doc = this.normalize(document),
      json = JSON.stringify(doc);
    if (new TextEncoder().encode(json).length > 8 * 1024 * 1024)
      throw Error(
        "Document JSON exceeds 8 MB. Split the design into smaller documents.",
      );
    const entries = [["document.json", json]],
      assets = [],
      guids = new Set();
    for (const layer of doc.layers) {
      if (layer.image?.guid) guids.add(layer.image.guid);
      if (layer.fontGuid) guids.add(layer.fontGuid);
      if (layer.tmpFont) guids.add(layer.tmpFont);
    }
    for (const guid of guids) {
      const resource = resources.get(guid);
      if (!resource) {
        if (doc.layers.some((l) => l.image?.guid === guid))
          throw Error(
            "Missing image " + guid + ". Reimport its source before saving.",
          );
        continue;
      }
      const entry =
        "assets/" +
        guid +
        "/" +
        cleanName(resource.name) +
        (resource.type === "font"
          ? "." + (resource.path.split(".").pop() || "ttf")
          : resource.blob.type === "image/jpeg"
            ? ".jpg"
            : ".png");
      entries.push([entry, await resource.blob.arrayBuffer()]);
      assets.push({
        guid,
        path: resource.path,
        type: resource.type,
        entry,
        bytes: resource.blob.size,
      });
    }
    entries.unshift([
      "manifest.json",
      JSON.stringify({ format: "vinagen-svgpro", version: 2, assets }),
    ]);
    return writeZip(entries);
  }
  async unpack(blob) {
    if (blob.size > MAX_PACKAGE) throw Error("Package exceeds 96 MB.");
    const bytes = await blob.arrayBuffer();
    if (new Uint8Array(bytes)[0] !== 80) {
      if (blob.size > 8 * 1024 * 1024) throw Error("JSON exceeds 8 MB.");
      return this.linkImageComponents(
        this.normalize(JSON.parse(new TextDecoder().decode(bytes))),
      );
    }
    const entries = await readZip(bytes),
      manifest = jsonEntry(entries, "manifest.json");
    if (
      manifest.format !== "vinagen-svgpro" ||
      manifest.version !== 2 ||
      !Array.isArray(manifest.assets) ||
      manifest.assets.length > 2048
    )
      throw Error("Expected SVGPRO version 2.");
    let doc = jsonEntry(entries, "document.json");
    const staged = [],
      remapped = new Map(),
      seen = new Set();
    for (const asset of manifest.assets) {
      if (
        !/^[a-zA-Z0-9_-]{1,100}$/.test(asset.guid || "") ||
        seen.has(asset.guid)
      )
        throw Error("Invalid or duplicate resource ID.");
      seen.add(asset.guid);
      const entry = entries.get(asset.entry);
      if (!entry) throw Error("Missing packaged resource " + asset.entry);
      const path = String(asset.path || asset.entry);
      if (!/\.(png|jpe?g|ttf|otf|woff2?)$/i.test(path)) continue;
      let guid = asset.guid;
      const existing = resources.get(guid);
      // A package must not replace an image/font still used by another draft.
      if (
        existing &&
        (await cacheKey(await existing.blob.arrayBuffer())) !==
          (await cacheKey(entry))
      ) {
        const digest = await cacheKey(entry);
        guid = await cacheKey("import:" + asset.guid + ":" + digest);
        for (
          let salt = 1;
          resources.has(guid) &&
          (await cacheKey(await resources.get(guid).blob.arrayBuffer())) !==
            digest;
          salt++
        )
          guid = await cacheKey(
            "import:" + asset.guid + ":" + digest + ":" + salt,
          );
        remapped.set(asset.guid, guid);
      }
      const type = /\.(png|jpe?g)$/i.test(path) ? "image" : "font";
      const resource = {
        guid,
        path: "Imported/" + cleanName(path.split("/").pop()),
        name: path
          .split("/")
          .pop()
          .replace(/\.[^.]+$/, ""),
        type,
        blob: new Blob([entry], { type: mime(path) }),
      };
      if (type === "image")
        Object.assign(resource, await dimensions(resource.blob));
      if (!existing || guid !== asset.guid) staged.push(resource);
    }
    for (const layer of doc.layers || []) {
      const keepPaint =
        layer.sourceTextPaint?.signature === textPaintSignature(layer);
      if (remapped.has(layer.image?.guid))
        layer.image.guid = remapped.get(layer.image.guid);
      for (const key of ["fontGuid", "tmpFont"])
        if (remapped.has(layer[key])) layer[key] = remapped.get(layer[key]);
      if (keepPaint)
        layer.sourceTextPaint.signature = textPaintSignature(layer);
    }
    doc = this.normalize(doc);
    for (const resource of staged) await this.add(resource);
    return this.linkImageComponents(doc);
  }
  async read(path) {
    const entry = this.documents.get(path);
    if (!entry) {
      const error = Error("UI document was deleted.");
      error.status = 404;
      throw error;
    }
    if (entry.disk) {
      const file = await (await this.file(path)).getFile(),
        document = await this.unpack(file),
        revision = await cacheKey(await file.arrayBuffer());
      return { path, document, revision };
    }
    return {
      path,
      document: await this.linkImageComponents(copy(entry.document)),
      revision: entry.revision,
    };
  }
  async save({ path, document, revision = "" }) {
    safePath(path);
    if (!/\.svgpro$/i.test(path))
      throw Error("Save documents with the .svgpro extension.");
    const doc = this.normalize(document),
      blob = await this.package(doc),
      next = await cacheKey(await blob.arrayBuffer());
    if (this.mode === "reconnect")
      throw Error(
        "Reconnect the workspace folder before saving, or download a copy from Export.",
      );
    if (this.mode === "folder") {
      let existing;
      try {
        existing = await (await this.file(path)).getFile();
      } catch (error) {
        if (error.name !== "NotFoundError") throw error;
      }
      if (existing) {
        const current = await cacheKey(await existing.arrayBuffer());
        if (current !== revision)
          throw Error(
            "This file changed outside the editor. Reload it or save under a new filename; your draft is retained.",
          );
      } else if (revision && this.documents.get(path)?.disk)
        throw Error("UI document was deleted.");
      const target = await this.file(path, true),
        writer = await target.createWritable();
      try {
        await writer.write(blob);
        await writer.close();
      } catch (error) {
        await writer.abort().catch(() => {});
        throw error;
      }
    } else {
      const existing = await record("doc:" + this.id + ":" + path);
      if (existing && existing.revision !== revision)
        throw Error(
          "This browser document changed. Reload or save with another filename.",
        );
      download(blob, path.split("/").pop());
    }
    const entry = {
      path,
      name: doc.name,
      document: doc,
      revision: next,
      disk: this.mode === "folder",
    };
    let packageWarning =
      this.mode === "browser"
        ? "Downloaded SVGPRO and saved browser recovery. Move the download into your chosen folder if needed."
        : "";
    try {
      await record("doc:" + this.id + ":" + path, entry);
    } catch {
      packageWarning =
        "The file was saved or downloaded, but browser recovery storage is unavailable. Keep the exported file.";
    }
    this.documents.set(path, entry);
    return { ...entry, packageWarning };
  }
  async importFont(file) {
    if (file.size > 16 * 1024 * 1024) throw Error("Font exceeds 16 MB.");
    const guid = await cacheKey(await file.arrayBuffer()),
      font = new FontFace("ui-" + guid, await file.arrayBuffer());
    await font.load();
    document.fonts.add(font);
    return this.add({
      guid,
      name: file.name.replace(/\.[^.]+$/, ""),
      path:
        "Fonts/" +
        cleanName(file.name.replace(/\.[^.]+$/, "")) +
        "." +
        file.name.split(".").pop(),
      type: "font",
      blob: file,
    });
  }
  async importFolder(files) {
    const selection = [...files],
      previous = {
        id: this.id,
        name: this.name,
        handle: this.handle,
        mode: this.mode,
      };
    try {
      if (selection.length > 4000)
        throw Error("Choose a folder with at most 4000 files.");
      this.id = "import-" + crypto.randomUUID();
      this.name =
        selection[0]?.webkitRelativePath.split("/")[0] || "Imported folder";
      this.handle = null;
      this.mode = "browser";
      await this.restore();
      for (const file of selection) {
        const path = safePath(
          file.webkitRelativePath.split("/").slice(1).join("/"),
        );
        if (/\.svgpro$/i.test(path)) {
          const document = await this.unpack(file),
            revision = await cacheKey(await file.arrayBuffer()),
            entry = {
              path,
              name: document.name,
              document,
              revision,
              disk: false,
            };
          this.documents.set(path, entry);
          await record("doc:" + this.id + ":" + path, entry);
        } else if (/\.(png|jpe?g)$/i.test(path)) {
          if (file.size > 16 * 1024 * 1024) throw Error("Image exceeds 16 MB.");
          const guid = await cacheKey(await file.arrayBuffer());
          await this.add({
            guid,
            name: file.name,
            path,
            type: "image",
            blob: file,
            ...(await dimensions(file)),
          });
        } else if (/\.(ttf|otf|woff2?)$/i.test(path))
          await this.importFont(file);
      }
      await record("last-workspace", { id: this.id, name: this.name });
    } catch (error) {
      Object.assign(this, previous);
      await this.restore();
      throw error;
    }
  }
  async api(action, p = {}) {
    switch (action) {
      case "ui-session":
        return { token: "local" };
      case "ui-config":
        return this.config();
      case "ui-read":
        return this.read(p.path);
      case "ui-save":
        return this.save(p);
      case "ui-svgpro-export": {
        const saved = await this.read(p.path);
        if (saved.revision !== p.revision)
          throw Error("Saved file changed. Reload before exporting.");
        return {
          dataBase64: await blobBase64(await this.package(saved.document)),
          fileName: p.path.split("/").pop(),
          mimeType: "application/vnd.vinagen.svgpro",
        };
      }
      case "ui-svgpro-import": {
        const document = await this.unpack(cachedBlob(p.dataBase64)),
          path =
            "Documents/" +
            cleanName(p.fileName.replace(/\.(svgpro|json)$/i, "")) +
            "-" +
            Date.now() +
            ".svgpro",
          entry = {
            path,
            name: document.name,
            document,
            revision: "",
            disk: false,
          };
        await record("doc:" + this.id + ":" + path, entry);
        this.documents.set(path, entry);
        return { path };
      }
      case "ui-image": {
        const blob = new Blob([cachedBlob(p.dataBase64)], {
            type: mime(p.fileName || "image.png"),
          }),
          size = await dimensions(blob),
          contentKey = await imageContentKey(blob),
          match = await this.matchingImage(contentKey),
          baseGuid = await cacheKey("image:" + contentKey),
          guid =
            match?.guid ||
            (resources.has(baseGuid)
              ? await cacheKey(baseGuid + ":" + crypto.randomUUID())
              : baseGuid),
          path =
            (p.psdImportFolder || "Images") +
            "/" +
            cleanName(p.fileName?.replace(/\.[^.]+$/, "")) +
            (blob.type === "image/jpeg" ? ".jpg" : ".png"),
          resource =
            match ||
            (await this.add({
              guid,
              contentKey,
              name: p.fileName || "Image",
              path,
              type: "image",
              blob,
              ...size,
              bounds: p.fusionBounds,
            }));
        return {
          image: {
            guid,
            localId: "",
            name: resource.name,
            path: resource.path,
          },
          ...size,
        };
      }
      case "ui-image-resize": {
        const old = resources.get(p.image.guid);
        if (!old) throw Error("Image source missing.");
        const blob = cachedBlob(p.dataBase64),
          size = await dimensions(blob),
          revision = await cacheKey(await blob.arrayBuffer());
        await this.add({
          ...old,
          blob,
          ...size,
          revision,
          contentKey: await imageContentKey(blob),
          slice: null,
        });
        for (const [key] of await records("fusion:" + this.id + ":"))
          await record(key, null);
        return {
          image: { guid: old.guid, name: old.name, path: old.path, revision },
          revision,
          ...size,
        };
      }
      case "ui-slice-info": {
        const r = resources.get(p.image?.guid || p.guid);
        if (!r) throw Error("Image missing.");
        if (!r.slice) {
          const bitmap = await createImageBitmap(r.blob),
            canvas = document.createElement("canvas");
          canvas.width = r.width;
          canvas.height = r.height;
          const context = canvas.getContext("2d");
          context.drawImage(bitmap, 0, 0);
          r.slice = detectSliceBorders(
            context.getImageData(0, 0, r.width, r.height),
          );
          bitmap.close();
        }
        return { width: r.width, height: r.height, ...r.slice };
      }
      case "ui-assets":
        return {
          images: [...resources.values()]
            .filter(
              (r) =>
                r.type === "image" &&
                (!p.search ||
                  r.name.toLowerCase().includes(p.search.toLowerCase())),
            )
            .map((r) => ({
              image: { guid: r.guid, name: r.name, path: r.path },
              width: r.width,
              height: r.height,
            })),
          limit: 4000,
        };
      case "ui-choose-assets-folder": // Older standalone adapters.
      case "ui-choose-images": {
        const files = await pickImageFiles();
        if (!files.length) return { cancelled: true };
        const workspaceID = this.id;
        for (const file of files) {
          const dataBase64 = await blobBase64(file);
          if (this.id !== workspaceID)
            throw Error("Workspace changed. Add the images again.");
          await this.api("ui-image", { fileName: file.name, dataBase64 });
        }
        return { cancelled: false, folder: "", imported: files.length };
      }
      case "ui-resolve-image": {
        const r = [...resources.values()].find((r) => r.path === p.path);
        if (!r) throw Error("Image missing.");
        return {
          image: { guid: r.guid, name: r.name, path: r.path },
          width: r.width,
          height: r.height,
        };
      }
      case "ui-psd-begin":
        return {
          psdImportFolder: "Imports/" + cleanName(p.psdName) + "-" + Date.now(),
        };
      case "ui-psd-fonts":
        return this.config();
      case "ui-psd-complete":
        return {
          document: await this.linkImageComponents(this.normalize(p.document)),
          config: this.config(),
        };
      case "ui-styled-text-preview":
        return renderText(p.layer, this.config(), resourceURL);
      case "ui-text-style-save": {
        const preset = {
          key: crypto.randomUUID(),
          name: p.name,
          displayName: p.name,
          path: "Browser styles / " + p.name,
          values: copy(p.style),
        };
        this.styles.push(preset);
        await record("styles:" + this.id, this.styles);
        return preset;
      }
      case "ui-fusion-cache": {
        const key = "fusion:" + this.id + ":" + p.fusionKey;
        if (p.imageGuid) {
          const r = resources.get(p.imageGuid);
          await record(key, {
            image: { guid: r.guid, name: r.name, path: r.path },
            width: r.width,
            height: r.height,
            bounds: r.bounds,
            resultSignature: p.resultSignature,
            signature: p.fusionSignature,
          });
          return { hit: true };
        }
        const value = await record(key);
        return value &&
          resources.has(value.image.guid) &&
          [value.signature, value.resultSignature].includes(p.fusionSignature)
          ? { ...value, hit: true }
          : { hit: false };
      }
      default:
        throw Error("Unsupported browser operation: " + action);
    }
  }
}
export const workspace = new Workspace();
