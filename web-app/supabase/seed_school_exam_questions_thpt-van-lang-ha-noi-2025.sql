begin;

delete from public.school_exam_question_assets
where question_id in (select question_id from public.school_exam_questions where exam_id = 'thpt-van-lang-ha-noi');

delete from public.school_exam_question_options
where question_id in (select question_id from public.school_exam_questions where exam_id = 'thpt-van-lang-ha-noi');

delete from public.school_exam_questions
where exam_id = 'thpt-van-lang-ha-noi';

insert into public.school_exam_questions (
  question_id, exam_id, section_id, question_number, difficulty_level, question_type,
  question_text, correct_answer, statement_json, explanation, topic, obsidian_source_path,
  has_image, metadata
) values (
  'thpt-van-lang-ha-noi-q01',
  'thpt-van-lang-ha-noi',
  'thpt-van-lang-ha-noi-section-1',
  1,
  1,
  'multiple_choice',
  'Cho khối chóp $O.ABC$ có $OA$ vuông góc với mặt phẳng $(ABC)$, tam giác $ABC$ vuông tại $A$ và $OA=2$, $AB=3$, $AC = 6$. Thể tích của khối chóp $O.ABC$ bằng.',
  'B',
  '[]'::jsonb,
  null,
  'Hình học không gian với véc tơ',
  'Toan_Hoc/2_Hinh_Hoc_Khong_Gian/1_vecto_trong_khong_gian.md',
  false,
  '{"source_question_number": 1, "section_number": 1, "difficulty_level": 1, "notes": "", "review_status": "pending_review"}'::jsonb
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'thpt-van-lang-ha-noi-q01-opt-a',
  'thpt-van-lang-ha-noi-q01',
  'A',
  '36.',
  1
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'thpt-van-lang-ha-noi-q01-opt-b',
  'thpt-van-lang-ha-noi-q01',
  'B',
  '6.',
  2
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'thpt-van-lang-ha-noi-q01-opt-c',
  'thpt-van-lang-ha-noi-q01',
  'C',
  '12.',
  3
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'thpt-van-lang-ha-noi-q01-opt-d',
  'thpt-van-lang-ha-noi-q01',
  'D',
  '18.',
  4
);

insert into public.school_exam_questions (
  question_id, exam_id, section_id, question_number, difficulty_level, question_type,
  question_text, correct_answer, statement_json, explanation, topic, obsidian_source_path,
  has_image, metadata
) values (
  'thpt-van-lang-ha-noi-q02',
  'thpt-van-lang-ha-noi',
  'thpt-van-lang-ha-noi-section-1',
  2,
  1,
  'multiple_choice',
  'Cho hình lăng trụ $ABC.A''B''C''$. Đường thẳng $B''C''$ song song với mặt phẳng nào sau đây?',
  'B',
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
  'thpt-van-lang-ha-noi-q02-opt-a',
  'thpt-van-lang-ha-noi-q02',
  'A',
  '$(A''B''C'')$.',
  1
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'thpt-van-lang-ha-noi-q02-opt-b',
  'thpt-van-lang-ha-noi-q02',
  'B',
  '$(ABC)$.',
  2
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'thpt-van-lang-ha-noi-q02-opt-c',
  'thpt-van-lang-ha-noi-q02',
  'C',
  '$(AB''C'')$.',
  3
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'thpt-van-lang-ha-noi-q02-opt-d',
  'thpt-van-lang-ha-noi-q02',
  'D',
  '$(BB''C'')$.',
  4
);

insert into public.school_exam_question_assets (
  asset_id, question_id, asset_type, asset_path, caption, display_order
) values (
  'thpt-van-lang-ha-noi-q02-asset-question_block-1',
  'thpt-van-lang-ha-noi-q02',
  'question_block',
  'TN_Cau02.png',
  null,
  1
);

insert into public.school_exam_question_assets (
  asset_id, question_id, asset_type, asset_path, caption, display_order
) values (
  'thpt-van-lang-ha-noi-q02-asset-figure-2',
  'thpt-van-lang-ha-noi-q02',
  'figure',
  'TN_Cau02_hinh2.png',
  null,
  2
);

insert into public.school_exam_questions (
  question_id, exam_id, section_id, question_number, difficulty_level, question_type,
  question_text, correct_answer, statement_json, explanation, topic, obsidian_source_path,
  has_image, metadata
) values (
  'thpt-van-lang-ha-noi-q03',
  'thpt-van-lang-ha-noi',
  'thpt-van-lang-ha-noi-section-1',
  3,
  1,
  'multiple_choice',
  'Họ nguyên hàm của hàm số $f(x) = \sin x + \cos x$ là',
  'D',
  '[]'::jsonb,
  null,
  'Nguyên hàm',
  'Toan_Hoc/4_Nguyen_Ham_Tich_Phan/1_nguyen_ham.md',
  false,
  '{"source_question_number": 3, "section_number": 1, "difficulty_level": 1, "notes": "", "review_status": "pending_review"}'::jsonb
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'thpt-van-lang-ha-noi-q03-opt-a',
  'thpt-van-lang-ha-noi-q03',
  'A',
  '$\cos x - \sin x + C$.',
  1
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'thpt-van-lang-ha-noi-q03-opt-b',
  'thpt-van-lang-ha-noi-q03',
  'B',
  '$-\cos x - \sin x + C$.',
  2
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'thpt-van-lang-ha-noi-q03-opt-c',
  'thpt-van-lang-ha-noi-q03',
  'C',
  '$\cos x + \sin x + C$.',
  3
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'thpt-van-lang-ha-noi-q03-opt-d',
  'thpt-van-lang-ha-noi-q03',
  'D',
  '$-\cos x + \sin x + C$.',
  4
);

