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
  display_variant_code text not null default 'DEFAULT',
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

create index if not exists idx_school_exams_subject_year
  on public.school_exams (subject_code, year desc);

create index if not exists idx_school_exam_sections_exam_order
  on public.school_exam_sections (exam_id, display_order);

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
