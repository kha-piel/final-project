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
import org.example.service.SupabaseAuthService;
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
    private SupabaseAuthService supabaseAuthService;
    private String databaseInitError;
    private String lastAuthError;

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
        supabaseAuthService = new SupabaseAuthService();

        try {
            connection = DatabaseConnection.getInstance();
            questionDAO = new QuestionDAO(connection);
            answerDAO = new AnswerDAO(connection);
            examDAO = new ExamDAO(connection);
            userDAO = new UserDAO(connection);
            quizController = new QuizController(examDAO, questionDAO, answerDAO);
            databaseInitError = null;
        } catch (SQLException ex) {
            connection = null;
            questionDAO = null;
            answerDAO = null;
            examDAO = null;
            userDAO = null;
            quizController = null;
            databaseInitError = ex.getMessage();
            System.err.println("Khoi tao DB bi bo qua: " + databaseInitError);
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
                showDatabaseWarningIfNeeded();
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

        if (!supabaseAuthService.isConfigured()) {
            runScript("showLoginStatus(" + quoteJs("Chua cau hinh Supabase Auth cho ung dung Java.") + ", false);");
            return;
        }

        User authenticatedUser = authenticateUser(safeIdentity, safePassword);
        if (authenticatedUser == null) {
            String errorMessage = lastAuthError == null || lastAuthError.isBlank()
                    ? "Dang nhap that bai. Sai thong tin dang nhap hoac mat khau."
                    : lastAuthError;
            runScript("showLoginStatus(" + quoteJs(errorMessage) + ", false);");
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
        if (!supabaseAuthService.isConfigured()) {
            runScript("showRegisterStatus(" + quoteJs("Chua cau hinh Supabase Auth cho ung dung Java.") + ", false);");
            return;
        }

        User newUser = new User();
        newUser.setUsername(safeEmail);
        newUser.setEmail(safeEmail);
        newUser.setPasswordHash(safePassword);
        newUser.setFullName(safeFullName);
        newUser.setRole("student");

        SupabaseAuthService.AuthResult registerAuthResult = supabaseAuthService.signUp(newUser, safePassword);
        if (!registerAuthResult.isSuccess()) {
            runScript("showRegisterStatus(" + quoteJs(registerAuthResult.getMessage()) + ", false);");
            return;
        }

        if (registerAuthResult.getUserId() != null && !registerAuthResult.getUserId().isBlank()) {
            newUser.setUserId(registerAuthResult.getUserId());
        }
        if (registerAuthResult.getEmail() != null && !registerAuthResult.getEmail().isBlank()) {
            newUser.setEmail(registerAuthResult.getEmail());
            newUser.setUsername(registerAuthResult.getEmail());
        }

        if (userDAO != null && !userDAO.register(newUser)) {
            runScript("showRegisterStatus(" + quoteJs("Tao auth user thanh cong nhung khong dong bo duoc user_profiles.") + ", false);");
            return;
        }

        String registerMessage = registerAuthResult.isSessionAvailable()
                ? "Dang ky thanh cong."
                : "Dang ky thanh cong. Neu project dang bat Confirm email, hay mo email de xac thuc truoc khi dang nhap.";

        runScript("handleRegisterSuccess("
                + quoteJs(registerMessage)
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
        StringBuilder message = new StringBuilder("Xin chao, " + displayName + "!\nVai tro hien tai: " + currentUser.getRole());
        if (databaseInitError != null && !databaseInitError.isBlank()) {
            message.append("\nChe do hien tai: chi dang nhap/doi mat khau Supabase, tinh nang de thi can cau hinh DB.");
        }
        lblWelcome.setText(message.toString());
    }

    private void logout() {
        currentUser = null;
        runScript("clearAuthForms(); showLoginStatus('', true); showRegisterStatus('', true); showLoginForm();");
        primaryStage.setScene(loginScene);
    }

    private void openExamScene(int examId) {
        try {
            if (!ensureDataAccessAvailable()) {
                Label errorLabel = new Label("Chua the mo de thi vi ket noi PostgreSQL/Supabase chua san sang.\n"
                        + "Chi tiet: " + databaseInitError);
                errorLabel.setWrapText(true);
                VBox errorRoot = new VBox(16, errorLabel);
                errorRoot.setAlignment(Pos.CENTER);
                errorRoot.setPadding(new Insets(24));
                quizScene.setRoot(errorRoot);
                primaryStage.setScene(quizScene);
                return;
            }
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

    private User authenticateUser(String identity, String password) {
        lastAuthError = "";

        if (userDAO != null) {
            User dbUser = userDAO.authenticate(identity, password);
            if (dbUser != null) {
                return dbUser;
            }
        }

        if (!EMAIL_PATTERN.matcher(identity).matches()) {
            if (userDAO == null) {
                lastAuthError = "Hien tai app chua ket noi duoc PostgreSQL, nen ban phai dang nhap bang email Supabase thay vi username.";
            }
            return null;
        }

        SupabaseAuthService.AuthResult authResult = supabaseAuthService.signIn(identity, password);
        if (!authResult.isSuccess()) {
            lastAuthError = translateAuthError(authResult.getMessage());
            return null;
        }

        if (userDAO != null && authResult.getUserId() != null && !authResult.getUserId().isBlank()) {
            return userDAO.findByUserId(authResult.getUserId()).orElseGet(() -> buildAuthOnlyUser(authResult));
        }

        return buildAuthOnlyUser(authResult);
    }

    private String translateAuthError(String authMessage) {
        if (authMessage == null || authMessage.isBlank()) {
            return "Dang nhap that bai.";
        }

        String normalized = authMessage.toLowerCase();
        if (normalized.contains("email_not_confirmed")) {
            return "Tai khoan chua xac thuc email. Hay mo hop thu va xac nhan email truoc khi dang nhap.";
        }
        if (normalized.contains("invalid login credentials")) {
            return "Email hoac mat khau khong dung.";
        }
        if (normalized.contains("email rate limit exceeded") || normalized.contains("over_email_send_rate_limit")) {
            return "Supabase dang gioi han tan suat gui email. Hay doi mot luc roi thu lai.";
        }

        return authMessage;
    }

    private User buildAuthOnlyUser(SupabaseAuthService.AuthResult authResult) {
        User user = new User();
        user.setUserId(authResult.getUserId());
        user.setEmail(authResult.getEmail());
        user.setUsername(authResult.getEmail());
        user.setFullName(authResult.getEmail());
        user.setRole("student");
        user.setStatus("active");
        return user;
    }

    private boolean ensureDataAccessAvailable() {
        if (quizController != null) {
            return true;
        }

        try {
            connection = DatabaseConnection.getInstance();
            questionDAO = new QuestionDAO(connection);
            answerDAO = new AnswerDAO(connection);
            examDAO = new ExamDAO(connection);
            userDAO = new UserDAO(connection);
            quizController = new QuizController(examDAO, questionDAO, answerDAO);
            databaseInitError = null;
            return true;
        } catch (SQLException ex) {
            databaseInitError = ex.getMessage();
            return false;
        }
    }

    private void showDatabaseWarningIfNeeded() {
        if (databaseInitError == null || databaseInitError.isBlank()) {
            return;
        }

        runScript("showLoginStatus("
                + quoteJs("Canh bao: chua cau hinh xong PostgreSQL/Supabase cho du lieu de thi. "
                + "Dang nhap Supabase van co the hoat dong neu dung email. Chi tiet: " + databaseInitError)
                + ", false);");
    }
}
