package org.example.ui;

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
import javafx.scene.layout.VBox;
import javafx.stage.Stage;
import org.example.controller.ExamController;

import java.util.List;
import java.util.Map;

public class ReviewSummaryView extends BorderPane {

    private final Stage primaryStage;
    private final Scene previousScene;
    private final ExamController.ExamResult examResult;
    private final List<ExamController.ReviewQuestionSummary> reviewItems;
    private final Map<Integer, String> aiExplanationsMap;

    public ReviewSummaryView(Stage primaryStage,
                             Scene previousScene,
                             ExamController.ExamResult examResult,
                             List<ExamController.ReviewQuestionSummary> reviewItems,
                             Map<Integer, String> aiExplanationsMap) {
        this.primaryStage = primaryStage;
        this.previousScene = previousScene;
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

        Region spacer = new Region();
        HBox.setHgrow(spacer, Priority.ALWAYS);

        HBox topRow = new HBox(12, new VBox(6, titleLabel, subtitleLabel), spacer, backButton);
        topRow.setAlignment(Pos.CENTER_LEFT);

        VBox wrapper = new VBox(topRow);
        wrapper.setPadding(new Insets(0, 0, 18, 0));
        return wrapper;
    }

    private ScrollPane buildContent() {
        VBox contentBox = new VBox(16);
        contentBox.setPadding(new Insets(4));

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

        Button explainToggleButton = new Button("Xem lai giai thich AI");
        explainToggleButton.setStyle(
                "-fx-background-color: #eff6ff;" +
                        "-fx-text-fill: #1d4ed8;" +
                        "-fx-font-weight: bold;" +
                        "-fx-padding: 10 16 10 16;" +
                        "-fx-background-radius: 12;" +
                        "-fx-border-color: #bfdbfe;" +
                        "-fx-border-radius: 12;"
        );

        String explanationText = aiExplanationsMap.getOrDefault(
                item.getQuestionId(),
                "Chua co giai thich AI cho cau hoi nay."
        );

        TextArea explanationArea = new TextArea(explanationText);
        explanationArea.setWrapText(true);
        explanationArea.setEditable(false);
        explanationArea.setFocusTraversable(false);
        explanationArea.setVisible(false);
        explanationArea.setManaged(false);
        explanationArea.setPrefRowCount(6);
        explanationArea.setStyle(
                "-fx-control-inner-background: #f8fafc;" +
                        "-fx-background-insets: 0;" +
                        "-fx-background-radius: 14;" +
                        "-fx-border-color: #dbe5f0;" +
                        "-fx-border-radius: 14;" +
                        "-fx-font-size: 13px;"
        );

        explainToggleButton.setOnAction(event -> {
            boolean expanded = !explanationArea.isVisible();
            explanationArea.setVisible(expanded);
            explanationArea.setManaged(expanded);
            explainToggleButton.setText(expanded ? "Thu gon giai thich AI" : "Xem lai giai thich AI");
        });

        HBox toolbar = new HBox(12, bookmarkButton, explainToggleButton);
        toolbar.setAlignment(Pos.CENTER_LEFT);

        VBox card = new VBox(12, orderLabel, questionLabel, selectedAnswerLabel, correctAnswerLabel, toolbar, explanationArea);
        card.setPadding(new Insets(18));
        card.setStyle(
                "-fx-background-color: #ffffff;" +
                        "-fx-background-radius: 18;" +
                        "-fx-border-color: #d9e3ef;" +
                        "-fx-border-radius: 18;"
        );
        return card;
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
        // TODO: Goi BookmarkDAO.save(questionId, currentUserId) hoac service tuong ung.
        System.out.println("TODO save bookmark for questionId = " + questionId);
    }
}
