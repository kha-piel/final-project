from __future__ import annotations

import argparse
import json
import re
import sys
import unicodedata
from pathlib import Path
from typing import Any

from pypdf import PdfReader

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")


PROJECT_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_PDF = Path(r"c:\Users\User-PC\Downloads\chuyen-de-trac-nghiem-gia-tri-lon-nhat-va-nho-nhat-cua-ham-so.pdf")
DEFAULT_OUTPUT_JSON = PROJECT_ROOT / "data_scraper/output/knowledge_focus/gia_tri_lon_nhat_nho_nhat_ham_so.question_bank.json"
DEFAULT_OUTPUT_PAYLOAD = PROJECT_ROOT / "data_scraper/output/knowledge_focus/gia_tri_lon_nhat_nho_nhat_ham_so.seed_payload.json"
DEFAULT_OUTPUT_TS = PROJECT_ROOT / "web-app/src/features/practice/data/supplemental-gtln-gtnn-questions.ts"

TOPIC = "Cực trị, GTLN và GTNN"
OBSIDIAN_SOURCE_PATH = "Toan_Hoc/1_Ham_So/3_gia_tri_lon_nhat_nho_nhat.md"
EXAM_ID = "supplemental-gtln-gtnn"
EXAM_TITLE = "Bộ câu bổ sung GTLN, GTNN của hàm số"
SCHOOL_NAME = "Nội bộ hệ thống"

EXAMPLE_PATTERN = re.compile(r"Ví dụ\s+(\d+)\s*:")
SECTION_PATTERN = re.compile(r"(?:DẠ)?NG\s+(\d+)\s*:\s*([^\n]+)")
ANSWER_PATTERN = re.compile(r"Đáp án:\s*Chọn\s*([ABCD])")
OPTION_LABEL_PATTERN = re.compile(r"(?<![A-Z0-9])([ABCD])\.\s*")
MOJIBAKE_MARKERS = ("Ã", "Ä", "á»", "áº", "KhÃ", "Cáº")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Trích toàn bộ câu trắc nghiệm GTLN/GTNN từ PDF và xuất JSON + payload + TS cho web."
    )
    parser.add_argument("--pdf", type=Path, default=DEFAULT_PDF)
    parser.add_argument("--output-json", type=Path, default=DEFAULT_OUTPUT_JSON)
    parser.add_argument("--output-payload", type=Path, default=DEFAULT_OUTPUT_PAYLOAD)
    parser.add_argument("--output-ts", type=Path, default=DEFAULT_OUTPUT_TS)
    return parser.parse_args()


def normalize_text(value: str) -> str:
    value = value.replace("\uf0a7", " ")
    value = value.replace("\u00ad", "")
    value = value.replace("\uf8f0", " ")
    value = value.replace("\uf8f1", " ")
    value = value.replace("\uf8f2", " ")
    value = value.replace("\uf8f3", " ")
    value = unicodedata.normalize("NFC", value)
    value = value.replace("\r\n", "\n").replace("\r", "\n")
    return value


def simplify_spaces(value: str) -> str:
    value = re.sub(r"[ \t]+", " ", value)
    value = re.sub(r" *\n *", "\n", value)
    return value.strip()


def compact(value: str) -> str:
    normalized = unicodedata.normalize("NFD", value)
    normalized = "".join(ch for ch in normalized if unicodedata.category(ch) != "Mn")
    normalized = normalized.lower().replace("đ", "d")
    normalized = re.sub(r"\s+", " ", normalized)
    return normalized.strip()


def contains_mojibake(value: str) -> bool:
    return any(marker in value for marker in MOJIBAKE_MARKERS)


def clean_math_question_text(value: str) -> str:
    value = simplify_spaces(value)
    value = re.sub(r"\s+([,.;:?!])", r"\1", value)
    value = re.sub(r"([([])\s+", r"\1", value)
    value = re.sub(r"\s+([])])", r"\1", value)
    value = re.sub(r"\s{2,}", " ", value)
    return value.strip()


def clean_option_text(value: str) -> str:
    value = simplify_spaces(value)
    value = re.sub(r"\s+([,.;:?!])", r"\1", value)
    value = re.sub(r"\s{2,}", " ", value)
    return value.strip(" .")


def extract_pdf_text(pdf_path: Path) -> tuple[str, list[tuple[int, int, int]]]:
    reader = PdfReader(str(pdf_path))
    chunks: list[str] = []
    page_spans: list[tuple[int, int, int]] = []
    cursor = 0

    for page_index, page in enumerate(reader.pages, start=1):
        page_text = normalize_text(page.extract_text() or "")
        chunks.append(page_text)
        next_cursor = cursor + len(page_text)
        page_spans.append((cursor, next_cursor, page_index))
        cursor = next_cursor + 2
        chunks.append("\n\n")

    return "".join(chunks), page_spans


