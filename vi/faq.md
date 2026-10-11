# Hỏi đáp & Xử lý sự cố

## Chung

### Hỏi: Tôi có cần gói AI trả phí không?

**Đáp:** Không. Graph, UI Designer, VinaGenText, tạo texture offline và dựng particle đều chạy không cần AI. Chỉ AI chat và tạo ảnh mới cần nhà cung cấp, và bạn dùng tài khoản cùng thông tin xác thực của riêng mình.

### Hỏi: Hỗ trợ những phiên bản Unity nào?

**Đáp:** Toolkit đã được kiểm chứng trên **Unity 6000.3.22f1**. Hãy thử các phiên bản khác trong dự án của bạn trước khi dựa vào chúng.

### Hỏi: Tôi có cần FlowCanvas, NodeCanvas, Python hay Node.js không?

**Đáp:** Không. Mock graph đã đi kèm; adapter FlowCanvas/NodeCanvas chỉ bật khi bạn đã sở hữu và cài sẵn chúng. Web editor chạy bên trong Unity; Node.js chỉ dùng cho các test tùy chọn của nhà phát triển.

### Hỏi: Toolkit có đổi render pipeline hay tự cài package không?

**Đáp:** Không. Import không bao giờ cài package hay đổi pipeline. Lần import tự động duy nhất là TMP Essential Resources từ package chính thức, khi UI Designer cần.

---

## Xử lý sự cố

| Vấn đề | Cách khắc phục |
| --- | --- |
| **Bridge không khả dụng** | Bật trong **Open → MCP Bridge**, kiểm tra địa chỉ và chờ biên dịch xong. |
| **Không tìm thấy `/vina`** | Xem trạng thái trong tab MCP Bridge, bấm **Install chat skills**, rồi mở lại chat của dự án. Lệnh trùng tên do người dùng tạo không bao giờ bị thay; hãy đổi tên nó để VinaGen dùng `/vina`. |
| **Không có công cụ Canvas** | Cài package Unity UI (uGUI) tùy chọn, hoặc dùng các công cụ lõi. |
| **Particle bị hồng** | Chạy **Particle System → Repair Materials For Active Pipeline** và xem lỗi shader. |
| **Ô atlas trống** | Kiểm tra lưới, khung đầu tiên và số khung khai báo; bỏ qua ô padding đen. |
| **Không có ảnh chụp lúc khởi động** | Đúng như thiết kế: ảnh chỉ chụp khi được yêu cầu. Gọi `capture()` với thời điểm cụ thể. |
| **Không xuất được bundle WebGL** | Cài **WebGL Build Support** qua Unity Hub. |
| **Không có ảnh được tạo** | Kiểm tra trạng thái nhà cung cấp/job, credit tài khoản và model khả dụng. |
| **Web editor báo xung đột 409** | Asset đã đổi ở nơi khác. Bản nháp vẫn được giữ; hãy tải lại từ Unity hoặc xuất ra trước khi ghi đè. |
| **Web editor mất kết nối sau khi sửa script** | Chờ biên dịch xong; token phiên tự làm mới một lần. Tải lại trang nếu cần, bản nháp sẽ được khôi phục. |

---

## UI Designer

### Hỏi: Vì sao hiệu ứng trong PSD hiển thị không đúng?

**Đáp:** Import PSD hỗ trợ layer pixel RGB 8-bit, nhóm, độ mờ và ẩn/hiện. Mask, blend mode, layer effect và smart object cần kiểm tra bằng mắt; file PSB, CMYK và 16/32-bit không được hỗ trợ.

### Hỏi: Import Canvas có lưu scene không?

**Đáp:** Không. Import tạo đối tượng trong một nhóm Undo và để việc lưu cho bạn.

### Hỏi: Sự kiện click của nút đã được nối chưa?

**Đáp:** Chưa. Nút nhận Image của nó làm target Graphic; sự kiện gameplay do bạn tự nối.

---

## Quyền riêng tư

### Hỏi: Dữ liệu nào rời khỏi máy tôi?

**Đáp:** Chỉ những gì cần cho quy trình online bạn khởi động: prompt, file bạn đính kèm, ngữ cảnh graph/design đang chọn và trích đoạn được ghép cho yêu cầu đó. Trợ lý MCP được kết nối nhận kết quả của các tool mà nó gọi. Toolkit không huấn luyện model và không gửi telemetry toàn dự án. Giữ bridge ở máy cục bộ và tắt khi xong việc.

### Hỏi: Trang tài liệu này chọn ngôn ngữ thế nào?

**Đáp:** Lựa chọn bằng nút **EN / VI** luôn được ưu tiên và được nhớ trên trình duyệt. Nếu chưa chọn, trang dựa vào vị trí: múi giờ Việt Nam hiển thị tiếng Việt, nơi khác hiển thị tiếng Anh. Với múi giờ UTC+7 dùng chung nhiều nước (Windows báo Hà Nội là `Asia/Bangkok`), trang tra mã quốc gia từ địa chỉ IP qua geojs.io; nếu không tra được thì dùng ngôn ngữ của trình duyệt.

---

## Giấy phép

Noto Sans dùng SIL Open Font License 1.1, và một phần VinaGenText dựa trên mã nguồn Unity theo Unity Companion License; xem `Third-Party Notices.txt`. Công thức texture gốc không dùng artwork bên thứ ba. Xoay hay làm nét artwork bên thứ ba khi import **không** cấp quyền phân phối lại; artwork import mặc định bị loại khỏi bản xuất.
