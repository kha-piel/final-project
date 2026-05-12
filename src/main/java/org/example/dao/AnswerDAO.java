package org.example.dao;

import org.example.model.Answer;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * AnswerDAO — Data Access Object cho bảng answers.
 *
 * <p>Cung cấp phương thức truy vấn đáp án theo question_id
 * và tìm đáp án đúng cho một câu hỏi.
 */
public class AnswerDAO {

    private final Connection connection;

    public AnswerDAO(Connection connection) {
        this.connection = connection;
    }

    /**
     * Lấy tất cả đáp án (A, B, C, D) của một câu hỏi.
     * Sắp xếp theo display_order gốc.
     *
     * @param questionId ID câu hỏi
     * @return danh sách Answer, thường gồm 4 phương án
     */
    public List<Answer> findByQuestionId(int questionId) {
        String sql = "SELECT * FROM answers WHERE question_id = ? ORDER BY display_order, option_label";
        List<Answer> answers = new ArrayList<>();
        try (PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setInt(1, questionId);
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                answers.add(mapRowToAnswer(rs));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return answers;
    }

    /**
     * Tìm đáp án đúng của một câu hỏi.
     *
     * @param questionId ID câu hỏi
     * @return Answer đúng, hoặc null nếu không tìm thấy
     */
    public Answer findCorrectAnswer(int questionId) {
        String sql = "SELECT * FROM answers WHERE question_id = ? AND is_correct = 1 LIMIT 1";
        try (PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setInt(1, questionId);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                return mapRowToAnswer(rs);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    /**
     * Tìm đáp án theo answer_id.
     *
     * @param answerId ID đáp án
     * @return Answer hoặc null
     */
    public Answer findById(int answerId) {
        String sql = "SELECT * FROM answers WHERE answer_id = ?";
        try (PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setInt(1, answerId);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                return mapRowToAnswer(rs);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    // -------------------------------------------------------------------------
    // Helper: Map ResultSet row -> Answer object
    // -------------------------------------------------------------------------

    private Answer mapRowToAnswer(ResultSet rs) throws SQLException {
        Answer answer = new Answer();
        answer.setAnswerId(rs.getInt("answer_id"));
        answer.setQuestionId(rs.getInt("question_id"));
        answer.setOptionLabel(rs.getString("option_label"));
        answer.setContent(rs.getString("content"));
        answer.setCorrect(rs.getInt("is_correct") == 1);
        answer.setExplanation(rs.getString("explanation"));
        answer.setDisplayOrder(rs.getInt("display_order"));
        return answer;
    }
}
