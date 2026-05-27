from __future__ import annotations

import argparse
import json
import os
import sys
import time
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from google import genai
from google.genai import types


DEFAULT_MODEL = "gemini-2.5-flash"
DEFAULT_INPUT_DIR = "raw_pdfs/Toan"
DEFAULT_OUTPUT_DIR = "obsidian_vault/Toan"
DEFAULT_DELAY_SECONDS = 3.0
DEFAULT_OUTPUT_FORMAT = "json"
POLL_INTERVAL_SECONDS = 2.0
POLL_TIMEOUT_SECONDS = 300.0
MAX_RETRIES = 5
INITIAL_RETRY_DELAY_SECONDS = 5.0

SYSTEM_PROMPT = """
Ban la chuyen gia trich xuat de thi hoc sinh THPT tu file PDF sang du lieu cau truc.

Nhiem vu:
- Doc file PDF de thi.
- Trich xuat day du cac cau hoi.
- Tra ve du lieu JSON hop le, khong chen bat ky van ban nao ngoai JSON.

Quy tac bat buoc:
1) Moi cong thuc Toan/Ly/Hoa phai duoc viet bang LaTeX va boc trong dau $.
2) Giu nguyen thu tu cau hoi theo de.
3) Xac dinh section theo kieu cau hoi neu co the: "multiple_choice", "true_false", "short_answer".
4) Neu cau co cac lua chon A, B, C, D thi dua vao truong "options".
5) Neu cau co hinh, do thi, bang bieu, so do, dat "has_image": true. Neu khong chac chan thi uu tien true hon bo sot.
6) Khong tu y bo sung dap an dung.
7) Neu mot doan kho doc, van phai giu noi dung co the doc duoc va them ghi chu ngan trong "notes".
8) Van ban phai o UTF-8 chuan, giu dung tieng Viet co dau.

JSON schema mong muon:
{
  "source_pdf": "ten-file.pdf",
  "sections": [
    {
      "section_number": 1,
      "section_type": "multiple_choice",
      "questions": [
        {
          "question_number": 1,
          "type": "multiple_choice",
          "has_image": false,
          "stem": "Noi dung cau hoi",
          "options": [
            {"label": "A", "text": "..."},
            {"label": "B", "text": "..."}
          ],
          "statements": [],
          "notes": ""
        }
      ]
    }
  ]
}

Voi cau true/false:
- "options" de rong []
- "statements" la danh sach cac menh de a), b), c), d)

Voi cau short_answer:
- "options" de rong []
- "statements" de rong []
""".strip()

MARKDOWN_PROMPT = """
Hay doc file de thi PDF nay va trich xuat tat ca cau hoi ra dinh dang Markdown.

BAT BUOC:
1) Moi cong thuc Toan/Ly/Hoa phai format chuan LaTeX boc trong dau $.
2) Phan dinh ro rang tung cau hoi va cac dap an A, B, C, D neu co.
3) Ghi ro loai cau hoi la multiple_choice, true_false hoac short_answer.
4) Giu dung tieng Viet co dau, UTF-8 chuan.
5) Chi tra ve noi dung Markdown, khong them loi mo dau.
""".strip()


def resolve_runtime_root() -> Path:
    return Path.cwd().resolve()


def load_api_key() -> str:
    script_dir = Path(__file__).resolve().parent
    runtime_root = resolve_runtime_root()

    load_dotenv(script_dir / ".env", override=False)
    load_dotenv(runtime_root / ".env", override=False)

    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not api_key:
        raise RuntimeError(
            "Khong tim thay GEMINI_API_KEY. Hay them key vao data_scraper/.env hoac .env o root project."
        )
    return api_key


def collect_pdf_files(input_dir: Path) -> tuple[Path, list[Path]]:
    if input_dir.exists() and not input_dir.is_dir():
        fallback_dir = input_dir.parent
        print(f"Canh bao: duong dan dau vao dang la file, khong phai thu muc: {input_dir}")
        print(f"Chuyen sang quet thu muc cha: {fallback_dir}")
        input_dir = fallback_dir

    os.makedirs(input_dir, exist_ok=True)

    print(f"Dang quet thu muc: {input_dir}")
    all_entries = sorted(path for path in input_dir.iterdir() if path.is_file())
    print(f"Danh sach file script nhin thay trong thu muc {input_dir}:")
    if not all_entries:
        print("  - Khong co file nao trong thu muc.")
    else:
        for entry in all_entries:
            print(f"  - {entry.name}")

    pdf_files = [path for path in all_entries if path.name.lower().endswith(".pdf")]
    return input_dir, pdf_files


