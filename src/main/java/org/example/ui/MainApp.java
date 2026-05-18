package org.example.ui;

import javafx.application.Application;
import javafx.application.Platform;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.RadioButton;
import javafx.scene.control.TextArea;
import javafx.scene.control.ToggleGroup;
import javafx.scene.layout.HBox;
import javafx.scene.layout.VBox;
import javafx.scene.text.Font;
import javafx.scene.text.FontWeight;
import javafx.stage.Stage;
import org.example.dao.AnswerDAO;
import org.example.dao.QuestionDAO;
import org.example.model.Answer;
import org.example.model.Question;
import org.example.service.AiServiceClient;
import org.example.util.DatabaseConnection;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.List;
import java.util.concurrent.CompletableFuture;

/**
 * MainApp - Man hinh lam bai trac nghiem va hoi AI giai thich.
 */
public class MainApp extends Application {

    private static final String APP_TITLE = "THPTQG AI On Tap - Phien ban Beta";
    private static final double WINDOW_WIDTH = 800;
    private static final double WINDOW_HEIGHT = 600;

    private Connection connection;
    private QuestionDAO questionDAO;
    private AnswerDAO answerDAO;
    private AiServiceClient aiServiceClient;

    private Question currentQuestion;
    private List<Answer> currentAnswers;
    private Answer selectedAnswer;
    private Answer correctAnswer;

    private Label lblQuestion;
    private ToggleGroup answerGroup;
    private RadioButton rbA;
    private RadioButton rbB;
    private RadioButton rbC;
    private RadioButton rbD;
    private Button btnSubmit;
    private Button btnAskAI;
    private TextArea taResult;

    @Override
    public void start(Stage primaryStage) {
        lblQuestion = new Label("Dang tai cau hoi tu SQLite...");
        lblQuestion.setFont(Font.font("System", FontWeight.BOLD, 18));
        lblQuestion.setWrapText(true);
        lblQuestion.setMaxWidth(Double.MAX_VALUE);

        answerGroup = new ToggleGroup();

        rbA = createAnswerRadioButton();
        rbB = createAnswerRadioButton();
        rbC = createAnswerRadioButton();
        rbD = createAnswerRadioButton();

        VBox vboxAnswers = new VBox(10, rbA, rbB, rbC, rbD);
        vboxAnswers.setPadding(new Insets(5, 0, 5, 20));

        btnSubmit = new Button("Nop bai / Chuyen cau");
        btnAskAI = new Button("Hoi AI giai thich");
        btnSubmit.setDisable(true);
        btnAskAI.setDisable(true);
        btnAskAI.setStyle("-fx-opacity: 0.6;");

        btnSubmit.setOnAction(e -> handleSubmitAction());
        btnAskAI.setOnAction(e -> handleAskAiAction());

        HBox hboxButtons = new HBox(15, btnSubmit, btnAskAI);
        hboxButtons.setAlignment(Pos.CENTER);

        taResult = new TextArea();
        taResult.setEditable(false);
        taResult.setWrapText(true);
        taResult.setPrefHeight(180);
        taResult.setPromptText("Ket qua cham diem va loi giai thich tu AI se hien thi tai day...");

        VBox root = new VBox(20, lblQuestion, vboxAnswers, hboxButtons, taResult);
        root.setAlignment(Pos.CENTER);
        root.setPadding(new Insets(20));

        Scene scene = new Scene(root, WINDOW_WIDTH, WINDOW_HEIGHT);
        primaryStage.setTitle(APP_TITLE);
        primaryStage.setScene(scene);
        primaryStage.show();

        initializeDependencies();
        loadRandomQuestion();
    }

    private void initializeDependencies() {
        try {
            connection = DatabaseConnection.getInstance();
            questionDAO = new QuestionDAO(connection);
            answerDAO = new AnswerDAO(connection);
            aiServiceClient = new AiServiceClient();
        } catch (SQLException ex) {
            Platform.runLater(() -> {
                lblQuestion.setText("Khong the ket noi SQLite.");
                taResult.setText("❌ Loi khoi tao Database: " + ex.getMessage() + "\n");
                btnSubmit.setDisable(true);
                btnAskAI.setDisable(true);
            });
        }
    }

    private void loadRandomQuestion() {
        if (questionDAO == null || answerDAO == null) {
            appendResult("❌ He thong chua khoi tao duoc DAO.");
            return;
        }

        Platform.runLater(() -> {
            btnSubmit.setDisable(true);
            btnAskAI.setDisable(true);
            btnAskAI.setStyle("-fx-opacity: 0.6;");
            taResult.clear();
            taResult.appendText("⏳ Dang tai cau hoi tu SQLite...\n");
        });

        CompletableFuture.runAsync(() -> {
            try {
                Question question = questionDAO.getRandomQuestion();
                if (question == null) {
                    throw new IllegalStateException("Khong tim thay cau hoi nao trong database.");
                }

                List<Answer> answers = answerDAO.getAnswersByQuestionId(question.getQuestionId());
                if (answers == null || answers.isEmpty()) {
                    throw new IllegalStateException("Khong tim thay dap an cho cau hoi ID = " + question.getQuestionId());
                }

                Answer foundCorrectAnswer = findCorrectAnswer(answers);
                if (foundCorrectAnswer == null) {
                    throw new IllegalStateException("Cau hoi hien tai khong co dap an dung.");
                }

                Platform.runLater(() -> {
                    currentQuestion = question;
                    currentAnswers = answers;
                    correctAnswer = foundCorrectAnswer;
                    selectedAnswer = null;

                    lblQuestion.setText("Cau hoi: " + question.getQuestionText());
                    updateAnswerButtons(answers);
                    answerGroup.selectToggle(null);
                    btnSubmit.setDisable(false);
                    btnAskAI.setDisable(true);
                    btnAskAI.setStyle("-fx-opacity: 0.6;");
                    taResult.appendText("✅ Da tai xong cau hoi. Hay chon dap an va nop bai.\n");
                });
            } catch (Exception ex) {
                Platform.runLater(() -> {
                    lblQuestion.setText("Khong the tai cau hoi.");
                    taResult.appendText("❌ Loi tai cau hoi: " + ex.getMessage() + "\n");
                    btnSubmit.setDisable(true);
                    btnAskAI.setDisable(true);
                    btnAskAI.setStyle("-fx-opacity: 0.6;");
                });
            }
        });
    }

