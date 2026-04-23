package org.example.controller;

import org.example.dao.AnswerDAO;
import org.example.dao.ExamDAO;
import org.example.dao.QuestionDAO;
import org.example.dao.StudentAttemptDAO;
import org.example.model.Answer;
import org.example.model.Exam;
import org.example.model.Question;
import org.example.model.StudentAttempt;
import org.example.model.StudentAttempt.AttemptStatus;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * ExamController — Điều phối toàn bộ luồng thi trắc nghiệm chính.
 *
 * <p><b>Trách nhiệm:</b>
 * <ol>
 *   <li>Nhận ID đề thi → lấy danh sách câu hỏi & đáp án từ DAO.</li>
 *   <li>Xáo trộn (shuffle) câu hỏi / đáp án nếu đề thi yêu cầu.</li>
 *   <li>Nhận bài làm của học sinh → chấm điểm tự động.</li>
 *   <li>Tạo đối tượng {@link StudentAttempt} và lưu lịch sử qua DAO.</li>
 * </ol>
 *
 * <p><b>Nguyên tắc thiết kế (OOP):</b>
 * <ul>
 *   <li>Single Responsibility: chỉ xử lý luồng thi, không render UI.</li>
 *   <li>Dependency Inversion: inject DAO qua constructor.</li>
 *   <li>Encapsulation: trạng thái phiên thi là private, truy cập qua getter.</li>
 * </ul>
 */
public class ExamController {

    private static final Logger LOGGER = Logger.getLogger(ExamController.class.getName());

    // =====================================================================
    // Dependencies — inject qua constructor (Dependency Inversion Principle)
    // =====================================================================

    private final ExamDAO examDAO;
    private final QuestionDAO questionDAO;
    private final AnswerDAO answerDAO;
    private final StudentAttemptDAO attemptDAO;

    // =====================================================================
    // Trạng thái phiên thi hiện tại (Encapsulation — chỉ truy cập qua getter)
    // =====================================================================

    /** Đề thi đang được làm. */
    private Exam currentExam;

    /** Danh sách câu hỏi (đã xáo trộn nếu cần). */
    private List<Question> examQuestions;

    /** Map: questionId → danh sách đáp án (đã xáo trộn nếu cần). */
    private Map<Integer, List<Answer>> answersMap;

    /** Map: questionId → đáp án học sinh đã chọn. */
    private Map<Integer, String> studentResponses;

    /** Đối tượng ghi nhận kết quả thi. */
    private StudentAttempt currentAttempt;

    /** Thời điểm bắt đầu phiên thi — dùng tính thời gian làm bài. */
    private LocalDateTime examStartTime;

    // =====================================================================
    // Constructor
    // =====================================================================

    /**
     * Khởi tạo controller với các DAO cần thiết.
     *
     * @param examDAO     truy vấn đề thi
     * @param questionDAO truy vấn câu hỏi
     * @param answerDAO   truy vấn đáp án
     * @param attemptDAO  lưu lịch sử thi
     */
    public ExamController(ExamDAO examDAO, QuestionDAO questionDAO,
                          AnswerDAO answerDAO, StudentAttemptDAO attemptDAO) {
        this.examDAO = examDAO;
        this.questionDAO = questionDAO;
        this.answerDAO = answerDAO;
        this.attemptDAO = attemptDAO;
        this.studentResponses = new HashMap<>();
    }

    // =====================================================================
    // 1. KHỞI TẠO PHIÊN THI — View gọi khi user chọn đề và nhấn "Bắt đầu"
    // =====================================================================

