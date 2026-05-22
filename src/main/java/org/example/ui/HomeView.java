package org.example.ui;

import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Scene;
import javafx.scene.control.Alert;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.GridPane;
import javafx.scene.layout.Priority;
import javafx.scene.layout.Region;
import javafx.scene.layout.VBox;
import javafx.stage.Stage;
import org.example.controller.DashboardController;
import org.example.dao.BookmarkDAO;
import org.example.model.User;
import org.example.util.DatabaseConnection;

import java.sql.Connection;
import java.sql.SQLException;

public class HomeView extends BorderPane {

    private static final double WINDOW_WIDTH = 900;
    private static final double WINDOW_HEIGHT = 650;

    private final Stage stage;
    private final User currentUser;
    private final Runnable logoutAction;

    public HomeView(Stage stage, User currentUser, Runnable logoutAction) {
        this.stage = stage;
        this.currentUser = currentUser;
        this.logoutAction = logoutAction;
        buildUi();
    }

    private void buildUi() {
        setPadding(new Insets(28));
        setStyle("-fx-background-color: linear-gradient(to bottom right, #f8fbff, #eef4ff);");

        Label titleLabel = new Label("Trang chu hoc sinh");
        titleLabel.setStyle("-fx-font-size: 30px; -fx-font-weight: bold; -fx-text-fill: #12304a;");

        String displayName = currentUser.getFullName() != null && !currentUser.getFullName().isBlank()
                ? currentUser.getFullName()
                : currentUser.getUsername();

        Label subtitleLabel = new Label("Chao " + displayName + ", hay chon chuc nang ban muon su dung.");
        subtitleLabel.setStyle("-fx-font-size: 15px; -fx-text-fill: #52667a;");

        VBox headerBox = new VBox(8, titleLabel, subtitleLabel);

        Button btnLogout = new Button("Dang xuat");
        btnLogout.setStyle(
                "-fx-background-color: #ffffff;" +
                        "-fx-text-fill: #1f3b57;" +
                        "-fx-font-size: 14px;" +
                        "-fx-font-weight: bold;" +
                        "-fx-padding: 10 18 10 18;" +
                        "-fx-background-radius: 12;" +
                        "-fx-border-radius: 12;" +
                        "-fx-border-color: #d7e3f4;"
        );
        btnLogout.setOnAction(event -> logoutAction.run());

        Region spacer = new Region();
        BorderPane.setAlignment(btnLogout, Pos.CENTER_RIGHT);

        BorderPane topBar = new BorderPane();
        topBar.setLeft(headerBox);
        topBar.setCenter(spacer);
        topBar.setRight(btnLogout);

        GridPane featureGrid = new GridPane();
        featureGrid.setHgap(22);
        featureGrid.setVgap(22);
        featureGrid.setAlignment(Pos.CENTER);
        featureGrid.setPadding(new Insets(18, 0, 0, 0));

        Button examCard = createFeatureCard(
                "Lam bai thi thu",
                "Vao nhanh mot bai thi mo phong co bo dem thoi gian va cham diem.",
                "#0f766e",
                () -> showComingSoon()
        );
        Button reviewCard = createFeatureCard(
                "On tap kien thuc",
                "Mo khu vuc chon mon hoc, chuyen de va xao tron cau hoi de luyen tap.",
                "#2563eb",
                this::openDashboard
        );
        Button bookmarkCard = createFeatureCard(
                "Cau da danh dau",
                "Mo lai nhung cau ban muon xem ky hon sau khi nop bai de on tap co chu dich.",
                "#7c3aed",
                this::openBookmarkedQuestions
        );
        Button historyCard = createFeatureCard(
                "Lich su lam bai",
                "Tong hop ket qua, diem so va tien trinh nhung bai da hoan thanh.",
                "#ea580c",
                () -> showComingSoon()
        );

        featureGrid.add(examCard, 0, 0);
        featureGrid.add(reviewCard, 1, 0);
        featureGrid.add(bookmarkCard, 0, 1);
        featureGrid.add(historyCard, 1, 1);

        GridPane.setHgrow(examCard, Priority.ALWAYS);
        GridPane.setHgrow(reviewCard, Priority.ALWAYS);
        GridPane.setHgrow(bookmarkCard, Priority.ALWAYS);
        GridPane.setHgrow(historyCard, Priority.ALWAYS);
        GridPane.setVgrow(examCard, Priority.ALWAYS);
        GridPane.setVgrow(reviewCard, Priority.ALWAYS);
        GridPane.setVgrow(bookmarkCard, Priority.ALWAYS);
        GridPane.setVgrow(historyCard, Priority.ALWAYS);

        setTop(topBar);
        setCenter(featureGrid);
    }

