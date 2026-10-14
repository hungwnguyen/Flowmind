# Cài đặt

Mở **Tools → VinaGen AI Toolkit → Open → Settings**. Bấm **Open** trên một thẻ để chỉnh asset cài đặt đó trong **Inspector**. Cuộn xuống để xem đủ các thẻ.

<div class="vg-pair">
  <figure><img src="images/toolkit-settings.png" alt="Settings: các thẻ AI, Graph Appearance, Design Content và UI Designer" loading="lazy"><figcaption>Make it yours: cài đặt AI, graph, design và UI.</figcaption></figure>
  <figure><img src="images/toolkit-settings-particles.png" alt="Settings sau khi cuộn tới Particles and previews" loading="lazy"><figcaption>Cuộn xuống: thư viện texture, prefab và Particle WebGL Preview.</figcaption></figure>
</div>

Ảnh chụp từ dự án demo (Unity 6000.3.22f1). Bấm vào ảnh để phóng to.

## AI Provider Settings

![AI Provider Settings; nhóm API Keys đang đóng](../images/settings-ai.png)

1. Mở **AI Chat**, chọn **Active Provider**.
2. Dán key vào **API Keys**. Giữ key bí mật.
3. Bấm **Refresh Models / Select Model**, hoặc nhập **Custom Model**.
4. Mở [Agent Chat](ai-chat.md) để bắt đầu chat.

Các mục khác:

- **Conversation Behaviour** — cache prompt và sửa lỗi code.
- **Chat UI & Appearance** — kích thước ô nhập và font.
- **MCP & Automation → Particle Defaults → Particle Output** — particle mới được tạo ở đâu (web preview, scene hay prefab).
- **Image Generation** — tùy chọn nhà cung cấp ảnh.

Chi phí sử dụng do nhà cung cấp AI tính, không phải toolkit.

## Graph Appearance và Design Content

<div class="vg-pair">
  <figure><img src="images/settings-graph.png" alt="Graph Appearance: tên comment, màu nền, node và đường nối" loading="lazy"><figcaption>Graph Appearance: tên comment, nền/lưới, màu node và đường nối.</figcaption></figure>
  <figure><img src="images/settings-design.png" alt="Design Content: font, dấu đánh số và kích thước khung" loading="lazy"><figcaption>Design Content: font, màu, dấu đánh số và kích thước khung mặc định.</figcaption></figure>
</div>

- **Graph Appearance:** tên hiển thị khi comment và màu sắc của graph.
- **Design Content:** font, màu/cỡ dấu đánh số và kích thước khung mặc định cho màn hình mới. Màn hình đã có không bị đổi.

## UI Designer Settings

<div class="vg-pair">
  <figure><img src="images/settings-ui-assets.png" alt="Thư mục UI Designer, Button prefab và đăng ký font" loading="lazy"><figcaption>Project assets: nơi lưu, Button prefab và font.</figcaption></figure>
  <figure><img src="images/settings-ui-canvas.png" alt="Độ phân giải UI Designer, scale, anchor và Linear alpha" loading="lazy"><figcaption>Canvas defaults: độ phân giải, scale, snap và hành vi import.</figcaption></figure>
</div>

| Trường | Tác dụng |
| --- | --- |
| **Image folder / Document folder** | Nơi lưu ảnh và tài liệu UI. |
| **Button prefab** | Mẫu cho nút. Để trống để dùng mẫu có sẵn. |
| **VinaGenText fonts** | **Add bundled VinaGenText fonts** đăng ký font đi kèm. |
| **TextMesh Pro fonts** | **Create TMP starter fonts** tạo sẵn font TMP. |
| **Custom fonts** | Thả font TTF/OTF của bạn vào đây. |
| **Reference Resolution** | Kích thước mặc định cho tài liệu mới. |
| **Match Width Or Height** | 0 = khớp chiều rộng, 1 = khớp chiều cao. |
| **Grid Size** | Bước lưới khi snap. |
| **Auto adjust anchors** | Tự đặt anchor. Tắt nếu muốn tự đặt. |
| **Linear Alpha Mode** | Sửa lệch màu ở dự án Linear. |
| **Keyboard shortcuts** | Tùy chỉnh phím tắt. |

Xem [UI Designer](ui-designer.md) để import Canvas và UI Toolkit.

## Thư viện particle

<div class="vg-pair">
  <figure><img src="images/settings-textures.png" alt="Catalog Particle Texture Library chia partition với Index Entries" loading="lazy"><figcaption>Thư viện texture: mở Index Entries để xem alias.</figcaption></figure>
  <figure><img src="images/settings-prefabs.png" alt="Bundled Particle Library: bản ghi prefab và ưu tiên khi tạo bằng prompt" loading="lazy"><figcaption>Thư viện prefab: đường dẫn, category và số system.</figcaption></figure>
</div>

- **Particle Texture Library** — danh mục texture. Xem trong **Index Entries** (**Entries** trống là bình thường).
- **Bundled Particle Library** — các prefab hiệu ứng đi kèm. **Prefer For Prompt Creation** để AI ưu tiên dùng lại chúng.
- Material bị hồng? Chạy **Particles → Repair Materials For Active Pipeline**.

## Particle WebGL Preview Settings

![Cài đặt WebGL Particle: nơi lưu, Review Target và camera](../images/settings-web-particle.png)

| Nhóm | Chỉnh gì |
| --- | --- |
| **Render Pipelines** | Pipeline dùng cho preview. |
| **Output Root** | Cache preview (mặc định `Library/VinaGen/ParticlePreview`). |
| **Capture Output Root** | Nơi lưu ảnh chụp trong dự án. |
| **Review Target** | Xem hiệu ứng demo hoặc một prefab cụ thể. |
| **Camera Orbit / Target Height** | Góc và khoảng cách camera. Lùi lại nếu hiệu ứng bị cắt. |
| **Bloom** | Độ sáng và ngưỡng glow. |
| **Screenshot → Capture** | Thời điểm, kích thước và bố cục ảnh chụp. |

Mở player không tự chụp — AI agent hoặc lệnh trình duyệt phải yêu cầu. Xem [Web Particle](webgl-preview.md).

## Cài đặt text

Mở **Tools → VinaGen AI Toolkit → Text → Settings**.

![VinaGenText Settings: Font Studio, nơi lưu và mặc định text mới](../images/settings-text.png)

- **Font Studio → Create Font…** — tạo font với bộ ký tự game cần.
- **Output Folder** — nơi lưu ảnh chữ đã bake (mặc định `Assets/VinaGen Text Bakes`).
- **Auto Bake New Texts** — label mới tự bake lại khi bạn sửa xong hoặc lưu.
- **Shared Atlas** — các label đã bake dùng chung texture để tiết kiệm bộ nhớ.

Xem chi tiết tại [VinaGenText](vinagen-text.md).

## File cài đặt

Toàn bộ cài đặt nằm trong `Assets/VinaGen AI Toolkit/Settings/` (icon robot). **Open Settings Folder** mở nhanh thư mục này.

> Không commit file chứa API key lên Git hay đưa vào package chia sẻ.

[Tiếp theo: Cấu trúc thư mục](folder-layout.md)
