package org.example.dao;

import org.example.model.Answer;
import org.example.model.Question;
import org.example.model.Question.DifficultyLevel;

import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.text.Normalizer;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class QuestionDAO {

    private final Connection connection;
    private final AnswerDAO answerDAO;

    public QuestionDAO(Connection connection) {
        this.connection = connection;
        this.answerDAO = new AnswerDAO(connection);
    }

    public void save(Question question) {
        // TODO
    }

    public void update(Question question) {
        // TODO
    }

    public void delete(int questionId) {
        // TODO
    }

    public Optional<Question> findById(int questionId) {
        String idColumn = resolveQuestionIdColumn();
        String sql = "SELECT * FROM questions WHERE " + idColumn + " = ?";
        try (PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setInt(1, questionId);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    Question question = mapRowToQuestion(rs);
                    question.setAnswers(answerDAO.findByQuestionId(questionId));
                    question.setListAnswers(question.getAnswers());
                    return Optional.of(question);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return Optional.empty();
    }

    public Question getRandomQuestion() {
        String sql = "SELECT * FROM questions ORDER BY RANDOM() LIMIT 1";
        try (PreparedStatement stmt = connection.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            if (rs.next()) {
                Question question = mapRowToQuestion(rs);
                question.setAnswers(answerDAO.findByQuestionId(question.getQuestionId()));
                question.setListAnswers(question.getAnswers());
                return question;
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    public List<Question> findBySubjectAndDifficulty(String subject, DifficultyLevel difficulty, int limit) {
        return List.of();
    }

    public List<Question> findAll() {
        return List.of();
    }

    public boolean existsByObsidianPath(String filePath) {
        return false;
    }

    public List<Question> getQuestionsByFilter(int topicId, String difficulty) {
        List<Question> questions = new ArrayList<>();

        try {
            boolean hasDifficultyColumn = hasColumn("questions", "difficulty");
            String orderColumn = resolveQuestionIdColumn();
            String sql;

            if (hasDifficultyColumn) {
                sql = "SELECT * FROM questions WHERE topic_id = ? ORDER BY " + orderColumn;
            } else {
                sql = "SELECT * FROM questions WHERE topic_id = ? AND level = ? AND is_active = 1 ORDER BY " + orderColumn;
            }

            try (PreparedStatement stmt = connection.prepareStatement(sql)) {
                stmt.setInt(1, topicId);
                if (!hasDifficultyColumn) {
                    stmt.setInt(2, mapDifficultyToLevel(difficulty));
                }

                List<Question> fallbackQuestions = new ArrayList<>();

                try (ResultSet rs = stmt.executeQuery()) {
                    while (rs.next()) {
                        Question question = mapRowToQuestion(rs);
                        List<Answer> answers = answerDAO.findByQuestionId(question.getQuestionId());
                        question.setAnswers(answers);
                        question.setListAnswers(answers);

                        if (hasDifficultyColumn) {
                            fallbackQuestions.add(question);
                            if (difficultyMatches(rs.getString("difficulty"), difficulty)) {
                                questions.add(question);
                            }
                        } else {
                            questions.add(question);
                        }
                    }
                }

                if (hasDifficultyColumn && questions.isEmpty()) {
                    questions.addAll(fallbackQuestions);
                }
            }
        } catch (SQLException e) {
            System.err.println("Loi khi lay cau hoi theo bo loc: " + e.getMessage());
            e.printStackTrace();
        }

        return questions;
    }

    private Question mapRowToQuestion(ResultSet rs) throws SQLException {
        Question question = new Question();
        question.setQuestionId(readInt(rs, "question_id", "id"));
        question.setQuestionText(rs.getString("content"));
        question.setSubject(readIfPresent(rs, "subject"));
        question.setChapter(readIfPresent(rs, "chapter"));
        question.setExplanation(readIfPresent(rs, "explanation"));
        question.setObsidianSourcePath(readIfPresent(rs, "obsidian_source_path"));
        question.setDifficulty(resolveDifficulty(rs));
        return question;
    }

    private DifficultyLevel resolveDifficulty(ResultSet rs) throws SQLException {
        String difficultyText = readIfPresent(rs, "difficulty");
        if (difficultyText != null && !difficultyText.isBlank()) {
            return parseDifficulty(difficultyText);
        }

        try {
            int level = rs.getInt("level");
            if (!rs.wasNull()) {
                return switch (level) {
                    case 1 -> DifficultyLevel.NHAN_BIET;
                    case 2 -> DifficultyLevel.THONG_HIEU;
                    case 3 -> DifficultyLevel.VAN_DUNG;
                    case 4 -> DifficultyLevel.VAN_DUNG_CAO;
                    default -> null;
                };
            }
        } catch (SQLException ignored) {
            return null;
        }

        return null;
    }

    private DifficultyLevel parseDifficulty(String difficulty) {
        String normalized = normalizeText(difficulty);
        return switch (normalized) {
            case "nhan biet" -> DifficultyLevel.NHAN_BIET;
            case "thong hieu" -> DifficultyLevel.THONG_HIEU;
            case "van dung" -> DifficultyLevel.VAN_DUNG;
            case "van dung cao" -> DifficultyLevel.VAN_DUNG_CAO;
            default -> null;
        };
    }

    private int mapDifficultyToLevel(String difficulty) {
        String normalized = normalizeText(difficulty);
        return switch (normalized) {
            case "nhan biet" -> 1;
            case "thong hieu" -> 2;
            case "van dung" -> 3;
            case "van dung cao" -> 4;
            default -> throw new IllegalArgumentException("Do kho khong hop le: " + difficulty);
        };
    }

    private boolean difficultyMatches(String dbValue, String selectedValue) {
        return normalizeText(dbValue).equals(normalizeText(selectedValue));
    }

    private String normalizeText(String value) {
        if (value == null) {
            return "";
        }

        String normalized = Normalizer.normalize(value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}+", "")
                .replace('đ', 'd')
                .replace('Đ', 'D')
                .trim()
                .toLowerCase();

        return normalized.replaceAll("\\s+", " ");
    }

    private String resolveQuestionIdColumn() {
        try {
            return hasColumn("questions", "question_id") ? "question_id" : "id";
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

    private boolean hasColumn(String tableName, String columnName) throws SQLException {
        DatabaseMetaData metaData = connection.getMetaData();
        try (ResultSet rs = metaData.getColumns(null, null, tableName, columnName)) {
            return rs.next();
        }
    }

    private String readIfPresent(ResultSet rs, String columnName) {
        try {
            return rs.getString(columnName);
        } catch (SQLException ignored) {
            return null;
        }
    }
}
