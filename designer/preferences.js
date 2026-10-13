// Browser preferences belong to the user, never to a Unity graph asset.
(() => {
  const key = "vinagen-web-preferences:v1";
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const normalize = (value) => ({
    theme: ["light", "dark", "system"].includes(value?.theme)
      ? value.theme
      : "system",
    contrast: value?.contrast === true,
    grid: value?.grid !== false,
    minimap: value?.minimap !== false,
    lightCanvasBackground: /^#[0-9a-f]{6}$/i.test(value?.lightCanvasBackground)
      ? value.lightCanvasBackground.toLowerCase()
      : "#e5e5e5",
  });
  const read = () => {
    try {
      return normalize(JSON.parse(localStorage.getItem(key)));
    } catch {
      return normalize(null);
    }
  };
  let preferences = read();
  function apply() {
    document.documentElement.dataset.theme =
      preferences.theme === "system"
        ? media.matches
          ? "dark"
          : "light"
        : preferences.theme;
    document.documentElement.dataset.contrast = preferences.contrast
      ? "high"
      : "normal";
    document.documentElement.style.setProperty(
      "--light-canvas-background", preferences.lightCanvasBackground,
    );
    window.dispatchEvent(
      new CustomEvent("vinagen-preferences-change", {
        detail: { ...preferences },
      }),
    );
  }
  window.VinaGenUserPreferences = Object.freeze({
    get: () => ({ ...preferences }),
    update: (patch) => {
      preferences = normalize({ ...preferences, ...patch });
      let saved = true;
      try {
        localStorage.setItem(key, JSON.stringify(preferences));
      } catch {
        saved = false;
      }
      apply();
      return saved;
    },
  });
  media.addEventListener("change", () => {
    if (preferences.theme === "system") apply();
  });
  window.addEventListener("storage", (event) => {
    if (event.key === key || event.key === null) {
      preferences = read();
      apply();
    }
  });
  apply();
})();
