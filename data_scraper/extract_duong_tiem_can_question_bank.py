from __future__ import annotations

import json
import re
import sys
import unicodedata
from pathlib import Path
from typing import Any

import fitz

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")


PROJECT_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_PDF = Path(r"c:\Users\User-PC\Downloads\chuyen-de-trac-nghiem-duong-tiem-can-cua-do-thi-ham-so.pdf")
DEFAULT_OUTPUT_JSON = PROJECT_ROOT / "data_scraper/output/knowledge_focus/duong_tiem_can_ham_so.question_bank.json"
DEFAULT_OUTPUT_PAYLOAD = PROJECT_ROOT / "data_scraper/output/knowledge_focus/duong_tiem_can_ham_so.seed_payload.json"
DEFAULT_OUTPUT_TS = PROJECT_ROOT / "web-app/src/features/practice/data/supplemental-duong-tiem-can-extracted.ts"

TOPIC = "Đường tiệm cận"
OBSIDIAN_SOURCE_PATH = "Toan_Hoc/1_Ham_So/4_duong_tiem_can.md"
EXAM_ID = "supplemental-duong-tiem-can-extracted"
EXAM_TITLE = "Bộ câu trích xuất đường tiệm cận"
SCHOOL_NAME = "Nội bộ hệ thống"
SOURCE_PDF = str(DEFAULT_PDF)

EXAMPLE_PATTERN = re.compile(r"Ví dụ\s+(\d+)\s*:(.*?)(?=Ví dụ\s+\d+\s*:|$)", re.S)
SECTION_PATTERN = re.compile(r"Dạng\s+(\d+)\s*:\s*([^\n]+)")
ANSWER_PATTERN = re.compile(r"Chọn\s*([ABCD])")
OPTION_PATTERN = re.compile(r"A\.\s*(.*?)\s*B\.\s*(.*?)\s*C\.\s*(.*?)\s*D\.\s*(.*)", re.S)
MOJIBAKE_MARKERS = ("Ã", "Ä", "á»", "áº", "KhÃ", "Cáº")


def normalize_text(value: str) -> str:
    value = unicodedata.normalize("NFC", value)
    value = value.replace("\u00ad", "")
    value = value.replace("\uf0a0", " ")
    value = value.replace("\uf0be", " ")
    value = value.replace("\uf040", " ")
    value = value.replace("\uf076", " ")
    value = value.replace("\uf0a7", " ")
    value = value.replace("\uf8eb", "(").replace("\uf8ec", "").replace("\uf8ed", ")")
    value = value.replace("\uf8ee", "(").replace("\uf8ef", "").replace("\uf8f0", ")")
    value = value.replace("\uf8f1", " ").replace("\uf8f2", " ").replace("\uf8f3", " ")
    value = value.replace("\uf8f4", " ").replace("\uf8f6", "").replace("\uf8f7", "").replace("\uf8f8", "")
    value = value.replace("\uf8f9", "(").replace("\uf8fa", "").replace("\uf8fb", ")")
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


def extract_word_stream(pdf_path: Path) -> tuple[str, list[tuple[int, int, int]]]:
    doc = fitz.open(pdf_path)
    page_spans: list[tuple[int, int, int]] = []
    chunks: list[str] = []
    cursor = 0

    for page_number, page in enumerate(doc, start=1):
        page_text = " ".join(word[4] for word in page.get_text("words"))
        page_text = normalize_text(page_text)
        chunks.append(page_text)
        next_cursor = cursor + len(page_text)
        page_spans.append((cursor, next_cursor, page_number))
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
    current = (1, "Tìm tiệm cận của đồ thị hàm số không chứa tham số")
    for section_offset, section_number, section_title in sections:
        if section_offset > offset:
            break
        current = (section_number, section_title)
    return current


