# UI Designer

Thiết kế màn hình, popup và component bằng layer chỉnh sửa được. Chọn **Online** để làm trên web hoặc **Offline** để làm cùng dự án Unity.

<nav class="vg-designer-nav" aria-label="Hướng dẫn UI Designer"><a href="#/vi/designer-guide" aria-current="page">Tổng quan</a><a href="#/vi/web-designer">Online · Web</a><a href="#/vi/ui-designer">Offline · Unity</a></nav>

Các bước và icon bên dưới dùng chung cho cả hai phiên bản. Hãy đọc phần này một lần, rồi chọn **Online** để mở web hoặc **Offline** để kết nối với dự án Unity.

## Workspace

| Khu vực | Dùng để |
| --- | --- |
| **Files** | Tạo, mở và tìm tài liệu. |
| **Layers** | Chọn, đổi tên, đổi thứ tự, lồng, ẩn và khóa layer. |
| **Assets** | Duyệt ảnh và kéo vào canvas. |
| **Inspector** | Chỉnh kích thước, vị trí, màu, ảnh và chữ của vùng chọn. |
| **Thanh công cụ dưới** | Move, Hand, Scale, root, hình, Image, Text và Comment. |

Thanh công cụ trên quản lý lưu/nhập/xuất; thanh dưới canvas chứa công cụ vẽ. Di chuột lên nút để xem tên. Files và Assets dùng nguồn lưu trữ riêng của mỗi phiên bản.

## Dựng màn hình đầu tiên

1. Tạo tài liệu mới hoặc nhập PSD/ảnh bằng **Import**.
2. Mở **Root tools → Screen root** cho mỗi màn hình/popup; dùng **Empty** cho vùng chứa bên trong.
3. Thêm hình, Image, Text, Button và sắp xếp trong **Layers**.
4. Chỉnh vị trí, kích thước, màu và Typography trong **Inspector**.
5. **Save** tài liệu; dùng **Export** để chia sẻ hoặc làm bước tiếp theo trong phần Offline để đưa vào Unity.

Chọn object trước khi thêm để tạo con bên trong nó; bỏ chọn để thêm ở cấp ngoài cùng. Đổi chiều rộng/cao của tài liệu trong Screen inspector.

## Nhận diện các nút chung

Icon bên trái dùng theme **Light**, bên phải dùng **Dark**. Hình dáng và nét SVG được lấy từ editor thật; công cụ đang chọn có icon trắng trên nền xanh dương. Save, Reload, Import, Export và Settings cùng dùng các biểu tượng này. Nút chọn workspace, Demo và nút import Unity nằm trong hướng dẫn riêng.

<table class="vg-icon-table">
<thead><tr><th scope="col">Sáng / Tối</th><th scope="col">Nút / Công cụ</th><th scope="col">Cách sử dụng</th></tr></thead>
<tbody>
<tr><td><img class="vg-editor-icon vg-editor-icon--small" src="images/web-designer/icons/reload-light.svg" alt="" width="28" height="28"><img class="vg-editor-icon vg-editor-icon--small" src="images/web-designer/icons/reload-dark.svg" alt="" width="28" height="28"></td><td><strong>Reload</strong></td><td>Nạp lại tài liệu đã lưu.</td></tr>
<tr><td><img class="vg-editor-icon vg-editor-icon--small" src="images/web-designer/icons/save-light.svg" alt="" width="28" height="28"><img class="vg-editor-icon vg-editor-icon--small" src="images/web-designer/icons/save-dark.svg" alt="" width="28" height="28"></td><td><strong>Save · Ctrl/Cmd+S</strong></td><td>Lưu tài liệu hiện tại. Nơi lưu phụ thuộc phiên bản.</td></tr>
<tr><td><img class="vg-editor-icon vg-editor-icon--small" src="images/web-designer/icons/import-light.svg" alt="" width="28" height="28"><img class="vg-editor-icon vg-editor-icon--small" src="images/web-designer/icons/import-dark.svg" alt="" width="28" height="28"></td><td><strong>Import</strong></td><td>Mũi tên xuống: nhập PSD, SVGPRO hoặc ảnh.</td></tr>
<tr><td><img class="vg-editor-icon vg-editor-icon--small" src="images/web-designer/icons/export-light.svg" alt="" width="28" height="28"><img class="vg-editor-icon vg-editor-icon--small" src="images/web-designer/icons/export-dark.svg" alt="" width="28" height="28"></td><td><strong>Export</strong></td><td>Mũi tên lên: chọn định dạng để xuất file.</td></tr>
<tr><td><img class="vg-editor-icon vg-editor-icon--small" src="images/web-designer/icons/settings-light.svg" alt="" width="28" height="28"><img class="vg-editor-icon vg-editor-icon--small" src="images/web-designer/icons/settings-dark.svg" alt="" width="28" height="28"></td><td><strong>Settings</strong></td><td>Bánh răng: mở cài đặt giao diện, snap và bình luận.</td></tr>
</tbody>
</table>

