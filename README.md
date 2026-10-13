# VinaGen AI Toolkit — Documentation

Source for the **VinaGen AI Toolkit** documentation website, a [Docsify](https://docsify.js.org/) site served as static files.

VinaGen AI Toolkit is a Unity Editor extension that combines flow/design graphs, a browser UI Designer with Canvas import, the VinaGenText styled-text renderer, native particle authoring with an offline texture library, a WebGL particle preview and a local MCP bridge for Claude Code, Codex and other assistants.

## Pages

The **Web Designer** tab opens the independent static application in `designer/`.
It retains browser design tools and PSD/SVGPRO/PNG/SVG workflows, and replaces
Unity storage with a user-selected local directory or browser recovery + downloads.
See [guide](web-designer.md) and [Vietnamese guide](vi/web-designer.md).
Deploy the folder alongside this site on its existing HTTPS host; no runtime build,
backend, npm installation or Unity process is required. `.mjs` must use a JavaScript
MIME type. All URLs are relative and support hosting under a project subpath.

Existing production host: `https://vinagen.onrender.com/` (Render).
The standalone route is `/designer/`, and its Vietnamese guide is `/#/vi/web-designer`.
Publish the same repository root and branch as the existing docs; no new service is needed.

Author checks: `node --test tests/designer-zip.test.mjs`, then
`node tests/designer-smoke.cjs` against the local site on port 3000.
Run `node tests/designer-docs.cjs` for both language routes and guide assets.
The browser test accepts `PLAYWRIGHT_MODULE` and `DESIGNER_URL`; Node/Playwright
are development dependencies only. Optional `tests/designer-fixture.cjs <path>`
verifies an existing private package without copying it into this repository.
Browser snapshots live in `images/web-designer/`.

| File | Topic |
| --- | --- |
| `introduction.md` | Overview, requirements and entry points (home page) |
| `getting-started.md` | Install, five toolkit tabs and first workflows |
| `demos.md` | Illustrated practice with UI, text, graphs and particles |
| `graphs.md` | Flow and design content graphs |
| `web-editor.md` | Browser Flow Editor |
| `ui-designer.md` | UI Designer, PSD import and Canvas import |
| `web-designer.md` | Standalone hosted designer, local folder workspace and PSD/SVGPRO workflows |
| `vinagen-text.md` | VinaGenText fonts, styles and gradients |
| `particles.md` | Texture library, authoring tools and effect construction |
| `webgl-preview.md` | AI Agent particle testing loop, timed evidence and browser controls |
| `ai-chat.md` | Agent Chat and AI providers |
| `create-from-chat.md` | `/vina` and `$vina` chat skills |
| `mcp-bridge.md` | Local MCP bridge |
| `settings.md` | Settings assets |
| `folder-layout.md` | Toolkit and project folders, portable export |
| `faq.md` | FAQ and troubleshooting |

Navigation lives in `_sidebar.md`, the footer in `_footer.md` and site configuration in `index.html`. The theme (palette taken from the toolkit's own Editor windows) and motion live in `assets/css/vinagen.css`.

## Languages

English pages sit at the root; Vietnamese pages mirror them under `vi/` with their own `vi/_sidebar.md` and `vi/_footer.md`. `assets/js/vinagen-lang.js` picks the language:

1. A choice made with the **EN / VI** switch (stored in `localStorage`) always wins.
2. Otherwise a Vietnam time zone shows Vietnamese and other zones show English.
3. UTC+7 zones shared by several countries (Windows reports Hanoi as `Asia/Bangkok`) look up the country by IP via geojs.io, falling back to the browser language.

When you add or change a page, update both the English file and its `vi/` twin. In `vi/` pages, Markdown images use `../images/…`; raw HTML `<img>` tags use `images/…`.

## Particle playground

`playground/` is a copy of the toolkit's prebuilt Built-in WebGL player (current shared-player installation or author release) plus native WebGL AssetBundles from `Samples/GeneratedParticles/Standards`, exported with the MCP action `build_particle_web_preview`. The Particles page embeds eight selected effects through `assets/js/vinagen-fx.js`; fire missile and impact are excluded from the demo picker.

- The `.unityweb` files are Brotli with Unity's decompression fallback, so any static host works without `Content-Encoding` headers.
- `?fx=<name>` imports `fx/<name>.json` once; `&replay=1` restarts one-shot effects after every system finishes. `&lang=vi` translates the player controls. The docs player groups motion and developer controls into collapsible sections.
- To add an effect: export its bundle with `build_particle_web_preview`, copy the bundle and the resulting `manifest.json` (renamed `fx/<name>.json`) here, and add a `data-fx` button in both `particles.md` files. Re-export every bundle whenever the player is rebuilt or the prefab changes.

## Screenshots

Every product image in `images/` is a real toolkit capture (Unity panels, browser workspaces or WebGL camera frames) or a contact sheet from bundled texture PNGs. The 13 October 2026 update captures all five toolkit tabs, settings Inspectors, four particle-authoring tabs, UI export/Canvas and text demos, plus WebGL controls and seeded timeline frames. See [capture inventory](images/CAPTURES.md) for provenance and verification scope.

## Design skill

`.claude/skills/frontend-design/` is Anthropic's [frontend-design skill](https://github.com/anthropics/skills/tree/main/skills/frontend-design) (see its `LICENSE.txt`). Claude Code loads it automatically when working on this site's look and motion.

## Preview locally

Any static file server works, for example:

```sh
python -m http.server 3000
```

Then open <http://localhost:3000>.

## Updating

The in-package documentation under `Assets/VinaGen AI Toolkit/Documentation/` is the technical source of truth. Keep menu paths in sync with the `MenuItem` attributes in the toolkit code.

## Credits

Built on the [Docsify Open Publishing Starter Kit](https://github.com/hibbitts-design/docsify-open-publishing-starter-kit) (MIT, see `LICENSE` and `CHANGELOG.md`).
