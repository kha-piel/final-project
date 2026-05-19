package org.example.ui;

import javafx.animation.FadeTransition;
import javafx.animation.ParallelTransition;
import javafx.animation.TranslateTransition;
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
import javafx.scene.layout.Priority;
import javafx.scene.layout.Region;
import javafx.scene.layout.StackPane;
import javafx.scene.layout.VBox;
import javafx.scene.text.Font;
import javafx.scene.text.FontWeight;
import javafx.stage.Stage;
import javafx.util.Duration;
import org.example.controller.QuizController;
import org.example.dao.AnswerDAO;
import org.example.dao.ExamDAO;
import org.example.dao.QuestionDAO;
import org.example.dao.UserDAO;
import org.example.model.User;
import org.example.util.DatabaseConnection;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.regex.Pattern;

/**
 * MainApp - ung dung JavaFX gom 3 man hinh:
 * Dang nhap / dang ky -> Trang chu -> Lam bai trac nghiem.
 */
public class MainApp extends Application {

    private static final String APP_TITLE = "THPTQG AI On Tap - Phien ban Beta";
    private static final double WINDOW_WIDTH = 1180;
    private static final double WINDOW_HEIGHT = 760;
    private static final Duration PANEL_ANIMATION_DURATION = Duration.millis(550);
    private static final Pattern EMAIL_PATTERN =
            Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");
    private static final Pattern PASSWORD_PATTERN =
            Pattern.compile("^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>/?]).{8,}$");

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

    private TextField loginIdentityField;
    private PasswordField loginPasswordField;
    private Label loginStatusLabel;

    private TextField registerNameField;
    private TextField registerEmailField;
    private PasswordField registerPasswordField;
    private PasswordField registerConfirmField;
    private Label registerStatusLabel;

    private VBox loginPane;
    private VBox registerPane;
    private StackPane authShell;
    private StackPane overlayPanel;
    private VBox loginOverlayContent;
    private VBox registerOverlayContent;
    private boolean registerMode;

    private Label lblWelcome;

    @Override
    public void start(Stage primaryStage) {
        this.primaryStage = primaryStage;
        initializeDependencies();
        buildLoginScene();
        buildHomeScene();
        buildQuizScene();

        primaryStage.setTitle(APP_TITLE);
        primaryStage.setMinWidth(1080);
        primaryStage.setMinHeight(720);
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
        StackPane root = new StackPane();
        root.getStyleClass().add("auth-page");

        Region orbOne = new Region();
        orbOne.getStyleClass().addAll("ambient-orb", "orb-one");
        Region orbTwo = new Region();
        orbTwo.getStyleClass().addAll("ambient-orb", "orb-two");
        Region orbThree = new Region();
        orbThree.getStyleClass().addAll("ambient-orb", "orb-three");

        loginPane = buildLoginPane();
        registerPane = buildRegisterPane();

        HBox formsRow = new HBox(loginPane, registerPane);
        formsRow.getStyleClass().add("forms-row");
        HBox.setHgrow(loginPane, Priority.ALWAYS);
        HBox.setHgrow(registerPane, Priority.ALWAYS);

        overlayPanel = buildOverlayPanel();

        authShell = new StackPane(formsRow, overlayPanel);
        authShell.getStyleClass().add("auth-shell");
        authShell.setMaxWidth(980);
        authShell.setPrefHeight(600);
        overlayPanel.prefWidthProperty().bind(authShell.widthProperty().divide(2.0));
        overlayPanel.setMaxWidth(Region.USE_PREF_SIZE);
        overlayPanel.setMinWidth(Region.USE_PREF_SIZE);

        authShell.widthProperty().addListener((obs, oldValue, newValue) -> positionOverlay(registerMode));
        positionOverlay(false);
        applyAuthMode(false);

        root.getChildren().addAll(orbOne, orbTwo, orbThree, authShell);
        StackPane.setAlignment(orbOne, Pos.TOP_LEFT);
        StackPane.setAlignment(orbTwo, Pos.BOTTOM_RIGHT);
        StackPane.setAlignment(orbThree, Pos.CENTER_RIGHT);
        StackPane.setAlignment(authShell, Pos.CENTER);

        loginScene = new Scene(root, WINDOW_WIDTH, WINDOW_HEIGHT);
        attachStylesheet(loginScene);
    }

