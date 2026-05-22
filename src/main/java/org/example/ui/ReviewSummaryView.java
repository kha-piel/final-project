package org.example.ui;

import javafx.application.Platform;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.ScrollPane;
import javafx.scene.control.TextArea;
import javafx.scene.control.ToggleButton;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.HBox;
import javafx.scene.layout.Priority;
import javafx.scene.layout.Region;
import javafx.scene.layout.StackPane;
import javafx.scene.layout.VBox;
import javafx.stage.Stage;
import org.example.controller.ExamController;

import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

public class ReviewSummaryView extends BorderPane {

    private final Stage primaryStage;
    private final Scene previousScene;
    private final ExamController examController;
    private final ExamController.ExamResult examResult;
    private final List<ExamController.ReviewQuestionSummary> reviewItems;
    private final Map<Integer, String> aiExplanationsMap;

    private final VBox contentBox = new VBox(16);
    private final VBox aiInsightHost = new VBox();
    private final Button analyzeButton = new Button("AI Phan tich tong quan diem yeu");

    private boolean analyzingWeaknesses;

    public ReviewSummaryView(Stage primaryStage,
                             Scene previousScene,
                             ExamController examController,
                             ExamController.ExamResult examResult,
                             List<ExamController.ReviewQuestionSummary> reviewItems,
                             Map<Integer, String> aiExplanationsMap) {
        this.primaryStage = primaryStage;
        this.previousScene = previousScene;
        this.examController = examController;
        this.examResult = examResult;
        this.reviewItems = reviewItems;
        this.aiExplanationsMap = aiExplanationsMap;
        buildUi();
    }

    private void buildUi() {
        setPadding(new Insets(20));
        setStyle("-fx-background-color: linear-gradient(to bottom, #f8fbff, #eef4fb);");

        setTop(buildHeader());
        setCenter(buildContent());
    }

    private VBox buildHeader() {
        Label titleLabel = new Label("Tong ket On tap");
        titleLabel.setStyle("-fx-font-size: 30px; -fx-font-weight: bold; -fx-text-fill: #12344d;");

        Label subtitleLabel = new Label(
                examResult.getExamTitle()
                        + " | Diem: " + examResult.getScore() + "/10"
                        + " | Dung: " + examResult.getCorrectCount()
                        + " | Sai: " + examResult.getWrongCount()
                        + " | Bo qua: " + examResult.getSkippedCount()
        );
        subtitleLabel.setStyle("-fx-font-size: 14px; -fx-text-fill: #52667a;");
        subtitleLabel.setWrapText(true);

        Button backButton = new Button("Quay lai khu On tap");
        backButton.setStyle(
                "-fx-background-color: #ffffff;" +
                        "-fx-text-fill: #1d4ed8;" +
                        "-fx-font-weight: bold;" +
                        "-fx-padding: 10 18 10 18;" +
                        "-fx-background-radius: 12;" +
                        "-fx-border-color: #bfdbfe;" +
                        "-fx-border-radius: 12;"
        );
        backButton.setOnAction(event -> primaryStage.setScene(previousScene));

        analyzeButton.setMaxWidth(Double.MAX_VALUE);
        analyzeButton.setStyle(
                "-fx-background-color: linear-gradient(to right, #0f766e, #2563eb);" +
                        "-fx-text-fill: white;" +
                        "-fx-font-size: 16px;" +
                        "-fx-font-weight: bold;" +
                        "-fx-padding: 16 22 16 22;" +
                        "-fx-background-radius: 18;"
        );
        analyzeButton.setOnAction(event -> handleAnalyzeWeaknesses());

        Region spacer = new Region();
        HBox.setHgrow(spacer, Priority.ALWAYS);

        HBox topRow = new HBox(12, new VBox(6, titleLabel, subtitleLabel), spacer, backButton);
        topRow.setAlignment(Pos.CENTER_LEFT);

        VBox wrapper = new VBox(14, topRow, analyzeButton);
        wrapper.setPadding(new Insets(0, 0, 18, 0));
        return wrapper;
    }

    private ScrollPane buildContent() {
        contentBox.setPadding(new Insets(4));
        contentBox.getChildren().add(aiInsightHost);

        for (int i = 0; i < reviewItems.size(); i++) {
            contentBox.getChildren().add(buildQuestionCard(i + 1, reviewItems.get(i)));
        }

        ScrollPane scrollPane = new ScrollPane(contentBox);
        scrollPane.setFitToWidth(true);
        scrollPane.setHbarPolicy(ScrollPane.ScrollBarPolicy.NEVER);
        scrollPane.setStyle("-fx-background-color: transparent; -fx-background: transparent;");
        return scrollPane;
    }

