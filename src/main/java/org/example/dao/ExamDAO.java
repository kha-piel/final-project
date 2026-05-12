package org.example.dao;

import org.example.model.Exam;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * ExamDAO — Data Access Object cho bảng exams và exam_questions.
 *
 * <p>Cung cấp các thao tác CRUD với đề thi và truy vấn danh sách
 * question_id thuộc một đề thi cụ thể.
 */
public class ExamDAO {

    private final Connection connection;

    public ExamDAO(Connection connection) {
        this.connection = connection;
    }

    // -------------------------------------------------------------------------
    // CRUD cơ bản cho bảng exams
    // -------------------------------------------------------------------------

    /** Tìm đề thi theo ID. */
    public Optional<Exam> findById(int examId) {
        String sql = "SELECT * FROM exams WHERE exam_id = ?";
        try (PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setInt(1, examId);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                return Optional.of(mapRowToExam(rs));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return Optional.empty();
    }

    /** Lấy tất cả đề thi công khai. */
    public List<Exam> findAllPublic() {
        String sql = "SELECT * FROM exams WHERE is_public = 1 ORDER BY created_at DESC";
        List<Exam> exams = new ArrayList<>();
        try (Statement stmt = connection.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) {
                exams.add(mapRowToExam(rs));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return exams;
    }

    // -------------------------------------------------------------------------
    // Truy vấn bảng exam_questions (liên kết đề thi - câu hỏi)
    // -------------------------------------------------------------------------

    /**
     * Lấy danh sách question_id thuộc một đề thi, sắp xếp theo question_order.
     * ExamController dùng danh sách này để lấy chi tiết câu hỏi từ QuestionDAO.
     *
     * @param examId ID đề thi
     * @return danh sách question_id theo thứ tự gốc
     */
    public List<Integer> findQuestionIdsByExamId(int examId) {
        String sql = "SELECT question_id FROM exam_questions WHERE exam_id = ? ORDER BY question_order";
        List<Integer> questionIds = new ArrayList<>();
        try (PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setInt(1, examId);
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) {
                questionIds.add(rs.getInt("question_id"));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return questionIds;
    }

    /**
     * Lấy trọng số điểm (point_weight) của từng câu hỏi trong đề thi.
     * Dùng để tính điểm khi nộp bài.
     *
     * @param examId     ID đề thi
     * @param questionId ID câu hỏi
     * @return trọng số điểm, mặc định 0.25 nếu không tìm thấy
     */
    public double getPointWeight(int examId, int questionId) {
        String sql = "SELECT point_weight FROM exam_questions WHERE exam_id = ? AND question_id = ?";
        try (PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setInt(1, examId);
            stmt.setInt(2, questionId);
            ResultSet rs = stmt.executeQuery();
            if (rs.next()) {
                return rs.getDouble("point_weight");
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return 0.25; // Mặc định: 10 điểm / 40 câu
    }

    // -------------------------------------------------------------------------
    // Helper: Map ResultSet row -> Exam object
    // -------------------------------------------------------------------------

    private Exam mapRowToExam(ResultSet rs) throws SQLException {
        Exam exam = new Exam();
        exam.setExamId(rs.getInt("exam_id"));
        exam.setTitle(rs.getString("title"));
        exam.setDescription(rs.getString("description"));

        int subjectId = rs.getInt("subject_id");
        exam.setSubjectId(rs.wasNull() ? null : subjectId);

        exam.setExamType(rs.getString("exam_type"));
        exam.setDuration(rs.getInt("duration"));
        exam.setTotalQuestions(rs.getInt("total_questions"));
        exam.setPassScore(rs.getDouble("pass_score"));
        exam.setShuffleAnswers(rs.getInt("shuffle_answers") == 1);
        exam.setShuffleQuestions(rs.getInt("shuffle_questions") == 1);
        exam.setPublic(rs.getInt("is_public") == 1);

        int createdBy = rs.getInt("created_by");
        exam.setCreatedBy(rs.wasNull() ? null : createdBy);

        exam.setCreatedAt(rs.getString("created_at"));
        exam.setUpdatedAt(rs.getString("updated_at"));
        return exam;
    }
}
