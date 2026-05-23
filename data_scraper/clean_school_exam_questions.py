from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any
from ftfy import fix_text

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")


DEFAULT_EXAM_SLUG = "thpt-van-lang-ha-noi-2025"
DEFAULT_INPUT = f"obsidian_vault/parsed/Toan/{DEFAULT_EXAM_SLUG}/questions.json"


def resolve_project_root() -> Path:
    return Path(__file__).resolve().parent.parent


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Sua loi mojibake/encoding trong questions.json cua de truong."
    )
    parser.add_argument("--input", default=DEFAULT_INPUT)
    parser.add_argument("--output", default=DEFAULT_INPUT)
    return parser.parse_args()


def load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def fix_mojibake(value: str) -> str:
    return fix_text(value)


def clean_object(value: Any) -> Any:
    if isinstance(value, dict):
        return {key: clean_object(item) for key, item in value.items()}
    if isinstance(value, list):
        return [clean_object(item) for item in value]
    if isinstance(value, str):
        return fix_mojibake(value)
    return value


def main() -> int:
    args = parse_args()
    project_root = resolve_project_root()
    input_path = (project_root / args.input).resolve()
    output_path = (project_root / args.output).resolve()

    if not input_path.exists():
        print(f"[FATAL] Khong tim thay questions.json: {input_path}")
        return 1

    payload = load_json(input_path)
    cleaned_payload = clean_object(payload)
    output_path.write_text(json.dumps(cleaned_payload, ensure_ascii=False, indent=2), encoding="utf-8")

    print("=== Clean complete ===")
    print(f"Input  : {input_path}")
    print(f"Output : {output_path}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
