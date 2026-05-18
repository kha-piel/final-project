package org.example.ui;

import javafx.application.Application;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.PasswordField;
import javafx.scene.control.TextField;
import javafx.scene.layout.HBox;
import javafx.scene.layout.VBox;
import javafx.scene.text.Font;
import javafx.scene.text.FontWeight;
import javafx.stage.Stage;
import org.example.controller.QuizController;
import org.example.dao.AnswerDAO;
import org.example.dao.ExamDAO;
import org.example.dao.QuestionDAO;
import org.example.dao.UserDAO;
import org.example.model.User;
import org.example.util.DatabaseConnection;

import java.sql.Connection;
import java.sql.SQLException;

/**
 * MainApp - ung dung JavaFX gom 3 man hinh:
 * Dang nhap -> Trang chu -> Lam bai trac nghiem.
 */
public class MainApp extends Application {

    private static final String APP_TITLE = "THPTQG AI On Tap - Phien ban Beta";
    private static final double WINDOW_WIDTH = 900;
    private static final double WINDOW_HEIGHT = 650;

    private Stage primaryStage;
    private Scene loginScene;
    private Scene homeScene;
    private Scene quizScene;

    private Connection connection;
    private QuestionDAO questionDAO;
    private AnswerDAO answerDAO;
    private ExamDAO examDAO;
    private UserDAO userDAO;
    private QuizController quizController;

    private User currentUser;

    private Label lblLoginStatus;
    private TextField tfUsername;
    private PasswordField pfPassword;
    private TextField tfFullName;

    private Label lblWelcome;

    @Override
    public void start(Stage primaryStage) {
        this.primaryStage = primaryStage;
        initializeDependencies();
        buildLoginScene();
        buildHomeScene();
        buildQuizScene();

        primaryStage.setTitle(APP_TITLE);
        primaryStage.setScene(loginScene);
        primaryStage.show();
    }

    private void initializeDependencies() {
        try {
            connection = DatabaseConnection.getInstance();
            questionDAO = new QuestionDAO(connection);
            answerDAO = new AnswerDAO(connection);
            examDAO = new ExamDAO(connection);
            userDAO = new UserDAO(connection);
            quizController = new QuizController(examDAO, questionDAO, answerDAO);
        } catch (SQLException ex) {
            throw new RuntimeException("Khong the khoi tao ket noi SQLite: " + ex.getMessage(), ex);
        }
    }

    private void buildLoginScene() {
        Label title = new Label("Dang Nhap He Thong");
        title.setFont(Font.font("System", FontWeight.BOLD, 26));

        Label subtitle = new Label("Dang nhap de vao trang chu, hoac tao tai khoan moi nhanh.");
        subtitle.setWrapText(true);

        tfUsername = new TextField();
        tfUsername.setPromptText("Username");

        pfPassword = new PasswordField();
        pfPassword.setPromptText("Password");

        tfFullName = new TextField();
        tfFullName.setPromptText("Full name (chi can khi dang ky)");

        Button btnLogin = new Button("Dang nhap");
        Button btnRegister = new Button("Dang ky");

        btnLogin.setOnAction(e -> handleLogin());
        btnRegister.setOnAction(e -> handleRegister());

        HBox buttonRow = new HBox(12, btnLogin, btnRegister);
        buttonRow.setAlignment(Pos.CENTER);

        lblLoginStatus = new Label();
        lblLoginStatus.setWrapText(true);

        VBox root = new VBox(14, title, subtitle, tfUsername, pfPassword, tfFullName, buttonRow, lblLoginStatus);
        root.setPadding(new Insets(28));
        root.setAlignment(Pos.CENTER);
        root.setMaxWidth(420);

        VBox container = new VBox(root);
        container.setAlignment(Pos.CENTER);
        container.setPadding(new Insets(24));

        loginScene = new Scene(container, WINDOW_WIDTH, WINDOW_HEIGHT);
    }

