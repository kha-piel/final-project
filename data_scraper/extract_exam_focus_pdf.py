from __future__ import annotations

import argparse
import json
import re
import unicodedata
from dataclasses import asdict, dataclass
from pathlib import Path


@dataclass
class FocusQuestion:
    question_number: str
    page: int
    topic: str
    skill: str
    exam_frequency: str
    difficulty_hint: str
    reason: str
    preview: str


FOCUS_RULES = [
    {
        "topic": "Cấp số cộng",
        "skill": "Nhận biết cấp số cộng, tìm công sai và số hạng tổng quát",
        "frequency": "high",
        "difficulty": "recognition_understanding",
        "keywords": ["capsocong", "congsai", "u_n=u_1+(n-1)d", "u1+(n-1)d"],
        "reason": "Dạng nhận biết công sai và dùng công thức u_n xuất hiện thường xuyên trong đề thi thử.",
    },
    {
        "topic": "Cấp số cộng",
        "skill": "Tính tổng n số hạng đầu của cấp số cộng",
        "frequency": "high",
        "difficulty": "understanding_application",
        "keywords": ["tongnsốhang", "tongnsohang", "s_n", "sn=", "u1+un"],
        "reason": "Dạng tính tổng S_n là trọng tâm cơ bản của cấp số cộng.",
    },
    {
        "topic": "Cấp số nhân",
        "skill": "Nhận biết cấp số nhân, tìm công bội và số hạng tổng quát",
        "frequency": "high",
        "difficulty": "recognition_understanding",
        "keywords": ["capsonhan", "congboi", "u_n=u_1q", "u1q", "q="],
        "reason": "Dạng nhận biết công bội và dùng u_n = u_1 q^(n-1) là dạng nền tảng hay gặp.",
    },
    {
        "topic": "Cấp số nhân",
        "skill": "Bài toán thực tế lãi kép, tăng trưởng theo cấp số nhân",
        "frequency": "high",
        "difficulty": "application",
        "keywords": ["laikep", "nganhang", "laisuat", "guitien", "tangtruong", "dans o"],
        "reason": "Bài toán lãi kép/tăng trưởng là dạng vận dụng thực tế hay được đưa vào đề.",
    },
    {
        "topic": "Dãy số",
        "skill": "Tìm số hạng theo công thức tổng quát hoặc truy hồi",
        "frequency": "medium",
        "difficulty": "recognition_understanding",
        "keywords": ["sohangthu", "congthuctongquat", "truyhoi", "u n+1", "un+1"],
        "reason": "Dạng dãy số cơ bản cần giữ lại nhưng không nên ưu tiên hơn cấp số.",
    },
    {
        "topic": "Dãy số",
        "skill": "Xét tăng giảm và bị chặn của dãy số",
        "frequency": "medium",
        "difficulty": "understanding_application",
        "keywords": ["tanggiam", "tang", "giam", "bichan", "chantren", "chanduoi"],
        "reason": "Dạng này hữu ích để ôn bổ trợ, thường xếp sau các công thức cấp số.",
    },
]


def normalize_text(value: str) -> str:
    value = unicodedata.normalize("NFD", value)
    value = "".join(char for char in value if unicodedata.category(char) != "Mn")
    value = value.lower()
    value = value.replace("đ", "d")
    return value


def compact_text(value: str) -> str:
    return re.sub(r"[^a-z0-9_+=().-]+", "", normalize_text(value))


def clean_preview(value: str) -> str:
    value = re.sub(r"\s+", " ", value).strip()
    return value[:420]


def extract_pdf_pages(pdf_path: Path) -> list[str]:
    try:
        from pypdf import PdfReader
    except ImportError as exc:
        raise SystemExit(
            "Missing dependency: pypdf. Install with `py -m pip install pypdf` or `python -m pip install pypdf`."
        ) from exc

    reader = PdfReader(str(pdf_path))
    return [page.extract_text() or "" for page in reader.pages]


def split_questions(pages: list[str]) -> list[tuple[str, int, str]]:
    questions: list[tuple[str, int, str]] = []
    for page_index, page_text in enumerate(pages, start=1):
        matches = list(re.finditer(r"Câu\s*([0-9](?:\s*[0-9])*)\s*[\.:]?", page_text, flags=re.IGNORECASE))
        for match_index, match in enumerate(matches):
            start = match.start()
            end = matches[match_index + 1].start() if match_index + 1 < len(matches) else len(page_text)
            question_number = re.sub(r"\s+", "", match.group(1))
            body = page_text[start:end].strip()
            if len(body) > 40:
                questions.append((question_number, page_index, body))
    return questions


def classify_question(question_text: str) -> tuple[dict[str, str], int] | None:
    compact = compact_text(question_text)
    best_rule: dict[str, str] | None = None
    best_score = 0

    for rule in FOCUS_RULES:
        score = sum(1 for keyword in rule["keywords"] if compact_text(keyword) in compact)
        if score > best_score:
            best_rule = rule
            best_score = score

    if not best_rule:
        return None
    return best_rule, best_score


def build_focus_index(pdf_path: Path, max_examples_per_skill: int) -> dict[str, object]:
    pages = extract_pdf_pages(pdf_path)
    questions = split_questions(pages)
    selected: list[FocusQuestion] = []
    per_skill_count: dict[str, int] = {}

    for question_number, page, question_text in questions:
        classified = classify_question(question_text)
        if not classified:
            continue

        rule, score = classified
        skill_key = f"{rule['topic']}::{rule['skill']}"
        if per_skill_count.get(skill_key, 0) >= max_examples_per_skill:
            continue

        per_skill_count[skill_key] = per_skill_count.get(skill_key, 0) + 1
        selected.append(
            FocusQuestion(
                question_number=question_number,
                page=page,
                topic=rule["topic"],
                skill=rule["skill"],
                exam_frequency=rule["frequency"],
                difficulty_hint=rule["difficulty"],
                reason=rule["reason"],
                preview=clean_preview(question_text),
            )
        )

    summary: dict[str, int] = {}
    for item in selected:
        key = f"{item.exam_frequency}:{item.topic}:{item.skill}"
        summary[key] = summary.get(key, 0) + 1

    return {
        "source_pdf": str(pdf_path),
        "page_count": len(pages),
        "raw_question_count": len(questions),
        "selected_focus_question_count": len(selected),
        "selection_policy": {
            "high": "Đưa vào trọng tâm ôn tập trước.",
            "medium": "Đưa vào ôn bổ trợ hoặc khi học sinh sai cùng chủ đề.",
            "low": "Chỉ giữ làm nguồn tham khảo, không ưu tiên trong UI.",
        },
        "focus_rules": [
            {
                "topic": rule["topic"],
                "skill": rule["skill"],
                "exam_frequency": rule["frequency"],
                "difficulty_hint": rule["difficulty"],
                "reason": rule["reason"],
            }
            for rule in FOCUS_RULES
        ],
        "summary": summary,
        "questions": [asdict(item) for item in selected],
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Extract an exam-focused knowledge index from a Vietnamese math PDF.")
    parser.add_argument("pdf", type=Path, help="Path to the source PDF.")
    parser.add_argument("--out", type=Path, required=True, help="Output JSON path.")
    parser.add_argument("--max-examples-per-skill", type=int, default=20)
    args = parser.parse_args()

    index = build_focus_index(args.pdf, args.max_examples_per_skill)
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(index, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote {args.out}")
    print(f"Raw questions: {index['raw_question_count']}")
    print(f"Selected focus questions: {index['selected_focus_question_count']}")


if __name__ == "__main__":
    main()
