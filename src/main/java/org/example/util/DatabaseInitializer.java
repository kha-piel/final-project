package org.example.util;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Khoi tao schema va du lieu nen toi thieu cho project.
 */
public final class DatabaseInitializer {

    private static final String SCHEMA_RESOURCE = "/database/schema.sql";
    private static final int DEFAULT_EXAM_ID = 1;

    private DatabaseInitializer() {
    }

    public static void initialize(Connection connection) throws SQLException {
        connection.setAutoCommit(false);
        try {
            enableForeignKeys(connection);
            runSchemaScript(connection);
            migrateLegacyUsersToProfiles(connection);
            seedCoreData(connection);
            connection.commit();
        } catch (SQLException | IOException ex) {
            connection.rollback();
            throw new SQLException("Khong the khoi tao database: " + ex.getMessage(), ex);
        } finally {
            connection.setAutoCommit(true);
        }
    }

    private static void enableForeignKeys(Connection connection) throws SQLException {
        try (Statement stmt = connection.createStatement()) {
            stmt.execute("PRAGMA foreign_keys = ON");
        }
    }

    private static void runSchemaScript(Connection connection) throws IOException, SQLException {
        try (InputStream input = DatabaseInitializer.class.getResourceAsStream(SCHEMA_RESOURCE)) {
            if (input == null) {
                throw new IOException("Khong tim thay resource " + SCHEMA_RESOURCE);
            }

            List<String> statements = parseSqlStatements(input);
            try (Statement stmt = connection.createStatement()) {
                for (String sql : statements) {
                    if (!sql.isBlank()) {
                        stmt.execute(sql);
                    }
                }
            }
        }
    }

    private static List<String> parseSqlStatements(InputStream input) throws IOException {
        List<String> statements = new ArrayList<>();
        StringBuilder current = new StringBuilder();

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(input, StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) {
                String trimmed = line.trim();
                if (trimmed.startsWith("--") || trimmed.isEmpty()) {
                    continue;
                }

                current.append(line).append('\n');
                if (trimmed.endsWith(";")) {
                    statements.add(current.toString().trim());
                    current.setLength(0);
                }
            }
        }