    private VBox buildQuestionCard(int index, ExamController.ReviewQuestionSummary item) {
        Label orderLabel = new Label("Cau " + index);
        orderLabel.setStyle("-fx-font-size: 13px; -fx-font-weight: bold; -fx-text-fill: #2563eb;");

        Label topicLabel = new Label("Chuyen de: " + item.getTopicLabel());
        topicLabel.setWrapText(true);
        topicLabel.setStyle("-fx-font-size: 12px; -fx-font-weight: bold; -fx-text-fill: #0f766e;");

        Label questionLabel = new Label(item.getQuestionContent());
        questionLabel.setWrapText(true);
        questionLabel.setStyle("-fx-font-size: 18px; -fx-font-weight: bold; -fx-text-fill: #1f2937;");

        Label selectedAnswerLabel = new Label("Ban chon: " + item.getSelectedAnswerText());
        selectedAnswerLabel.setWrapText(true);
        selectedAnswerLabel.setStyle(
                "-fx-font-size: 14px; -fx-font-weight: bold; -fx-text-fill: "
                        + (item.isCorrect() ? "#15803d" : "#b91c1c") + ";"
        );

        Label correctAnswerLabel = new Label("Dap an chuan: " + item.getCorrectAnswerText());
        correctAnswerLabel.setWrapText(true);
        correctAnswerLabel.setStyle("-fx-font-size: 14px; -fx-text-fill: #0f766e;");

        ToggleButton bookmarkButton = new ToggleButton("Danh dau cau hoi");
        bookmarkButton.setStyle(defaultBookmarkStyle());
        bookmarkButton.setOnAction(event -> {
            if (bookmarkButton.isSelected()) {
                bookmarkButton.setText("Da danh dau");
                bookmarkButton.setStyle(activeBookmarkStyle());
                saveBookmark(item.getQuestionId());
            } else {
                bookmarkButton.setText("Danh dau cau hoi");
                bookmarkButton.setStyle(defaultBookmarkStyle());
            }
        });

        String explanationText = aiExplanationsMap.get(item.getQuestionId());
        boolean hasCachedExplanation = explanationText != null && !explanationText.isBlank();

        TextArea explanationArea = new TextArea(
                hasCachedExplanation
                        ? explanationText
                        : "Chua co giai thich AI cho cau hoi nay."
        );
        explanationArea.setWrapText(true);
        explanationArea.setEditable(false);
        explanationArea.setFocusTraversable(false);
        explanationArea.setVisible(hasCachedExplanation);
        explanationArea.setManaged(hasCachedExplanation);
        explanationArea.setPrefRowCount(6);
        explanationArea.setStyle(
                "-fx-control-inner-background: #f8fafc;" +
                        "-fx-background-insets: 0;" +
                        "-fx-background-radius: 14;" +
                        "-fx-border-color: #dbe5f0;" +
                        "-fx-border-radius: 14;" +
                        "-fx-font-size: 13px;"
        );

        HBox toolbar = new HBox(12, bookmarkButton);
        toolbar.setAlignment(Pos.CENTER_LEFT);

        VBox card = new VBox(10, orderLabel, topicLabel, questionLabel, selectedAnswerLabel, correctAnswerLabel, toolbar, explanationArea);
        card.setPadding(new Insets(18));
        card.setStyle(
                "-fx-background-color: #ffffff;" +
                        "-fx-background-radius: 18;" +
                        "-fx-border-color: #d9e3ef;" +
                        "-fx-border-radius: 18;"
        );
        return card;
    }

    private void handleAnalyzeWeaknesses() {
        if (analyzingWeaknesses) {
            return;
        }

        analyzingWeaknesses = true;
        analyzeButton.setDisable(true);
        analyzeButton.setText("AI dang doc bai va phan tich...");
        aiInsightHost.getChildren().setAll(buildLoadingInsightCard());

        CompletableFuture<String> future = examController.analyzeOverallWeaknesses();
        future.whenComplete((result, throwable) -> Platform.runLater(() -> {
            analyzingWeaknesses = false;
            analyzeButton.setDisable(false);
            analyzeButton.setText("Phan tich lai tong quan diem yeu");

            if (throwable != null) {
                aiInsightHost.getChildren().setAll(buildInsightCard(
                        "Khong the lay phan tich AI luc nay. Vui long thu lai sau.",
                        true
                ));
                return;
            }

            aiInsightHost.getChildren().setAll(buildInsightCard(result, false));
        }));
    }

