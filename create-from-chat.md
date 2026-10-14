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

Say what you want, the style and a name. You can also give a save path, e.g. `Assets/VinaGen AI Toolkit/Content/UI/Documents/Shop.asset`.

## Ask the agent to test a particle

```text
$vina create an offline particle, use Web Particle to capture startup, peak
and fade; inspect the images, fix issues and re-test the saved prefab.
```

The agent uses [Web Particle](webgl-preview.md) to look at its effect, then saves fixes in Unity.

![MCP Bridge with chat skill registration](images/toolkit-bridge.png)

## If the command is missing

In the **MCP Bridge** tab, click **Install chat skills**, then reopen the chat. Your own skills are not touched.

| Host | Project entry |
| --- | --- |
| Claude Code | `.claude/skills/vina/SKILL.md` |
| Codex | `.agents/skills/vina/SKILL.md` |

Assistant usage is billed to your Claude Code / Codex account.

[Next: MCP Bridge](mcp-bridge.md)
