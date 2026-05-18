"""
Script tạo database SQLite và seed dữ liệu mẫu cho project THPTQG AI.

Chức năng:
1. Tạo database file `thptqg.db` (hoặc sử dụng file đã có)
2. Chạy toàn bộ schema từ `database.sql`
3. Insert dữ liệu mẫu: Topics, Exams, Questions, Answers, Exam-Questions mapping

Lưu ý: Schema trong database.sql đã có sẵn INSERT cho bảng subjects,
nên script này chỉ thêm topics, exams, questions, answers, exam_questions.
"""

import sqlite3
import os
import sys
import io

# Fix encoding cho Windows console
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

# --- Cấu hình ---
DB_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "thptqg.db")
SCHEMA_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "database.sql")


def create_database():
    """Tạo database và chạy schema."""
    print(f"[INFO] Database file: {DB_FILE}")

    # Đọc schema SQL
    if not os.path.exists(SCHEMA_FILE):
        print(f"[ERROR] Không tìm thấy file schema: {SCHEMA_FILE}")
        sys.exit(1)

    with open(SCHEMA_FILE, "r", encoding="utf-8") as f:
        schema_sql = f.read()

    conn = sqlite3.connect(DB_FILE)
    conn.execute("PRAGMA foreign_keys = ON;")
    cursor = conn.cursor()

    # Chạy schema (tạo bảng + insert subjects mẫu từ database.sql)
    try:
        cursor.executescript(schema_sql)
        conn.commit()
        print("[OK] Schema đã được tạo thành công.")
    except sqlite3.IntegrityError as e:
        # Schema đã được chạy trước đó (subjects đã tồn tại), bỏ qua
        print(f"[INFO] Schema đã tồn tại (subjects đã có dữ liệu). Tiếp tục seed...")
        conn.commit()
    except sqlite3.Error as e:
        print(f"[ERROR] Lỗi khi chạy schema: {e}")
        conn.close()
        sys.exit(1)

    return conn


