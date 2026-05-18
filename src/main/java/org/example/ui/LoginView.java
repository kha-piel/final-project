package org.example.ui;

import javafx.geometry.Pos;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.PasswordField;
import javafx.scene.control.TextField;
import javafx.scene.layout.VBox;
import javafx.scene.paint.Color;
import org.example.dao.UserDAO;
import org.example.model.User;
import org.example.util.DatabaseConnection;

import java.sql.Connection;
import java.sql.SQLException;

public class LoginView extends VBox {

    private TextField usernameField;
    private PasswordField passwordField;
    private Label errorLabel;

    public LoginView() {
        // Cài đặt VBox
        this.setAlignment(Pos.CENTER);
        this.setSpacing(15);
        this.setStyle("-fx-padding: 30;");

        // Khởi tạo các thành phần UI
        Label titleLabel = new Label("ĐĂNG NHẬP HỆ THỐNG");
        titleLabel.setStyle("-fx-font-size: 20px; -fx-font-weight: bold;");

        usernameField = new TextField();
        usernameField.setPromptText("Username");
        usernameField.setMaxWidth(250);

        passwordField = new PasswordField();
        passwordField.setPromptText("Password");
        passwordField.setMaxWidth(250);

        errorLabel = new Label("Sai tài khoản hoặc mật khẩu");
        errorLabel.setTextFill(Color.RED);
        errorLabel.setVisible(false);

        Button loginButton = new Button("Đăng nhập");
        loginButton.setOnAction(e -> handleLogin());

        // Thêm vào VBox
        this.getChildren().addAll(titleLabel, usernameField, passwordField, errorLabel, loginButton);
    }

    private void handleLogin() {
        String username = usernameField.getText();
        String password = passwordField.getText();

        try {
            Connection conn = DatabaseConnection.getInstance();
            UserDAO userDAO = new UserDAO(conn);
            User user = userDAO.authenticate(username, password);

            if (user != null) {
                System.out.println("Đăng nhập thành công");
                errorLabel.setVisible(false);
                // TODO: Chuyển sang Dashboard
            } else {
                errorLabel.setText("Sai tài khoản hoặc mật khẩu");
                errorLabel.setVisible(true);
            }
        } catch (SQLException e) {
            e.printStackTrace();
            errorLabel.setText("Lỗi kết nối cơ sở dữ liệu");
            errorLabel.setVisible(true);
        }
    }
}
