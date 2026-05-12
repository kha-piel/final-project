package org.example.util;

import org.example.controller.ExamController;
import org.example.controller.ExamController.ExamResult;
import org.example.controller.ExamController.QuestionSnapshot;
import org.example.dao.AnswerDAO;
import org.example.dao.ExamDAO;
import org.example.dao.QuestionDAO;
import org.example.dao.StudentAttemptDAO;
import org.example.model.Answer;
import org.example.service.AiServiceClient;

import java.sql.Connection;
import java.util.List;

/**
 * ConsoleTest — Hoc sinh ao chay kiem thu xuyen suot luong ung dung.
 *
 * <p>Luong chay tu dong:
 * 1. Khoi tao ExamController + AiServiceClient
 * 2. Bat dau thi (exam_id=1, user_id=1)
 * 3. Gia lap lam bai (hardcode chon dap an, co tinh chon sai 1 cau)
 * 4. Nop bai va in ket qua
 * 5. Goi AI giai thich cau sai
 *
 * <p>KHONG yeu cau nhap lieu tu ban phim (Scanner).
 */
public class ConsoleTest {

    // =========================================================================
    // Ky tu trang tri console
    // =========================================================================
    private static final String LINE   = "═══════════════════════════════════════════════════════════════";
    private static final String DASHES = "───────────────────────────────────────────────────────────────";
    private static final String STAR   = "★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★";

