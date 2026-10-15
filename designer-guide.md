# UI Designer

Build screens, popups and components from editable layers. Choose **Online** to work on the web or **Offline** to work with your Unity project.

<nav class="vg-designer-nav" aria-label="UI Designer guide"><a href="#/designer-guide" aria-current="page">Overview</a><a href="#/web-designer">Online · Web</a><a href="#/ui-designer">Offline · Unity</a></nav>

The steps and icons below apply to both versions. Read them once, then choose **Online** to open the web app or **Offline** to connect your Unity project.

## Workspace

| Area | Purpose |
| --- | --- |
| **Files** | Create, open and find documents. |
| **Layers** | Select, rename, reorder, nest, hide and lock layers. |
| **Assets** | Browse images and drag them onto the canvas. |
| **Inspector** | Edit size, position, color, images and text for the selection. |
| **Bottom toolbar** | Move, Hand, Scale, roots, shapes, Image, Text and Comment. |

The top toolbar manages save/import/export; the toolbar below the canvas contains drawing tools. Hover over buttons to see their names. Files and Assets use each version’s own storage.

## Build your first screen

1. Create a document or use **Import** for PSD/images.
2. Use **Root tools → Screen root** for each screen/popup; use **Empty** for a container inside it.
3. Add shapes, Image, Text and Button layers, then arrange them in **Layers**.
4. Edit position, size, color and Typography in the **Inspector**.
5. **Save** your document; use **Export** to share it or continue with the Offline guide to transfer it into Unity.

Select a parent before adding to create a child; clear selection to add at the top level. Set document width/height in the Screen inspector.

## Recognize the shared buttons

The left icon uses **Light**, the right uses **Dark**. Shapes and SVG strokes come from the actual editor; selected tools have a white icon on blue. Save, Reload, Import, Export and Settings use these shared symbols. Workspace selection, Demo and Unity import controls are covered in the version guides.

<table class="vg-icon-table">
<thead><tr><th scope="col">Light / Dark</th><th scope="col">Button / Tool</th><th scope="col">How to use it</th></tr></thead>
<tbody>
<tr><td><img class="vg-editor-icon vg-editor-icon--small" src="images/web-designer/icons/reload-light.svg" alt="" width="28" height="28"><img class="vg-editor-icon vg-editor-icon--small" src="images/web-designer/icons/reload-dark.svg" alt="" width="28" height="28"></td><td><strong>Reload</strong></td><td>Reload the saved document.</td></tr>
<tr><td><img class="vg-editor-icon vg-editor-icon--small" src="images/web-designer/icons/save-light.svg" alt="" width="28" height="28"><img class="vg-editor-icon vg-editor-icon--small" src="images/web-designer/icons/save-dark.svg" alt="" width="28" height="28"></td><td><strong>Save · Ctrl/Cmd+S</strong></td><td>Save the current document. The destination depends on the version.</td></tr>
<tr><td><img class="vg-editor-icon vg-editor-icon--small" src="images/web-designer/icons/import-light.svg" alt="" width="28" height="28"><img class="vg-editor-icon vg-editor-icon--small" src="images/web-designer/icons/import-dark.svg" alt="" width="28" height="28"></td><td><strong>Import</strong></td><td>Down arrow: import PSD, SVGPRO or images.</td></tr>
<tr><td><img class="vg-editor-icon vg-editor-icon--small" src="images/web-designer/icons/export-light.svg" alt="" width="28" height="28"><img class="vg-editor-icon vg-editor-icon--small" src="images/web-designer/icons/export-dark.svg" alt="" width="28" height="28"></td><td><strong>Export</strong></td><td>Up arrow: choose a format to export.</td></tr>
<tr><td><img class="vg-editor-icon vg-editor-icon--small" src="images/web-designer/icons/settings-light.svg" alt="" width="28" height="28"><img class="vg-editor-icon vg-editor-icon--small" src="images/web-designer/icons/settings-dark.svg" alt="" width="28" height="28"></td><td><strong>Settings</strong></td><td>Gear: open appearance, snapping and comment settings.</td></tr>
</tbody>
</table>

## Canvas tools

