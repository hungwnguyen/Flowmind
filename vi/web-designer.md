# Web Designer — Online

<p><span class="vg-free-badge">Miễn phí vĩnh viễn · Free forever</span></p>

Thiết kế UI ngay trên trình duyệt. File nằm trên máy của bạn. Không cần Unity, tài khoản hay nhà cung cấp AI.

<nav class="vg-designer-nav" aria-label="Hướng dẫn UI Designer"><a href="#/vi/designer-guide">Tổng quan</a><a href="#/vi/web-designer" aria-current="page">Online · Web</a><a href="#/vi/ui-designer">Offline · Unity</a></nav>

<div class="vg-designer-launch"><div><strong>Bắt đầu thiết kế trên web</strong><p>Đọc các bước bên dưới, rồi mở editor để thực hành. Không cần cài đặt.</p></div><a href="designer/" target="_blank" rel="noopener" class="vg-designer-open">Mở Web Designer ↗</a></div>

![Editor độc lập sau khi nhập PSD](../images/web-designer/workspace.png)

Các icon, Layers, công cụ vẽ, ảnh/9-slice, Fusion, chữ, PSD và Export dùng chung: xem [Tổng quan](designer-guide.md). Trang này hướng dẫn các bước riêng của bản web.

## Nút riêng của bản Online

<table class="vg-icon-table">
<thead><tr><th scope="col">Sáng / Tối</th><th scope="col">Nút / Công cụ</th><th scope="col">Cách sử dụng</th></tr></thead>
<tbody>
<tr><td><img class="vg-editor-icon vg-editor-icon--small" src="images/web-designer/icons/folder-light.svg" alt="" width="28" height="28"><img class="vg-editor-icon vg-editor-icon--small" src="images/web-designer/icons/folder-dark.svg" alt="" width="28" height="28"></td><td><strong>Choose folder / Files</strong></td><td>Chọn thư mục làm việc hoặc mở danh sách tài liệu.</td></tr>
<tr><td><img class="vg-editor-icon vg-editor-icon--small" src="images/web-designer/icons/demo-light.svg" alt="" width="28" height="28"><img class="vg-editor-icon vg-editor-icon--small" src="images/web-designer/icons/demo-dark.svg" alt="" width="28" height="28"></td><td><strong>Demo</strong></td><td>Mở màn hình mẫu để thực hành.</td></tr>
</tbody>
</table>

Bấm **Demo** để mở mẫu thực hành. Chọn công cụ và cách chỉnh sửa theo [hướng dẫn chung](designer-guide.md).

## Chọn thư mục làm workspace

1. Mở editor. Trên Chrome hoặc Edge (máy tính), bấm <img class="vg-editor-icon vg-editor-icon--small" src="images/web-designer/icons/folder-dark.svg" alt="" width="28" height="28"> **Choose folder** và cho phép truy cập thư mục thiết kế.
2. **Files** liệt kê tài liệu `.svgpro`; **Assets** hiện ảnh của bạn.
3. Tạo màn hình, nhập PSD hoặc mở `.svgpro`. <img class="vg-editor-icon vg-editor-icon--small" src="images/web-designer/icons/save-dark.svg" alt="" width="28" height="28"> **Save** ghi file `.svgpro` vào thư mục (ví dụ `Documents/Login.svgpro`).
4. Lần sau, bấm **Reconnect folder** nếu trình duyệt hỏi lại quyền.

![Workspace thư mục sau khi lưu demo](../images/web-designer/folder.png)

**Trình duyệt không hỗ trợ chọn thư mục?** Dùng <img class="vg-editor-icon vg-editor-icon--small" src="images/web-designer/icons/import-dark.svg" alt="" width="28" height="28"> **Import** để mở file. Khi đó <img class="vg-editor-icon vg-editor-icon--small" src="images/web-designer/icons/save-dark.svg" alt="" width="28" height="28"> **Save** sẽ tải `.svgpro` xuống — bạn tự chép vào thư mục.

Cần biết:

