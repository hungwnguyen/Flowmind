# Folder Layout

The installed toolkit lives in `Assets/VinaGen AI Toolkit/`.

## Toolkit folders

Paths below are relative to the toolkit root.

| Folder | Contents |
| --- | --- |
| `Editor/`, `Runtime/` | Editor tools, runtime components and shaders. |
| `MockGraph/` | Flow and Design graph data types. |
| `StandaloneText/` | VinaGenText components, shaders, fonts and editor. |
| `VinaTextPro/Fonts/` | Fonts used by bundled samples and settings. |
| `DesignCaptureStudio/` | Screen and scene capture tools for the Editor. |
| `Content/UI/` | Bundled UI prefabs. New UI documents go to `Documents/`, uploaded images to `Images/`. |
| `Content/Particles/` | Bundled particle library (`ToonLibrary/`), materials, meshes and recipes. |
| `Images/Particles/` | Particle texture sets and manifests. |
| `Samples/Graphs/` | Flow and Design graph examples. |
| `Samples/Example VinaGenUIDocument/` | Complete UI sample. |
| `Samples/Particles/`, `Samples/Text Effects/` | Particle and text effect samples. |
| `Samples/GeneratedParticles/` | Assistant-generated particles: prefabs, `Materials/`, `Textures/` and the preview scene in `Preview/Scenes/`. |
| `Settings/` | Settings assets, including AI Provider Settings. |
| `Skills/`, `Documentation/` | AI assistant instructions and reference docs. |

## Output outside the toolkit

| Path | Contents |
| --- | --- |
| `Assets/VinaGenGraphs/BlockDiagrams/`, `WhiteFrames/` | Flow and Design graphs created through MCP without a path. |
| `Assets/VinaGenGenerated/` | VinaGenText `Text Styles/`, `Text Gradients/`, `Fonts/VinaGenText/`, and chat-generated `Code/`. See [VinaGenText](vinagen-text.md?id=create-a-label). |
| `Assets/VinaGen PSD Imports/<PSD name>/` | Each PSD import's document, images, styles, fonts and bakes. |
| `Assets/VinaGen Text Bakes/` | Baked text; change the destination in Text Settings. |
| `Library/VinaGen/` | Caches, UI recovery and particle preview bundles (`ParticlePreview/<Pipeline>/fx/`). |

The WebGL player used by [Web Particle](webgl-preview.md) is downloaded once per computer to `%USERPROFILE%/AppData/LocalLow/VinaGen/AIToolkit/WebGLPlayer` on Windows, or `~/.local/share/VinaGen/AIToolkit/WebGLPlayer` on macOS/Linux.

Older projects may still have files in legacy paths, such as `VinaTextPro/Text Styles/` (moved to `Assets/VinaGenGenerated/` automatically) or `Assets/VinaGenParticles/` (still readable).

[Next: FAQ & Troubleshooting](faq.md)
