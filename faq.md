# FAQ & Troubleshooting

## Do I need AI?

No. Graphs, UI design, text and particle tools all work without AI. Only chat and image generation need an AI account.

## Which Unity versions and operating systems are supported?

**Unity 2022.3 LTS or newer** on Windows, macOS or Linux. UI and text tools also need uGUI and TextMesh Pro. See [Getting Started](getting-started.md).

**Web Designer is Free forever** and works without Unity.

## Common issues

| Issue | Fix |
| --- | --- |
| Bridge disconnected | Start it in **Open → MCP Bridge** and wait for compilation. |
| Missing `/vina` or `$vina` | Click **Install chat skills**, check conflicts and reopen the project chat. |
| Canvas tools unavailable | Check that Unity UI (uGUI) is installed. |
| Pink particles | Run **Particle System → Repair Materials For Active Pipeline**. |
| Web editor conflict `409` | The file changed elsewhere. Export your draft, then reload. |
| No generated image | Check provider credentials, quota and job status. |
| Baked text looks outdated | Run **Bake / Rebuild** before building. |
| Need to change baked text in game | Use **Revert Bake** to switch back to Dynamic. |

## Does Canvas import finish the screen?

Almost. It builds the UI objects, but you still need to hook up button events and save the scene. If the design came from a PSD, double-check masks and effects.

## Where does my data go?

Editors run locally on your computer. Only when you use AI chat or image generation are your prompt and attachments sent to your AI provider. Keep your API keys private.

## How do I switch language?

Click **EN / VI** at the top. Your choice is remembered.

## Can I redistribute imported artwork?

Only if its license allows it. Editing an image doesn't change its license. Keep the toolkit and font license notices with anything you share.
