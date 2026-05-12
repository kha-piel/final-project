package org.example.dao;

import org.example.model.StudentAttempt;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * StudentAttemptDAO — Data Access Object cho bảng student_attempts.
 *
 * <p>Cung cấp các thao tác: tạo mới phiên thi (INSERT),
 * cập nhật kết quả khi nộp bài (UPDATE), và truy vấn lịch sử thi.
 */
public class StudentAttemptDAO {

    private final Connection connection;

    public StudentAttemptDAO(Connection connection) {
        this.connection = connection;
    }

    /**
     * Lưu một phiên thi mới vào CSDL (status = 'in_progress').
     * Sau khi INSERT, attemptId tự sinh (AUTOINCREMENT) sẽ được set lại vào object.
     *
     * @param attempt đối tượng StudentAttempt cần lưu
     * @return attemptId vừa được sinh, hoặc -1 nếu thất bại
     */
    public int save(StudentAttempt attempt) {
        String sql = "INSERT INTO student_attempts (user_id, exam_id, status) VALUES (?, ?, ?)";
        try (PreparedStatement stmt = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            stmt.setInt(1, attempt.getUserId());
            stmt.setInt(2, attempt.getExamId());
            stmt.setString(3, attempt.getStatus());
            stmt.executeUpdate();

            // Lấy attempt_id vừa được sinh tự động
            ResultSet keys = stmt.getGeneratedKeys();
            if (keys.next()) {
                int generatedId = keys.getInt(1);
                attempt.setAttemptId(generatedId);
                return generatedId;
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return -1;
    }

    /**
     * Cập nhật kết quả phiên thi sau khi học sinh nộp bài.
     * Cập nhật: score, correct_count, wrong_count, skipped_count,
     * total_time_taken, status, completed_at.
     *
     * @param attempt đối tượng StudentAttempt đã được cập nhật kết quả
     */
    public void update(StudentAttempt attempt) {
        String sql = """
            UPDATE student_attempts 
            SET score = ?, correct_count = ?, wrong_count = ?, skipped_count = ?,
                total_time_taken = ?, status = ?, completed_at = ?, ai_feedback = ?
            WHERE attempt_id = ?
            """;
        try (PreparedStatement stmt = connection.prepareStatement(sql)) {
            if (attempt.getScore() != null) {
                stmt.setDouble(1, attempt.getScore());
            } else {
                stmt.setNull(1, Types.REAL);
            }
            stmt.setInt(2, attempt.getCorrectCount());
            stmt.setInt(3, attempt.getWrongCount());
            stmt.setInt(4, attempt.getSkippedCount());

            if (attempt.getTotalTimeTaken() != null) {
                stmt.setInt(5, attempt.getTotalTimeTaken());
            } else {
                stmt.setNull(5, Types.INTEGER);
            }
            stmt.setString(6, attempt.getStatus());
            stmt.setString(7, attempt.getCompletedAt());
            stmt.setString(8, attempt.getAiFeedback());
            stmt.setInt(9, attempt.getAttemptId());
            stmt.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    /** Tìm phiên thi theo ID. */
    public StudentAttempt findById(int attemptId) {
        String sql = "SELECT * FROM student_attempts WHERE attempt_id = ?";
        try (PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setInt(1, attemptId);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                return mapRowToAttempt(rs);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    /** Lấy lịch sử thi của một user (mới nhất trước). */
    public List<StudentAttempt> findByUserId(int userId) {
        String sql = "SELECT * FROM student_attempts WHERE user_id = ? ORDER BY started_at DESC";
        List<StudentAttempt> attempts = new ArrayList<>();
        try (PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setInt(1, userId);
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                attempts.add(mapRowToAttempt(rs));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return attempts;
    }

    // -------------------------------------------------------------------------
    // Helper: Map ResultSet row -> StudentAttempt object
    // -------------------------------------------------------------------------

    private StudentAttempt mapRowToAttempt(ResultSet rs) throws SQLException {
        StudentAttempt attempt = new StudentAttempt();
        attempt.setAttemptId(rs.getInt("attempt_id"));
        attempt.setUserId(rs.getInt("user_id"));
        attempt.setExamId(rs.getInt("exam_id"));

        double score = rs.getDouble("score");
        attempt.setScore(rs.wasNull() ? null : score);

        attempt.setCorrectCount(rs.getInt("correct_count"));
        attempt.setWrongCount(rs.getInt("wrong_count"));
        attempt.setSkippedCount(rs.getInt("skipped_count"));

        int timeTaken = rs.getInt("total_time_taken");
        attempt.setTotalTimeTaken(rs.wasNull() ? null : timeTaken);

        attempt.setStatus(rs.getString("status"));
        attempt.setStartedAt(rs.getString("started_at"));
        attempt.setCompletedAt(rs.getString("completed_at"));
        attempt.setAiFeedback(rs.getString("ai_feedback"));
        return attempt;
    }
}