## Công cụ trên canvas

<table class="vg-icon-table">
<thead><tr><th scope="col">Sáng / Tối</th><th scope="col">Nút / Công cụ</th><th scope="col">Cách sử dụng</th></tr></thead>
<tbody>
<tr><td><img class="vg-editor-icon" src="images/web-designer/icons/cursor-light.svg" alt="" width="34" height="34"><img class="vg-editor-icon" src="images/web-designer/icons/cursor-dark.svg" alt="" width="34" height="34"></td><td><strong>Move</strong></td><td>Chọn và di chuyển layer.</td></tr>
<tr><td><img class="vg-editor-icon" src="images/web-designer/icons/hand-light.svg" alt="" width="34" height="34"><img class="vg-editor-icon" src="images/web-designer/icons/hand-dark.svg" alt="" width="34" height="34"></td><td><strong>Hand tool</strong></td><td>Kéo để di chuyển khung nhìn.</td></tr>
<tr><td><img class="vg-editor-icon" src="images/web-designer/icons/scale-light.svg" alt="" width="34" height="34"><img class="vg-editor-icon" src="images/web-designer/icons/scale-dark.svg" alt="" width="34" height="34"></td><td><strong>Scale</strong></td><td>Co giãn vùng chọn.</td></tr>
<tr><td><img class="vg-editor-icon" src="images/web-designer/icons/frame-light.svg" alt="" width="34" height="34"><img class="vg-editor-icon" src="images/web-designer/icons/frame-dark.svg" alt="" width="34" height="34"></td><td><strong>Empty / Screen root</strong></td><td>Tạo vùng chứa hoặc màn hình gốc. Mở menu bên cạnh để chọn.</td></tr>
<tr><td><img class="vg-editor-icon" src="images/web-designer/icons/rectangle-light.svg" alt="" width="34" height="34"><img class="vg-editor-icon" src="images/web-designer/icons/rectangle-dark.svg" alt="" width="34" height="34"></td><td><strong>Rectangle</strong></td><td>Vẽ hình chữ nhật.</td></tr>
<tr><td><img class="vg-editor-icon" src="images/web-designer/icons/ellipse-light.svg" alt="" width="34" height="34"><img class="vg-editor-icon" src="images/web-designer/icons/ellipse-dark.svg" alt="" width="34" height="34"></td><td><strong>Ellipse</strong></td><td>Vẽ hình tròn hoặc ellipse.</td></tr>
<tr><td><img class="vg-editor-icon" src="images/web-designer/icons/polygon-light.svg" alt="" width="34" height="34"><img class="vg-editor-icon" src="images/web-designer/icons/polygon-dark.svg" alt="" width="34" height="34"></td><td><strong>Polygon</strong></td><td>Vẽ đa giác; đổi số cạnh trong Inspector.</td></tr>
<tr><td><img class="vg-editor-icon" src="images/web-designer/icons/star-light.svg" alt="" width="34" height="34"><img class="vg-editor-icon" src="images/web-designer/icons/star-dark.svg" alt="" width="34" height="34"></td><td><strong>Star</strong></td><td>Vẽ ngôi sao; chỉnh số cánh và bán kính trong.</td></tr>
<tr><td><img class="vg-editor-icon" src="images/web-designer/icons/line-light.svg" alt="" width="34" height="34"><img class="vg-editor-icon" src="images/web-designer/icons/line-dark.svg" alt="" width="34" height="34"></td><td><strong>Line</strong></td><td>Vẽ đoạn thẳng.</td></tr>
<tr><td><img class="vg-editor-icon" src="images/web-designer/icons/arrow-light.svg" alt="" width="34" height="34"><img class="vg-editor-icon" src="images/web-designer/icons/arrow-dark.svg" alt="" width="34" height="34"></td><td><strong>Arrow</strong></td><td>Vẽ mũi tên.</td></tr>
<tr><td><img class="vg-editor-icon" src="images/web-designer/icons/text-light.svg" alt="" width="34" height="34"><img class="vg-editor-icon" src="images/web-designer/icons/text-dark.svg" alt="" width="34" height="34"></td><td><strong>Text</strong></td><td>Thêm và chỉnh nội dung chữ.</td></tr>
<tr><td><img class="vg-editor-icon" src="images/web-designer/icons/text-path-light.svg" alt="" width="34" height="34"><img class="vg-editor-icon" src="images/web-designer/icons/text-path-dark.svg" alt="" width="34" height="34"></td><td><strong>Text on path</strong></td><td>Chọn trong menu Text để tạo chữ chạy theo đường cong.</td></tr>
<tr><td><img class="vg-editor-icon" src="images/web-designer/icons/image-light.svg" alt="" width="34" height="34"><img class="vg-editor-icon" src="images/web-designer/icons/image-dark.svg" alt="" width="34" height="34"></td><td><strong>Image</strong></td><td>Thêm ảnh lên canvas.</td></tr>
<tr><td><img class="vg-editor-icon" src="images/web-designer/icons/button-light.svg" alt="" width="34" height="34"><img class="vg-editor-icon" src="images/web-designer/icons/button-dark.svg" alt="" width="34" height="34"></td><td><strong>Button</strong></td><td>Tạo layer dạng nút.</td></tr>
<tr><td><img class="vg-editor-icon" src="images/web-designer/icons/comment-light.svg" alt="" width="34" height="34"><img class="vg-editor-icon" src="images/web-designer/icons/comment-dark.svg" alt="" width="34" height="34"></td><td><strong>Comment</strong></td><td>Ghim ghi chú lên canvas.</td></tr>
<tr><td><img class="vg-editor-icon" src="images/web-designer/icons/chevron-light.svg" alt="" width="34" height="34"><img class="vg-editor-icon" src="images/web-designer/icons/chevron-dark.svg" alt="" width="34" height="34"></td><td><strong>Menu ▾</strong></td><td>Bấm mũi tên nhỏ bên cạnh Move, Empty, Shape hoặc Text để xem công cụ cùng nhóm.</td></tr>
<tr><td><img class="vg-editor-icon" src="images/web-designer/icons/selected-light.svg" alt="" width="34" height="34"><img class="vg-editor-icon" src="images/web-designer/icons/selected-dark.svg" alt="" width="34" height="34"></td><td><strong>Move — đang chọn / active</strong></td><td>Icon trắng trên nền xanh dương: công cụ đang được chọn. Ví dụ ở đây là Move.</td></tr>
</tbody>
</table>

