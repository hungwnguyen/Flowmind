# Create from Claude Code / Codex

Ask your assistant to create UI screens, graphs or effects in your Unity project.

## Use it

1. Import the toolkit and wait for Unity to compile. Project chat skills are registered automatically.
2. Open **Tools → VinaGen AI Toolkit → Open → MCP Bridge → Start**.
3. Open Claude Code or Codex in this Unity project.
4. Write a request with `/vina` (Claude Code) or `$vina` (Codex).

```text
/vina create a shop screen from the bundled Samples template, named Shop
$vina create a login flow with success and failure branches
$vina create a looping blue fire effect using offline textures
```

Describe the result, visual style and output name. Add a destination path when you need one; use `Assets/VinaGen AI Toolkit/Content/UI/Documents/Shop.asset` for a new UI document.

## If the command is missing

In the **MCP Bridge** tab, check registration status and click **Install chat skills**. Reopen the project chat afterwards. Existing user-authored skills are preserved; resolve any reported name conflict yourself.

| Host | Project entry |
| --- | --- |
| Claude Code | `.claude/skills/vina/SKILL.md` |
| Codex | `.agents/skills/vina/SKILL.md` |

The assistant needs access to the project and bridge. Your host account handles assistant usage; provider image generation has separate requirements.

[Next: MCP Bridge](mcp-bridge.md)
