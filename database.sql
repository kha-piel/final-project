-- ============================================================
-- DATABASE: THPTQG AI - Ứng dụng Desktop Thi Trắc Nghiệm
-- Engine  : SQLite (Local Database)
-- Version : 2.0 (Trimmed & Optimized)
-- ============================================================

-- Bật hỗ trợ Foreign Key trong SQLite (mặc định bị tắt)
PRAGMA foreign_keys = ON;

-- ============================================================
-- NHÓM 1: QUẢN LÝ NGƯỜI DÙNG (USER MANAGEMENT)
-- ============================================================

-- -------------------------------------------------------------
-- Bảng: users
-- Mục đích: Lưu thông tin tài khoản cơ bản của học sinh
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    user_id         INTEGER PRIMARY KEY AUTOINCREMENT,
    username        TEXT    NOT NULL,
    password_hash   TEXT    NOT NULL,                    -- bcrypt/argon2 hash
    email           TEXT    NOT NULL,
    full_name       TEXT    NULL,
    phone           TEXT    NULL,
    date_of_birth   TEXT    NULL,                        -- Định dạng ISO 8601: 'YYYY-MM-DD'
    role            TEXT    NOT NULL DEFAULT 'student'
                    CHECK (role IN ('student', 'teacher', 'admin')),
    status          TEXT    NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active', 'inactive', 'banned')),
    created_at      TEXT    NOT NULL DEFAULT (datetime('now', 'localtime')),
    updated_at      TEXT    NOT NULL DEFAULT (datetime('now', 'localtime')),
    last_login_at   TEXT    NULL,

    CONSTRAINT uq_users_username UNIQUE (username),
    CONSTRAINT uq_users_email    UNIQUE (email)
);

-- ============================================================
-- NHÓM 2: NGÂN HÀNG CÂU HỎI (QUESTION BANK)
-- ============================================================

-- -------------------------------------------------------------
-- Bảng: subjects
-- Mục đích: Danh sách môn học
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS subjects (
    subject_id      INTEGER PRIMARY KEY AUTOINCREMENT,
    subject_code    TEXT    NOT NULL,                    -- VD: TOAN, LY, HOA, SINH, VAN, ANH, SU, DIA
    subject_name    TEXT    NOT NULL,                    -- VD: Toán học, Vật Lý, Hóa học
    is_active       INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),

    CONSTRAINT uq_subjects_code UNIQUE (subject_code)
);

-- Dữ liệu mẫu môn học
INSERT INTO subjects (subject_code, subject_name) VALUES
    ('TOAN',  'Toán học'),
    ('LY',    'Vật Lý'),
    ('HOA',   'Hóa học'),
    ('SINH',  'Sinh học'),
    ('VAN',   'Ngữ văn'),
    ('ANH',   'Tiếng Anh'),
    ('SU',    'Lịch Sử'),
    ('DIA',   'Địa lý'),
    ('GDCD',  'Giáo dục Công dân');


-- -------------------------------------------------------------
-- Bảng: topics
-- Mục đích: Chương / Chuyên đề trong từng môn (hỗ trợ lồng nhau)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS topics (
    topic_id        INTEGER PRIMARY KEY AUTOINCREMENT,
    subject_id      INTEGER NOT NULL,
    parent_topic_id INTEGER NULL,                        -- NULL = chương lớn, NOT NULL = bài thuộc chương cha
    topic_name      TEXT    NOT NULL,                    -- VD: Hàm số, Điện xoay chiều, ADN
    topic_order     INTEGER NOT NULL DEFAULT 0,          -- Thứ tự hiển thị trong môn học
    description     TEXT    NULL,
    is_active       INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),

    FOREIGN KEY (subject_id)      REFERENCES subjects(subject_id) ON DELETE RESTRICT,
    FOREIGN KEY (parent_topic_id) REFERENCES topics(topic_id)     ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_topics_subject ON topics(subject_id);
CREATE INDEX IF NOT EXISTS idx_topics_parent  ON topics(parent_topic_id);


