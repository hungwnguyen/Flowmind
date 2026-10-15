# UI Designer — Offline (Unity)

Dựng màn hình, popup và component UI bằng layer chỉnh sửa được. Xuất ra PSD/PNG, hoặc chuyển thành Unity Canvas.

<nav class="vg-designer-nav" aria-label="Hướng dẫn UI Designer"><a href="#/vi/designer-guide">Tổng quan</a><a href="#/vi/web-designer">Online · Web</a><a href="#/vi/ui-designer" aria-current="page">Offline · Unity</a></nav>

Bản Offline chạy cùng VinaGen AI Toolkit trong dự án Unity. Editor mở trên trình duyệt qua kết nối cục bộ; giữ Unity mở khi chỉnh sửa. Nếu chưa cài Unity, chọn [Online · Web Designer](web-designer.md).

Các thao tác thiết kế và icon dùng chung nằm trong [Tổng quan](designer-guide.md). Phần này chỉ hướng dẫn kết nối và tài nguyên Unity.

## Mở editor

Chọn **Tools → VinaGen AI Toolkit → Editors → Open UI Designer**, hoặc nhấp đúp asset `VinaGenUIDocument`.

![UI Designer với tài liệu mẫu](../images/ui-designer.png)

## Tài nguyên trong dự án Unity

**Files** duyệt tài liệu trong dự án; **Assets → Choose folder…** chọn thư mục bên trong `Assets/` trước khi duyệt ảnh. Có thể kéo thumbnail hoặc dùng đường dẫn `Assets/...` để thêm ảnh. Ảnh mới được lưu theo UI Designer Settings hoặc thư mục ảnh riêng của tài liệu.

![Tab Files trong dự án](../images/ui-files.png)

![Chọn thư mục Assets trong Unity](../images/ui-assets.png)

Mỗi lần nhập PSD dùng thư mục riêng `Assets/VinaGen PSD Imports/<tên PSD>/`, gồm ảnh, style và tài liệu. Đường dẫn này được giữ khi lưu và import Canvas. Fusion tạo/cập nhật PNG trong dự án; Undo khôi phục layer nhưng PNG vẫn ở lại. Save/Canvas import có thể tối ưu ảnh nguồn 9-slice và giữ GUID; các tài liệu dùng chung nguồn sẽ nhận thay đổi.

## Font, Text type và material TMP

**Typography → Text type** có **Text**, **TextMesh Pro** và **VinaGenText**. Đăng ký font tại **Settings → UI Designer Settings**; **Editors → Create UI Designer TMP starter fonts** tạo sẵn font TMP. Đổi Text type xong cần import lại Canvas.

**PSD import → Default font** chọn font đã đăng ký khi PSD thiếu font. Material TMP và preset phải khớp atlas của font. Dùng [VinaGenText](vinagen-text.md) khi cần gradient, viền và bake chữ.

## Layer khi chuyển vào Unity

**Add Component** đặt vai trò Image/Button/Text/Group (`Alt+2–5`); **Canvas Group** thêm opacity, interactable và raycast. Đây là các thuộc tính Unity bổ sung cho thiết kế chung.

| Layer | Trong Unity thành |
| --- | --- |
| **Empty / Group** | `RectTransform` rỗng. |
| **Image** | `Image` (hình vẽ dùng `VinaGenUIShape`). |
| **Button** | Image + Button từ Button prefab. Thêm Text con nếu cần nhãn. |
| **Text** | Text, TextMeshPro hoặc VinaGenText theo **Text type**. |
| **Canvas Group** | `CanvasGroup` (opacity, interactable, raycast). |
| **Horizontal / Vertical / Grid** | LayoutGroup tương ứng. |

9-slice trở thành Sliced Sprite, hình vẽ trở thành `VinaGenUIShape`, Clip trở thành `RectMask2D`. Canvas dùng standard alpha blending; blend mode và hiệu ứng có thể khác preview trên trình duyệt.

## Chuyển vào Unity Canvas

1. **Save** tài liệu.
2. Trong Unity, chọn một Canvas (hoặc không chọn — Canvas mới sẽ được tạo).
3. Chọn **Canvas** trong ô **Unity UI system** rồi bấm icon import bên cạnh.
4. Kiểm tra kết quả trong Hierarchy và Game View.
5. Nối sự kiện cho nút và **tự lưu scene**. Lưu root thành prefab nếu muốn dùng lại.

Cách khác: chọn asset `VinaGenUIDocument`, gán **Target Canvas** trong Inspector rồi bấm **Import to Canvas**.

Mỗi lần import tạo một bản mới (một bước Undo). Bản import cũ không tự cập nhật hay bị xóa.

![Kết quả Canvas của sample trong Game View](../images/ui-canvas-demo.png)

### Màn hình và popup

Mỗi **Screen root** (hoặc container bật **Import as popup**) thành một màn hình riêng dưới Canvas, đặt ở giữa. Root toàn màn hình được kéo giãn; popup nhỏ được căn giữa. Root ẩn import ở trạng thái inactive. Layer nằm ngoài root bị bỏ qua.

### Anchor, layout và nút

- **Auto adjust anchors** (UI Designer Settings) tự đặt anchor theo vị trí layer. Tắt đi nếu muốn tự đặt.
- **Horizontal / Vertical / Grid** thành LayoutGroup hoạt động trong Unity.
- Nút được tạo từ **UI Designer Settings → Button prefab**.

### Màu trong dự án Linear

Nếu màu khác so với trình duyệt ở dự án dùng Linear color, dùng **VinaGenUIGammaCompositor** hoặc **Linear alpha → Compensate Alpha** trong Settings. Luôn kiểm tra Game View.

## Chuyển vào Unity UI Toolkit

1. Thoát Play Mode và Prefab Mode; lưu tài liệu.
2. Chọn **UI Toolkit** trong ô **Unity UI system** rồi bấm import.
3. Kiểm tra UXML trong thư mục **UI Toolkit/** và **UIDocument** trong scene. Lưu scene.

Dùng `ShowScreen(layerId)`, `FindLayer(layerId)` và `ButtonClicked` để nối với game. Một số hiệu ứng chữ, hình và component tùy chỉnh chưa hỗ trợ đầy đủ — đọc cảnh báo và so sánh kết quả.

## Lưu và cài đặt

**Save** (`Ctrl/Cmd+S`) lưu `VinaGenUIDocument`. **Show in Editor** chọn asset trong cửa sổ Project.

**Settings → UI Designer Settings** chứa thư mục, font, Button prefab, độ phân giải mặc định, anchor và phím tắt.

Trợ lý AI có thể chụp từng màn hình qua [MCP Bridge](mcp-bridge.md).

**Export SVGPRO** lưu tài liệu trước rồi tải gói kèm tài nguyên. Có thể kéo gói vào dự án Unity khác để import.

Phím mặc định riêng: **R** chọn Image, **F** chọn Group; **Alt+2/3/4/5** đổi vai trò Image/Button/Text/Group; **Ctrl/Cmd+Shift+I** import Unity. Các phím này có thể đổi trong UI Designer Settings.
