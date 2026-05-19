package org.example.ui;

/**
 * Launcher — Điểm khởi chạy thực tế của ứng dụng.
 *
 * <p><b>Tại sao cần class này?</b>
 * Khi chạy JavaFX ở chế độ non-modular (không có {@code module-info.java}),
 * nếu main class kế thừa {@code Application}, JavaFX runtime sẽ ném lỗi:
 * <pre>
 *   Error: JavaFX runtime components are missing...
 * </pre>
 *
 * <p>Giải pháp: Tạo một class trung gian (Launcher) <b>KHÔNG</b> kế thừa
 * {@code Application}. Class này chỉ đơn giản gọi {@code MainApp.launchApp()},
 * nhờ đó JVM khởi động bình thường trước khi JavaFX được load.
 *
 * <p><b>Cách chạy:</b>
 * <pre>
 *   java -cp ... org.example.ui.Launcher
 * </pre>
 * hoặc qua Maven:
 * <pre>
 *   mvn javafx:run
 * </pre>
 */
public class Launcher {

    public static void main(String[] args) {
        MainApp.launchApp(args);
    }
}
