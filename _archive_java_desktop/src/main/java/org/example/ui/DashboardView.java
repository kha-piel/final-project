package org.example.ui;

import javafx.geometry.Insets;
import javafx.scene.control.Button;
import javafx.scene.control.ComboBox;
import javafx.scene.control.Label;
import javafx.scene.control.TableColumn;
import javafx.scene.control.TableView;
import javafx.scene.control.cell.PropertyValueFactory;
import javafx.scene.layout.HBox;
import javafx.scene.layout.Priority;
import javafx.scene.layout.VBox;
import javafx.util.StringConverter;
import org.example.model.ExamHistoryDTO;
import org.example.model.Subject;
import org.example.model.Topic;

public class DashboardView extends VBox {

    public final Button btnBackToHome;
    public final ComboBox<Subject> cbSubject;
    public final ComboBox<Topic> cbTopic;
    public final ComboBox<String> cbDifficulty;
    public final Button btnStartCustomExam;
    public final TableView<ExamHistoryDTO> tableHistory;

    public DashboardView() {
        setSpacing(20);
        setPadding(new Insets(20));

        btnBackToHome = new Button("Quay lai Trang chu");
        btnBackToHome.setStyle(
                "-fx-background-color: #ffffff;" +
                        "-fx-text-fill: #1d4ed8;" +
                        "-fx-font-weight: bold;" +
                        "-fx-padding: 10 16 10 16;" +
                        "-fx-background-radius: 10;" +
                        "-fx-border-radius: 10;" +
                        "-fx-border-color: #bfdbfe;"
        );

        Label lblTitle = new Label("ON TAP KIEN THUC");
        lblTitle.setStyle("-fx-font-size: 24px; -fx-font-weight: bold;");

        HBox headerBox = new HBox(12, btnBackToHome, lblTitle);
        headerBox.setAlignment(javafx.geometry.Pos.CENTER_LEFT);

        cbSubject = new ComboBox<>();
        cbSubject.setPromptText("Chon mon hoc");
        cbSubject.setPrefWidth(220);
        cbSubject.setConverter(new StringConverter<>() {
            @Override
            public String toString(Subject subject) {
                return subject == null ? "" : subject.getName();
            }

            @Override
            public Subject fromString(String string) {
                return null;
            }
        });

        cbTopic = new ComboBox<>();
        cbTopic.setPromptText("Chon chuyen de");
        cbTopic.setPrefWidth(220);
        cbTopic.setConverter(new StringConverter<>() {
            @Override
            public String toString(Topic topic) {
                return topic == null ? "" : topic.getName();
            }

            @Override
            public Topic fromString(String string) {
                return null;
            }
        });

        cbDifficulty = new ComboBox<>();
        cbDifficulty.setPromptText("Do kho");
        cbDifficulty.setPrefWidth(180);
        cbDifficulty.getItems().addAll(
                "Nh\u1eadn bi\u1ebft",
                "Th\u00f4ng hi\u1ec3u",
                "V\u1eadn d\u1ee5ng",
                "V\u1eadn d\u1ee5ng cao"
        );

        btnStartCustomExam = new Button("Tao de & Bat dau thi");
        btnStartCustomExam.setStyle(
                "-fx-background-color: #2e7d32;" +
                        "-fx-text-fill: white;" +
                        "-fx-font-weight: bold;" +
                        "-fx-padding: 10 18 10 18;" +
                        "-fx-background-radius: 6;"
        );

        HBox filterBox = new HBox(15);
        filterBox.getChildren().addAll(cbSubject, cbTopic, cbDifficulty, btnStartCustomExam);

        Label lblHistory = new Label("Lich su lam bai cua ban");
        lblHistory.setStyle("-fx-font-size: 16px; -fx-font-weight: bold;");

        tableHistory = new TableView<>();
        tableHistory.setColumnResizePolicy(TableView.CONSTRAINED_RESIZE_POLICY);

        TableColumn<ExamHistoryDTO, String> colExamTitle = new TableColumn<>("Ten de thi");
        colExamTitle.setCellValueFactory(new PropertyValueFactory<>("examTitle"));

        TableColumn<ExamHistoryDTO, String> colSubmitTime = new TableColumn<>("Thoi gian nop");
        colSubmitTime.setCellValueFactory(new PropertyValueFactory<>("submitTime"));

        TableColumn<ExamHistoryDTO, Double> colScore = new TableColumn<>("Diem so");
        colScore.setCellValueFactory(new PropertyValueFactory<>("score"));

        TableColumn<ExamHistoryDTO, String> colCorrectRatio = new TableColumn<>("Ty le dung");
        colCorrectRatio.setCellValueFactory(new PropertyValueFactory<>("correctRatio"));

        tableHistory.getColumns().addAll(colExamTitle, colSubmitTime, colScore, colCorrectRatio);
        tableHistory.setPrefHeight(400);

        VBox.setVgrow(tableHistory, Priority.ALWAYS);
        getChildren().addAll(headerBox, filterBox, lblHistory, tableHistory);
    }

    public Button getBtnBackToHome() {
        return btnBackToHome;
    }

    public ComboBox<Subject> getCbSubject() {
        return cbSubject;
    }

    public ComboBox<Topic> getCbTopic() {
        return cbTopic;
    }

    public ComboBox<String> getCbDifficulty() {
        return cbDifficulty;
    }

    public Button getBtnStartCustomExam() {
        return btnStartCustomExam;
    }

    public TableView<ExamHistoryDTO> getTableHistory() {
        return tableHistory;
    }
}
