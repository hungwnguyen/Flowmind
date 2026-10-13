# Demo và bài thực hành đầu tiên

Dùng sample đi kèm để làm quen từng workspace. Đường dẫn dưới đây tính từ `Assets/VinaGen AI Toolkit/`. Ảnh chụp toolkit thật trên máy này, **Unity 6000.3.22f1**, ngày **13/10/2026**.

## UI Designer: ba màn hình chỉnh sửa được

1. Mở **Tools → VinaGen AI Toolkit → Editors → Open UI Designer**.
2. Trong **Files**, mở `Samples/Example VinaGenUIDocument/VinaGenUIDocument.svgpro` (bản làm việc `.asset` cũng mở được).
3. Chuyển sang **Layers**. Xem màn Settings và hai popup. Chọn Text để thấy Typography; chọn Image để thấy artwork/layout.
4. Thử sửa một đoạn chữ hoặc màu rồi **Save**. Nhân bản tài liệu trước nếu muốn giữ sample gốc.
5. Chọn **Canvas** trong ô Unity UI system rồi dùng nút import. Kiểm tra Game View và tự lưu scene. Mỗi Screen root được đặt giữa độc lập.

![Tab Files mở tài liệu UI đi kèm](../images/ui-files.png)

![Ba màn hình trong tài liệu UI Designer mẫu](../images/ui-designer.png)

Scene `Samples/Example VinaGenUIDocument/Scenes/UI.unity` có kết quả Canvas gốc. Lưu scene hiện tại trước khi mở. Game View trong ảnh bên dưới hiển thị popup điểm; màn nào xuất hiện phụ thuộc Screen root đang active.

![UI mẫu trong Game View cùng Hierarchy và Project](../images/ui-canvas-demo.png)

**Kiểm tra:** chữ đọc rõ, popup ở giữa, anchor đáp ứng khi đổi kích thước, ảnh không thiếu và Button đã nối hành vi game. Import tạo object UI; không suy ra gameplay từ tên nút. Xem [UI Designer](ui-designer.md) về component, giới hạn import và export.

## VinaGenText: so sánh các kiểu chữ có hiệu ứng

Mở `Samples/Text Effects/ILoveYouTextShowcase.asset` trong UI Designer. Chọn label, xem **Typography → Text type → VinaGenText** và các điều khiển style/hiệu ứng.

![Sample hiệu ứng chữ trong UI Designer](../images/vinagen-text-demo.png)

Thử đổi caption hoặc gradient rồi so sánh trình duyệt với Canvas. Với label cố định, chọn component VinaGenText đã import trong Unity, đặt **Rendering → Static Baked**, bấm **Bake / Rebuild**. Điểm/timer nên dùng Dynamic. Lưu scene hoặc prefab sau bake; [Text Settings](settings.md#cài-đặt-text) chỉnh nơi lưu và shared atlas.

**Kiểm tra:** font có đủ ký tự, stroke/gradient vẫn đọc rõ ở kích thước game và bake cũ được dựng lại sau sửa. Xem [VinaGenText](vinagen-text.md) để chọn chế độ và đọc điều kiện benchmark.

## Flow và Design: đọc kế hoạch mẫu

Mở **Editors → Open Flow Editor**, chọn `Samples/Graphs/NewMockFlowGraph.asset`. Theo Start → Action → Decision → End, kiểm tra nhãn nhánh và dùng **Save asset** sau một chỉnh sửa nhỏ.

![Workspace Flow graph mẫu](../images/flow-editor.png)

Mở `Samples/Graphs/NewDesignContentGraph.asset` để xem khung màn hình và dấu đánh số. Nhấp đúp khung để đọc tài liệu cạnh ảnh tham chiếu.

![Design graph mẫu và chú thích màn hình](../images/design-editor.png)

**Kiểm tra:** nhánh quyết định rõ ràng, mô tả giải thích đúng điều khiển đã đánh dấu. Graph là kế hoạch chỉnh sửa được; bạn nối hành vi vào code game. Xem [Flow & Design Graph](graphs.md).

## Particle: playback, layer và AI review

Dùng tám [demo Particle](particles.md) nhúng trên website, hoặc mở preview cục bộ của dự án tại **Editors → Open Particle Preview**. Chọn hiệu ứng, **Restart**, giảm **Time scale**, xem từng **Particle target**.

![Demo particle chạy bằng player WebGL dựng sẵn](../images/particle-web-demo.png)

**Kiểm tra:** nhìn thấy lúc bắt đầu, đỉnh và tắt dần; hiệu ứng nằm trong camera; chuyển động/trail đúng khi nguồn di chuyển. Mục đích chính của Web Particle là giúp **AI Agent kiểm thử hiệu ứng agent tạo ra**, xem ảnh theo thời điểm, sửa asset Unity rồi thử lại. [Hướng dẫn Web Particle](webgl-preview.md) có toàn bộ vòng lặp và ảnh so sánh thật.

## Sắp xếp tài nguyên thực hành

Lưu UI, font, material, style và particle do toolkit tạo trong root toolkit, giữ tài nguyên cùng sample. PSD riêng giữ `Assets/VinaGen PSD Imports/<tên PSD>/`. Giá trị Settings trong ảnh thuộc máy này, không phải preset chung. Xem [Cài đặt](settings.md) trước khi đổi mặc định.
