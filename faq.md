# FAQ & Troubleshooting

## Do I need AI?

Local graph editing, UI design, text and offline particle tools work without an AI subscription. Provider chat and image generation require your account.

## Which Unity versions and operating systems are supported?

Use **Unity 2022.3 LTS or newer** on **Windows, macOS or Linux** supported by that Unity release. UI/text tools need official uGUI, TextMesh Pro and TMP Essentials. Particle preview uses a prebuilt player with portable `.vgfx.json` export. See [installation and verification scope](getting-started.md).

**Web Designer is Free forever** and works without Unity.

## Common issues

| Issue | Fix |
| --- | --- |
| Bridge disconnected | Start it in **Open → MCP Bridge** and wait for compilation. |
| Missing `/vina` or `$vina` | Click **Install chat skills**, check conflicts and reopen the project chat. |
| Canvas tools unavailable | Check that Unity UI (uGUI) is installed. |
| Pink particles | Run **Particle System → Repair Materials For Active Pipeline**. |
| Web editor conflict `409` | Export the draft or reload the latest Unity asset. |
| No generated image | Check provider credentials, quota and job status. |
| Static text is stale or unsupported | Run **Bake / Rebuild** before building. |
| Baked text needs runtime changes | Use **Revert Bake** to return to Dynamic. |

## Does Canvas import finish the screen?

It creates UI objects with Undo support. Connect Button events and save the scene yourself. Review PSD masks, blend modes and effects after import.

## Where does my data go?

Local editors use Unity's localhost server. Online AI requests can send prompts, attachments and workflow context to your provider; MCP assistants receive requested tool results. Keep credentials private.

## How do I switch language?

Use **EN / VI**; the choice is saved. Automatic language selection uses time zone and may query geojs.io for your country in shared UTC+7 zones.

## Can I redistribute imported artwork?

Check its license. Rotation and sharpening do not grant redistribution rights. Keep toolkit and font license notices with redistributed content.
