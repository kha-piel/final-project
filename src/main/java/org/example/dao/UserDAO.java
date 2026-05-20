package org.example.dao;

import org.example.model.User;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

/**
 * UserDAO - Data Access Object cho bang users.
 *
 * Bang users gom cac cot:
 * - id
 * - username
 * - password_hash
 * - full_name
 * - role
 */
public class UserDAO {

    private final Connection connection;

    public UserDAO(Connection connection) {
        this.connection = connection;
    }

    /**
     * Xac thuc nguoi dung bang username va password.
     * Tam thoi so sanh password chuoi thuan voi cot password_hash.
     *
     * @param username ten dang nhap
     * @param password mat khau nguoi dung nhap
     * @return User neu dung thong tin, nguoc lai tra ve null
     */
    public User authenticate(String username, String password) {
        String sql = """
                SELECT user_id, username, password_hash, full_name, role, email
                FROM users
                WHERE (username = ? OR email = ?) AND password_hash = ?
                LIMIT 1
                """;

        try (PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setString(1, username);
            stmt.setString(2, username);
            stmt.setString(3, password);

            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return mapRowToUser(rs);
                }
            }
        } catch (SQLException e) {
            System.err.println("Loi xac thuc nguoi dung: " + e.getMessage());
            e.printStackTrace();
        }

        return null;
    }

    /**
     * Dang ky tai khoan moi vao bang users.
     *
     * @param user doi tuong User can dang ky
     * @return true neu insert thanh cong, false neu that bai
     */
    public boolean register(User user) {
        String sql = """
                INSERT INTO users (username, password_hash, email, full_name, role)
                VALUES (?, ?, ?, ?, ?)
                """;

        try (PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setString(1, user.getUsername());
            stmt.setString(2, user.getPasswordHash());
            stmt.setString(3, buildEmailForUser(user));
            stmt.setString(4, user.getFullName());
            stmt.setString(5, user.getRole());

            int rowsAffected = stmt.executeUpdate();
            return rowsAffected > 0;
        } catch (SQLException e) {
            System.err.println("Loi dang ky tai khoan: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Map 1 dong du lieu trong ResultSet thanh doi tuong User.
     */
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

    private String buildEmailForUser(User user) {
        if (user.getEmail() != null && !user.getEmail().isBlank()) {
            return user.getEmail().trim();
        }
        return user.getUsername().trim().toLowerCase() + "@local.app";
    }
}
