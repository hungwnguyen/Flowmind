# MCP Bridge

The bridge lets an assistant read and edit toolkit content through Unity.

## Connect

1. Open **Tools → VinaGen AI Toolkit → Open → MCP Bridge**.
2. Click **Start**.
3. Give your assistant the displayed **Bridge URL**. Default: `http://127.0.0.1:8888/`.

Keep Unity open while the assistant works. If Unity is compiling, wait and try again.

![MCP Bridge Online status, URL and chat commands](images/toolkit-bridge.png)

**Online** means the bridge is running. **Install chat skills** fixes missing `/vina` / `$vina` commands. **Reset to default** restores the default URL.

## HTTP endpoints

| Endpoint | Purpose |
| --- | --- |
| `GET /health` | Check readiness. |
| `POST /mcp` | MCP connection. |
| `GET /tools?action=<action>` | Read an action's current schema. |
| `POST /call` | Execute an action. |
| `GET /graph` / `POST /import` | Read / import graph data. |

Example request to `POST /call`:

```json
{
  "tool": "manage_vinagen_ai_toolkit",
  "params": {
    "action": "list_ui_documents",
    "focusWindow": false
  }
}
```

## Common tasks

| Task | Actions |
| --- | --- |
| Flow graph | `create_block_diagram`, `fix_block_diagram`, `import_mock_flow_graph` |
| Design graph | `create_white_frame`, `update_white_frame`, `check_white_frame`, `patch_design_content_graph` |
| UI documents | `list_ui_documents`, `create_ui_document`, `read_ui_document`, `save_ui_document` |
| Particles | `plan_particle_system`, `create_particle_system`, `review_particle_system` |
| Textures | `list_particle_textures`, `inspect_particle_texture`, `audit_particle_textures` |

Tips for assistants: check an action's schema (`GET /tools`) before calling it; for long jobs, poll the status every `pollAfterMs`.

Keep the bridge on localhost. Most people don't need these details. Just use `/vina` or `$vina` as shown in [Create from chat](create-from-chat.md).

[Next: Settings](settings.md)
