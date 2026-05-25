begin;

delete from public.school_exam_answer_keys
where variant_id in ('van-lang-ha-noi-default');

delete from public.school_exam_variants
where variant_id in ('van-lang-ha-noi-default');

delete from public.school_exam_sections
where exam_id in ('thpt-van-lang-ha-noi');

delete from public.school_exam_question_assets
where question_id in (select question_id from public.school_exam_questions where exam_id = 'thpt-van-lang-ha-noi');

delete from public.school_exam_question_options
where question_id in (select question_id from public.school_exam_questions where exam_id = 'thpt-van-lang-ha-noi');

delete from public.school_exam_questions
where exam_id in ('thpt-van-lang-ha-noi');

delete from public.school_exams
where exam_id in ('thpt-van-lang-ha-noi');

insert into public.school_exams (
  exam_id, title, school_name, city, subject_code, subject_name,
  year, duration_minutes, pdf_url, answer_key_provided, source_path, tags, is_active
) values (
  'thpt-van-lang-ha-noi',
  'De THPT Van Lang - Ha Noi',
  'THPT Van Lang',
  'Ha Noi',
  'TOAN',
  'Toan hoc',
  2025,
  50,
  '/school-exams/thpt-van-lang-ha-noi-2025.pdf',
  true,
  'data_scraper/input/school_exams/thpt-van-lang-ha-noi-2025.pdf',
  array['de truong', 'toan 12', 'ha noi', 'pdf'],
  true
);

insert into public.school_exam_sections (
  section_id, exam_id, part_code, title, instructions,
  start_question_number, end_question_number, display_order, options_per_question, statement_count
) values
  (
    'thpt-van-lang-ha-noi-section-1',
    'thpt-van-lang-ha-noi',
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
    'thpt-van-lang-ha-noi-section-2',
    'thpt-van-lang-ha-noi',
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
    'thpt-van-lang-ha-noi-section-3',
    'thpt-van-lang-ha-noi',
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
  'van-lang-ha-noi-default',
  'thpt-van-lang-ha-noi',
  'DEFAULT',
  1
);

insert into public.school_exam_answer_keys (
  variant_id, question_number, answer_value
) values
  ('van-lang-ha-noi-default', 1, 'B'),
  ('van-lang-ha-noi-default', 2, 'B'),
  ('van-lang-ha-noi-default', 3, 'D'),
  ('van-lang-ha-noi-default', 4, 'B'),
  ('van-lang-ha-noi-default', 5, 'B'),
  ('van-lang-ha-noi-default', 6, 'A'),
  ('van-lang-ha-noi-default', 7, 'A'),
  ('van-lang-ha-noi-default', 8, 'B'),
  ('van-lang-ha-noi-default', 9, 'D'),
  ('van-lang-ha-noi-default', 10, 'D'),
  ('van-lang-ha-noi-default', 11, 'C'),
  ('van-lang-ha-noi-default', 12, 'D'),
  ('van-lang-ha-noi-default', 13, 'SDDS'),
  ('van-lang-ha-noi-default', 14, 'SDSD'),
  ('van-lang-ha-noi-default', 15, 'DDSS'),
  ('van-lang-ha-noi-default', 16, 'DSSD'),
  ('van-lang-ha-noi-default', 17, '1,25'),
  ('van-lang-ha-noi-default', 18, '0,84'),
  ('van-lang-ha-noi-default', 19, '0,87'),
  ('van-lang-ha-noi-default', 20, '590'),
  ('van-lang-ha-noi-default', 21, '576'),
  ('van-lang-ha-noi-default', 22, '6,8');

commit;
