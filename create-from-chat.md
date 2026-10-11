# Create from Claude Code / Codex

> Type `/vina <request>` in Claude Code or `$vina <request>` in Codex and the assistant builds UI screens, graphs, particles or images directly in your Unity project.

## Automatic setup

After Unity imports and compiles the toolkit, it registers project-local chat skills automatically:

| Host | Entry | Invoke |
| --- | --- | --- |
| **Claude Code** (terminal or Desktop) | `.claude/skills/vina/SKILL.md` | `/vina …` |
| **Codex** | `.agents/skills/vina/SKILL.md` | `$vina …` (or the `/skills` picker) |

Both entries are short pointers to the toolkit's authoritative `Skills/vina/SKILL.md`. Setup re-runs on editor startup, script reload and skill imports without rewriting unchanged files.

- User-authored skills, legacy `.claude/commands/vina.md` commands and linked skill directories are **preserved**.
- If one host conflicts or can't write its directory, the other still installs.
- Registration does **not** start the bridge, install Claude/Codex, sign you in or edit global config, `AGENTS.md` or `CLAUDE.md`.

Check status in **Tools → VinaGen AI Toolkit → Open → MCP Bridge**. **Install chat skills** (or MCP action `install_vina_skills`) retries installation. Reopen the project chat if the host hasn't discovered the new entry.

## Use it

1. Start the bridge: **Open → MCP Bridge → Start**.
2. Ask in your host:

```text
/vina create a shop screen in Assets/MyUI/Shop.asset
/vina create a new UI from the Samples template, named Shop
/vina create a fire effect
/vina create a login flow
```

In Codex use the same requests after `$vina`.

The host model authors the design; structured MCP writes run offline. No extra server, npm package or paid AI API is needed for structured UI creation. Provider-based particle or image operations still need a configured provider.

## UI document actions

| Action | Purpose |
| --- | --- |
| `list_ui_documents` | Paginated sample paths, sizes and layer counts — without loading every document. |
| `create_ui_document` | New document from an authored `document`, an existing `templatePath`, or a blank board. `dryRun: true` is the default; set `false` to create. Existing assets are never overwritten. |
| `read_ui_document` / `save_ui_document` | Edit using the document's revision. |

Template cloning keeps Unity GUID/localId references and editable layers.

## Skill router

The toolkit's `Skills/` folder routes each request to exactly **one** specialized skill:

| Intent | Skill |
| --- | --- |
| `/vina` or `$vina` from chat | `vina` |
| Logic, sequence, progression | `mock-flow-graph` |
| White-frame layout, screen copy | `design-content-graph` |
| Browser graph editing | `web-graph-editor` |
| Game UI, labeled JSON, PSD, Canvas import | `ui-studio` |
| Pixel sprite or icon | `pixel-image` |
| General image generation | `image-generation` |
| Build FX, select textures/templates | `particle-system` |
| FX presets / recipes | `particle-recipes` |
| FX art direction | `particle-art-direction` |
| FX cost/quality budget | `particle-budget` |
| Texture generation/import/repair | `particle-texture` |
| Play Mode capture, WebGL review | `particle-review` |
| Bridge connection | `core` |

> Don't concatenate the whole skills folder into a prompt — load the router, then one skill.

---
[Next: MCP Bridge](mcp-bridge.md)
