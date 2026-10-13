export function html(tag, attrs = {}, text) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (key === "class") node.className = value;
    else if (key === "style") {
      for (const [property, style] of Object.entries(value))
        if (property.startsWith("--")) node.style.setProperty(property, style);
        else node.style[property] = style;
    } else if (key.startsWith("on")) {
      const event = key.slice(2);
      node.addEventListener(event, value);
      (node._uiEvents ??= new Map()).set(event, value);
    } else if (
      ["disabled", "hidden", "checked", "readonly", "multiple"].includes(key)
    )
      node.toggleAttribute(key, value !== false && value != null);
    else if (value !== undefined) node.setAttribute(key, value);
  }
  if (text !== undefined) node.textContent = text;
  return node;
}

// Reuse inspector controls rather than detaching the scroller and the active input.
// Replace callbacks too: Undo/validation can replace the document's layer objects.
const inspectorKey = (node) =>
  node.nodeType === 1
    ? node.dataset.inspectorKey ||
      node.getAttribute("aria-label") ||
      (["BUTTON", "SUMMARY"].includes(node.tagName) ? node.textContent : "")
    : "";
export function reconcileInspector(target, source) {
  const compatible = (a, b) =>
    a.nodeType === b.nodeType &&
    (a.nodeType !== 1 ||
      (a.tagName === b.tagName &&
        a.getAttribute("type") === b.getAttribute("type")));
  const previous = [...target.childNodes],
    used = new Set();
  for (const [index, fresh] of [...source.childNodes].entries()) {
    const key = inspectorKey(fresh);
    let current = key
      ? previous.find(
          (node) =>
            !used.has(node) &&
            inspectorKey(node) === key &&
            compatible(node, fresh),
        )
      : previous[index];
    if (
      !current ||
      used.has(current) ||
      inspectorKey(current) !== key ||
      !compatible(current, fresh)
    )
      current = null;
    if (!current) {
      target.insertBefore(fresh, target.childNodes[index] || null);
      continue;
    }
    used.add(current);
    if (current.nodeType === 1) {
      const value = fresh.value,
        checked = fresh.checked,
        disabled = fresh.disabled;
      for (const attribute of [...current.attributes])
        if (!fresh.hasAttribute(attribute.name))
          current.removeAttribute(attribute.name);
      for (const attribute of fresh.attributes)
        if (current.getAttribute(attribute.name) !== attribute.value)
          current.setAttribute(attribute.name, attribute.value);
      for (const [event, handler] of current._uiEvents || [])
        current.removeEventListener(event, handler);
      current._uiEvents = fresh._uiEvents;
      for (const [event, handler] of current._uiEvents || [])
        current.addEventListener(event, handler);
      for (const event of ["onclick", "onchange", "oninput", "onblur", "onkeydown"])
        current[event] = fresh[event];
      reconcileInspector(current, fresh);
      if (["INPUT", "TEXTAREA", "SELECT"].includes(current.tagName)) {
        const numericDraft =
          current.type === "number" &&
          current === document.activeElement &&
          current.value !== "" &&
          Number(current.value) === Number(value);
        const editingDraft = current._uiEditing && current === document.activeElement;
        if (current.value !== value && !numericDraft && !editingDraft) current.value = value;
        current.checked = checked;
        current.disabled = disabled;
      }
      if (current.tagName === "DETAILS") current.open = fresh.open;
    } else if (current.nodeValue !== fresh.nodeValue)
      current.nodeValue = fresh.nodeValue;
    if (target.childNodes[index] !== current)
      target.insertBefore(current, target.childNodes[index] || null);
  }
  for (const node of previous) if (!used.has(node)) node.remove();
}
