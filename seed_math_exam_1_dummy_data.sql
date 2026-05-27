PRAGMA foreign_keys = ON;

BEGIN TRANSACTION;

-- Dam bao co chu de Toan hoc lop 12 de gan cau hoi
INSERT OR IGNORE INTO topics (topic_id, subject_id, topic_name, topic_order, description, is_active)
SELECT 1001, subject_id, 'Tich phan', 1, 'Chu de Tich phan lop 12', 1
FROM subjects
WHERE subject_code = 'TOAN';

INSERT OR IGNORE INTO topics (topic_id, subject_id, topic_name, topic_order, description, is_active)
SELECT 1002, subject_id, 'Logarit', 2, 'Chu de Logarit lop 12', 1
FROM subjects
WHERE subject_code = 'TOAN';

INSERT OR IGNORE INTO topics (topic_id, subject_id, topic_name, topic_order, description, is_active)
SELECT 1003, subject_id, 'Khao sat ham so', 3, 'Chu de Khao sat ham so lop 12', 1
FROM subjects
WHERE subject_code = 'TOAN';

-- Dam bao de thi so 1 ton tai de co the map cau hoi vao
INSERT OR IGNORE INTO exams (
    exam_id, title, description, subject_id, exam_type, duration, total_questions,
    pass_score, shuffle_answers, shuffle_questions, is_public
)
SELECT
    1,
    'De Toan Giua Ky',
    'De thi giua ky mon Toan lop 12 gom 5 cau hoi mau',
    subject_id,
    'practice',
    50,
    5,
    5.0,
    1,
    0,
    1
FROM subjects
WHERE subject_code = 'TOAN';

-- 5 cau hoi Toan lop 12
INSERT OR IGNORE INTO questions (
    question_id, topic_id, content, level, question_type, source, obsidian_source_path, is_active
) VALUES
    (
        2001,
        1001,
        'Cau 1. Tinh tich phan I = \int_0^1 (2x + 1) dx.',
        1,
        'single_choice',
        'Dummy Data Toan 12',
        'Toan_Hoc/Giai_Tich/toan_tich_phan.md',
        1
    ),
    (
        2002,
        1002,
        'Cau 2. Nghiem cua phuong trinh log_2(x - 1) = 3 la',
        1,
        'single_choice',
        'Dummy Data Toan 12',
        'Toan_Hoc/Giai_Tich/logarit.md',
        1
    ),
    (
        2003,
        1003,
        'Cau 3. Ham so y = x^3 - 3x + 1 co bao nhieu diem cuc tri?',
        2,
        'single_choice',
        'Dummy Data Toan 12',
        'Toan_Hoc/Giai_Tich/khao_sat_ham_so.md',
        1
    ),
    (
        2004,
        1001,
        'Cau 4. Mot nguyen ham cua ham so f(x) = 1/x tren khoang (0; +vo cung) la',
        2,
        'single_choice',
        'Dummy Data Toan 12',
        'Toan_Hoc/Giai_Tich/nguyen_ham_tich_phan.md',
        1
    ),
    (
        2005,
        1003,
        'Cau 5. Do thi ham so y = (2x + 1)/(x - 1) co tieu can ngang la duong thang nao?',
        2,
        'single_choice',
        'Dummy Data Toan 12',
        'Toan_Hoc/Giai_Tich/tiem_can_ham_phan_thuc.md',
        1
    );

-- Dap an cho cau 1
INSERT OR IGNORE INTO answers (answer_id, question_id, option_label, content, is_correct, display_order) VALUES
    (3001, 2001, 'A', '1', 0, 1),
    (3002, 2001, 'B', '2', 1, 2),
    (3003, 2001, 'C', '3', 0, 3),
    (3004, 2001, 'D', '4', 0, 4);

-- Dap an cho cau 2
INSERT OR IGNORE INTO answers (answer_id, question_id, option_label, content, is_correct, display_order) VALUES
    (3005, 2002, 'A', '7', 0, 1),
    (3006, 2002, 'B', '8', 0, 2),
    (3007, 2002, 'C', '9', 1, 3),
    (3008, 2002, 'D', '10', 0, 4);

-- Dap an cho cau 3
INSERT OR IGNORE INTO answers (answer_id, question_id, option_label, content, is_correct, display_order) VALUES
    (3009, 2003, 'A', '1', 0, 1),
    (3010, 2003, 'B', '2', 1, 2),
    (3011, 2003, 'C', '3', 0, 3),
    (3012, 2003, 'D', '4', 0, 4);

-- Dap an cho cau 4
INSERT OR IGNORE INTO answers (answer_id, question_id, option_label, content, is_correct, display_order) VALUES
    (3013, 2004, 'A', 'ln(x) + C', 1, 1),
    (3014, 2004, 'B', '1/(x^2) + C', 0, 2),
    (3015, 2004, 'C', 'e^x + C', 0, 3),
    (3016, 2004, 'D', 'x + C', 0, 4);

-- Dap an cho cau 5
INSERT OR IGNORE INTO answers (answer_id, question_id, option_label, content, is_correct, display_order) VALUES
    (3017, 2005, 'A', 'y = -1', 0, 1),
    (3018, 2005, 'B', 'y = 1', 0, 2),
    (3019, 2005, 'C', 'y = 2', 1, 3),
    (3020, 2005, 'D', 'x = 1', 0, 4);

-- Gan 5 cau hoi vao de thi so 1
INSERT OR IGNORE INTO exam_questions (exam_id, question_id, question_order, point_weight) VALUES
    (1, 2001, 1, 0.25),
    (1, 2002, 2, 0.25),
    (1, 2003, 3, 0.25),
    (1, 2004, 4, 0.25),
    (1, 2005, 5, 0.25);

COMMIT;
