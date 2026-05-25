package org.example.controller;

import org.example.dao.AnswerDAO;
import org.example.dao.ExamDAO;
import org.example.dao.QuestionDAO;
import org.example.dao.StudentAttemptDAO;
import org.example.model.Answer;
import org.example.model.Exam;
import org.example.model.Question;
import org.example.model.StudentAttempt;
import org.example.service.AiServiceClient;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;

public class ExamController {

    private static final String WRONG_ANSWER_SYSTEM_MESSAGE = "Hoc sinh chon sai cau nay. Hay giai thich giup toi!";

    private final ExamDAO examDAO;
    private final QuestionDAO questionDAO;
    private final AnswerDAO answerDAO;
    private final StudentAttemptDAO studentAttemptDAO;
    private final AiServiceClient aiServiceClient;

    private Exam currentExam;
    private StudentAttempt currentAttempt;
    private List<QuestionSnapshot> examQuestions;
    private Map<Integer, Integer> studentSelections;
    private final Map<Integer, String> aiExplanationsMap;
    private final java.util.Set<Integer> lockedQuestionIds;
    private final List<ChatMessage> chatHistory;
    private LocalDateTime examStartTime;
    private boolean examInProgress;

    public ExamController(ExamDAO examDAO, QuestionDAO questionDAO,
                          AnswerDAO answerDAO, StudentAttemptDAO studentAttemptDAO) {
        this.examDAO = examDAO;
        this.questionDAO = questionDAO;
        this.answerDAO = answerDAO;
        this.studentAttemptDAO = studentAttemptDAO;
        this.aiServiceClient = new AiServiceClient();
        this.examQuestions = new ArrayList<>();
        this.studentSelections = new HashMap<>();
        this.aiExplanationsMap = new HashMap<>();
        this.lockedQuestionIds = new java.util.HashSet<>();
        this.chatHistory = new ArrayList<>();
        this.examInProgress = false;
    }

    public void startCustomExam(List<Question> questions, String examTitle, int durationMinutes) {
        if (questions == null || questions.isEmpty()) {
            throw new IllegalArgumentException("Danh sach cau hoi rong.");
        }

        currentExam = new Exam();
        currentExam.setExamId(0);
        currentExam.setTitle(examTitle);
        currentExam.setDuration(durationMinutes);
        currentExam.setTotalQuestions(questions.size());
        currentExam.setPassScore(5.0);

        currentAttempt = null;
        examQuestions = new ArrayList<>();

        for (Question question : questions) {
            List<Answer> answers = question.getAnswers() != null
                    ? new ArrayList<>(question.getAnswers())
                    : new ArrayList<>();

            int correctAnswerId = -1;
            for (Answer answer : answers) {
                if (answer.isCorrect()) {
                    correctAnswerId = answer.getAnswerId();
                    break;
                }
            }

            examQuestions.add(new QuestionSnapshot(
                    question.getQuestionId(),
                    question.getQuestionText(),
                    answers,
                    correctAnswerId,
                    question.getSubject(),
                    question.getChapter(),
                    question.getObsidianSourcePath() != null ? question.getObsidianSourcePath() : ""
            ));
        }

        studentSelections = new HashMap<>();
        aiExplanationsMap.clear();
        lockedQuestionIds.clear();
        clearChatHistory();
        examStartTime = LocalDateTime.now();
        examInProgress = true;
    }