Menu mũi tên nhỏ mở các công cụ cùng nhóm. Phím tắt có thể khác theo cấu hình Unity; xem bảng bên dưới và tooltip của nút.

## Layers và lựa chọn

<table class="vg-icon-table">
<thead><tr><th scope="col">Sáng / Tối</th><th scope="col">Nút / Công cụ</th><th scope="col">Cách sử dụng</th></tr></thead>
<tbody>
<tr><td><img class="vg-editor-icon" src="images/web-designer/icons/eye-light.svg" alt="" width="34" height="34"><img class="vg-editor-icon" src="images/web-designer/icons/eye-dark.svg" alt="" width="34" height="34"></td><td><strong>Hiện / Visible</strong></td><td>Layer đang hiển thị; bấm để ẩn.</td></tr>
<tr><td><img class="vg-editor-icon" src="images/web-designer/icons/eyeOff-light.svg" alt="" width="34" height="34"><img class="vg-editor-icon" src="images/web-designer/icons/eyeOff-dark.svg" alt="" width="34" height="34"></td><td><strong>Ẩn / Hidden</strong></td><td>Mắt gạch chéo: layer đang ẩn; bấm để hiện.</td></tr>
<tr><td><img class="vg-editor-icon" src="images/web-designer/icons/lock-light.svg" alt="" width="34" height="34"><img class="vg-editor-icon" src="images/web-designer/icons/lock-dark.svg" alt="" width="34" height="34"></td><td><strong>Khóa / Locked</strong></td><td>Layer bị khóa; bấm để mở khóa trước khi chỉnh.</td></tr>
<tr><td><img class="vg-editor-icon" src="images/web-designer/icons/unlock-light.svg" alt="" width="34" height="34"><img class="vg-editor-icon" src="images/web-designer/icons/unlock-dark.svg" alt="" width="34" height="34"></td><td><strong>Mở khóa / Unlocked</strong></td><td>Layer có thể chỉnh sửa.</td></tr>
</tbody>
</table>