    private VBox buildLoginPane() {
        Label icon = new Label("🧠");
        icon.getStyleClass().add("form-logo");

        Label title = new Label("HỆ THỐNG AI-QUIZ");
        title.getStyleClass().add("form-title");

        Label subtitle = new Label("Đăng nhập để tiếp tục vào hệ thống luyện thi và nhận giải thích từ AI.");
        subtitle.getStyleClass().add("form-subtitle");
        subtitle.setWrapText(true);

        loginIdentityField = createTextField("Nhập tài khoản hoặc email...");
        loginPasswordField = createPasswordField("Nhập mật khẩu...");

        VBox identityGroup = createInputGroup("Tên đăng nhập hoặc Email", "👤", loginIdentityField);
        VBox passwordGroup = createInputGroup("Mật khẩu", "🔒", loginPasswordField);

        Button forgotButton = new Button("Quên mật khẩu?");
        forgotButton.getStyleClass().add("link-button");
        forgotButton.setOnAction(e -> setLoginStatus("Tinh nang khoi phuc mat khau se duoc bo sung sau.", false));

        Button loginButton = new Button("ĐĂNG NHẬP");
        loginButton.getStyleClass().addAll("action-button", "primary-action");
        loginButton.setMaxWidth(Double.MAX_VALUE);
        loginButton.setOnAction(e -> handleLogin());

        loginStatusLabel = new Label();
        loginStatusLabel.getStyleClass().addAll("status-label", "login-status");
        loginStatusLabel.setWrapText(true);
        loginStatusLabel.setMinHeight(26);

        VBox pane = new VBox(14, icon, title, subtitle, identityGroup, passwordGroup, forgotButton, loginButton, loginStatusLabel);
        pane.getStyleClass().addAll("form-pane", "login-pane");
        pane.setAlignment(Pos.CENTER_LEFT);
        pane.setPadding(new Insets(52, 48, 52, 48));
        return pane;
    }

    private VBox buildRegisterPane() {
        Label icon = new Label("✨");
        icon.getStyleClass().add("form-logo");

        Label title = new Label("ĐĂNG KÝ TÀI KHOẢN");
        title.getStyleClass().add("form-title");

        Label subtitle = new Label("Tạo tài khoản mới để lưu kết quả học tập và đồng bộ hành trình ôn luyện.");
        subtitle.getStyleClass().add("form-subtitle");
        subtitle.setWrapText(true);

        registerNameField = createTextField("Nhập họ tên...");
        registerEmailField = createTextField("...@gmail.com");
        registerPasswordField = createPasswordField("Tối thiểu 8 ký tự, có 1 ký tự hoa và ký tự đặc biệt...");
        registerConfirmField = createPasswordField("Nhập lại mật khẩu...");

        VBox nameGroup = createInputGroup("Họ và Tên", "🪪", registerNameField);
        VBox emailGroup = createInputGroup("Email", "✉", registerEmailField);
        VBox passwordGroup = createInputGroup("Mật khẩu", "🔐", registerPasswordField);
        VBox confirmGroup = createInputGroup("Xác nhận mật khẩu", "✅", registerConfirmField);

        Button registerButton = new Button("ĐĂNG KÝ NGAY");
        registerButton.getStyleClass().addAll("action-button", "primary-action");
        registerButton.setMaxWidth(Double.MAX_VALUE);
        registerButton.setOnAction(e -> handleRegister());

        registerStatusLabel = new Label();
        registerStatusLabel.getStyleClass().addAll("status-label", "register-status");
        registerStatusLabel.setWrapText(true);
        registerStatusLabel.setMinHeight(26);

        VBox pane = new VBox(13, icon, title, subtitle, nameGroup, emailGroup, passwordGroup, confirmGroup, registerButton, registerStatusLabel);
        pane.getStyleClass().addAll("form-pane", "register-pane");
        pane.setAlignment(Pos.CENTER_LEFT);
        pane.setPadding(new Insets(42, 48, 42, 48));
        return pane;
    }