insert into public.school_exam_questions (
  question_id, exam_id, section_id, question_number, difficulty_level, question_type,
  question_text, correct_answer, statement_json, explanation, topic, obsidian_source_path,
  has_image, metadata
) values (
  'thpt-van-lang-ha-noi-q04',
  'thpt-van-lang-ha-noi',
  'thpt-van-lang-ha-noi-section-1',
  4,
  1,
  'multiple_choice',
  'Nghiệm của phương trình $2^{2x+1} = 8$ là',
  'B',
  '[]'::jsonb,
  null,
  'Phương trình mũ và logarit',
  'Toan_Hoc/1_Ham_So/7_phuong_trinh_mu_va_logarit.md',
  false,
  '{"source_question_number": 4, "section_number": 1, "difficulty_level": 1, "notes": "", "review_status": "pending_review"}'::jsonb
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'thpt-van-lang-ha-noi-q04-opt-a',
  'thpt-van-lang-ha-noi-q04',
  'A',
  '$x=-\frac{3}{2}$',
  1
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'thpt-van-lang-ha-noi-q04-opt-b',
  'thpt-van-lang-ha-noi-q04',
  'B',
  '$x=1$.',
  2
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'thpt-van-lang-ha-noi-q04-opt-c',
  'thpt-van-lang-ha-noi-q04',
  'C',
  '$x = 3$.',
  3
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'thpt-van-lang-ha-noi-q04-opt-d',
  'thpt-van-lang-ha-noi-q04',
  'D',
  '$x = -\frac{5}{2}$',
  4
);

insert into public.school_exam_questions (
  question_id, exam_id, section_id, question_number, difficulty_level, question_type,
  question_text, correct_answer, statement_json, explanation, topic, obsidian_source_path,
  has_image, metadata
) values (
  'thpt-van-lang-ha-noi-q05',
  'thpt-van-lang-ha-noi',
  'thpt-van-lang-ha-noi-section-1',
  5,
  2,
  'multiple_choice',
  'Trong không gian với hệ tọa độ $Oxyz$, mặt phẳng đi qua gốc tọa độ và nhận $\vec{n}=(-1;0;3)$ làm một véc tơ pháp tuyến có phương trình tổng quát là.',
  'B',
  '[]'::jsonb,
  null,
  'Phương trình mặt phẳng trong Oxyz',
  'Toan_Hoc/2_Hinh_Hoc_Khong_Gian/4_phuong_trinh_mat_phang.md',
  false,
  '{"source_question_number": 5, "section_number": 1, "difficulty_level": 2, "notes": "", "review_status": "pending_review"}'::jsonb
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'thpt-van-lang-ha-noi-q05-opt-a',
  'thpt-van-lang-ha-noi-q05',
  'A',
  '$-y+3z=0$.',
  1
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'thpt-van-lang-ha-noi-q05-opt-b',
  'thpt-van-lang-ha-noi-q05',
  'B',
  '$-x+3z=0$.',
  2
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'thpt-van-lang-ha-noi-q05-opt-c',
  'thpt-van-lang-ha-noi-q05',
  'C',
  '$-x+3y=0$.',
  3
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'thpt-van-lang-ha-noi-q05-opt-d',
  'thpt-van-lang-ha-noi-q05',
  'D',
  '$-x-3z=0$.',
  4
);

insert into public.school_exam_questions (
  question_id, exam_id, section_id, question_number, difficulty_level, question_type,
  question_text, correct_answer, statement_json, explanation, topic, obsidian_source_path,
  has_image, metadata
) values (
  'thpt-van-lang-ha-noi-q06',
  'thpt-van-lang-ha-noi',
  'thpt-van-lang-ha-noi-section-1',
  6,
  2,
  'multiple_choice',
  'Cho hàm số $y = \frac{ax+b}{cx + d}$ ($ac \neq 0, ad -bc \neq 0$) có bảng biến thiên như dưới đây. Đường tiệm cận đứng của đồ thị hàm số đã cho có phương trình là.',
  'A',
  '[]'::jsonb,
  null,
  'Đường tiệm cận',
  'Toan_Hoc/1_Ham_So/4_duong_tiem_can.md',
  true,
  '{"source_question_number": 6, "section_number": 1, "difficulty_level": 2, "notes": "", "review_status": "pending_review"}'::jsonb
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'thpt-van-lang-ha-noi-q06-opt-a',
  'thpt-van-lang-ha-noi-q06',
  'A',
  '$x = -2$.',
  1
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'thpt-van-lang-ha-noi-q06-opt-b',
  'thpt-van-lang-ha-noi-q06',
  'B',
  '$y=-2$.',
  2
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'thpt-van-lang-ha-noi-q06-opt-c',
  'thpt-van-lang-ha-noi-q06',
  'C',
  '$y=1$.',
  3
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'thpt-van-lang-ha-noi-q06-opt-d',
  'thpt-van-lang-ha-noi-q06',
  'D',
  '$x=1$.',
  4
);

