package org.example.model;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Represents a single exam question in the system.
 * Follows the Single Responsibility Principle — only holds question data,
 * no business logic or persistence concerns.
 */
public class Question {

    // -------------------------------------------------------------------------
    // Enums
    // -------------------------------------------------------------------------

    /** Supported question types in the THPTQG exam system. */
    public enum QuestionType {
        MULTIPLE_CHOICE,    // Trắc nghiệm 4 đáp án
        TRUE_FALSE,         // Đúng / Sai (dạng mới)
        SHORT_ANSWER        // Trả lời ngắn
    }

    /** Difficulty levels aligned with Bloom's taxonomy tiers. */
    public enum DifficultyLevel {
        NHAN_BIET,      // Nhận biết
        THONG_HIEU,     // Thông hiểu
        VAN_DUNG,       // Vận dụng
        VAN_DUNG_CAO    // Vận dụng cao
    }

    // -------------------------------------------------------------------------
    // Fields
    // -------------------------------------------------------------------------

    private int questionId;
    private String subject;          // Môn học (Toán, Lý, Hóa, …)
    private String chapter;          // Chương / chủ đề
    private QuestionType type;
    private DifficultyLevel difficulty;
    private String questionText;     // Nội dung câu hỏi (hỗ trợ Markdown/LaTeX)
    private List<String> options;    // Danh sách đáp án (A, B, C, D)
    private String correctAnswer;    // Đáp án đúng
    private String explanation;      // Giải thích đáp án (có thể do AI tạo)
    private String obsidianSourcePath; // Đường dẫn file .md nguồn trong Obsidian vault
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // -------------------------------------------------------------------------
    // Constructors
    // -------------------------------------------------------------------------

    public Question() {}

    public Question(int questionId, String subject, String questionText,
                    QuestionType type, DifficultyLevel difficulty,
                    List<String> options, String correctAnswer) {
        this.questionId = questionId;
        this.subject = subject;
        this.questionText = questionText;
        this.type = type;
        this.difficulty = difficulty;
        this.options = options;
        this.correctAnswer = correctAnswer;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // -------------------------------------------------------------------------
    // Getters & Setters
    // -------------------------------------------------------------------------

    public int getQuestionId() { return questionId; }
    public void setQuestionId(int questionId) { this.questionId = questionId; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getChapter() { return chapter; }
    public void setChapter(String chapter) { this.chapter = chapter; }

    public QuestionType getType() { return type; }
    public void setType(QuestionType type) { this.type = type; }

    public DifficultyLevel getDifficulty() { return difficulty; }
    public void setDifficulty(DifficultyLevel difficulty) { this.difficulty = difficulty; }

    public String getQuestionText() { return questionText; }
    public void setQuestionText(String questionText) { this.questionText = questionText; }

    public List<String> getOptions() { return options; }
    public void setOptions(List<String> options) { this.options = options; }

    public String getCorrectAnswer() { return correctAnswer; }
    public void setCorrectAnswer(String correctAnswer) { this.correctAnswer = correctAnswer; }

    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }

    public String getObsidianSourcePath() { return obsidianSourcePath; }
    public void setObsidianSourcePath(String obsidianSourcePath) { this.obsidianSourcePath = obsidianSourcePath; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    // -------------------------------------------------------------------------
    // Utility
    // -------------------------------------------------------------------------

    /**
     * Checks whether the given answer matches the correct answer.
     * Pure function — no side effects.
     *
     * @param answer the user's selected answer
     * @return true if correct
     */
    public boolean isCorrect(String answer) {
        return correctAnswer != null && correctAnswer.equalsIgnoreCase(answer);
    }

    @Override
    public String toString() {
        return "Question{id=" + questionId + ", subject='" + subject + "', difficulty=" + difficulty + "}";
    }
}
