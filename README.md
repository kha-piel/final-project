# THPTQG AI Final Project

Project này được sắp xếp lại để tách rõ source code, dữ liệu và tài liệu hỗ trợ.

## Cấu trúc chính

- `src/`: ứng dụng JavaFX chính.
- `ai_service/`: FastAPI microservice dùng cho phần giải thích AI.
- `database/`: schema SQLite.
- `data/`: file SQLite runtime cục bộ.
- `scripts/`: script seed và script kiểm tra thủ công.
- `docs/knowledge-base/`: kho Markdown dùng cho RAG.
- `data/`: giữ chỗ cho SQLite local (`thptqg_ai.db` không commit lên git).

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

### Seed database

```bash
python scripts/seed_data.py
```

### Kiểm tra thủ công

```bash
python scripts/read_knowledge_base.py
python scripts/manual_api_check.py
```
