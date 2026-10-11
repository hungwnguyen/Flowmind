# Folder Layout

> Reusable product code and content live in `Assets/VinaGen AI Toolkit/`. Everything **you** create goes to separate `Assets/VinaGen*` folders.

## Toolkit folder

| Folder | Contents |
| --- | --- |
| `Editor/Core`, `Graph`, `Design`, `Chat` | Entry windows, native graph/design editors, chat and providers. |
| `Editor/Bridge`, `UIStudio` | HTTP/MCP transport and document tools; UI documents, Canvas import, text and previews. |
| `Editor/Particles` | Creation, textures/catalogs, materials, libraries, authoring, inspection, preview and review. |
| `Editor/Images`, `Settings`, `Packaging` | Image authoring, settings inspectors/icon hooks and portable export. |
| `Editor/WebGraph` | Bundled browser editor (HTML/CSS/JS). |
| `Runtime/` | Runtime code for graphs, UI, text and particles, plus shaders and WebGL interop. |
| `Content/Particles/ToonLibrary` | Bundled particle prefabs, materials, textures and artwork. |
| `Content/UI/Prefabs` | Reusable UI templates. |
| `Images/` | Particle textures and manifests, editor icons, previews and documentation screenshots. |
| `Settings/` | Settings assets (robot icon) and per-dataset texture metadata. |
| `Samples/` | Example graphs, UI document and particles. |
| `Skills/` | Modular AI skill instructions (router + one skill per intent). |
| `StandaloneText/`, `VinaTextPro/` | VinaGenText engine, fonts, styles and gradients. |
| `DesignCaptureStudio/`, `MockGraph/` | Canvas Design Capture and the bundled mock graph. |
| `WebGLBuilds/ParticlePreview` | Prebuilt, versioned Built-in/URP preview players. |
| `Documentation/` | In-package documentation. |

## Your project output

| Folder | Contents |
| --- | --- |
| `Assets/VinaGenUI/` | UI images (including `PSD Imported/`), fonts and text styles from UI Designer. |
| `Assets/VinaGen PSD Imports/<PSD name>/` | Images and text styles from each PSD import. |
| `Assets/VinaGenParticles/` | Generated prefabs, materials, textures, preview scenes and captures. |
| `Assets/VinaGenGraphs/` | Block diagrams and white frames. |
| `Assets/VinaGenGenerated/Code` | Default location for generated source code. |
| `Assets/VinaGenImages/Generated` | Personal generated artwork and provenance. |
| `Library/…` | Rebuildable caches, jobs and web snapshots. |
| `Builds/…` | Review captures and verification reports. |

None of these folders are required to install the toolkit, and they are excluded from toolkit redistribution.

## Portable export

`VinaGenPackageExporter` writes a filtered `.unitypackage` plus a sibling `.unitypackage.audit.json` listing included assets, exclusions and dependency problems. It excludes personal settings, credentials, generated artwork, user output, WebGL caches and tests. Batch export from a **closed** project:

```sh
Unity -batchmode -quit -projectPath <project> -executeMethod FlowCanvasExporter.Editor.VinaGenPackageExporter.ExportBatch -vinagenPackage <destination.unitypackage>
```

> Don't export the working folder with **Include dependencies** — that pulls in personal outputs the exporter deliberately filters.

---
[Next: FAQ & Troubleshooting](faq.md)
