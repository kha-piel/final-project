begin;

delete from public.school_exam_question_assets
where question_id in (select question_id from public.school_exam_questions where exam_id = 'thpt-tran-phu-quang-ninh-2026-lan-3');

delete from public.school_exam_question_options
where question_id in (select question_id from public.school_exam_questions where exam_id = 'thpt-tran-phu-quang-ninh-2026-lan-3');

delete from public.school_exam_questions
where exam_id = 'thpt-tran-phu-quang-ninh-2026-lan-3';

insert into public.school_exam_questions (
  question_id, exam_id, section_id, question_number, difficulty_level, question_type,
  question_text, statement_json, explanation, topic, obsidian_source_path,
  has_image, metadata
) values (
  'thpt-tran-phu-quang-ninh-2026-lan-3-q01',
  'thpt-tran-phu-quang-ninh-2026-lan-3',
  'thpt-tran-phu-quang-ninh-2026-lan-3-section-1',
  1,
  1,
  'multiple_choice',
  'Tìm nguyên hàm của hàm số $f(x)=2\sin x$.',
  '[]'::jsonb,
  null,
  'Nguyên hàm',
  'Toan_Hoc/4_Nguyen_Ham_Tich_Phan/1_nguyen_ham.md',
  false,
  '{"source_question_number": 1, "section_number": 1, "difficulty_level": 1, "notes": "", "review_status": "pending_review"}'::jsonb
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'thpt-tran-phu-quang-ninh-2026-lan-3-q01-opt-a',
  'thpt-tran-phu-quang-ninh-2026-lan-3-q01',
  'A',
  '$\int 2 \sin x dx = -2 \cos x + C$.',
  1
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'thpt-tran-phu-quang-ninh-2026-lan-3-q01-opt-b',
  'thpt-tran-phu-quang-ninh-2026-lan-3-q01',
  'B',
  '$\int 2 \sin x dx = \sin 2x + C$.',
  2
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'thpt-tran-phu-quang-ninh-2026-lan-3-q01-opt-c',
  'thpt-tran-phu-quang-ninh-2026-lan-3-q01',
  'C',
  '$\int 2 \sin x dx = \sin^2 x + C$.',
  3
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'thpt-tran-phu-quang-ninh-2026-lan-3-q01-opt-d',
  'thpt-tran-phu-quang-ninh-2026-lan-3-q01',
  'D',
  '$\int 2 \sin x dx = 2 \cos x + C$.',
  4
);

insert into public.school_exam_questions (
  question_id, exam_id, section_id, question_number, difficulty_level, question_type,
  question_text, statement_json, explanation, topic, obsidian_source_path,
  has_image, metadata
) values (
  'thpt-tran-phu-quang-ninh-2026-lan-3-q02',
  'thpt-tran-phu-quang-ninh-2026-lan-3',
  'thpt-tran-phu-quang-ninh-2026-lan-3-section-1',
  2,
  1,
  'multiple_choice',
  'Cho hình lập phương $ABCD.A''B''C''D''$ có cạnh 2 (tham khảo hình vẽ dưới). Độ dài vecto $\vec{u} = \vec{AB}+ \vec{AD}+\vec{A''C''}$ bằng',
  '[]'::jsonb,
  null,
  'Hình học không gian với véc tơ',
  'Toan_Hoc/2_Hinh_Hoc_Khong_Gian/1_vecto_trong_khong_gian.md',
  true,
  '{"source_question_number": 2, "section_number": 1, "difficulty_level": 1, "notes": "", "review_status": "pending_review"}'::jsonb
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'thpt-tran-phu-quang-ninh-2026-lan-3-q02-opt-a',
  'thpt-tran-phu-quang-ninh-2026-lan-3-q02',
  'A',
  '$4\sqrt{3}$.',
  1
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'thpt-tran-phu-quang-ninh-2026-lan-3-q02-opt-b',
  'thpt-tran-phu-quang-ninh-2026-lan-3-q02',
  'B',
  '$4\sqrt{2}$.',
  2
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'thpt-tran-phu-quang-ninh-2026-lan-3-q02-opt-c',
  'thpt-tran-phu-quang-ninh-2026-lan-3-q02',
  'C',
  '$2\sqrt{3}$.',
  3
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'thpt-tran-phu-quang-ninh-2026-lan-3-q02-opt-d',
  'thpt-tran-phu-quang-ninh-2026-lan-3-q02',
  'D',
  '$2\sqrt{2}$.',
  4
);

insert into public.school_exam_question_assets (
  asset_id, question_id, asset_type, asset_path, caption, display_order
) values (
  'thpt-tran-phu-quang-ninh-2026-lan-3-q02-asset-question_block-1',
  'thpt-tran-phu-quang-ninh-2026-lan-3-q02',
  'question_block',
  'TN_Cau02.png',
  null,
  1
);

insert into public.school_exam_question_assets (
  asset_id, question_id, asset_type, asset_path, caption, display_order
) values (
  'thpt-tran-phu-quang-ninh-2026-lan-3-q02-asset-figure-2',
  'thpt-tran-phu-quang-ninh-2026-lan-3-q02',
  'figure',
  'TN_Cau02_hinh1.png',
  null,
  2
);

