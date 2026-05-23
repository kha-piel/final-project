# School Exam Pipeline

## Muc tieu
- 1 de moi chi can 1 file config.
- Chay 1 lenh de sinh:
  - `questions.json`
  - `topic_suggestion_report.json`
  - seed SQL cho `school_exams`
  - seed SQL cho `school_exam_questions`
  - 1 file SQL bundle de import

## Cac file can co cho moi de
1. PDF:
   - `data_scraper/input/school_exams/<exam-slug>.pdf`
2. Asset manifest:
   - `obsidian_vault/assets/<Mon>/<exam-slug>/manifest.json`
3. Answer key:
   - `obsidian_vault/parsed/<Mon>/<exam-slug>/answer_key.json`
4. Config:
   - `data_scraper/exams/<exam-slug>.school_exam.json`

## Tao de moi nhanh nhat
1. Copy file:
   - `data_scraper/exams/template.school_exam.json`
2. Doi lai:
   - `exam_slug`
   - `exam_id`
   - metadata truong / mon / nam
   - cac path vao file vua tao
3. Crop asset va cap nhat `manifest.json`
4. Dien `answer_key.json`
5. Chay:

```powershell
cd data_scraper
.\.venv\Scripts\python.exe run_school_exam_pipeline.py --config data_scraper/exams/<exam-slug>.school_exam.json --overwrite-topics
```

## Neu da extract xong truoc do
```powershell
cd data_scraper
.\.venv\Scripts\python.exe run_school_exam_pipeline.py --config data_scraper/exams/<exam-slug>.school_exam.json --skip-extract --overwrite-topics
```

## Neu da sua tay `questions.json`
Khong duoc transform lai, neu khong se mat chinh sua OCR:

```powershell
cd data_scraper
.\.venv\Scripts\python.exe run_school_exam_pipeline.py --config data_scraper/exams/<exam-slug>.school_exam.json --skip-extract --skip-transform --overwrite-topics
```

## Ket qua dau ra
- `questions.json`
- `seed_school_exam_*.sql`
- `seed_school_exam_questions_*.sql`
- `import_school_exam_*.sql`

## Import vao Supabase
Ban hien can 1 trong 3 cach:
- `SUPABASE_DB_URL`
- Supabase CLI da link project
- chay thu cong file `import_school_exam_*.sql` trong SQL Editor

Repo hien tai chi co `anon key`, khong du quyen de agent tu push schema/seed len project tu xa.
