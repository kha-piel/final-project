begin;

delete from public.school_exam_answer_keys
where variant_id in ('chuyen-le-khiet-quang-2025-default');

delete from public.school_exam_variants
where variant_id in ('chuyen-le-khiet-quang-2025-default');

delete from public.school_exam_sections
where exam_id in ('chuyen-le-khiet-quang-2025');

delete from public.school_exam_question_assets
where question_id in (select question_id from public.school_exam_questions where exam_id = 'chuyen-le-khiet-quang-2025');

delete from public.school_exam_question_options
where question_id in (select question_id from public.school_exam_questions where exam_id = 'chuyen-le-khiet-quang-2025');

delete from public.school_exam_questions
where exam_id in ('chuyen-le-khiet-quang-2025');

delete from public.school_exams
where exam_id in ('chuyen-le-khiet-quang-2025');

insert into public.school_exams (
  exam_id, title, school_name, city, subject_code, subject_name,
  year, duration_minutes, pdf_url, answer_key_provided, source_path, tags, is_active
) values (
  'chuyen-le-khiet-quang-2025',
  'De Toan Chuyen Le Khiet Quang nam hoc 2025-2026',
  'Chuyen Le Khiet Quang',
  '',
  'TOAN',
  'Toan hoc',
  2025,
  90,
  '/school-exams/chuyen-le-khiet-quang-2025.pdf',
  true,
  'data_scraper/input/school_exams/chuyen-le-khiet-quang-2025.pdf',
  array['de truong', 'toan', '2025-2026', 'pdf'],
  true
);

insert into public.school_exam_sections (
  section_id, exam_id, part_code, title, instructions,
  start_question_number, end_question_number, display_order, options_per_question, statement_count
) values
  (
    'chuyen-le-khiet-quang-2025-section-1',
    'chuyen-le-khiet-quang-2025',
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
    'chuyen-le-khiet-quang-2025-section-2',
    'chuyen-le-khiet-quang-2025',
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
    'chuyen-le-khiet-quang-2025-section-3',
    'chuyen-le-khiet-quang-2025',
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
  'chuyen-le-khiet-quang-2025-default',
  'chuyen-le-khiet-quang-2025',
  'DEFAULT',
  1
);

insert into public.school_exam_answer_keys (
  variant_id, question_number, answer_value
) values
  ('chuyen-le-khiet-quang-2025-default', 1, 'B'),
  ('chuyen-le-khiet-quang-2025-default', 2, 'A'),
  ('chuyen-le-khiet-quang-2025-default', 3, 'C'),
  ('chuyen-le-khiet-quang-2025-default', 4, 'B'),
  ('chuyen-le-khiet-quang-2025-default', 5, 'D'),
  ('chuyen-le-khiet-quang-2025-default', 6, 'D'),
  ('chuyen-le-khiet-quang-2025-default', 7, 'D'),
  ('chuyen-le-khiet-quang-2025-default', 8, 'C'),
  ('chuyen-le-khiet-quang-2025-default', 9, 'D'),
  ('chuyen-le-khiet-quang-2025-default', 10, 'C'),
  ('chuyen-le-khiet-quang-2025-default', 11, 'D'),
  ('chuyen-le-khiet-quang-2025-default', 12, 'D'),
  ('chuyen-le-khiet-quang-2025-default', 13, 'SSSD'),
  ('chuyen-le-khiet-quang-2025-default', 14, 'DDDD'),
  ('chuyen-le-khiet-quang-2025-default', 15, 'DSSD'),
  ('chuyen-le-khiet-quang-2025-default', 16, 'DSDS'),
  ('chuyen-le-khiet-quang-2025-default', 17, '3432'),
  ('chuyen-le-khiet-quang-2025-default', 18, '0,66 kg'),
  ('chuyen-le-khiet-quang-2025-default', 19, '40 khach'),
  ('chuyen-le-khiet-quang-2025-default', 20, '2502'),
  ('chuyen-le-khiet-quang-2025-default', 21, '3'),
  ('chuyen-le-khiet-quang-2025-default', 22, '0,17');

commit;
