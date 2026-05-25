package org.example.model;

public class BookmarkedQuestionDTO {

    private final int questionId;
    private final String questionContent;
    private final String subject;
    private final String chapter;
    private final String bookmarkedAt;

    public BookmarkedQuestionDTO(int questionId,
                                 String questionContent,
                                 String subject,
                                 String chapter,
                                 String bookmarkedAt) {
        this.questionId = questionId;
        this.questionContent = questionContent;
        this.subject = subject;
        this.chapter = chapter;
        this.bookmarkedAt = bookmarkedAt;
    }

    public int getQuestionId() {
        return questionId;
    }

    public String getQuestionContent() {
        return questionContent;
    }

    public String getSubject() {
        return subject;
    }

    public String getChapter() {
        return chapter;
    }

    public String getBookmarkedAt() {
        return bookmarkedAt;
    }

    public String getTopicLabel() {
        boolean hasSubject = subject != null && !subject.isBlank();
        boolean hasChapter = chapter != null && !chapter.isBlank();

        if (hasSubject && hasChapter) {
            return subject + " - " + chapter;
        }
        if (hasChapter) {
            return chapter;
        }
        if (hasSubject) {
            return subject;
        }
        return "Chua xac dinh chuyen de";
    }
}
