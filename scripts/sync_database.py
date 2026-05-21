import io
import sqlite3
import sys
from pathlib import Path


if hasattr(sys.stdout, "buffer"):
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "buffer"):
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")


PROJECT_ROOT = Path(__file__).resolve().parent.parent
DB_PATH = PROJECT_ROOT / "data" / "thptqg_ai.db"
SCHEMA_PATH = PROJECT_ROOT / "database" / "schema.sql"


def ensure_data_dir() -> None:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)


def read_schema() -> str:
    try:
        return SCHEMA_PATH.read_text(encoding="utf-8")
    except FileNotFoundError:
        print(f"❌ Không tìm thấy file schema.sql tại: {SCHEMA_PATH}")
        raise


def drop_all_tables(connection: sqlite3.Connection) -> None:
    cursor = connection.cursor()
    cursor.execute("PRAGMA foreign_keys = OFF;")
    cursor.execute(
        """
        SELECT name
        FROM sqlite_master
        WHERE type = 'table'
          AND name NOT LIKE 'sqlite_%'
        ORDER BY name
        """
    )
    tables = [row[0] for row in cursor.fetchall()]

    for table_name in tables:
        cursor.execute(f'DROP TABLE IF EXISTS "{table_name}"')

    cursor.execute("PRAGMA foreign_keys = ON;")
    connection.commit()


def recreate_schema(connection: sqlite3.Connection, schema_sql: str) -> None:
    drop_all_tables(connection)
    connection.executescript(schema_sql)
    connection.commit()