def resolve_page(start_index: int, page_spans: list[tuple[int, int, int]]) -> int:
    for start, end, page in page_spans:
        if start <= start_index < end:
            return page
    return page_spans[-1][2] if page_spans else 1


def resolve_sections(text: str) -> list[tuple[int, int, str]]:
    return [(match.start(), int(match.group(1)), simplify_spaces(match.group(2))) for match in SECTION_PATTERN.finditer(text)]


def resolve_section_for_offset(offset: int, sections: list[tuple[int, int, str]]) -> tuple[int, str]:
    current = (1, "TÌM GIÁ TRỊ NHỎ NHẤT – GIÁ TRỊ LỚN NHẤT CỦA HÀM SỐ")
    for section_offset, section_number, section_title in sections:
        if section_offset > offset:
            break
        current = (section_number, section_title)
    return current


def split_examples(text: str) -> list[tuple[int, int, str]]:
    matches = list(EXAMPLE_PATTERN.finditer(text))
    examples: list[tuple[int, int, str]] = []
    for index, match in enumerate(matches):
        start = match.start()
        end = matches[index + 1].start() if index + 1 < len(matches) else len(text)
        examples.append((int(match.group(1)), start, text[start:end].strip()))
    return examples


def parse_options(question_body: str) -> tuple[str, dict[str, str]] | None:
    cut_markers = [marker for marker in ("Lời giải", "Hướng dẫn", "Đáp án:") if marker in question_body]
    content = question_body
    if cut_markers:
        first_marker = min(question_body.find(marker) for marker in cut_markers)
        content = question_body[:first_marker]

    label_matches = list(OPTION_LABEL_PATTERN.finditer(content))
    if len(label_matches) < 4:
        return None

    labels = [match.group(1) for match in label_matches[:4]]
    if labels != ["A", "B", "C", "D"]:
        return None

    question_text = clean_math_question_text(content[:label_matches[0].start()])
    question_text = re.sub(r"^Ví dụ\s+\d+\s*:\s*", "", question_text)
    options: dict[str, str] = {}
    for index, match in enumerate(label_matches[:4]):
        start = match.end()
        end = label_matches[index + 1].start() if index + 1 < 4 else len(content)
        options[match.group(1)] = clean_option_text(content[start:end])

    if not question_text or any(not value for value in options.values()):
        return None
    return question_text, options


def classify_difficulty(section_number: int, question_text: str) -> int:
    normalized = compact(question_text)

    if section_number == 1:
        level = 1
        if any(token in normalized for token in ("gia tri cua 3m + m", "gia tri cua m", "goi m va m", "tap gia tri")):
            level = 2
        if any(token in normalized for token in ("can", "sqrt", "sin", "cos", "tan", "log", "ln", "mu", "phan so", "phan thuc")):
            level = max(level, 2)
        if any(token in normalized for token in ("hai bien", "x+y", "xy", "bat dang thuc", "cauchy", "am gm", "bunhiacopxki")):
            level = 3
        return level

    if section_number == 2:
        if any(
            token in normalized
            for token in ("bao nhieu gia tri cua m", "tat ca gia tri cua m", "de voi moi m", "de ham so", "tham so m")
        ):
            return 4
        return 3

    if section_number == 3:
        if any(
            token in normalized
            for token in ("chi phi", "loi nhuan", "do dai", "quang duong", "dien tich", "the tich", "thung", "ho")
        ):
            return 4
        return 3

    return 2


def build_records(text: str, page_spans: list[tuple[int, int, int]]) -> list[dict[str, Any]]:
    sections = resolve_sections(text)
    examples = split_examples(text)
    records: list[dict[str, Any]] = []

    for example_number, offset, block in examples:
        section_number, section_title = resolve_section_for_offset(offset, sections)
        answer_match = ANSWER_PATTERN.search(block)
        if not answer_match:
            continue

        parsed = parse_options(block)
        if not parsed:
            continue

        question_text, options = parsed
        difficulty_level = classify_difficulty(section_number, question_text)
        page_number = resolve_page(offset, page_spans)

        records.append(
            {
                "question_id": f"{EXAM_ID}-q{len(records) + 1:03d}",
                "question_number": len(records) + 1,
                "source_example_number": example_number,
                "page": page_number,
                "section_number": section_number,
                "section_title": section_title,
                "question_type": "multiple_choice",
                "question_text": question_text,
                "options": options,
                "answer_value": answer_match.group(1),
                "difficulty_level": difficulty_level,
                "topic": TOPIC,
                "obsidian_source_path": OBSIDIAN_SOURCE_PATH,
                "source_pdf": str(DEFAULT_PDF),
                "notes": f"Auto-extracted from Ví dụ {example_number} | {section_title}",
                "review_status": "auto_extracted_reviewed",
                "has_image": False,
            }
        )

    return records


