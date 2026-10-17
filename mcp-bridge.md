# MCP Bridge

Connect an assistant to VinaGen and Unity Editor: edit UI documents, build graphs and effects, manage scenes/prefabs, change scripts, compile and run tests.

## Connect

1. Open **Tools → VinaGen AI Toolkit → Open → MCP Bridge**.
2. Click **Start**.
3. Reopen your project chat in Claude Code or Codex. Use `/vina`, `$vina`, or ask the connected `vinagen` MCP server directly.

The default **Bridge URL** is `http://127.0.0.1:8888/`; the **MCP endpoint** is `http://127.0.0.1:8888/mcp`. Keep Unity open. During script compilation/domain reload the bridge can disconnect briefly; retry after Unity is ready.

![MCP Bridge Online status, URL and chat commands](images/toolkit-bridge.png)

**Online** means the bridge is running. **Install chat skills** repairs chat commands and registers the project MCP connection. **Reset to default** restores the default URL.

Toolkit setup installs project entries automatically, preserving user skills and unrelated servers:

| Host | Chat command entry | MCP connection |
| --- | --- | --- |
| Claude Code | `.claude/skills/vina/SKILL.md` | `.mcp.json` → `mcpServers.vinagen` |
| Codex | `.agents/skills/vina/SKILL.md` | `.codex/config.toml` → `[mcp_servers.vinagen]` |

Existing custom `vinagen` connections are preserved. Existing loopback HTTP entries follow the bridge URL. If registration is skipped or a config is invalid, inspect the setup result and edit that project's connection.

For another MCP host, add an HTTP server named `vinagen` using the displayed bridge URL with `/mcp`. Execution runs inside Unity; the bridge needs no Node/Python server, npm, Figma account or AI provider key. Optional AI generation still requires its configured provider. Client-specific connection support should be checked in that host.

## Find the right tool first

Call `vinagen_find` with the task in your own words. English and Vietnamese, including Vietnamese without accents, are supported.

```json
{"query":"rename UI layers and tag buttons"}
```

The result contains ranked `matches`, the best match's `call`, focused `inputSchema` and one `guide` path. Add `guide:true` to include guide text when the host cannot read project files. Use `name` for an exact tool/action:

```json
{"name":"patch_ui_document","guide":true}
```

`limit` is 1–10 (default 5); `schema` defaults to true. An empty request lists capabilities by domain. Guide-only workflows, such as whole-game authoring, have `guideOnly:true` and no MCP call; follow their guide and compose the appropriate tools.

Call the returned tool with its schema fields. For `manage_vinagen_ai_toolkit`, send `action` and the returned fields at the top level of MCP arguments. Its `tools/list` schema is intentionally an open envelope; use discovery for each action's fields.

## Read context, then edit

| Tool | Purpose |
| --- | --- |
| `get_web_editor_context` | Live Unity-hosted browser tabs, selection, viewport, saved revision, draft version and dirty state. |
| `get_document_metadata` | Compact outline of a Flow, Design or UI document. |
| `get_node_context` | Scoped nodes/layers, ancestors and boundary connections. |
| `get_document_styles` | Exact styles and the IDs using them. |
| `read_ui_document` | Full saved UI document and revision. |
| `patch_ui_document` | Revision-checked layer edits with a dry-run diff. |
| `refactor_ui_layers` | Name layers by content, tag Buttons and nest labels/icons. |
| `capture_ui_web_screens` | Queue one PNG per screen for visual review. |

Context tools accept a saved asset `path` or live `tabId`. A browser draft may have unsaved changes; saving the asset does not replace that draft. If several tabs match a path, choose an explicit `tabId`. `draftVersion` and `revision` detect stale targets. Browser context expires after 30 seconds without a heartbeat.

Metadata/context/styles accept `nodeIds`, `depth` (0–32) and `limit` (1–1000). Omitted IDs select roots; an empty array selects none. `compactStyles:true` on node context can hoist repeated values into `sharedStyles` with exact `styleRef` references; this is a read projection, not a save payload.

### Patch a saved UI document

