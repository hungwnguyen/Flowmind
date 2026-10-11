# Tạo từ Claude Code / Codex

Yêu cầu trợ lý tạo màn hình UI, graph hoặc hiệu ứng trong dự án Unity.

## Cách dùng

1. Import toolkit, đợi Unity biên dịch. Skill chat của dự án được đăng ký tự động.
2. Mở **Tools → VinaGen AI Toolkit → Open → MCP Bridge → Start**.
3. Mở Claude Code hoặc Codex trong dự án Unity này.
4. Viết yêu cầu với `/vina` (Claude Code) hoặc `$vina` (Codex).

```text
/vina tạo màn hình shop từ mẫu đi kèm trong Samples, tên Shop
$vina tạo flow đăng nhập có nhánh thành công và thất bại
$vina tạo hiệu ứng lửa xanh lặp lại bằng texture offline
```

Nêu kết quả cần có, phong cách và tên đầu ra. Thêm đường dẫn khi cần, ví dụ tài liệu UI mới: `Assets/VinaGen AI Toolkit/Content/UI/Documents/Shop.asset`.

## Nếu chưa có lệnh

Trong tab **MCP Bridge**, kiểm tra trạng thái rồi bấm **Install chat skills**. Mở lại chat của dự án. Skill do bạn tạo được giữ nguyên; tự xử lý nếu có báo trùng tên.

| Trợ lý | File đăng ký trong dự án |
| --- | --- |
| Claude Code | `.claude/skills/vina/SKILL.md` |
| Codex | `.agents/skills/vina/SKILL.md` |

Trợ lý cần quyền truy cập dự án và bridge. Chi phí trợ lý theo tài khoản đang dùng; tạo ảnh qua nhà cung cấp có yêu cầu riêng.

[Tiếp theo: MCP Bridge](mcp-bridge.md)
