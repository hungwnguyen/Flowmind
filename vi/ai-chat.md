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

Tạo key trên trang nhà cung cấp (hoặc bấm **Get API Key** trong Settings) rồi dán vào **API Keys**. Lưu ý: OpenAI cần nạp tiền vào tài khoản trước.

![Cửa sổ Agent Chat](../images/agent-chat.png)

Chat lưu lịch sử và tệp đính kèm, trả lời theo ngôn ngữ bạn viết. Khi tạo chữ cho màn hình hoặc nhãn, hãy nói rõ ngôn ngữ mong muốn.

![AI Provider Settings với provider, model và nhóm API Keys đang đóng](../images/settings-ai.png)

Xem thêm tùy chọn tại [Cài đặt](settings.md).

## Chi phí và dữ liệu

- Chat và tạo ảnh dùng điểm/hạn mức của nhà cung cấp. Các công cụ khác không cần AI.
- Prompt và tệp đính kèm được gửi tới nhà cung cấp.
- Giữ API key bí mật. Không commit file cài đặt chứa key lên Git.

Muốn làm việc từ trợ lý bên ngoài, xem [Tạo từ Claude Code / Codex](create-from-chat.md).
