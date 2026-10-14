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

**Thay đổi ở đây chỉ có tác dụng trong trình duyệt** — không ảnh hưởng file Unity nào. Để AI agent tự kiểm thử hiệu ứng nó tạo theo cách này, xem [Web Particle](webgl-preview.md).

![Demo WebGL với playback và particle target](../images/particle-web-demo.png)

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

Mẹo: texture xám có thể tint sang màu bất kỳ. Texture additive dùng nền đen; decal và sprite dùng nền trong suốt.

## Thư viện prefab

Mở **Tools → VinaGen AI Toolkit → Open → Particles → Bundled Particle Library** để xem **78 prefab** đi kèm. Asset nằm trong `Content/Particles/ToonLibrary/`.

![Thư viện prefab với đường dẫn và tùy chọn ưu tiên prompt](../images/settings-prefabs.png)

Mở **Prefabs** để xem đường dẫn từng hiệu ứng, rồi mở nó trong cửa sổ Project. Xem thêm tại [Cài đặt](settings.md).

## Tạo và kiểm tra texture

Mở **Tools → VinaGen AI Toolkit → Particle System → Authoring Tools**.

| Tab | Công dụng |
| --- | --- |
| **Defaults** | Tạo lại texture, audit hình ảnh, đăng ký texture và material. |
| **Poe Image** | Tạo ảnh qua Poe bằng tài khoản của bạn. |
| **Inspect** | Kiểm tra prefab, alpha; đổi tên/kích thước giữ GUID. |
| **FX Review** | Chạy Play Mode và chụp các mốc hiệu ứng. Lưu scene trước. |

Đợi job chạy xong rồi mới vào Play Mode.

<div class="vg-pair">
  <figure><img src="images/particle-authoring-defaults.png" alt="Particle Authoring: Defaults" loading="lazy"><figcaption>Defaults: Dataset → Generate → Audit → Register.</figcaption></figure>
  <figure><img src="images/particle-authoring-poe.png" alt="Particle Authoring: Poe Image" loading="lazy"><figcaption>Poe Image: Brief / model / key → Generate with Poe.</figcaption></figure>
  <figure><img src="images/particle-authoring-inspect.png" alt="Particle Authoring: Inspect" loading="lazy"><figcaption>Inspect: Prefab / PNG → analyze or validate.</figcaption></figure>
  <figure><img src="images/particle-authoring-review.png" alt="Particle Authoring: FX Review" loading="lazy"><figcaption>FX Review: Save scenes → review → inspect captures.</figcaption></figure>
</div>

- **Defaults:** giữ **Overwrite** tắt để chỉ bổ sung file thiếu.
- **Poe Image:** tùy chọn; dùng điểm Poe của bạn.
- **Inspect:** bật **Preview rename plan** để xem trước thay đổi.
- **FX Review:** lưu scene trước khi chạy.

Mới bắt đầu? Xem [demo](demos.md).

## Dựng hiệu ứng

1. Chọn template, texture hoặc prefab nguồn.
2. Chỉnh layer, kích thước, màu và thời gian.
3. Xem lại chuyển động trong [WebGL Preview](webgl-preview.md).

Trợ lý AI cũng có thể tạo hiệu ứng cho bạn (qua `create_particle_system`). Prefab mới lưu tại `Assets/VinaGen AI Toolkit/Samples/GeneratedParticles/`. Nếu chưa có texture phù hợp, toolkit gợi ý ảnh cần tạo — hãy kiểm tra quyền sử dụng ảnh bạn nhập vào.

## Đổi render pipeline

Particle bị hồng? Chạy **Particle System → Repair Materials For Active Pipeline**. Với HDRP, luôn kiểm tra kết quả cuối trong Unity.

[Tiếp theo: Xem trước Particle trên WebGL](webgl-preview.md)
