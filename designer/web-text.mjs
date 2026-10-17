import { resolvedTextStyle } from "./ui-styled-text.mjs";
import { evaluateTextGradient } from "./ui-paints.mjs";
import { curvePoint } from "./ui-text-curve.mjs";
const loaded = new Map();
const rgba = (color) => {
  const hex = String(color || "#ffffffff").replace("#", "");
  return [
    parseInt(hex.slice(0, 2), 16),
    parseInt(hex.slice(2, 4), 16),
    parseInt(hex.slice(4, 6), 16),
    hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1,
  ];
};
export async function renderText(layer, config, url) {
  const font =
      config.vinaGenFonts.find((f) => f.key === layer.tmpFont) ||
      config.vinaGenFonts.find((f) => f.isDefault),
    guid = layer.fontGuid || font?.sourceFontGuid;
  if (guid && !loaded.has(guid)) {
    const task = new FontFace("ui-" + guid, `url("${url(guid)}")`)
      .load()
      .then((face) => document.fonts.add(face));
    loaded.set(guid, task);
    task.catch(() => loaded.delete(guid));
  }
  if (guid) await loaded.get(guid);
  const s = resolvedTextStyle(layer, config.textStyles),
    settings = layer.tmpSettings || {},
    padding = Math.ceil(
      Math.max(
        s.strokeWidth + s.outlineWidth + Math.max(Math.abs(s.extrusionX), Math.abs(s.extrusionY)),
        s.shadowWidth + Math.max(Math.abs(s.shadowX), Math.abs(s.shadowY)),
      ) +
        4,
    ),
    width = Math.ceil(layer.width + padding * 2),
    height = Math.ceil(layer.height + padding * 2);
  if (width > 8192 || height > 8192 || width * height > 16777216)
    throw Error(
      "Styled text preview exceeds 16 megapixels. Reduce the label or effects.",
    );
  const make = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      return canvas;
    },
    canvas = make(),
    ctx = canvas.getContext("2d"),
    mask = make(),
    m = mask.getContext("2d");
  let size = layer.fontSize || 24;
  const family = guid ? `"ui-${guid}"` : "Arial",
    fontString = () =>
      `${settings.italic ? "italic " : ""}${layer.bold ? "bold " : ""}${size}px ${family}`,
    spacing = settings.characterSpacing || 0,
    wordSpacing = settings.wordSpacing || 0;
  const plain = String(layer.text || "")
      .replace(/<br\s*\/?\s*>/gi, "\n")
      .replace(settings.richText ? /<[^>]*>/g : /$^/g, ""),
    areaWidth = Math.max(
      1,
      layer.width - (settings.marginLeft || 0) - (settings.marginRight || 0),
    ),
    areaHeight = Math.max(
      1,
      layer.height - (settings.marginTop || 0) - (settings.marginBottom || 0),
    );
  const measure = (text) => {
    m.font = fontString();
    return (
      m.measureText(text).width +
      Math.max(0, [...text].length - 1) * spacing +
      [...text].filter((c) => c === " ").length * wordSpacing
    );
  };
  const layout = () => {
    const lines = [];
    lines.paragraphStarts = new Set();
    lines.sourceOffsets = [];
    let paragraphStart = 0;
    for (const paragraph of plain.split("\n")) {
      lines.paragraphStarts.add(lines.length);
      if (settings.wordWrapping === false) {
        lines.sourceOffsets.push(paragraphStart);
        lines.push(paragraph);
        paragraphStart += paragraph.length + 1;
        continue;
      }
      let line = "", lineStart = paragraphStart, consumed = 0;
      for (const word of paragraph.split(/(\s+)/)) {
        if (line && measure(line + word) > areaWidth) {
          lines.sourceOffsets.push(lineStart);
          lines.push(line.trimEnd());
          line = word.trimStart();
          lineStart = paragraphStart + consumed + word.length - line.length;
        } else line += word;
        consumed += word.length;
      }
      lines.sourceOffsets.push(lineStart);
      lines.push(line);
      paragraphStart += paragraph.length + 1;
    }
    return lines;
  };
  let lines = layout();
  if (settings.autoSize) {
    size = settings.fontSizeMax || 72;
    lines = layout();
    while (
      size > (settings.fontSizeMin || 18) &&
      (lines.some((l) => measure(l) > areaWidth) ||
        lines.length * (size * 1.2 + (settings.lineSpacing || 0)) +
          Math.max(0, lines.paragraphStarts.size - 1) *
            (settings.paragraphSpacing || 0) >
          areaHeight)
    ) {
      size--;
      lines = layout();
    }
  }
  if (["truncate", "ellipsis"].includes(settings.overflow)) {
    const paragraphStarts = lines.paragraphStarts;
    const sourceOffsets = lines.sourceOffsets;
    const capacity = Math.max(
        1,
        Math.floor(areaHeight / (size * 1.2 + (settings.lineSpacing || 0))),
      ),
      hidden = lines.length > capacity;
    lines = lines.slice(0, capacity).map((line, index) => {
      const shortened =
        measure(line) > areaWidth || (hidden && index === capacity - 1);
      if (!shortened) return line;
      const suffix = settings.overflow === "ellipsis" ? "…" : "";
      while (line && measure(line + suffix) > areaWidth)
        line = [...line].slice(0, -1).join("");
      return line + suffix;
    });
    lines.paragraphStarts = new Set(
      [...paragraphStarts].filter((index) => index < lines.length),
    );
    lines.sourceOffsets = sourceOffsets.slice(0, lines.length);
  }
  const lineHeight = size * 1.2 + (settings.lineSpacing || 0),
    blockHeight =
      lines.length * lineHeight +
      Math.max(0, lines.paragraphStarts.size - 1) *
        (settings.paragraphSpacing || 0),
    vertical = settings.verticalAlign || "middle",
    top =
      padding +
      (settings.marginTop || 0) +
      (vertical === "bottom"
        ? areaHeight - blockHeight
        : vertical === "middle"
          ? (areaHeight - blockHeight) / 2
          : 0),
    glyphs = [];
  let paragraphOffset = 0;
  for (let i = 0; i < lines.length; i++) {
    if (i > 0 && lines.paragraphStarts.has(i))
      paragraphOffset += settings.paragraphSpacing || 0;
    const line = lines[i],
      lineWidth = measure(line),
      align = layer.textAlign || "center";
    let x =
        padding +
        (settings.marginLeft || 0) +
        (align === "right"
          ? areaWidth - lineWidth
          : align === "center"
            ? (areaWidth - lineWidth) / 2
            : 0),
      y = top + i * lineHeight + paragraphOffset + size * 0.82;
    let sourceIndex = lines.sourceOffsets[i];
    for (const char of [...line]) {
      m.font = fontString();
      const advance = m.measureText(char).width;
      let pose = { x: x + advance / 2, y, rotation: 0 };
      if (layer.textCurve)
        pose = curvePoint(
          pose.x,
          pose.y,
          padding + layer.width / 2,
          padding + layer.height / 2,
          layer.width,
          layer.textCurve.angle,
        );
      glyphs.push({ char, ...pose, advance, sourceIndex });
      sourceIndex += char.length;
      x += advance + spacing + (char === " " ? wordSpacing : 0);
    }
  }
  const draw = (context, fill, stroke = 0, dx = 0, dy = 0) => {
    context.font = fontString();
    context.textAlign = "center";
    context.lineJoin = "round";
    context.lineWidth = stroke * 2;
    for (const g of glyphs) {
      context.fillStyle = context.strokeStyle = typeof fill === "function" ? fill(g) : fill;
      context.save();
      context.translate(g.x + dx, g.y + dy);
      context.rotate((g.rotation * Math.PI) / 180);
      if (stroke) context.strokeText(g.char, 0, 0);
      else context.fillText(g.char, 0, 0);
      context.restore();
    }
  };
  if (["masking", "truncate", "ellipsis"].includes(settings.overflow)) {
    ctx.beginPath();
    ctx.rect(padding, padding, layer.width, layer.height);
    ctx.clip();
  }
  if (s.shadowWidth || s.shadowX || s.shadowY) {
    if (s.shadowWidth) draw(ctx, s.shadowColor, s.shadowWidth, s.shadowX, s.shadowY);
    draw(ctx, s.shadowColor, 0, s.shadowX, s.shadowY);
  }
  if (s.extrusionX || s.extrusionY) {
    const steps = Math.ceil(
      Math.max(Math.abs(s.extrusionX), Math.abs(s.extrusionY)),
    );
    for (let i = steps; i >= 1; i--) {
      draw(
        ctx,
        s.extrusionColor,
        s.strokeWidth + s.outlineWidth,
        (s.extrusionX * i) / steps,
        (s.extrusionY * i) / steps,
      );
      draw(
        ctx,
        s.extrusionColor,
        0,
        (s.extrusionX * i) / steps,
        (s.extrusionY * i) / steps,
      );
    }
  }
  if (s.outlineWidth) draw(ctx, s.outlineColor, s.strokeWidth + s.outlineWidth);
  if (s.strokeWidth) draw(ctx, s.strokeColor, s.strokeWidth);
  const runs = !settings.richText && layer.textRuns?.text === plain ? layer.textRuns.colors : null;
  draw(m, runs ? g => runs.find(run => g.sourceIndex >= run.start && g.sourceIndex < run.start + run.length)?.color || "#ffffffff" : "#fff");
  const pixels = m.getImageData(0, 0, width, height),
    angle = ((s.gradientAngle || 0) * Math.PI) / 180,
    corners = [s.topLeft, s.topRight, s.bottomLeft, s.bottomRight].map(rgba),
    face = rgba(s.faceColor),
    tint = rgba(layer.textColor);
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const offset = (y * width + x) * 4;
      if (!pixels.data[offset + 3]) continue;
      const u = Math.max(0, Math.min(1, (x - padding) / layer.width)),
        v = Math.max(0, Math.min(1, (y - padding) / layer.height));
      let color = [255, 255, 255, 1];
      if (s.gradient && s.gradientMode === "four-corners")
        color = corners[0].map(
          (_, i) =>
            (corners[0][i] * (1 - u) + corners[1][i] * u) * (1 - v) +
            (corners[2][i] * (1 - u) + corners[3][i] * u) * v,
        );
      else if (s.gradient)
        color = evaluateTextGradient(
          s,
          s.gradientMode === "horizontal"
            ? u
            : s.gradientMode === "angle"
              ? Math.max(
                  0,
                  Math.min(
                    1,
                    0.5 +
                      (u - 0.5) * Math.cos(angle) +
                      (v - 0.5) * Math.sin(angle),
                  ),
                )
              : s.gradientMode === "single"
                ? 0
                : v,
        );
      for (let i = 0; i < 3; i++)
        pixels.data[offset + i] =
          pixels.data[offset + i] * color[i] * face[i] * tint[i] / 255 ** 3;
      pixels.data[offset + 3] *= color[3] * face[3] * tint[3];
    }
  m.putImageData(pixels, 0, 0);
  ctx.drawImage(mask, 0, 0);
  if (s.innerOutlineWidth) {
    const inner = make(),
      ic = inner.getContext("2d");
    draw(ic, s.innerOutlineColor, s.innerOutlineWidth);
    ic.globalCompositeOperation = "destination-in";
    ic.drawImage(mask, 0, 0);
    ctx.drawImage(inner, 0, 0);
  }
  return { dataUrl: canvas.toDataURL("image/png"), width, height, padding };
}
