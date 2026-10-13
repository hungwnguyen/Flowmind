<div class="vg-hero">
  <div>
    <h1>VinaGen AI Toolkit</h1>
    <p>Design UI, plan game flows and create effects in Unity. AI is optional.</p>
  </div>
  <img class="vg-hero-robot" src="images/robot.png" alt="VinaGen robot">
</div>

<nav class="vg-quick-links" aria-label="Try it in your browser">
  <a class="vg-quick-link vg-quick-link--designer" href="designer/" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="m8 16 1-4 7-7 3 3-7 7-4 1Z"/></svg><span><strong>Open Web Designer <span aria-hidden="true">↗</span></strong><small>Design UI, import/export PSD and save your workspace. No Unity needed.</small></span></a>
  <a class="vg-quick-link vg-quick-link--particle" href="#/particles"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 6 10 6-10 6V6Z"/><path d="m4 3 .7 2.3L7 6l-2.3.7L4 9l-.7-2.3L1 6l2.3-.7L4 3Z"/></svg><span><strong>Explore particle demos <span aria-hidden="true">→</span></strong><small>8 interactive effects: Explosion, Lightning, Portal and more.</small></span></a>
</nav>

<figure class="vg-hero-shot">
  <img src="images/ui-designer.png" alt="UI Designer with the bundled game screen sample">
  <figcaption>Editable sample UI, ready to import into a Unity Canvas.</figcaption>
</figure>

**VinaGen AI Toolkit** combines graph editors, UI Designer, VinaGenText and particle tools. Editing tools run locally; AI chat and image generation use your own account.

[VinaGen AI Toolkit on the Unity Asset Store](https://assetstore.unity.com/packages/slug/375862). The first release is being prepared.

## Choose a tool

<div class="vg-workspaces">
  <a class="vg-ws vg-ws--ui" href="#/web-designer"><strong>Web Designer</strong><span>Design online, choose a local workspace and import/export PSD without Unity.</span></a>
  <a class="vg-ws vg-ws--chat" href="#/ai-chat"><strong>Agent Chat</strong><span>Think, ask and create with your own AI provider.</span></a>
  <a class="vg-ws vg-ws--flow" href="#/graphs"><strong>Flow Editor</strong><span>Plan game flows and sketch screen wireframes.</span></a>
  <a class="vg-ws vg-ws--ui" href="#/ui-designer"><strong>UI Designer</strong><span>UI layers, PSD/images and Canvas import.</span></a>
  <a class="vg-ws vg-ws--text" href="#/vinagen-text"><strong>VinaGenText</strong><span>Text effects, static baking and shared atlas optimization.</span></a>
  <a class="vg-ws vg-ws--fx" href="#/particles"><strong>Particles</strong><span>Original textures, effect prefabs and a browser preview.</span></a>
  <a class="vg-ws vg-ws--bridge" href="#/mcp-bridge"><strong>MCP Bridge</strong><span>Let Claude Code or Codex build inside your project.</span></a>
</div>

## Start here

Open **Tools → VinaGen AI Toolkit → Open**, choose a workspace and try an example in `Samples/`.

| Requirement | Used for |
| --- | --- |
| Unity **6000.3.22f1** | Current project version. |
| **Unity UI (uGUI)** and TMP resources | UI Designer, Canvas and text. |
| **WebGL Build Support** | Exporting particle prefab bundles for the browser. |
| An AI provider account | Online chat and image generation, when needed. |

[Installation and your first task](getting-started.md)