insert into public.school_exam_question_assets (
  asset_id, question_id, asset_type, asset_path, caption, display_order
) values (
  'thpt-van-lang-ha-noi-q06-asset-question_block-1',
  'thpt-van-lang-ha-noi-q06',
  'question_block',
  'TN_Cau06.png',
  null,
  1
);

insert into public.school_exam_question_assets (
  asset_id, question_id, asset_type, asset_path, caption, display_order
) values (
  'thpt-van-lang-ha-noi-q06-asset-figure-2',
  'thpt-van-lang-ha-noi-q06',
  'figure',
  'TN_Cau06_hinh6.png',
  null,
  2
);

insert into public.school_exam_questions (
  question_id, exam_id, section_id, question_number, difficulty_level, question_type,
  question_text, correct_answer, statement_json, explanation, topic, obsidian_source_path,
  has_image, metadata
) values (
  'thpt-van-lang-ha-noi-q07',
  'thpt-van-lang-ha-noi',
  'thpt-van-lang-ha-noi-section-1',
  7,
  2,
  'multiple_choice',
  'Hai khẩu pháo cao xạ cùng bắn độc lập với nhau vào một mục tiêu. Xác suất bắn trúng mục tiêu của hai khẩu pháo cao xạ lần lượt là $\frac{1}{4}$ và $\frac{1}{3}$. Xác suất để mục tiêu bị bắn trúng đạn là:',
  'A',
  '[]'::jsonb,
  null,
  'Xác suất biến cố độc lập',
  'Toan_Hoc/3_Thong_Ke_Xac_Suat/3_xac_suat_co_dieu_kien.md',
  false,
  '{"source_question_number": 7, "section_number": 1, "difficulty_level": 2, "notes": "", "review_status": "pending_review"}'::jsonb
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'thpt-van-lang-ha-noi-q07-opt-a',
  'thpt-van-lang-ha-noi-q07',
  'A',
  '$\frac{1}{2}$',
  1
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'thpt-van-lang-ha-noi-q07-opt-b',
  'thpt-van-lang-ha-noi-q07',
  'B',
  '$\frac{7}{12}$',
  2
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'thpt-van-lang-ha-noi-q07-opt-c',
  'thpt-van-lang-ha-noi-q07',
  'C',
  '$\frac{5}{12}$',
  3
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'thpt-van-lang-ha-noi-q07-opt-d',
  'thpt-van-lang-ha-noi-q07',
  'D',
  '$\frac{1}{4}$',
  4
);

insert into public.school_exam_questions (
  question_id, exam_id, section_id, question_number, difficulty_level, question_type,
  question_text, correct_answer, statement_json, explanation, topic, obsidian_source_path,
  has_image, metadata
) values (
  'thpt-van-lang-ha-noi-q08',
  'thpt-van-lang-ha-noi',
  'thpt-van-lang-ha-noi-section-1',
  8,
  2,
  'multiple_choice',
  'Cho hình chóp tứ giác đều $S.ABCD$. Gọi $O$ là giao điểm của $AC$ và $BD$. Phát biểu nào sau đây là đúng?',
  'B',
  '[]'::jsonb,
  null,
  'Hình học không gian với véc tơ',
  'Toan_Hoc/2_Hinh_Hoc_Khong_Gian/1_vecto_trong_khong_gian.md',
  true,
  '{"source_question_number": 8, "section_number": 1, "difficulty_level": 2, "notes": "", "review_status": "pending_review"}'::jsonb
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'thpt-van-lang-ha-noi-q08-opt-a',
  'thpt-van-lang-ha-noi-q08',
  'A',
  '$SA+SB+SC+SD=2SO$.',
  1
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'thpt-van-lang-ha-noi-q08-opt-b',
  'thpt-van-lang-ha-noi-q08',
  'B',
  '$SA+SB+SC+SD=4SO$.',
  2
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'thpt-van-lang-ha-noi-q08-opt-c',
  'thpt-van-lang-ha-noi-q08',
  'C',
  '$SA+SB+SC+SD=SO$.',
  3
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'thpt-van-lang-ha-noi-q08-opt-d',
  'thpt-van-lang-ha-noi-q08',
  'D',
  '$SA+SB+SC+SD=0$.',
  4
);