    public static void main(String[] args) {
        try {
            // =================================================================
            // BUOC 0: BANNER KHOI DONG
            // =================================================================
            System.out.println();
            System.out.println(STAR);
            System.out.println("★                                                             ★");
            System.out.println("★         CONSOLE TEST — HOC SINH AO LAM BAI THI             ★");
            System.out.println("★         Kiem thu xuyen suot: Start → Lam bai → Nop → AI    ★");
            System.out.println("★                                                             ★");
            System.out.println(STAR);
            System.out.println();

            // =================================================================
            // BUOC 1: KHOI TAO DEPENDENCIES
            // =================================================================
            printSectionHeader("BUOC 1: KHOI TAO HE THONG");

            Connection conn = DatabaseConnection.getInstance();
            System.out.println("[OK] Ket noi Database thanh cong: " + conn.getMetaData().getURL());

            ExamDAO examDAO = new ExamDAO(conn);
            QuestionDAO questionDAO = new QuestionDAO(conn);
            AnswerDAO answerDAO = new AnswerDAO(conn);
            StudentAttemptDAO studentAttemptDAO = new StudentAttemptDAO(conn);

            ExamController examController = new ExamController(
                    examDAO, questionDAO, answerDAO, studentAttemptDAO
            );
            System.out.println("[OK] ExamController da khoi tao.");

            AiServiceClient aiServiceClient = new AiServiceClient();
            System.out.println("[OK] AiServiceClient da khoi tao (target: http://localhost:8000).");
            System.out.println();

            // =================================================================
            // BUOC 2: BAT DAU THI (exam_id=1, user_id=1)
            // =================================================================
            printSectionHeader("BUOC 2: BAT DAU PHIEN THI");

            int examId = 1;
            int userId = 1;
            System.out.println(">> Goi examController.startExam(" + examId + ", " + userId + ")...");
            System.out.println();

            boolean started = examController.startExam(examId, userId);
            if (!started) {
                System.err.println("[FAIL] Khong the bat dau phien thi! Kiem tra DB va exam_id.");
                return;
            }
            System.out.println("[OK] Phien thi da bat dau thanh cong!");
            System.out.println();

            // --- In danh sach cau hoi da xao tron (kiem chung Fisher-Yates) ---
            List<QuestionSnapshot> questions = examController.getExamQuestions();

            printSectionHeader("DANH SACH CAU HOI (DA XAO TRON — Fisher-Yates)");
            System.out.println("Tong so cau hoi: " + questions.size());
            System.out.println();

            String[] labels = {"A", "B", "C", "D"};
            for (int i = 0; i < questions.size(); i++) {
                QuestionSnapshot qs = questions.get(i);
                System.out.println(DASHES);
                System.out.println("  Cau " + (i + 1) + " [ID=" + qs.getQuestionId() + "]: "
                        + qs.getQuestionContent());
                System.out.println("  Obsidian: " + qs.getObsidianSourcePath());
                System.out.println();

                List<Answer> answers = qs.getShuffledAnswers();
                for (int j = 0; j < answers.size(); j++) {
                    Answer a = answers.get(j);
                    String marker = (a.getAnswerId() == qs.getCorrectAnswerId()) ? " ✓" : "";
                    System.out.println("     " + labels[j] + ". " + a.getContent()
                            + "  [answer_id=" + a.getAnswerId() + "]" + marker);
                }
                System.out.println();
            }

            // =================================================================
            // BUOC 3: GIA LAP LAM BAI (Hardcode chon dap an)
            // =================================================================
            printSectionHeader("BUOC 3: GIA LAP LAM BAI (HARDCODE)");

            // Chien luoc: Cau 1 chon SAI (chon dap an dau tien trong list xao tron
            // ma KHONG phai dap an dung), Cau 2 & 3 chon DUNG.
            for (int i = 0; i < questions.size(); i++) {
                QuestionSnapshot qs = questions.get(i);
                List<Answer> answers = qs.getShuffledAnswers();
                int selectedAnswerId;

                if (i == 0) {
                    // === CO TINH CHON SAI cau dau tien ===
                    // Tim dap an SAI dau tien trong danh sach da xao tron
                    selectedAnswerId = -1;
                    for (Answer a : answers) {
                        if (a.getAnswerId() != qs.getCorrectAnswerId()) {
                            selectedAnswerId = a.getAnswerId();
                            break;
                        }
                    }
                    if (selectedAnswerId == -1) {
                        // Truong hop bat thuong: tat ca dap an deu la dung (!)
                        selectedAnswerId = answers.get(0).getAnswerId();
                    }
                } else {
                    // === CHON DUNG cau 2 va 3 ===
                    selectedAnswerId = qs.getCorrectAnswerId();
                }

                examController.selectAnswer(qs.getQuestionId(), selectedAnswerId);

                // Tim noi dung dap an da chon de in ra
                String selectedContent = "";
                for (Answer a : answers) {
                    if (a.getAnswerId() == selectedAnswerId) {
                        selectedContent = a.getContent();
                        break;
                    }
                }

                boolean isCorrect = (selectedAnswerId == qs.getCorrectAnswerId());
                System.out.println("  Cau " + (i + 1) + " [Q_ID=" + qs.getQuestionId() + "]: "
                        + "Chon answer_id=" + selectedAnswerId
                        + " (\"" + selectedContent + "\")"
                        + (isCorrect ? "  --> DUNG ✓" : "  --> SAI ✗ (co tinh)"));
            }
            System.out.println();

            // =================================================================
            // BUOC 4: NOP BAI VA IN KET QUA
            // =================================================================
            printSectionHeader("BUOC 4: NOP BAI THI");

            System.out.println(">> Goi examController.submitExam()...");
            System.out.println();

            ExamResult result = examController.submitExam();

            // In ket qua dep
            System.out.println(LINE);
            System.out.println("║              === KET QUA THI ===                            ║");
            System.out.println(LINE);
            System.out.println("║  De thi      : " + padRight(result.getExamTitle(), 46) + "║");
            System.out.println("║  Diem so     : " + padRight(result.getScore() + "/10 "
                    + (result.isPassed() ? "(DAT ✓)" : "(CHUA DAT ✗)"), 46) + "║");
            System.out.println("║  So cau DUNG : " + padRight(String.valueOf(result.getCorrectCount()), 46) + "║");
            System.out.println("║  So cau SAI  : " + padRight(String.valueOf(result.getWrongCount()), 46) + "║");
            System.out.println("║  Bo qua      : " + padRight(String.valueOf(result.getSkippedCount()), 46) + "║");
            System.out.println("║  Ty le dung  : " + padRight(result.getAccuracyPercent() + "%", 46) + "║");
            System.out.println("║  Thoi gian   : " + padRight(result.getFormattedTimeTaken()
                    + " / " + result.getDurationMinutes() + " phut", 46) + "║");
            System.out.println(LINE);
            System.out.println();

            // =================================================================
            // BUOC 5: GOI AI GIAI THICH CAU SAI
            // =================================================================
            printSectionHeader("BUOC 5: GOI AI GIAI THICH CAU SAI");

            // Tim cau hoi ma hoc sinh lam sai
            QuestionSnapshot wrongQuestion = null;
            int wrongSelectedAnswerId = -1;

            for (QuestionSnapshot qs : questions) {
                int selectedId = examController.getSelectedAnswerId(qs.getQuestionId());
                if (selectedId != -1 && selectedId != qs.getCorrectAnswerId()) {
                    wrongQuestion = qs;
                    wrongSelectedAnswerId = selectedId;
                    break;
                }
            }

            if (wrongQuestion == null) {
                System.out.println("[INFO] Hoc sinh khong lam sai cau nao! Khong can goi AI.");
            } else {
                // Lay noi dung cau hoi
                String questionContent = wrongQuestion.getQuestionContent();

                // Lay noi dung dap an hoc sinh da chon (sai)
                String studentAnswer = "";
                for (Answer a : wrongQuestion.getShuffledAnswers()) {
                    if (a.getAnswerId() == wrongSelectedAnswerId) {
                        studentAnswer = a.getContent();
                        break;
                    }
                }

                // Lay noi dung dap an dung
                String correctAnswer = "";
                for (Answer a : wrongQuestion.getShuffledAnswers()) {
                    if (a.getAnswerId() == wrongQuestion.getCorrectAnswerId()) {
                        correctAnswer = a.getContent();
                        break;
                    }
                }

                // Lay obsidian_source_path
                String obsidianPath = wrongQuestion.getObsidianSourcePath();

                System.out.println("  Cau sai    : " + questionContent);
                System.out.println("  HS da chon : " + studentAnswer + "  (SAI ✗)");
                System.out.println("  Dap an dung: " + correctAnswer + "  (DUNG ✓)");
                System.out.println("  Obsidian   : " + obsidianPath);
                System.out.println();
                System.out.println(">> Goi aiServiceClient.getExplanation(...)...");
                System.out.println(">> Dang cho AI Gemini xu ly (co the mat vai giay)...");
                System.out.println();

                // Goi API
                String explanation = aiServiceClient.getExplanation(
                        questionContent,
                        studentAnswer,
                        correctAnswer,
                        obsidianPath
                );

                // In loi giai thich voi khung noi bat
                System.out.println(STAR);
                System.out.println("★              LOI GIAI THICH TU AI (Gemini)                  ★");
                System.out.println(STAR);
                System.out.println();
                System.out.println(explanation);
                System.out.println();
                System.out.println(STAR);
            }

            // =================================================================
            // HOAN TAT
            // =================================================================
            System.out.println();
            printSectionHeader("KIEM THU HOAN TAT");
            System.out.println("[OK] Toan bo luong da chay thanh cong tu dau den cuoi!");
            System.out.println("[OK] Start --> Lam bai --> Nop bai --> AI Giai thich");
            System.out.println();

            // Dong ket noi DB
            DatabaseConnection.closeConnection();
            System.out.println("[OK] Da dong ket noi Database.");

        } catch (Exception e) {
            System.err.println();
            System.err.println(LINE);
            System.err.println("  [FATAL ERROR] Luong chay bi gay!");
            System.err.println(LINE);
            e.printStackTrace();
        }
    }

    // =========================================================================
    // HELPER METHODS
    // =========================================================================

    /** In header section voi khung trang tri */
    private static void printSectionHeader(String title) {
        System.out.println(LINE);
        System.out.println("  " + title);
        System.out.println(LINE);
    }

    /** Pad chuoi ben phai de can le trong khung */
    private static String padRight(String text, int width) {
        if (text.length() >= width) return text;
        return text + " ".repeat(width - text.length());
    }
}
