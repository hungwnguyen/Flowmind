# VinaGenText

Stylish UI text with gradients, strokes, outlines and 3D extrusion. Use **Dynamic** for text that changes, **Static Baked** for fixed labels.

![VinaGenText effect showcase in UI Designer](images/vinagen-text-demo.png)

Try the bundled styles in `Samples/Text Effects/ILoveYouTextShowcase.asset`. See also [Demos](demos.md) and [Text settings](settings.md#text-settings).

## Features

| Area | What you get |
| --- | --- |
| Text | Font, size, bold/italic, alignment, wrapping, auto size, spacing, curved text. Works with Layout Groups. |
| Rich text | `<b>`, `<i>`, `<u>`, `<s>`, `<color>`, `<size>`, `<sup>`, `<sub>`, `<br>` |
| Color | Solid or gradient (horizontal, vertical, four corners). |
| Effects | Inner outline, stroke, outer outline and 3D extrusion. |
| Opacity | Fades text and effects together. |
| Shared styles | Edit a style once — every label using it updates. |
| Output | Canvas (UI) or Mesh Renderer (scene text). |

Works without TextMesh Pro at runtime. TMP is only used in the Editor to create fonts.

## Create a label

Use **GameObject → VNT → VinaGenText**, or set **Typography → Text type → VinaGenText** in UI Designer.

Edit font, size and effects in the Inspector. **New** creates a separate style; editing a shared style updates every label that uses it.

**Create a font:** **Font Asset → Select → Create Font** → choose a TTF/OTF → **Latin And Vietnamese** → **Create & Apply**.

> Fonts only contain the characters you include. Missing characters won't show — make sure your character set covers your text before building.

Your styles, gradients and fonts are saved in `Assets/VinaGenGenerated/` (outside the toolkit, so updates won't overwrite them).

## Choose a rendering mode

| Mode | Use it for |
| --- | --- |
| **Dynamic** | Scores, timers and any text that changes in game. |
| **Static Baked** | Titles, button labels and other fixed text. Fastest option. |

Static Baked turns the text and its effects into one image, so it costs almost nothing at runtime.

## Bake fixed text

1. Finish the label's text, font and style.
2. In **Rendering**, choose **Static Baked** and click **Bake / Rebuild**.
3. Keep **Shared Atlas** on in **Text → Settings**.
4. Save the scene or prefab.

To bake everything under an object: select it, then **GameObject → VNT → Bake All Text (Selection + Children)**. **Revert Bake** turns a label back to Dynamic.

**Texel Scale** sets sharpness: 1 is normal, 2 for high-DPI screens or enlarged text (uses more memory). Baked images go to `Assets/VinaGen Text Bakes/`.

**Auto Bake** re-bakes changed labels automatically when you save the scene or prefab.

## Combine labels with Mesh Batch

For text in the 3D scene (not UI), batch baked labels into fewer draw calls:

1. Put baked labels under one parent.
2. Set each label's **Rendering → Backend → Mesh Renderer**.
3. Add **VinaGen Text Mesh Batch** to the parent.

If labels don't move, turn off **Track Movement**. After moving one, call its `Refresh()`.

## Limitations

- **Fixed character set:** only characters in the font are shown. Not suited to free user input (Chinese, Japanese, emoji…).
- **Rich text:** `<font>`, `<material>`, `<sprite>` and `<style>` are not supported.
- **Not a TMP replacement:** TMP fonts must be converted first.
- **Baked labels can't change at runtime.** Call `SwitchToDynamic()` before editing them.
- **Effects cost more:** stroke, outline and extrusion triple the vertex count. Use them for short labels, not paragraphs.
- **Opacity below 1** adds one draw call per label. For many fading labels, use Static Baked.
- **Dynamic is slower than TMP** when changing text or first showing labels (see [Benchmark](vinagen-text.md?id=benchmark-200-labels)).
- After changing **Text type** in UI Designer, import to Canvas again.

## Benchmark: 200 labels

Measured 13 October 2026 · Unity 6000.3.22f1 · Windows Release build · i7-14700K / RTX 3060. **Plain** = no effects; **Styled** = gradient, stroke, outline and extrusion.

<div class="vg-benchmark" role="region" aria-label="VinaGenText benchmark, 200 labels" tabindex="0">
<table><thead><tr>
<th scope="col">Metric (200 labels)</th>
<th scope="col">UGUI Text</th>
<th scope="col">TextMeshPro</th>
<th scope="col">VinaGenText<br>Dynamic Plain</th>
<th scope="col">VinaGenText<br>Dynamic Styled</th>
<th scope="col">Static Baked</th>
</tr></thead><tbody>
<tr><th scope="row">First activation</th><td>2.50 ms</td><td>5.09 ms</td><td>9.61 ms</td><td>10.49 ms</td><td>—</td></tr>
<tr><th scope="row">Re-activation</th><td>2.25 ms</td><td>3.50 ms</td><td>1.25 ms</td><td>1.32 ms</td><td>—</td></tr>
<tr><th scope="row">Load baked scene</th><td>—</td><td>—</td><td>—</td><td>—</td><td>2.78 ms Canvas<br>1.50 ms Mesh Batch</td></tr>
<tr><th scope="row">Managed allocation, first activation</th><td>1.8 MB</td><td>3.8 MB</td><td>5.2 MB</td><td>5.2 MB</td><td>—</td></tr>
<tr><th scope="row">Idle frame (whole frame)</th><td>0.13 ms</td><td>0.15 ms</td><td>0.27 ms</td><td>1.64 ms</td><td>0.13 ms</td></tr>
<tr><th scope="row">Change text, all labels</th><td>1.94 ms</td><td>3.38 ms</td><td>5.39 ms</td><td>6.47 ms</td><td>Rebake</td></tr>
<tr><th scope="row">Change color, all labels</th><td>1.78 ms</td><td>3.07 ms</td><td>1.18 ms</td><td>1.32 ms</td><td>—</td></tr>
<tr><th scope="row">Vertices</th><td>9,964</td><td>10,764</td><td>9,964</td><td>29,884</td><td>804</td></tr>
<tr><th scope="row">Draw calls (idle)</th><td>2</td><td>2</td><td>2</td><td>2</td><td>2</td></tr>
</tbody></table></div>

**In short:** Static Baked is the cheapest for fixed text. Dynamic beats TMP at color changes and re-activation, but is slower at changing text and first activation.

<details>
<summary>How these numbers were measured</summary>
<p>Mono, Direct3D 12, Built-in pipeline, Gamma; Canvas rendered to a 1280×720 RenderTexture. Each value is the median of two interleaved runs. Activation = SetActive(true) + first Canvas update (warm). Change rows = one frame where all labels change. Managed = Mono heap growth with GC off. GPU time is not included — profile on your target device. The first label in a new process also pays about 29 + 59 ms of one-time setup.</p>
<p>Project source: <code>Documentation/VinaGenTextPerformance/VinaGenText-Comparison-Summary.md</code>.</p>
</details>

[Next: Particles & Textures](particles.md)