insert into public.school_exam_question_assets (
  asset_id, question_id, asset_type, asset_path, caption, display_order
) values (
  'thpt-van-lang-ha-noi-q08-asset-question_block-1',
  'thpt-van-lang-ha-noi-q08',
  'question_block',
  'TN_Cau08.png',
  null,
  1
);

insert into public.school_exam_question_assets (
  asset_id, question_id, asset_type, asset_path, caption, display_order
) values (
  'thpt-van-lang-ha-noi-q08-asset-figure-2',
  'thpt-van-lang-ha-noi-q08',
  'figure',
  'TN_Cau08_hinh8.png',
  null,
  2
);

insert into public.school_exam_questions (
  question_id, exam_id, section_id, question_number, difficulty_level, question_type,
  question_text, correct_answer, statement_json, explanation, topic, obsidian_source_path,
  has_image, metadata
) values (
  'thpt-van-lang-ha-noi-q09',
  'thpt-van-lang-ha-noi',
  'thpt-van-lang-ha-noi-section-1',
  9,
  3,
  'multiple_choice',
  'Một người chia thời lượng thực hiện các cuộc gọi điện thoại của mình trong một tuần thành sáu nhóm và lập bảng tần số ghép nhóm như sau: Tứ phân vị thứ ba $Q_3$ của mẫu số liệu ghép nhóm trên bằng',
  'D',
  '[]'::jsonb,
  null,
  'Tứ phân vị và số liệu ghép nhóm',
  'Toan_Hoc/3_Thong_Ke_Xac_Suat/1_khoang_bien_thien_tu_phan_vi.md',
  true,
  '{"source_question_number": 9, "section_number": 1, "difficulty_level": 3, "notes": "", "review_status": "pending_review"}'::jsonb
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'thpt-van-lang-ha-noi-q09-opt-a',
  'thpt-van-lang-ha-noi-q09',
  'A',
  '100.',
  1
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'thpt-van-lang-ha-noi-q09-opt-b',
  'thpt-van-lang-ha-noi-q09',
  'B',
  '105.',
  2
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'thpt-van-lang-ha-noi-q09-opt-c',
  'thpt-van-lang-ha-noi-q09',
  'C',
  '90.',
  3
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'thpt-van-lang-ha-noi-q09-opt-d',
  'thpt-van-lang-ha-noi-q09',
  'D',
  '95.',
  4
);

insert into public.school_exam_question_assets (
  asset_id, question_id, asset_type, asset_path, caption, display_order
) values (
  'thpt-van-lang-ha-noi-q09-asset-question_block-1',
  'thpt-van-lang-ha-noi-q09',
  'question_block',
  'TN_Cau09.png',
  null,
  1
);

insert into public.school_exam_question_assets (
  asset_id, question_id, asset_type, asset_path, caption, display_order
) values (
  'thpt-van-lang-ha-noi-q09-asset-figure-2',
  'thpt-van-lang-ha-noi-q09',
  'figure',
  'TN_Cau09_hinh9.png',
  null,
  2
);

insert into public.school_exam_questions (
  question_id, exam_id, section_id, question_number, difficulty_level, question_type,
  question_text, correct_answer, statement_json, explanation, topic, obsidian_source_path,
  has_image, metadata
) values (
  'thpt-van-lang-ha-noi-q10',
  'thpt-van-lang-ha-noi',
  'thpt-van-lang-ha-noi-section-1',
  10,
  3,
  'multiple_choice',
  'Trong mặt phẳng với hệ tọa độ $Oxy$, diện tích $S$ của hình phẳng giới hạn bởi đồ thị hàm số $y=2x+1$, trục hoành và hai đường thẳng $x=1,x=2$ được xác định bằng công thức',
  'D',
  '[]'::jsonb,
  null,
  'Tích phân và diện tích hình phẳng',
  'Toan_Hoc/4_Nguyen_Ham_Tich_Phan/3_ung_dung_hinh_hoc_tich_phan.md',
  false,
  '{"source_question_number": 10, "section_number": 1, "difficulty_level": 3, "notes": "", "review_status": "pending_review"}'::jsonb
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'thpt-van-lang-ha-noi-q10-opt-a',
  'thpt-van-lang-ha-noi-q10',
  'A',
  '$S = \int_{1}^{2} (2x+1)^2 dx$.',
  1
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'thpt-van-lang-ha-noi-q10-opt-b',
  'thpt-van-lang-ha-noi-q10',
  'B',
  '$S = \pi \int_{1}^{2} (2x+1)dx$.',
  2
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'thpt-van-lang-ha-noi-q10-opt-c',
  'thpt-van-lang-ha-noi-q10',
  'C',
  '$S = \pi\int_{1}^{2} (2x + 1)^2 dx$.',
  3
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'thpt-van-lang-ha-noi-q10-opt-d',
  'thpt-van-lang-ha-noi-q10',
  'D',
  '$S = \int_{1}^{2} (2x+1)dx$.',
  4
);

