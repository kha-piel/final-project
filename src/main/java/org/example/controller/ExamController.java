package org.example.controller;

import org.example.dao.AnswerDAO;
import org.example.dao.ExamDAO;
import org.example.dao.QuestionDAO;
import org.example.dao.StudentAttemptDAO;
import org.example.model.Answer;
import org.example.model.Exam;
import org.example.model.StudentAttempt;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;

/**
 * ExamController -- Bo dieu phoi trung tam cho luong lam bai thi trac nghiem.
 *
 * <p><b>Trach nhiem:</b>
 * <ol>
 *   <li>Khoi tao phien thi: lay de, xao tron cau hoi + dap an, tao StudentAttempt.</li>
 *   <li>Luu tru tam trang thai phien thi tren RAM (khong goi DB lien tuc).</li>
 *   <li>Tinh diem va cap nhat ket qua khi hoc sinh nop bai.</li>
 * </ol>
 *
 * <p><b>Nguyen tac thiet ke:</b>
 * <ul>
 *   <li>KHONG chua bat ky code UI nao -- chi xu ly logic thuan tuy.</li>
 *   <li>Tuan thu Encapsulation -- tat ca bien trang thai la private.</li>
 *   <li>Dependency Injection thu cong qua constructor (khong dung Spring).</li>
 *   <li>Dung Collections.shuffle() (Fisher-Yates) de xao tron.</li>
 * </ul>
 */
public class ExamController {

    // =========================================================================
    // DEPENDENCIES (inject qua constructor -- Dependency Inversion Principle)
    // =========================================================================

    private final ExamDAO examDAO;
    private final QuestionDAO questionDAO;
    private final AnswerDAO answerDAO;
    private final StudentAttemptDAO studentAttemptDAO;

    // =========================================================================
    // TRANG THAI PHIEN THI (private -- Encapsulation)
    // Tat ca deu duoc luu tren RAM, chi ghi xuong DB khi bat dau va nop bai.
    // =========================================================================

    /** Cau hinh de thi hien tai (lay tu DB mot lan duy nhat) */
    private Exam currentExam;

    /** Phien thi hien tai cua hoc sinh */
    private StudentAttempt currentAttempt;

    /**
     * Danh sach cau hoi da duoc xao tron.
     * Moi phan tu la mot "QuestionSnapshot" chua:
     *   - questionId: ID cau hoi goc trong DB
     *   - questionContent: Noi dung cau hoi
     *   - shuffledAnswers: Danh sach dap an DA DUOC XAO TRON
     *   - correctAnswerId: ID cua dap an dung (de cham diem)
     *   - obsidianSourcePath: Duong dan file .md (de goi AI)
     */
    private List<QuestionSnapshot> examQuestions;

    /**
     * Luu lua chon cua hoc sinh: Map<questionId, selectedAnswerId>
     * - Key: question_id
     * - Value: answer_id ma hoc sinh da chon
     * - Neu hoc sinh chua tra loi cau nao, key do khong ton tai trong map
     */
    private Map<Integer, Integer> studentSelections;

    /** Thoi diem bat dau lam bai (de tinh thoi gian thuc te) */
    private LocalDateTime examStartTime;

    /** Flag danh dau phien thi dang hoat dong */
    private boolean examInProgress;

    // =========================================================================
    // CONSTRUCTOR
    // =========================================================================

    /**
     * Khoi tao ExamController voi cac DAO dependencies.
     *
     * @param examDAO           DAO truy van bang exams + exam_questions
     * @param questionDAO       DAO truy van bang questions
     * @param answerDAO         DAO truy van bang answers
     * @param studentAttemptDAO DAO luu/cap nhat bang student_attempts
     */
    public ExamController(ExamDAO examDAO, QuestionDAO questionDAO,
                          AnswerDAO answerDAO, StudentAttemptDAO studentAttemptDAO) {
        this.examDAO = examDAO;
        this.questionDAO = questionDAO;
        this.answerDAO = answerDAO;
        this.studentAttemptDAO = studentAttemptDAO;

        // Khoi tao trang thai ban dau
        this.examQuestions = new ArrayList<>();
        this.studentSelections = new HashMap<>();
        this.examInProgress = false;
    }

    // =========================================================================
    // 1. startExam() -- Khoi tao phien thi
    // =========================================================================

