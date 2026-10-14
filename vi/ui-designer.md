# UI Designer

Dựng màn hình, popup và component UI bằng layer chỉnh sửa được. Xuất ra PSD/PNG, hoặc chuyển thành Unity Canvas.

> Không có Unity? Dùng [Web Designer](web-designer.md) miễn phí trên trình duyệt.

## Mở editor

Chọn **Tools → VinaGen AI Toolkit → Editors → Open UI Designer**, hoặc nhấp đúp asset `VinaGenUIDocument`.

![UI Designer với tài liệu mẫu](../images/ui-designer.png)

## Dựng màn hình

1. Chọn **New screen**, hoặc import PSD, JSON, ảnh.
2. Tạo **Screen root** (**Root tools**) cho mỗi màn hình hoặc popup.
3. Thêm ảnh, chữ, nút, nhóm; sắp xếp trong **Layers**.
4. Chỉnh kích thước, màu, font, component và anchor trong **Inspector**.
5. **Save** để lưu, **Export** để tải file, hoặc bấm **Canvas** để dựng trong Unity.

Chiều rộng/cao của tài liệu quyết định kích thước Canvas và Game View.

## Workspace

| Khu vực | Dùng để |
| --- | --- |
| **Files** | Tạo, mở và tìm tài liệu. |
| **Layers** | Chọn, đổi tên, đổi thứ tự, lồng, ẩn và khóa layer. |
| **Assets** | Duyệt ảnh trong dự án và kéo vào canvas. |
| **Inspector** | Chỉnh bố cục, màu, ảnh, chữ và thuộc tính Unity. |
| **Thanh công cụ dưới** | Move, Hand, Scale, root, hình, Image, Text và Comment. |

Chọn một object trước khi thêm để tạo con bên trong nó; bỏ chọn để thêm ở cấp ngoài cùng. **Add Component** đặt vai trò (Image/Button/Text/Group: `Alt+2–5`).

| Layer | Trong Unity thành |
| --- | --- |
| **Empty / Group** | `RectTransform` rỗng. |
| **Image** | `Image` (hình vẽ dùng `VinaGenUIShape`). |
| **Button** | Image + Button từ Button prefab. Thêm Text con nếu cần nhãn. |
| **Text** | Text, TextMeshPro hoặc VinaGenText theo **Text type**. |
| **Canvas Group** | `CanvasGroup` (opacity, interactable, raycast). |
| **Horizontal / Vertical / Grid** | LayoutGroup tương ứng. |

![Tab Files mở sample UI](../images/ui-files.png)

![Tab Assets: chọn thư mục trước khi duyệt ảnh](../images/ui-assets.png)

Trong **Assets**, bấm **Choose folder…** trước — bảng sẽ trống cho đến khi chọn thư mục. [Demo](demos.md) có bài thực hành ba màn hình.

## Mẹo chỉnh sửa

- **Ctrl/Cmd-click** để thêm vào vùng chọn, **Shift-click** để chọn một dải, hoặc kéo khung trên canvas.
- Căn lề, group, duplicate, copy/paste, đổi thứ tự từ thanh công cụ hoặc menu chuột phải.
- **Move** tự bám cạnh và tâm. `Alt`+kéo để bỏ bám; `Shift`+kéo để khóa một trục.
- Giữ `Shift` khi resize để giữ tỉ lệ. **Scale** (`K`) co giãn cả cỡ chữ và viền.
- **Selection colors** đổi một màu ở mọi nơi trong vùng chọn cùng lúc.

## Ảnh, hình và 9-slice

Thả file PNG/JPEG hoặc kéo ảnh từ **Assets**. **Reset to image size** trả về kích thước gốc.

| Image mode | Kết quả |
| --- | --- |
| **Preserve Aspect** | Vừa trong khung, giữ tỉ lệ. |
| **None** | Kéo giãn phủ kín khung. |
| **9-slice** | Giữ góc sắc nét, chỉ kéo phần giữa — hợp cho panel và nút. |

Viền 9-slice được tự nhận diện và thành Sliced Sprite trong Unity.

Các hình (Rectangle, Line, Arrow, Ellipse, Polygon, Star) vẫn sửa được. **Fill** hỗ trợ màu đơn và gradient; **Stroke** chỉnh viền. **Clip** ẩn phần con tràn ra ngoài.

## Fusion images

Gộp nhiều ảnh thành một PNG, chữ vẫn sửa được.

1. Chọn Image, Button hoặc Group có ảnh con.
2. Bấm **Fusion images** trong mục **Image**.
3. PNG gộp được lưu vào dự án và gán cho object. Nhớ **Save** tài liệu.

Chữ, layer ẩn và layer bị khóa không bị gộp. Undo khôi phục layer, nhưng file PNG vẫn ở lại dự án. Giới hạn PNG: **5 MB**.

## Chữ và font

**Typography → Text type** có **Text**, **TextMesh Pro** và **VinaGenText**. Dùng [VinaGenText](vinagen-text.md) khi cần gradient, viền và bake chữ.

Text hỗ trợ căn lề, xuống dòng, auto size, spacing và chữ uốn cong (**Text on path**).

Đăng ký font tại **Settings → UI Designer Settings**. **Editors → Create UI Designer TMP starter fonts** tạo sẵn font TMP. Đổi **Text type** xong cần import lại Canvas.

## Import PSD

Hỗ trợ **PSD RGB 8-bit**: layer, nhóm, tên, opacity, ẩn/hiện và blend mode phổ biến. Layer chữ được khôi phục thành chữ sửa được khi có thể; phần còn lại thành ảnh.

- PSD không chứa font. Đặt **PSD import → Default font** cho font bị thiếu.
- Mỗi lần import được lưu trong `Assets/VinaGen PSD Imports/<tên PSD>/`.
- Chưa hỗ trợ: PSB, CMYK, 16/32-bit. Kiểm tra mask, smart object và hiệu ứng bằng mắt.

## Export PSD, SVGPRO, SVG và PNG

1. Chọn object muốn xuất (nếu chỉ xuất một phần).
2. Bấm **Export** (hoặc **More actions → Export**).
3. Trong **Content**, chọn **Selected object(s)** hoặc **All objects**.
4. Bấm **PSD**, **SVGPRO**, **SVG** hoặc **PNG**.

![Hộp Export với PSD, SVGPRO, SVG và PNG](../images/ui-export.png)

| Định dạng | Bạn nhận được |
| --- | --- |
| **PNG** | Một ảnh trong suốt kích thước 1×. |
| **SVG** | File xem được trên trình duyệt, nhúng sẵn ảnh và font. |
| **SVGPRO** | Toàn bộ tài liệu kèm ảnh và font. Kéo vào dự án Unity khác để import. |
| **PSD** | Layer, nhóm và chữ sửa được. Font không được nhúng. |

Muốn mỗi màn hình một file: chọn từng Screen root rồi xuất lần lượt.

Giới hạn: **8.192 px mỗi cạnh, 16 megapixel**. PSD: tối đa **1.000 layer** và **500 MB**. Không sửa tài liệu khi đang xuất.

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

**Settings → UI Designer Settings** chứa thư mục, font, Button prefab, độ phân giải mặc định, anchor và phím tắt. **Comment** thêm ghi chú review, không xuất hiện trong Unity.

Trợ lý AI có thể chụp từng màn hình qua [MCP Bridge](mcp-bridge.md).

[Tiếp theo: VinaGenText](vinagen-text.md)
