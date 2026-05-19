package org.example.service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

/**
 * AiServiceClient — Client giao tiếp với Python FastAPI Microservice.
 *
 * <p><b>Chức năng:</b> Gửi thông tin câu hỏi + đáp án đến endpoint POST /api/explain
 * của server Python (http://localhost:8000), nhận về lời giải thích từ AI (Gemini).</p>
 *
 * <p><b>Ràng buộc kỹ thuật:</b>
 * <ul>
 *   <li>Chỉ dùng {@code java.net.http.HttpClient} (có sẵn Java 11+), KHÔNG dùng thư viện ngoài.</li>
 *   <li>Tự xử lý JSON bằng String manipulation, KHÔNG cần Jackson/Gson.</li>
 *   <li>Bọc try-catch an toàn, trả về thông báo lỗi thân thiện nếu server chưa bật.</li>
 * </ul>
 */
public class AiServiceClient {

    // =========================================================================
    // CẤU HÌNH (Constants)
    // =========================================================================

    /** URL gốc của Python FastAPI server */
    private static final String BASE_URL = "http://localhost:8000";

    /** Endpoint giải thích đáp án */
    private static final String EXPLAIN_ENDPOINT = "/api/explain";

    /** Timeout kết nối (giây) — tránh treo app nếu server không phản hồi */
    private static final int CONNECT_TIMEOUT_SECONDS = 10;

    /** Timeout chờ response (giây) — Gemini có thể mất vài giây để suy nghĩ */
    private static final int REQUEST_TIMEOUT_SECONDS = 60;

    // =========================================================================
    // HTTP CLIENT (Singleton — tái sử dụng cho mọi request)
    // =========================================================================

    /** HttpClient được tạo sẵn một lần, dùng lại cho tất cả các lần gọi API */
    private final HttpClient httpClient;

    // =========================================================================
    // CONSTRUCTOR
    // =========================================================================

