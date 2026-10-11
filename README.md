# VinaGen AI Toolkit — Documentation

Source for the **VinaGen AI Toolkit** documentation website, a [Docsify](https://docsify.js.org/) site served as static files.

VinaGen AI Toolkit is a Unity Editor extension that combines flow/design graphs, a browser UI Designer with Canvas import, the VinaGenText styled-text renderer, native particle authoring with an offline texture library, a WebGL particle preview and a local MCP bridge for Claude Code, Codex and other assistants.

## Pages

| File | Topic |
| --- | --- |
| `introduction.md` | Overview, requirements and entry points (home page) |
| `getting-started.md` | Install and first workflows |
| `graphs.md` | Flow and design content graphs |
| `web-editor.md` | Browser Flow Editor |
| `ui-designer.md` | UI Designer, PSD import and Canvas import |
| `vinagen-text.md` | VinaGenText fonts, styles and gradients |
| `particles.md` | Texture library, authoring tools and effect construction |
| `webgl-preview.md` | WebGL particle preview and browser API |
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

## Screenshots

Every image in `images/` is a real capture of the toolkit (Unity windows, the browser Flow Editor and UI Designer with the bundled samples) or a contact sheet built from the bundled texture PNGs.

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
