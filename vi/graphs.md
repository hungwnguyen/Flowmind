# Flow & Design Graph

Dùng **Flow** để vẽ logic game, **Design** để phác thảo màn hình.

## Mở editor

Chọn **Tools → VinaGen AI Toolkit → Editors → Open Flow Editor**. Hai loại graph mở trong cùng một editor.

| Asset | Công dụng |
| --- | --- |
| `MockFlowGraph` | Các bước, điều kiện và nhánh. |
| `DesignContentGraph` | Phác thảo màn hình kèm chữ, ảnh và ghi chú đánh số. |

## Vẽ luồng game

1. Tạo Flow graph trong **Files**, hoặc mở graph mẫu.
2. Thêm node Start, Action, Decision và End.
3. Kéo giữa các cổng để nối. Đặt tên nhánh điều kiện (ví dụ **Có / Không**).
4. Bấm **Save asset**.

![Flow graph trong editor web](../images/flow-editor.png)

Flow graph là bản kế hoạch — bạn vẫn cần viết code game. Tích hợp FlowCanvas và NodeCanvas là tùy chọn.

## Phác thảo màn hình

1. Mở hoặc tạo Design graph.
2. Thêm khung, chữ và ảnh.
3. Thêm ghi chú đánh số để giải thích từng phần.
4. Bấm **Save asset**.

![Design graph với khung màn hình và chú thích](../images/design-editor.png)

Cần UI thật để import vào Unity? Dùng [UI Designer](ui-designer.md).

## Viết đặc tả màn hình

Nhấp đúp vào khung Design (hoặc bấm **Document editor → Edit document & label images** trong Inspector).

<figure>
  <img src="images/design-document-editor.png" alt="Trình soạn đặc tả Design với tab Home và Popup, nội dung có định dạng và ảnh màn hình gắn nhãn đánh số">
  <figcaption>Viết hành vi màn hình bên cạnh ảnh tham chiếu và chú thích đánh số.</figcaption>
</figure>

| Khu vực | Chức năng |
| --- | --- |
| **Document tabs** | Chuyển giữa các màn hình (ví dụ Home, Popup). |
| **Outline** | Nhảy tới một heading. |
| **Tài liệu và thanh công cụ** | Viết và định dạng đặc tả. |
| **Images & labels** | Bấm lên ảnh để thêm nhãn số; kéo để di chuyển. |
| **Export image PNG with labels** | Tải ảnh kèm nhãn. |

Ví dụ: nhãn **1** đánh dấu thẻ sự kiện; mục **1** trong tài liệu giải thích cách mở khóa và điều gì xảy ra khi bấm. Đóng editor rồi bấm **Save asset**.

## Xuất tài liệu

**Markdown** cho đặc tả, **JSON** cho dữ liệu, **SVG / PNG** cho hình ảnh.

## Dùng trợ lý AI

Khi [MCP Bridge](mcp-bridge.md) đang chạy, chỉ cần hỏi trong chat của dự án:

- `/vina tạo flow đăng nhập có nhánh thành công và thất bại`
- `/vina phác thảo màn hình shop gồm danh sách vật phẩm và popup mua`

Trợ lý có thể đọc, tạo, sửa graph và viết mô tả cho khung màn hình. Một số thao tác (tạo từ prompt, rà soát khung) chạy qua [AI Chat](ai-chat.md) nên cần nhà cung cấp AI; đọc và sửa đơn giản thì không cần.

<details>
<summary>Các MCP tool cho graph</summary>

- Flow: `GET /graph?graphType=mock_flow_graph&graphPath=<asset>`, `import_mock_flow_graph`, `create_block_diagram`, `fix_block_diagram`
- Design: `GET /graph?graphType=design_content_graph&whiteFramePath=<asset>`, `patch_design_content_graph`, `create_white_frame`, `update_white_frame`, `check_white_frame`
- Ngữ cảnh: `get_web_editor_context`, `get_node_context`, `get_document_metadata`

</details>

[Tiếp theo: Web Flow Editor](web-editor.md)
