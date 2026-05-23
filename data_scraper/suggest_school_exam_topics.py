from __future__ import annotations

import argparse
import json
import re
import sys
import unicodedata
from dataclasses import dataclass
from pathlib import Path
from typing import Any

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")


DEFAULT_EXAM_SLUG = "thpt-van-lang-ha-noi-2025"
DEFAULT_QUESTIONS_JSON = f"obsidian_vault/parsed/Toan/{DEFAULT_EXAM_SLUG}/questions.json"
DEFAULT_REPORT_JSON = f"obsidian_vault/parsed/Toan/{DEFAULT_EXAM_SLUG}/topic_suggestion_report.json"
KB_ROOT = "docs/knowledge-base/Toan_Hoc"


@dataclass(frozen=True)
class TopicRule:
    topic: str
    match_any: tuple[str, ...]
    match_all: tuple[str, ...] = ()
    kb_path: str = ""


RULES: tuple[TopicRule, ...] = (
    TopicRule(
        topic="Nguyên hàm",
        match_any=("nguyên hàm", "\\sin", "\\cos"),
        kb_path="4_Nguyen_Ham_Tich_Phan/1_nguyen_ham.md",
    ),
    TopicRule(
        topic="Tích phân và diện tích hình phẳng",
        match_any=("diện tích", "hình phẳng", "trục hoành", "tích phân"),
        kb_path="4_Nguyen_Ham_Tich_Phan/3_ung_dung_hinh_hoc_tich_phan.md",
    ),
    TopicRule(
        topic="Phương trình mặt phẳng trong Oxyz",
        match_any=("mặt phẳng", "pháp tuyến"),
        match_all=("oxyz",),
        kb_path="2_Hinh_Hoc_Khong_Gian/4_phuong_trinh_mat_phang.md",
    ),
    TopicRule(
        topic="Hệ trục tọa độ Oxyz",
        match_any=("oxyz", "tọa độ"),
        kb_path="2_Hinh_Hoc_Khong_Gian/2_he_truc_toa_do_Oxyz.md",
    ),
    TopicRule(
        topic="Đường tiệm cận",
        match_any=("tiệm cận", "tiem can"),
        kb_path="1_Ham_So/4_duong_tiem_can.md",
    ),
    TopicRule(
        topic="Khảo sát và đọc đồ thị hàm số",
        match_any=("đồ thị", "bảng biến thiên", "hàm số bậc ba"),
        kb_path="1_Ham_So/5_khao_sat_do_thi.md",
    ),
    TopicRule(
        topic="Tính đơn điệu của hàm số",
        match_any=("nghịch biến", "đồng biến", "tăng trên", "giảm trên"),
        kb_path="1_Ham_So/1_tinh_don_dieu.md",
    ),
    TopicRule(
        topic="Cực trị, GTLN và GTNN",
        match_any=("lớn nhất", "nhỏ nhất", "doanh thu", "chi phí", "lợi nhuận"),
        kb_path="1_Ham_So/3_gia_tri_lon_nhat_nho_nhat.md",
    ),
    TopicRule(
        topic="Ứng dụng thực tiễn của hàm số",
        match_any=("đơn đặt hàng", "sản xuất", "doanh nghiệp", "lợi nhuận", "chi phí"),
        kb_path="1_Ham_So/6_ung_dung_thuc_tien.md",
    ),
    TopicRule(
        topic="Tứ phân vị và số liệu ghép nhóm",
        match_any=("tứ phân vị", "ghép nhóm", "tần số"),
        kb_path="3_Thong_Ke_Xac_Suat/1_khoang_bien_thien_tu_phan_vi.md",
    ),
    TopicRule(
        topic="Xác suất biến cố độc lập",
        match_any=("xác suất", "bắn trúng", "độc lập", "trắc nghiệm"),
        kb_path="3_Thong_Ke_Xac_Suat/3_xac_suat_co_dieu_kien.md",
    ),
    TopicRule(
        topic="Hình học không gian với véc tơ",
        match_any=("hình chóp", "lăng trụ", "khối chóp", "véctơ", "vecto"),
        kb_path="2_Hinh_Hoc_Khong_Gian/1_vecto_trong_khong_gian.md",
    ),
    TopicRule(
        topic="Biểu thức tọa độ véc tơ",
        match_any=("hình bình hành", "trung điểm", "tọa độ"),
        match_all=("oxyz",),
        kb_path="2_Hinh_Hoc_Khong_Gian/3_bieu_thuc_toa_do_vecto.md",
    ),
    TopicRule(
        topic="Phương trình mũ và logarit",
        match_any=("2^{", "log", "ln", "mũ", "lũy thừa"),
        kb_path="1_Ham_So/7_phuong_trinh_mu_va_logarit.md",
    ),
    TopicRule(
        topic="Cấp số cộng và cấp số nhân",
        match_any=("cấp số cộng", "cấp số nhân", "u_1", "công sai"),
        kb_path="1_Ham_So/8_cap_so_cong_va_cap_so_nhan.md",
    ),
    TopicRule(
        topic="Giới hạn dãy số",
        match_any=("giới hạn", "lim "),
        kb_path="5_Gioi_Han_Day_So/1_gioi_han_day_so.md",
    ),
    TopicRule(
        topic="Khoảng cách và góc trong không gian",
        match_any=("khoảng cách giữa", "góc giữa"),
    ),
    TopicRule(
        topic="Quan hệ song song trong không gian",
        match_any=("song song với mặt phẳng", "song song với"),
    ),
    TopicRule(
        topic="Thể tích khối chóp",
        match_any=("thể tích", "khối chóp"),
    ),
    TopicRule(
        topic="Tổ hợp, xác suất và đếm",
        match_any=("số cách xếp", "xếp thành một hàng", "nam nữ đứng xen kẽ"),
        kb_path="5_To_Hop_Xac_Suat/1_quy_tac_dem_va_hoan_vi_to_hop.md",
    ),
    TopicRule(
        topic="Quy hoạch tuyến tính và bài toán tối ưu",
        match_any=("hai máy", "sản phẩm a", "sản phẩm b", "lãi"),
    ),
    TopicRule(
        topic="Thống kê ứng dụng và đường Lorenz",
        match_any=("đường cong lorenz", "phân phối thu nhập"),
    ),
)


