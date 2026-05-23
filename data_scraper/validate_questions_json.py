from __future__ import annotations

import argparse
import json
import sys
from collections import Counter
from pathlib import Path
from typing import Any

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")


DEFAULT_EXAM_SLUG = "thpt-van-lang-ha-noi-2025"
DEFAULT_QUESTIONS_JSON = f"obsidian_vault/parsed/Toan/{DEFAULT_EXAM_SLUG}/questions.json"
DEFAULT_ASSET_DIR = f"obsidian_vault/assets/Toan/{DEFAULT_EXAM_SLUG}"


def resolve_project_root() -> Path:
    return Path(__file__).resolve().parent.parent


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Validate questions.json truoc khi sinh seed SQL va import Supabase."
    )
    parser.add_argument("--questions-json", default=DEFAULT_QUESTIONS_JSON)
    parser.add_argument("--asset-dir", default=DEFAULT_ASSET_DIR)
    return parser.parse_args()


def load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def is_blank(value: Any) -> bool:
    return not isinstance(value, str) or not value.strip()


def validate_question(item: dict[str, Any], asset_dir: Path) -> tuple[list[str], list[str]]:
    errors: list[str] = []
    warnings: list[str] = []

    question_number = item.get("question_number")
    prefix = f"Cau {question_number}"
    part = item.get("part")
    question_text = item.get("question_text", "")
    options = item.get("options", {})
    statements = item.get("statements", [])
    asset_paths = item.get("asset_paths", [])

    if question_number is None:
      errors.append("Thieu question_number.")

    if part not in {"multiple_choice", "true_false", "short_answer"}:
        errors.append(f"{prefix}: part khong hop le: {part!r}.")

    if is_blank(question_text):
        errors.append(f"{prefix}: question_text dang rong.")

    if part == "multiple_choice":
        required_labels = ["A", "B", "C", "D"]
        for label in required_labels:
            if label not in options:
                errors.append(f"{prefix}: thieu dap an lua chon {label}.")
            elif is_blank(options[label]):
                errors.append(f"{prefix}: option {label} dang rong.")

        if len(options) != 4:
            warnings.append(f"{prefix}: so option hien tai = {len(options)}, ky vong 4.")

        correct_answer = str(item.get("correct_answer", "")).strip().upper()
        if correct_answer not in {"A", "B", "C", "D"}:
            errors.append(f"{prefix}: correct_answer cho trac nghiem khong hop le: {correct_answer!r}.")

    if part == "true_false":
        if len(statements) != 4:
            errors.append(f"{prefix}: phan Dung/Sai can dung 4 menh de, hien tai = {len(statements)}.")

        labels = []
        for index, statement in enumerate(statements, start=1):
            label = str(statement.get("label", "")).strip().lower()
            text = statement.get("text", "")
            labels.append(label)
            if label not in {"a", "b", "c", "d"}:
                errors.append(f"{prefix}: label menh de thu {index} khong hop le: {label!r}.")
            if is_blank(text):
                errors.append(f"{prefix}: menh de {label or index} dang rong.")

        if labels and labels != ["a", "b", "c", "d"]:
            warnings.append(f"{prefix}: thu tu label hien tai = {labels}, ky vong ['a', 'b', 'c', 'd'].")

        correct_answer = str(item.get("correct_answer", "")).strip().upper()
        if len(correct_answer) != 4 or any(char not in {"D", "S"} for char in correct_answer):
            errors.append(f"{prefix}: correct_answer cho Dung/Sai phai co 4 ky tu D/S, hien tai = {correct_answer!r}.")

    if part == "short_answer":
        correct_answer = str(item.get("correct_answer", "")).strip()
        if not correct_answer:
            errors.append(f"{prefix}: correct_answer cho tra loi ngan dang rong.")
        if "|" in correct_answer:
            warnings.append(f"{prefix}: short_answer co nhieu dap an chap nhan, can review ky.")

    for asset_path in asset_paths:
        absolute_asset_path = asset_dir / asset_path
        if not absolute_asset_path.exists():
            errors.append(f"{prefix}: asset khong ton tai: {asset_path}")

    if item.get("has_image") and not asset_paths:
        warnings.append(f"{prefix}: has_image=true nhung asset_paths rong.")

    if (not item.get("has_image")) and asset_paths:
        warnings.append(f"{prefix}: has_image=false nhung van co asset_paths.")

    if is_blank(item.get("topic", "")):
        warnings.append(f"{prefix}: topic chua duoc dien.")

    if is_blank(item.get("obsidian_source_path", "")):
        warnings.append(f"{prefix}: obsidian_source_path chua duoc dien.")

    return errors, warnings


def main() -> int:
    args = parse_args()
    project_root = resolve_project_root()
    questions_json_path = (project_root / args.questions_json).resolve()
    asset_dir = (project_root / args.asset_dir).resolve()

    if not questions_json_path.exists():
        print(f"[FATAL] Khong tim thay questions.json: {questions_json_path}")
        return 1

    payload = load_json(questions_json_path)
    questions = payload.get("questions", [])

    all_errors: list[str] = []
    all_warnings: list[str] = []

    numbers = [item.get("question_number") for item in questions]
    number_counter = Counter(numbers)
    duplicates = sorted(number for number, count in number_counter.items() if count > 1 and number is not None)
    if duplicates:
        all_errors.append(f"Trung question_number: {duplicates}")

    expected_numbers = list(range(1, len(questions) + 1))
    if sorted(number for number in numbers if isinstance(number, int)) != expected_numbers:
        all_warnings.append(
            f"Tap question_number hien tai khong khop day lien tiep 1..{len(questions)}."
        )

    for item in questions:
        errors, warnings = validate_question(item, asset_dir)
        all_errors.extend(errors)
        all_warnings.extend(warnings)

    print("=== Validate questions.json ===")
    print(f"File      : {questions_json_path}")
    print(f"Asset dir : {asset_dir}")
    print(f"So cau    : {len(questions)}")
    print(f"Loi       : {len(all_errors)}")
    print(f"Canh bao  : {len(all_warnings)}")

    if all_errors:
        print("\n[Loi]")
        for error in all_errors:
            print(f"- {error}")

    if all_warnings:
        print("\n[Canh bao]")
        for warning in all_warnings:
            print(f"- {warning}")

    if not all_errors and not all_warnings:
        print("\nQuestions JSON hop le va san sang cho buoc generate seed SQL.")

    return 1 if all_errors else 0


if __name__ == "__main__":
    sys.exit(main())
