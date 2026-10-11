# Cấu trúc thư mục

> Code và nội dung dùng lại của sản phẩm nằm trong `Assets/VinaGen AI Toolkit/`. Mọi thứ **bạn** tạo ra nằm trong các thư mục `Assets/VinaGen*` riêng.

## Thư mục toolkit

| Thư mục | Nội dung |
| --- | --- |
| `Editor/Core`, `Graph`, `Design`, `Chat` | Cửa sổ chính, graph/design editor gốc, chat và nhà cung cấp. |
| `Editor/Bridge`, `UIStudio` | Truyền tải HTTP/MCP và công cụ tài liệu; tài liệu UI, import Canvas, chữ và bản xem trước. |
| `Editor/Particles` | Tạo, texture/catalog, material, thư viện, authoring, kiểm tra, xem trước và review. |
| `Editor/Images`, `Settings`, `Packaging` | Tạo ảnh, inspector cài đặt/hook biểu tượng và xuất portable. |
| `Editor/WebGraph` | Editor trình duyệt đi kèm (HTML/CSS/JS). |
| `Runtime/` | Code runtime cho graph, UI, chữ và particle, cùng shader và interop WebGL. |
| `Content/Particles/ToonLibrary` | Prefab, material, texture và artwork particle đi kèm. |
| `Content/UI/Prefabs` | Template UI dùng lại được. |
| `Images/` | Texture và manifest particle, icon editor, ảnh xem trước và ảnh tài liệu. |
| `Settings/` | Asset cài đặt (biểu tượng robot) và metadata texture theo dataset. |
| `Samples/` | Graph, tài liệu UI và particle mẫu. |
| `Skills/` | Hướng dẫn AI dạng module (router + mỗi mục đích một skill). |
| `StandaloneText/`, `VinaTextPro/` | Engine VinaGenText, font, style và gradient. |
| `DesignCaptureStudio/`, `MockGraph/` | Design Capture cho Canvas và mock graph đi kèm. |
| `WebGLBuilds/ParticlePreview` | Player xem trước Built-in/URP dựng sẵn, có phiên bản. |
| `Documentation/` | Tài liệu trong package. |

## Kết quả của dự án bạn

| Thư mục | Nội dung |
| --- | --- |
| `Assets/VinaGenUI/` | Ảnh UI (kể cả `PSD Imported/`), font và text style từ UI Designer. |
| `Assets/VinaGen PSD Imports/<tên PSD>/` | Ảnh và text style của từng lần import PSD. |
| `Assets/VinaGenParticles/` | Prefab, material, texture, scene xem trước và ảnh chụp được tạo ra. |
| `Assets/VinaGenGraphs/` | Block diagram và white frame. |
| `Assets/VinaGenGenerated/Code` | Vị trí mặc định của source code được sinh ra. |
| `Assets/VinaGenImages/Generated` | Artwork cá nhân được tạo và nguồn gốc của nó. |
| `Library/…` | Cache, job và snapshot web dựng lại được. |
| `Builds/…` | Ảnh review và báo cáo kiểm chứng. |

Không thư mục nào ở trên là bắt buộc khi cài toolkit, và tất cả đều bị loại khỏi bản phân phối toolkit.

## Xuất portable

`VinaGenPackageExporter` ghi một `.unitypackage` đã lọc cùng file `.unitypackage.audit.json` bên cạnh, liệt kê asset được đưa vào, asset bị loại và vấn đề phụ thuộc. Bộ xuất loại trừ cài đặt cá nhân, thông tin xác thực, artwork được tạo, kết quả của người dùng, cache WebGL và test. Xuất hàng loạt từ một dự án **đang đóng**:

```sh
Unity -batchmode -quit -projectPath <project> -executeMethod FlowCanvasExporter.Editor.VinaGenPackageExporter.ExportBatch -vinagenPackage <destination.unitypackage>
```

> Đừng xuất cả thư mục làm việc với **Include dependencies**, vì cách đó kéo theo cả những kết quả cá nhân mà bộ xuất cố ý lọc bỏ.

---
[Tiếp theo: Hỏi đáp & Xử lý sự cố](faq.md)
