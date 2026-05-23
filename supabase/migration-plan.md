# Supabase Migration Plan

## Muc tieu

File nay ghi thu tu migration du lieu tu app Java hien tai sang schema dich cho web-first.

Tai lieu lien quan:
- [current-flows.md](/abs/path/c:/Users/ADMIIN/VScode/final-project/docs/current-flows.md)
- [web-target-architecture.md](/abs/path/c:/Users/ADMIIN/VScode/final-project/docs/web-target-architecture.md)
- [data-mapping.md](/abs/path/c:/Users/ADMIIN/VScode/final-project/docs/data-mapping.md)

## Nguyen tac

- Khong migrate tat ca cung luc.
- Uu tien content tables truoc user-attempt tables.
- Khong coi `SQLite users` la auth truth.
- `auth.users` cua Supabase la auth truth.
- `public.user_profiles` la app-profile truth.

## Pha 0: Chuan bi

1. Chot schema dich trong `supabase/schema.sql`.
2. Tao project Supabase moi hoac schema moi an toan de test.
3. Chot env cho web:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_AI_API_BASE_URL`

## Pha 1: Content migration

Muc tieu:
- web co the load duoc dashboard va exam content truoc khi can lich su that

Thu tu:
1. `subjects`
2. `topics`
3. `questions`
4. `answers`
5. `exams`
6. `exam_questions`

Kiem tra sau pha 1:
- load mon hoc duoc
- load chuyen de theo mon duoc
- loc cau hoi theo topic + difficulty duoc
- tao de custom duoc

## Pha 2: User profile migration

Muc tieu:
- web auth va app profile thong nhau

Thu tu:
1. tao user test trong `auth.users`
2. map vao `public.user_profiles`
3. chuan hoa username/email/full_name/status/role

Luu y:
- neu du lieu user cu trong SQLite khong trung voi auth.users, can migration co mapping bang tam
- khong duoc dua `int user_id` cu len lam primary key dich

## Pha 3: Attempt migration

Muc tieu:
- dashboard web xem duoc lich su lam bai

Thu tu:
1. migrate `student_attempts`
2. map `user_id int` cu sang `uuid user_id` moi
3. map `exam_id int` cu sang `uuid exam_id` moi

Kiem tra:
- lich su user load duoc
- diem/tong ket khop

## Pha 4: Attempt detail

Muc tieu:
- review chi tiet va analytics chuan hon

Thu tu:
1. tao `attempt_answers`
2. neu khong co du lieu cu thi bat dau ghi moi tu web app

Luu y:
- app Java hien tai chua co bang runtime truth cho tung dap an theo attempt
- co the chap nhan khong backfill day du lich su cu

## Pha 5: Chat persistence

Muc tieu:
- neu can luu chat theo bai lam

Thu tu:
1. `chat_sessions`
2. `chat_messages`

Luu y:
- hien tai flow exam moi luu chat o memory
- khong can chan Buoc 4 web skeleton vi pha nay

## Migration artifact de xuat

Nen co cac script ve sau:
- `supabase/migrations/001_core_content.sql`
- `supabase/migrations/002_profiles.sql`
- `supabase/migrations/003_attempts.sql`
- `scripts/export_sqlite_content.*`
- `scripts/import_supabase_content.*`

## Dinh nghia xong Buoc 3

Buoc 3 duoc xem la xong khi:
- da ro schema runtime hien tai
- da ro schema dich
- da ro bang nao migrate truoc
- da ro user id strategy se doi sang uuid
- da co `docs/data-mapping.md`
- da co `supabase/schema.sql`
- da co `supabase/migration-plan.md`

## Buoc tiep theo

Sau file nay, co the sang Buoc 4:
- dung `web-app/`
- setup Vite + React + TS
- setup router
- setup Supabase client
- tao page skeleton
