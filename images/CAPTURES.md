# Documentation capture inventory — 13 October 2026

## Current interface refresh

The 20 screenshots listed in `captures-2026-10-13.json` replace their earlier documentation images. They were captured on this Windows device from the running `C:/Projects/vinagen` project in **Unity 6000.3.22f1**, its live browser editor, and the documentation site's real prebuilt WebGL player.

- The five toolkit tabs were captured at their normal **522 × 637** window size, rather than maximized.
- Inspector captures keep the actual **461 px** wide settings pane, cropped from the Unity window. No controls or field values were fabricated. API Keys remained collapsed.
- Browser workspaces and the Portal demo were captured in Chrome at **1280 × 800**.
- Documentation uses the original interface captures. Asset Store Media Studio presentation frames are not used in the guides.
- The English UI is shared by the English and Vietnamese guides; explanatory text and captions are localized.

| Images | Actual capture source |
| --- | --- |
| `toolkit-home.png`, `toolkit-create.png`, `toolkit-particles.png`, `toolkit-bridge.png`, `toolkit-settings.png` | All five native toolkit tabs at the normal window size. The shared particle player displays Installed v1.1.0. |
| `toolkit-settings-particles.png` | Additional documentation capture: Settings scrolled to Particles & previews. Together with the top view, it shows all seven settings cards. |
| `settings-ai.png`, `settings-graph.png`, `settings-design.png` | Current custom Unity Inspectors for AI & tool settings, Graph appearance and Design Content settings. |
| `settings-ui-assets.png`, `settings-ui-canvas.png` | UI Designer settings: Project assets and expanded Fonts; a second view with Fonts collapsed shows Canvas defaults. |
| `settings-textures.png`, `settings-prefabs.png` | Current texture catalog and prefab library Inspectors with lists expanded. Counts shown belong to this project. |
| `settings-web-particle.png`, `settings-text.png` | Current Particle preview Inspector (output, review target and camera) and Text settings Inspector (Font Studio, bake output and defaults). |
| `ui-designer.png`, `ui-export.png` | Live local UI Designer using the bundled `Samples/Example VinaGenUIDocument/VinaGenUIDocument.svgpro`; all three screens and the actual export dialog. |
| `flow-editor.png`, `design-editor.png` | Live local browser editor using `Samples/Graphs/NewMockFlowGraph.asset` and `NewDesignContentGraph.asset`. |
| `vinagen-text-demo.png` | Live UI Designer rendering `Samples/Text Effects/ILoveYouTextShowcase.asset`; six decorated text styles. |
| `particle-web-demo.png` | Live `playground/?fx=portal&replay=1&lang=en` player. The bundled Portal effect was paused after it became visible, using the browser playback control. |

## Retained captures

These images remain from the earlier documentation batch. They were not recaptured as part of the current interface refresh:

- `ui-files.png`, `ui-assets.png`: file and asset panels in the local UI Designer.
- `ui-canvas-demo.png`: the existing bundled UI scene in Unity Game View with Hierarchy and Project.
- `particle-authoring-defaults.png`, `particle-authoring-poe.png`, `particle-authoring-inspect.png`, `particle-authoring-review.png`: the four Particle Authoring tabs. Taking these images did not execute generation actions.
- `particle-web-motion.png`, `particle-web-capture.png`: the earlier Toon Explosion preview with expanded motion and capture controls.
- `particle-review-1.png`, `particle-review-2.png`, `particle-review-3.png`: explicit native preview-camera frames from `toon_explosion.prefab`, at 960 × 640, seed 12345, simulation enabled, motion disabled, `postToSink:false`. Requested times: 0.08 / 0.18 / 0.80 s; actual times: 0.079999998 / 0.180000007 / 0.800000012 s. Actual pipeline: Built-in.
- `design-document-editor.png`, `agent-chat.png`, texture sheets and robot artwork.

## Verification scope

All 20 replacements were checked against the capture hashes and dimensions, existing article references, and the local HTTP responses. The additional Settings image loaded correctly. The updated Settings page was inspected in both languages; its image pair becomes a single column on a 390 px screen with no horizontal page overflow.

The current refresh changes documentation images and labels. It does not verify a clean Unity import, URP/HDRP parity, Photoshop round trips, or target-device performance. Existing camera-frame evidence and standalone-editor verification retain their original scope. No paid AI request, new WebGL build, Canvas/UI Toolkit import, or text bake was performed for this refresh.

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