    private void handleSubmitAction() {
        Answer chosenAnswer = getSelectedAnswer();
        if (chosenAnswer == null) {
            Platform.runLater(() -> taResult.appendText("⚠ Ban chua chon dap an.\n\n"));
            return;
        }

        btnSubmit.setDisable(true);
        appendResult("⏳ He thong dang cham diem...");

        CompletableFuture.runAsync(() -> {
            try {
                Thread.sleep(1500);
                Answer actualCorrectAnswer = findCorrectAnswer(currentAnswers);
                if (actualCorrectAnswer == null) {
                    throw new IllegalStateException("Khong xac dinh duoc dap an dung tu database.");
                }

                Platform.runLater(() -> {
                    selectedAnswer = chosenAnswer;
                    correctAnswer = actualCorrectAnswer;

                    if (chosenAnswer.isCorrect()) {
                        taResult.appendText("✅ Chinh xac! Ban da chon "
                                + chosenAnswer.getOptionLabel()
                                + ".\n\n");
                        btnAskAI.setDisable(true);
                        btnAskAI.setStyle("-fx-opacity: 0.6;");
                    } else {
                        taResult.appendText("❌ Sai roi! Dap an cua ban la "
                                + formatAnswer(chosenAnswer)
                                + ". Dap an dung la: "
                                + formatAnswer(actualCorrectAnswer)
                                + ".\n\n");
                        btnAskAI.setDisable(false);
                        btnAskAI.setStyle("");
                    }

                    btnSubmit.setDisable(false);
                });
            } catch (Exception ex) {
                Platform.runLater(() -> {
                    taResult.appendText("❌ Loi khi cham diem: " + ex.getMessage() + "\n\n");
                    btnSubmit.setDisable(false);
                });
            }
        });
    }

    private void handleAskAiAction() {
        if (currentQuestion == null || selectedAnswer == null || correctAnswer == null) {
            appendResult("⚠ Chua du du lieu de hoi AI.");
            return;
        }

        btnAskAI.setDisable(true);
        appendResult("🤖 AI dang phan tich cau hoi tu du lieu Obsidian, vui long doi...");

        String questionContent = currentQuestion.getQuestionText();
        String studentAnswer = formatAnswer(selectedAnswer);
        String correctAnswerText = formatAnswer(correctAnswer);
        String obsidianSourcePath = currentQuestion.getObsidianSourcePath() != null
                ? currentQuestion.getObsidianSourcePath()
                : "";

        CompletableFuture.runAsync(() -> {
            try {
                String explanation = aiServiceClient.getExplanation(
                        questionContent,
                        studentAnswer,
                        correctAnswerText,
                        obsidianSourcePath
                );

                Platform.runLater(() -> {
                    taResult.appendText("🤖 Giai thich tu AI:\n");
                    taResult.appendText(explanation + "\n\n");
                    btnAskAI.setDisable(false);
                });
            } catch (Exception ex) {
                Platform.runLater(() -> {
                    taResult.appendText("❌ Loi khi goi AI: " + ex.getMessage() + "\n\n");
                    btnAskAI.setDisable(false);
                });
            }
        });
    }

    private RadioButton createAnswerRadioButton() {
        RadioButton radioButton = new RadioButton("Dang tai...");
        radioButton.setToggleGroup(answerGroup);
        radioButton.setWrapText(true);
        radioButton.setMaxWidth(Double.MAX_VALUE);
        return radioButton;
    }

    private void updateAnswerButtons(List<Answer> answers) {
        List<RadioButton> buttons = List.of(rbA, rbB, rbC, rbD);
        for (int i = 0; i < buttons.size(); i++) {
            RadioButton button = buttons.get(i);
            if (i < answers.size()) {
                Answer answer = answers.get(i);
                button.setText(formatAnswer(answer));
                button.setUserData(answer);
                button.setDisable(false);
                button.setVisible(true);
                button.setManaged(true);
            } else {
                button.setText("");
                button.setUserData(null);
                button.setDisable(true);
                button.setVisible(false);
                button.setManaged(false);
            }
        }
    }

    private Answer getSelectedAnswer() {
        if (answerGroup.getSelectedToggle() == null) {
            return null;
        }
        Object userData = answerGroup.getSelectedToggle().getUserData();
        return userData instanceof Answer ? (Answer) userData : null;
    }

    private Answer findCorrectAnswer(List<Answer> answers) {
        if (answers == null) {
            return null;
        }
        for (Answer answer : answers) {
            if (answer.isCorrect()) {
                return answer;
            }
        }
        return null;
    }

    private String formatAnswer(Answer answer) {
        return answer.getOptionLabel() + ". " + answer.getContent();
    }

    private void appendResult(String message) {
        Platform.runLater(() -> taResult.appendText(message + "\n"));
    }

    @Override
    public void stop() {
        DatabaseConnection.closeConnection();
    }

    public static void main(String[] args) {
        launch(args);
    }
}
