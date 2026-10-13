// Invoke synchronously from the click handler so browsers retain user activation.
export async function pickImageFiles() {
  if (typeof window.showOpenFilePicker === "function") {
    try {
      const handles = await window.showOpenFilePicker({
        multiple: true,
        types: [
          {
            description: "PNG / JPEG images",
            accept: { "image/png": [".png"], "image/jpeg": [".jpg", ".jpeg"] },
          },
        ],
        excludeAcceptAllOption: true,
      });
      return Promise.all(handles.map((handle) => handle.getFile()));
    } catch (error) {
      if (error.name === "AbortError") return [];
      // Some embedded browsers expose the API but deny it; use their file input.
      if (!["SecurityError", "NotAllowedError"].includes(error.name))
        throw error;
    }
  }
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".png,.jpg,.jpeg";
    input.multiple = true;
    input.hidden = true;
    document.body.append(input);
    let settled = false;
    const done = (files) => {
      if (settled) return;
      settled = true;
      window.removeEventListener("focus", focus);
      input.remove();
      resolve(files);
    };
    const focus = () => setTimeout(() => done([...input.files]), 1000);
    input.onchange = () => done([...input.files]);
    input.oncancel = () => done([]);
    window.addEventListener("focus", focus, { once: true });
    input.click();
  });
}
