# Web Particle: AI Agent testing

**Web Particle lets an AI agent see and test the particle effects it creates.** The agent plays the effect in a browser, takes screenshots at key moments, checks them, fixes the effect in Unity and tests again. You can use the same preview yourself.

![Portal demo in the real WebGL player with playback controls](images/particle-web-demo.png)

The [website demos](particles.md) show the bundled effects. In your project, the preview loads your own particle prefabs. Changes made in the browser are for testing only — they are not saved back to Unity.

## Prepare the player

1. Keep Unity open and start **Open → MCP Bridge**.
2. Go to **Tools → VinaGen AI Toolkit → Open → Particles**. Under **Particle WebGL player**, click **Download** (once per computer; use **Update** when a new version is out).
3. Open **Editors → Open Particle Preview → Built-in / URP / HDRP**.

![Particles tab with the installed shared player](images/toolkit-particles.png)

## How the AI agent tests an effect

1. **Create** — the agent builds the particle prefab.
2. **Load** — it opens the effect in the web preview.
3. **Capture** — it takes screenshots at the start, peak and fade, using a fixed random seed so results are comparable.
4. **Check** — it looks at every image for problems: wrong colors, cut-off edges, empty frames, bad timing.
5. **Fix** — it edits textures, materials or emission in Unity and reloads.
6. **Repeat** until the effect matches your request, then reports the result with screenshots.

Example request:

```text
$vina create a toon explosion with offline artwork, then test it in Web Particle.
Capture startup, peak and fade with the same seed. Inspect every image,
fix clipping or timing problems, and re-test the saved Unity prefab.
```

See [Create from chat](create-from-chat.md) and [MCP Bridge](mcp-bridge.md) to set this up.

## Repeatable captures

```js
const fx = window.vinagenParticlePreview;
await fx.waitForReady();
const frames = await fx.capture({
  times: [0.08, 0.18, 0.8], // Example for this short explosion; adapt to your effect.
  simulate: true,
  randomSeed: 12345,
  width: 960,
  height: 640,
  motion: { enabled: false },
  postToSink: false
});
```

Frames from `toon_explosion` (seed 12345, Built-in pipeline):

<div class="vg-pair">
  <figure><img src="images/particle-review-1.png" alt="Toon explosion camera frame at 0.08 seconds" loading="lazy"><figcaption>0.08 s — initial flash and silhouette.</figcaption></figure>
  <figure><img src="images/particle-review-2.png" alt="Toon explosion camera frame at 0.18 seconds" loading="lazy"><figcaption>0.18 s — expanding body and smoke layers.</figcaption></figure>
  <figure><img src="images/particle-review-3.png" alt="Toon explosion camera frame at 0.8 seconds" loading="lazy"><figcaption>0.80 s — late smoke and remaining particles.</figcaption></figure>
</div>

- `postToSink: true` saves frames into the Unity project; `download: true` downloads them in the browser.
- Nothing is captured until someone calls `capture()`.
- Camera, bloom and capture defaults: [Particle WebGL Preview Settings](settings.md#particle-webgl-preview-settings).

## Manual controls

| Control | Use |
| --- | --- |
| **Particle target** | Pick one system or all. |
| **Play / Pause / Restart** | Replay the effect. |
| **Time scale** | Slow motion to inspect timing. |
| **Lifetime / Start size / Emission / Start color** | Tweak values, then **Apply basics**. |
| **Motion & rendering** | Camera distance, render mode and emitter movement. |
| **Import & developer tools** | Import files, run commands and capture (website demo). |

![Web Particle with Motion and rendering expanded](images/particle-web-motion.png)

To test moving effects (trails), use **Emitter motion → Arc / Line / Circle…**, set start/end points and duration, then **Apply path**.

![Website demo Capture frame and Download PNG controls](images/particle-web-capture.png)

## Troubleshooting

- **Player missing or outdated:** download/update it from the Particles tab.
- **Blank or cut-off frame:** restart, pick a time while the effect is active, move the camera back.
- **Pink materials:** run **Repair Materials For Active Pipeline** and reload.
- **HDRP:** the browser shows an approximation. Check final HDRP look in Unity.
- **Can't load a file:** only `.vgfx.json` exported by the toolkit works — not `.prefab` or `.unitypackage`.
- **Custom scripts / VFX Graph:** not supported in the web player; test them in Unity.

[Next: AI Chat & Providers](ai-chat.md)
