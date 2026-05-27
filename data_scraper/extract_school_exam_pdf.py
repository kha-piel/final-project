from __future__ import annotations

import argparse
import shutil
import sys
from pathlib import Path

from pdf_to_md_extractor import (
    DEFAULT_MODEL,
    load_api_key,
    process_pdf,
    resolve_runtime_root,
)
from google import genai


DEFAULT_EXAM_SLUG = "thpt-van-lang-ha-noi-2025"
DEFAULT_INPUT_PDF = f"data_scraper/input/school_exams/{DEFAULT_EXAM_SLUG}.pdf"
DEFAULT_JSON_OUTPUT_DIR = f"data_scraper/output/school_exams/json/{DEFAULT_EXAM_SLUG}"
DEFAULT_MD_OUTPUT_DIR = f"data_scraper/output/school_exams/markdown/{DEFAULT_EXAM_SLUG}"
DEFAULT_INPUT_DIR = "data_scraper/input/school_exams"


def resolve_project_root() -> Path:
    return Path(__file__).resolve().parent.parent


def resolve_pdf_path(project_root: Path, pdf_arg: str) -> Path:
    explicit_path = (project_root / pdf_arg).resolve()
    if explicit_path.exists():
        return explicit_path

    input_dir = (project_root / DEFAULT_INPUT_DIR).resolve()
    if not input_dir.exists():
        return explicit_path

    pdf_candidates = sorted(input_dir.glob("*.pdf"))
    if len(pdf_candidates) == 1:
        print(
            f"[INFO] Khong tim thay file mac dinh '{explicit_path.name}'. "
            f"Tu dong dung file PDF duy nhat trong input: {pdf_candidates[0].name}"
        )
        return pdf_candidates[0]

    return explicit_path


def build_ascii_safe_pdf_copy(pdf_path: Path) -> Path:
    safe_name = "school_exam_input.pdf"
    safe_path = pdf_path.with_name(safe_name)

    if pdf_path.name == safe_name:
        return pdf_path

    shutil.copy2(pdf_path, safe_path)
    return safe_path


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Wrapper chay trich xuat Gemini cho mot de truong cu the."
    )
    parser.add_argument(
        "--pdf",
        default=DEFAULT_INPUT_PDF,
        help=f"Duong dan PDF dau vao. Mac dinh: {DEFAULT_INPUT_PDF}",
    )
    parser.add_argument(
        "--json-output-dir",
        default=DEFAULT_JSON_OUTPUT_DIR,
        help=f"Thu muc luu JSON. Mac dinh: {DEFAULT_JSON_OUTPUT_DIR}",
    )
    parser.add_argument(
        "--md-output-dir",
        default=DEFAULT_MD_OUTPUT_DIR,
        help=f"Thu muc luu Markdown. Mac dinh: {DEFAULT_MD_OUTPUT_DIR}",
    )
    parser.add_argument(
        "--model",
        default=DEFAULT_MODEL,
        help=f"Ten model Gemini. Mac dinh: {DEFAULT_MODEL}",
    )
    return parser.parse_args()


def run_single_extract(pdf_path: Path, output_dir: Path, model_name: str, output_format: str) -> Path:
    input_dir = pdf_path.parent

    api_key = load_api_key()
    client = genai.Client(api_key=api_key)

    return process_pdf(
        client=client,
        pdf_path=pdf_path,
        input_dir=input_dir,
        output_dir=output_dir,
        model_name=model_name,
        output_format=output_format,
    )


def main() -> int:
    args = parse_args()
    runtime_root = resolve_project_root()

    pdf_path = resolve_pdf_path(runtime_root, args.pdf)
    json_output_dir = (runtime_root / args.json_output_dir).resolve()
    md_output_dir = (runtime_root / args.md_output_dir).resolve()

    if not pdf_path.exists():
        print(f"[FATAL] Khong tim thay file PDF: {pdf_path}")
        return 1

    json_output_dir.mkdir(parents=True, exist_ok=True)
    md_output_dir.mkdir(parents=True, exist_ok=True)

    print("=== School Exam Extract ===")
    print(f"PDF        : {pdf_path}")
    print(f"JSON dir   : {json_output_dir}")
    print(f"Markdown dir: {md_output_dir}")
    print(f"Model      : {args.model}")

    working_pdf_path = build_ascii_safe_pdf_copy(pdf_path)

    try:
        json_result = run_single_extract(
            pdf_path=working_pdf_path,
            output_dir=json_output_dir,
            model_name=args.model,
            output_format="json",
        )
        md_result = run_single_extract(
            pdf_path=working_pdf_path,
            output_dir=md_output_dir,
            model_name=args.model,
            output_format="md",
        )
    except Exception as exc:  # noqa: BLE001
        print(f"[FATAL] Loi khi trich xuat: {exc}")
        return 1
    finally:
        if working_pdf_path != pdf_path and working_pdf_path.exists():
            working_pdf_path.unlink(missing_ok=True)

    print("\n=== Hoan tat ===")
    print(f"JSON     : {json_result}")
    print(f"Markdown : {md_result}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