    private StackPane buildOverlayPanel() {
        Label loginTitle = new Label("Đã có tài khoản?");
        loginTitle.getStyleClass().add("overlay-title");
        Label loginText = new Label("Đăng nhập để tiếp tục theo dõi tiến độ học tập và làm bài ngay.");
        loginText.getStyleClass().add("overlay-text");
        loginText.setWrapText(true);
        Button backToLoginButton = new Button("ĐĂNG NHẬP");
        backToLoginButton.getStyleClass().add("ghost-button");
        backToLoginButton.setOnAction(e -> switchAuthMode(false));

        loginOverlayContent = new VBox(16, loginTitle, loginText, backToLoginButton);
        loginOverlayContent.getStyleClass().add("overlay-content");
        loginOverlayContent.setAlignment(Pos.CENTER);
        loginOverlayContent.setVisible(false);
        loginOverlayContent.setOpacity(0);

        Label registerTitle = new Label("Chưa có tài khoản?");
        registerTitle.getStyleClass().add("overlay-title");
        Label registerText = new Label("Tạo hồ sơ học viên mới để lưu điểm số, lịch sử làm bài và gợi ý cá nhân hóa.");
        registerText.getStyleClass().add("overlay-text");
        registerText.setWrapText(true);
        Button goToRegisterButton = new Button("ĐĂNG KÝ NGAY");
        goToRegisterButton.getStyleClass().add("ghost-button");
        goToRegisterButton.setOnAction(e -> switchAuthMode(true));

        registerOverlayContent = new VBox(16, registerTitle, registerText, goToRegisterButton);
        registerOverlayContent.getStyleClass().add("overlay-content");
        registerOverlayContent.setAlignment(Pos.CENTER);

        StackPane overlay = new StackPane(loginOverlayContent, registerOverlayContent);
        overlay.getStyleClass().add("overlay-panel");
        overlay.setMouseTransparent(false);
        return overlay;
    }

    private VBox createInputGroup(String labelText, String iconText, TextField field) {
        Label label = new Label(labelText);
        label.getStyleClass().add("input-label");

        Label icon = new Label(iconText);
        icon.getStyleClass().add("input-icon");

        HBox wrapper = new HBox(10, icon, field);
        wrapper.getStyleClass().add("input-wrapper");
        wrapper.setAlignment(Pos.CENTER_LEFT);
        HBox.setHgrow(field, Priority.ALWAYS);

        VBox group = new VBox(6, label, wrapper);
        group.getStyleClass().add("input-group");
        return group;
    }

    private TextField createTextField(String prompt) {
        TextField field = new TextField();
        field.setPromptText(prompt);
        field.getStyleClass().add("auth-input");
        field.setMaxWidth(Double.MAX_VALUE);
        return field;
    }

    private PasswordField createPasswordField(String prompt) {
        PasswordField field = new PasswordField();
        field.setPromptText(prompt);
        field.getStyleClass().add("auth-input");
        field.setMaxWidth(Double.MAX_VALUE);
        return field;
    }

    private void switchAuthMode(boolean toRegister) {
        if (registerMode == toRegister) {
            return;
        }

        registerMode = toRegister;

        TranslateTransition translate = new TranslateTransition(PANEL_ANIMATION_DURATION, overlayPanel);
        translate.setToX(calculateOverlayOffset(registerMode));

        VBox contentToHide = toRegister ? registerOverlayContent : loginOverlayContent;
        VBox contentToShow = toRegister ? loginOverlayContent : registerOverlayContent;

        FadeTransition hide = new FadeTransition(Duration.millis(180), contentToHide);
        hide.setToValue(0);
        hide.setOnFinished(e -> {
            contentToHide.setVisible(false);
            contentToShow.setVisible(true);
        });

        FadeTransition show = new FadeTransition(Duration.millis(260), contentToShow);
        show.setFromValue(0);
        show.setToValue(1);
        show.setDelay(Duration.millis(170));

        applyAuthMode(registerMode);
        new ParallelTransition(translate, hide, show).play();
    }

    private void positionOverlay(boolean toRegister) {
        if (overlayPanel == null) {
            return;
        }
        overlayPanel.setTranslateX(calculateOverlayOffset(toRegister));
    }

    private double calculateOverlayOffset(boolean toRegister) {
        double shellWidth = authShell == null || authShell.getWidth() <= 0 ? 980 : authShell.getWidth();
        double offset = shellWidth / 4.0;
        return toRegister ? -offset : offset;
    }

