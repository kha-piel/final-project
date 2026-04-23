package org.example.dao;

import org.example.model.Exam;

import java.sql.Connection;
import java.util.List;
import java.util.Optional;

/**
 * ExamDAO — Data Access Object cho bảng exams và exam_questions.
 * Quản lý truy vấn đề thi và quan hệ đề thi - câu hỏi.
 */
public class ExamDAO {

    private final Connection connection;

    public ExamDAO(Connection connection) {
        this.connection = connection;
    }

    /** Tìm đề thi theo ID. */
    public Optional<Exam> findById(int examId) {
        // TODO: SELECT * FROM exams WHERE exam_id = ?
        return Optional.empty();
    }

    /** Lấy danh sách question_id thuộc đề thi, sắp xếp theo thứ tự. */
    public List<Integer> findQuestionIdsByExamId(int examId) {
        // TODO: SELECT question_id FROM exam_questions WHERE exam_id = ? ORDER BY question_order
        return List.of();
    }

    /** Lấy điểm mỗi câu (point_weight) theo đề thi. */
    public double getPointWeight(int examId) {
        // TODO: SELECT point_weight FROM exam_questions WHERE exam_id = ? LIMIT 1
        return 0.25;
    }

    /** Lưu đề thi mới. */
    public void save(Exam exam) {
        // TODO: INSERT INTO exams (...)
    }

    /** Lấy tất cả đề thi công khai. */
    public List<Exam> findAllPublic() {
        // TODO: SELECT * FROM exams WHERE is_public = 1 ORDER BY created_at DESC
        return List.of();
    }
}
