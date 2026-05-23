import os
import sqlite3
from pathlib import Path

import pg8000.native


ROOT_DIR = Path(__file__).resolve().parents[2]
SQLITE_PATH = ROOT_DIR / "data" / "thptqg_ai.db"
ROOT_ENV_PATH = ROOT_DIR / ".env"


def read_env_file(path: Path) -> dict[str, str]:
    values: dict[str, str] = {}
    if not path.exists():
        return values

    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue

        key, value = line.split("=", 1)
        values[key.strip()] = value.strip()

    return values


def resolve_db_config() -> dict[str, str]:
    env_values = read_env_file(ROOT_ENV_PATH)
    db_url = env_values.get("SUPABASE_DB_URL", "")
    if not db_url.startswith("jdbc:postgresql://"):
        raise RuntimeError("SUPABASE_DB_URL is missing or has an unsupported format.")

    host_and_db = db_url.removeprefix("jdbc:postgresql://")
    host_port, database = host_and_db.split("/", 1)
    host, port = host_port.split(":", 1)

    password = os.environ.get("SUPABASE_DB_PASSWORD") or env_values.get("SUPABASE_DB_PASSWORD")
    user = os.environ.get("SUPABASE_DB_USER") or env_values.get("SUPABASE_DB_USER")

    if not user or not password:
        raise RuntimeError("SUPABASE_DB_USER or SUPABASE_DB_PASSWORD is missing.")

    return {
        "host": host,
        "port": port,
        "database": database,
        "user": user,
        "password": password,
    }


