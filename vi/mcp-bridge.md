# MCP Bridge

MCP Bridge cho phép trợ lý AI lập trình (Claude Code, Codex hoặc ứng dụng hỗ trợ MCP khác) **làm việc trực tiếp trong Unity Editor đang mở của bạn**. Thay vì chỉ trả lời bằng chữ, trợ lý có thể tạo màn hình UI, vẽ sơ đồ logic, tạo hiệu ứng particle, sắp xếp scene, sửa script C#, biên dịch và chạy test — rồi đọc lại kết quả để tự kiểm tra.

## MCP Bridge là gì?

**MCP** (Model Context Protocol) là chuẩn mở để trợ lý AI gọi "công cụ" (tool) do phần mềm khác cung cấp. Mỗi tool là một thao tác có tên và tham số rõ ràng, ví dụ "tạo GameObject", "đọc tài liệu UI", "biên dịch script".

**MCP Bridge** là một server nhỏ chạy bên trong Unity Editor. Nó đưa các tính năng của VinaGen AI Toolkit và của Unity Editor ra thành tool MCP, để trợ lý gọi được.

Cách hoạt động:

1. Bạn viết yêu cầu bằng lời thường trong chat của trợ lý.
2. Trợ lý chọn tool phù hợp và gửi lệnh qua MCP (HTTP trên localhost) tới bridge.
3. Bridge thực hiện thao tác trong Unity Editor và trả kết quả.
4. Trợ lý đọc kết quả (lỗi biên dịch, ảnh chụp, diff…), kiểm tra và sửa tiếp nếu cần.

Ví dụ, bạn gõ trong Claude Code:

```text
/vina tạo màn hình shop từ mẫu có sẵn, đổi tiêu đề thành "Cửa hàng", rồi đưa vào scene hiện tại
```

Trợ lý sẽ tự tìm mẫu UI, tạo tài liệu mới, sửa chữ, kiểm tra trước thay đổi, lưu, rồi import thành Canvas trong scene. Mọi thao tác đều chạy trong Unity của bạn và có thể Undo.

**Bridge không cần:** server Node/Python, npm, tài khoản Figma hay khóa API AI. Chỉ khi bạn yêu cầu AI *sinh nội dung* (ví dụ vẽ ảnh bằng nhà cung cấp AI) thì mới cần [nhà cung cấp đã cấu hình](ai-chat.md).

## Kết nối

1. Mở **Tools → VinaGen AI Toolkit → Open → MCP Bridge**.
2. Bấm **Start**.
3. Mở lại chat dự án trong Claude Code hoặc Codex. Dùng `/vina` (Claude Code), `$vina` (Codex), hoặc yêu cầu trực tiếp server MCP `vinagen` đã kết nối.

**Bridge URL** mặc định là `http://127.0.0.1:8888/`; **endpoint MCP** là `http://127.0.0.1:8888/mcp`. Giữ Unity mở trong suốt quá trình làm việc. Khi Unity biên dịch/reload script, bridge có thể mất kết nối vài giây; trợ lý chỉ cần thử lại khi Unity sẵn sàng.

![Tab MCP Bridge đang Online, URL và lệnh chat](../images/toolkit-bridge.png)

| Nút / trạng thái | Ý nghĩa |
| --- | --- |
| **Online** | Bridge đang chạy và nhận yêu cầu. |
| **Install chat skills** | Cài lại lệnh `/vina`, `$vina` và đăng ký kết nối MCP cho dự án. Dùng khi lệnh chat không hoạt động. |
| **Reset to default** | Trả URL về mặc định. |

Toolkit tự cài các mục sau vào dự án, giữ nguyên skill riêng của bạn và các server MCP khác:

| Trợ lý | File lệnh chat | Kết nối MCP |
| --- | --- | --- |
| Claude Code | `.claude/skills/vina/SKILL.md` | `.mcp.json` → `mcpServers.vinagen` |
| Codex | `.agents/skills/vina/SKILL.md` | `.codex/config.toml` → `[mcp_servers.vinagen]` |

Kết nối `vinagen` bạn đã tự chỉnh được giữ nguyên. Mục HTTP loopback hiện có cập nhật theo URL bridge. Nếu cấu hình không hợp lệ hoặc đăng ký bị bỏ qua, xem kết quả cài đặt rồi chỉnh kết nối của dự án đó.

