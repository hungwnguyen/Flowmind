# AI Chat & Nhà cung cấp

Dùng Agent Chat để hỏi và tạo nội dung bằng tài khoản AI của bạn.

## Thiết lập

1. Mở **Tools → VinaGen AI Toolkit → Open → Settings → AI Provider Settings**.
2. Chọn nhà cung cấp, nhập thông tin đăng nhập.
3. Chọn model mà tài khoản của bạn dùng được.
4. Mở **Tools → VinaGen AI Toolkit → Chat**.

### Lấy API key

| Nhà cung cấp | Trang lấy key | Biến môi trường |
| --- | --- | --- |
| Gemini | [Google AI Studio → API keys](https://aistudio.google.com/app/apikey) | `GEMINI_API_KEY` hoặc `GOOGLE_API_KEY` |
| OpenAI | [OpenAI Platform → API keys](https://platform.openai.com/api-keys) | `OPENAI_API_KEY` |
| Poe | [Poe → API key](https://poe.com/api_key) | `POE_API_KEY` |

Đăng nhập, tạo key rồi dán vào nhóm **API Keys** của nhà cung cấp đó. Nút **Get API Key** trong Settings cũng mở trang của nhà cung cấp. OpenAI tính phí theo lượng dùng, cần nạp tiền trước khi gọi API.

![Cửa sổ Agent Chat](../images/agent-chat.png)

Chat lưu phiên làm việc, lịch sử và tệp đính kèm. Trợ lý trả lời theo ngôn ngữ tin nhắn mới nhất. Khi tạo nội dung màn hình hoặc nhãn graph, hãy nói rõ ngôn ngữ đầu ra.

![AI Provider Settings với provider, model và nhóm API Keys đang đóng](../images/settings-ai.png)

Mở **AI Chat** để chọn **Active Provider**, rồi **Refresh Models / Select Model** hoặc **Custom Model**. Key nằm trong **API Keys**; ảnh giữ nhóm này đóng. Xem [Cài đặt](settings.md) để hiểu thêm phần chat, image và particle output.

## Chi phí và dữ liệu

Chat và tạo ảnh qua nhà cung cấp dùng hạn mức hoặc điểm của tài khoản bạn. Chỉnh graph, thiết kế UI và công cụ particle offline vẫn dùng được khi chưa kết nối nhà cung cấp.

Yêu cầu online có thể gửi prompt, tệp đính kèm và ngữ cảnh của thao tác đó. Giữ API key trong cấu hình Editor cá nhân; loại cấu hình chứa key khỏi Git và package chia sẻ.

Tạo ảnh particle tại **Authoring Tools → Poe Image** dùng ô mật khẩu tạm thời hoặc biến môi trường `POE_API_KEY`.

Muốn làm việc từ trợ lý bên ngoài, xem [Tạo từ Claude Code / Codex](create-from-chat.md).