def seed_users(cursor: sqlite3.Cursor) -> dict[str, int]:
    users = [
        (
            "admin",
            "demo_admin_hash",
            "admin@thptqg.local",
            "Quản trị viên",
            "0900000001",
            "1990-01-01",
            "admin",
            "active",
        ),
        (
            "student",
            "demo_student_hash",
            "student@thptqg.local",
            "Học sinh mẫu",
            "0900000002",
            "2007-09-01",
            "student",
            "active",
        ),
    ]

    user_ids: dict[str, int] = {}
    for user in users:
        cursor.execute(
            """
            INSERT INTO users (
                username, password_hash, email, full_name, phone,
                date_of_birth, role, status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            user,
        )
        user_ids[user[0]] = cursor.lastrowid
    return user_ids


def seed_subjects(cursor: sqlite3.Cursor) -> dict[str, int]:
    subjects = [
        ("TOAN", "Toán học"),
        ("LY", "Vật Lý"),
        ("ANH", "Tiếng Anh"),
    ]

    subject_ids: dict[str, int] = {}
    for code, name in subjects:
        cursor.execute(
            """
            INSERT OR IGNORE INTO subjects (subject_code, subject_name)
            VALUES (?, ?)
            """,
            (code, name),
        )
        cursor.execute(
            "SELECT subject_id FROM subjects WHERE subject_code = ?",
            (code,),
        )
        subject_ids[code] = cursor.fetchone()[0]
    return subject_ids


def seed_topics(cursor: sqlite3.Cursor, math_subject_id: int) -> dict[str, int]:
    topics = [
        ("Hàm số", 1, "Chuyên đề về khảo sát và đồ thị hàm số."),
        ("Tích phân", 2, "Chuyên đề nguyên hàm và tích phân cơ bản."),
        ("Mũ và Logarit", 3, "Chuyên đề hàm số mũ, logarit và phương trình liên quan."),
        ("Hình học không gian", 4, "Chuyên đề hình học Oxyz và thể tích."),
        ("Xác suất", 5, "Chuyên đề xác suất và tổ hợp cơ bản."),
    ]

    topic_ids: dict[str, int] = {}
    for topic_name, topic_order, description in topics:
        cursor.execute(
            """
            INSERT INTO topics (subject_id, topic_name, topic_order, description)
            VALUES (?, ?, ?, ?)
            """,
            (math_subject_id, topic_name, topic_order, description),
        )
        topic_ids[topic_name] = cursor.lastrowid
    return topic_ids


def seed_questions_and_answers(
    cursor: sqlite3.Cursor,
    topic_ids: dict[str, int],
    created_by: int,
) -> list[int]:
    questions = [
        {
            "topic_name": "Tích phân",
            "content": "Nguyên hàm của hàm số f(x) = 2x là:",
            "level": 1,
            "source": "Đề ôn tập Toán 12",
            "obsidian_source_path": "Toan_Hoc/Giai_Tich/toan_tich_phan.md",
            "answers": [
                ("A", "x^2 + C", 1, "Vì ∫2x dx = x^2 + C."),
                ("B", "2x^2 + C", 0, "Đạo hàm của 2x^2 là 4x."),
                ("C", "x + C", 0, "Đây không phải nguyên hàm của 2x."),
                ("D", "ln|x| + C", 0, "Công thức này áp dụng cho 1/x."),
            ],
        },
        {
            "topic_name": "Tích phân",
            "content": "Tính tích phân ∫_0^1 2x dx.",
            "level": 1,
            "source": "Đề ôn tập Toán 12",
            "obsidian_source_path": "Toan_Hoc/4_Nguyen_Ham_Tich_Phan/2_tich_phan.md",
            "answers": [
                ("A", "1", 1, "Ta có ∫_0^1 2x dx = [x^2]_0^1 = 1."),
                ("B", "2", 0, "Kết quả không phải 2."),
                ("C", "0", 0, "Không đúng."),
                ("D", "1/2", 0, "Đây là kết quả của ∫_0^1 x dx."),
            ],
        },
        {
            "topic_name": "Tích phân",
            "content": "Nếu F'(x) = f(x) thì mệnh đề nào sau đây đúng?",
            "level": 2,
            "source": "Chuyên đề nguyên hàm",
            "obsidian_source_path": "Toan_Hoc/4_Nguyen_Ham_Tich_Phan/1_nguyen_ham.md",
            "answers": [
                ("A", "F(x) là một nguyên hàm của f(x)", 1, "Đây là định nghĩa nguyên hàm."),
                ("B", "f(x) là một nguyên hàm của F(x)", 0, "Ngược lại là sai."),
                ("C", "F(x) là đạo hàm của f(x)", 0, "Sai khái niệm."),
                ("D", "f(x) luôn dương", 0, "Không suy ra được."),
            ],
        },
        {
            "topic_name": "Tích phân",
            "content": "Biết ∫_1^3 f(x) dx = 5. Khi đó ∫_3^1 f(x) dx bằng:",
            "level": 3,
            "source": "Bài tập tích phân",
            "obsidian_source_path": "Toan_Hoc/4_Nguyen_Ham_Tich_Phan/2_tich_phan.md",
            "answers": [
                ("A", "5", 0, "Đổi cận thì đổi dấu."),
                ("B", "-5", 1, "Tính chất ∫_b^a f(x)dx = -∫_a^b f(x)dx."),
                ("C", "10", 0, "Không đúng."),
                ("D", "0", 0, "Không đúng."),
            ],
        },
        {
            "topic_name": "Tích phân",
            "content": "Cho ∫_0^2 f(x) dx = 3 và ∫_2^5 f(x) dx = -1. Giá trị ∫_0^5 f(x) dx là:",
            "level": 4,
            "source": "Bài tập vận dụng tích phân",
            "obsidian_source_path": "Toan_Hoc/4_Nguyen_Ham_Tich_Phan/2_tich_phan.md",
            "answers": [
                ("A", "2", 1, "Tính chất cộng đoạn: ∫_0^5 = ∫_0^2 + ∫_2^5 = 3 + (-1) = 2."),
                ("B", "3", 0, "Thiếu phần tích phân thứ hai."),
                ("C", "-2", 0, "Sai dấu."),
                ("D", "4", 0, "Không đúng."),
            ],
        },
        {
            "topic_name": "Hàm số",
            "content": "Hàm số y = x^3 - 3x đồng biến trên khoảng nào dưới đây?",
            "level": 2,
            "source": "Chuyên đề khảo sát hàm số",
            "obsidian_source_path": "Toan_Hoc/Dai_So/ham_so.md",
            "answers": [
                ("A", "(-1;1)", 0, "Trên khoảng này đạo hàm âm."),
                ("B", "(-∞;-1) và (1;+∞)", 1, "Vì y' = 3x^2 - 3 > 0 khi |x| > 1."),
                ("C", "(-∞;1)", 0, "Khoảng này chứa đoạn hàm giảm."),
                ("D", "(-1;+∞)", 0, "Khoảng này vẫn chứa đoạn hàm giảm."),
            ],
        },
        {
            "topic_name": "Mũ và Logarit",
            "content": "Nghiệm của phương trình 2^x = 8 là:",
            "level": 1,
            "source": "Ôn tập hàm số mũ",
            "obsidian_source_path": "Toan_Hoc/Dai_So/ham_mu_logarit.md",
            "answers": [
                ("A", "x = 2", 0, "2^2 = 4."),
                ("B", "x = 3", 1, "Vì 8 = 2^3."),
                ("C", "x = 4", 0, "2^4 = 16."),
                ("D", "x = 8", 0, "Không đúng."),
            ],
        },
        {
            "topic_name": "Hình học không gian",
            "content": "Thể tích khối lập phương cạnh a bằng:",
            "level": 1,
            "source": "Hình học 12",
            "obsidian_source_path": "Toan_Hoc/Hinh_Hoc/hinh_hoc_khong_gian.md",
            "answers": [
                ("A", "a^2", 0, "Đây là diện tích một mặt."),
                ("B", "2a^3", 0, "Sai hệ số."),
                ("C", "a^3", 1, "Công thức thể tích khối lập phương là a^3."),
                ("D", "4a^3", 0, "Không đúng."),
            ],
        },
        {
            "topic_name": "Xác suất",
            "content": "Gieo một con xúc xắc cân đối một lần. Xác suất để xuất hiện mặt 6 là:",
            "level": 1,
            "source": "Chuyên đề xác suất cơ bản",
            "obsidian_source_path": "Toan_Hoc/Xac_Suat/xac_suat_co_ban.md",
            "answers": [
                ("A", "1/3", 0, "Xúc xắc có 6 khả năng đồng khả năng."),
                ("B", "1/2", 0, "Không đúng."),
                ("C", "1/6", 1, "Có đúng 1 kết quả thuận lợi trên 6 kết quả."),
                ("D", "1/12", 0, "Không đúng."),
            ],
        },
    ]

    question_ids: list[int] = []
    for question in questions:
        cursor.execute(
            """
            INSERT INTO questions (
                topic_id, content, level, source, obsidian_source_path,
                created_by, is_official, question_type, is_active
            )
            VALUES (?, ?, ?, ?, ?, ?, 0, 'single_choice', 1)
            """,
            (
                topic_ids[question["topic_name"]],
                question["content"],
                question["level"],
                question["source"],
                question["obsidian_source_path"],
                created_by,
            ),
        )
        question_id = cursor.lastrowid
        question_ids.append(question_id)

        for display_order, answer in enumerate(question["answers"], start=1):
            option_label, content, is_correct, explanation = answer
            cursor.execute(
                """
                INSERT INTO answers (
                    question_id, option_label, content, is_correct, explanation, display_order
                )
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (
                    question_id,
                    option_label,
                    content,
                    is_correct,
                    explanation,
                    display_order,
                ),
            )

    return question_ids


