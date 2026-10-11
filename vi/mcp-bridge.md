# MCP Bridge

> HTTP server chạy trên localhost bên trong Unity Editor, mở các action của toolkit cho Claude Code, Codex và mọi client MCP.

## Bật và kết nối

1. Mở **Tools → VinaGen AI Toolkit → Open** và chọn tab **MCP Bridge** (hoặc **MCP → Control Panel**).
2. Bấm **Start** (hoặc **Tools → VinaGen AI Toolkit → MCP → Start Bridge**).
3. Đưa **Bridge URL** hiển thị trong tab cho trợ lý. Mặc định: `http://127.0.0.1:8888/`.

Đổi địa chỉ bằng **Apply URL**; **Reset to default** để khôi phục. Tắt bridge khi không cần điều khiển từ bên ngoài nữa.

Công việc trong Editor chạy trên main thread của Unity. Biên dịch hoặc domain reload có thể làm kết nối gián đoạn ngắn, hãy thử lại khi Unity sẵn sàng. Bridge vẫn chạy khi vào Play Mode để các lần chụp và job đã yêu cầu hoàn tất.

## Endpoint

| Endpoint | Mục đích |
| --- | --- |
| `GET /health` | Kiểm tra sẵn sàng |
| `POST /mcp` | MCP Streamable HTTP không trạng thái (`initialize`, `ping`, `tools/list`, `tools/call`) |
| `GET /tools?action=<action>` | Schema của một action |
| `GET /graph` | Snapshot graph |
| `POST /call` | Thực thi action |
| `POST /import` | Import / vá graph trực tiếp |
| `/graph-editor/` | Flow Editor và UI Designer trên trình duyệt |

## Cấu trúc yêu cầu

```json
{
  "tool": "manage_vinagen_ai_toolkit",
  "params": {
    "action": "plan_particle_system",
    "prompt": "Lửa xanh lặp lại bốc lên, không có khói",
    "focusWindow": false
  }
}
```

- Dùng `focusWindow: false` cho công việc chạy nền.
- Mặc định: `focusWindow=true`, `newSession=false`, `overwrite=false`, `useContextCache=true`.
- Phản hồi mặc định ở dạng `compact`; gửi `responseDetail: "full"` để có các trường cũ.
- Khi poll job sẽ nhận `revision`; gửi lại dưới dạng `ifChanged` và tuân theo `pollAfterMs`.
- Luôn lấy schema hiện hành bằng `GET /tools?action=<action>` trước khi gọi.

## Action thường dùng

| Nhóm | Action |
| --- | --- |
| **Graph** | `import_mock_flow_graph`, `import_design_content_graph`, `mutate_design_content_graph`, `patch_design_content_graph` |
| **Tài liệu UI** | `list_ui_documents`, `create_ui_document`, `read_ui_document`, `save_ui_document`, `import_ui_canvas`, `inspect_ui_studio_settings` |
| **Review UI** | `render_ui_web_demo`, `capture_ui_web_screens`, `inspect_ui_web_demo` |
| **Particle** | `plan_particle_system`, `create_particle_system`, `list_particle_templates`, `list_particle_prefabs`, `review_particle_system`, `inspect_particle_review` |
| **Texture** | `list_particle_textures`, `inspect_particle_texture`, `rebuild_default_particle_textures`, `audit_particle_textures`, `inspect_particle_tool_job` |
| **Thiết lập** | `install_vina_skills` |

### Quy trình particle

1. `plan_particle_system`: xem kế hoạch khi hình dạng hiệu ứng cụ thể.
2. `create_particle_system`: trả về kết quả và job/URL WebGL khi xuất `web_preview`.
3. Chờ `webPreviewStatusUrl` thành công rồi mở `webPreviewUrl`.
4. `review_particle_system`: kiểm tra hình ảnh có chủ đích. Poll job review/texture theo ID.

Giữ lại alias, đường dẫn và cảnh báo được trả về để chỉnh sửa tiếp chính xác.

## Quy tắc cho trợ lý

- Đọc và ghi asset graph qua bridge bằng bản vá có mục tiêu, **không bao giờ sửa YAML serialized của Unity**.
- Không gọi nhà cung cấp trả phí nếu người dùng không yêu cầu.
- Một số action báo thành công dạng xếp hàng trước tick editor kế tiếp; hãy kiểm tra kết quả cuối.
- Mỗi lần chỉ dùng một skill, không gửi cả thư mục skill.

## Bảo mật

Bridge chỉ nghe trên loopback. Web editor còn kiểm tra yêu cầu cùng origin và token theo phiên. Giữ bridge ở máy cục bộ và tắt khi xong việc.

---
[Tiếp theo: Cài đặt](settings.md)
