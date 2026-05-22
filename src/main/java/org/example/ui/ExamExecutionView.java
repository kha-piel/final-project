package org.example.ui;

import javafx.animation.KeyFrame;
import javafx.animation.Timeline;
import javafx.application.Platform;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Scene;
import javafx.scene.control.Alert;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.ProgressIndicator;
import javafx.scene.control.RadioButton;
import javafx.scene.control.ScrollPane;
import javafx.scene.control.SplitPane;
import javafx.scene.control.TextField;
import javafx.scene.control.ToggleGroup;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.HBox;
import javafx.scene.layout.Priority;
import javafx.scene.layout.Region;
import javafx.scene.layout.VBox;
import javafx.stage.Stage;
import javafx.util.Duration;
import org.example.controller.ExamController;
import org.example.model.Answer;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;

public class ExamExecutionView extends BorderPane {
    private static final String ASK_AI_DEFAULT_TEXT = "Hoi AI giai thich";
    private static final String ASK_AI_LOADING_TEXT = "AI dang suy nghi...";

    private final ExamController examController;
    private final Stage primaryStage;
    private final Scene previousScene;
    private final int currentUserId;

    private final Label progressLabel = new Label();
    private final Label timerLabel = new Label();
    private final Label questionLabel = new Label();
    private final Label answerFeedbackLabel = new Label();
    private final ToggleGroup toggleGroup = new ToggleGroup();
    private final List<RadioButton> answerButtons = new ArrayList<>();

    private final Button checkAnswerButton = new Button("Kiem tra dap an");
    private final Button prevButton = new Button("Cau truoc");
    private final Button nextButton = new Button("Cau tiep theo");
    private final Button submitButton = new Button("Nop bai");

    private final VBox chatHistoryBox = new VBox(12);
    private final ScrollPane chatScrollPane = new ScrollPane();
    private final TextField chatInputField = new TextField();
    private final Button sendButton = new Button(ASK_AI_DEFAULT_TEXT);
    private final Label chatStatusLabel = new Label();
    private final ProgressIndicator aiLoadingIndicator = new ProgressIndicator();

    private Timeline timeline;
    private int currentIndex;
    private boolean isGeneratingAI = false;

    public ExamExecutionView(ExamController examController, Stage primaryStage, Scene previousScene, int currentUserId) {
        this.examController = examController;
        this.primaryStage = primaryStage;
        this.previousScene = previousScene;
        this.currentUserId = currentUserId;
        this.currentIndex = 0;

        buildUi();
        startTimer();
        renderQuestion();
        refreshChatHistory();
    }

    private void buildUi() {
        setPadding(new Insets(18));
        setStyle("-fx-background-color: #f4f7fb;");

        HBox topBar = new HBox(16, progressLabel, createSpacer(), timerLabel);
        topBar.setAlignment(Pos.CENTER_LEFT);
        topBar.setPadding(new Insets(0, 0, 18, 0));
        progressLabel.setStyle("-fx-font-size: 16px; -fx-font-weight: bold; -fx-text-fill: #12344d;");
        timerLabel.setStyle("-fx-font-size: 16px; -fx-font-weight: bold; -fx-text-fill: #c62828;");
        setTop(topBar);

        SplitPane splitPane = new SplitPane();
        splitPane.getItems().addAll(buildQuestionPane(), buildChatPane());
        splitPane.setDividerPositions(0.60);
        setCenter(splitPane);
    }