insert into public.school_exam_questions (
  question_id, exam_id, section_id, question_number, difficulty_level, question_type,
  question_text, statement_json, explanation, topic, obsidian_source_path,
  has_image, metadata
) values (
  'thpt-tran-phu-quang-ninh-2026-lan-3-q03',
  'thpt-tran-phu-quang-ninh-2026-lan-3',
  'thpt-tran-phu-quang-ninh-2026-lan-3-section-1',
  3,
  1,
  'multiple_choice',
  'Cho hàm số $y = f(x)$ có bảng biến thiên như sau:

| $x$ | $-\infty$ | $0$ | $3$ | $+\infty$ |
|---|---|---|---|---|
| $f''(x)$ | $+$ | $0$ | $-$ | $0$ | $+$ |
| $f(x)$ | $-\infty$ | $2$ | $-4$ | $+\infty$ |

Giá trị cực tiểu của hàm số đã cho bằng',
  '[]'::jsonb,
  null,
  'Khảo sát và đọc đồ thị hàm số',
  'Toan_Hoc/1_Ham_So/5_khao_sat_do_thi.md',
  true,
  '{"source_question_number": 3, "section_number": 1, "difficulty_level": 1, "notes": "", "review_status": "pending_review"}'::jsonb
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'thpt-tran-phu-quang-ninh-2026-lan-3-q03-opt-a',
  'thpt-tran-phu-quang-ninh-2026-lan-3-q03',
  'A',
  '0.',
  1
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'thpt-tran-phu-quang-ninh-2026-lan-3-q03-opt-b',
  'thpt-tran-phu-quang-ninh-2026-lan-3-q03',
  'B',
  '2.',
  2
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'thpt-tran-phu-quang-ninh-2026-lan-3-q03-opt-c',
  'thpt-tran-phu-quang-ninh-2026-lan-3-q03',
  'C',
  '-4.',
  3
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'thpt-tran-phu-quang-ninh-2026-lan-3-q03-opt-d',
  'thpt-tran-phu-quang-ninh-2026-lan-3-q03',
  'D',
  '3.',
  4
);

insert into public.school_exam_question_assets (
  asset_id, question_id, asset_type, asset_path, caption, display_order
) values (
  'thpt-tran-phu-quang-ninh-2026-lan-3-q03-asset-question_block-1',
  'thpt-tran-phu-quang-ninh-2026-lan-3-q03',
  'question_block',
  'TN_Cau03.png',
  null,
  1
);

insert into public.school_exam_question_assets (
  asset_id, question_id, asset_type, asset_path, caption, display_order
) values (
  'thpt-tran-phu-quang-ninh-2026-lan-3-q03-asset-figure-2',
  'thpt-tran-phu-quang-ninh-2026-lan-3-q03',
  'figure',
  'TN_Cau03_hinh1.png',
  null,
  2
);

insert into public.school_exam_questions (
  question_id, exam_id, section_id, question_number, difficulty_level, question_type,
  question_text, statement_json, explanation, topic, obsidian_source_path,
  has_image, metadata
) values (
  'thpt-tran-phu-quang-ninh-2026-lan-3-q04',
  'thpt-tran-phu-quang-ninh-2026-lan-3',
  'thpt-tran-phu-quang-ninh-2026-lan-3-section-1',
  4,
  1,
  'multiple_choice',
  'Thống kê điểm trung bình môn Toán của một số học sinh lớp 12 được mẫu số liệu sau:

| Khoảng điểm | $[6,5;7)$ | $[7;7,5)$ | $[7,5;8)$ | $[8;8,5)$ | $[8,5;9)$ | $[9;9,5)$ | $[9,5;10)$ |
|---|---|---|---|---|---|---|---|
| Tần số | $8$ | $10$ | $16$ | $24$ | $13$ | $7$ | $4$ |

Phương sai của mẫu số liệu về điểm trung bình môn Toán của các học sinh đó là bao nhiêu? (kết quả làm tròn đến hàng phần trăm)',
  '[]'::jsonb,
  null,
  'Tứ phân vị và số liệu ghép nhóm',
  'Toan_Hoc/3_Thong_Ke_Xac_Suat/1_khoang_bien_thien_tu_phan_vi.md',
  true,
  '{"source_question_number": 4, "section_number": 1, "difficulty_level": 1, "notes": "", "review_status": "pending_review"}'::jsonb
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'thpt-tran-phu-quang-ninh-2026-lan-3-q04-opt-a',
  'thpt-tran-phu-quang-ninh-2026-lan-3-q04',
  'A',
  '0,62.',
  1
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'thpt-tran-phu-quang-ninh-2026-lan-3-q04-opt-b',
  'thpt-tran-phu-quang-ninh-2026-lan-3-q04',
  'B',
  '0,79.',
  2
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'thpt-tran-phu-quang-ninh-2026-lan-3-q04-opt-c',
  'thpt-tran-phu-quang-ninh-2026-lan-3-q04',
  'C',
  '0,78.',
  3
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'thpt-tran-phu-quang-ninh-2026-lan-3-q04-opt-d',
  'thpt-tran-phu-quang-ninh-2026-lan-3-q04',
  'D',
  '0,61.',
  4
);

insert into public.school_exam_question_assets (
  asset_id, question_id, asset_type, asset_path, caption, display_order
) values (
  'thpt-tran-phu-quang-ninh-2026-lan-3-q04-asset-question_block-1',
  'thpt-tran-phu-quang-ninh-2026-lan-3-q04',
  'question_block',
  'TN_Cau04.png',
  null,
  1
);

insert into public.school_exam_question_assets (
  asset_id, question_id, asset_type, asset_path, caption, display_order
) values (
  'thpt-tran-phu-quang-ninh-2026-lan-3-q04-asset-figure-2',
  'thpt-tran-phu-quang-ninh-2026-lan-3-q04',
  'figure',
  'TN_Cau04_hinh1.png',
  null,
  2
);