    public AiServiceClient() {
        // Khởi tạo HttpClient với timeout kết nối 10 giây
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(CONNECT_TIMEOUT_SECONDS))
                .build();
    }

    // =========================================================================
    // PHƯƠNG THỨC CHÍNH: getExplanation()
    // =========================================================================

    /**
     * Gửi thông tin câu hỏi đến AI Server và nhận lời giải thích.
     *
     * <p><b>Quy trình:</b>
     * <ol>
     *   <li>Đóng gói 4 tham số thành JSON body</li>
     *   <li>Gửi HTTP POST đến {@code /api/explain}</li>
     *   <li>Đọc JSON response, trích xuất trường "explanation"</li>
     *   <li>Trả về chuỗi giải thích (Markdown)</li>
     * </ol>
     *
     * @param questionContent    Nội dung câu hỏi (VD: "Tính đạo hàm của y = x^2")
     * @param studentAnswer      Đáp án học sinh đã chọn (VD: "A. y' = x")
     * @param correctAnswer      Đáp án đúng (VD: "B. y' = 2x")
     * @param obsidianSourcePath Đường dẫn file .md trong Obsidian Vault (VD: "Toan_Hoc/Dao_Ham.md")
     * @return Lời giải thích từ AI (Markdown), hoặc thông báo lỗi nếu không kết nối được
     */
    public String getExplanation(String questionContent,
                                  String studentAnswer,
                                  String correctAnswer,
                                  String obsidianSourcePath) {
        try {
            // -----------------------------------------------------------------
            // Bước 1: Tạo JSON body từ 4 tham số
            // Dùng String manipulation đơn giản, không cần thư viện JSON bên ngoài.
            // Hàm escapeJson() đảm bảo các ký tự đặc biệt được xử lý đúng.
            // -----------------------------------------------------------------
            String jsonBody = buildJsonBody(questionContent, studentAnswer,
                                            correctAnswer, obsidianSourcePath);

            // -----------------------------------------------------------------
            // Bước 2: Tạo HTTP POST Request
            // - URL: http://localhost:8000/api/explain
            // - Header: Content-Type = application/json (bắt buộc cho FastAPI)
            // - Body: JSON string vừa tạo ở Bước 1
            // - Timeout: 60 giây (chờ Gemini xử lý)
            // -----------------------------------------------------------------
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(BASE_URL + EXPLAIN_ENDPOINT))
                    .header("Content-Type", "application/json; charset=UTF-8")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                    .timeout(Duration.ofSeconds(REQUEST_TIMEOUT_SECONDS))
                    .build();

            // -----------------------------------------------------------------
            // Bước 3: Gửi request và nhận response
            // HttpClient.send() là blocking — chờ cho đến khi server trả về
            // hoặc hết timeout.
            // -----------------------------------------------------------------
            HttpResponse<String> response = httpClient.send(
                    request,
                    HttpResponse.BodyHandlers.ofString()
            );

            // -----------------------------------------------------------------
            // Bước 4: Kiểm tra HTTP status code
            // - 200: Thành công → parse JSON lấy "explanation"
            // - 404: Không tìm thấy file Obsidian
            // - 500: Lỗi server / Gemini API
            // - Khác: Lỗi không xác định
            // -----------------------------------------------------------------
            int statusCode = response.statusCode();

            if (statusCode == 200) {
                // Thành công — trích xuất trường "explanation" từ JSON response
                return extractExplanation(response.body());
            } else if (statusCode == 404) {
                return "⚠️ Không tìm thấy file kiến thức trong Obsidian Vault.\n"
                     + "Đường dẫn: " + obsidianSourcePath + "\n"
                     + "Vui lòng kiểm tra lại đường dẫn obsidian_source_path trong database.";
            } else {
                // Lỗi khác (422, 500, v.v.)
                return "⚠️ Server AI trả về lỗi (HTTP " + statusCode + ").\n"
                     + "Chi tiết: " + response.body();
            }

        } catch (java.net.ConnectException e) {
            // Server Python chưa bật hoặc từ chối kết nối
            return "Lỗi kết nối đến Não bộ AI. Vui lòng kiểm tra lại server Python!";

        } catch (java.net.http.HttpTimeoutException e) {
            // Request quá lâu (Gemini đang quá tải hoặc prompt quá dài)
            return "⏱️ Hết thời gian chờ phản hồi từ AI.\n"
                 + "Vui lòng thử lại sau hoặc kiểm tra server Python.";

        } catch (Exception e) {
            // Bắt mọi lỗi không lường trước (IOException, InterruptedException, v.v.)
            return "Lỗi kết nối đến Não bộ AI. Vui lòng kiểm tra lại server Python!";
        }
    }

    // =========================================================================
    // CÁC HÀM TIỆN ÍCH NỘI BỘ (Private Helpers)
    // =========================================================================

    /**
     * Tạo JSON body từ 4 tham số.
     * Key phải khớp chính xác với Pydantic model bên Python:
     *   - question_content
     *   - student_answer
     *   - correct_answer
     *   - obsidian_source_path
     *
     * @return Chuỗi JSON hợp lệ, sẵn sàng gửi đi
     */
    private String buildJsonBody(String questionContent,
                                  String studentAnswer,
                                  String correctAnswer,
                                  String obsidianSourcePath) {
        // StringBuilder để xây dựng JSON thủ công
        StringBuilder sb = new StringBuilder();
        sb.append("{");
        sb.append("\"question_content\":\"").append(escapeJson(questionContent)).append("\",");
        sb.append("\"student_answer\":\"").append(escapeJson(studentAnswer)).append("\",");
        sb.append("\"correct_answer\":\"").append(escapeJson(correctAnswer)).append("\",");
        sb.append("\"obsidian_source_path\":\"").append(escapeJson(obsidianSourcePath)).append("\"");
        sb.append("}");
        return sb.toString();
    }

    /**
     * Escape các ký tự đặc biệt trong chuỗi để tạo JSON hợp lệ.
     * Xử lý: dấu ngoặc kép ("), backslash (\), xuống dòng (\n), tab (\t),
     * carriage return (\r), và các ký tự control khác.
     *
     * @param value Chuỗi gốc cần escape
     * @return Chuỗi đã escape, an toàn để đặt trong JSON string
     */
    private String escapeJson(String value) {
        if (value == null) return "";

        StringBuilder escaped = new StringBuilder();
        for (int i = 0; i < value.length(); i++) {
            char ch = value.charAt(i);
            switch (ch) {
                case '\"': escaped.append("\\\""); break;   // Dấu ngoặc kép
                case '\\': escaped.append("\\\\"); break;   // Dấu backslash
                case '\n': escaped.append("\\n");  break;   // Xuống dòng
                case '\r': escaped.append("\\r");  break;   // Carriage return
                case '\t': escaped.append("\\t");  break;   // Tab
                case '\b': escaped.append("\\b");  break;   // Backspace
                case '\f': escaped.append("\\f");  break;   // Form feed
                default:
                    // Các ký tự control khác (< 0x20) => encode dạng Unicode
                    if (ch < 0x20) {
                        escaped.append(String.format("\\u%04x", (int) ch));
                    } else {
                        escaped.append(ch);
                    }
            }
        }
        return escaped.toString();
    }

    /**
     * Trích xuất giá trị của trường "explanation" từ JSON response.
     *
     * <p>JSON response từ Python có dạng:
     * <pre>{"status": "success", "explanation": "Lời giải thích..."}</pre>
     *
     * <p>Thuật toán: Tìm key "explanation", sau đó lấy value nằm giữa cặp dấu ngoặc kép.
     * Xử lý cả trường hợp value chứa ký tự escaped (\\", \\n, v.v.).
     *
     * @param jsonResponse Chuỗi JSON thô từ server
     * @return Giá trị explanation đã unescape, hoặc thông báo lỗi parse
     */
    private String extractExplanation(String jsonResponse) {
        // Tìm vị trí key "explanation"
        String key = "\"explanation\"";
        int keyIndex = jsonResponse.indexOf(key);

        if (keyIndex == -1) {
            // Trường "explanation" không tồn tại trong response
            return "⚠️ Phản hồi từ AI không chứa trường 'explanation'.\n"
                 + "Response gốc: " + jsonResponse;
        }

        // Tìm dấu ':' sau key
        int colonIndex = jsonResponse.indexOf(':', keyIndex + key.length());
        if (colonIndex == -1) {
            return "⚠️ JSON response không hợp lệ (thiếu dấu ':').\n"
                 + "Response gốc: " + jsonResponse;
        }

        // Tìm dấu '"' mở đầu value (bỏ qua khoảng trắng)
        int valueStart = -1;
        for (int i = colonIndex + 1; i < jsonResponse.length(); i++) {
            char ch = jsonResponse.charAt(i);
            if (ch == '"') {
                valueStart = i + 1; // Vị trí bắt đầu nội dung (sau dấu '"')
                break;
            } else if (ch == 'n') {
                // Giá trị null
                return "";
            } else if (!Character.isWhitespace(ch)) {
                break;
            }
        }

        if (valueStart == -1) {
            return "⚠️ Không tìm thấy giá trị explanation trong JSON.\n"
                 + "Response gốc: " + jsonResponse;
        }

        // Tìm dấu '"' kết thúc value (phải xử lý escaped quotes)
        StringBuilder value = new StringBuilder();
        for (int i = valueStart; i < jsonResponse.length(); i++) {
            char ch = jsonResponse.charAt(i);

            if (ch == '\\' && i + 1 < jsonResponse.length()) {
                // Ký tự escaped — đọc ký tự tiếp theo
                char nextCh = jsonResponse.charAt(i + 1);
                switch (nextCh) {
                    case '"':  value.append('"');  break;
                    case '\\': value.append('\\'); break;
                    case 'n':  value.append('\n'); break;
                    case 'r':  value.append('\r'); break;
                    case 't':  value.append('\t'); break;
                    case 'b':  value.append('\b'); break;
                    case 'f':  value.append('\f'); break;
                    case 'u':
                        // Unicode escape sequence (4 hex digits)
                        if (i + 5 < jsonResponse.length()) {
                            String hex = jsonResponse.substring(i + 2, i + 6);
                            try {
                                value.append((char) Integer.parseInt(hex, 16));
                                i += 4; // Bỏ qua 4 ký tự hex (ngoài nextCh)
                            } catch (NumberFormatException e) {
                                value.append("\\u").append(hex);
                            }
                        }
                        break;
                    default:
                        value.append('\\').append(nextCh);
                }
                i++; // Bỏ qua nextCh (đã xử lý)
            } else if (ch == '"') {
                // Gặp dấu '"' không escaped → kết thúc value
                break;
            } else {
                value.append(ch);
            }
        }

        return value.toString();
    }
}
