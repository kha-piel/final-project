from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")


DEFAULT_EXAM_SLUG = "thpt-van-lang-ha-noi-2025"
DEFAULT_QUESTIONS_JSON = f"obsidian_vault/parsed/Toan/{DEFAULT_EXAM_SLUG}/questions.json"
DEFAULT_OUTPUT_SQL = f"web-app/supabase/seed_school_exam_questions_{DEFAULT_EXAM_SLUG}.sql"
DEFAULT_EXAM_ID = "thpt-van-lang-ha-noi"


def resolve_project_root() -> Path:
    return Path(__file__).resolve().parent.parent


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Sinh seed SQL cho school_exam_questions/options/assets tu questions.json."
    )
    parser.add_argument("--questions-json", default=DEFAULT_QUESTIONS_JSON)
    parser.add_argument("--output-sql", default=DEFAULT_OUTPUT_SQL)
    parser.add_argument("--exam-id", default=DEFAULT_EXAM_ID)
    return parser.parse_args()


def load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def sql_quote(value: str | None) -> str:
    if value is None:
        return "null"
    return "'" + value.replace("'", "''") + "'"


def sql_json(value: Any) -> str:
    payload = json.dumps(value, ensure_ascii=False)
    return sql_quote(payload) + "::jsonb"


def infer_section_id(exam_id: str, part: str) -> str:
    section_suffix = {
        "multiple_choice": "1",
        "true_false": "2",
        "short_answer": "3",
    }.get(part, "1")
    return f"{exam_id}-section-{section_suffix}"


def build_question_id(exam_id: str, question_number: int) -> str:
    return f"{exam_id}-q{question_number:02d}"


def build_option_id(question_id: str, label: str) -> str:
    return f"{question_id}-opt-{label.lower()}"


def build_asset_id(question_id: str, asset_type: str, order: int) -> str:
    return f"{question_id}-asset-{asset_type}-{order}"


def infer_difficulty_level(item: dict[str, Any]) -> int:
    explicit_level = item.get("difficulty_level")
    if isinstance(explicit_level, int) and 1 <= explicit_level <= 4:
        return explicit_level

    metadata = item.get("metadata", {})
    if isinstance(metadata, dict):
        metadata_level = metadata.get("difficulty_level")
        if isinstance(metadata_level, int) and 1 <= metadata_level <= 4:
            return metadata_level

    part = str(item.get("part", item.get("question_type", "multiple_choice")))
    source_question_number = int(item.get("source_question_number") or item.get("question_number") or 1)

    if part == "multiple_choice":
        if source_question_number <= 4:
            return 1
        if source_question_number <= 8:
            return 2
        if source_question_number <= 11:
            return 3
        return 4

    if part == "true_false":
        if source_question_number <= 2:
            return 2
        if source_question_number == 3:
            return 3
        return 4

    if source_question_number <= 2:
        return 1
    if source_question_number <= 4:
        return 2
    if source_question_number == 5:
        return 3
    return 4