- **Ctrl/Cmd-click** để thêm vào vùng chọn, **Shift-click** để chọn một dải, hoặc kéo khung trên canvas.
- Căn lề, group, duplicate, copy/paste, đổi thứ tự từ thanh công cụ hoặc menu chuột phải.
- **Move** tự bám cạnh và tâm. `Alt`+kéo để bỏ bám; `Shift`+kéo để khóa một trục.
- Giữ `Shift` khi resize để giữ tỉ lệ. **Scale** (`K`) co giãn cả cỡ chữ và viền.
- **Selection colors** đổi một màu ở mọi nơi trong vùng chọn cùng lúc.

Kéo layer để đổi thứ tự hoặc lồng vào parent; dùng mũi tên cạnh nhóm để thu gọn. Các nút mắt/khóa xuất hiện khi rê chuột, focus hoặc chọn hàng.

## Ảnh, hình và 9-slice

Thả file PNG/JPEG hoặc kéo ảnh từ **Assets**. **Reset to image size** trả về kích thước gốc.

| Image mode | Kết quả |
| --- | --- |
| **Preserve Aspect** | Vừa trong khung, giữ tỉ lệ. |
| **None** | Kéo giãn phủ kín khung. |
| **9-slice** | Giữ góc sắc nét, chỉ kéo phần giữa — hợp cho panel và nút. |

Viền 9-slice được tự nhận diện trên cả hai trục để giữ các góc khi đổi kích thước.

Các hình (Rectangle, Line, Arrow, Ellipse, Polygon, Star) vẫn sửa được. **Fill** hỗ trợ màu đơn và gradient; **Stroke** chỉnh viền. **Clip** ẩn phần con tràn ra ngoài.

## Group và bố cục

Dùng **Group**, **Horizontal**, **Vertical** hoặc **Grid** để tổ chức các phần tử. Chỉnh gap/padding và số cột trong Inspector. Bật **Clip** để ẩn nội dung con tràn khỏi khung. Screen root phân chia các màn hình độc lập trên cùng tài liệu; cách chuyển các root này vào Unity nằm trong phần Offline.

## Fusion images

Với nhóm pass-through, Fusion giữ các lớp cần blend với nền và gộp một dải artwork normal liên tục. Ảnh PSD đã gộp hiệu ứng giữ các paint frame; làm phẳng lên nền trong suốt sẽ đổi màu.

