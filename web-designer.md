# Web Designer — Online

<p><span class="vg-free-badge">Free forever</span></p>

Design UI right in your browser. Your files stay on your device. No Unity, account or AI provider needed.

<nav class="vg-designer-nav" aria-label="UI Designer guide"><a href="#/designer-guide">Overview</a><a href="#/web-designer" aria-current="page">Online · Web</a><a href="#/ui-designer">Offline · Unity</a></nav>

<div class="vg-designer-launch"><div><strong>Start designing on the web</strong><p>Read the steps below, then open the editor to practise. No installation needed.</p></div><a href="designer/" target="_blank" rel="noopener" class="vg-designer-open">Open Web Designer ↗</a></div>

![The standalone editor after importing a PSD](images/web-designer/workspace.png)

Icons, Layers, drawing tools, images/9-slice, Fusion, text, PSD and Export are shared: see [Overview](designer-guide.md). This page covers web-specific steps.

## Online-only buttons

<table class="vg-icon-table">
<thead><tr><th scope="col">Light / Dark</th><th scope="col">Button / Tool</th><th scope="col">How to use it</th></tr></thead>
<tbody>
<tr><td><img class="vg-editor-icon vg-editor-icon--small" src="images/web-designer/icons/folder-light.svg" alt="" width="28" height="28"><img class="vg-editor-icon vg-editor-icon--small" src="images/web-designer/icons/folder-dark.svg" alt="" width="28" height="28"></td><td><strong>Choose folder / Files</strong></td><td>Choose your workspace folder or browse documents.</td></tr>
<tr><td><img class="vg-editor-icon vg-editor-icon--small" src="images/web-designer/icons/demo-light.svg" alt="" width="28" height="28"><img class="vg-editor-icon vg-editor-icon--small" src="images/web-designer/icons/demo-dark.svg" alt="" width="28" height="28"></td><td><strong>Demo</strong></td><td>Open the sample design to practise.</td></tr>
</tbody>
</table>

Click **Demo** for a practice document, then follow the [shared editing guide](designer-guide.md).

## Start with a workspace

1. Open the editor. In Chrome or Edge on desktop, click <img class="vg-editor-icon vg-editor-icon--small" src="images/web-designer/icons/folder-dark.svg" alt="" width="28" height="28"> **Choose folder** and allow access to your design folder.
2. **Files** lists your `.svgpro` documents; **Assets** shows your images.
3. Create a screen, import a PSD or open a `.svgpro`. <img class="vg-editor-icon vg-editor-icon--small" src="images/web-designer/icons/save-dark.svg" alt="" width="28" height="28"> **Save** writes the `.svgpro` into your folder (e.g. `Documents/Login.svgpro`).
4. Next time, click **Reconnect folder** if the browser asks for permission again.

![The selected folder workspace after saving the demo](images/web-designer/folder.png)

**Browser doesn't support folders?** Use <img class="vg-editor-icon vg-editor-icon--small" src="images/web-designer/icons/import-dark.svg" alt="" width="28" height="28"> **Import** to open files. <img class="vg-editor-icon vg-editor-icon--small" src="images/web-designer/icons/save-dark.svg" alt="" width="28" height="28"> **Save** then downloads the `.svgpro` instead — move it into your folder yourself.

Good to know:

- The editor can only access the folder you chose.
- If another app changed the file, the editor won't overwrite it — reload or save with a new name.
- Drafts are also kept in the browser, but only as a backup. Export before clearing browser data or switching devices.

## Work online across devices

Keep your workspace in the cloud with a sync app:

1. Install [Google Drive](https://www.google.com/drive/download/), [OneDrive](https://www.microsoft.com/microsoft-365/onedrive/download) or [Dropbox](https://www.dropbox.com/install) for desktop and sign in.
2. Create your design folder inside the synced folder, e.g. `Google Drive/My Drive/Designs`.
3. In Web Designer, <img class="vg-editor-icon vg-editor-icon--small" src="images/web-designer/icons/folder-dark.svg" alt="" width="28" height="28"> **Choose folder** and pick it. Every <img class="vg-editor-icon vg-editor-icon--small" src="images/web-designer/icons/save-dark.svg" alt="" width="28" height="28"> **Save** is uploaded automatically.
4. On another computer, install the same app, wait for sync, then choose the same folder.

**Note:** Mark the folder **Always keep on this device** so the browser can read it. Don't edit the same file on two devices at once.

## Workspace images and fonts

In **Assets**, click **Add images...** for PNG/JPEG files; resources are managed within the workspace/document. Identical images are shared automatically: changing tint, gradients or mode updates shared copies; layer positions and sizes remain separate.

Use **Import** for TTF, OTF, WOFF or WOFF2, then select the font in Typography. The web app renders fonts and effects in the browser; Unity font registration and TMP materials are unavailable.

![Web workspace assets](images/web-designer/assets.png)

## Save and export a copy

**Save** writes `.svgpro` to the authorized folder, or downloads it in browser mode. **Export SVGPRO** downloads a portable copy without updating the workspace file — Save separately to update the current document. Export remains available after folder permission expires.

PSD import creates no Unity `Assets/` folder; images/fonts belong to the workspace/document package. Fusion and image optimization update the packaged copy; original loose image files are not overwritten.

## Preferences and version-specific keys

Appearance preferences and your comment name are stored in this browser and apply immediately. **R** selects Rectangle; **I** selects Image; **O** selects Ellipse; **L / Shift+L** select Line / Arrow.

![Web settings](images/web-designer/settings.png)

## Continue with Offline · Unity

Web Designer is a standalone app. Unity features (Canvas import, UI Toolkit, TMP materials, MCP) are only in the Unity [Offline · Unity](ui-designer.md). For particle effects, see [Web Particle: AI testing](webgl-preview.md).

## Hosting

`designer/` is a static folder — host it anywhere alongside these docs. Requirements: serve `.mjs` as JavaScript and use HTTPS (needed for folder access). No server or npm install.

Tested in desktop Chrome/Edge. Safari and Firefox are not verified — use <img class="vg-editor-icon vg-editor-icon--small" src="images/web-designer/icons/import-dark.svg" alt="" width="28" height="28"> **Import** and download-save there.
