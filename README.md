# THPTQG AI Final Project

Project này được sắp xếp lại để tách rõ source code, dữ liệu và tài liệu hỗ trợ.

## Cấu trúc chính

- `src/`: ứng dụng JavaFX chính.
- `ai_service/`: FastAPI microservice dùng cho phần giải thích AI.
- `database/`: schema SQLite.
- `data/`: file SQLite runtime cục bộ.
- `scripts/`: script import/seed và script kiểm tra thủ công.
- `docs/knowledge-base/`: kho Markdown dùng cho RAG.
- `data/`: giữ chỗ cho SQLite local (`thptqg_ai.db` không commit lên git).
- `data/exams/`: de thi JSON mau de import vao SQLite.

## Chạy nhanh

### Java desktop

```bash
mvn javafx:run
```

### AI service

```bash
cd ai_service
uvicorn main:app --reload --port 8000
```

### Import de thi tu JSON

```bash
python3 scripts/seed_data.py
```

Hoac goi importer truc tiep:

```bash
python3 scripts/import_exam.py --file data/exams/mini_test_toan.json
```

### Kiểm tra thủ công

```bash
python3 scripts/read_knowledge_base.py
python3 scripts/manual_api_check.py
```

## Cau truc JSON de thi

Importer hien tai ho tro de trac nghiem `single_choice` voi 4 dap an `A/B/C/D`.

```json
{
  "subject_code": "TOAN",
  "topic_name": "Đạo Hàm và Tích Phân",
  "exam": {
    "title": "Đề thi thử Toán - Mini Test",
    "description": "Mô tả đề thi",
    "duration": 15,
    "total_questions": 3,
    "exam_type": "practice"
  },
  "questions": [
    {
      "content": "Tính đạo hàm của hàm số y = x^2",
      "level": 1,
      "question_type": "single_choice",
      "obsidian_source_path": "Toan_Hoc/Dao_Ham.md",
      "answers": [
        { "option_label": "A", "content": "y' = x", "is_correct": false },
        { "option_label": "B", "content": "y' = 2x", "is_correct": true },
        { "option_label": "C", "content": "y' = 2", "is_correct": false },
        { "option_label": "D", "content": "y' = x^2", "is_correct": false }
      ]
    }
  ]
}
```

### Quy uoc validate

- `subject_code` phai ton tai san trong bang `subjects`.
- `questions` phai co it nhat 1 cau hoi.
- `question_type` hien chi ho tro `single_choice`.
- Moi cau hoi phai co dung 4 dap an voi nhan `A/B/C/D`.
- Moi cau hoi phai co dung 1 dap an `is_correct = true`.
- Neu `exam.total_questions` khong khop so cau hoi thuc te, importer se tu dung so thuc te.

## Cach import

Import vao database mac dinh cua project:

```bash
python3 scripts/import_exam.py --file data/exams/mini_test_toan.json
```

Import vao mot database khac de test:

```bash
python3 scripts/import_exam.py --file data/exams/mini_test_toan.json --db /tmp/thptqg_ai_test.db
```

## Chinh sach tranh trung

- Khong tao trung `exam` neu cung `title + subject_id`.
- Khong tao trung `question` neu cung `topic_id + content`; importer se reuse cau hoi ton tai.
- Neu de thi da ton tai, importer se fail ro rang thay vi append them du lieu vao de cu.

## Kiem tra sau khi import

Chay:

```bash
python3 scripts/import_exam.py --file data/exams/mini_test_toan.json --db /tmp/thptqg_ai_test.db
python3 - <<'PY'
import sqlite3
conn = sqlite3.connect('/tmp/thptqg_ai_test.db')
cur = conn.cursor()
for table in ['exams', 'questions', 'answers', 'exam_questions']:
    cur.execute(f'SELECT COUNT(*) FROM {table}')
    print(table, cur.fetchone()[0])
conn.close()
PY
```

Neu may ban map `python` ve Python 3 san roi thi co the dung `python` thay cho `python3`.
