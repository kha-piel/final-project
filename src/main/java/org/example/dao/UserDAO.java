package org.example.dao;

import org.example.model.User;
import org.example.util.PasswordHasher;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

/**
 * UserDAO quan ly account dang nhap trong bang users
 * va profile nghiep vu trong bang user_profiles.
 */
public class UserDAO {

    private final Connection connection;

    public UserDAO(Connection connection) {
        this.connection = connection;
    }

    public User authenticate(String identity, String password) {
        String sql = """
                SELECT
                    u.user_id,
                    u.username,
                    u.password_hash,
                    p.full_name,
                    p.role,
                    p.email,
                    p.status
                FROM users u
                JOIN user_profiles p ON p.user_id = u.user_id
                WHERE lower(u.username) = lower(?)
                   OR lower(p.email) = lower(?)
                LIMIT 1
                """;

        try (PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setString(1, identity);
            stmt.setString(2, identity);

            try (ResultSet rs = stmt.executeQuery()) {
                if (!rs.next()) {
                    return null;
                }

                String storedHash = rs.getString("password_hash");
                if (!PasswordHasher.matches(password, storedHash)) {
                    return null;
                }

                int userId = rs.getInt("user_id");
                if (PasswordHasher.isLegacyPlaintext(storedHash)) {
                    upgradeLegacyPasswordHash(userId, password);
                }
                touchLastLogin(userId);

                return mapRowToUser(rs);
            }
        } catch (SQLException e) {
            System.err.println("Loi xac thuc nguoi dung: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    public boolean register(User user) {
        boolean originalAutoCommit = true;
        try {
            originalAutoCommit = connection.getAutoCommit();
            connection.setAutoCommit(false);

            int userId = insertUserAccount(user);
            insertUserProfile(userId, user);

            connection.commit();
            user.setId(userId);
            return true;
        } catch (SQLException e) {
            try {
                connection.rollback();
            } catch (SQLException rollbackEx) {
                rollbackEx.printStackTrace();
            }
            System.err.println("Loi dang ky tai khoan: " + e.getMessage());
            e.printStackTrace();
            return false;
        } finally {
            try {
                connection.setAutoCommit(originalAutoCommit);
            } catch (SQLException ignored) {
            }
        }
    }

    private int insertUserAccount(User user) throws SQLException {
        String sql = """
                INSERT INTO users (
                    username, password_hash, email, full_name, role
                ) VALUES (?, ?, ?, ?, ?)
                """;

        try (PreparedStatement stmt = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            stmt.setString(1, normalizeUsername(user));
            stmt.setString(2, PasswordHasher.hash(user.getPasswordHash()));
            stmt.setString(3, normalizeEmail(user));
            stmt.setString(4, normalizeFullName(user));
            stmt.setString(5, normalizeRole(user));
            stmt.executeUpdate();

            try (ResultSet rs = stmt.getGeneratedKeys()) {
                if (rs.next()) {
                    return rs.getInt(1);
                }
            }
        }

        throw new SQLException("Khong lay duoc user_id moi.");
    }

    private void insertUserProfile(int userId, User user) throws SQLException {
        String sql = """
                INSERT INTO user_profiles (
                    user_id, username, email, full_name, role, status, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, datetime('now', 'localtime'), datetime('now', 'localtime'))
                """;

        try (PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setInt(1, userId);
            stmt.setString(2, normalizeUsername(user));
            stmt.setString(3, normalizeEmail(user));
            stmt.setString(4, normalizeFullName(user));
            stmt.setString(5, normalizeRole(user));
            stmt.setString(6, "active");
            stmt.executeUpdate();
        }
    }

    private void touchLastLogin(int userId) throws SQLException {
        String sql = """
                UPDATE user_profiles
                SET last_login_at = datetime('now', 'localtime'),
                    updated_at = datetime('now', 'localtime')
                WHERE user_id = ?
                """;

        try (PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setInt(1, userId);
            stmt.executeUpdate();
        }
    }

    private void upgradeLegacyPasswordHash(int userId, String rawPassword) throws SQLException {
        String sql = "UPDATE users SET password_hash = ? WHERE user_id = ?";
        try (PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setString(1, PasswordHasher.hash(rawPassword));
            stmt.setInt(2, userId);
            stmt.executeUpdate();
        }
    }

    private User mapRowToUser(ResultSet rs) throws SQLException {
        User user = new User();
        user.setId(rs.getInt("user_id"));
        user.setUsername(rs.getString("username"));
        user.setPasswordHash(rs.getString("password_hash"));
        user.setFullName(rs.getString("full_name"));
        user.setRole(rs.getString("role"));
        user.setEmail(rs.getString("email"));
        return user;
    }

    private String normalizeUsername(User user) {
        if (user.getUsername() != null && !user.getUsername().isBlank()) {
            return user.getUsername().trim();
        }
        return normalizeEmail(user);
    }

    private String normalizeEmail(User user) {
        if (user.getEmail() != null && !user.getEmail().isBlank()) {
            return user.getEmail().trim().toLowerCase();
        }
        return normalizeUsername(user).toLowerCase() + "@local.app";
    }

    private String normalizeFullName(User user) {
        return user.getFullName() == null ? null : user.getFullName().trim();
    }

    private String normalizeRole(User user) {
        if (user.getRole() == null || user.getRole().isBlank()) {
            return "student";
        }
        return user.getRole().trim().toLowerCase();
    }
}
