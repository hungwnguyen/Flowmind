# Demo và bài thực hành đầu tiên

Làm quen từng công cụ với các sample đi kèm. Đường dẫn tính từ `Assets/VinaGen AI Toolkit/`.

## UI Designer: ba màn hình chỉnh sửa được

1. Mở **Tools → VinaGen AI Toolkit → Editors → Open UI Designer**.
2. Trong **Files**, mở `Samples/Example VinaGenUIDocument/VinaGenUIDocument.svgpro`.
3. Trong **Layers**, xem màn Settings và hai popup. Bấm vào layer Text hoặc Image để xem tùy chọn.
4. Sửa thử chữ hoặc màu, rồi **Save**. (Nhân bản file trước nếu muốn giữ bản gốc.)
5. Chọn **Canvas** trong ô Unity UI system rồi bấm import. Kiểm tra Game View và lưu scene.

![Tab Files mở tài liệu UI đi kèm](../images/ui-files.png)

![Ba màn hình trong tài liệu UI Designer mẫu](../images/ui-designer.png)

Kết quả hoàn chỉnh có sẵn trong `Samples/Example VinaGenUIDocument/Scenes/UI.unity`.

![UI mẫu trong Game View cùng Hierarchy và Project](../images/ui-canvas-demo.png)

**Kiểm tra:** chữ đọc rõ, popup ở giữa, ảnh hiển thị đủ và bố cục co giãn khi đổi kích thước. Nút vẫn cần được nối với code game. Xem thêm [UI Designer](ui-designer.md).

## VinaGenText: chữ có hiệu ứng

Mở `Samples/Text Effects/ILoveYouTextShowcase.asset` trong UI Designer. Chọn một label để xem style và hiệu ứng.

![Sample hiệu ứng chữ trong UI Designer](../images/vinagen-text-demo.png)

Thử đổi nội dung hoặc gradient. Với chữ cố định, chọn label trong Unity và đặt **Rendering → Static Baked → Bake / Rebuild**. Điểm số và đồng hồ giữ Dynamic. Lưu scene sau đó.

**Kiểm tra:** mọi ký tự hiển thị, hiệu ứng đọc rõ ở kích thước game, và bake lại sau khi sửa. Xem thêm [VinaGenText](vinagen-text.md).

## Flow và Design graph

Mở **Editors → Open Flow Editor** → `Samples/Graphs/NewMockFlowGraph.asset`. Đi theo Start → Action → Decision → End. Sửa nhỏ rồi bấm **Save asset**.

![Workspace Flow graph mẫu](../images/flow-editor.png)

Mở `Samples/Graphs/NewDesignContentGraph.asset` để xem phác thảo màn hình kèm ghi chú đánh số. Nhấp đúp vào khung để đọc mô tả.

![Design graph mẫu và chú thích màn hình](../images/design-editor.png)

**Kiểm tra:** mỗi quyết định có nhánh rõ ràng, mỗi ghi chú đánh số đều được giải thích. Graph là bản kế hoạch — bạn vẫn cần viết code game. Xem thêm [Flow & Design Graph](graphs.md).

## Particle

Thử tám [demo Particle](particles.md) trên website, hoặc mở preview của dự án qua **Editors → Open Particle Preview**. Chọn hiệu ứng, bấm **Restart**, giảm **Time scale** và chọn từng **Particle target**.

![Demo particle chạy bằng player WebGL dựng sẵn](../images/particle-web-demo.png)

**Kiểm tra:** thấy rõ lúc bắt đầu, đỉnh và tắt dần; hiệu ứng nằm gọn trong camera; vệt trail đúng khi emitter di chuyển. Để AI agent tự kiểm thử như vậy, xem [Web Particle](webgl-preview.md).

## Sắp xếp tài nguyên

Giữ UI, font, style và particle sinh ra trong thư mục toolkit, cạnh sample tương ứng. PSD import nằm trong `Assets/VinaGen PSD Imports/<tên PSD>/`. Xem [Cài đặt](settings.md) để đổi mặc định.
