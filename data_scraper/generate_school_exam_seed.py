from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")


DEFAULT_CONFIG = "data_scraper/exams/thpt-van-lang-ha-noi-2025.school_exam.json"


def resolve_project_root() -> Path:
    return Path(__file__).resolve().parent.parent


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Sinh seed SQL cho school_exams / sections / variants / answer_keys tu exam config."
    )
    parser.add_argument("--config", default=DEFAULT_CONFIG)
    return parser.parse_args()


def load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def sql_quote(value: str | None) -> str:
    if value is None:
        return "null"
    return "'" + value.replace("'", "''") + "'"


def sql_array(values: list[str]) -> str:
    quoted = ", ".join(sql_quote(value) for value in values)
    return f"array[{quoted}]"


def build_seed_sql(config: dict[str, Any], answer_key: dict[str, Any]) -> str:
    exam_id = str(config["exam_id"])
    variant_id = str(config["variant_id"])
    variant_code = str(config["variant_code"])
    sections: list[dict[str, Any]] = config["sections"]
    answers: dict[str, str] = answer_key["answers"]

    lines: list[str] = ["begin;", ""]
    lines.extend(
        [
            "delete from public.school_exam_answer_keys",
            f"where variant_id in ({sql_quote(variant_id)});",
            "",
            "delete from public.school_exam_variants",
            f"where variant_id in ({sql_quote(variant_id)});",
            "",
            "delete from public.school_exam_sections",
            f"where exam_id in ({sql_quote(exam_id)});",
            "",
            "delete from public.school_exam_question_assets",
            f"where question_id in (select question_id from public.school_exam_questions where exam_id = {sql_quote(exam_id)});",
            "",
            "delete from public.school_exam_question_options",
            f"where question_id in (select question_id from public.school_exam_questions where exam_id = {sql_quote(exam_id)});",
            "",
            "delete from public.school_exam_questions",
            f"where exam_id in ({sql_quote(exam_id)});",
            "",
            "delete from public.school_exams",
            f"where exam_id in ({sql_quote(exam_id)});",
            "",
        ]
    )

    lines.extend(
        [
            "insert into public.school_exams (",
            "  exam_id, title, school_name, city, subject_code, subject_name,",
            "  year, duration_minutes, pdf_url, answer_key_provided, source_path, tags, is_active",
            ") values (",
            f"  {sql_quote(exam_id)},",
            f"  {sql_quote(str(config['title']))},",
            f"  {sql_quote(str(config['school_name']))},",
            f"  {sql_quote(str(config['city']))},",
            f"  {sql_quote(str(config['subject_code']))},",
            f"  {sql_quote(str(config['subject_name']))},",
            f"  {int(config['year'])},",
            f"  {int(config['duration_minutes'])},",
            f"  {sql_quote(str(config['pdf_public_url']))},",
            "  true,",
            f"  {sql_quote(str(config['source_path']))},",
            f"  {sql_array(list(config.get('tags', [])))},",
            "  true",
            ");",
            "",
        ]
    )

    lines.append("insert into public.school_exam_sections (")
    lines.append("  section_id, exam_id, part_code, title, instructions,")
    lines.append("  start_question_number, end_question_number, display_order, options_per_question, statement_count")
    lines.append(") values")
    section_lines: list[str] = []
    for section in sections:
        section_id = f"{exam_id}-section-{section['display_order']}"
        section_lines.append(
            "\n".join(
                [
                    "  (",
                    f"    {sql_quote(section_id)},",
                    f"    {sql_quote(exam_id)},",
                    f"    {sql_quote(str(section['part_code']))},",
                    f"    {sql_quote(str(section['title']))},",
                    f"    {sql_quote(str(section['instructions'])) if section.get('instructions') else 'null'},",
                    f"    {int(section['start_question_number'])},",
                    f"    {int(section['end_question_number'])},",
                    f"    {int(section['display_order'])},",
                    f"    {int(section['options_per_question'])},",
                    f"    {int(section['statement_count'])}",
                    "  )",
                ]
            )
        )
    lines.append(",\n".join(section_lines) + ";")
    lines.append("")

    lines.extend(
        [
            "insert into public.school_exam_variants (",
            "  variant_id, exam_id, variant_code, display_order",
            ") values (",
            f"  {sql_quote(variant_id)},",
            f"  {sql_quote(exam_id)},",
            f"  {sql_quote(variant_code)},",
            "  1",
            ");",
            "",
        ]
    )

    lines.append("insert into public.school_exam_answer_keys (")
    lines.append("  variant_id, question_number, answer_value")
    lines.append(") values")
    answer_lines = [
        f"  ({sql_quote(variant_id)}, {int(question_number)}, {sql_quote(str(answer_value))})"
        for question_number, answer_value in sorted(answers.items(), key=lambda item: int(item[0]))
    ]
    lines.append(",\n".join(answer_lines) + ";")
    lines.append("")
    lines.append("commit;")
    lines.append("")
    return "\n".join(lines)


def main() -> int:
    args = parse_args()
    project_root = resolve_project_root()
    config_path = (project_root / args.config).resolve()

    if not config_path.exists():
        print(f"[FATAL] Khong tim thay config: {config_path}")
        return 1

    config = load_json(config_path)
    answer_key_path = (project_root / config["answer_key_path"]).resolve()
    output_sql_path = (project_root / config["exam_seed_sql_path"]).resolve()

    if not answer_key_path.exists():
        print(f"[FATAL] Khong tim thay answer_key.json: {answer_key_path}")
        return 1

    answer_key = load_json(answer_key_path)
    sql_text = build_seed_sql(config, answer_key)
    output_sql_path.parent.mkdir(parents=True, exist_ok=True)
    output_sql_path.write_text(sql_text, encoding="utf-8")

    print("=== School exam seed complete ===")
    print(f"Config      : {config_path}")
    print(f"Answer key  : {answer_key_path}")
    print(f"Output SQL  : {output_sql_path}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