- Editor chỉ truy cập được thư mục bạn đã chọn.
- Nếu ứng dụng khác đã sửa file, editor sẽ không ghi đè — tải lại hoặc lưu tên mới.
- Bản nháp cũng được giữ trong trình duyệt, nhưng chỉ để dự phòng. Hãy xuất file trước khi xóa dữ liệu trình duyệt hoặc đổi máy.

## Làm việc online trên nhiều máy

Đưa workspace lên đám mây bằng app đồng bộ:

1. Cài [Google Drive](https://www.google.com/drive/download/), [OneDrive](https://www.microsoft.com/microsoft-365/onedrive/download) hoặc [Dropbox](https://www.dropbox.com/install) bản desktop và đăng nhập.
2. Tạo thư mục thiết kế bên trong thư mục đồng bộ, ví dụ `Google Drive/My Drive/Designs`.
3. Trong Web Designer, <img class="vg-editor-icon vg-editor-icon--small" src="images/web-designer/icons/folder-dark.svg" alt="" width="28" height="28"> **Choose folder** và chọn thư mục đó. Mỗi lần <img class="vg-editor-icon vg-editor-icon--small" src="images/web-designer/icons/save-dark.svg" alt="" width="28" height="28"> **Save** sẽ tự tải lên.
4. Trên máy khác, cài cùng app, đợi đồng bộ xong rồi chọn lại thư mục đó.

**Lưu ý:** Đặt thư mục ở chế độ **Luôn giữ trên thiết bị** để trình duyệt đọc được. Không sửa cùng một file trên hai máy cùng lúc.

## Ảnh và font trong workspace

Trong **Assets**, bấm **Add images...** để chọn PNG/JPEG; file ảnh được quản lý trong workspace/tài liệu. Ảnh giống hệt nhau được dùng chung tự động: sửa tint, gradient hoặc mode ở một bản thì các bản dùng chung cùng đổi; vị trí và kích thước layer vẫn riêng.

Muốn dùng font riêng: **Import** TTF, OTF, WOFF hoặc WOFF2 rồi chọn trong Typography. Bản web dùng font và hiệu ứng render trong trình duyệt, không có material TMP hoặc đăng ký font Unity.

![Assets của workspace trên web](../images/web-designer/assets.png)

## Lưu và xuất bản sao

**Save** ghi `.svgpro` vào thư mục đã cấp quyền, hoặc tải file trong chế độ browser. **Export SVGPRO** tải bản sao kèm tài nguyên mà không cập nhật file workspace — hãy Save riêng khi muốn ghi lại tài liệu đang làm. Export vẫn dùng được khi hết quyền thư mục.

Nhập PSD không tạo thư mục `Assets/` của Unity; ảnh/font nằm trong workspace và gói tài liệu. Fusion và tối ưu ảnh cập nhật bản trong gói; file ảnh rời gốc không bị ghi đè.

## Cài đặt và phím riêng

Cài đặt giao diện và tên người bình luận lưu trong trình duyệt, áp dụng ngay. **R** chọn Rectangle; **I** chọn Image; **O** chọn Ellipse; **L / Shift+L** chọn Line / Arrow.

![Cài đặt bản web](../images/web-designer/settings.png)

## Chuyển sang Offline · Unity

Web Designer là ứng dụng độc lập. Các tính năng Unity (import Canvas, UI Toolkit, material TMP, MCP) chỉ có trong [Offline · Unity](ui-designer.md) bản Unity. Về hiệu ứng particle, xem [Web Particle: AI kiểm thử](webgl-preview.md).

## Hosting

`designer/` là thư mục tĩnh — host ở đâu cũng được, cùng với tài liệu này. Yêu cầu: phục vụ `.mjs` dạng JavaScript và dùng HTTPS (cần để chọn thư mục). Không cần server hay npm.

Đã kiểm thử trên Chrome/Edge máy tính. Safari và Firefox chưa xác minh — dùng <img class="vg-editor-icon vg-editor-icon--small" src="images/web-designer/icons/import-dark.svg" alt="" width="28" height="28"> **Import** và tải file khi lưu.
