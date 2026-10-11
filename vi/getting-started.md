# Bắt đầu nhanh

Import toolkit, mở workspace rồi thử một mẫu có sẵn.

## Cài đặt

1. Import file `.unitypackage` tại **Assets → Import Package → Custom Package…**.
2. Đợi Unity biên dịch xong.
3. Mở **Tools → VinaGen AI Toolkit → Open**.

Dự án hiện dùng **Unity 6000.3.22f1**. Công cụ UI và text cần **Unity UI (uGUI)**; TMP Essentials được import từ package Unity đã cài khi cần. Các editor web chạy bằng server bên trong Unity.

<div class="vg-pair">
  <figure><img src="images/toolkit-home.png" alt="Tab Home của toolkit"><figcaption>Home: mở workspace.</figcaption></figure>
  <figure><img src="images/toolkit-settings.png" alt="Tab Settings của toolkit"><figcaption>Settings: chỉnh mặc định của dự án.</figcaption></figure>
</div>

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

Chat AI và tạo ảnh qua nhà cung cấp cần tài khoản, thông tin đăng nhập riêng. Cấu hình tại **Settings → AI Settings** khi cần.

[Tiếp theo: Flow & Design Graph](graphs.md)
