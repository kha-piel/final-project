"""
Importer tong quat cho de thi JSON vao SQLite cua project THPTQG AI.

Chuc nang:
1. Dam bao database `data/thptqg_ai.db` da co schema tu `database/schema.sql`
2. Doc de thi tu file JSON co cau truc chuan
3. Validate du lieu truoc khi ghi
4. Insert/reuse subjects, topics, questions, answers, exam_questions trong 1 transaction
5. Chan import trung de theo `title + subject_id`
"""

from __future__ import annotations

import argparse
import io
import json
import os
import sqlite3
import sys
from pathlib import Path
from typing import Any

# Fix encoding cho Windows console
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_DB_FILE = PROJECT_ROOT / "data" / "thptqg_ai.db"
DEFAULT_SCHEMA_FILE = PROJECT_ROOT / "database" / "schema.sql"
DEFAULT_EXAM_FILE = PROJECT_ROOT / "data" / "exams" / "mini_test_toan.json"
VALID_EXAM_TYPES = {"official_mock", "practice", "ai_generated", "custom"}
VALID_QUESTION_TYPES = {"single_choice"}
VALID_LEVELS = {1, 2, 3, 4}
REQUIRED_SINGLE_CHOICE_LABELS = ["A", "B", "C", "D"]


class ImportValidationError(ValueError):
    """Raised when exam JSON does not meet the expected structure."""


def ensure_parent_dir(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)


def initialize_database(db_file: Path, schema_file: Path) -> sqlite3.Connection:
    """Create/open SQLite database and apply schema safely."""
    ensure_parent_dir(db_file)

    if not schema_file.exists():
        raise FileNotFoundError(f"Khong tim thay file schema: {schema_file}")

    schema_sql = schema_file.read_text(encoding="utf-8")
    connection = sqlite3.connect(db_file)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON;")
    connection.executescript(schema_sql)
    connection.commit()
    return connection


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Import de thi JSON vao SQLite cho project THPTQG AI."
    )
    parser.add_argument(
        "--file",
        default=str(DEFAULT_EXAM_FILE),
        help=f"Duong dan toi file JSON de thi. Mac dinh: {DEFAULT_EXAM_FILE}",
    )
    parser.add_argument(
        "--db",
        default=str(DEFAULT_DB_FILE),
        help=f"Duong dan toi file SQLite. Mac dinh: {DEFAULT_DB_FILE}",
    )
    parser.add_argument(
        "--schema",
        default=str(DEFAULT_SCHEMA_FILE),
        help=f"Duong dan toi file schema SQL. Mac dinh: {DEFAULT_SCHEMA_FILE}",
    )
    return parser.parse_args()


def require_mapping(value: Any, path: str) -> dict[str, Any]:
    if not isinstance(value, dict):
        raise ImportValidationError(f"{path} phai la object.")
    return value


def require_list(value: Any, path: str) -> list[Any]:
    if not isinstance(value, list):
        raise ImportValidationError(f"{path} phai la array.")
    return value


def require_non_empty_string(value: Any, path: str) -> str:
    if not isinstance(value, str) or not value.strip():
        raise ImportValidationError(f"{path} phai la chuoi khong rong.")
    return value.strip()


def optional_string(value: Any, path: str) -> str | None:
    if value is None:
        return None
    if not isinstance(value, str):
        raise ImportValidationError(f"{path} phai la chuoi neu duoc cung cap.")
    trimmed = value.strip()
    return trimmed or None


def require_int(value: Any, path: str) -> int:
    if isinstance(value, bool) or not isinstance(value, int):
        raise ImportValidationError(f"{path} phai la so nguyen.")
    return value


