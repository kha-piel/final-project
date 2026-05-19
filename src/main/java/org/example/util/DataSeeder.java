package org.example.util;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.LinkedHashMap;
import java.util.Map;

public class DataSeeder {

    private static final String DB_URL = "jdbc:sqlite:thptqg_ai.db";
    private static final int EXAM_ID = 1;

    public static void main(String[] args) {
        try (Connection connection = DriverManager.getConnection(DB_URL)) {
            connection.setAutoCommit(false);

            ensureExamExists(connection, EXAM_ID);

            int mathSubjectId = ensureMathSubject(connection);
            Map<String, Integer> topicIds = ensureTopics(connection, mathSubjectId);

            int order = 1;

            int q1 = insertQuestion(
                    connection,
                    topicIds.get("integral"),
                    "Cau 1. Tinh tich phan I = integral tu 0 den 1 cua (2x + 3) dx.",
                    1,
                    "Toan_Hoc/Giai_Tich/toan_tich_phan.md"
            );
            insertAnswers(connection, q1, new String[][]{
                    {"A", "4", "0"},
                    {"B", "5", "0"},
                    {"C", "4.0", "1"},
                    {"D", "6", "0"}
            });
            linkQuestionToExam(connection, EXAM_ID, q1, order++);

            int q2 = insertQuestion(
                    connection,
                    topicIds.get("logarithm"),
                    "Cau 2. Nghiem cua phuong trinh log_2(x - 1) = 3 la:",
                    1,
                    "Toan_Hoc/Giai_Tich/logarit.md"
            );
            insertAnswers(connection, q2, new String[][]{
                    {"A", "7", "0"},
                    {"B", "8", "0"},
                    {"C", "9", "1"},
                    {"D", "10", "0"}
            });
            linkQuestionToExam(connection, EXAM_ID, q2, order++);

            int q3 = insertQuestion(
                    connection,
                    topicIds.get("function"),
                    "Cau 3. Ham so y = x^3 - 3x co bao nhieu diem cuc tri?",
                    2,
                    "Toan_Hoc/Giai_Tich/khao_sat_ham_so.md"
            );
            insertAnswers(connection, q3, new String[][]{
                    {"A", "1", "0"},
                    {"B", "2", "1"},
                    {"C", "3", "0"},
                    {"D", "4", "0"}
            });
            linkQuestionToExam(connection, EXAM_ID, q3, order++);

            int q4 = insertQuestion(
                    connection,
                    topicIds.get("integral"),
                    "Cau 4. Mot nguyen ham cua ham so f(x) = 1/x tren khoang (0; +vo cung) la:",
                    2,
                    "Toan_Hoc/Giai_Tich/nguyen_ham_tich_phan.md"
            );
            insertAnswers(connection, q4, new String[][]{
                    {"A", "ln(x) + C", "1"},
                    {"B", "1/(x^2) + C", "0"},
                    {"C", "e^x + C", "0"},
                    {"D", "x + C", "0"}
            });
            linkQuestionToExam(connection, EXAM_ID, q4, order++);

            int q5 = insertQuestion(
                    connection,
                    topicIds.get("function"),
                    "Cau 5. Do thi ham so y = (2x + 1)/(x - 1) co tieu can ngang la:",
                    2,
                    "Toan_Hoc/Giai_Tich/tiem_can_ham_phan_thuc.md"
            );
            insertAnswers(connection, q5, new String[][]{
                    {"A", "y = -1", "0"},
                    {"B", "y = 1", "0"},
                    {"C", "y = 2", "1"},
                    {"D", "x = 1", "0"}
            });
            linkQuestionToExam(connection, EXAM_ID, q5, order++);

            connection.commit();
            System.out.println("Bom du lieu thanh cong!");
        } catch (Exception e) {
            System.err.println("Loi khi bom du lieu: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private static void ensureExamExists(Connection connection, int examId) throws SQLException {
        String sql = "SELECT exam_id FROM exams WHERE exam_id = ?";

        try (PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setInt(1, examId);
            try (ResultSet rs = stmt.executeQuery()) {
                if (!rs.next()) {
                    throw new SQLException("Khong tim thay de thi voi exam_id = " + examId);
                }
            }
        }
    }

    private static int ensureMathSubject(Connection connection) throws SQLException {
        String selectSql = "SELECT subject_id FROM subjects WHERE subject_code = ?";
        try (PreparedStatement stmt = connection.prepareStatement(selectSql)) {
            stmt.setString(1, "TOAN");
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt("subject_id");
                }
            }
        }

        String insertSql = "INSERT INTO subjects (subject_code, subject_name, is_active) VALUES (?, ?, ?)";
        try (PreparedStatement stmt = connection.prepareStatement(insertSql, Statement.RETURN_GENERATED_KEYS)) {
            stmt.setString(1, "TOAN");
            stmt.setString(2, "Toan hoc");
            stmt.setInt(3, 1);
            stmt.executeUpdate();

            try (ResultSet rs = stmt.getGeneratedKeys()) {
                if (rs.next()) {
                    return rs.getInt(1);
                }
            }
        }

        throw new SQLException("Khong tao duoc subject TOAN.");
    }

