package org.example.ui;

import javafx.application.Platform;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Scene;
import javafx.scene.control.Alert;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.ScrollPane;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.VBox;
import javafx.scene.paint.Color;
import javafx.scene.text.Font;
import javafx.scene.text.FontWeight;
import javafx.stage.Stage;
import org.example.controller.QuizController;
import org.example.dao.AnswerDAO;
import org.example.model.Answer;
import org.example.model.Question;
import org.example.service.AiServiceClient;
import org.example.util.DatabaseConnection;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

/**
 * ResultView - Man hinh hien thi ket qua bai thi va cho phep hoi AI giai thich.
 */
public class ResultView extends BorderPane {

    private final QuizController quizController;
    private final Stage primaryStage;
    private final AnswerDAO answerDAO;
    private final AiServiceClient aiServiceClient;

    private final int correctCount;
    private final int totalQuestions;

    public ResultView(QuizController quizController, Stage primaryStage) {
        this.quizController = quizController;
        this.primaryStage = primaryStage;
        this.correctCount = quizController.submitExam();
        this.totalQuestions = quizController.getExamQuestions().size();

        try {
            Connection connection = DatabaseConnection.getInstance();
            this.answerDAO = new AnswerDAO(connection);
        } catch (SQLException e) {
            throw new RuntimeException("Khong the khoi tao AnswerDAO: " + e.getMessage(), e);
        }

        this.aiServiceClient = new AiServiceClient();

        setupLayout();
    }

    private void setupLayout() {
        setPadding(new Insets(20));

        setTop(buildTopSection());
        setCenter(buildCenterSection());
        setBottom(buildBottomSection());
    }

    private VBox buildTopSection() {
        Label titleLabel = new Label("KET QUA BAI THI");
        titleLabel.setFont(Font.font("System", FontWeight.BOLD, 28));

        Label scoreLabel = new Label("Diem so: " + correctCount + " / " + totalQuestions + " cau");
        scoreLabel.setFont(Font.font("System", FontWeight.BOLD, 18));

        VBox topBox = new VBox(10, titleLabel, scoreLabel);
        topBox.setAlignment(Pos.CENTER);
        topBox.setPadding(new Insets(0, 0, 20, 0));
        return topBox;
    }

    private ScrollPane buildCenterSection() {
        VBox contentBox = new VBox(16);
        contentBox.setPadding(new Insets(10));

        List<Question> questions = quizController.getExamQuestions();
        Map<Integer, Answer> userAnswers = quizController.getUserAnswers();

        boolean hasMistakes = false;

        for (Question question : questions) {
            Answer userAnswer = userAnswers.get(question.getQuestionId());
            Answer correctAnswer = answerDAO.findCorrectAnswer(question.getQuestionId());

            boolean isCorrect = userAnswer != null
                    && correctAnswer != null
                    && userAnswer.getAnswerId() == correctAnswer.getAnswerId();

            if (!isCorrect) {
                hasMistakes = true;
                contentBox.getChildren().add(buildWrongAnswerCard(question, userAnswer, correctAnswer));
            }
        }

        if (!hasMistakes) {
            Label perfectLabel = new Label("Tuyet voi! Ban da lam dung toan bo cau hoi.");
            perfectLabel.setFont(Font.font("System", FontWeight.BOLD, 18));
            contentBox.getChildren().add(perfectLabel);
        }

        ScrollPane scrollPane = new ScrollPane(contentBox);
        scrollPane.setFitToWidth(true);
        scrollPane.setPadding(new Insets(10, 0, 10, 0));
        return scrollPane;
    }

    private VBox buildWrongAnswerCard(Question question, Answer userAnswer, Answer correctAnswer) {
        Label questionLabel = new Label("Cau hoi: " + question.getQuestionText());
        questionLabel.setWrapText(true);
        questionLabel.setFont(Font.font("System", FontWeight.BOLD, 16));

        String userAnswerText = userAnswer != null
                ? formatAnswer(userAnswer)
                : "Chua lam";
        Label userAnswerLabel = new Label("Ban chon: " + userAnswerText);
        userAnswerLabel.setTextFill(Color.RED);
        userAnswerLabel.setWrapText(true);

        String correctAnswerText = correctAnswer != null
                ? formatAnswer(correctAnswer)
                : "Khong xac dinh duoc dap an dung";
        Label correctAnswerLabel = new Label("Dap an dung: " + correctAnswerText);
        correctAnswerLabel.setTextFill(Color.FORESTGREEN);
        correctAnswerLabel.setWrapText(true);

        Button askAiButton = new Button("🤖 Hoi AI giai thich");
        askAiButton.setOnAction(e -> handleAskAi(askAiButton, question, userAnswer, correctAnswer));

        VBox card = new VBox(10, questionLabel, userAnswerLabel, correctAnswerLabel, askAiButton);
        card.setPadding(new Insets(16));
        card.setStyle("-fx-background-color: #f8f8f8; -fx-border-color: #d0d0d0; -fx-border-radius: 8; -fx-background-radius: 8;");
        return card;
    }

    private VBox buildBottomSection() {
        Button backHomeButton = new Button("Quay lai Trang chu");
        backHomeButton.setOnAction(e -> goBackHome());

        VBox bottomBox = new VBox(backHomeButton);
        bottomBox.setAlignment(Pos.CENTER);
        bottomBox.setPadding(new Insets(20, 0, 0, 0));
        return bottomBox;
    }

    private void handleAskAi(Button askAiButton, Question question, Answer userAnswer, Answer correctAnswer) {
        askAiButton.setDisable(true);
        askAiButton.setText("Dang suy nghi...");

        String questionText = question.getQuestionText();
        String wrongAnswerText = userAnswer != null ? formatAnswer(userAnswer) : "Chua tra loi";
        String correctAnswerText = correctAnswer != null ? formatAnswer(correctAnswer) : "Khong xac dinh";
        String obsidianSourcePath = question.getObsidianSourcePath() != null ? question.getObsidianSourcePath() : "";

        CompletableFuture.supplyAsync(() ->
                aiServiceClient.getExplanation(
                        questionText,
                        wrongAnswerText,
                        correctAnswerText,
                        obsidianSourcePath
                )
        ).whenComplete((explanation, throwable) -> Platform.runLater(() -> {
            askAiButton.setDisable(false);
            askAiButton.setText("🤖 Hoi AI giai thich");

            if (throwable != null) {
                Alert errorAlert = new Alert(Alert.AlertType.ERROR);
                errorAlert.setTitle("Loi AI");
                errorAlert.setHeaderText("Khong the lay giai thich tu AI");
                errorAlert.setContentText(throwable.getMessage());
                errorAlert.showAndWait();
                return;
            }

            Alert explanationAlert = new Alert(Alert.AlertType.INFORMATION);
            explanationAlert.setTitle("Giai thich tu AI");
            explanationAlert.setHeaderText("Gemini da tra loi");
            explanationAlert.setContentText(explanation);
            explanationAlert.getDialogPane().setMinHeight(300);
            explanationAlert.getDialogPane().setPrefWidth(600);
            explanationAlert.showAndWait();
        }));
    }

    private void goBackHome() {
        try {
            MainApp mainApp = new MainApp();
            mainApp.start(primaryStage);
        } catch (Exception ex) {
            Alert alert = new Alert(Alert.AlertType.ERROR);
            alert.setTitle("Loi");
            alert.setHeaderText("Khong the quay lai Trang chu");
            alert.setContentText(ex.getMessage());
            alert.showAndWait();
        }
    }

    private String formatAnswer(Answer answer) {
        return answer.getOptionLabel() + ". " + answer.getContent();
    }
}
