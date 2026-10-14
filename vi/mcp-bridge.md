# MCP Bridge

Bridge cho phép trợ lý đọc và chỉnh nội dung toolkit thông qua Unity.

## Kết nối

1. Mở **Tools → VinaGen AI Toolkit → Open → MCP Bridge**.
2. Bấm **Start**.
3. Cung cấp **Bridge URL** đang hiển thị cho trợ lý. Mặc định: `http://127.0.0.1:8888/`.

Giữ Unity mở khi trợ lý làm việc. Nếu Unity đang biên dịch, đợi xong rồi thử lại.

![Tab MCP Bridge đang Online, URL và lệnh chat](../images/toolkit-bridge.png)

**Online** nghĩa là bridge đang chạy. **Install chat skills** sửa lỗi thiếu lệnh `/vina` / `$vina`. **Reset to default** trả về URL mặc định.

## Endpoint HTTP

| Endpoint | Công dụng |
| --- | --- |
| `GET /health` | Kiểm tra kết nối. |
| `POST /mcp` | Kết nối MCP. |
| `GET /tools?action=<action>` | Đọc schema hiện tại của thao tác. |
| `POST /call` | Thực hiện thao tác. |
| `GET /graph` / `POST /import` | Đọc / import dữ liệu graph. |

Ví dụ gửi tới `POST /call`:

```json
{
  "tool": "manage_vinagen_ai_toolkit",
  "params": {
    "action": "list_ui_documents",
    "focusWindow": false
  }
}
```

## Thao tác thường dùng

| Công việc | Action |
| --- | --- |
| Flow graph | `create_block_diagram`, `fix_block_diagram`, `import_mock_flow_graph` |
| Design graph | `create_white_frame`, `update_white_frame`, `check_white_frame`, `patch_design_content_graph` |
| Tài liệu UI | `list_ui_documents`, `create_ui_document`, `read_ui_document`, `save_ui_document` |
| Particle | `plan_particle_system`, `create_particle_system`, `review_particle_system` |
| Texture | `list_particle_textures`, `inspect_particle_texture`, `audit_particle_textures` |

Mẹo cho trợ lý: xem schema của action (`GET /tools`) trước khi gọi; với job dài, kiểm tra trạng thái sau mỗi `pollAfterMs`.

Giữ bridge trên localhost. Xem [Tạo từ chat](create-from-chat.md) để dùng nhanh bằng `/vina` và `$vina`.

[Tiếp theo: Cài đặt](settings.md)
