# Web Flow Editor

> Unity chạy sẵn một editor HTML/CSS/JavaScript **offline** cho Flow graph và Design graph. Không cần Node server, cài package, CDN, đăng nhập cloud hay bước build.

## Mở editor

- Chọn một asset graph rồi bấm **Inspector → Quick Actions → Open Web Editor**, hoặc
- Mở **Tools → VinaGen AI Toolkit → Editors → Open Flow Editor**.

URL mặc định: `http://127.0.0.1:8888/graph-editor/`. Editor dùng chung listener với MCP bridge nên **Unity phải luôn mở**. Khi biên dịch, server tạm gián đoạn; nếu một yêu cầu bị ngắt, bản nháp vẫn được giữ, hãy tải lại trang để khôi phục khi Unity sẵn sàng.

## Không gian làm việc

![Flow Editor: Layers bên trái, canvas ở giữa, inspector Document bên phải](../images/flow-editor.png)

- **Một không gian cho cả hai loại graph.** Mở graph từ panel **Files**; tài liệu Flow và Design hiện thành các tab. Đóng tab chỉ đóng phần hiển thị, không xóa asset Unity.
- **Files / Layers / Assets** bên trái, **inspector** bên phải, thanh công cụ vẽ nổi dưới canvas và nút zoom ở góc trên bên phải.
- **Canvas SVG vô hạn**: zoom quanh con trỏ, kéo khung nhìn, chọn vùng và chọn nhiều, kéo/đổi kích thước, bám lưới và đường căn.
- **Tìm kiếm** tên node, ID, tag và nội dung. **Ctrl/Cmd+K** mở Quick actions cho file, lệnh và node.
- **Minimap** để di chuyển trong graph lớn.
- **Auto layout** (Ngang/Dọc) dùng chính bản C# gốc nên đường nối trên trình duyệt và Unity giống nhau.

### Kết nối

Kéo từ một cổng tới node khác, hoặc thả trên vùng trống để tạo node đã nối sẵn. Kéo gần một đầu của đường nối để dời đầu đó. Kết nối hỗ trợ nhãn, vị trí nhãn, tối đa hai điểm gãy, nhảy tới nguồn/đích và lệnh **Reset automatic route**.

### Bình luận

Công cụ **Comment** ghim luồng thảo luận lên canvas (Flow, Design và UI Designer). Tên tác giả lấy từ **Settings → Graph Appearance → Web comments → Comment Display Name**. Kéo ghim để dời; Undo/Redo và Save đều ghi nhận thao tác này.

## Lưu và đồng bộ

- Mỗi chỉnh sửa cập nhật asset Unity trong bộ nhớ và đánh dấu dirty. **Save asset** chỉ ghi đúng graph đó, không bao giờ lưu scene hay asset khác.
- **Reload graph from Unity** nạp thay đổi từ bên ngoài (ví dụ sau khi AI agent sửa file) và làm mới hiển thị.
- Undo/Redo trên trình duyệt giữ **100 thao tác mỗi tài liệu**; Undo gốc của Unity cũng ghi nhận chỉnh sửa từ web.
- Nếu lưu bị xung đột với asset mới hơn (HTTP `409`), bản nháp vẫn được giữ; hãy xuất ra hoặc tải lại thay vì ghi đè.

## Giao diện và tùy chọn

Bấm **biểu tượng bánh răng** để chọn theme **Light / Dark / System**, nền lưới sáng, tăng tương phản, bám lưới và minimap. Tùy chọn lưu trong localStorage của trình duyệt theo origin, không nằm trong dự án Unity.

## Phím tắt

| Phím tắt | Tác dụng |
| --- | --- |
| `Ctrl/Cmd + S` | Lưu |
| `Ctrl/Cmd + Z` | Hoàn tác |
| `Shift + 1` / `Shift + 2` | Vừa khung tất cả / vừa khung vùng chọn |
| `Space + kéo` | Kéo khung nhìn |
| `Ctrl/Cmd + lăn chuột` | Zoom |
| `Alt` (khi kéo) | Tạm tắt bám lưới |
| `Ctrl/Cmd + K` | Quick actions |
| `Ctrl/Cmd + F` | Tìm layer |
| `F2` | Đổi tên node đang chọn |
| `V` / `H` / `K` | Di chuyển / Bàn tay / Co giãn |
| `R` / `L` / `Shift+L` / `O` | Hình chữ nhật / Đường thẳng / Mũi tên / Ellipse |
| `T` | Chữ |
| `↑` / `↓` trong Layers | Đối tượng trước / sau |

Trong Layers, **Ctrl/Cmd-click** để bật/tắt chọn từng mục và **Shift-click** để chọn một dải. Mọi ô số hỗ trợ kéo kiểu Unity: kéo nhãn sang trái/phải (**Shift** = tinh, **Alt** = nhanh).

## Giới hạn

Editor chỉ nhận kết nối loopback, kiểm tra yêu cầu cùng origin và giới hạn body yêu cầu ở 8 MB. Mỗi graph tối đa 1.000 node, 100 kết nối ra mỗi flow node, 64 ảnh mỗi design node và 1.000 chú thích mỗi design node.

> Bố cục là code gốc lấy cảm hứng từ panel và thanh công cụ của Figma. Nó chỉnh sửa hai mô hình graph của Unity, không phải bản sao Figma (không có cộng tác thời gian thực, tài liệu vector, component hay prototype).

---
[Tiếp theo: UI Designer](ui-designer.md)
