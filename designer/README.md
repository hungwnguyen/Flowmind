# Flowmind Web Designer

Static browser application extracted from the VinaGen AI Toolkit browser UI
modules in `Assets/VinaGen AI Toolkit/Editor/WebGraph/`. The Flowmind-owned
adapter, filesystem/IndexedDB storage, ZIP codec and browser text renderer replace
the Unity bridge. `tools/sync-web-designer.py` records the extraction and removes
native editor controls; it is author tooling, not a deployment/build requirement.
`designer/` contains generated production files. Editable modules, styles and
entry HTML live in `tools/designer-source/`; run the build after editing them.

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
python tools/build_site.py --skip-install
```

Add `--check --live-url http://127.0.0.1:8888/graph-editor/` to verify without
writing: all 39 extracted modules/styles must match the running Unity sources
after the standalone adaptations. Live UI inspection on 17 October confirmed
the shared design tools, layer Inspector, text effects and export choices.
Unity anchors/Canvas Group, TMP materials, native imports and project storage
remain Unity-specific; browser text uses Canvas font metrics and can differ
from native glyph layout. This is functional parity, not pixel identity.

Run the smoke, PSD, image-component and reload checks after syncing. Author
browser tests now use `/tools/designer-source/` on the local server; the
production regression exercises both `/designer/` and the `dist/` artifact.
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

## Production build and source protection

Run `python tools/build_site.py` from the repository root (Python 3 and Node.js
22+ required). The Python author tool installs locked build dependencies with
`npm ci` and invokes `tools/build-site.mjs`. For subsequent local builds with
dependencies already installed, use `python tools/build_site.py --skip-install`.
Editable source is in `tools/designer-source/`. Every build writes the generated
site to `dist/` and applies the same protected files directly to `designer/`,
updating `index.html` to hashed scripts and removing obsolete module paths.
Do not edit generated scripts/CSS in `designer/`; a rebuild replaces them.
`tools/designer-source/` is ignored by Git and stays local. Commit the generated
`designer/` files after rebuilding. Keep a separate private backup of the source.

The build bundles/minifies JavaScript, renames internal identifiers, removes
comments and emits hashed entry/chunk names without source maps. PSD workers
are built separately, lazy imports stay lazy and font/CSS paths are preserved.
It does not rename document properties or add runtime decryption, anti-debug
loops, keyboard interception or DevTools detection. Browser code can always be
inspected; this makes casual source copying harder, not secret. Keep private
logic/keys on a server and restrict repository access if source must be private.

For the existing Render static site `vinagen`, set **Build Command** to
`python3 tools/build_site.py --prebuilt` and **Publish Directory** to `dist` (repository
root unchanged). `render.yaml` records these settings and conservative headers;
Dashboard-managed sites must have their settings updated explicitly. Do not
create a second service or publish the repository root or `designer/` directly.
Do not add a catch-all rewrite for missing module/source paths.
The `--prebuilt` option packages the committed protected files without reading
author source. Without local source, the build also uses this mode automatically.

The public entry remains `https://vinagen.onrender.com/designer/`. The build
copies the docs, translations, assets and playground, but excludes original
Designer modules, author tools, tests, package metadata and build reports.
Only publish `dist/`; both Python and JavaScript build tools stay outside it.
After deployment, `/designer/app.mjs`, `/designer/ui-studio.mjs`,
`/designer/psd-worker.mjs`, `/tools/designer-source/app.mjs`, `/tools/build_site.py` and source-map URLs should
return 404. A local build alone does not protect an unchanged live deployment.

Run `npm run test:production` after building to compare editable source, the
applied `designer/` route and `dist/` through real browser controls. It checks
that original module paths are absent and exported PNGs match the source.
Use HTTPS and JavaScript MIME types for `.mjs`. No server API, runtime CDN,
cloud storage, login, provider key or runtime npm install is needed.

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
