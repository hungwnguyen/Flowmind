# Web Designer — design online

<p><span class="vg-free-badge">Free forever</span></p>

Design UI right in your browser. Your files stay on your device. No Unity, account or AI provider needed.

<p><a href="designer/" target="_blank" rel="noopener" class="vg-btn">Open Web Designer ↗</a></p>

![The standalone editor after importing a PSD](images/web-designer/workspace.png)

## Start with a workspace

1. Open the editor. In Chrome or Edge on desktop, click **Choose folder** and allow access to your design folder.
2. **Files** lists your `.svgpro` documents; **Assets** shows your images.
3. Create a screen, import a PSD or open a `.svgpro`. **Save** writes the `.svgpro` into your folder (e.g. `Documents/Login.svgpro`).
4. Next time, click **Reconnect folder** if the browser asks for permission again.

![The selected folder workspace after saving the demo](images/web-designer/folder.png)

**Browser doesn't support folders?** Use **Import** to open files. **Save** then downloads the `.svgpro` instead — move it into your folder yourself.

Good to know:

- The editor can only access the folder you chose.
- If another app changed the file, the editor won't overwrite it — reload or save with a new name.
- Drafts are also kept in the browser, but only as a backup. Export before clearing browser data or switching devices.

## Work online across devices

Keep your workspace in the cloud with a sync app:

1. Install [Google Drive](https://www.google.com/drive/download/), [OneDrive](https://www.microsoft.com/microsoft-365/onedrive/download) or [Dropbox](https://www.dropbox.com/install) for desktop and sign in.
2. Create your design folder inside the synced folder, e.g. `Google Drive/My Drive/Designs`.
3. In Web Designer, **Choose folder** and pick it. Every **Save** is uploaded automatically.
4. On another computer, install the same app, wait for sync, then choose the same folder.

**Note:** Mark the folder **Always keep on this device** so the browser can read it. Don't edit the same file on two devices at once.

## Design tools

Click **Demo** to open a sample screen. Change the title's font or a color, then export a PNG or PSD.

| Area | What you can do |
| --- | --- |
| Files / Layers / Assets | Open documents; reorder, nest, rename, lock and hide layers; browse images |
| Canvas | Move, zoom, resize, rotate, align, snap, Undo/Redo |
| Shapes | Rectangle, ellipse, polygon, star, line, arrow; solid and gradient fills |
| Text | Fonts, sizes, alignment, curved text, gradient/outline/extrusion effects |
| Layout | Groups, horizontal/vertical/grid layout, clipping |
| Images | PNG/JPEG, 9-slice, Fusion |
| Comments | Pinned notes saved with the document |

To use your own font, **Import** a TTF, OTF, WOFF or WOFF2 file and pick it in Typography.

![Typography and editable text effects](images/web-designer/inspector.png)

Shortcuts: **V** Move, **H** Hand, **T** Text, **R** Rectangle, **O** Ellipse, **K** Scale, **Shift+1** Fit, **Ctrl/Cmd+S** Save, **Ctrl/Cmd+Z** Undo, **Ctrl/Cmd+Shift+Z** Redo, **Ctrl/Cmd+D** Duplicate. Right-click a layer for more actions. A large screen works best.

## Images

1. In **Assets**, click **Add images...** and pick PNG/JPEG files (several at once is fine).
2. Click or drag a thumbnail onto the canvas. To swap an image, use **Replace image from files** in the Inspector.
3. Identical images are shared automatically: change one (tint, gradient, mode) and every copy updates. Position and size stay separate.

![Assets gallery and the shared image component in the inspector](images/web-designer/assets.png)

## PSD import and export

**Import → choose a PSD → Replace or Insert.** *Replace* swaps the current document; *Insert* adds the PSD beside it. You can cancel at any time.

- Supported: 8-bit RGB PSD. Large files work (a 575 MB PSD was tested), limited by your computer's memory.
- Not supported: PSB, CMYK, 16/32-bit.
- Layers, groups, visibility, opacity and common blend modes are kept. Smart objects and complex effects become images.
- PSDs don't include fonts — import matching fonts yourself. Missing fonts show a warning.
- Check the result before sharing: text and effects may look slightly different from Photoshop.

![Export options in the standalone editor](images/web-designer/export.png)

| Format | Use it for |
| --- | --- |
| SVGPRO | The editable document with images and fonts. Use it to continue later or move devices. |
| PSD | Photoshop layers with editable text. |
| PNG | One flat image with a transparent background. |
| SVG | A browser-viewable image. Text is not converted to outlines. |

**Export SVGPRO** works even when folder access has expired, so you never lose unsaved work.

## Settings

![Theme, snap and comment author settings](images/web-designer/settings.png)

**Settings** controls theme (Light/Dark/System), canvas background, contrast, grid snapping and your comment name. Changes apply instantly and are saved in this browser. Canvas size is set in the Screen inspector.

## Web Designer vs. the Unity toolkit

Web Designer is a standalone app. Unity features (Canvas import, UI Toolkit, TMP materials, MCP) are only in the Unity [UI Designer](ui-designer.md). For particle effects, see [Web Particle: AI testing](webgl-preview.md).

## Hosting

`designer/` is a static folder — host it anywhere alongside these docs. Requirements: serve `.mjs` as JavaScript and use HTTPS (needed for folder access). No server or npm install.

Tested in desktop Chrome/Edge. Safari and Firefox are not verified — use **Import** and download-save there.
