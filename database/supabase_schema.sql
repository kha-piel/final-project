-- ============================================================
-- DATABASE: THPTQG AI - Supabase / PostgreSQL Schema
-- Based on: database/schema.sql (SQLite desktop version)
-- Purpose : Production-ready schema for Supabase with room to grow
-- ============================================================

begin;

create extension if not exists pgcrypto;
create extension if not exists citext;

-- ============================================================
-- SHARED TYPES
-- ============================================================

do $$
begin
    if not exists (select 1 from pg_type where typname = 'app_role') then
        create type public.app_role as enum ('student', 'teacher', 'admin');
    end if;

    if not exists (select 1 from pg_type where typname = 'account_status') then
        create type public.account_status as enum ('active', 'inactive', 'banned');
    end if;

    if not exists (select 1 from pg_type where typname = 'question_type') then
        create type public.question_type as enum ('single_choice', 'multi_choice', 'true_false', 'fill_blank');
    end if;

    if not exists (select 1 from pg_type where typname = 'exam_type') then
        create type public.exam_type as enum ('official_mock', 'practice', 'ai_generated', 'custom');
    end if;

    if not exists (select 1 from pg_type where typname = 'attempt_status') then
        create type public.attempt_status as enum ('in_progress', 'completed', 'abandoned');
    end if;

    if not exists (select 1 from pg_type where typname = 'chat_session_status') then
        create type public.chat_session_status as enum ('active', 'archived');
    end if;

    if not exists (select 1 from pg_type where typname = 'chat_role') then
        create type public.chat_role as enum ('user', 'assistant', 'system');
    end if;
end $$;

-- ============================================================
-- COMMON FUNCTIONS
-- ============================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = timezone('utc', now());
    return new;
end;
$$;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into public.user_profiles (
        user_id,
        username,
        email,
        full_name
    )
    values (
        new.id,
        coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1)),
        new.email,
        coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name')
    )
    on conflict (user_id) do nothing;

    return new;
end;
$$;

-- ============================================================
-- USER MANAGEMENT
-- ============================================================

create table if not exists public.user_profiles (
    user_id uuid primary key references auth.users(id) on delete cascade,
    username citext not null unique,
    email citext not null unique,
    full_name text,
    phone text,
    date_of_birth date,
    role public.app_role not null default 'student',
    status public.account_status not null default 'active',
    avatar_url text,
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now()),
    last_login_at timestamptz,
    constraint username_min_length check (char_length(username::text) >= 3)
);

create index if not exists idx_user_profiles_role on public.user_profiles(role);
create index if not exists idx_user_profiles_status on public.user_profiles(status);

drop trigger if exists trg_user_profiles_updated_at on public.user_profiles;
create trigger trg_user_profiles_updated_at
before update on public.user_profiles
for each row
execute function public.set_updated_at();

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_auth_user();

-- ============================================================
-- QUESTION BANK
-- ============================================================

create table if not exists public.subjects (
    subject_id uuid primary key default gen_random_uuid(),
    subject_code text not null unique,
    subject_name text not null,
    is_active boolean not null default true,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now()),
    constraint subject_code_uppercase check (subject_code = upper(subject_code))
);

drop trigger if exists trg_subjects_updated_at on public.subjects;
create trigger trg_subjects_updated_at
before update on public.subjects
for each row
execute function public.set_updated_at();

insert into public.subjects (subject_code, subject_name)
values
    ('TOAN', 'Toán học'),
    ('LY', 'Vật Lý'),
    ('HOA', 'Hóa học'),
    ('SINH', 'Sinh học'),
    ('VAN', 'Ngữ văn'),
    ('ANH', 'Tiếng Anh'),
    ('SU', 'Lịch Sử'),
    ('DIA', 'Địa lý'),
    ('GDCD', 'Giáo dục Công dân')
on conflict (subject_code) do update
set subject_name = excluded.subject_name;

create table if not exists public.topics (
    topic_id uuid primary key default gen_random_uuid(),
    subject_id uuid not null references public.subjects(subject_id) on delete restrict,
    parent_topic_id uuid references public.topics(topic_id) on delete set null,
    topic_name text not null,
    topic_slug text,
    topic_order integer not null default 0,
    description text,
    is_active boolean not null default true,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now()),
    constraint uq_topics_subject_name unique (subject_id, topic_name)
);