insert into public.school_exam_questions (
  question_id, exam_id, section_id, question_number, difficulty_level, question_type,
  question_text, correct_answer, statement_json, explanation, topic, obsidian_source_path,
  has_image, metadata
) values (
  'thpt-van-lang-ha-noi-q11',
  'thpt-van-lang-ha-noi',
  'thpt-van-lang-ha-noi-section-1',
  11,
  3,
  'multiple_choice',
  'Cho cấp số cộng $(u_n)$ với $u_1 = 2$ và công sai $d = 3$. Giá trị của $u_5$ bằng',
  'C',
  '[]'::jsonb,
  null,
  'Cấp số cộng và cấp số nhân',
  'Toan_Hoc/1_Ham_So/8_cap_so_cong_va_cap_so_nhan.md',
  false,
  '{"source_question_number": 11, "section_number": 1, "difficulty_level": 3, "notes": "", "review_status": "pending_review"}'::jsonb
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'thpt-van-lang-ha-noi-q11-opt-a',
  'thpt-van-lang-ha-noi-q11',
  'A',
  '12.',
  1
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'thpt-van-lang-ha-noi-q11-opt-b',
  'thpt-van-lang-ha-noi-q11',
  'B',
  '15.',
  2
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'thpt-van-lang-ha-noi-q11-opt-c',
  'thpt-van-lang-ha-noi-q11',
  'C',
  '14.',
  3
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'thpt-van-lang-ha-noi-q11-opt-d',
  'thpt-van-lang-ha-noi-q11',
  'D',
  '17.',
  4
);

insert into public.school_exam_questions (
  question_id, exam_id, section_id, question_number, difficulty_level, question_type,
  question_text, correct_answer, statement_json, explanation, topic, obsidian_source_path,
  has_image, metadata
) values (
  'thpt-van-lang-ha-noi-q12',
  'thpt-van-lang-ha-noi',
  'thpt-van-lang-ha-noi-section-1',
  12,
  4,
  'multiple_choice',
  'Cho hàm số bậc ba $y = f(x)$ có đồ thị là đường cong hình sau. Hàm số đã cho nghịch biến trên khoảng nào dưới đây?',
  'D',
  '[]'::jsonb,
  null,
  'Khảo sát và đọc đồ thị hàm số',
  'Toan_Hoc/1_Ham_So/5_khao_sat_do_thi.md',
  true,
  '{"source_question_number": 12, "section_number": 1, "difficulty_level": 4, "notes": "", "review_status": "pending_review"}'::jsonb
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'thpt-van-lang-ha-noi-q12-opt-a',
  'thpt-van-lang-ha-noi-q12',
  'A',
  '$(-\infty;0)$.',
  1
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'thpt-van-lang-ha-noi-q12-opt-b',
  'thpt-van-lang-ha-noi-q12',
  'B',
  '$(2;+\infty)$.',
  2
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'thpt-van-lang-ha-noi-q12-opt-c',
  'thpt-van-lang-ha-noi-q12',
  'C',
  '$(-3;1)$.',
  3
);

insert into public.school_exam_question_options (
  option_id, question_id, option_label, option_text, display_order
) values (
  'thpt-van-lang-ha-noi-q12-opt-d',
  'thpt-van-lang-ha-noi-q12',
  'D',
  '$(0;2)$.',
  4
);

insert into public.school_exam_question_assets (
  asset_id, question_id, asset_type, asset_path, caption, display_order
) values (
  'thpt-van-lang-ha-noi-q12-asset-question_block-1',
  'thpt-van-lang-ha-noi-q12',
  'question_block',
  'TN_Cau12.png',
  null,
  1
);

insert into public.school_exam_question_assets (
  asset_id, question_id, asset_type, asset_path, caption, display_order
) values (
  'thpt-van-lang-ha-noi-q12-asset-figure-2',
  'thpt-van-lang-ha-noi-q12',
  'figure',
  'TN_Cau12_hinh12.png',
  null,
  2
);

insert into public.school_exam_questions (
  question_id, exam_id, section_id, question_number, difficulty_level, question_type,
  question_text, correct_answer, statement_json, explanation, topic, obsidian_source_path,
  has_image, metadata
) values (
  'thpt-van-lang-ha-noi-q13',
  'thpt-van-lang-ha-noi',
  'thpt-van-lang-ha-noi-section-2',
  13,
  2,
  'true_false',
  'Biết giới hạn $\lim \frac{2n^2 +1}{3n^3-3n+3} =a$ và $\lim \frac{n\sqrt{n^2 +1}}{\sqrt{4n^4-n^2+3}} = b$. Xét tính đúng sai của các khẳng định sau:',
  'SDDS',
  '[{"label": "a", "text": "Giá trị $a$ nhỏ hơn 0."}, {"label": "b", "text": "Giá trị $b$ lớn hơn 0."}, {"label": "c", "text": "Phương trình lượng giác $\\cos x = a$ có nghiệm là $x = \\frac{\\pi}{2}$."}, {"label": "d", "text": "Cho cấp số cộng $(u_n)$ với công sai $d = b$ và $u_1 = a$, thì $u_3 = \\frac{3}{2}$."}]'::jsonb,
  null,
  'Giới hạn dãy số',
  'Toan_Hoc/5_Gioi_Han_Day_So/1_gioi_han_day_so.md',
  false,
  '{"source_question_number": 1, "section_number": 2, "difficulty_level": 2, "notes": "", "review_status": "pending_review"}'::jsonb
);