def open_sqlite() -> sqlite3.Connection:
    if not SQLITE_PATH.exists():
        raise FileNotFoundError(f"SQLite database not found: {SQLITE_PATH}")

    connection = sqlite3.connect(SQLITE_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def open_postgres():
    config = resolve_db_config()
    return pg8000.native.Connection(
        host=config["host"],
        port=int(config["port"]),
        database=config["database"],
        user=config["user"],
        password=config["password"],
        ssl_context=True,
    )


def fetch_all(connection: sqlite3.Connection, query: str):
    return connection.execute(query).fetchall()


def scalar(connection, query: str, params: tuple):
    rows = run_query(connection, query, params)
    if not rows:
        return None
    return rows[0][0]


def run_query(connection, query: str, params):
    if isinstance(params, dict):
        return connection.run(query, **params)

    if isinstance(params, tuple):
        return connection.run(query, params)

    return connection.run(query)


def upsert_subjects(sqlite_conn: sqlite3.Connection, pg_conn) -> dict[int, str]:
    subject_map: dict[int, str] = {}
    for row in fetch_all(
        sqlite_conn,
        """
        select subject_id, subject_code, subject_name, is_active
        from subjects
        order by subject_id
        """,
    ):
        subject_uuid = scalar(
            pg_conn,
            """
            insert into public.subjects (subject_code, subject_name, is_active)
            values (:subject_code, :subject_name, :is_active)
            on conflict (subject_code) do update
            set subject_name = excluded.subject_name,
                is_active = excluded.is_active
            returning subject_id
            """,
            {
                "subject_code": row["subject_code"],
                "subject_name": row["subject_name"],
                "is_active": bool(row["is_active"]),
            },
        )
        subject_map[row["subject_id"]] = subject_uuid

    return subject_map


def upsert_topics(sqlite_conn: sqlite3.Connection, pg_conn, subject_map: dict[int, str]) -> dict[int, str]:
    topic_map: dict[int, str] = {}
    topic_rows = fetch_all(
        sqlite_conn,
        """
        select topic_id, subject_id, parent_topic_id, topic_name, topic_order, description, is_active
        from topics
        order by topic_id
        """,
    )

    for row in topic_rows:
        topic_uuid = scalar(
            pg_conn,
            """
            insert into public.topics (
                subject_id,
                parent_topic_id,
                topic_name,
                topic_order,
                description,
                is_active
            )
            values (
                :subject_id,
                null,
                :topic_name,
                :topic_order,
                :description,
                :is_active
            )
            on conflict (subject_id, topic_name) do update
            set topic_order = excluded.topic_order,
                description = excluded.description,
                is_active = excluded.is_active
            returning topic_id
            """,
            {
                "subject_id": subject_map[row["subject_id"]],
                "topic_name": row["topic_name"],
                "topic_order": row["topic_order"] or 0,
                "description": row["description"],
                "is_active": bool(row["is_active"]),
            },
        )
        topic_map[row["topic_id"]] = topic_uuid

    for row in topic_rows:
        if row["parent_topic_id"] is None:
            continue

            run_query(
                pg_conn,
                """
                update public.topics
                set parent_topic_id = :parent_topic_id
                where topic_id = :topic_id
                """,
            {
                "topic_id": topic_map[row["topic_id"]],
                "parent_topic_id": topic_map[row["parent_topic_id"]],
            },
        )

    return topic_map


def upsert_questions(sqlite_conn: sqlite3.Connection, pg_conn, topic_map: dict[int, str]) -> dict[int, str]:
    question_map: dict[int, str] = {}
    question_rows = fetch_all(
        sqlite_conn,
        """
        select
            question_id,
            topic_id,
            content,
            image_url,
            level,
            question_type,
            year,
            is_official,
            source,
            obsidian_source_path,
            is_active
        from questions
        order by question_id
        """,
    )

    for row in question_rows:
        existing_id = scalar(
            pg_conn,
            """
            select question_id
            from public.questions
            where topic_id = :topic_id
              and content = :content
            limit 1
            """,
            {
                "topic_id": topic_map[row["topic_id"]],
                "content": row["content"],
            },
        )

        if existing_id:
            run_query(
                pg_conn,
                """
                update public.questions
                set image_url = :image_url,
                    level = :level,
                    question_type = :question_type,
                    year = :year,
                    is_official = :is_official,
                    source = :source,
                    obsidian_source_path = :obsidian_source_path,
                    is_active = :is_active
                where question_id = :question_id
                """,
                {
                    "question_id": existing_id,
                    "image_url": row["image_url"],
                    "level": row["level"],
                    "question_type": row["question_type"],
                    "year": row["year"],
                    "is_official": bool(row["is_official"]),
                    "source": row["source"],
                    "obsidian_source_path": row["obsidian_source_path"],
                    "is_active": bool(row["is_active"]),
                },
            )
            question_map[row["question_id"]] = existing_id
            continue

        question_uuid = scalar(
            pg_conn,
            """
            insert into public.questions (
                topic_id,
                content,
                image_url,
                level,
                question_type,
                year,
                is_official,
                source,
                obsidian_source_path,
                is_active
            )
            values (
                :topic_id,
                :content,
                :image_url,
                :level,
                :question_type,
                :year,
                :is_official,
                :source,
                :obsidian_source_path,
                :is_active
            )
            returning question_id
            """,
            {
                "topic_id": topic_map[row["topic_id"]],
                "content": row["content"],
                "image_url": row["image_url"],
                "level": row["level"],
                "question_type": row["question_type"],
                "year": row["year"],
                "is_official": bool(row["is_official"]),
                "source": row["source"],
                "obsidian_source_path": row["obsidian_source_path"],
                "is_active": bool(row["is_active"]),
            },
        )
        question_map[row["question_id"]] = question_uuid

    return question_map


def upsert_answers(sqlite_conn: sqlite3.Connection, pg_conn, question_map: dict[int, str]) -> None:
    for row in fetch_all(
        sqlite_conn,
        """
        select
            answer_id,
            question_id,
            option_label,
            content,
            is_correct,
            explanation,
            display_order
        from answers
        order by answer_id
        """,
    ):
        run_query(
            pg_conn,
            """
            insert into public.answers (
                question_id,
                option_label,
                content,
                is_correct,
                explanation,
                display_order
            )
            values (
                :question_id,
                :option_label,
                :content,
                :is_correct,
                :explanation,
                :display_order
            )
            on conflict (question_id, option_label) do update
            set content = excluded.content,
                is_correct = excluded.is_correct,
                explanation = excluded.explanation,
                display_order = excluded.display_order
            """,
            {
                "question_id": question_map[row["question_id"]],
                "option_label": row["option_label"],
                "content": row["content"],
                "is_correct": bool(row["is_correct"]),
                "explanation": row["explanation"],
                "display_order": row["display_order"] or 0,
            },
        )


def print_counts(pg_conn) -> None:
    tables = ["subjects", "topics", "questions", "answers"]
    for table in tables:
        count = scalar(pg_conn, f"select count(*) from public.{table}", ())
        print(f"{table}: {count}")


def main() -> None:
    sqlite_conn = open_sqlite()
    pg_conn = open_postgres()

    try:
        run_query(pg_conn, "begin", ())
        subject_map = upsert_subjects(sqlite_conn, pg_conn)
        topic_map = upsert_topics(sqlite_conn, pg_conn, subject_map)
        question_map = upsert_questions(sqlite_conn, pg_conn, topic_map)
        upsert_answers(sqlite_conn, pg_conn, question_map)
        run_query(pg_conn, "commit", ())
        print("SQLite content migrated to Supabase successfully.")
        print_counts(pg_conn)
    except Exception:
        run_query(pg_conn, "rollback", ())
        raise
    finally:
        sqlite_conn.close()
        pg_conn.close()


if __name__ == "__main__":
    main()