insert into public.school_exam_questions (
  question_id, exam_id, section_id, question_number, difficulty_level, question_type,
  question_text, statement_json, explanation, topic, obsidian_source_path,
  has_image, metadata
) values (
  'thpt-tran-phu-quang-ninh-2026-lan-3-q05',
  'thpt-tran-phu-quang-ninh-2026-lan-3',
  'thpt-tran-phu-quang-ninh-2026-lan-3-section-1',
  5,
  2,
  'multiple_choice',
  'Cho hình lập phương $ABCD.A''B''C''D''$. Mệnh đề nào sau đây sai?',
  '[]'::jsonb,
  null,
  'Hình học không gian với véc tơ',
  'Toan_Hoc/2_Hinh_Hoc_Khong_Gian/1_vecto_trong_khong_gian.md',
  true,
  '{"source_question_number": 5, "section_number": 1, "difficulty_level": 2, "notes": "", "review_status": "pending_review"}'::jsonb
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'thpt-tran-phu-quang-ninh-2026-lan-3-q05-opt-a',
  'thpt-tran-phu-quang-ninh-2026-lan-3-q05',
  'A',
  '$BD$ song song với $(CB''D'')$.',
  1
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'thpt-tran-phu-quang-ninh-2026-lan-3-q05-opt-b',
  'thpt-tran-phu-quang-ninh-2026-lan-3-q05',
  'B',
  '$BD$ song song với $(A''C''D'')$.',
  2
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'thpt-tran-phu-quang-ninh-2026-lan-3-q05-opt-c',
  'thpt-tran-phu-quang-ninh-2026-lan-3-q05',
  'C',
  '$BD$ vuông góc với $(ADD''A'')$.',
  3
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'thpt-tran-phu-quang-ninh-2026-lan-3-q05-opt-d',
  'thpt-tran-phu-quang-ninh-2026-lan-3-q05',
  'D',
  '$BD$ vuông góc với $(ACC''A'')$.',
  4
);

insert into public.school_exam_question_assets (
  asset_id, question_id, asset_type, asset_path, caption, display_order
) values (
  'thpt-tran-phu-quang-ninh-2026-lan-3-q05-asset-question_block-1',
  'thpt-tran-phu-quang-ninh-2026-lan-3-q05',
  'question_block',
  'TN_Cau05.png',
  null,
  1
);

insert into public.school_exam_question_assets (
  asset_id, question_id, asset_type, asset_path, caption, display_order
) values (
  'thpt-tran-phu-quang-ninh-2026-lan-3-q05-asset-figure-2',
  'thpt-tran-phu-quang-ninh-2026-lan-3-q05',
  'figure',
  'TN_Cau05_hinh1.png',
  null,
  2
);

insert into public.school_exam_questions (
  question_id, exam_id, section_id, question_number, difficulty_level, question_type,
  question_text, statement_json, explanation, topic, obsidian_source_path,
  has_image, metadata
) values (
  'thpt-tran-phu-quang-ninh-2026-lan-3-q06',
  'thpt-tran-phu-quang-ninh-2026-lan-3',
  'thpt-tran-phu-quang-ninh-2026-lan-3-section-1',
  6,
  2,
  'multiple_choice',
  'Trong không gian $Oxyz$, cho mặt cầu $(S)$ có tâm $I(0;-2;1)$ và bán kính $R = 5$. Phương trình của $(S)$ là',
  '[]'::jsonb,
  null,
  'Hệ trục tọa độ Oxyz',
  'Toan_Hoc/2_Hinh_Hoc_Khong_Gian/2_he_truc_toa_do_Oxyz.md',
  false,
  '{"source_question_number": 6, "section_number": 1, "difficulty_level": 2, "notes": "", "review_status": "pending_review"}'::jsonb
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'thpt-tran-phu-quang-ninh-2026-lan-3-q06-opt-a',
  'thpt-tran-phu-quang-ninh-2026-lan-3-q06',
  'A',
  '$x^2 + (y+2)^2 + (z-1)^2 = 25$.',
  1
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'thpt-tran-phu-quang-ninh-2026-lan-3-q06-opt-b',
  'thpt-tran-phu-quang-ninh-2026-lan-3-q06',
  'B',
  '$x^2 + (y-2)^2 + (z+1)^2 = 25$.',
  2
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'thpt-tran-phu-quang-ninh-2026-lan-3-q06-opt-c',
  'thpt-tran-phu-quang-ninh-2026-lan-3-q06',
  'C',
  '$x^2 + (y-2)^2 + (z+1)^2 = 5$.',
  3
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'thpt-tran-phu-quang-ninh-2026-lan-3-q06-opt-d',
  'thpt-tran-phu-quang-ninh-2026-lan-3-q06',
  'D',
  '$x^2 + (y+2)^2 + (z-1)^2 = 5$.',
  4
);

insert into public.school_exam_questions (
  question_id, exam_id, section_id, question_number, difficulty_level, question_type,
  question_text, statement_json, explanation, topic, obsidian_source_path,
  has_image, metadata
) values (
  'thpt-tran-phu-quang-ninh-2026-lan-3-q07',
  'thpt-tran-phu-quang-ninh-2026-lan-3',
  'thpt-tran-phu-quang-ninh-2026-lan-3-section-1',
  7,
  2,
  'multiple_choice',
  'Cho cấp số nhân $(u_n)$ với $u_1 = 3$ và công bội $q = 2$. Giá trị của $u_2$ bằng',
  '[]'::jsonb,
  null,
  'Cấp số cộng và cấp số nhân',
  'Toan_Hoc/1_Ham_So/8_cap_so_cong_va_cap_so_nhan.md',
  false,
  '{"source_question_number": 7, "section_number": 1, "difficulty_level": 2, "notes": "", "review_status": "pending_review"}'::jsonb
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'thpt-tran-phu-quang-ninh-2026-lan-3-q07-opt-a',
  'thpt-tran-phu-quang-ninh-2026-lan-3-q07',
  'A',
  '$\frac{3}{2}$.',
  1
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'thpt-tran-phu-quang-ninh-2026-lan-3-q07-opt-b',
  'thpt-tran-phu-quang-ninh-2026-lan-3-q07',
  'B',
  '9.',
  2
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'thpt-tran-phu-quang-ninh-2026-lan-3-q07-opt-c',
  'thpt-tran-phu-quang-ninh-2026-lan-3-q07',
  'C',
  '8.',
  3
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'thpt-tran-phu-quang-ninh-2026-lan-3-q07-opt-d',
  'thpt-tran-phu-quang-ninh-2026-lan-3-q07',
  'D',
  '6.',
  4
);

