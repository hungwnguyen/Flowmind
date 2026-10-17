# MCP Bridge

Kết nối trợ lý với VinaGen và Unity Editor: sửa tài liệu UI, tạo graph/hiệu ứng, quản lý scene/prefab, sửa script, biên dịch và chạy test.

## Kết nối

1. Mở **Tools → VinaGen AI Toolkit → Open → MCP Bridge**.
2. Bấm **Start**.
3. Mở lại chat dự án trong Claude Code hoặc Codex. Dùng `/vina`, `$vina`, hoặc yêu cầu trực tiếp server MCP `vinagen` đã kết nối.

**Bridge URL** mặc định là `http://127.0.0.1:8888/`; **endpoint MCP** là `http://127.0.0.1:8888/mcp`. Giữ Unity mở. Khi biên dịch/reload script, bridge có thể mất kết nối ngắn; thử lại khi Unity sẵn sàng.

![Tab MCP Bridge đang Online, URL và lệnh chat](../images/toolkit-bridge.png)

**Online** nghĩa là bridge đang chạy. **Install chat skills** sửa lệnh chat và đăng ký kết nối MCP cho dự án. **Reset to default** trả về URL mặc định.

Toolkit tự cài các mục theo dự án, giữ nguyên skill của bạn và server khác:

| Trợ lý | File lệnh chat | Kết nối MCP |
| --- | --- | --- |
| Claude Code | `.claude/skills/vina/SKILL.md` | `.mcp.json` → `mcpServers.vinagen` |
| Codex | `.agents/skills/vina/SKILL.md` | `.codex/config.toml` → `[mcp_servers.vinagen]` |

Kết nối `vinagen` tùy chỉnh có sẵn được giữ nguyên. Mục HTTP loopback hiện có cập nhật theo URL bridge. Nếu cấu hình không hợp lệ hoặc đăng ký bị bỏ qua, xem kết quả cài đặt rồi chỉnh kết nối của dự án đó.

Với ứng dụng MCP khác, thêm server HTTP tên `vinagen`, dùng URL bridge đang hiển thị kèm `/mcp`. Mọi thao tác chạy trong Unity; bridge không cần server Node/Python, npm, tài khoản Figma hay khóa AI. Tạo nội dung bằng AI tùy chọn vẫn cần provider đã cấu hình. Kiểm tra khả năng kết nối cụ thể trong ứng dụng MCP bạn dùng.

## Tìm đúng công cụ trước

Gọi `vinagen_find`, mô tả công việc bằng lời của bạn. Hỗ trợ tiếng Anh và tiếng Việt, kể cả không dấu.

```json
{"query":"đổi tên layer UI và gắn nhãn button"}
```

Kết quả có `matches` được xếp hạng, `call`, `inputSchema` riêng của kết quả tốt nhất và đường dẫn một `guide`. Thêm `guide:true` để nhận nội dung hướng dẫn khi trợ lý không đọc được file dự án. Dùng `name` để tra đúng tên tool/action:

```json
{"name":"patch_ui_document","guide":true}
```

`limit` từ 1–10 (mặc định 5); `schema` mặc định true. Yêu cầu rỗng liệt kê tính năng theo nhóm. Workflow chỉ có hướng dẫn, như tạo cả game, trả `guideOnly:true` và không có lệnh MCP; làm theo guide để phối hợp các công cụ.

Gọi tool được trả về với đúng các trường trong schema. Với `manage_vinagen_ai_toolkit`, đặt `action` và các trường được tìm thấy ở cấp ngoài cùng của arguments MCP. Schema trong `tools/list` của tool này cố ý để mở; dùng discovery để lấy trường cho từng action.

## Đọc ngữ cảnh rồi chỉnh sửa

