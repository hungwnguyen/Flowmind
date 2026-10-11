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

## Sketch screens

1. Open or create a Design graph.
2. Add frames, screen copy and images.
3. Add numbered callouts to explain behavior.
4. Save the asset.

![Design graph with screen frames and callouts](images/design-editor.png)

Use [UI Designer](ui-designer.md) when you want editable UI layers that import into a Unity Canvas.

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

## Export

Export **Markdown** for written specs, **JSON** for structured data, or **SVG / PNG** for a visual overview.

[Next: Web Flow Editor](web-editor.md)
