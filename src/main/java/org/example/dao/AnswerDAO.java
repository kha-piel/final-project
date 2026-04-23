package org.example.dao;

import org.example.model.Answer;

import java.sql.Connection;
import java.util.List;

/**
 * AnswerDAO — Data Access Object cho bảng answers trong CSDL.
 * Tập trung toàn bộ SQL liên quan đến đáp án tại đây.
 */
public class AnswerDAO {

    private final Connection connection;

    public AnswerDAO(Connection connection) {
        this.connection = connection;
    }

    /** Lấy tất cả đáp án của một câu hỏi theo question_id. */
    public List<Answer> findByQuestionId(int questionId) {
        // TODO: SELECT * FROM answers WHERE question_id = ? ORDER BY display_order
        return List.of();
    }

    /** Lấy đáp án đúng của một câu hỏi. */
    public Answer findCorrectAnswer(int questionId) {
        // TODO: SELECT * FROM answers WHERE question_id = ? AND is_correct = 1
        return null;
    }

    /** Lưu đáp án mới. */
    public void save(Answer answer) {
        // TODO: INSERT INTO answers (...)
    }

    /** Xóa tất cả đáp án của một câu hỏi. */
    public void deleteByQuestionId(int questionId) {
        // TODO: DELETE FROM answers WHERE question_id = ?
    }
}
