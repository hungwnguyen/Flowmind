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
| `VinaTextPro/Fonts/`, `VinaTextPro/Text Styles/` | Fonts and reusable text styles. |
| `Samples/Graphs/` | Flow and Design graph examples. |
| `Samples/Example VinaGenUIDocument/` | Complete UI sample. |
| `Samples/GeneratedParticles/` | Generated particle prefabs, materials, textures and captures. |
| `Settings/`, `Skills/`, `Documentation/` | Configuration, assistant instructions and reference docs. |
| `WebGLBuilds/ParticlePreview/` | Supplied WebGL players. |

## Output outside the toolkit

- **Private PSD imports:** `Assets/VinaGen PSD Imports/<PSD name>/` keeps each import's document, images, styles, fonts and bakes together.
- **Baked text:** `Assets/VinaGen Text Bakes/` by default. Change it in Text Settings.
- **Caches and jobs:** `Library/`; review reports may use `Builds/`.

UI and particle defaults above match the current code. Choose graph destinations when creating them; older projects may retain legacy output paths.

[Next: FAQ & Troubleshooting](faq.md)
