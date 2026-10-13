# Cài đặt

Mở **Tools → VinaGen AI Toolkit → Open → Settings**. Bấm **Open** trên thẻ để chọn asset trong **Inspector** của Unity. Mở rộng từng nhóm để xem các trường; thay đổi được lưu trên asset của dự án.

![Tab Settings với đầy đủ bảy thẻ cài đặt](../images/toolkit-settings.png)

Ảnh được chụp trên máy này ngày **13/10/2026**, bằng **Unity 6000.3.22f1**. Giá trị trong ảnh thuộc dự án demo; hãy dùng thư mục, độ phân giải và nhà cung cấp phù hợp.

Bấm vào ảnh để phóng lớn khi đọc nhãn trong Inspector.

## AI Provider Settings

![AI Provider Settings; nhóm API Keys đang đóng](../images/settings-ai.png)

1. Mở **AI Chat**, chọn **Active Provider**.
2. Nhập key tại **API Keys** và giữ key riêng tư.
3. Dùng **Refresh Models / Select Model**, hoặc nhập **Custom Model** được hỗ trợ.
4. Mở [Agent Chat](ai-chat.md) để dùng tài khoản vừa cấu hình.

**Conversation Behaviour** chỉnh cache prompt và sửa cú pháp code. **Chat UI & Appearance** chỉnh chiều cao ô nhập/font và liên kết tới cài đặt graph/design. **MCP & Automation → Particle Defaults → Particle Output** chọn Web Preview, object trong scene hoặc prefab. **Image Generation** chứa tùy chọn nguồn ảnh/nhà cung cấp. Credit của dịch vụ là riêng; làm mới model và tạo nội dung có thể kết nối dịch vụ đó.

## Graph Appearance và Design Content

<div class="vg-pair">
  <figure><img src="images/settings-graph.png" alt="Graph Appearance: tên comment, màu nền, node và đường nối" loading="lazy"><figcaption>Graph Appearance: tên comment, nền/lưới, màu node và đường nối.</figcaption></figure>
  <figure><img src="images/settings-design.png" alt="Design Content: font, dấu đánh số và kích thước khung" loading="lazy"><figcaption>Design Content: font, màu, dấu đánh số và kích thước khung mặc định.</figcaption></figure>
</div>

Đặt **Comment Display Name** trước khi viết comment review trên web. Chỉnh màu graph để tăng độ tương phản. **Design Content Settings** cung cấp **Node Font / Node Font Size**, **Default Stamp Color / Scale** và **Default Node Size**. Mở [graph](graphs.md) để kiểm tra; mặc định không thay thế nội dung màn hình đã thiết kế.

## UI Designer Settings

<div class="vg-pair">
  <figure><img src="images/settings-ui-assets.png" alt="Thư mục UI Designer, Button prefab và đăng ký font" loading="lazy"><figcaption>Project assets: nơi lưu, Button prefab và font.</figcaption></figure>
  <figure><img src="images/settings-ui-canvas.png" alt="Độ phân giải UI Designer, scale, anchor và Linear alpha" loading="lazy"><figcaption>Canvas defaults: độ phân giải, scale, snap và hành vi import.</figcaption></figure>
</div>

| Trường | Cách dùng |
| --- | --- |
| **Image folder / Document folder** | Giữ đầu ra toolkit trong `Assets/VinaGen AI Toolkit/Content/UI/`. **Browse** chọn thư mục dự án. |
| **Button prefab** | Mẫu Button cho Canvas. Để trống dùng prefab đi kèm; thêm Text con trong thiết kế để có nhãn nút. |
| **VinaGenText fonts** | **Add bundled VinaGenText fonts** đăng ký font có sẵn. |
| **TextMesh Pro fonts** | **Create TMP starter fonts** chuẩn bị font từ tài nguyên TMP chính thức khi cần. |
| **Custom fonts** | Thả TTF/OTF vào đây để Text và trình duyệt dùng được. |
| **Default screen resolution** | Width/height cho tài liệu mới. Tài liệu đã lưu giữ kích thước riêng khi import và mở Game View. |
| **Canvas scaling → Match** | 0 ưu tiên chiều rộng; 1 ưu tiên chiều cao. Kiểm tra màn hình dọc/ngang. |
| **Snap grid (px)** | Bước lưới khi đặt vị trí. |
| **Auto adjust anchors** | Suy ra anchor khi chỉnh/import; tắt để giữ anchor thủ công. |
| **Linear alpha** | Chọn Gamma Compositor hoặc Compensate Alpha, rồi so sánh Game View với trình duyệt. |
| **Keyboard shortcuts** | Mở rộng để chỉnh phím tắt; mở lại cài đặt trình duyệt để làm mới. |

