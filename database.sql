-- ============================================================
--  DATABASE: THPTQG AI EXAM PREP SYSTEM
--  Phần mềm ôn thi THPT Quốc Gia có tích hợp AI
--  Version: 1.0.0
--  Encoding: UTF-8
-- ============================================================

CREATE DATABASE IF NOT EXISTS thptqg_ai_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE thptqg_ai_db;

-- ============================================================
-- NHÓM 1: QUẢN LÝ NGƯỜI DÙNG (USER MANAGEMENT)
-- ============================================================

-- -------------------------------------------------------------
-- Bảng: users
-- Mục đích: Lưu thông tin tài khoản cơ bản của học sinh
-- -------------------------------------------------------------
CREATE TABLE users (
    user_id         CHAR(36)        NOT NULL DEFAULT (UUID()),   -- UUID làm PK
    username        VARCHAR(50)     NOT NULL,
    password_hash   VARCHAR(255)    NOT NULL,                    -- bcrypt/argon2 hash
    email           VARCHAR(100)    NOT NULL,
    full_name       VARCHAR(100)    NULL,
    phone           VARCHAR(15)     NULL,
    date_of_birth   DATE            NULL,
    target_block    ENUM('A00','A01','A02','B00','C00','D01','D07','D14') NULL  -- Khối thi mục tiêu
                    COMMENT 'Khối thi: A00=Toán+Lý+Hóa, A01=Toán+Lý+Anh, B00=Toán+Hóa+Sinh...',
    target_score    DECIMAL(4,2)    NULL                         -- Điểm mục tiêu (VD: 27.50)
                    COMMENT 'Điểm tổng 3 môn mục tiêu, tối đa 30.00',
    avatar_url      VARCHAR(500)    NULL,
    role            ENUM('student','teacher','admin') NOT NULL DEFAULT 'student',
    status          ENUM('active','inactive','banned') NOT NULL DEFAULT 'active',
    email_verified  TINYINT(1)      NOT NULL DEFAULT 0,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login_at   DATETIME        NULL,

    CONSTRAINT pk_users             PRIMARY KEY (user_id),
    CONSTRAINT uq_users_username    UNIQUE (username),
    CONSTRAINT uq_users_email       UNIQUE (email),
    CONSTRAINT chk_target_score     CHECK (target_score BETWEEN 0 AND 30)
) ENGINE=InnoDB COMMENT='Tài khoản người dùng hệ thống';


-- -------------------------------------------------------------
-- Bảng: user_profiles
-- Mục đích: Lưu chi tiết sở thích học tập & điểm yếu
--           AI sẽ đọc bảng này để đưa ra lời khuyên cá nhân hóa
-- -------------------------------------------------------------
CREATE TABLE user_profiles (
    profile_id              INT             NOT NULL AUTO_INCREMENT,
    user_id                 CHAR(36)        NOT NULL,
    study_style             ENUM('visual','auditory','reading','kinesthetic') NULL
                            COMMENT 'Phong cách học tập của học sinh',
    daily_study_hours       TINYINT         NULL DEFAULT 2          -- Số giờ học mục tiêu/ngày
                            COMMENT 'Số giờ học mục tiêu mỗi ngày',
    preferred_difficulty    TINYINT         NULL DEFAULT 2          -- Mức độ câu hỏi ưu thích
                            COMMENT '1=Dễ, 2=TB, 3=Khó, 4=Rất khó',

    -- Điểm yếu theo môn (AI đọc để đề xuất ôn luyện)
    weak_topic_ids          JSON            NULL
                            COMMENT 'Mảng topic_id mà học sinh đang yếu (error_rate > 50%)',
    strong_topic_ids        JSON            NULL
                            COMMENT 'Mảng topic_id mà học sinh đang mạnh (accuracy > 80%)',

    -- Thống kê tổng quan (AI cập nhật sau mỗi bài thi)
    total_questions_done    INT             NOT NULL DEFAULT 0,
    total_correct_answers   INT             NOT NULL DEFAULT 0,
    overall_accuracy_rate   DECIMAL(5,2)    NULL
                            COMMENT 'Tỉ lệ trả lời đúng tổng thể (%)',

    -- Lịch học & thông báo
    exam_date               DATE            NULL
                            COMMENT 'Ngày thi dự kiến của học sinh',
    ai_last_analyzed_at     DATETIME        NULL
                            COMMENT 'Lần cuối AI phân tích hồ sơ này',
    ai_recommendation_note  TEXT            NULL
                            COMMENT 'Ghi chú/lời khuyên lần cuối của AI',

    created_at              DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT pk_user_profiles     PRIMARY KEY (profile_id),
    CONSTRAINT fk_user_profiles_uid FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT uq_user_profiles_uid UNIQUE (user_id)
) ENGINE=InnoDB COMMENT='Hồ sơ học tập chi tiết - nguồn dữ liệu AI cá nhân hóa';


-- ============================================================
-- NHÓM 2: NGÂN HÀNG CÂU HỎI (QUESTION BANK)
-- ============================================================

