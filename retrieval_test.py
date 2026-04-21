import os
import sys

# Buộc stdout xuất UTF-8 để hiển thị tiếng Việt đúng trên Windows
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

# ==============================================================
#   MODULE: Retrieval Test - Đọc dữ liệu từ Knowledge Base
#   Mô tả: Đọc file Markdown từ Obsidian Vault và in ra Terminal
# ==============================================================

FILE_PATH = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "Obsidian_Vault",
    "Toan_Hoc",
    "Giai_Tich",
    "toan_tich_phan.md"
)

SEPARATOR = "=" * 60

def read_knowledge_file(path: str) -> None:
    """Mở và in toàn bộ nội dung file Markdown ra Terminal."""
    print(SEPARATOR)
    print(f"  [DOC] Dang doc file: {path}")
    print(SEPARATOR)

    try:
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()

        print()
        print(content)
        print()
        print(SEPARATOR)
        print("  [OK] Doc file thanh cong!")
        print(SEPARATOR)

    except FileNotFoundError:
        print()
        print("  [!!!] Bao dong do: Khong tim thay file tai duong dan da chi dinh!")
        print(f"     Đường dẫn sai: {path}")
        print(SEPARATOR)


if __name__ == "__main__":
    read_knowledge_file(FILE_PATH)
