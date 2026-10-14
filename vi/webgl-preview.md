# Web Particle: hỗ trợ AI Agent kiểm thử

**Web Particle giúp AI agent nhìn và kiểm thử hiệu ứng particle mà nó tạo ra.** Agent chạy hiệu ứng trên trình duyệt, chụp ảnh ở các thời điểm quan trọng, kiểm tra, sửa trong Unity rồi thử lại. Bạn cũng có thể tự dùng preview này.

![Demo Portal trong player WebGL thật với điều khiển playback](../images/particle-web-demo.png)

[Demo trên website](particles.md) dùng các hiệu ứng có sẵn. Trong dự án của bạn, preview tải prefab particle của chính bạn. Thay đổi trên trình duyệt chỉ để thử — không được lưu ngược về Unity.

## Chuẩn bị player

1. Giữ Unity mở, bật **Open → MCP Bridge**.
2. Vào **Tools → VinaGen AI Toolkit → Open → Particles**. Trong **Particle WebGL player**, bấm **Download** (một lần cho mỗi máy; bấm **Update** khi có bản mới).
3. Mở **Editors → Open Particle Preview → Built-in / URP / HDRP**.

![Tab Particles với player dùng chung đã cài](../images/toolkit-particles.png)

## AI agent kiểm thử hiệu ứng thế nào

1. **Tạo** — agent dựng prefab particle.
2. **Tải** — mở hiệu ứng trong web preview.
3. **Chụp** — chụp lúc bắt đầu, đỉnh và tắt dần, dùng seed cố định để so sánh được.
4. **Kiểm tra** — xem từng ảnh tìm lỗi: sai màu, bị cắt khung, ảnh trống, sai timing.
5. **Sửa** — chỉnh texture, material hoặc emission trong Unity rồi tải lại.
6. **Lặp lại** đến khi đúng yêu cầu, rồi báo kết quả kèm ảnh chụp.

Ví dụ yêu cầu trợ lý:

```text
$vina tạo một vụ nổ toon bằng artwork offline, rồi kiểm thử bằng Web Particle.
Chụp lúc bắt đầu, đỉnh và tắt dần với cùng seed. Xem từng ảnh,
sửa lỗi cắt khung hoặc timing, rồi kiểm thử lại prefab Unity đã lưu.
```

Xem [Tạo từ chat](create-from-chat.md) và [MCP Bridge](mcp-bridge.md) để thiết lập.

## Chụp để so sánh

```js
const fx = window.vinagenParticlePreview;
await fx.waitForReady();
const frames = await fx.capture({
  times: [0.08, 0.18, 0.8], // Ví dụ cho vụ nổ ngắn này; chỉnh theo hiệu ứng.
  simulate: true,
  randomSeed: 12345,
  width: 960,
  height: 640,
  motion: { enabled: false },
  postToSink: false
});
```

Ảnh chụp từ `toon_explosion` (seed 12345, pipeline Built-in):

<div class="vg-pair">
  <figure><img src="images/particle-review-1.png" alt="Ảnh camera vụ nổ toon tại 0,08 giây" loading="lazy"><figcaption>0,08 s — flash đầu và silhouette.</figcaption></figure>
  <figure><img src="images/particle-review-2.png" alt="Ảnh camera vụ nổ toon tại 0,18 giây" loading="lazy"><figcaption>0,18 s — khối nổ mở rộng và layer khói.</figcaption></figure>
  <figure><img src="images/particle-review-3.png" alt="Ảnh camera vụ nổ toon tại 0,8 giây" loading="lazy"><figcaption>0,80 s — khói cuối và particle còn lại.</figcaption></figure>
</div>

- `postToSink: true` lưu ảnh vào dự án Unity; `download: true` tải ảnh qua trình duyệt.
- Không có gì được chụp cho đến khi gọi `capture()`.
- Mặc định camera, bloom, capture: [Particle WebGL Preview Settings](settings.md#particle-webgl-preview-settings).

## Điều khiển thủ công

| Điều khiển | Cách dùng |
| --- | --- |
| **Particle target** | Chọn một system hoặc tất cả. |
| **Play / Pause / Restart** | Chạy lại hiệu ứng. |
| **Time scale** | Làm chậm để xem timing. |
| **Lifetime / Start size / Emission / Start color** | Chỉnh giá trị rồi bấm **Apply basics**. |
| **Motion & rendering** | Khoảng cách camera, chế độ render và chuyển động emitter. |
| **Import & developer tools** | Nhập file, chạy lệnh và chụp (trên demo website). |

![Web Particle mở nhóm Motion and rendering](../images/particle-web-motion.png)

Muốn thử hiệu ứng di chuyển (vệt trail), dùng **Emitter motion → Arc / Line / Circle…**, đặt điểm đầu/cuối và thời gian, rồi **Apply path**.

![Nút Capture frame và Download PNG trong demo website](../images/particle-web-capture.png)

## Xử lý sự cố

- **Thiếu player hoặc player cũ:** tải/cập nhật trong tab Particles.
- **Ảnh trống hoặc bị cắt:** restart, chọn thời điểm hiệu ứng đang chạy, lùi camera ra.
- **Material hồng:** chạy **Repair Materials For Active Pipeline** rồi tải lại.
- **HDRP:** trình duyệt chỉ hiển thị gần đúng. Kiểm tra kết quả HDRP cuối cùng trong Unity.
- **Không tải được file:** chỉ dùng `.vgfx.json` do toolkit xuất — không dùng `.prefab` hay `.unitypackage`.
- **Script riêng / VFX Graph:** player web không hỗ trợ; hãy kiểm tra trong Unity.

[Tiếp theo: AI Chat & Nhà cung cấp](ai-chat.md)
