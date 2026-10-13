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
| `VinaTextPro/Fonts/` | Font mà sample và settings đi kèm sử dụng. |
| `Samples/Graphs/` | Mẫu Flow và Design graph. |
| `Samples/Example VinaGenUIDocument/` | Mẫu UI hoàn chỉnh. |
| `Samples/GeneratedParticles/` | Prefab particle được tạo, material, texture và ảnh chụp. |
| `Settings/`, `Skills/`, `Documentation/` | Cài đặt, hướng dẫn trợ lý và tài liệu tham khảo. |
| `Samples/GeneratedParticles/Preview/Scenes/` | Scene preview particle của dự án. |

## Đầu ra ngoài toolkit

- **Style, gradient và font chữ:** `Assets/VinaGenGenerated/Text Styles/`, `Text Gradients/` và `Fonts/VinaGenText/`. Style và gradient còn sót trong thư mục `VinaTextPro` cũ của toolkit được tự động chuyển về đây, giữ nguyên tham chiếu. Xem [VinaGenText](vinagen-text.md#tạo-label).
- **PSD riêng:** `Assets/VinaGen PSD Imports/<tên PSD>/` giữ tài liệu, ảnh, style, font và bake của từng lần import.
- **Chữ đã bake:** bản này có mặc định legacy `Assets/VinaGen Text Bakes/`. Với đầu ra toolkit/sample, đặt `Assets/VinaGen AI Toolkit/Samples/Text Effects/Bakes/` tại Text Settings.
- **Cache và job:** nằm trong `Library/`; báo cáo review có thể dùng `Builds/`.

Mặc định UI và particle trong bảng khớp code hiện tại. Chọn nơi lưu graph khi tạo; dự án cũ có thể còn đường dẫn output legacy.

Player WebGL được tải một lần, dùng chung trên máy tại `%USERPROFILE%/AppData/LocalLow/VinaGen/AIToolkit/WebGLPlayer`. Bundle dự án nằm trong `Library/VinaGen/ParticlePreview/<Pipeline>/fx/`. Builder dành cho tác giả nằm riêng tại `Assets/VinaGen Developer Tools/`; người dùng dùng player dựng sẵn. Xem [Web Particle](webgl-preview.md).

[Tiếp theo: Hỏi đáp & Xử lý sự cố](faq.md)