Với ứng dụng MCP khác, thêm server HTTP tên `vinagen`, dùng URL bridge đang hiển thị kèm `/mcp`. Cách thêm server tùy từng ứng dụng; xem tài liệu của ứng dụng bạn dùng.

## Bridge làm được gì?

Bạn không cần nhớ tên tool: chỉ cần mô tả việc muốn làm, trợ lý sẽ chọn tool phù hợp (xem phần **Tìm đúng công cụ trước** bên dưới). Các bảng dưới đây giúp bạn biết **có thể yêu cầu những gì**.

### Unity Editor

Các tool điều khiển chính Unity Editor, tương tự thao tác bạn làm bằng chuột trong Hierarchy, Inspector và Project.

| Tool | Chức năng | Ví dụ yêu cầu |
| --- | --- | --- |
| `manage_scene` | Tạo, mở, lưu, đóng scene; xem cây Hierarchy theo trang; đọc Build Settings; kiểm tra scene. Không bao giờ bỏ thay đổi chưa lưu của scene đang mở. | "Tạo scene Level1 và lưu vào Assets/Scenes" |
| `find_gameobjects` | Tìm GameObject trong scene đang mở theo tên, đường dẫn, tag, layer, loại component hoặc instance ID. | "Tìm mọi object có Rigidbody" |
| `manage_gameobject` | Tạo (khối cơ bản hoặc từ prefab), sửa, xóa, nhân bản, di chuyển, xoay GameObject; thêm/bớt component khi sửa. Mỗi thay đổi là một bước Undo. | "Tạo một cube ở vị trí (0, 1, 0) và xoay 45°" |
| `manage_components` | Thêm, xóa, đọc hoặc đặt giá trị thuộc tính component. Nhận số, vector `[x,y,z]`, màu `#FF8800`, enum theo tên, tham chiếu asset theo đường dẫn/GUID. | "Đặt mass của Rigidbody trên Player thành 2" |
| `manage_prefabs` | Tạo prefab từ GameObject, xem thông tin/cấu trúc, sửa nội dung prefab không cần mở, mở/lưu/đóng Prefab Mode, áp dụng hoặc hủy override, unpack. | "Biến object Enemy thành prefab" |
| `manage_asset` | Tìm, xem, tạo (thư mục, material, ScriptableObject…), sửa (shader, màu, texture của material; trường ScriptableObject; cài đặt import), nhân bản, di chuyển, đổi tên, import lại, xóa (đưa vào thùng rác hệ điều hành). | "Tạo material màu đỏ tên EnemyMat" |
| `manage_script` | Tạo, đọc, ghi đè, sửa một phần hoặc xóa script C# trong `Assets/`. Mỗi lần ghi trả mã `sha256` để lần ghi sau không đè mất thay đổi của người khác. | "Viết script PlayerController di chuyển bằng phím WASD" |
| `compile_scripts` | Biên dịch C# và báo lỗi/cảnh báo kèm file, dòng, cột, cùng lỗi Console mới phát sinh. Kết quả vẫn còn sau khi Unity reload script. | "Biên dịch và sửa hết lỗi" |
| `read_console` | Đọc, đếm hoặc xóa log trong cửa sổ Console (mặc định lấy lỗi và cảnh báo). | "Console đang có lỗi gì?" |
| `manage_editor` | Xem trạng thái Editor, thông tin dự án; đọc/đặt selection; Play, Pause, Stop; Undo, Redo; đổi công cụ đang chọn; thêm/xóa tag và layer. | "Thêm layer tên Enemy rồi bấm Play" |
| `execute_menu_item` | Chạy một lệnh menu Unity theo đường dẫn (ví dụ `Assets/Refresh`) hoặc tìm lệnh menu có sẵn. Lệnh thoát Unity bị chặn. | "Chạy Assets/Refresh" |
| `run_tests` / `get_test_job` | Chạy test EditMode/PlayMode và đọc kết quả: số test đạt/lỗi, thông báo lỗi và stack trace. Cần package Unity Test Framework. | "Chạy toàn bộ test EditMode" |
| `inspect_game_project` | Kiểm tra (chỉ đọc) một thư mục game đã lưu: prefab, cấu trúc scene, script bị thiếu, tham chiếu bị đứt. | "Kiểm tra thư mục Assets/MyGame có tham chiếu hỏng không" |

