package org.example.util;

/**
 * AppConstants — Hằng số dùng chung toàn ứng dụng.
 * Không khởi tạo class này (constructor private).
 */
public final class AppConstants {

    private AppConstants() {}

    // App info
    public static final String APP_NAME    = "THPTQG AI Ôn Tập";
    public static final String APP_VERSION = "1.0.0";

    // Window dimensions
    public static final int WINDOW_WIDTH  = 1280;
    public static final int WINDOW_HEIGHT = 800;

    // AI / API
    public static final String DEFAULT_PYTHON_API_URL = "http://localhost:8000";
    public static final int    API_TIMEOUT_SECONDS     = 30;

    // Quiz defaults
    public static final int DEFAULT_QUIZ_SIZE = 40;   // Đề thi chuẩn THPTQG

    // Obsidian
    public static final String OBSIDIAN_QUESTION_TAG = "#question";
}
