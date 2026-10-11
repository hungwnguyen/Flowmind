# Xem trước Particle trên WebGL

> Xem lại hiệu ứng particle trong player dựng sẵn chạy trên trình duyệt, với **ảnh chụp chủ động và có seed** để AI và người cùng so sánh đúng những khung hình giống nhau.

## Có sẵn gì

Toolkit kèm player **Built-in** và **URP** đã nén, có phiên bản, trong `WebGLBuilds/ParticlePreview`. Mỗi `player-release.json` liệt kê file của bản phát hành. Người dùng cuối dùng player có sẵn, không cần tự build.

- Xuất bundle prefab gốc cần module **WebGL Build Support** của Unity Hub.
- **HDRP** không render gốc trên WebGL; trình duyệt dùng proxy tương thích URP/Built-in. Hãy kiểm tra shading HDRP cuối cùng trong Editor hoặc player desktop.

Mở player từ **Tools → VinaGen AI Toolkit → Editors → Open Particle Preview → Built-in / URP / HDRP**.

## Cài đặt xem trước

Cấu hình nguồn, khung hình, pipeline, bloom và thông số chụp mặc định trong **Tools → VinaGen AI Toolkit → Settings → Particle WebGL Preview Settings** (`VinaGenParticleWebPreviewSettings`). Kết quả xem trước (prefab, material, ảnh chụp) nằm trong `Assets/VinaGenParticles`; bundle tạm và job nằm trong `Library`.

## Cách tải hiệu ứng

Player phải chạy qua HTTP; Unity bridge làm việc này cho bạn. WebGL không tải được prefab YAML thô hay file `.unitypackage`. Hiệu ứng được gửi dưới dạng **WebGL LZ4 AssetBundle** gốc, giữ nguyên module, curve, gradient, hierarchy, sub-emitter, material, mesh và texture.

Khi tạo hiệu ứng qua MCP với `web_preview`, hãy chờ `webPreviewStatusUrl` báo thành công rồi mở `webPreviewUrl`.

## Chụp có chủ đích

Mở player, import và theo dõi manifest đều **không tự chụp ảnh**. Hãy chọn thời điểm chụp khớp vòng đời hiệu ứng, thường là **lúc bắt đầu, lúc đỉnh và lúc tắt dần**, và dùng mô phỏng có seed để so sánh lặp lại được.

```js
const fx = window.vinagenParticlePreview;
await fx.waitForReady();
await fx.importManifest('fx/manifest.json');

const frames = await fx.capture({
  times: [0.2, 0.8, 1.6],
  simulate: true,
  randomSeed: 12345,
  width: 512, height: 512,
  postToSink: false,
  motion: {
    enabled: true, path: 'arc', space: 'viewport',
    start: [0.25, 0.5, 0], end: [0.75, 0.5, 0], duration: 2
  }
});
```

- `times`: tối đa 24 ảnh trong khoảng 0 đến 120 giây.
- `randomSeed`: mặc định `12345`.
- `motion`: mười quỹ đạo gồm line, arc, circle, ellipse, triangle, rectangle, zigzag, sine, figure eight và helix. Dùng `{ enabled: false }` để chụp đứng yên.

## Browser API

| Hàm | Mục đích |
| --- | --- |
| `waitForReady()` | Hoàn tất khi player sẵn sàng. |
| `importManifest(url)` / `importEffect(source, options)` | Tải bundle từ manifest, File/Blob, mảng byte hoặc URL. |
| `watchManifest(url)` | Theo dõi phiên bản; trả về hàm để dừng theo dõi. |
| `selectEffect(assetName, { prefabPath })` | Chọn prefab đã có trong bundle. |
| `setMotion(...)` | Di chuyển emitter mà không chụp. |
| `set`, `setRange`, `command`, `send`, `requestState` | Điều khiển phát và các thuộc tính trực tiếp được hỗ trợ. Đích có thể là tên, đường dẫn, chỉ số hoặc `*`. |
| `capture(options)` | Ảnh từ camera kèm metadata. |
| `captureCanvas()` | Chụp ngay canvas hiện tại. |

Trạng thái trả về gồm pipeline thực tế, phiên bản Unity, color space, hierarchy và lỗi chụp.

---
[Tiếp theo: AI Chat & Nhà cung cấp](ai-chat.md)
