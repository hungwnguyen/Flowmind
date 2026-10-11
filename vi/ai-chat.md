# AI Chat & Nhà cung cấp

> AI là lớp **tùy chọn** bên trên toolkit. Mọi tính năng offline vẫn chạy khi không có nó.

## Agent Chat

Mở **Tools → VinaGen AI Toolkit → Chat** (hoặc **Open AI Chat** trong cửa sổ Welcome). Agent Chat lưu lịch sử hội thoại, phiên làm việc, tệp đính kèm và trò chuyện với nhà cung cấp bạn đã chọn.

<div class="vg-pair">
  <figure><img src="images/agent-chat.png" alt="Cửa sổ VinaGen Agent Chat với các tab Chat, History và Settings"><figcaption>Agent Chat: trạng thái bridge hiện ở góc trên bên phải.</figcaption></figure>
</div>

- Trong chat của toolkit, trợ lý tự giới thiệu là **VinaGen**.
- Câu trả lời theo ngôn ngữ tin nhắn gần nhất: tiếng Anh → tiếng Anh, tiếng Việt (có hoặc không dấu) → tiếng Việt có dấu đầy đủ.
- Mô tả graph, nhãn và metadata được sinh ra mặc định là **tiếng Anh** ngắn gọn; chữ của bạn và yêu cầu bản địa hóa rõ ràng được giữ nguyên.

Graph editor và design editor gốc cũng có panel chat cho **Ask** (gợi ý và code có thể sao chép), sinh graph, chỉnh white-frame và yêu cầu ảnh.

## Cấu hình nhà cung cấp

1. Mở **Tools → VinaGen AI Toolkit → Settings → AI Settings** (hoặc **Set up AI** trong cửa sổ Welcome).
2. Chọn một nhà cung cấp có trong danh sách, ví dụ **Gemini, OpenAI, Poe, Claude** hoặc **Cursor**, rồi nhập thông tin xác thực của bạn.
3. Chọn model mà tài khoản của bạn dùng được.

Tạo ảnh hỗ trợ **Gemini, OpenAI** và **Poe**. Tạo texture particle qua Poe đọc khóa từ biến môi trường `POE_API_KEY` hoặc ô mật khẩu sẽ tự xóa khi đóng cửa sổ.

> Model, hạn mức và giá do nhà cung cấp quyết định. Asset này không kèm credit.

## Thông tin xác thực

- Thông tin xác thực là cấu hình **cá nhân, chỉ trong Editor**, không bao giờ là component trong scene.
- Đừng commit file cài đặt chứa khóa và đừng đặt khóa trong source, asset, payload MCP hay manifest.
- Bộ xuất portable loại trừ cài đặt cá nhân và artwork cá nhân.

## Dữ liệu nào được gửi đi

Yêu cầu online có thể gồm prompt, file/ảnh bạn chủ động đính kèm, ngữ cảnh graph/design đang chọn và trích đoạn dự án được ghép cho quy trình đó. Trợ lý MCP được kết nối nhận kết quả/ngữ cảnh của các tool mà nó gọi.

Toolkit **không huấn luyện model và không gửi telemetry toàn dự án**. Chính sách lưu giữ và huấn luyện thuộc về tài khoản nhà cung cấp của bạn; hãy xem kỹ trước khi gửi nội dung nhạy cảm, hoặc dùng quy trình offline.

---
[Tiếp theo: Tạo từ Claude Code / Codex](create-from-chat.md)
