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

Nói rõ bạn muốn gì, phong cách và tên. Có thể kèm đường dẫn lưu, ví dụ `Assets/VinaGen AI Toolkit/Content/UI/Documents/Shop.asset`.

## Yêu cầu agent kiểm thử particle

```text
$vina tạo một particle offline, dùng Web Particle chụp lúc bắt đầu, đỉnh
và tắt dần; xem ảnh, sửa lỗi rồi kiểm thử lại prefab đã lưu.
```

Agent dùng [Web Particle](webgl-preview.md) để xem hiệu ứng, rồi lưu bản sửa trong Unity.

![MCP Bridge với trạng thái đăng ký chat skill](../images/toolkit-bridge.png)

## Nếu chưa có lệnh

Trong tab **MCP Bridge**, bấm **Install chat skills** rồi mở lại chat. Skill bạn tự tạo không bị ảnh hưởng.

| Trợ lý | File đăng ký trong dự án |
| --- | --- |
| Claude Code | `.claude/skills/vina/SKILL.md` |
| Codex | `.agents/skills/vina/SKILL.md` |

Chi phí trợ lý tính theo tài khoản Claude Code / Codex của bạn.

[Tiếp theo: MCP Bridge](mcp-bridge.md)
