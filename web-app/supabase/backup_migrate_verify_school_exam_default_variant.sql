begin;

create table if not exists public.backup_school_exam_variants as
select *
from public.school_exam_variants
where false;

create table if not exists public.backup_school_exam_answer_keys as
select *
from public.school_exam_answer_keys
where false;

insert into public.backup_school_exam_variants
select *
from public.school_exam_variants
where not exists (
  select 1
  from public.backup_school_exam_variants backup
  where backup.variant_id = public.school_exam_variants.variant_id
);

insert into public.backup_school_exam_answer_keys
select *
from public.school_exam_answer_keys
where not exists (
  select 1
  from public.backup_school_exam_answer_keys backup
  where backup.answer_key_id = public.school_exam_answer_keys.answer_key_id
);

alter table public.school_exams
  add column if not exists display_variant_code text not null default 'DEFAULT';

alter table public.school_exam_questions
  add column if not exists correct_answer text null;

do $$
begin
  if to_regclass('public.school_exam_variants') is not null then
    update public.school_exams exams
    set display_variant_code = coalesce(primary_variant.variant_code, exams.display_variant_code, 'DEFAULT')
    from (
      select distinct on (exam_id)
        exam_id,
        variant_code
      from public.school_exam_variants
      order by exam_id, display_order asc, created_at asc
    ) primary_variant
    where primary_variant.exam_id = exams.exam_id;
  end if;
end $$;

do $$
begin
  if to_regclass('public.school_exam_answer_keys') is not null
     and to_regclass('public.school_exam_variants') is not null then
    update public.school_exam_questions questions
    set correct_answer = answer_keys.answer_value
    from public.school_exam_answer_keys answer_keys
    join public.school_exam_variants variants
      on variants.variant_id = answer_keys.variant_id
    where variants.exam_id = questions.exam_id
      and answer_keys.question_number = questions.question_number;
  end if;
end $$;

alter table public.student_school_exam_attempts
  drop column if exists variant_id;

drop table if exists public.school_exam_answer_keys;
drop table if exists public.school_exam_variants;

commit;

select
  to_regclass('public.school_exam_variants') as variants_table,
  to_regclass('public.school_exam_answer_keys') as answer_keys_table,
  to_regclass('public.backup_school_exam_variants') as backup_variants_table,
  to_regclass('public.backup_school_exam_answer_keys') as backup_answer_keys_table;

select
  exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'school_exams'
      and column_name = 'display_variant_code'
  ) as has_display_variant_code,
  exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'school_exam_questions'
      and column_name = 'correct_answer'
  ) as has_correct_answer,
  exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'student_school_exam_attempts'
      and column_name = 'variant_id'
  ) as still_has_variant_id;

select
  count(*) as exams_with_display_variant_code
from public.school_exams
where coalesce(display_variant_code, '') <> '';

select
  count(*) as questions_with_correct_answer
from public.school_exam_questions
where coalesce(correct_answer, '') <> '';
