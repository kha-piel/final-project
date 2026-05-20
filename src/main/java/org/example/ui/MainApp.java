package org.example.ui;

import javafx.application.Application;
import javafx.application.Platform;
import javafx.concurrent.Worker;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.layout.HBox;
import javafx.scene.layout.VBox;
import javafx.scene.text.Font;
import javafx.scene.text.FontWeight;
import javafx.scene.web.WebEngine;
import javafx.scene.web.WebView;
import javafx.stage.Stage;
import netscape.javascript.JSObject;
import org.example.controller.QuizController;
import org.example.dao.AnswerDAO;
import org.example.dao.ExamDAO;
import org.example.dao.QuestionDAO;
import org.example.dao.UserDAO;
import org.example.model.User;
import org.example.util.DatabaseConnection;

import java.net.URL;
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
    private WebEngine authEngine;
    private final AuthBridge authBridge = new AuthBridge();
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
        WebView webView = new WebView();
        webView.setContextMenuEnabled(false);
        webView.setPrefSize(WINDOW_WIDTH, WINDOW_HEIGHT);

        authEngine = webView.getEngine();
        authEngine.setJavaScriptEnabled(true);
        authEngine.getLoadWorker().stateProperty().addListener((obs, oldState, newState) -> {
            if (newState == Worker.State.SUCCEEDED) {
                attachJavaBridge();
            }
        });

        URL authPage = getClass().getResource("/auth/auth.html");
        if (authPage == null) {
            throw new IllegalStateException("Khong tim thay resource /auth/auth.html");
        }
        authEngine.load(authPage.toExternalForm());

        loginScene = new Scene(webView, WINDOW_WIDTH, WINDOW_HEIGHT);
    }

    private void attachJavaBridge() {
        try {
            JSObject window = (JSObject) authEngine.executeScript("window");
            window.setMember("javaBridge", authBridge);
            authEngine.executeScript(
                    "window.__javaBridgeReady = true;" +
                    "window.dispatchEvent(new Event('java-bridge-ready'));"
            );
        } catch (Exception ex) {
            System.err.println("Khong the gan javaBridge vao WebView: " + ex.getMessage());
        }
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

    private void handleLogin(String identity, String password) {
        String safeIdentity = identity == null ? "" : identity.trim();
        String safePassword = password == null ? "" : password.trim();

        if (safeIdentity.isEmpty() || safePassword.isEmpty()) {
            runScript("showLoginStatus(" + quoteJs("Vui long nhap day du tai khoan/email va mat khau.") + ", false);");
            return;
        }

        User authenticatedUser = userDAO.authenticate(safeIdentity, safePassword);
        if (authenticatedUser == null) {
            runScript("showLoginStatus(" + quoteJs("Dang nhap that bai. Sai thong tin dang nhap hoac mat khau.") + ", false);");
            return;
        }

        currentUser = authenticatedUser;
        updateHomeForCurrentUser();
        runScript("clearAuthForms(); showLoginStatus('', true); showRegisterStatus('', true);");
        Platform.runLater(() -> primaryStage.setScene(homeScene));
    }

    private void handleRegister(String fullName, String email, String password, String confirmPassword) {
        String safeFullName = fullName == null ? "" : fullName.trim();
        String safeEmail = email == null ? "" : email.trim();
        String safePassword = password == null ? "" : password.trim();
        String safeConfirm = confirmPassword == null ? "" : confirmPassword.trim();

        if (safeFullName.length() < 2) {
            runScript("showRegisterStatus(" + quoteJs("Ho ten phai co it nhat 2 ky tu.") + ", false);");
            return;
        }
        if (!EMAIL_PATTERN.matcher(safeEmail).matches()) {
            runScript("showRegisterStatus(" + quoteJs("Email khong dung dinh dang.") + ", false);");
            return;
        }
        if (!PASSWORD_PATTERN.matcher(safePassword).matches()) {
            runScript("showRegisterStatus(" + quoteJs("Mat khau can toi thieu 8 ky tu, 1 chu hoa va 1 ky tu dac biet.") + ", false);");
            return;
        }
        if (!safePassword.equals(safeConfirm)) {
            runScript("showRegisterStatus(" + quoteJs("Xac nhan mat khau khong khop.") + ", false);");
            return;
        }

        User newUser = new User();
        newUser.setUsername(safeEmail);
        newUser.setEmail(safeEmail);
        newUser.setPasswordHash(safePassword);
        newUser.setFullName(safeFullName);
        newUser.setRole("student");

        boolean registered = userDAO.register(newUser);
        if (!registered) {
            runScript("showRegisterStatus(" + quoteJs("Dang ky that bai. Email co the da ton tai.") + ", false);");
            return;
        }

        runScript("handleRegisterSuccess("
                + quoteJs("Dang ky thanh cong.")
                + ", "
                + quoteJs(safeEmail)
                + ");");
    }

    private void runScript(String script) {
        Platform.runLater(() -> {
            if (authEngine != null) {
                try {
                    authEngine.executeScript(script);
                } catch (Exception ignored) {
                }
            }
        });
    }

    private String quoteJs(String text) {
        String value = text == null ? "" : text;
        return "'" + value
                .replace("\\", "\\\\")
                .replace("'", "\\'")
                .replace("\r", "")
                .replace("\n", "\\n") + "'";
    }

    private void updateHomeForCurrentUser() {
        String displayName = currentUser.getFullName() != null && !currentUser.getFullName().isBlank()
                ? currentUser.getFullName()
                : currentUser.getUsername();
        lblWelcome.setText("Xin chao, " + displayName + "!\nVai tro hien tai: " + currentUser.getRole());
    }

    private void logout() {
        currentUser = null;
        runScript("clearAuthForms(); showLoginStatus('', true); showRegisterStatus('', true); showLoginForm();");
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

    static void launchApp(String[] args) {
        launch(args);
    }

    public final class AuthBridge {
        public void login(String identity, String password) {
            Platform.runLater(() -> handleLogin(identity, password));
        }

        public void register(String fullName, String email, String password, String confirmPassword) {
            Platform.runLater(() -> handleRegister(fullName, email, password, confirmPassword));
        }
    }
}
