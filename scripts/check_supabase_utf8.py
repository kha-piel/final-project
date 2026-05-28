"""
Script kiểm tra ký tự tiếng Việt trong Supabase.
Chạy: python scripts/check_supabase_utf8.py

Yêu cầu: pip install supabase python-dotenv
"""
import os
import re
import sys

try:
    from dotenv import load_dotenv
    from supabase import create_client
except ImportError:
    print("Cần cài đặt thư viện: pip install supabase python-dotenv")
    sys.exit(1)

# Load env từ nhiều vị trí
for env_path in [".env", "web-app/.env", "web-app/.env.local"]:
    if os.path.exists(env_path):
        load_dotenv(env_path, override=False)

SUPABASE_URL = os.getenv("VITE_SUPABASE_URL") or os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("VITE_SUPABASE_ANON_KEY") or os.getenv("SUPABASE_ANON_KEY") or os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Thiếu SUPABASE_URL / SUPABASE_ANON_KEY trong .env")
    sys.exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# --- Regex phát hiện mojibake / ký tự bị hỏng ---
MOJIBAKE_RE = re.compile(r"[Ã¡-ÿ]{2,}|á»|áº|Ä|Ã")
REPLACEMENT_CHAR_RE = re.compile(r"\ufffd|\\ufffd")
QUESTION_MARK_RE = re.compile(r"C\? |lo\?i|nhi\?u|th\?t|b\?")


def check_text(value: str, context: str) -> list[str]:
    """Trả về danh sách cảnh báo nếu phát hiện lỗi encoding."""
    issues = []
    if not value:
        return issues
    if MOJIBAKE_RE.search(value):
        issues.append(f"[MOJIBAKE] {context}: ...{value[:120]}...")
    if REPLACEMENT_CHAR_RE.search(value):
        issues.append(f"[REPLACEMENT_CHAR] {context}: ...{value[:120]}...")
    if QUESTION_MARK_RE.search(value):
        issues.append(f"[QUESTION_MARK_ENCODING] {context}: ...{value[:120]}...")
    return issues


def check_table(table_name: str, text_columns: list[str], id_column: str = "id"):
    """Quét 1 bảng, lấy tối đa 1000 rows, kiểm tra từng cột text."""
    print(f"\n{'='*60}")
    print(f"Đang kiểm tra bảng: {table_name}")
    print(f"{'='*60}")

    select_cols = f"{id_column}, {', '.join(text_columns)}"
    try:
        response = supabase.table(table_name).select(select_cols).limit(1000).execute()
    except Exception as exc:
        print(f"  ⚠️  Không truy cập được bảng: {exc}")
        return 0

    if not response.data:
        print(f"  (Bảng rỗng hoặc không truy cập được)")
        return 0

    total_issues = 0
    for row in response.data:
        row_id = row.get(id_column, "?")
        for col in text_columns:
            value = row.get(col)
            if isinstance(value, str):
                issues = check_text(value, f"{table_name}.{col} [id={row_id}]")
                for issue in issues:
                    print(f"  ⚠️  {issue}")
                    total_issues += 1

    if total_issues == 0:
        print(f"  ✅ Không phát hiện lỗi encoding ({len(response.data)} rows)")
    else:
        print(f"  ❌ Phát hiện {total_issues} lỗi encoding!")

    return total_issues


# --- Kiểm tra các bảng chính ---
print("🔍 Kiểm tra encoding dữ liệu tiếng Việt trong Supabase...")
grand_total = 0

grand_total += check_table(
    "school_exam_questions",
    ["question_text", "topic"],
    id_column="question_id",
)

grand_total += check_table(
    "school_exam_question_options",
    ["option_text"],
    id_column="option_id",
)

grand_total += check_table(
    "school_exams",
    ["title", "school_name", "city", "subject_name"],
    id_column="exam_id",
)

grand_total += check_table(
    "subjects",
    ["subject_name"],
    id_column="subject_code",
)

grand_total += check_table(
    "topics",
    ["topic_name", "description"],
    id_column="topic_id",
)

# --- Tổng kết ---
print(f"\n{'='*60}")
if grand_total == 0:
    print("🎉 TỔNG KẾT: Không phát hiện lỗi encoding nào trong Supabase!")
else:
    print(f"⚠️  TỔNG KẾT: Phát hiện {grand_total} mục bị lỗi encoding.")
    print("👉 Dữ liệu CẦN được re-seed lại bằng SQL có SET client_encoding = 'UTF8'.")
print(f"{'='*60}")
