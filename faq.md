# FAQ & Troubleshooting

## General

### Q: Do I need an AI subscription?

**A:** No. Graphs, UI Designer, VinaGenText, offline texture generation and particle construction work without AI. A provider is only needed for AI chat and image generation, and you bring your own account and credentials.

### Q: Which Unity versions are supported?

**A:** The toolkit is validated on **Unity 6000.3.22f1**. Test other versions in your project before relying on them.

### Q: Do I need FlowCanvas, NodeCanvas, Python or Node.js?

**A:** No. The mock graph is bundled; FlowCanvas/NodeCanvas adapters activate only if you already own and installed them. The web editor runs inside Unity — Node.js is used only by optional developer tests.

### Q: Does the toolkit change my render pipeline or install packages?

**A:** No. Importing never installs packages or switches pipelines. The only automatic import is TMP Essential Resources from the official package, when UI Designer needs them.

---

## Troubleshooting

| Problem | Fix |
| --- | --- |
| **Bridge unavailable** | Start it in **Open → MCP Bridge**, verify the address and wait for compilation to finish. |
| **`/vina` not found** | Check status in the MCP Bridge tab, click **Install chat skills**, then reopen the project chat. A conflicting user command is never replaced — rename it to let VinaGen own `/vina`. |
| **Canvas tools unavailable** | Install the optional Unity UI (uGUI) package, or use the core tools. |
| **Pink particles** | Run **Particle System → Repair Materials For Active Pipeline** and check shader errors. |
| **Blank atlas frames** | Verify grid, first frame and declared frame count; skip black padding cells. |
| **No screenshot at startup** | Expected — captures are explicit. Call `capture()` with times. |
| **WebGL bundle export unavailable** | Install **WebGL Build Support** through Unity Hub. |
| **No generated image** | Check provider/job status, account credits and model availability. |
| **Web editor shows a 409 conflict** | The asset changed elsewhere. Your draft is kept — reload from Unity or export before overwriting. |
| **Web editor disconnected after a script change** | Wait for compilation; the session token refreshes once automatically. Reload the page if needed — drafts are recovered. |

---

## UI Designer

### Q: Why don't my PSD effects look right?

**A:** PSD import supports 8-bit RGB pixel layers, groups, opacity and visibility. Masks, blend modes, layer effects and smart objects need visual review; PSB, CMYK and 16/32-bit files are not supported.

### Q: Does Canvas import save my scene?

**A:** No. Import creates objects in one Undo group and leaves saving to you.

### Q: Are button click events connected?

**A:** No. Buttons get their Image as target Graphic; you connect the gameplay events.

---

## Privacy

### Q: What data leaves my machine?

**A:** Only what an online workflow you start needs: your prompt, files you attach, selected graph/design context and excerpts assembled for that request. A connected MCP assistant receives the tool results it requests. The toolkit performs no model training and no whole-project telemetry. Keep the bridge local and stop it when you're done.

### Q: How does this site pick its language?

**A:** A choice made with the **EN / VI** switch always wins and is remembered in your browser. Otherwise the site uses your location: a Vietnam time zone shows Vietnamese, anywhere else shows English. UTC+7 is shared by several countries (Windows reports Hanoi as `Asia/Bangkok`), so for those zones the site looks up your country from your IP address via geojs.io, and falls back to your browser language if the lookup fails.

---

## Licensing

Noto Sans uses the SIL Open Font License 1.1, and parts of VinaGenText derive from Unity source under the Unity Companion License — see `Third-Party Notices.txt`. Native texture recipes use no third-party artwork. Rotation or sharpening of imported third-party artwork does **not** grant redistribution rights; imported artwork is excluded from exports by default.
