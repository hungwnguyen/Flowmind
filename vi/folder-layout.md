# Cấu trúc thư mục

Toolkit được cài tại `Assets/VinaGen AI Toolkit/`.

## Thư mục trong toolkit

Các đường dẫn dưới đây tính từ thư mục toolkit.

| Thư mục | Nội dung |
| --- | --- |
| `Editor/`, `Runtime/` | Công cụ Editor, component runtime và shader. |
| `MockGraph/` | Kiểu dữ liệu Flow và Design graph. |
| `StandaloneText/` | VinaGenText: component, shader, font và editor. |
| `VinaTextPro/Fonts/` | Font dùng cho sample và settings đi kèm. |
| `DesignCaptureStudio/` | Công cụ chụp màn hình và scene trong Editor. |
| `Content/UI/` | Prefab UI đi kèm. Tài liệu UI mới lưu ở `Documents/`, ảnh tải lên ở `Images/`. |
| `Content/Particles/` | Thư viện particle đi kèm (`ToonLibrary/`), material, mesh và recipe. |
| `Images/Particles/` | Texture particle theo bộ và manifest. |
| `Samples/Graphs/` | Mẫu Flow và Design graph. |
| `Samples/Example VinaGenUIDocument/` | Mẫu UI hoàn chỉnh. |
| `Samples/Particles/`, `Samples/Text Effects/` | Mẫu particle và hiệu ứng chữ. |
| `Samples/GeneratedParticles/` | Particle do trợ lý tạo: prefab, `Materials/`, `Textures/`, scene preview trong `Preview/Scenes/`. |
| `Settings/` | Asset cài đặt, gồm AI Provider Settings. |
| `Skills/`, `Documentation/` | Hướng dẫn cho trợ lý AI và tài liệu tham khảo. |

## Đầu ra ngoài toolkit

| Đường dẫn | Nội dung |
| --- | --- |
| `Assets/VinaGenGraphs/BlockDiagrams/`, `WhiteFrames/` | Flow và Design graph tạo qua MCP khi không chỉ định đường dẫn. |
| `Assets/VinaGenGenerated/` | `Text Styles/`, `Text Gradients/`, `Fonts/VinaGenText/` của VinaGenText và `Code/` do chat tạo. Xem [VinaGenText](vinagen-text.md?id=tạo-label). |
| `Assets/VinaGen PSD Imports/<tên PSD>/` | Tài liệu, ảnh, style, font và bake của từng lần import PSD. |
| `Assets/VinaGen Text Bakes/` | Chữ đã bake; đổi nơi lưu trong Text Settings. |
| `Library/VinaGen/` | Cache, bản khôi phục UI và bundle preview particle (`ParticlePreview/<Pipeline>/fx/`). |

Player WebGL dùng cho [Web Particle](webgl-preview.md) được tải một lần cho mỗi máy, lưu tại `%USERPROFILE%/AppData/LocalLow/VinaGen/AIToolkit/WebGLPlayer` trên Windows, hoặc `~/.local/share/VinaGen/AIToolkit/WebGLPlayer` trên macOS/Linux.

Dự án cũ có thể còn file ở đường dẫn đời trước, ví dụ `VinaTextPro/Text Styles/` (tự chuyển sang `Assets/VinaGenGenerated/`) hoặc `Assets/VinaGenParticles/` (vẫn đọc được).

[Tiếp theo: Hỏi đáp & Xử lý sự cố](faq.md)