| Tool | Công dụng |
| --- | --- |
| `get_web_editor_context` | Tab trình duyệt do Unity phục vụ, selection, viewport, revision đã lưu, phiên bản draft và trạng thái chưa lưu. |
| `get_document_metadata` | Cấu trúc gọn của tài liệu Flow, Design hoặc UI. |
| `get_node_context` | Node/layer trong phạm vi, các lớp cha và kết nối ra ngoài. |
| `get_document_styles` | Style chính xác và ID đang sử dụng. |
| `read_ui_document` | Toàn bộ tài liệu UI đã lưu và revision. |
| `patch_ui_document` | Sửa layer có kiểm tra revision và diff chạy thử. |
| `refactor_ui_layers` | Đặt tên theo nội dung, gắn Button và đưa nhãn/icon vào trong nút. |
| `capture_ui_web_screens` | Xếp job chụp một PNG cho mỗi màn hình để kiểm tra hình ảnh. |

Tool đọc ngữ cảnh nhận `path` của asset đã lưu hoặc `tabId` đang mở. Draft trình duyệt có thể chứa thay đổi chưa lưu; ghi asset không thay thế draft đó. Nếu nhiều tab trùng đường dẫn, chọn rõ `tabId`. `draftVersion` và `revision` giúp phát hiện mục tiêu đã thay đổi. Ngữ cảnh trình duyệt hết hạn sau 30 giây không có heartbeat.

Metadata/context/styles nhận `nodeIds`, `depth` (0–32) và `limit` (1–1000). Bỏ IDs để chọn các root; mảng rỗng nghĩa là không chọn node nào. `compactStyles:true` ở node context có thể đưa giá trị lặp vào `sharedStyles` qua `styleRef` giữ đúng dữ liệu; đây là cách đọc gọn, không dùng làm payload lưu.

### Patch tài liệu UI đã lưu

Đọc revision hiện tại trước. `patch_ui_document` mặc định `dryRun:true`, nhận 1–100 thao tác: `update`, `insert`, `reparent`, `remove`.

```json
{
  "path":"Assets/VinaGen AI Toolkit/Content/UI/Documents/Shop.asset",
  "revision":"<revision từ read_ui_document>",
  "dryRun":true,
  "operations":[{"op":"update","id":"title","changes":{"text":"Shop"}}]
}
```

Xem diff rồi gửi lại cùng yêu cầu với `dryRun:false` để ghi. Revision cũ trả 409 cùng `currentRevision`; giữ draft và đọc lại trước khi thử tiếp. Bản ghi được kiểm tra toàn bộ, giữ trường chưa biết và tham chiếu ảnh GUID/localId, chỉ lưu asset đích với một bước Unity Undo. `reparent` dùng tọa độ cục bộ theo cha, không tự giữ vị trí thế giới. Xóa cha có con cần `cascade:true`.

`refactor_ui_layers` cũng mặc định chạy thử. Ghi asset cần revision hiện tại; mục tiêu `tabId` chỉ hỗ trợ dry run. Tool đề xuất tên như `btn_play`, `txt_title`, `icon_coin`; kiểm tra changes, Buttons và issues trước khi ghi.

Để kiểm tra hình ảnh, chọn draft bằng `tabId` + `draftVersion` mong đợi, hoặc asset bằng `path` + `revision`. Poll `inspect_ui_web_demo` đến applied, failed hoặc expired. Kết quả kèm danh tính tài liệu. Hiện capture dùng chung một job chờ, nên đợi xong trước khi gửi job khác.

Các tính năng MCP trực tiếp này thuộc [UI Designer chạy qua Unity](ui-designer.md). [Online Web Designer](web-designer.md) độc lập lưu file cục bộ và không kết nối bridge Unity.

## Endpoint HTTP

| Endpoint | Công dụng |
| --- | --- |
| `GET /health` | Kiểm tra kết nối. |
| `POST /mcp` | MCP Streamable HTTP không giữ phiên. |
| `GET /tools?action=<action>` | Đọc schema hiện tại của thao tác. |
| `POST /call` | Thực hiện thao tác. |
| `GET /graph` / `POST /import` | Đọc / import dữ liệu graph. |

