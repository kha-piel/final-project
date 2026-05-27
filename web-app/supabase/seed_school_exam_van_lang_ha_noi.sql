begin;

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
  year, duration_minutes, pdf_url, display_variant_code, answer_key_provided, source_path, tags, is_active
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
  'DEFAULT',
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

commit;
