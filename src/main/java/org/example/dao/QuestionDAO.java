package org.example.dao;

import org.example.model.Question;
import org.example.model.Question.DifficultyLevel;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.Optional;

/**
 * QuestionDAO — Data Access Object cho bảng questions trong CSDL.
 *
 * Tất cả SQL queries liên quan đến Question đều tập trung tại đây.
 * Controller và Service KHÔNG được viết SQL trực tiếp.
 */
public class QuestionDAO {

    private final Connection connection;

    public QuestionDAO(Connection connection) {
        this.connection = connection;
    }

    /** Lưu câu hỏi mới vào DB. */
    public void save(Question question) {
        // TODO: PreparedStatement INSERT INTO questions (...)
    }

    /** Cập nhật câu hỏi đã có. */
    public void update(Question question) {
        // TODO: PreparedStatement UPDATE questions SET ...
    }

    /** Xóa câu hỏi theo ID. */
    public void delete(int questionId) {
        // TODO: PreparedStatement DELETE FROM questions WHERE id = ?
    }

    /** Tìm câu hỏi theo ID. */
    public Optional<Question> findById(int questionId) {
        String sql = "SELECT * FROM questions WHERE question_id = ?";
        try (PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setInt(1, questionId);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                return Optional.of(mapRowToQuestion(rs));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return Optional.empty();
    }

    /** Lấy ngẫu nhiên 1 câu hỏi đang có trong DB. */
    public Question getRandomQuestion() {
        String sql = "SELECT * FROM questions ORDER BY RANDOM() LIMIT 1";
        try (PreparedStatement stmt = connection.prepareStatement(sql)) {
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                return mapRowToQuestion(rs);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    /** Lấy câu hỏi theo môn học và độ khó (dùng cho QuizController.startQuiz). */
    public List<Question> findBySubjectAndDifficulty(String subject, DifficultyLevel difficulty, int limit) {
        // TODO: SELECT * FROM questions WHERE subject = ? AND difficulty = ? LIMIT ?
        return List.of();
    }

    /** Lấy toàn bộ câu hỏi (dùng cho màn hình quản lý). */
    public List<Question> findAll() {
        // TODO: SELECT * FROM questions ORDER BY created_at DESC
        return List.of();
    }

    /** Kiểm tra câu hỏi từ file Obsidian đã tồn tại chưa (tránh import trùng). */
    public boolean existsByObsidianPath(String filePath) {
        // TODO: SELECT COUNT(*) FROM questions WHERE obsidian_source_path = ?
        return false;
    }

    private Question mapRowToQuestion(ResultSet rs) throws SQLException {
        Question q = new Question();
        q.setQuestionId(rs.getInt("question_id"));
        q.setQuestionText(rs.getString("content"));
        q.setSubject(readIfPresent(rs, "subject"));
        q.setChapter(readIfPresent(rs, "chapter"));
        q.setExplanation(readIfPresent(rs, "explanation"));
        q.setObsidianSourcePath(readIfPresent(rs, "obsidian_source_path"));
        return q;
    }

    private String readIfPresent(ResultSet rs, String columnName) {
        try {
            return rs.getString(columnName);
        } catch (SQLException ignored) {
            return null;
        }
    }
}
