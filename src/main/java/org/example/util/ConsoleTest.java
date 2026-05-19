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
import java.sql.Statement;
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

    private static final String RESET_FLAG = "--reset-mock";

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

            // Khoi tao schema + du lieu mock (idempotent — an toan khi chay nhieu lan)
            if (shouldResetMockData(args)) {
                initDatabaseMockData(conn);
                System.out.println("[OK] Schema va du lieu mock da san sang.");
            } else {
                System.out.println("[INFO] Bo qua reset mock data. Dang dung du lieu hien co trong database.");
            }

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

    private static boolean shouldResetMockData(String[] args) {
        if (args == null) {
            return false;
        }

        for (String arg : args) {
            if (RESET_FLAG.equalsIgnoreCase(arg)) {
                return true;
            }
        }

        return false;
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

    // =========================================================================
    // INIT DATABASE MOCK DATA — Force Insert (xoa sach roi insert lai)
    // Goi moi lan chay de dam bao du lieu luon nhat quan, dung, day du.
    // =========================================================================

    /**
     * Khoi tao schema va ep chen lai du lieu mock vao database.
     *
     * <p>Chien luoc Force Insert:
     * 1. Tao bang neu chua co (CREATE TABLE IF NOT EXISTS).
     * 2. Xoa sach du lieu cu cua exam_id=1 (DELETE theo thu tu khoa ngoai).
     * 3. Insert lai toan bo: 1 de thi, 3 cau hoi, 12 dap an, 3 dong exam_questions.
     *
     * @param conn ket noi SQLite da mo
     */
    private static void initDatabaseMockData(Connection conn) {
        try (Statement stmt = conn.createStatement()) {

            // ------------------------------------------------------------------
            // 1. TAO BANG (CREATE TABLE IF NOT EXISTS)
            // ------------------------------------------------------------------

            stmt.executeUpdate(
                "CREATE TABLE IF NOT EXISTS exams (" +
                "  exam_id         INTEGER PRIMARY KEY AUTOINCREMENT," +
                "  title           TEXT    NOT NULL," +
                "  description     TEXT," +
                "  subject_id      INTEGER," +
                "  exam_type       TEXT    DEFAULT 'practice'," +
                "  duration        INTEGER NOT NULL DEFAULT 90," +
                "  total_questions INTEGER NOT NULL DEFAULT 0," +
                "  pass_score      REAL    NOT NULL DEFAULT 5.0," +
                "  shuffle_answers   INTEGER NOT NULL DEFAULT 1," +
                "  shuffle_questions INTEGER NOT NULL DEFAULT 1," +
                "  is_public       INTEGER NOT NULL DEFAULT 1," +
                "  created_by      INTEGER," +
                "  created_at      TEXT    DEFAULT (datetime('now'))," +
                "  updated_at      TEXT    DEFAULT (datetime('now'))" +
                ")"
            );

            stmt.executeUpdate(
                "CREATE TABLE IF NOT EXISTS questions (" +
                "  question_id          INTEGER PRIMARY KEY AUTOINCREMENT," +
                "  content              TEXT    NOT NULL," +
                "  subject              TEXT," +
                "  chapter              TEXT," +
                "  difficulty           TEXT    DEFAULT 'NHAN_BIET'," +
                "  question_type        TEXT    DEFAULT 'MULTIPLE_CHOICE'," +
                "  obsidian_source_path TEXT," +
                "  explanation          TEXT," +
                "  created_at           TEXT    DEFAULT (datetime('now'))," +
                "  updated_at           TEXT    DEFAULT (datetime('now'))" +
                ")"
            );

            stmt.executeUpdate(
                "CREATE TABLE IF NOT EXISTS answers (" +
                "  answer_id     INTEGER PRIMARY KEY AUTOINCREMENT," +
                "  question_id   INTEGER NOT NULL," +
                "  option_label  TEXT    NOT NULL," +
                "  content       TEXT    NOT NULL," +
                "  is_correct    INTEGER NOT NULL DEFAULT 0," +
                "  explanation   TEXT," +
                "  display_order INTEGER NOT NULL DEFAULT 0," +
                "  FOREIGN KEY (question_id) REFERENCES questions(question_id)" +
                ")"
            );

            stmt.executeUpdate(
                "CREATE TABLE IF NOT EXISTS exam_questions (" +
                "  exam_id        INTEGER NOT NULL," +
                "  question_id    INTEGER NOT NULL," +
                "  question_order INTEGER NOT NULL DEFAULT 0," +
                "  point_weight   REAL    NOT NULL DEFAULT 0.25," +
                "  PRIMARY KEY (exam_id, question_id)," +
                "  FOREIGN KEY (exam_id)     REFERENCES exams(exam_id)," +
                "  FOREIGN KEY (question_id) REFERENCES questions(question_id)" +
                ")"
            );

            // DROP + CREATE de dam bao cau truc student_attempts luon dung
            stmt.executeUpdate("DROP TABLE IF EXISTS student_attempts");
            stmt.executeUpdate(
                "CREATE TABLE IF NOT EXISTS student_attempts (" +
                "  attempt_id       INTEGER PRIMARY KEY AUTOINCREMENT," +
                "  user_id          INTEGER NOT NULL," +
                "  exam_id          INTEGER NOT NULL," +
                "  status           TEXT    DEFAULT 'in_progress'," +
                "  score            REAL," +
                "  correct_count    INTEGER DEFAULT 0," +
                "  wrong_count      INTEGER DEFAULT 0," +
                "  skipped_count    INTEGER DEFAULT 0," +
                "  total_time_taken INTEGER," +
                "  started_at       TEXT    DEFAULT (datetime('now'))," +
                "  completed_at     TEXT," +
                "  ai_feedback      TEXT," +
                "  FOREIGN KEY (exam_id) REFERENCES exams(exam_id)" +
                ")"
            );

            System.out.println("[DB] 5 bang da duoc tao (hoac da ton tai).");

            // ------------------------------------------------------------------
            // 2. DON DEP DU LIEU CU (theo thu tu phu thuoc khoa ngoai)
            // ------------------------------------------------------------------

            stmt.executeUpdate("DELETE FROM exam_questions WHERE exam_id = 1");
            stmt.executeUpdate("DELETE FROM answers WHERE question_id IN (1, 2, 3)");
            stmt.executeUpdate("DELETE FROM questions WHERE question_id IN (1, 2, 3)");
            stmt.executeUpdate("DELETE FROM exams WHERE exam_id = 1");

            System.out.println("[DB] Da xoa du lieu cu cua exam_id=1.");

            // ------------------------------------------------------------------
            // 3. EP CHEN LAI DU LIEU CHUAN (Force Insert)
            // ------------------------------------------------------------------

            // --- INSERT De thi moi (exam_id = 1) ---
            stmt.executeUpdate(
                "INSERT INTO exams (exam_id, title, description, exam_type, " +
                "duration, total_questions, pass_score, shuffle_answers, shuffle_questions, is_public) " +
                "VALUES (1, 'De thi moi', 'De kiem thu: 3 cau Dao Ham co ban', 'practice', " +
                "30, 3, 5.0, 1, 1, 1)"
            );
            System.out.println("[DB] Da INSERT exam_id=1: 'De thi moi'.");

            // --- INSERT 3 cau hoi Toan hoc (Dao Ham) ---
            stmt.executeUpdate(
                "INSERT INTO questions (question_id, content, subject, chapter, difficulty, " +
                "question_type, obsidian_source_path) VALUES " +
                "(1, 'Dao ham cua ham so f(x) = x^2 la gi?', " +
                "'Toan', 'Dao Ham', 'NHAN_BIET', 'MULTIPLE_CHOICE', 'Toan_Hoc/Dao_Ham.md')"
            );
            stmt.executeUpdate(
                "INSERT INTO questions (question_id, content, subject, chapter, difficulty, " +
                "question_type, obsidian_source_path) VALUES " +
                "(2, 'Dao ham cua ham so f(x) = sin(x) la gi?', " +
                "'Toan', 'Dao Ham', 'THONG_HIEU', 'MULTIPLE_CHOICE', 'Toan_Hoc/Dao_Ham.md')"
            );
            stmt.executeUpdate(
                "INSERT INTO questions (question_id, content, subject, chapter, difficulty, " +
                "question_type, obsidian_source_path) VALUES " +
                "(3, 'Ham so f(x) = x^3 - 3x dong bien tren khoang nao?', " +
                "'Toan', 'Dao Ham', 'VAN_DUNG', 'MULTIPLE_CHOICE', 'Toan_Hoc/Dao_Ham.md')"
            );
            System.out.println("[DB] Da INSERT 3 cau hoi Dao Ham.");

            // --- INSERT 12 dap an (4 dap an / cau) ---
            // Cau 1: dap an dung = answer_id 2 (f'(x) = 2x)
            stmt.executeUpdate(
                "INSERT INTO answers (answer_id, question_id, option_label, content, is_correct, display_order) VALUES" +
                " (1,  1, 'A', 'f''(x) = x',   0, 1)," +
                " (2,  1, 'B', 'f''(x) = 2x',  1, 2)," +
                " (3,  1, 'C', 'f''(x) = x^2', 0, 3)," +
                " (4,  1, 'D', 'f''(x) = 2',   0, 4)"
            );
            // Cau 2: dap an dung = answer_id 6 (f'(x) = cos(x))
            stmt.executeUpdate(
                "INSERT INTO answers (answer_id, question_id, option_label, content, is_correct, display_order) VALUES" +
                " (5,  2, 'A', 'f''(x) = -sin(x)', 0, 1)," +
                " (6,  2, 'B', 'f''(x) = cos(x)',  1, 2)," +
                " (7,  2, 'C', 'f''(x) = tan(x)',  0, 3)," +
                " (8,  2, 'D', 'f''(x) = sin(x)',  0, 4)"
            );
            // Cau 3: dap an dung = answer_id 11 ((-inf;-1) va (1;+inf))
            stmt.executeUpdate(
                "INSERT INTO answers (answer_id, question_id, option_label, content, is_correct, display_order) VALUES" +
                " (9,  3, 'A', '(-inf; -1)',                    0, 1)," +
                " (10, 3, 'B', '(-1; 1)',                       0, 2)," +
                " (11, 3, 'C', '(-inf; -1) va (1; +inf)',       1, 3)," +
                " (12, 3, 'D', '(1; +inf)',                     0, 4)"
            );
            System.out.println("[DB] Da INSERT 12 dap an (4 dap an / cau).");

            // --- QUAN TRONG NHAT: Lien ket 3 cau hoi vao de thi (exam_questions) ---
            stmt.executeUpdate(
                "INSERT INTO exam_questions (exam_id, question_id, question_order, point_weight) VALUES" +
                " (1, 1, 1, 0.34)," +
                " (1, 2, 2, 0.33)," +
                " (1, 3, 3, 0.33)"
            );
            System.out.println("[DB] Da lien ket 3 cau vao exam_id=1 trong bang exam_questions.");

            System.out.println("[DB] Da nap lai toan bo du lieu moi thanh cong!");

        } catch (Exception e) {
            System.err.println("[DB ERROR] initDatabaseMockData that bai: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