insert into public.school_exam_questions (
  question_id, exam_id, section_id, question_number, difficulty_level, question_type,
  question_text, statement_json, explanation, topic, obsidian_source_path,
  has_image, metadata
) values (
  'thpt-tran-phu-quang-ninh-2026-lan-3-q08',
  'thpt-tran-phu-quang-ninh-2026-lan-3',
  'thpt-tran-phu-quang-ninh-2026-lan-3-section-1',
  8,
  2,
  'multiple_choice',
  'Phương trình $\cos x = \frac{\sqrt{2}}{2}$ có tập nghiệm là',
  '[]'::jsonb,
  null,
  'Nguyên hàm',
  'Toan_Hoc/4_Nguyen_Ham_Tich_Phan/1_nguyen_ham.md',
  false,
  '{"source_question_number": 8, "section_number": 1, "difficulty_level": 2, "notes": "", "review_status": "pending_review"}'::jsonb
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'thpt-tran-phu-quang-ninh-2026-lan-3-q08-opt-a',
  'thpt-tran-phu-quang-ninh-2026-lan-3-q08',
  'A',
  '$\left\{x=\pm\frac{\pi}{4}+k2\pi; k \in \mathbb{Z}\right\}$.',
  1
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'thpt-tran-phu-quang-ninh-2026-lan-3-q08-opt-b',
  'thpt-tran-phu-quang-ninh-2026-lan-3-q08',
  'B',
  '$\left\{x=\pm\frac{\pi}{3}+k2\pi;k \in \mathbb{Z}\right\}$',
  2
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'thpt-tran-phu-quang-ninh-2026-lan-3-q08-opt-c',
  'thpt-tran-phu-quang-ninh-2026-lan-3-q08',
  'C',
  '$\left\{x=\pm\frac{\pi}{3}+k\pi;k\in\mathbb{Z}\right\}$.',
  3
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'thpt-tran-phu-quang-ninh-2026-lan-3-q08-opt-d',
  'thpt-tran-phu-quang-ninh-2026-lan-3-q08',
  'D',
  '$\left\{x=\pm\frac{3\pi}{4}+k2\pi;k \in \mathbb{Z}\right\}$',
  4
);

insert into public.school_exam_questions (
  question_id, exam_id, section_id, question_number, difficulty_level, question_type,
  question_text, statement_json, explanation, topic, obsidian_source_path,
  has_image, metadata
) values (
  'thpt-tran-phu-quang-ninh-2026-lan-3-q09',
  'thpt-tran-phu-quang-ninh-2026-lan-3',
  'thpt-tran-phu-quang-ninh-2026-lan-3-section-1',
  9,
  3,
  'multiple_choice',
  'Tiệm cận ngang của đồ thị hàm số $y = \frac{4x+1}{x-1}$ là',
  '[]'::jsonb,
  null,
  'Đường tiệm cận',
  'Toan_Hoc/1_Ham_So/4_duong_tiem_can.md',
  false,
  '{"source_question_number": 9, "section_number": 1, "difficulty_level": 3, "notes": "", "review_status": "pending_review"}'::jsonb
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'thpt-tran-phu-quang-ninh-2026-lan-3-q09-opt-a',
  'thpt-tran-phu-quang-ninh-2026-lan-3-q09',
  'A',
  '$y=-\frac{1}{4}$.',
  1
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'thpt-tran-phu-quang-ninh-2026-lan-3-q09-opt-b',
  'thpt-tran-phu-quang-ninh-2026-lan-3-q09',
  'B',
  '$y=1$.',
  2
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'thpt-tran-phu-quang-ninh-2026-lan-3-q09-opt-c',
  'thpt-tran-phu-quang-ninh-2026-lan-3-q09',
  'C',
  '$y = -1$.',
  3
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'thpt-tran-phu-quang-ninh-2026-lan-3-q09-opt-d',
  'thpt-tran-phu-quang-ninh-2026-lan-3-q09',
  'D',
  '$y=4$.',
  4
);

insert into public.school_exam_questions (
  question_id, exam_id, section_id, question_number, difficulty_level, question_type,
  question_text, statement_json, explanation, topic, obsidian_source_path,
  has_image, metadata
) values (
  'thpt-tran-phu-quang-ninh-2026-lan-3-q10',
  'thpt-tran-phu-quang-ninh-2026-lan-3',
  'thpt-tran-phu-quang-ninh-2026-lan-3-section-1',
  10,
  3,
  'multiple_choice',
  'Trong không gian $Oxyz$, cho điểm $M(1;2;-1)$ và mặt phẳng $(P): x + 2y + z = 0$. Mặt phẳng $(Q)$ qua $M$ và song song với $(P)$ có phương trình là',
  '[]'::jsonb,
  null,
  'Phương trình mặt phẳng trong Oxyz',
  'Toan_Hoc/2_Hinh_Hoc_Khong_Gian/4_phuong_trinh_mat_phang.md',
  false,
  '{"source_question_number": 10, "section_number": 1, "difficulty_level": 3, "notes": "", "review_status": "pending_review"}'::jsonb
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'thpt-tran-phu-quang-ninh-2026-lan-3-q10-opt-a',
  'thpt-tran-phu-quang-ninh-2026-lan-3-q10',
  'A',
  '$x+2y-z-6=0$.',
  1
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'thpt-tran-phu-quang-ninh-2026-lan-3-q10-opt-b',
  'thpt-tran-phu-quang-ninh-2026-lan-3-q10',
  'B',
  '$x+2y+z-1=0$.',
  2
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'thpt-tran-phu-quang-ninh-2026-lan-3-q10-opt-c',
  'thpt-tran-phu-quang-ninh-2026-lan-3-q10',
  'C',
  '$x+2y+z-4=0$.',
  3
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'thpt-tran-phu-quang-ninh-2026-lan-3-q10-opt-d',
  'thpt-tran-phu-quang-ninh-2026-lan-3-q10',
  'D',
  '$x+2y+z+4=0$.',
  4
);

