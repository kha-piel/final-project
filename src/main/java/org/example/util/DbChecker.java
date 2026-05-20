package org.example.util;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class DbChecker {

    private static final String DB_URL = "jdbc:sqlite:thptqg_ai.db";

    public static void main(String[] args) {
        try (Connection connection = DriverManager.getConnection(DB_URL)) {
            System.out.println("Ket noi DB thanh cong: " + DB_URL);
            System.out.println();

            printExamCount(connection);
            System.out.println();
            printQuestionCountPerExam(connection);
        } catch (SQLException e) {
            System.err.println("Khong the ket noi hoac doc database: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private static void printExamCount(Connection connection) throws SQLException {
        String sql = "SELECT COUNT(*) AS total_exams FROM exams";

        try (PreparedStatement stmt = connection.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {

            if (rs.next()) {
                System.out.println("Tong so de thi trong bang exams: " + rs.getInt("total_exams"));
            }
        }
    }

    private static void printQuestionCountPerExam(Connection connection) throws SQLException {
        String sql = """
                SELECT
                    e.exam_id,
                    e.title,
                    COUNT(eq.question_id) AS total_questions
                FROM exams e
                LEFT JOIN exam_questions eq ON e.exam_id = eq.exam_id
                LEFT JOIN questions q ON q.question_id = eq.question_id
                GROUP BY e.exam_id, e.title
                ORDER BY e.exam_id
                """;

        try (PreparedStatement stmt = connection.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {

            System.out.println("So luong cau hoi cua tung de thi:");
            while (rs.next()) {
                int examId = rs.getInt("exam_id");
                String title = rs.getString("title");
                int totalQuestions = rs.getInt("total_questions");

                System.out.println(
                        "- exam_id = " + examId
                                + ", title = " + title
                                + ", total_questions = " + totalQuestions
                );
            }
        }
    }
}
