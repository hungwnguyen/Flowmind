# Settings

Open **Tools → VinaGen AI Toolkit → Open → Settings**. Click **Open** on a card to select its asset in Unity's **Inspector**. Expand a section to see its fields; changes are stored on that project asset.

![Settings tab with all seven settings cards](images/toolkit-settings.png)

These screenshots were captured on this computer on **13 October 2026**, using **Unity 6000.3.22f1**. Values shown belong to the demo project; use your own folders, resolution and provider.

Click an image to enlarge it when reading Inspector labels.

## AI Provider Settings

![AI Provider Settings; API Keys is collapsed](images/settings-ai.png)

1. Expand **AI Chat** and choose **Active Provider**.
2. Enter your key in **API Keys** and keep it private.
3. Use **Refresh Models / Select Model**, or enter a supported **Custom Model**.
4. Open [Agent Chat](ai-chat.md) to use the selected account.

**Conversation Behaviour** controls prompt caching and code syntax repair. **Chat UI & Appearance** controls input height/font size and links to graph/design settings. **MCP & Automation → Particle Defaults → Particle Output** selects Web Preview, scene placement or prefab output. **Image Generation** contains image-source/provider options. Provider credits are separate; model refresh and generation may contact the service.

## Graph Appearance and Design Content

<div class="vg-pair">
  <figure><img src="images/settings-graph.png" alt="Graph Appearance: comment name, canvas colors, nodes and connections" loading="lazy"><figcaption>Graph Appearance: comment name, canvas/grid, node and connection colors.</figcaption></figure>
  <figure><img src="images/settings-design.png" alt="Design Content: font, numbered stamp and frame size defaults" loading="lazy"><figcaption>Design Content: font, colors, numbered stamps and default frame size.</figcaption></figure>
</div>

Set **Comment Display Name** before leaving web review comments. Change graph colors for your preferred contrast. **Design Content Settings** supplies **Node Font / Node Font Size**, **Default Stamp Color / Scale** and **Default Node Size**. Open a [graph](graphs.md) to check the result; defaults do not replace authored screen content.

## UI Designer Settings

<div class="vg-pair">
  <figure><img src="images/settings-ui-assets.png" alt="UI Designer asset folders, Button prefab and font registration" loading="lazy"><figcaption>Project assets: destinations, Button prefab and fonts.</figcaption></figure>
  <figure><img src="images/settings-ui-canvas.png" alt="UI Designer resolution, scaling, anchors and Linear alpha" loading="lazy"><figcaption>Canvas defaults: resolution, scaling, snap and import behavior.</figcaption></figure>
</div>

| Field | How to use it |
| --- | --- |
| **Image folder / Document folder** | Keep toolkit output under `Assets/VinaGen AI Toolkit/Content/UI/`. **Browse** selects a project folder. |
| **Button prefab** | Optional Canvas button template. Empty uses the bundled prefab; add a Text child in the design for a caption. |
| **VinaGenText fonts** | **Add bundled VinaGenText fonts** registers supplied fonts. |
| **TextMesh Pro fonts** | **Create TMP starter fonts** prepares fonts from official TMP resources when needed. |
| **Custom fonts** | Drop TTF/OTF fonts here for Text and browser use. |
| **Default screen resolution** | Width/height for new documents. Existing documents retain their saved size for import and Game View. |
| **Canvas scaling → Match** | 0 favors width; 1 favors height. Check portrait and landscape layouts. |
| **Snap grid (px)** | Positioning grid increment. |
| **Auto adjust anchors** | Derive anchors during editing/import; disable when preserving manual anchors. |
| **Linear alpha** | Choose Gamma Compositor or Compensate Alpha, then compare Game View with the browser. |
| **Keyboard shortcuts** | Expand to customize commands; reopen browser settings to refresh. |

Use **Open UI Designer in browser** to return to your workspace. [UI Designer](ui-designer.md) explains Canvas/UI Toolkit import.

## Particle libraries

<div class="vg-pair">
  <figure><img src="images/settings-textures.png" alt="Partitioned Particle Texture Library catalog index" loading="lazy"><figcaption>Texture library: expand Index Entries to inspect aliases.</figcaption></figure>
  <figure><img src="images/settings-prefabs.png" alt="Bundled Particle Library prefab records and selection preference" loading="lazy"><figcaption>Prefab library: paths, categories and system counts.</figcaption></figure>
</div>

**Particle Texture Library** stores aliases, tags and catalog references. In a partitioned library, **Entries** can be empty while **Index Entries** contains the catalog. Inspect the matching partition or use MCP `list_particle_textures` / `inspect_particle_texture` for details.

**Bundled Particle Library → Prefabs** lists names, paths, categories and Particle System counts. **Prefer For Prompt Creation** controls whether prompt creation prefers supplied effects. Open a listed prefab in Project to inspect native modules. For shader repair, use **Particles → Repair Materials For Active Pipeline**.

## Particle WebGL Preview Settings

![Particle WebGL settings: camera and explicit capture options](images/settings-web-particle.png)

| Section | Adjusts |
| --- | --- |
| **Render Pipelines** | Pipeline asset references for supported preview/export paths. HDRP browser rendering uses a compatibility pipeline. |
| **Output Root** | Preview bundles/cache; default `Library/VinaGen/ParticlePreview`. |
| **Capture Output Root** | Destination when posting frames to Unity; default `Assets/VinaGen AI Toolkit/Samples/GeneratedParticles/Captures/`. |
| **Review Target** | **Demo Effects**, or **Prefab** plus **Reviewed Prefab**. |
| **Camera Orbit / Target Height** | Angle, distance and framing. Move back if the effect clips. |
| **Bloom** | Expand for enabled, intensity, threshold, scatter and HDR brightness. Verify glow in the intended pipeline. |
| **Screenshot → Capture** | Times, dimensions, contact-sheet columns, simulation, seed and output options. |

**Opening the player never starts a capture.** The legacy **Capture → Enabled** checkbox is ignored at startup. An AI Agent or an explicit browser command must request frames. **Post To Sink** writes to Unity; **Download** saves through the browser. `postToSink:false` returns frames without writing to the Unity project. See [Web Particle review](webgl-preview.md) for the AI testing workflow.

## Text settings

Open **Tools → VinaGen AI Toolkit → Text → Settings**.

![VinaGenText Settings: Font Studio, output and new-text defaults](images/settings-text.png)

- **Font Studio → Create Font…:** build a font with the characters your game needs.
- **Output Folder:** destination for bakes and shared atlas pages. This version displays the legacy `Assets/VinaGen Text Bakes` default. For toolkit/sample output, choose a folder inside `Assets/VinaGen AI Toolkit/`, such as `Samples/Text Effects/Bakes/` under that root. Private PSD imports retain their own owned folder.
- **Auto Bake New Texts:** default for new labels; existing labels retain their component setting.
- **Shared Atlas:** compatible baked labels in the same output folder can share texture pages.

See [VinaGenText](vinagen-text.md) for rendering modes and [demos](demos.md) for a first practice run.

## Settings files

Settings live in `Assets/VinaGen AI Toolkit/Settings/` and use the robot icon. **Open Settings Folder** selects this folder in Project. Portable export excludes personal provider settings; keep credential-bearing files out of Git and shared packages.

[Next: Folder Layout](folder-layout.md)
