# Flow & Design Graph

> Hai loại asset graph mô tả game **làm gì** (flow) và mỗi màn hình **hiển thị gì** (design). Cả hai mở được trong editor gốc của Unity và trong không gian làm việc trên trình duyệt.

## Flow graph (logic)

Asset **MockFlowGraph** mô hình hóa luồng gameplay, chuyển trạng thái và tiến trình: node là các bước, kết nối là các chuyển tiếp.

**Loại node:** `Start`, `Action`, `Decision`, `End`, `Note` và `Image`.

![Graph mẫu NewMockFlowGraph trong Flow Editor trên trình duyệt](../images/flow-editor.png)

### Tạo và chỉnh sửa

1. Mở **Tools → VinaGen AI Toolkit → OpenGraphEditor** (gốc) hoặc **Editors → Open Flow Editor** (trình duyệt).
2. Tạo hoặc chọn một asset MockFlowGraph.
3. Thêm node, nối chúng và đặt nhãn rõ ràng cho mọi nhánh (ví dụ *Yes* / *No*).
4. Dùng chỉnh sửa theo node đang chọn cho các thay đổi nhỏ. Giữ ID node ổn định để các bản vá và chỉnh sửa của AI về sau luôn chính xác.

Graph chạy **không cần FlowCanvas hay NodeCanvas**. Nếu dự án đã cài các sản phẩm này, adapter phản chiếu tùy chọn sẽ tự bật; toolkit không phân phối lại hay tự cài chúng.

### Hỏi và tạo

Trong chat của graph editor gốc, **Ask** đưa ra gợi ý và đoạn code có thể sao chép. Việc sinh graph thuộc về action tạo graph. Hãy xem lại node, nhánh, chú thích và kết nối được sinh ra trước khi áp vào logic game.

Hãy đính kèm file và ảnh liên quan một cách rõ ràng. Ngữ cảnh chat có thể gồm nội dung graph đang chọn, tệp đính kèm và trích đoạn dự án do quy trình ghép lại; hãy xem lại yêu cầu khi làm việc với nội dung bảo mật.

## Design content graph (wireframe)

Asset **DesignContentGraph** mô tả màn hình: cấu trúc layout, kích thước và style frame, nhãn, nội dung chữ, ô ảnh và chú thích đánh số.

- Mở **Tools → VinaGen AI Toolkit → Open Design Content Editor**, hoặc mở asset trong Flow Editor trên trình duyệt.
- Frame có rich text (đậm, nghiêng, màu, cỡ chữ, danh sách gạch đầu dòng/checklist/đánh số), ô ảnh sắp xếp lại được và chú thích đánh số kéo thả được.
- Nội dung chữ mặc định là **tiếng Anh** ngắn gọn, trừ khi yêu cầu đã có sẵn chữ hoặc yêu cầu bản địa hóa rõ ràng.
- Kích thước frame, màu, font và kiểu chú thích được cấu hình trong **Settings → Design Content Settings**.

![Mẫu NewDesignContentGraph: màn hình Home và popup Kitty Puzzle Party có chú thích đánh số](../images/design-editor.png)

## Canvas Design Capture Studio

Khi đã cài Unity UI, mở **Tools → VinaGen AI Toolkit → Design Capture Studio → Inspector** và chọn hierarchy Canvas/UI cần làm việc. Kiểm tra, chụp hoặc tạo thiết kế theo yêu cầu.

- Font TMP hiện có được giữ lại nếu có.
- UI mới dùng **Text** gốc của Unity UI khi chưa cấu hình TMP Essentials/font.
- Noto Sans đi kèm là font bitmap động. Muốn chữ SDF, hãy tạo font TMP bằng Font Asset Creator của TMP và đặt làm font dự án.

## Xuất

Từ không gian làm việc trên trình duyệt, bạn có thể xuất:

| Định dạng | Ghi chú |
| --- | --- |
| **Markdown** | Dùng chung bộ xuất Flow/Design gốc, kể cả chi tiết chú thích. |
| **JSON** | Giữ nguyên cả hai schema gốc và tham chiếu ảnh ổn định theo GUID + local file ID. |
| **SVG / PNG** | Xuất vùng canvas đang hiển thị kèm ảnh nhúng. |

---
[Tiếp theo: Web Flow Editor](web-editor.md)