    /**
     * Nạp đề thi theo ID, lấy câu hỏi & đáp án, áp dụng xáo trộn.
     *
     * @param examId ID đề thi trong CSDL
     * @param userId ID học sinh đang đăng nhập
     * @return danh sách câu hỏi đã sẵn sàng để hiển thị
     * @throws IllegalArgumentException nếu examId không tồn tại
     * @throws IllegalStateException    nếu đề thi không có câu hỏi nào
     */
    public List<Question> loadExam(int examId, int userId) {
        try {
            // --- Bước 1: Truy vấn thông tin đề thi ---
            currentExam = examDAO.findById(examId)
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Không tìm thấy đề thi với ID: " + examId));

            // --- Bước 2: Lấy danh sách question_id thuộc đề ---
            List<Integer> questionIds = examDAO.findQuestionIdsByExamId(examId);
            if (questionIds.isEmpty()) {
                throw new IllegalStateException(
                        "Đề thi '" + currentExam.getTitle() + "' chưa có câu hỏi nào.");
            }

            // --- Bước 3: Truy vấn từng câu hỏi và đáp án tương ứng ---
            examQuestions = fetchQuestions(questionIds);
            answersMap = fetchAnswersForQuestions(examQuestions);

            // --- Bước 4: Xáo trộn nếu đề thi yêu cầu ---
            if (currentExam.isShuffleQuestions()) {
                shuffleQuestions(examQuestions);
            }
            if (currentExam.isShuffleAnswers()) {
                shuffleAllAnswers(answersMap);
            }

            // --- Bước 5: Khởi tạo phiên thi (StudentAttempt) ---
            initAttempt(userId, examId);

            LOGGER.info("Đã nạp đề thi: " + currentExam.getTitle()
                    + " — " + examQuestions.size() + " câu hỏi.");
            return Collections.unmodifiableList(examQuestions);

        } catch (IllegalArgumentException | IllegalStateException e) {
            // Lỗi nghiệp vụ — ném lại để View xử lý hiển thị
            LOGGER.warning("Lỗi nạp đề: " + e.getMessage());
            throw e;
        } catch (Exception e) {
            // Lỗi không mong muốn (DB, IO, …) — log chi tiết, ném runtime
            LOGGER.log(Level.SEVERE, "Lỗi hệ thống khi nạp đề thi ID=" + examId, e);
            throw new RuntimeException("Đã xảy ra lỗi khi tải đề thi. Vui lòng thử lại.", e);
        }
    }

    // =====================================================================
    // 2. LẤY DỮ LIỆU PHIÊN THI — View gọi để render từng câu hỏi
    // =====================================================================

    /**
     * Lấy câu hỏi theo chỉ số (0-based) trong đề.
     *
     * @param index chỉ số câu hỏi
     * @return câu hỏi tại vị trí chỉ định
     * @throws IndexOutOfBoundsException nếu index vượt phạm vi
     */
    public Question getQuestionAt(int index) {
        validateExamLoaded();
        if (index < 0 || index >= examQuestions.size()) {
            throw new IndexOutOfBoundsException(
                    "Chỉ số câu hỏi " + index + " ngoài phạm vi [0, "
                            + (examQuestions.size() - 1) + "].");
        }
        return examQuestions.get(index);
    }

    /**
     * Lấy danh sách đáp án (đã xáo trộn) cho một câu hỏi.
     *
     * @param questionId ID câu hỏi
     * @return danh sách đáp án, hoặc list rỗng nếu không tìm thấy
     */
    public List<Answer> getAnswersForQuestion(int questionId) {
        validateExamLoaded();
        return answersMap.getOrDefault(questionId, List.of());
    }

    // =====================================================================
    // 3. GHI NHẬN ĐÁP ÁN — View gọi mỗi khi user chọn/thay đổi đáp án
    // =====================================================================

    /**
     * Lưu đáp án mà học sinh chọn cho một câu hỏi.
     * Cho phép thay đổi đáp án trước khi nộp bài.
     *
     * @param questionId     ID câu hỏi
     * @param selectedLabel  nhãn đáp án đã chọn (VD: "A", "B", "C", "D")
     */
    public void recordAnswer(int questionId, String selectedLabel) {
        try {
            validateExamLoaded();

            if (selectedLabel == null || selectedLabel.trim().isEmpty()) {
                LOGGER.warning("Đáp án rỗng cho câu " + questionId + " — bỏ qua.");
                return;
            }

            // Ghi đè nếu học sinh thay đổi lựa chọn
            studentResponses.put(questionId, selectedLabel.trim().toUpperCase());

        } catch (Exception e) {
            LOGGER.log(Level.WARNING, "Lỗi ghi nhận đáp án câu " + questionId, e);
        }
    }

    // =====================================================================
    // 4. CHẤM ĐIỂM — Xử lý khi học sinh nhấn "Nộp bài"
    // =====================================================================

