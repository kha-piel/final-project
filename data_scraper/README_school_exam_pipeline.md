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

## Thong tin can chuan bi truoc khi cao du lieu
Khi them de moi, can chot cac thong tin nay truoc de pipeline khong bi lech:

- `exam_slug`: ten ASCII khong dau, viet thuong, dung dau gach ngang. Vi du `thpt-abc-vat-ly-2025`.
- `subject_folder`: dung `Toan`, `Vat_Ly`, hoac `Hoa_Hoc`.
- `subject_code`: dung `TOAN`, `VAT_LY`, hoac `HOA_HOC`.
- PDF goc cua de.
- Bang dap an cua PDF dang cao; `variant_code` chi la ma de hien thi tren FE.
- Cau truc phan thi: Phan I trac nghiem, Phan II dung/sai, Phan III tra loi ngan, kem so cau bat dau/ket thuc.
- Anh crop cho cau co hinh, bang, do thi, cong thuc kho OCR.
- Neu PDF in ma de that, dien ma do vao `variant_code`; DB van luu dap an truc tiep theo tung cau.

## Quy uoc anh crop
Thu muc anh cua tung de:

```text
obsidian_vault/assets/<Mon>/<exam-slug>/
```

Nen crop theo 2 lop:

- Anh block cau hoi day du: `TN_Cau01.png`, `DS_Cau01.png`, `TLN_Cau01.png`.
- Anh hinh phu neu can zoom rieng: `TN_Cau01_hinh1.png`, `DS_Cau01_hinh1.png`.

Luu y:
- Anh block cau hoi la du lieu de hoc sinh review lai cau.
- Anh hinh phu la du lieu ho tro khi cau co hinh ve/do thi/bang.
- Ten file nen zero-pad: `Cau01`, `Cau02`, ...

## File answer_key.json
Dat tai:

```text
obsidian_vault/parsed/<Mon>/<exam-slug>/answer_key.json
```

Format toi thieu:

```json
{
  "variant_code": "101",
  "answers": {
    "1": "A",
    "2": "D",
    "13": "SDDS",
    "17": "1,25"
  }
}
```

Quy uoc:
- Trac nghiem: `A`, `B`, `C`, `D`.
- Dung/sai: chuoi 4 ky tu `D`/`S`, vi du `SDDS`.
- Tra loi ngan: ghi dung dap an chap nhan, vi du `1,25`, `0.84`, `590`.

## File manifest.json
Dat tai:

```text
obsidian_vault/assets/<Mon>/<exam-slug>/manifest.json
```

Format toi thieu:

```json
{
  "exam_slug": "<exam-slug>",
  "subject_folder": "<Mon>",
  "assets": [
    {
      "part_code": "multiple_choice",
      "source_question_number": 2,
      "question_block": "TN_Cau02.png",
      "figures": ["TN_Cau02_hinh1.png"]
    }
  ]
}
```

Hoac van co the dung so canon toan de neu can:

```json
{
  "question_number": 14,
  "question_block": "DS_Cau02.png",
  "figures": ["DS_Cau02_hinh1.png"]
}
```

Quy uoc khuyen nghi:
- `part_code` + `source_question_number` de trung voi cach de goc danh so theo tung phan.
- `part_code` nhan 1 trong 3 gia tri: `multiple_choice`, `true_false`, `short_answer`.
- Pipeline se tu map ve `question_number` canon noi bo.

Neu cau khong co anh thi khong can khai bao trong manifest.

## Tao de moi nhanh nhat
1. Copy file:
   - Toan: `data_scraper/exams/template.school_exam.json`
   - Vat ly: `data_scraper/exams/template.vat_ly.school_exam.json`
   - Hoa hoc: `data_scraper/exams/template.hoa_hoc.school_exam.json`
2. Doi lai:
   - `exam_slug`
   - `exam_id`
   - metadata truong / mon / nam
   - cac path vao file vua tao
3. Doi ten PDF thanh `<exam-slug>.pdf` va dat vao `data_scraper/input/school_exams/`.
4. Dat them ban PDF public vao `web-app/public/school-exams/<exam-slug>.pdf`.
5. Crop asset va cap nhat `manifest.json`.
6. Dien `answer_key.json`.
7. Chay:

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

## Buoc review bat buoc
Sau khi pipeline sinh `questions.json`, mo file nay de so voi PDF:

- Sua OCR sai tieng Viet, cong thuc, ky hieu.
- Kiem tra cau co anh da map dung `asset_paths`.
- Kiem tra dap an dung voi bang dap an.
- Kiem tra `topic` va `obsidian_source_path`.

Sau khi sua tay `questions.json`, chay:

```powershell
cd data_scraper
.\.venv\Scripts\python.exe run_school_exam_pipeline.py --config data_scraper/exams/<exam-slug>.school_exam.json --skip-extract --skip-transform --overwrite-topics
```

Lenh nay se validate lai `questions.json`, sinh lai SQL cau hoi, va ghep lai file import bundle.

## Import vao Supabase
Ban hien can 1 trong 3 cach:
- `SUPABASE_DB_URL`
- Supabase CLI da link project
- chay thu cong file `import_school_exam_*.sql` trong SQL Editor

Repo hien tai chi co `anon key`, khong du quyen de agent tu push schema/seed len project tu xa.