<table class="vg-icon-table">
<thead><tr><th scope="col">Light / Dark</th><th scope="col">Button / Tool</th><th scope="col">How to use it</th></tr></thead>
<tbody>
<tr><td><img class="vg-editor-icon" src="images/web-designer/icons/cursor-light.svg" alt="" width="34" height="34"><img class="vg-editor-icon" src="images/web-designer/icons/cursor-dark.svg" alt="" width="34" height="34"></td><td><strong>Move</strong></td><td>Select and move layers.</td></tr>
<tr><td><img class="vg-editor-icon" src="images/web-designer/icons/hand-light.svg" alt="" width="34" height="34"><img class="vg-editor-icon" src="images/web-designer/icons/hand-dark.svg" alt="" width="34" height="34"></td><td><strong>Hand tool</strong></td><td>Drag to pan the canvas.</td></tr>
<tr><td><img class="vg-editor-icon" src="images/web-designer/icons/scale-light.svg" alt="" width="34" height="34"><img class="vg-editor-icon" src="images/web-designer/icons/scale-dark.svg" alt="" width="34" height="34"></td><td><strong>Scale</strong></td><td>Scale the selection.</td></tr>
<tr><td><img class="vg-editor-icon" src="images/web-designer/icons/frame-light.svg" alt="" width="34" height="34"><img class="vg-editor-icon" src="images/web-designer/icons/frame-dark.svg" alt="" width="34" height="34"></td><td><strong>Empty / Screen root</strong></td><td>Create a container or root screen. Choose from the adjacent menu.</td></tr>
<tr><td><img class="vg-editor-icon" src="images/web-designer/icons/rectangle-light.svg" alt="" width="34" height="34"><img class="vg-editor-icon" src="images/web-designer/icons/rectangle-dark.svg" alt="" width="34" height="34"></td><td><strong>Rectangle</strong></td><td>Draw a rectangle.</td></tr>
<tr><td><img class="vg-editor-icon" src="images/web-designer/icons/ellipse-light.svg" alt="" width="34" height="34"><img class="vg-editor-icon" src="images/web-designer/icons/ellipse-dark.svg" alt="" width="34" height="34"></td><td><strong>Ellipse</strong></td><td>Draw a circle or ellipse.</td></tr>
<tr><td><img class="vg-editor-icon" src="images/web-designer/icons/polygon-light.svg" alt="" width="34" height="34"><img class="vg-editor-icon" src="images/web-designer/icons/polygon-dark.svg" alt="" width="34" height="34"></td><td><strong>Polygon</strong></td><td>Draw a polygon; change its sides in the Inspector.</td></tr>
<tr><td><img class="vg-editor-icon" src="images/web-designer/icons/star-light.svg" alt="" width="34" height="34"><img class="vg-editor-icon" src="images/web-designer/icons/star-dark.svg" alt="" width="34" height="34"></td><td><strong>Star</strong></td><td>Draw a star; adjust its points and inner radius.</td></tr>
<tr><td><img class="vg-editor-icon" src="images/web-designer/icons/line-light.svg" alt="" width="34" height="34"><img class="vg-editor-icon" src="images/web-designer/icons/line-dark.svg" alt="" width="34" height="34"></td><td><strong>Line</strong></td><td>Draw a line.</td></tr>
<tr><td><img class="vg-editor-icon" src="images/web-designer/icons/arrow-light.svg" alt="" width="34" height="34"><img class="vg-editor-icon" src="images/web-designer/icons/arrow-dark.svg" alt="" width="34" height="34"></td><td><strong>Arrow</strong></td><td>Draw an arrow.</td></tr>
<tr><td><img class="vg-editor-icon" src="images/web-designer/icons/text-light.svg" alt="" width="34" height="34"><img class="vg-editor-icon" src="images/web-designer/icons/text-dark.svg" alt="" width="34" height="34"></td><td><strong>Text</strong></td><td>Add and edit text.</td></tr>
<tr><td><img class="vg-editor-icon" src="images/web-designer/icons/text-path-light.svg" alt="" width="34" height="34"><img class="vg-editor-icon" src="images/web-designer/icons/text-path-dark.svg" alt="" width="34" height="34"></td><td><strong>Text on path</strong></td><td>Choose from the Text menu for text along a curved path.</td></tr>
<tr><td><img class="vg-editor-icon" src="images/web-designer/icons/image-light.svg" alt="" width="34" height="34"><img class="vg-editor-icon" src="images/web-designer/icons/image-dark.svg" alt="" width="34" height="34"></td><td><strong>Image</strong></td><td>Add an image to the canvas.</td></tr>
<tr><td><img class="vg-editor-icon" src="images/web-designer/icons/button-light.svg" alt="" width="34" height="34"><img class="vg-editor-icon" src="images/web-designer/icons/button-dark.svg" alt="" width="34" height="34"></td><td><strong>Button</strong></td><td>Create a button layer.</td></tr>
<tr><td><img class="vg-editor-icon" src="images/web-designer/icons/comment-light.svg" alt="" width="34" height="34"><img class="vg-editor-icon" src="images/web-designer/icons/comment-dark.svg" alt="" width="34" height="34"></td><td><strong>Comment</strong></td><td>Pin a note on the canvas.</td></tr>
<tr><td><img class="vg-editor-icon" src="images/web-designer/icons/chevron-light.svg" alt="" width="34" height="34"><img class="vg-editor-icon" src="images/web-designer/icons/chevron-dark.svg" alt="" width="34" height="34"></td><td><strong>Menu ▾</strong></td><td>Click the small arrow beside Move, Empty, Shape or Text for more tools in that group.</td></tr>
<tr><td><img class="vg-editor-icon" src="images/web-designer/icons/selected-light.svg" alt="" width="34" height="34"><img class="vg-editor-icon" src="images/web-designer/icons/selected-dark.svg" alt="" width="34" height="34"></td><td><strong>Move — đang chọn / active</strong></td><td>White icon on blue: the selected tool. Move is selected in this example.</td></tr>
</tbody>
</table>