-- -------------------------------------------------------------
-- Bảng: questions
-- Mục đích: Ngân hàng câu hỏi trắc nghiệm
-- Cột obsidian_source_path: đường dẫn đến file Markdown trong
--   Obsidian Vault, giúp AI biết cần đọc file nào cho RAG.
--   VD: 'Toan_Hoc/Giai_Tich/toan_tich_phan.md'
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS questions (
    question_id           INTEGER PRIMARY KEY AUTOINCREMENT,
    topic_id              INTEGER NOT NULL,
    content               TEXT    NOT NULL,              -- Nội dung câu hỏi (Markdown/LaTeX)
    image_url             TEXT    NULL,                   -- URL ảnh minh họa (đồ thị, hình vẽ)
    level                 INTEGER NOT NULL DEFAULT 1     -- 1=Nhận biết, 2=Thông hiểu, 3=Vận dụng, 4=VD cao
                          CHECK (level BETWEEN 1 AND 4),
    question_type         TEXT    NOT NULL DEFAULT 'single_choice'
                          CHECK (question_type IN ('single_choice', 'multi_choice', 'true_false', 'fill_blank')),
    year                  INTEGER NULL,                   -- Năm đề thi (nếu lấy từ đề chính thức)
    is_official           INTEGER NOT NULL DEFAULT 0     -- 1 = từ đề minh họa/chính thức Bộ GD&ĐT
                          CHECK (is_official IN (0, 1)),
    source                TEXT    NULL,                   -- VD: 'Đề minh họa 2024', 'Sách BT Cánh Diều'
    obsidian_source_path  TEXT    NULL,                   -- Đường dẫn Obsidian Vault cho RAG
    created_by            INTEGER NULL,                   -- user_id giáo viên tạo (NULL nếu nhập batch)
    is_active             INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
    created_at            TEXT    NOT NULL DEFAULT (datetime('now', 'localtime')),
    updated_at            TEXT    NOT NULL DEFAULT (datetime('now', 'localtime')),

    FOREIGN KEY (topic_id)   REFERENCES topics(topic_id) ON DELETE RESTRICT,
    FOREIGN KEY (created_by) REFERENCES users(user_id)   ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_questions_topic    ON questions(topic_id);
CREATE INDEX IF NOT EXISTS idx_questions_level    ON questions(level);
CREATE INDEX IF NOT EXISTS idx_questions_official ON questions(is_official);
CREATE INDEX IF NOT EXISTS idx_questions_year     ON questions(year);
-- Index tổng hợp tối ưu query: "Tìm câu hỏi theo chuyên đề + mức độ"
CREATE INDEX IF NOT EXISTS idx_q_topic_level      ON questions(topic_id, level, is_active);


-- -------------------------------------------------------------
-- Bảng: answers
-- Mục đích: Các phương án trả lời (A, B, C, D) cho mỗi câu hỏi
--           explanation: AI dùng để giải thích cho học sinh
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS answers (
    answer_id       INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id     INTEGER NOT NULL,
    option_label    TEXT    NOT NULL,                     -- 'A', 'B', 'C', 'D'
    content         TEXT    NOT NULL,                     -- Nội dung phương án (Markdown/LaTeX)
    is_correct      INTEGER NOT NULL DEFAULT 0           -- 1 = Đáp án đúng
                    CHECK (is_correct IN (0, 1)),
    explanation     TEXT    NULL,                         -- Lời giải chi tiết
    display_order   INTEGER NOT NULL DEFAULT 0,          -- Thứ tự hiển thị

    FOREIGN KEY (question_id) REFERENCES questions(question_id) ON DELETE CASCADE,
    CONSTRAINT uq_answers_option UNIQUE (question_id, option_label)
);

CREATE INDEX IF NOT EXISTS idx_answers_question ON answers(question_id);
CREATE INDEX IF NOT EXISTS idx_answers_correct  ON answers(question_id, is_correct);


-- ============================================================
-- NHÓM 3: QUẢN LÝ ĐỀ THI & KẾT QUẢ (EXAM MANAGEMENT)
-- ============================================================

-- -------------------------------------------------------------
-- Bảng: exams
-- Mục đích: Quản lý các bộ đề thi / đề luyện
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS exams (
    exam_id           INTEGER PRIMARY KEY AUTOINCREMENT,
    title             TEXT    NOT NULL,                   -- VD: 'Đề minh họa Toán 2024'
    description       TEXT    NULL,
    subject_id        INTEGER NULL,                       -- NULL nếu đề tổng hợp nhiều môn
    exam_type         TEXT    NOT NULL DEFAULT 'practice'
                      CHECK (exam_type IN ('official_mock', 'practice', 'ai_generated', 'custom')),
    duration          INTEGER NOT NULL DEFAULT 50,        -- Thời gian làm bài (phút)
    total_questions   INTEGER NOT NULL DEFAULT 40,        -- Tổng số câu hỏi trong đề
    pass_score        REAL    NULL DEFAULT 5.00,          -- Điểm đạt tối thiểu (thang 10)
    shuffle_answers   INTEGER NOT NULL DEFAULT 1          -- 1 = Xáo trộn đáp án
                      CHECK (shuffle_answers IN (0, 1)),
    shuffle_questions INTEGER NOT NULL DEFAULT 0          -- 1 = Xáo trộn câu hỏi
                      CHECK (shuffle_questions IN (0, 1)),
    is_public         INTEGER NOT NULL DEFAULT 1 CHECK (is_public IN (0, 1)),
    created_by        INTEGER NULL,
    created_at        TEXT    NOT NULL DEFAULT (datetime('now', 'localtime')),
    updated_at        TEXT    NOT NULL DEFAULT (datetime('now', 'localtime')),

    FOREIGN KEY (subject_id) REFERENCES subjects(subject_id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(user_id)       ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_exams_subject ON exams(subject_id);
CREATE INDEX IF NOT EXISTS idx_exams_type    ON exams(exam_type);


-- -------------------------------------------------------------
-- Bảng: exam_questions
-- Mục đích: Bảng trung gian - gắn câu hỏi vào đề thi (N:N)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS exam_questions (
    exam_id         INTEGER NOT NULL,
    question_id     INTEGER NOT NULL,
    question_order  INTEGER NOT NULL DEFAULT 0,          -- Thứ tự câu hỏi trong đề
    point_weight    REAL    NOT NULL DEFAULT 0.25,        -- Điểm/câu (10đ / 40 câu = 0.25đ)

    PRIMARY KEY (exam_id, question_id),
    FOREIGN KEY (exam_id)     REFERENCES exams(exam_id)         ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(question_id) ON DELETE CASCADE
);


-- -------------------------------------------------------------
-- Bảng: student_attempts
-- Mục đích: Ghi nhận mỗi lần học sinh làm bài thi
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS student_attempts (
    attempt_id        INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id           INTEGER NOT NULL,
    exam_id           INTEGER NOT NULL,
    score             REAL    NULL,                       -- Điểm thang 10 (tính sau khi nộp bài)
    correct_count     INTEGER NULL DEFAULT 0,             -- Số câu đúng
    wrong_count       INTEGER NULL DEFAULT 0,             -- Số câu sai
    skipped_count     INTEGER NULL DEFAULT 0,             -- Số câu bỏ qua
    total_time_taken  INTEGER NULL,                       -- Thời gian thực tế (giây)
    status            TEXT    NOT NULL DEFAULT 'in_progress'
                      CHECK (status IN ('in_progress', 'completed', 'abandoned')),
    started_at        TEXT    NOT NULL DEFAULT (datetime('now', 'localtime')),
    completed_at      TEXT    NULL,                       -- Thời điểm nộp bài
    ai_feedback       TEXT    NULL,                       -- Nhận xét tổng thể của AI

    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (exam_id) REFERENCES exams(exam_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_attempts_user      ON student_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_attempts_exam      ON student_attempts(exam_id);
CREATE INDEX IF NOT EXISTS idx_attempts_status    ON student_attempts(status);
CREATE INDEX IF NOT EXISTS idx_attempts_completed ON student_attempts(completed_at);
-- Index tổng hợp tối ưu query: "Lịch sử thi của user gần nhất"
CREATE INDEX IF NOT EXISTS idx_attempts_user_date ON student_attempts(user_id, completed_at, status);


-- ============================================================
-- NHÓM 4: AI CHATBOT (CHAT SESSIONS & MESSAGES)
-- ============================================================

-- -------------------------------------------------------------
-- Bảng: chat_sessions
-- Mục đích: Mỗi phiên hội thoại của học sinh với AI Chatbot
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS chat_sessions (
    session_id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id             INTEGER NOT NULL,
    title               TEXT    NULL,                     -- Tiêu đề phiên chat (AI tự tạo)
    context_summary     TEXT    NULL,                     -- Tóm tắt bối cảnh (tiết kiệm token)
    related_exam_id     INTEGER NULL,                     -- FK đến đề thi liên quan
    related_attempt_id  INTEGER NULL,                     -- FK đến lần thi liên quan
    total_messages      INTEGER NOT NULL DEFAULT 0,
    status              TEXT    NOT NULL DEFAULT 'active'
                        CHECK (status IN ('active', 'archived')),
    start_time          TEXT    NOT NULL DEFAULT (datetime('now', 'localtime')),
    last_message_at     TEXT    NULL,
    ended_at            TEXT    NULL,

    FOREIGN KEY (user_id)            REFERENCES users(user_id)              ON DELETE CASCADE,
    FOREIGN KEY (related_exam_id)    REFERENCES exams(exam_id)              ON DELETE SET NULL,
    FOREIGN KEY (related_attempt_id) REFERENCES student_attempts(attempt_id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_user     ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_last_msg ON chat_sessions(last_message_at);


-- -------------------------------------------------------------
-- Bảng: chat_messages
-- Mục đích: Lưu toàn bộ lịch sử tin nhắn trong mỗi phiên chat
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS chat_messages (
    message_id            INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id            INTEGER NOT NULL,
    role                  TEXT    NOT NULL                -- 'user' | 'assistant' | 'system'
                          CHECK (role IN ('user', 'assistant', 'system')),
    content               TEXT    NOT NULL,               -- Nội dung tin nhắn
    related_question_id   INTEGER NULL,                   -- FK nếu hỏi về câu hỏi cụ thể
    tokens_used           INTEGER NULL,                   -- Số token AI dùng (tracking chi phí)
    model_used            TEXT    NULL,                   -- VD: 'gemini-1.5-flash', 'gpt-4o'
    created_at            TEXT    NOT NULL DEFAULT (datetime('now', 'localtime')),

    FOREIGN KEY (session_id)          REFERENCES chat_sessions(session_id) ON DELETE CASCADE,
    FOREIGN KEY (related_question_id) REFERENCES questions(question_id)    ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_messages_session      ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_messages_created      ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_session_role ON chat_messages(session_id, role, created_at);
