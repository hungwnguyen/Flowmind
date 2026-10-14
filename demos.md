# Demos and first practice runs

Learn each tool with the bundled samples. Paths are relative to `Assets/VinaGen AI Toolkit/`.

## UI Designer: three editable screens

1. Open **Tools → VinaGen AI Toolkit → Editors → Open UI Designer**.
2. In **Files**, open `Samples/Example VinaGenUIDocument/VinaGenUIDocument.svgpro`.
3. In **Layers**, look through the Settings screen and two popups. Click a Text or Image layer to see its options.
4. Change some text or a color, then **Save**. (Duplicate the file first if you want to keep the original.)
5. Choose **Canvas** in the Unity UI system dropdown and click import. Check Game View, then save the scene.

![Files tab with the bundled UI document open](images/ui-files.png)

![Three screens in the sample UI Designer document](images/ui-designer.png)

A finished result is in `Samples/Example VinaGenUIDocument/Scenes/UI.unity`.

![UI sample in Unity Game View alongside Hierarchy and Project](images/ui-canvas-demo.png)

**Check:** text is readable, the popup is centered, images show up and layout adapts when you resize. Buttons still need to be connected to your game code. More in [UI Designer](ui-designer.md).

## VinaGenText: decorated labels

Open `Samples/Text Effects/ILoveYouTextShowcase.asset` in UI Designer. Select a label to see its style and effects.

![Bundled text showcase in UI Designer](images/vinagen-text-demo.png)

Change a caption or gradient. For fixed text, select the label in Unity and set **Rendering → Static Baked → Bake / Rebuild**. Keep scores and timers on Dynamic. Save the scene afterward.

**Check:** all characters display, effects are readable at game size, and you re-bake after edits. More in [VinaGenText](vinagen-text.md).

## Flow and Design graphs

Open **Editors → Open Flow Editor** → `Samples/Graphs/NewMockFlowGraph.asset`. Follow the path Start → Action → Decision → End. Make a small change and click **Save asset**.

![Bundled Flow graph workspace](images/flow-editor.png)

Open `Samples/Graphs/NewDesignContentGraph.asset` to see screen sketches with numbered notes. Double-click a frame to read its description.

![Design graph sample and screen callouts](images/design-editor.png)

**Check:** each decision has clear branches and each numbered note is explained. Graphs are plans — you still write the game code. More in [Flow & Design Graphs](graphs.md).

## Particles

Try the eight [Particle demos](particles.md) on this site, or open your project's preview via **Editors → Open Particle Preview**. Pick an effect, click **Restart**, slow down **Time scale** and select each **Particle target**.

![Particle demo running in the prebuilt WebGL player](images/particle-web-demo.png)

**Check:** you can see the start, peak and fade; the effect fits in the camera; trails work when the emitter moves. To let an AI agent test effects like this, see [Web Particle](webgl-preview.md).

## Keep your work organized

Keep generated UI, fonts, styles and particles inside the toolkit folder, next to their sample. PSD imports go to `Assets/VinaGen PSD Imports/<PSD name>/`. See [Settings](settings.md) to change defaults.
