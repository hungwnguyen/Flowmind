# MCP Bridge

> A localhost HTTP server inside the Unity Editor that exposes toolkit actions to Claude Code, Codex and any MCP client.

## Start and connect

1. Open **Tools → VinaGen AI Toolkit → Open** and select the **MCP Bridge** tab (or **MCP → Control Panel**).
2. Click **Start** (or **Tools → VinaGen AI Toolkit → MCP → Start Bridge**).
3. Give your assistant the **Bridge URL** shown in the tab. Default: `http://127.0.0.1:8888/`.

Change the address with **Apply URL**; **Reset to default** restores it. Stop the bridge when external control is no longer needed.

Editor work runs on Unity's main thread. Compilation or a domain reload can briefly interrupt the connection — retry once Unity is ready. The bridge stays active across Play Mode so requested captures and jobs can complete.

## Endpoints

| Endpoint | Purpose |
| --- | --- |
| `GET /health` | Readiness check |
| `POST /mcp` | Stateless MCP Streamable HTTP (`initialize`, `ping`, `tools/list`, `tools/call`) |
| `GET /tools?action=<action>` | Schema for one action |
| `GET /graph` | Graph snapshot |
| `POST /call` | Execute an action |
| `POST /import` | Direct graph import / patch |
| `/graph-editor/` | Browser Flow Editor and UI Designer |

## Request envelope

```json
{
  "tool": "manage_vinagen_ai_toolkit",
  "params": {
    "action": "plan_particle_system",
    "prompt": "Looping blue fire upward, no smoke",
    "focusWindow": false
  }
}
```

- Use `focusWindow: false` for unattended work.
- Defaults: `focusWindow=true`, `newSession=false`, `overwrite=false`, `useContextCache=true`.
- Responses are `compact` by default; send `responseDetail: "full"` for legacy fields.
- Job polls return a `revision` — pass it back as `ifChanged` and respect `pollAfterMs`.
- Always discover the current schema with `GET /tools?action=<action>` before calling.

## Common actions

| Area | Actions |
| --- | --- |
| **Graphs** | `import_mock_flow_graph`, `import_design_content_graph`, `mutate_design_content_graph`, `patch_design_content_graph` |
| **UI documents** | `list_ui_documents`, `create_ui_document`, `read_ui_document`, `save_ui_document`, `import_ui_canvas`, `inspect_ui_studio_settings` |
| **UI review** | `render_ui_web_demo`, `capture_ui_web_screens`, `inspect_ui_web_demo` |
| **Particles** | `plan_particle_system`, `create_particle_system`, `list_particle_templates`, `list_particle_prefabs`, `review_particle_system`, `inspect_particle_review` |
| **Textures** | `list_particle_textures`, `inspect_particle_texture`, `rebuild_default_particle_textures`, `audit_particle_textures`, `inspect_particle_tool_job` |
| **Setup** | `install_vina_skills` |

### Particle workflow

1. `plan_particle_system` — inspect the plan when the shape is specific.
2. `create_particle_system` — returns the result plus a WebGL job/URL for `web_preview` output.
3. Wait for `webPreviewStatusUrl` to succeed, then open `webPreviewUrl`.
4. `review_particle_system` — explicit visual checks. Poll review/texture jobs by ID.

Keep returned aliases, paths and warnings for precise follow-up edits.

## Rules for assistants

- Read and write graph assets through the bridge with targeted patches — **never edit serialized Unity YAML**.
- Don't invoke paid providers unless the user asked.
- Some actions return queued success before the next editor tick; verify the final result.
- Route through one modular skill at a time instead of sending the whole skills folder.

## Security

The bridge listens on loopback only. The web editor additionally checks same-origin requests and per-session tokens. Keep the bridge local and stop it when you're done.

---
[Next: Settings](settings.md)
