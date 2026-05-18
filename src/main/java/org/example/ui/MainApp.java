package org.example.ui;

import javafx.application.Application;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.PasswordField;
import javafx.scene.control.TextField;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.HBox;
import javafx.scene.layout.StackPane;
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
        Label badge = new Label("THPTQG AI");
        badge.getStyleClass().add("brand-badge");

        Label brandTitle = new Label("On tap thong minh cho ky thi cua ban");
        brandTitle.getStyleClass().add("brand-title");
        brandTitle.setWrapText(true);

        Label brandSubtitle = new Label("Theo doi tien do, lam de trac nghiem va nhan goi y hoc tap tu AI trong mot khong gian gon gang.");
        brandSubtitle.getStyleClass().add("brand-subtitle");
        brandSubtitle.setWrapText(true);

        Label pointOne = new Label("De thi duoc sap xep theo tung phien hoc");
        Label pointTwo = new Label("Ket qua hien thi ro rang sau khi nop bai");
        Label pointThree = new Label("Tai khoan hoc sinh duoc luu truc tiep tren SQLite");
        VBox featureList = new VBox(10, pointOne, pointTwo, pointThree);
        featureList.getStyleClass().add("feature-list");

        VBox brandPanel = new VBox(18, badge, brandTitle, brandSubtitle, featureList);
        brandPanel.getStyleClass().add("brand-panel");
        brandPanel.setAlignment(Pos.CENTER_LEFT);

        Label title = new Label("Dang nhap");
        title.getStyleClass().add("auth-title");

        Label subtitle = new Label("Nhap tai khoan de tiep tuc vao he thong.");
        subtitle.getStyleClass().add("auth-subtitle");
        subtitle.setWrapText(true);

        tfUsername = new TextField();
        tfUsername.setPromptText("vi du: student01");
        tfUsername.getStyleClass().add("auth-field");

        pfPassword = new PasswordField();
        pfPassword.setPromptText("Mat khau");
        pfPassword.getStyleClass().add("auth-field");

        tfFullName = new TextField();
        tfFullName.setPromptText("Ten hien thi khi dang ky");
        tfFullName.getStyleClass().add("auth-field");

        VBox usernameGroup = createFieldGroup("Username", tfUsername);
        VBox passwordGroup = createFieldGroup("Password", pfPassword);
        VBox fullNameGroup = createFieldGroup("Ho ten", tfFullName);

        Button btnLogin = new Button("Dang nhap");
        btnLogin.getStyleClass().add("primary-button");
        btnLogin.setMaxWidth(Double.MAX_VALUE);

        Button btnRegister = new Button("Dang ky");
        btnRegister.getStyleClass().add("secondary-button");
        btnRegister.setMaxWidth(Double.MAX_VALUE);

        btnLogin.setOnAction(e -> handleLogin());
        btnRegister.setOnAction(e -> handleRegister());

        HBox buttonRow = new HBox(12, btnLogin, btnRegister);
        buttonRow.getStyleClass().add("action-row");
        buttonRow.setAlignment(Pos.CENTER);
        HBox.setHgrow(btnLogin, javafx.scene.layout.Priority.ALWAYS);
        HBox.setHgrow(btnRegister, javafx.scene.layout.Priority.ALWAYS);

        lblLoginStatus = new Label();
        lblLoginStatus.getStyleClass().add("status-label");
        lblLoginStatus.setWrapText(true);
        lblLoginStatus.setMinHeight(24);

        VBox authCard = new VBox(16, title, subtitle, usernameGroup, passwordGroup, fullNameGroup, buttonRow, lblLoginStatus);
        authCard.getStyleClass().add("auth-card");
        authCard.setAlignment(Pos.CENTER_LEFT);
        authCard.setMaxWidth(420);

        StackPane authArea = new StackPane(authCard);
        authArea.getStyleClass().add("auth-area");
        authArea.setPadding(new Insets(32));

        BorderPane root = new BorderPane();
        root.getStyleClass().add("login-root");
        root.setLeft(brandPanel);
        root.setCenter(authArea);

        loginScene = new Scene(root, WINDOW_WIDTH, WINDOW_HEIGHT);
        attachStylesheet(loginScene);
    }

    private VBox createFieldGroup(String labelText, TextField field) {
        Label label = new Label(labelText);
        label.getStyleClass().add("field-label");

        VBox group = new VBox(7, label, field);
        group.setFillWidth(true);
        field.setMaxWidth(Double.MAX_VALUE);
        return group;
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
            setLoginStatus("Vui long nhap day du username va password.", false);
            return;
        }

        User authenticatedUser = userDAO.authenticate(username, password);
        if (authenticatedUser == null) {
            setLoginStatus("Dang nhap that bai. Sai username hoac password.", false);
            return;
        }

        currentUser = authenticatedUser;
        updateHomeForCurrentUser();
        clearLoginForm();
        setLoginStatus("", false);
        primaryStage.setScene(homeScene);
    }

    private void handleRegister() {
        String username = tfUsername.getText() != null ? tfUsername.getText().trim() : "";
        String password = pfPassword.getText() != null ? pfPassword.getText().trim() : "";
        String fullName = tfFullName.getText() != null ? tfFullName.getText().trim() : "";

        if (username.isEmpty() || password.isEmpty()) {
            setLoginStatus("Can username va password de dang ky.", false);
            return;
        }

        User newUser = new User();
        newUser.setUsername(username);
        newUser.setPasswordHash(password);
        newUser.setFullName(fullName.isEmpty() ? username : fullName);
        newUser.setRole("student");

        boolean registered = userDAO.register(newUser);
        if (registered) {
            setLoginStatus("Dang ky thanh cong. Ban co the dang nhap ngay.", true);
            tfFullName.clear();
        } else {
            setLoginStatus("Dang ky that bai. Username co the da ton tai.", false);
        }
    }

    private void setLoginStatus(String message, boolean success) {
        lblLoginStatus.getStyleClass().removeAll("status-success", "status-error");
        if (message != null && !message.isBlank()) {
            lblLoginStatus.getStyleClass().add(success ? "status-success" : "status-error");
        }
        lblLoginStatus.setText(message);
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
        setLoginStatus("", false);
        primaryStage.setScene(loginScene);
    }

    private void attachStylesheet(Scene scene) {
        var css = getClass().getResource("/styles/login.css");
        if (css != null) {
            scene.getStylesheets().add(css.toExternalForm());
        }
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
