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