def seed_data(conn):
    """Insert dữ liệu mẫu."""
    cursor = conn.cursor()
    conn.execute("PRAGMA foreign_keys = ON;")

    # --- Bước 1: Lấy subject_id của 'Toán học' (đã được insert trong schema) ---
    cursor.execute("SELECT subject_id FROM subjects WHERE subject_code = 'TOAN'")
    row = cursor.fetchone()
    if row is None:
        print("[ERROR] Không tìm thấy môn 'Toán học' (subject_code='TOAN'). Schema chưa seed?")
        return
    toan_subject_id = row[0]
    print(f"[OK] Tìm thấy môn Toán học, subject_id = {toan_subject_id}")

    # --- Bước 2: Thêm Chuyên đề (Topic) ---
    try:
        cursor.execute("""
            INSERT INTO topics (subject_id, topic_name, topic_order, description)
            VALUES (?, 'Đạo Hàm và Tích Phân', 1, 'Chuyên đề về đạo hàm và tích phân cơ bản')
        """, (toan_subject_id,))
        topic_id = cursor.lastrowid
        print(f"[OK] Đã thêm topic 'Đạo Hàm và Tích Phân', topic_id = {topic_id}")
    except sqlite3.IntegrityError as e:
        print(f"[WARN] Topic có thể đã tồn tại: {e}")
        cursor.execute("SELECT topic_id FROM topics WHERE topic_name = 'Đạo Hàm và Tích Phân' AND subject_id = ?", (toan_subject_id,))
        topic_id = cursor.fetchone()[0]
        print(f"[INFO] Sử dụng topic_id hiện có = {topic_id}")

    # --- Bước 3: Thêm Đề thi thử (Exam) ---
    try:
        cursor.execute("""
            INSERT INTO exams (title, description, subject_id, exam_type, duration, total_questions)
            VALUES ('Đề thi thử Toán - Mini Test', 'Đề thi thử mini 3 câu về đạo hàm', ?, 'practice', 15, 3)
        """, (toan_subject_id,))
        exam_id = cursor.lastrowid
        print(f"[OK] Đã thêm đề thi 'Đề thi thử Toán - Mini Test', exam_id = {exam_id}")
    except sqlite3.IntegrityError as e:
        print(f"[WARN] Đề thi có thể đã tồn tại: {e}")
        cursor.execute("SELECT exam_id FROM exams WHERE title = 'Đề thi thử Toán - Mini Test'")
        exam_id = cursor.fetchone()[0]
        print(f"[INFO] Sử dụng exam_id hiện có = {exam_id}")

    # --- Bước 4: Thêm 3 Câu hỏi ---
    questions_data = [
        {
            "content": "Tính đạo hàm của hàm số y = x^2",
            "level": 1,  # Nhận biết (EASY)
            "obsidian_source_path": "Toan_Hoc/Dao_Ham.md",
            "answers": [
                ("A", "y' = x", 0),
                ("B", "y' = 2x", 1),
                ("C", "y' = 2", 0),
                ("D", "y' = x^2", 0),
            ]
        },
        {
            "content": "Đạo hàm của một hằng số (ví dụ y = 5) bằng bao nhiêu?",
            "level": 1,  # Nhận biết (EASY)
            "obsidian_source_path": "Toan_Hoc/Dao_Ham.md",
            "answers": [
                ("A", "y' = 0", 1),
                ("B", "y' = 1", 0),
                ("C", "y' = 5", 0),
                ("D", "Không có đạo hàm", 0),
            ]
        },
        {
            "content": "Đạo hàm của hàm số y = 3x là gì?",
            "level": 2,  # Thông hiểu (MEDIUM)
            "obsidian_source_path": "Toan_Hoc/Dao_Ham.md",
            "answers": [
                ("A", "y' = x", 0),
                ("B", "y' = 3", 1),
                ("C", "y' = 3x", 0),
                ("D", "y' = 0", 0),
            ]
        },
    ]

    question_ids = []
    for i, q in enumerate(questions_data, start=1):
        try:
            cursor.execute("""
                INSERT INTO questions (topic_id, content, level, obsidian_source_path)
                VALUES (?, ?, ?, ?)
            """, (topic_id, q["content"], q["level"], q["obsidian_source_path"]))
            q_id = cursor.lastrowid
            question_ids.append(q_id)
            print(f"[OK] Đã thêm câu hỏi {i}: '{q['content'][:40]}...', question_id = {q_id}")

            # Insert đáp án cho câu hỏi này
            for order, (label, content, is_correct) in enumerate(q["answers"]):
                cursor.execute("""
                    INSERT INTO answers (question_id, option_label, content, is_correct, display_order)
                    VALUES (?, ?, ?, ?, ?)
                """, (q_id, label, content, is_correct, order))
            print(f"    [OK] Đã thêm 4 đáp án cho câu hỏi {i}")

        except sqlite3.IntegrityError as e:
            print(f"[WARN] Câu hỏi {i} có thể đã tồn tại: {e}")
            question_ids.append(None)

    # --- Bước 5: Gắn câu hỏi vào đề thi ---
    for order, q_id in enumerate(question_ids, start=1):
        if q_id is not None:
            try:
                cursor.execute("""
                    INSERT INTO exam_questions (exam_id, question_id, question_order)
                    VALUES (?, ?, ?)
                """, (exam_id, q_id, order))
                print(f"[OK] Đã gắn câu hỏi {q_id} vào đề thi {exam_id} (thứ tự: {order})")
            except sqlite3.IntegrityError as e:
                print(f"[WARN] Liên kết exam-question đã tồn tại: {e}")

    conn.commit()
    print("\n" + "=" * 60)
    print("[DONE] Seed dữ liệu hoàn tất!")
    print("=" * 60)

    # --- Verify ---
    print("\n--- KIỂM TRA DỮ LIỆU ---")

    cursor.execute("SELECT COUNT(*) FROM subjects")
    print(f"Tổng số môn học: {cursor.fetchone()[0]}")

    cursor.execute("SELECT COUNT(*) FROM topics")
    print(f"Tổng số chuyên đề: {cursor.fetchone()[0]}")

    cursor.execute("SELECT COUNT(*) FROM exams")
    print(f"Tổng số đề thi: {cursor.fetchone()[0]}")

    cursor.execute("SELECT COUNT(*) FROM questions")
    print(f"Tổng số câu hỏi: {cursor.fetchone()[0]}")

    cursor.execute("SELECT COUNT(*) FROM answers")
    print(f"Tổng số đáp án: {cursor.fetchone()[0]}")

    cursor.execute("SELECT COUNT(*) FROM exam_questions")
    print(f"Tổng số liên kết exam-question: {cursor.fetchone()[0]}")

    print("\n--- CHI TIẾT CÂU HỎI & ĐÁP ÁN ---")
    cursor.execute("""
        SELECT q.question_id, q.content, a.option_label, a.content, a.is_correct
        FROM questions q
        JOIN answers a ON q.question_id = a.question_id
        ORDER BY q.question_id, a.option_label
    """)
    current_q = None
    for row in cursor.fetchall():
        q_id, q_content, opt_label, opt_content, is_correct = row
        if q_id != current_q:
            print(f"\n  Câu {q_id}: {q_content}")
            current_q = q_id
        correct_mark = " ✓ (ĐÚNG)" if is_correct else ""
        print(f"    {opt_label}. {opt_content}{correct_mark}")


if __name__ == "__main__":
    conn = create_database()
    seed_data(conn)
    conn.close()
    print(f"\n[INFO] Database đã được lưu tại: {DB_FILE}")
