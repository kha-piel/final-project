# Supabase Notes

File chính để import vào Supabase là [supabase_schema.sql](/workspaces/final-project/database/supabase_schema.sql).

## Mục tiêu

- Giữ nguyên tư duy dữ liệu của `schema.sql` gốc.
- Chuyển sang PostgreSQL/Supabase theo hướng production-ready.
- Tách user app ra khỏi bảng auth nội bộ của Supabase bằng `public.user_profiles`.

## Khác biệt chính so với schema SQLite gốc

- `users` được thay bằng `public.user_profiles`, khóa chính là `uuid` và tham chiếu `auth.users(id)`.
- Các bảng nghiệp vụ dùng `uuid` thay vì `INTEGER AUTOINCREMENT`.
- `TEXT datetime(...)` được thay bằng `timestamptz`.
- Các cột enum dùng PostgreSQL enum type thay vì `CHECK (...)` rải rác.
- Cờ `0/1` được thay bằng `boolean`.
- Bổ sung `metadata jsonb` ở các bảng chính để mở rộng mà không phải migrate ngay.
- Bổ sung `attempt_answers` để lưu từng câu trả lời trong mỗi lần thi, phù hợp analytics và review chi tiết.
- Bổ sung trigger `updated_at`.
- Bật RLS cơ bản cho dữ liệu cá nhân và public content.

## Mapping từ schema cũ sang schema mới

- `users.user_id` -> `user_profiles.user_id`
- `questions.created_by` -> `user_profiles.user_id`
- `exams.created_by` -> `user_profiles.user_id`
- `student_attempts.user_id` -> `user_profiles.user_id`
- `duration` -> `duration_minutes`
- `total_time_taken` -> `total_time_taken_seconds`

## Gợi ý import dữ liệu cũ

Nếu bạn đang có dữ liệu SQLite thật và muốn đưa lên Supabase:

1. Export từng bảng sang CSV hoặc JSON.
2. Map khóa số nguyên cũ sang UUID mới.
3. Import `subjects`, `topics`, `questions`, `answers`, `exams`, `exam_questions` trước.
4. Import `user_profiles` sau khi user đã tồn tại trong `auth.users`.
5. Import `student_attempts` và `attempt_answers` cuối cùng.

## Lưu ý tích hợp app

- App Java hiện tại vẫn đang dùng SQLite nội bộ, chưa dùng schema Supabase này trực tiếp.
- Nếu chuyển app sang Supabase thật, DAO/model sẽ cần đổi từ `int` sang `UUID` và đăng nhập nên đi qua Supabase Auth thay vì tự kiểm tra `password_hash`.