insert into public.school_exam_questions (
  question_id, exam_id, section_id, question_number, difficulty_level, question_type,
  question_text, correct_answer, statement_json, explanation, topic, obsidian_source_path,
  has_image, metadata
) values (
  'thpt-van-lang-ha-noi-q14',
  'thpt-van-lang-ha-noi',
  'thpt-van-lang-ha-noi-section-2',
  14,
  2,
  'true_false',
  'Một công ty sản xuất dụng cụ thể thao nhận được một đơn đặt hàng sản xuất 8000 quả bóng pickleball. Công ty này sở hữu một số máy móc, mỗi máy có thể sản xuất 30 quả bóng trong một giờ. Chi phí thiết lập các máy này là 200 nghìn đồng cho mỗi máy. Khi được thiết lập, hoạt động sản xuất sẽ hoàn toàn diễn ra tự động dưới sự giám sát (người giám sát sẽ giám sát tất cả các máy). Số tiền phải trả cho người giám sát là 192 nghìn đồng một giờ. Xét tính đúng sai của các khẳng định sau:',
  'SDSD',
  '[{"label": "a", "text": "Trong 1 giờ, cần 266 máy để sản xuất được 8000 quả bóng pickleball."}, {"label": "b", "text": "Trong $\\frac{8}{3}$ giờ, cần 100 máy để sản xuất được 8000 quả bóng pickleball."}, {"label": "c", "text": "Chi phí hoạt động thấp nhất là 6,5 triệu đồng."}, {"label": "d", "text": "Để chi phí hoạt động thấp nhất, công ty cần sử dụng 16 máy."}]'::jsonb,
  null,
  'Cực trị, GTLN và GTNN',
  'Toan_Hoc/1_Ham_So/3_gia_tri_lon_nhat_nho_nhat.md',
  false,
  '{"source_question_number": 2, "section_number": 2, "difficulty_level": 2, "notes": "", "review_status": "pending_review"}'::jsonb
);

insert into public.school_exam_questions (
  question_id, exam_id, section_id, question_number, difficulty_level, question_type,
  question_text, correct_answer, statement_json, explanation, topic, obsidian_source_path,
  has_image, metadata
) values (
  'thpt-van-lang-ha-noi-q15',
  'thpt-van-lang-ha-noi',
  'thpt-van-lang-ha-noi-section-2',
  15,
  3,
  'true_false',
  'Trong không gian với hệ tọa độ $Oxyz$, cho hình bình hành $ABCD$ có $A(-3;4;2)$, $B(-5;6;2)$, $C(-10;17;-7)$. Xét tính đúng sai của các khẳng định sau:',
  'DDSS',
  '[{"label": "a", "text": "Tọa độ của $\\vec{DC}$ là $\\vec{DC} =(-2;2;0)$"}, {"label": "b", "text": "Tọa độ điểm $D$ là $D(-8;15;-7)$."}, {"label": "c", "text": "$[\\vec{AB}.\\vec{AD}]=(-2;8;-9)$"}, {"label": "d", "text": "Đường thẳng đi qua $D$ và vuông góc với $mp(ABCD)$ có phương trình là $\\frac{x-8}{3}=\\frac{y+15}{3}=\\frac{z-7}{2}$"}]'::jsonb,
  null,
  'Hệ trục tọa độ Oxyz',
  'Toan_Hoc/2_Hinh_Hoc_Khong_Gian/2_he_truc_toa_do_Oxyz.md',
  false,
  '{"source_question_number": 3, "section_number": 2, "difficulty_level": 3, "notes": "", "review_status": "pending_review"}'::jsonb
);

