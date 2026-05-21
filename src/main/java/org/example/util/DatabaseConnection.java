package org.example.util;

import java.io.IOException;
import java.io.InputStream;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Properties;

/**
 * DatabaseConnection - Singleton quan ly ket noi JDBC toi Supabase PostgreSQL.
 */
public final class DatabaseConnection {

    private static final String APPLICATION_PROPERTIES = "application.properties";
    private static final Properties APP_PROPERTIES = loadApplicationProperties();

    private static volatile Connection instance;

    private DatabaseConnection() {
    }

    public static Connection getInstance() throws SQLException {
        if (instance == null || instance.isClosed()) {
            synchronized (DatabaseConnection.class) {
                if (instance == null || instance.isClosed()) {
                    String jdbcUrl = resolveJdbcUrl();
                    String username = resolveDatabaseUser();
                    String password = requireConfig("SUPABASE_DB_PASSWORD", "db.password");

                    try {
                        Class.forName("org.postgresql.Driver");
                    } catch (ClassNotFoundException ex) {
                        throw new SQLException("Chua co PostgreSQL JDBC driver trong pom.xml.", ex);
                    }

                    Properties jdbcProperties = new Properties();
                    jdbcProperties.setProperty("user", username);
                    jdbcProperties.setProperty("password", password);
                    jdbcProperties.setProperty("sslmode", readConfig("SUPABASE_DB_SSLMODE", "db.sslmode", "require"));

                    instance = DriverManager.getConnection(jdbcUrl, jdbcProperties);
                }
            }
        }
        return instance;
    }

    public static String getDatabasePath() {
        return resolveJdbcUrlOrEmpty();
    }

    public static void closeConnection() {
        try {
            if (instance != null && !instance.isClosed()) {
                instance.close();
                instance = null;
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    private static String requireConfig(String envKey, String propertyKey) throws SQLException {
        String value = readConfig(envKey, propertyKey, "");
        if (value.isBlank()) {
            throw new SQLException(
                    "Thieu cau hinh ket noi DB. Can dat " + envKey + " trong .env/.env.local hoac "
                            + propertyKey + " trong application.properties."
            );
        }
        return value;
    }

    private static String resolveJdbcUrl() throws SQLException {
        String jdbcUrl = resolveJdbcUrlOrEmpty();
        if (jdbcUrl.isBlank()) {
            throw new SQLException(
                    "Thieu cau hinh ket noi DB. Can dat SUPABASE_DB_URL trong .env/.env.local hoac db.url "
                            + "trong application.properties."
            );
        }
        return jdbcUrl;
    }

    private static String resolveJdbcUrlOrEmpty() {
        String explicitJdbcUrl = readConfig("SUPABASE_DB_URL", "db.url", "");
        if (!explicitJdbcUrl.isBlank()) {
            return explicitJdbcUrl;
        }

        String supabaseUrl = EnvLoader.get("SUPABASE_URL");
        if ((supabaseUrl == null || supabaseUrl.isBlank())) {
            supabaseUrl = EnvLoader.get("NEXT_PUBLIC_SUPABASE_URL");
        }

        if (supabaseUrl == null || supabaseUrl.isBlank()) {
            return "";
        }

        String normalized = supabaseUrl.trim();
        normalized = normalized.replace("https://", "").replace("http://", "");
        if (!normalized.endsWith(".supabase.co")) {
            return "";
        }

        return "jdbc:postgresql://db." + normalized + ":5432/postgres";
    }

    private static String resolveDatabaseUser() {
        String explicitUser = readConfig("SUPABASE_DB_USER", "db.user", "");
        return explicitUser.isBlank() ? "postgres" : explicitUser;
    }

    private static String readConfig(String envKey, String propertyKey, String defaultValue) {
        String envValue = EnvLoader.get(envKey);
        if (envValue != null && !envValue.isBlank()) {
            return envValue.trim();
        }

        String propertyValue = APP_PROPERTIES.getProperty(propertyKey);
        if (propertyValue != null && !propertyValue.isBlank()) {
            return propertyValue.trim();
        }

        return defaultValue;
    }

    private static Properties loadApplicationProperties() {
        Properties properties = new Properties();
        try (InputStream input = DatabaseConnection.class.getClassLoader()
                .getResourceAsStream(APPLICATION_PROPERTIES)) {
            if (input != null) {
                properties.load(input);
            }
        } catch (IOException ex) {
            System.err.println("Khong the doc " + APPLICATION_PROPERTIES + ": " + ex.getMessage());
        }
        return properties;
    }
}