def resolve_project_root() -> Path:
    return Path(__file__).resolve().parent.parent


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Goi y topic va obsidian_source_path cho questions.json dua tren keyword."
    )
    parser.add_argument("--questions-json", default=DEFAULT_QUESTIONS_JSON)
    parser.add_argument("--report-json", default=DEFAULT_REPORT_JSON)
    parser.add_argument("--kb-root", default=KB_ROOT)
    parser.add_argument(
        "--overwrite",
        action="store_true",
        help="Ghi de topic va obsidian_source_path da co san.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Khong ghi file questions.json, chi in bao cao.",
    )
    return parser.parse_args()


def load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def dump_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def repair_mojibake(text: str) -> str:
    if not text:
        return ""
    suspicious_markers = ("Ã", "Ä", "á»", "â€", "Æ°", "Ä‘")
    if any(marker in text for marker in suspicious_markers):
        try:
            repaired = text.encode("latin1").decode("utf-8")
            if repaired.count("�") <= text.count("�"):
                return repaired
        except (UnicodeEncodeError, UnicodeDecodeError):
            return text
    return text


def normalize_text(text: str) -> str:
    repaired = repair_mojibake(text)
    lowered = repaired.casefold()
    normalized = unicodedata.normalize("NFD", lowered)
    stripped = "".join(char for char in normalized if unicodedata.category(char) != "Mn")
    stripped = stripped.replace("đ", "d")
    stripped = re.sub(r"\s+", " ", stripped)
    return stripped.strip()


def kb_file_has_content(kb_root: Path, relative_path: str) -> bool:
    if not relative_path:
        return False
    kb_file = kb_root / relative_path
    return kb_file.exists() and kb_file.stat().st_size > 0


