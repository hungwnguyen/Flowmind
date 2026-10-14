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

**Changes here are for this browser only** — they don't touch any Unity file. To let an AI agent test its own effects this way, see [Web Particle](webgl-preview.md).

![WebGL demo with playback and particle targets](images/particle-web-demo.png)

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

Tip: grayscale textures can be tinted to any color. Additive textures use a black background; decals and sprites use transparency.

## Prefab library

Open **Tools → VinaGen AI Toolkit → Open → Particles → Bundled Particle Library** to browse **78 supplied prefabs**. Assets live in `Content/Particles/ToonLibrary/`.

![Prefab library paths and prompt selection preference](images/settings-prefabs.png)

Expand **Prefabs** to see each effect's path, then open it in the Project window. More in [Settings](settings.md).

## Create and check textures

Open **Tools → VinaGen AI Toolkit → Particle System → Authoring Tools**.

| Tab | Purpose |
| --- | --- |
| **Defaults** | Rebuild textures, audit images, register textures and materials. |
| **Poe Image** | Generate artwork through your Poe account. |
| **Inspect** | Inspect prefabs/alpha; rename or resize while preserving GUIDs. |
| **FX Review** | Run Play Mode and capture effect milestones. Save scenes first. |

Wait for a job to finish before entering Play Mode.

<div class="vg-pair">
  <figure><img src="images/particle-authoring-defaults.png" alt="Particle Authoring: Defaults" loading="lazy"><figcaption>Defaults: Dataset → Generate → Audit → Register.</figcaption></figure>
  <figure><img src="images/particle-authoring-poe.png" alt="Particle Authoring: Poe Image" loading="lazy"><figcaption>Poe Image: Brief / model / key → Generate with Poe.</figcaption></figure>
  <figure><img src="images/particle-authoring-inspect.png" alt="Particle Authoring: Inspect" loading="lazy"><figcaption>Inspect: Prefab / PNG → analyze or validate.</figcaption></figure>
  <figure><img src="images/particle-authoring-review.png" alt="Particle Authoring: FX Review" loading="lazy"><figcaption>FX Review: Save scenes → review → inspect captures.</figcaption></figure>
</div>

- **Defaults:** keep **Overwrite** off to only add missing files.
- **Poe Image:** optional; uses your own Poe credits.
- **Inspect:** keep **Preview rename plan** on to check changes first.
- **FX Review:** save your scenes before running.

New here? Start with the [demos](demos.md).

## Build an effect

1. Choose a template, texture or source prefab.
2. Adjust layers, size, color and timing.
3. Review motion in the [WebGL Preview](webgl-preview.md).

AI assistants can also create effects for you (via `create_particle_system`). New prefabs are saved to `Assets/VinaGen AI Toolkit/Samples/GeneratedParticles/`. If no suitable texture exists, the toolkit suggests images to generate — check usage rights for any image you import.

## Switching render pipeline

Particles turned pink? Run **Particle System → Repair Materials For Active Pipeline**. For HDRP, always check the final look in Unity.

[Next: WebGL Particle Preview](webgl-preview.md)
