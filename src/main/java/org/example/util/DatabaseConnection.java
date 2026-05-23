package org.example.util;

import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

/**
 * Singleton quan ly ket noi SQLite local cho module de thi.
 *
 * Dang nhap van di qua Supabase Auth REST API, con du lieu quiz hien tai
 * van dung schema SQLite cu trong data/thptqg_ai.db.
 */
public final class DatabaseConnection {

    private static final Path SQLITE_DB_PATH = resolveDatabasePath();
    private static final Path DATA_DIR = SQLITE_DB_PATH.getParent();

    private static volatile Connection instance;

    private DatabaseConnection() {
    }

    public static Connection getInstance() throws SQLException {
        if (instance == null || instance.isClosed()) {
            synchronized (DatabaseConnection.class) {
                if (instance == null || instance.isClosed()) {
                    initializeSqliteConnection();
                }
            }
        }
        return instance;
    }

    public static String getDatabasePath() {
        return SQLITE_DB_PATH.toAbsolutePath().normalize().toString();
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

    private static void initializeSqliteConnection() throws SQLException {
        try {
            Files.createDirectories(DATA_DIR);
        } catch (Exception ex) {
            throw new SQLException("Khong the tao thu muc data cho SQLite: " + ex.getMessage(), ex);
        }

        try {
            Class.forName("org.sqlite.JDBC");
        } catch (ClassNotFoundException ex) {
            throw new SQLException("Chua co SQLite JDBC driver trong pom.xml.", ex);
        }

        boolean shouldBootstrap;
        try {
            shouldBootstrap = Files.notExists(SQLITE_DB_PATH) || Files.size(SQLITE_DB_PATH) == 0;
        } catch (Exception ex) {
            throw new SQLException("Khong the kiem tra file SQLite: " + ex.getMessage(), ex);
        }

        String jdbcUrl = "jdbc:sqlite:" + SQLITE_DB_PATH;
        instance = DriverManager.getConnection(jdbcUrl);

        if (shouldBootstrap) {
            try {
                DatabaseInitializer.initialize(instance);
            } catch (SQLException ex) {
                closeConnection();
                throw ex;
            }
        }
    }
}
