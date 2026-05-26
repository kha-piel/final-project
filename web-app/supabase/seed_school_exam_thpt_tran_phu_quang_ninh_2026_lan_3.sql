begin;

delete from public.school_exam_answer_keys
where variant_id in ('thpt-tran-phu-quang-ninh-2026-lan-3-default');

delete from public.school_exam_variants
where variant_id in ('thpt-tran-phu-quang-ninh-2026-lan-3-default');

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
  year, duration_minutes, pdf_url, answer_key_provided, source_path, tags, is_active
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

insert into public.school_exam_variants (
  variant_id, exam_id, variant_code, display_order
) values (
  'thpt-tran-phu-quang-ninh-2026-lan-3-default',
  'thpt-tran-phu-quang-ninh-2026-lan-3',
  'DEFAULT',
  1
);

insert into public.school_exam_answer_keys (
  variant_id, question_number, answer_value
) values
  ('thpt-tran-phu-quang-ninh-2026-lan-3-default', 1, 'A'),
  ('thpt-tran-phu-quang-ninh-2026-lan-3-default', 2, 'B'),
  ('thpt-tran-phu-quang-ninh-2026-lan-3-default', 3, 'C'),
  ('thpt-tran-phu-quang-ninh-2026-lan-3-default', 4, 'D'),
  ('thpt-tran-phu-quang-ninh-2026-lan-3-default', 5, 'C'),
  ('thpt-tran-phu-quang-ninh-2026-lan-3-default', 6, 'A'),
  ('thpt-tran-phu-quang-ninh-2026-lan-3-default', 7, 'D'),
  ('thpt-tran-phu-quang-ninh-2026-lan-3-default', 8, 'A'),
  ('thpt-tran-phu-quang-ninh-2026-lan-3-default', 9, 'D'),
  ('thpt-tran-phu-quang-ninh-2026-lan-3-default', 10, 'C'),
  ('thpt-tran-phu-quang-ninh-2026-lan-3-default', 11, 'B'),
  ('thpt-tran-phu-quang-ninh-2026-lan-3-default', 12, 'C'),
  ('thpt-tran-phu-quang-ninh-2026-lan-3-default', 13, 'DSSD'),
  ('thpt-tran-phu-quang-ninh-2026-lan-3-default', 14, 'SSSD'),
  ('thpt-tran-phu-quang-ninh-2026-lan-3-default', 15, 'DSDD'),
  ('thpt-tran-phu-quang-ninh-2026-lan-3-default', 16, 'SDSD'),
  ('thpt-tran-phu-quang-ninh-2026-lan-3-default', 17, '34'),
  ('thpt-tran-phu-quang-ninh-2026-lan-3-default', 18, '4'),
  ('thpt-tran-phu-quang-ninh-2026-lan-3-default', 19, '711'),
  ('thpt-tran-phu-quang-ninh-2026-lan-3-default', 20, '4,8'),
  ('thpt-tran-phu-quang-ninh-2026-lan-3-default', 21, '0,72'),
  ('thpt-tran-phu-quang-ninh-2026-lan-3-default', 22, '3659');

commit;
