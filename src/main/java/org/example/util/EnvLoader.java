package org.example.util;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Doc bien moi truong tu he thong va file .env/.env.local tai root project.
 */
public final class EnvLoader {

    private static final Path PROJECT_ROOT = Path.of("").toAbsolutePath().normalize();
    private static final List<Path> ENV_FILES = List.of(
            PROJECT_ROOT.resolve(".env.local"),
            PROJECT_ROOT.resolve(".env")
    );
    private static final Map<String, String> FILE_ENV = loadFileEnv();

    private EnvLoader() {
    }

    public static String get(String key) {
        String systemValue = System.getenv(key);
        if (systemValue != null && !systemValue.isBlank()) {
            return systemValue.trim();
        }

        String fileValue = FILE_ENV.get(key);
        if (fileValue != null && !fileValue.isBlank()) {
            return fileValue.trim();
        }

        return "";
    }

    private static Map<String, String> loadFileEnv() {
        Map<String, String> values = new HashMap<>();
        for (Path envFile : ENV_FILES) {
            if (!Files.exists(envFile)) {
                continue;
            }

            try {
                for (String rawLine : Files.readAllLines(envFile)) {
                    String line = rawLine.trim();
                    if (line.isEmpty() || line.startsWith("#")) {
                        continue;
                    }

                    int separatorIndex = line.indexOf('=');
                    if (separatorIndex <= 0) {
                        continue;
                    }

                    String key = line.substring(0, separatorIndex).trim();
                    if (key.isEmpty() || values.containsKey(key)) {
                        continue;
                    }

                    String value = line.substring(separatorIndex + 1).trim();
                    values.put(key, stripQuotes(value));
                }
            } catch (IOException ex) {
                System.err.println("Khong the doc file env " + envFile + ": " + ex.getMessage());
            }
        }
        return values;
    }

    private static String stripQuotes(String value) {
        if (value.length() >= 2) {
            char first = value.charAt(0);
            char last = value.charAt(value.length() - 1);
            if ((first == '"' && last == '"') || (first == '\'' && last == '\'')) {
                return value.substring(1, value.length() - 1);
            }
        }
        return value;
    }
}
