# Hỏi đáp & Xử lý sự cố

## Có cần AI không?

Chỉnh graph, thiết kế UI, text và công cụ particle offline dùng được khi chưa đăng ký AI. Chat và tạo ảnh qua nhà cung cấp cần tài khoản của bạn.

## Dự án dùng Unity nào?

**Unity 6000.3.22f1**. Công cụ UI/text dùng Unity UI và tài nguyên TMP chính thức. Xuất bundle particle cần **WebGL Build Support**.

## Lỗi thường gặp

| Vấn đề | Cách xử lý |
| --- | --- |
| Bridge mất kết nối | Bật tại **Open → MCP Bridge**, đợi Unity biên dịch xong. |
| Thiếu `/vina` hoặc `$vina` | Bấm **Install chat skills**, kiểm tra trùng tên rồi mở lại chat dự án. |
| Không có công cụ Canvas | Kiểm tra Unity UI (uGUI) đã được cài. |
| Particle màu hồng | Chạy **Particle System → Repair Materials For Active Pipeline**. |
| Web editor báo xung đột `409` | Xuất bản nháp hoặc nạp lại asset mới nhất từ Unity. |
| Không có ảnh được tạo | Kiểm tra thông tin đăng nhập, hạn mức và trạng thái job. |
| Chữ bake cũ hoặc không tương thích | Chạy **Bake / Rebuild** trước khi build. |
| Cần đổi nội dung chữ baked lúc chạy | Dùng **Revert Bake** để trở lại Dynamic. |

## Import Canvas xong là dùng ngay được chưa?

Import tạo object UI và hỗ trợ Undo. Bạn cần nối sự kiện Button, tự lưu scene và kiểm tra lại mask, blend mode, hiệu ứng của PSD.

## Dữ liệu đi đâu?

Editor cục bộ dùng server localhost của Unity. Yêu cầu AI online có thể gửi prompt, tệp đính kèm và ngữ cảnh tới nhà cung cấp; trợ lý MCP nhận kết quả công cụ được yêu cầu. Giữ thông tin đăng nhập riêng.

## Đổi ngôn ngữ thế nào?

Dùng **EN / VI**; lựa chọn được lưu. Chọn tự động dựa vào múi giờ và có thể hỏi geojs.io về quốc gia khi dùng múi giờ UTC+7 chung.

## Có được phân phối artwork import không?

Kiểm tra giấy phép của ảnh. Xoay và làm nét không cấp thêm quyền phân phối. Giữ thông báo giấy phép toolkit và font khi phân phối nội dung.