def choose_rule(question_text: str) -> TopicRule | None:
    haystack = normalize_text(question_text)
    for rule in RULES:
        normalized_any = tuple(normalize_text(keyword) for keyword in rule.match_any)
        normalized_all = tuple(normalize_text(keyword) for keyword in rule.match_all)

        if normalized_any and not any(keyword in haystack for keyword in normalized_any):
            continue
        if normalized_all and not all(keyword in haystack for keyword in normalized_all):
            continue
        return rule
    return None


def build_report_entry(
    item: dict[str, Any],
    suggested_topic: str,
    suggested_kb_path: str,
    kb_file_available: bool,
    reason: str,
) -> dict[str, Any]:
    return {
        "question_number": item.get("question_number"),
        "part": item.get("part"),
        "suggested_topic": suggested_topic,
        "suggested_obsidian_source_path": suggested_kb_path,
        "kb_file_available": kb_file_available,
        "reason": reason,
    }


def main() -> int:
    args = parse_args()
    project_root = resolve_project_root()
    questions_json_path = (project_root / args.questions_json).resolve()
    report_json_path = (project_root / args.report_json).resolve()
    kb_root = (project_root / args.kb_root).resolve()

    if not questions_json_path.exists():
        print(f"[FATAL] Khong tim thay questions.json: {questions_json_path}")
        return 1

    payload = load_json(questions_json_path)
    questions = payload.get("questions", [])

    suggested_count = 0
    topic_filled_count = 0
    source_path_filled_count = 0
    unresolved_count = 0
    missing_kb_count = 0
    report_entries: list[dict[str, Any]] = []

    for item in questions:
        question_number = item.get("question_number")
        question_text = str(item.get("question_text", ""))
        existing_topic = str(item.get("topic", "")).strip()
        existing_source_path = str(item.get("obsidian_source_path", "")).strip()

        rule = choose_rule(question_text)
        if rule is None:
            unresolved_count += 1
            report_entries.append(
                build_report_entry(item, "", "", False, "Khong match duoc heuristic topic.")
            )
            continue

        suggested_count += 1
        normalized_source_path = f"Toan_Hoc/{rule.kb_path}" if rule.kb_path else ""
        kb_file_available = kb_file_has_content(kb_root, rule.kb_path)
        if not kb_file_available:
            missing_kb_count += 1

        if args.overwrite or not existing_topic:
            item["topic"] = rule.topic
            topic_filled_count += 1

        if kb_file_available and (args.overwrite or not existing_source_path):
            item["obsidian_source_path"] = normalized_source_path
            source_path_filled_count += 1

        reason = f"Match keyword heuristic -> {rule.topic}."
        if not kb_file_available:
            reason += " File knowledge base hien tai trong hoac chua ton tai nen khong dien obsidian_source_path."

        report_entries.append(
            build_report_entry(
                item,
                rule.topic,
                normalized_source_path if kb_file_available else "",
                kb_file_available,
                reason,
            )
        )

        print(
            f"[SUGGEST] Cau {question_number:02d} -> topic='{rule.topic}'"
            + (
                f", source='{normalized_source_path}'"
                if kb_file_available
                else ", source=''"
            )
        )

    if not args.dry_run:
        dump_json(questions_json_path, payload)
    dump_json(
        report_json_path,
        {
            "exam_slug": payload.get("exam_slug", DEFAULT_EXAM_SLUG),
            "questions_json": str(questions_json_path),
            "kb_root": str(kb_root),
            "summary": {
                "question_count": len(questions),
                "suggested_count": suggested_count,
                "topic_filled_count": topic_filled_count,
                "source_path_filled_count": source_path_filled_count,
                "unresolved_count": unresolved_count,
                "missing_kb_count": missing_kb_count,
            },
            "entries": report_entries,
        },
    )

    print("\n=== Topic Suggestion Summary ===")
    print(f"Questions             : {len(questions)}")
    print(f"Suggested             : {suggested_count}")
    print(f"Topic filled          : {topic_filled_count}")
    print(f"Source path filled    : {source_path_filled_count}")
    print(f"Unresolved            : {unresolved_count}")
    print(f"Matched but KB empty  : {missing_kb_count}")
    print(f"Questions JSON        : {questions_json_path}")
    print(f"Report JSON           : {report_json_path}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
