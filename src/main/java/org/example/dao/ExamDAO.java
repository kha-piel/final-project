package org.example.dao;

import org.example.model.Exam;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * ExamDAO - Data Access Object cho bang exams va exam_questions.
 */
public class ExamDAO {

    private final Connection connection;

    public ExamDAO(Connection connection) {
        this.connection = connection;
    }

    /** Tim de thi theo ID. */
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

    /** Lay tat ca de thi cong khai. */
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

    /** Lay danh sach tat ca de thi de hien thi len giao dien. */
    public List<Exam> getAllExams() {
        List<Exam> exams = new ArrayList<>();
        String sql = "SELECT exam_id, title, duration FROM exams";

        try (PreparedStatement stmt = connection.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {

            while (rs.next()) {
                Exam exam = new Exam();
                exam.setExamId(rs.getInt("exam_id"));
                exam.setTitle(rs.getString("title"));
                exam.setDuration(rs.getInt("duration"));
                exams.add(exam);
            }
        } catch (SQLException e) {
            System.err.println("Loi khi lay danh sach de thi: " + e.getMessage());
            e.printStackTrace();
        }

        return exams;
    }

    /**
     * Lay danh sach question_id thuoc mot de thi, sap xep theo question_order.
     *
     * @param examId ID de thi
     * @return danh sach question_id theo thu tu goc
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
     * Lay trong so diem cua tung cau hoi trong de thi.
     *
     * @param examId ID de thi
     * @param questionId ID cau hoi
     * @return trong so diem, mac dinh 0.25 neu khong tim thay
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
        return 0.25;
    }

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
