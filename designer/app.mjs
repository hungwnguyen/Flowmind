import { workspace } from "./workspace.mjs";
import { openUIStudio, getUIStudio } from "./ui-studio.mjs";
import { newDocument } from "./ui-model.mjs";
import { demoDocument } from "./demo.mjs";
import { icon } from "./icons.mjs";
import { showDesignerSettings } from "./settings.mjs";
// Ctrl+wheel and trackpad pinch belong to the canvas. Capture the gesture before
// toolbar buttons, inspector fields or popovers can let it reach browser zoom.
window.addEventListener("wheel", (event) => {
  if (!event.ctrlKey && !event.metaKey) return;
  event.preventDefault();
  const studio = getUIStudio();
  if (studio?.ready && studio.viewport.contains(event.target)) {
    studio.changeZoom(studio.zoom * Math.exp(-event.deltaY * .0015), event.clientX, event.clientY);
    event.stopPropagation();
  }
}, {capture: true, passive: false});
for (const button of document.querySelectorAll(".topbar [data-icon]")) {
  button.prepend(icon(button.dataset.icon));
}
const startupControls = ["demo", "import-folder", "reconnect"].map((id) =>
  document.getElementById(id),
);
for (const button of startupControls) button.disabled = true;
const shell = {
  icon,
  project: workspace.name,
  projectId: workspace.id,
  chooseWorkspace: choose,
  onClose: () => openUIStudio(shell),
};
function state() {
  shell.project = workspace.name;
  shell.projectId = workspace.id;
  document.getElementById("workspace-state").textContent =
    workspace.name +
    " · " +
    (workspace.mode === "folder"
      ? "Folder save"
      : workspace.mode === "reconnect"
        ? "Access needed"
        : "Download save");
  document.getElementById("reconnect").hidden = workspace.mode !== "reconnect";
  document.getElementById("workspace-state").title =
    workspace.name +
    " · " +
    (workspace.mode === "folder"
      ? "Save directly to the selected folder"
      : workspace.mode === "reconnect"
        ? "Reconnect to allow saving"
        : "Save downloads a portable document");
  document.getElementById("workspace-state").dataset.mode = workspace.mode;
  document.getElementById("workspace").disabled =
    !window.showDirectoryPicker || !getUIStudio()?.ready;
  document
    .querySelector(".project-heading strong")
    ?.replaceChildren(workspace.name);
}
async function reset() {
  const studio = getUIStudio();
  state();
  studio.shell = shell;
  studio.doc = newDocument();
  studio.path = "";
  studio.revision = "";
  studio.guid = "";
  studio.selected.clear();
  studio.undo = [];
  studio.redo = [];
  studio.dirty = false;
  studio.version++;
  studio.ready = false;
  studio.preview = null;
  history.replaceState(null, "", location.pathname);
  await studio.start();
  studio.refreshFiles();
  state();
}
async function choose() {
  const studio = getUIStudio();
  if (!studio?.ready || studio.busy) return;
  try {
    const selection = await workspace.choose();
    studio.busy = true;
    await studio.persist();
    await workspace.connect(selection);
    await reset();
  } catch (error) {
    if (error.name !== "AbortError") {
      studio.message(error, true);
      state();
      studio.paintAll();
    }
  } finally {
    studio.busy = false;
    studio.paintShell();
  }
}
document.getElementById("reconnect").onclick = async () => {
  if (!getUIStudio()?.ready) return;
  try {
    await workspace.reconnect();
    state();
    await getUIStudio().refreshConfig();
    getUIStudio().message("Workspace folder reconnected.");
  } catch (error) {
    getUIStudio().message(error, true);
  }
};
document.getElementById("import-folder").onclick = () =>
  document.getElementById("folder-input").click();
document.getElementById("demo").onclick = async () => {
  const s = getUIStudio();
  if (!s?.ready || s.busy) return;
  const previous = s.doc;
  await s.newScreen();
  if (s.doc === previous) return;
  s.doc = demoDocument();
  s.version++;
  s.dirty = true;
  s.selected = new Set([s.doc.layers[2].id]);
  s.paintAll();
  s.fit();
  s.persist();
  s.message("Editable demo loaded. Select any layer to customize it.");
};
document.getElementById("folder-input").onchange = async (event) => {
  if (!event.target.files.length) return;
  const studio = getUIStudio();
  if (!studio?.ready || studio.busy) return;
  studio.busy = true;
  await studio.persist();
  try {
    await workspace.importFolder(event.target.files);
    await reset();
    studio.message(
      "Folder imported for reading. Save downloads a portable SVGPRO copy.",
    );
  } catch (error) {
    studio.message(error, true);
    state();
    studio.paintAll();
  } finally {
    studio.busy = false;
    studio.paintShell();
    event.target.value = "";
  }
};
window.addEventListener("vinagen-open-settings", () =>
  showDesignerSettings(getUIStudio()),
);
try {
  await workspace.init();
  state();
  await openUIStudio(shell);
  for (const button of startupControls) button.disabled = false;
  state();
  document.getElementById("startup").textContent = "";
} catch (error) {
  document.getElementById("startup").textContent =
    "Web Designer could not start: " + error.message;
  console.error(error);
}
