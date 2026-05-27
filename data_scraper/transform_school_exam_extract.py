from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")


DEFAULT_EXAM_SLUG = "thpt-van-lang-ha-noi-2025"
DEFAULT_EXTRACT_JSON = (
    f"data_scraper/output/school_exams/json/{DEFAULT_EXAM_SLUG}/school_exam_input.json"
)
DEFAULT_MANIFEST = f"obsidian_vault/assets/Toan/{DEFAULT_EXAM_SLUG}/manifest.json"
DEFAULT_ANSWER_KEY = f"obsidian_vault/parsed/Toan/{DEFAULT_EXAM_SLUG}/answer_key.json"
DEFAULT_OUTPUT = f"obsidian_vault/parsed/Toan/{DEFAULT_EXAM_SLUG}/questions.json"


def resolve_project_root() -> Path:
    return Path(__file__).resolve().parent.parent


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Chuyen output Gemini school exam sang questions.json de review nhanh."
    )
    parser.add_argument("--extract-json", default=DEFAULT_EXTRACT_JSON)
    parser.add_argument("--manifest", default=DEFAULT_MANIFEST)
    parser.add_argument("--answer-key", default=DEFAULT_ANSWER_KEY)
    parser.add_argument("--output", default=DEFAULT_OUTPUT)
    return parser.parse_args()


def load_json(path: Path) -> Any:
    with path.open("r", encoding="utf-8") as file:
        return json.load(file)


def normalize_option_map(options: list[dict[str, Any]]) -> dict[str, str]:
    return {
        str(option.get("label", "")).strip().upper(): str(option.get("text", "")).strip()
        for option in options
        if str(option.get("label", "")).strip()
    }


def normalize_part_code(value: Any) -> str:
    normalized = str(value or "").strip().lower()
    aliases = {
        "multiple_choice": "multiple_choice",
        "true_false": "true_false",
        "short_answer": "short_answer",
    }
    return aliases.get(normalized, normalized)


def build_asset_maps(
    manifest: dict[str, Any],
) -> tuple[dict[int, dict[str, Any]], dict[tuple[str, int], dict[str, Any]]]:
    canonical_map: dict[int, dict[str, Any]] = {}
    source_map: dict[tuple[str, int], dict[str, Any]] = {}

    for item in manifest.get("assets", []):
        payload = {
            "question_block": item.get("question_block"),
            "figures": item.get("figures", []),
        }

        if item.get("question_number") is not None:
            question_number = int(item["question_number"])
            canonical_map[question_number] = payload

        source_question_number = item.get("source_question_number")
        part_code = normalize_part_code(item.get("part_code", item.get("question_type")))
        if source_question_number is not None and part_code:
            source_map[(part_code, int(source_question_number))] = payload

    return canonical_map, source_map


def build_answer_key_map(answer_key: dict[str, Any]) -> dict[int, str]:
    return {
        int(question_number): str(answer_value)
        for question_number, answer_value in answer_key.get("answers", {}).items()
    }


def transform(extract_payload: dict[str, Any], manifest: dict[str, Any], answer_key: dict[str, Any]) -> dict[str, Any]:
    canonical_asset_map, source_asset_map = build_asset_maps(manifest)
    answer_key_map = build_answer_key_map(answer_key)

    questions: list[dict[str, Any]] = []
    global_question_offset = 0

    for section in extract_payload.get("sections", []):
        section_number = int(section.get("section_number", 0))
        section_type = str(section.get("section_type", "")).strip()
        section_questions = section.get("questions", [])

        for question in section_questions:
            local_question_number = int(question.get("question_number", 0))
            canonical_question_number = global_question_offset + local_question_number
            assets = canonical_asset_map.get(canonical_question_number) or source_asset_map.get(
                (section_type, local_question_number),
                {},
            )
            option_map = normalize_option_map(question.get("options", []))

            questions.append(
                {
                    "question_number": canonical_question_number,
                    "source_question_number": local_question_number,
                    "section_number": section_number,
                    "part": section_type,
                    "question_type": str(question.get("type", section_type)).strip(),
                    "question_text": str(question.get("stem", "")).strip(),
                    "options": option_map,
                    "statements": [
                        {
                            "label": str(statement.get("label", "")).strip(),
                            "text": str(statement.get("text", statement.get("content", ""))).strip(),
                        }
                        for statement in question.get("statements", [])
                    ],
                    "correct_answer": answer_key_map.get(canonical_question_number, ""),
                    "has_image": bool(question.get("has_image", False)),
                    "asset_paths": [
                        item
                        for item in [assets.get("question_block"), *(assets.get("figures", []))]
                        if item
                    ],
                    "topic": "",
                    "obsidian_source_path": "",
                    "notes": str(question.get("notes", "")).strip(),
                    "review_status": "pending_review",
                }
            )

        global_question_offset += len(section_questions)

    questions.sort(key=lambda item: item["question_number"])
    return {
        "exam_slug": manifest.get("exam_slug", answer_key.get("exam_slug", "")),
        "source_pdf": extract_payload.get("source_pdf", ""),
        "variant_code": answer_key.get("variant_code", "DEFAULT"),
        "question_count": len(questions),
        "questions": questions,
    }


def main() -> int:
    args = parse_args()
    project_root = resolve_project_root()

    extract_json_path = (project_root / args.extract_json).resolve()
    manifest_path = (project_root / args.manifest).resolve()
    answer_key_path = (project_root / args.answer_key).resolve()
    output_path = (project_root / args.output).resolve()

    missing_paths = [
        path
        for path in [extract_json_path, manifest_path, answer_key_path]
        if not path.exists()
    ]
    if missing_paths:
        for path in missing_paths:
            print(f"[FATAL] Khong tim thay file dau vao: {path}")
        return 1

    extract_payload = load_json(extract_json_path)
    manifest = load_json(manifest_path)
    answer_key = load_json(answer_key_path)

    payload = transform(extract_payload, manifest, answer_key)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")

    print("=== Transform complete ===")
    print(f"Extract JSON : {extract_json_path}")
    print(f"Manifest     : {manifest_path}")
    print(f"Answer key   : {answer_key_path}")
    print(f"Output       : {output_path}")
    print(f"Questions    : {payload['question_count']}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
