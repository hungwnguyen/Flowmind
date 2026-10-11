# Web Flow Editor

Chỉnh Flow và Design graph trên trình duyệt bằng server cục bộ của Unity.

## Mở editor

Chọn **Tools → VinaGen AI Toolkit → Editors → Open Flow Editor**, hoặc chọn graph rồi bấm **Open Web Editor** trong Inspector.

Địa chỉ mặc định: `http://127.0.0.1:8888/graph-editor/`. Giữ Unity mở trong lúc chỉnh sửa.

![Workspace Flow Editor](../images/flow-editor.png)

## Các phần chính

- **Files:** tạo và mở graph.
- **Layers:** chọn, đổi tên và sắp xếp node.
- **Assets:** thêm ảnh từ dự án Unity.
- **Inspector:** chỉnh node hoặc đường nối đang chọn.
- **Auto layout:** sắp xếp flow theo chiều ngang hoặc dọc.

Kéo từ cổng node để tạo đường nối. Dùng công cụ Comment để ghim ghi chú.

Với Design graph, **Document editor** dùng để viết đặc tả và gắn nhãn lên ảnh. Xem [ảnh minh họa và chức năng](graphs.md?id=viết-đặc-tả-màn-hình).

## Lưu và khôi phục

**Save asset** lưu graph đang mở. **Reload graph from Unity** nạp thay đổi từ bên ngoài. Bản nháp được giữ lại nếu Unity biên dịch làm gián đoạn yêu cầu.

Khi gặp xung đột `409`, hãy xuất bản nháp hoặc nạp graph mới nhất trước khi sửa tiếp.

## Phím tắt thường dùng

| Phím tắt | Thao tác |
| --- | --- |
| `Ctrl/Cmd + S` | Lưu |
| `Ctrl/Cmd + Z` | Hoàn tác |
| `Shift + 1 / 2` | Vừa toàn bộ / vùng chọn |
| `Space + kéo` | Di chuyển khung nhìn |
| `Ctrl/Cmd + cuộn` | Zoom |
| `Ctrl/Cmd + K` | Mở lệnh nhanh |
| `Ctrl/Cmd-click / Shift-click` | Chọn từng mục / chọn một dải |

Menu bánh răng cho phép chỉnh theme, lưới, snapping và minimap.

[Tiếp theo: UI Designer](ui-designer.md)
