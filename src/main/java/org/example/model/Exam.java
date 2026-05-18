package org.example.model;

/**
 * Exam — Model đại diện cho một đề thi trong hệ thống.
 * Ánh xạ 1:1 với bảng `exams` trong CSDL SQLite.
 *
 * <p>Chỉ chứa dữ liệu thuần, không chứa logic nghiệp vụ.
 */
public class Exam {

    // -------------------------------------------------------------------------
    // Fields (ánh xạ từ bảng exams trong database.sql)
    // -------------------------------------------------------------------------

    private int examId;
    private String title;              // Tên đề thi (VD: "Đề minh họa Toán 2024")
    private String description;        // Mô tả đề thi
    private Integer subjectId;         // FK đến bảng subjects (null nếu đề tổng hợp)
    private String examType;           // 'official_mock', 'practice', 'ai_generated', 'custom'
    private int duration;              // Thời gian làm bài (phút)
    private int totalQuestions;        // Tổng số câu hỏi trong đề
    private double passScore;          // Điểm đạt tối thiểu (thang 10)
    private boolean shuffleAnswers;    // true = xáo trộn đáp án
    private boolean shuffleQuestions;  // true = xáo trộn câu hỏi
    private boolean isPublic;          // true = đề công khai
    private Integer createdBy;         // user_id giáo viên tạo
    private String createdAt;
    private String updatedAt;

    // -------------------------------------------------------------------------
    // Constructors
    // -------------------------------------------------------------------------

    public Exam() {}

    public Exam(int examId, String title, int duration, int totalQuestions) {
        this.examId = examId;
        this.title = title;
        this.duration = duration;
        this.totalQuestions = totalQuestions;
    }

    // -------------------------------------------------------------------------
    // Getters & Setters
    // -------------------------------------------------------------------------

    public int getExamId() { return examId; }
    public void setExamId(int examId) { this.examId = examId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getSubjectId() { return subjectId; }
    public void setSubjectId(Integer subjectId) { this.subjectId = subjectId; }

    public String getExamType() { return examType; }
    public void setExamType(String examType) { this.examType = examType; }

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

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }

    // -------------------------------------------------------------------------
    // Utility
    // -------------------------------------------------------------------------

    @Override
    public String toString() {
        return "Exam{id=" + examId + ", title='" + title + "', duration=" + duration
             + "min, questions=" + totalQuestions + "}";
    }
}
