package org.example.util;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

/**
 * DatabaseConnection — Singleton quản lý kết nối CSDL.
 *
 * Sử dụng pattern Singleton thread-safe (double-checked locking).
 * Thay đổi URL/user/pass trong file config, không hardcode tại đây.
 */
public class DatabaseConnection {

    private static final String DB_URL  = "jdbc:sqlite:thptqg_ai.db"; // hoặc MySQL
    private static final String DB_USER = "";
    private static final String DB_PASS = "";

    private static volatile Connection instance;

    private DatabaseConnection() {}

    public static Connection getInstance() throws SQLException {
        if (instance == null || instance.isClosed()) {
            synchronized (DatabaseConnection.class) {
                if (instance == null || instance.isClosed()) {
                    instance = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);
                    instance.setAutoCommit(true);
                }
            }
        }
        return instance;
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