    private VBox buildQuestionPane() {
        Label panelTitle = new Label("Lam bai va kiem tra ngay");
        panelTitle.setStyle("-fx-font-size: 22px; -fx-font-weight: bold; -fx-text-fill: #12344d;");

        questionLabel.setWrapText(true);
        questionLabel.setStyle("-fx-font-size: 20px; -fx-font-weight: bold; -fx-text-fill: #1f2937;");

        VBox answersBox = new VBox(12);
        for (int i = 0; i < 4; i++) {
            RadioButton radioButton = new RadioButton();
            radioButton.setWrapText(true);
            radioButton.setMaxWidth(Double.MAX_VALUE);
            radioButton.setToggleGroup(toggleGroup);
            radioButton.setStyle(
                    "-fx-font-size: 15px;" +
                            "-fx-padding: 12 14 12 14;" +
                            "-fx-background-color: #ffffff;" +
                            "-fx-background-radius: 14;" +
                            "-fx-border-color: #d8e2ef;" +
                            "-fx-border-radius: 14;"
            );
            answerButtons.add(radioButton);
            answersBox.getChildren().add(radioButton);
        }

        answerFeedbackLabel.setWrapText(true);
        answerFeedbackLabel.setStyle("-fx-font-size: 14px; -fx-font-weight: bold;");

        checkAnswerButton.setStyle(
                "-fx-background-color: #2563eb;" +
                        "-fx-text-fill: white;" +
                        "-fx-font-weight: bold;" +
                        "-fx-padding: 12 18 12 18;" +
                        "-fx-background-radius: 12;"
        );
        checkAnswerButton.setOnAction(event -> handleCheckAnswer());

        prevButton.setOnAction(event -> {
            saveSelection();
            if (currentIndex > 0) {
                currentIndex--;
                renderQuestion();
            }
        });

        nextButton.setOnAction(event -> {
            saveSelection();
            if (currentIndex < examController.getExamQuestions().size() - 1) {
                currentIndex++;
                renderQuestion();
            }
        });

        submitButton.setStyle(
                "-fx-background-color: #2e7d32;" +
                        "-fx-text-fill: white;" +
                        "-fx-font-weight: bold;" +
                        "-fx-padding: 12 18 12 18;" +
                        "-fx-background-radius: 12;"
        );
        submitButton.setOnAction(event -> submitExam());

        HBox navButtons = new HBox(12, prevButton, nextButton, submitButton);
        navButtons.setAlignment(Pos.CENTER_LEFT);

        VBox leftPane = new VBox(18, panelTitle, questionLabel, answersBox, answerFeedbackLabel, checkAnswerButton, navButtons);
        leftPane.setPadding(new Insets(24));
        leftPane.setStyle(
                "-fx-background-color: #ffffff;" +
                        "-fx-background-radius: 20;" +
                        "-fx-border-color: #dbe5f0;" +
                        "-fx-border-radius: 20;"
        );
        VBox.setVgrow(answersBox, Priority.NEVER);
        return leftPane;
    }

    private VBox buildChatPane() {
        Label chatTitle = new Label("Chat AI gia su");
        chatTitle.setStyle("-fx-font-size: 22px; -fx-font-weight: bold; -fx-text-fill: #12344d;");

        Label chatSubtitle = new Label("Lich su chat duoc giu nguyen khi chuyen cau hoi.");
        chatSubtitle.setStyle("-fx-font-size: 13px; -fx-text-fill: #64748b;");

        chatHistoryBox.setPadding(new Insets(4));

        chatScrollPane.setContent(chatHistoryBox);
        chatScrollPane.setFitToWidth(true);
        chatScrollPane.setHbarPolicy(ScrollPane.ScrollBarPolicy.NEVER);
        chatScrollPane.setStyle("-fx-background-color: transparent; -fx-background: transparent;");
        VBox.setVgrow(chatScrollPane, Priority.ALWAYS);

        chatInputField.setPromptText("Hoi AI ve cau dang lam...");
        chatInputField.setPrefHeight(42);
        HBox.setHgrow(chatInputField, Priority.ALWAYS);
        chatInputField.setOnAction(event -> handleSendChat());

        sendButton.setStyle(
                "-fx-background-color: #0f766e;" +
                        "-fx-text-fill: white;" +
                        "-fx-font-weight: bold;" +
                        "-fx-padding: 10 18 10 18;" +
                        "-fx-background-radius: 12;"
        );
        sendButton.setOnAction(event -> handleSendChat());
        aiLoadingIndicator.setPrefSize(14, 14);
        aiLoadingIndicator.setMaxSize(14, 14);
        aiLoadingIndicator.setVisible(false);

        chatStatusLabel.setWrapText(true);
        chatStatusLabel.setStyle("-fx-font-size: 12px; -fx-text-fill: #64748b;");

        HBox inputRow = new HBox(10, chatInputField, sendButton);
        inputRow.setAlignment(Pos.CENTER_LEFT);

        VBox rightPane = new VBox(14, chatTitle, chatSubtitle, chatScrollPane, inputRow, chatStatusLabel);
        rightPane.setPadding(new Insets(24));
        rightPane.setStyle(
                "-fx-background-color: #ffffff;" +
                        "-fx-background-radius: 20;" +
                        "-fx-border-color: #dbe5f0;" +
                        "-fx-border-radius: 20;"
        );
        return rightPane;
    }

