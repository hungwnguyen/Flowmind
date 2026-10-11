# UI Designer

> Design game screens in the browser, import PSDs and images, label components, then import a ready-to-use **Unity Canvas**.

## Open

- **Tools → VinaGen AI Toolkit → Editors → Open UI Designer**, or
- In the Flow Editor top bar choose **UI Designer → Unity**, or
- Double-click a **VinaGenUIDocument** asset (create one with **Assets → Create → VinaGen AI Toolkit → UI Designer Document**).

UI Designer shares the Flow Editor workspace chrome: Files/Layers/Assets on the left, Design/Unity properties on the right, drawing tools below the canvas. Unsaved edits show a yellow warning in the top bar and a dot on **Save**.

## Build a screen

1. **New screen** or **Import** (PSD, JSON or images) from the **Files** panel.
2. Draw **frames, rectangles, text and buttons**; group, duplicate, copy/paste, align/distribute, reorder, hide/lock layers.
3. Drag images from **Unity Assets** (or PNG/JPEG files) onto the canvas.
4. Label every layer as **Background / Image / Button / Text / Group** — use the property control or **Alt+1–5**.
5. Choose responsive anchors, clip children or bake horizontal/vertical auto layout.
6. Click **Save** to write the `VinaGenUIDocument` asset.

When exactly one object is selected, creation tools add children under it using its local coordinates. Clear the selection to create on the outermost layer. **Root tools → Screen root** creates a screen-sized container.

### Editing tips

- **Move snapping** to screen, parent and sibling edges/centers with red guides and equal-distance labels. **Alt+drag** bypasses snapping, **Shift+drag** constrains to one axis.
- Resize from any of the **four corners or four edges**; **Shift+resize** keeps proportions.
- **Image → Scale → Fit** keeps source proportions; **Stretch** fills the rectangle. **Reset to image size** restores original dimensions.
- **Shift+1** fits the screen; mouse wheel pans; **Ctrl/Cmd+wheel** zooms around the pointer.
- Repeated clicks at the same spot cycle through overlapping layers; transparent pixels are click-through.

## PSD import

PSD v1 import runs in a local Web Worker with progress and cancellation.

| Supported | Needs review / not supported |
| --- | --- |
| 8-bit RGB pixel layers (raw/RLE/ZIP), layer names, groups, opacity, visibility | Masks, non-normal blend modes, effects, smart objects (review visually) |
| Single-color layers become editable Image fills | PSB, CMYK and 16/32-bit PSDs (not supported) |
| Type layers import as raster — assign a Text label to make them editable | |

PSD imports keep their own `Images/` and `Text Styles/` under `Assets/VinaGen PSD Imports/<PSD name>/`.

## Text layers

Pick **Typography → Text type**:

| Type | Imported component |
| --- | --- |
| **Text** | Unity UI Text |
| **TextMesh Pro** | `TextMeshProUGUI` with SDF fonts and material presets |
| **VinaGenText** | `VinaGen.Text.VinaGenText` with gradients, stroke, outline and extrusion — see [VinaGenText](vinagen-text.md) |

Previews render entirely in the browser using the source font. **Create TMP starter fonts** (UI Designer Settings, or **Tools → VinaGen AI Toolkit → Editors → Create UI Designer TMP starter fonts**) registers six SDF fonts with Vietnamese fallback in `Assets/VinaGenUI/Fonts/TextMeshPro`.

## 9-slice

UI Designer detects 9-slice borders automatically (repeated RGBA bands, two-pixel margin and center, following the Auto9Slicer algorithm). On Save and Canvas import, each standalone source PNG/JPEG is replaced once by its minimum optimized texture while keeping its GUID, and every sliced layer uses Unity **Sliced** Images with full sprite borders. Uniform-color images become Images with **Source Image = None**.

## Import into Unity

Click the blue **Unity** button (or **Import to Unity Canvas** in the document Inspector):

- Every reference is validated before any object is created; the import is one isolated **Undo** group.
- The selected scene Canvas is used, or a screen-space Canvas is created. **Scenes are not saved automatically.**
- **Image** and **Button** layers use the standard Unity Image component; Buttons get that Image as their target Graphic. Connect click events yourself.
- Objects matching the Settings screen width/height use **Stretch–Stretch** anchors; other popups use Center anchors.
- Auto-layout rectangles are baked; no live LayoutGroups are created.
- The **VinaGen UI Designer** Game View preset is selected/updated to the Settings resolution.

After import, text/style/typography edits in the same browser session update the imported text object live — no reimport needed.

## Show in Editor

The **Show in Editor** toolbar button pings the active document asset in the Project window. Unsaved work offers **Save and open** or **Open and discard**.

## Settings

**Tools → VinaGen AI Toolkit → Settings → UI Designer Settings** opens `VinaGenUIStudioSettings.asset` with cards for:

- **Assets** — document, image and font folders (drop multiple TTF/OTF fonts at once).
- **Canvas** — reference width and height (screen resolution).
- **Shortcuts** — click a key badge or **Record**, then press the combination. Duplicates and reserved keys are rejected.

## AI review

MCP clients can present a design with `render_ui_web_demo`, then request **one cropped PNG per screen/popup** with `capture_ui_web_screens` and poll `inspect_ui_web_demo`. Captures go to `Builds/UIStudioReview/<requestId>/`. These actions never save documents or scenes. See [MCP Bridge](mcp-bridge.md).

---
[Next: VinaGenText](vinagen-text.md)
