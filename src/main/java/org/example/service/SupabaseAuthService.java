package org.example.service;

import org.example.model.User;
import org.example.util.EnvLoader;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;

/**
 * Dong bo account nguoi dung len Supabase Auth.
 *
 * <p>Service nay chi dam bao user da duoc tao trong auth.users.
 * Trigger handle_new_auth_user trong schema Supabase se tu tao user_profiles.</p>
 */
public class SupabaseAuthService {

    private static final Duration CONNECT_TIMEOUT = Duration.ofSeconds(10);
    private static final Duration REQUEST_TIMEOUT = Duration.ofSeconds(20);

    private final HttpClient httpClient;
    private final String supabaseUrl;
    private final String supabaseAnonKey;

    public SupabaseAuthService() {
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(CONNECT_TIMEOUT)
                .build();
        this.supabaseUrl = readEnv("SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL");
        this.supabaseAnonKey = readEnv("SUPABASE_ANON_KEY", "NEXT_PUBLIC_SUPABASE_ANON_KEY");
    }

    public boolean isConfigured() {
        return !supabaseUrl.isBlank() && !supabaseAnonKey.isBlank();
    }

    public SyncResult ensureUserSaved(User user, String rawPassword) {
        if (!isConfigured()) {
            return SyncResult.failure("Chua cau hinh SUPABASE_URL va SUPABASE_ANON_KEY.");
        }

        try {
            String requestBody = buildSignupBody(user, rawPassword);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(trimTrailingSlash(supabaseUrl) + "/auth/v1/signup"))
                    .header("apikey", supabaseAnonKey)
                    .header("Content-Type", "application/json; charset=UTF-8")
                    .header("Accept", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody, StandardCharsets.UTF_8))
                    .timeout(REQUEST_TIMEOUT)
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            int statusCode = response.statusCode();
            String body = response.body() == null ? "" : response.body();

            if (statusCode >= 200 && statusCode < 300) {
                return SyncResult.success();
            }

            return SyncResult.failure("Supabase tra ve loi " + statusCode + ": " + shorten(body));
        } catch (Exception ex) {
            return SyncResult.failure("Khong the dong bo Supabase: " + ex.getMessage());
        }
    }

    private String buildSignupBody(User user, String rawPassword) {
        return "{"
                + "\"email\":\"" + escapeJson(normalizeEmail(user)) + "\","
                + "\"password\":\"" + escapeJson(rawPassword) + "\","
                + "\"data\":{"
                + "\"username\":\"" + escapeJson(normalizeUsername(user)) + "\","
                + "\"full_name\":\"" + escapeJson(normalizeFullName(user)) + "\""
                + "}"
                + "}";
    }

    private String normalizeEmail(User user) {
        return user.getEmail() == null ? "" : user.getEmail().trim().toLowerCase();
    }

    private String normalizeUsername(User user) {
        if (user.getUsername() != null && !user.getUsername().isBlank()) {
            return user.getUsername().trim();
        }
        return normalizeEmail(user);
    }

    private String normalizeFullName(User user) {
        return user.getFullName() == null ? "" : user.getFullName().trim();
    }

    private String trimTrailingSlash(String value) {
        return value.endsWith("/") ? value.substring(0, value.length() - 1) : value;
    }

    private String readEnv(String primaryKey, String fallbackKey) {
        String primary = EnvLoader.get(primaryKey);
        if (primary != null && !primary.isBlank()) {
            return primary.trim();
        }

        String fallback = EnvLoader.get(fallbackKey);
        if (fallback != null && !fallback.isBlank()) {
            return fallback.trim();
        }

        return "";
    }

    private String escapeJson(String value) {
        if (value == null) {
            return "";
        }

        StringBuilder escaped = new StringBuilder();
        for (int i = 0; i < value.length(); i++) {
            char ch = value.charAt(i);
            switch (ch) {
                case '\"' -> escaped.append("\\\"");
                case '\\' -> escaped.append("\\\\");
                case '\n' -> escaped.append("\\n");
                case '\r' -> escaped.append("\\r");
                case '\t' -> escaped.append("\\t");
                case '\b' -> escaped.append("\\b");
                case '\f' -> escaped.append("\\f");
                default -> {
                    if (ch < 0x20) {
                        escaped.append(String.format("\\u%04x", (int) ch));
                    } else {
                        escaped.append(ch);
                    }
                }
            }
        }
        return escaped.toString();
    }

    private String shorten(String value) {
        if (value == null || value.isBlank()) {
            return "khong co chi tiet";
        }

        String normalized = value.replace('\n', ' ').replace('\r', ' ').trim();
        return normalized.length() <= 220 ? normalized : normalized.substring(0, 220) + "...";
    }

    public static final class SyncResult {
        private final boolean success;
        private final String message;

        private SyncResult(boolean success, String message) {
            this.success = success;
            this.message = message;
        }

        public static SyncResult success() {
            return new SyncResult(true, "");
        }

        public static SyncResult failure(String message) {
            return new SyncResult(false, message);
        }

        public boolean isSuccess() {
            return success;
        }

        public String getMessage() {
            return message;
        }
    }
}