insert into public.school_exam_questions (
  question_id, exam_id, section_id, question_number, difficulty_level, question_type,
  question_text, statement_json, explanation, topic, obsidian_source_path,
  has_image, metadata
) values (
  'thpt-tran-phu-quang-ninh-2026-lan-3-q11',
  'thpt-tran-phu-quang-ninh-2026-lan-3',
  'thpt-tran-phu-quang-ninh-2026-lan-3-section-1',
  11,
  3,
  'multiple_choice',
  'Cho hình chóp $S.ABC$ có đáy $ABC$ là tam giác vuông tại $A$ với $AB = a, AC = 2a$ cạnh $SA$ vuông góc với $(ABC)$ và $SA = a\sqrt{3}$. Tính thể tích khối chóp $S.ABC$.',
  '[]'::jsonb,
  null,
  'Hình học không gian với véc tơ',
  'Toan_Hoc/2_Hinh_Hoc_Khong_Gian/1_vecto_trong_khong_gian.md',
  false,
  '{"source_question_number": 11, "section_number": 1, "difficulty_level": 3, "notes": "", "review_status": "pending_review"}'::jsonb
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'thpt-tran-phu-quang-ninh-2026-lan-3-q11-opt-a',
  'thpt-tran-phu-quang-ninh-2026-lan-3-q11',
  'A',
  '$\frac{a^3\sqrt{3}}{4}$.',
  1
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'thpt-tran-phu-quang-ninh-2026-lan-3-q11-opt-b',
  'thpt-tran-phu-quang-ninh-2026-lan-3-q11',
  'B',
  '$\frac{a^3\sqrt{3}}{3}$.',
  2
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'thpt-tran-phu-quang-ninh-2026-lan-3-q11-opt-c',
  'thpt-tran-phu-quang-ninh-2026-lan-3-q11',
  'C',
  '$\frac{a^3\sqrt{3}}{6}$.',
  3
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'thpt-tran-phu-quang-ninh-2026-lan-3-q11-opt-d',
  'thpt-tran-phu-quang-ninh-2026-lan-3-q11',
  'D',
  '$a^3\sqrt{3}$.',
  4
);

insert into public.school_exam_questions (
  question_id, exam_id, section_id, question_number, difficulty_level, question_type,
  question_text, statement_json, explanation, topic, obsidian_source_path,
  has_image, metadata
) values (
  'thpt-tran-phu-quang-ninh-2026-lan-3-q12',
  'thpt-tran-phu-quang-ninh-2026-lan-3',
  'thpt-tran-phu-quang-ninh-2026-lan-3-section-1',
  12,
  4,
  'multiple_choice',
  'Nghiệm của phương trình $3^{x-2} = 9$ là',
  '[]'::jsonb,
  null,
  'Phương trình mũ và logarit',
  'Toan_Hoc/1_Ham_So/7_phuong_trinh_mu_va_logarit.md',
  false,
  '{"source_question_number": 12, "section_number": 1, "difficulty_level": 4, "notes": "", "review_status": "pending_review"}'::jsonb
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'thpt-tran-phu-quang-ninh-2026-lan-3-q12-opt-a',
  'thpt-tran-phu-quang-ninh-2026-lan-3-q12',
  'A',
  '$x = -4$.',
  1
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'thpt-tran-phu-quang-ninh-2026-lan-3-q12-opt-b',
  'thpt-tran-phu-quang-ninh-2026-lan-3-q12',
  'B',
  '$x=-3$.',
  2
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'thpt-tran-phu-quang-ninh-2026-lan-3-q12-opt-c',
  'thpt-tran-phu-quang-ninh-2026-lan-3-q12',
  'C',
  '$x = 4$.',
  3
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'thpt-tran-phu-quang-ninh-2026-lan-3-q12-opt-d',
  'thpt-tran-phu-quang-ninh-2026-lan-3-q12',
  'D',
  '$x = 3$.',
  4
);

insert into public.school_exam_questions (
  question_id, exam_id, section_id, question_number, difficulty_level, question_type,
  question_text, statement_json, explanation, topic, obsidian_source_path,
  has_image, metadata
) values (
  'thpt-tran-phu-quang-ninh-2026-lan-3-q13',
  'thpt-tran-phu-quang-ninh-2026-lan-3',
  'thpt-tran-phu-quang-ninh-2026-lan-3-section-2',
  13,
  2,
  'true_false',
  'Một hộp có chứa 5 viên bi màu xanh và 7 viên bi màu đỏ (các viên bi có cùng kích thước và khối lượng, được đánh số khác nhau). Bạn Nam lấy ngẫu nhiên 1 viên bi từ trong hộp và không hoàn lại, tiếp đó bạn Minh lấy ngẫu nhiên 2 viên bi từ trong hộp.',
  '[{"label": "a", "text": "Xác suất để bạn Nam lấy được 1 viên bi màu đỏ là $\\frac{7}{12}$"}, {"label": "b", "text": "Xác suất bạn Minh lấy được 2 viên bi màu đỏ, biết rằng bạn Nam đã lấy được 1 viên bi màu xanh là $\\frac{7}{22}$"}, {"label": "c", "text": "Xác suất để bạn Nam lấy được 1 viên bi màu xanh và bạn Minh lấy được 1 viên bi màu xanh và 1 viên bi màu đỏ là $\\frac{5}{22}$"}, {"label": "d", "text": "Biết rằng bạn Minh lấy được ít nhất một viên bi màu đỏ, xác suất bạn Nam lấy được một viên bi màu đỏ là $\\frac{9}{16}$"}]'::jsonb,
  null,
  'Xác suất có điều kiện',
  'Toan_Hoc/3_Thong_Ke_Xac_Suat/3_xac_suat_co_dieu_kien.md',
  false,
  '{"source_question_number": 1, "section_number": 2, "difficulty_level": 2, "notes": "", "review_status": "pending_review"}'::jsonb
);

