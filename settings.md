# Settings

> Every toolkit setting is a ScriptableObject under `Assets/VinaGen AI Toolkit/Settings/`, marked with the robot icon.

Open them from **Tools → VinaGen AI Toolkit → Settings** or from the **Settings** tab of the toolkit window.

<div class="vg-pair">
  <figure><img src="images/toolkit-settings.png" alt="Settings tab of the toolkit window"><figcaption>The Settings tab opens each asset in the Inspector.</figcaption></figure>
</div>

| Menu | Asset | Configures |
| --- | --- | --- |
| **AI Settings** | `VinaGenCopilotSettings` | Providers, models, credentials and image-generation options. |
| **Graph Appearance** | `GraphEditorAppearanceSettings` | Graph editor and chat appearance, web comment display name. |
| **Design Content Settings** | `DesignContentEditorSettings` | Frame size, colors, fonts and numbered labels. |
| **UI Designer Settings** | `VinaGenUIStudioSettings` | Document folders, fonts, Canvas resolution, snap grid and keyboard shortcuts. |
| **Particle Texture Library** | `VinaGenParticleTextureLibrary` | Catalog, aliases, tags, provenance and selection metadata. |
| **Bundled Particle Library** | `VinaGenBundledParticleLibrary` | Effect prefabs and automatic selection preferences. |
| **Particle WebGL Preview Settings** | `VinaGenParticleWebPreviewSettings` | Pipelines, build folders, camera, bloom and capture defaults. |
| **Text → Settings** (Text menu) | `VinaGenTextSettings` | VinaGenText defaults. |
| **Open Settings Folder** | — | Pings the Settings folder in the Project window. |

## Personal vs. shared settings

Settings are recreated automatically in a new project. **Personal settings and credentials are excluded** from portable exports — never commit or share credential-bearing assets.

## The robot icon convention

Any ScriptableObject asset saved under `Assets/VinaGen AI Toolkit/Settings/` receives the robot icon automatically: an import postprocessor applies it and a startup sweep fixes older assets.

When extending the toolkit with a new settings type:

```csharp
[CreateAssetMenu(fileName = "YourSettingsName", menuName = "VinaGen AI Toolkit/Settings/Your Settings Name")]
public sealed class YourSettingsName : ScriptableObject
{
    // settings fields...
}
```

1. Make `fileName` match the class name exactly.
2. Save the `.asset` under `Assets/VinaGen AI Toolkit/Settings/`.
3. Only if the asset must live elsewhere, add its type to `SettingsIconTargetTypes` in `VinaGenSettingsUtility.cs`.
4. Create it through `[CreateAssetMenu]` or `VinaGenSettingsUtility.GetOrCreateAsset<T>` so the icon hooks run.

---
[Next: Folder Layout](folder-layout.md)
