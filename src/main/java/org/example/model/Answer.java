package org.example.model;

/**
 * Answer — Đại diện cho một phương án trả lời (A, B, C, D) của câu hỏi.
 * Mapping trực tiếp đến bảng "answers" trong CSDL.
 */
public class Answer {

    private int answerId;
    private int questionId;
    private String optionLabel;    // 'A', 'B', 'C', 'D'
    private String content;        // Nội dung phương án
    private boolean isCorrect;     // true = đáp án đúng
    private String explanation;    // Lời giải chi tiết
    private int displayOrder;      // Thứ tự hiển thị

    // -----------------------------------------------------------------
    // Constructors
    // -----------------------------------------------------------------

    public Answer() {}

    public Answer(int answerId, int questionId, String optionLabel,
                  String content, boolean isCorrect) {
        this.answerId = answerId;
        this.questionId = questionId;
        this.optionLabel = optionLabel;
        this.content = content;
        this.isCorrect = isCorrect;
    }

    // -----------------------------------------------------------------
    // Getters & Setters
    // -----------------------------------------------------------------

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

    @Override
    public String toString() {
        return "Answer{label='" + optionLabel + "', correct=" + isCorrect + "}";
    }
}
