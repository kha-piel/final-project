package org.example.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Represents a single exam question in the system.
 * Follows the Single Responsibility Principle and only holds question data.
 */
public class Question {

    public enum QuestionType {
        MULTIPLE_CHOICE,
        TRUE_FALSE,
        SHORT_ANSWER
    }

    public enum DifficultyLevel {
        NHAN_BIET,
        THONG_HIEU,
        VAN_DUNG,
        VAN_DUNG_CAO
    }

    private int questionId;
    private String subject;
    private String chapter;
    private QuestionType type;
    private DifficultyLevel difficulty;
    private String questionText;
    private List<String> options;
    private List<Answer> answers;
    private String correctAnswer;
    private String explanation;
    private String obsidianSourcePath;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Question() {
        this.answers = new ArrayList<>();
    }

    public Question(int questionId, String subject, String questionText,
                    QuestionType type, DifficultyLevel difficulty,
                    List<String> options, String correctAnswer) {
        this.questionId = questionId;
        this.subject = subject;
        this.questionText = questionText;
        this.type = type;
        this.difficulty = difficulty;
        this.options = options;
        this.answers = new ArrayList<>();
        this.correctAnswer = correctAnswer;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public int getQuestionId() {
        return questionId;
    }

    public void setQuestionId(int questionId) {
        this.questionId = questionId;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getChapter() {
        return chapter;
    }

    public void setChapter(String chapter) {
        this.chapter = chapter;
    }

    public QuestionType getType() {
        return type;
    }

    public void setType(QuestionType type) {
        this.type = type;
    }

    public DifficultyLevel getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(DifficultyLevel difficulty) {
        this.difficulty = difficulty;
    }

    public String getQuestionText() {
        return questionText;
    }

    public void setQuestionText(String questionText) {
        this.questionText = questionText;
    }

    public List<String> getOptions() {
        return options;
    }

    public void setOptions(List<String> options) {
        this.options = options;
    }

    public List<Answer> getAnswers() {
        return answers;
    }

    public void setAnswers(List<Answer> answers) {
        this.answers = answers;
    }

    public List<Answer> getListAnswers() {
        return answers;
    }

    public void setListAnswers(List<Answer> listAnswers) {
        this.answers = listAnswers;
    }

    public String getCorrectAnswer() {
        return correctAnswer;
    }

    public void setCorrectAnswer(String correctAnswer) {
        this.correctAnswer = correctAnswer;
    }

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }

    public String getObsidianSourcePath() {
        return obsidianSourcePath;
    }

    public void setObsidianSourcePath(String obsidianSourcePath) {
        this.obsidianSourcePath = obsidianSourcePath;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public boolean isCorrect(String answer) {
        return correctAnswer != null && correctAnswer.equalsIgnoreCase(answer);
    }

    @Override
    public String toString() {
        return "Question{id=" + questionId + ", subject='" + subject + "', difficulty=" + difficulty + "}";
    }
}
