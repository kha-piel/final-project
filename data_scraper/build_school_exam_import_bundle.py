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
        description="Ghep schema + seed thanh 1 file SQL import cho 1 de truong."
    )
    parser.add_argument("--config", default=DEFAULT_CONFIG)
    return parser.parse_args()


def load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def main() -> int:
    args = parse_args()
    project_root = resolve_project_root()
    config_path = (project_root / args.config).resolve()

    if not config_path.exists():
        print(f"[FATAL] Khong tim thay config: {config_path}")
        return 1

    config = load_json(config_path)
    schema_paths = [
        project_root / "web-app/supabase/school_exams_schema.sql",
        project_root / "web-app/supabase/school_exam_questions_schema.sql",
        project_root / str(config["exam_seed_sql_path"]),
        project_root / str(config["question_seed_sql_path"]),
    ]

    missing = [path for path in schema_paths if not path.exists()]
    if missing:
        for path in missing:
            print(f"[FATAL] Thieu file SQL: {path}")
        return 1

    bundle_path = (project_root / str(config["import_bundle_sql_path"])).resolve()
    bundle_parts = []
    for path in schema_paths:
        bundle_parts.append(f"-- Source: {path.relative_to(project_root).as_posix()}\n")
        bundle_parts.append(path.read_text(encoding="utf-8").strip() + "\n")

    bundle_path.parent.mkdir(parents=True, exist_ok=True)
    bundle_path.write_text("\n\n".join(bundle_parts), encoding="utf-8")

    print("=== Import bundle complete ===")
    print(f"Config   : {config_path}")
    print(f"Bundle   : {bundle_path}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
