"""
Wrapper tuong thich nguoc cho importer JSON.

Lenh cu:
    python scripts/seed_data.py

Hien tai script se import file mau `data/exams/mini_test_toan.json`
vao SQLite local cua project.
"""

from __future__ import annotations

from import_exam import DEFAULT_DB_FILE, DEFAULT_EXAM_FILE, main as import_main


if __name__ == "__main__":
    print(f"[INFO] Dang import de thi mau tu: {DEFAULT_EXAM_FILE}")
    print(f"[INFO] Database muc tieu: {DEFAULT_DB_FILE}")
    raise SystemExit(import_main())
