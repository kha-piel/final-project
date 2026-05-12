package org.example.ui;

import javafx.application.Application;
import javafx.geometry.Pos;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.layout.StackPane;
import javafx.scene.text.Font;
import javafx.stage.Stage;

/**
 * MainApp — Lớp khởi động giao diện đồ họa JavaFX.
 *
 * <p>Đây là entry-point chính của ứng dụng THPTQG AI Ôn Tập.
 * Kế thừa {@link javafx.application.Application} để khởi tạo
 * vòng đời JavaFX (init → start → stop).
 *
 * <p><b>Lưu ý:</b> Để chạy trên môi trường non-modular (không có module-info.java),
 * hãy khởi động qua {@link Launcher} thay vì gọi trực tiếp MainApp.
 */
public class MainApp extends Application {

    // =========================================================================
    // HẰNG SỐ CẤU HÌNH GIAO DIỆN
    // =========================================================================

    /** Tiêu đề cửa sổ chính */
    private static final String APP_TITLE = "THPTQG AI Ôn Tập - Phiên bản Beta";

    /** Kích thước cửa sổ mặc định */
    private static final double WINDOW_WIDTH  = 1280;
    private static final double WINDOW_HEIGHT = 720;

    // =========================================================================
    // VÒNG ĐỜI JAVAFX: start()
    // =========================================================================

    /**
     * Được gọi bởi JavaFX runtime sau khi Application đã khởi tạo.
     * Thiết lập Scene gốc và hiển thị cửa sổ chính.
     *
     * @param primaryStage Stage chính do JavaFX cung cấp
     */
    @Override
    public void start(Stage primaryStage) {

        // --- 1. Tạo nút bấm chính ---
        Button btnStart = new Button("Bắt đầu học ngay");
        btnStart.setFont(Font.font("System", 18));
        btnStart.setStyle(
            "-fx-background-color: #4361ee;" +
            "-fx-text-fill: white;" +
            "-fx-padding: 12 32 12 32;" +
            "-fx-background-radius: 8;" +
            "-fx-cursor: hand;"
        );

        // Hiệu ứng hover
        btnStart.setOnMouseEntered(e -> btnStart.setStyle(
            "-fx-background-color: #3a0ca3;" +
            "-fx-text-fill: white;" +
            "-fx-padding: 12 32 12 32;" +
            "-fx-background-radius: 8;" +
            "-fx-cursor: hand;"
        ));
        btnStart.setOnMouseExited(e -> btnStart.setStyle(
            "-fx-background-color: #4361ee;" +
            "-fx-text-fill: white;" +
            "-fx-padding: 12 32 12 32;" +
            "-fx-background-radius: 8;" +
            "-fx-cursor: hand;"
        ));

        // Sự kiện click (tạm thời in ra console)
        btnStart.setOnAction(e -> {
            System.out.println("[MainApp] Nút 'Bắt đầu học ngay' đã được nhấn!");
        });

        // --- 2. Đặt nút vào StackPane (căn giữa tự động) ---
        StackPane root = new StackPane(btnStart);
        root.setAlignment(Pos.CENTER);
        root.setStyle("-fx-background-color: #f8f9fa;");

        // --- 3. Tạo Scene với kích thước 1280x720 ---
        Scene scene = new Scene(root, WINDOW_WIDTH, WINDOW_HEIGHT);

        // --- 4. Thiết lập Stage chính ---
        primaryStage.setTitle(APP_TITLE);
        primaryStage.setScene(scene);
        primaryStage.setMinWidth(800);
        primaryStage.setMinHeight(500);

        // --- 5. Hiển thị cửa sổ ---
        primaryStage.show();
    }

    /**
     * Entry-point tiêu chuẩn cho JavaFX Application.
     * Gọi {@link Application#launch(String...)} để khởi động vòng đời JavaFX.
     *
     * @param args tham số dòng lệnh
     */
    public static void main(String[] args) {
        launch(args);
    }
}
