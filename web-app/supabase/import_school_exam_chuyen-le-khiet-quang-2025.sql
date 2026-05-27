-- Source: web-app/supabase/school_exams_schema.sql


create table if not exists public.school_exams (
  exam_id text primary key,
  title text not null,
  school_name text not null,
  city text not null,
  subject_code text not null,
  subject_name text not null,
  year integer not null,
  duration_minutes integer not null default 50,
  pdf_url text not null,
  answer_key_provided boolean not null default false,
  source_path text null,
  tags text[] not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.school_exam_sections (
  section_id text primary key,
  exam_id text not null references public.school_exams (exam_id) on delete cascade,
  part_code text not null check (part_code in ('multiple_choice', 'true_false', 'short_answer')),
  title text not null,
  instructions text null,
  start_question_number integer not null,
  end_question_number integer not null,
  display_order integer not null default 0,
  options_per_question integer not null default 4,
  statement_count integer not null default 4,
  created_at timestamptz not null default now(),
  constraint school_exam_sections_range_ck check (end_question_number >= start_question_number)
);

create table if not exists public.school_exam_variants (
  variant_id text primary key,
  exam_id text not null references public.school_exams (exam_id) on delete cascade,
  variant_code text not null,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  constraint school_exam_variants_exam_code_uq unique (exam_id, variant_code)
);

create table if not exists public.school_exam_answer_keys (
  answer_key_id bigint generated always as identity primary key,
  variant_id text not null references public.school_exam_variants (variant_id) on delete cascade,
  question_number integer not null,
  answer_value text not null,
  created_at timestamptz not null default now(),
  constraint school_exam_answer_keys_variant_question_uq unique (variant_id, question_number)
);

create index if not exists idx_school_exams_subject_year
  on public.school_exams (subject_code, year desc);

create index if not exists idx_school_exam_sections_exam_order
  on public.school_exam_sections (exam_id, display_order);

create index if not exists idx_school_exam_variants_exam_order
  on public.school_exam_variants (exam_id, display_order);

create index if not exists idx_school_exam_answer_keys_variant_question
  on public.school_exam_answer_keys (variant_id, question_number);

create or replace function public.set_school_exam_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_school_exams_updated_at on public.school_exams;

create trigger trg_school_exams_updated_at
before update on public.school_exams
for each row
execute function public.set_school_exam_updated_at();


-- Source: web-app/supabase/school_exam_questions_schema.sql


create table if not exists public.school_exam_questions (
  question_id text primary key,
  exam_id text not null references public.school_exams (exam_id) on delete cascade,
  section_id text null references public.school_exam_sections (section_id) on delete set null,
  question_number integer not null,
  difficulty_level integer null check (difficulty_level between 1 and 4),
  question_type text not null check (question_type in ('multiple_choice', 'true_false', 'short_answer')),
  question_text text not null,
  statement_json jsonb not null default '[]'::jsonb,
  explanation text null,
  topic text null,
  obsidian_source_path text null,
  has_image boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint school_exam_questions_exam_number_uq unique (exam_id, question_number)
);

create table if not exists public.school_exam_question_options (
  option_id text primary key,
  question_id text not null references public.school_exam_questions (question_id) on delete cascade,
  option_label text not null,
  option_text text not null,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  constraint school_exam_question_options_label_uq unique (question_id, option_label)
);

create table if not exists public.school_exam_question_assets (
  asset_id text primary key,
  question_id text not null references public.school_exam_questions (question_id) on delete cascade,
  asset_type text not null check (asset_type in ('question_block', 'figure', 'table', 'other')),
  asset_path text not null,
  caption text null,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_school_exam_questions_exam_number
  on public.school_exam_questions (exam_id, question_number);

create index if not exists idx_school_exam_questions_type_level
  on public.school_exam_questions (question_type, difficulty_level);

create index if not exists idx_school_exam_question_options_question
  on public.school_exam_question_options (question_id, display_order);

create index if not exists idx_school_exam_question_assets_question
  on public.school_exam_question_assets (question_id, display_order);

create or replace function public.set_school_exam_question_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_school_exam_questions_updated_at on public.school_exam_questions;

create trigger trg_school_exam_questions_updated_at
before update on public.school_exam_questions
for each row
execute function public.set_school_exam_question_updated_at();


-- Source: web-app/supabase/seed_school_exam_chuyen_le_khiet_quang_2025.sql


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


-- Source: web-app/supabase/seed_school_exam_questions_chuyen-le-khiet-quang-2025.sql


begin;

delete from public.school_exam_question_assets
where question_id in (select question_id from public.school_exam_questions where exam_id = 'chuyen-le-khiet-quang-2025');

delete from public.school_exam_question_options
where question_id in (select question_id from public.school_exam_questions where exam_id = 'chuyen-le-khiet-quang-2025');

delete from public.school_exam_questions
where exam_id = 'chuyen-le-khiet-quang-2025';

insert into public.school_exam_questions (
  question_id, exam_id, section_id, question_number, difficulty_level, question_type,
  question_text, statement_json, explanation, topic, obsidian_source_path,
  has_image, metadata
) values (
  'chuyen-le-khiet-quang-2025-q01',
  'chuyen-le-khiet-quang-2025',
  'chuyen-le-khiet-quang-2025-section-1',
  1,
  1,
  'multiple_choice',
  'Cho hàm số $y = f(x)$ liên tục trên $\mathbb{R}$ và có một nguyên hàm là $F(x)$. Biết rằng $F(1) = 9$, $F(2) = 5$. Giá trị của biểu thức $\int_{1}^{2} f(x) dx$ bằng',
  '[]'::jsonb,
  null,
  'Nguyên hàm',
  'Toan_Hoc/4_Nguyen_Ham_Tich_Phan/1_nguyen_ham.md',
  false,
  '{"source_question_number": 1, "section_number": 1, "difficulty_level": 1, "notes": "", "review_status": "pending_review"}'::jsonb
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'chuyen-le-khiet-quang-2025-q01-opt-a',
  'chuyen-le-khiet-quang-2025-q01',
  'A',
  '14.',
  1
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'chuyen-le-khiet-quang-2025-q01-opt-b',
  'chuyen-le-khiet-quang-2025-q01',
  'B',
  '-4.',
  2
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'chuyen-le-khiet-quang-2025-q01-opt-c',
  'chuyen-le-khiet-quang-2025-q01',
  'C',
  '45.',
  3
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'chuyen-le-khiet-quang-2025-q01-opt-d',
  'chuyen-le-khiet-quang-2025-q01',
  'D',
  '4.',
  4
);

insert into public.school_exam_questions (
  question_id, exam_id, section_id, question_number, difficulty_level, question_type,
  question_text, statement_json, explanation, topic, obsidian_source_path,
  has_image, metadata
) values (
  'chuyen-le-khiet-quang-2025-q02',
  'chuyen-le-khiet-quang-2025',
  'chuyen-le-khiet-quang-2025-section-1',
  2,
  1,
  'multiple_choice',
  'Tập nghiệm của bất phương trình $2^{2+x^2} > 16$ là',
  '[]'::jsonb,
  null,
  'Phương trình mũ và logarit',
  'Toan_Hoc/1_Ham_So/7_phuong_trinh_mu_va_logarit.md',
  false,
  '{"source_question_number": 2, "section_number": 1, "difficulty_level": 1, "notes": "", "review_status": "pending_review"}'::jsonb
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'chuyen-le-khiet-quang-2025-q02-opt-a',
  'chuyen-le-khiet-quang-2025-q02',
  'A',
  '$(- \infty; -\sqrt{2}) \cup (\sqrt{2}; +\infty)$.',
  1
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'chuyen-le-khiet-quang-2025-q02-opt-b',
  'chuyen-le-khiet-quang-2025-q02',
  'B',
  '$(- \infty; -\sqrt{2}] \cup [\sqrt{2}; +\infty)$.',
  2
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'chuyen-le-khiet-quang-2025-q02-opt-c',
  'chuyen-le-khiet-quang-2025-q02',
  'C',
  '$(- \infty; -2) \cup (2; +\infty)$.',
  3
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'chuyen-le-khiet-quang-2025-q02-opt-d',
  'chuyen-le-khiet-quang-2025-q02',
  'D',
  '$(- \infty; -2] \cup [2; +\infty)$.',
  4
);

insert into public.school_exam_questions (
  question_id, exam_id, section_id, question_number, difficulty_level, question_type,
  question_text, statement_json, explanation, topic, obsidian_source_path,
  has_image, metadata
) values (
  'chuyen-le-khiet-quang-2025-q03',
  'chuyen-le-khiet-quang-2025',
  'chuyen-le-khiet-quang-2025-section-1',
  3,
  1,
  'multiple_choice',
  'Cho hàm số $y = f(x)$ xác định trên $\mathbb{R}$ và có bảng biến thiên như bảng dưới đây. Khẳng định nào sau đây đúng?',
  '[]'::jsonb,
  null,
  'Khảo sát và đọc đồ thị hàm số',
  'Toan_Hoc/1_Ham_So/5_khao_sat_do_thi.md',
  true,
  '{"source_question_number": 3, "section_number": 1, "difficulty_level": 1, "notes": "", "review_status": "pending_review"}'::jsonb
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'chuyen-le-khiet-quang-2025-q03-opt-a',
  'chuyen-le-khiet-quang-2025-q03',
  'A',
  'Hàm số đồng biến trên khoảng $(1; 2)$.',
  1
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'chuyen-le-khiet-quang-2025-q03-opt-b',
  'chuyen-le-khiet-quang-2025-q03',
  'B',
  'Hàm số đồng biến trên khoảng $(-5; 4)$.',
  2
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'chuyen-le-khiet-quang-2025-q03-opt-c',
  'chuyen-le-khiet-quang-2025-q03',
  'C',
  'Hàm số nghịch biến trên khoảng $(1; 2)$.',
  3
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'chuyen-le-khiet-quang-2025-q03-opt-d',
  'chuyen-le-khiet-quang-2025-q03',
  'D',
  'Hàm số nghịch biến trên khoảng $(-5; 4)$.',
  4
);

insert into public.school_exam_question_assets (
  asset_id, question_id, asset_type, asset_path, caption, display_order
) values (
  'chuyen-le-khiet-quang-2025-q03-asset-question_block-1',
  'chuyen-le-khiet-quang-2025-q03',
  'question_block',
  'TN_Cau03.png',
  null,
  1
);

insert into public.school_exam_question_assets (
  asset_id, question_id, asset_type, asset_path, caption, display_order
) values (
  'chuyen-le-khiet-quang-2025-q03-asset-figure-2',
  'chuyen-le-khiet-quang-2025-q03',
  'figure',
  'TN_Cau03_hinh1.png',
  null,
  2
);

insert into public.school_exam_questions (
  question_id, exam_id, section_id, question_number, difficulty_level, question_type,
  question_text, statement_json, explanation, topic, obsidian_source_path,
  has_image, metadata
) values (
  'chuyen-le-khiet-quang-2025-q04',
  'chuyen-le-khiet-quang-2025',
  'chuyen-le-khiet-quang-2025-section-1',
  4,
  1,
  'multiple_choice',
  'Họ nguyên hàm của hàm số $f(x) = \sin x$ là',
  '[]'::jsonb,
  null,
  'Nguyên hàm',
  'Toan_Hoc/4_Nguyen_Ham_Tich_Phan/1_nguyen_ham.md',
  false,
  '{"source_question_number": 4, "section_number": 1, "difficulty_level": 1, "notes": "", "review_status": "pending_review"}'::jsonb
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'chuyen-le-khiet-quang-2025-q04-opt-a',
  'chuyen-le-khiet-quang-2025-q04',
  'A',
  '$\sin x + C$.',
  1
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'chuyen-le-khiet-quang-2025-q04-opt-b',
  'chuyen-le-khiet-quang-2025-q04',
  'B',
  '$-\cos x + C$.',
  2
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'chuyen-le-khiet-quang-2025-q04-opt-c',
  'chuyen-le-khiet-quang-2025-q04',
  'C',
  '$-\sin x + C$.',
  3
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'chuyen-le-khiet-quang-2025-q04-opt-d',
  'chuyen-le-khiet-quang-2025-q04',
  'D',
  '$\cos x + C$.',
  4
);

insert into public.school_exam_questions (
  question_id, exam_id, section_id, question_number, difficulty_level, question_type,
  question_text, statement_json, explanation, topic, obsidian_source_path,
  has_image, metadata
) values (
  'chuyen-le-khiet-quang-2025-q05',
  'chuyen-le-khiet-quang-2025',
  'chuyen-le-khiet-quang-2025-section-1',
  5,
  2,
  'multiple_choice',
  'Mỗi ngày bác Mạnh đều đi bộ rèn luyện sức khoẻ. Quãng đường đi bộ mỗi ngày của bác trong 20 ngày được thống kê lại ở bảng sau
Quãng đường (km) [2,7; 3,0) [3,0; 3,3) [3,3; 3,6) [3,6; 3,9) [3,9; 4,2)
Số ngày 3 6 5 4 2
Phương sai của mẫu số liệu ghép nhóm là',
  '[]'::jsonb,
  null,
  'Tứ phân vị và số liệu ghép nhóm',
  'Toan_Hoc/3_Thong_Ke_Xac_Suat/1_khoang_bien_thien_tu_phan_vi.md',
  true,
  '{"source_question_number": 5, "section_number": 1, "difficulty_level": 2, "notes": "", "review_status": "pending_review"}'::jsonb
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'chuyen-le-khiet-quang-2025-q05-opt-a',
  'chuyen-le-khiet-quang-2025-q05',
  'A',
  '1,26.',
  1
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'chuyen-le-khiet-quang-2025-q05-opt-b',
  'chuyen-le-khiet-quang-2025-q05',
  'B',
  '0,26.',
  2
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'chuyen-le-khiet-quang-2025-q05-opt-c',
  'chuyen-le-khiet-quang-2025-q05',
  'C',
  '0,19.',
  3
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'chuyen-le-khiet-quang-2025-q05-opt-d',
  'chuyen-le-khiet-quang-2025-q05',
  'D',
  '0,13.',
  4
);

insert into public.school_exam_question_assets (
  asset_id, question_id, asset_type, asset_path, caption, display_order
) values (
  'chuyen-le-khiet-quang-2025-q05-asset-question_block-1',
  'chuyen-le-khiet-quang-2025-q05',
  'question_block',
  'TN_Cau05.png',
  null,
  1
);

insert into public.school_exam_question_assets (
  asset_id, question_id, asset_type, asset_path, caption, display_order
) values (
  'chuyen-le-khiet-quang-2025-q05-asset-figure-2',
  'chuyen-le-khiet-quang-2025-q05',
  'figure',
  'TN_Cau05_hinh1.png',
  null,
  2
);

insert into public.school_exam_questions (
  question_id, exam_id, section_id, question_number, difficulty_level, question_type,
  question_text, statement_json, explanation, topic, obsidian_source_path,
  has_image, metadata
) values (
  'chuyen-le-khiet-quang-2025-q06',
  'chuyen-le-khiet-quang-2025',
  'chuyen-le-khiet-quang-2025-section-1',
  6,
  2,
  'multiple_choice',
  'Cho hình chóp $S.ABCD$ có đáy $ABCD$ là hình bình hành tâm $O$. Gọi $E, I, K$ lần lượt là trung điểm của các cạnh $SB, BC, CD$. Mặt phẳng nào sau đây song song với $(SAD)$?',
  '[]'::jsonb,
  null,
  'Hình học không gian với véc tơ',
  'Toan_Hoc/2_Hinh_Hoc_Khong_Gian/1_vecto_trong_khong_gian.md',
  true,
  '{"source_question_number": 6, "section_number": 1, "difficulty_level": 2, "notes": "", "review_status": "pending_review"}'::jsonb
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'chuyen-le-khiet-quang-2025-q06-opt-a',
  'chuyen-le-khiet-quang-2025-q06',
  'A',
  '$(BEK)$.',
  1
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'chuyen-le-khiet-quang-2025-q06-opt-b',
  'chuyen-le-khiet-quang-2025-q06',
  'B',
  '$(EIK)$.',
  2
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'chuyen-le-khiet-quang-2025-q06-opt-c',
  'chuyen-le-khiet-quang-2025-q06',
  'C',
  '$(OEI)$.',
  3
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'chuyen-le-khiet-quang-2025-q06-opt-d',
  'chuyen-le-khiet-quang-2025-q06',
  'D',
  '$(KOE)$.',
  4
);

insert into public.school_exam_question_assets (
  asset_id, question_id, asset_type, asset_path, caption, display_order
) values (
  'chuyen-le-khiet-quang-2025-q06-asset-question_block-1',
  'chuyen-le-khiet-quang-2025-q06',
  'question_block',
  'TN_Cau06.png',
  null,
  1
);

insert into public.school_exam_question_assets (
  asset_id, question_id, asset_type, asset_path, caption, display_order
) values (
  'chuyen-le-khiet-quang-2025-q06-asset-figure-2',
  'chuyen-le-khiet-quang-2025-q06',
  'figure',
  'TN_Cau06_hinh1.png',
  null,
  2
);

insert into public.school_exam_questions (
  question_id, exam_id, section_id, question_number, difficulty_level, question_type,
  question_text, statement_json, explanation, topic, obsidian_source_path,
  has_image, metadata
) values (
  'chuyen-le-khiet-quang-2025-q07',
  'chuyen-le-khiet-quang-2025',
  'chuyen-le-khiet-quang-2025-section-1',
  7,
  2,
  'multiple_choice',
  'Cho tứ diện $ABCD$. Gọi $G$ là trọng tâm của tam giác $BCD$. Khẳng định nào sau đây là sai?',
  '[]'::jsonb,
  null,
  null,
  null,
  false,
  '{"source_question_number": 7, "section_number": 1, "difficulty_level": 2, "notes": "", "review_status": "pending_review"}'::jsonb
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'chuyen-le-khiet-quang-2025-q07-opt-a',
  'chuyen-le-khiet-quang-2025-q07',
  'A',
  '$\vec{BC} + \vec{BD} = 3\vec{BG}$.',
  1
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'chuyen-le-khiet-quang-2025-q07-opt-b',
  'chuyen-le-khiet-quang-2025-q07',
  'B',
  '$\vec{AB} + \vec{AC} + \vec{AD} = 3\vec{AG}$.',
  2
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'chuyen-le-khiet-quang-2025-q07-opt-c',
  'chuyen-le-khiet-quang-2025-q07',
  'C',
  '$\vec{BG} + \vec{CG} + \vec{DG} = \vec{0}$.',
  3
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'chuyen-le-khiet-quang-2025-q07-opt-d',
  'chuyen-le-khiet-quang-2025-q07',
  'D',
  '$\vec{GA} + \vec{GB} + \vec{GD} = \vec{0}$.',
  4
);

insert into public.school_exam_questions (
  question_id, exam_id, section_id, question_number, difficulty_level, question_type,
  question_text, statement_json, explanation, topic, obsidian_source_path,
  has_image, metadata
) values (
  'chuyen-le-khiet-quang-2025-q08',
  'chuyen-le-khiet-quang-2025',
  'chuyen-le-khiet-quang-2025-section-1',
  8,
  2,
  'multiple_choice',
  'Dãy số nào trong các dãy số được cho dưới đây là một cấp số nhân?',
  '[]'::jsonb,
  null,
  'Cấp số cộng và cấp số nhân',
  'Toan_Hoc/1_Ham_So/8_cap_so_cong_va_cap_so_nhan.md',
  false,
  '{"source_question_number": 8, "section_number": 1, "difficulty_level": 2, "notes": "", "review_status": "pending_review"}'::jsonb
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'chuyen-le-khiet-quang-2025-q08-opt-a',
  'chuyen-le-khiet-quang-2025-q08',
  'A',
  '1; 2; 3.',
  1
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'chuyen-le-khiet-quang-2025-q08-opt-b',
  'chuyen-le-khiet-quang-2025-q08',
  'B',
  '3; 6; 9.',
  2
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'chuyen-le-khiet-quang-2025-q08-opt-c',
  'chuyen-le-khiet-quang-2025-q08',
  'C',
  '2; 4; 8.',
  3
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'chuyen-le-khiet-quang-2025-q08-opt-d',
  'chuyen-le-khiet-quang-2025-q08',
  'D',
  '2; 4; 6.',
  4
);

insert into public.school_exam_questions (
  question_id, exam_id, section_id, question_number, difficulty_level, question_type,
  question_text, statement_json, explanation, topic, obsidian_source_path,
  has_image, metadata
) values (
  'chuyen-le-khiet-quang-2025-q09',
  'chuyen-le-khiet-quang-2025',
  'chuyen-le-khiet-quang-2025-section-1',
  9,
  3,
  'multiple_choice',
  'Chọn mệnh đề sai trong các mệnh đề sau?',
  '[]'::jsonb,
  null,
  null,
  null,
  false,
  '{"source_question_number": 9, "section_number": 1, "difficulty_level": 3, "notes": "", "review_status": "pending_review"}'::jsonb
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'chuyen-le-khiet-quang-2025-q09-opt-a',
  'chuyen-le-khiet-quang-2025-q09',
  'A',
  'Hàm số $y = \sin x$ là hàm số lẻ.',
  1
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'chuyen-le-khiet-quang-2025-q09-opt-b',
  'chuyen-le-khiet-quang-2025-q09',
  'B',
  'Hàm số $y = \tan x$ là hàm số lẻ.',
  2
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'chuyen-le-khiet-quang-2025-q09-opt-c',
  'chuyen-le-khiet-quang-2025-q09',
  'C',
  'Hàm số $y = \cos x$ là hàm số chẵn.',
  3
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'chuyen-le-khiet-quang-2025-q09-opt-d',
  'chuyen-le-khiet-quang-2025-q09',
  'D',
  'Hàm số $y = \cot x$ là hàm số chẵn.',
  4
);

insert into public.school_exam_questions (
  question_id, exam_id, section_id, question_number, difficulty_level, question_type,
  question_text, statement_json, explanation, topic, obsidian_source_path,
  has_image, metadata
) values (
  'chuyen-le-khiet-quang-2025-q10',
  'chuyen-le-khiet-quang-2025',
  'chuyen-le-khiet-quang-2025-section-1',
  10,
  3,
  'multiple_choice',
  'Cho hình chóp $S.ABCD$ có đáy là hình vuông và $SA \perp (ABCD)$. Mặt phẳng nào sau đây vuông góc với mặt phẳng $(SCD)$?',
  '[]'::jsonb,
  null,
  'Hình học không gian với véc tơ',
  'Toan_Hoc/2_Hinh_Hoc_Khong_Gian/1_vecto_trong_khong_gian.md',
  true,
  '{"source_question_number": 10, "section_number": 1, "difficulty_level": 3, "notes": "", "review_status": "pending_review"}'::jsonb
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'chuyen-le-khiet-quang-2025-q10-opt-a',
  'chuyen-le-khiet-quang-2025-q10',
  'A',
  '$(SAC)$.',
  1
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'chuyen-le-khiet-quang-2025-q10-opt-b',
  'chuyen-le-khiet-quang-2025-q10',
  'B',
  '$(SBD)$.',
  2
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'chuyen-le-khiet-quang-2025-q10-opt-c',
  'chuyen-le-khiet-quang-2025-q10',
  'C',
  '$(SAD)$.',
  3
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'chuyen-le-khiet-quang-2025-q10-opt-d',
  'chuyen-le-khiet-quang-2025-q10',
  'D',
  '$(SAB)$.',
  4
);

insert into public.school_exam_question_assets (
  asset_id, question_id, asset_type, asset_path, caption, display_order
) values (
  'chuyen-le-khiet-quang-2025-q10-asset-question_block-1',
  'chuyen-le-khiet-quang-2025-q10',
  'question_block',
  'TN_Cau10.png',
  null,
  1
);

insert into public.school_exam_question_assets (
  asset_id, question_id, asset_type, asset_path, caption, display_order
) values (
  'chuyen-le-khiet-quang-2025-q10-asset-figure-2',
  'chuyen-le-khiet-quang-2025-q10',
  'figure',
  'TN_Cau10_hinh1.png',
  null,
  2
);

insert into public.school_exam_questions (
  question_id, exam_id, section_id, question_number, difficulty_level, question_type,
  question_text, statement_json, explanation, topic, obsidian_source_path,
  has_image, metadata
) values (
  'chuyen-le-khiet-quang-2025-q11',
  'chuyen-le-khiet-quang-2025',
  'chuyen-le-khiet-quang-2025-section-1',
  11,
  3,
  'multiple_choice',
  'Trong không gian với hệ tọa độ $Oxyz$, véc-tơ nào sau đây là véc-tơ pháp tuyến của mặt phẳng $(P): 2x - y + z + 3 = 0$?',
  '[]'::jsonb,
  null,
  'Phương trình mặt phẳng trong Oxyz',
  'Toan_Hoc/2_Hinh_Hoc_Khong_Gian/4_phuong_trinh_mat_phang.md',
  false,
  '{"source_question_number": 11, "section_number": 1, "difficulty_level": 3, "notes": "", "review_status": "pending_review"}'::jsonb
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'chuyen-le-khiet-quang-2025-q11-opt-a',
  'chuyen-le-khiet-quang-2025-q11',
  'A',
  '$\vec{n_2} = (2; 1; 1)$.',
  1
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'chuyen-le-khiet-quang-2025-q11-opt-b',
  'chuyen-le-khiet-quang-2025-q11',
  'B',
  '$\vec{n_4} = (-1; 1; 3)$.',
  2
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'chuyen-le-khiet-quang-2025-q11-opt-c',
  'chuyen-le-khiet-quang-2025-q11',
  'C',
  '$\vec{n_3} = (2; -1; 3)$.',
  3
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'chuyen-le-khiet-quang-2025-q11-opt-d',
  'chuyen-le-khiet-quang-2025-q11',
  'D',
  '$\vec{n_1} = (2; -1; 1)$.',
  4
);

insert into public.school_exam_questions (
  question_id, exam_id, section_id, question_number, difficulty_level, question_type,
  question_text, statement_json, explanation, topic, obsidian_source_path,
  has_image, metadata
) values (
  'chuyen-le-khiet-quang-2025-q12',
  'chuyen-le-khiet-quang-2025',
  'chuyen-le-khiet-quang-2025-section-1',
  12,
  4,
  'multiple_choice',
  'Trong không gian với hệ tọa độ $Oxyz$, phương trình nào sau đây là phương trình mặt cầu?',
  '[]'::jsonb,
  null,
  'Hệ trục tọa độ Oxyz',
  'Toan_Hoc/2_Hinh_Hoc_Khong_Gian/2_he_truc_toa_do_Oxyz.md',
  false,
  '{"source_question_number": 12, "section_number": 1, "difficulty_level": 4, "notes": "", "review_status": "pending_review"}'::jsonb
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'chuyen-le-khiet-quang-2025-q12-opt-a',
  'chuyen-le-khiet-quang-2025-q12',
  'A',
  '$(x^2 - 8)^2 + (y - 12)^2 + (z - 24)^2 = 9^2$.',
  1
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'chuyen-le-khiet-quang-2025-q12-opt-b',
  'chuyen-le-khiet-quang-2025-q12',
  'B',
  '$(x - 9)^2 + (y^2 - 10)^2 + (z - 11)^2 = 12^2$.',
  2
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'chuyen-le-khiet-quang-2025-q12-opt-c',
  'chuyen-le-khiet-quang-2025-q12',
  'C',
  '$(x - 13)^2 + (y - 24)^2 - (z - 36)^2 = 7^2$.',
  3
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'chuyen-le-khiet-quang-2025-q12-opt-d',
  'chuyen-le-khiet-quang-2025-q12',
  'D',
  '$(x - 1)^2 + (y - 2)^2 + (z - 3)^2 = 5^2$.',
  4
);

insert into public.school_exam_questions (
  question_id, exam_id, section_id, question_number, difficulty_level, question_type,
  question_text, statement_json, explanation, topic, obsidian_source_path,
  has_image, metadata
) values (
  'chuyen-le-khiet-quang-2025-q13',
  'chuyen-le-khiet-quang-2025',
  'chuyen-le-khiet-quang-2025-section-2',
  13,
  2,
  'true_false',
  'Cho hàm số $f(x) = \sqrt{x} + \sqrt{32 - x}$.',
  '[{"label": "a", "text": "Hàm số có tập xác định là $(0; 32)$."}, {"label": "b", "text": "$f''(x) = \\frac{1}{2\\sqrt{x}} + \\frac{1}{2\\sqrt{32-x}}$"}, {"label": "c", "text": "Phương trình $f''(x) = 0$ có hai nghiệm phân biệt."}, {"label": "d", "text": "Hàm số đạt giá trị lớn nhất là $M$ và giá trị nhỏ nhất là $m$ thì $\\frac{M}{m} = \\frac{\\sqrt{2}}{2}$"}]'::jsonb,
  null,
  null,
  null,
  false,
  '{"source_question_number": 1, "section_number": 2, "difficulty_level": 2, "notes": "", "review_status": "pending_review"}'::jsonb
);

insert into public.school_exam_questions (
  question_id, exam_id, section_id, question_number, difficulty_level, question_type,
  question_text, statement_json, explanation, topic, obsidian_source_path,
  has_image, metadata
) values (
  'chuyen-le-khiet-quang-2025-q14',
  'chuyen-le-khiet-quang-2025',
  'chuyen-le-khiet-quang-2025-section-2',
  14,
  2,
  'true_false',
  'Trong một trò chơi điện tử, với hệ trục tọa độ $Oxyz$ cho trước, đơn vị giả định trên mỗi trục là mét, người chơi điều khiển nhân vật chính như một chất điểm di động trên mặt đất (là mặt phẳng $Oxy$). Sau khi chiến đấu để vượt qua thử thách, nhân vật chính muốn qua màn thì phải đến vị trí gần với một phi thuyền để được bay vào trong phi thuyền đi đến một màn khác, gặp những thử thách mới.
Giả sử nhân vật chính sau khi chiến đấu xong màn một thì đứng ở vị trí $A$ có tọa độ $(1; 2; 0)$, khi ấy trên bầu trời xuất hiện một chiếc phi thuyền ở vị trí $(-8; -3; 4)$, nhân vật chính nếu cách phi thuyền không quá 5 mét thì được phép bay vào phi thuyền.',
  '[{"label": "a", "text": "Vùng được phép bay được giới hạn bởi mặt cầu có phương trình $(x+8)^2+(y+3)^2+(z-4)^2 = 25$."}, {"label": "b", "text": "Khi nhân vật chính vừa chiến đấu xong thì khoảng cách ngắn nhất từ nhân vật chính đến vùng được phép bay bằng $6,05$ m (làm tròn đến hàng phần trăm)."}, {"label": "c", "text": "Nhân vật chính chạy trên một đường thẳng $d$ để đến được vị trí gần vùng được phép bay nhất, phương trình tham số đường thẳng $d$ là $\\begin{cases} x = 1+9t \\\\ y = 2 + 5t \\\\ z=0 \\end{cases}$"}, {"label": "d", "text": "Nhân vật chính xuất phát từ $A$, chạy trên đường thẳng $d$ với gia tốc $1$ m/s$^2$, ngay khi được phép thì bay lên phi thuyền với tốc độ $6$ m/s. Tổng thời gian của quá trình nói trên bằng $4,7$ giây (làm tròn đến hàng phần chục)."}]'::jsonb,
  null,
  'Phương trình mặt phẳng trong Oxyz',
  'Toan_Hoc/2_Hinh_Hoc_Khong_Gian/4_phuong_trinh_mat_phang.md',
  false,
  '{"source_question_number": 2, "section_number": 2, "difficulty_level": 2, "notes": "", "review_status": "pending_review"}'::jsonb
);

insert into public.school_exam_questions (
  question_id, exam_id, section_id, question_number, difficulty_level, question_type,
  question_text, statement_json, explanation, topic, obsidian_source_path,
  has_image, metadata
) values (
  'chuyen-le-khiet-quang-2025-q15',
  'chuyen-le-khiet-quang-2025',
  'chuyen-le-khiet-quang-2025-section-2',
  15,
  3,
  'true_false',
  'Tháp giải nhiệt tại một nhà máy điện hạt nhân có hình dạng là một phần của khối tròn xoay khi cho hypebol $(H)$ quay quanh một trục đối xứng của $(H)$. Tháp có chiều cao là $120$ mét, bán kính đáy dưới bằng $40$ mét. Thiết lập hệ trục tọa độ $Oxy$ như hình vẽ sao cho mặt cắt dạng hypebol của tháp nhận $Oy$ làm trục đối xứng; lấy đơn vị trên mỗi trục là mét. gốc $O$ ở vị trí có độ cao $80$ mét so với mặt đất và đoạn giao nhau giữa trục $Ox$ với tháp bằng $30$ mét.',
  '[{"label": "a", "text": "Diện tích đáy dưới của tháp bằng $5027$ m$^2$ (làm tròn đến hàng đơn vị)."}, {"label": "b", "text": "Các điểm $(-20; 0)$, $(20; 0)$ thuộc hypebol $(H)$."}, {"label": "c", "text": "Phương trình $(H)$ là $\\frac{x^2}{15^2} - \\frac{y^2}{11520} = 1$."}, {"label": "d", "text": "Thể tích của tháp giải nhiệt này bằng $214414$ m$^3$ (làm tròn đến hàng đơn vị)."}]'::jsonb,
  null,
  'Hệ trục tọa độ Oxyz',
  'Toan_Hoc/2_Hinh_Hoc_Khong_Gian/2_he_truc_toa_do_Oxyz.md',
  true,
  '{"source_question_number": 3, "section_number": 2, "difficulty_level": 3, "notes": "", "review_status": "pending_review"}'::jsonb
);

insert into public.school_exam_question_assets (
  asset_id, question_id, asset_type, asset_path, caption, display_order
) values (
  'chuyen-le-khiet-quang-2025-q15-asset-question_block-1',
  'chuyen-le-khiet-quang-2025-q15',
  'question_block',
  'DS_Cau03.png',
  null,
  1
);

insert into public.school_exam_question_assets (
  asset_id, question_id, asset_type, asset_path, caption, display_order
) values (
  'chuyen-le-khiet-quang-2025-q15-asset-figure-2',
  'chuyen-le-khiet-quang-2025-q15',
  'figure',
  'DS_Cau03_hinh1.png',
  null,
  2
);

insert into public.school_exam_questions (
  question_id, exam_id, section_id, question_number, difficulty_level, question_type,
  question_text, statement_json, explanation, topic, obsidian_source_path,
  has_image, metadata
) values (
  'chuyen-le-khiet-quang-2025-q16',
  'chuyen-le-khiet-quang-2025',
  'chuyen-le-khiet-quang-2025-section-2',
  16,
  4,
  'true_false',
  'Bạn Bắc chuẩn bị đi dã ngoại tại Bùi Hui trong hai ngày thứ Bảy và Chủ nhật. Biết rằng ở Bùi Hui, mỗi ngày chỉ có nắng hoặc mưa, nếu một ngày là nắng thì khả năng ngày hôm sau vẫn nắng là $80\%$, còn nếu một ngày là mưa thì khả năng ngày hôm sau vẫn mưa là $30\%$. Theo dự báo thời tiết, xác suất trời sẽ nắng vào thứ Bảy là $70\%$.',
  '[{"label": "a", "text": "Xác suất để cả hai ngày nắng là $0,56$."}, {"label": "b", "text": "Xác suất để có ít nhất một ngày nắng là $0,9$."}, {"label": "c", "text": "Xác suất để Chủ nhật nắng là $0,77$."}, {"label": "d", "text": "Biết Chủ nhật là ngày nắng, xác suất để thứ Bảy là ngày nắng là $0,7$."}]'::jsonb,
  null,
  'Xác suất biến cố độc lập',
  'Toan_Hoc/3_Thong_Ke_Xac_Suat/3_xac_suat_co_dieu_kien.md',
  false,
  '{"source_question_number": 4, "section_number": 2, "difficulty_level": 4, "notes": "", "review_status": "pending_review"}'::jsonb
);

insert into public.school_exam_questions (
  question_id, exam_id, section_id, question_number, difficulty_level, question_type,
  question_text, statement_json, explanation, topic, obsidian_source_path,
  has_image, metadata
) values (
  'chuyen-le-khiet-quang-2025-q17',
  'chuyen-le-khiet-quang-2025',
  'chuyen-le-khiet-quang-2025-section-3',
  17,
  1,
  'short_answer',
  'Hai đội tuyển $A$ và $B$ tham gia giải bóng bàn. Mỗi đội có $7$ người đã được sắp xếp theo một thứ tự nhất định. Đầu tiên, người thứ nhất của đội $A$, đấu với người thứ nhất của đội $B$ và người thua sẽ bị loại. Sau đó, người chiến thắng đấu tiếp với người thứ hai của đội kia, các trận thi đấu tiếp theo diễn ra tương tự. Cuộc thi đấu kết thúc cho đến khi tất cả người chơi của $1$ đội đều bị loại và đội còn lại là chiến thắng. Hỏi có bao nhiêu cách diễn ra cuộc thi đấu?',
  '[]'::jsonb,
  null,
  'Quy hoạch tuyến tính và bài toán tối ưu',
  null,
  false,
  '{"source_question_number": 1, "section_number": 3, "difficulty_level": 1, "notes": "", "review_status": "pending_review"}'::jsonb
);

insert into public.school_exam_questions (
  question_id, exam_id, section_id, question_number, difficulty_level, question_type,
  question_text, statement_json, explanation, topic, obsidian_source_path,
  has_image, metadata
) values (
  'chuyen-le-khiet-quang-2025-q18',
  'chuyen-le-khiet-quang-2025',
  'chuyen-le-khiet-quang-2025-section-3',
  18,
  1,
  'short_answer',
  'Hàm lượng các chất vitamin A, vitamin B và vitamin K chứa trong $100$ g mỗi loại thực phẩm $X$ và $Y$ được cho bảng sau:
vitamin A(mg) vitamin B (mg) vitamin K(mg)
X 200 600 8
Y 500 300 6
Từ hai loại thực phẩm $X$ và $Y$, người ta muốn tạo ra một lượng thực phẩm hỗn hợp chứa ít nhất $2000$ mg vitamin A, $3000$ mg vitamin B, $48$ mg vitamin K. Lượng thực phẩm hỗn hợp có khối lượng nhỏ nhất thỏa mãn yêu cầu trên là bao nhiêu? (đơn vị: kilogam; làm tròn đến hàng phần trăm)',
  '[]'::jsonb,
  null,
  'Cực trị, GTLN và GTNN',
  'Toan_Hoc/1_Ham_So/3_gia_tri_lon_nhat_nho_nhat.md',
  true,
  '{"source_question_number": 2, "section_number": 3, "difficulty_level": 1, "notes": "", "review_status": "pending_review"}'::jsonb
);

insert into public.school_exam_question_assets (
  asset_id, question_id, asset_type, asset_path, caption, display_order
) values (
  'chuyen-le-khiet-quang-2025-q18-asset-question_block-1',
  'chuyen-le-khiet-quang-2025-q18',
  'question_block',
  'TLN_Cau02.png',
  null,
  1
);

insert into public.school_exam_question_assets (
  asset_id, question_id, asset_type, asset_path, caption, display_order
) values (
  'chuyen-le-khiet-quang-2025-q18-asset-figure-2',
  'chuyen-le-khiet-quang-2025-q18',
  'figure',
  'TLN_Cau02_hinh1.png',
  null,
  2
);

insert into public.school_exam_questions (
  question_id, exam_id, section_id, question_number, difficulty_level, question_type,
  question_text, statement_json, explanation, topic, obsidian_source_path,
  has_image, metadata
) values (
  'chuyen-le-khiet-quang-2025-q19',
  'chuyen-le-khiet-quang-2025',
  'chuyen-le-khiet-quang-2025-section-3',
  19,
  2,
  'short_answer',
  'Một công ty du lịch thông báo giá tiền cho chuyến đi tham quan của một nhóm khách du lịch như sau: $20$ khách đầu tiên có giá là $30$ USD/người; nếu có nhiều hơn $20$ người đăng kí thì cứ có thêm $1$ người, giá vé sẽ giảm $1$ USD/người cho toàn bộ hành khách. Hỏi công ty nên giới hạn số lượng hành khách tối đa là bao nhiêu để công ty không bị lỗ? Biết rằng chi phí của chuyến đi là $400$ USD.',
  '[]'::jsonb,
  null,
  'Cực trị, GTLN và GTNN',
  'Toan_Hoc/1_Ham_So/3_gia_tri_lon_nhat_nho_nhat.md',
  false,
  '{"source_question_number": 3, "section_number": 3, "difficulty_level": 2, "notes": "", "review_status": "pending_review"}'::jsonb
);

insert into public.school_exam_questions (
  question_id, exam_id, section_id, question_number, difficulty_level, question_type,
  question_text, statement_json, explanation, topic, obsidian_source_path,
  has_image, metadata
) values (
  'chuyen-le-khiet-quang-2025-q20',
  'chuyen-le-khiet-quang-2025',
  'chuyen-le-khiet-quang-2025-section-3',
  20,
  2,
  'short_answer',
  'Một viên gạch hình vuông $ABCD$ có cạnh $60$. Người ta trang trí viên gạch bằng các đường cong $(L_1)$, $(L_2)$. $(L_1)$ là tập hợp các điểm $M$ thỏa $MC = MA + 50$ hoặc $MA = MC + 50$. Khi quay đường cong $(L_1)$ quanh tâm viên gạch hình vuông đó một góc $90^\circ$ ta được đường cong $(L_2)$. Tính diện tích hình phẳng giới hạn bởi các đường cong $(L_1)$, $(L_2)$ và các cạnh viên gạch (phần màu trắng, kết quả làm tròn đến hàng đơn vị).',
  '[]'::jsonb,
  null,
  'Tích phân và diện tích hình phẳng',
  'Toan_Hoc/4_Nguyen_Ham_Tich_Phan/3_ung_dung_hinh_hoc_tich_phan.md',
  true,
  '{"source_question_number": 4, "section_number": 3, "difficulty_level": 2, "notes": "", "review_status": "pending_review"}'::jsonb
);

insert into public.school_exam_question_assets (
  asset_id, question_id, asset_type, asset_path, caption, display_order
) values (
  'chuyen-le-khiet-quang-2025-q20-asset-question_block-1',
  'chuyen-le-khiet-quang-2025-q20',
  'question_block',
  'TLN_Cau04.png',
  null,
  1
);

insert into public.school_exam_question_assets (
  asset_id, question_id, asset_type, asset_path, caption, display_order
) values (
  'chuyen-le-khiet-quang-2025-q20-asset-figure-2',
  'chuyen-le-khiet-quang-2025-q20',
  'figure',
  'TLN_Cau04_hinh1.png',
  null,
  2
);

insert into public.school_exam_questions (
  question_id, exam_id, section_id, question_number, difficulty_level, question_type,
  question_text, statement_json, explanation, topic, obsidian_source_path,
  has_image, metadata
) values (
  'chuyen-le-khiet-quang-2025-q21',
  'chuyen-le-khiet-quang-2025',
  'chuyen-le-khiet-quang-2025-section-3',
  21,
  3,
  'short_answer',
  'Cho hình lăng trụ tam giác đều $ABC.A''B''C''$ có tất cả các cạnh bằng $2$ cm. Gọi $M$ và $N$ lần lượt là trung điểm $B''C$ và $A''B''$. Gọi $\alpha$ là góc tạo bởi $MN$ và $(BCC''B'')$. Tính $\tan^2 \alpha$.',
  '[]'::jsonb,
  null,
  'Hình học không gian với véc tơ',
  'Toan_Hoc/2_Hinh_Hoc_Khong_Gian/1_vecto_trong_khong_gian.md',
  false,
  '{"source_question_number": 5, "section_number": 3, "difficulty_level": 3, "notes": "", "review_status": "pending_review"}'::jsonb
);

insert into public.school_exam_questions (
  question_id, exam_id, section_id, question_number, difficulty_level, question_type,
  question_text, statement_json, explanation, topic, obsidian_source_path,
  has_image, metadata
) values (
  'chuyen-le-khiet-quang-2025-q22',
  'chuyen-le-khiet-quang-2025',
  'chuyen-le-khiet-quang-2025-section-3',
  22,
  4,
  'short_answer',
  'Bốn tay vợt Tennis An, Bình, Công và Duy tham gia vào một giải đấu có tổng cộng ba trận đấu. Đầu tiên, hai người chơi được chọn ngẫu nhiên để chơi với nhau; hai người chơi còn lại cũng chơi với nhau. Những người chiến thắng trong hai trận đấu đó sẽ thi đấu với nhau để quyết định nhà vô địch giải đấu. An, Bình và Công ngang sức nhau (nghĩa là, khi một trận đấu được chơi giữa hai người trong ba người An, Bình, Công, xác suất mỗi người chơi thắng là $\frac{1}{2}$). Khi Duy đấu với An, Bình hoặc Công, xác suất Duy thắng là $0,7$. Xác định xác suất Bình vô địch giải đấu.',
  '[]'::jsonb,
  null,
  'Xác suất biến cố độc lập',
  'Toan_Hoc/3_Thong_Ke_Xac_Suat/3_xac_suat_co_dieu_kien.md',
  false,
  '{"source_question_number": 6, "section_number": 3, "difficulty_level": 4, "notes": "", "review_status": "pending_review"}'::jsonb
);

commit;