Dùng **Open UI Designer in browser** để trở lại workspace. [UI Designer](ui-designer.md) giải thích import Canvas/UI Toolkit.

## Thư viện particle

<div class="vg-pair">
  <figure><img src="images/settings-textures.png" alt="Catalog Particle Texture Library chia partition với Index Entries" loading="lazy"><figcaption>Thư viện texture: mở Index Entries để xem alias.</figcaption></figure>
  <figure><img src="images/settings-prefabs.png" alt="Bundled Particle Library: bản ghi prefab và ưu tiên khi tạo bằng prompt" loading="lazy"><figcaption>Thư viện prefab: đường dẫn, category và số system.</figcaption></figure>
</div>

**Particle Texture Library** lưu alias, tag và tham chiếu catalog. Với thư viện chia partition, **Entries** có thể trống trong khi **Index Entries** vẫn chứa catalog. Xem partition tương ứng hoặc dùng MCP `list_particle_textures` / `inspect_particle_texture` để đọc chi tiết.

**Bundled Particle Library → Prefabs** liệt kê tên, đường dẫn, category và số Particle System. **Prefer For Prompt Creation** chỉnh việc ưu tiên hiệu ứng đi kèm khi tạo bằng prompt. Mở prefab trong Project để kiểm tra module gốc. Khi cần sửa shader, dùng **Particles → Repair Materials For Active Pipeline**.

## Particle WebGL Preview Settings

![Cài đặt WebGL Particle: camera và tùy chọn chụp theo yêu cầu](../images/settings-web-particle.png)

| Nhóm | Chỉnh gì |
| --- | --- |
| **Render Pipelines** | Tham chiếu pipeline asset cho đường preview/export được hỗ trợ. HDRP trên trình duyệt dùng pipeline tương thích. |
| **Output Root** | Bundle/cache preview; mặc định `Library/VinaGen/ParticlePreview`. |
| **Capture Output Root** | Nơi lưu khi gửi ảnh về Unity; mặc định `Assets/VinaGen AI Toolkit/Samples/GeneratedParticles/Captures/`. |
| **Review Target** | **Demo Effects**, hoặc **Prefab** và **Reviewed Prefab**. |
| **Camera Orbit / Target Height** | Góc nhìn, khoảng cách và framing. Lùi camera nếu hiệu ứng bị cắt. |
| **Bloom** | Mở để chỉnh bật/tắt, intensity, threshold, scatter và độ sáng HDR. Kiểm tra glow trên pipeline định dùng. |
| **Screenshot → Capture** | Thời điểm, kích thước, số cột contact sheet, simulation, seed và cách lưu. |

**Mở player không tự bắt đầu chụp.** Ô legacy **Capture → Enabled** bị bỏ qua khi khởi động. AI Agent hoặc lệnh trình duyệt phải yêu cầu chụp rõ ràng. **Post To Sink** ghi về Unity; **Download** tải qua trình duyệt. `postToSink:false` trả ảnh mà không ghi vào dự án Unity. Xem [kiểm thử Web Particle](webgl-preview.md) để hiểu quy trình AI.

## Cài đặt text

Mở **Tools → VinaGen AI Toolkit → Text → Settings**.

![VinaGenText Settings: Font Studio, nơi lưu và mặc định text mới](../images/settings-text.png)

- **Font Studio → Create Font…:** tạo font với bộ ký tự game cần.
- **Output Folder:** nơi lưu bake và trang atlas dùng chung. Phiên bản này hiển thị mặc định legacy `Assets/VinaGen Text Bakes`. Với đầu ra toolkit/sample, đặt thư mục trong `Assets/VinaGen AI Toolkit/`, chẳng hạn `Samples/Text Effects/Bakes/` dưới root này. PSD riêng giữ thư mục thuộc lần import đó.
- **Auto Bake New Texts:** mặc định cho label mới; label đang có giữ cài đặt trên component.
- **Shared Atlas:** label đã bake tương thích trong cùng thư mục có thể dùng chung trang texture.

Xem [VinaGenText](vinagen-text.md) để chọn chế độ render và [demo](demos.md) để thực hành.

## File cài đặt

Asset cài đặt nằm trong `Assets/VinaGen AI Toolkit/Settings/`, có icon robot. **Open Settings Folder** chọn thư mục này trong Project. Export portable loại cấu hình nhà cung cấp cá nhân; giữ file chứa key ngoài Git và package chia sẻ.

[Tiếp theo: Cấu trúc thư mục](folder-layout.md)
