package org.example.ui;

import javafx.animation.KeyFrame;
import javafx.animation.Timeline;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.RadioButton;
import javafx.scene.control.ToggleGroup;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.HBox;
import javafx.scene.layout.VBox;
import javafx.stage.Stage;
import javafx.util.Duration;
import org.example.controller.QuizController;
import org.example.dao.AnswerDAO;
import org.example.model.Answer;
import org.example.model.Question;
import org.example.util.DatabaseConnection;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.List;

public class ExamView extends BorderPane {

    private final QuizController quizController;
    private final Stage primaryStage;
    private AnswerDAO answerDAO;

    private Label progressLabel;
    private Label timerLabel;
    private Label questionTextLabel;
    private VBox optionsBox;
    private ToggleGroup toggleGroup;

    private Button prevButton;
    private Button nextButton;
    private Button submitButton;

    private Timeline timeline;
    private int timeRemaining;

    public ExamView(QuizController quizController, Stage primaryStage) {
        this.quizController = quizController;
        this.primaryStage = primaryStage;
        this.timeRemaining = quizController.getTimeRemaining();

        try {
            Connection conn = DatabaseConnection.getInstance();
            this.answerDAO = new AnswerDAO(conn);
        } catch (SQLException e) {
            System.err.println("Loi khoi tao AnswerDAO: " + e.getMessage());
            e.printStackTrace();
        }

        setupUI();
        startTimer();
        loadCurrentQuestion();
    }

    private void setupUI() {
        setPadding(new Insets(20));

        HBox topBox = new HBox(50);
        topBox.setAlignment(Pos.CENTER);

        progressLabel = new Label();
        progressLabel.setStyle("-fx-font-size: 16px; -fx-font-weight: bold;");

        timerLabel = new Label();
        timerLabel.setStyle("-fx-font-size: 16px; -fx-font-weight: bold; -fx-text-fill: red;");

        topBox.getChildren().addAll(progressLabel, timerLabel);
        setTop(topBox);
        BorderPane.setMargin(topBox, new Insets(0, 0, 20, 0));

        VBox centerBox = new VBox(20);
        centerBox.setPadding(new Insets(20, 0, 20, 0));

        questionTextLabel = new Label();
        questionTextLabel.setStyle("-fx-font-size: 18px; -fx-font-weight: bold;");
        questionTextLabel.setWrapText(true);

        optionsBox = new VBox(15);
        toggleGroup = new ToggleGroup();

        centerBox.getChildren().addAll(questionTextLabel, optionsBox);
        setCenter(centerBox);

        HBox bottomBox = new HBox(20);
        bottomBox.setAlignment(Pos.CENTER);

        prevButton = new Button("Cau truoc");
        nextButton = new Button("Cau tiep theo");
        submitButton = new Button("Nop bai");
        submitButton.setStyle("-fx-background-color: #4CAF50; -fx-text-fill: white; -fx-font-weight: bold;");

        prevButton.setOnAction(e -> handlePrevious());
        nextButton.setOnAction(e -> handleNext());
        submitButton.setOnAction(e -> handleSubmit());

        bottomBox.getChildren().addAll(prevButton, nextButton, submitButton);
        setBottom(bottomBox);
        BorderPane.setMargin(bottomBox, new Insets(20, 0, 0, 0));
    }

    private void startTimer() {
        timeline = new Timeline(new KeyFrame(Duration.seconds(1), e -> {
            timeRemaining--;
            updateTimerLabel();
            if (timeRemaining <= 0) {
                timeline.stop();
                handleSubmit();
            }
        }));
        timeline.setCycleCount(Timeline.INDEFINITE);
        timeline.play();
        updateTimerLabel();
    }

    private void updateTimerLabel() {
        int minutes = timeRemaining / 60;
        int seconds = timeRemaining % 60;
        timerLabel.setText(String.format("Thoi gian con lai: %02d:%02d", minutes, seconds));
    }

    private void loadCurrentQuestion() {
        Question currentQuestion = quizController.getCurrentQuestion();
        if (currentQuestion == null) {
            return;
        }

        int currentIndex = quizController.getCurrentIndex();
        int totalQuestions = quizController.getExamQuestions().size();
        progressLabel.setText(String.format("Cau hoi so: %d/%d", currentIndex + 1, totalQuestions));

        questionTextLabel.setText(currentQuestion.getQuestionText());

        optionsBox.getChildren().clear();
        toggleGroup.getToggles().clear();

        if (answerDAO != null) {
            List<Answer> answers = answerDAO.findByQuestionId(currentQuestion.getQuestionId());
            Answer savedAnswer = quizController.getUserAnswers().get(currentQuestion.getQuestionId());

            for (Answer answer : answers) {
                RadioButton rb = new RadioButton(answer.getOptionLabel() + ". " + answer.getContent());
                rb.setStyle("-fx-font-size: 14px;");
                rb.setUserData(answer);
                rb.setToggleGroup(toggleGroup);

                if (savedAnswer != null && savedAnswer.getAnswerId() == answer.getAnswerId()) {
                    rb.setSelected(true);
                }

                optionsBox.getChildren().add(rb);
            }
        }

        prevButton.setDisable(currentIndex == 0);
        nextButton.setDisable(currentIndex == totalQuestions - 1);
    }

    private void saveCurrentAnswer() {
        if (toggleGroup.getSelectedToggle() != null) {
            Answer selectedAnswer = (Answer) toggleGroup.getSelectedToggle().getUserData();
            quizController.saveAnswer(selectedAnswer);
        }
    }

    private void handleNext() {
        saveCurrentAnswer();
        quizController.nextQuestion();
        loadCurrentQuestion();
    }

    private void handlePrevious() {
        saveCurrentAnswer();
        quizController.previousQuestion();
        loadCurrentQuestion();
    }

    private void handleSubmit() {
        saveCurrentAnswer();

        if (timeline != null) {
            timeline.stop();
        }

        quizController.setTimeRemaining(timeRemaining);
        ResultView resultView = new ResultView(quizController, primaryStage);
        Scene resultScene = new Scene(resultView, 1024, 768);
        primaryStage.setScene(resultScene);
    }
}
