package org.example.model;

/**
 * StudentAttempt — Model ghi nhận mỗi lần học sinh làm bài thi.
 * Ánh xạ 1:1 với bảng `student_attempts` trong CSDL SQLite.
 *
 * <p>Vòng đời: IN_PROGRESS -> COMPLETED hoặc ABANDONED
 */
public class StudentAttempt {

    // -------------------------------------------------------------------------
    // Constants — Trạng thái phiên thi (khớp với CHECK constraint trong DB)
    // -------------------------------------------------------------------------

    public static final String STATUS_IN_PROGRESS = "in_progress";
    public static final String STATUS_COMPLETED   = "completed";
    public static final String STATUS_ABANDONED    = "abandoned";

    // -------------------------------------------------------------------------
    // Fields (ánh xạ từ bảng student_attempts trong database.sql)
    // -------------------------------------------------------------------------

    private int attemptId;
    private int userId;                // FK đến bảng users
    private int examId;                // FK đến bảng exams
    private Double score;              // Điểm thang 10 (null khi đang làm)
    private int correctCount;          // Số câu đúng
    private int wrongCount;            // Số câu sai
    private int skippedCount;          // Số câu bỏ qua
    private Integer totalTimeTaken;    // Thời gian thực tế (giây)
    private String status;             // 'in_progress', 'completed', 'abandoned'
    private String startedAt;          // Thời điểm bắt đầu
    private String completedAt;        // Thời điểm nộp bài
    private String aiFeedback;         // Nhận xét tổng thể của AI

    // -------------------------------------------------------------------------
    // Constructors
    // -------------------------------------------------------------------------

    public StudentAttempt() {
        this.status = STATUS_IN_PROGRESS;
    }

    public StudentAttempt(int userId, int examId) {
        this.userId = userId;
        this.examId = examId;
        this.status = STATUS_IN_PROGRESS;
        this.correctCount = 0;
        this.wrongCount = 0;
        this.skippedCount = 0;
    }

    // -------------------------------------------------------------------------
    // Getters & Setters
    // -------------------------------------------------------------------------

    public int getAttemptId() { return attemptId; }
    public void setAttemptId(int attemptId) { this.attemptId = attemptId; }

    public int getUserId() { return userId; }
    public void setUserId(int userId) { this.userId = userId; }

    public int getExamId() { return examId; }
    public void setExamId(int examId) { this.examId = examId; }

    public Double getScore() { return score; }
    public void setScore(Double score) { this.score = score; }

    public int getCorrectCount() { return correctCount; }
    public void setCorrectCount(int correctCount) { this.correctCount = correctCount; }

    public int getWrongCount() { return wrongCount; }
    public void setWrongCount(int wrongCount) { this.wrongCount = wrongCount; }

    public int getSkippedCount() { return skippedCount; }
    public void setSkippedCount(int skippedCount) { this.skippedCount = skippedCount; }

    public Integer getTotalTimeTaken() { return totalTimeTaken; }
    public void setTotalTimeTaken(Integer totalTimeTaken) { this.totalTimeTaken = totalTimeTaken; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getStartedAt() { return startedAt; }
    public void setStartedAt(String startedAt) { this.startedAt = startedAt; }

    public String getCompletedAt() { return completedAt; }
    public void setCompletedAt(String completedAt) { this.completedAt = completedAt; }

    public String getAiFeedback() { return aiFeedback; }
    public void setAiFeedback(String aiFeedback) { this.aiFeedback = aiFeedback; }

    // -------------------------------------------------------------------------
    // Utility
    // -------------------------------------------------------------------------

    /** Kiểm tra phiên thi đã hoàn thành chưa */
    public boolean isCompleted() {
        return STATUS_COMPLETED.equals(status);
    }

    /** Kiểm tra phiên thi đang diễn ra */
    public boolean isInProgress() {
        return STATUS_IN_PROGRESS.equals(status);
    }

    @Override
    public String toString() {
        return "StudentAttempt{id=" + attemptId + ", user=" + userId
             + ", exam=" + examId + ", status='" + status
             + "', score=" + score + "}";
    }
}