create index if not exists idx_topics_subject on public.topics(subject_id);
create index if not exists idx_topics_parent on public.topics(parent_topic_id);
create index if not exists idx_topics_slug on public.topics(topic_slug);

drop trigger if exists trg_topics_updated_at on public.topics;
create trigger trg_topics_updated_at
before update on public.topics
for each row
execute function public.set_updated_at();

create table if not exists public.questions (
    question_id uuid primary key default gen_random_uuid(),
    topic_id uuid not null references public.topics(topic_id) on delete restrict,
    content text not null,
    image_url text,
    level smallint not null default 1 check (level between 1 and 4),
    question_type public.question_type not null default 'single_choice',
    year integer,
    is_official boolean not null default false,
    source text,
    obsidian_source_path text,
    explanation text,
    created_by uuid references public.user_profiles(user_id) on delete set null,
    is_active boolean not null default true,
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_questions_topic on public.questions(topic_id);
create index if not exists idx_questions_level on public.questions(level);
create index if not exists idx_questions_official on public.questions(is_official);
create index if not exists idx_questions_year on public.questions(year);
create index if not exists idx_questions_topic_level on public.questions(topic_id, level, is_active);
create index if not exists idx_questions_created_by on public.questions(created_by);

drop trigger if exists trg_questions_updated_at on public.questions;
create trigger trg_questions_updated_at
before update on public.questions
for each row
execute function public.set_updated_at();

create table if not exists public.answers (
    answer_id uuid primary key default gen_random_uuid(),
    question_id uuid not null references public.questions(question_id) on delete cascade,
    option_label text not null,
    content text not null,
    is_correct boolean not null default false,
    explanation text,
    display_order integer not null default 0,
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now()),
    constraint uq_answers_option unique (question_id, option_label)
);

create index if not exists idx_answers_question on public.answers(question_id);
create index if not exists idx_answers_correct on public.answers(question_id, is_correct);

drop trigger if exists trg_answers_updated_at on public.answers;
create trigger trg_answers_updated_at
before update on public.answers
for each row
execute function public.set_updated_at();

-- ============================================================
-- EXAMS & RESULTS
-- ============================================================

create table if not exists public.exams (
    exam_id uuid primary key default gen_random_uuid(),
    title text not null,
    slug text unique,
    description text,
    subject_id uuid references public.subjects(subject_id) on delete set null,
    exam_type public.exam_type not null default 'practice',
    duration_minutes integer not null default 50 check (duration_minutes > 0),
    total_questions integer not null default 40 check (total_questions >= 0),
    pass_score numeric(5,2) default 5.00,
    shuffle_answers boolean not null default true,
    shuffle_questions boolean not null default false,
    is_public boolean not null default true,
    published_at timestamptz,
    created_by uuid references public.user_profiles(user_id) on delete set null,
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_exams_subject on public.exams(subject_id);
create index if not exists idx_exams_type on public.exams(exam_type);
create index if not exists idx_exams_public on public.exams(is_public, published_at desc nulls last);
create index if not exists idx_exams_created_by on public.exams(created_by);

drop trigger if exists trg_exams_updated_at on public.exams;
create trigger trg_exams_updated_at
before update on public.exams
for each row
execute function public.set_updated_at();

create table if not exists public.exam_questions (
    exam_id uuid not null references public.exams(exam_id) on delete cascade,
    question_id uuid not null references public.questions(question_id) on delete cascade,
    question_order integer not null default 0,
    point_weight numeric(8,4) not null default 0.25 check (point_weight >= 0),
    created_at timestamptz not null default timezone('utc', now()),
    primary key (exam_id, question_id),
    constraint uq_exam_questions_order unique (exam_id, question_order)
);

create index if not exists idx_exam_questions_exam_order on public.exam_questions(exam_id, question_order);
create index if not exists idx_exam_questions_question on public.exam_questions(question_id);

create table if not exists public.student_attempts (
    attempt_id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.user_profiles(user_id) on delete cascade,
    exam_id uuid not null references public.exams(exam_id) on delete cascade,
    score numeric(5,2),
    correct_count integer not null default 0 check (correct_count >= 0),
    wrong_count integer not null default 0 check (wrong_count >= 0),
    skipped_count integer not null default 0 check (skipped_count >= 0),
    total_time_taken_seconds integer check (total_time_taken_seconds >= 0),
    status public.attempt_status not null default 'in_progress',
    started_at timestamptz not null default timezone('utc', now()),
    completed_at timestamptz,
    ai_feedback text,
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now()),
    constraint completed_attempt_requires_timestamp
        check (status <> 'completed' or completed_at is not null)
);