1. Chọn Image, Button hoặc Group có ảnh con hiển thị.
2. Trong Inspector → **Image**, bấm **Fusion images**.
3. Kiểm tra ảnh gộp, rồi **Save** tài liệu.

Layer chữ và nội dung ẩn được giữ lại. Hãy mở khóa object và các layer con trước khi Fusion. Undo khôi phục cấu trúc layer. PNG kết quả tối đa **5 MB**. Nơi lưu và cách cập nhật ảnh nguồn phụ thuộc bản Online/Offline.

## Chữ và hiệu ứng

**Drop Shadow** có độ rộng, độ lệch X/Y và màu riêng, vẽ bóng chữ dịch chuyển độc lập. Chưa hỗ trợ blur mềm. Text có metadata PSD được nhập thành Styled Text/VinaGenText chỉnh sửa được, giữ hiệu ứng hỗ trợ và các đoạn màu, không tạo PNG cache cho glyph. Sửa nội dung làm mất hiệu lực các khoảng màu cũ; font/cỡ chữ trộn và hiệu ứng Photoshop chưa hỗ trợ vẫn cần kiểm tra hình ảnh.

Trong **Typography**, chỉnh nội dung, font, cỡ chữ, căn lề, spacing, xuống dòng và auto size. **Text on path** uốn chữ theo đường cong. Hiệu ứng chữ có gradient, viền, outline và độ nổi; kiểm tra font và kiểu chữ đang chọn trước khi chỉnh.

Cách nhập/đăng ký font, Text type và material TMP khác giữa hai phiên bản — xem phần Online hoặc Offline.

![Typography và hiệu ứng chữ](../images/web-designer/inspector.png)

## Nhập PSD

Hiệu ứng raster hỗ trợ được bake cùng ảnh nguồn thành một Image và một PNG. Hiệu ứng phụ thuộc nền giữ các paint frame có thứ tự trong một atlas để bảo toàn blend mode mà không thêm layer tài liệu. Giới hạn ảnh gộp: **8.192 px mỗi cạnh, 16 MP, 5 MB**; tile raster quá lớn giữ pixel nguồn và báo hiệu ứng chưa bake. Bevel, glow và hiệu ứng mềm vẫn là xấp xỉ Photoshop.

Các nhánh PSD thông thường giải mã bằng tối đa ba worker tái sử dụng; nhánh cần stream raster lớn chạy riêng. Cache plan/paint có thể bị xóa. Nhập lại PSD cũ để nhận cách biểu diễn chữ/hiệu ứng mới; asset cũ được giữ vì tài liệu khác có thể còn tham chiếu.

Bấm **Import** hoặc thả PSD vào canvas. Tài liệu trống nhập trực tiếp; nếu đã có object, chọn **Replace** để thay tài liệu hoặc **Insert** để thêm PSD bên cạnh. Có thể hủy trong lúc nhập.

- Hỗ trợ **PSD RGB 8-bit**: layer, nhóm, tên, thứ tự, ẩn/hiện, opacity và blend mode phổ biến.
- Chữ được khôi phục thành layer sửa được khi có dữ liệu chữ; smart object và phần chỉ có pixel vẫn là ảnh. Một số hiệu ứng được bake hoặc xấp xỉ.
- PSD chỉ lưu tên font, không chứa file font. Thiếu font sẽ dùng fallback và cảnh báo; cách thêm font nằm trong hướng dẫn từng phiên bản.
- Chưa hỗ trợ **PSB, CMYK, 16/32-bit**. Kiểm tra mask, hiệu ứng và chữ trước khi chia sẻ.
- File lớn phụ thuộc RAM và bộ nhớ thiết bị; giới hạn xuất bên dưới không phải giới hạn kích thước PSD nguồn. Tài liệu tối đa **1.000 object**, gồm các tile ảnh lớn.

