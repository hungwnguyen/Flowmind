# UI Designer

Build screens, popups and UI components with editable layers. Export images/PSD for sharing, or turn the design into a Unity Canvas for your game.

## Open

Choose **Tools → VinaGen AI Toolkit → Editors → Open UI Designer**, or double-click a `VinaGenUIDocument` asset.

![UI Designer with the bundled sample](images/ui-designer.png)

## Build a screen

1. Choose **New screen**, or import a PSD, JSON or images.
2. Use **Root tools → Screen root** for the main screen; create a separate root for each popup.
3. Add images, text, buttons and groups. Arrange them in **Layers**.
4. Adjust geometry, colors, fonts, components and anchors in the Inspector.
5. **Save** stores the document; **Export** downloads a file; **Canvas** creates Unity scene objects.

The saved document's width and height control Canvas import and Game View. Settings supply defaults for new documents.

## Workspace and layers

| Area | Purpose |
| --- | --- |
| **Files** | Create/open documents and find project files. |
| **Layers** | Select, rename, reorder, reparent, hide/lock and collapse the hierarchy. |
| **Assets** | Browse Unity images and drag them onto the canvas. |
| **Inspector** | Edit geometry, layout, paint, images, text and Unity properties. |
| **Bottom toolbar** | Move, Hand, Scale, Empty/Screen root, shapes, Image, Text and Comment. |

Select one object before drawing/dropping an image to create its child. Clear the selection to create a top-level layer. Use **Add Component** for object behavior; Image/Button/Text/Group roles have `Alt+2–5` shortcuts.

| Layer / component | Unity result |
| --- | --- |
| **Empty / ordinary Group** | A non-visual `RectTransform` container. |
| **Image** | `Image`; editable shapes with fill/stroke use `VinaGenUIShape`. |
| **Button** | Image + Button from the configured Button prefab. Add a Text child for a caption. |
| **Text** | Unity UI Text, TextMeshProUGUI or VinaGenText, based on Text type. |
| **Canvas Group** | `CanvasGroup`: opacity, Interactable, Blocks raycasts, Ignore parent groups. |
| **Horizontal / Vertical / Grid** | The corresponding LayoutGroup with spacing, padding and child sizes. Grid has columns and cell dimensions. |

![Files tab with the bundled UI sample](images/ui-files.png)

![Assets tab: choose a folder before browsing images](images/ui-assets.png)

Select a sample in **Files** to open it. In **Assets**, click **Choose folder…**, pick a project image folder, then search and drag images onto the canvas. An empty Assets panel before selecting a folder is expected. [Demos](demos.md) walks through the three-screen sample.

## Select and edit several objects

- **Ctrl/Cmd-click** adds/removes individual layers; **Shift-click** selects a range in Layers. You can also drag a marquee on the canvas.
- Align, distribute, group, duplicate, copy/paste and reorder through tools or the context menu. Paste targets the selected parent; Duplicate keeps the existing parent.
- **Move** snaps edges, centers and equal spacing. `Alt-drag` bypasses snapping; `Shift-drag` constrains movement to one axis.
- Drag edges/corners to resize; hold `Shift` for proportions. **Scale** (`K`) resizes the hierarchy, font sizes and strokes together.
- **Selection colors** updates matching colors in the selection and its descendants together.

## Images, shapes and 9-slice

Drop local PNG/JPEG files or drag project images from **Assets**. **Choose project image / Replace image** assigns artwork; **Reset to image size** restores its original dimensions.

| Image mode | Result |
| --- | --- |
| **Preserve Aspect** | Fit the image inside its rectangle, keeping its ratio. |
| **None** | Stretch the image to fill the rectangle. |
| **9-slice** | Keep corners/borders while stretching the center; useful for panels and button backgrounds. |

9-slice detects repeated pixel bands on both axes. Save/Canvas import minimizes each standalone PNG/JPEG source once, keeping its path and GUID; Unity uses **Image.Type.Sliced** with Sprite borders. This optimization does not apply to atlas/multiple-sprite sources.

**Rectangle, Line, Arrow, Ellipse, Polygon and Star** retain editable geometry. **Fill** supports Solid, Linear and Radial paint, alpha and 2–8 gradient stops; **Stroke** sets border color/width. Clip limits children overflowing their container.

## Fusion images

Use Fusion to combine artwork into one image while keeping text editable.