        if (!current.isEmpty()) {
            statements.add(current.toString().trim());
        }
        return statements;
    }

    private static void seedCoreData(Connection connection) throws SQLException {
        ensureDefaultExamExists(connection, DEFAULT_EXAM_ID);

        if (hasQuestionsForExam(connection, DEFAULT_EXAM_ID)) {
            return;
        }

        int mathSubjectId = ensureMathSubject(connection);
        Map<String, Integer> topicIds = ensureTopics(connection, mathSubjectId);

        int order = 1;

        int q1 = insertQuestionIfMissing(
                connection,
                topicIds.get("integral"),
                "Cau 1. Tinh tich phan I = integral tu 0 den 1 cua (2x + 3) dx.",
                1,
                "Toan_Hoc/Giai_Tich/toan_tich_phan.md"
        );
        replaceAnswers(connection, q1, new String[][]{
                {"A", "4", "0"},
                {"B", "5", "0"},
                {"C", "4.0", "1"},
                {"D", "6", "0"}
        });
        linkQuestionToExam(connection, DEFAULT_EXAM_ID, q1, order++);

        int q2 = insertQuestionIfMissing(
                connection,
                topicIds.get("logarithm"),
                "Cau 2. Nghiem cua phuong trinh log_2(x - 1) = 3 la:",
                1,
                "Toan_Hoc/Giai_Tich/logarit.md"
        );
        replaceAnswers(connection, q2, new String[][]{
                {"A", "7", "0"},
                {"B", "8", "0"},
                {"C", "9", "1"},
                {"D", "10", "0"}
        });
        linkQuestionToExam(connection, DEFAULT_EXAM_ID, q2, order++);

        int q3 = insertQuestionIfMissing(
                connection,
                topicIds.get("function"),
                "Cau 3. Ham so y = x^3 - 3x co bao nhieu diem cuc tri?",
                2,
                "Toan_Hoc/Giai_Tich/khao_sat_ham_so.md"
        );
        replaceAnswers(connection, q3, new String[][]{
                {"A", "1", "0"},
                {"B", "2", "1"},
                {"C", "3", "0"},
                {"D", "4", "0"}
        });
        linkQuestionToExam(connection, DEFAULT_EXAM_ID, q3, order++);
    }

    private static void migrateLegacyUsersToProfiles(Connection connection) throws SQLException {
        String sql = """
                INSERT OR IGNORE INTO user_profiles (
                    user_id, username, email, full_name, phone, date_of_birth,
                    role, status, created_at, updated_at, last_login_at
                )
                SELECT
                    user_id,
                    username,
                    email,
                    full_name,
                    %s AS phone,
                    %s AS date_of_birth,
                    %s AS role,
                    %s AS status,
                    %s AS created_at,
                    %s AS updated_at,
                    %s AS last_login_at
                FROM users
                """.formatted(
                selectOrNull(connection, "users", "phone"),
                selectOrNull(connection, "users", "date_of_birth"),
                selectOrDefault(connection, "users", "role", "'student'"),
                selectOrDefault(connection, "users", "status", "'active'"),
                selectOrDefault(connection, "users", "created_at", "datetime('now', 'localtime')"),
                selectOrDefault(connection, "users", "updated_at", "datetime('now', 'localtime')"),
                selectOrNull(connection, "users", "last_login_at")
        );

        try (Statement stmt = connection.createStatement()) {
            stmt.executeUpdate(sql);
        }
    }

    private static boolean hasColumn(Connection connection, String tableName, String columnName) throws SQLException {
        String sql = "PRAGMA table_info(" + tableName + ")";
        try (Statement stmt = connection.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) {
                if (columnName.equalsIgnoreCase(rs.getString("name"))) {
                    return true;
                }
            }
        }
        return false;
    }

    private static String selectOrNull(Connection connection, String tableName, String columnName) throws SQLException {
        return hasColumn(connection, tableName, columnName) ? columnName : "NULL";
    }

    private static String selectOrDefault(
            Connection connection,
            String tableName,
            String columnName,
            String fallbackExpression
    ) throws SQLException {
        return hasColumn(connection, tableName, columnName) ? columnName : fallbackExpression;
    }

    private static boolean hasQuestionsForExam(Connection connection, int examId) throws SQLException {
        String sql = "SELECT 1 FROM exam_questions WHERE exam_id = ? LIMIT 1";
        try (PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setInt(1, examId);
            try (ResultSet rs = stmt.executeQuery()) {
                return rs.next();
            }
        }
    }

    private static void ensureDefaultExamExists(Connection connection, int examId) throws SQLException {
        String selectSql = "SELECT exam_id FROM exams WHERE exam_id = ?";
        try (PreparedStatement stmt = connection.prepareStatement(selectSql)) {
            stmt.setInt(1, examId);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return;
                }
            }
        }

        Integer subjectId = findSubjectIdByCode(connection, "TOAN");
        String insertSql = """
                INSERT INTO exams (
                    exam_id, title, description, subject_id, exam_type, duration, total_questions,
                    pass_score, shuffle_answers, shuffle_questions, is_public
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """;

        try (PreparedStatement stmt = connection.prepareStatement(insertSql)) {
            stmt.setInt(1, examId);
            stmt.setString(2, "De luyen tap Toan co ban");
            stmt.setString(3, "Bo de mac dinh duoc tao tu dong de project co the chay ngay.");
            if (subjectId != null) {
                stmt.setInt(4, subjectId);
            } else {
                stmt.setNull(4, java.sql.Types.INTEGER);
            }
            stmt.setString(5, "practice");
            stmt.setInt(6, 50);
            stmt.setInt(7, 3);
            stmt.setDouble(8, 5.0);
            stmt.setInt(9, 1);
            stmt.setInt(10, 0);
            stmt.setInt(11, 1);
            stmt.executeUpdate();
        }
    }

    private static Integer findSubjectIdByCode(Connection connection, String subjectCode) throws SQLException {
        String sql = "SELECT subject_id FROM subjects WHERE subject_code = ?";
        try (PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setString(1, subjectCode);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt("subject_id");
                }
            }
        }
        return null;
    }

    private static int ensureMathSubject(Connection connection) throws SQLException {
        Integer subjectId = findSubjectIdByCode(connection, "TOAN");
        if (subjectId != null) {
            return subjectId;
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

    private static int insertQuestionIfMissing(
            Connection connection,
            int topicId,
            String content,
            int level,
            String obsidianSourcePath
    ) throws SQLException {
        String selectSql = "SELECT question_id FROM questions WHERE topic_id = ? AND content = ? LIMIT 1";
        try (PreparedStatement stmt = connection.prepareStatement(selectSql)) {
            stmt.setInt(1, topicId);
            stmt.setString(2, content);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return rs.getInt("question_id");
                }
            }
        }

        String insertSql = """
                INSERT INTO questions (
                    topic_id, content, level, question_type, source, obsidian_source_path, is_active
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
                """;
        try (PreparedStatement stmt = connection.prepareStatement(insertSql, Statement.RETURN_GENERATED_KEYS)) {
            stmt.setInt(1, topicId);
            stmt.setString(2, content);
            stmt.setInt(3, level);
            stmt.setString(4, "single_choice");
            stmt.setString(5, "DatabaseInitializer");
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

    private static void replaceAnswers(Connection connection, int questionId, String[][] answers) throws SQLException {
        try (PreparedStatement deleteStmt = connection.prepareStatement("DELETE FROM answers WHERE question_id = ?")) {
            deleteStmt.setInt(1, questionId);
            deleteStmt.executeUpdate();
        }

        String insertSql = """
                INSERT INTO answers (
                    question_id, option_label, content, is_correct, explanation, display_order
                ) VALUES (?, ?, ?, ?, ?, ?)
                """;

        try (PreparedStatement stmt = connection.prepareStatement(insertSql)) {
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
        String selectSql = "SELECT 1 FROM exam_questions WHERE exam_id = ? AND question_id = ?";
        try (PreparedStatement stmt = connection.prepareStatement(selectSql)) {
            stmt.setInt(1, examId);
            stmt.setInt(2, questionId);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return;
                }
            }
        }

        String insertSql = """
                INSERT INTO exam_questions (exam_id, question_id, question_order, point_weight)
                VALUES (?, ?, ?, ?)
                """;
        try (PreparedStatement stmt = connection.prepareStatement(insertSql)) {
            stmt.setInt(1, examId);
            stmt.setInt(2, questionId);
            stmt.setInt(3, questionOrder);
            stmt.setDouble(4, 10.0 / 3.0);
            stmt.executeUpdate();
        }
    }
}
