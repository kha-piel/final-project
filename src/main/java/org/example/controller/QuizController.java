package org.example.controller;

import org.example.dao.AnswerDAO;
import org.example.dao.ExamDAO;
import org.example.dao.QuestionDAO;
import org.example.model.Answer;
import org.example.model.Exam;
import org.example.model.Question;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * QuizController - Quan ly luong lam mot bai thi hoan chinh theo mo hinh MVC.
 *
 * Controller nay chi xu ly:
 * - Tai danh sach cau hoi cua de thi
 * - Quan ly vi tri cau hoi hien tai
 * - Luu dap an hoc sinh da chon
 * - Cham diem khi nop bai
 *
 * Tam thoi KHONG goi AI trong controller nay.
 */
public class QuizController {

    private final ExamDAO examDAO;
    private final QuestionDAO questionDAO;
    private final AnswerDAO answerDAO;

    /**
     * Danh sach cau hoi cua de thi hien tai.
     */
    private List<Question> examQuestions;

    /**
     * Vi tri cau hoi hien tai trong de thi.
     */
    private int currentIndex = 0;

    /**
     * Luu lich su chon dap an cua hoc sinh.
     * Key   = questionId
     * Value = Answer da chon
     */
    private Map<Integer, Answer> userAnswers;

    /**
     * Thoi gian con lai cua bai thi, tinh theo giay.
     */
    private int timeRemaining;

    public QuizController(ExamDAO examDAO, QuestionDAO questionDAO, AnswerDAO answerDAO) {
        this.examDAO = examDAO;
        this.questionDAO = questionDAO;
        this.answerDAO = answerDAO;
        this.examQuestions = new ArrayList<>();
        this.userAnswers = new HashMap<>();
        this.timeRemaining = 0;
    }

    /**
     * Bat dau mot de thi moi.
     *
     * @param examId ID de thi can tai
     * @throws IllegalArgumentException neu khong tim thay de thi
     * @throws IllegalStateException neu de thi khong co cau hoi hop le
     */
    public void startExam(int examId) {
        Optional<Exam> examOpt = examDAO.findById(examId);
        if (examOpt.isEmpty()) {
            throw new IllegalArgumentException("Khong tim thay de thi voi ID = " + examId);
        }

        Exam exam = examOpt.get();
        List<Integer> questionIds = examDAO.findQuestionIdsByExamId(examId);
        if (questionIds.isEmpty()) {
            throw new IllegalStateException("De thi khong co cau hoi nao.");
        }

        List<Question> loadedQuestions = new ArrayList<>();
        for (int questionId : questionIds) {
            Optional<Question> questionOpt = questionDAO.findById(questionId);
            if (questionOpt.isPresent()) {
                loadedQuestions.add(questionOpt.get());
            }
        }

        if (loadedQuestions.isEmpty()) {
            throw new IllegalStateException("Khong tai duoc cau hoi hop le nao tu de thi.");
        }

        this.examQuestions = loadedQuestions;
        this.userAnswers = new HashMap<>();
        this.currentIndex = 0;
        this.timeRemaining = exam.getDuration() * 60;
    }

    /**
     * Tra ve cau hoi hien tai.
     *
     * @return Question hien tai, hoac null neu chua co de thi
     */
    public Question getCurrentQuestion() {
        if (examQuestions == null || examQuestions.isEmpty()) {
            return null;
        }
        if (currentIndex < 0 || currentIndex >= examQuestions.size()) {
            return null;
        }
        return examQuestions.get(currentIndex);
    }

    /**
     * Chuyen sang cau hoi tiep theo neu co.
     */
    public void nextQuestion() {
        if (examQuestions == null || examQuestions.isEmpty()) {
            return;
        }
        if (currentIndex < examQuestions.size() - 1) {
            currentIndex++;
        }
    }

    /**
     * Quay lai cau hoi truoc neu co.
     */
    public void previousQuestion() {
        if (examQuestions == null || examQuestions.isEmpty()) {
            return;
        }
        if (currentIndex > 0) {
            currentIndex--;
        }
    }

    /**
     * Luu dap an hoc sinh vua chon cho cau hoi hien tai.
     *
     * @param answer dap an hoc sinh chon
     */
    public void saveAnswer(Answer answer) {
        Question currentQuestion = getCurrentQuestion();
        if (currentQuestion == null || answer == null) {
            return;
        }

        userAnswers.put(currentQuestion.getQuestionId(), answer);
    }

    /**
     * Cham diem bai thi va tra ve so cau dung.
     *
     * @return so cau dung
     */
    public int submitExam() {
        if (examQuestions == null || examQuestions.isEmpty()) {
            return 0;
        }

        int correctCount = 0;

        for (Question question : examQuestions) {
            Answer selectedAnswer = userAnswers.get(question.getQuestionId());
            if (selectedAnswer == null) {
                continue;
            }

            Answer correctAnswer = answerDAO.findCorrectAnswer(question.getQuestionId());
            if (correctAnswer != null && selectedAnswer.getAnswerId() == correctAnswer.getAnswerId()) {
                correctCount++;
            }
        }

        return correctCount;
    }

    public List<Question> getExamQuestions() {
        return examQuestions;
    }

    public int getCurrentIndex() {
        return currentIndex;
    }

    public Map<Integer, Answer> getUserAnswers() {
        return userAnswers;
    }

    public int getTimeRemaining() {
        return timeRemaining;
    }

    public void setTimeRemaining(int timeRemaining) {
        this.timeRemaining = Math.max(timeRemaining, 0);
    }
}
