package org.example.model;

import java.time.LocalDateTime;

/**
 * Exam — Đại diện cho một bộ đề thi / đề luyện tập.
 * Mapping trực tiếp đến bảng "exams" trong CSDL.
 */
public class Exam {

    // -----------------------------------------------------------------
    // Enums
    // -----------------------------------------------------------------

    /** Loại đề thi được hỗ trợ. */
    public enum ExamType {
        OFFICIAL_MOCK,   // Đề minh họa chính thức
        PRACTICE,        // Đề luyện tập
        AI_GENERATED,    // Đề do AI sinh
        CUSTOM           // Đề tùy chỉnh
    }

    // -----------------------------------------------------------------
    // Fields
    // -----------------------------------------------------------------

    private int examId;
    private String title;              // Tên đề thi
    private String description;
    private Integer subjectId;         // Nullable — null nếu đề tổng hợp
    private ExamType examType;
    private int duration;              // Thời gian làm bài (phút)
    private int totalQuestions;        // Tổng số câu
    private double passScore;          // Điểm đạt tối thiểu (thang 10)
    private boolean shuffleAnswers;    // Xáo trộn đáp án
    private boolean shuffleQuestions;  // Xáo trộn câu hỏi
    private boolean isPublic;
    private Integer createdBy;         // user_id người tạo
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // -----------------------------------------------------------------
    // Constructors
    // -----------------------------------------------------------------

    public Exam() {}

    public Exam(int examId, String title, ExamType examType,
                int duration, int totalQuestions) {
        this.examId = examId;
        this.title = title;
        this.examType = examType;
        this.duration = duration;
        this.totalQuestions = totalQuestions;
        this.passScore = 5.0;
        this.shuffleAnswers = true;
        this.shuffleQuestions = false;
        this.isPublic = true;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // -----------------------------------------------------------------
    // Getters & Setters
    // -----------------------------------------------------------------

    public int getExamId() { return examId; }
    public void setExamId(int examId) { this.examId = examId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getSubjectId() { return subjectId; }
    public void setSubjectId(Integer subjectId) { this.subjectId = subjectId; }

    public ExamType getExamType() { return examType; }
    public void setExamType(ExamType examType) { this.examType = examType; }

    public int getDuration() { return duration; }
    public void setDuration(int duration) { this.duration = duration; }

    public int getTotalQuestions() { return totalQuestions; }
    public void setTotalQuestions(int totalQuestions) { this.totalQuestions = totalQuestions; }

    public double getPassScore() { return passScore; }
    public void setPassScore(double passScore) { this.passScore = passScore; }

    public boolean isShuffleAnswers() { return shuffleAnswers; }
    public void setShuffleAnswers(boolean shuffleAnswers) { this.shuffleAnswers = shuffleAnswers; }

    public boolean isShuffleQuestions() { return shuffleQuestions; }
    public void setShuffleQuestions(boolean shuffleQuestions) { this.shuffleQuestions = shuffleQuestions; }

    public boolean isPublic() { return isPublic; }
    public void setPublic(boolean isPublic) { this.isPublic = isPublic; }

    public Integer getCreatedBy() { return createdBy; }
    public void setCreatedBy(Integer createdBy) { this.createdBy = createdBy; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    @Override
    public String toString() {
        return "Exam{id=" + examId + ", title='" + title + "', type=" + examType + "}";
    }
}
