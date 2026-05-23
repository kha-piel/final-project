# School Exam Extraction Pipeline

Thu muc nay chua ket qua trung gian cua buoc cào du lieu de truong tu PDF.

## Cau truc

- `json/<exam-slug>/`: output JSON tho do Gemini trich xuat.
- `markdown/<exam-slug>/`: output Markdown de review nhanh bang mat.

## Quy trinh dung

1. Dat PDF vao `data_scraper/input/school_exams/`.
2. Chay script:

```bash
python data_scraper/extract_school_exam_pdf.py
```

3. Review file JSON va Markdown.
4. Chuyen noi dung da review vao:
   - `obsidian_vault/parsed/...`
   - hoac seed SQL / database.