    /**
     * Khoi tao mot phien thi moi.
     *
     * <p><b>Quy trinh chi tiet:</b>
     * <ol>
     *   <li>Goi ExamDAO de lay cau hinh de thi (duration, shuffle flags, v.v.)</li>
     *   <li>Goi ExamDAO de lay danh sach question_id thuoc de thi</li>
     *   <li>Voi moi question_id: goi AnswerDAO lay 4 dap an A/B/C/D</li>
     *   <li>Neu de thi cho phep xao tron cau hoi (shuffle_questions=1):
     *       Ap dung Fisher-Yates (Collections.shuffle) tren danh sach cau hoi</li>
     *   <li>Neu de thi cho phep xao tron dap an (shuffle_answers=1):
     *       Fisher-Yates tren danh sach dap an cua TUNG cau hoi</li>
     *   <li>Tao StudentAttempt moi (status=IN_PROGRESS) va luu vao DB</li>
     *   <li>Ghi nhan thoi diem bat dau</li>
     * </ol>
     *
     * @param examId ID de thi can lam
     * @param userId ID hoc sinh dang lam bai
     * @return true neu khoi tao thanh cong, false neu de thi khong ton tai hoac loi DB
     */
    public boolean startExam(int examId, int userId) {
        // --- Buoc 1: Lay cau hinh de thi tu Database ---
        Optional<Exam> examOpt = examDAO.findById(examId);
        if (examOpt.isEmpty()) {
            System.err.println("[ExamController] Khong tim thay de thi voi ID: " + examId);
            return false;
        }
        currentExam = examOpt.get();

        // --- Buoc 2: Lay danh sach question_id thuoc de thi nay ---
        // (Tu bang trung gian exam_questions, da sap xep theo question_order)
        List<Integer> questionIds = examDAO.findQuestionIdsByExamId(examId);
        if (questionIds.isEmpty()) {
            System.err.println("[ExamController] De thi " + examId + " khong co cau hoi nao!");
            return false;
        }

        // --- Buoc 3: Voi moi question_id, lay noi dung cau hoi + 4 dap an ---
        examQuestions = new ArrayList<>();
        for (int qId : questionIds) {
            // Lay danh sach dap an (A, B, C, D) tu AnswerDAO
            List<Answer> answers = answerDAO.findByQuestionId(qId);

            // Tim dap an dung de luu vao snapshot (phuc vu cham diem)
            int correctAnswerId = -1;
            for (Answer a : answers) {
                if (a.isCorrect()) {
                    correctAnswerId = a.getAnswerId();
                    break;
                }
            }

            // Lay thong tin cau hoi (content, obsidian_source_path)
            // Su dung QuestionDAO.findById() de lay chi tiet
            var questionOpt = questionDAO.findById(qId);
            String content = "";
            String obsidianPath = "";
            if (questionOpt.isPresent()) {
                var q = questionOpt.get();
                content = q.getQuestionText();
                obsidianPath = q.getObsidianSourcePath() != null ? q.getObsidianSourcePath() : "";
            }

            examQuestions.add(new QuestionSnapshot(
                qId, content, new ArrayList<>(answers), correctAnswerId, obsidianPath
            ));
        }

        // --- Buoc 4: Xao tron cau hoi (Fisher-Yates / Collections.shuffle) ---
        // Chi xao tron neu cau hinh de thi cho phep (shuffle_questions = true)
        //
        // GIAI THICH THUAT TOAN FISHER-YATES:
        // Collections.shuffle() su dung bien the cua Fisher-Yates:
        //   - Duyet tu cuoi mang ve dau (i = n-1 ... 1)
        //   - Sinh so ngau nhien j trong khoang [0, i]
        //   - Hoan doi phan tu tai vi tri i va j
        //   - Ket qua: moi hoan vi co xac suat nhu nhau (1/n!)
        // Do phuc tap: O(n) thoi gian, O(1) bo nho phu
        if (currentExam.isShuffleQuestions()) {
            Collections.shuffle(examQuestions);
        }

        // --- Buoc 5: Xao tron dap an cua TUNG cau hoi ---
        // Tuong tu, dung Fisher-Yates tren danh sach 4 dap an
        // Dam bao hoc sinh khong the "hoc thuoc" vi tri A/B/C/D
        if (currentExam.isShuffleAnswers()) {
            for (QuestionSnapshot qs : examQuestions) {
                Collections.shuffle(qs.getShuffledAnswers());
            }
        }

        // --- Buoc 6: Tao StudentAttempt moi va luu vao Database ---
        currentAttempt = new StudentAttempt(userId, examId);
        int attemptId = studentAttemptDAO.save(currentAttempt);
        if (attemptId == -1) {
            System.err.println("[ExamController] Loi khi tao StudentAttempt!");
            return false;
        }

        // --- Buoc 7: Khoi tao trang thai phien thi ---
        studentSelections = new HashMap<>();
        examStartTime = LocalDateTime.now();
        examInProgress = true;

        System.out.println("[ExamController] Bat dau phien thi #" + attemptId
            + " | De: " + currentExam.getTitle()
            + " | So cau: " + examQuestions.size()
            + " | Thoi gian: " + currentExam.getDuration() + " phut");

        return true;
    }

