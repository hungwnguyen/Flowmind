<div class="vg-particle-intro">
  <h1>Particle &amp; Texture</h1>
  <p>Từ texture đến chuyển động. Khám phá hiệu ứng, tinh chỉnh ngay trên trình duyệt rồi dựng hiệu ứng của bạn trong Unity.</p>
  <div class="vg-particle-facts"><span><strong>403</strong> texture offline</span><span><strong>78</strong> prefab hiệu ứng</span><span>Built-in / URP / HDRP</span></div>
</div>

## Thử ngay trên trình duyệt

Chọn một hiệu ứng để xem chuyển động. Dùng **Phát lại** để xem lại từ đầu hoặc giảm **Tốc độ** để quan sát từng lớp particle.

<div class="vg-fx">
  <div class="vg-fx-heading"><span>Bộ sưu tập hiệu ứng</span><span class="vg-fx-badge">8 demo tương tác</span></div>
  <div class="vg-fx-picker" role="group" aria-label="Hiệu ứng">
    <button type="button" data-fx="toon_explosion" aria-pressed="true"><span>Vụ nổ</span><small>Bùng nổ &amp; tia lửa</small></button>
    <button type="button" data-fx="lightning_strike" aria-pressed="false"><span>Sét đánh</span><small>Phóng điện</small></button>
    <button type="button" data-fx="portal" aria-pressed="false"><span>Cổng dịch chuyển</span><small>Vòng phép thuật</small></button>
    <button type="button" data-fx="toon_heal_burst" aria-pressed="false"><span>Hồi máu</span><small>Hiệu ứng hồi phục</small></button>
    <button type="button" data-fx="toon_slash" aria-pressed="false"><span>Chém</span><small>Vệt lưỡi kiếm</small></button>
    <button type="button" data-fx="toon_shield_hit" aria-pressed="false"><span>Đỡ bằng khiên</span><small>Ánh sáng phòng thủ</small></button>
    <button type="button" data-fx="toon_smoke_burst" aria-pressed="false"><span>Khói</span><small>Particle mềm</small></button>
    <button type="button" data-fx="rain_2d" aria-pressed="false"><span>Mưa</span><small>Hiệu ứng thời tiết</small></button>
  </div>
  <iframe class="vg-fx-frame" src="playground/?fx=toon_explosion&replay=1&lang=vi" title="Sân chơi particle VinaGen" loading="lazy" allow="fullscreen"></iframe>
  <div class="vg-fx-footer"><span data-fx-selected aria-live="polite">Vụ nổ — Bùng nổ &amp; tia lửa</span><a data-fx-open href="playground/?fx=toon_explosion&replay=1&lang=vi" target="_blank" rel="noopener">Mở toàn màn hình ↗</a></div>
  <p class="vg-fx-note">Player WebGL khoảng 11 MB. Hiệu ứng phát một lần sẽ tự lặp lại. Các demo sử dụng pipeline Built-in.</p>
</div>

<ol class="vg-fx-guide">
  <li><strong>Chọn hiệu ứng</strong><span>Chuyển giữa tám demo ở phía trên.</span></li>
  <li><strong>Khám phá từng lớp</strong><span>Tạm dừng, giảm tốc độ hoặc chọn một particle system.</span></li>
  <li><strong>Tinh chỉnh theo ý bạn</strong><span>Đổi kích thước, màu sắc rồi áp dụng thay đổi.</span></li>
</ol>

## Thư viện texture offline

Năm pack chứa **403 texture**, tất cả được render bằng Unity C# từ công thức do VinaGen tự xây dựng, không dùng artwork bên thứ ba và không cần runtime xử lý ảnh. Bản phát hành particle đầy đủ có 474 PNG (kiểm tra ngày 11/10/2026).

<figure class="vg-texture-sheet"><img src="images/textures-default.png" alt="Mẫu texture DefaultGameFX sắp xếp theo từng nhóm" loading="lazy"><figcaption>DefaultGameFX: artwork gốc cho particle, vệt chuyển động và hiệu ứng gameplay.</figcaption></figure>

| Pack | Số texture | Nhóm |
| --- | --- | --- |
| **DefaultGameFX** | 82 | Vật phẩm thu thập, confetti, decal, nổ, lông vũ, lửa, flare, ma, phát sáng, hồi máu, băng, lá, sét, phép thuật, cổng dịch chuyển, sóng xung kích, chém, khói, tuyết, tia lửa, ngôi sao, vệt, nước |
| **ArtStylesFX** | 70 | Lửa, phát sáng, va chạm, sét, phép thuật, puzzle, chém, khói, lấp lánh và bắn tóe theo nhiều phong cách |
| **GameEssentialsFX** | 71 | Chiến đấu, môi trường, lửa, gameplay, phép thuật, sci-fi, thời tiết |
| **CombatCollisionFX** | 97 | Đạn, lưỡi kiếm, đỡ đòn, đòn đánh cùn, bóng tối, phòng thủ, điện, chất nổ, chất lỏng, vỡ nát, băng giá, mặt đất, phép thuật, chuyển động, không gian và nhiều nhóm khác |
| **UniversalGameTextures** | 83 | Va chạm, decal, môi trường, phát sáng, trạng thái, sprite vật thể, phần thưởng, sci-fi, khói, texture UI, mask tiện ích, nước, thời tiết |