1. Select an **Image, Button or Group/Empty container** with child images.
2. Click **Fusion images** in **Image**.
3. Wait for the combined PNG to be saved in the project and assigned to the selected object.

Fusion combines visible artwork, including paint, transforms, clipping and opacity. **Text is excluded**; text, hidden artwork and necessary containers remain. Fused image nodes are removed while the positions of retained text stay intact.

Unchanged artwork reuses the cache; changed artwork updates its owned Fusion PNG while retaining its GUID. **Undo** restores the layer hierarchy; the generated PNG remains in the project, and document Undo does not rewind overwritten file pixels. **Save** the document after Fusion.

Text layers and locked hierarchies cannot be fused. A new fusion needs visible child images; previous results can be reused from cache. PNG upload to Unity has a **5 MB** limit. Failed Fusion retains the original layers.

## Text and fonts

**Typography → Text type** offers **Text**, **TextMesh Pro** and **VinaGenText**. Use [VinaGenText](vinagen-text.md) for gradients, borders, extrusion and static text baking.

Text supports horizontal/vertical alignment, wrapping, auto size, spacing, margins and renderer-supported rich text. **Text on path / Curve angle** bends text. TMP offers font/material presets and shader controls; VinaGenText offers reusable styles and effects.

Register fonts in **Settings → UI Designer Settings**. **Editors → Create UI Designer TMP starter fonts** creates starter fonts under `VinaTextPro/Fonts/TextMeshPro/`. Layer material overrides preserve source presets; changing **Text type** requires Canvas re-import.

## PSD import

Import runs locally with progress and Cancel. Supported: **8-bit RGB PSD**, pixel layers, groups, names, opacity, visibility and supported blend modes. Text with compatible metadata is restored as Text; unsupported content uses cached artwork and needs review.

For missing fonts, choose **PSD import → Default font**; matching project fonts retain priority. PSD files do not contain font files. Each import keeps its document, images and styles in `Assets/VinaGen PSD Imports/<PSD name>/`; keep private source/generated fonts with that import, outside bundled defaults and toolkit packaging.

Review masks, smart objects, blend modes and effects visually. PSB, CMYK and 16/32-bit PSDs are unsupported.

## Export PSD, SVGPRO, SVG and PNG

Open **Export** in the top bar; in a collapsed toolbar, use **More actions → Export**.

1. Select canvas/Layers objects when exporting part of the document.
2. Choose **Selected object / Selected objects** or **All objects** under **Content**.
3. Click **PSD**, **SVGPRO**, **SVG** or **PNG** in the dialog to download that format.

![Export dialog with PSD, SVGPRO, SVG and PNG](images/ui-export.png)

| Content | Scope |
| --- | --- |
| **Selected object** | One object and all descendants, in local coordinates without outside ancestors' pose/appearance. |
| **Selected objects** | Several objects and their descendants, retaining the arrangement between selected roots. Selecting both parent and child does not duplicate content. |
| **All objects** | The whole document. Default when nothing is selected; available even when a selection exists. |

For example, Ctrl/Cmd-click **Shop** and **Popup**, then use **Selected objects** to export them together. Choose **All objects** for the full board. For one file per screen, select and export each Screen root separately.

| Format | File contents |
| --- | --- |
| **PNG** | Visible content combined into one transparent image at the authored 1× size. |
| **SVG** | Browser layout with embedded images/fonts. Requires a `foreignObject`-compatible viewer; raster images and text previews are not converted into vector paths. |
| **SVGPRO** | Whole document with images, text styles and fonts; always exports the complete document. Drop into another Unity project's Assets to import. |
| **PSD** | One file with groups/layers, names, ordering, opacity, visibility and supported text metadata. Artwork includes raster paint; fonts are referenced, not embedded. |

PSD/SVG/PNG export does not save the document. SVGPRO saves unsaved edits first and exports the whole document package. PSD text is editable, but Photoshop may redraw text/effects differently; editing requires the corresponding fonts. All objects preserves the combined board arrangement; PNG/SVG includes visible overflow beyond the reference rectangle.

Export limits: **8,192 pixels per side and 16 megapixels total**. PSD also limits **1,000 layer records** including group dividers, **512 characters per label**, and **500 MB**. Repair missing font/image resources or wait for pending previews before retrying. Keep the document unchanged during export.

## Transfer to Unity Canvas