def load_payload(file_path: Path) -> dict[str, Any]:
    if not file_path.exists():
        raise FileNotFoundError(f"Khong tim thay file de thi JSON: {file_path}")

    try:
        payload = json.loads(file_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise ImportValidationError(f"JSON khong hop le: {exc}") from exc

    return require_mapping(payload, "root")


def validate_payload(payload: dict[str, Any]) -> dict[str, Any]:
    subject_code = require_non_empty_string(payload.get("subject_code"), "subject_code").upper()
    topic_name = require_non_empty_string(payload.get("topic_name"), "topic_name")
    exam = require_mapping(payload.get("exam"), "exam")
    questions = require_list(payload.get("questions"), "questions")

    if not questions:
        raise ImportValidationError("questions phai co it nhat 1 cau hoi.")

    exam_title = require_non_empty_string(exam.get("title"), "exam.title")
    exam_description = optional_string(exam.get("description"), "exam.description")
    duration = require_int(exam.get("duration"), "exam.duration")
    if duration <= 0:
        raise ImportValidationError("exam.duration phai lon hon 0.")

    exam_type = require_non_empty_string(exam.get("exam_type"), "exam.exam_type")
    if exam_type not in VALID_EXAM_TYPES:
        raise ImportValidationError(
            f"exam.exam_type khong hop le. Ho tro: {', '.join(sorted(VALID_EXAM_TYPES))}."
        )

    declared_total_questions = exam.get("total_questions")
    if declared_total_questions is not None:
        declared_total_questions = require_int(declared_total_questions, "exam.total_questions")
        if declared_total_questions <= 0:
            raise ImportValidationError("exam.total_questions phai lon hon 0.")

    normalized_questions: list[dict[str, Any]] = []
    seen_question_contents: set[str] = set()

    for index, question in enumerate(questions, start=1):
        question_path = f"questions[{index - 1}]"
        question_data = require_mapping(question, question_path)
        content = require_non_empty_string(question_data.get("content"), f"{question_path}.content")
        dedupe_key = content.casefold()
        if dedupe_key in seen_question_contents:
            raise ImportValidationError(f"{question_path}.content bi trung trong cung file JSON.")
        seen_question_contents.add(dedupe_key)

        level = require_int(question_data.get("level", 1), f"{question_path}.level")
        if level not in VALID_LEVELS:
            raise ImportValidationError(f"{question_path}.level chi duoc tu 1 den 4.")

        question_type = require_non_empty_string(
            question_data.get("question_type", "single_choice"),
            f"{question_path}.question_type",
        )
        if question_type not in VALID_QUESTION_TYPES:
            raise ImportValidationError(
                f"{question_path}.question_type hien chi ho tro: {', '.join(sorted(VALID_QUESTION_TYPES))}."
            )

        obsidian_source_path = optional_string(
            question_data.get("obsidian_source_path"),
            f"{question_path}.obsidian_source_path",
        )

        answers = require_list(question_data.get("answers"), f"{question_path}.answers")
        if len(answers) != len(REQUIRED_SINGLE_CHOICE_LABELS):
            raise ImportValidationError(f"{question_path}.answers phai co dung 4 dap an A/B/C/D.")

        normalized_answers: list[dict[str, Any]] = []
        seen_labels: set[str] = set()
        correct_count = 0

        for answer_index, answer in enumerate(answers, start=1):
            answer_path = f"{question_path}.answers[{answer_index - 1}]"
            answer_data = require_mapping(answer, answer_path)
            option_label = require_non_empty_string(answer_data.get("option_label"), f"{answer_path}.option_label").upper()
            if option_label not in REQUIRED_SINGLE_CHOICE_LABELS:
                raise ImportValidationError(f"{answer_path}.option_label phai la mot trong A/B/C/D.")
            if option_label in seen_labels:
                raise ImportValidationError(f"{answer_path}.option_label bi trung.")
            seen_labels.add(option_label)

            answer_content = require_non_empty_string(answer_data.get("content"), f"{answer_path}.content")
            is_correct = answer_data.get("is_correct")
            if not isinstance(is_correct, bool):
                raise ImportValidationError(f"{answer_path}.is_correct phai la true/false.")
            if is_correct:
                correct_count += 1

            normalized_answers.append(
                {
                    "option_label": option_label,
                    "content": answer_content,
                    "is_correct": is_correct,
                }
            )

        expected_labels = set(REQUIRED_SINGLE_CHOICE_LABELS)
        if seen_labels != expected_labels:
            raise ImportValidationError(f"{question_path}.answers phai du cac nhan A/B/C/D.")
        if correct_count != 1:
            raise ImportValidationError(f"{question_path} phai co dung 1 dap an dung.")

        normalized_answers.sort(key=lambda answer: REQUIRED_SINGLE_CHOICE_LABELS.index(answer["option_label"]))
        normalized_questions.append(
            {
                "content": content,
                "level": level,
                "question_type": question_type,
                "obsidian_source_path": obsidian_source_path,
                "answers": normalized_answers,
            }
        )

    actual_total_questions = len(normalized_questions)
    if declared_total_questions is not None and declared_total_questions != actual_total_questions:
        print(
            "[WARN] exam.total_questions khong khop so cau hoi thuc te. "
            f"Su dung {actual_total_questions} thay vi {declared_total_questions}."
        )

    return {
        "subject_code": subject_code,
        "topic_name": topic_name,
        "exam": {
            "title": exam_title,
            "description": exam_description,
            "duration": duration,
            "exam_type": exam_type,
            "total_questions": actual_total_questions,
        },
        "questions": normalized_questions,
    }


def get_subject_id(connection: sqlite3.Connection, subject_code: str) -> int:
    row = connection.execute(
        "SELECT subject_id FROM subjects WHERE subject_code = ?",
        (subject_code,),
    ).fetchone()
    if row is None:
        raise ImportValidationError(
            f"Khong tim thay subject_code='{subject_code}' trong bang subjects. "
            "Hay seed schema truoc hoac them mon hoc vao database/schema.sql."
        )
    return int(row["subject_id"])


def get_or_create_topic(connection: sqlite3.Connection, subject_id: int, topic_name: str) -> tuple[int, bool]:
    row = connection.execute(
        """
        SELECT topic_id
        FROM topics
        WHERE subject_id = ? AND parent_topic_id IS NULL AND lower(topic_name) = lower(?)
        """,
        (subject_id, topic_name),
    ).fetchone()
    if row is not None:
        return int(row["topic_id"]), False

    max_order_row = connection.execute(
        "SELECT COALESCE(MAX(topic_order), 0) AS max_order FROM topics WHERE subject_id = ?",
        (subject_id,),
    ).fetchone()
    next_topic_order = int(max_order_row["max_order"]) + 1
    cursor = connection.execute(
        """
        INSERT INTO topics (subject_id, topic_name, topic_order, description)
        VALUES (?, ?, ?, ?)
        """,
        (subject_id, topic_name, next_topic_order, f"Imported from JSON: {topic_name}"),
    )
    return int(cursor.lastrowid), True


def ensure_exam_not_exists(connection: sqlite3.Connection, subject_id: int, exam_title: str) -> None:
    row = connection.execute(
        """
        SELECT exam_id
        FROM exams
        WHERE subject_id = ? AND lower(title) = lower(?)
        """,
        (subject_id, exam_title),
    ).fetchone()
    if row is not None:
        raise ImportValidationError(
            f"De thi '{exam_title}' da ton tai voi exam_id={row['exam_id']}. "
            "Importer dung lai de tranh append du lieu trung."
        )


def create_exam(connection: sqlite3.Connection, subject_id: int, exam_data: dict[str, Any]) -> int:
    cursor = connection.execute(
        """
        INSERT INTO exams (title, description, subject_id, exam_type, duration, total_questions)
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (
            exam_data["title"],
            exam_data["description"],
            subject_id,
            exam_data["exam_type"],
            exam_data["duration"],
            exam_data["total_questions"],
        ),
    )
    return int(cursor.lastrowid)


def get_or_create_question(
    connection: sqlite3.Connection,
    topic_id: int,
    question_data: dict[str, Any],
) -> tuple[int, bool]:
    row = connection.execute(
        """
        SELECT question_id
        FROM questions
        WHERE topic_id = ? AND lower(content) = lower(?)
        """,
        (topic_id, question_data["content"]),
    ).fetchone()
    if row is not None:
        return int(row["question_id"]), False

    cursor = connection.execute(
        """
        INSERT INTO questions (topic_id, content, level, question_type, obsidian_source_path)
        VALUES (?, ?, ?, ?, ?)
        """,
        (
            topic_id,
            question_data["content"],
            question_data["level"],
            question_data["question_type"],
            question_data["obsidian_source_path"],
        ),
    )
    return int(cursor.lastrowid), True


def ensure_answers_for_question(
    connection: sqlite3.Connection,
    question_id: int,
    answers: list[dict[str, Any]],
) -> tuple[int, bool]:
    existing_count_row = connection.execute(
        "SELECT COUNT(*) AS total FROM answers WHERE question_id = ?",
        (question_id,),
    ).fetchone()
    existing_count = int(existing_count_row["total"])
    if existing_count > 0:
        return existing_count, False

    for display_order, answer in enumerate(answers, start=1):
        connection.execute(
            """
            INSERT INTO answers (question_id, option_label, content, is_correct, display_order)
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                question_id,
                answer["option_label"],
                answer["content"],
                1 if answer["is_correct"] else 0,
                display_order,
            ),
        )
    return len(answers), True


