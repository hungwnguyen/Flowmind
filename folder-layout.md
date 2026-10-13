# Folder Layout

The installed toolkit lives in `Assets/VinaGen AI Toolkit/`.

## Main folders

Paths below are relative to the toolkit root.

| Folder | Contents |
| --- | --- |
| `Editor/`, `Runtime/` | Editor tools, runtime components and shaders. |
| `Content/UI/Documents/`, `Content/UI/Images/` | Default UI documents and uploaded images. |
| `Content/Particles/ToonLibrary/` | Bundled particle prefabs and dependencies. |
| `Images/Particles/` | Particle textures and manifests. |
| `VinaTextPro/Fonts/` | Fonts used by bundled samples and settings. |
| `Samples/Graphs/` | Flow and Design graph examples. |
| `Samples/Example VinaGenUIDocument/` | Complete UI sample. |
| `Samples/GeneratedParticles/` | Generated particle prefabs, materials, textures and captures. |
| `Settings/`, `Skills/`, `Documentation/` | Configuration, assistant instructions and reference docs. |
| `Samples/GeneratedParticles/Preview/Scenes/` | Project particle preview scene. |

## Output outside the toolkit

- **Text styles, gradients and fonts:** `Assets/VinaGenGenerated/Text Styles/`, `Text Gradients/` and `Fonts/VinaGenText/`. Styles and gradients left in the toolkit's old `VinaTextPro` folders move here automatically with references preserved. See [VinaGenText](vinagen-text.md#create-a-label).
- **Private PSD imports:** `Assets/VinaGen PSD Imports/<PSD name>/` keeps each import's document, images, styles, fonts and bakes together.
- **Baked text:** this version has the legacy `Assets/VinaGen Text Bakes/` default. For toolkit/sample output, choose `Assets/VinaGen AI Toolkit/Samples/Text Effects/Bakes/` in Text Settings.
- **Caches and jobs:** `Library/`; review reports may use `Builds/`.

UI and particle defaults above match the current code. Choose graph destinations when creating them; older projects may retain legacy output paths.

The WebGL player is downloaded once per computer to `%USERPROFILE%/AppData/LocalLow/VinaGen/AIToolkit/WebGLPlayer`. Project bundles live in `Library/VinaGen/ParticlePreview/<Pipeline>/fx/`. Author-only builders live separately in `Assets/VinaGen Developer Tools/`; users use the prebuilt player. See [Web Particle](webgl-preview.md).

[Next: FAQ & Troubleshooting](faq.md)