insert into public.school_exam_questions (
  question_id, exam_id, section_id, question_number, difficulty_level, question_type,
  question_text, statement_json, explanation, topic, obsidian_source_path,
  has_image, metadata
) values (
  'thpt-tran-phu-quang-ninh-2026-lan-3-q14',
  'thpt-tran-phu-quang-ninh-2026-lan-3',
  'thpt-tran-phu-quang-ninh-2026-lan-3-section-2',
  14,
  2,
  'true_false',
  'Cho hàm số $y = x^3 -3x^2 -1$.',
  '[{"label": "a", "text": "Hàm số có đạo hàm là $y'' = 3x^2-6x+4$."}, {"label": "b", "text": "Hàm số đồng biến trên khoảng $(0;2)$."}, {"label": "c", "text": "Đồ thị hàm số có tâm đối xứng là điểm $I(1;-1)$."}, {"label": "d", "text": "Gọi $A, B$ là hai điểm cực trị của đồ thị hàm số. Diện tích tam giác $OAB$ (với $O$ là gốc tọa độ) bằng 1 đơn vị diện tích."}]'::jsonb,
  null,
  'Khảo sát và đọc đồ thị hàm số',
  'Toan_Hoc/1_Ham_So/5_khao_sat_do_thi.md',
  false,
  '{"source_question_number": 2, "section_number": 2, "difficulty_level": 2, "notes": "", "review_status": "pending_review"}'::jsonb
);

insert into public.school_exam_questions (
  question_id, exam_id, section_id, question_number, difficulty_level, question_type,
  question_text, statement_json, explanation, topic, obsidian_source_path,
  has_image, metadata
) values (
  'thpt-tran-phu-quang-ninh-2026-lan-3-q15',
  'thpt-tran-phu-quang-ninh-2026-lan-3',
  'thpt-tran-phu-quang-ninh-2026-lan-3-section-2',
  15,
  3,
  'true_false',
  'Một người điều khiển xe ô tô với vận tốc 72 km/h thì phát hiện ở phía trước cách vị trí xe một đoạn 100 mét có công trường đang thi công có gắn biển báo giới hạn tốc độ tối đa cho phép là 36 km/h. Hai giây sau đó, tài xế bắt đầu đạp phanh giảm tốc với vận tốc $v_1 (t) = at+b$ (m/s) ($a, b \in \mathbb{R}, a < 0$), trong đó $t$ là thời gian tính bằng giây kể từ khi xe bắt đầu giảm tốc độ. Khi ô tô vừa đến vị trí đặt biển báo thì tốc độ đạt đúng 36 km/h. Sau khi đi qua hết đoạn đường công trường dài 200 mét với vận tốc không đổi, xe bắt đầu tăng tốc với vận tốc $v_2 (t_1) = mt_1 + n$ ($m, n \in \mathbb{R}, m > 0$), trong đó $t_1$ là thời gian tính bằng giây kể từ khi ô tô vừa ra khỏi công trường. Biết rằng đúng 10 giây sau khi tăng tốc, xe đạt vận tốc 72 km/h.',
  '[{"label": "a", "text": "Quãng đường ô tô đi được từ khi phát hiện biển báo giới hạn tốc độ đến khi bắt đầu giảm tốc độ là 40 m."}, {"label": "b", "text": "Hàm số vận tốc trong giai đoạn giảm tốc là $v_1 (t) = -2,5t +40$ (m/s)."}, {"label": "c", "text": "Ô tô đến vị trí đặt biển báo tốc độ tối đa cho phép sau 4 giây kể từ khi giảm tốc."}, {"label": "d", "text": "Quãng đường ô tô đi được kể từ khi phát hiện có công trường đang thi công đến khi đạt vận tốc 72 km/h là 450 m."}]'::jsonb,
  null,
  'Giới hạn dãy số',
  'Toan_Hoc/5_Gioi_Han_Day_So/1_gioi_han_day_so.md',
  false,
  '{"source_question_number": 3, "section_number": 2, "difficulty_level": 3, "notes": "", "review_status": "pending_review"}'::jsonb
);

insert into public.school_exam_questions (
  question_id, exam_id, section_id, question_number, difficulty_level, question_type,
  question_text, statement_json, explanation, topic, obsidian_source_path,
  has_image, metadata
) values (
  'thpt-tran-phu-quang-ninh-2026-lan-3-q16',
  'thpt-tran-phu-quang-ninh-2026-lan-3',
  'thpt-tran-phu-quang-ninh-2026-lan-3-section-2',
  16,
  4,
  'true_false',
  'Trong không gian $Oxyz$ (đơn vị trên các trục là km), mặt đất được xem là mặt phẳng $(Oxy)$. Một khu vực cấm bay được giới hạn bởi một khối cầu $(S)$ có tâm $I(0;0;4)$ và bán kính $R = 3$. Một thiết bị bay không người lái (drone) cất cánh từ điểm $A(5;5;6)$ và bay theo đường thẳng với vectơ vận tốc $\vec{v} = (-2;-1;-2)$. Cho biết $\Delta$ là đường thẳng chứa quỹ đạo bay của drone.',
  '[{"label": "a", "text": "Đường bay $\\Delta$ của drone có một véc-tơ chỉ phương là $\\vec{u} = (2;-1; 2)$ ."}, {"label": "b", "text": "Khoảng cách từ tâm $I$ của khu vực cấm bay $(S)$ đến mặt đất bằng 4 km."}, {"label": "c", "text": "Đường bay $\\Delta$ của drone đi xuyên qua khu vực cấm bay $(S)$."}, {"label": "d", "text": "Người ta muốn đặt một trạm thu phát sóng tại điểm $K$ trên mặt đất sao cho tổng khoảng cách $KA + KI$ đạt giá trị nhỏ nhất. Khi đó toạ độ của trạm $K$ là $(2;2;0)$."}]'::jsonb,
  null,
  'Phương trình mặt phẳng trong Oxyz',
  'Toan_Hoc/2_Hinh_Hoc_Khong_Gian/4_phuong_trinh_mat_phang.md',
  false,
  '{"source_question_number": 4, "section_number": 2, "difficulty_level": 4, "notes": "", "review_status": "pending_review"}'::jsonb
);

