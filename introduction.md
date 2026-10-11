<div class="vg-hero">
  <div>
    <h1>VinaGen AI Toolkit</h1>
    <p>One Unity workspace for game flow, screen design, styled text and particle effects. Use it fully offline, or bring your own AI.</p>
  </div>
  <img class="vg-hero-robot" src="images/robot.png" alt="VinaGen robot">
</div>

<figure class="vg-hero-shot">
  <img src="images/ui-designer.png" alt="UI Designer showing the sample game UI document with Settings, New Cube and Your Score screens">
  <figcaption>UI Designer with the bundled sample document, ready to import into a Unity Canvas.</figcaption>
</figure>

**VinaGen AI Toolkit** is a Unity Editor extension for game designers and developers. It combines visual logic graphs, a browser UI Designer that imports straight into a Unity Canvas, the VinaGenText styled-text renderer, native particle authoring with an offline texture library, a browser particle preview and a local MCP bridge that lets Claude Code, Codex and other assistants drive the toolkit.

**Online AI is optional.** Graphs, UI design, text, offline texture generation and particle construction all work without an AI subscription. Provider accounts, credentials, network access and usage charges are separate from this asset.

## Choose your workspace

<div class="vg-workspaces">
  <a class="vg-ws vg-ws--chat" href="#/ai-chat"><strong>Agent Chat</strong><span>Think, ask and create with your own AI provider.</span></a>
  <a class="vg-ws vg-ws--flow" href="#/graphs"><strong>Flow Editor</strong><span>Plan game flows and sketch screen wireframes.</span></a>
  <a class="vg-ws vg-ws--ui" href="#/ui-designer"><strong>UI Designer</strong><span>UI layers, PSD/images and Canvas import.</span></a>
  <a class="vg-ws vg-ws--text" href="#/vinagen-text"><strong>VinaGenText</strong><span>Gradients, stroke, outline and 3D extrusion for game labels.</span></a>
  <a class="vg-ws vg-ws--fx" href="#/particles"><strong>Particles</strong><span>Original textures, effect prefabs and a browser preview.</span></a>
  <a class="vg-ws vg-ws--bridge" href="#/mcp-bridge"><strong>MCP Bridge</strong><span>Let Claude Code or Codex build inside your project.</span></a>
</div>

## Core concepts

- **Flow graph (`MockFlowGraph`)**: game logic as steps, decisions, branches and transitions. Works without FlowCanvas or NodeCanvas.
- **Design content graph (`DesignContentGraph`)**: screen wireframes with frames, copy, image slots and numbered callouts.
- **UI document (`VinaGenUIDocument`)**: a layered game-UI design that imports into a Unity Canvas.
- **Texture library and particle library**: catalogued original artwork and effect prefabs used to construct particle systems.
- **MCP bridge**: a localhost HTTP server inside the Unity Editor that exposes toolkit actions to external assistants.
- **Skills**: short, modular instruction files under `Skills/` that route each AI task to exactly one workflow.

## Requirements

| Item | Requirement |
| --- | --- |
| Unity | Validated on **Unity 6000.3.22f1**. Verify other versions before relying on them. |
| Core features | Unity engine/Editor modules only. No Python, Node.js, npm, CDN or third-party Asset Store package. |
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

**Next:** [Getting Started](getting-started.md)
