-- Scaffold draft question banks for Physics topics.
-- Safe by default:
-- - creates internal supplemental exams
-- - marks them is_active = false so students do not see placeholders
-- - inserts 30 placeholder multiple-choice questions per topic
-- Replace placeholder texts/answers before switching any exam to is_active = true.

do $$
begin
  create temporary table tmp_physics_topic_exam (
    exam_id text not null,
    title text not null,
    topic_slug text not null,
    topic_name text not null,
    topic_order integer not null
  ) on commit drop;

  insert into tmp_physics_topic_exam (
    exam_id,
    title,
    topic_slug,
    topic_name,
    topic_order
  )
  values
    ('draft-vat-ly-dao-dong-co', 'Ngân hàng nháp 30 câu - Dao động cơ', 'dao-dong-co', 'Dao động cơ', 1),
    ('draft-vat-ly-song-co', 'Ngân hàng nháp 30 câu - Sóng cơ', 'song-co', 'Sóng cơ', 2),
    ('draft-vat-ly-dien-xoay-chieu', 'Ngân hàng nháp 30 câu - Điện xoay chiều', 'dien-xoay-chieu', 'Điện xoay chiều', 3),
    ('draft-vat-ly-dao-dong-va-song-dien-tu', 'Ngân hàng nháp 30 câu - Dao động và sóng điện từ', 'dao-dong-va-song-dien-tu', 'Dao động và sóng điện từ', 4),
    ('draft-vat-ly-song-anh-sang', 'Ngân hàng nháp 30 câu - Sóng ánh sáng', 'song-anh-sang', 'Sóng ánh sáng', 5),
    ('draft-vat-ly-luong-tu-anh-sang', 'Ngân hàng nháp 30 câu - Lượng tử ánh sáng', 'luong-tu-anh-sang', 'Lượng tử ánh sáng', 6),
    ('draft-vat-ly-hat-nhan-nguyen-tu', 'Ngân hàng nháp 30 câu - Hạt nhân nguyên tử', 'hat-nhan-nguyen-tu', 'Hạt nhân nguyên tử', 7),
    ('draft-vat-ly-nhiet-hoc-va-chat-khi', 'Ngân hàng nháp 30 câu - Nhiệt học và chất khí', 'nhiet-hoc-va-chat-khi', 'Nhiệt học và chất khí', 8),
    ('draft-vat-ly-dien-tich-va-dien-truong', 'Ngân hàng nháp 30 câu - Điện tích và điện trường', 'dien-tich-va-dien-truong', 'Điện tích và điện trường', 9),
    ('draft-vat-ly-dong-dien-khong-doi', 'Ngân hàng nháp 30 câu - Dòng điện không đổi', 'dong-dien-khong-doi', 'Dòng điện không đổi', 10),
    ('draft-vat-ly-tu-truong', 'Ngân hàng nháp 30 câu - Từ trường', 'tu-truong', 'Từ trường', 11),
    ('draft-vat-ly-cam-ung-dien-tu', 'Ngân hàng nháp 30 câu - Cảm ứng điện từ', 'cam-ung-dien-tu', 'Cảm ứng điện từ', 12),
    ('draft-vat-ly-quang-hoc', 'Ngân hàng nháp 30 câu - Quang học', 'quang-hoc', 'Quang học', 13);

insert into public.school_exams (
  exam_id,
  title,
  school_name,
  city,
  subject_code,
  subject_name,
  year,
  duration_minutes,
  pdf_url,
  display_variant_code,
  answer_key_provided,
  source_path,
  tags,
  is_active
)
select
  exam_id,
  title,
  'Nội bộ hệ thống',
  'Hệ thống',
  'VAT_LY',
  'Vật lý',
  2026,
  50,
  'internal://draft/' || exam_id,
  'DEFAULT',
  true,
  'manual_seed/Vat_Ly/' || topic_slug || '.md',
  array['supplemental', 'vat-ly', 'draft', 'topic-bank'],
  false