    private Region createSpacer() {
        Region spacer = new Region();
        HBox.setHgrow(spacer, Priority.ALWAYS);
        return spacer;
    }

    private void startTimer() {
        timeline = new Timeline(new KeyFrame(Duration.seconds(1), event -> {
            updateTimerLabel();
            if (examController.isTimeUp()) {
                timeline.stop();
                submitExam();
            }
        }));
        timeline.setCycleCount(Timeline.INDEFINITE);
        timeline.play();
        updateTimerLabel();
    }

    private void updateTimerLabel() {
        long remainingSeconds = examController.getRemainingTimeSeconds();
        long minutes = remainingSeconds / 60;
        long seconds = remainingSeconds % 60;
        timerLabel.setText(String.format("Thoi gian con lai: %02d:%02d", minutes, seconds));
    }

    private void renderQuestion() {
        var questions = examController.getExamQuestions();
        if (questions.isEmpty()) {
            return;
        }

        ExamController.QuestionSnapshot snapshot = questions.get(currentIndex);
        boolean questionLocked = examController.isQuestionLocked(snapshot.getQuestionId());
        progressLabel.setText("Cau " + (currentIndex + 1) + "/" + questions.size());
        questionLabel.setText(snapshot.getQuestionContent());
        answerFeedbackLabel.setText("");

        int selectedAnswerId = examController.getSelectedAnswerId(snapshot.getQuestionId());
        toggleGroup.selectToggle(null);

        for (int i = 0; i < answerButtons.size(); i++) {
            RadioButton button = answerButtons.get(i);
            if (i < snapshot.getShuffledAnswers().size()) {
                Answer answer = snapshot.getShuffledAnswers().get(i);
                button.setText(answer.getOptionLabel() + ". " + answer.getContent());
                button.setUserData(answer);
                button.setVisible(true);
                button.setManaged(true);
                button.setSelected(selectedAnswerId == answer.getAnswerId());
                button.setDisable(questionLocked);
            } else {
                button.setText("");
                button.setUserData(null);
                button.setVisible(false);
                button.setManaged(false);
                button.setSelected(false);
                button.setDisable(true);
            }
        }

        checkAnswerButton.setDisable(questionLocked || isGeneratingAI);
        prevButton.setDisable(isGeneratingAI || currentIndex == 0);
        nextButton.setDisable(isGeneratingAI || currentIndex == questions.size() - 1);
        submitButton.setDisable(isGeneratingAI);
        sendButton.setDisable(isGeneratingAI);
        chatInputField.setDisable(isGeneratingAI);

        if (questionLocked) {
            answerFeedbackLabel.setStyle("-fx-font-size: 14px; -fx-font-weight: bold; -fx-text-fill: #475569;");
            answerFeedbackLabel.setText("Cau hoi nay da khoa dap an sau khi kiem tra.");
        }
    }

