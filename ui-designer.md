# UI Designer — Offline (Unity)

Build screens, popups and UI components from editable layers. Export them as PSD/PNG, or turn them into a Unity Canvas.

<nav class="vg-designer-nav" aria-label="UI Designer guide"><a href="#/designer-guide">Overview</a><a href="#/web-designer">Online · Web</a><a href="#/ui-designer" aria-current="page">Offline · Unity</a></nav>

The Offline version runs with VinaGen AI Toolkit in your Unity project. Its editor opens in your browser through a local connection; keep Unity running while editing. Without Unity, choose [Online · Web Designer](web-designer.md).

Shared editing steps and icons are in [Overview](designer-guide.md). This page covers Unity access and resources.

## Open

Choose **Tools → VinaGen AI Toolkit → Editors → Open UI Designer**, or double-click a `VinaGenUIDocument` asset.

![UI Designer with the bundled sample](images/ui-designer.png)

## Unity project resources

**Files** browses project documents; **Assets → Choose folder…** selects a folder inside `Assets/` before browsing images. Drag thumbnails or use an `Assets/...` path to add artwork. New images use UI Designer Settings or the document’s image-folder override.

![Project Files tab](images/ui-files.png)

![Choosing Unity Assets](images/ui-assets.png)

Each PSD import owns `Assets/VinaGen PSD Imports/<PSD name>/` for images, styles and its document; this scope persists through save and Canvas import. Fusion creates/updates a project PNG; Undo restores layers but keeps the PNG. Save/Canvas import can optimize shared 9-slice source images while retaining their GUID; documents sharing that source receive the change.

## Fonts, Text type and TMP materials

**Typography → Text type** offers **Text**, **TextMesh Pro** and **VinaGenText**. Register fonts in **Settings → UI Designer Settings**; **Editors → Create UI Designer TMP starter fonts** creates ready-to-use TMP fonts. Re-import Canvas after changing Text type.

**PSD import → Default font** selects a registered font when PSD fonts are missing. TMP materials and presets must match the font atlas. See [VinaGenText](vinagen-text.md) for gradients, outlines and baked text.

## Layer mapping in Unity

**Add Component** assigns Image/Button/Text/Group roles (`Alt+2–5`); **Canvas Group** adds opacity, interaction and raycasts. These are Unity-specific properties on top of shared design tools.

| Layer | Becomes in Unity |
| --- | --- |
| **Empty / Group** | An empty `RectTransform`. |
| **Image** | `Image` (shapes use `VinaGenUIShape`). |
| **Button** | Image + Button from your Button prefab. Add a Text child for a label. |
| **Text** | Text, TextMeshPro or VinaGenText, based on **Text type**. |
| **Canvas Group** | `CanvasGroup` (opacity, interactable, raycasts). |
| **Horizontal / Vertical / Grid** | The matching LayoutGroup. |

9-slice becomes a Sliced Sprite, shapes become `VinaGenUIShape` and Clip becomes `RectMask2D`. Canvas uses standard alpha blending; blend modes and effects may differ from the browser preview.

## Transfer to Unity Canvas

1. **Save** the document.
2. In Unity, select a Canvas (or nothing — a new Canvas will be created).
3. Choose **Canvas** in the **Unity UI system** dropdown and click the import icon next to it.
4. Check the result in Hierarchy and Game View.
5. Hook up your buttons and **save the scene**. Save the root as a prefab to reuse it.

You can also select the `VinaGenUIDocument` asset, set **Target Canvas** in the Inspector and click **Import to Canvas**.

Each import creates a new copy (one Undo step). Old imports are not updated or removed.

![Sample Canvas result in Unity Game View](images/ui-canvas-demo.png)

### Screens and popups

Each **Screen root** (or container marked **Import as popup**) becomes its own screen under the Canvas, centered. Full-screen roots stretch; smaller popups are centered. Hidden roots import as inactive. Layers outside any root are skipped.

### Anchors, layouts and buttons

- **Auto adjust anchors** (UI Designer Settings) sets anchors from each layer's position. Turn it off to keep your own.
- **Horizontal / Vertical / Grid** become working Unity LayoutGroups.
- Buttons are built from **UI Designer Settings → Button prefab**.

### Colors in Linear projects

If colors look different from the browser in a Linear-color project, use **VinaGenUIGammaCompositor**, or **Linear alpha → Compensate Alpha** in Settings. Always check Game View.

## Transfer to Unity UI Toolkit

1. Exit Play Mode and Prefab Mode; save the document.
2. Choose **UI Toolkit** in the **Unity UI system** dropdown and click import.
3. Check the UXML in the **UI Toolkit/** folder and the **UIDocument** in the scene. Save the scene.

Use `ShowScreen(layerId)`, `FindLayer(layerId)` and `ButtonClicked` to connect your game. Some text effects, shapes and custom components aren't fully supported — read the warnings and compare the result.

## Save and settings

**Save** (`Ctrl/Cmd+S`) stores the `VinaGenUIDocument`. **Show in Editor** selects it in the Project window.

**Settings → UI Designer Settings** holds folders, fonts, Button prefab, default resolution, anchors and shortcuts.

AI assistants can capture screenshots of each screen through [MCP Bridge](mcp-bridge.md).

**Export SVGPRO** saves the document first, then downloads its resources as a package. Drop it into another Unity project to import it.

Version-specific defaults: **R** selects Image, **F** selects Group; **Alt+2/3/4/5** assign Image/Button/Text/Group roles; **Ctrl/Cmd+Shift+I** imports into Unity. Change bindings in UI Designer Settings.