    private void buildHomeScene() {
        Label title = new Label("Trang Chu");
        title.setFont(Font.font("System", FontWeight.BOLD, 28));

        lblWelcome = new Label("Xin chao!");
        lblWelcome.setFont(Font.font("System", FontWeight.NORMAL, 18));
        lblWelcome.setWrapText(true);

        Label description = new Label("Ban co the vao man hinh lam bai trac nghiem va hoi AI giai thich khi tra loi sai.");
        description.setWrapText(true);

        Button btnStartQuiz = new Button("Bat dau lam bai");
        Button btnLogout = new Button("Dang xuat");

        btnStartQuiz.setOnAction(e -> {
            openExamScene(1);
        });
        btnLogout.setOnAction(e -> logout());

        HBox actions = new HBox(12, btnStartQuiz, btnLogout);
        actions.setAlignment(Pos.CENTER);

        VBox root = new VBox(18, title, lblWelcome, description, actions);
        root.setPadding(new Insets(28));
        root.setAlignment(Pos.CENTER);

        homeScene = new Scene(root, WINDOW_WIDTH, WINDOW_HEIGHT);
    }

    private void buildQuizScene() {
        VBox placeholder = new VBox(new Label("Dang san sang mo de thi..."));
        placeholder.setAlignment(Pos.CENTER);
        placeholder.setPadding(new Insets(20));
        quizScene = new Scene(placeholder, WINDOW_WIDTH, WINDOW_HEIGHT);
    }

    private void handleLogin() {
        String username = tfUsername.getText() != null ? tfUsername.getText().trim() : "";
        String password = pfPassword.getText() != null ? pfPassword.getText().trim() : "";

        if (username.isEmpty() || password.isEmpty()) {
            lblLoginStatus.setText("Vui long nhap day du username va password.");
            return;
        }

        User authenticatedUser = userDAO.authenticate(username, password);
        if (authenticatedUser == null) {
            lblLoginStatus.setText("Dang nhap that bai. Sai username hoac password.");
            return;
        }

        currentUser = authenticatedUser;
        updateHomeForCurrentUser();
        clearLoginForm();
        lblLoginStatus.setText("");
        primaryStage.setScene(homeScene);
    }

    private void handleRegister() {
        String username = tfUsername.getText() != null ? tfUsername.getText().trim() : "";
        String password = pfPassword.getText() != null ? pfPassword.getText().trim() : "";
        String fullName = tfFullName.getText() != null ? tfFullName.getText().trim() : "";

        if (username.isEmpty() || password.isEmpty()) {
            lblLoginStatus.setText("Can username va password de dang ky.");
            return;
        }

        User newUser = new User();
        newUser.setUsername(username);
        newUser.setPasswordHash(password);
        newUser.setFullName(fullName.isEmpty() ? username : fullName);
        newUser.setRole("student");

        boolean registered = userDAO.register(newUser);
        if (registered) {
            lblLoginStatus.setText("Dang ky thanh cong. Ban co the dang nhap ngay.");
            tfFullName.clear();
        } else {
            lblLoginStatus.setText("Dang ky that bai. Username co the da ton tai.");
        }
    }

    private void updateHomeForCurrentUser() {
        String displayName = currentUser.getFullName() != null && !currentUser.getFullName().isBlank()
                ? currentUser.getFullName()
                : currentUser.getUsername();
        lblWelcome.setText("Xin chao, " + displayName + "!\nVai tro hien tai: " + currentUser.getRole());
    }

    private void clearLoginForm() {
        tfUsername.clear();
        pfPassword.clear();
        tfFullName.clear();
    }

    private void logout() {
        currentUser = null;
        clearLoginForm();
        lblLoginStatus.setText("");
        primaryStage.setScene(loginScene);
    }

    private void openExamScene(int examId) {
        try {
            quizController.startExam(examId);
            ExamView examView = new ExamView(quizController, primaryStage);
            quizScene.setRoot(examView);
            primaryStage.setScene(quizScene);
        } catch (Exception ex) {
            Label errorLabel = new Label("Khong the mo de thi: " + ex.getMessage());
            errorLabel.setWrapText(true);
            VBox errorRoot = new VBox(16, errorLabel);
            errorRoot.setAlignment(Pos.CENTER);
            errorRoot.setPadding(new Insets(24));
            quizScene.setRoot(errorRoot);
            primaryStage.setScene(quizScene);
        }
    }

    @Override
    public void stop() {
        DatabaseConnection.closeConnection();
    }

    public static void main(String[] args) {
        launch(args);
    }
}