    public boolean startExam(int examId, int userId) {
        Optional<Exam> examOpt = examDAO.findById(examId);
        if (examOpt.isEmpty()) {
            System.err.println("[ExamController] Khong tim thay de thi voi ID: " + examId);
            return false;
        }
        currentExam = examOpt.get();

        List<Integer> questionIds = examDAO.findQuestionIdsByExamId(examId);
        if (questionIds.isEmpty()) {
            System.err.println("[ExamController] De thi " + examId + " khong co cau hoi nao!");
            return false;
        }

        examQuestions = new ArrayList<>();
        for (int qId : questionIds) {
            List<Answer> answers = answerDAO.findByQuestionId(qId);

            int correctAnswerId = -1;
            for (Answer answer : answers) {
                if (answer.isCorrect()) {
                    correctAnswerId = answer.getAnswerId();
                    break;
                }
            }

            Optional<Question> questionOpt = questionDAO.findById(qId);
            String content = "";
            String subject = "";
            String chapter = "";
            String obsidianPath = "";
            if (questionOpt.isPresent()) {
                Question question = questionOpt.get();
                content = question.getQuestionText();
                subject = question.getSubject() != null ? question.getSubject() : "";
                chapter = question.getChapter() != null ? question.getChapter() : "";
                obsidianPath = question.getObsidianSourcePath() != null ? question.getObsidianSourcePath() : "";
            }

            examQuestions.add(new QuestionSnapshot(
                    qId,
                    content,
                    new ArrayList<>(answers),
                    correctAnswerId,
                    subject,
                    chapter,
                    obsidianPath
            ));
        }

        if (currentExam.isShuffleQuestions()) {
            Collections.shuffle(examQuestions);
        }

        if (currentExam.isShuffleAnswers()) {
            for (QuestionSnapshot questionSnapshot : examQuestions) {
                Collections.shuffle(questionSnapshot.getShuffledAnswers());
            }
        }

        currentAttempt = new StudentAttempt(userId, examId);
        int attemptId = studentAttemptDAO.save(currentAttempt);
        if (attemptId == -1) {
            System.err.println("[ExamController] Loi khi tao StudentAttempt!");
            return false;
        }

        studentSelections = new HashMap<>();
        aiExplanationsMap.clear();
        lockedQuestionIds.clear();
        clearChatHistory();
        examStartTime = LocalDateTime.now();
        examInProgress = true;

        System.out.println("[ExamController] Bat dau phien thi #" + attemptId
                + " | De: " + currentExam.getTitle()
                + " | So cau: " + examQuestions.size()
                + " | Thoi gian: " + currentExam.getDuration() + " phut");

        return true;
    }

    public void selectAnswer(int questionId, int selectedAnswerId) {
        if (!examInProgress) {
            throw new IllegalStateException("Chua co phien thi nao dang dien ra!");
        }

        boolean validQuestion = examQuestions.stream()
                .anyMatch(questionSnapshot -> questionSnapshot.getQuestionId() == questionId);
        if (!validQuestion) {
            System.err.println("[ExamController] Cau hoi " + questionId + " khong thuoc de thi hien tai!");
            return;
        }

        if (lockedQuestionIds.contains(questionId)) {
            return;
        }

        studentSelections.put(questionId, selectedAnswerId);
    }

    public AnswerCheckResult checkAnswer(int questionIndex) {
        QuestionSnapshot snapshot = getQuestionSnapshot(questionIndex);
        int selectedAnswerId = studentSelections.getOrDefault(snapshot.getQuestionId(), -1);

        if (selectedAnswerId == -1) {
            return new AnswerCheckResult(false, false, "Ban chua chon dap an.");
        }

        lockedQuestionIds.add(snapshot.getQuestionId());

        if (selectedAnswerId == snapshot.getCorrectAnswerId()) {
            return new AnswerCheckResult(true, true, "Ban da chon dung dap an.");
        }

        addChatMessage(ChatRole.SYSTEM, WRONG_ANSWER_SYSTEM_MESSAGE);
        return new AnswerCheckResult(true, false, "He thong da gui yeu cau AI giai thich.");
    }

    public CompletableFuture<ChatMessage> requestAutoExplanationForWrongAnswer(int questionIndex) {
        QuestionSnapshot snapshot = getQuestionSnapshot(questionIndex);
        return requestAiExplanation(snapshot, WRONG_ANSWER_SYSTEM_MESSAGE, true);
    }

    public CompletableFuture<ChatMessage> sendChatMessage(int questionIndex, String userMessage) {
        QuestionSnapshot snapshot = getQuestionSnapshot(questionIndex);
        addChatMessage(ChatRole.USER, userMessage);
        return requestAiExplanation(snapshot, userMessage, false);
    }

    private CompletableFuture<ChatMessage> requestAiExplanation(QuestionSnapshot snapshot, String prompt, boolean systemPrompt) {
        String selectedAnswer = resolveSelectedAnswerText(snapshot);
        String correctAnswer = resolveCorrectAnswerText(snapshot);
        String studentAnswerPayload = buildStudentAnswerPayload(prompt, selectedAnswer, systemPrompt);

        return CompletableFuture.supplyAsync(() -> aiServiceClient.getExplanation(
                snapshot.getQuestionContent(),
                studentAnswerPayload,
                correctAnswer,
                snapshot.getObsidianSourcePath()
        )).thenApply(explanation -> {
            storeAiExplanation(snapshot.getQuestionId(), explanation);
            ChatMessage message = new ChatMessage(ChatRole.AI, explanation);
            addChatMessage(message.getRole(), message.getContent());
            return message;
        });
    }

