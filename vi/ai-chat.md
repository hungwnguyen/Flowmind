# AI Chat & Nhà cung cấp

Dùng Agent Chat để hỏi và tạo nội dung bằng tài khoản AI của bạn.

## Thiết lập

1. Mở **Tools → VinaGen AI Toolkit → Settings → AI Settings**.
2. Chọn nhà cung cấp, nhập thông tin đăng nhập.
3. Chọn model mà tài khoản của bạn dùng được.
4. Mở **Tools → VinaGen AI Toolkit → Chat**.

![Cửa sổ Agent Chat](../images/agent-chat.png)

Chat lưu phiên làm việc, lịch sử và tệp đính kèm. Trợ lý trả lời theo ngôn ngữ tin nhắn mới nhất. Khi tạo nội dung màn hình hoặc nhãn graph, hãy nói rõ ngôn ngữ đầu ra.

## Chi phí và dữ liệu

Chat và tạo ảnh qua nhà cung cấp dùng hạn mức hoặc điểm của tài khoản bạn. Chỉnh graph, thiết kế UI và công cụ particle offline vẫn dùng được khi chưa kết nối nhà cung cấp.

Yêu cầu online có thể gửi prompt, tệp đính kèm và ngữ cảnh của thao tác đó. Giữ API key trong cấu hình Editor cá nhân; loại cấu hình chứa key khỏi Git và package chia sẻ.

Tạo ảnh particle tại **Authoring Tools → Poe Image** dùng ô mật khẩu tạm thời hoặc biến môi trường `POE_API_KEY`.

Muốn làm việc từ trợ lý bên ngoài, xem [Tạo từ Claude Code / Codex](create-from-chat.md).