Read the current revision first. `patch_ui_document` defaults to `dryRun:true` and accepts 1–100 operations: `update`, `insert`, `reparent`, `remove`.

```json
{
  "path":"Assets/VinaGen AI Toolkit/Content/UI/Documents/Shop.asset",
  "revision":"<revision from read_ui_document>",
  "dryRun":true,
  "operations":[{"op":"update","id":"title","changes":{"text":"Shop"}}]
}
```

Review the diff, then commit the same request with `dryRun:false`. A stale revision returns 409 and `currentRevision`; retain the draft and re-read before retrying. Commits validate the complete candidate, preserve unknown fields and image GUID/localId references, and save only the target asset with one Unity Undo step. `reparent` uses parent-local coordinates; it does not automatically preserve world position. Removing a parent with children requires `cascade:true`.

`refactor_ui_layers` also defaults to a dry run. A saved-asset commit needs its revision; browser `tabId` targets support dry runs only. It proposes names such as `btn_play`, `txt_title` and `icon_coin`; inspect its changes, Buttons and issues before committing.

For visual review, target a draft with `tabId` + expected `draftVersion`, or an asset with `path` + `revision`. Poll `inspect_ui_web_demo` until applied, failed or expired. Results include document identity. Capture shares one pending job, so wait for it before queuing another.

These live MCP features belong to the [Unity-hosted UI Designer](ui-designer.md). The independent [Online Web Designer](web-designer.md) stores local files and does not connect to the Unity bridge.

## HTTP endpoints

| Endpoint | Purpose |
| --- | --- |
| `GET /health` | Check readiness. |
| `POST /mcp` | Stateless MCP Streamable HTTP. |
| `GET /tools?action=<action>` | Read an action's current schema. |
| `POST /call` | Execute an action. |
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

## Unity Editor and other workflows

| Task | Actions |
| --- | --- |
| Scene and hierarchy | `manage_scene`, `manage_gameobject`, `find_gameobjects`, `manage_components` |
| Prefabs and assets | `manage_prefabs`, `manage_asset`, `inspect_game_project` |
| C# and compilation | `manage_script`, `compile_scripts`, `read_console` |
| Editor controls | `manage_editor`, `execute_menu_item` |
| Unity tests | `run_tests`, `get_test_job` (Unity Test Framework required) |
| Flow graph | `create_block_diagram`, `fix_block_diagram`, `import_mock_flow_graph` |
| Design graph | `create_white_frame`, `update_white_frame`, `check_white_frame`, `patch_design_content_graph` |
| UI creation/import | `list_ui_documents`, `create_ui_document`, `save_ui_document`, `import_ui_canvas`, `import_ui_toolkit` |
| Particles | `plan_particle_system`, `create_particle_system`, `review_particle_system` |
| Textures | `list_particle_textures`, `inspect_particle_texture`, `audit_particle_textures` |

After C# edits, call `compile_scripts` with `action:"compile"`, keep `requestId`, then poll with `action:"status"` and that ID until `ready:true`. Fix both compiler `errors` and `consoleErrors`, then repeat. Compilation state survives domain reload. Start tests with `run_tests` and poll `get_test_job`; tests cannot start with compiler errors.

After game creation, use `inspect_game_project` for saved scene/prefab/reference evidence, then separately verify gameplay and a representative prefab/config edit. A successful inspection alone does not certify the game. UI imports create a new copy with Undo; save the scene yourself after checking it.

Queued success is not completion: respect `pollAfterMs` and poll to a terminal result. Only `inspect_particle_tool_job`, `inspect_image_generation_job` and `inspect_particle_review` support conditional polling with `ifChanged:<previous revision>`; keep the previous result when `unchanged:true`.

Keep the bridge on localhost. It checks Host/loopback and browser origins; browser writes use `X-VinaGen-Session`. Originless CLI/MCP clients remain supported. Request bodies are capped at 8 MB. These are local editor protections, not public hosting authentication.

For everyday use, start with [Create from chat](create-from-chat.md).

[Next: Settings](settings.md)
