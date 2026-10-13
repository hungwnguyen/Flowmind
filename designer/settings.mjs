import { html } from "./dom-controls.mjs";
import { dialogShell } from "./popup-shell.mjs";
import { icon } from "./icons.mjs";

// Match the local editor settings chrome and appearance cards.
export function showDesignerSettings(studio) {
  const dialog = document.getElementById("web-settings");
  if (!studio?.ready || dialog.open) return;
  dialog.classList.add("ui-dialog");
  const { body, actions } = dialogShell(dialog, {
    title: "Settings",
    kind: "settings",
  });
  const close = dialog.querySelector(".vg-dialog-close");
  close.replaceChildren(icon("close"));
  close.setAttribute("aria-label", "Close settings");
  body.append(
    html(
      "p",
      { class: "settings-intro" },
      "Preferences for this workspace, saved on this device.",
    ),
    html("p", { class: "settings-label" }, "Appearance"),
  );
  const preferences = window.VinaGenUserPreferences,
    current = preferences.get();
  const choices = html("div", {
    class: "theme-options",
    role: "radiogroup",
    "aria-label": "Theme",
  });
  const status = html(
    "p",
    { class: "settings-status", role: "status" },
    "Changes apply immediately and are saved on this device.",
  );
  function update(patch) {
    const saved = preferences.update(patch);
    for (const choice of choices.children)
      choice.classList.toggle(
        "selected",
        choice.querySelector("input").checked,
      );
    status.textContent = saved
      ? "Saved on this device."
      : "Applied for this session. Browser storage is unavailable.";
  }
  for (const [value, title] of [
    ["light", "Light"],
    ["dark", "Dark"],
    ["system", "System"],
  ]) {
    const choice = html("label", {
      class: "theme-choice" + (current.theme === value ? " selected" : ""),
    });
    const input = html("input", {
      type: "radio",
      name: "designer-theme",
      value,
      "aria-label": title,
    });
    input.checked = current.theme === value;
    input.onchange = () => update({ theme: value });
    choice.append(
      input,
      html("span", { class: "theme-swatch " + value }),
      html("span", { class: "theme-name" }, title),
    );
    choices.append(choice);
  }
  body.append(choices);
  function row(title, description, input) {
    const label = html("label", { class: "settings-row" }),
      copy = html("span", { class: "settings-row-copy" });
    copy.append(html("strong", {}, title), html("p", {}, description));
    label.append(copy, input);
    body.append(label);
  }
  const background = html("input", {
    type: "color",
    value: current.lightCanvasBackground,
    "aria-label": "Light grid background",
  });
  background.oninput = () =>
    update({ lightCanvasBackground: background.value });
  row(
    "Light grid background",
    "Canvas background for the light theme. Saved on this device.",
    background,
  );
  for (const [key, title, description] of [
    [
      "contrast",
      "Enhanced contrast",
      "Stronger text and borders in the editor interface.",
    ],
    ["grid", "Snap to grid", "Snap while moving and resizing objects."],
  ]) {
    const input = html("input", { type: "checkbox", "aria-label": title });
    input.checked = current[key];
    input.onchange = () => update({ [key]: input.checked });
    row(title, description, input);
  }
  body.append(
    html("p", { class: "settings-label settings-section" }, "Comments"),
  );
  const author = html("input", {
    type: "text",
    value: studio.config.commentDisplayName || "Designer",
    "aria-label": "Comment display name",
    maxlength: 80,
  });
  author.onchange = () => {
    const name = author.value.trim() || "Designer";
    author.value = name;
    studio.config.commentDisplayName = name;
    try {
      localStorage.setItem("web-designer-author", name);
      status.textContent = "Saved on this device.";
    } catch {
      status.textContent =
        "Applied for this session. Browser storage is unavailable.";
    }
  };
  row("Display name", "Used on local comment threads.", author);
  body.append(status);
  const help = html(
    "a",
    {
      href: "../#/vi/web-designer",
      target: "_blank",
      rel: "noopener",
      class: "settings-help",
    },
    "Read the guide",
  );
  const done = html("button", { type: "button", class: "ui-primary" }, "Done");
  done.onclick = () => dialog.close();
  actions.append(help, done);
  dialog.showModal();
}