### Tài liệu UI (UI Designer)

Tài liệu UI là asset lưu thiết kế màn hình game (layer, chữ, ảnh, nút) của [UI Designer chạy qua Unity](ui-designer.md). Trợ lý có thể tạo, sửa và đưa tài liệu này vào scene.

| Tool | Chức năng | Ví dụ yêu cầu |
| --- | --- | --- |
| `list_ui_documents` | Tìm mẫu UI đi kèm để dùng làm điểm bắt đầu. | "Có mẫu màn hình shop nào không?" |
| `create_ui_document` | Tạo tài liệu UI mới: bảng trống, bản sao từ mẫu, hoặc từ JSON đầy đủ. Chạy thử trước khi tạo. | "Tạo màn hình menu chính từ mẫu" |
| `read_ui_document` | Đọc toàn bộ tài liệu UI đã lưu cùng `revision` (mã phiên bản) trước khi sửa. | — |
| `patch_ui_document` | Sửa có mục tiêu: di chuyển, đổi kiểu, thêm, xóa layer. Luôn xem trước diff rồi mới ghi. | "Đổi màu nút Play sang xanh lá" |
| `refactor_ui_layers` | Đặt lại tên layer theo nội dung (`btn_`, `txt_`, `icon_`, `img_`, `bg_`, `panel_`, `popup_`), đánh dấu nút Button và đưa nhãn/icon vào trong nút. | "Chuẩn hóa tên layer màn hình Shop" |
| `save_ui_document` | Lưu toàn bộ tài liệu UI kèm revision hiện tại. | — |
| `import_ui_canvas` | Đưa tài liệu UI vào scene thành Canvas uGUI (có Undo). | "Đưa màn hình Shop vào scene" |
| `import_ui_toolkit` | Xuất tài liệu UI thành UXML + USS + UIDocument cho UI Toolkit. | "Xuất màn hình Shop sang UI Toolkit" |
| `render_ui_web_demo` | Hiển thị bản nháp UI trên trình duyệt đi kèm mà không lưu. | "Cho tôi xem trước" |
| `capture_ui_web_screens` / `inspect_ui_web_demo` | Chụp PNG từng màn hình để trợ lý tự xem lại hình; theo dõi trạng thái chụp. | "Chụp lại màn hình để kiểm tra" |
| `inspect_ui_studio_settings` | Xem font, preset chữ, phím tắt và thư mục asset đã đăng ký. | "Dự án có những font nào?" |

### Đọc ngữ cảnh tài liệu

Các tool này giúp trợ lý **hiểu bạn đang làm gì** trước khi sửa, ví dụ bạn đang chọn layer nào trong trình duyệt.

| Tool | Chức năng |
| --- | --- |
| `get_web_editor_context` | Các tab editor trên trình duyệt do Unity mở: đang chọn gì, vùng nhìn, revision đã lưu, phiên bản bản nháp và có thay đổi chưa lưu không. |
| `get_document_metadata` | Dàn ý gọn của tài liệu Flow, Design hoặc UI (danh sách layer/node). |
| `get_node_context` | Chi tiết các node/layer được chọn, lớp cha và các kết nối ra ngoài. |
| `get_document_styles` | Style đang dùng và node nào dùng style đó. |

### Flow graph và Design graph

[Flow graph](graphs.md) vẽ logic game (bước, điều kiện, nhánh). Design graph ("white frame") phác thảo bố cục và nội dung màn hình.

| Tool | Chức năng | Ví dụ yêu cầu |
| --- | --- | --- |
| `create_block_diagram` | Tạo Flow graph từ mô tả: luồng chơi, nhiệm vụ, tutorial, máy trạng thái. | "Tạo flow đăng nhập có nhánh thành công/thất bại" |
| `fix_block_diagram` | Sửa hoặc cập nhật Flow graph đã có. | "Thêm bước quên mật khẩu vào flow đăng nhập" |
| `import_mock_flow_graph` | Ghi Flow graph có cấu trúc (JSON hoặc dạng văn bản) mà không cần nhà cung cấp AI. | — |
| `create_white_frame` | Tạo Design graph: khung màn hình kèm chữ và bố cục. | "Phác thảo màn hình cài đặt" |
| `update_white_frame` | Cập nhật Design graph đã có. | "Thêm mục âm lượng vào khung cài đặt" |
| `check_white_frame` | Xem lại khung và viết mô tả thiết kế cho từng phần. | "Mô tả chi tiết khung màn hình shop" |
| `patch_design_content_graph` | Sửa có mục tiêu các node trong Design graph, không cần nhà cung cấp AI. | — |