def split_examples(text: str) -> list[tuple[int, int, str]]:
    examples: list[tuple[int, int, str]] = []
    for match in EXAMPLE_PATTERN.finditer(text):
        examples.append((int(match.group(1)), match.start(), simplify_spaces(match.group(0))))
    return examples


def clean_question_text(value: str) -> str:
    value = value.replace(" :", ":")
    value = re.sub(r"\s+([,.;:?!])", r"\1", value)
    value = re.sub(r"\(\s+", "(", value)
    value = re.sub(r"\s+\)", ")", value)
    value = re.sub(r"\s{2,}", " ", value)
    return simplify_spaces(value)


def clean_option_text(value: str) -> str:
    value = re.sub(r"\s+([,.;:?!])", r"\1", value)
    value = re.sub(r"\s{2,}", " ", value)
    return simplify_spaces(value).strip(". ")


def parse_options(block: str) -> tuple[str, dict[str, str]] | None:
    content = block.split("Lời giải", 1)[0]
    match = OPTION_PATTERN.search(content)
    if not match:
        return None

    question_text = content[:match.start()]
    question_text = re.sub(r"^Ví dụ\s+\d+\s*:\s*", "", question_text)
    question_text = clean_question_text(question_text)

    options = {
        "A": clean_option_text(match.group(1)),
        "B": clean_option_text(match.group(2)),
        "C": clean_option_text(match.group(3)),
        "D": clean_option_text(match.group(4)),
    }

    if not question_text or any(not value for value in options.values()):
        return None
    return question_text, options


def classify_difficulty(section_number: int, question_text: str) -> int:
    normalized = compact(question_text)

    if section_number == 1:
        level = 1
        if any(token in normalized for token in ("so tiem can", "bao nhieu tiem can", "khang dinh", "menh de")):
            level = 2
        if any(token in normalized for token in ("tim tat ca", "tong so", "co bao nhieu")):
            level = max(level, 2)
        return level

    if section_number == 2:
        if any(token in normalized for token in ("tong m + n", "y = 4/f(x)+2", "2018", "5 - 4f(x)")):
            return 3
        return 2

    if section_number == 3:
        return 3

    if section_number == 4:
        return 4

    return 2


def build_records(text: str, page_spans: list[tuple[int, int, int]]) -> list[dict[str, Any]]:
    sections = resolve_sections(text)
    examples = split_examples(text)
    records: list[dict[str, Any]] = []

    for source_example_number, offset, block in examples:
        answer_match = ANSWER_PATTERN.search(block)
        parsed = parse_options(block)
        if not answer_match or not parsed:
            continue

        section_number, section_title = resolve_section_for_offset(offset, sections)
        question_text, options = parsed
        difficulty_level = classify_difficulty(section_number, question_text)
        page = resolve_page(offset, page_spans)
        question_number = len(records) + 1

        records.append(
            {
                "question_id": f"{EXAM_ID}-q{question_number:03d}",
                "question_number": question_number,
                "source_example_number": source_example_number,
                "page": page,
                "section_number": section_number,
                "section_title": section_title,
                "question_type": "multiple_choice",
                "question_text": question_text,
                "options": options,
                "answer_value": answer_match.group(1),
                "difficulty_level": difficulty_level,
                "topic": TOPIC,
                "obsidian_source_path": OBSIDIAN_SOURCE_PATH,
                "source_pdf": SOURCE_PDF,
                "notes": f"Auto-extracted from Ví dụ {source_example_number} | {section_title}",
                "review_status": "auto_extracted",
                "has_image": False,
            }
        )

    return records