    /**
     * Chấm điểm toàn bộ bài làm, tạo StudentAttempt và lưu lịch sử.
     *
     * @return đối tượng StudentAttempt chứa kết quả chi tiết
     * @throws IllegalStateException nếu chưa nạp đề hoặc chưa có bài làm
     */
    public StudentAttempt submitExam() {
        try {
            validateExamLoaded();

            // --- Bước 1: Chấm từng câu ---
            int correctCount = 0;
            int wrongCount = 0;
            int skippedCount = 0;

            for (Question question : examQuestions) {
                int qId = question.getQuestionId();
                String selected = studentResponses.get(qId);

                if (selected == null) {
                    // Học sinh bỏ qua câu này
                    skippedCount++;
                } else if (isAnswerCorrect(qId, selected)) {
                    correctCount++;
                } else {
                    wrongCount++;
                }
            }

            // --- Bước 2: Tính điểm thang 10 ---
            double pointWeight = examDAO.getPointWeight(currentExam.getExamId());
            double score = calculateScore(correctCount, pointWeight);

            // --- Bước 3: Tính thời gian làm bài (giây) ---
            int timeTaken = computeTimeTaken();

            // --- Bước 4: Cập nhật StudentAttempt ---
            currentAttempt.setCorrectCount(correctCount);
            currentAttempt.setWrongCount(wrongCount);
            currentAttempt.setSkippedCount(skippedCount);
            currentAttempt.setScore(score);
            currentAttempt.setTotalTimeTaken(timeTaken);
            currentAttempt.setStatus(AttemptStatus.COMPLETED);
            currentAttempt.setCompletedAt(LocalDateTime.now());

            // --- Bước 5: Persist vào CSDL ---
            attemptDAO.update(currentAttempt);

            LOGGER.info("Nộp bài thành công — Điểm: " + score
                    + " | Đúng: " + correctCount
                    + " | Sai: " + wrongCount
                    + " | Bỏ qua: " + skippedCount);

            return currentAttempt;

        } catch (IllegalStateException e) {
            LOGGER.warning("Lỗi nộp bài: " + e.getMessage());
            throw e;
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Lỗi hệ thống khi chấm điểm", e);
            throw new RuntimeException("Đã xảy ra lỗi khi nộp bài. Vui lòng thử lại.", e);
        }
    }

    /**
     * Chấm điểm từ bài làm truyền trực tiếp (dùng khi View gom bài rồi gửi).
     * Phương thức overload — linh hoạt cho nhiều cách tích hợp View.
     *
     * @param responses Map: questionId → đáp án đã chọn
     * @return đối tượng StudentAttempt chứa kết quả
     */
    public StudentAttempt submitExam(Map<Integer, String> responses) {
        // Ghi đè toàn bộ bài làm rồi ủy quyền cho submitExam() chính
        this.studentResponses = new HashMap<>(responses);
        return submitExam();
    }

    // =====================================================================
    // 5. HỦY / BỎ DỞ PHIÊN THI
    // =====================================================================

    /**
     * Đánh dấu phiên thi bị bỏ dở và lưu trạng thái.
     * View gọi khi user thoát giữa chừng.
     */
    public void abandonExam() {
        try {
            if (currentAttempt == null) {
                LOGGER.warning("Không có phiên thi nào để hủy.");
                return;
            }

            currentAttempt.setStatus(AttemptStatus.ABANDONED);
            currentAttempt.setTotalTimeTaken(computeTimeTaken());
            currentAttempt.setCompletedAt(LocalDateTime.now());
            attemptDAO.update(currentAttempt);

            LOGGER.info("Phiên thi đã bị hủy — Attempt ID: " + currentAttempt.getAttemptId());
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Lỗi khi hủy phiên thi", e);
        }
    }

    // =====================================================================
    // PRIVATE HELPERS — Logic nội bộ, tách nhỏ để dễ bảo trì
    // =====================================================================

    /**
     * Truy vấn danh sách Question từ DAO dựa trên list ID.
     */
    private List<Question> fetchQuestions(List<Integer> questionIds) {
        List<Question> questions = new ArrayList<>();
        for (int qId : questionIds) {
            try {
                questionDAO.findById(qId).ifPresent(questions::add);
            } catch (Exception e) {
                // Bỏ qua câu hỏi bị lỗi, log cảnh báo, tiếp tục nạp các câu còn lại
                LOGGER.log(Level.WARNING, "Không thể nạp câu hỏi ID=" + qId, e);
            }
        }
        return questions;
    }

    /**
     * Truy vấn đáp án cho từng câu hỏi và đóng gói vào Map.
     */
    private Map<Integer, List<Answer>> fetchAnswersForQuestions(List<Question> questions) {
        Map<Integer, List<Answer>> map = new HashMap<>();
        for (Question q : questions) {
            try {
                List<Answer> answers = answerDAO.findByQuestionId(q.getQuestionId());
                map.put(q.getQuestionId(), new ArrayList<>(answers));
            } catch (Exception e) {
                LOGGER.log(Level.WARNING,
                        "Không thể nạp đáp án cho câu hỏi ID=" + q.getQuestionId(), e);
                map.put(q.getQuestionId(), new ArrayList<>());
            }
        }
        return map;
    }