insert into public.school_exam_questions (
  question_id, exam_id, section_id, question_number, difficulty_level, question_type,
  question_text, statement_json, explanation, topic, obsidian_source_path,
  has_image, metadata
) values (
  'thpt-tran-phu-quang-ninh-2026-lan-3-q17',
  'thpt-tran-phu-quang-ninh-2026-lan-3',
  'thpt-tran-phu-quang-ninh-2026-lan-3-section-3',
  17,
  1,
  'short_answer',
  'Để hưởng ứng chiến dịch "Giao thông xanh", một đơn vị vận tải tại Quảng Ninh dự định lắp đặt hai loại trụ sạc cho đội xe điện: Trụ sạc nhanh (Loại X) và Trụ sạc siêu cấp (Loại Y). Diện tích bãi đỗ xe dành cho việc lắp đặt này là 18 m² và tổng nguồn điện khả dụng là 24 kW. Mỗi trụ loại X cần 2 m² diện tích và tiêu thụ 3 kW điện. Mỗi trụ loại Y cần 3 m² diện tích và tiêu thụ 3 kW điện. Do yêu cầu kỹ thuật, số lượng trụ sạc nhanh (Loại X) không được vượt quá 8 trụ. Biết rằng mỗi trụ loại X mang lại lợi nhuận 4 triệu đồng/tháng và mỗi trụ loại Y mang lại lợi nhuận 5 triệu đồng/tháng. Hỏi tổng lợi nhuận lớn nhất có thể đạt được trong mỗi tháng là bao nhiêu triệu đồng?',
  '[]'::jsonb,
  null,
  'Tích phân và diện tích hình phẳng',
  'Toan_Hoc/4_Nguyen_Ham_Tich_Phan/3_ung_dung_hinh_hoc_tich_phan.md',
  false,
  '{"source_question_number": 1, "section_number": 3, "difficulty_level": 1, "notes": "", "review_status": "pending_review"}'::jsonb
);

insert into public.school_exam_questions (
  question_id, exam_id, section_id, question_number, difficulty_level, question_type,
  question_text, statement_json, explanation, topic, obsidian_source_path,
  has_image, metadata
) values (
  'thpt-tran-phu-quang-ninh-2026-lan-3-q18',
  'thpt-tran-phu-quang-ninh-2026-lan-3',
  'thpt-tran-phu-quang-ninh-2026-lan-3-section-3',
  18,
  1,
  'short_answer',
  'Để quảng bá hình ảnh du lịch Quảng Ninh trong mùa cao điểm, một nhóm bạn trẻ dự định thực hiện chiến dịch nội dung trên hai nền tảng: TikTok (Kênh A) và YouTube Short (Kênh B) trong đúng 10 ngày. Do đặc thù sản xuất video, mỗi ngày nhóm chỉ tập trung đăng tải và tương tác trên một nền tảng duy nhất. Nếu dành $x$ ngày cho Kênh A, số lượt tiếp cận thu về là: $P_A = x^2 +2x$ (nghìn lượt). Nếu dành $y$ ngày cho Kênh B, số lượt tiếp cận thu về là: $P_B = 326y-27y^2$ (nghìn lượt).
Biết rằng do thuật toán của nền tảng, nhóm quyết định dành cho Kênh B không quá 6 ngày. Hỏi nhóm bạn trẻ nên phân bổ bao nhiêu ngày cho Kênh A để tổng số lượt tiếp cận trên cả hai nền tảng là lớn nhất?',
  '[]'::jsonb,
  null,
  'Cực trị, GTLN và GTNN',
  'Toan_Hoc/1_Ham_So/3_gia_tri_lon_nhat_nho_nhat.md',
  false,
  '{"source_question_number": 2, "section_number": 3, "difficulty_level": 1, "notes": "", "review_status": "pending_review"}'::jsonb
);

insert into public.school_exam_questions (
  question_id, exam_id, section_id, question_number, difficulty_level, question_type,
  question_text, statement_json, explanation, topic, obsidian_source_path,
  has_image, metadata
) values (
  'thpt-tran-phu-quang-ninh-2026-lan-3-q19',
  'thpt-tran-phu-quang-ninh-2026-lan-3',
  'thpt-tran-phu-quang-ninh-2026-lan-3-section-3',
  19,
  2,
  'short_answer',
  'Bánh Taco là một món ăn đặc trưng của Mexico, bánh Taco được tạo thành từ một chiếc bánh Tortilla (bánh ngô) cuộn quanh thức ăn. Cụ thể, để làm một chiếc bánh Taco ta lấy bánh Tortilla tròn có đường kính 20 cm đặt vào mặt trong của hình trụ có bán kính $R = 4$ cm, dọc theo đường kính của Tortilla và gấp bánh lại quanh hình trụ. Sau đó ta sẽ đổ đầy thịt, phô mai, và rau củ đến tận mép bánh. Gọi $x$ là khoảng cách từ tâm bánh Tortilla đến một điểm $P$ trên đường kính (tham khảo hình vẽ).
Tính thể tích của bánh Taco theo đơn vị cm³ (kết quả làm tròn đến hàng đơn vị).',
  '[]'::jsonb,
  null,
  'Ứng dụng hình học của tích phân',
  'Toan_Hoc/4_Nguyen_Ham_Tich_Phan/3_ung_dung_hinh_hoc_tich_phan.md',
  true,
  '{"source_question_number": 3, "section_number": 3, "difficulty_level": 2, "notes": "", "review_status": "pending_review"}'::jsonb
);