def build_seed_payload(records: list[dict[str, Any]]) -> dict[str, Any]:
    return {
        "exam_id": EXAM_ID,
        "exam_title": EXAM_TITLE,
        "school_name": SCHOOL_NAME,
        "subject_code": "TOAN",
        "subject_name": "Toán học",
        "year": 2026,
        "questions": [
            {
                "question_id": record["question_id"],
                "question_number": record["question_number"],
                "question_type": record["question_type"],
                "question_text": record["question_text"],
                "options": [
                    {
                        "option_label": label,
                        "option_text": text,
                        "display_order": index + 1,
                    }
                    for index, (label, text) in enumerate(record["options"].items())
                ],
                "answer_value": record["answer_value"],
                "difficulty_level": record["difficulty_level"],
                "topic": record["topic"],
                "obsidian_source_path": record["obsidian_source_path"],
                "metadata": {
                    "source_question_number": record["source_example_number"],
                    "section_number": record["section_number"],
                    "difficulty_level": record["difficulty_level"],
                    "source_pdf": record["source_pdf"],
                    "review_status": record["review_status"],
                },
            }
            for record in records
        ],
    }


def build_web_ts(records: list[dict[str, Any]]) -> str:
    question_records = [
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
                    "optionText": text,
                    "displayOrder": index + 1,
                }
                for index, (label, text) in enumerate(record["options"].items())
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
            "tags": ["supplemental", "knowledge-review", "duong-tiem-can", "extracted"],
        }
        for record in records
    ]
    payload = json.dumps(question_records, ensure_ascii=False, indent=2)
    return (
        "import type { SchoolExamQuestionRecord } from '../types/school-exam-types'\n\n"
        f"export const supplementalDuongTiemCanExtractedQuestions: SchoolExamQuestionRecord[] = {payload}\n"
    )


def validate_records(records: list[dict[str, Any]]) -> None:
    if not records:
        raise SystemExit("Không trích được câu hỏi trắc nghiệm nào từ PDF đường tiệm cận.")

    for record in records:
        if set(record["options"].keys()) != {"A", "B", "C", "D"}:
            raise SystemExit(f"Câu {record['question_number']} thiếu lựa chọn A/B/C/D.")
        if record["answer_value"] not in {"A", "B", "C", "D"}:
            raise SystemExit(f"Câu {record['question_number']} thiếu đáp án đúng.")
        if int(record["difficulty_level"]) not in {1, 2, 3, 4}:
            raise SystemExit(f"Câu {record['question_number']} thiếu difficulty_level hợp lệ.")
        text_fragments = [record["question_text"], *record["options"].values(), record["topic"], record["notes"]]
        if any(contains_mojibake(fragment) for fragment in text_fragments):
            raise SystemExit(f"Câu {record['question_number']} còn lỗi ký tự mojibake.")


def main() -> None:
    text, page_spans = extract_word_stream(DEFAULT_PDF)
    records = build_records(text, page_spans)
    validate_records(records)

    DEFAULT_OUTPUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    DEFAULT_OUTPUT_TS.parent.mkdir(parents=True, exist_ok=True)

    json_payload = {
        "topic": TOPIC,
        "obsidian_source_path": OBSIDIAN_SOURCE_PATH,
        "source_pdf": SOURCE_PDF,
        "questions": records,
    }
    DEFAULT_OUTPUT_JSON.write_text(json.dumps(json_payload, ensure_ascii=False, indent=2), encoding="utf-8")
    DEFAULT_OUTPUT_PAYLOAD.write_text(
        json.dumps(build_seed_payload(records), ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    DEFAULT_OUTPUT_TS.write_text(build_web_ts(records), encoding="utf-8")

    level_counts: dict[int, int] = {}
    for record in records:
        level = int(record["difficulty_level"])
        level_counts[level] = level_counts.get(level, 0) + 1

    print("=== Đường tiệm cận extraction complete ===")
    print(f"PDF            : {DEFAULT_PDF}")
    print(f"Output JSON    : {DEFAULT_OUTPUT_JSON}")
    print(f"Seed payload   : {DEFAULT_OUTPUT_PAYLOAD}")
    print(f"Web TS         : {DEFAULT_OUTPUT_TS}")
    print(f"Questions      : {len(records)}")
    print(f"Levels         : {level_counts}")


if __name__ == "__main__":
    main()
