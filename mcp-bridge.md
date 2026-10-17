# MCP Bridge

MCP Bridge lets an AI coding assistant (Claude Code, Codex or another MCP-capable app) **work directly inside your open Unity Editor**. Instead of only answering in text, the assistant can create UI screens, draw logic diagrams, build particle effects, arrange scenes, edit C# scripts, compile and run tests — then read the results back to check its own work.

## What is MCP Bridge?

**MCP** (Model Context Protocol) is an open standard that lets AI assistants call "tools" provided by other software. Each tool is a named operation with clear parameters, such as "create a GameObject", "read a UI document" or "compile scripts".

**MCP Bridge** is a small server running inside Unity Editor. It exposes VinaGen AI Toolkit and Unity Editor features as MCP tools the assistant can call.

How it works:

1. You write a request in plain words in the assistant's chat.
2. The assistant picks a suitable tool and sends the call over MCP (localhost HTTP) to the bridge.
3. The bridge performs the operation inside Unity Editor and returns the result.
4. The assistant reads the result (compiler errors, screenshots, diffs…), checks it and keeps fixing if needed.

For example, type in Claude Code:

```text
/vina create a shop screen from the bundled sample, change the title to "Store", then add it to the current scene
```

The assistant finds the UI sample, creates a new document, edits the text, previews the change, saves, then imports it as a Canvas in the scene. Everything runs in your Unity and can be undone.

**The bridge does not need:** a Node/Python server, npm, a Figma account or an AI API key. Only when you ask AI to *generate content* (for example images from an AI provider) do you need a [configured provider](ai-chat.md).

## Connect

1. Open **Tools → VinaGen AI Toolkit → Open → MCP Bridge**.
2. Click **Start**.
3. Reopen your project chat in Claude Code or Codex. Use `/vina` (Claude Code), `$vina` (Codex), or ask the connected `vinagen` MCP server directly.

The default **Bridge URL** is `http://127.0.0.1:8888/`; the **MCP endpoint** is `http://127.0.0.1:8888/mcp`. Keep Unity open while you work. During script compilation/domain reload the bridge can disconnect for a few seconds; the assistant just retries once Unity is ready.

![MCP Bridge Online status, URL and chat commands](images/toolkit-bridge.png)

| Button / status | Meaning |
| --- | --- |
| **Online** | The bridge is running and accepting requests. |
| **Install chat skills** | Reinstalls the `/vina` and `$vina` commands and registers the project MCP connection. Use it when chat commands stop working. |
| **Reset to default** | Restores the default URL. |

Toolkit setup installs these project entries automatically, preserving your own skills and unrelated MCP servers:

| Host | Chat command entry | MCP connection |
| --- | --- | --- |
| Claude Code | `.claude/skills/vina/SKILL.md` | `.mcp.json` → `mcpServers.vinagen` |
| Codex | `.agents/skills/vina/SKILL.md` | `.codex/config.toml` → `[mcp_servers.vinagen]` |

Existing custom `vinagen` connections are preserved. Existing loopback HTTP entries follow the bridge URL. If registration is skipped or a config is invalid, inspect the setup result and edit that project's connection.

For another MCP host, add an HTTP server named `vinagen` using the displayed bridge URL with `/mcp`. How to add a server differs per app; check that app's documentation.

## What can the bridge do?

You don't need to remember tool names: describe the task and the assistant picks the right tool (see **Find the right tool first** below). The tables below show **what you can ask for**.

### Unity Editor

These tools control Unity Editor itself, much like what you do with the mouse in Hierarchy, Inspector and Project.