insert into public.school_exam_questions (
  question_id, exam_id, section_id, question_number, difficulty_level, question_type,
  question_text, correct_answer, statement_json, explanation, topic, obsidian_source_path,
  has_image, metadata
) values (
  'thpt-van-lang-ha-noi-q16',
  'thpt-van-lang-ha-noi',
  'thpt-van-lang-ha-noi-section-2',
  16,
  4,
  'true_false',
  'Đường cong Lorenz được các nhà kinh tế học dùng để biểu thị sự phân phối thu nhập thực tế, trong khi đó mô hình $y = x$ sẽ đại diện cho một quốc gia mà các gia đình có thu nhập như nhau, trong đó $x$ là đại diện cho phần trăm số gia đình trong một quốc gia và $y$ là phần trăm tổng thu nhập. Diện tích giữa hai mô hình này biểu thị "sự bất bình đẳng về thu nhập" của một quốc gia. Năm 2005, đường cong Lorenz của Hoa Kỳ có thể được mô hình hóa bởi hàm số: $y = (0,00061x^2 +0,0218x+1,723)^2, 0 \le x \le 100$ (Theo R.Larson, Brief Calculus: An Applied Approach, 8th edition, Cengage Learning, 2009). Xét tính đúng sai của các khẳng định sau:',
  'DSSD',
  '[{"label": "a", "text": "Tính theo thứ tự từ các gia đình nghèo nhất đến giàu nhất, tổng thu nhập thực tế của 60% các gia đình đầu tiên chiếm chưa đến 30% so với tổng thu nhập của toàn bộ các gia đình."}, {"label": "b", "text": "Nếu sắp xếp các gia đình theo thứ tự từ nghèo nhất đến giàu nhất, rồi chia thành 10 nhóm bằng nhau từ 1 đến 10, tổng thu nhập của các gia đình trong nhóm 3 chiếm khoảng 8,56% tổng thu nhập của toàn bộ các gia đình."}, {"label": "c", "text": "Sự bất bình đẳng về thu nhập của Hoa Kỳ năm 2005 được xác định bởi công thức: $\\int_{0}^{100} [x-(0,00061x^2 +0,0218x+1,723)^2] dx$"}, {"label": "d", "text": "Sự bất bình đẳng về thu nhập của Hoa Kỳ năm 2005 đã vượt quá 2000."}]'::jsonb,
  null,
  'Tích phân và diện tích hình phẳng',
  'Toan_Hoc/4_Nguyen_Ham_Tich_Phan/3_ung_dung_hinh_hoc_tich_phan.md',
  false,
  '{"source_question_number": 4, "section_number": 2, "difficulty_level": 4, "notes": "", "review_status": "pending_review"}'::jsonb
);

insert into public.school_exam_questions (
  question_id, exam_id, section_id, question_number, difficulty_level, question_type,
  question_text, correct_answer, statement_json, explanation, topic, obsidian_source_path,
  has_image, metadata
) values (
  'thpt-van-lang-ha-noi-q17',
  'thpt-van-lang-ha-noi',
  'thpt-van-lang-ha-noi-section-3',
  17,
  1,
  'short_answer',
  'Cho hình chóp $S.ABCD$ có đáy $ABCD$ là hình vuông cạnh 2, $SA = \sqrt{7}$ và $SA$ vuông góc với mặt đáy. $M$ là trung điểm $SD$. Tính khoảng cách giữa $SB$ và $CM$. (Không làm tròn kết quả các phép tính trung gian, chỉ làm tròn kết quả cuối cùng đến hàng phần trăm)',
  '1,25',
  '[]'::jsonb,
  null,
  'Hình học không gian với véc tơ',
  'Toan_Hoc/2_Hinh_Hoc_Khong_Gian/1_vecto_trong_khong_gian.md',
  false,
  '{"source_question_number": 1, "section_number": 3, "difficulty_level": 1, "notes": "", "review_status": "pending_review"}'::jsonb
);

insert into public.school_exam_questions (
  question_id, exam_id, section_id, question_number, difficulty_level, question_type,
  question_text, correct_answer, statement_json, explanation, topic, obsidian_source_path,
  has_image, metadata
) values (
  'thpt-van-lang-ha-noi-q18',
  'thpt-van-lang-ha-noi',
  'thpt-van-lang-ha-noi-section-3',
  18,
  1,
  'short_answer',
  'Một bài thi trắc nghiệm có 12 câu hỏi, mỗi câu có 4 phương án lựa chọn trong đó có 1 đáp án đúng. Giả sử mỗi câu trả lời đúng được 5 điểm và mỗi câu trả lời sai bị trừ 2 điểm. Một học sinh không học bài nên chọn hú họa một phương án trả lời cho mỗi câu. Tính xác suất để điểm của học sinh này không lớn hơn 4 (làm tròn kết quả đến hàng phần trăm).',
  '0,84',
  '[]'::jsonb,
  null,
  'Xác suất biến cố độc lập',
  'Toan_Hoc/3_Thong_Ke_Xac_Suat/3_xac_suat_co_dieu_kien.md',
  false,
  '{"source_question_number": 2, "section_number": 3, "difficulty_level": 1, "notes": "", "review_status": "pending_review"}'::jsonb
);

insert into public.school_exam_questions (
  question_id, exam_id, section_id, question_number, difficulty_level, question_type,
  question_text, correct_answer, statement_json, explanation, topic, obsidian_source_path,
  has_image, metadata
) values (
  'thpt-van-lang-ha-noi-q19',
  'thpt-van-lang-ha-noi',
  'thpt-van-lang-ha-noi-section-3',
  19,
  2,
  'short_answer',
  'Cho hình chóp $S.ABCD$ có đáy $ABCD$ là hình bình hành. Mặt bên $SAB$ là tam giác đều cạnh $\sqrt{3}$, $ABC$ là tam giác vuông tại $A$ có cạnh $AC = 1$, góc giữa $AD$ và $(SAB)$ bằng $30^\circ$. Tính thể tích khối chóp $S.ABCD$ (Không làm tròn kết quả các phép tính trung gian, chỉ làm tròn kết quả cuối cùng đến hàng phần trăm).',
  '0,87',
  '[]'::jsonb,
  null,
  'Hình học không gian với véc tơ',
  'Toan_Hoc/2_Hinh_Hoc_Khong_Gian/1_vecto_trong_khong_gian.md',
  false,
  '{"source_question_number": 3, "section_number": 3, "difficulty_level": 2, "notes": "", "review_status": "pending_review"}'::jsonb
);

