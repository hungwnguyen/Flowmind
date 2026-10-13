# Flow & Design Graphs

Use **Flow** to plan game logic and **Design** to sketch screen content.

## Open

Choose **Tools → VinaGen AI Toolkit → Editors → Open Flow Editor**. Both graph types share this browser workspace.

| Asset | Use it for |
| --- | --- |
| `MockFlowGraph` | Steps, decisions, branches and state transitions. |
| `DesignContentGraph` | Screen frames, text, images and numbered callouts. |

## Build a flow

1. Create a Flow graph in **Files**, or open the sample graph.
2. Add Start, Action, Decision and End nodes.
3. Drag between ports to connect nodes. Label decision branches, such as **Yes / No**.
4. Click **Save asset**.

![Flow graph in the browser editor](images/flow-editor.png)

A flow graph is a plan; connect its logic to your game code. FlowCanvas and NodeCanvas are optional integrations.

**Via MCP:** ask `/vina create a login flow with success and failure branches`. The assistant reads the graph with `GET /graph?graphType=mock_flow_graph&graphPath=<asset>` and sends changes through `POST /import` (`import_mock_flow_graph`). `create_block_diagram` / `fix_block_diagram` create or edit a graph from a `prompt` through the toolkit's AI Chat.

## Sketch screens

1. Open or create a Design graph.
2. Add frames, screen copy and images.
3. Add numbered callouts to explain behavior.
4. Save the asset.

![Design graph with screen frames and callouts](images/design-editor.png)

Use [UI Designer](ui-designer.md) when you want editable UI layers that import into a Unity Canvas.

**Via MCP:** ask `/vina sketch a shop screen with an item list and a purchase popup`. Read with `GET /graph?graphType=design_content_graph&whiteFramePath=<asset>` and make scoped edits with `patch_design_content_graph`. `create_white_frame` creates a new Design graph; `update_white_frame` edits it from a `prompt`.

## Write screen specifications

Select a Design frame, then click **Document editor → Edit document & label images** in the Inspector. Double-clicking the frame also opens it.

<figure>
  <img src="images/design-document-editor.png" alt="Design document editor with Home and Popup tabs, formatted screen specifications, and an image with a numbered label">
  <figcaption>Write screen behavior beside its reference image and numbered callouts.</figcaption>
</figure>

| Area | What it does |
| --- | --- |
| **Document tabs** | Switch between screen documents, such as Home and Popup. |
| **Outline** | Navigate headings added to the document. |
| **Document and toolbar** | Write behavior and requirements; format headings, font, lists, alignment, links and images. |
| **Images & labels** | Click an image to add a numbered label. Click its badge to edit; drag to move it. |
| **Export image PNG with labels** | Download the reference image with its numbered labels. |

For example, label **1** identifies the event card; item **1** in the document explains its unlock condition and what happens when tapped. Close the editor and use **Save asset** to save the graph.

**Via MCP:** `check_white_frame` reviews frames and generates descriptions from their images and callouts. To let the assistant read the frame selected in the editor, use `get_web_editor_context`, then `get_node_context`.

## Export

Export **Markdown** for written specs, **JSON** for structured data, or **SVG / PNG** for a visual overview.

**Via MCP:** `GET /graph` returns the graph data as JSON; `get_document_metadata` returns a compact node outline. Markdown, SVG and PNG export are available in the editor only.

Actions that take a `prompt` (`fix_block_diagram`, `update_white_frame`, `check_white_frame`) run through [AI Chat](ai-chat.md) and need an AI provider. Direct reads and patches do not. See also [MCP Bridge](mcp-bridge.md).

[Next: Web Flow Editor](web-editor.md)