Small arrow menus expose tools in the same group. Shortcuts can differ with Unity configuration; see the reference below and button tooltips.

## Layers and selection

<table class="vg-icon-table">
<thead><tr><th scope="col">Light / Dark</th><th scope="col">Button / Tool</th><th scope="col">How to use it</th></tr></thead>
<tbody>
<tr><td><img class="vg-editor-icon" src="images/web-designer/icons/eye-light.svg" alt="" width="34" height="34"><img class="vg-editor-icon" src="images/web-designer/icons/eye-dark.svg" alt="" width="34" height="34"></td><td><strong>Hiện / Visible</strong></td><td>The layer is visible; click to hide it.</td></tr>
<tr><td><img class="vg-editor-icon" src="images/web-designer/icons/eyeOff-light.svg" alt="" width="34" height="34"><img class="vg-editor-icon" src="images/web-designer/icons/eyeOff-dark.svg" alt="" width="34" height="34"></td><td><strong>Ẩn / Hidden</strong></td><td>Crossed-out eye: the layer is hidden; click to show it.</td></tr>
<tr><td><img class="vg-editor-icon" src="images/web-designer/icons/lock-light.svg" alt="" width="34" height="34"><img class="vg-editor-icon" src="images/web-designer/icons/lock-dark.svg" alt="" width="34" height="34"></td><td><strong>Khóa / Locked</strong></td><td>The layer is locked; unlock it before editing.</td></tr>
<tr><td><img class="vg-editor-icon" src="images/web-designer/icons/unlock-light.svg" alt="" width="34" height="34"><img class="vg-editor-icon" src="images/web-designer/icons/unlock-dark.svg" alt="" width="34" height="34"></td><td><strong>Mở khóa / Unlocked</strong></td><td>The layer can be edited.</td></tr>
</tbody>
</table>

- **Ctrl/Cmd-click** to add to the selection, **Shift-click** for a range, or drag a box on the canvas.
- Align, group, duplicate, copy/paste and reorder from the toolbar or right-click menu.
- **Move** snaps to edges and centers. `Alt`-drag skips snapping; `Shift`-drag locks one axis.
- `Shift` while resizing keeps proportions. **Scale** (`K`) also scales fonts and strokes.
- **Selection colors** changes a color everywhere in the selection at once.

Drag layers to reorder or nest them; use the arrow beside a group to collapse it. Eye/lock controls appear on hover, focus or selection.

## Images, shapes and 9-slice

Drop PNG/JPEG files or drag images from **Assets**. **Reset to image size** restores the original size.

| Image mode | Result |
| --- | --- |
| **Preserve Aspect** | Fits inside the box, keeping its ratio. |
| **None** | Stretches to fill the box. |
| **9-slice** | Keeps corners sharp while stretching the middle — good for panels and buttons. |