def wait_for_uploaded_file(client: genai.Client, file_name: str) -> Any:
    start_time = time.time()

    while True:
        current = client.files.get(name=file_name)
        state = getattr(getattr(current, "state", None), "name", None) or str(
            getattr(current, "state", "UNKNOWN")
        )
        state = state.upper()

        if state == "ACTIVE":
            return current

        if state == "FAILED":
            raise RuntimeError(f"Google danh dau file upload bi loi: {file_name}")

        if time.time() - start_time > POLL_TIMEOUT_SECONDS:
            raise TimeoutError(
                f"Het thoi gian cho file san sang sau {POLL_TIMEOUT_SECONDS} giay: {file_name}"
            )

        print(f"  - File dang duoc xu ly tren Gemini, state={state} ...")
        time.sleep(POLL_INTERVAL_SECONDS)


def build_output_path(input_pdf: Path, input_dir: Path, output_dir: Path, suffix: str) -> Path:
    relative_pdf = input_pdf.relative_to(input_dir)
    return output_dir / relative_pdf.with_suffix(suffix)


def ensure_parent_dir(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)


def safe_delete_uploaded_file(client: genai.Client, file_name: str) -> None:
    try:
        client.files.delete(name=file_name)
    except Exception as exc:  # noqa: BLE001
        print(f"  - Canh bao: khong xoa duoc file tam tren Gemini: {exc}")


def is_retryable_error(exc: Exception) -> bool:
    message = str(exc).upper()
    retry_markers = (
        "503",
        "UNAVAILABLE",
        "RESOURCE_EXHAUSTED",
        "429",
        "TIMEOUT",
        "INTERNAL",
    )
    return any(marker in message for marker in retry_markers)


def run_with_retry(operation_name: str, func):
    delay = INITIAL_RETRY_DELAY_SECONDS

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            return func()
        except Exception as exc:  # noqa: BLE001
            if attempt == MAX_RETRIES or not is_retryable_error(exc):
                raise
            print(
                f"  - {operation_name} loi tam thoi ({exc}). Thu lai lan {attempt + 1}/{MAX_RETRIES} sau {delay} giay..."
            )
            time.sleep(delay)
            delay *= 2


def _unwrap_response_text(response: Any) -> str:
    text = getattr(response, "text", "") or ""
    return text.strip()


def extract_json_payload(client: genai.Client, model_name: str, uploaded_file: Any, pdf_name: str) -> dict[str, Any]:
    response = run_with_retry(
        "Generate JSON",
        lambda: client.models.generate_content(
            model=model_name,
            contents=[uploaded_file, SYSTEM_PROMPT],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0,
            ),
        ),
    )

    raw_text = _unwrap_response_text(response)
    if not raw_text:
        raise RuntimeError("Gemini khong tra ve JSON hop le.")

    try:
        payload = json.loads(raw_text)
    except json.JSONDecodeError as exc:
        raise RuntimeError(f"Gemini tra ve JSON khong hop le: {exc}") from exc

    if not isinstance(payload, dict):
        raise RuntimeError("JSON tra ve khong phai object cap cao nhat.")

    payload["source_pdf"] = pdf_name
    return payload


def extract_markdown_payload(client: genai.Client, model_name: str, uploaded_file: Any) -> str:
    response = run_with_retry(
        "Generate Markdown",
        lambda: client.models.generate_content(
            model=model_name,
            contents=[uploaded_file, MARKDOWN_PROMPT],
            config=types.GenerateContentConfig(
                temperature=0,
            ),
        ),
    )

    text = _unwrap_response_text(response)
    if not text:
        raise RuntimeError("Gemini khong tra ve Markdown hop le.")
    return text


def write_json_output(path: Path, payload: dict[str, Any]) -> None:
    ensure_parent_dir(path)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def write_markdown_output(path: Path, text: str) -> None:
    ensure_parent_dir(path)
    path.write_text(text, encoding="utf-8")


