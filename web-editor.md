# Web Flow Editor

> Unity hosts an **offline** HTML/CSS/JavaScript editor for Flow and Design graphs. No Node server, package installation, CDN, cloud login or build step.

## Open the editor

- Select a graph asset and click **Inspector → Quick Actions → Open Web Editor**, or
- Open **Tools → VinaGen AI Toolkit → Editors → Open Flow Editor**.

Default URL: `http://127.0.0.1:8888/graph-editor/`. The editor shares the MCP bridge listener, so **Unity must stay open**. Compilation briefly interrupts the server; if a request is interrupted, your draft is kept — reload and recover it once Unity is ready.

## Workspace

![Flow Editor: Layers on the left, canvas in the middle, Document inspector on the right](images/flow-editor.png)

- **One workspace for both graph types.** Open graphs from the **Files** panel; Flow and Design documents appear as tabs. Closing a tab closes the view, not the Unity asset.
- **Files / Layers / Assets** on the left, the **inspector** on the right, drawing tools floating below the canvas and zoom controls at the top right.
- **Infinite SVG canvas** with zoom around the cursor, pan, marquee and multi-selection, drag/resize, grid snapping and alignment guides.
- **Search** node names, IDs, tags and content. **Ctrl/Cmd+K** opens Quick actions for files, commands and nodes.
- **Minimap** for navigating large graphs.
- **Auto layout** (Horizontal/Vertical) uses the native C# implementation, so browser and Unity routes match.

### Connections

Drag from a port to another node — or release on empty canvas to create a connected node. Drag near either end of a line to move that endpoint. Connections support labels, label positions, up to two bends, focus source/target and a **Reset automatic route** action.

### Comments

The **Comment** tool pins discussion threads on the canvas (Flow, Design and UI Designer). The author name comes from **Settings → Graph Appearance → Web comments → Comment Display Name**. Drag a pin to move it; Undo/Redo and Save include the move.

## Saving and syncing

- Edits update the in-memory Unity asset and mark it dirty. **Save asset** writes only that graph — it never saves scenes or other assets.
- **Reload graph from Unity** imports external changes (for example after an AI agent edited the file) and refreshes the view.
- Browser Undo/Redo keeps **100 edits per document**; native Unity Undo also records web edits.
- If a save conflicts with a newer asset (HTTP `409`), your draft is kept — export or reload instead of overwriting.

## Appearance and preferences

Click the **gear icon** for **Light / Dark / System** themes, light grid background, enhanced contrast, snap/grid and minimap preferences. Preferences are stored in browser localStorage per origin, not in the Unity project.

## Keyboard shortcuts

| Shortcut | Action |
| --- | --- |
| `Ctrl/Cmd + S` | Save |
| `Ctrl/Cmd + Z` | Undo |
| `Shift + 1` / `Shift + 2` | Fit all / fit selection |
| `Space + drag` | Pan |
| `Ctrl/Cmd + wheel` | Zoom |
| `Alt` (while dragging) | Temporarily disable snapping |
| `Ctrl/Cmd + K` | Quick actions |
| `Ctrl/Cmd + F` | Search layers |
| `F2` | Rename selected node |
| `V` / `H` / `K` | Move / Hand / Scale |
| `R` / `L` / `Shift+L` / `O` | Rectangle / Line / Arrow / Ellipse |
| `T` | Text |
| `↑` / `↓` in Layers | Previous / next object |

In Layers, **Ctrl/Cmd-click** toggles items and **Shift-click** selects a range. Every numeric field supports Unity-style scrubbing: drag its label left/right (**Shift** = fine, **Alt** = fast).

## Limits

The editor is loopback-only, checks same-origin requests and bounds request bodies to 8 MB. Graphs are limited to 1,000 nodes, 100 outgoing connections per flow node, 64 images per design node and 1,000 callouts per design node.

> The layout is original code inspired by Figma's panels and toolbar. It edits the two Unity graph models — it is not a Figma replica (no multiplayer, vector documents, components or prototyping).

---
[Next: UI Designer](ui-designer.md)
