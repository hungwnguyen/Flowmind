import { workspace } from "./workspace.mjs";
import { openUIStudio, getUIStudio } from "./ui-studio.mjs";
import { newDocument } from "./ui-model.mjs";
import { demoDocument } from "./demo.mjs";
import { icon } from "./icons.mjs";
for (const button of document.querySelectorAll(".topbar [data-icon]")) {
  button.prepend(icon(button.dataset.icon));
}
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
  document.getElementById("workspace").disabled = !window.showDirectoryPicker;
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
  if (studio.busy) return;
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
  if (s.busy) return;
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
  if (studio.busy) return;
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
window.addEventListener("vinagen-open-settings", () => {
  const dialog = document.getElementById("web-settings"),
    preferences = window.VinaGenUserPreferences.get();
  dialog.replaceChildren();
  const heading = document.createElement("h2");
  heading.textContent = "Web Designer settings";
  dialog.append(heading);
  const field = (text, node) => {
    const label = document.createElement("label");
    label.append(text, node);
    dialog.append(label);
  };
  const theme = document.createElement("select");
  for (const value of ["system", "dark", "light"])
    theme.add(new Option(value, value));
  theme.value = preferences.theme;
  theme.onchange = () =>
    window.VinaGenUserPreferences.update({ theme: theme.value });
  field("Theme", theme);
  const grid = document.createElement("input");
  grid.type = "checkbox";
  grid.checked = preferences.grid;
  grid.onchange = () =>
    window.VinaGenUserPreferences.update({ grid: grid.checked });
  field("Snap to grid", grid);
  const author = document.createElement("input");
  author.value = workspace.config().commentDisplayName;
  author.onchange = () => {
    localStorage.setItem("web-designer-author", author.value);
    getUIStudio().config.commentDisplayName = author.value;
  };
  field("Comment display name", author);
  const p = document.createElement("p");
  p.textContent =
    "Files stay on this device. Choose folder enables direct saves in supported Chromium browsers on HTTPS or localhost. Import folder is read-only; Save downloads a copy. Import fonts through Import. Clear browser storage only after exporting your drafts.";
  dialog.append(p);
  const help = document.createElement("a");
  help.href = "../#/vi/web-designer";
  help.target = "_blank";
  help.textContent = "Read the guide";
  dialog.append(help);
  const close = document.createElement("button");
  close.textContent = "Done";
  close.onclick = () => dialog.close();
  dialog.append(close);
  dialog.showModal();
});
try {
  await workspace.init();
  state();
  await openUIStudio(shell);
  state();
  document.getElementById("startup").textContent = "";
} catch (error) {
  document.getElementById("startup").textContent =
    "Web Designer could not start: " + error.message;
  console.error(error);
}
