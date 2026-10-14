# UI Designer

Build screens, popups and UI components from editable layers. Export them as PSD/PNG, or turn them into a Unity Canvas.

> No Unity? Use the free [Web Designer](web-designer.md) in your browser.

## Open

Choose **Tools → VinaGen AI Toolkit → Editors → Open UI Designer**, or double-click a `VinaGenUIDocument` asset.

![UI Designer with the bundled sample](images/ui-designer.png)

## Build a screen

1. Choose **New screen**, or import a PSD, JSON or images.
2. Add a **Screen root** (**Root tools**) for each screen or popup.
3. Add images, text, buttons and groups; arrange them in **Layers**.
4. Edit size, color, font, components and anchors in the **Inspector**.
5. **Save** the document, **Export** a file, or click **Canvas** to build it in Unity.

The document's width and height set the Canvas and Game View size.

## Workspace

| Area | Purpose |
| --- | --- |
| **Files** | Create, open and find documents. |
| **Layers** | Select, rename, reorder, nest, hide and lock layers. |
| **Assets** | Browse project images and drag them onto the canvas. |
| **Inspector** | Edit layout, colors, images, text and Unity properties. |
| **Bottom toolbar** | Move, Hand, Scale, roots, shapes, Image, Text and Comment. |

Select an object before adding something to make it a child; clear the selection to add at the top level. **Add Component** sets the role (Image/Button/Text/Group: `Alt+2–5`).

| Layer | Becomes in Unity |
| --- | --- |
| **Empty / Group** | An empty `RectTransform`. |
| **Image** | `Image` (shapes use `VinaGenUIShape`). |
| **Button** | Image + Button from your Button prefab. Add a Text child for a label. |
| **Text** | Text, TextMeshPro or VinaGenText, based on **Text type**. |
| **Canvas Group** | `CanvasGroup` (opacity, interactable, raycasts). |
| **Horizontal / Vertical / Grid** | The matching LayoutGroup. |

![Files tab with the bundled UI sample](images/ui-files.png)

![Assets tab: choose a folder before browsing images](images/ui-assets.png)

In **Assets**, click **Choose folder…** first — the panel is empty until you do. [Demos](demos.md) walks through the three-screen sample.

## Editing tips

- **Ctrl/Cmd-click** to add to the selection, **Shift-click** for a range, or drag a box on the canvas.
- Align, group, duplicate, copy/paste and reorder from the toolbar or right-click menu.
- **Move** snaps to edges and centers. `Alt`-drag skips snapping; `Shift`-drag locks one axis.
- `Shift` while resizing keeps proportions. **Scale** (`K`) also scales fonts and strokes.
- **Selection colors** changes a color everywhere in the selection at once.

## Images, shapes and 9-slice

Drop PNG/JPEG files or drag images from **Assets**. **Reset to image size** restores the original size.

| Image mode | Result |
| --- | --- |
| **Preserve Aspect** | Fits inside the box, keeping its ratio. |
| **None** | Stretches to fill the box. |
| **9-slice** | Keeps corners sharp while stretching the middle — good for panels and buttons. |

9-slice borders are detected automatically and become a Sliced Sprite in Unity.

Shapes (Rectangle, Line, Arrow, Ellipse, Polygon, Star) stay editable. **Fill** supports solid and gradient colors; **Stroke** sets the border. **Clip** hides children outside their parent.

## Fusion images

Merge many images into one PNG while text stays editable.

1. Select an Image, Button or Group that has child images.
2. Click **Fusion images** in the **Image** section.
3. The merged PNG is saved to the project and assigned to the object. **Save** the document.

Text, hidden layers and locked layers are not merged. Undo restores the layers, but the PNG file stays in the project. PNG size limit: **5 MB**.

## Text and fonts

**Typography → Text type** offers **Text**, **TextMesh Pro** and **VinaGenText**. Use [VinaGenText](vinagen-text.md) for gradients, outlines and baked text.

