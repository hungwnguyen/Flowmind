# WebGL Particle Preview

Preview and adjust a particle effect in a supplied browser player.

## Open

Choose **Tools → VinaGen AI Toolkit → Editors → Open Particle Preview → Built-in / URP / HDRP**.

Keep Unity open: its bridge serves the player over HTTP. Native prefab bundle export needs Unity Hub's **WebGL Build Support** module. The players are prebuilt.

HDRP effects use a compatible URP/Built-in preview. Check final HDRP shading in Unity.

## Review an effect

1. Open the preview URL returned by the toolkit. For an MCP job, wait until `webPreviewStatusUrl` reports success.
2. Use **Play / Pause / Restart** and **Time scale** to inspect motion.
3. Select a particle system to change size, lifetime or color.
4. Use **Capture frame** or **Download PNG** when you want an image.

Opening the player does not capture automatically. See [Particles & Textures](particles.md) for the website demos.

## Repeatable captures

Use explicit times and a fixed seed when comparing changes:

```js
const fx = window.vinagenParticlePreview;
await fx.waitForReady();
await fx.capture({
  times: [0.2, 0.8, 1.6],
  simulate: true,
  randomSeed: 12345,
  postToSink: false
});
```

Choose times around startup, peak and fade. Configure camera, bloom and output in **Settings → Particle WebGL Preview Settings**. Captures default to `Samples/GeneratedParticles/Captures/` inside the toolkit.

[Next: AI Chat & Providers](ai-chat.md)
