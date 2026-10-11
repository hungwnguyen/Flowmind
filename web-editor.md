# Web Flow Editor

Edit Flow and Design graphs in a local browser workspace.

## Open

Choose **Tools → VinaGen AI Toolkit → Editors → Open Flow Editor**, or select a graph and click **Open Web Editor** in its Inspector.

Default address: `http://127.0.0.1:8888/graph-editor/`. Keep Unity open while editing.

![Flow Editor workspace](images/flow-editor.png)

## Main controls

- **Files:** create and open graph assets.
- **Layers:** select, rename and organize nodes.
- **Assets:** add images from the Unity project.
- **Inspector:** edit the selected node or connection.
- **Auto layout:** arrange a flow horizontally or vertically.

Drag from a node port to create a connection. Use the Comment tool for pinned notes.

For Design graphs, **Document editor** lets you write screen specifications and label images. See the [screenshot and controls](graphs.md?id=write-screen-specifications).

## Save and recover

**Save asset** writes the active graph. **Reload graph from Unity** brings in external changes. Browser drafts are retained if compilation interrupts a request.

For a `409` conflict, export your draft or reload the latest graph before continuing.

## Useful shortcuts

| Shortcut | Action |
| --- | --- |
| `Ctrl/Cmd + S` | Save |
| `Ctrl/Cmd + Z` | Undo |
| `Shift + 1 / 2` | Fit all / selection |
| `Space + drag` | Pan |
| `Ctrl/Cmd + wheel` | Zoom |
| `Ctrl/Cmd + K` | Quick actions |
| `Ctrl/Cmd-click / Shift-click` | Toggle selection / select a range |

The gear menu controls theme, grid, snapping and minimap preferences.

[Next: UI Designer](ui-designer.md)
