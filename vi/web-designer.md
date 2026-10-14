# Web Designer — thiết kế trực tiếp trên web

<p><span class="vg-free-badge">Miễn phí vĩnh viễn · Free forever</span></p>

Thiết kế UI ngay trên trình duyệt. File nằm trên máy của bạn. Không cần Unity, tài khoản hay nhà cung cấp AI.

<p><a href="designer/" target="_blank" rel="noopener" class="vg-btn">Mở Web Designer ↗</a></p>

![Editor độc lập sau khi nhập PSD](../images/web-designer/workspace.png)

## Chọn thư mục làm workspace

1. Mở editor. Trên Chrome hoặc Edge (máy tính), bấm **Choose folder** và cho phép truy cập thư mục thiết kế.
2. **Files** liệt kê tài liệu `.svgpro`; **Assets** hiện ảnh của bạn.
3. Tạo màn hình, nhập PSD hoặc mở `.svgpro`. **Save** ghi file `.svgpro` vào thư mục (ví dụ `Documents/Login.svgpro`).
4. Lần sau, bấm **Reconnect folder** nếu trình duyệt hỏi lại quyền.

![Workspace thư mục sau khi lưu demo](../images/web-designer/folder.png)

**Trình duyệt không hỗ trợ chọn thư mục?** Dùng **Import** để mở file. Khi đó **Save** sẽ tải `.svgpro` xuống — bạn tự chép vào thư mục.

Cần biết:

- Editor chỉ truy cập được thư mục bạn đã chọn.
- Nếu ứng dụng khác đã sửa file, editor sẽ không ghi đè — tải lại hoặc lưu tên mới.
- Bản nháp cũng được giữ trong trình duyệt, nhưng chỉ để dự phòng. Hãy xuất file trước khi xóa dữ liệu trình duyệt hoặc đổi máy.

## Làm việc online trên nhiều máy

Đưa workspace lên đám mây bằng app đồng bộ:

1. Cài [Google Drive](https://www.google.com/drive/download/), [OneDrive](https://www.microsoft.com/microsoft-365/onedrive/download) hoặc [Dropbox](https://www.dropbox.com/install) bản desktop và đăng nhập.
2. Tạo thư mục thiết kế bên trong thư mục đồng bộ, ví dụ `Google Drive/My Drive/Designs`.
3. Trong Web Designer, **Choose folder** và chọn thư mục đó. Mỗi lần **Save** sẽ tự tải lên.
4. Trên máy khác, cài cùng app, đợi đồng bộ xong rồi chọn lại thư mục đó.

**Lưu ý:** Đặt thư mục ở chế độ **Luôn giữ trên thiết bị** để trình duyệt đọc được. Không sửa cùng một file trên hai máy cùng lúc.

## Các chức năng thiết kế

Bấm **Demo** để mở màn hình mẫu. Thử đổi font tiêu đề hoặc màu, rồi xuất PNG/PSD.

| Khu vực | Chức năng |
| --- | --- |
| Files / Layers / Assets | Mở tài liệu; đổi thứ tự, lồng, đổi tên, khóa, ẩn layer; duyệt ảnh |
| Canvas | Di chuyển, zoom, resize, xoay, căn chỉnh, snap, Undo/Redo |
| Shape | Chữ nhật, ellipse, polygon, star, line, arrow; màu đơn và gradient |
| Text | Font, cỡ chữ, căn lề, chữ cong, hiệu ứng gradient/viền/độ nổi |
| Layout | Group, bố cục ngang/dọc/grid, clip |
| Image | PNG/JPEG, 9-slice, Fusion |
| Comment | Ghi chú ghim, lưu kèm tài liệu |

Muốn dùng font riêng: **Import** file TTF, OTF, WOFF hoặc WOFF2 rồi chọn trong Typography.

![Typography và các hiệu ứng chữ chỉnh sửa được](../images/web-designer/inspector.png)

Phím tắt: **V** Move, **H** Hand, **T** Text, **R** Rectangle, **O** Ellipse, **K** Scale, **Shift+1** Fit, **Ctrl/Cmd+S** Save, **Ctrl/Cmd+Z** Undo, **Ctrl/Cmd+Shift+Z** Redo, **Ctrl/Cmd+D** Duplicate. Chuột phải lên layer để xem thêm lệnh. Nên dùng màn hình lớn.

## Ảnh

1. Trong **Assets**, bấm **Add images...** và chọn file PNG/JPEG (chọn nhiều file cùng lúc được).
2. Bấm hoặc kéo thumbnail vào canvas. Muốn đổi ảnh, dùng **Replace image from files** trong Inspector.
3. Ảnh giống hệt nhau được dùng chung tự động: sửa một ảnh (tint, gradient, mode) thì mọi bản sao cùng đổi. Vị trí và kích thước vẫn riêng.

![Assets và component ảnh dùng chung trong Inspector](../images/web-designer/assets.png)

## Nhập và xuất PSD

**Import → chọn PSD → Replace hoặc Insert.** *Replace* thay tài liệu hiện tại; *Insert* thêm PSD bên cạnh. Có thể hủy bất cứ lúc nào.

- Hỗ trợ: PSD RGB 8-bit. File lớn vẫn mở được (đã thử PSD 575 MB), tùy RAM của máy.
- Chưa hỗ trợ: PSB, CMYK, 16/32-bit.
- Giữ layer, nhóm, ẩn/hiện, opacity và blend mode phổ biến. Smart object và hiệu ứng phức tạp thành ảnh.
- PSD không chứa font — hãy tự nhập font phù hợp. Thiếu font sẽ có cảnh báo.
- Kiểm tra trước khi chia sẻ: chữ và hiệu ứng có thể hơi khác Photoshop.

![Các lựa chọn xuất file](../images/web-designer/export.png)

| Định dạng | Dùng để |
| --- | --- |
| SVGPRO | Tài liệu chỉnh sửa được, kèm ảnh và font. Dùng để làm tiếp hoặc chuyển máy. |
| PSD | Layer Photoshop, chữ sửa được. |
| PNG | Một ảnh phẳng nền trong suốt. |
| SVG | Ảnh xem được trên trình duyệt. Chữ không chuyển thành outline. |

**Export SVGPRO** dùng được kể cả khi hết quyền truy cập thư mục, nên không mất thay đổi chưa lưu.

## Settings

![Theme, snap và tên người bình luận](../images/web-designer/settings.png)

**Settings** chỉnh giao diện (Light/Dark/System), màu nền canvas, độ tương phản, snap lưới và tên khi bình luận. Thay đổi áp dụng ngay và lưu trong trình duyệt. Kích thước canvas chỉnh trong Screen inspector.

## Web Designer và toolkit Unity

Web Designer là ứng dụng độc lập. Các tính năng Unity (import Canvas, UI Toolkit, material TMP, MCP) chỉ có trong [UI Designer](ui-designer.md) bản Unity. Về hiệu ứng particle, xem [Web Particle: AI kiểm thử](webgl-preview.md).

## Hosting

`designer/` là thư mục tĩnh — host ở đâu cũng được, cùng với tài liệu này. Yêu cầu: phục vụ `.mjs` dạng JavaScript và dùng HTTPS (cần để chọn thư mục). Không cần server hay npm.

Đã kiểm thử trên Chrome/Edge máy tính. Safari và Firefox chưa xác minh — dùng **Import** và tải file khi lưu.
