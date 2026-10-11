# Cài đặt

> Mọi cài đặt của toolkit là ScriptableObject trong `Assets/VinaGen AI Toolkit/Settings/`, có biểu tượng robot.

Mở chúng từ **Tools → VinaGen AI Toolkit → Settings** hoặc từ tab **Settings** của cửa sổ toolkit.

<div class="vg-pair">
  <figure><img src="images/toolkit-settings.png" alt="Tab Settings của cửa sổ toolkit"><figcaption>Tab Settings mở từng asset trong Inspector.</figcaption></figure>
</div>

| Menu | Asset | Cấu hình |
| --- | --- | --- |
| **AI Settings** | `VinaGenCopilotSettings` | Nhà cung cấp, model, thông tin xác thực và tùy chọn tạo ảnh. |
| **Graph Appearance** | `GraphEditorAppearanceSettings` | Giao diện graph editor và chat, tên hiển thị khi bình luận trên web. |
| **Design Content Settings** | `DesignContentEditorSettings` | Kích thước frame, màu, font và nhãn đánh số. |
| **UI Designer Settings** | `VinaGenUIStudioSettings` | Thư mục tài liệu, font, độ phân giải Canvas, lưới bám và phím tắt. |
| **Particle Texture Library** | `VinaGenParticleTextureLibrary` | Catalog, alias, tag, nguồn gốc và metadata chọn texture. |
| **Bundled Particle Library** | `VinaGenBundledParticleLibrary` | Prefab hiệu ứng và ưu tiên chọn tự động. |
| **Particle WebGL Preview Settings** | `VinaGenParticleWebPreviewSettings` | Pipeline, thư mục build, camera, bloom và thông số chụp mặc định. |
| **Text → Settings** (menu Text) | `VinaGenTextSettings` | Mặc định của VinaGenText. |
| **Open Settings Folder** | | Ping thư mục Settings trong cửa sổ Project. |

## Cài đặt cá nhân và dùng chung

Cài đặt được tạo lại tự động trong dự án mới. **Cài đặt cá nhân và thông tin xác thực bị loại** khỏi bản xuất portable; đừng bao giờ commit hay chia sẻ asset chứa khóa.

## Quy ước biểu tượng robot

Mọi asset ScriptableObject lưu trong `Assets/VinaGen AI Toolkit/Settings/` tự nhận biểu tượng robot: postprocessor khi import gán biểu tượng và lần quét lúc khởi động sửa các asset cũ.

Khi mở rộng toolkit với một loại cài đặt mới:

```csharp
[CreateAssetMenu(fileName = "YourSettingsName", menuName = "VinaGen AI Toolkit/Settings/Your Settings Name")]
public sealed class YourSettingsName : ScriptableObject
{
    // các trường cài đặt...
}
```

1. Đặt `fileName` trùng chính xác tên class.
2. Lưu file `.asset` trong `Assets/VinaGen AI Toolkit/Settings/`.
3. Chỉ khi asset buộc phải nằm chỗ khác, thêm type của nó vào `SettingsIconTargetTypes` trong `VinaGenSettingsUtility.cs`.
4. Tạo asset bằng `[CreateAssetMenu]` hoặc `VinaGenSettingsUtility.GetOrCreateAsset<T>` để hook gán biểu tượng chạy.

---
[Tiếp theo: Cấu trúc thư mục](folder-layout.md)
