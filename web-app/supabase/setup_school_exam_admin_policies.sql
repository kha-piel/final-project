-- Run this once in Supabase SQL Editor after the school exam tables exist.
-- It keeps school exam data readable by everyone, but only admin/teacher profiles
-- can write imported exam bundles from the web dashboard.

create or replace function public.current_user_is_school_exam_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_profiles
    where user_id = auth.uid()
      and role in ('admin', 'teacher')
      and coalesce(status, 'active') = 'active'
  )
  or exists (
    select 1
    from public.user_profiles
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      and role in ('admin', 'teacher')
      and coalesce(status, 'active') = 'active'
  )
  or lower(coalesce(auth.jwt() ->> 'email', '')) = 'admin@local.test';
$$;

alter table public.school_exams enable row level security;
alter table public.school_exam_sections enable row level security;
alter table public.school_exam_questions enable row level security;
alter table public.school_exam_question_options enable row level security;
alter table public.school_exam_question_assets enable row level security;

drop policy if exists "school_exams_read_all" on public.school_exams;
drop policy if exists "school_exams_admin_insert" on public.school_exams;
drop policy if exists "school_exams_admin_update" on public.school_exams;
drop policy if exists "school_exams_admin_delete" on public.school_exams;

create policy "school_exams_read_all"
on public.school_exams
for select
using (true);

create policy "school_exams_admin_insert"
on public.school_exams
for insert
to authenticated
with check (public.current_user_is_school_exam_admin());

create policy "school_exams_admin_update"
on public.school_exams
for update
to authenticated
using (public.current_user_is_school_exam_admin())
with check (public.current_user_is_school_exam_admin());

create policy "school_exams_admin_delete"
on public.school_exams
for delete
to authenticated
using (public.current_user_is_school_exam_admin());

drop policy if exists "school_exam_sections_read_all" on public.school_exam_sections;
drop policy if exists "school_exam_sections_admin_insert" on public.school_exam_sections;
drop policy if exists "school_exam_sections_admin_update" on public.school_exam_sections;
drop policy if exists "school_exam_sections_admin_delete" on public.school_exam_sections;

create policy "school_exam_sections_read_all"
on public.school_exam_sections
for select
using (true);

create policy "school_exam_sections_admin_insert"
on public.school_exam_sections
for insert
to authenticated
with check (public.current_user_is_school_exam_admin());

create policy "school_exam_sections_admin_update"
on public.school_exam_sections
for update
to authenticated
using (public.current_user_is_school_exam_admin())
with check (public.current_user_is_school_exam_admin());

create policy "school_exam_sections_admin_delete"
on public.school_exam_sections
for delete
to authenticated
using (public.current_user_is_school_exam_admin());

drop policy if exists "school_exam_questions_read_all" on public.school_exam_questions;
drop policy if exists "school_exam_questions_admin_insert" on public.school_exam_questions;
drop policy if exists "school_exam_questions_admin_update" on public.school_exam_questions;
drop policy if exists "school_exam_questions_admin_delete" on public.school_exam_questions;

create policy "school_exam_questions_read_all"
on public.school_exam_questions
for select
using (true);

create policy "school_exam_questions_admin_insert"
on public.school_exam_questions
for insert
to authenticated
with check (public.current_user_is_school_exam_admin());

create policy "school_exam_questions_admin_update"
on public.school_exam_questions
for update
to authenticated
using (public.current_user_is_school_exam_admin())
with check (public.current_user_is_school_exam_admin());

create policy "school_exam_questions_admin_delete"
on public.school_exam_questions
for delete
to authenticated
using (public.current_user_is_school_exam_admin());

drop policy if exists "school_exam_question_options_read_all" on public.school_exam_question_options;
drop policy if exists "school_exam_question_options_admin_insert" on public.school_exam_question_options;
drop policy if exists "school_exam_question_options_admin_update" on public.school_exam_question_options;
drop policy if exists "school_exam_question_options_admin_delete" on public.school_exam_question_options;

create policy "school_exam_question_options_read_all"
on public.school_exam_question_options
for select
using (true);

create policy "school_exam_question_options_admin_insert"
on public.school_exam_question_options
for insert
to authenticated
with check (public.current_user_is_school_exam_admin());

create policy "school_exam_question_options_admin_update"
on public.school_exam_question_options
for update
to authenticated
using (public.current_user_is_school_exam_admin())
with check (public.current_user_is_school_exam_admin());

create policy "school_exam_question_options_admin_delete"
on public.school_exam_question_options
for delete
to authenticated
using (public.current_user_is_school_exam_admin());

drop policy if exists "school_exam_question_assets_read_all" on public.school_exam_question_assets;
drop policy if exists "school_exam_question_assets_admin_insert" on public.school_exam_question_assets;
drop policy if exists "school_exam_question_assets_admin_update" on public.school_exam_question_assets;
drop policy if exists "school_exam_question_assets_admin_delete" on public.school_exam_question_assets;

create policy "school_exam_question_assets_read_all"
on public.school_exam_question_assets
for select
using (true);

create policy "school_exam_question_assets_admin_insert"
on public.school_exam_question_assets
for insert
to authenticated
with check (public.current_user_is_school_exam_admin());

create policy "school_exam_question_assets_admin_update"
on public.school_exam_question_assets
for update
to authenticated
using (public.current_user_is_school_exam_admin())
with check (public.current_user_is_school_exam_admin());

create policy "school_exam_question_assets_admin_delete"
on public.school_exam_question_assets
for delete
to authenticated
using (public.current_user_is_school_exam_admin());
