package org.example.controller;

import javafx.collections.FXCollections;
import javafx.scene.Scene;
import javafx.scene.control.Alert;
import javafx.stage.Stage;
import org.example.dao.QuestionDAO;
import org.example.dao.StudentAttemptDAO;
import org.example.dao.SubjectDAO;
import org.example.dao.TopicDAO;
import org.example.model.ExamHistoryDTO;
import org.example.model.Question;
import org.example.model.Subject;
import org.example.model.Topic;
import org.example.ui.DashboardView;
import org.example.ui.ExamExecutionView;
import org.example.util.DatabaseConnection;
import org.example.util.ShuffleUtil;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.Collections;
import java.util.List;

public class DashboardController {

    private static final int CUSTOM_EXAM_DURATION_MINUTES = 45;

    private final DashboardView view;
    private final int currentUserId;
    private final Connection connection;

    private final SubjectDAO subjectDAO;
    private final TopicDAO topicDAO;
    private final QuestionDAO questionDAO;
    private StudentAttemptDAO studentAttemptDAO;

    public DashboardController(DashboardView view, int currentUserId) {
        this.view = view;
        this.currentUserId = currentUserId;

        try {
            this.connection = DatabaseConnection.getInstance();
        } catch (SQLException e) {
            throw new RuntimeException("Khong the khoi tao ket noi database cho Dashboard: " + e.getMessage(), e);
        }

        this.subjectDAO = new SubjectDAO();
        this.topicDAO = new TopicDAO();
        this.questionDAO = new QuestionDAO(connection);
        initStudentAttemptDAO();
        loadData();
        setupEventHandlers();
    }

    public void loadData() {
        try {
            List<Subject> subjects = subjectDAO.getAllSubjects();
            view.getCbSubject().getItems().clear();
            view.getCbSubject().getItems().addAll(subjects);

            List<ExamHistoryDTO> history = studentAttemptDAO != null
                    ? studentAttemptDAO.getHistoryByUserId(currentUserId)
                    : Collections.emptyList();
            view.getTableHistory().setItems(FXCollections.observableArrayList(history));
        } catch (Exception e) {
            System.err.println("Loi khi tai du lieu dashboard: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public void setupEventHandlers() {
        view.getCbSubject().setOnAction(event -> {
            try {
                Subject selectedSubject = view.getCbSubject().getValue();
                view.getCbTopic().getItems().clear();
                view.getCbTopic().setValue(null);

                if (selectedSubject == null) {
                    return;
                }

                List<Topic> topics = topicDAO.getTopicsBySubjectId(selectedSubject.getId());
                view.getCbTopic().setItems(FXCollections.observableArrayList(topics));
            } catch (Exception e) {
                System.err.println("Loi khi tai danh sach chuyen de: " + e.getMessage());
                e.printStackTrace();
            }
        });

        view.getBtnStartCustomExam().setOnAction(event -> handleStartCustomExam());
    }

    private void handleStartCustomExam() {
        try {
            Subject selectedSubject = view.getCbSubject().getValue();
            Topic selectedTopic = view.getCbTopic().getValue();
            String selectedDifficulty = resolveSelectedDifficulty();

            if (selectedSubject == null || selectedTopic == null || selectedDifficulty == null) {
                showAlert(
                        Alert.AlertType.ERROR,
                        "Thong bao",
                        "Vui long chon day du Mon hoc, Chuyen de va Do kho!"
                );
                return;
            }

            int topicId = selectedTopic.getId();
            List<Question> questions = questionDAO.getQuestionsByFilter(topicId, selectedDifficulty);
            System.out.println("DEBUG custom exam: topicId=" + topicId
                    + ", topic=" + selectedTopic.getName()
                    + ", difficulty=" + selectedDifficulty
                    + ", db=" + DatabaseConnection.getDatabasePath()
                    + ", questions=" + questions.size());

            if (questions.isEmpty()) {
                showAlert(
                        Alert.AlertType.ERROR,
                        "Thong bao",
                        "Chuyen de nay hien chua co cau hoi nao!"
                );
                return;
            }

            ShuffleUtil.fisherYatesShuffle(questions);
            for (Question question : questions) {
                ShuffleUtil.fisherYatesShuffle(question.getAnswers());
            }

            ExamController examController = new ExamController(null, null, null, null);
            examController.startCustomExam(
                    questions,
                    buildCustomExamTitle(selectedSubject, selectedTopic, selectedDifficulty),
                    CUSTOM_EXAM_DURATION_MINUTES
            );

            Stage stage = (Stage) view.getScene().getWindow();
            Scene previousScene = stage.getScene();
            ExamExecutionView examExecutionView = new ExamExecutionView(examController, stage, previousScene);
            Scene examScene = new Scene(examExecutionView, 1024, 768);
            stage.setScene(examScene);
        } catch (Exception e) {
            System.err.println("Loi khi xu ly tao de thi tuy chinh: " + e.getMessage());
            e.printStackTrace();
            showAlert(Alert.AlertType.ERROR, "Loi", "Khong the bat dau phong thi: " + e.getMessage());
        }
    }

    private String buildCustomExamTitle(Subject subject, Topic topic, String difficulty) {
        return "De tu chon - " + subject.getName() + " - " + topic.getName() + " - " + difficulty;
    }

    private String resolveSelectedDifficulty() {
        int selectedIndex = view.getCbDifficulty().getSelectionModel().getSelectedIndex();
        return switch (selectedIndex) {
            case 0 -> "Nh\u1eadn bi\u1ebft";
            case 1 -> "Th\u00f4ng hi\u1ec3u";
            case 2 -> "V\u1eadn d\u1ee5ng";
            case 3 -> "V\u1eadn d\u1ee5ng cao";
            default -> null;
        };
    }

    private void initStudentAttemptDAO() {
        this.studentAttemptDAO = new StudentAttemptDAO(connection);
    }

    private void showAlert(Alert.AlertType alertType, String title, String content) {
        Alert alert = new Alert(alertType);
        alert.setTitle(title);
        alert.setHeaderText(null);
        alert.setContentText(content);
        alert.showAndWait();
    }
}