def validate_records(records: list[dict[str, Any]]) -> None:
    if not records:
        raise SystemExit("Không trích được câu trắc nghiệm nào từ PDF.")

    for record in records:
        if record["question_type"] != "multiple_choice":
            raise SystemExit(f"Câu {record['question_number']} không phải multiple_choice.")
        if set(record["options"].keys()) != {"A", "B", "C", "D"}:
            raise SystemExit(f"Câu {record['question_number']} thiếu lựa chọn A/B/C/D.")
        if record["answer_value"] not in {"A", "B", "C", "D"}:
            raise SystemExit(f"Câu {record['question_number']} thiếu đáp án đúng.")
        if int(record["difficulty_level"]) not in {1, 2, 3, 4}:
            raise SystemExit(f"Câu {record['question_number']} thiếu difficulty_level hợp lệ.")

        text_fragments = [record["question_text"], *record["options"].values(), record["topic"], record["notes"]]
        if any(contains_mojibake(fragment) for fragment in text_fragments):
            raise SystemExit(f"Câu {record['question_number']} còn lỗi ký tự mojibake.")


def build_question_payload(records: list[dict[str, Any]]) -> dict[str, Any]:
    questions = []
    for record in records:
        questions.append(
            {
                "question_number": record["question_number"],
                "source_question_number": record["source_example_number"],
                "section_number": record["section_number"],
                "part": "multiple_choice",
                "question_type": "multiple_choice",
                "question_text": record["question_text"],
                "options": record["options"],
                "answer_value": record["answer_value"],
                "difficulty_level": record["difficulty_level"],
                "topic": record["topic"],
                "obsidian_source_path": record["obsidian_source_path"],
                "asset_paths": [],
                "has_image": False,
                "notes": record["notes"],
                "review_status": record["review_status"],
                "metadata": {
                    "source_pdf": record["source_pdf"],
                    "section_title": record["section_title"],
                    "page": record["page"],
                },
            }
        )

    return {
        "exam_id": EXAM_ID,
        "title": EXAM_TITLE,
        "subject_code": "TOAN",
        "subject_name": "Toán học",
        "source_pdf": str(DEFAULT_PDF),
        "questions": questions,
    }


def render_ts(records: list[dict[str, Any]]) -> str:
    payload = []
    for record in records:
        payload.append(
            {
                "questionId": record["question_id"],
                "examId": EXAM_ID,
                "questionNumber": record["question_number"],
                "questionType": "multiple_choice",
                "difficultyLevel": record["difficulty_level"],
                "questionText": record["question_text"],
                "statements": [],
                "options": [
                    {
                        "optionLabel": label,
                        "optionText": record["options"][label],
                        "displayOrder": index + 1,
                    }
                    for index, label in enumerate(["A", "B", "C", "D"])
                ],
                "assetPaths": [],
                "assets": [],
                "topic": TOPIC,
                "obsidianSourcePath": OBSIDIAN_SOURCE_PATH,
                "hasImage": False,
                "answerValue": record["answer_value"],
                "sourceQuestionNumber": record["source_example_number"],
                "sourceSectionNumber": record["section_number"],
                "examTitle": EXAM_TITLE,
                "schoolName": SCHOOL_NAME,
                "year": 2026,
                "pdfUrl": "",
                "tags": ["supplemental", "knowledge-review", "gtln-gtnn"],
            }
        )

    json_payload = json.dumps(payload, ensure_ascii=False, indent=2)
    return "\n".join(
        [
            "import type { SchoolExamQuestionRecord } from '../types/school-exam-types'",
            "",
            f"export const supplementalGTLNGTNNQuestions: SchoolExamQuestionRecord[] = {json_payload}",
            "",
        ]
    )


def write_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def write_text(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")


def summarize_levels(records: list[dict[str, Any]]) -> dict[int, int]:
    counts = {1: 0, 2: 0, 3: 0, 4: 0}
    for record in records:
        counts[int(record["difficulty_level"])] += 1
    return counts


def main() -> int:
    args = parse_args()
    pdf_path = args.pdf

    if not pdf_path.exists():
        print(f"[FATAL] Không tìm thấy PDF: {pdf_path}")
        return 1

    text, page_spans = extract_pdf_text(pdf_path)
    records = build_records(text, page_spans)
    validate_records(records)

    intermediate_payload = {
        "source_pdf": str(pdf_path),
        "topic": TOPIC,
        "obsidian_source_path": OBSIDIAN_SOURCE_PATH,
        "question_count": len(records),
        "difficulty_summary": summarize_levels(records),
        "questions": records,
    }
    seed_payload = build_question_payload(records)
    ts_content = render_ts(records)

    write_json(args.output_json, intermediate_payload)
    write_json(args.output_payload, seed_payload)
    write_text(args.output_ts, ts_content)

    print("=== GTLN/GTNN extraction complete ===")
    print(f"PDF            : {pdf_path}")
    print(f"Output JSON    : {args.output_json}")
    print(f"Seed payload   : {args.output_payload}")
    print(f"Web TS         : {args.output_ts}")
    print(f"Questions      : {len(records)}")
    print(f"Levels         : {summarize_levels(records)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