from tmp_physics_topic_exam
on conflict (exam_id) do update
set
  title = excluded.title,
  school_name = excluded.school_name,
  city = excluded.city,
  subject_code = excluded.subject_code,
  subject_name = excluded.subject_name,
  year = excluded.year,
  duration_minutes = excluded.duration_minutes,
  pdf_url = excluded.pdf_url,
  display_variant_code = excluded.display_variant_code,
  answer_key_provided = excluded.answer_key_provided,
  source_path = excluded.source_path,
  tags = excluded.tags,
  is_active = excluded.is_active;

insert into public.school_exam_sections (
  section_id,
  exam_id,
  part_code,
  title,
  instructions,
  start_question_number,
  end_question_number,
  display_order,
  options_per_question,
  statement_count
)
select
  exam_id || '-multiple_choice',
  exam_id,
  'multiple_choice',
  'Phần I. Trắc nghiệm nhiều lựa chọn',
  'Mỗi câu chọn 1 đáp án đúng.',
  1,
  30,
  1,
  4,
  0
from tmp_physics_topic_exam
on conflict (section_id) do update
set
  title = excluded.title,
  instructions = excluded.instructions,
  start_question_number = excluded.start_question_number,
  end_question_number = excluded.end_question_number,
  display_order = excluded.display_order,
  options_per_question = excluded.options_per_question,
  statement_count = excluded.statement_count;

delete from public.school_exam_question_options
where question_id in (
  select exam_id || '-q' || lpad(gs::text, 2, '0')
  from tmp_physics_topic_exam
  cross join generate_series(1, 30) as gs
);

delete from public.school_exam_questions
where question_id in (
  select exam_id || '-q' || lpad(gs::text, 2, '0')
  from tmp_physics_topic_exam
  cross join generate_series(1, 30) as gs
);

insert into public.school_exam_questions (
  question_id,
  exam_id,
  section_id,
  question_number,
  question_type,
  question_text,
  correct_answer,
  statement_json,
  topic,
  obsidian_source_path,
  has_image,
  metadata,
  difficulty_level
)
select
  exam_id || '-q' || lpad(gs::text, 2, '0'),
  exam_id,
  exam_id || '-multiple_choice',
  gs,
  'multiple_choice',
  '[DRAFT] ' || topic_name || ' - Câu ' || gs || '. Thay nội dung câu hỏi thật tại đây.',
  'A',
  '[]'::jsonb,
  topic_name,
  'Vat_Ly/' || topic_slug || '.md',
  false,
  jsonb_build_object(
    'source_question_number', gs,
    'section_number', 1,
    'source', 'draft_placeholder',
    'draft_placeholder', true
  ),
  case
    when gs <= 8 then 1
    when gs <= 16 then 2
    when gs <= 24 then 3
    else 4
  end
from tmp_physics_topic_exam
cross join generate_series(1, 30) as gs;

insert into public.school_exam_question_options (
  option_id,
  question_id,
  option_label,
  option_text,
  display_order
)
select
  question_id || '-opt-' || lower(option_label),
  question_id,
  option_label,
  '[DRAFT] ' || option_label || ' - Điền đáp án cho câu ' || question_number,
  display_order
from (
  select
    exam_id || '-q' || lpad(gs::text, 2, '0') as question_id,
    gs as question_number,
    option_label,
    display_order
  from tmp_physics_topic_exam
  cross join generate_series(1, 30) as gs
  cross join (
    values
      ('A', 1),
      ('B', 2),
      ('C', 3),
      ('D', 4)
  ) as option_seed(option_label, display_order)
) seeded_options;
end $$;

-- Verify scaffold counts
select
  e.exam_id,
  e.title,
  q.topic,
  count(*) as total_questions
from public.school_exam_questions q
join public.school_exams e on e.exam_id = q.exam_id
where e.exam_id like 'draft-vat-ly-%'
group by e.exam_id, e.title, q.topic
order by e.exam_id;