    private void saveSelection() {
        if (toggleGroup.getSelectedToggle() == null) {
            return;
        }

        ExamController.QuestionSnapshot snapshot = examController.getExamQuestions().get(currentIndex);
        Answer selectedAnswer = (Answer) toggleGroup.getSelectedToggle().getUserData();
        if (selectedAnswer != null) {
            examController.selectAnswer(snapshot.getQuestionId(), selectedAnswer.getAnswerId());
        }
    }

    private void handleCheckAnswer() {
        saveSelection();
        ExamController.AnswerCheckResult result = examController.checkAnswer(currentIndex);

        if (!result.hasSelection()) {
            answerFeedbackLabel.setStyle("-fx-font-size: 14px; -fx-font-weight: bold; -fx-text-fill: #b45309;");
            answerFeedbackLabel.setText("Ban can chon mot dap an truoc khi kiem tra.");
            return;
        }

        if (result.isCorrect()) {
            answerFeedbackLabel.setStyle("-fx-font-size: 14px; -fx-font-weight: bold; -fx-text-fill: #15803d;");
            answerFeedbackLabel.setText("Chinh xac! Ban da chon dung dap an.");
            lockCurrentQuestionUi();
            showInfoAlert("Kiem tra dap an", "Chinh xac!", "Ban da tra loi dung cau nay.");
            return;
        }

        answerFeedbackLabel.setStyle("-fx-font-size: 14px; -fx-font-weight: bold; -fx-text-fill: #b91c1c;");
        answerFeedbackLabel.setText("Chua dung. AI dang duoc moi vao giai thich ben khung chat.");
        lockCurrentQuestionUi();
        refreshChatHistory();
        setAiStatus("AI dang phan tich cau hoi...", false);
        setGeneratingAi(true);

        CompletableFuture<ExamController.ChatMessage> future = examController.requestAutoExplanationForWrongAnswer(currentIndex);
        observeAiResponse(future, "AI da gui giai thich cho cau hoi nay.");
        showInfoAlert("Kiem tra dap an", "Ban da chon sai.", "Thong diep he thong da duoc day sang khung chat de AI giai thich.");
    }

    private void lockCurrentQuestionUi() {
        for (RadioButton button : answerButtons) {
            if (button.isManaged()) {
                button.setDisable(true);
            }
        }
        checkAnswerButton.setDisable(true);
    }

    private void handleSendChat() {
        String message = chatInputField.getText() != null ? chatInputField.getText().trim() : "";
        if (message.isEmpty()) {
            return;
        }

        chatInputField.clear();
        setAiStatus("Dang gui cau hoi cho AI...", false);
        setGeneratingAi(true);

        CompletableFuture<ExamController.ChatMessage> future = examController.sendChatMessage(currentIndex, message);
        refreshChatHistory();
        observeAiResponse(future, "AI da tra loi.");
    }

    private void observeAiResponse(CompletableFuture<ExamController.ChatMessage> future, String successStatus) {
        future.whenComplete((message, throwable) -> Platform.runLater(() -> {
            setGeneratingAi(false);
            refreshChatHistory();

            if (throwable != null) {
                setAiStatus("Khong the nhan phan hoi tu AI. Vui long thu lai.", true);
                return;
            }

            setAiStatus(successStatus, false);
        }));
    }

    private void setGeneratingAi(boolean generating) {
        isGeneratingAI = generating;

        sendButton.setDisable(generating);
        chatInputField.setDisable(generating);
        prevButton.setDisable(generating || currentIndex == 0);
        nextButton.setDisable(generating || currentIndex == examController.getExamQuestions().size() - 1);
        submitButton.setDisable(generating);
        checkAnswerButton.setDisable(generating || examController.isQuestionLocked(
                examController.getExamQuestions().get(currentIndex).getQuestionId()
        ));

        sendButton.setText(generating ? ASK_AI_LOADING_TEXT : ASK_AI_DEFAULT_TEXT);
        aiLoadingIndicator.setVisible(generating);
        sendButton.setGraphic(generating ? aiLoadingIndicator : null);
    }

