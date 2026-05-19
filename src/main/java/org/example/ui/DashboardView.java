package org.example.ui;

import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Scene;
import javafx.scene.control.Alert;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.ScrollPane;
import javafx.scene.control.TableColumn;
import javafx.scene.control.TableView;
import javafx.scene.control.cell.PropertyValueFactory;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.VBox;
import javafx.stage.Stage;
import org.example.controller.QuizController;
import org.example.dao.AnswerDAO;
import org.example.dao.ExamDAO;
import org.example.dao.QuestionDAO;
import org.example.dao.StudentAttemptDAO;
import org.example.model.Exam;
import org.example.model.StudentAttempt;
import org.example.model.User;
import org.example.util.DatabaseConnection;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.List;

public class DashboardView extends BorderPane {

    private final User currentUser;
    private final Stage primaryStage;
    private final ExamDAO examDAO;

    public DashboardView(User user, Stage primaryStage) {
        this.currentUser = user;
        this.primaryStage = primaryStage;

        try {
            Connection connection = DatabaseConnection.getInstance();
            this.examDAO = new ExamDAO(connection);
        } catch (SQLException e) {
            throw new RuntimeException("Khong the khoi tao ExamDAO: " + e.getMessage(), e);
        }

        this.setPadding(new Insets(20));

        setupTop();
        setupCenter();
        setupRight();
    }

    private void setupTop() {
        String displayName = currentUser.getFullName() != null && !currentUser.getFullName().isBlank()
                ? currentUser.getFullName()
                : currentUser.getUsername();

        Label welcomeLabel = new Label("Xin chao, " + displayName + "!");
        welcomeLabel.setStyle("-fx-font-size: 18px; -fx-font-weight: bold;");
        BorderPane.setMargin(welcomeLabel, new Insets(0, 0, 20, 0));
        this.setTop(welcomeLabel);
    }

    private void setupCenter() {
        VBox centerBox = new VBox(15);
        centerBox.setAlignment(Pos.TOP_CENTER);

        Label chooseExamLabel = new Label("Chon de thi");
        chooseExamLabel.setStyle("-fx-font-size: 16px; -fx-font-weight: bold;");

        VBox examListBox = new VBox(12);
        examListBox.setAlignment(Pos.TOP_CENTER);
        examListBox.setFillWidth(true);

        List<Exam> examList = examDAO.getAllExams();
        if (examList.isEmpty()) {
            examListBox.getChildren().add(new Label("Chua co de thi nao trong he thong."));
        } else {
            for (Exam exam : examList) {
                Button examButton = new Button(
                        "Bat dau thi: " + exam.getTitle() + " (" + exam.getDuration() + " phut)"
                );
                examButton.setMaxWidth(Double.MAX_VALUE);
                examButton.setOnAction(e -> openExam(exam));
                examListBox.getChildren().add(examButton);
            }
        }

        ScrollPane scrollPane = new ScrollPane(examListBox);
        scrollPane.setFitToWidth(true);
        scrollPane.setPrefViewportHeight(400);

        centerBox.getChildren().addAll(chooseExamLabel, scrollPane);
        this.setCenter(centerBox);
    }

    private void openExam(Exam exam) {
        try {
            Connection connection = DatabaseConnection.getInstance();
            QuizController quizController = new QuizController(
                    new ExamDAO(connection),
                    new QuestionDAO(connection),
                    new AnswerDAO(connection)
            );

            quizController.startExam(exam.getExamId());

            ExamView examView = new ExamView(quizController, primaryStage);
            primaryStage.setScene(new Scene(examView, 1024, 768));
        } catch (Exception ex) {
            Alert alert = new Alert(Alert.AlertType.ERROR);
            alert.setTitle("Loi");
            alert.setHeaderText("Khong the mo de thi");
            alert.setContentText(ex.getMessage());
            alert.showAndWait();
        }
    }

    private void setupRight() {
        VBox rightBox = new VBox(10);
        rightBox.setPadding(new Insets(0, 0, 0, 20));

        Label historyLabel = new Label("Lich su thi");
        historyLabel.setStyle("-fx-font-size: 14px; -fx-font-weight: bold;");

        TableView<StudentAttempt> historyTable = new TableView<>();

        TableColumn<StudentAttempt, Integer> examIdCol = new TableColumn<>("ID De");
        examIdCol.setCellValueFactory(new PropertyValueFactory<>("examId"));

        TableColumn<StudentAttempt, Double> scoreCol = new TableColumn<>("Diem so");
        scoreCol.setCellValueFactory(new PropertyValueFactory<>("score"));

        TableColumn<StudentAttempt, String> timeCol = new TableColumn<>("Thoi gian nop");
        timeCol.setCellValueFactory(new PropertyValueFactory<>("completedAt"));
        timeCol.setPrefWidth(150);

        historyTable.getColumns().addAll(examIdCol, scoreCol, timeCol);

        loadHistoryData(historyTable);

        rightBox.getChildren().addAll(historyLabel, historyTable);
        this.setRight(rightBox);
    }

    private void loadHistoryData(TableView<StudentAttempt> table) {
        try {
            Connection conn = DatabaseConnection.getInstance();
            StudentAttemptDAO attemptDAO = new StudentAttemptDAO(conn);
            List<StudentAttempt> attempts = attemptDAO.findByUserId(currentUser.getId());
            table.getItems().addAll(attempts);
        } catch (SQLException e) {
            System.err.println("Loi khi tai lich su thi: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
