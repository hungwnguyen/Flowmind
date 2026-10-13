import { html } from "./dom-controls.mjs";
import { groupTypes, autoLayout, containerRoles, textRenderer, setTextRenderer } from "./ui-model.mjs";
import { assertLayersUnlocked } from "./ui-layer-actions.mjs";

export function componentPicker(s) {
  const popup = html("div", {
      class: "ui-component-picker",
      role: "dialog",
      "aria-label": "Add layout / effect",
      hidden: "",
    }),
    search = html("input", {
      type: "search",
      placeholder: "Search components…",
      "aria-label": "Search components",
    }),
    list = html("div", { role: "listbox", "aria-label": "Components" });
  popup.append(search, list);
  s.root.append(popup);
  let origin,
    ids = [];
  const close = () => {
    popup.hidden = true;
    origin = null;
  };
  const layers = () => s.doc.layers.filter((layer) => ids.includes(layer.id));
  const entries = () => [
    ...groupTypes
      .filter(([id]) => id !== "rect")
      .map(([id, label]) => ({
        id,
        label,
        enabled:
          id === "canvas" ||
          layers().every((layer) => containerRoles.includes(layer.role)),
        installed: layers().every((layer) =>
          id === "canvas"
            ? layer.canvasGroup === true || layer.groupType === "canvas"
            : layer.groupType === id,
        ),
        apply: () => {
          for (const layer of layers()) {
            if (id === "canvas") {
              layer.canvasGroup = true;
              continue;
            }
            if (layer.groupType === "canvas") layer.canvasGroup = true;
            layer.groupType = id;
            delete layer.layout;
            autoLayout(s.doc, layer.id, id);
          }
        },
      })),
    {
      id: "mask",
      label: "Clip children",
      enabled: layers().every((layer) => containerRoles.includes(layer.role)),
      installed: layers().every((layer) => layer.clip),
      apply: () => {
        for (const layer of layers()) layer.clip = true;
      },
    },
    {
      id: "button",
      label: "Button",
      enabled: layers().every((layer) =>
        ["image", "button"].includes(layer.role),
      ),
      installed: layers().every((layer) => layer.role === "button"),
      apply: () => s.setRoles(layers(), "button"),
    },
    {
      id: "vinagenText",
      label: "Styled Text",
      enabled: layers().every((layer) => layer.role === "text"),
      installed: layers().every((layer) => textRenderer(layer) === 'vinaGenText'),
      apply: () => {
        for (const layer of layers()) { setTextRenderer(layer, 'vinaGenText'); s.liveTextBindings?.delete(layer.id); }
      },
    },
  ];
  const render = () => {
    list.replaceChildren();
    const query = search.value.toLowerCase();
    for (const entry of entries().filter((entry) =>
      entry.label.toLowerCase().includes(query),
    )) {
      const button = html("button", {
        type: "button",
        role: "option",
        "aria-selected": entry.installed ? "true" : "false",
        disabled: !entry.enabled || entry.installed,
        title: entry.installed
          ? "Already added"
          : !entry.enabled
            ? "Select a compatible parent or layer to add this component."
            : "",
      });
      button.append(
        s.icon(["tmp", "vinagenText"].includes(entry.id) ? "text" : "frame"),
        html("span", {}, entry.label),
        html("small", {}, entry.installed ? "Added" : ""),
      );
      button.onclick = () => {
        if (origin?.document !== s.doc || origin?.path !== s.path) {
          close();
          return;
        }
        try {
          assertLayersUnlocked(s.doc, ids);
          s.edit(entry.apply);
        } catch (error) {
          s.message(error.message, true);
        }
        close();
        s.viewport.focus();
      };
      list.append(button);
    }
    if (!list.children.length)
      list.append(html("p", { class: "ui-hint" }, "No matching components."));
  };
  search.oninput = render;
  popup.onkeydown = (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      close();
      s.viewport.focus();
    } else if (
      ["ArrowUp", "ArrowDown", "Enter", "Home", "End"].includes(e.key)
    ) {
      e.preventDefault();
      const buttons = [...list.querySelectorAll("button:not(:disabled)")],
        index = buttons.indexOf(document.activeElement);
      if (e.key === "Enter") {
        (index < 0 ? buttons[0] : buttons[index])?.click();
        return;
      }
      buttons[
        e.key === "Home"
          ? 0
          : e.key === "End"
            ? buttons.length - 1
            : (index + (e.key === "ArrowDown" ? 1 : -1) + buttons.length) %
              buttons.length
      ]?.focus();
    }
  };
  document.addEventListener("pointerdown", (e) => {
    if (!popup.contains(e.target)) close();
  });
  const open = (anchor) => {
    if (s.busy || !s.selected.size) return;
    s.closeGroupMenu();
    ids = [...s.selected];
    origin = { document: s.doc, path: s.path };
    search.value = "";
    render();
    popup.hidden = false;
    const rect =
        anchor?.getBoundingClientRect?.() || s.right.getBoundingClientRect(),
      bounds = popup.getBoundingClientRect();
    popup.style.left =
      Math.max(6, Math.min(rect.left, innerWidth - bounds.width - 6)) + "px";
    popup.style.top =
      Math.max(6, Math.min(rect.bottom + 4, innerHeight - bounds.height - 6)) +
      "px";
    search.focus();
  };
  return { element: popup, open, close };
}