![Mẫu texture CombatCollisionFX](../images/textures-combat.png)

### Quy ước import

| Vai trò texture | Import |
| --- | --- |
| Particle | Nền đen đặc, render additive |
| Decal | Straight alpha |
| UI / vật thể | Import Sprite có alpha |
| Bề mặt / địa hình | sRGB, repeat, mipmap |
| Mask | Lấy mẫu linear, repeat, mipmap |

Asset tổng quát không được tự động chọn cho particle. Hãy gán texture bề mặt và mask vào đúng slot shader trong material của bạn.

## Thư viện particle đi kèm

`Content/Particles/ToonLibrary` là thư viện độc lập gồm **78 prefab hiệu ứng** cùng material, mesh và artwork gốc. Duyệt thư viện tại **Open → Particles → Bundled Particle Library**. Gallery trong `Samples/Particles/Texture Gallery/` hiển thị từng texture dùng lại được trên một prefab.

## Authoring Tools

Mở **Tools → VinaGen AI Toolkit → Particle System → Authoring Tools**.

| Tab / thao tác | Chức năng |
| --- | --- |
| **Defaults → Generate** | Dựng lại PNG đi kèm từ manifest đã tuyển chọn. File có sẵn được bỏ qua trừ khi bật **Overwrite**. |
| **Defaults → Audit** | Kiểm tra từng ô atlas về padding, bị cắt, độ rõ ở kích thước trong game, nhiễu, độ mờ và quy tắc màu; ghi JSON và trang review có nhãn. |
| **Defaults → Register** | Đăng ký texture vào thư viện và tạo material additive tương thích pipeline. |
| **Poe Image → Generate** | Tạo ảnh từ văn bản qua Poe API (tùy chọn, dùng điểm Poe của bạn). |
| **Inspect** | Liệt kê theo tên file, phân tích prefab chỉ đọc, kiểm tra alpha, đổi tên/kích thước mà vẫn giữ GUID. |
| **FX Review** | Tạo hoặc review prefab, vào Play Mode thật, chụp các mốc delay/burst/lifetime rồi khôi phục Editor. Hãy lưu scene trước. |

Tạo và phân tích chạy dưới dạng job Editor tăng dần, có tiến trình và nút hủy. Báo cáo lưu tại `Library/VinaGenNativeParticleTools/Jobs`. Không vào Play Mode cho tới khi job xong.

> Kiểm tra số liệu chỉ phát hiện lỗi, không chứng minh chất lượng hình ảnh. Luôn xem trực tiếp các trang sprite/atlas và hiệu ứng khi chuyển động.

### Dataset

`all` gồm cả năm pack; `universal` và `combat` chọn một pack; `lowpoly` / `voxel` chọn các nhánh phong cách tương ứng. Muốn bản để review, hãy ghi ra `Library/VinaGenNativeParticleTools/Generated` thay vì thư mục đi kèm.

## Dựng hiệu ứng

Chọn một trong các cách:

- một **composition** (template),
- một **alias texture** cụ thể,
- một **prefab nguồn**, hoặc
- một **đặc tả ParticleSystem** có cấu trúc.

Sau đó kiểm tra số layer, artwork được chọn, lỗi material và cảnh báo. Dùng **RGB trắng** cho artwork có màu; tô màu cho bản xám và giữ hiệu ứng mờ dần alpha.

Qua MCP, `create_particle_system` mặc định xuất **`web_preview`**. Dùng **`scene_object`** để đặt vào scene hoặc **`prefab`** để chỉ tạo asset. Xem [MCP Bridge](mcp-bridge.md).

Prefab, material và ảnh chụp được tạo ra nằm trong `Assets/VinaGenParticles`.

## Thiếu artwork

Bước lập kế hoạch cho biết catalog có khớp chủ đề không. Nếu thiếu, toolkit trả về **kế hoạch tạo ảnh** thay vì thay bằng artwork không liên quan. Tạo ảnh bằng công cụ ảnh của trợ lý hoặc nhà cung cấp đã cấu hình, import rồi tiếp tục với alias/job của ảnh đó. Chi phí nhà cung cấp và quyền sử dụng artwork vẫn áp dụng.

Artwork bên thứ ba khi import giữ nguyên **màu, hình dạng và nền gốc**. Quá trình import chỉ xoay một phần tư vòng, giãn biên tùy chọn và làm nét nhẹ; việc này **không** cấp quyền phân phối lại.

## Render pipeline

Hỗ trợ render trên Built-in, URP và HDRP. Nếu particle bị hồng sau khi đổi pipeline, chạy **Tools → VinaGen AI Toolkit → Particle System → Repair Materials For Active Pipeline** (cũng có trong tab Particles).

## Tạo hàng loạt

```text
Unity -batchmode -projectPath <project> -executeMethod FlowCanvasExporter.Editor.VinaGenParticleTools.BatchGenerate -vinagenDataset all -vinagenOutput Library/VinaGenNativeParticleTools/Generated
```

Chỉ thêm `-vinagenOverwrite` khi thật sự muốn dựng lại. Đừng thêm `-quit`, job sẽ tự thoát Unity khi xong. Không mở tiến trình Unity thứ hai trên dự án đang mở.

---
[Tiếp theo: Xem trước Particle trên WebGL](webgl-preview.md)