create index if not exists idx_attempts_user on public.student_attempts(user_id);
create index if not exists idx_attempts_exam on public.student_attempts(exam_id);
create index if not exists idx_attempts_status on public.student_attempts(status);
create index if not exists idx_attempts_completed on public.student_attempts(completed_at desc nulls last);
create index if not exists idx_attempts_user_date on public.student_attempts(user_id, completed_at desc nulls last);

drop trigger if exists trg_attempts_updated_at on public.student_attempts;
create trigger trg_attempts_updated_at
before update on public.student_attempts
for each row
execute function public.set_updated_at();

create table if not exists public.attempt_answers (
    attempt_answer_id uuid primary key default gen_random_uuid(),
    attempt_id uuid not null references public.student_attempts(attempt_id) on delete cascade,
    question_id uuid not null references public.questions(question_id) on delete cascade,
    selected_answer_id uuid references public.answers(answer_id) on delete set null,
    is_correct boolean,
    answered_at timestamptz not null default timezone('utc', now()),
    time_spent_seconds integer check (time_spent_seconds is null or time_spent_seconds >= 0),
    metadata jsonb not null default '{}'::jsonb,
    constraint uq_attempt_question unique (attempt_id, question_id)
);

create index if not exists idx_attempt_answers_attempt on public.attempt_answers(attempt_id);
create index if not exists idx_attempt_answers_question on public.attempt_answers(question_id);
create index if not exists idx_attempt_answers_selected on public.attempt_answers(selected_answer_id);

-- ============================================================
-- AI CHAT
-- ============================================================

