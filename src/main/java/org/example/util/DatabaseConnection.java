package org.example.util;

import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DatabaseConnection {

    private static final Path DB_PATH = resolveDatabasePath();
    private static final String DB_URL = "jdbc:sqlite:" + DB_PATH.toString();
    private static final String DB_USER = "";
    private static final String DB_PASS = "";

    private static volatile Connection instance;

    private DatabaseConnection() {
    }

    public static Connection getInstance() throws SQLException {
        if (instance == null || instance.isClosed()) {
            synchronized (DatabaseConnection.class) {
                if (instance == null || instance.isClosed()) {
                    ensureDataDirectoryExists();
                    instance = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);
                    instance.setAutoCommit(true);
                    System.out.println("DEBUG SQLite DB: " + DB_PATH.toAbsolutePath().normalize());
                }
            }
        }
        return instance;
    }

    public static String getDatabasePath() {
        return DB_PATH.toAbsolutePath().normalize().toString();
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

    private static Path resolveDatabasePath() {
        Path current = Path.of(System.getProperty("user.dir")).toAbsolutePath().normalize();
        Path projectRoot = findProjectRoot(current);
        return projectRoot.resolve(Path.of("data", "thptqg_ai.db")).normalize();
    }

    private static Path findProjectRoot(Path start) {
        Path current = start;
        while (current != null) {
            if (Files.exists(current.resolve("pom.xml"))) {
                return current;
            }
            current = current.getParent();
        }
        return start;
    }

    private static void ensureDataDirectoryExists() throws SQLException {
        try {
            Files.createDirectories(DB_PATH.getParent());
        } catch (Exception e) {
            throw new SQLException("Khong the tao thu muc database: " + DB_PATH.getParent(), e);
        }
    }
}
