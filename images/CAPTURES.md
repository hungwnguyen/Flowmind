# Documentation capture inventory — 13 October 2026

Product screenshots were captured on the local Windows computer running the `C:/Projects/vinagen` project in **Unity 6000.3.22f1**. Browser captures use the running Unity bridge or this documentation repository's real prebuilt WebGL player. They are not generated mockups. Cropping removes unrelated desktop areas or empty space; no controls, artwork or settings values were fabricated. The English interface is shared by the EN/VI guides; captions are localized.

| Images | Actual capture source |
| --- | --- |
| `toolkit-home.png`, `toolkit-create.png`, `toolkit-particles.png`, `toolkit-bridge.png`, `toolkit-settings.png` | Native VinaGen AI Toolkit window; all five tabs. Home and Settings replace earlier captures. |
| `settings-ai.png`, `settings-graph.png`, `settings-design.png` | Unity Inspector after opening the matching settings card. API Keys remains collapsed. |
| `settings-ui-assets.png`, `settings-ui-canvas.png` | UI Designer Settings Inspector, first asset/font section and scrolled Canvas section. |
| `settings-textures.png`, `settings-prefabs.png` | Texture catalog index and bundled prefab list expanded in Unity Inspector. |
| `settings-web-particle.png`, `settings-text.png` | WebGL preview/capture settings and VinaGenText Settings Inspectors. |
| `particle-authoring-defaults.png`, `particle-authoring-poe.png`, `particle-authoring-inspect.png`, `particle-authoring-review.png` | All four Particle Authoring tabs. Capturing a tab did not run its generation/review action. |
| `ui-designer.png`, `ui-files.png`, `ui-assets.png`, `ui-export.png` | Local Unity browser UI Designer, bundled `Samples/Example VinaGenUIDocument/VinaGenUIDocument.svgpro`; layer/file/asset panels and actual export dialog. UI Designer replaces the previous screenshot. Assets shows the initial choose-folder state. |
| `ui-canvas-demo.png` | Existing sample `Samples/Example VinaGenUIDocument/Scenes/UI.unity`, Game View score popup with Hierarchy/Project. |
| `vinagen-text-demo.png` | Local UI Designer rendering of `Samples/Text Effects/ILoveYouTextShowcase.asset`; six decorated label styles. |
| `particle-web-demo.png`, `particle-web-motion.png`, `particle-web-capture.png` | Actual `playground/?fx=toon_explosion` player, playback, expanded motion and capture controls. |
| `particle-review-1.png`, `particle-review-2.png`, `particle-review-3.png` | Native preview-camera frames returned by API v3 `capture()`: 960 × 640, seed 12345, simulation enabled, motion disabled, `postToSink:false`. Requested times 0.08 / 0.18 / 0.80 seconds; actual times 0.079999998 / 0.180000007 / 0.800000012. Unity 6000.3.22f1, Linear color space, actual pipeline Built-in; `toon_explosion.prefab` under `Samples/GeneratedParticles/Standards/`. |

Existing `flow-editor.png`, `design-editor.png`, `design-document-editor.png`, `agent-chat.png`, texture sheets and robot artwork are retained from the previous documentation; they were not recaptured in this update.

## Verification scope

- Inspected the 30 new/replacement captures and browser renders. All 24 EN/VI article routes passed browser checks, including image loading and section links; six mobile layouts had no page overflow. The static audit resolved all 104 image references and local document links. `git diff --check` passed.
- Ran the actual Built-in WebGL effect and explicit seeded camera captures. Returned frames include timing and pipeline metadata; an API success flag is not a substitute for looking at the images.
- No paid AI-provider request, WebGL player build, new Canvas/UI Toolkit import or new text bake was needed for these documentation captures.
- This update does not validate a clean toolkit-only Unity import, URP/HDRP parity, Photoshop round trips or target-device performance. UI Toolkit behavior is documented from the current implementation/skill contract; the Canvas screenshots are not proof of UI Toolkit parity.
# Standalone Web Designer — 13 October 2026

`web-designer/workspace.png`, `settings.png`, `export.png`, `inspector.png`,
`folder.png` and `mobile.png`
are real Chromium screenshots captured on this device by
`tests/designer-smoke.cjs`. The sample is created from plain shapes/text,
exported to PSD and imported back in the actual browser editor. No private
PSD artwork or generated mock UI is included. The integration test blocks
bridge routes and verifies zero Unity/API requests.

The standalone captures were refreshed with the shared local-editor SVG icons,
48 px document toolbar and split tool menus on 13 October 2026.

`web-designer/settings.png` now shows the shared local-editor popup, three theme
preview cards, light canvas background, enhanced contrast, snapping and comment
display name. Light/dark preferences and narrow-screen scrolling were checked.