    private Button createFeatureCard(String title, String description, String accentColor, Runnable action) {
        Label titleLabel = new Label(title);
        titleLabel.setStyle("-fx-font-size: 22px; -fx-font-weight: bold; -fx-text-fill: #16324f;");
        titleLabel.setWrapText(true);

        Label descriptionLabel = new Label(description);
        descriptionLabel.setStyle("-fx-font-size: 14px; -fx-text-fill: #5f7287;");
        descriptionLabel.setWrapText(true);

        VBox content = new VBox(14, titleLabel, descriptionLabel);
        content.setAlignment(Pos.TOP_LEFT);

        Button cardButton = new Button();
        cardButton.setGraphic(content);
        cardButton.setAlignment(Pos.TOP_LEFT);
        cardButton.setMaxSize(Double.MAX_VALUE, Double.MAX_VALUE);
        cardButton.setPrefSize(320, 180);
        cardButton.setMinHeight(180);
        applyCardStyle(cardButton, accentColor, false);
        cardButton.setOnAction(event -> action.run());
        cardButton.setOnMouseEntered(event -> applyCardStyle(cardButton, accentColor, true));
        cardButton.setOnMouseExited(event -> applyCardStyle(cardButton, accentColor, false));
        return cardButton;
    }

    private void applyCardStyle(Button cardButton, String accentColor, boolean hovered) {
        String background = hovered ? accentColor : "#ffffff";
        String border = hovered ? accentColor : "#d9e3f2";
        String shadow = hovered
                ? "dropshadow(gaussian, rgba(37,99,235,0.24), 22, 0.18, 0, 10)"
                : "dropshadow(gaussian, rgba(15,23,42,0.10), 16, 0.12, 0, 6)";

        cardButton.setStyle(
                "-fx-background-color: " + background + ";" +
                        "-fx-background-radius: 22;" +
                        "-fx-border-radius: 22;" +
                        "-fx-border-color: " + border + ";" +
                        "-fx-border-width: 1;" +
                        "-fx-padding: 24;" +
                        "-fx-cursor: hand;" +
                        "-fx-effect: " + shadow + ";"
        );

        VBox content = (VBox) cardButton.getGraphic();
        Label titleLabel = (Label) content.getChildren().get(0);
        Label descriptionLabel = (Label) content.getChildren().get(1);
        titleLabel.setStyle("-fx-font-size: 22px; -fx-font-weight: bold; -fx-text-fill: " + (hovered ? "#ffffff" : "#16324f") + ";");
        descriptionLabel.setStyle("-fx-font-size: 14px; -fx-text-fill: " + (hovered ? "#eaf2ff" : "#5f7287") + ";");
    }

    private void openDashboard() {
        DashboardView dashboardView = new DashboardView();
        new DashboardController(dashboardView, currentUser.getId());

        Scene homeScene = stage.getScene();
        dashboardView.getBtnBackToHome().setOnAction(event -> stage.setScene(homeScene));

        VBox dashboardRoot = new VBox(dashboardView);
        VBox.setVgrow(dashboardView, Priority.ALWAYS);

        Scene dashboardScene = new Scene(dashboardRoot, WINDOW_WIDTH, WINDOW_HEIGHT);
        stage.setScene(dashboardScene);
    }

    private void openBookmarkedQuestions() {
        try {
            Connection connection = DatabaseConnection.getInstance();
            BookmarkDAO bookmarkDAO = new BookmarkDAO(connection);
            Scene homeScene = stage.getScene();
            BookmarkedQuestionsView bookmarkedQuestionsView = new BookmarkedQuestionsView(
                    stage,
                    () -> stage.setScene(homeScene),
                    bookmarkDAO,
                    currentUser.getId()
            );
            Scene bookmarksScene = new Scene(bookmarkedQuestionsView, WINDOW_WIDTH, WINDOW_HEIGHT);
            stage.setScene(bookmarksScene);
        } catch (SQLException e) {
            showAlertMessage("Khong the mo danh sach cau da danh dau: " + e.getMessage(), Alert.AlertType.ERROR);
        }
    }

    private void showComingSoon() {
        showAlertMessage("Tinh nang dang duoc phat trien!", Alert.AlertType.INFORMATION);
    }

    private void showAlertMessage(String message, Alert.AlertType alertType) {
        Alert alert = new Alert(alertType);
        alert.initOwner(stage);
        alert.setTitle("Thong bao");
        alert.setHeaderText(null);
        alert.setContentText(message);
        alert.showAndWait();
    }
}
