package org.example.model;

import java.time.LocalDateTime;

/**
 * StudentAttempt — Ghi nhận mỗi lần học sinh làm một bài thi.
 * Mapping trực tiếp đến bảng "student_attempts" trong CSDL.
 */
public class StudentAttempt {

    // -----------------------------------------------------------------
    // Enums
    // -----------------------------------------------------------------

    /** Trạng thái của lần thi. */
    public enum AttemptStatus {
        IN_PROGRESS,   // Đang làm bài
        COMPLETED,     // Đã hoàn thành
        ABANDONED      // Bỏ dở
    }

    // -----------------------------------------------------------------
    // Fields
    // -----------------------------------------------------------------

    private int attemptId;
    private int userId;
    private int examId;
    private double score;           // Điểm thang 10
    private int correctCount;       // Số câu đúng
    private int wrongCount;         // Số câu sai
    private int skippedCount;       // Số câu bỏ qua
    private int totalTimeTaken;     // Thời gian thực tế (giây)
    private AttemptStatus status;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private String aiFeedback;      // Nhận xét tổng thể của AI

    // -----------------------------------------------------------------
    // Constructors
    // -----------------------------------------------------------------

    public StudentAttempt() {
        this.status = AttemptStatus.IN_PROGRESS;
        this.startedAt = LocalDateTime.now();
    }

    public StudentAttempt(int userId, int examId) {
        this();
        this.userId = userId;
        this.examId = examId;
    }

    // -----------------------------------------------------------------
    // Getters & Setters
    // -----------------------------------------------------------------

    public int getAttemptId() { return attemptId; }
    public void setAttemptId(int attemptId) { this.attemptId = attemptId; }

    public int getUserId() { return userId; }
    public void setUserId(int userId) { this.userId = userId; }

    public int getExamId() { return examId; }
    public void setExamId(int examId) { this.examId = examId; }

    public double getScore() { return score; }
    public void setScore(double score) { this.score = score; }

    public int getCorrectCount() { return correctCount; }
    public void setCorrectCount(int correctCount) { this.correctCount = correctCount; }

    public int getWrongCount() { return wrongCount; }
    public void setWrongCount(int wrongCount) { this.wrongCount = wrongCount; }

    public int getSkippedCount() { return skippedCount; }
    public void setSkippedCount(int skippedCount) { this.skippedCount = skippedCount; }

    public int getTotalTimeTaken() { return totalTimeTaken; }
    public void setTotalTimeTaken(int totalTimeTaken) { this.totalTimeTaken = totalTimeTaken; }

    public AttemptStatus getStatus() { return status; }
    public void setStatus(AttemptStatus status) { this.status = status; }

    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }

    public String getAiFeedback() { return aiFeedback; }
    public void setAiFeedback(String aiFeedback) { this.aiFeedback = aiFeedback; }

    @Override
    public String toString() {
        return "StudentAttempt{id=" + attemptId
                + ", userId=" + userId
                + ", examId=" + examId
                + ", score=" + score
                + ", status=" + status + "}";
    }
}
