package org.example.model;

/**
 * Answer — Model đại diện cho một phương án trả lời (A/B/C/D).
 * Ánh xạ 1:1 với bảng `answers` trong CSDL SQLite.
 *
 * <p>Mỗi câu hỏi (Question) có nhiều Answer (thường là 4).
 * Trường {@code isCorrect} xác định đáp án đúng.
 */
public class Answer {

    // -------------------------------------------------------------------------
    // Fields (ánh xạ từ bảng answers trong database.sql)
    // -------------------------------------------------------------------------

    private int answerId;
    private int questionId;        // FK đến bảng questions
    private String optionLabel;    // 'A', 'B', 'C', 'D'
    private String content;        // Nội dung phương án (Markdown/LaTeX)
    private boolean isCorrect;     // true = đáp án đúng
    private String explanation;    // Lời giải chi tiết (có thể null)
    private int displayOrder;      // Thứ tự hiển thị gốc

    // -------------------------------------------------------------------------
    // Constructors
    // -------------------------------------------------------------------------

    public Answer() {}

    public Answer(int answerId, int questionId, String optionLabel,
                  String content, boolean isCorrect) {
        this.answerId = answerId;
        this.questionId = questionId;
        this.optionLabel = optionLabel;
        this.content = content;
        this.isCorrect = isCorrect;
    }

    // -------------------------------------------------------------------------
    // Getters & Setters
    // -------------------------------------------------------------------------

    public int getAnswerId() { return answerId; }
    public void setAnswerId(int answerId) { this.answerId = answerId; }

    public int getQuestionId() { return questionId; }
    public void setQuestionId(int questionId) { this.questionId = questionId; }

    public String getOptionLabel() { return optionLabel; }
    public void setOptionLabel(String optionLabel) { this.optionLabel = optionLabel; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public boolean isCorrect() { return isCorrect; }
    public void setCorrect(boolean correct) { isCorrect = correct; }

    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }

    public int getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(int displayOrder) { this.displayOrder = displayOrder; }

    // -------------------------------------------------------------------------
    // Utility
    // -------------------------------------------------------------------------

    @Override
    public String toString() {
        return optionLabel + ". " + content + (isCorrect ? " [CORRECT]" : "");
    }
}
