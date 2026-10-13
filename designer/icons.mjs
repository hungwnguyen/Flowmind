// SVG paths shared with the Unity-hosted local browser editor.
// No icon fonts, network dependencies or raster approximations.
import { canvasToolIcons } from "./canvas-tools.mjs";
export const iconPaths = {
  ...canvasToolIcons,
  cursor: "M4 3l4 16 3-6 6-3L4 3zM11 13l5 6",
  hand: "M7 11V5a1.5 1.5 0 0 1 3 0v6V3a1.5 1.5 0 0 1 3 0v8V5a1.5 1.5 0 0 1 3 0v7V8a1.5 1.5 0 0 1 3 0v7c0 4-3 6-6 6h-1c-2 0-4-1-5-3l-3-5a1.5 1.5 0 0 1 2-2l3 3",
  frame: "M6 2v20M18 2v20M2 6h20M2 18h20",
  flow: "M5 3h6v6H5zM13 15h6v6h-6zM8 9v9h5",
  connect: "M4 6h6v6h10M16 8l4 4-4 4",
  layout: "M3 4h18v16H3zM3 10h18M10 10v10",
  fit: "M8 3H3v5M16 3h5v5M3 16v5h5M21 16v5h-5",
  plus: "M12 5v14M5 12h14",
  minus: "M5 12h14",
  undo: "M8 5L3 10l5 5M3 10h11a6 6 0 0 1 0 12",
  redo: "M16 5l5 5-5 5M21 10H10a6 6 0 0 0 0 12",
  grid: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z",
  folder: "M3 6h7l2 3h9v11H3zM3 6V4h6l2 2",
  search: "M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14M15 15l6 6",
  settings:
    "M10 2h4l.5 3 2 1.2 2.8-1 2 3.6-2.4 1.8v2.8l2.4 1.8-2 3.6-2.8-1-2 1.2-.5 3h-4l-.5-3-2-1.2-2.8 1-2-3.6 2.4-1.8v-2.8L2.7 8.8l2-3.6 2.8 1 2-1.2zM12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8",
  more: "M5 12h.01M12 12h.01M19 12h.01",
  sync: "M20 7v5h-5M4 17v-5h5M5 7a8 8 0 0 1 13-2l2 3M4 16l2 3a8 8 0 0 0 13-2",
  reload: "M20 4v6h-6M20 10a8 8 0 1 0-1 8",
  check: "M5 12l4 4L19 6",
  warning: "M12 3l10 18H2zM12 9v5M12 17h.01",
  locate:
    "M12 2v4M12 18v4M2 12h4M18 12h4M12 6a6 6 0 1 0 0 12 6 6 0 0 0 0-12M12 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4",
  external: "M14 3h7v7M21 3L10 14M10 4H4v16h16v-6",
  download: "M12 3v12M7 10l5 5 5-5M4 17v4h16v-4",
  upload: "M12 15V3M7 8l5-5 5 5M4 17v4h16v-4",
  save: "M4 3h13l4 4v14H3V3zM7 3v7h10V3M7 21v-7h10v7",
  sidebar: "M3 4h18v16H3zM9 4v16",
  properties: "M3 4h18v16H3zM15 4v16",
  chevron: "M6 9l6 6 6-6",
  close: "M6 6l12 12M18 6L6 18",
  help: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18M9 9a3 3 0 1 1 5 2c-2 1-2 2-2 3M12 17h.01",
  eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6",
  eyeOff: "M3 3l18 18M9 5c7-2 13 7 13 7l-3 4M5 7l-3 5s4 7 10 7l4-1",
  lock: "M6 10h12v11H6zM8 10V6a4 4 0 0 1 8 0v4",
  unlock: "M6 10h12v11H6zM8 10V6a4 4 0 0 1 8 0",
  circle: "M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16",
  rectangle: canvasToolIcons.rectangle,
  diamond: "M12 3l9 9-9 9-9-9z",
  note: "M4 3h16v13l-5 5H4zM15 21v-5h5M7 7h10M7 11h7",
  image: "M3 4h18v16H3zM3 17l6-7 5 5 3-3 4 5M16 7h.01",
  trash: "M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7",
  left: "M15 5l-7 7 7 7",
  right: "M9 5l7 7-7 7",
  tag: "M3 3h8l10 10-8 8L3 11zM7 7h.01",
  edit: "M4 16l12-12 4 4L8 20H4zM14 6l4 4",
};
iconPaths.demo = "M8 4l12 8-12 8z";
export function icon(name) {
  const ns = "http://www.w3.org/2000/svg",
    root = document.createElementNS(ns, "svg"),
    path = document.createElementNS(ns, "path");
  root.setAttribute("viewBox", "0 0 24 24");
  root.setAttribute("class", "ui-icon");
  root.setAttribute("aria-hidden", "true");
  root.setAttribute("focusable", "false");
  root.dataset.icon = name;
  path.setAttribute("d", iconPaths[name] || iconPaths.frame);
  root.append(path);
  return root;
}