    /**
     * Xáo trộn thứ tự câu hỏi (Fisher–Yates shuffle qua Collections).
     */
    private void shuffleQuestions(List<Question> questions) {
        Collections.shuffle(questions);
        LOGGER.fine("Đã xáo trộn thứ tự câu hỏi.");
    }

    /**
     * Xáo trộn đáp án của MỌI câu hỏi trong đề.
     */
    private void shuffleAllAnswers(Map<Integer, List<Answer>> allAnswers) {
        for (Map.Entry<Integer, List<Answer>> entry : allAnswers.entrySet()) {
            Collections.shuffle(entry.getValue());
        }
        LOGGER.fine("Đã xáo trộn đáp án toàn bộ đề.");
    }

    /**
     * Khởi tạo StudentAttempt mới và persist vào CSDL.
     */
    private void initAttempt(int userId, int examId) {
        currentAttempt = new StudentAttempt(userId, examId);
        examStartTime = LocalDateTime.now();
        studentResponses.clear();

        // Lưu ngay để có attempt_id — cập nhật kết quả khi nộp bài
        int generatedId = attemptDAO.save(currentAttempt);
        currentAttempt.setAttemptId(generatedId);
    }

    /**
     * Kiểm tra đáp án học sinh chọn có đúng hay không.
     * So sánh option_label (A/B/C/D) với đáp án đúng trong DB.
     *
     * @param questionId   ID câu hỏi
     * @param selectedLabel nhãn đáp án đã chọn
     * @return true nếu đúng
     */
    private boolean isAnswerCorrect(int questionId, String selectedLabel) {
        List<Answer> answers = answersMap.getOrDefault(questionId, List.of());
        for (Answer ans : answers) {
            // Tìm đáp án có option_label trùng và kiểm tra is_correct
            if (ans.getOptionLabel().equalsIgnoreCase(selectedLabel)) {
                return ans.isCorrect();
            }
        }
        // Không tìm thấy nhãn → mặc định sai
        return false;
    }

    /**
     * Tính điểm thang 10 dựa trên số câu đúng và trọng số.
     *
     * @param correctCount số câu đúng
     * @param pointWeight  điểm mỗi câu (VD: 0.25 cho đề 40 câu)
     * @return điểm thang 10, làm tròn 2 chữ số
     */
    private double calculateScore(int correctCount, double pointWeight) {
        double rawScore = correctCount * pointWeight;
        // Làm tròn 2 chữ số thập phân
        return Math.round(rawScore * 100.0) / 100.0;
    }

    /**
     * Tính thời gian làm bài tính từ lúc bắt đầu (đơn vị: giây).
     */
    private int computeTimeTaken() {
        if (examStartTime == null) {
            return 0;
        }
        return (int) ChronoUnit.SECONDS.between(examStartTime, LocalDateTime.now());
    }

    /**
     * Kiểm tra đề thi đã được nạp chưa — gọi trước mọi thao tác phiên thi.
     */
    private void validateExamLoaded() {
        if (currentExam == null || examQuestions == null) {
            throw new IllegalStateException(
                    "Chưa nạp đề thi. Hãy gọi loadExam() trước.");
        }
    }

    // =====================================================================
    // GETTERS — View đọc trạng thái phiên thi qua đây
    // =====================================================================

    /** Đề thi hiện tại. */
    public Exam getCurrentExam() { return currentExam; }

    /** Tổng số câu hỏi trong đề. */
    public int getTotalQuestions() {
        return examQuestions != null ? examQuestions.size() : 0;
    }

    /** Số câu đã trả lời. */
    public int getAnsweredCount() {
        return studentResponses.size();
    }

    /** Số câu chưa trả lời. */
    public int getUnansweredCount() {
        return getTotalQuestions() - getAnsweredCount();
    }

    /** Lấy đối tượng StudentAttempt hiện tại (kết quả thi). */
    public StudentAttempt getCurrentAttempt() { return currentAttempt; }

    /** Kiểm tra học sinh đã trả lời câu này chưa. */
    public boolean isQuestionAnswered(int questionId) {
        return studentResponses.containsKey(questionId);
    }

    /** Lấy đáp án học sinh đã chọn cho một câu. */
    public String getSelectedAnswer(int questionId) {
        return studentResponses.get(questionId);
    }

    /** Toàn bộ bài làm — Map: questionId → đáp án đã chọn. */
    public Map<Integer, String> getAllResponses() {
        return Collections.unmodifiableMap(studentResponses);
    }
}