| Tool | What it does | Example request |
| --- | --- | --- |
| `manage_scene` | Create, open, save, close scenes; page through the Hierarchy; read Build Settings; validate scenes. Never discards unsaved changes in open scenes. | "Create a Level1 scene and save it in Assets/Scenes" |
| `find_gameobjects` | Find GameObjects in open scenes by name, path, tag, layer, component type or instance ID. | "Find every object with a Rigidbody" |
| `manage_gameobject` | Create (primitives or from a prefab), modify, delete, duplicate, move, rotate GameObjects; add/remove components while modifying. Each change is one Undo step. | "Create a cube at (0, 1, 0) rotated 45°" |
| `manage_components` | Add, remove, read or set component properties. Accepts numbers, `[x,y,z]` vectors, `#FF8800` colors, enums by name, asset references by path/GUID. | "Set the Player's Rigidbody mass to 2" |
| `manage_prefabs` | Create prefabs from GameObjects, read info/hierarchy, edit prefab contents without opening them, open/save/close Prefab Mode, apply or revert overrides, unpack. | "Turn the Enemy object into a prefab" |
| `manage_asset` | Search, inspect, create (folders, materials, ScriptableObjects…), modify (material shader/colors/textures, ScriptableObject fields, importer settings), duplicate, move, rename, reimport, delete (moved to the OS trash). | "Create a red material named EnemyMat" |
| `manage_script` | Create, read, overwrite, partially edit or delete C# scripts under `Assets/`. Each write returns a `sha256` so the next write cannot silently overwrite someone else's change. | "Write a PlayerController that moves with WASD" |
| `compile_scripts` | Compile C# and report errors/warnings with file, line and column, plus new Console errors. Results survive Unity's script reload. | "Compile and fix every error" |
| `read_console` | Read, count or clear Console log entries (errors and warnings by default). | "What errors are in the Console?" |
| `manage_editor` | Read Editor state and project info; get/set selection; Play, Pause, Stop; Undo, Redo; switch the active tool; add/remove tags and layers. | "Add an Enemy layer, then press Play" |
| `execute_menu_item` | Run a Unity menu command by path (e.g. `Assets/Refresh`) or search available menu commands. Quit commands are blocked. | "Run Assets/Refresh" |
| `run_tests` / `get_test_job` | Run EditMode/PlayMode tests and read results: pass/fail counts, failure messages and stack traces. Requires the Unity Test Framework package. | "Run all EditMode tests" |
| `inspect_game_project` | Read-only audit of a saved game folder: prefabs, scene composition, missing scripts, broken references. | "Check Assets/MyGame for broken references" |

### UI documents (UI Designer)

A UI document is the asset that stores a game screen design (layers, text, images, buttons) for the [Unity-hosted UI Designer](ui-designer.md). The assistant can create, edit and bring these documents into a scene.

| Tool | What it does | Example request |
| --- | --- | --- |
| `list_ui_documents` | Find bundled UI samples to start from. | "Is there a shop screen sample?" |
| `create_ui_document` | Create a new UI document: blank board, sample clone or full JSON. Runs a dry run first. | "Create a main menu from a sample" |
| `read_ui_document` | Read a full saved UI document and its `revision` (version code) before editing. | — |
| `patch_ui_document` | Targeted edits: move, restyle, add, delete layers. Always previews a diff before writing. | "Make the Play button green" |
| `refactor_ui_layers` | Rename layers by content (`btn_`, `txt_`, `icon_`, `img_`, `bg_`, `panel_`, `popup_`), tag Buttons and nest labels/icons inside them. | "Clean up the Shop screen's layer names" |
| `save_ui_document` | Save a full UI document with its current revision. | — |
| `import_ui_canvas` | Bring a UI document into the scene as a uGUI Canvas (with Undo). | "Add the Shop screen to the scene" |
| `import_ui_toolkit` | Export a UI document as UXML + USS + UIDocument for UI Toolkit. | "Export the Shop screen to UI Toolkit" |
| `render_ui_web_demo` | Show a UI draft in the bundled browser without saving. | "Show me a preview" |
| `capture_ui_web_screens` / `inspect_ui_web_demo` | Capture one PNG per screen so the assistant can review visuals; track capture status. | "Capture the screens to check them" |
| `inspect_ui_studio_settings` | Registered fonts, text presets, shortcuts and asset folders. | "Which fonts does the project have?" |

### Document context

These tools help the assistant **understand what you're working on** before editing, such as which layer you selected in the browser.

| Tool | What it does |
| --- | --- |
| `get_web_editor_context` | Unity-hosted browser editor tabs: selection, viewport, saved revision, draft version and whether there are unsaved changes. |
| `get_document_metadata` | Compact outline of a Flow, Design or UI document (layer/node list). |
| `get_node_context` | Details of selected nodes/layers, their ancestors and outgoing connections. |
| `get_document_styles` | Styles in use and which nodes use them. |

### Flow graph and Design graph

A [Flow graph](graphs.md) maps game logic (steps, conditions, branches). A Design graph ("white frame") sketches screen layout and content.

| Tool | What it does | Example request |
| --- | --- | --- |
| `create_block_diagram` | Create a Flow graph from a description: gameplay loop, quest, tutorial, state machine. | "Create a login flow with success/failure branches" |
| `fix_block_diagram` | Fix or update an existing Flow graph. | "Add a forgot-password step to the login flow" |
| `import_mock_flow_graph` | Write a structured Flow graph (JSON or text) with no AI provider. | — |
| `create_white_frame` | Create a Design graph: screen frames with copy and layout. | "Sketch a settings screen" |
| `update_white_frame` | Update an existing Design graph. | "Add a volume row to the settings frame" |
| `check_white_frame` | Review a frame and write design descriptions for each part. | "Describe the shop frame in detail" |
| `patch_design_content_graph` | Targeted Design graph node edits with no AI provider. | — |

