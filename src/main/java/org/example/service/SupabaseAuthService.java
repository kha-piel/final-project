package org.example.service;

import org.example.model.User;
import org.example.util.EnvLoader;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Tich hop Supabase Auth qua REST API.
 */
public class SupabaseAuthService {

    private static final Duration CONNECT_TIMEOUT = Duration.ofSeconds(10);
    private static final Duration REQUEST_TIMEOUT = Duration.ofSeconds(20);
    private static final Pattern USER_BLOCK_PATTERN =
            Pattern.compile("\"user\"\\s*:\\s*\\{(.*?)\\}", Pattern.DOTALL);
    private static final Pattern ID_PATTERN =
            Pattern.compile("\"id\"\\s*:\\s*\"([^\"]+)\"");
    private static final Pattern EMAIL_PATTERN =
            Pattern.compile("\"email\"\\s*:\\s*\"([^\"]+)\"");
    private static final Pattern ACCESS_TOKEN_PATTERN =
            Pattern.compile("\"access_token\"\\s*:\\s*\"([^\"]+)\"");

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

    public AuthResult signIn(String email, String rawPassword) {
        if (!isConfigured()) {
            return AuthResult.failure("Chua cau hinh SUPABASE_URL va SUPABASE_ANON_KEY.");
        }

        String requestBody = "{"
                + "\"email\":\"" + escapeJson(email == null ? "" : email.trim().toLowerCase()) + "\","
                + "\"password\":\"" + escapeJson(rawPassword) + "\""
                + "}";

        return executeAuthRequest("/auth/v1/token?grant_type=password", requestBody);
    }

    public AuthResult signUp(User user, String rawPassword) {
        if (!isConfigured()) {
            return AuthResult.failure("Chua cau hinh SUPABASE_URL va SUPABASE_ANON_KEY.");
        }

        String requestBody = buildSignupBody(user, rawPassword);
        return executeAuthRequest("/auth/v1/signup", requestBody);
    }

    public SyncResult ensureUserSaved(User user, String rawPassword) {
        AuthResult authResult = signUp(user, rawPassword);
        return authResult.isSuccess() ? SyncResult.success() : SyncResult.failure(authResult.getMessage());
    }

    private AuthResult executeAuthRequest(String path, String requestBody) {
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(trimTrailingSlash(supabaseUrl) + path))
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
                return AuthResult.success(extractUserId(body), extractEmail(body), hasAccessToken(body), body);
            }

            return AuthResult.failure("Supabase tra ve loi " + statusCode + ": " + shorten(body));
        } catch (Exception ex) {
            return AuthResult.failure("Khong the goi Supabase Auth: " + ex.getMessage());
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

    private String extractUserId(String body) {
        Matcher userBlockMatcher = USER_BLOCK_PATTERN.matcher(body);
        if (userBlockMatcher.find()) {
            Matcher idMatcher = ID_PATTERN.matcher(userBlockMatcher.group(1));
            if (idMatcher.find()) {
                return idMatcher.group(1);
            }
        }

        Matcher idMatcher = ID_PATTERN.matcher(body);
        return idMatcher.find() ? idMatcher.group(1) : "";
    }

    private String extractEmail(String body) {
        Matcher emailMatcher = EMAIL_PATTERN.matcher(body);
        return emailMatcher.find() ? emailMatcher.group(1) : "";
    }

    private boolean hasAccessToken(String body) {
        return ACCESS_TOKEN_PATTERN.matcher(body).find();
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

    public static final class AuthResult {
        private final boolean success;
        private final String message;
        private final String userId;
        private final String email;
        private final boolean sessionAvailable;
        private final String rawBody;

        private AuthResult(
                boolean success,
                String message,
                String userId,
                String email,
                boolean sessionAvailable,
                String rawBody
        ) {
            this.success = success;
            this.message = message;
            this.userId = userId;
            this.email = email;
            this.sessionAvailable = sessionAvailable;
            this.rawBody = rawBody;
        }

        public static AuthResult success(String userId, String email, boolean sessionAvailable, String rawBody) {
            return new AuthResult(true, "", userId, email, sessionAvailable, rawBody);
        }

        public static AuthResult failure(String message) {
            return new AuthResult(false, message, "", "", false, "");
        }

        public boolean isSuccess() {
            return success;
        }

        public String getMessage() {
            return message;
        }

        public String getUserId() {
            return userId;
        }

        public String getEmail() {
            return email;
        }

        public boolean isSessionAvailable() {
            return sessionAvailable;
        }

        public String getRawBody() {
            return rawBody;
        }
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
