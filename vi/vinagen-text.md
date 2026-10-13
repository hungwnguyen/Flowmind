# VinaGenText

Chữ UI có gradient, stroke, viền và độ nổi. Dùng Dynamic cho nội dung thay đổi, Static Baked cho label cố định.

![Sample hiệu ứng VinaGenText trong UI Designer](../images/vinagen-text-demo.png)

Mở `Samples/Text Effects/ILoveYouTextShowcase.asset` để thử các style có sẵn. [Demo](demos.md) hướng dẫn thực hành; [Cài đặt text](settings.md#cài-đặt-text) có ảnh Font Studio và bake.

## Tạo label

Chọn **GameObject → VNT → VinaGenText**, hoặc **Typography → Text type → VinaGenText** trong UI Designer.

Chỉnh font, kích thước và hiệu ứng trong Inspector. **New** tạo style riêng; sửa style dùng chung sẽ cập nhật các label đang dùng nó. Font VinaGen dùng atlas tĩnh: cần có đủ ký tự trước khi build.

Để tạo font, mở **Font Asset → Select → Create Font**, chọn TTF/OTF và bộ ký tự **Latin And Vietnamese**, rồi **Create & Apply**.

## Chọn chế độ render

| Chế độ | Phù hợp với |
| --- | --- |
| **Dynamic** | Điểm số, đồng hồ và chữ đổi nội dung lúc chạy. |
| **Static Baked** | Tiêu đề, nhãn nút và chữ trang trí cố định. |

Static Baked gộp chữ và hiệu ứng thành một ảnh, vẽ một quad cho mỗi label, hỗ trợ fade alpha và bỏ bước parse, layout, kiểm tra style mỗi frame lúc chạy. Bản hiện tại dùng **ảnh Composited**; bake Geometry đã bị bỏ.

## Bake chữ cố định

1. Hoàn thiện nội dung, font và style.
2. Trong **Rendering**, chọn **Static Baked**, bấm **Bake / Rebuild**.
3. Giữ **Shared Atlas** bật tại **Text → Settings** để dùng chung trang texture.
4. Lưu scene hoặc prefab. Bake lại dữ liệu cũ hoặc không tương thích trước khi build.

Muốn bake cả nhóm, chọn object gốc rồi dùng **GameObject → VNT → Bake All Text (Selection + Children)**. **Revert Bake** đưa label về Dynamic.

**Texel Scale** quyết định độ nét: 1 ở độ phân giải tham chiếu, 2 cho màn hình mật độ cao hoặc chữ phóng lớn, đổi lại tốn thêm bộ nhớ texture. Phiên bản này có mặc định legacy `Assets/VinaGen Text Bakes/`; với đầu ra toolkit/sample, đổi Output Folder sang `Assets/VinaGen AI Toolkit/Samples/Text Effects/Bakes/` trước khi bake.

## Các tối ưu đã có

- **Dynamic:** label chưa kích hoạt chưa tạo renderer; các label có cùng atlas font và gradient có thể chia sẻ material. Dùng `BeginUpdate()` / `EndUpdate()` khi đổi nhiều thuộc tính.
- **Bake:** nội dung, font và style khớp nhau dùng lại dữ liệu bake. Atlas chung giúp gom các label tương thích vào cùng batch.
- **Auto Bake:** bake label đã thay đổi khi kết thúc chỉnh sửa hoặc lưu scene/prefab. Bỏ qua label không đổi; chỉ ghi lại trang atlas bị thay đổi. Không chạy trong Play Mode.

## Gom chữ bằng Mesh Batch

Dùng **Canvas** cho UI cần mask, raycast và CanvasGroup. Với chữ trong scene dùng **Mesh Renderer**:

1. Đặt các label đã bake dưới cùng một object gốc.
2. Chọn **Rendering → Backend → Mesh Renderer** cho các label.
3. Thêm **VinaGen Text Mesh Batch** vào object gốc qua Add Component.

Mỗi trang atlas cần một draw call. Nhóm dùng chung thứ tự render; tắt **Track Movement** nếu label không di chuyển trong nhóm, rồi gọi `Rebuild()` khi thay đổi vị trí.

## Benchmark: 1.000 label

Đo ngày **11/10/2026**, Unity **6000.3.22f1**, URP, Linear color space, Play Mode trong Editor, code Release, Canvas world space; **i7-14700K / RTX 3060 / RAM 32 GB**.

UGUI dùng Outline + Shadow; TMP dùng outline, underlay và gradient; VinaGenText dùng style mặc định gồm gradient, stroke, viền và extrusion.

<div class="vg-benchmark" role="region" aria-label="VinaGenText benchmark" tabindex="0">
<table><thead><tr>
<th scope="col">Chỉ số</th>
<th scope="col">UGUI Text<br>Outline + Shadow</th>
<th scope="col">TextMeshPro</th>
<th scope="col">VinaGenText<br>Dynamic</th>
<th scope="col">Static Baked<br>Geometry (đã bỏ)</th>
<th scope="col">Static Baked<br>Composited (atlas)</th>
</tr></thead><tbody>
<tr><th scope="row">Kích hoạt lần đầu</th><td>75.6 ms</td><td>397.9 ms¹</td><td>141.1 ms</td><td>30.8 ms</td><td>25.8 ms</td></tr>
<tr><th scope="row">Managed cấp phát</th><td>8.1 MB</td><td>14.4 MB</td><td>13.6 MB</td><td>0.8 MB</td><td>0.8 MB</td></tr>
<tr><th scope="row">Mỗi frame đứng yên</th><td>0.009 ms</td><td>0.106 ms</td><td>0.499 ms</td><td>0.009 ms</td><td>0.010 ms</td></tr>
<tr><th scope="row">Render / frame</th><td>1.01 ms</td><td>2.26 ms</td><td>7.09 ms</td><td>6.38 ms</td><td>1.7–2.1 ms</td></tr>
<tr><th scope="row">Đổi chữ 1.000 label</th><td>74.2 ms</td><td>24.2 ms</td><td>37.2 ms</td><td>Bake lại</td><td>Bake lại</td></tr>
<tr><th scope="row">File bake / label</th><td>—</td><td>—</td><td>—</td><td>17.0 KB</td><td>2.5 KB</td></tr>
<tr><th scope="row">Bake 1.000 label</th><td>—</td><td>—</td><td>—</td><td>14.7 s</td><td>11.8–12.9 s</td></tr>
</tbody></table></div>

¹ Lần kích hoạt đầu của TMP gồm khoảng **340 ms** khởi tạo font, material và shader một lần. Các lần sau đo được **42.9 ms**. Managed là mức tăng heap Mono khi kích hoạt; dung lượng file bake là trên ổ đĩa cho mỗi label.

Trong phép đo này, Static Baked giảm chi phí kích hoạt và cấp phát so với Dynamic. **UGUI render nhanh hơn trên Canvas**; các hiệu ứng khác nhau. Một lần đo Composited với **Mesh Batch** đạt **0.38 ms render, 4.6 ms kích hoạt, 0.36 MB managed và 1 draw call**.

<details>
<summary>Cách đo các chỉ số</summary>
<p>Kích hoạt: SetActive(true) + Canvas.ForceUpdateCanvases(). Managed: trung vị năm lần kích hoạt, tắt GC. Render: lần tốt nhất trong ba khối, mỗi khối 40 lần camera.Render. Geometry là số đo trước khi bị bỏ. Đây là số liệu Editor trên máy đo; cần profile lại trên thiết bị đích.</p>
<p>Nguồn trong dự án: <code>Documentation/VinaGenTextPerformance/VinaGenText-Performance-Report.md</code>, mục 9.11.</p>
</details>

[Tiếp theo: Particle & Texture](particles.md)