    private StackPane buildInsightCard(String insightText, boolean isError) {
        Label badge = new Label("AI");
        badge.setStyle(
                "-fx-text-fill: white;" +
                        "-fx-font-size: 13px;" +
                        "-fx-font-weight: bold;"
        );

        StackPane badgeWrap = new StackPane(badge);
        badgeWrap.setPrefSize(42, 42);
        badgeWrap.setStyle(
                "-fx-background-color: linear-gradient(to bottom right, #f59e0b, #f97316);" +
                        "-fx-background-radius: 21;"
        );

        Label title = new Label(isError ? "AI tam thoi chua phan tich duoc" : "AI phan tich tong quan diem yeu");
        title.setStyle("-fx-font-size: 18px; -fx-font-weight: bold; -fx-text-fill: #0f172a;");

        Label subtitle = new Label(
                isError
                        ? "Hay kiem tra backend Gemini va thu lai."
                        : "Tom tat nhanh cac lo hong kien thuc de uu tien on tap."
        );
        subtitle.setStyle("-fx-font-size: 13px; -fx-text-fill: #64748b;");
        subtitle.setWrapText(true);

        Label content = new Label(insightText);
        content.setWrapText(true);
        content.setStyle(
                "-fx-font-size: 14px;" +
                        "-fx-line-spacing: 3px;" +
                        "-fx-text-fill: " + (isError ? "#b91c1c" : "#1f2937") + ";"
        );

        VBox textBox = new VBox(4, title, subtitle, content);
        HBox body = new HBox(14, badgeWrap, textBox);
        body.setAlignment(Pos.TOP_LEFT);

        VBox innerCard = new VBox(body);
        innerCard.setPadding(new Insets(18));
        innerCard.setStyle(
                "-fx-background-color: rgba(255,255,255,0.97);" +
                        "-fx-background-radius: 19;"
        );

        StackPane outerCard = new StackPane(innerCard);
        outerCard.setPadding(new Insets(1.4));
        outerCard.setStyle(
                "-fx-background-color: linear-gradient(to right, #38bdf8, #2563eb, #f59e0b);" +
                        "-fx-background-radius: 20;"
        );

        StackPane.setMargin(innerCard, new Insets(0));
        return outerCard;
    }

    private StackPane buildLoadingInsightCard() {
        VBox lines = new VBox(
                10,
                skeletonBar(220, 16),
                skeletonBar(620, 12),
                skeletonBar(580, 12),
                skeletonBar(460, 12)
        );

        Label title = new Label("AI dang phan tich tong quan bai lam");
        title.setStyle("-fx-font-size: 18px; -fx-font-weight: bold; -fx-text-fill: #0f172a;");

        Label hint = new Label("Gemini dang doc danh sach cau sai va tim chuyen de hoc sinh hổng nhieu nhat.");
        hint.setWrapText(true);
        hint.setStyle("-fx-font-size: 13px; -fx-text-fill: #64748b;");

        Label badge = new Label("AI");
        badge.setStyle("-fx-text-fill: white; -fx-font-size: 13px; -fx-font-weight: bold;");

        StackPane badgeWrap = new StackPane(badge);
        badgeWrap.setPrefSize(42, 42);
        badgeWrap.setStyle(
                "-fx-background-color: linear-gradient(to bottom right, #0f766e, #2563eb);" +
                        "-fx-background-radius: 21;"
        );

        VBox textBox = new VBox(4, title, hint, lines);
        HBox body = new HBox(14, badgeWrap, textBox);
        body.setAlignment(Pos.TOP_LEFT);

        VBox innerCard = new VBox(body);
        innerCard.setPadding(new Insets(18));
        innerCard.setStyle(
                "-fx-background-color: rgba(255,255,255,0.97);" +
                        "-fx-background-radius: 19;"
        );

        StackPane outerCard = new StackPane(innerCard);
        outerCard.setPadding(new Insets(1.4));
        outerCard.setStyle(
                "-fx-background-color: linear-gradient(to right, #14b8a6, #2563eb);" +
                        "-fx-background-radius: 20;"
        );
        return outerCard;
    }

    private Region skeletonBar(double width, double height) {
        Region bar = new Region();
        bar.setPrefSize(width, height);
        bar.setMaxWidth(width);
        bar.setStyle(
                "-fx-background-color: linear-gradient(to right, #e2e8f0, #f8fafc, #e2e8f0);" +
                        "-fx-background-radius: 999;"
        );
        return bar;
    }

    private String defaultBookmarkStyle() {
        return "-fx-background-color: #ffffff;" +
                "-fx-text-fill: #9a3412;" +
                "-fx-font-weight: bold;" +
                "-fx-padding: 10 16 10 16;" +
                "-fx-background-radius: 12;" +
                "-fx-border-color: #fdba74;" +
                "-fx-border-radius: 12;";
    }

    private String activeBookmarkStyle() {
        return "-fx-background-color: #f59e0b;" +
                "-fx-text-fill: white;" +
                "-fx-font-weight: bold;" +
                "-fx-padding: 10 16 10 16;" +
                "-fx-background-radius: 12;" +
                "-fx-border-color: #f59e0b;" +
                "-fx-border-radius: 12;";
    }

    private void saveBookmark(int questionId) {
        System.out.println("TODO save bookmark for questionId = " + questionId);
    }
}