    // =========================================================================
    // 2. selectAnswer() -- Luu lua chon cua hoc sinh
    // =========================================================================

    /**
     * Ghi nhan dap an ma hoc sinh da chon cho mot cau hoi.
     * Luu tren RAM (HashMap), KHONG goi Database.
     *
     * <p>Neu hoc sinh doi y va chon dap an khac, gia tri cu se bi ghi de.</p>
     *
     * @param questionId       ID cau hoi
     * @param selectedAnswerId ID dap an hoc sinh chon
     * @throws IllegalStateException neu chua bat dau phien thi
     */
    public void selectAnswer(int questionId, int selectedAnswerId) {
        if (!examInProgress) {
            throw new IllegalStateException("Chua co phien thi nao dang dien ra!");
        }

        // Kiem tra questionId co thuoc de thi hien tai khong
        boolean validQuestion = examQuestions.stream()
                .anyMatch(qs -> qs.getQuestionId() == questionId);
        if (!validQuestion) {
            System.err.println("[ExamController] Cau hoi " + questionId
                + " khong thuoc de thi hien tai!");
            return;
        }

        // Luu/ghi de lua chon vao Map
        // Key = questionId, Value = answerId hoc sinh chon
        studentSelections.put(questionId, selectedAnswerId);
    }

    // =========================================================================
    // 3. submitExam() -- Nop bai va cham diem
    // =========================================================================