Text supports alignment, wrapping, auto size, spacing and curved text (**Text on path**).

Register fonts in **Settings → UI Designer Settings**. **Editors → Create UI Designer TMP starter fonts** creates ready-to-use TMP fonts. After changing **Text type**, import to Canvas again.

## PSD import

Supports **8-bit RGB PSD**: layers, groups, names, opacity, visibility and common blend modes. Text layers come back as editable text when possible; anything else becomes an image.

- PSDs don't contain fonts. Set **PSD import → Default font** for missing ones.
- Each import is saved in `Assets/VinaGen PSD Imports/<PSD name>/`.
- Not supported: PSB, CMYK, 16/32-bit. Check masks, smart objects and effects by eye.

## Export PSD, SVGPRO, SVG and PNG

1. Optionally select the objects you want to export.
2. Click **Export** (or **More actions → Export**).
3. Under **Content**, choose **Selected object(s)** or **All objects**.
4. Click **PSD**, **SVGPRO**, **SVG** or **PNG**.

![Export dialog with PSD, SVGPRO, SVG and PNG](images/ui-export.png)

| Format | What you get |
| --- | --- |
| **PNG** | One transparent image at 1× size. |
| **SVG** | A browser-viewable file with images and fonts embedded. |
| **SVGPRO** | The whole document with images and fonts. Drop it into another Unity project to import. |
| **PSD** | Layers, groups and editable text. Fonts are not embedded. |

To get one file per screen, select and export each Screen root separately.

Limits: **8,192 px per side, 16 megapixels**. PSD: up to **1,000 layers** and **500 MB**. Don't edit the document while exporting.

## Transfer to Unity Canvas

1. **Save** the document.
2. In Unity, select a Canvas (or nothing — a new Canvas will be created).
3. Choose **Canvas** in the **Unity UI system** dropdown and click the import icon next to it.
4. Check the result in Hierarchy and Game View.
5. Hook up your buttons and **save the scene**. Save the root as a prefab to reuse it.

You can also select the `VinaGenUIDocument` asset, set **Target Canvas** in the Inspector and click **Import to Canvas**.

Each import creates a new copy (one Undo step). Old imports are not updated or removed.

![Sample Canvas result in Unity Game View](images/ui-canvas-demo.png)

### Screens and popups

Each **Screen root** (or container marked **Import as popup**) becomes its own screen under the Canvas, centered. Full-screen roots stretch; smaller popups are centered. Hidden roots import as inactive. Layers outside any root are skipped.

### Anchors, layouts and buttons

- **Auto adjust anchors** (UI Designer Settings) sets anchors from each layer's position. Turn it off to keep your own.
- **Horizontal / Vertical / Grid** become working Unity LayoutGroups.
- Buttons are built from **UI Designer Settings → Button prefab**.

### Colors in Linear projects

If colors look different from the browser in a Linear-color project, use **VinaGenUIGammaCompositor**, or **Linear alpha → Compensate Alpha** in Settings. Always check Game View.

## Transfer to Unity UI Toolkit

1. Exit Play Mode and Prefab Mode; save the document.
2. Choose **UI Toolkit** in the **Unity UI system** dropdown and click import.
3. Check the UXML in the **UI Toolkit/** folder and the **UIDocument** in the scene. Save the scene.

Use `ShowScreen(layerId)`, `FindLayer(layerId)` and `ButtonClicked` to connect your game. Some text effects, shapes and custom components aren't fully supported — read the warnings and compare the result.

## Save and settings

**Save** (`Ctrl/Cmd+S`) stores the `VinaGenUIDocument`. **Show in Editor** selects it in the Project window.

**Settings → UI Designer Settings** holds folders, fonts, Button prefab, default resolution, anchors and shortcuts. **Comment** adds review notes that don't appear in Unity.

AI assistants can capture screenshots of each screen through [MCP Bridge](mcp-bridge.md).

[Next: VinaGenText](vinagen-text.md)
