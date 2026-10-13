# Bắt đầu nhanh

Import toolkit, mở workspace rồi thử một mẫu có sẵn.

## Cài đặt

1. Import file `.unitypackage` tại **Assets → Import Package → Custom Package…**.
2. Đợi Unity biên dịch xong.
3. Mở **Tools → VinaGen AI Toolkit → Open**.

Trang sản phẩm: [VinaGen AI Toolkit trên Unity Asset Store](https://assetstore.unity.com/packages/slug/375862). Bản đầu tiên hiện chưa được phát hành.

Dùng **Unity 2022.3 LTS trở lên** trên **Windows, macOS hoặc Linux**, đáp ứng [yêu cầu hệ thống của phiên bản Unity đã chọn](https://docs.unity3d.com/2022.3/Documentation/Manual/system-requirements.html). Công cụ UI và text cần **Unity UI (uGUI)** và **TextMesh Pro** chính thức (package riêng trong Unity 2022); import **TMP Essentials** khi được nhắc. Các editor cục bộ chạy bên trong Unity. Preview particle dùng player dựng sẵn và hiệu ứng portable `.vgfx.json`.

Phiên bản thấp nhất đã kiểm thử là **2022.3.62f2** trên Windows; xem phạm vi xác minh bên dưới. Web Designer **Miễn phí vĩnh viễn · Free forever**, dùng trực tiếp trên trình duyệt mà không cần cài Unity.

## Phạm vi kiểm thử tương thích

Ngày **13/10/2026**, hai dự án riêng trên Windows dùng **Unity 2022.3.62f2** (uGUI 1.0.0 + TMP 3.0.9 chính thức) và **6000.3.22f1** (uGUI 2.0.0 chính thức, có TMP) đã compile cả sáu assembly toolkit, không có lỗi C#. Cả hai qua kiểm tra import text Canvas giữ chế độ không xuống dòng, Undo/Redo, tạo mesh text đậm giữ dữ liệu SDF/bold trong UV, và xuất/đọc lại particle JSON portable. Chỉ import thư mục toolkit và dependency Unity chính thức, không cài developer tools hay plugin bên thứ ba.

Package Manager trên máy này lỗi trước khi import toolkit. Vì vậy lần kiểm tra dùng host offline (`-noUpm`), source package chính thức và TMP Essentials, với define nhận diện package do host cung cấp. Chưa xác minh quy trình cài UPM thông thường, chạy trên macOS/Linux, các bản vá Unity khác hoặc build game hoàn chỉnh.

<div class="vg-pair">
  <figure><img src="images/toolkit-home.png" alt="Tab Home của toolkit"><figcaption>Home: mở workspace.</figcaption></figure>
  <figure><img src="images/toolkit-settings.png" alt="Tab Settings của toolkit"><figcaption>Settings: chỉnh mặc định của dự án.</figcaption></figure>
</div>

## Cập nhật

[Xem cập nhật trên Unity Asset Store](https://assetstore.unity.com/packages/slug/375862)

Toolkit đọc [thông tin phiên bản](https://vinagen.onrender.com/updateAvailable.json) ở chế độ nền khi Unity sẵn sàng, tối đa một lần mỗi sáu giờ. Mỗi phiên bản mới đã phát hành chỉ được thông báo một lần cho mỗi tài khoản hệ điều hành, kể cả khi mở lại Unity hoặc chuyển project. Khi mất mạng, kiểm tra tự động không hiện lỗi; các công cụ chỉnh sửa vẫn hoạt động.

Trong Unity, **Open Package Manager** chọn asset này để bạn tải/import bản cập nhật. **View on Asset Store** mở trang sản phẩm trên trình duyệt. Các nút chỉ mở nơi cập nhật, không tự cài đặt. Bạn cũng có thể vào **Tools → VinaGen AI Toolkit → Help → Check for Updates** hoặc **Update in Package Manager**.

## Năm tab của toolkit

| Tab | Dùng để |
| --- | --- |
| **Home** | Mở Agent Chat, Flow Editor hoặc UI Designer. |
| **Create** | Chọn workspace cho nội dung mới. |
| **Particles** | Mở thư viện, quản lý player WebGL dùng chung và sửa material. |
| **MCP Bridge** | Bật bridge, kiểm tra URL và đăng ký chat skill. |
| **Settings** | Mở asset cài đặt trong Inspector. |

<details>
<summary>Create — Chọn workspace cho nội dung mới.</summary>
<p><img src="images/toolkit-create.png" alt="VinaGen AI Toolkit: Create"></p>
</details>

<details>
<summary>Particles — Mở thư viện, quản lý player WebGL dùng chung và sửa material.</summary>
<p><img src="images/toolkit-particles.png" alt="VinaGen AI Toolkit: Particles"></p>
</details>

<details>
<summary>MCP Bridge — Bật bridge, kiểm tra URL và đăng ký chat skill.</summary>
<p><img src="images/toolkit-bridge.png" alt="VinaGen AI Toolkit: MCP Bridge"></p>
</details>

Xem [Cài đặt](settings.md) để hiểu từng trường và [Demo & thực hành](demos.md) để làm theo sample.

## Chọn việc đầu tiên

| Bạn muốn | Bắt đầu tại |
| --- | --- |
| Vẽ luồng game | **Editors → Open Flow Editor** → mở `Samples/Graphs/NewMockFlowGraph.asset`. |
| Phác thảo màn hình | Trong Flow Editor, mở `Samples/Graphs/NewDesignContentGraph.asset`. |
| Dựng UI game | **Editors → Open UI Designer** → mở mẫu trong `Samples/Example VinaGenUIDocument/`. |
| Khám phá hiệu ứng | **Open → Particles** → mở thư viện texture hoặc particle. |
| Tạo bằng trợ lý AI | **Open → MCP Bridge → Start**, rồi dùng `/vina` hoặc `$vina` trong chat của dự án. |

Đường dẫn trong bảng tính từ `Assets/VinaGen AI Toolkit/`. Các menu editor bắt đầu tại **Tools → VinaGen AI Toolkit**.

## Lưu kết quả

Graph dùng **Save asset**, tài liệu UI dùng **Save**. Import Canvas tạo object trong scene; bạn cần tự lưu scene.

Chat AI và tạo ảnh qua nhà cung cấp cần tài khoản, thông tin đăng nhập riêng. Cấu hình tại **Open → Settings → AI Provider Settings** khi cần.

[Tiếp theo: Flow & Design Graph](graphs.md)
