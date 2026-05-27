begin;

delete from public.school_exam_sections
where exam_id in ('thpt-tran-phu-quang-ninh-2026-lan-3');

delete from public.school_exam_question_assets
where question_id in (select question_id from public.school_exam_questions where exam_id = 'thpt-tran-phu-quang-ninh-2026-lan-3');

delete from public.school_exam_question_options
where question_id in (select question_id from public.school_exam_questions where exam_id = 'thpt-tran-phu-quang-ninh-2026-lan-3');

delete from public.school_exam_questions
where exam_id in ('thpt-tran-phu-quang-ninh-2026-lan-3');

delete from public.school_exams
where exam_id in ('thpt-tran-phu-quang-ninh-2026-lan-3');

insert into public.school_exams (
  exam_id, title, school_name, city, subject_code, subject_name,
  year, duration_minutes, pdf_url, display_variant_code, answer_key_provided, source_path, tags, is_active
) values (
  'thpt-tran-phu-quang-ninh-2026-lan-3',
  'De thi thu TN THPT 2026 mon Toan lan 3 THPT Tran Phu Quang Ninh',
  'THPT Tran Phu',
  'Quang Ninh',
  'TOAN',
  'Toan hoc',
  2026,
  90,
  '/school-exams/thpt-tran-phu-quang-ninh-2026-lan-3.pdf',
  'DEFAULT',
  true,
  'data_scraper/input/school_exams/thpt-tran-phu-quang-ninh-2026-lan-3.pdf',
  array['de thi thu', 'toan', '2026', 'quang ninh', 'pdf'],
  true
);

insert into public.school_exam_sections (
  section_id, exam_id, part_code, title, instructions,
  start_question_number, end_question_number, display_order, options_per_question, statement_count
) values
  (
    'thpt-tran-phu-quang-ninh-2026-lan-3-section-1',
    'thpt-tran-phu-quang-ninh-2026-lan-3',
    'multiple_choice',
    'Phan I. Trac nghiem nhieu lua chon',
    'Cau 1 den 12, moi cau chon 1 trong 4 dap an.',
    1,
    12,
    1,
    4,
    0
  ),
  (
    'thpt-tran-phu-quang-ninh-2026-lan-3-section-2',
    'thpt-tran-phu-quang-ninh-2026-lan-3',
    'true_false',
    'Phan II. Dung / Sai',
    'Cau 13 den 16, moi cau co 4 y a, b, c, d va chon D hoac S cho tung y.',
    13,
    16,
    2,
    0,
    4
  ),
  (
    'thpt-tran-phu-quang-ninh-2026-lan-3-section-3',
    'thpt-tran-phu-quang-ninh-2026-lan-3',
    'short_answer',
    'Phan III. Tra loi ngan',
    'Cau 17 den 22, nhap dap an vao o trong.',
    17,
    22,
    3,
    0,
    0
  );

commit;
