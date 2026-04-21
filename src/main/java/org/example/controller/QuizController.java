package org.example.controller;

import org.example.dao.QuestionDAO;
import org.example.model.Question;
import org.example.model.Question.DifficultyLevel;
import org.example.service.LLMIntegrationService;

import java.util.List;

/**
 * QuizController — Điểm điều phối trung tâm cho tính năng làm bài.
 *
 * <p><b>Nguyên tắc vận hành (theo MVC):</b>
 * <ol>
 *   <li>View (Swing panel) gọi các public method của Controller này.</li>
 *   <li>Controller gọi QuestionDAO để truy xuất dữ liệu từ DB.</li>
 *   <li>Controller gọi LLMIntegrationService khi cần AI hỗ trợ.</li>
 *   <li>Controller KHÔNG bao giờ trực tiếp render UI — chỉ trả về dữ liệu / trạng thái.</li>
 * </ol>
 *
 * <p><b>Dependency Injection thủ công</b> (không dùng Spring) — inject qua constructor.
 */
public class QuizController {

    // -------------------------------------------------------------------------
    // Dependencies (injected qua constructor — Dependency Inversion Principle)
    // -------------------------------------------------------------------------

    private final QuestionDAO questionDAO;
    private final LLMIntegrationService llmService;

    // -------------------------------------------------------------------------
    // Session State (trạng thái phiên làm bài hiện tại)
    // -------------------------------------------------------------------------

    private List<Question> currentQuizSet;   // Danh sách câu hỏi trong đề hiện tại
    private int currentIndex;                // Vị trí câu hỏi đang hiển thị
    private int score;                       // Điểm tích lũy trong phiên

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    public QuizController(QuestionDAO questionDAO, LLMIntegrationService llmService) {
        this.questionDAO = questionDAO;
        this.llmService  = llmService;
        this.currentIndex = 0;
        this.score = 0;
    }

    // -------------------------------------------------------------------------
    // Quiz Lifecycle — được gọi từ View
    // -------------------------------------------------------------------------

    /**
     * Khởi tạo đề thi mới dựa trên môn và độ khó.
     * View gọi method này khi user nhấn "Bắt đầu làm bài".
     *
     * @param subject   môn học (vd: "Toán", "Lý")
     * @param difficulty mức độ khó
     * @param limit     số lượng câu hỏi tối đa
     * @return danh sách câu hỏi đã lọc
     */
    public List<Question> startQuiz(String subject, DifficultyLevel difficulty, int limit) {
        // 1. Gọi DAO để lấy câu hỏi phù hợp từ CSDL
        // 2. Xáo trộn danh sách (Collections.shuffle)
        // 3. Reset session state
        // TODO: implement
        return List.of();
    }

    /**
     * Lấy câu hỏi tại vị trí hiện tại để View hiển thị.
     *
     * @return câu hỏi hiện tại, hoặc null nếu đã hết đề
     */
    public Question getCurrentQuestion() {
        // TODO: implement — kiểm tra bounds trước khi trả về
        return null;
    }

    /**
     * Xử lý đáp án người dùng chọn.
     * View gọi method này khi user click vào một đáp án.
     *
     * @param selectedAnswer đáp án user chọn (vd: "A", "B", "C", "D")
     * @return true nếu đáp án đúng
     */
    public boolean submitAnswer(String selectedAnswer) {
        // 1. Lấy câu hỏi hiện tại
        // 2. Gọi question.isCorrect(selectedAnswer)
        // 3. Cập nhật score nếu đúng
        // 4. Advance currentIndex
        // TODO: implement
        return false;
    }

    /**
     * Chuyển sang câu tiếp theo.
     *
     * @return false nếu đã là câu cuối (View biết để hiện màn hình kết quả)
     */
    public boolean nextQuestion() {
        // TODO: implement
        return false;
    }

    /**
     * Kết thúc phiên làm bài và trả về kết quả tổng hợp.
     *
     * @return QuizResult chứa điểm, số câu đúng/sai, thời gian (sẽ tạo class sau)
     */
    public Object finishQuiz() {
        // TODO: implement — trả về QuizResult DTO
        return null;
    }

    // -------------------------------------------------------------------------
    // AI Integration — Controller là người duy nhất gọi LLMIntegrationService
    // -------------------------------------------------------------------------

    /**
     * Yêu cầu AI giải thích câu hỏi hiện tại.
     * View gọi khi user nhấn nút "Hỏi AI".
     *
     * @return chuỗi giải thích từ LLM (Markdown format)
     */
    public String requestAIExplanation() {
        // 1. Lấy câu hỏi hiện tại
        // 2. Gọi llmService.explainQuestion(currentQuestion)
        // 3. Trả về kết quả về cho View render
        // TODO: implement
        return "";
    }

    /**
     * Yêu cầu AI gợi ý các câu hỏi liên quan đến chủ đề đang ôn.
     *
     * @param topic chủ đề người dùng muốn ôn
     * @return danh sách câu hỏi được AI đề xuất
     */
    public List<Question> requestAISuggestedQuestions(String topic) {
        // 1. Gọi llmService.generateRelatedQuestions(topic)
        // 2. Parse kết quả về List<Question>
        // TODO: implement
        return List.of();
    }

    // -------------------------------------------------------------------------
    // Getters (View đọc state qua đây, không access field trực tiếp)
    // -------------------------------------------------------------------------

    public int getScore() { return score; }

    public int getCurrentIndex() { return currentIndex; }

    public int getTotalQuestions() {
        return currentQuizSet != null ? currentQuizSet.size() : 0;
    }
}
