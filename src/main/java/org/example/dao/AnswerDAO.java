package org.example.dao;

import org.example.model.Answer;

import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class AnswerDAO {

    private final Connection connection;

    public AnswerDAO(Connection connection) {
        this.connection = connection;
    }

    public List<Answer> findByQuestionId(int questionId) {
        String orderClause = buildOrderClause();
        String sql = "SELECT * FROM answers WHERE question_id = ?" + orderClause;
        List<Answer> answers = new ArrayList<>();
        try (PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setInt(1, questionId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    answers.add(mapRowToAnswer(rs));
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return answers;
    }

    public List<Answer> getAnswersByQuestionId(int questionId) {
        return findByQuestionId(questionId);
    }

    public Answer findCorrectAnswer(int questionId) {
        String sql = "SELECT * FROM answers WHERE question_id = ? AND is_correct = 1 LIMIT 1";
        try (PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setInt(1, questionId);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return mapRowToAnswer(rs);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    public Answer findById(int answerId) {
        String idColumn = resolveAnswerIdColumn();
        String sql = "SELECT * FROM answers WHERE " + idColumn + " = ?";
        try (PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setInt(1, answerId);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return mapRowToAnswer(rs);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    private Answer mapRowToAnswer(ResultSet rs) throws SQLException {
        Answer answer = new Answer();
        answer.setAnswerId(readInt(rs, "answer_id", "id"));
        answer.setQuestionId(rs.getInt("question_id"));
        answer.setOptionLabel(readString(rs, "option_label", ""));
        answer.setContent(rs.getString("content"));
        answer.setCorrect(rs.getInt("is_correct") == 1);
        answer.setExplanation(readString(rs, "explanation", null));
        answer.setDisplayOrder(readInt(rs, "display_order", 0));
        return answer;
    }

    private String buildOrderClause() {
        try {
            boolean hasDisplayOrder = hasColumn("answers", "display_order");
            boolean hasOptionLabel = hasColumn("answers", "option_label");
            boolean hasAnswerId = hasColumn("answers", "answer_id");

            if (hasDisplayOrder && hasOptionLabel) {
                return " ORDER BY display_order, option_label";
            }
            if (hasAnswerId) {
                return " ORDER BY answer_id";
            }
        } catch (SQLException ignored) {
            return " ORDER BY id";
        }

        return " ORDER BY id";
    }

    private String resolveAnswerIdColumn() {
        try {
            return hasColumn("answers", "answer_id") ? "answer_id" : "id";
        } catch (SQLException e) {
            return "id";
        }
    }

    private int readInt(ResultSet rs, String preferredColumn, String fallbackColumn) throws SQLException {
        try {
            return rs.getInt(preferredColumn);
        } catch (SQLException ignored) {
            return rs.getInt(fallbackColumn);
        }
    }

    private int readInt(ResultSet rs, String columnName, int fallbackValue) {
        try {
            return rs.getInt(columnName);
        } catch (SQLException ignored) {
            return fallbackValue;
        }
    }

    private String readString(ResultSet rs, String columnName, String fallbackValue) {
        try {
            return rs.getString(columnName);
        } catch (SQLException ignored) {
            return fallbackValue;
        }
    }

    private boolean hasColumn(String tableName, String columnName) throws SQLException {
        DatabaseMetaData metaData = connection.getMetaData();
        try (ResultSet rs = metaData.getColumns(null, null, tableName, columnName)) {
            return rs.next();
        }
    }
}