### Hiệu ứng particle và texture

Xem thêm [Particle & Texture](particles.md) và [Web Particle](webgl-preview.md).

| Tool | Chức năng | Ví dụ yêu cầu |
| --- | --- | --- |
| `plan_particle_system` | Chuyển mô tả hiệu ứng thành kế hoạch (thời lượng, số hạt, chất lượng) mà chưa tạo asset. | "Lên kế hoạch hiệu ứng nổ nhỏ cho mobile" |
| `create_particle_system` | Tạo hiệu ứng particle (xem trên web, object trong scene hoặc prefab) từ mô tả. | "Tạo hiệu ứng lửa xanh lặp lại" |
| `patch_particle_system` | Chỉnh module/texture của hiệu ứng có sẵn; xem trước rồi mới ghi. | "Làm khói tan chậm hơn" |
| `review_particle_system` | Chạy hiệu ứng trong Play Mode hoặc WebGL, chụp ảnh các thời điểm để trợ lý tự đánh giá. | "Kiểm tra hiệu ứng vừa tạo" |
| `list_particle_templates` / `list_particle_prefabs` | Liệt kê mẫu hiệu ứng và prefab particle có thể dùng lại. | "Có mẫu hiệu ứng chém nào không?" |
| `repair_particle_materials` | Sửa material particle cho đúng render pipeline (ví dụ hết bị màu hồng trên URP). | "Hiệu ứng bị hồng, sửa giúp" |
| `list_particle_textures` / `inspect_particle_texture` | Tìm và xem texture trong thư viện texture particle. | "Tìm texture tia lửa" |
| `audit_particle_textures` | Chẩn đoán texture: nhiễu, bị cắt viền, hình dạng, kênh alpha. | "Kiểm tra texture khói có lỗi alpha không" |
| `import_particle_textures` / `scan_and_add_textures` | Nhập ảnh có sẵn thành texture particle; quét thư mục và đăng ký texture. | "Thêm các texture trong thư mục FX của tôi" |

### Ảnh và pixel art

| Tool | Chức năng | Ví dụ yêu cầu |
| --- | --- | --- |
| `create_pixel_image` | Tạo sprite hoặc icon pixel art. | "Vẽ icon đồng xu 16×16" |
| `generate_image_texture` | Tạo ảnh/texture bằng công cụ ảnh của trợ lý hoặc nhà cung cấp đã cấu hình. | "Tạo hình nền rừng cho menu" |
| `import_generated_image` | Đưa ảnh trợ lý vừa tạo vào dự án. | — |

### Quy trình nhiều bước

Một số việc không phải một tool mà là **hướng dẫn phối hợp nhiều tool**, ví dụ tạo cả game chơi được (scene, prefab, cấu hình chỉnh được, code dễ bảo trì), nhập file Photoshop PSD, hoặc tối ưu hiệu năng hiệu ứng. Khi bạn yêu cầu những việc này, trợ lý đọc hướng dẫn tương ứng rồi gọi các tool ở trên theo thứ tự.

## Tìm đúng công cụ trước

Bridge có hàng chục tool. Để trợ lý không phải đọc hết, mọi yêu cầu bắt đầu bằng `vinagen_find`: mô tả việc cần làm bằng lời thường, bridge trả về tool phù hợp nhất, tham số cần điền và hướng dẫn liên quan. Hỗ trợ tiếng Anh và tiếng Việt, kể cả không dấu.

```json
{"query":"đổi tên layer UI và gắn nhãn button"}
```

Kết quả có `matches` được xếp hạng, `call`, `inputSchema` riêng của kết quả tốt nhất và đường dẫn một `guide`. Thêm `guide:true` để nhận nội dung hướng dẫn khi trợ lý không đọc được file dự án. Dùng `name` để tra đúng tên tool/action:

```json
{"name":"patch_ui_document","guide":true}
```

`limit` từ 1–10 (mặc định 5); `schema` mặc định true. Yêu cầu rỗng liệt kê tính năng theo nhóm. Quy trình chỉ có hướng dẫn, như tạo cả game, trả `guideOnly:true` và không có lệnh MCP; làm theo guide để phối hợp các công cụ.

Gọi tool được trả về với đúng các trường trong schema. Với `manage_vinagen_ai_toolkit` (tool chung chứa các tính năng graph, particle, texture, ảnh), đặt `action` và các trường được tìm thấy ở cấp ngoài cùng của arguments MCP. Schema trong `tools/list` của tool này cố ý để mở; dùng discovery để lấy trường cho từng action.

## Đọc ngữ cảnh rồi chỉnh sửa

Nguyên tắc an toàn của bridge: **đọc trạng thái hiện tại → xem trước thay đổi → mới ghi**. Nhờ vậy trợ lý không ghi đè công việc bạn vừa làm trên trình duyệt hay trong Unity.

Tool đọc ngữ cảnh nhận `path` của asset đã lưu hoặc `tabId` của tab đang mở. Bản nháp trên trình duyệt có thể chứa thay đổi chưa lưu; ghi asset không thay thế bản nháp đó. Nếu nhiều tab mở cùng một file, chọn rõ `tabId`. `draftVersion` và `revision` giúp phát hiện mục tiêu đã bị thay đổi trong lúc đó. Ngữ cảnh trình duyệt hết hạn sau 30 giây không có heartbeat (ví dụ khi bạn đóng tab).

Metadata/context/styles nhận `nodeIds`, `depth` (0–32) và `limit` (1–1000). Bỏ IDs để chọn các root; mảng rỗng nghĩa là không chọn node nào. `compactStyles:true` ở node context có thể đưa giá trị lặp vào `sharedStyles` qua `styleRef` giữ đúng dữ liệu; đây là cách đọc gọn, không dùng làm dữ liệu để lưu.

### Patch tài liệu UI đã lưu

Đọc revision hiện tại trước. `patch_ui_document` mặc định `dryRun:true` (chỉ chạy thử, không ghi), nhận 1–100 thao tác: `update` (sửa), `insert` (thêm), `reparent` (đổi lớp cha), `remove` (xóa).

```json
{
  "path":"Assets/VinaGen AI Toolkit/Content/UI/Documents/Shop.asset",
  "revision":"<revision từ read_ui_document>",
  "dryRun":true,
  "operations":[{"op":"update","id":"title","changes":{"text":"Shop"}}]
}
```

Xem diff rồi gửi lại cùng yêu cầu với `dryRun:false` để ghi. Nếu tài liệu đã bị người khác sửa (revision cũ), bridge trả lỗi 409 cùng `currentRevision`; giữ bản nháp và đọc lại trước khi thử tiếp. Bản ghi được kiểm tra toàn bộ, giữ nguyên trường chưa biết và tham chiếu ảnh GUID/localId, chỉ lưu đúng asset đích với một bước Unity Undo. `reparent` dùng tọa độ cục bộ theo cha, không tự giữ vị trí trên màn hình. Xóa layer cha có con cần `cascade:true`.

`refactor_ui_layers` cũng mặc định chạy thử. Ghi asset cần revision hiện tại; mục tiêu `tabId` chỉ hỗ trợ chạy thử. Tool đề xuất tên như `btn_play`, `txt_title`, `icon_coin`; kiểm tra changes, Buttons và issues trước khi ghi.

Để kiểm tra hình ảnh, chọn bản nháp bằng `tabId` + `draftVersion` mong đợi, hoặc asset bằng `path` + `revision`. Poll `inspect_ui_web_demo` đến khi applied, failed hoặc expired. Kết quả kèm danh tính tài liệu. Hiện chỉ có một job chụp chờ tại một thời điểm, nên đợi xong trước khi gửi job khác.

Các tính năng MCP trực tiếp này thuộc [UI Designer chạy qua Unity](ui-designer.md). [Online Web Designer](web-designer.md) độc lập lưu file cục bộ và không kết nối bridge Unity.

