package org.example.dao;

import org.example.model.StudentAttempt;

import java.sql.Connection;
import java.util.List;
import java.util.Optional;

/**
 * StudentAttemptDAO — Data Access Object cho bảng student_attempts.
 * Quản lý lịch sử làm bài thi của học sinh.
 */
public class StudentAttemptDAO {

    private final Connection connection;

    public StudentAttemptDAO(Connection connection) {
        this.connection = connection;
    }

    /** Lưu lần thi mới vào CSDL, trả về attempt_id được sinh. */
    public int save(StudentAttempt attempt) {
        // TODO: INSERT INTO student_attempts (...) RETURNING attempt_id
        return -1;
    }

    /** Cập nhật kết quả sau khi nộp bài. */
    public void update(StudentAttempt attempt) {
        // TODO: UPDATE student_attempts SET score=?, correct_count=?, ... WHERE attempt_id=?
    }

    /** Tìm lần thi theo ID. */
    public Optional<StudentAttempt> findById(int attemptId) {
        // TODO: SELECT * FROM student_attempts WHERE attempt_id = ?
        return Optional.empty();
    }

    /** Lấy lịch sử thi của một học sinh, sắp xếp mới nhất trước. */
    public List<StudentAttempt> findByUserId(int userId) {
        // TODO: SELECT * FROM student_attempts WHERE user_id = ? ORDER BY started_at DESC
        return List.of();
    }

    /** Lấy lịch sử thi của một học sinh cho một đề cụ thể. */
    public List<StudentAttempt> findByUserAndExam(int userId, int examId) {
        // TODO: SELECT * FROM student_attempts WHERE user_id = ? AND exam_id = ?
        return List.of();
    }
}