    private void storeAiExplanation(int questionId, String explanation) {
        if (explanation == null || explanation.isBlank()) {
            return;
        }

        synchronized (aiExplanationsMap) {
            String existing = aiExplanationsMap.get(questionId);
            if (existing == null || existing.isBlank()) {
                aiExplanationsMap.put(questionId, explanation);
            } else {
                aiExplanationsMap.put(questionId, existing + "\n\n-----\n\n" + explanation);
            }
        }
    }

    private String buildStudentAnswerPayload(String prompt, String selectedAnswer, boolean systemPrompt) {
        StringBuilder builder = new StringBuilder();
        if (selectedAnswer != null && !selectedAnswer.isBlank()) {
            builder.append("Lua chon hien tai cua hoc sinh: ").append(selectedAnswer).append("\n");
        }
        builder.append(systemPrompt ? "Yeu cau he thong: " : "Cau hoi them cua hoc sinh: ").append(prompt);
        return builder.toString();
    }

    private String resolveSelectedAnswerText(QuestionSnapshot snapshot) {
        int selectedAnswerId = studentSelections.getOrDefault(snapshot.getQuestionId(), -1);
        if (selectedAnswerId == -1) {
            return "Chua chon dap an";
        }

        Answer selectedAnswer = findAnswerById(snapshot, selectedAnswerId);
        return selectedAnswer != null ? formatAnswer(selectedAnswer) : "Chua chon dap an";
    }

    private String resolveCorrectAnswerText(QuestionSnapshot snapshot) {
        Answer correctAnswer = findAnswerById(snapshot, snapshot.getCorrectAnswerId());
        return correctAnswer != null ? formatAnswer(correctAnswer) : "Khong xac dinh";
    }

    private Answer findAnswerById(QuestionSnapshot snapshot, int answerId) {
        for (Answer answer : snapshot.getShuffledAnswers()) {
            if (answer.getAnswerId() == answerId) {
                return answer;
            }
        }
        return null;
    }

    private String formatAnswer(Answer answer) {
        return answer.getOptionLabel() + ". " + answer.getContent();
    }

    private QuestionSnapshot getQuestionSnapshot(int questionIndex) {
        if (questionIndex < 0 || questionIndex >= examQuestions.size()) {
            throw new IllegalArgumentException("Chi so cau hoi khong hop le: " + questionIndex);
        }
        return examQuestions.get(questionIndex);
    }

    private void addChatMessage(ChatRole role, String content) {
        synchronized (chatHistory) {
            chatHistory.add(new ChatMessage(role, content));
        }
    }

    private void clearChatHistory() {
        synchronized (chatHistory) {
            chatHistory.clear();
        }
    }

    public List<ChatMessage> getChatHistory() {
        synchronized (chatHistory) {
            return List.copyOf(chatHistory);
        }
    }

    public Map<Integer, String> getAiExplanationsMap() {
        synchronized (aiExplanationsMap) {
            return Map.copyOf(aiExplanationsMap);
        }
    }

    public List<ReviewQuestionSummary> buildReviewSummary() {
        List<ReviewQuestionSummary> items = new ArrayList<>();
        for (QuestionSnapshot snapshot : examQuestions) {
            Answer correctAnswer = findAnswerById(snapshot, snapshot.getCorrectAnswerId());
            int selectedAnswerId = studentSelections.getOrDefault(snapshot.getQuestionId(), -1);
            Answer selectedAnswer = findAnswerById(snapshot, selectedAnswerId);

            String selectedAnswerText = selectedAnswer != null
                    ? formatAnswer(selectedAnswer)
                    : "Chua chon dap an";
            String correctAnswerText = correctAnswer != null
                    ? formatAnswer(correctAnswer)
                    : "Khong xac dinh";
            boolean correct = selectedAnswer != null && selectedAnswer.getAnswerId() == snapshot.getCorrectAnswerId();

            items.add(new ReviewQuestionSummary(
                    snapshot.getQuestionId(),
                    snapshot.getQuestionContent(),
                    snapshot.getSubject(),
                    snapshot.getChapter(),
                    selectedAnswerText,
                    correctAnswerText,
                    correct
            ));
        }
        return List.copyOf(items);
    }

