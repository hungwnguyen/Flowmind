# VinaGenText

Chữ UI có gradient, stroke, viền và độ nổi. Dùng Dynamic cho nội dung thay đổi, Static Baked cho label cố định.

![Sample hiệu ứng VinaGenText trong UI Designer](../images/vinagen-text-demo.png)

Mở `Samples/Text Effects/ILoveYouTextShowcase.asset` để thử các style có sẵn. [Demo](demos.md) hướng dẫn thực hành; [Cài đặt text](settings.md#cài-đặt-text) có ảnh Font Studio và bake.

## Tạo label

Chọn **GameObject → VNT → VinaGenText**, hoặc **Typography → Text type → VinaGenText** trong UI Designer.

Chỉnh font, kích thước và hiệu ứng trong Inspector. **New** tạo style riêng; sửa style dùng chung sẽ cập nhật các label đang dùng nó. Font VinaGen dùng atlas tĩnh: cần có đủ ký tự trước khi build.

Để tạo font, mở **Font Asset → Select → Create Font**, chọn TTF/OTF và bộ ký tự **Latin And Vietnamese**, rồi **Create & Apply**.

Style, gradient và font bạn tạo là đầu ra của dự án, được lưu ngoài toolkit, trong `Assets/VinaGenGenerated/`:

| Asset | Thư mục |
| --- | --- |
| Style mẫu / style tạo bằng **New** | `Text Styles/Defaults/`, `Text Styles/Manual/` |
| Style xuất từ UI Designer | `Text Styles/UI Designs/<tên design>/`, `Text Styles/Presets/` |
| Gradient | `Text Gradients/Defaults/`, `Text Gradients/Custom/` |
| Font tạo mới hoặc import | `Fonts/VinaGenText/` |

Font mà sample và settings đi kèm sử dụng vẫn nằm trong `VinaTextPro/Fonts/` của toolkit. Style và gradient còn sót trong thư mục cũ `VinaTextPro/Text Styles` và `Text Gradients` của toolkit được tự động chuyển ra ngoài, giữ nguyên tham chiếu; **Tools → VinaGen AI Toolkit → Text → Move Generated Text Assets Out Of Toolkit** chạy lại bước này.

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

- **Kích hoạt Dynamic:** label chưa kích hoạt chưa tạo renderer, và renderer được clone từ một mẫu dựng sẵn. Bật lại label không đổi gì sẽ dùng lại layout cũ thay vì layout lại chữ.
- **Cập nhật Dynamic:** sửa màu mặt chữ, gradient, stroke hoặc viền của style dùng chung sẽ cập nhật các label mà không layout lại chữ (với label không có thẻ rich text, gạch chân, cắt chữ hay sprite). Chữ cong đổi màu mà không uốn lại và không cấp phát bộ nhớ mỗi frame. Các label có cùng atlas font và gradient có thể chia sẻ material. Dùng `BeginUpdate()` / `EndUpdate()` khi đổi nhiều thuộc tính.
- **Bake:** nội dung, font và style khớp nhau dùng lại dữ liệu bake. Atlas chung giúp gom các label tương thích vào cùng batch.
- **Mesh Batch:** gọi `Refresh()` trên label không thay đổi sẽ không dựng lại batch.
- **Auto Bake:** bake label đã thay đổi khi kết thúc chỉnh sửa hoặc lưu scene/prefab. Bỏ qua label không đổi; chỉ ghi lại trang atlas bị thay đổi. Không chạy trong Play Mode.

## Gom chữ bằng Mesh Batch

Dùng **Canvas** cho UI cần mask, raycast và CanvasGroup. Với chữ trong scene dùng **Mesh Renderer**:

1. Đặt các label đã bake dưới cùng một object gốc.
2. Chọn **Rendering → Backend → Mesh Renderer** cho các label.
3. Thêm **VinaGen Text Mesh Batch** vào object gốc qua Add Component.

Mỗi trang atlas cần một draw call. Nhóm dùng chung thứ tự render; tắt **Track Movement** nếu label không di chuyển trong nhóm, rồi gọi `Refresh()` của label (hoặc `Rebuild()` của batch) sau khi đổi vị trí.

Label Dynamic có opacity dưới 1 sẽ tốn một draw call cho mỗi label. Nếu nhiều label cùng fade, nên dùng Static Baked.

## Benchmark: 200 label

Đo ngày **13/10/2026** trên player Release Windows (Mono, Direct3D 12, Built-in pipeline, Gamma), Unity **6000.3.22f1**, Canvas render vào RenderTexture 1280×720; **i7-14700K / RTX 3060**. Mỗi giá trị là trung vị, lấy trung bình hai lần chạy xen kẽ.

UGUI và TMP dùng chữ trơn để đối chứng. **Plain** là VinaGenText với style chỉ có mặt chữ; **Styled** dùng style mặc định gồm gradient, stroke, viền và extrusion.

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

So với phiên bản trước, trên cùng player:

| 200 label | Trước | Hiện tại |
| --- | ---: | ---: |
| Kích hoạt lần đầu, Styled | 12.56 ms | 10.49 ms (−17%) |
| Kích hoạt lại, Styled | 4.55 ms | 1.32 ms (−71%) |
| Chữ cong, đổi màu, Styled | 15.47 ms, 26 MB/frame | 3.79 ms, ~0 cấp phát |
| Chữ cong, đổi góc, Styled | 20.23 ms | 12.06 ms |
| Sửa màu mặt chữ của style dùng chung, Styled | 5.64 ms | 1.47 ms |
| Sửa stop gradient của style dùng chung | 3.84 ms | 0.53 ms |
| Mesh Batch, `Refresh()` mọi label mỗi frame | 0.28 ms | 0.20 ms |

Static Baked vẫn là lựa chọn rẻ nhất cho chữ cố định. VinaGenText Dynamic nhanh hơn TMP khi đổi màu và kích hoạt lại, nhưng chậm hơn khi đổi chữ, kích hoạt lần đầu, layout group và autosize; hiệu ứng hai bên khác nhau nên TMP chỉ để đối chứng. Label Styled tốn render hơn khi đứng yên (gấp ba số đỉnh, cộng shader hiệu ứng). Label đầu tiên trong một process mới còn tốn khoảng **29 + 59 ms** khởi tạo font và shader một lần.

<details>
<summary>Cách đo các chỉ số</summary>
<p>Kích hoạt: SetActive(true) + lần cập nhật Canvas đầu, đo khi đã warm (sau lần chạy đầu trong process). Kích hoạt lại: bật lại label sau khi tắt. Các dòng đổi chữ/màu: thời gian cập nhật Canvas của một frame mà mọi label đều đổi. Frame đứng yên: cả frame Release, gồm render camera. Managed: mức tăng heap Mono khi tắt GC. Số đỉnh và draw call: player Development. Player ẩn cửa sổ nên không báo GPU time; cần profile lại trên thiết bị đích.</p>
<p>Nguồn trong dự án: <code>Documentation/VinaGenTextPerformance/VinaGenText-Comparison-Summary.md</code>.</p>
</details>

[Tiếp theo: Particle & Texture](particles.md)
