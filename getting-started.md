# Getting Started

Import the toolkit, open a workspace and try a bundled sample.

## Install

1. Import the `.unitypackage` through **Assets → Import Package → Custom Package…**.
2. Wait for Unity to finish compiling.
3. Open **Tools → VinaGen AI Toolkit → Open**.

The project uses **Unity 6000.3.22f1**. UI and text tools need **Unity UI (uGUI)**; TMP Essentials are imported from the installed Unity package when needed. The local editors run inside Unity.

<div class="vg-pair">
  <figure><img src="images/toolkit-home.png" alt="Toolkit Home tab"><figcaption>Home: open a workspace.</figcaption></figure>
  <figure><img src="images/toolkit-settings.png" alt="Toolkit Settings tab"><figcaption>Settings: configure project defaults.</figcaption></figure>
</div>

## Pick a first task

| Task | Start here |
| --- | --- |
| Plan game logic | **Editors → Open Flow Editor** → open `Samples/Graphs/NewMockFlowGraph.asset`. |
| Sketch screens | In Flow Editor, open `Samples/Graphs/NewDesignContentGraph.asset`. |
| Build game UI | **Editors → Open UI Designer** → open the sample in `Samples/Example VinaGenUIDocument/`. |
| Explore effects | **Open → Particles** → open a texture or particle library. |
| Create with an assistant | **Open → MCP Bridge → Start**, then use `/vina` or `$vina` in your project chat. |

Paths in this table are relative to `Assets/VinaGen AI Toolkit/`. For editor menus, start at **Tools → VinaGen AI Toolkit**.

## Save your work

Use **Save asset** for graphs and **Save** for UI documents. Canvas import creates scene objects; save the scene yourself.

AI chat and provider image generation require your own account and credentials. Configure them in **Settings → AI Settings** when needed.

[Next: Flow & Design Graphs](graphs.md)
