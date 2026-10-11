# VinaGenText

UI text with gradients, stroke, outline and extrusion. Choose Dynamic for changing content or Static Baked for fixed labels.

## Create a label

Use **GameObject → VNT → VinaGenText**, or choose **Typography → Text type → VinaGenText** in UI Designer.

Edit font, size and effects in the Inspector. **New** creates a separate style; editing a shared style updates its users. VinaGen fonts use static atlases: include the characters you need before building.

To create a font, open **Font Asset → Select → Create Font**, choose a TTF/OTF source and **Latin And Vietnamese**, then **Create & Apply**.

## Choose a rendering mode

| Mode | Use it for |
| --- | --- |
| **Dynamic** | Scores, timers and text that changes at runtime. |
| **Static Baked** | Fixed titles, button labels and decorated text. |

Static Baked stores all text effects in one image. It draws one quad per label, supports alpha fades and skips text parsing, layout and style polling at runtime. The current version uses **Composited images**; Geometry baking has been removed.

## Bake fixed text

1. Finish the label's text, font and style.
2. In **Rendering**, choose **Static Baked** and click **Bake / Rebuild**.
3. Keep **Shared Atlas** enabled in **Text → Settings** to share texture pages.
4. Save the scene or prefab. Rebuild stale or unsupported bakes before building.

For a whole hierarchy, select its root and use **GameObject → VNT → Bake All Text (Selection + Children)**. **Revert Bake** returns a label to Dynamic.

**Texel Scale** controls image sharpness: 1 at reference resolution, 2 for high-DPI or enlarged text, with higher texture memory. Default output: `Assets/VinaGen Text Bakes/`.

## Built-in optimizations

- **Dynamic:** inactive labels delay renderer creation; equal font-atlas/gradient paint can share materials. Use `BeginUpdate()` / `EndUpdate()` for several property changes.
- **Baking:** matching text, fonts and styles reuse bake data. Shared atlases let compatible labels batch together.
- **Auto Bake:** changed labels bake after editing finishes or on scene/prefab save. Unchanged labels are skipped; only changed atlas pages are rewritten. It does not run in Play Mode.

## Combine labels with Mesh Batch

Use **Canvas** for UI that needs masks, raycasts and CanvasGroup. For scene text using **Mesh Renderer**:

1. Put baked labels under the same parent object.
2. Set their **Rendering → Backend → Mesh Renderer**.
3. Add **VinaGen Text Mesh Batch** to the parent through Add Component.

Each atlas page needs one draw call. The group shares sorting; disable **Track Movement** for labels that stay fixed within it, then call `Rebuild()` after moving a label.

## Benchmark: 1,000 labels

Measured on **11 October 2026**, Unity **6000.3.22f1**, URP, Linear color space, Editor Play Mode, Release code, world-space Canvas; **i7-14700K / RTX 3060 / 32 GB RAM**.

UGUI uses Outline + Shadow; TMP uses outline, underlay and a gradient; VinaGenText uses its default gradient, stroke, outline and extrusion style.

<div class="vg-benchmark" role="region" aria-label="VinaGenText benchmark" tabindex="0">
<table><thead><tr>
<th scope="col">Metric</th>
<th scope="col">UGUI Text<br>Outline + Shadow</th>
<th scope="col">TextMeshPro</th>
<th scope="col">VinaGenText<br>Dynamic</th>
<th scope="col">Static Baked<br>Geometry (removed)</th>
<th scope="col">Static Baked<br>Composited (atlas)</th>
</tr></thead><tbody>
<tr><th scope="row">First activation</th><td>75.6 ms</td><td>397.9 ms¹</td><td>141.1 ms</td><td>30.8 ms</td><td>25.8 ms</td></tr>
<tr><th scope="row">Managed allocation</th><td>8.1 MB</td><td>14.4 MB</td><td>13.6 MB</td><td>0.8 MB</td><td>0.8 MB</td></tr>
<tr><th scope="row">Idle frame</th><td>0.009 ms</td><td>0.106 ms</td><td>0.499 ms</td><td>0.009 ms</td><td>0.010 ms</td></tr>
<tr><th scope="row">Render / frame</th><td>1.01 ms</td><td>2.26 ms</td><td>7.09 ms</td><td>6.38 ms</td><td>1.7–2.1 ms</td></tr>
<tr><th scope="row">Change all 1,000 labels</th><td>74.2 ms</td><td>24.2 ms</td><td>37.2 ms</td><td>Rebake</td><td>Rebake</td></tr>
<tr><th scope="row">Bake file / label</th><td>—</td><td>—</td><td>—</td><td>17.0 KB</td><td>2.5 KB</td></tr>
<tr><th scope="row">Bake 1,000 labels</th><td>—</td><td>—</td><td>—</td><td>14.7 s</td><td>11.8–12.9 s</td></tr>
</tbody></table></div>

¹ TMP's first activation includes about **340 ms** of one-time font, material and shader initialization. Later activations measured **42.9 ms**. Managed allocation measures the Mono heap increase during activation; bake-file size is disk size per label.

Static Baked reduces activation cost and allocation versus Dynamic in this test. **UGUI rendered faster on Canvas**; the effects differ. A separate Composited **Mesh Batch** run measured **0.38 ms render, 4.6 ms activation, 0.36 MB managed and 1 draw call**.

<details>
<summary>How these numbers were measured</summary>
<p>Activation: SetActive(true) + Canvas.ForceUpdateCanvases(). Managed memory: median of five activations with GC disabled. Render: best of three blocks of 40 camera.Render calls. Geometry is a historical result from before removal. These are local Editor measurements; profile your target device.</p>
<p>Project source: <code>Documentation/VinaGenTextPerformance/VinaGenText-Performance-Report.md</code>, section 9.11.</p>
</details>

[Next: Particles & Textures](particles.md)
