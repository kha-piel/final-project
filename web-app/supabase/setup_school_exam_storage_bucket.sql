-- Run this once in Supabase SQL Editor before using the admin PDF import flow.
-- The frontend uploads source PDFs and generated question assets to this bucket.

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'school-exams',
  'school-exams',
  true,
  52428800,
  array[
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/webp'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "school_exams_public_read" on storage.objects;
drop policy if exists "school_exams_authenticated_insert" on storage.objects;
drop policy if exists "school_exams_authenticated_update" on storage.objects;
drop policy if exists "school_exams_authenticated_delete" on storage.objects;

create policy "school_exams_public_read"
on storage.objects
for select
using (bucket_id = 'school-exams');

create policy "school_exams_authenticated_insert"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'school-exams');

create policy "school_exams_authenticated_update"
on storage.objects
for update
to authenticated
using (bucket_id = 'school-exams')
with check (bucket_id = 'school-exams');

create policy "school_exams_authenticated_delete"
on storage.objects
for delete
to authenticated
using (bucket_id = 'school-exams');