    private static Map<String, Integer> ensureTopics(Connection connection, int subjectId) throws SQLException {
        Map<String, Integer> topicIds = new LinkedHashMap<>();
        topicIds.put("integral", ensureTopic(connection, subjectId, "Tich phan", 1, "Chu de tich phan lop 12"));
        topicIds.put("logarithm", ensureTopic(connection, subjectId, "Logarit", 2, "Chu de logarit lop 12"));
        topicIds.put("function", ensureTopic(connection, subjectId, "Khao sat ham so", 3, "Chu de ham so lop 12"));
        return topicIds;
    }

    private static int ensureTopic(
            Connection connection,
            int subjectId,
            String topicName,
            int topicOrder,
            String description
    ) throws SQLException {
        String selectSql = "SELECT topic_id FROM topics WHERE subject_id = ? AND topic_name = ?";
        try (PreparedStatement stmt = connection.prepareStatement(selectSql)) {
            stmt.setInt(1, subjectId);
            stmt.setString(2, topicName);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt("topic_id");
                }
            }
        }

        String insertSql = """
                INSERT INTO topics (subject_id, parent_topic_id, topic_name, topic_order, description, is_active)
                VALUES (?, NULL, ?, ?, ?, 1)
                """;
        try (PreparedStatement stmt = connection.prepareStatement(insertSql, Statement.RETURN_GENERATED_KEYS)) {
            stmt.setInt(1, subjectId);
            stmt.setString(2, topicName);
            stmt.setInt(3, topicOrder);
            stmt.setString(4, description);
            stmt.executeUpdate();

            try (ResultSet rs = stmt.getGeneratedKeys()) {
                if (rs.next()) {
                    return rs.getInt(1);
                }
            }
        }

        throw new SQLException("Khong tao duoc topic: " + topicName);
    }

    private static int insertQuestion(
            Connection connection,
            int topicId,
            String content,
            int level,
            String obsidianSourcePath
    ) throws SQLException {
        String sql = """
                INSERT INTO questions (
                    topic_id, content, level, question_type, source, obsidian_source_path, is_active
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
                """;

        try (PreparedStatement stmt = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            stmt.setInt(1, topicId);
            stmt.setString(2, content);
            stmt.setInt(3, level);
            stmt.setString(4, "single_choice");
            stmt.setString(5, "DataSeeder");
            stmt.setString(6, obsidianSourcePath);
            stmt.setInt(7, 1);
            stmt.executeUpdate();

            try (ResultSet rs = stmt.getGeneratedKeys()) {
                if (rs.next()) {
                    return rs.getInt(1);
                }
            }
        }

        throw new SQLException("Khong lay duoc question_id vua chen.");
    }

    private static void insertAnswers(Connection connection, int questionId, String[][] answers) throws SQLException {
        String sql = """
                INSERT INTO answers (
                    question_id, option_label, content, is_correct, explanation, display_order
                ) VALUES (?, ?, ?, ?, ?, ?)
                """;

        try (PreparedStatement stmt = connection.prepareStatement(sql)) {
            for (int i = 0; i < answers.length; i++) {
                stmt.setInt(1, questionId);
                stmt.setString(2, answers[i][0]);
                stmt.setString(3, answers[i][1]);
                stmt.setInt(4, Integer.parseInt(answers[i][2]));
                stmt.setString(5, null);
                stmt.setInt(6, i + 1);
                stmt.executeUpdate();
            }
        }
    }

    private static void linkQuestionToExam(
            Connection connection,
            int examId,
            int questionId,
            int questionOrder
    ) throws SQLException {
        String sql = """
                INSERT INTO exam_questions (exam_id, question_id, question_order, point_weight)
                VALUES (?, ?, ?, ?)
                """;

        try (PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setInt(1, examId);
            stmt.setInt(2, questionId);
            stmt.setInt(3, questionOrder);
            stmt.setDouble(4, 0.25);
            stmt.executeUpdate();
        }
    }
}