## Xuất PSD, SVGPRO, SVG và PNG

1. Chọn object muốn xuất (nếu chỉ xuất một phần).
2. Bấm **Export** (hoặc **More actions → Export**).
3. Trong **Content**, chọn **Selected object(s)** hoặc **All objects**.
4. Bấm **PSD**, **SVGPRO**, **SVG** hoặc **PNG**.

![Hộp Export với PSD, SVGPRO, SVG và PNG](../images/ui-export.png)

| Định dạng | Bạn nhận được |
| --- | --- |
| **PNG** | Một ảnh trong suốt kích thước 1×. |
| **SVG** | File xem được trên trình duyệt, nhúng sẵn ảnh và font. |
| **SVGPRO** | Toàn bộ tài liệu kèm ảnh, font và style; dùng để làm tiếp hoặc chuyển máy. |
| **PSD** | Layer, nhóm và chữ sửa được. Font không được nhúng. |

**SVGPRO luôn xuất toàn bộ tài liệu**, kể cả khi đang chọn một object.

Muốn mỗi màn hình một file: chọn từng Screen root rồi xuất lần lượt.

Giới hạn: **8.192 px mỗi cạnh, 16 megapixel**. PSD: tối đa **1.000 bản ghi layer** (gồm bản ghi phân nhóm) và **500 MB**. Không sửa tài liệu khi đang xuất.

## Comment và giao diện

Chọn **Comment** rồi bấm lên canvas để ghim ghi chú. Ghi chú lưu kèm tài liệu, dùng cho review và không trở thành object trong Unity.

**Settings** có Light/Dark/System, màu nền canvas, độ tương phản, snap và tên người bình luận. Cài đặt áp dụng vào giao diện editor; thay đổi kích thước thiết kế trong Screen inspector. Cách lưu cài đặt nằm trong từng phiên bản.

## Phím tắt chung

Phím mũi tên di chuyển selection 1 px, giữ Shift là 10 px; khi một layer được chọn trong Layers, mũi tên điều hướng cây. Phím backquote (\`) bật/tắt hiển thị selection, bỏ qua khi đang gõ chữ.

`Ctrl/Cmd` là Ctrl trên Windows và Cmd trên macOS. Đây là các phím mặc định dùng chung; Unity cho phép đổi trong UI Designer Settings.

| Phím | Thao tác |
| --- | --- |
| V / H / T / B | Move / Hand / Text / Button |
| K / C | Scale / Comment |
| Shift+1 | Fit toàn bộ |
| Space + kéo | Di chuyển khung nhìn |
| Ctrl/Cmd + cuộn | Zoom |
| Ctrl/Cmd+S | Save |
| Ctrl/Cmd+Z / Ctrl/Cmd+Shift+Z | Undo / Redo |
| Ctrl/Cmd+D / Ctrl/Cmd+G | Duplicate / Group |
| Ctrl/Cmd-click / Shift-click | Thêm vào vùng chọn / chọn một dải |
| Delete / Backspace | Xóa vùng chọn |

**R không cùng thao tác ở hai cấu hình mặc định**: Online chọn Rectangle, Unity chọn Image. Phím riêng nằm trong từng phần; tooltip và cài đặt hiện tại được ưu tiên.

## Chọn phiên bản

[Online · Web Designer](web-designer.md): mở web, chọn workspace, nhập font và lưu file cục bộ.

[Offline · Unity](ui-designer.md): mở từ Unity, lưu asset, đăng ký font và import Canvas/UI Toolkit.

| Chọn theo nhu cầu | Online | Offline |
| --- | --- | --- |
| Thiết kế UI, nhập PSD, xuất ảnh | Có | Có |
| Cần cài Unity và toolkit | Không | Có |
| Lưu tài liệu | File `.svgpro` trên máy | Asset trong dự án Unity |
| Import Canvas / UI Toolkit | — | Có |
| Tích hợp font TMP và MCP của Unity | — | Có |
