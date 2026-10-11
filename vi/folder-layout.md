# Cấu trúc thư mục

Toolkit được cài tại `Assets/VinaGen AI Toolkit/`.

## Thư mục chính

Các đường dẫn dưới đây tính từ thư mục toolkit.

| Thư mục | Nội dung |
| --- | --- |
| `Editor/`, `Runtime/` | Công cụ Editor, component runtime và shader. |
| `Content/UI/Documents/`, `Content/UI/Images/` | Mặc định lưu tài liệu UI và ảnh tải lên. |
| `Content/Particles/ToonLibrary/` | Prefab particle đi kèm và asset liên quan. |
| `Images/Particles/` | Texture particle và manifest. |
| `VinaTextPro/Fonts/`, `VinaTextPro/Text Styles/` | Font và style chữ dùng lại được. |
| `Samples/Graphs/` | Mẫu Flow và Design graph. |
| `Samples/Example VinaGenUIDocument/` | Mẫu UI hoàn chỉnh. |
| `Samples/GeneratedParticles/` | Prefab particle được tạo, material, texture và ảnh chụp. |
| `Settings/`, `Skills/`, `Documentation/` | Cài đặt, hướng dẫn trợ lý và tài liệu tham khảo. |
| `WebGLBuilds/ParticlePreview/` | Player WebGL dựng sẵn. |

## Đầu ra ngoài toolkit

- **PSD riêng:** `Assets/VinaGen PSD Imports/<tên PSD>/` giữ tài liệu, ảnh, style, font và bake của từng lần import.
- **Chữ đã bake:** mặc định `Assets/VinaGen Text Bakes/`. Đổi tại Text Settings.
- **Cache và job:** nằm trong `Library/`; báo cáo review có thể dùng `Builds/`.

Mặc định UI và particle trong bảng khớp code hiện tại. Chọn nơi lưu graph khi tạo; dự án cũ có thể còn đường dẫn output legacy.

[Tiếp theo: Hỏi đáp & Xử lý sự cố](faq.md)