def link_question_to_exam(
    connection: sqlite3.Connection,
    exam_id: int,
    question_id: int,
    question_order: int,
) -> None:
    connection.execute(
        """
        INSERT INTO exam_questions (exam_id, question_id, question_order)
        VALUES (?, ?, ?)
        """,
        (exam_id, question_id, question_order),
    )


def import_exam(connection: sqlite3.Connection, payload: dict[str, Any]) -> dict[str, Any]:
    subject_id = get_subject_id(connection, payload["subject_code"])

    with connection:
        topic_id, created_topic = get_or_create_topic(connection, subject_id, payload["topic_name"])
        ensure_exam_not_exists(connection, subject_id, payload["exam"]["title"])
        exam_id = create_exam(connection, subject_id, payload["exam"])

        created_questions = 0
        reused_questions = 0
        created_answers = 0
        reused_answers = 0

        for order, question_data in enumerate(payload["questions"], start=1):
            question_id, created_question = get_or_create_question(connection, topic_id, question_data)
            if created_question:
                created_questions += 1
            else:
                reused_questions += 1

            answer_count, created_answer_set = ensure_answers_for_question(
                connection,
                question_id,
                question_data["answers"],
            )
            if created_answer_set:
                created_answers += answer_count
            else:
                reused_answers += answer_count

            link_question_to_exam(connection, exam_id, question_id, order)

    return {
        "subject_id": subject_id,
        "topic_id": topic_id,
        "exam_id": exam_id,
        "created_topic": created_topic,
        "created_questions": created_questions,
        "reused_questions": reused_questions,
        "created_answers": created_answers,
        "reused_answers": reused_answers,
        "total_exam_questions": len(payload["questions"]),
    }


