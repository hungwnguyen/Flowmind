# Bắt đầu nhanh

Import toolkit, mở workspace rồi thử một mẫu có sẵn.

## Cài đặt

1. Import file `.unitypackage` tại **Assets → Import Package → Custom Package…**.
2. Đợi Unity biên dịch xong.
3. Mở **Tools → VinaGen AI Toolkit → Open**.

Trang sản phẩm: [VinaGen AI Toolkit trên Unity Asset Store](https://assetstore.unity.com/packages/slug/375862). Bản đầu tiên hiện chưa được phát hành.

Dự án hiện dùng **Unity 6000.3.22f1**. Công cụ UI và text cần **Unity UI (uGUI)**; TMP Essentials được import từ package Unity đã cài khi cần. Các editor web chạy bằng server bên trong Unity.

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