1. Check Text type, components, images and Screen roots; **Save** the document.
2. Select a target Canvas or its child in Unity. Without a selected Canvas, the tool creates a new **Screen Space Overlay Canvas**.
3. Select **Canvas** in the top **Unity UI system** dropdown, then click the import icon immediately beside it.
4. Inspect Hierarchy and Game View: dimensions, anchors, text and interaction.
5. Connect Button behavior to the game and **save the scene yourself**. For reuse, save the imported root as a prefab in Unity.

Alternatively, select the `VinaGenUIDocument` asset in Project, assign **Target Canvas** in its Inspector and click **Import to Canvas**.

The importer validates references before creating objects. Each import creates a new hierarchy in one **Undo** group; previous imports are not automatically synchronized or removed. Undo removes imported objects while generated resources remain reusable. CanvasScaler and the **VinaGen UI Designer** Game View preset use the document's width/height.

![Sample Canvas result in Unity Game View](images/ui-canvas-demo.png)

### Multiple screens and popups

Create **Root tools → Screen root**, or enable **Import as popup** on a container's context menu. Each root and its descendants become a separate screen directly under the Canvas, centered independently. Side-by-side design-board positions do not offset screens in Unity.

Full-screen roots use **Stretch–Stretch**; smaller popups use **Center**. Hidden roots import inactive. With Screen roots present, layers outside those roots are excluded; roots cannot nest. Without marked roots, screen-sized top-level containers are detected, or the whole document imports under one root.

### Anchors, layout and components

**Auto adjust anchors** in UI Designer Settings derives anchors from each layer's position in its parent. Disable it to retain manual anchors; screen-sized layers still use Stretch–Stretch.

**Horizontal / Vertical / Grid** create live Unity LayoutGroups. Legacy auto layout without a group type retains baked rectangles. **Canvas Group**, clipping, shapes, gradients and text curves become their corresponding components.

Buttons use **UI Designer Settings → Button prefab**; the default prefab has no text. A custom prefab can retain components, children, transitions and events; the layer provides name, geometry, artwork and Interactable.

### Text and color after import

Within the same browser session, text/style/typography edits update the most recently linked imported text objects. Re-import after changing renderer or hierarchy; edits do not save the scene.

In Linear projects, **VinaGenUIGammaCompositor** brings composition closer to the browser, with a render target/redraw cost per active screen. **Linear alpha → Compensate Alpha** in Settings uses compensated color/alpha with ordinary Canvas rendering. Unsupported custom/TMP materials produce a warning and fall back to ordinary rendering; check Game View on your pipeline.

## Transfer to Unity UI Toolkit

1. Stop Play Mode, close Prefab Mode and save the document.
2. Choose **UI Toolkit** in the top **Unity UI system** selector, then click the matching import button. The document Inspector also offers **Import to UI Toolkit** for the saved asset.
3. Inspect UXML in **UI Toolkit/** beside the document, and the scene **UIDocument** / **VinaGenUIToolkitScreenController**. Save the scene yourself.

Each import creates new assets/objects in one Undo group; previous imports are not synchronized. Only the first authored-visible screen starts visible. Use `ShowScreen(layerId)`, `FindLayer(layerId)` and `ButtonClicked` to connect game behavior. Text gradients/outlines/curves, shapes, blending and custom uGUI/TMP components have limits/fallbacks; read warnings and compare rendering. The Canvas screenshots above do not establish UI Toolkit parity.

## Save, settings and review

**Save / Ctrl+S / Cmd+S** writes the `VinaGenUIDocument`, retaining layers, components and asset references. **Show in Editor** selects it in Project; unsaved edits offer Save and open or Open and discard. JSON import retains UI data but still needs matching project images/fonts. Through [MCP Bridge](mcp-bridge.md), `read_ui_document` returns `document` data for a JSON copy.

Open **Settings → UI Designer Settings** for folders, fonts, Button prefab, default resolution, Auto adjust anchors, Linear alpha and shortcuts. **Comment** pins review notes without generating Canvas objects.

Assistants can use `render_ui_web_demo` and `capture_ui_web_screens` to capture each screen/popup separately. Review actions do not save documents or scenes.

[Next: VinaGenText](vinagen-text.md)
## Standalone web version

To design directly on the hosted website without Unity, use the new
[Web Designer tab](web-designer.md). It provides PSD import/export and a local
folder workspace. The Unity integration described below belongs to the toolkit.