## Quy trình thường gặp

### Sửa code C#

1. Ghi script bằng `manage_script`.
2. Gọi `compile_scripts` với `action:"compile"`, giữ `requestId`.
3. Poll `action:"status"` cùng ID đến khi `ready:true`. Unity có thể reload script giữa chừng; trạng thái biên dịch vẫn được giữ.
4. Sửa cả lỗi compiler (`errors`) và lỗi Console mới (`consoleErrors`), rồi lặp lại đến khi không còn lỗi.

### Chạy test

Khởi chạy `run_tests` rồi poll `get_test_job` để lấy kết quả. Test không chạy khi script còn lỗi biên dịch hoặc scene đang mở có thay đổi chưa lưu (để Unity không hiện hộp thoại chặn).

### Tạo game

Sau khi tạo game, dùng `inspect_game_project` để kiểm tra scene/prefab/tham chiếu đã lưu, rồi kiểm thử riêng gameplay và thử chỉnh một prefab/config đại diện. Kiểm tra thành công chỉ chứng minh asset hợp lệ, **chưa chứng nhận game chơi tốt**. Import UI tạo bản mới có Undo; tự lưu scene sau khi kiểm tra.

### Việc chạy lâu

Một số việc (tạo ảnh, review particle, xử lý texture) được xếp hàng và chạy nền. Phản hồi "queued" chưa có nghĩa đã xong: đợi theo `pollAfterMs` và poll đến trạng thái cuối. Chỉ `inspect_particle_tool_job`, `inspect_image_generation_job`, `inspect_particle_review` hỗ trợ poll có điều kiện bằng `ifChanged:<revision trước>`; giữ kết quả trước nếu nhận `unchanged:true`.

## Endpoint HTTP

Phần này dành cho người **tự viết tích hợp** (script, công cụ riêng). Nếu dùng Claude Code/Codex, bạn không cần đọc.

| Endpoint | Công dụng |
| --- | --- |
| `GET /health` | Kiểm tra bridge có đang chạy. |
| `POST /mcp` | MCP Streamable HTTP không giữ phiên — cổng chính cho ứng dụng MCP. |
| `GET /tools?action=<action>` | Đọc schema hiện tại của một thao tác. |
| `POST /call` | Thực hiện thao tác qua REST. |
| `GET /graph` / `POST /import` | Đọc / import dữ liệu graph. |

`POST /mcp` hỗ trợ JSON-RPC `initialize`, `ping`, `tools/list`, `tools/call`. Gửi `Content-Type: application/json`, `Accept: application/json, text/event-stream`, rồi gửi `MCP-Protocol-Version` đã thương lượng sau initialize. Phiên bản hỗ trợ: `2025-11-25`, `2025-06-18`, `2025-03-26`. Phản hồi là JSON; notification nhận 202. Không có SSE liên tục (`GET /mcp` trả 405).

REST dùng cấu trúc khác arguments của tool MCP. Ví dụ gửi tới `POST /call`:

```json
{
  "tool": "manage_vinagen_ai_toolkit",
  "params": {
    "action": "read_ui_document",
    "focusWindow": false,
    "data": {"path":"Assets/VinaGen AI Toolkit/Content/UI/Documents/Shop.asset"}
  }
}
```

Đặt trường theo schema action; dữ liệu tài liệu nằm trong `params.data`. Kết quả mặc định `responseDetail:"compact"`; dùng `"full"` để lấy trường cũ và phục vụ audit. Tái sử dụng discovery trong một phiên; metadata hỗ trợ `ETag` / `If-None-Match` (304 không có body).

## Bảo mật

Bridge chỉ dành cho máy của bạn: giữ nó trên localhost. Bridge kiểm tra Host/loopback và origin trình duyệt; lệnh ghi từ trình duyệt cần header `X-VinaGen-Session`. CLI/MCP không gửi Origin vẫn được hỗ trợ. Body yêu cầu tối đa 8 MB. Đây là lớp bảo vệ cho editor cục bộ, **không phải** xác thực để mở bridge ra mạng công khai.

Xem [Tạo từ chat](create-from-chat.md) để bắt đầu nhanh.

[Tiếp theo: Cài đặt](settings.md)
