package org.example.dao;

import org.example.model.User;
import org.example.service.SupabaseAuthService;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Optional;

/**
 * UserDAO quan ly public.user_profiles tren Supabase.
 */
public class UserDAO {

    private final Connection connection;
    private final SupabaseAuthService supabaseAuthService;

    public UserDAO(Connection connection) {
        this.connection = connection;
        this.supabaseAuthService = new SupabaseAuthService();
    }

    /**
     * Dang nhap theo username/email. Password duoc xac thuc qua Supabase Auth REST API,
     * profile duoc doc tu public.user_profiles.
     */
    public User authenticate(String identity, String password) {
        User profile = findByIdentity(identity).orElse(null);
        if (profile == null || profile.getEmail() == null || profile.getEmail().isBlank()) {
            return null;
        }

        SupabaseAuthService.AuthResult authResult =
                supabaseAuthService.signIn(profile.getEmail(), password);
        if (!authResult.isSuccess()) {
            return null;
        }

        if (authResult.getUserId() != null && !authResult.getUserId().isBlank()) {
            return findByUserId(authResult.getUserId()).orElse(profile);
        }

        return profile;
    }

    /**
     * Dong bo hoac cap nhat profile sau khi user da duoc tao trong auth.users.
     */
    public boolean register(User user) {
        if (user.getUserId() == null) {
            throw new IllegalArgumentException("User phai co userId UUID tu Supabase Auth truoc khi luu profile.");
        }

        String sql = """
                INSERT INTO public.user_profiles (
                    user_id, username, email, full_name, role, status
                ) VALUES (
                    CAST(? AS uuid), ?, ?, ?, CAST(? AS public.app_role), CAST(? AS public.account_status)
                )
                ON CONFLICT (user_id) DO UPDATE SET
                    username = EXCLUDED.username,
                    email = EXCLUDED.email,
                    full_name = EXCLUDED.full_name,
                    role = EXCLUDED.role,
                    status = EXCLUDED.status
                """;

        try (PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setString(1, user.getUserId().toString());
            stmt.setString(2, normalizeUsername(user));
            stmt.setString(3, normalizeEmail(user));
            stmt.setString(4, normalizeFullName(user));
            stmt.setString(5, normalizeRole(user));
            stmt.setString(6, normalizeStatus(user));
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("Loi dong bo user_profiles: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    public boolean deleteByEmail(String email) {
        String normalizedEmail = email == null ? "" : email.trim().toLowerCase();
        if (normalizedEmail.isBlank()) {
            return false;
        }

        String sql = "DELETE FROM public.user_profiles WHERE lower(email::text) = lower(?)";
        try (PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setString(1, normalizedEmail);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("Loi xoa user profile theo email: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    public Optional<User> findByUserId(String userId) {
        String sql = """
                SELECT
                    up.user_id,
                    up.username,
                    up.email,
                    up.full_name,
                    up.role,
                    up.status,
                    up.created_at,
                    up.updated_at,
                    up.last_login_at
                FROM public.user_profiles up
                WHERE up.user_id = CAST(? AS uuid)
                LIMIT 1
                """;

        try (PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setString(1, userId);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapRowToUser(rs));
                }
            }
        } catch (SQLException e) {
            System.err.println("Loi tim user theo user_id: " + e.getMessage());
            e.printStackTrace();
        }

        return Optional.empty();
    }

    public Optional<User> findByIdentity(String identity) {
        String normalizedIdentity = identity == null ? "" : identity.trim();
        if (normalizedIdentity.isBlank()) {
            return Optional.empty();
        }

        String sql = """
                SELECT
                    up.user_id,
                    up.username,
                    up.email,
                    up.full_name,
                    up.role,
                    up.status,
                    up.created_at,
                    up.updated_at,
                    up.last_login_at
                FROM public.user_profiles up
                WHERE lower(up.username::text) = lower(?)
                   OR lower(up.email::text) = lower(?)
                LIMIT 1
                """;

        try (PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setString(1, normalizedIdentity);
            stmt.setString(2, normalizedIdentity);

            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapRowToUser(rs));
                }
            }
        } catch (SQLException e) {
            System.err.println("Loi tim user theo username/email: " + e.getMessage());
            e.printStackTrace();
        }

        return Optional.empty();
    }

    private User mapRowToUser(ResultSet rs) throws SQLException {
        User user = new User();
        user.setUserId(rs.getString("user_id"));
        user.setUsername(rs.getString("username"));
        user.setEmail(rs.getString("email"));
        user.setFullName(rs.getString("full_name"));
        user.setRole(rs.getString("role"));
        user.setStatus(rs.getString("status"));
        user.setCreatedAt(readOffsetDateTime(rs, "created_at"));
        user.setUpdatedAt(readOffsetDateTime(rs, "updated_at"));
        user.setLastLoginAt(readOffsetDateTime(rs, "last_login_at"));

        return user;
    }

    private java.time.OffsetDateTime readOffsetDateTime(ResultSet rs, String columnName) throws SQLException {
        return rs.getObject(columnName, java.time.OffsetDateTime.class);
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
        return normalizeUsername(user).toLowerCase();
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

    private String normalizeStatus(User user) {
        if (user.getStatus() == null || user.getStatus().isBlank()) {
            return "active";
        }
        return user.getStatus().trim().toLowerCase();
    }
}