### Particle effects and textures

See also [Particle & Texture](particles.md) and [Web Particle](webgl-preview.md).

| Tool | What it does | Example request |
| --- | --- | --- |
| `plan_particle_system` | Turn an effect description into a plan (duration, particle count, quality) without creating assets. | "Plan a small explosion for mobile" |
| `create_particle_system` | Create a particle effect (web preview, scene object or prefab) from a description. | "Create a looping blue fire effect" |
| `patch_particle_system` | Tune modules/textures of an existing effect; previews before writing. | "Make the smoke fade slower" |
| `review_particle_system` | Play the effect in Play Mode or WebGL and capture key moments so the assistant can judge it. | "Check the effect you just made" |
| `list_particle_templates` / `list_particle_prefabs` | List effect templates and reusable particle prefabs. | "Is there a slash effect template?" |
| `repair_particle_materials` | Fix particle materials for the active render pipeline (e.g. no more pink on URP). | "The effect is pink, fix it" |
| `list_particle_textures` / `inspect_particle_texture` | Find and inspect textures in the particle texture library. | "Find a spark texture" |
| `audit_particle_textures` | Diagnose textures: noise, clipped edges, shape, alpha channel. | "Check the smoke texture's alpha" |
| `import_particle_textures` / `scan_and_add_textures` | Import existing artwork as particle textures; scan a folder and register its textures. | "Add the textures in my FX folder" |

### Images and pixel art

| Tool | What it does | Example request |
| --- | --- | --- |
| `create_pixel_image` | Generate a pixel-art sprite or icon. | "Draw a 16×16 coin icon" |
| `generate_image_texture` | Generate an image/texture with the assistant's image tool or the configured provider. | "Create a forest background for the menu" |
| `import_generated_image` | Bring an image the assistant produced into the project. | — |

### Multi-step workflows

Some tasks are not one tool but **guides that combine several tools**, such as building a whole playable game (scenes, prefabs, editable configuration, maintainable code), importing a Photoshop PSD, or tuning effect performance. For these, the assistant reads the matching guide and calls the tools above in order.

## Find the right tool first

The bridge has dozens of tools. So the assistant doesn't need to read them all, every request starts with `vinagen_find`: describe the task in plain words and the bridge returns the best tool, the fields to fill and the related guide. English and Vietnamese, including Vietnamese without accents, are supported.

```json
{"query":"rename UI layers and tag buttons"}
```

The result contains ranked `matches`, the best match's `call`, focused `inputSchema` and one `guide` path. Add `guide:true` to include guide text when the host cannot read project files. Use `name` for an exact tool/action:

```json
{"name":"patch_ui_document","guide":true}
```

`limit` is 1–10 (default 5); `schema` defaults to true. An empty request lists capabilities by domain. Guide-only workflows, such as whole-game authoring, have `guideOnly:true` and no MCP call; follow their guide and compose the appropriate tools.

Call the returned tool with its schema fields. For `manage_vinagen_ai_toolkit` (the shared tool behind the graph, particle, texture and image features), send `action` and the returned fields at the top level of MCP arguments. Its `tools/list` schema is intentionally an open envelope; use discovery for each action's fields.

## Read context, then edit

The bridge's safety rule: **read the current state → preview the change → only then write**. This keeps the assistant from overwriting work you just did in the browser or in Unity.

Context tools accept a saved asset `path` or a live `tabId`. A browser draft may have unsaved changes; saving the asset does not replace that draft. If several tabs have the same file open, choose an explicit `tabId`. `draftVersion` and `revision` detect targets that changed in the meantime. Browser context expires after 30 seconds without a heartbeat (for example when you close the tab).

Metadata/context/styles accept `nodeIds`, `depth` (0–32) and `limit` (1–1000). Omitted IDs select roots; an empty array selects none. `compactStyles:true` on node context can hoist repeated values into `sharedStyles` with exact `styleRef` references; this is a compact read, not a save payload.

### Patch a saved UI document

Read the current revision first. `patch_ui_document` defaults to `dryRun:true` (preview only, nothing written) and accepts 1–100 operations: `update`, `insert`, `reparent` (change parent), `remove`.

