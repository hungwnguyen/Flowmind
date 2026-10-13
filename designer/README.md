# Flowmind Web Designer

Static browser application extracted from the VinaGen AI Toolkit browser UI
modules in `Assets/VinaGen AI Toolkit/Editor/WebGraph/`. The Flowmind-owned
adapter, filesystem/IndexedDB storage, ZIP codec and browser text renderer replace
the Unity bridge. `tools/sync-web-designer.py` records the extraction and removes
native editor controls; it is author tooling, not a deployment/build requirement.

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