-- -------------------------------------------------------------
-- Bảng: subjects
-- Mục đích: Danh sách môn học
-- -------------------------------------------------------------
CREATE TABLE subjects (
    subject_id      TINYINT         NOT NULL AUTO_INCREMENT,
    subject_code    VARCHAR(10)     NOT NULL                    -- VD: TOAN, LY, HOA, SINH, VAN, ANH, SU, DIA
                    COMMENT 'Mã môn học viết tắt',
    subject_name    VARCHAR(50)     NOT NULL                    -- VD: Toán học, Vật Lý, Hóa học
                    COMMENT 'Tên môn học đầy đủ',
    subject_color   VARCHAR(7)      NULL                        -- Hex color dùng cho UI (#FF6B6B)
                    COMMENT 'Màu sắc đại diện môn học (HEX color)',
    subject_icon    VARCHAR(100)    NULL                        -- Icon class hoặc URL
                    COMMENT 'Icon đại diện cho môn học',
    is_active       TINYINT(1)      NOT NULL DEFAULT 1,

    CONSTRAINT pk_subjects          PRIMARY KEY (subject_id),
    CONSTRAINT uq_subjects_code     UNIQUE (subject_code)
) ENGINE=InnoDB COMMENT='Danh sách các môn thi THPTQG';

-- Dữ liệu mẫu môn học
INSERT INTO subjects (subject_code, subject_name, subject_color) VALUES
    ('TOAN',  'Toán học',         '#3B82F6'),
    ('LY',    'Vật Lý',           '#F59E0B'),
    ('HOA',   'Hóa học',          '#10B981'),
    ('SINH',  'Sinh học',         '#84CC16'),
    ('VAN',   'Ngữ văn',          '#EC4899'),
    ('ANH',   'Tiếng Anh',        '#8B5CF6'),
    ('SU',    'Lịch Sử',          '#EF4444'),
    ('DIA',   'Địa lý',           '#06B6D4'),
    ('GDCD',  'Giáo dục Công dân','#F97316');


-- -------------------------------------------------------------
-- Bảng: topics
-- Mục đích: Chương / Chuyên đề trong từng môn
-- -------------------------------------------------------------
CREATE TABLE topics (
    topic_id        INT             NOT NULL AUTO_INCREMENT,
    subject_id      TINYINT         NOT NULL,
    parent_topic_id INT             NULL                        -- Cho phép topic lồng nhau (Chương > Bài)
                    COMMENT 'NULL = chương lớn, NOT NULL = bài thuộc chương cha',
    topic_name      VARCHAR(200)    NOT NULL                    -- VD: Hàm số, Điện xoay chiều, ADN
                    COMMENT 'Tên chương/chuyên đề',
    topic_order     SMALLINT        NOT NULL DEFAULT 0
                    COMMENT 'Thứ tự hiển thị trong môn học',
    description     TEXT            NULL,
    is_active       TINYINT(1)      NOT NULL DEFAULT 1,

    CONSTRAINT pk_topics            PRIMARY KEY (topic_id),
    CONSTRAINT fk_topics_subject    FOREIGN KEY (subject_id)      REFERENCES subjects(subject_id) ON DELETE RESTRICT,
    CONSTRAINT fk_topics_parent     FOREIGN KEY (parent_topic_id) REFERENCES topics(topic_id)     ON DELETE SET NULL,
    INDEX idx_topics_subject        (subject_id),
    INDEX idx_topics_parent         (parent_topic_id)
) ENGINE=InnoDB COMMENT='Chương và chuyên đề theo từng môn học';


-- -------------------------------------------------------------
-- Bảng: questions
-- Mục đích: Ngân hàng câu hỏi trắc nghiệm
--           Thiết kế để AI có thể Query chính xác theo chuyên đề
-- -------------------------------------------------------------
CREATE TABLE questions (
    question_id     INT             NOT NULL AUTO_INCREMENT,
    topic_id        INT             NOT NULL,
    content         MEDIUMTEXT      NOT NULL                    -- Hỗ trợ HTML/Markdown/LaTeX
                    COMMENT 'Nội dung câu hỏi, hỗ trợ LaTeX ($$ $$) và Markdown',
    image_url       VARCHAR(500)    NULL
                    COMMENT 'URL ảnh minh họa (nếu câu hỏi có hình vẽ/đồ thị)',
    level           TINYINT         NOT NULL DEFAULT 1
                    COMMENT '1=Nhận biết, 2=Thông hiểu, 3=Vận dụng, 4=Vận dụng cao',
    question_type   ENUM('single_choice','multi_choice','true_false','fill_blank') NOT NULL DEFAULT 'single_choice'
                    COMMENT 'Loại câu hỏi (theo cấu trúc đề 2025)',
    year            SMALLINT        NULL
                    COMMENT 'Năm của đề thi (nếu lấy từ đề chính thức)',
    is_official     TINYINT(1)      NOT NULL DEFAULT 0
                    COMMENT '1 = Câu lấy từ đề minh họa/đề chính thức của Bộ GD&ĐT',
    source          VARCHAR(200)    NULL
                    COMMENT 'Nguồn câu hỏi: "Đề minh họa 2024", "Sách BT Cánh Diều"...',
    created_by      CHAR(36)        NULL                        -- user_id của giáo viên tạo
                    COMMENT 'ID giáo viên tạo câu hỏi (NULL nếu nhập batch)',
    view_count      INT             NOT NULL DEFAULT 0,
    is_active       TINYINT(1)      NOT NULL DEFAULT 1,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT pk_questions         PRIMARY KEY (question_id),
    CONSTRAINT fk_questions_topic   FOREIGN KEY (topic_id)   REFERENCES topics(topic_id)   ON DELETE RESTRICT,
    CONSTRAINT fk_questions_creator FOREIGN KEY (created_by) REFERENCES users(user_id)     ON DELETE SET NULL,
    CONSTRAINT chk_question_level   CHECK (level BETWEEN 1 AND 4),
    INDEX idx_questions_topic       (topic_id),
    INDEX idx_questions_level       (level),
    INDEX idx_questions_official    (is_official),
    INDEX idx_questions_year        (year)
) ENGINE=InnoDB COMMENT='Ngân hàng câu hỏi trắc nghiệm THPTQG';


-- -------------------------------------------------------------
-- Bảng: answers
-- Mục đích: Các phương án trả lời (A,B,C,D) cho mỗi câu hỏi
--           explanation là "thức ăn" cho AI giải thích cho học sinh
-- -------------------------------------------------------------
CREATE TABLE answers (
    answer_id       INT             NOT NULL AUTO_INCREMENT,
    question_id     INT             NOT NULL,
    option_label    CHAR(1)         NOT NULL                    -- 'A', 'B', 'C', 'D'
                    COMMENT 'Nhãn đáp án: A, B, C hoặc D',
    content         MEDIUMTEXT      NOT NULL                    -- Hỗ trợ LaTeX
                    COMMENT 'Nội dung phương án, hỗ trợ LaTeX và Markdown',
    is_correct      TINYINT(1)      NOT NULL DEFAULT 0
                    COMMENT '1 = Đây là đáp án đúng',
    explanation     MEDIUMTEXT      NULL
                    COMMENT 'Lời giải chi tiết (AI dùng để giải thích cho học sinh)',
    display_order   TINYINT         NOT NULL DEFAULT 0
                    COMMENT 'Thứ tự hiển thị phương án',

    CONSTRAINT pk_answers           PRIMARY KEY (answer_id),
    CONSTRAINT fk_answers_question  FOREIGN KEY (question_id) REFERENCES questions(question_id) ON DELETE CASCADE,
    CONSTRAINT uq_answers_option    UNIQUE (question_id, option_label),
    INDEX idx_answers_question      (question_id),
    INDEX idx_answers_correct       (question_id, is_correct)
) ENGINE=InnoDB COMMENT='Phương án trả lời A/B/C/D kèm lời giải chi tiết';


-- ============================================================
-- NHÓM 3: THI & LUYỆN TẬP (EXAMS & RESULTS)
-- ============================================================

-- -------------------------------------------------------------
-- Bảng: exams
-- Mục đích: Quản lý các bộ đề thi / đề luyện
-- -------------------------------------------------------------
CREATE TABLE exams (
    exam_id         INT             NOT NULL AUTO_INCREMENT,
    title           VARCHAR(255)    NOT NULL
                    COMMENT 'Tiêu đề đề thi: "Đề minh họa Toán 2024", "Đề luyện Vật Lý Ch.3"',
    description     TEXT            NULL,
    subject_id      TINYINT         NULL                        -- NULL nếu đề tổng hợp nhiều môn
                    COMMENT 'NULL nếu đề thi tổng hợp nhiều môn (VD: đề khối)',
    exam_type       ENUM('official_mock','practice','ai_generated','custom') NOT NULL DEFAULT 'practice'
                    COMMENT 'official_mock=Đề minh họa Bộ, practice=Luyện tập, ai_generated=AI tạo, custom=GV tạo',
    duration        SMALLINT        NOT NULL DEFAULT 50
                    COMMENT 'Thời gian làm bài (phút)',
    total_questions TINYINT         NOT NULL DEFAULT 40
                    COMMENT 'Tổng số câu hỏi trong đề',
    pass_score      DECIMAL(4,2)    NULL DEFAULT 5.00
                    COMMENT 'Điểm đạt tối thiểu (thang 10)',
    shuffle_answers TINYINT(1)      NOT NULL DEFAULT 1
                    COMMENT '1 = Xáo trộn đáp án khi thi',
    shuffle_questions TINYINT(1)    NOT NULL DEFAULT 0
                    COMMENT '1 = Xáo trộn thứ tự câu hỏi',
    is_public       TINYINT(1)      NOT NULL DEFAULT 1,
    created_by      CHAR(36)        NULL,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT pk_exams             PRIMARY KEY (exam_id),
    CONSTRAINT fk_exams_subject     FOREIGN KEY (subject_id)  REFERENCES subjects(subject_id) ON DELETE SET NULL,
    CONSTRAINT fk_exams_creator     FOREIGN KEY (created_by)  REFERENCES users(user_id)       ON DELETE SET NULL,
    INDEX idx_exams_subject         (subject_id),
    INDEX idx_exams_type            (exam_type)
) ENGINE=InnoDB COMMENT='Quản lý đề thi và bộ câu hỏi luyện tập';


-- -------------------------------------------------------------
-- Bảng: exam_questions
-- Mục đích: Bảng trung gian - gắn câu hỏi vào đề thi
-- -------------------------------------------------------------
CREATE TABLE exam_questions (
    exam_id         INT             NOT NULL,
    question_id     INT             NOT NULL,
    question_order  SMALLINT        NOT NULL DEFAULT 0
                    COMMENT 'Thứ tự câu hỏi trong đề thi',
    point_weight    DECIMAL(4,2)    NOT NULL DEFAULT 0.25
                    COMMENT 'Điểm của câu (default: 10đ / 40 câu = 0.25đ/câu)',

    CONSTRAINT pk_exam_questions      PRIMARY KEY (exam_id, question_id),
    CONSTRAINT fk_eq_exam             FOREIGN KEY (exam_id)     REFERENCES exams(exam_id)     ON DELETE CASCADE,
    CONSTRAINT fk_eq_question         FOREIGN KEY (question_id) REFERENCES questions(question_id) ON DELETE CASCADE
) ENGINE=InnoDB COMMENT='Bảng trung gian: Đề thi <-> Câu hỏi';


-- -------------------------------------------------------------
-- Bảng: student_attempts
-- Mục đích: Ghi nhận mỗi lần học sinh làm bài thi
-- -------------------------------------------------------------
CREATE TABLE student_attempts (
    attempt_id          INT             NOT NULL AUTO_INCREMENT,
    user_id             CHAR(36)        NOT NULL,
    exam_id             INT             NOT NULL,
    score               DECIMAL(4,2)    NULL                    -- Điểm sau khi nộp bài
                        COMMENT 'Điểm số thang 10, tính sau khi user nộp bài',
    correct_count       SMALLINT        NULL DEFAULT 0
                        COMMENT 'Số câu trả lời đúng',
    wrong_count         SMALLINT        NULL DEFAULT 0
                        COMMENT 'Số câu trả lời sai',
    skipped_count       SMALLINT        NULL DEFAULT 0
                        COMMENT 'Số câu bỏ qua',
    total_time_taken    SMALLINT        NULL
                        COMMENT 'Thời gian thực tế làm bài (giây)',
    status              ENUM('in_progress','completed','abandoned') NOT NULL DEFAULT 'in_progress'
                        COMMENT 'Trạng thái bài: in_progress=đang làm, completed=đã nộp',
    started_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at        DATETIME        NULL
                        COMMENT 'Thời điểm nộp bài',
    ai_feedback         TEXT            NULL
                        COMMENT 'Nhận xét tổng thể của AI sau khi nộp bài',

    CONSTRAINT pk_student_attempts      PRIMARY KEY (attempt_id),
    CONSTRAINT fk_attempts_user         FOREIGN KEY (user_id)  REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_attempts_exam         FOREIGN KEY (exam_id)  REFERENCES exams(exam_id) ON DELETE CASCADE,
    INDEX idx_attempts_user             (user_id),
    INDEX idx_attempts_exam             (exam_id),
    INDEX idx_attempts_status           (status),
    INDEX idx_attempts_completed        (completed_at)
) ENGINE=InnoDB COMMENT='Lịch sử các lần làm bài thi của học sinh';


-- -------------------------------------------------------------
-- Bảng: attempt_details
-- Mục đích: Chi tiết từng câu học sinh chọn trong 1 lần thi
--           AI quét bảng này để phân tích điểm yếu theo topic
-- -------------------------------------------------------------
CREATE TABLE attempt_details (
    detail_id               BIGINT          NOT NULL AUTO_INCREMENT,
    attempt_id              INT             NOT NULL,
    question_id             INT             NOT NULL,
    selected_answer_id      INT             NULL                -- NULL nếu học sinh bỏ qua
                            COMMENT 'ID đáp án học sinh chọn, NULL nếu bỏ qua',
    is_correct              TINYINT(1)      NOT NULL DEFAULT 0
                            COMMENT '1 = Học sinh trả lời đúng',
    time_spent_seconds      SMALLINT        NULL
                            COMMENT 'Thời gian học sinh dừng ở câu này (giây)',
    answered_at             DATETIME        NULL
                            COMMENT 'Thời điểm học sinh chọn đáp án',

    CONSTRAINT pk_attempt_details       PRIMARY KEY (detail_id),
    CONSTRAINT fk_details_attempt       FOREIGN KEY (attempt_id)         REFERENCES student_attempts(attempt_id) ON DELETE CASCADE,
    CONSTRAINT fk_details_question      FOREIGN KEY (question_id)        REFERENCES questions(question_id)       ON DELETE CASCADE,
    CONSTRAINT fk_details_answer        FOREIGN KEY (selected_answer_id) REFERENCES answers(answer_id)           ON DELETE SET NULL,
    CONSTRAINT uq_attempt_question      UNIQUE (attempt_id, question_id),
    INDEX idx_details_attempt           (attempt_id),
    INDEX idx_details_question          (question_id),
    INDEX idx_details_correct           (is_correct)
) ENGINE=InnoDB COMMENT='Chi tiết từng câu trả lời trong 1 lần thi - nguồn phân tích AI';


-- ============================================================
-- NHÓM 4: THỐNG KÊ TỔNG HỢP THEO TOPIC (AI ANALYTICS)
-- ============================================================

-- -------------------------------------------------------------
-- Bảng: user_topic_stats
-- Mục đích: Thống kê hiệu suất học sinh theo từng chuyên đề
--           AI quét bảng này để phát hiện điểm yếu & gửi gợi ý
-- -------------------------------------------------------------
CREATE TABLE user_topic_stats (
    stat_id             INT             NOT NULL AUTO_INCREMENT,
    user_id             CHAR(36)        NOT NULL,
    topic_id            INT             NOT NULL,
    total_attempts      INT             NOT NULL DEFAULT 0
                        COMMENT 'Tổng số lần làm câu hỏi trong chuyên đề này',
    correct_attempts    INT             NOT NULL DEFAULT 0
                        COMMENT 'Số lần trả lời đúng',
    accuracy_rate       DECIMAL(5,2)    GENERATED ALWAYS AS (
                            CASE WHEN total_attempts > 0
                                 THEN ROUND((correct_attempts / total_attempts) * 100, 2)
                                 ELSE 0
                            END
                        ) STORED
                        COMMENT 'Tỉ lệ đúng (%) - computed column, AI dùng để xác định điểm yếu',
    last_attempt_at     DATETIME        NULL
                        COMMENT 'Lần gần nhất làm câu thuộc chuyên đề này',
    ai_flagged_weak     TINYINT(1)      NOT NULL DEFAULT 0
                        COMMENT '1 = AI đã đánh dấu chuyên đề này là điểm yếu (accuracy < 50%)',
    updated_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT pk_user_topic_stats      PRIMARY KEY (stat_id),
    CONSTRAINT fk_uts_user              FOREIGN KEY (user_id)  REFERENCES users(user_id)  ON DELETE CASCADE,
    CONSTRAINT fk_uts_topic             FOREIGN KEY (topic_id) REFERENCES topics(topic_id) ON DELETE CASCADE,
    CONSTRAINT uq_user_topic            UNIQUE (user_id, topic_id),
    INDEX idx_uts_accuracy              (user_id, accuracy_rate),
    INDEX idx_uts_weak                  (ai_flagged_weak)
) ENGINE=InnoDB COMMENT='Thống kê hiệu suất theo chuyên đề - AI dùng để gợi ý ôn luyện';


-- ============================================================
-- NHÓM 5: TƯƠNG TÁC AI CHATBOT (AI CHATBOT LOGIC)
-- ============================================================

-- -------------------------------------------------------------
-- Bảng: chat_sessions
-- Mục đích: Mỗi phiên hội thoại của học sinh với AI chatbot
-- -------------------------------------------------------------
CREATE TABLE chat_sessions (
    session_id          CHAR(36)        NOT NULL DEFAULT (UUID()),
    user_id             CHAR(36)        NOT NULL,
    title               VARCHAR(255)    NULL
                        COMMENT 'Tiêu đề phiên chat (AI tự tạo sau vài tin nhắn đầu)',
    context_summary     TEXT            NULL
                        COMMENT 'Tóm tắt bối cảnh hội thoại (để tiết kiệm Token khi gửi cho AI)',
    related_exam_id     INT             NULL
                        COMMENT 'Nếu chat liên quan đến 1 đề thi cụ thể',
    related_attempt_id  INT             NULL
                        COMMENT 'Nếu chat được mở ngay sau khi nộp bài',
    total_messages      INT             NOT NULL DEFAULT 0,
    status              ENUM('active','archived') NOT NULL DEFAULT 'active',
    start_time          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_message_at     DATETIME        NULL,
    ended_at            DATETIME        NULL,

    CONSTRAINT pk_chat_sessions         PRIMARY KEY (session_id),
    CONSTRAINT fk_sessions_user         FOREIGN KEY (user_id)          REFERENCES users(user_id)           ON DELETE CASCADE,
    CONSTRAINT fk_sessions_exam         FOREIGN KEY (related_exam_id)  REFERENCES exams(exam_id)           ON DELETE SET NULL,
    CONSTRAINT fk_sessions_attempt      FOREIGN KEY (related_attempt_id) REFERENCES student_attempts(attempt_id) ON DELETE SET NULL,
    INDEX idx_sessions_user             (user_id),
    INDEX idx_sessions_last_msg         (last_message_at)
) ENGINE=InnoDB COMMENT='Phiên hội thoại giữa học sinh và AI Chatbot';


-- -------------------------------------------------------------
-- Bảng: chat_messages
-- Mục đích: Lưu toàn bộ lịch sử tin nhắn trong mỗi phiên chat
-- -------------------------------------------------------------
CREATE TABLE chat_messages (
    message_id              BIGINT          NOT NULL AUTO_INCREMENT,
    session_id              CHAR(36)        NOT NULL,
    role                    ENUM('user','assistant','system') NOT NULL
                            COMMENT 'user=học sinh, assistant=AI, system=prompt hệ thống',
    content                 MEDIUMTEXT      NOT NULL
                            COMMENT 'Nội dung tin nhắn',
    related_question_id     INT             NULL
                            COMMENT 'FK đến Questions nếu học sinh đang hỏi về câu cụ thể trong DB',
    tokens_used             INT             NULL
                            COMMENT 'Số token AI đã dùng để tạo tin nhắn này (chi phí tracking)',
    model_used              VARCHAR(50)     NULL
                            COMMENT 'Tên model AI dùng: gemini-1.5-flash, gpt-4o...',
    is_flagged              TINYINT(1)      NOT NULL DEFAULT 0
                            COMMENT '1 = Tin nhắn bị đánh dấu bất thường (cần review)',
    created_at              DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_chat_messages         PRIMARY KEY (message_id),
    CONSTRAINT fk_messages_session      FOREIGN KEY (session_id)          REFERENCES chat_sessions(session_id) ON DELETE CASCADE,
    CONSTRAINT fk_messages_question     FOREIGN KEY (related_question_id) REFERENCES questions(question_id)    ON DELETE SET NULL,
    INDEX idx_messages_session          (session_id),
    INDEX idx_messages_created          (created_at),
    INDEX idx_messages_role             (session_id, role)
) ENGINE=InnoDB COMMENT='Lịch sử tin nhắn giữa học sinh và AI Chatbot';


-- -------------------------------------------------------------
-- Bảng: ai_notifications
-- Mục đích: AI chủ động gửi thông báo/gợi ý đến học sinh
--           VD: "Bạn đang yếu Tích phân, làm thêm 5 câu nhé!"
-- -------------------------------------------------------------
CREATE TABLE ai_notifications (
    notification_id     INT             NOT NULL AUTO_INCREMENT,
    user_id             CHAR(36)        NOT NULL,
    notification_type   ENUM('weak_topic','streak_reminder','exam_reminder','achievement','suggestion') NOT NULL
                        COMMENT 'Loại thông báo từ AI',
    title               VARCHAR(255)    NOT NULL
                        COMMENT 'Tiêu đề thông báo',
    message             TEXT            NOT NULL
                        COMMENT 'Nội dung thông báo chi tiết',
    related_topic_id    INT             NULL
                        COMMENT 'Chuyên đề liên quan đến thông báo',
    related_exam_id     INT             NULL
                        COMMENT 'Đề thi gợi ý kèm theo thông báo',
    is_read             TINYINT(1)      NOT NULL DEFAULT 0,
    is_actioned         TINYINT(1)      NOT NULL DEFAULT 0
                        COMMENT '1 = Học sinh đã thực hiện hành động (làm đề gợi ý...)',
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    read_at             DATETIME        NULL,

    CONSTRAINT pk_ai_notifications      PRIMARY KEY (notification_id),
    CONSTRAINT fk_notif_user            FOREIGN KEY (user_id)          REFERENCES users(user_id)  ON DELETE CASCADE,
    CONSTRAINT fk_notif_topic           FOREIGN KEY (related_topic_id) REFERENCES topics(topic_id) ON DELETE SET NULL,
    CONSTRAINT fk_notif_exam            FOREIGN KEY (related_exam_id)  REFERENCES exams(exam_id)   ON DELETE SET NULL,
    INDEX idx_notif_user                (user_id, is_read),
    INDEX idx_notif_created             (created_at)
) ENGINE=InnoDB COMMENT='Thông báo AI chủ động gửi cho học sinh (gợi ý ôn luyện)';


-- -------------------------------------------------------------
-- Bảng: knowledge_base
-- Mục đích: Lưu nội dung tài liệu để AI dùng cho RAG (Retrieval-Augmented Generation)
--           Lưu mẹo giải nhanh, lý thuyết SGK, công thức...
-- -------------------------------------------------------------
CREATE TABLE knowledge_base (
    kb_id               INT             NOT NULL AUTO_INCREMENT,
    subject_id          TINYINT         NULL,
    topic_id            INT             NULL,
    kb_type             ENUM('theory','formula','shortcut_trick','example','faq') NOT NULL DEFAULT 'theory'
                        COMMENT 'Loại tài liệu: theory=lý thuyết, formula=công thức, shortcut_trick=mẹo nhanh',
    title               VARCHAR(255)    NOT NULL
                        COMMENT 'Tiêu đề bài lý thuyết/mẹo',
    content_chunk       MEDIUMTEXT      NOT NULL
                        COMMENT 'Nội dung văn bản (chunk nhỏ, ~500 tokens để vector hóa tốt)',
    source              VARCHAR(200)    NULL
                        COMMENT 'Nguồn tài liệu: SGK Vật Lý 12 NXB Giáo Dục, tr.45',
    -- Vector embedding sẽ lưu ở Vector DB (Pinecone/Weaviate/pgvector)
    -- Cột này lưu ID tham chiếu sang Vector DB
    vector_db_id        VARCHAR(100)    NULL
                        COMMENT 'ID tương ứng trong Vector Database (Pinecone/Weaviate) để AI tìm kiếm ngữ nghĩa',
    chunk_index         SMALLINT        NULL
                        COMMENT 'Số thứ tự chunk nếu 1 tài liệu dài được chia nhỏ',
    is_active           TINYINT(1)      NOT NULL DEFAULT 1,
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT pk_knowledge_base        PRIMARY KEY (kb_id),
    CONSTRAINT fk_kb_subject            FOREIGN KEY (subject_id) REFERENCES subjects(subject_id) ON DELETE SET NULL,
    CONSTRAINT fk_kb_topic              FOREIGN KEY (topic_id)   REFERENCES topics(topic_id)     ON DELETE SET NULL,
    INDEX idx_kb_subject                (subject_id),
    INDEX idx_kb_topic                  (topic_id),
    INDEX idx_kb_type                   (kb_type),
    FULLTEXT INDEX ft_kb_content        (title, content_chunk)   -- Full-text search trước khi có Vector DB
) ENGINE=InnoDB COMMENT='Kho kiến thức cho AI RAG: lý thuyết, công thức, mẹo giải nhanh';


-- ============================================================
-- NHÓM 6: BỔ SUNG - GAMIFICATION & TIẾN ĐỘ
-- ============================================================

-- -------------------------------------------------------------
-- Bảng: study_streaks
-- Mục đích: Theo dõi chuỗi ngày học liên tục (streak)
-- -------------------------------------------------------------
CREATE TABLE study_streaks (
    streak_id           INT             NOT NULL AUTO_INCREMENT,
    user_id             CHAR(36)        NOT NULL,
    streak_date         DATE            NOT NULL
                        COMMENT 'Ngày học (1 bản ghi = 1 ngày học)',
    questions_done      SMALLINT        NOT NULL DEFAULT 0
                        COMMENT 'Số câu làm trong ngày này',
    study_time_minutes  SMALLINT        NOT NULL DEFAULT 0
                        COMMENT 'Tổng thời gian học trong ngày (phút)',

    CONSTRAINT pk_study_streaks         PRIMARY KEY (streak_id),
    CONSTRAINT fk_streak_user           FOREIGN KEY (user_id)  REFERENCES users(user_id)  ON DELETE CASCADE,
    CONSTRAINT uq_user_streak_date      UNIQUE (user_id, streak_date),
    INDEX idx_streak_user_date          (user_id, streak_date)
) ENGINE=InnoDB COMMENT='Chuỗi ngày học liên tục của học sinh';


-- -------------------------------------------------------------
-- Bảng: achievements
-- Mục đích: Huy hiệu / Thành tích (gamification)
-- -------------------------------------------------------------
CREATE TABLE achievements (
    achievement_id      INT             NOT NULL AUTO_INCREMENT,
    name                VARCHAR(100)    NOT NULL,
    description         TEXT            NULL,
    icon_url            VARCHAR(500)    NULL,
    condition_type      VARCHAR(50)     NOT NULL
                        COMMENT 'Loại điều kiện: streak_days, accuracy_rate, questions_count, perfect_score',
    condition_value     INT             NOT NULL
                        COMMENT 'Giá trị ngưỡng để đạt thành tích',

    CONSTRAINT pk_achievements          PRIMARY KEY (achievement_id)
) ENGINE=InnoDB COMMENT='Danh sách huy hiệu thành tích';

CREATE TABLE user_achievements (
    id                  INT             NOT NULL AUTO_INCREMENT,
    user_id             CHAR(36)        NOT NULL,
    achievement_id      INT             NOT NULL,
    earned_at           DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_user_achievements     PRIMARY KEY (id),
    CONSTRAINT fk_ua_user               FOREIGN KEY (user_id)        REFERENCES users(user_id)        ON DELETE CASCADE,
    CONSTRAINT fk_ua_achievement        FOREIGN KEY (achievement_id) REFERENCES achievements(achievement_id) ON DELETE CASCADE,
    CONSTRAINT uq_user_achievement      UNIQUE (user_id, achievement_id)
) ENGINE=InnoDB COMMENT='Huy hiệu thành tích của từng học sinh';


-- ============================================================
-- STORED PROCEDURES: LOGIC NGHIỆP VỤ TỰ ĐỘNG
-- ============================================================

DELIMITER //

-- Cập nhật thống kê topic sau mỗi câu trả lời
CREATE PROCEDURE sp_update_topic_stats(
    IN p_user_id    CHAR(36),
    IN p_topic_id   INT,
    IN p_is_correct TINYINT
)
BEGIN
    INSERT INTO user_topic_stats (user_id, topic_id, total_attempts, correct_attempts, last_attempt_at)
    VALUES (p_user_id, p_topic_id, 1, p_is_correct, NOW())
    ON DUPLICATE KEY UPDATE
        total_attempts   = total_attempts + 1,
        correct_attempts = correct_attempts + p_is_correct,
        last_attempt_at  = NOW();

    -- Đánh dấu điểm yếu nếu accuracy < 50% (sau ít nhất 5 lần thử)
    UPDATE user_topic_stats
    SET ai_flagged_weak = CASE
            WHEN total_attempts >= 5 AND (correct_attempts / total_attempts) < 0.50 THEN 1
            ELSE 0
        END
    WHERE user_id = p_user_id AND topic_id = p_topic_id;
END //

-- Tạo thông báo AI khi phát hiện điểm yếu mới
CREATE PROCEDURE sp_generate_weak_topic_notification(
    IN p_user_id    CHAR(36),
    IN p_topic_id   INT
)
BEGIN
    DECLARE v_topic_name    VARCHAR(200);
    DECLARE v_accuracy      DECIMAL(5,2);
    DECLARE v_notif_exists  INT;

    SELECT t.topic_name, uts.accuracy_rate
    INTO v_topic_name, v_accuracy
    FROM user_topic_stats uts
    JOIN topics t ON t.topic_id = uts.topic_id
    WHERE uts.user_id = p_user_id AND uts.topic_id = p_topic_id;

    -- Kiểm tra đã gửi thông báo trong 24 giờ qua chưa
    SELECT COUNT(*) INTO v_notif_exists
    FROM ai_notifications
    WHERE user_id = p_user_id
      AND related_topic_id = p_topic_id
      AND notification_type = 'weak_topic'
      AND created_at > NOW() - INTERVAL 24 HOUR;

    IF v_notif_exists = 0 THEN
        INSERT INTO ai_notifications (user_id, notification_type, title, message, related_topic_id)
        VALUES (
            p_user_id,
            'weak_topic',
            CONCAT('Ôn luyện chuyên đề: ', v_topic_name),
            CONCAT('Mình thấy bạn đang yếu phần "', v_topic_name,
                   '" (tỉ lệ đúng: ', ROUND(v_accuracy, 1), '%). ',
                   'Bạn có muốn làm thêm 5 câu cơ bản để củng cố không?'),
            p_topic_id
        );
    END IF;
END //

DELIMITER ;


-- ============================================================
-- VIEWS: HỖ TRỢ QUERY NHANH CHO AI ENGINE
-- ============================================================

-- View: Danh sách điểm yếu của tất cả học sinh (AI đọc để gợi ý)
CREATE OR REPLACE VIEW vw_user_weak_topics AS
SELECT
    u.user_id,
    u.username,
    u.full_name,
    t.topic_id,
    t.topic_name,
    s.subject_name,
    uts.total_attempts,
    uts.correct_attempts,
    uts.accuracy_rate,
    uts.last_attempt_at
FROM user_topic_stats uts
JOIN users   u ON u.user_id  = uts.user_id
JOIN topics  t ON t.topic_id = uts.topic_id
JOIN subjects s ON s.subject_id = t.subject_id
WHERE uts.ai_flagged_weak = 1
  AND uts.total_attempts >= 5
ORDER BY uts.accuracy_rate ASC;


-- View: Câu hỏi kèm đáp án đúng + lời giải (Chatbot dùng)
CREATE OR REPLACE VIEW vw_questions_with_answer AS
SELECT
    q.question_id,
    q.content         AS question_content,
    q.image_url,
    q.level,
    q.is_official,
    t.topic_name,
    t.topic_id,
    s.subject_name,
    a.answer_id,
    a.option_label    AS correct_option,
    a.content         AS correct_answer_content,
    a.explanation
FROM questions q
JOIN topics   t ON t.topic_id   = q.topic_id
JOIN subjects s ON s.subject_id = t.subject_id
JOIN answers  a ON a.question_id = q.question_id AND a.is_correct = 1
WHERE q.is_active = 1;


-- View: Xếp hạng học sinh theo môn (Leaderboard)
CREATE OR REPLACE VIEW vw_subject_leaderboard AS
SELECT
    u.user_id,
    u.username,
    u.full_name,
    u.avatar_url,
    s.subject_id,
    s.subject_name,
    COUNT(DISTINCT sa.attempt_id)   AS total_exams,
    AVG(sa.score)                   AS avg_score,
    MAX(sa.score)                   AS best_score,
    SUM(sa.correct_count)           AS total_correct,
    ROUND(SUM(sa.correct_count) / NULLIF(SUM(sa.correct_count + sa.wrong_count), 0) * 100, 2) AS overall_accuracy
FROM student_attempts sa
JOIN users u  ON u.user_id   = sa.user_id
JOIN exams e  ON e.exam_id   = sa.exam_id
JOIN subjects s ON s.subject_id = e.subject_id
WHERE sa.status = 'completed'
GROUP BY u.user_id, s.subject_id
ORDER BY avg_score DESC;


-- ============================================================
-- INDEXES BỔ SUNG ĐỂ TỐI ƯU QUERY AI
-- ============================================================

-- Tối ưu query: "Tìm câu hỏi theo môn + chuyên đề + mức độ"
CREATE INDEX idx_q_topic_level ON questions(topic_id, level, is_active);

-- Tối ưu query: "Lịch sử thi của user trong 30 ngày gần nhất"
CREATE INDEX idx_attempts_user_date ON student_attempts(user_id, completed_at, status);

-- Tối ưu query: "Chatbot tìm câu trong session"
CREATE INDEX idx_messages_session_role ON chat_messages(session_id, role, created_at);


-- ============================================================
-- END OF SCHEMA
-- ============================================================