```json
{
  "path":"Assets/VinaGen AI Toolkit/Content/UI/Documents/Shop.asset",
  "revision":"<revision from read_ui_document>",
  "dryRun":true,
  "operations":[{"op":"update","id":"title","changes":{"text":"Shop"}}]
}
```

Review the diff, then send the same request with `dryRun:false` to write. If the document was changed by someone else (stale revision), the bridge returns 409 and `currentRevision`; keep the draft and re-read before retrying. Commits validate the complete candidate, preserve unknown fields and image GUID/localId references, and save only the target asset with one Unity Undo step. `reparent` uses parent-local coordinates; it does not keep the on-screen position automatically. Removing a parent layer with children requires `cascade:true`.

`refactor_ui_layers` also defaults to a dry run. A saved-asset commit needs its revision; browser `tabId` targets support dry runs only. It proposes names such as `btn_play`, `txt_title` and `icon_coin`; inspect its changes, Buttons and issues before committing.

For visual review, target a draft with `tabId` + expected `draftVersion`, or an asset with `path` + `revision`. Poll `inspect_ui_web_demo` until applied, failed or expired. Results include document identity. Only one capture job can be pending at a time, so wait for it before queuing another.

These live MCP features belong to the [Unity-hosted UI Designer](ui-designer.md). The independent [Online Web Designer](web-designer.md) stores local files and does not connect to the Unity bridge.

## Common workflows

### Editing C# code

1. Write the script with `manage_script`.
2. Call `compile_scripts` with `action:"compile"` and keep its `requestId`.
3. Poll `action:"status"` with that ID until `ready:true`. Unity may reload scripts in between; compilation state survives.
4. Fix both compiler `errors` and new `consoleErrors`, then repeat until clean.

### Running tests

Start `run_tests`, then poll `get_test_job` for results. Tests won't start while scripts have compiler errors or open scenes have unsaved changes (so no Unity dialog blocks the run).

### Building a game

After game creation, use `inspect_game_project` for saved scene/prefab/reference evidence, then separately verify gameplay and a representative prefab/config edit. A successful inspection proves the assets are valid, **not that the game plays well**. UI imports create a new copy with Undo; save the scene yourself after checking it.

### Long-running jobs

Some work (image generation, particle reviews, texture processing) is queued and runs in the background. A "queued" response is not completion: respect `pollAfterMs` and poll to a terminal result. Only `inspect_particle_tool_job`, `inspect_image_generation_job` and `inspect_particle_review` support conditional polling with `ifChanged:<previous revision>`; keep the previous result when `unchanged:true`.

## HTTP endpoints

This section is for people **writing their own integration** (scripts, custom tools). If you use Claude Code/Codex you can skip it.

| Endpoint | Purpose |
| --- | --- |
| `GET /health` | Check whether the bridge is running. |
| `POST /mcp` | Stateless MCP Streamable HTTP — the main entry for MCP apps. |
| `GET /tools?action=<action>` | Read an action's current schema. |
| `POST /call` | Execute an action over REST. |
| `GET /graph` / `POST /import` | Read / import graph data. |

`POST /mcp` implements JSON-RPC `initialize`, `ping`, `tools/list` and `tools/call`. Send `Content-Type: application/json`, `Accept: application/json, text/event-stream`, and the negotiated `MCP-Protocol-Version` after initialization. Supported versions: `2025-11-25`, `2025-06-18`, `2025-03-26`. Responses are JSON; notifications receive 202. Persistent SSE is not provided (`GET /mcp` returns 405).

REST uses an envelope distinct from MCP tool arguments. Example request to `POST /call`:

```json
{
  "tool": "manage_vinagen_ai_toolkit",
  "params": {
    "action": "read_ui_document",
    "focusWindow": false,
    "data": {"path":"Assets/VinaGen AI Toolkit/Content/UI/Documents/Shop.asset"}
  }
}
```

Use each action's schema to place fields correctly; document fields are in `params.data`. Results default to `responseDetail:"compact"`; use `"full"` for legacy fields and audits. Reuse discovery within a session; metadata supports `ETag` / `If-None-Match` (304 has no body).

## Security

The bridge is meant for your own machine: keep it on localhost. It checks Host/loopback and browser origins; browser writes require the `X-VinaGen-Session` header. Originless CLI/MCP clients remain supported. Request bodies are capped at 8 MB. These are local editor protections, **not** authentication for exposing the bridge publicly.

For everyday use, start with [Create from chat](create-from-chat.md).

[Next: Settings](settings.md)