    private void setAiStatus(String message, boolean isError) {
        chatStatusLabel.setText(message);
        chatStatusLabel.setStyle(
                "-fx-font-size: 12px; -fx-font-weight: bold; -fx-text-fill: "
                        + (isError ? "#b91c1c" : "#64748b")
                        + ";"
        );
    }

    private void refreshChatHistory() {
        chatHistoryBox.getChildren().clear();

        for (ExamController.ChatMessage message : examController.getChatHistory()) {
            Label roleLabel = new Label(resolveRoleLabel(message.getRole()));
            roleLabel.setStyle("-fx-font-size: 11px; -fx-font-weight: bold; -fx-text-fill: #64748b;");

            Label contentLabel = new Label(message.getContent());
            contentLabel.setWrapText(true);
            contentLabel.setMaxWidth(280);
            contentLabel.setStyle("-fx-font-size: 14px; -fx-text-fill: " + resolveMessageTextColor(message.getRole()) + ";");

            VBox bubble = new VBox(6, roleLabel, contentLabel);
            bubble.setMaxWidth(310);
            bubble.setPadding(new Insets(12));
            bubble.setStyle(
                    "-fx-background-color: " + resolveMessageBackground(message.getRole()) + ";" +
                            "-fx-background-radius: 16;" +
                            "-fx-border-color: " + resolveMessageBorder(message.getRole()) + ";" +
                            "-fx-border-radius: 16;"
            );

            HBox row = new HBox(bubble);
            row.setAlignment(resolveMessageAlignment(message.getRole()));
            chatHistoryBox.getChildren().add(row);
        }

        Platform.runLater(() -> chatScrollPane.setVvalue(1.0));
    }

    private String resolveRoleLabel(ExamController.ChatRole role) {
        return switch (role) {
            case USER -> "Hoc sinh";
            case AI -> "AI gia su";
            case SYSTEM -> "He thong";
        };
    }

    private Pos resolveMessageAlignment(ExamController.ChatRole role) {
        return switch (role) {
            case USER -> Pos.CENTER_RIGHT;
            case AI, SYSTEM -> Pos.CENTER_LEFT;
        };
    }

    private String resolveMessageBackground(ExamController.ChatRole role) {
        return switch (role) {
            case USER -> "#dbeafe";
            case AI -> "#ecfdf5";
            case SYSTEM -> "#fff7ed";
        };
    }

    private String resolveMessageBorder(ExamController.ChatRole role) {
        return switch (role) {
            case USER -> "#93c5fd";
            case AI -> "#86efac";
            case SYSTEM -> "#fdba74";
        };
    }

    private String resolveMessageTextColor(ExamController.ChatRole role) {
        return switch (role) {
            case USER -> "#1d4ed8";
            case AI -> "#166534";
            case SYSTEM -> "#c2410c";
        };
    }

    private void submitExam() {
        saveSelection();
        if (timeline != null) {
            timeline.stop();
        }

        ExamController.ExamResult result = examController.submitExam();
        ReviewSummaryView reviewSummaryView = new ReviewSummaryView(
                primaryStage,
                previousScene,
                examController,
                currentUserId,
                result,
                examController.buildReviewSummary(),
                examController.getAiExplanationsMap()
        );
        Scene reviewScene = new Scene(reviewSummaryView, 1100, 760);
        primaryStage.setScene(reviewScene);
    }

    private void showInfoAlert(String title, String header, String content) {
        Alert alert = new Alert(Alert.AlertType.INFORMATION);
        alert.setTitle(title);
        alert.setHeaderText(header);
        alert.setContentText(content);
        alert.showAndWait();
    }

    private void showErrorAlert(String title, String content) {
        Alert alert = new Alert(Alert.AlertType.ERROR);
        alert.setTitle(title);
        alert.setHeaderText(null);
        alert.setContentText(content);
        alert.showAndWait();
    }
}