create table if not exists public.chat_sessions (
    session_id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.user_profiles(user_id) on delete cascade,
    title text,
    context_summary text,
    related_exam_id uuid references public.exams(exam_id) on delete set null,
    related_attempt_id uuid references public.student_attempts(attempt_id) on delete set null,
    total_messages integer not null default 0 check (total_messages >= 0),
    status public.chat_session_status not null default 'active',
    metadata jsonb not null default '{}'::jsonb,
    started_at timestamptz not null default timezone('utc', now()),
    last_message_at timestamptz,
    ended_at timestamptz,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_chat_sessions_user on public.chat_sessions(user_id);
create index if not exists idx_chat_sessions_last_message on public.chat_sessions(last_message_at desc nulls last);

drop trigger if exists trg_chat_sessions_updated_at on public.chat_sessions;
create trigger trg_chat_sessions_updated_at
before update on public.chat_sessions
for each row
execute function public.set_updated_at();

create table if not exists public.chat_messages (
    message_id uuid primary key default gen_random_uuid(),
    session_id uuid not null references public.chat_sessions(session_id) on delete cascade,
    role public.chat_role not null,
    content text not null,
    related_question_id uuid references public.questions(question_id) on delete set null,
    tokens_used integer check (tokens_used is null or tokens_used >= 0),
    model_used text,
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_chat_messages_session on public.chat_messages(session_id);
create index if not exists idx_chat_messages_created on public.chat_messages(created_at desc);
create index if not exists idx_chat_messages_session_role on public.chat_messages(session_id, role, created_at);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.user_profiles enable row level security;
alter table public.student_attempts enable row level security;
alter table public.attempt_answers enable row level security;
alter table public.chat_sessions enable row level security;
alter table public.chat_messages enable row level security;

do $$
begin
    if not exists (
        select 1 from pg_policies
        where schemaname = 'public' and tablename = 'user_profiles' and policyname = 'user_profiles_select_own'
    ) then
        create policy user_profiles_select_own
            on public.user_profiles
            for select
            using (auth.uid() = user_id);
    end if;

    if not exists (
        select 1 from pg_policies
        where schemaname = 'public' and tablename = 'user_profiles' and policyname = 'user_profiles_update_own'
    ) then
        create policy user_profiles_update_own
            on public.user_profiles
            for update
            using (auth.uid() = user_id)
            with check (auth.uid() = user_id);
    end if;

    if not exists (
        select 1 from pg_policies
        where schemaname = 'public' and tablename = 'student_attempts' and policyname = 'student_attempts_own_all'
    ) then
        create policy student_attempts_own_all
            on public.student_attempts
            for all
            using (auth.uid() = user_id)
            with check (auth.uid() = user_id);
    end if;

    if not exists (
        select 1 from pg_policies
        where schemaname = 'public' and tablename = 'attempt_answers' and policyname = 'attempt_answers_via_own_attempt'
    ) then
        create policy attempt_answers_via_own_attempt
            on public.attempt_answers
            for all
            using (
                exists (
                    select 1
                    from public.student_attempts sa
                    where sa.attempt_id = attempt_answers.attempt_id
                      and sa.user_id = auth.uid()
                )
            )
            with check (
                exists (
                    select 1
                    from public.student_attempts sa
                    where sa.attempt_id = attempt_answers.attempt_id
                      and sa.user_id = auth.uid()
                )
            );
    end if;

    if not exists (
        select 1 from pg_policies
        where schemaname = 'public' and tablename = 'chat_sessions' and policyname = 'chat_sessions_own_all'
    ) then
        create policy chat_sessions_own_all
            on public.chat_sessions
            for all
            using (auth.uid() = user_id)
            with check (auth.uid() = user_id);
    end if;

    if not exists (
        select 1 from pg_policies
        where schemaname = 'public' and tablename = 'chat_messages' and policyname = 'chat_messages_via_own_session'
    ) then
        create policy chat_messages_via_own_session
            on public.chat_messages
            for all
            using (
                exists (
                    select 1
                    from public.chat_sessions cs
                    where cs.session_id = chat_messages.session_id
                      and cs.user_id = auth.uid()
                )
            )
            with check (
                exists (
                    select 1
                    from public.chat_sessions cs
                    where cs.session_id = chat_messages.session_id
                      and cs.user_id = auth.uid()
                )
            );
    end if;
end $$;

-- Public read access for published learning content
alter table public.subjects enable row level security;
alter table public.topics enable row level security;
alter table public.questions enable row level security;
alter table public.answers enable row level security;
alter table public.exams enable row level security;
alter table public.exam_questions enable row level security;

do $$
begin
    if not exists (
        select 1 from pg_policies
        where schemaname = 'public' and tablename = 'subjects' and policyname = 'subjects_public_read'
    ) then
        create policy subjects_public_read
            on public.subjects
            for select
            using (is_active = true);
    end if;

    if not exists (
        select 1 from pg_policies
        where schemaname = 'public' and tablename = 'topics' and policyname = 'topics_public_read'
    ) then
        create policy topics_public_read
            on public.topics
            for select
            using (is_active = true);
    end if;

    if not exists (
        select 1 from pg_policies
        where schemaname = 'public' and tablename = 'questions' and policyname = 'questions_public_read'
    ) then
        create policy questions_public_read
            on public.questions
            for select
            using (is_active = true);
    end if;

    if not exists (
        select 1 from pg_policies
        where schemaname = 'public' and tablename = 'answers' and policyname = 'answers_public_read'
    ) then
        create policy answers_public_read
            on public.answers
            for select
            using (
                exists (
                    select 1
                    from public.questions q
                    where q.question_id = answers.question_id
                      and q.is_active = true
                )
            );
    end if;

    if not exists (
        select 1 from pg_policies
        where schemaname = 'public' and tablename = 'exams' and policyname = 'exams_public_read'
    ) then
        create policy exams_public_read
            on public.exams
            for select
            using (is_public = true);
    end if;

    if not exists (
        select 1 from pg_policies
        where schemaname = 'public' and tablename = 'exam_questions' and policyname = 'exam_questions_public_read'
    ) then
        create policy exam_questions_public_read
            on public.exam_questions
            for select
            using (
                exists (
                    select 1
                    from public.exams e
                    where e.exam_id = exam_questions.exam_id
                      and e.is_public = true
                )
            );
    end if;
end $$;

commit;
