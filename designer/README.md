# Flowmind Web Designer

Static browser application extracted from the VinaGen AI Toolkit browser UI
modules in `Assets/VinaGen AI Toolkit/Editor/WebGraph/`. The Flowmind-owned
adapter, filesystem/IndexedDB storage, ZIP codec and browser text renderer replace
the Unity bridge. `tools/sync-web-designer.py` records the extraction and removes
native editor controls; it is author tooling, not a deployment/build requirement.

Synced against VinaGen commit `9bd3c984b` (17 October 2026), including the
`55a4067ac` MCP/UI update. Shared modules include fused PSD effect atlases,
editable text/color runs, independent text shadows, blend-preserving Fusion,
PSD job scheduling and reusable workers. The standalone text painter implements
shadow and UTF-16 color runs locally; source PNGs already live in workspace
storage, so Unity upload batches/source-cache endpoints are removed on extraction.
Live MCP browser context and Unity asset patches belong to the Unity-hosted
editor; this static application does not expose a local MCP server.

Refresh shared modules with:

```sh
python -B tools/sync-web-designer.py --source "<toolkit Editor/WebGraph>"
```

Add `--check --live-url http://127.0.0.1:8888/graph-editor/` to verify without
writing: all 39 extracted modules/styles must match the running Unity sources
after the standalone adaptations. Live UI inspection on 17 October confirmed
the shared design tools, layer Inspector, text effects and export choices.
Unity anchors/Canvas Group, TMP materials, native imports and project storage
remain Unity-specific; browser text uses Canvas font metrics and can differ
from native glyph layout. This is functional parity, not pixel identity.

Run the smoke, PSD, image-component and reload checks after syncing.
`node tests/designer-latest.cjs` checks text shadows/UTF-16 color runs, editable
PSD text import, exact atlas blend pixels, portable resources and Fusion/cache.
The extraction also keeps zero-rotation roots at `transform:none` during export
so pass-through atlas paints retain their backdrop and stacking order.

`icons.mjs` reuses the local editor's SVG paths. Refresh them with the author-only
`tools/sync-designer-icons.py --source <toolkit Editor/WebGraph>` command. Keep
`workspace-controls.css` linked for the split tool buttons, popovers and asset grid.

The bilingual UI Designer Overview and Online guide use real SVG button samples in
`images/web-designer/icons/`. With a local server running on port 3000, refresh
both light/dark samples after editor icon or theme changes using
`node tools/sync-designer-guide-icons.cjs`. This author tool reads the editor's
rendered SVG paths, computed colors, backgrounds and dimensions; no icon font
or manually redrawn symbol is used in the guide.

Publish this folder with the existing Flowmind repository on Render. Entry point:
`https://vinagen.onrender.com/designer/`. Use HTTPS, JavaScript MIME types for
`.mjs` and preserve relative module paths. No server API, external runtime CDN,
cloud storage, login, provider key or npm install is needed by the application.

The user's folder permission is browser-managed. Directory handles are remembered
in IndexedDB but access is rechecked on startup. Unsupported browsers use file
input and download mode. Browser data can be cleared/evicted: `.svgpro` packages
are the durable backup. PSD plan/paint caches are disposable.

Manual verification still needed: the operating-system directory picker,
Safari/Firefox behavior and fidelity in Photoshop itself. Automated author tests
cover actual Chromium exports/import workers, OPFS folder handles, revision
conflicts, paths, drafts, resources and desktop/mobile layouts.

Inter and its font license are in `fonts/Inter.ttf` and `fonts/Inter-OFL.txt`.
Private PSD examples and their source fonts are never shipped in this folder.

9-slice detects both axes from original PNG RGBA samples, including faint alpha
edges. `ui-slice-source.mjs` decodes PNG with the browser's DecompressionStream;
Canvas readback would quantize faint colors and miss repeated pixel bands.
Legacy cached zero borders are analyzed again when the image is rendered.
Run the author regression with `node tests/designer-slice.cjs` (Playwright and
pngjs are test dependencies only). An optional image-folder argument checks local
artwork against original RGBA without copying those images into the repository.