9-slice borders are detected on both axes to preserve corners when resizing.

Shapes (Rectangle, Line, Arrow, Ellipse, Polygon, Star) stay editable. **Fill** supports solid and gradient colors; **Stroke** sets the border. **Clip** hides children outside their parent.

## Groups and layout

Use **Group**, **Horizontal**, **Vertical** or **Grid** to organize elements. Set gap/padding and columns in the Inspector. Enable **Clip** to hide children outside the container. Screen roots separate independent screens in one document; their Unity mapping is in the Offline guide.

## Fusion images

1. Select an Image, Button or Group with visible child artwork.
2. In Inspector → **Image**, click **Fusion images**.
3. Check the merged image, then **Save** the document.

Text layers and hidden content are retained. Unlock the object and its children before Fusion. Undo restores the layer structure. The resulting PNG is limited to **5 MB**. Storage and source-image updates depend on the Online/Offline version.

## Text and effects

In **Typography**, edit content, font, size, alignment, spacing, wrapping and auto size. **Text on path** bends text along a curve. Text effects include gradients, strokes, outlines and extrusion; check the selected font and text type before editing.

Font import/registration, Text type and TMP materials differ between versions — see Online or Offline.

![Typography and text effects](images/web-designer/inspector.png)

## PSD import

Click **Import** or drop a PSD onto the canvas. Empty documents import directly; when objects already exist, choose **Replace** to replace the document or **Insert** to add the PSD beside it. Import can be cancelled.

- Supports **8-bit RGB PSD**: layers, folders, names, stacking order, visibility, opacity and common blend modes.
- Text becomes editable when text metadata is available; smart objects and pixel-only content remain images. Some effects are baked or approximated.
- PSD stores font names, not font files. Missing fonts use a fallback and show a warning; font setup is explained in each version's guide.
- **PSB, CMYK, 16/32-bit** are unsupported. Inspect masks, effects and text before sharing.
- Large files depend on available device memory and storage; the export limits below are not source PSD dimension limits. Documents support **1,000 objects**, including large-image tiles.

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
| **SVGPRO** | The whole document with images, fonts and styles; use it to continue later or move devices. |
| **PSD** | Layers, groups and editable text. Fonts are not embedded. |

**SVGPRO always exports the whole document**, even when an object is selected.

To get one file per screen, select and export each Screen root separately.

Limits: **8,192 px per side, 16 megapixels**. PSD: up to **1,000 layer records** (including folder dividers) and **500 MB**. Don't edit the document while exporting.

## Comments and appearance

Choose **Comment** and click the canvas to pin a note. Notes are saved with the document for review and do not become Unity objects.

**Settings** offers Light/Dark/System, canvas background, contrast, snapping and a comment display name. These change the editor appearance; design dimensions belong in the Screen inspector. Preference storage is explained in each version guide.

## Shared shortcuts

`Ctrl/Cmd` means Ctrl on Windows and Cmd on macOS. These shared defaults can be changed in Unity UI Designer Settings.

| Key | Action |
| --- | --- |
| V / H / T / B | Move / Hand / Text / Button |
| K / C | Scale / Comment |
| Shift+1 | Fit all |
| Space + drag | Pan |
| Ctrl/Cmd + wheel | Zoom |
| Ctrl/Cmd+S | Save |
| Ctrl/Cmd+Z / Ctrl/Cmd+Shift+Z | Undo / Redo |
| Ctrl/Cmd+D / Ctrl/Cmd+G | Duplicate / Group |
| Ctrl/Cmd-click / Shift-click | Add to selection / select a range |
| Delete / Backspace | Delete selection |

**R differs in the default configurations**: Online selects Rectangle, Unity selects Image. Version-specific keys are below; current tooltips and settings take precedence.

## Choose your version

[Online · Web Designer](web-designer.md): open the web app, choose a workspace, import fonts and save local files.

[Offline · Unity](ui-designer.md): open from Unity, save assets, register fonts and import Canvas/UI Toolkit.

| Choose by your needs | Online | Offline |
| --- | --- | --- |
| Design UI, import PSD, export images | Yes | Yes |
| Unity and toolkit installation required | No | Yes |
| Document storage | Local `.svgpro` file | Unity project asset |
| Canvas / UI Toolkit import | — | Yes |
| Unity TMP fonts and MCP integration | — | Yes |
