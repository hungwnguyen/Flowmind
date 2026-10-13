# Demos and first practice runs

Start with the bundled samples to learn each workspace. Paths below are relative to `Assets/VinaGen AI Toolkit/`. Screenshots show the actual toolkit on this computer, **Unity 6000.3.22f1**, captured **13 October 2026**.

## UI Designer: three editable screens

1. Open **Tools → VinaGen AI Toolkit → Editors → Open UI Designer**.
2. In **Files**, open `Samples/Example VinaGenUIDocument/VinaGenUIDocument.svgpro` (its `.asset` working copy also opens the design).
3. Switch to **Layers**. Inspect the Settings screen and the two popup screens. Select a Text layer to see Typography; select an Image to see its artwork/layout.
4. Make a small text or color edit, then **Save**. Duplicate the document first when keeping the original sample.
5. Select **Canvas** in the Unity UI system selector and use its import button. Inspect Game View and save the scene yourself. Each Screen root is centered independently.

![Files tab with the bundled UI document open](images/ui-files.png)

![Three screens in the sample UI Designer document](images/ui-designer.png)

The sample scene `Samples/Example VinaGenUIDocument/Scenes/UI.unity` provides a native Canvas result. Open it after saving your current scene. The captured Game View below shows its score popup; visibility depends on which screen roots are active.

![UI sample in Unity Game View alongside Hierarchy and Project](images/ui-canvas-demo.png)

**Check:** text is readable, the popup is centered, anchors respond to resizing, images resolve, and Button behavior is connected to your game. Import creates UI objects; it does not infer gameplay from button names. Read [UI Designer](ui-designer.md) for components, import limits and export.

## VinaGenText: compare decorated labels

Open `Samples/Text Effects/ILoveYouTextShowcase.asset` in UI Designer. Select a label and inspect **Typography → Text type → VinaGenText** and its style/effect controls.

![Bundled text showcase in UI Designer](images/vinagen-text-demo.png)

Try changing one caption or gradient, then compare the browser and Canvas. For a fixed label, select the imported VinaGenText component in Unity, choose **Rendering → Static Baked** and **Bake / Rebuild**. Use Dynamic for scores/timers. Save the scene or prefab after baking; [Text Settings](settings.md#text-settings) controls the output folder and shared atlas.

**Check:** the font includes your characters, strokes/gradients remain legible at game size, and a stale bake is rebuilt after edits. See [VinaGenText](vinagen-text.md) for modes and benchmark context.

## Flow and Design: inspect the supplied plans

Open **Editors → Open Flow Editor**, then select `Samples/Graphs/NewMockFlowGraph.asset`. Follow Start → Action → Decision → End, inspect branch labels, and use **Save asset** after a small edit.

![Bundled Flow graph workspace](images/flow-editor.png)

Open `Samples/Graphs/NewDesignContentGraph.asset` to inspect screen frames and numbered callouts. Double-click a frame to read its document beside the reference image.

![Design graph sample and screen callouts](images/design-editor.png)

**Check:** decision branches are explicit and the screen specification explains the marked controls. Graphs are editable plans; connect behavior to your game code. See [Flow & Design Graphs](graphs.md).

## Particles: playback, layers and AI review

Use the eight embedded [Particles demos](particles.md), or open a project's local preview through **Editors → Open Particle Preview**. Choose an effect, **Restart**, lower **Time scale**, and inspect each **Particle target**.

![Particle demo running in the prebuilt WebGL player](images/particle-web-demo.png)

**Check:** startup, peak and fade are visible; the effect stays inside the camera; motion/trails work when the source moves. Web Particle's primary purpose is to let an **AI Agent test the effect it creates**, view timed captures, fix the Unity asset and test again. The [Web Particle guide](webgl-preview.md) includes the full loop and actual comparison frames.

## Keep practice work organized

Save toolkit-generated UI, fonts, materials, styles and particle outputs inside the toolkit root, keeping resources with their sample. Private PSD imports retain `Assets/VinaGen PSD Imports/<PSD name>/`. Settings screenshots show this machine's values, not universal presets. See [Settings](settings.md) before changing defaults.
