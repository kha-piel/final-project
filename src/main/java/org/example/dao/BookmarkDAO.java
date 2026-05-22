package org.example.dao;

import org.example.model.BookmarkedQuestionDTO;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class BookmarkDAO {

    private final Connection connection;

    public BookmarkDAO(Connection connection) {
        this.connection = connection;
        ensureBookmarksTable();
    }

    public boolean saveBookmark(int userId, int questionId) {
        String sql = """
                INSERT OR IGNORE INTO question_bookmarks (user_id, question_id)
                VALUES (?, ?)
                """;

        try (PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setInt(1, userId);
            stmt.setInt(2, questionId);
            stmt.executeUpdate();
            return true;
        } catch (SQLException e) {
            System.err.println("Loi khi luu bookmark: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    public boolean removeBookmark(int userId, int questionId) {
        String sql = """
                DELETE FROM question_bookmarks
                WHERE user_id = ? AND question_id = ?
                """;

        try (PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setInt(1, userId);
            stmt.setInt(2, questionId);
            stmt.executeUpdate();
            return true;
        } catch (SQLException e) {
            System.err.println("Loi khi xoa bookmark: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    public Set<Integer> getBookmarkedQuestionIds(int userId) {
        String sql = """
                SELECT question_id
                FROM question_bookmarks
                WHERE user_id = ?
                """;

        Set<Integer> ids = new HashSet<>();
        try (PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setInt(1, userId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    ids.add(rs.getInt("question_id"));
                }
            }
        } catch (SQLException e) {
            System.err.println("Loi khi lay danh sach bookmark IDs: " + e.getMessage());
            e.printStackTrace();
        }
        return ids;
    }

    public List<BookmarkedQuestionDTO> getBookmarkedQuestionsByUserId(int userId) {
        String sql = """
                SELECT q.question_id,
                       q.content,
                       q.subject,
                       q.chapter,
                       qb.created_at
                FROM question_bookmarks qb
                INNER JOIN questions q ON q.question_id = qb.question_id
                WHERE qb.user_id = ?
                ORDER BY qb.created_at DESC, qb.bookmark_id DESC
                """;

        List<BookmarkedQuestionDTO> items = new ArrayList<>();
        try (PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setInt(1, userId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    items.add(new BookmarkedQuestionDTO(
                            rs.getInt("question_id"),
                            rs.getString("content"),
                            readIfPresent(rs, "subject"),
                            readIfPresent(rs, "chapter"),
                            readIfPresent(rs, "created_at")
                    ));
                }
            }
        } catch (SQLException e) {
            System.err.println("Loi khi lay danh sach cau da danh dau: " + e.getMessage());
            e.printStackTrace();
        }
        return items;
    }

    private void ensureBookmarksTable() {
        String sql = """
                CREATE TABLE IF NOT EXISTS question_bookmarks (
                    bookmark_id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id     INTEGER NOT NULL,
                    question_id INTEGER NOT NULL,
                    created_at  TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE (user_id, question_id),
                    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
                    FOREIGN KEY (question_id) REFERENCES questions(question_id) ON DELETE CASCADE
                )
                """;

        try (Statement stmt = connection.createStatement()) {
            stmt.executeUpdate(sql);
            stmt.executeUpdate(
                    "CREATE INDEX IF NOT EXISTS idx_question_bookmarks_user ON question_bookmarks(user_id)"
            );
        } catch (SQLException e) {
            System.err.println("Loi tao bang question_bookmarks: " + e.getMessage());
            e.printStackTrace();
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