insert into public.school_exam_question_assets (
  asset_id, question_id, asset_type, asset_path, caption, display_order
) values (
  'thpt-tran-phu-quang-ninh-2026-lan-3-q19-asset-question_block-1',
  'thpt-tran-phu-quang-ninh-2026-lan-3-q19',
  'question_block',
  'TLN_Cau03.png',
  null,
  1
);

insert into public.school_exam_question_assets (
  asset_id, question_id, asset_type, asset_path, caption, display_order
) values (
  'thpt-tran-phu-quang-ninh-2026-lan-3-q19-asset-figure-2',
  'thpt-tran-phu-quang-ninh-2026-lan-3-q19',
  'figure',
  'TLN_Cau03_hinh1.png',
  null,
  2
);

insert into public.school_exam_questions (
  question_id, exam_id, section_id, question_number, difficulty_level, question_type,
  question_text, statement_json, explanation, topic, obsidian_source_path,
  has_image, metadata
) values (
  'thpt-tran-phu-quang-ninh-2026-lan-3-q20',
  'thpt-tran-phu-quang-ninh-2026-lan-3',
  'thpt-tran-phu-quang-ninh-2026-lan-3-section-3',
  20,
  2,
  'short_answer',
  'Một chiếc lều hình chóp tứ giác đều $S.ABCD$ có cạnh đáy và cạnh bên đều bằng 5,6 mét. Người ta định trang trí lều bằng dây led nối thẳng từ đỉnh $B$ đến mặt bên $SCD$. Xác định khoảng cách ngắn nhất của dây led để đảm bảo yêu cầu trên biết rằng kết quả chỉ được lấy đến chữ số thứ nhất của hàng thập phân và tính theo đơn vị mét.',
  '[]'::jsonb,
  null,
  'Hình học không gian với véc tơ',
  'Toan_Hoc/2_Hinh_Hoc_Khong_Gian/1_vecto_trong_khong_gian.md',
  false,
  '{"source_question_number": 4, "section_number": 3, "difficulty_level": 2, "notes": "", "review_status": "pending_review"}'::jsonb
);

insert into public.school_exam_questions (
  question_id, exam_id, section_id, question_number, difficulty_level, question_type,
  question_text, statement_json, explanation, topic, obsidian_source_path,
  has_image, metadata
) values (
  'thpt-tran-phu-quang-ninh-2026-lan-3-q21',
  'thpt-tran-phu-quang-ninh-2026-lan-3',
  'thpt-tran-phu-quang-ninh-2026-lan-3-section-3',
  21,
  3,
  'short_answer',
  'Công ty X giao cho hai xí nghiệp I và II sản xuất 20000 sản phẩm. Xí nghiệp I sản xuất 15000 sản phẩm và có tỷ lệ phế phẩm là 4%, xí nghiệp II có tỉ lệ phế phẩm là 6%. Công ty có một hệ thống dùng để phát hiện phế phẩm cho các sản phẩm của hai xí nghiệp trên. Biết rằng nếu một phế phẩm đi qua hệ thống thì nó chỉ phát hiện được 95% và hệ thống dự đoán đúng được 92% nếu một sản phẩm không là phế phẩm. Chọn ngẫu nhiên một sản phẩm rồi cho đi qua hệ thống. Tính xác suất để sản phẩm được chọn của xí nghiệp I biết rằng sản phẩm đó bị hệ thống báo là phế phẩm (làm tròn kết quả đến hàng phần trăm).',
  '[]'::jsonb,
  null,
  'Xác suất có điều kiện',
  'Toan_Hoc/3_Thong_Ke_Xac_Suat/3_xac_suat_co_dieu_kien.md',
  false,
  '{"source_question_number": 5, "section_number": 3, "difficulty_level": 3, "notes": "", "review_status": "pending_review"}'::jsonb
);

insert into public.school_exam_questions (
  question_id, exam_id, section_id, question_number, difficulty_level, question_type,
  question_text, statement_json, explanation, topic, obsidian_source_path,
  has_image, metadata
) values (
  'thpt-tran-phu-quang-ninh-2026-lan-3-q22',
  'thpt-tran-phu-quang-ninh-2026-lan-3',
  'thpt-tran-phu-quang-ninh-2026-lan-3-section-3',
  22,
  4,
  'short_answer',
  'Trong không gian $Oxyz$ (đơn vị dài trên trục tính bằng mét), một con châu chấu đang ở vị trí $O(0;0;0)$ và dự định nhảy đến $C(6;5;5)$. Con châu chấu chỉ có thể nhảy theo ba hướng $\vec{i}=(1;0;0)$, $\vec{j}=(0;1;0)$, $\vec{k}=(0;0;1)$ và điều đặc biệt là nó sẽ không thể nhảy hai lần liên tiếp theo hướng $\vec{k}=(0;0;1)$. Mỗi lần nhảy của con châu chấu chỉ nhảy được quãng đường bằng $1$ m. Gọi $T$ là số cách con châu chấu di chuyển từ $O$ đến $C$. Bốn chữ số đầu tiên của $T$ là bao nhiêu?',
  '[]'::jsonb,
  null,
  'Hệ trục tọa độ Oxyz',
  'Toan_Hoc/2_Hinh_Hoc_Khong_Gian/2_he_truc_toa_do_Oxyz.md',
  false,
  '{"source_question_number": 6, "section_number": 3, "difficulty_level": 4, "notes": "", "review_status": "pending_review"}'::jsonb
);

commit;