def process_pdf(
    client: genai.Client,
    pdf_path: Path,
    input_dir: Path,
    output_dir: Path,
    model_name: str,
    output_format: str,
) -> Path:
    print(f"[START] Dang xu ly: {pdf_path}")
    uploaded_file = None

    try:
        uploaded_file = run_with_retry(
            "Upload file",
            lambda: client.files.upload(
                file=pdf_path,
                config={"mime_type": "application/pdf"},
            ),
        )
        print(f"  - Upload thanh cong: {pdf_path.name}")

        uploaded_file = wait_for_uploaded_file(client, uploaded_file.name)

        if output_format == "json":
            payload = extract_json_payload(client, model_name, uploaded_file, pdf_path.name)
            output_path = build_output_path(pdf_path, input_dir, output_dir, ".json")
            write_json_output(output_path, payload)
            print(f"[DONE] Da luu JSON UTF-8: {output_path}")
            return output_path

        markdown_text = extract_markdown_payload(client, model_name, uploaded_file)
        output_path = build_output_path(pdf_path, input_dir, output_dir, ".md")
        write_markdown_output(output_path, markdown_text)
        print(f"[DONE] Da luu Markdown UTF-8: {output_path}")
        return output_path
    except Exception as exc:  # noqa: BLE001
        print(f"[ERROR] Loi khi xu ly {pdf_path.name}: {exc}")
        raise
    finally:
        if uploaded_file is not None:
            safe_delete_uploaded_file(client, uploaded_file.name)


def iter_results(
    client: genai.Client,
    pdf_files: list[Path],
    input_dir: Path,
    output_dir: Path,
    model_name: str,
    output_format: str,
    delay_seconds: float,
) -> tuple[int, int]:
    success_count = 0
    error_count = 0

    for index, pdf_path in enumerate(pdf_files, start=1):
        print(f"\n=== [{index}/{len(pdf_files)}] {pdf_path.name} ===")
        try:
            process_pdf(
                client=client,
                pdf_path=pdf_path,
                input_dir=input_dir,
                output_dir=output_dir,
                model_name=model_name,
                output_format=output_format,
            )
            success_count += 1
        except Exception:
            error_count += 1

        if index < len(pdf_files):
            print(f"  - Cho {delay_seconds} giay truoc khi xu ly file tiep theo...")
            time.sleep(delay_seconds)

    return success_count, error_count


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Trich xuat de thi PDF sang JSON/Markdown UTF-8 bang Gemini API."
    )
    parser.add_argument(
        "--input-dir",
        default=DEFAULT_INPUT_DIR,
        help=f"Thu muc chua file PDF. Mac dinh: {DEFAULT_INPUT_DIR}",
    )
    parser.add_argument(
        "--output-dir",
        default=DEFAULT_OUTPUT_DIR,
        help=f"Thu muc luu ket qua. Mac dinh: {DEFAULT_OUTPUT_DIR}",
    )
    parser.add_argument(
        "--model",
        default=DEFAULT_MODEL,
        help=f"Ten model Gemini. Mac dinh: {DEFAULT_MODEL}",
    )
    parser.add_argument(
        "--delay",
        type=float,
        default=DEFAULT_DELAY_SECONDS,
        help=f"So giay nghi giua cac file. Mac dinh: {DEFAULT_DELAY_SECONDS}",
    )
    parser.add_argument(
        "--output-format",
        choices=("json", "md"),
        default=DEFAULT_OUTPUT_FORMAT,
        help=f"Dinh dang dau ra. Mac dinh: {DEFAULT_OUTPUT_FORMAT}",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    runtime_root = resolve_runtime_root()
    input_dir = (runtime_root / args.input_dir).resolve()
    output_dir = (runtime_root / args.output_dir).resolve()

    try:
        if input_dir.exists() and not input_dir.is_dir():
            print(f"Canh bao: {input_dir} dang la file, bo qua tao thu muc nay.")
        else:
            os.makedirs(input_dir, exist_ok=True)
        os.makedirs(output_dir, exist_ok=True)

        api_key = load_api_key()
        client = genai.Client(api_key=api_key)

        effective_input_dir, pdf_files = collect_pdf_files(input_dir)
        if not pdf_files:
            print(f"Khong tim thay file PDF nao trong: {effective_input_dir}")
            return 0

        print(f"Tim thay {len(pdf_files)} file PDF.")
        print(f"Thu muc dau vao : {effective_input_dir}")
        print(f"Thu muc dau ra : {output_dir}")
        print(f"Thu muc goc chay : {runtime_root}")
        print(f"Model su dung   : {args.model}")
        print(f"Dinh dang dau ra: {args.output_format}")

        success_count, error_count = iter_results(
            client=client,
            pdf_files=pdf_files,
            input_dir=effective_input_dir,
            output_dir=output_dir,
            model_name=args.model,
            output_format=args.output_format,
            delay_seconds=args.delay,
        )

        print("\n=== Tong ket ===")
        print(f"Thanh cong: {success_count}")
        print(f"That bai  : {error_count}")
        return 0 if error_count == 0 else 1
    except Exception as exc:  # noqa: BLE001
        print(f"[FATAL] {exc}")
        return 1


if __name__ == "__main__":
    sys.exit(main())
