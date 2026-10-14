# Hỏi đáp & Xử lý sự cố

## Có cần AI không?

Không. Graph, thiết kế UI, chữ và particle đều dùng được không cần AI. Chỉ chat và tạo ảnh mới cần tài khoản AI.

## Hỗ trợ phiên bản Unity và hệ điều hành nào?

**Unity 2022.3 LTS trở lên** trên Windows, macOS hoặc Linux. Công cụ UI và chữ cần thêm uGUI và TextMesh Pro. Xem [Bắt đầu nhanh](getting-started.md).

**Web Designer Miễn phí vĩnh viễn · Free forever**, dùng được khi không cài Unity.

## Lỗi thường gặp

| Vấn đề | Cách xử lý |
| --- | --- |
| Bridge mất kết nối | Bật tại **Open → MCP Bridge**, đợi Unity biên dịch xong. |
| Thiếu `/vina` hoặc `$vina` | Bấm **Install chat skills**, kiểm tra trùng tên rồi mở lại chat dự án. |
| Không có công cụ Canvas | Kiểm tra Unity UI (uGUI) đã được cài. |
| Particle màu hồng | Chạy **Particle System → Repair Materials For Active Pipeline**. |
| Web editor báo xung đột `409` | File đã bị sửa ở nơi khác. Xuất bản nháp rồi tải lại. |
| Không có ảnh được tạo | Kiểm tra thông tin đăng nhập, hạn mức và trạng thái job. |
| Chữ bake bị cũ | Chạy **Bake / Rebuild** trước khi build. |
| Cần đổi chữ đã bake trong game | Dùng **Revert Bake** để về Dynamic. |

## Import Canvas xong là dùng ngay được chưa?

Gần như vậy. Import dựng sẵn object UI, nhưng bạn vẫn cần nối sự kiện cho nút và lưu scene. Nếu thiết kế từ PSD, kiểm tra lại mask và hiệu ứng.

## Dữ liệu đi đâu?

Các editor chạy ngay trên máy bạn. Chỉ khi dùng chat AI hoặc tạo ảnh, prompt và tệp đính kèm mới được gửi tới nhà cung cấp AI. Giữ API key bí mật.

## Đổi ngôn ngữ thế nào?

Bấm **EN / VI** ở phía trên. Lựa chọn sẽ được ghi nhớ.

## Có được phân phối artwork import không?

Chỉ khi giấy phép của ảnh cho phép. Chỉnh sửa ảnh không thay đổi giấy phép. Giữ thông báo giấy phép của toolkit và font khi chia sẻ.
