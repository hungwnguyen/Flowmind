# VinaGenText

Chữ UI đẹp với gradient, viền, outline và độ nổi 3D. Dùng **Dynamic** cho chữ thay đổi, **Static Baked** cho label cố định.

![Sample hiệu ứng VinaGenText trong UI Designer](../images/vinagen-text-demo.png)

Thử các style có sẵn trong `Samples/Text Effects/ILoveYouTextShowcase.asset`. Xem thêm [Demo](demos.md) và [Cài đặt text](settings.md#cài-đặt-text).

## Tính năng

| Nhóm | Bạn có |
| --- | --- |
| Chữ | Font, cỡ chữ, đậm/nghiêng, căn lề, xuống dòng, auto size, khoảng cách, chữ cong. Dùng được với Layout Group. |
| Rich text | `<b>`, `<i>`, `<u>`, `<s>`, `<color>`, `<size>`, `<sup>`, `<sub>`, `<br>` |
| Màu | Màu đơn hoặc gradient (ngang, dọc, bốn góc). |
| Hiệu ứng | Viền trong, stroke, viền ngoài và độ nổi 3D. |
| Opacity | Làm mờ chữ và hiệu ứng cùng lúc. |
| Style dùng chung | Sửa style một lần — mọi label dùng nó cùng đổi. |
| Hiển thị | Canvas (UI) hoặc Mesh Renderer (chữ trong scene). |

Chạy không cần TextMesh Pro. TMP chỉ dùng trong Editor để tạo font.

## Tạo label

Chọn **GameObject → VNT → VinaGenText**, hoặc đặt **Typography → Text type → VinaGenText** trong UI Designer.

Chỉnh font, cỡ chữ và hiệu ứng trong Inspector. **New** tạo style riêng; sửa style dùng chung sẽ cập nhật mọi label đang dùng nó.

**Tạo font:** **Font Asset → Select → Create Font** → chọn TTF/OTF → **Latin And Vietnamese** → **Create & Apply**.

> Font chỉ chứa các ký tự bạn chọn. Ký tự thiếu sẽ không hiện — kiểm tra bộ ký tự đủ dùng trước khi build.

Style, gradient và font bạn tạo được lưu trong `Assets/VinaGenGenerated/` (ngoài toolkit, nên cập nhật toolkit không ghi đè).

## Chọn chế độ render

| Chế độ | Dùng cho |
| --- | --- |
| **Dynamic** | Điểm số, đồng hồ và chữ thay đổi trong game. |
| **Static Baked** | Tiêu đề, nhãn nút và chữ cố định. Nhanh nhất. |

Static Baked gộp chữ và hiệu ứng thành một ảnh, nên gần như không tốn gì khi chạy.

## Bake chữ cố định

1. Hoàn thiện nội dung, font và style.
2. Trong **Rendering**, chọn **Static Baked**, bấm **Bake / Rebuild**.
3. Giữ **Shared Atlas** bật trong **Text → Settings**.
4. Lưu scene hoặc prefab.

Bake tất cả chữ dưới một object: chọn object đó rồi **GameObject → VNT → Bake All Text (Selection + Children)**. **Revert Bake** đưa label về Dynamic.

**Texel Scale** chỉnh độ nét: 1 là bình thường, 2 cho màn hình nét cao hoặc chữ phóng to (tốn thêm bộ nhớ). Ảnh bake lưu tại `Assets/VinaGen Text Bakes/`.

**Auto Bake** tự bake lại label đã sửa khi bạn lưu scene hoặc prefab.

## Gom chữ bằng Mesh Batch

Với chữ trong scene 3D (không phải UI), gom các label đã bake để giảm draw call:

1. Đặt các label đã bake dưới một object cha.
2. Chọn **Rendering → Backend → Mesh Renderer** cho từng label.
3. Thêm **VinaGen Text Mesh Batch** vào object cha.

Nếu label không di chuyển, tắt **Track Movement**. Sau khi di chuyển label, gọi `Refresh()` của nó.

## Giới hạn

- **Bộ ký tự cố định:** chỉ hiện ký tự có trong font. Không hợp cho chữ người dùng tự nhập (tiếng Trung, Nhật, emoji…).
- **Rich text:** không hỗ trợ `<font>`, `<material>`, `<sprite>`, `<style>`.
- **Không thay thế TMP:** font TMP phải chuyển đổi trước.
- **Label đã bake không đổi được lúc chạy.** Gọi `SwitchToDynamic()` trước khi sửa.
- **Hiệu ứng tốn hơn:** stroke, outline, extrusion tăng gấp ba số đỉnh. Dùng cho label ngắn, không dùng cho đoạn văn.
- **Opacity dưới 1** tốn thêm một draw call mỗi label. Nhiều label cùng fade thì nên dùng Static Baked.
- **Dynamic chậm hơn TMP** khi đổi chữ hoặc hiện lần đầu (xem [Benchmark](vinagen-text.md?id=benchmark-200-label)).
- Đổi **Text type** trong UI Designer xong cần import lại Canvas.

## Benchmark: 200 label

Đo ngày 13/10/2026 · Unity 6000.3.22f1 · bản Release Windows · i7-14700K / RTX 3060. **Plain** = không hiệu ứng; **Styled** = gradient, stroke, viền và extrusion.

<div class="vg-benchmark" role="region" aria-label="VinaGenText benchmark, 200 label" tabindex="0">
<table><thead><tr>
<th scope="col">Chỉ số (200 label)</th>
<th scope="col">UGUI Text</th>
<th scope="col">TextMeshPro</th>
<th scope="col">VinaGenText<br>Dynamic Plain</th>
<th scope="col">VinaGenText<br>Dynamic Styled</th>
<th scope="col">Static Baked</th>
</tr></thead><tbody>
<tr><th scope="row">Kích hoạt lần đầu</th><td>2.50 ms</td><td>5.09 ms</td><td>9.61 ms</td><td>10.49 ms</td><td>—</td></tr>
<tr><th scope="row">Kích hoạt lại</th><td>2.25 ms</td><td>3.50 ms</td><td>1.25 ms</td><td>1.32 ms</td><td>—</td></tr>
<tr><th scope="row">Load scene đã bake</th><td>—</td><td>—</td><td>—</td><td>—</td><td>2.78 ms Canvas<br>1.50 ms Mesh Batch</td></tr>
<tr><th scope="row">Managed cấp phát khi kích hoạt lần đầu</th><td>1.8 MB</td><td>3.8 MB</td><td>5.2 MB</td><td>5.2 MB</td><td>—</td></tr>
<tr><th scope="row">Frame đứng yên (cả frame)</th><td>0.13 ms</td><td>0.15 ms</td><td>0.27 ms</td><td>1.64 ms</td><td>0.13 ms</td></tr>
<tr><th scope="row">Đổi chữ toàn bộ label</th><td>1.94 ms</td><td>3.38 ms</td><td>5.39 ms</td><td>6.47 ms</td><td>Bake lại</td></tr>
<tr><th scope="row">Đổi màu toàn bộ label</th><td>1.78 ms</td><td>3.07 ms</td><td>1.18 ms</td><td>1.32 ms</td><td>—</td></tr>
<tr><th scope="row">Số đỉnh</th><td>9.964</td><td>10.764</td><td>9.964</td><td>29.884</td><td>804</td></tr>
<tr><th scope="row">Draw call (đứng yên)</th><td>2</td><td>2</td><td>2</td><td>2</td><td>2</td></tr>
</tbody></table></div>

**Tóm lại:** Static Baked rẻ nhất cho chữ cố định. Dynamic nhanh hơn TMP khi đổi màu và bật lại, nhưng chậm hơn khi đổi chữ và kích hoạt lần đầu.

<details>
<summary>Cách đo các chỉ số</summary>
<p>Mono, Direct3D 12, Built-in pipeline, Gamma; Canvas render vào RenderTexture 1280×720. Mỗi giá trị là trung vị của hai lần chạy xen kẽ. Kích hoạt = SetActive(true) + lần cập nhật Canvas đầu (đã warm). Các dòng "Đổi" = một frame mà mọi label cùng đổi. Managed = mức tăng heap Mono khi tắt GC. Chưa tính GPU time — hãy profile trên thiết bị đích. Label đầu tiên trong process mới tốn thêm khoảng 29 + 59 ms khởi tạo một lần.</p>
<p>Nguồn trong dự án: <code>Documentation/VinaGenTextPerformance/VinaGenText-Comparison-Summary.md</code>.</p>
</details>

[Tiếp theo: Particle & Texture](particles.md)
