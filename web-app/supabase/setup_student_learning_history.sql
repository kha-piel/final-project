-- Run this once after the base auth/profile and school exam tables exist.
-- It stores school-exam attempts, school-exam AI review chat, and extra student profile fields.

alter table public.user_profiles
  add column if not exists school_name text null,
  add column if not exists province_city text null,
  add column if not exists class_name text null,
  add column if not exists phone_number text null,
  add column if not exists thptqg_exam_year integer null,
  add column if not exists admission_combo text null,
  add column if not exists target_score numeric(4, 2) null,
  add column if not exists target_university text null,
  add column if not exists target_major text null,
  add column if not exists study_note text null;

alter table public.user_profiles enable row level security;

drop policy if exists "user_profiles_owner_select" on public.user_profiles;
drop policy if exists "user_profiles_owner_update" on public.user_profiles;
drop policy if exists "user_profiles_owner_insert" on public.user_profiles;

create policy "user_profiles_owner_select"
on public.user_profiles
for select
to authenticated
using (user_id = auth.uid() or lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));

create policy "user_profiles_owner_update"
on public.user_profiles
for update
to authenticated
using (user_id = auth.uid() or lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')))
with check (user_id = auth.uid() or lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));

create policy "user_profiles_owner_insert"
on public.user_profiles
for insert
to authenticated
with check (user_id = auth.uid() or lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));

create table if not exists public.student_school_exam_attempts (
  attempt_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  school_exam_id text not null references public.school_exams (exam_id) on delete cascade,
  variant_id text null references public.school_exam_variants (variant_id) on delete set null,
  variant_code text null,
  score numeric(5, 2) null,
  correct_count integer not null default 0,
  wrong_count integer not null default 0,
  skipped_count integer not null default 0,
  total_count integer not null default 0,
  started_at timestamptz not null,
  completed_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.student_school_exam_answers (
  answer_id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.student_school_exam_attempts (attempt_id) on delete cascade,
  question_number integer not null,
  question_type text not null,
  selected_answer text null,
  correct_answer text null,
  is_correct boolean not null default false,
  question_content text null,
  topic text null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint student_school_exam_answers_attempt_question_uq unique (attempt_id, question_number)
);

create table if not exists public.student_school_exam_ai_messages (
  message_id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.student_school_exam_attempts (attempt_id) on delete cascade,
  question_number integer null,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_student_school_exam_attempts_user_completed
  on public.student_school_exam_attempts (user_id, completed_at desc);

create index if not exists idx_student_school_exam_answers_attempt
  on public.student_school_exam_answers (attempt_id, question_number);

create index if not exists idx_student_school_exam_ai_messages_attempt
  on public.student_school_exam_ai_messages (attempt_id, created_at);

create or replace function public.set_student_learning_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_student_school_exam_attempts_updated_at on public.student_school_exam_attempts;
create trigger trg_student_school_exam_attempts_updated_at
before update on public.student_school_exam_attempts
for each row
execute function public.set_student_learning_updated_at();

alter table public.student_school_exam_attempts enable row level security;
alter table public.student_school_exam_answers enable row level security;
alter table public.student_school_exam_ai_messages enable row level security;

drop policy if exists "student_school_exam_attempts_owner_select" on public.student_school_exam_attempts;
drop policy if exists "student_school_exam_attempts_owner_insert" on public.student_school_exam_attempts;
drop policy if exists "student_school_exam_attempts_owner_update" on public.student_school_exam_attempts;
drop policy if exists "student_school_exam_attempts_admin_select" on public.student_school_exam_attempts;

create policy "student_school_exam_attempts_owner_select"
on public.student_school_exam_attempts
for select
to authenticated
using (user_id = auth.uid());

create policy "student_school_exam_attempts_owner_insert"
on public.student_school_exam_attempts
for insert
to authenticated
with check (user_id = auth.uid());

create policy "student_school_exam_attempts_owner_update"
on public.student_school_exam_attempts
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "student_school_exam_attempts_admin_select"
on public.student_school_exam_attempts
for select
to authenticated
using (public.current_user_is_school_exam_admin());

drop policy if exists "student_school_exam_answers_owner_select" on public.student_school_exam_answers;
drop policy if exists "student_school_exam_answers_owner_insert" on public.student_school_exam_answers;
drop policy if exists "student_school_exam_answers_admin_select" on public.student_school_exam_answers;

create policy "student_school_exam_answers_owner_select"
on public.student_school_exam_answers
for select
to authenticated
using (
  exists (
    select 1
    from public.student_school_exam_attempts attempts
    where attempts.attempt_id = student_school_exam_answers.attempt_id
      and attempts.user_id = auth.uid()
  )
);

create policy "student_school_exam_answers_owner_insert"
on public.student_school_exam_answers
for insert
to authenticated
with check (
  exists (
    select 1
    from public.student_school_exam_attempts attempts
    where attempts.attempt_id = student_school_exam_answers.attempt_id
      and attempts.user_id = auth.uid()
  )
);

create policy "student_school_exam_answers_admin_select"
on public.student_school_exam_answers
for select
to authenticated
using (public.current_user_is_school_exam_admin());

drop policy if exists "student_school_exam_ai_messages_owner_select" on public.student_school_exam_ai_messages;
drop policy if exists "student_school_exam_ai_messages_owner_insert" on public.student_school_exam_ai_messages;
drop policy if exists "student_school_exam_ai_messages_admin_select" on public.student_school_exam_ai_messages;

create policy "student_school_exam_ai_messages_owner_select"
on public.student_school_exam_ai_messages
for select
to authenticated
using (
  exists (
    select 1
    from public.student_school_exam_attempts attempts
    where attempts.attempt_id = student_school_exam_ai_messages.attempt_id
      and attempts.user_id = auth.uid()
  )
);

create policy "student_school_exam_ai_messages_owner_insert"
on public.student_school_exam_ai_messages
for insert
to authenticated
with check (
  exists (
    select 1
    from public.student_school_exam_attempts attempts
    where attempts.attempt_id = student_school_exam_ai_messages.attempt_id
      and attempts.user_id = auth.uid()
  )
);

create policy "student_school_exam_ai_messages_admin_select"
on public.student_school_exam_ai_messages
for select
to authenticated
using (public.current_user_is_school_exam_admin());