`POST /mcp` hỗ trợ JSON-RPC `initialize`, `ping`, `tools/list`, `tools/call`. Gửi `Content-Type: application/json`, `Accept: application/json, text/event-stream`, rồi gửi `MCP-Protocol-Version` đã thương lượng sau initialize. Phiên bản hỗ trợ: `2025-11-25`, `2025-06-18`, `2025-03-26`. Phản hồi là JSON; notification nhận 202. Không có SSE liên tục (`GET /mcp` trả 405).

REST dùng envelope khác arguments của tool MCP. Ví dụ gửi tới `POST /call`:

```json
{
  "tool": "manage_vinagen_ai_toolkit",
  "params": {
    "action": "read_ui_document",
    "focusWindow": false,
    "data": {"path":"Assets/VinaGen AI Toolkit/Content/UI/Documents/Shop.asset"}
  }
}
```

Đặt trường theo schema action; dữ liệu tài liệu nằm trong `params.data`. Kết quả mặc định `responseDetail:"compact"`; dùng `"full"` để lấy trường cũ và phục vụ audit. Tái sử dụng discovery trong một phiên; metadata hỗ trợ `ETag` / `If-None-Match` (304 không có body).

## Unity Editor và workflow khác

| Công việc | Action |
| --- | --- |
| Scene và hierarchy | `manage_scene`, `manage_gameobject`, `find_gameobjects`, `manage_components` |
| Prefab và asset | `manage_prefabs`, `manage_asset`, `inspect_game_project` |
| C# và biên dịch | `manage_script`, `compile_scripts`, `read_console` |
| Điều khiển Editor | `manage_editor`, `execute_menu_item` |
| Test Unity | `run_tests`, `get_test_job` (cần Unity Test Framework) |
| Flow graph | `create_block_diagram`, `fix_block_diagram`, `import_mock_flow_graph` |
| Design graph | `create_white_frame`, `update_white_frame`, `check_white_frame`, `patch_design_content_graph` |
| Tạo/import UI | `list_ui_documents`, `create_ui_document`, `save_ui_document`, `import_ui_canvas`, `import_ui_toolkit` |
| Particle | `plan_particle_system`, `create_particle_system`, `review_particle_system` |
| Texture | `list_particle_textures`, `inspect_particle_texture`, `audit_particle_textures` |

Sau khi sửa C#, gọi `compile_scripts` với `action:"compile"`, giữ `requestId`, rồi poll bằng `action:"status"` cùng ID đến khi `ready:true`. Sửa cả compiler `errors` và `consoleErrors`, rồi lặp lại. Trạng thái biên dịch tồn tại qua domain reload. Với test, khởi chạy `run_tests` rồi poll `get_test_job`; không thể bắt đầu test khi còn lỗi compiler.

Sau khi tạo game, dùng `inspect_game_project` để kiểm tra scene/prefab/tham chiếu đã lưu, rồi kiểm thử riêng gameplay và một chỉnh sửa prefab/config đại diện. Inspection thành công chưa chứng nhận chất lượng game. Import UI tạo bản mới có Undo; tự lưu scene sau khi kiểm tra.

Queued success chưa có nghĩa hoàn tất: đợi theo `pollAfterMs` và poll đến trạng thái cuối. Chỉ `inspect_particle_tool_job`, `inspect_image_generation_job`, `inspect_particle_review` hỗ trợ poll có điều kiện bằng `ifChanged:<revision trước>`; giữ kết quả trước nếu nhận `unchanged:true`.

Giữ bridge trên localhost. Bridge kiểm tra Host/loopback và origin trình duyệt; lệnh ghi từ trình duyệt dùng `X-VinaGen-Session`. CLI/MCP không có Origin vẫn được hỗ trợ. Body yêu cầu tối đa 8 MB. Đây là bảo vệ cho editor cục bộ, không phải xác thực cho dịch vụ công khai.

Xem [Tạo từ chat](create-from-chat.md) để bắt đầu nhanh.

[Tiếp theo: Cài đặt](settings.md)