    public List<WrongQuestionInsight> buildWrongQuestionInsights() {
        List<WrongQuestionInsight> items = new ArrayList<>();

        for (QuestionSnapshot snapshot : examQuestions) {
            int selectedAnswerId = studentSelections.getOrDefault(snapshot.getQuestionId(), -1);
            if (selectedAnswerId == snapshot.getCorrectAnswerId()) {
                continue;
            }

            Answer correctAnswer = findAnswerById(snapshot, snapshot.getCorrectAnswerId());
            Answer selectedAnswer = findAnswerById(snapshot, selectedAnswerId);

            items.add(new WrongQuestionInsight(
                    snapshot.getQuestionId(),
                    snapshot.getQuestionContent(),
                    buildTopicLabel(snapshot.getSubject(), snapshot.getChapter()),
                    selectedAnswer != null ? formatAnswer(selectedAnswer) : "Chua chon dap an",
                    correctAnswer != null ? formatAnswer(correctAnswer) : "Khong xac dinh"
            ));
        }

        return List.copyOf(items);
    }

    public CompletableFuture<String> analyzeOverallWeaknesses() {
        List<WrongQuestionInsight> wrongItems = buildWrongQuestionInsights();
        if (wrongItems.isEmpty()) {
            return CompletableFuture.completedFuture(
                    "Hoc sinh khong co cau sai nao trong bai nay. Nen tiep tuc giu nhip on tap va tang dan muc do cau hoi de kiem tra do vung kien thuc."
            );
        }

        return CompletableFuture.supplyAsync(() -> aiServiceClient.analyzeWeaknesses(wrongItems));
    }

    private String buildTopicLabel(String subject, String chapter) {
        boolean hasSubject = subject != null && !subject.isBlank();
        boolean hasChapter = chapter != null && !chapter.isBlank();

        if (hasSubject && hasChapter) {
            return subject + " - " + chapter;
        }
        if (hasChapter) {
            return chapter;
        }
        if (hasSubject) {
            return subject;
        }
        return "Chua xac dinh chuyen de";
    }

    public ExamResult submitExam() {
        if (!examInProgress) {
            throw new IllegalStateException("Chua co phien thi nao dang dien ra!");
        }

        int correctCount = 0;
        int wrongCount = 0;
        int skippedCount = 0;
        int totalQuestions = examQuestions.size();

        for (QuestionSnapshot questionSnapshot : examQuestions) {
            int questionId = questionSnapshot.getQuestionId();
            int correctAnswerId = questionSnapshot.getCorrectAnswerId();

            if (!studentSelections.containsKey(questionId)) {
                skippedCount++;
            } else {
                int selectedAnswerId = studentSelections.get(questionId);
                if (selectedAnswerId == correctAnswerId) {
                    correctCount++;
                } else {
                    wrongCount++;
                }
            }
        }

        double score = 0.0;
        if (totalQuestions > 0) {
            score = Math.round(((double) correctCount / totalQuestions) * 10.0 * 100.0) / 100.0;
        }

        long timeTakenSeconds = ChronoUnit.SECONDS.between(examStartTime, LocalDateTime.now());

        int attemptId = 0;
        if (currentAttempt != null) {
            currentAttempt.setScore(score);
            currentAttempt.setCorrectCount(correctCount);
            currentAttempt.setWrongCount(wrongCount);
            currentAttempt.setSkippedCount(skippedCount);
            currentAttempt.setTotalTimeTaken((int) timeTakenSeconds);
            currentAttempt.setStatus(StudentAttempt.STATUS_COMPLETED);
            currentAttempt.setCompletedAt(
                    LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))
            );