def print_summary(db_file: Path, file_path: Path, payload: dict[str, Any], result: dict[str, Any]) -> None:
    print("=" * 72)
    print("[DONE] Import de thi thanh cong")
    print("=" * 72)
    print(f"JSON file       : {file_path}")
    print(f"Database file   : {db_file}")
    print(f"Mon hoc         : {payload['subject_code']} (subject_id={result['subject_id']})")
    print(
        f"Chuyen de       : {payload['topic_name']} "
        f"(topic_id={result['topic_id']}, created={result['created_topic']})"
    )
    print(f"De thi          : {payload['exam']['title']} (exam_id={result['exam_id']})")
    print(f"So cau trong de : {result['total_exam_questions']}")
    print(f"Cau hoi moi     : {result['created_questions']}")
    print(f"Cau hoi reuse   : {result['reused_questions']}")
    print(f"Dap an moi      : {result['created_answers']}")
    print(f"Dap an reuse    : {result['reused_answers']}")


def main() -> int:
    args = parse_args()
    file_path = Path(args.file).resolve()
    db_file = Path(args.db).resolve()
    schema_file = Path(args.schema).resolve()

    try:
        payload = validate_payload(load_payload(file_path))
        connection = initialize_database(db_file, schema_file)
        try:
            result = import_exam(connection, payload)
        finally:
            connection.close()
        print_summary(db_file, file_path, payload, result)
        return 0
    except (FileNotFoundError, ImportValidationError, sqlite3.Error) as exc:
        print(f"[ERROR] {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