    /**
     * Xu ly khi hoc sinh nop bai thi.
     *
     * <p><b>Quy trinh chi tiet:</b>
     * <ol>
     *   <li>Duyet qua TAT CA cau hoi trong de thi</li>
     *   <li>Voi moi cau hoi, kiem tra hoc sinh da tra loi chua:
     *       <ul>
     *         <li>Chua tra loi -> skippedCount++</li>
     *         <li>Da tra loi -> so sanh voi correctAnswerId:
     *             dung -> correctCount++, sai -> wrongCount++</li>
     *       </ul>
     *   </li>
     *   <li>Tinh diem theo cong thuc: (so cau dung / tong so cau) * 10</li>
     *   <li>Cap nhat StudentAttempt: score, counts, status=COMPLETED, completed_at</li>
     *   <li>Goi StudentAttemptDAO.update() de luu xuong Database</li>
     * </ol>
     *
     * @return doi tuong ExamResult chua ket qua chi tiet, hoac null neu loi
     * @throws IllegalStateException neu chua bat dau phien thi
     */
    public ExamResult submitExam() {
        if (!examInProgress) {
            throw new IllegalStateException("Chua co phien thi nao dang dien ra!");
        }

        // --- Buoc 1: Dem so cau dung, sai, bo qua ---
        int correctCount = 0;
        int wrongCount = 0;
        int skippedCount = 0;
        int totalQuestions = examQuestions.size();

        for (QuestionSnapshot qs : examQuestions) {
            int questionId = qs.getQuestionId();
            int correctAnswerId = qs.getCorrectAnswerId();

            if (!studentSelections.containsKey(questionId)) {
                // Hoc sinh CHUA tra loi cau nay -> bo qua
                skippedCount++;
            } else {
                int selectedAnswerId = studentSelections.get(questionId);
                if (selectedAnswerId == correctAnswerId) {
                    // Dap an DUNG
                    correctCount++;
                } else {
                    // Dap an SAI
                    wrongCount++;
                }
            }
        }

        // --- Buoc 2: Tinh diem (thang 10) ---
        // Cong thuc: diem = (so cau dung / tong so cau) * 10
        // Lam tron 2 chu so thap phan
        double score = 0.0;
        if (totalQuestions > 0) {
            score = Math.round(((double) correctCount / totalQuestions) * 10.0 * 100.0) / 100.0;
        }

        // --- Buoc 3: Tinh thoi gian thuc te (giay) ---
        long timeTakenSeconds = ChronoUnit.SECONDS.between(examStartTime, LocalDateTime.now());

        // --- Buoc 4: Cap nhat StudentAttempt ---
        currentAttempt.setScore(score);
        currentAttempt.setCorrectCount(correctCount);
        currentAttempt.setWrongCount(wrongCount);
        currentAttempt.setSkippedCount(skippedCount);
        currentAttempt.setTotalTimeTaken((int) timeTakenSeconds);
        currentAttempt.setStatus(StudentAttempt.STATUS_COMPLETED);
        currentAttempt.setCompletedAt(
            LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))
        );

        // --- Buoc 5: Luu ket qua xuong Database ---
        studentAttemptDAO.update(currentAttempt);

        // --- Buoc 6: Danh dau phien thi ket thuc ---
        examInProgress = false;

        System.out.println("[ExamController] Nop bai thanh cong!"
            + " | Diem: " + score + "/10"
            + " | Dung: " + correctCount
            + " | Sai: " + wrongCount
            + " | Bo qua: " + skippedCount
            + " | Thoi gian: " + timeTakenSeconds + "s");

        // --- Buoc 7: Tra ve ket qua cho View hien thi ---
        return new ExamResult(
            currentAttempt.getAttemptId(),
            currentExam.getTitle(),
            score,
            correctCount,
            wrongCount,
            skippedCount,
            totalQuestions,
            (int) timeTakenSeconds,
            currentExam.getDuration(),
            score >= currentExam.getPassScore()
        );
    }

    // =========================================================================
    // GETTERS -- View doc trang thai qua day (read-only)
    // =========================================================================

    /** Lay danh sach cau hoi da xao tron (View dung de hien thi) */
    public List<QuestionSnapshot> getExamQuestions() {
        return Collections.unmodifiableList(examQuestions);
    }

    /** Lay lua chon hien tai cua hoc sinh (View dung de danh dau radio button) */
    public Map<Integer, Integer> getStudentSelections() {
        return Collections.unmodifiableMap(studentSelections);
    }

    /** Kiem tra hoc sinh da chon dap an cho cau hoi chua */
    public boolean hasAnswered(int questionId) {
        return studentSelections.containsKey(questionId);
    }

    /** Lay answerId ma hoc sinh da chon cho mot cau hoi, hoac -1 neu chua chon */
    public int getSelectedAnswerId(int questionId) {
        return studentSelections.getOrDefault(questionId, -1);
    }

    /** So cau da tra loi */
    public int getAnsweredCount() {
        return studentSelections.size();
    }

    /** Tong so cau hoi trong de */
    public int getTotalQuestions() {
        return examQuestions.size();
    }

    /** Thoi gian con lai (phut), hoac -1 neu chua bat dau */
    public long getRemainingTimeMinutes() {
        if (!examInProgress || examStartTime == null) return -1;
        long elapsed = ChronoUnit.MINUTES.between(examStartTime, LocalDateTime.now());
        return Math.max(0, currentExam.getDuration() - elapsed);
    }

    /** Thoi gian con lai (giay), hoac -1 neu chua bat dau */
    public long getRemainingTimeSeconds() {
        if (!examInProgress || examStartTime == null) return -1;
        long elapsedSeconds = ChronoUnit.SECONDS.between(examStartTime, LocalDateTime.now());
        long totalSeconds = (long) currentExam.getDuration() * 60;
        return Math.max(0, totalSeconds - elapsedSeconds);
    }

    /** Kiem tra phien thi dang dien ra */
    public boolean isExamInProgress() {
        return examInProgress;
    }

    /** Kiem tra da het gio chua */
    public boolean isTimeUp() {
        return getRemainingTimeSeconds() <= 0;
    }

    /** Lay de thi hien tai */
    public Exam getCurrentExam() {
        return currentExam;
    }

    /** Lay phien thi hien tai */
    public StudentAttempt getCurrentAttempt() {
        return currentAttempt;
    }

    // =========================================================================
    // INNER CLASS: QuestionSnapshot
    // Luu tru "anh chup" cua mot cau hoi da duoc xu ly (xao tron dap an, v.v.)
    // =========================================================================

    /**
     * QuestionSnapshot -- Doi tuong luu tru trang thai cau hoi trong phien thi.
     *
     * <p>Tai sao can class nay thay vi dung Question truc tiep?
     * <ul>
     *   <li>Question model la du lieu goc tu DB, khong nen thay doi.</li>
     *   <li>Snapshot chua danh sach dap an DA XAO TRON -- khac voi thu tu goc trong DB.</li>
     *   <li>Snapshot luu correctAnswerId san -- cham diem nhanh, khong can goi DB lai.</li>
     * </ul>
     */
    public static class QuestionSnapshot {

        private final int questionId;
        private final String questionContent;
        private final List<Answer> shuffledAnswers;  // Dap an da duoc xao tron
        private final int correctAnswerId;           // ID dap an dung (de cham diem)
        private final String obsidianSourcePath;     // Duong dan file .md (de goi AI)

        public QuestionSnapshot(int questionId, String questionContent,
                                List<Answer> shuffledAnswers, int correctAnswerId,
                                String obsidianSourcePath) {
            this.questionId = questionId;
            this.questionContent = questionContent;
            this.shuffledAnswers = shuffledAnswers;
            this.correctAnswerId = correctAnswerId;
            this.obsidianSourcePath = obsidianSourcePath;
        }

        public int getQuestionId() { return questionId; }
        public String getQuestionContent() { return questionContent; }
        public List<Answer> getShuffledAnswers() { return shuffledAnswers; }
        public int getCorrectAnswerId() { return correctAnswerId; }
        public String getObsidianSourcePath() { return obsidianSourcePath; }
    }

    // =========================================================================
    // INNER CLASS: ExamResult
    // DTO tra ve cho View sau khi nop bai -- chua toan bo ket qua
    // =========================================================================

    /**
     * ExamResult -- Data Transfer Object chua ket qua bai thi.
     * View su dung de hien thi man hinh ket qua.
     */
    public static class ExamResult {

        private final int attemptId;
        private final String examTitle;
        private final double score;            // Diem thang 10
        private final int correctCount;
        private final int wrongCount;
        private final int skippedCount;
        private final int totalQuestions;
        private final int timeTakenSeconds;    // Thoi gian thuc te (giay)
        private final int durationMinutes;     // Thoi gian quy dinh (phut)
        private final boolean passed;          // true neu dat diem toi thieu

        public ExamResult(int attemptId, String examTitle, double score,
                          int correctCount, int wrongCount, int skippedCount,
                          int totalQuestions, int timeTakenSeconds,
                          int durationMinutes, boolean passed) {
            this.attemptId = attemptId;
            this.examTitle = examTitle;
            this.score = score;
            this.correctCount = correctCount;
            this.wrongCount = wrongCount;
            this.skippedCount = skippedCount;
            this.totalQuestions = totalQuestions;
            this.timeTakenSeconds = timeTakenSeconds;
            this.durationMinutes = durationMinutes;
            this.passed = passed;
        }

        // Getters
        public int getAttemptId() { return attemptId; }
        public String getExamTitle() { return examTitle; }
        public double getScore() { return score; }
        public int getCorrectCount() { return correctCount; }
        public int getWrongCount() { return wrongCount; }
        public int getSkippedCount() { return skippedCount; }
        public int getTotalQuestions() { return totalQuestions; }
        public int getTimeTakenSeconds() { return timeTakenSeconds; }
        public int getDurationMinutes() { return durationMinutes; }
        public boolean isPassed() { return passed; }

        /** Tinh phan tram dung */
        public double getAccuracyPercent() {
            if (totalQuestions == 0) return 0;
            return Math.round(((double) correctCount / totalQuestions) * 100.0 * 10.0) / 10.0;
        }

        /** Format thoi gian lam bai thanh chuoi "MM:SS" */
        public String getFormattedTimeTaken() {
            int minutes = timeTakenSeconds / 60;
            int seconds = timeTakenSeconds % 60;
            return String.format("%02d:%02d", minutes, seconds);
        }

        @Override
        public String toString() {
            return "=== KET QUA BAI THI ===\n"
                 + "De thi    : " + examTitle + "\n"
                 + "Diem      : " + score + "/10 " + (passed ? "(DAT)" : "(CHUA DAT)") + "\n"
                 + "Dung/Sai/Bo qua: " + correctCount + "/" + wrongCount + "/" + skippedCount + "\n"
                 + "Ty le dung: " + getAccuracyPercent() + "%\n"
                 + "Thoi gian : " + getFormattedTimeTaken() + " / " + durationMinutes + " phut";
        }
    }
}
