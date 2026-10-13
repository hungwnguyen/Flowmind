import { html } from "./dom-controls.mjs";
import {
  containerRoles,
  groupLayers,
  roots,
  duplicate,
  layerHitStack,
  descendants,
} from "./ui-model.mjs";
import {
  assertLayersUnlocked,
  copyLayers,
  pasteLayers,
  ungroupLayers,
  reorderLayers,
  selectionBounds,
} from "./ui-layer-actions.mjs";

// UI-only controller. Document mutations stay in the Studio transaction/Undo boundary.
export function layerMenu(studio) {
  const s = studio,
    menu = html("div", {
      class: "ui-layer-context-menu",
      role: "menu",
      "aria-label": "Layer actions",
      hidden: "",
    });
  s.root.append(menu);
  let origin = null,
    position = { x: 0, y: 0 };
  const selected = () =>
    s.doc.layers.filter((layer) => s.selected.has(layer.id));
  const close = () => {
    menu.hidden = true;
    origin = null;
  };
  const focus = () => {
    const bounds = selectionBounds(s.doc, s.selected);
    if (!bounds) return;
    s.cancelGesture();
    const rect = s.viewport.getBoundingClientRect(),
      width = Math.max(1, rect.width - 80),
      height = Math.max(1, rect.height - 150);
    s.autoFit = false;
    s.zoom = Math.min(4, width / bounds.width, height / bounds.height);
    s.pan = {
      x: rect.width / 2 - (bounds.x + bounds.width / 2) * s.zoom,
      y: (rect.height - 48) / 2 - (bounds.y + bounds.height / 2) * s.zoom,
    };
    s.paint();
    s.viewport.focus();
  };
  const rename = (id) => {
    const layer = s.indexes().get(id);
    if (!layer || s.busy) return;
    close();
    s.setSidebar("Layers");
    s.search.value = "";
    s.select(id);
    s.paintLayers();
    s.focusLayerRow(id);
    const row = [...s.layerList.children].find(
        (item) => item.dataset.layerRowId === id,
      ),
      caption = row?.querySelector(".ui-layer-row-name");
    if (!caption) return;
    const document = s.doc,
      input = html("input", {
        class: "ui-layer-rename",
        value: layer.name,
        "aria-label": "Rename layer",
        maxlength: 256,
      });
    let finished = false;
    const finish = (commit) => {
      if (finished) return;
      finished = true;
      if (commit && s.doc === document && s.indexes().has(id)) {
        const name = input.value.trim();
        if (name && name !== layer.name)
          s.edit(() => (s.indexes().get(id).name = name));
      }
      if (input.isConnected) input.replaceWith(caption);
      row.draggable = !layer.locked;
      s.focusLayerRow(id, false);
    };
    row.draggable = false;
    caption.replaceWith(input);
    input.onclick = input.ondblclick = (e) => e.stopPropagation();
    input.onkeydown = (e) => {
      e.stopPropagation();
      if (e.key === "Enter" || e.key === "Escape") {
        e.preventDefault();
        finish(e.key === "Enter");
      }
    };
    input.onblur = () => finish(true);
    input.focus();
    input.select();
  };
  const copy = () => {
    s.clipboard = copyLayers(s.doc, s.selected);
  };
  const paste = async (replace) => {
    if (s.clipboard?.layers?.length) {
      if (!replace && s.selected.size > 1)
        throw Error("Select one parent layer before pasting.");
      const parentId = replace ? "" : [...s.selected][0] || "";
      s.edit(() => {
        s.selected = new Set(
          pasteLayers(s.doc, s.clipboard, {
            replaceIds: replace ? [...s.selected] : null,
            parentId,
          }),
        );
        if (s.collapsedLayers.delete(parentId)) s.persistLayerFolds();
      });
    } else if (!replace) {
      const document = s.doc,
        version = s.version;
      try {
        const text = await navigator.clipboard.readText();
        if (s.doc !== document || s.version !== version) return;
        if (text.trim().startsWith("Assets/"))
          await s.addAssetPath(text.trim());
      } catch (error) {
        s.message(error.message, true);
      }
    }
  };
  const toggle = (key) => {
    const layers = selected(),
      value =
        key === "visible"
          ? !layers.every((layer) => layer.visible !== false)
          : !layers.every((layer) => layer[key] === true);
    s.edit(() => {
      for (const layer of layers) layer[key] = value;
    });
  };
  const render = () => {
    const layers = selected(),
      has = layers.length > 0,
      single = layers.length === 1,
      top = roots(s.doc, s.selected);
    let unlocked = has;
    try {
      assertLayersUnlocked(s.doc, s.selected);
    } catch {
      unlocked = false;
    }
    menu.replaceChildren();
    const action = (
      label,
      fn,
      {
        shortcut = "",
        disabled = false,
        check = null,
        hint = "",
        keep = false,
      } = {},
    ) => {
      const button = html("button", {
        type: "button",
        role: check === null ? "menuitem" : "menuitemcheckbox",
        "aria-label": label,
        disabled,
        title: hint,
      });
      if (check !== null) {
        button.setAttribute("aria-checked", check);
        button.append(
          html("input", {
            type: "checkbox",
            tabindex: -1,
            "aria-hidden": "true",
            checked: check === "true",
          }),
        );
        button.firstElementChild.indeterminate = check === "mixed";
      } else button.append(html("span", { class: "ui-context-check" }));
      button.append(html("span", {}, label), html("kbd", {}, shortcut));
      button.onclick = async () => {
        if (origin?.document !== s.doc || origin?.path !== s.path) {
          close();
          return;
        }
        try {
          if (!keep) close();
          await fn();
          if (keep && !menu.hidden) {
            render();
            [...menu.querySelectorAll("button")]
              .find((item) => item.getAttribute("aria-label") === label)
              ?.focus();
          }
        } catch (error) {
          s.message(error.message, true);
        }
      };
      menu.append(button);
      return button;
    };
    const separator = () => menu.append(html("div", { role: "separator" }));
    action("Copy", copy, { shortcut: "Ctrl+C", disabled: !has });
    action(
      "Cut",
      () => {
        copy();
        s.remove();
      },
      { shortcut: "Ctrl+X", disabled: !unlocked },
    );
    action("Paste", () => paste(false), { shortcut: "Ctrl+V" });
    action("Paste to replace", () => paste(true), {
      shortcut: "Ctrl+Shift+R",
      disabled:
        !unlocked ||
        top.length !== 1 ||
        !s.clipboard?.layers?.length ||
        roots(
          { layers: s.clipboard.layers },
          s.clipboard.layers.map((layer) => layer.id),
        ).length !== 1,
    });
    action(
      "Duplicate",
      () => s.edit(() => (s.selected = new Set(duplicate(s.doc, s.selected)))),
      { shortcut: "Ctrl+D", disabled: !unlocked },
    );
    separator();
    action(
      "Bring to front",
      () => s.edit(() => reorderLayers(s.doc, s.selected, true)),
      { shortcut: "]", disabled: !unlocked },
    );
    action(
      "Send to back",
      () => s.edit(() => reorderLayers(s.doc, s.selected, false)),
      { shortcut: "[", disabled: !unlocked },
    );
    if (top.length >= 3) {
      action("Distribute horizontal", () => s.distribute("x"), {
        disabled: !unlocked,
      });
      action("Distribute vertical", () => s.distribute("y"), {
        disabled: !unlocked,
      });
    }
    separator();
    action("Group selection", () => s.groupSelection(), {
      shortcut: "Ctrl+G",
      disabled: !unlocked,
    });
    action(
      "Frame selection",
      () =>
        s.edit(() => {
          const ids = groupLayers(s.doc, s.selected);
          s.doc.layers.find((layer) => layer.id === ids[0]).role = "empty";
          s.selected = new Set(ids);
        }),
      { shortcut: "Ctrl+Alt+G", disabled: !unlocked },
    );
    action(
      "Ungroup",
      () =>
        s.edit(() => (s.selected = new Set(ungroupLayers(s.doc, s.selected)))),
      {
        shortcut: "Ctrl+Shift+G",
        disabled:
          !unlocked ||
          !top.some((layer) => ["group", "empty"].includes(layer.role)) ||
          top.some((layer) => layer.canvasRoot),
      },
    );
    action("Rename", () => rename(layers[0].id), {
      shortcut: "Ctrl+R / F2",
      disabled: !single,
    });
    action("Focus selection", focus, { shortcut: "Shift+2", disabled: !has });
    action("Add Component…", () => s.components.open(), {
      disabled: !unlocked,
    });
    separator();
    const checkbox = (label, key, options = {}) => {
      const checked = layers.filter((layer) =>
        key === "visible" ? layer.visible !== false : layer[key] === true,
      ).length;
      return action(label, () => toggle(key), {
        check:
          checked === layers.length && has
            ? "true"
            : checked
              ? "mixed"
              : "false",
        disabled: !has,
        keep: true,
        ...options,
      });
    };
    checkbox("Visible", "visible", { shortcut: "Ctrl+Shift+H" });
    checkbox("Locked", "locked", { shortcut: "Ctrl+Shift+L" });
    const marked = layers.every((layer) => layer.canvasRoot === true),
      included = descendants(
        s.doc,
        top.map((layer) => layer.id),
      ),
      byId = s.indexes();
    const nested =
      layers.some((layer) => {
        for (
          let parent = byId.get(layer.parentId);
          parent;
          parent = byId.get(parent.parentId)
        )
          if (parent.canvasRoot || s.selected.has(parent.id)) return true;
        return false;
      }) ||
      s.doc.layers.some(
        (layer) =>
          included.has(layer.id) &&
          !s.selected.has(layer.id) &&
          layer.canvasRoot,
      );
    checkbox("Independent screen root", "canvasRoot", {
      disabled:
        !has ||
        !layers.every((layer) => containerRoles.includes(layer.role)) ||
        (!marked && nested),
      hint: marked
        ? "Treats this parent and its children as an independent design screen."
        : nested
          ? "Popup parents cannot be nested. Uncheck the existing popup first."
          : "Treats this parent and its children as an independent design screen.",
    });
    checkbox("Clip children", "clip", {
      disabled:
        !unlocked ||
        !layers.every((layer) => containerRoles.includes(layer.role)),
    });
    if (layers.every((layer) => layer.shape) && has) {
      separator();
      checkbox("Flip horizontal", "shapeFlipX", {
        shortcut: "Shift+H",
        disabled: !unlocked,
      });
      checkbox("Flip vertical", "shapeFlipY", {
        shortcut: "Shift+V",
        disabled: !unlocked,
      });
    }
    separator();
    action("Delete", () => s.remove(), {
      shortcut: "Delete",
      disabled: !unlocked,
    });
  };
  const open = (e, id) => {
    if (e.target.closest("input,textarea,select,.ui-toolbar,.ui-viewbar"))
      return;
    e.preventDefault();
    if (s.busy) return;
    s.closeToolMenu();
    s.cancelGesture();
    if (!id && s.viewport.contains(e.target))
      id = layerHitStack(s.doc, s.point(e.clientX, e.clientY), (layer, point) =>
        s.imageHitTest(layer, point),
      )[0]?.id;
    if (id && !s.selected.has(id)) s.select(id);
    origin = { document: s.doc, path: s.path };
    position = { x: e.clientX, y: e.clientY };
    render();
    menu.hidden = false;
    const rect = menu.getBoundingClientRect();
    Object.assign(menu.style, {
      left:
        Math.max(6, Math.min(position.x, innerWidth - rect.width - 6)) + "px",
      top:
        Math.max(6, Math.min(position.y, innerHeight - rect.height - 6)) + "px",
    });
    menu.querySelector("button:not(:disabled)")?.focus();
  };
  const key = (e) => {
    if (menu.contains(e.target) && ["Enter", " "].includes(e.key)) {
      e.preventDefault();
      e.stopImmediatePropagation();
      e.target.closest("button:not(:disabled)")?.click();
      return true;
    }
    if (
      menu.contains(e.target) &&
      ["ArrowUp", "ArrowDown", "Home", "End", "Tab", "Escape"].includes(e.key)
    ) {
      e.preventDefault();
      if (e.key === "Escape" || e.key === "Tab") {
        close();
        s.viewport.focus();
        return true;
      }
      const items = [...menu.querySelectorAll("button:not(:disabled)")],
        index = items.indexOf(document.activeElement);
      items[
        e.key === "Home"
          ? 0
          : e.key === "End"
            ? items.length - 1
            : (index + (e.key === "ArrowDown" ? 1 : -1) + items.length) %
              items.length
      ]?.focus();
      return true;
    }
    if (
      e.target.closest("input,textarea,select,[contenteditable]") ||
      s.dialog.open ||
      s.busy
    )
      return false;
    const mod = e.ctrlKey || e.metaKey,
      key = e.key.toLowerCase();
    let fn;
    if (mod && !e.altKey) {
      if (key === "c") fn = copy;
      else if (key === "v") fn = () => paste(false);
      else if (key === "x")
        fn = () => {
          assertLayersUnlocked(s.doc, s.selected);
          copy();
          s.remove();
        };
      else if (key === "r")
        fn = e.shiftKey
          ? () => paste(true)
          : () => {
              if (s.selected.size === 1) rename([...s.selected][0]);
            };
      else if (e.shiftKey && key === "h") fn = () => toggle("visible");
      else if (e.shiftKey && key === "l") fn = () => toggle("locked");
      else if (e.shiftKey && key === "g")
        fn = () =>
          s.edit(
            () => (s.selected = new Set(ungroupLayers(s.doc, s.selected))),
          );
    } else if (mod && e.altKey && key === "g")
      fn = () =>
        s.edit(() => {
          const ids = groupLayers(s.doc, s.selected);
          if (ids.length) {
            s.doc.layers.find((layer) => layer.id === ids[0]).role = "empty";
            s.selected = new Set(ids);
          }
        });
    else if (!mod && !e.altKey) {
      if (e.key === "F2")
        fn = () => {
          if (s.selected.size === 1) rename([...s.selected][0]);
        };
      else if (e.shiftKey && (e.key === "2" || e.code === "Digit2")) fn = focus;
      else if (key === "[" || key === "]")
        fn = () => s.edit(() => reorderLayers(s.doc, s.selected, key === "]"));
      else if (
        e.shiftKey &&
        ["h", "v"].includes(key) &&
        selected().every((layer) => layer.shape)
      )
        fn = () => toggle(key === "h" ? "shapeFlipX" : "shapeFlipY");
    }
    if (!fn) return false;
    e.preventDefault();
    e.stopImmediatePropagation();
    close();
    Promise.resolve()
      .then(fn)
      .catch((error) => s.message(error.message, true));
    return true;
  };
  return { element: menu, open, close, key, rename, focus, copy, paste };
}