def seed_exam(
    cursor: sqlite3.Cursor,
    subject_id: int,
    created_by: int,
    question_ids: list[int],
) -> None:
    cursor.execute(
        """
        INSERT INTO exams (
            title, description, subject_id, exam_type, duration,
            total_questions, pass_score, shuffle_answers, shuffle_questions,
            is_public, created_by
        )
        VALUES (?, ?, ?, 'practice', ?, ?, ?, 1, 0, 1, ?)
        """,
        (
            "Đề thi thử Toán học số 1",
            "Đề thi mẫu dùng để kiểm tra đồng bộ schema và hiển thị UI.",
            subject_id,
            50,
            len(question_ids),
            5.0,
            created_by,
        ),
    )
    exam_id = cursor.lastrowid

    for order, question_id in enumerate(question_ids, start=1):
        cursor.execute(
            """
            INSERT INTO exam_questions (exam_id, question_id, question_order, point_weight)
            VALUES (?, ?, ?, ?)
            """,
            (exam_id, question_id, order, 2.0),
        )


def seed_data(connection: sqlite3.Connection) -> None:
    cursor = connection.cursor()
    user_ids = seed_users(cursor)
    subject_ids = seed_subjects(cursor)
    topic_ids = seed_topics(cursor, subject_ids["TOAN"])
    question_ids = seed_questions_and_answers(cursor, topic_ids, user_ids["admin"])
    seed_exam(cursor, subject_ids["TOAN"], user_ids["admin"], question_ids)
    connection.commit()


def main() -> None:
    ensure_data_dir()
    schema_sql = read_schema()

    connection = sqlite3.connect(DB_PATH)
    try:
        connection.execute("PRAGMA foreign_keys = ON;")
        recreate_schema(connection, schema_sql)
        seed_data(connection)
    finally:
        connection.close()

    print("✅ Đã đồng bộ Database data/thptqg_ai.db thành công theo chuẩn schema.sql!")


if __name__ == "__main__":
    try:
        main()
    except FileNotFoundError:
        pass