    private void applyAuthMode(boolean toRegister) {
        if (authShell == null) {
            return;
        }

        authShell.getStyleClass().removeAll("mode-login", "mode-register");
        authShell.getStyleClass().add(toRegister ? "mode-register" : "mode-login");

        loginPane.setMouseTransparent(toRegister);
        registerPane.setMouseTransparent(!toRegister);

        loginPane.setOpacity(toRegister ? 0.42 : 1.0);
        registerPane.setOpacity(toRegister ? 1.0 : 0.42);
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

        btnStartQuiz.setOnAction(e -> openExamScene(1));
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
        String identity = safeTrim(loginIdentityField);
        String password = safeTrim(loginPasswordField);

        if (identity.isEmpty() || password.isEmpty()) {
            setLoginStatus("Vui long nhap day du tai khoan/email va mat khau.", false);
            return;
        }

        User authenticatedUser = userDAO.authenticate(identity, password);
        if (authenticatedUser == null) {
            setLoginStatus("Dang nhap that bai. Sai thong tin dang nhap hoac mat khau.", false);
            return;
        }

        currentUser = authenticatedUser;
        updateHomeForCurrentUser();
        clearAuthForms();
        setLoginStatus("", false);
        primaryStage.setScene(homeScene);
    }

    private void handleRegister() {
        String fullName = safeTrim(registerNameField);
        String email = safeTrim(registerEmailField);
        String password = safeTrim(registerPasswordField);
        String confirmPassword = safeTrim(registerConfirmField);

        if (fullName.length() < 2) {
            setRegisterStatus("Ho ten phai co it nhat 2 ky tu.", false);
            return;
        }
        if (!EMAIL_PATTERN.matcher(email).matches()) {
            setRegisterStatus("Email khong dung dinh dang.", false);
            return;
        }
        if (!PASSWORD_PATTERN.matcher(password).matches()) {
            setRegisterStatus("Mat khau can toi thieu 8 ky tu, 1 chu hoa va 1 ky tu dac biet.", false);
            return;
        }
        if (!password.equals(confirmPassword)) {
            setRegisterStatus("Xac nhan mat khau khong khop.", false);
            return;
        }

        User newUser = new User();
        newUser.setUsername(email);
        newUser.setEmail(email);
        newUser.setPasswordHash(password);
        newUser.setFullName(fullName);
        newUser.setRole("student");

        boolean registered = userDAO.register(newUser);
        if (!registered) {
            setRegisterStatus("Dang ky that bai. Email co the da ton tai.", false);
            return;
        }

        setRegisterStatus("Dang ky thanh cong. Ban co the dang nhap ngay.", true);
        loginIdentityField.setText(email);
        loginPasswordField.clear();
        clearRegisterForm();
        switchAuthMode(false);
        setLoginStatus("Tai khoan moi da san sang. Dang nhap bang email va mat khau vua tao.", true);
    }

    private void setLoginStatus(String message, boolean success) {
        applyStatus(loginStatusLabel, message, success);
    }

    private void setRegisterStatus(String message, boolean success) {
        applyStatus(registerStatusLabel, message, success);
    }

    private void applyStatus(Label label, String message, boolean success) {
        label.getStyleClass().removeAll("status-success", "status-error");
        if (message != null && !message.isBlank()) {
            label.getStyleClass().add(success ? "status-success" : "status-error");
        }
        label.setText(message);
    }

    private void updateHomeForCurrentUser() {
        String displayName = currentUser.getFullName() != null && !currentUser.getFullName().isBlank()
                ? currentUser.getFullName()
                : currentUser.getUsername();
        lblWelcome.setText("Xin chao, " + displayName + "!\nVai tro hien tai: " + currentUser.getRole());
    }

    private void clearRegisterForm() {
        registerNameField.clear();
        registerEmailField.clear();
        registerPasswordField.clear();
        registerConfirmField.clear();
    }

    private void clearAuthForms() {
        loginIdentityField.clear();
        loginPasswordField.clear();
        clearRegisterForm();
        setRegisterStatus("", false);
    }

    private void logout() {
        currentUser = null;
        clearAuthForms();
        setLoginStatus("", false);
        switchAuthMode(false);
        primaryStage.setScene(loginScene);
    }

    private String safeTrim(TextField field) {
        return field.getText() == null ? "" : field.getText().trim();
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

    static void launchApp(String[] args) {
        launch(args);
    }
}