insert into public.school_exam_questions (
  question_id, exam_id, section_id, question_number, difficulty_level, question_type,
  question_text, correct_answer, statement_json, explanation, topic, obsidian_source_path,
  has_image, metadata
) values (
  'thpt-van-lang-ha-noi-q20',
  'thpt-van-lang-ha-noi',
  'thpt-van-lang-ha-noi-section-3',
  20,
  2,
  'short_answer',
  'Nếu một doanh nghiệp sản xuất $x$ sản phẩm trong một tháng ($x\in \mathbb{N}^*;1\le x\le3000$) thì doanh thu nhận được khi bán hết số sản phẩm đó là $F(x) = -0,02x^2 +300x$ (nghìn đồng), trong khi chi phí sản xuất bình quân cho mỗi sản phẩm là $G(x) = \frac{2000}{x} +200$ (nghìn đồng). Giả sử số sản phẩm sản xuất ra luôn được bán hết. Trong một tháng, doanh nghiệp đó cần sản xuất ít nhất bao nhiêu sản phẩm để lợi nhuận thu được lớn hơn 50 triệu đồng?',
  '590',
  '[]'::jsonb,
  null,
  'Cực trị, GTLN và GTNN',
  'Toan_Hoc/1_Ham_So/3_gia_tri_lon_nhat_nho_nhat.md',
  false,
  '{"source_question_number": 4, "section_number": 3, "difficulty_level": 2, "notes": "", "review_status": "pending_review"}'::jsonb
);

insert into public.school_exam_questions (
  question_id, exam_id, section_id, question_number, difficulty_level, question_type,
  question_text, correct_answer, statement_json, explanation, topic, obsidian_source_path,
  has_image, metadata
) values (
  'thpt-van-lang-ha-noi-q21',
  'thpt-van-lang-ha-noi',
  'thpt-van-lang-ha-noi-section-3',
  21,
  3,
  'short_answer',
  'Một nhóm học sinh gồm 5 học sinh nam trong đó có Hoàng và 5 học sinh nữ trong đó có Lan được xếp thành một hàng dọc. Gọi $m$ là số cách xếp thỏa mãn các học sinh nam nữ đứng xen kẽ nhau sao cho Hoàng và Lan không đứng liên tiếp nhau. Giá trị $\frac{m}{32}$ bằng bao nhiêu?',
  '576',
  '[]'::jsonb,
  null,
  'Tổ hợp, xác suất và đếm',
  'Toan_Hoc/5_To_Hop_Xac_Suat/1_quy_tac_dem_va_hoan_vi_to_hop.md',
  false,
  '{"source_question_number": 5, "section_number": 3, "difficulty_level": 3, "notes": "", "review_status": "pending_review"}'::jsonb
);

insert into public.school_exam_questions (
  question_id, exam_id, section_id, question_number, difficulty_level, question_type,
  question_text, correct_answer, statement_json, explanation, topic, obsidian_source_path,
  has_image, metadata
) values (
  'thpt-van-lang-ha-noi-q22',
  'thpt-van-lang-ha-noi',
  'thpt-van-lang-ha-noi-section-3',
  22,
  4,
  'short_answer',
  'Một phân xưởng có hai máy chuyên dụng I và II để sản xuất hai loại sản phẩm A, B theo đơn đặt hàng. Nếu sản xuất một tấn sản phẩm A thì phân xưởng phải dùng máy I trong 3 giờ, máy II trong 1 giờ và thu được lãi 2 triệu đồng. Nếu sản xuất một tấn sản phẩm loại B thì phân xưởng phải dùng máy I trong 1 giờ, máy II trong 1 giờ và thu được lãi 1,6 triệu đồng. Một máy không thể dùng để sản xuất đồng thời hai loại sản phẩm. Máy I làm việc không quá 6 giờ một ngày, máy II làm việc không quá 4 giờ một ngày. Hỏi số tiền lãi lớn nhất mà phân xưởng đó có thể thu được trong một ngày là bao nhiêu triệu đồng?',
  '6,8',
  '[]'::jsonb,
  null,
  'Cực trị, GTLN và GTNN',
  'Toan_Hoc/1_Ham_So/3_gia_tri_lon_nhat_nho_nhat.md',
  false,
  '{"source_question_number": 6, "section_number": 3, "difficulty_level": 4, "notes": "", "review_status": "pending_review"}'::jsonb
);

commit;
