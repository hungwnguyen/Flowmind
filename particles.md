<div class="vg-particle-intro">
  <h1>Particles &amp; Textures</h1>
  <p>From texture to motion. Explore the effects, tune them in your browser, then build your own in Unity.</p>
  <div class="vg-particle-facts"><span><strong>403</strong> offline textures</span><span><strong>78</strong> effect prefabs</span><span>Built-in / URP / HDRP</span></div>
</div>

## Try it in your browser

Pick an effect and explore it in motion. Use **Restart** to replay it, or lower **Time scale** to inspect each layer.

<div class="vg-fx">
  <div class="vg-fx-heading"><span>Effect collection</span><span class="vg-fx-badge">8 interactive demos</span></div>
  <div class="vg-fx-picker" role="group" aria-label="Effect">
    <button type="button" data-fx="toon_explosion" aria-pressed="true"><span>Explosion</span><small>Burst &amp; sparks</small></button>
    <button type="button" data-fx="lightning_strike" aria-pressed="false"><span>Lightning</span><small>Electric strike</small></button>
    <button type="button" data-fx="portal" aria-pressed="false"><span>Portal</span><small>Magic loop</small></button>
    <button type="button" data-fx="toon_heal_burst" aria-pressed="false"><span>Heal</span><small>Recovery burst</small></button>
    <button type="button" data-fx="toon_slash" aria-pressed="false"><span>Slash</span><small>Blade trail</small></button>
    <button type="button" data-fx="toon_shield_hit" aria-pressed="false"><span>Shield hit</span><small>Defense flash</small></button>
    <button type="button" data-fx="toon_smoke_burst" aria-pressed="false"><span>Smoke</span><small>Soft particles</small></button>
    <button type="button" data-fx="rain_2d" aria-pressed="false"><span>Rain</span><small>Weather loop</small></button>
  </div>
  <iframe class="vg-fx-frame" src="playground/?fx=toon_explosion&replay=1&lang=en" title="VinaGen particle playground" loading="lazy" allow="fullscreen"></iframe>
  <div class="vg-fx-footer"><span data-fx-selected aria-live="polite">Explosion — Burst &amp; sparks</span><a data-fx-open href="playground/?fx=toon_explosion&replay=1&lang=en" target="_blank" rel="noopener">Open full screen ↗</a></div>
  <p class="vg-fx-note">11 MB WebGL player. One-shot effects replay automatically. These demos use the Built-in render pipeline.</p>
</div>

<ol class="vg-fx-guide">
  <li><strong>Choose an effect</strong><span>Switch between the eight demos above.</span></li>
  <li><strong>Explore the layers</strong><span>Pause, slow down or select a particle system.</span></li>
  <li><strong>Make it yours</strong><span>Adjust size and color, then apply your changes.</span></li>
</ol>

## Offline texture library

Five packs contain **403 original textures**, generated with Unity C# and usable offline.

<figure class="vg-texture-sheet"><img src="images/textures-default.png" alt="DefaultGameFX texture samples by category" loading="lazy"><figcaption>DefaultGameFX: textures for particles, trails and gameplay.</figcaption></figure>

| Pack | Textures | Main content |
| --- | --- | --- |
| DefaultGameFX | 82 | Fire, smoke, lightning, healing, portals and weather. |
| ArtStylesFX | 70 | Effects across visual styles. |
| GameEssentialsFX | 71 | Combat, environment and gameplay. |
| CombatCollisionFX | 97 | Hits, impacts and defense. |
| UniversalGameTextures | 83 | Decals, glow, status, sprites and masks. |

Use **white RGB** for colored artwork; tint grayscale textures. Additive particle textures use black backgrounds; decals and sprites use alpha.

## Prefab library

Open **Tools → VinaGen AI Toolkit → Open → Particles → Bundled Particle Library** to browse **78 supplied prefabs**. Assets live in `Content/Particles/ToonLibrary/`.

## Create and check textures

Open **Tools → VinaGen AI Toolkit → Particle System → Authoring Tools**.

| Tab | Purpose |
| --- | --- |
| **Defaults** | Rebuild textures, audit images, register textures and materials. |
| **Poe Image** | Generate artwork through your Poe account. |
| **Inspect** | Inspect prefabs/alpha; rename or resize while preserving GUIDs. |
| **FX Review** | Run Play Mode and capture effect milestones. Save scenes first. |

Jobs show progress and cancellation. Wait for completion before entering Play Mode. Reports live in `Library/VinaGenNativeParticleTools/Jobs/`; visually review images after an audit.

## Build an effect

1. Choose a template, texture or source prefab.
2. Adjust layers, size, color and timing.
3. Review motion in the [WebGL Preview](webgl-preview.md).

Through MCP, `create_particle_system` defaults to `web_preview`. Use `scene_object` for scene placement or `prefab` for an asset only. New prefabs default to `Assets/VinaGen AI Toolkit/Samples/GeneratedParticles/`.

If the subject needs missing artwork, the toolkit returns an image-generation plan. Check usage rights for imported images.

## Switching render pipeline

For pink particles, run **Particle System → Repair Materials For Active Pipeline**. HDRP web previews use a compatible version; verify final shaders in Unity.

[Next: WebGL Particle Preview](webgl-preview.md)