            if (studentAttemptDAO != null) {
                studentAttemptDAO.update(currentAttempt);
            }
            attemptId = currentAttempt.getAttemptId();
        }

        examInProgress = false;

        System.out.println("[ExamController] Nop bai thanh cong!"
                + " | Diem: " + score + "/10"
                + " | Dung: " + correctCount
                + " | Sai: " + wrongCount
                + " | Bo qua: " + skippedCount
                + " | Thoi gian: " + timeTakenSeconds + "s");

        return new ExamResult(
                attemptId,
                currentExam.getTitle(),
                score,
                correctCount,
                wrongCount,
                skippedCount,
                totalQuestions,
                (int) timeTakenSeconds,
                currentExam.getDuration(),
                score >= currentExam.getPassScore()
        );
    }

    public List<QuestionSnapshot> getExamQuestions() {
        return Collections.unmodifiableList(examQuestions);
    }

    public Map<Integer, Integer> getStudentSelections() {
        return Collections.unmodifiableMap(studentSelections);
    }

    public boolean hasAnswered(int questionId) {
        return studentSelections.containsKey(questionId);
    }

    public int getSelectedAnswerId(int questionId) {
        return studentSelections.getOrDefault(questionId, -1);
    }

    public boolean isQuestionLocked(int questionId) {
        return lockedQuestionIds.contains(questionId);
    }

    public int getAnsweredCount() {
        return studentSelections.size();
    }

    public int getTotalQuestions() {
        return examQuestions.size();
    }

    public long getRemainingTimeMinutes() {
        if (!examInProgress || examStartTime == null) {
            return -1;
        }
        long elapsed = ChronoUnit.MINUTES.between(examStartTime, LocalDateTime.now());
        return Math.max(0, currentExam.getDuration() - elapsed);
    }

    public long getRemainingTimeSeconds() {
        if (!examInProgress || examStartTime == null) {
            return -1;
        }
        long elapsedSeconds = ChronoUnit.SECONDS.between(examStartTime, LocalDateTime.now());
        long totalSeconds = (long) currentExam.getDuration() * 60;
        return Math.max(0, totalSeconds - elapsedSeconds);
    }

    public boolean isExamInProgress() {
        return examInProgress;
    }

    public boolean isTimeUp() {
        return getRemainingTimeSeconds() <= 0;
    }

    public Exam getCurrentExam() {
        return currentExam;
    }

    public StudentAttempt getCurrentAttempt() {
        return currentAttempt;
    }

    public enum ChatRole {
        USER,
        AI,
        SYSTEM
    }

    public static class ChatMessage {

        private final ChatRole role;
        private final String content;

        public ChatMessage(ChatRole role, String content) {
            this.role = role;
            this.content = content;
        }

        public ChatRole getRole() {
            return role;
        }

        public String getContent() {
            return content;
        }
    }

    public static class AnswerCheckResult {

        private final boolean hasSelection;
        private final boolean correct;
        private final String message;

        public AnswerCheckResult(boolean hasSelection, boolean correct, String message) {
            this.hasSelection = hasSelection;
            this.correct = correct;
            this.message = message;
        }

        public boolean hasSelection() {
            return hasSelection;
        }

        public boolean isCorrect() {
            return correct;
        }

        public String getMessage() {
            return message;
        }
    }

    public static class QuestionSnapshot {

        private final int questionId;
        private final String questionContent;
        private final List<Answer> shuffledAnswers;
        private final int correctAnswerId;
        private final String subject;
        private final String chapter;
        private final String obsidianSourcePath;

        public QuestionSnapshot(int questionId, String questionContent,
                                List<Answer> shuffledAnswers, int correctAnswerId,
                                String subject, String chapter,
                                String obsidianSourcePath) {
            this.questionId = questionId;
            this.questionContent = questionContent;
            this.shuffledAnswers = shuffledAnswers;
            this.correctAnswerId = correctAnswerId;
            this.subject = subject;
            this.chapter = chapter;
            this.obsidianSourcePath = obsidianSourcePath;
        }

        public int getQuestionId() {
            return questionId;
        }

        public String getQuestionContent() {
            return questionContent;
        }

        public List<Answer> getShuffledAnswers() {
            return shuffledAnswers;
        }

        public int getCorrectAnswerId() {
            return correctAnswerId;
        }

        public String getSubject() {
            return subject;
        }

        public String getChapter() {
            return chapter;
        }

        public String getObsidianSourcePath() {
            return obsidianSourcePath;
        }
    }

    public static class ReviewQuestionSummary {

        private final int questionId;
        private final String questionContent;
        private final String subject;
        private final String chapter;
        private final String selectedAnswerText;
        private final String correctAnswerText;
        private final boolean correct;

        public ReviewQuestionSummary(int questionId,
                                     String questionContent,
                                     String subject,
                                     String chapter,
                                     String selectedAnswerText,
                                     String correctAnswerText,
                                     boolean correct) {
            this.questionId = questionId;
            this.questionContent = questionContent;
            this.subject = subject;
            this.chapter = chapter;
            this.selectedAnswerText = selectedAnswerText;
            this.correctAnswerText = correctAnswerText;
            this.correct = correct;
        }

        public int getQuestionId() {
            return questionId;
        }

        public String getQuestionContent() {
            return questionContent;
        }

        public String getSubject() {
            return subject;
        }

        public String getChapter() {
            return chapter;
        }

        public String getSelectedAnswerText() {
            return selectedAnswerText;
        }

        public String getCorrectAnswerText() {
            return correctAnswerText;
        }

        public boolean isCorrect() {
            return correct;
        }

        public String getTopicLabel() {
            boolean hasSubject = subject != null && !subject.isBlank();
            boolean hasChapter = chapter != null && !chapter.isBlank();

            if (hasSubject && hasChapter) {
                return subject + " - " + chapter;
            }
            if (hasChapter) {
                return chapter;
            }
            if (hasSubject) {
                return subject;
            }
            return "Chua xac dinh chuyen de";
        }
    }

    public static class WrongQuestionInsight {

        private final int questionId;
        private final String questionContent;
        private final String topic;
        private final String userAnswer;
        private final String correctAnswer;

        public WrongQuestionInsight(int questionId,
                                    String questionContent,
                                    String topic,
                                    String userAnswer,
                                    String correctAnswer) {
            this.questionId = questionId;
            this.questionContent = questionContent;
            this.topic = topic;
            this.userAnswer = userAnswer;
            this.correctAnswer = correctAnswer;
        }

        public int getQuestionId() {
            return questionId;
        }

        public String getQuestionContent() {
            return questionContent;
        }

        public String getTopic() {
            return topic;
        }

        public String getUserAnswer() {
            return userAnswer;
        }

        public String getCorrectAnswer() {
            return correctAnswer;
        }
    }

    public static class ExamResult {

        private final int attemptId;
        private final String examTitle;
        private final double score;
        private final int correctCount;
        private final int wrongCount;
        private final int skippedCount;
        private final int totalQuestions;
        private final int timeTakenSeconds;
        private final int durationMinutes;
        private final boolean passed;

        public ExamResult(int attemptId, String examTitle, double score,
                          int correctCount, int wrongCount, int skippedCount,
                          int totalQuestions, int timeTakenSeconds,
                          int durationMinutes, boolean passed) {
            this.attemptId = attemptId;
            this.examTitle = examTitle;
            this.score = score;
            this.correctCount = correctCount;
            this.wrongCount = wrongCount;
            this.skippedCount = skippedCount;
            this.totalQuestions = totalQuestions;
            this.timeTakenSeconds = timeTakenSeconds;
            this.durationMinutes = durationMinutes;
            this.passed = passed;
        }

        public int getAttemptId() {
            return attemptId;
        }

        public String getExamTitle() {
            return examTitle;
        }

        public double getScore() {
            return score;
        }

        public int getCorrectCount() {
            return correctCount;
        }

        public int getWrongCount() {
            return wrongCount;
        }

        public int getSkippedCount() {
            return skippedCount;
        }

        public int getTotalQuestions() {
            return totalQuestions;
        }

        public int getTimeTakenSeconds() {
            return timeTakenSeconds;
        }

        public int getDurationMinutes() {
            return durationMinutes;
        }

        public boolean isPassed() {
            return passed;
        }

        public double getAccuracyPercent() {
            if (totalQuestions == 0) {
                return 0;
            }
            return Math.round(((double) correctCount / totalQuestions) * 100.0 * 10.0) / 10.0;
        }

        public String getFormattedTimeTaken() {
            int minutes = timeTakenSeconds / 60;
            int seconds = timeTakenSeconds % 60;
            return String.format("%02d:%02d", minutes, seconds);
        }

        @Override
        public String toString() {
            return "=== KET QUA BAI THI ===\n"
                    + "De thi    : " + examTitle + "\n"
                    + "Diem      : " + score + "/10 " + (passed ? "(DAT)" : "(CHUA DAT)") + "\n"
                    + "Dung/Sai/Bo qua: " + correctCount + "/" + wrongCount + "/" + skippedCount + "\n"
                    + "Ty le dung: " + getAccuracyPercent() + "%\n"
                    + "Thoi gian : " + getFormattedTimeTaken() + " / " + durationMinutes + " phut";
        }
    }
}
