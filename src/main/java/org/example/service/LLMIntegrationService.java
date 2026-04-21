package org.example.service;

import org.example.model.Question;

import java.util.List;
import java.util.Map;

/**
 * LLMIntegrationService — Abstraction layer cho tất cả tương tác với AI.
 *
 * <p><b>Trách nhiệm:</b>
 * <ul>
 *   <li>Giao tiếp với Python backend / LLM API (Gemini, OpenAI, v.v.) qua HTTP.</li>
 *   <li>Parse file Obsidian Markdown để trích xuất câu hỏi và ghi chú.</li>
 *   <li>Cách ly hoàn toàn logic AI khỏi Controller — Controller chỉ nhận kết quả đã xử lý.</li>
 * </ul>
 *
 * <p><b>Open/Closed Principle:</b> Class này implement interface {@code AIService}
 * (sẽ tạo sau). Để đổi nhà cung cấp AI, chỉ cần tạo implementation mới, không sửa class này.
 *
 * <p><b>Cấu hình:</b> API endpoint và key được inject qua constructor, không hardcode.
 */
public class LLMIntegrationService {

    // -------------------------------------------------------------------------
    // Configuration (nên đọc từ config file / environment variable)
    // -------------------------------------------------------------------------

    private final String apiBaseUrl;    // vd: "http://localhost:8000" (Python FastAPI)
    private final String apiKey;        // LLM API key (Gemini / OpenAI)
    private final String modelName;     // vd: "gemini-1.5-pro", "gpt-4o"

    // -------------------------------------------------------------------------
    // HTTP Client (sẽ dùng java.net.http.HttpClient — có sẵn từ Java 11+)
    // -------------------------------------------------------------------------

    // private final HttpClient httpClient;

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    public LLMIntegrationService(String apiBaseUrl, String apiKey, String modelName) {
        this.apiBaseUrl = apiBaseUrl;
        this.apiKey     = apiKey;
        this.modelName  = modelName;
        // this.httpClient = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();
    }

    // -------------------------------------------------------------------------
    // Core AI Features
    // -------------------------------------------------------------------------

    /**
     * Giải thích một câu hỏi cụ thể bằng ngôn ngữ tự nhiên.
     * Kết quả trả về ở định dạng Markdown để View render trực tiếp.
     *
     * @param question câu hỏi cần giải thích
     * @return chuỗi giải thích (Markdown), hoặc thông báo lỗi nếu API fail
     */
    public String explainQuestion(Question question) {
        // 1. Xây dựng prompt từ question.getQuestionText() + question.getOptions()
        // 2. Tạo HttpRequest POST đến /api/explain
        // 3. Gọi httpClient.send(request, BodyHandlers.ofString())
        // 4. Parse JSON response lấy trường "explanation"
        // 5. Trả về chuỗi Markdown
        // TODO: implement
        return "";
    }

    /**
     * Sinh câu hỏi ôn tập mới dựa trên chủ đề cho trước.
     * Dùng khi AI gợi ý câu hỏi bổ sung cho người dùng.
     *
     * @param topic    chủ đề (vd: "Tích phân — Toán 12")
     * @param count    số lượng câu hỏi muốn sinh
     * @return danh sách Question được parse từ JSON response của LLM
     */
    public List<Question> generateRelatedQuestions(String topic, int count) {
        // 1. Gửi POST /api/generate-questions với body: { topic, count }
        // 2. Parse JSON array → List<Question>
        // TODO: implement
        return List.of();
    }

    /**
     * Phân tích điểm yếu của người dùng dựa trên lịch sử làm bài.
     *
     * @param wrongQuestions danh sách câu hỏi làm sai
     * @return bản phân tích dạng Markdown (chủ đề yếu, lời khuyên ôn tập)
     */
    public String analyzeWeaknesses(List<Question> wrongQuestions) {
        // 1. Tổng hợp subject + chapter từ wrongQuestions
        // 2. Gửi prompt phân tích đến LLM
        // 3. Trả về insight dưới dạng Markdown
        // TODO: implement
        return "";
    }

    // -------------------------------------------------------------------------
    // Obsidian Markdown Integration
    // -------------------------------------------------------------------------

    /**
     * Đọc và parse file Obsidian Markdown (.md) để trích xuất câu hỏi.
     * Hỗ trợ cú pháp Obsidian: [[wikilinks]], #tags, frontmatter YAML.
     *
     * @param filePath đường dẫn tuyệt đối đến file .md trong Obsidian vault
     * @return danh sách Question được parse ra từ file
     */
    public List<Question> parseObsidianFile(String filePath) {
        // 1. Đọc file bằng Files.readString(Path.of(filePath))
        // 2. Parse YAML frontmatter (subject, chapter, difficulty)
        // 3. Regex / split để tìm các block câu hỏi theo convention đã thống nhất
        // 4. Map từng block → Question object
        // TODO: implement
        return List.of();
    }

    /**
     * Đồng bộ toàn bộ Obsidian vault — quét tất cả file .md và import câu hỏi.
     *
     * @param vaultRootPath đường dẫn root của Obsidian vault
     * @return Map<String, Integer> — tên file → số câu hỏi import được
     */
    public Map<String, Integer> syncObsidianVault(String vaultRootPath) {
        // 1. Walk file tree từ vaultRootPath (Files.walk)
        // 2. Filter chỉ lấy file .md
        // 3. Gọi parseObsidianFile() cho từng file
        // 4. Persist kết quả vào DB qua QuestionDAO (inject nếu cần)
        // TODO: implement
        return Map.of();
    }

    // -------------------------------------------------------------------------
    // Internal Helpers (private — không lộ ra ngoài)
    // -------------------------------------------------------------------------

    /**
     * Gửi raw prompt đến LLM API và trả về response text thô.
     * Dùng nội bộ bởi các method AI ở trên.
     *
     * @param prompt chuỗi prompt đầy đủ
     * @return chuỗi response từ LLM
     */
    private String callLLMAPI(String prompt) {
        // 1. Build JSON body: { "model": modelName, "prompt": prompt }
        // 2. Set Authorization header: "Bearer " + apiKey
        // 3. Gửi POST request đến apiBaseUrl + "/chat"
        // 4. Xử lý timeout, retry, error codes (429, 500)
        // TODO: implement
        return "";
    }

    /**
     * Parse chuỗi JSON thành Map — wrapper đơn giản tránh phụ thuộc lib ngoài
     * (có thể thay bằng Gson / Jackson sau khi thêm dependency vào pom.xml).
     *
     * @param json chuỗi JSON
     * @return Map key-value
     */
    private Map<String, Object> parseJson(String json) {
        // TODO: implement với Gson hoặc Jackson
        return Map.of();
    }
}
