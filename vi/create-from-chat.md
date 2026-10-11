# Tạo từ Claude Code / Codex

> Gõ `/vina <yêu cầu>` trong Claude Code hoặc `$vina <yêu cầu>` trong Codex, trợ lý sẽ dựng màn hình UI, graph, particle hay ảnh ngay trong dự án Unity của bạn.

## Tự động thiết lập

Sau khi Unity import và biên dịch toolkit, các chat skill riêng cho dự án được đăng ký tự động:

| Host | Entry | Cách gọi |
| --- | --- | --- |
| **Claude Code** (terminal hoặc Desktop) | `.claude/skills/vina/SKILL.md` | `/vina …` |
| **Codex** | `.agents/skills/vina/SKILL.md` | `$vina …` (hoặc bộ chọn `/skills`) |

Cả hai entry chỉ là con trỏ ngắn tới `Skills/vina/SKILL.md` gốc của toolkit. Thiết lập chạy lại khi mở editor, nạp lại script và import skill, không ghi lại file không đổi.

- Skill do người dùng tự viết, lệnh cũ `.claude/commands/vina.md` và thư mục skill liên kết đều được **giữ nguyên**.
- Nếu một host bị xung đột hoặc không ghi được thư mục, host còn lại vẫn cài được.
- Việc đăng ký **không** bật bridge, không cài Claude/Codex, không đăng nhập hộ bạn và không sửa cấu hình global, `AGENTS.md` hay `CLAUDE.md`.

Xem trạng thái tại **Tools → VinaGen AI Toolkit → Open → MCP Bridge**. **Install chat skills** (hoặc MCP action `install_vina_skills`) sẽ cài lại. Mở lại chat của dự án nếu host chưa nhận entry mới.

## Sử dụng

1. Bật bridge: **Open → MCP Bridge → Start**.
2. Hỏi trong host:

```text
/vina tạo màn hình shop vào Assets/MyUI/Shop.asset
/vina tạo UI mới từ mẫu trong Samples, tên Shop
/vina tạo hiệu ứng lửa
/vina tạo flow đăng nhập
```

Trong Codex, dùng cùng yêu cầu sau `$vina`.

Model của host tự thiết kế; các thao tác ghi qua MCP có cấu trúc chạy offline. Tạo UI có cấu trúc không cần thêm server, package npm hay API AI trả phí. Thao tác particle hoặc ảnh dựa trên nhà cung cấp vẫn cần nhà cung cấp đã cấu hình.

## Action cho tài liệu UI

| Action | Mục đích |
| --- | --- |
| `list_ui_documents` | Phân trang đường dẫn, kích thước và số layer của các mẫu mà không tải toàn bộ tài liệu. |
| `create_ui_document` | Tạo tài liệu mới từ `document` tự viết, `templatePath` có sẵn hoặc bảng trống. Mặc định `dryRun: true`; đặt `false` để tạo thật. Asset có sẵn không bao giờ bị ghi đè. |
| `read_ui_document` / `save_ui_document` | Chỉnh sửa theo revision của tài liệu. |

Nhân bản từ mẫu giữ nguyên tham chiếu GUID/localId của Unity và các layer chỉnh sửa được.

## Bộ định tuyến skill

Thư mục `Skills/` của toolkit chuyển mỗi yêu cầu tới đúng **một** skill chuyên biệt:

| Mục đích | Skill |
| --- | --- |
| `/vina` hoặc `$vina` từ chat | `vina` |
| Logic, trình tự, tiến trình | `mock-flow-graph` |
| Layout white-frame, nội dung màn hình | `design-content-graph` |
| Chỉnh graph trên trình duyệt | `web-graph-editor` |
| UI game, JSON có nhãn, PSD, import Canvas | `ui-studio` |
| Sprite hoặc icon pixel | `pixel-image` |
| Tạo ảnh tổng quát | `image-generation` |
| Dựng FX, chọn texture/template | `particle-system` |
| Preset / recipe FX | `particle-recipes` |
| Định hướng mỹ thuật FX | `particle-art-direction` |
| Ngân sách chi phí/chất lượng FX | `particle-budget` |
| Tạo/import/sửa texture | `particle-texture` |
| Chụp Play Mode, review WebGL | `particle-review` |
| Kết nối bridge | `core` |

> Đừng ghép cả thư mục skill vào một prompt. Hãy đọc router, rồi đúng một skill.

---
[Tiếp theo: MCP Bridge](mcp-bridge.md)
