# MCP Bridge

Bridge cho phép trợ lý đọc và chỉnh nội dung toolkit thông qua Unity.

## Kết nối

1. Mở **Tools → VinaGen AI Toolkit → Open → MCP Bridge**.
2. Bấm **Start**.
3. Cung cấp **Bridge URL** đang hiển thị cho trợ lý. Mặc định: `http://127.0.0.1:8888/`.

Giữ Unity mở. Sau khi biên dịch, thử lại khi Editor sẵn sàng. Tắt bridge khi làm xong.

![Tab MCP Bridge đang Online, URL và lệnh chat](../images/toolkit-bridge.png)

**Apply URL** áp dụng địa chỉ đã sửa; **Reset to default** trở lại localhost mặc định. Khi trạng thái **Online**, bridge sẵn sàng. **Install chat skills** sửa đăng ký `/vina` và `$vina`; đây là thao tác cục bộ.

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
| Tài liệu UI | `list_ui_documents`, `create_ui_document`, `read_ui_document`, `save_ui_document` |
| Particle | `plan_particle_system`, `create_particle_system`, `review_particle_system` |
| Texture | `list_particle_textures`, `inspect_particle_texture`, `audit_particle_textures` |

Đọc schema trước khi gọi. Khi lưu tài liệu, dùng revision hiện tại; sửa graph qua bridge bằng thay đổi có phạm vi rõ ràng. Với job nền, kiểm tra trạng thái tới khi hoàn tất, theo `pollAfterMs`.

Giữ bridge trên localhost. Xem [Tạo từ chat](create-from-chat.md) để dùng nhanh bằng `/vina` và `$vina`.

[Tiếp theo: Cài đặt](settings.md)
