<div class="vg-hero">
  <div>
    <h1>VinaGen AI Toolkit</h1>
    <p>Một không gian làm việc trong Unity cho luồng game, thiết kế màn hình, chữ có hiệu ứng và particle. Dùng hoàn toàn offline, hoặc kết nối AI của riêng bạn.</p>
  </div>
  <img class="vg-hero-robot" src="images/robot.png" alt="Robot VinaGen">
</div>

<figure class="vg-hero-shot">
  <img src="images/ui-designer.png" alt="UI Designer hiển thị tài liệu UI mẫu với các màn hình Settings, New Cube và Your Score">
  <figcaption>UI Designer với tài liệu mẫu đi kèm, sẵn sàng import vào Unity Canvas.</figcaption>
</figure>

**VinaGen AI Toolkit** là extension cho Unity Editor dành cho game designer và lập trình viên. Toolkit gồm graph logic trực quan, UI Designer chạy trên trình duyệt và import thẳng vào Unity Canvas, bộ hiển thị chữ VinaGenText, công cụ tạo particle gốc cùng thư viện texture offline, trình xem trước particle trên trình duyệt và MCP bridge cục bộ để Claude Code, Codex hay các trợ lý AI khác điều khiển toolkit.

**AI online là tùy chọn.** Graph, thiết kế UI, chữ, tạo texture offline và dựng particle đều chạy được mà không cần gói AI. Tài khoản nhà cung cấp, khóa API, mạng và chi phí sử dụng tách biệt với asset này.

## Chọn không gian làm việc

<div class="vg-workspaces">
  <a class="vg-ws vg-ws--chat" href="#/vi/ai-chat"><strong>Agent Chat</strong><span>Suy nghĩ, hỏi và sáng tạo với nhà cung cấp AI của bạn.</span></a>
  <a class="vg-ws vg-ws--flow" href="#/vi/graphs"><strong>Flow Editor</strong><span>Lên luồng game và phác thảo wireframe màn hình.</span></a>
  <a class="vg-ws vg-ws--ui" href="#/vi/ui-designer"><strong>UI Designer</strong><span>Layer UI, PSD/ảnh và import Canvas.</span></a>
  <a class="vg-ws vg-ws--text" href="#/vi/vinagen-text"><strong>VinaGenText</strong><span>Gradient, viền, outline và đổ khối 3D cho chữ trong game.</span></a>
  <a class="vg-ws vg-ws--fx" href="#/vi/particles"><strong>Particle</strong><span>Texture gốc, prefab hiệu ứng và xem trước trên trình duyệt.</span></a>
  <a class="vg-ws vg-ws--bridge" href="#/vi/mcp-bridge"><strong>MCP Bridge</strong><span>Để Claude Code hoặc Codex làm việc ngay trong dự án.</span></a>
</div>

## Khái niệm chính

- **Flow graph (`MockFlowGraph`)**: logic game dưới dạng các bước, điều kiện, nhánh và chuyển tiếp. Không cần FlowCanvas hay NodeCanvas.
- **Design content graph (`DesignContentGraph`)**: wireframe màn hình gồm frame, nội dung chữ, ô ảnh và chú thích đánh số.
- **Tài liệu UI (`VinaGenUIDocument`)**: thiết kế UI game nhiều layer, import được vào Unity Canvas.
- **Thư viện texture và thư viện particle**: artwork gốc và prefab hiệu ứng đã được phân loại, dùng để dựng particle system.
- **MCP bridge**: HTTP server chạy trên localhost bên trong Unity Editor, mở các action của toolkit cho trợ lý bên ngoài.
- **Skill**: các file hướng dẫn ngắn trong `Skills/`, mỗi tác vụ AI được chuyển tới đúng một quy trình.

## Yêu cầu

| Mục | Yêu cầu |
| --- | --- |
| Unity | Đã kiểm chứng trên **Unity 6000.3.22f1**. Hãy kiểm tra trước khi dùng phiên bản khác. |
| Tính năng lõi | Chỉ cần module engine/Editor của Unity. Không cần Python, Node.js, npm, CDN hay package bên thứ ba trên Asset Store. |
| UI Designer, công cụ Canvas, chữ | **Unity UI (uGUI)** và **TextMesh Pro** chính thức (Unity 6 đã có TMP trong uGUI). |
| Hiển thị particle | Shader tương thích Built-in đi kèm; adapter URP/HDRP tự bật khi dự án có các pipeline này. |
| Xem trước particle WebGL | Có sẵn player dựng sẵn. Xuất bundle prefab gốc cần module **WebGL Build Support** của Unity Hub. |
| AI chat / tạo ảnh | Tùy chọn: tài khoản nhà cung cấp, API key của bạn và chi phí phát sinh. |

> Import toolkit không tự cài package hay đổi render pipeline của bạn.

## Điểm truy cập chính

Mọi menu nằm trong **Tools → VinaGen AI Toolkit**.

| Menu | Mở ra |
| --- | --- |
| **Open** | Cửa sổ toolkit với các tab Home, Create, Particles, MCP Bridge và Settings. |
| **Show Welcome Window** | Màn hình chào với lối tắt tới chat, editor và công cụ particle. |
| **Chat** | Agent Chat có lịch sử hội thoại và tệp đính kèm. |
| **OpenGraphEditor** | Editor graph logic gốc kèm chat hỗ trợ phát triển Unity. |
| **Open Design Content Editor** | Editor design content (wireframe) gốc. |
| **Editors → Open Flow Editor** | Không gian Flow/Design trên trình duyệt. |
| **Editors → Open UI Designer** | UI Designer trên trình duyệt. |
| **Particle System → Authoring Tools** | Tạo, kiểm tra, đăng ký texture, phân tích prefab và review FX. |
| **MCP → Control Panel / Start Bridge / Stop Bridge** | MCP bridge cục bộ. |
| **Text → …** | Font, style và lệnh bảo trì VinaGenText. |
| **Settings → …** | Tất cả asset cài đặt của toolkit. |

**Tiếp theo:** [Bắt đầu nhanh](getting-started.md)
