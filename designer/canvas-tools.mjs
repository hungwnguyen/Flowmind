import { shapeTools, shapePoints, arrowHead } from "./ui-shapes.mjs";
export { shapeTools };
export const canvasToolIcons = {
  rectangle: "M4 4h16v16H4z",
  line: "M4 20L20 4",
  arrow: "M4 20L20 4M10 4h10v10",
  ellipse: "M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18",
  polygon: "M12 3L22 21H2z",
  star: "M12 2l3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z",
  scale: "M3 14v7h7M21 10V3h-7M3 21l7-7M21 3l-7 7",
  text: "M4 5h16M12 5v15M8 20h8",
  'text-path': 'M4 4h16M12 4v12M8 16h8M3 22q9-8 18 0',
  comment: 'M5 3h14a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H9l-6 3V6a3 3 0 0 1 2-3z',
};
export function toolGroup({ label, items, mode, icon, choose, extra }) {
  const group = document.createElement("div");
  group.className = "ui-tool-group";
  const primary = document.createElement("button");
  primary.type = "button";
  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "ui-tool-chevron";
  toggle.setAttribute("aria-label", label);
  toggle.setAttribute("aria-haspopup", "menu");
  toggle.setAttribute("aria-expanded", "false");
  toggle.append(icon("chevron"));
  const menu = document.createElement("div");
  menu.className = "ui-tool-menu";
  menu.hidden = true;
  menu.setAttribute("role", "menu");
  menu.setAttribute("aria-label", label);
  const close = () => {
    menu.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
  };
  let current = mode;
  const paint = (next, active) => {
    current = next;
    const item = items.find(([id]) => id === next) || items[0];
    primary.dataset.tool = item[0];
    primary.replaceChildren(icon(item[1]));
    primary.title = item[2] + (item[3] ? " · " + item[3] : "");
    primary.setAttribute("aria-label", item[2]);
    primary.setAttribute("aria-pressed", String(active));
    primary.classList.toggle("active", active);
    for (const button of menu.querySelectorAll("[data-tool-choice]"))
      button.setAttribute(
        "aria-checked",
        String(button.dataset.toolChoice === next),
      );
  };
  for (const [id, glyph, text, key] of items) {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.toolChoice = id;
    button.setAttribute("role", "menuitemradio");
    const check = document.createElement("span");
    check.className = "ui-tool-check";
    check.textContent = "✓";
    const caption = document.createElement("span");
    caption.textContent = text;
    const shortcut = document.createElement("kbd");
    shortcut.textContent = key || "";
    button.append(check, icon(glyph), caption, shortcut);
    button.onclick = () => {
      close();
      choose(id);
    };
    menu.append(button);
  }
  if (extra) {
    const button = document.createElement("button");
    button.type = "button";
    button.setAttribute("role", "menuitem");
    const check = document.createElement("span");
    check.className = "ui-tool-check";
    const caption = document.createElement("span");
    caption.textContent = extra.label;
    const shortcut = document.createElement("kbd");
    shortcut.textContent = extra.shortcut || "";
    button.append(check, icon("image"), caption, shortcut);
    button.onclick = () => {
      close();
      extra.action();
    };
    menu.append(button);
  }
  primary.onclick = () => {
    close();
    choose(current);
  };
  toggle.onclick = () => {
    const open = menu.hidden;
    document.dispatchEvent(new CustomEvent("vinagen-close-tool-menus"));
    menu.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
    if (open) menu.querySelector("[aria-checked=true]")?.focus();
  };
  menu.addEventListener("keydown", (event) => {
    if (
      event.defaultPrevented ||
      !["ArrowUp", "ArrowDown", "Home", "End", "Escape"].includes(event.key)
    )
      return;
    event.preventDefault();
    event.stopPropagation();
    if (event.key === "Escape") {
      close();
      toggle.focus();
      return;
    }
    const buttons = [...menu.querySelectorAll("button")],
      index = buttons.indexOf(document.activeElement);
    buttons[
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? buttons.length - 1
          : (index + (event.key === "ArrowDown" ? 1 : -1) + buttons.length) %
            buttons.length
    ]?.focus();
  });
  document.addEventListener("vinagen-close-tool-menus", close);
  document.addEventListener("pointerdown", (event) => {
    if (!group.contains(event.target)) close();
  });
  group.append(primary, toggle, menu);
  paint(mode, false);
  return { group, primary, menu, paint, close };
}
export function drawnPrimitive(shape, start, end, constrain = false) {
  let dx = end.x - start.x,
    dy = end.y - start.y;
  if (constrain) {
    const side = Math.max(Math.abs(dx), Math.abs(dy));
    dx = Math.sign(dx || 1) * side;
    dy = Math.sign(dy || 1) * side;
  }
  const width = Math.max(1, Math.min(4096, Math.abs(dx))),
    height = Math.max(1, Math.min(4096, Math.abs(dy)));
  return {
    shape,
    x: dx < 0 ? start.x - width : start.x,
    y: dy < 0 ? start.y - height : start.y,
    width,
    height,
    fill: "#d9d9d9",
    stroke: "#202020",
    strokeWidth: ["line", "arrow"].includes(shape) ? 3 : 0,
    shapeSides: shape === "star" ? 5 : 3,
    starInnerRadius: 0.45,
    shapeFlipX: dx < 0,
    shapeFlipY: dy < 0,
  };
}
export function primitiveFile(layer) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(layer.width));
  canvas.height = Math.max(1, Math.round(layer.height));
  const source = { ...layer, width: canvas.width, height: canvas.height },
    ctx = canvas.getContext("2d"),
    points = shapePoints(source),
    open = ["line", "arrow"].includes(layer.shape);
  const path = (polygon) => {
    ctx.beginPath();
    polygon.forEach(([x, y], index) =>
      index ? ctx.lineTo(x, y) : ctx.moveTo(x, y),
    );
  };
  path(points);
  ctx.lineJoin = "round";
  ctx.strokeStyle = layer.stroke;
  ctx.lineWidth = layer.strokeWidth;
  if (!open) {
    ctx.closePath();
    ctx.fillStyle = layer.fill;
    ctx.fill();
  }
  if (layer.strokeWidth) ctx.stroke();
  if (layer.shape === "arrow") {
    path(arrowHead(points, layer.strokeWidth));
    ctx.closePath();
    ctx.fillStyle = layer.stroke;
    ctx.fill();
  }
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) =>
        blob
          ? resolve(
              new File([blob], layer.shape + ".png", { type: "image/png" }),
            )
          : reject(Error("Could not render the shape.")),
      "image/png",
    ),
  );
}
export function scaleGraphSelection(originals, origin, requested, type) {
  let min = 0.01,
    max = 100;
  for (const node of originals) {
    if (type === "mock_flow_graph") {
      min = Math.max(min, 0.4 / (node.nodeScale || 1));
      max = Math.min(max, 2.5 / (node.nodeScale || 1));
    } else {
      min = Math.max(min, 300 / node.nodeSize.x, 200 / node.nodeSize.y);
      max = Math.min(max, 8192 / node.nodeSize.x, 8192 / node.nodeSize.y);
    }
  }
  const factor = Math.max(min, Math.min(max, requested));
  return originals.map((original) => {
    const node = JSON.parse(JSON.stringify(original));
    node.editorPosition = {
      x: origin.x + (original.editorPosition.x - origin.x) * factor,
      y: origin.y + (original.editorPosition.y - origin.y) * factor,
    };
    if (type === "mock_flow_graph")
      node.nodeScale = (original.nodeScale || 1) * factor;
    else {
      node.nodeSize = {
        x: original.nodeSize.x * factor,
        y: original.nodeSize.y * factor,
      };
      node.textPanelWidth = (original.textPanelWidth || 0) * factor;
      for (const slot of node.imageSlots || [])
        if (slot.rect)
          for (const key of ["x", "y", "width", "height"])
            slot.rect[key] *= factor;
      if (node.imageSlot?.rect)
        for (const key of ["x", "y", "width", "height"])
          node.imageSlot.rect[key] *= factor;
      for (const label of node.labels || [])
        for (const key of ["x", "y"]) label.position[key] *= factor;
    }
    return node;
  });
}
