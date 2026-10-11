# VinaGen AI Toolkit

> **One Unity workspace for game flow, screen design, styled text and particle effects — with optional AI.**

![VinaGen robot](images/robot.png ':size=96')

**VinaGen AI Toolkit** is a Unity Editor extension for game designers and developers. It brings together visual logic graphs, a Figma-style UI Designer that imports straight into a Unity Canvas, the VinaGenText styled-text renderer, a native particle authoring pipeline with an offline texture library, a browser-based particle preview and a local MCP bridge that lets AI assistants such as Claude Code or Codex drive the toolkit.

**Online AI is optional.** Graphs, UI design, text, offline texture generation and particle construction all work without an AI subscription. Provider accounts, credentials, network access and usage charges are separate from this asset.

<div class="vg-cards">
  <div class="vg-card">
    <h4>Flow & Design graphs</h4>
    <p>Plan game logic with flow graphs and sketch screens with design wireframes — natively or in the browser.</p>
    <a href="#/graphs">Read more →</a>
  </div>
  <div class="vg-card">
    <h4>UI Designer</h4>
    <p>Design layers, import PSD/images, label components and import a ready Unity Canvas.</p>
    <a href="#/ui-designer">Read more →</a>
  </div>
  <div class="vg-card">
    <h4>VinaGenText</h4>
    <p>SDF text with gradients, stroke, outline and 3D extrusion, editable from browser, Inspector or code.</p>
    <a href="#/vinagen-text">Read more →</a>
  </div>
  <div class="vg-card">
    <h4>Particles</h4>
    <p>About 1,500 original textures, a bundled effect library and structured particle construction.</p>
    <a href="#/particles">Read more →</a>
  </div>
  <div class="vg-card">
    <h4>WebGL preview</h4>
    <p>Review effects in a prebuilt browser player with seeded, repeatable captures.</p>
    <a href="#/webgl-preview">Read more →</a>
  </div>
  <div class="vg-card">
    <h4>MCP bridge</h4>
    <p>Let Claude Code, Codex or any MCP client create UI, graphs and FX in your project.</p>
    <a href="#/mcp-bridge">Read more →</a>
  </div>
</div>

![Flow Editor running in the browser](images/flow-editor.png)

## Core concepts

- **Flow graph (`MockFlowGraph`)** — a game-logic graph: steps, decisions, branches and transitions. Works without FlowCanvas or NodeCanvas.
- **Design content graph (`DesignContentGraph`)** — screen wireframes: frames, copy, image slots and numbered callouts.
- **UI document (`VinaGenUIDocument`)** — a layered game-UI design that can be imported into a Unity Canvas.
- **Texture library & particle library** — catalogued original artwork and effect prefabs used to construct particle systems.
- **MCP bridge** — a localhost HTTP server inside the Unity Editor that exposes toolkit actions to external assistants.
- **Skills** — short, modular instruction files under `Skills/` that route each AI task to exactly one workflow.

## Requirements

| Item | Requirement |
| --- | --- |
| Unity | Validated on **Unity 6000.3.22f1**. Verify other versions before relying on them. |
| Core features | Unity engine/Editor modules only — no Python, Node.js, npm, CDN or third-party Asset Store package. |
| UI Designer, Canvas tools, text | Official **Unity UI (uGUI)** and **TextMesh Pro** (TMP ships inside uGUI on Unity 6). |
| Particle rendering | Bundled Built-in compatible shaders; URP/HDRP adapters activate automatically when installed. |
| WebGL particle preview | Prebuilt players are included. Exporting native prefab bundles needs Unity Hub's **WebGL Build Support** module. |
| AI chat / image generation | Optional: your own provider account, API key and any provider charges. |

> Importing the toolkit never installs packages behind your back or changes your render pipeline.

## Main entry points

All menus live under **Tools → VinaGen AI Toolkit**.

| Menu | Opens |
| --- | --- |
| **Open** | The toolkit window: Home, Create, Particles, MCP Bridge and Settings tabs. |
| **Show Welcome Window** | The launch pad with quick links to chat, editors and particle tools. |
| **Chat** | Agent Chat with conversation history and attachments. |
| **OpenGraphEditor** | The native logic-graph editor with Unity development chat. |
| **Open Design Content Editor** | The native design-content (wireframe) editor. |
| **Editors → Open Flow Editor** | The browser Flow/Design workspace. |
| **Editors → Open UI Designer** | The browser UI Designer. |
| **Particle System → Authoring Tools** | Texture generation, audit, registration, inspection and FX review. |
| **MCP → Control Panel / Start Bridge / Stop Bridge** | The local MCP bridge. |
| **Text → …** | VinaGenText fonts, styles and maintenance commands. |
| **Settings → …** | Every toolkit settings asset. |

👉 **Next:** [Getting Started](getting-started.md)
