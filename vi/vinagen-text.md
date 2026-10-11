# VinaGenText

> Component chữ SDF dành cho UI game: gradient mặt chữ, viền, outline ngoài và đổ khối 3D. Chỉnh trên trình duyệt, Inspector hoặc code mà không đụng tới material dùng chung.

## Tính năng

- **Chế độ gradient:** Single, Horizontal, Vertical và Four Corners, với key màu và key alpha (2–8 key mỗi dải), nội suy **Blend (Classic)** hoặc **Fixed**.
- **Hiệu ứng:** Stroke, Outer Outline và 3D Extrusion. Thuộc tính chỉ hiện khi bật; khi tắt, giá trị đã chỉnh vẫn được nhớ.
- **Bố cục:** xuống dòng, tự co cỡ chữ, định dạng rich text, giãn cách, lề, căn lề và uốn cong.
- **Opacity:** làm mờ đồng thời mặt chữ, gradient, viền, outline và đổ khối.

VinaGenText mặc định không có hiệu ứng. **Get Tickets style** áp kiểu mẫu (viền 2, outline 4, đổ khối 5 px).

## Tạo nhãn chữ

- **GameObject → VNT → VinaGenText** thêm một nhãn vào scene.
- Trong UI Designer đặt **Typography → Text type → VinaGenText** rồi import Canvas.

Enum trong JSON là `textRenderer: "text" | "textMeshPro" | "vinaGenText"`. Đổi loại chữ cần import lại.

## Style

Style là ScriptableObject có huy hiệu **S** xanh tím, lưu font, typography và hiệu ứng.

- Style đi kèm: `VinaTextPro/Text Styles/Defaults/`, gồm Default, Plain White, Cream Title, Red to Green, Blue to Purple, Sunset và Red to White.
- Style xuất từ UI Designer: `Assets/VinaGenUI/Text Styles/UI Designs/<tên thiết kế>/`; preset độc lập trong `Presets/`.
- **New** trong Inspector tạo một style độc lập. Thay đổi định dạng trong Inspector cập nhật mọi nhãn dùng style đó (có Undo/Redo). Nội dung chữ và Raycast Target vẫn riêng cho từng đối tượng.

### Preset gradient

Các SO gradient dùng lại được nằm trong `VinaTextPro/Text Gradients/Defaults/`. Trong **Material → Color Gradient**, gán một **Gradient Preset** hoặc để trống để chỉnh màu cục bộ. **Save Gradient as SO** lưu một bản độc lập vào `Text Gradients/Custom/`.

## Font

VinaGenText chỉ nhận font asset của VinaGen (biểu tượng **T** xanh tím). Bốn font dựng sẵn dùng được ngay sau khi import: **LiberationSans, Noto Sans Regular, Montserrat Black, Nunito Regular**, đã có ký tự Latin, tiếng Việt và dấu ba chấm.

### Tạo font

**Font Asset → Select → Create Font**, hoặc chuột phải vào file TTF/OTF trong cửa sổ Project và chọn **Create Vina Font**:

1. Thả **Source Font** (font trong dự án, hoặc file TTF/OTF từ Explorer; file bên ngoài được sao chép vào `VinaTextPro/Fonts/Imported/`).
2. Chọn tên asset, **Output Folder**, cỡ điểm lấy mẫu, padding và độ phân giải atlas.
3. Chọn **Character Set**: *Latin* (mặc định), *Latin And Vietnamese* hoặc *Custom*.
4. Xem trước bằng **Sample Text**, rồi bấm **Create & Apply**.

Ký tự thiếu hoặc không xếp vừa atlas được báo trong Console. Font có sẵn không bao giờ bị ghi đè; tên trùng sẽ nhận đường dẫn khác.

## Code

```csharp
using UnityEngine;
using VinaGen.Text;

public sealed class ScoreLabel : MonoBehaviour
{
    public VinaGenText label;

    public void SetScore(int score)
    {
        label.BeginUpdate();          // gom nhiều thay đổi thuộc tính
        label.text = $"Score: {score}";
        label.opacity = 1f;
        label.EndUpdate();
    }
}
```

Dùng `BeginUpdate()` / `EndUpdate()` khi đổi nhiều thuộc tính cùng lúc.

## Menu Text

| Menu (**Tools → VinaGen AI Toolkit → Text**) | Mục đích |
| --- | --- |
| **Create Default Fonts & Styles** | Tạo lại asset khởi đầu bị thiếu, chạy offline, giữ nguyên GUID. |
| **Organize Fonts** / **Organize Text Styles** | Chạy lại việc sắp xếp thư mục, giữ GUID. |
| **Repair Font & Style Icons** | Gán lại biểu tượng T / S. |
| **Validate Baked Text** / **Delete Unused Baked Text…** | Bảo trì asset chữ đã bake. |
| **Settings** | Asset cài đặt chữ. |

## Hiệu năng

- Nhãn chưa kích hoạt không cấp phát renderer cho tới khi bật; nhãn đang hoạt động dùng lại renderer của mình.
- Các nhãn có cùng atlas/gradient dùng chung một material có đếm tham chiếu.
- Outline và đổ khối vẽ thêm silhouette nên tốn hơn chữ thường; hãy đo trên thiết bị đích với số nhãn hiển thị thực tế.
- VinaGenText là component UI chuyên biệt, không thay thế toàn bộ TMP. Tài nguyên rich text theo tên (font/material/sprite/style) không được hỗ trợ.

## Giấy phép

Engine bố cục đi kèm và một số shader là mã nguồn Unity đã chỉnh sửa, theo **Unity Companion License**. Giữ `Third-Party Notices.txt`, `StandaloneText/Licenses/` và giấy phép font khi phân phối.

---
[Tiếp theo: Particle & Texture](particles.md)
