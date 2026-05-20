package org.example.util;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.nio.file.Files;
import java.nio.file.Path;

/**
 * DatabaseConnection — Singleton quản lý kết nối CSDL.
 *
 * Sử dụng pattern Singleton thread-safe (double-checked locking).
 * Thay đổi URL/user/pass trong file config, không hardcode tại đây.
 */
public class DatabaseConnection {

    private static final Path DB_PATH = Path.of("data", "thptqg_ai.db");
    private static final String DB_URL = "jdbc:sqlite:" + DB_PATH.toString();
    private static final String DB_USER = "";
    private static final String DB_PASS = "";

    private static volatile Connection instance;

    private DatabaseConnection() {}

    public static Connection getInstance() throws SQLException {
        if (instance == null || instance.isClosed()) {
            synchronized (DatabaseConnection.class) {
                if (instance == null || instance.isClosed()) {
                    ensureDatabaseDirectory();
                    instance = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);
                    DatabaseInitializer.initialize(instance);
                }
            }
        }
        return instance;
    }

    public static Path getDatabasePath() {
        return DB_PATH;
    }

    private static void ensureDatabaseDirectory() throws SQLException {
        try {
            Files.createDirectories(DB_PATH.getParent());
        } catch (Exception ex) {
            throw new SQLException("Khong the tao thu muc database: " + ex.getMessage(), ex);
        }
    }

    public static void closeConnection() {
        try {
            if (instance != null && !instance.isClosed()) {
                instance.close();
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}
