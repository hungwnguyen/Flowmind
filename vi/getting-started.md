# Bắt đầu nhanh

> Import toolkit, mở không gian làm việc và tạo graph, màn hình UI hay hiệu ứng đầu tiên chỉ trong vài phút.

## Bước 1: Cài đặt

1. Mở dự án bằng **Unity 6000.3.22f1** (phiên bản đã kiểm chứng).
2. Cài package **Unity UI (uGUI)** chính thức nếu bạn định dùng UI Designer, công cụ Canvas hoặc tính năng chữ. Trên Unity 6, TextMesh Pro đã nằm trong uGUI.
3. Import file `.unitypackage` của `VinaGen AI Toolkit` (**Assets → Import Package → Custom Package…**).
4. Chờ Unity import và biên dịch xong.

Mọi thứ nằm trong một thư mục: `Assets/VinaGen AI Toolkit/`. Bạn không cần thư mục dự án nào khác, cũng không cần Python, Node.js, npm, CDN hay đăng nhập cloud.

> **Không có uGUI** thì graph, texture, particle và bridge vẫn chạy; chỉ phần tích hợp Canvas/UI bị tắt.

Khi UI Designer cần **TMP Essential Resources**, nó import từ package chính thức đã cài và chờ import xong. Cài đặt TMP hiện có được giữ nguyên.

## Bước 2: Mở không gian làm việc

Mở **Tools → VinaGen AI Toolkit → Open**. Cửa sổ toolkit có năm tab:

<div class="vg-pair">
  <figure><img src="images/toolkit-home.png" alt="Cửa sổ toolkit, tab Home"><figcaption>Home: chọn không gian làm việc.</figcaption></figure>
  <figure><img src="images/toolkit-settings.png" alt="Cửa sổ toolkit, tab Settings"><figcaption>Settings: mọi thiết lập dự án ở một chỗ.</figcaption></figure>
</div>

| Tab | Bạn làm gì ở đó |
| --- | --- |
| **Home** | Chọn Agent Chat, Flow Editor hoặc UI Designer, cùng lối tắt tới bridge, công cụ particle và cài đặt. |
| **Create** | Bắt đầu nội dung mới trong Agent Chat, Flow Editor hoặc UI Designer. |
| **Particles** | Duyệt Particle Texture Library và Bundled Particle Library, hoặc sửa material cho render pipeline đang dùng. |
| **MCP Bridge** | Bật/tắt bridge cục bộ, đổi URL và cài chat skill cho Claude Code và Codex. |
| **Settings** | Mở cài đặt nhà cung cấp AI, giao diện graph, design content, UI Designer, thư viện texture và xem trước WebGL. |

**Tools → VinaGen AI Toolkit → Show Welcome Window** mở màn hình chào gọn nhẹ với *Open AI Chat*, *Set up AI* và ba thẻ: **Design & code**, **Create visuals**, **Build effects**.

## Bước 3: Chọn quy trình đầu tiên

<!-- tabs:start -->

#### **Flow graph**

1. Mở **Tools → VinaGen AI Toolkit → Editors → Open Flow Editor**.
2. Trong panel **Files**, tạo Flow graph mới trong một thư mục `Assets` có sẵn.
3. Thêm node, kéo từ cổng để nối, đặt nhãn cho các nhánh.
4. Bấm **Save asset**.

Xem [Flow & Design Graph](graphs.md) và [Web Flow Editor](web-editor.md).

#### **Màn hình UI**

1. Mở **Tools → VinaGen AI Toolkit → Editors → Open UI Designer**.
2. Tạo **New screen** hoặc **Import** PSD, JSON hay ảnh.
3. Gắn nhãn layer là Background / Image / Button / Text / Group (**Alt+1–5**).
4. Bấm nút **Unity** màu xanh để import Canvas.

Xem [UI Designer](ui-designer.md).

#### **Hiệu ứng particle**

1. Mở **Tools → VinaGen AI Toolkit → Particle System → Authoring Tools**.
2. Duyệt thư viện texture và particle đi kèm từ tab **Particles**.
3. Dựng hiệu ứng từ composition, alias texture hoặc prefab, thủ công hay qua MCP bridge.
4. Xem lại trong [Xem trước Particle trên WebGL](webgl-preview.md).

Xem [Particle & Texture](particles.md).

#### **Từ AI chat**

1. Bật bridge tại **Open → MCP Bridge → Start**.
2. Trong Claude Code gõ `/vina tạo màn hình shop vào Assets/MyUI/Shop.asset` (Codex: `$vina …`).

Xem [Tạo từ Claude Code / Codex](create-from-chat.md).

<!-- tabs:end -->

## Bước 4 (tùy chọn): Kết nối nhà cung cấp AI

Mở **Tools → VinaGen AI Toolkit → Settings → AI Settings**, chọn nhà cung cấp đã cấu hình và model tài khoản của bạn dùng được. Model, hạn mức và giá do nhà cung cấp quyết định; toolkit không kèm credit.

Thông tin xác thực là cấu hình cá nhân, chỉ dùng trong Editor. Đừng commit hay tự xuất các file cài đặt chứa khóa. Xem [AI Chat & Nhà cung cấp](ai-chat.md).

## Ví dụ mẫu

Toolkit kèm sẵn các ví dụ trong `Samples/`:

| Thư mục | Nội dung |
| --- | --- |
| `Samples/Graphs` | `NewMockFlowGraph.asset` và `NewDesignContentGraph.asset`. |
| `Samples/Example VinaGenUIDocument` | Tài liệu UI đầy đủ với font, ảnh, style và scene. |
| `Samples/Particles` | Texture gallery, hiệu ứng toon, recipe đã review và FX gốc. |
| `Samples/GeneratedParticles` | Prefab mẫu như `StraightFireballFX` và `toon_explosion`. |

---
[Tiếp theo: Flow & Design Graph](graphs.md)
