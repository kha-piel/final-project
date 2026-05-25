package org.example.model;

public class ExamHistoryDTO {

    private int attemptId;
    private String examTitle;
    private String submitTime;
    private double score;
    private String correctRatio;

    public ExamHistoryDTO() {
    }

    public int getAttemptId() {
        return attemptId;
    }

    public void setAttemptId(int attemptId) {
        this.attemptId = attemptId;
    }

    public String getExamTitle() {
        return examTitle;
    }

    public void setExamTitle(String examTitle) {
        this.examTitle = examTitle;
    }

    public String getSubmitTime() {
        return submitTime;
    }

    public void setSubmitTime(String submitTime) {
        this.submitTime = submitTime;
    }

    public double getScore() {
        return score;
    }

    public void setScore(double score) {
        this.score = score;
    }

    public String getCorrectRatio() {
        return correctRatio;
    }

    public void setCorrectRatio(String correctRatio) {
        this.correctRatio = correctRatio;
    }
}
