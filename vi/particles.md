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

Năm pack có **403 texture gốc**, tạo bằng Unity C# và dùng được offline.

<figure class="vg-texture-sheet"><img src="images/textures-default.png" alt="Mẫu texture DefaultGameFX theo nhóm" loading="lazy"><figcaption>DefaultGameFX: texture cho particle, vệt chuyển động và gameplay.</figcaption></figure>

| Pack | Texture | Nội dung chính |
| --- | --- | --- |
| DefaultGameFX | 82 | Lửa, khói, sét, hồi máu, cổng dịch chuyển và thời tiết. |
| ArtStylesFX | 70 | Hiệu ứng theo nhiều phong cách. |
| GameEssentialsFX | 71 | Chiến đấu, môi trường và gameplay. |
| CombatCollisionFX | 97 | Đòn đánh, va chạm và phòng thủ. |
| UniversalGameTextures | 83 | Decal, glow, trạng thái, sprite và mask. |

Artwork có màu dùng **RGB trắng**; texture xám có thể tint. Texture particle additive dùng nền đen; decal và sprite dùng alpha.

## Thư viện prefab

Mở **Tools → VinaGen AI Toolkit → Open → Particles → Bundled Particle Library** để xem **78 prefab** đi kèm. Asset nằm trong `Content/Particles/ToonLibrary/`.

## Tạo và kiểm tra texture

Mở **Tools → VinaGen AI Toolkit → Particle System → Authoring Tools**.

| Tab | Công dụng |
| --- | --- |
| **Defaults** | Tạo lại texture, audit hình ảnh, đăng ký texture và material. |
| **Poe Image** | Tạo ảnh qua Poe bằng tài khoản của bạn. |
| **Inspect** | Kiểm tra prefab, alpha; đổi tên/kích thước giữ GUID. |
| **FX Review** | Chạy Play Mode và chụp các mốc hiệu ứng. Lưu scene trước. |

Job hiển thị tiến trình và nút hủy. Đợi job xong rồi mới vào Play Mode. Xem báo cáo trong `Library/VinaGenNativeParticleTools/Jobs/` và kiểm tra ảnh bằng mắt sau audit.

## Dựng hiệu ứng

1. Chọn template, texture hoặc prefab nguồn.
2. Chỉnh layer, kích thước, màu và thời gian.
3. Xem lại chuyển động trong [WebGL Preview](webgl-preview.md).

Qua MCP, `create_particle_system` mặc định xuất `web_preview`. Dùng `scene_object` để đặt vào scene, `prefab` để chỉ tạo asset. Prefab mới mặc định nằm trong `Assets/VinaGen AI Toolkit/Samples/GeneratedParticles/`.

Nếu thiếu artwork đúng chủ đề, toolkit trả kế hoạch tạo ảnh để bạn bổ sung. Kiểm tra quyền sử dụng ảnh import.

## Đổi render pipeline

Nếu particle bị hồng, chạy **Particle System → Repair Materials For Active Pipeline**. Preview HDRP trên web dùng bản tương thích; kiểm tra shader cuối cùng trong Unity.

[Tiếp theo: Xem trước Particle trên WebGL](webgl-preview.md)
