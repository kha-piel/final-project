from __future__ import annotations

import argparse
import json
import subprocess
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
        description="Chay toan bo pipeline de truong tu config JSON."
    )
    parser.add_argument("--config", default=DEFAULT_CONFIG)
    parser.add_argument("--skip-extract", action="store_true")
    parser.add_argument("--skip-transform", action="store_true")
    parser.add_argument("--skip-topic-suggest", action="store_true")
    parser.add_argument("--overwrite-topics", action="store_true")
    return parser.parse_args()


def load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def run_step(project_root: Path, command: list[str]) -> None:
    print(f"\n[RUN] {' '.join(command)}")
    subprocess.run(command, cwd=project_root, check=True)


def main() -> int:
    args = parse_args()
    project_root = resolve_project_root()
    python_exe = Path(sys.executable)
    config_path = (project_root / args.config).resolve()

    if not config_path.exists():
        print(f"[FATAL] Khong tim thay config: {config_path}")
        return 1

    config = load_json(config_path)

    if not args.skip_extract:
        run_step(
            project_root,
            [
                str(python_exe),
                "data_scraper/extract_school_exam_pdf.py",
                "--pdf",
                str(config["pdf_input_path"]),
                "--json-output-dir",
                str(config["extract_json_dir"]),
                "--md-output-dir",
                str(config["extract_markdown_dir"]),
            ],
        )

    if not args.skip_transform:
        run_step(
            project_root,
            [
                str(python_exe),
                "data_scraper/transform_school_exam_extract.py",
                "--extract-json",
                str(config["extract_json_path"]),
                "--manifest",
                str(config["manifest_path"]),
                "--answer-key",
                str(config["answer_key_path"]),
                "--output",
                str(config["questions_json_path"]),
            ],
        )

    if not args.skip_topic_suggest:
        suggest_command = [
            str(python_exe),
            "data_scraper/suggest_school_exam_topics.py",
            "--questions-json",
            str(config["questions_json_path"]),
            "--report-json",
            str(config["topic_report_path"]),
        ]
        if args.overwrite_topics:
            suggest_command.append("--overwrite")
        run_step(project_root, suggest_command)

    run_step(
        project_root,
        [
            str(python_exe),
            "data_scraper/validate_questions_json.py",
            "--questions-json",
            str(config["questions_json_path"]),
            "--asset-dir",
            f"obsidian_vault/assets/{config['subject_folder']}/{config['exam_slug']}",
        ],
    )

    run_step(
        project_root,
        [str(python_exe), "data_scraper/generate_school_exam_seed.py", "--config", str(args.config)],
    )
    run_step(
        project_root,
        [
            str(python_exe),
            "data_scraper/generate_school_exam_question_seed.py",
            "--questions-json",
            str(config["questions_json_path"]),
            "--output-sql",
            str(config["question_seed_sql_path"]),
            "--exam-id",
            str(config["exam_id"]),
        ],
    )
    run_step(
        project_root,
        [str(python_exe), "data_scraper/build_school_exam_import_bundle.py", "--config", str(args.config)],
    )

    print("\n=== Pipeline complete ===")
    print(f"Config         : {config_path}")
    print(f"Questions JSON : {project_root / config['questions_json_path']}")
    print(f"Exam seed SQL  : {project_root / config['exam_seed_sql_path']}")
    print(f"Question SQL   : {project_root / config['question_seed_sql_path']}")
    print(f"Import bundle  : {project_root / config['import_bundle_sql_path']}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
