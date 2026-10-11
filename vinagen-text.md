# VinaGenText

> A focused SDF text component for game UI: face gradients, stroke, outer outline and 3D extrusion — editable in the browser, the Inspector or code, without touching shared materials.

## What it supports

- **Gradient modes:** Single, Horizontal, Vertical and Four Corners, with color and alpha keys (2–8 per track) and **Blend (Classic)** or **Fixed** interpolation.
- **Effects:** Stroke, Outer Outline and 3D Extrusion. Each shows its properties only when enabled; disabling remembers the authored amount.
- **Layout:** wrapping, auto size, rich formatting tags, spacing, margins, alignment and arc.
- **Opacity:** fades face, gradient, stroke, outline and extrusion together.

VinaGenText starts without effects. **Get Tickets style** applies the reference treatment (stroke 2, outline 4, extrusion 5 px).

## Create a label

- **GameObject → VNT → VinaGenText** adds a label to the scene.
- In UI Designer set **Typography → Text type → VinaGenText** and import the Canvas.

The JSON enum is `textRenderer: "text" | "textMeshPro" | "vinaGenText"`. Switching the type requires importing again.

## Styles

A style is a ScriptableObject with the blue-purple **S** badge. It stores font, typography and effects.

- Bundled styles: `VinaTextPro/Text Styles/Defaults/` — Default, Plain White, Cream Title, Red to Green, Blue to Purple, Sunset and Red to White.
- UI Designer output: `Assets/VinaGenUI/Text Styles/UI Designs/<design name>/`; independent presets in `Presets/`.
- **New** in the Inspector creates an independent style. Inspector formatting changes update every label using that style (with Undo/Redo). Text content and Raycast Target stay per object.

### Gradient presets

Reusable gradient SOs live in `VinaTextPro/Text Gradients/Defaults/`. Under **Material → Color Gradient**, assign a **Gradient Preset** or leave it empty for local colors. **Save Gradient as SO** stores an independent copy in `Text Gradients/Custom/`.

## Fonts

VinaGenText accepts only VinaGen font assets (blue-purple **T** icon). Four prebaked fonts work immediately after import — **LiberationSans, Noto Sans Regular, Montserrat Black, Nunito Regular** — with Latin, Vietnamese and ellipsis characters.

### Create a font

**Font Asset → Select → Create Font**, or right-click a TTF/OTF in the Project window and choose **Create Vina Font**:

1. Drop a **Source Font** (project font, or a TTF/OTF from Explorer — external files are copied into `VinaTextPro/Fonts/Imported/`).
2. Choose asset name, **Output Folder**, sampling point size, padding and atlas resolution.
3. Pick a **Character Set**: *Latin* (default), *Latin And Vietnamese*, or *Custom*.
4. Preview with **Sample Text**, then **Create & Apply**.

Missing or unpacked characters are reported in the Console. Existing fonts are never overwritten; duplicate names get a unique path.

## Code

```csharp
using UnityEngine;
using VinaGen.Text;

public sealed class ScoreLabel : MonoBehaviour
{
    public VinaGenText label;

    public void SetScore(int score)
    {
        label.BeginUpdate();          // batch several property changes
        label.text = $"Score: {score}";
        label.opacity = 1f;
        label.EndUpdate();
    }
}
```

Use `BeginUpdate()` / `EndUpdate()` when changing several properties together.

## Text menu

| Menu (**Tools → VinaGen AI Toolkit → Text**) | Purpose |
| --- | --- |
| **Create Default Fonts & Styles** | Recreates missing starter assets offline; keeps existing GUIDs. |
| **Organize Fonts** / **Organize Text Styles** | Re-runs the folder migration, preserving GUIDs. |
| **Repair Font & Style Icons** | Re-applies the T / S icons. |
| **Validate Baked Text** / **Delete Unused Baked Text…** | Maintenance for baked text assets. |
| **Settings** | Text settings asset. |

## Performance notes

- Inactive labels allocate no renderer until activation; active labels reuse theirs.
- Equal atlas/gradient paint shares one reference-counted material across labels.
- Outline and extrusion draw extra silhouettes, so they cost more than plain text — benchmark on your target device with the real number of visible labels.
- VinaGenText is a focused UI component, not a full TMP replacement. Named rich-text font/material/sprite/style resources are not supported.

## Licensing

The bundled layout engine and some shaders are modified Unity source under the **Unity Companion License**. Keep `Third-Party Notices.txt`, `StandaloneText/Licenses/` and the font licenses when distributing.

---
[Next: Particles & Textures](particles.md)