def build_seed_sql(exam_id: str, payload: dict[str, Any]) -> str:
    questions = payload.get("questions", [])

    lines: list[str] = ["begin;", ""]
    lines.extend(
        [
            "delete from public.school_exam_question_assets",
            f"where question_id in (select question_id from public.school_exam_questions where exam_id = {sql_quote(exam_id)});",
            "",
            "delete from public.school_exam_question_options",
            f"where question_id in (select question_id from public.school_exam_questions where exam_id = {sql_quote(exam_id)});",
            "",
            "delete from public.school_exam_questions",
            f"where exam_id = {sql_quote(exam_id)};",
            "",
        ]
    )

    for item in questions:
        question_number = int(item["question_number"])
        question_id = build_question_id(exam_id, question_number)
        part = str(item.get("part", "multiple_choice"))
        section_id = infer_section_id(exam_id, part)
        statement_json = item.get("statements", [])
        difficulty_level = infer_difficulty_level(item)
        metadata = {
          "source_question_number": item.get("source_question_number"),
          "section_number": item.get("section_number"),
          "difficulty_level": difficulty_level,
          "notes": item.get("notes", ""),
          "review_status": item.get("review_status", "pending_review"),
        }

        lines.append("insert into public.school_exam_questions (")
        lines.append("  question_id, exam_id, section_id, question_number, difficulty_level, question_type,")
        lines.append("  question_text, statement_json, explanation, topic, obsidian_source_path,")
        lines.append("  has_image, metadata")
        lines.append(") values (")
        lines.append(f"  {sql_quote(question_id)},")
        lines.append(f"  {sql_quote(exam_id)},")
        lines.append(f"  {sql_quote(section_id)},")
        lines.append(f"  {question_number},")
        lines.append(f"  {difficulty_level},")
        lines.append(f"  {sql_quote(str(item.get('question_type', part)))},")
        lines.append(f"  {sql_quote(str(item.get('question_text', '')))},")
        lines.append(f"  {sql_json(statement_json)},")
        lines.append(f"  {sql_quote(item.get('explanation')) if item.get('explanation') else 'null'},")
        lines.append(f"  {sql_quote(item.get('topic')) if item.get('topic') else 'null'},")
        lines.append(
            f"  {sql_quote(item.get('obsidian_source_path')) if item.get('obsidian_source_path') else 'null'},"
        )
        lines.append(f"  {'true' if item.get('has_image') else 'false'},")
        lines.append(f"  {sql_json(metadata)}")
        lines.append(");")
        lines.append("")

        options: dict[str, str] = item.get("options", {})
        for order, label in enumerate(sorted(options.keys()), start=1):
            option_id = build_option_id(question_id, label)
            lines.append("insert into public.school_exam_question_options (")
            lines.append("  option_id, question_id, option_label, option_text, display_order")
            lines.append(") values (")
            lines.append(f"  {sql_quote(option_id)},")
            lines.append(f"  {sql_quote(question_id)},")
            lines.append(f"  {sql_quote(label)},")
            lines.append(f"  {sql_quote(options[label])},")
            lines.append(f"  {order}")
            lines.append(");")
            lines.append("")

        asset_paths: list[str] = item.get("asset_paths", [])
        for order, asset_path in enumerate(asset_paths, start=1):
            asset_type = "question_block" if order == 1 else "figure"
            asset_id = build_asset_id(question_id, asset_type, order)
            lines.append("insert into public.school_exam_question_assets (")
            lines.append("  asset_id, question_id, asset_type, asset_path, caption, display_order")
            lines.append(") values (")
            lines.append(f"  {sql_quote(asset_id)},")
            lines.append(f"  {sql_quote(question_id)},")
            lines.append(f"  {sql_quote(asset_type)},")
            lines.append(f"  {sql_quote(asset_path)},")
            lines.append("  null,")
            lines.append(f"  {order}")
            lines.append(");")
            lines.append("")

    lines.append("commit;")
    lines.append("")
    return "\n".join(lines)


def main() -> int:
    args = parse_args()
    project_root = resolve_project_root()

    questions_json_path = (project_root / args.questions_json).resolve()
    output_sql_path = (project_root / args.output_sql).resolve()

    if not questions_json_path.exists():
        print(f"[FATAL] Khong tim thay questions.json: {questions_json_path}")
        return 1

    payload = load_json(questions_json_path)
    sql_text = build_seed_sql(args.exam_id, payload)
    output_sql_path.parent.mkdir(parents=True, exist_ok=True)
    output_sql_path.write_text(sql_text, encoding="utf-8")

    print("=== Seed SQL complete ===")
    print(f"Questions JSON : {questions_json_path}")
    print(f"Output SQL     : {output_sql_path}")
    print(f"Questions      : {len(payload.get('questions', []))}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
