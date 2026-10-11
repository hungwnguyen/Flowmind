# Xem trước Particle trên WebGL

Xem và tinh chỉnh hiệu ứng particle bằng player trình duyệt dựng sẵn.

## Mở preview

Chọn **Tools → VinaGen AI Toolkit → Editors → Open Particle Preview → Built-in / URP / HDRP**.

Giữ Unity mở để bridge phục vụ player qua HTTP. Xuất bundle prefab cần **WebGL Build Support** trong Unity Hub. Player đã được dựng sẵn.

Hiệu ứng HDRP dùng bản preview tương thích URP/Built-in. Kiểm tra màu và shader HDRP cuối cùng trong Unity.

## Xem hiệu ứng

1. Mở URL preview do toolkit trả về. Nếu dùng job MCP, đợi `webPreviewStatusUrl` báo thành công.
2. Dùng **Play / Pause / Restart** và **Time scale** để xem chuyển động.
3. Chọn particle system để đổi kích thước, thời gian sống hoặc màu.
4. Bấm **Capture frame** hoặc **Download PNG** khi cần ảnh.

Mở player không tự chụp ảnh. Xem [Particle & Texture](particles.md) để thử demo trên website.

## Chụp để so sánh

Chọn thời điểm cụ thể và seed cố định để so sánh các lần chỉnh:

```js
const fx = window.vinagenParticlePreview;
await fx.waitForReady();
await fx.capture({
  times: [0.2, 0.8, 1.6],
  simulate: true,
  randomSeed: 12345,
  postToSink: false
});
```

Chọn mốc bắt đầu, đỉnh hiệu ứng và lúc tắt dần. Chỉnh camera, bloom và nơi lưu tại **Settings → Particle WebGL Preview Settings**. Ảnh chụp mặc định nằm trong `Samples/GeneratedParticles/Captures/` của toolkit.

[Tiếp theo: AI Chat & Nhà cung cấp](ai-chat.md)
