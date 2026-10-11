# WebGL Particle Preview

> Review particle effects in a prebuilt browser player — with **explicit, seeded captures** so AI and humans compare exactly the same frames.

## What ships

The toolkit includes compressed, versioned **Built-in** and **URP** players under `WebGLBuilds/ParticlePreview`. Each `player-release.json` lists the release files. End users use the supplied player — you do not build it.

- Exporting native prefab bundles requires Unity Hub's **WebGL Build Support** module.
- **HDRP** cannot render natively in WebGL; the browser uses a URP/Built-in compatibility proxy. Check final HDRP shading in the Editor or a desktop player.

Open a player from **Tools → VinaGen AI Toolkit → Editors → Open Particle Preview → Built-in / URP / HDRP**.

## Preview settings

Configure source, framing, pipeline, bloom and capture defaults in **Tools → VinaGen AI Toolkit → Settings → Particle WebGL Preview Settings** (`VinaGenParticleWebPreviewSettings`). Preview output (prefabs, materials, captures) belongs under `Assets/VinaGenParticles`; temporary bundles and jobs live in `Library`.

## How loading works

Serve the player over HTTP — the Unity bridge does this for you. Raw prefab YAML and `.unitypackage` files cannot be loaded by WebGL. Effects are sent as native **WebGL LZ4 AssetBundles**, preserving modules, curves, gradients, hierarchy, sub-emitters, materials, meshes and textures.

When you create an effect through MCP with `web_preview`, wait for `webPreviewStatusUrl` to succeed, then open `webPreviewUrl`.

## Capture explicitly

Opening the player, importing and watching a manifest **do not capture images**. Choose capture times that match the effect lifetime — typically **startup, peak and fade** — and use seeded simulation for repeatable comparison.

```js
const fx = window.vinagenParticlePreview;
await fx.waitForReady();
await fx.importManifest('fx/manifest.json');

const frames = await fx.capture({
  times: [0.2, 0.8, 1.6],
  simulate: true,
  randomSeed: 12345,
  width: 512, height: 512,
  postToSink: false,
  motion: {
    enabled: true, path: 'arc', space: 'viewport',
    start: [0.25, 0.5, 0], end: [0.75, 0.5, 0], duration: 2
  }
});
```

- `times` — up to 24 captures between 0 and 120 seconds.
- `randomSeed` — defaults to `12345`.
- `motion` — ten paths: line, arc, circle, ellipse, triangle, rectangle, zigzag, sine, figure eight and helix. Use `{ enabled: false }` for a stationary capture.

## Browser API

| Function | Purpose |
| --- | --- |
| `waitForReady()` | Resolves when the player is ready. |
| `importManifest(url)` / `importEffect(source, options)` | Load bundles from a manifest, File/Blob, byte array or URL. |
| `watchManifest(url)` | Watch revisions; returns a function that stops watching. |
| `selectEffect(assetName, { prefabPath })` | Select a prefab already in the bundle. |
| `setMotion(...)` | Move the emitter without capturing. |
| `set`, `setRange`, `command`, `send`, `requestState` | Control playback and supported live properties. Targets: names, paths, indices or `*`. |
| `capture(options)` | Rendered-camera frames plus metadata. |
| `captureCanvas()` | Immediate canvas grab. |

State reports the actual pipeline, Unity version, color space, hierarchy and capture errors.

---
[Next: AI Chat & Providers](ai-chat.md)
