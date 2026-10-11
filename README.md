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

Navigation lives in `_sidebar.md`, the footer in `_footer.md` and site configuration/theme in `index.html`.

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
