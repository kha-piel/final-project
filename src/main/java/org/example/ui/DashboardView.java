package org.example.ui;

import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.TableColumn;
import javafx.scene.control.TableView;
import javafx.scene.control.cell.PropertyValueFactory;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.VBox;
import org.example.dao.StudentAttemptDAO;
import org.example.model.StudentAttempt;
import org.example.model.User;
import org.example.util.DatabaseConnection;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.List;

public class DashboardView extends BorderPane {

    private final User currentUser;

    public DashboardView(User user) {
        this.currentUser = user;

        // Thiết lập Padding chung
        this.setPadding(new Insets(20));

        // Phần Top: Xin chào
        setupTop();

        // Phần Center: Chọn đề thi
        setupCenter();

        // Phần Right: Lịch sử thi
        setupRight();
    }

    private void setupTop() {
        Label welcomeLabel = new Label("Xin chào, " + currentUser.getFullName() + "!");
        welcomeLabel.setStyle("-fx-font-size: 18px; -fx-font-weight: bold;");
        BorderPane.setMargin(welcomeLabel, new Insets(0, 0, 20, 0));
        this.setTop(welcomeLabel);
    }

    private void setupCenter() {
        VBox centerBox = new VBox(15);
        centerBox.setAlignment(Pos.CENTER);

        Label chooseExamLabel = new Label("Chọn đề thi");
        chooseExamLabel.setStyle("-fx-font-size: 16px; -fx-font-weight: bold;");

        Button mathExamBtn = new Button("Bắt đầu thi Đề Toán 01 (ID: 1)");
        mathExamBtn.setOnAction(e -> System.out.println("Đang chuyển sang phòng thi với Exam ID = 1..."));

        Button physicsExamBtn = new Button("Bắt đầu thi Đề Lý 01 (ID: 2)");
        physicsExamBtn.setOnAction(e -> System.out.println("Đang chuyển sang phòng thi với Exam ID = 2..."));

        centerBox.getChildren().addAll(chooseExamLabel, mathExamBtn, physicsExamBtn);
        this.setCenter(centerBox);
    }

    private void setupRight() {
        VBox rightBox = new VBox(10);
        rightBox.setPadding(new Insets(0, 0, 0, 20)); // Margin left for spacing

        Label historyLabel = new Label("Lịch sử thi");
        historyLabel.setStyle("-fx-font-size: 14px; -fx-font-weight: bold;");

        TableView<StudentAttempt> historyTable = new TableView<>();

        TableColumn<StudentAttempt, Integer> examIdCol = new TableColumn<>("ID Đề");
        examIdCol.setCellValueFactory(new PropertyValueFactory<>("examId"));

        TableColumn<StudentAttempt, Double> scoreCol = new TableColumn<>("Điểm số");
        scoreCol.setCellValueFactory(new PropertyValueFactory<>("score"));

        TableColumn<StudentAttempt, String> timeCol = new TableColumn<>("Thời gian nộp");
        timeCol.setCellValueFactory(new PropertyValueFactory<>("completedAt"));
        timeCol.setPrefWidth(150);

        historyTable.getColumns().addAll(examIdCol, scoreCol, timeCol);

        // Load data từ database
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
            System.err.println("Lỗi khi tải lịch sử thi: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
