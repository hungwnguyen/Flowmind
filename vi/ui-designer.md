# UI Designer

> Thiết kế màn hình game trên trình duyệt, import PSD và ảnh, gắn nhãn component, rồi import thành **Unity Canvas** dùng được ngay.

## Mở

- **Tools → VinaGen AI Toolkit → Editors → Open UI Designer**, hoặc
- Trên thanh trên cùng của Flow Editor chọn **UI Designer → Unity**, hoặc
- Double-click một asset **VinaGenUIDocument** (tạo bằng **Assets → Create → VinaGen AI Toolkit → UI Designer Document**).

![UI Designer với tài liệu mẫu VinaGenUIDocument](../images/ui-designer.png)

UI Designer dùng chung khung giao diện với Flow Editor: Files/Layers/Assets bên trái, thuộc tính Design/Unity bên phải, công cụ vẽ dưới canvas. Khi có thay đổi chưa lưu, thanh trên cùng hiện cảnh báo vàng và nút **Save** có dấu chấm.

## Dựng một màn hình

1. **New screen** hoặc **Import** (PSD, JSON hoặc ảnh) từ panel **Files**.
2. Vẽ **frame, hình chữ nhật, chữ và nút**; nhóm, nhân bản, sao chép/dán, căn/phân bố, sắp thứ tự, ẩn/khóa layer.
3. Kéo ảnh từ **Unity Assets** (hoặc file PNG/JPEG) vào canvas.
4. Gắn nhãn cho mỗi layer là **Background / Image / Button / Text / Group** bằng ô thuộc tính hoặc **Alt+1–5**.
5. Chọn anchor responsive, cắt phần con tràn ra ngoài hoặc cố định auto layout ngang/dọc.
6. Bấm **Save** để ghi asset `VinaGenUIDocument`.

Khi đang chọn đúng một đối tượng, công cụ tạo mới sẽ thêm con vào bên trong đối tượng đó theo tọa độ cục bộ. Bỏ chọn để tạo ở lớp ngoài cùng. **Root tools → Screen root** tạo một container có kích thước bằng màn hình.

### Mẹo chỉnh sửa

- **Bám khi di chuyển** vào cạnh/tâm của màn hình, cha và anh em, kèm đường căn đỏ và nhãn khoảng cách đều. **Alt+kéo** để bỏ bám, **Shift+kéo** để khóa theo một trục.
- Đổi kích thước từ **bốn góc hoặc bốn cạnh**; **Shift+đổi kích thước** giữ tỉ lệ.
- **Image → Scale → Fit** giữ tỉ lệ ảnh gốc; **Stretch** lấp đầy khung. **Reset to image size** trả về kích thước gốc.
- **Shift+1** vừa khung màn hình; lăn chuột để kéo khung nhìn; **Ctrl/Cmd+lăn** zoom quanh con trỏ.
- Bấm nhiều lần tại cùng một điểm để lần lượt chọn các layer chồng nhau; pixel trong suốt cho phép bấm xuyên qua.

## Import PSD

Import PSD v1 chạy trong Web Worker cục bộ, có tiến trình và nút hủy.

| Hỗ trợ | Cần kiểm tra / không hỗ trợ |
| --- | --- |
| Layer pixel RGB 8-bit (raw/RLE/ZIP), tên layer, nhóm, độ mờ, ẩn/hiện | Mask, blend mode khác normal, hiệu ứng, smart object (cần kiểm tra bằng mắt) |
| Layer một màu thành vùng tô Image chỉnh sửa được | PSB, CMYK và PSD 16/32-bit (không hỗ trợ) |
| Layer chữ được import dạng ảnh; gắn nhãn Text để sửa được | |

Mỗi lần import PSD giữ `Images/` và `Text Styles/` riêng trong `Assets/VinaGen PSD Imports/<tên PSD>/`.

## Layer chữ

Chọn **Typography → Text type**:

| Loại | Component khi import |
| --- | --- |
| **Text** | Unity UI Text |
| **TextMesh Pro** | `TextMeshProUGUI` với font SDF và preset material |
| **VinaGenText** | `VinaGen.Text.VinaGenText` với gradient, viền, outline và đổ khối; xem [VinaGenText](vinagen-text.md) |

Bản xem trước hiển thị hoàn toàn trên trình duyệt bằng font gốc. **Create TMP starter fonts** (trong UI Designer Settings, hoặc **Tools → VinaGen AI Toolkit → Editors → Create UI Designer TMP starter fonts**) đăng ký sáu font SDF có fallback tiếng Việt trong `Assets/VinaGenUI/Fonts/TextMeshPro`.

## 9-slice

UI Designer tự nhận biết viền 9-slice (dải RGBA lặp lại, lề và tâm hai pixel, theo thuật toán Auto9Slicer). Khi Save và import Canvas, mỗi PNG/JPEG gốc độc lập được thay một lần bằng texture tối ưu nhỏ nhất mà vẫn giữ GUID, và mọi layer 9-slice dùng Image kiểu **Sliced** của Unity với đầy đủ viền sprite. Ảnh một màu trở thành Image có **Source Image = None**.

## Import vào Unity

Bấm nút **Unity** màu xanh (hoặc **Import to Unity Canvas** trong Inspector của tài liệu):

- Mọi tham chiếu được kiểm tra trước khi tạo đối tượng; cả lần import là một nhóm **Undo** riêng.
- Dùng Canvas đang chọn trong scene, hoặc tạo Canvas screen-space mới. **Scene không được tự lưu.**
- Layer **Image** và **Button** dùng component Image chuẩn của Unity; Button nhận Image đó làm target Graphic. Sự kiện click do bạn tự nối.
- Đối tượng có kích thước bằng màn hình trong Settings dùng anchor **Stretch–Stretch**; popup khác dùng anchor Center.
- Hình chữ nhật auto layout được cố định; không tạo LayoutGroup động.
- Preset Game View **VinaGen UI Designer** được chọn/cập nhật theo độ phân giải trong Settings.

Sau khi import, chỉnh chữ/style/typography trong cùng phiên trình duyệt sẽ cập nhật trực tiếp đối tượng chữ đã import, không cần import lại.

## Show in Editor

Nút **Show in Editor** trên thanh công cụ ping asset tài liệu đang mở trong cửa sổ Project. Nếu còn thay đổi chưa lưu, bạn được chọn **Save and open** hoặc **Open and discard**.

## Cài đặt

**Tools → VinaGen AI Toolkit → Settings → UI Designer Settings** mở `VinaGenUIStudioSettings.asset` với các thẻ:

- **Assets**: thư mục tài liệu, ảnh và font (thả nhiều font TTF/OTF cùng lúc).
- **Canvas**: chiều rộng và chiều cao tham chiếu (độ phân giải màn hình).
- **Shortcuts**: bấm vào phím hoặc **Record**, rồi nhấn tổ hợp phím. Phím trùng và phím dành riêng bị từ chối.

## Review bằng AI

Client MCP có thể trình bày thiết kế bằng `render_ui_web_demo`, rồi yêu cầu **mỗi màn hình/popup một ảnh PNG đã cắt** bằng `capture_ui_web_screens` và theo dõi `inspect_ui_web_demo`. Ảnh lưu vào `Builds/UIStudioReview/<requestId>/`. Các action này không lưu tài liệu hay scene. Xem [MCP Bridge](mcp-bridge.md).

---
[Tiếp theo: VinaGenText](vinagen-text.md)
