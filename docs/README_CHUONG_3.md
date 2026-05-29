# CHƯƠNG 3. XÂY DỰNG VÀ TRIỂN KHAI HỆ THỐNG

## 3.1. Cấu trúc dự án

Dự án được tổ chức theo hướng tách biệt giữa giao diện người dùng, dịch vụ AI, dữ liệu đề thi, kho tri thức và các script hỗ trợ. Cách tổ chức này giúp hệ thống dễ quản lý, dễ mở rộng và thuận tiện trong quá trình bảo trì. Mỗi thành phần đảm nhận một nhóm nhiệm vụ riêng, từ đó giảm sự phụ thuộc chéo và giúp việc phát triển, kiểm thử được thực hiện rõ ràng hơn.

Hệ thống gồm ba khối chính. Khối thứ nhất là ứng dụng `web-app`, đảm nhận việc hiển thị giao diện, xử lý thao tác của học sinh, giáo viên và quản trị viên. Khối thứ hai là `ai_service`, đóng vai trò trung gian tiếp nhận yêu cầu liên quan đến giải thích câu hỏi, phân tích điểm yếu và kiểm tra đề thi bằng AI. Khối thứ ba là nền tảng Supabase, được sử dụng để quản lý xác thực người dùng, cơ sở dữ liệu quan hệ và lưu trữ các tài nguyên như file PDF, hình ảnh câu hỏi và tài liệu minh họa.

### 3.1.1. Tổ chức thư mục

Cấu trúc thư mục chính của dự án gồm:

- `web-app/`: chứa mã nguồn giao diện người dùng, được xây dựng bằng React, TypeScript và Vite.
- `web-app/src/`: chứa các `pages`, `components`, `features`, `lib` và các phần xử lý logic của hệ thống.
- `web-app/src-tauri/`: chứa cấu hình Tauri để đóng gói ứng dụng web thành ứng dụng desktop.
- `web-app/public/school-exam-assets/`: lưu các hình ảnh, manifest và tài nguyên minh họa đi kèm đề thi trường.
- `web-app/public/school-exams/`: lưu file PDF đề thi để frontend có thể hiển thị hoặc tải về.
- `web-app/supabase/`: chứa các file schema, migration, policy và script import dữ liệu vào Supabase.
- `ai_service/`: chứa mã nguồn AI Service được xây dựng bằng FastAPI, dùng để xử lý Chatbot AI và các tác vụ liên quan đến Gemini API.
- `docs/knowledge-base/`: chứa kho tri thức dạng Markdown theo môn học và chuyên đề, phục vụ quá trình giải thích câu hỏi bằng AI.
- `data_scraper/`: chứa các công cụ hỗ trợ trích xuất, chuẩn hóa và xử lý dữ liệu đề thi từ file PDF.
- `scripts/`: chứa các script hỗ trợ seed dữ liệu, kiểm tra dữ liệu và chạy AI Service.
- `raw_pdfs/`: lưu trữ các file PDF đề thi gốc phục vụ quá trình nhập dữ liệu.

Cách phân chia này giúp các thành phần giao diện, xử lý AI, dữ liệu đề thi và tài liệu học tập được tách biệt rõ ràng, hạn chế việc mã nguồn bị trộn lẫn và tạo điều kiện thuận lợi cho việc nâng cấp hệ thống trong tương lai.

### 3.1.2. Vai trò từng module

Frontend trong `web-app/src` được tổ chức thành các nhóm chức năng chính như sau:

- `pages/`: chứa các màn hình của hệ thống như đăng nhập, đăng ký, trang tổng quan, luyện tập, làm bài thi, xem kết quả, lịch sử học tập, hồ sơ cá nhân và trang quản trị.
- `components/`: chứa các thành phần giao diện dùng chung như layout, navigation, card và thành phần hiển thị nội dung Markdown.
- `features/auth/`: xử lý đăng nhập, đăng ký, lưu phiên người dùng, hỗ trợ đăng nhập bằng email hoặc username và phân quyền truy cập.
- `features/practice/`: xử lý dữ liệu đề thi trường, danh sách đề, chi tiết câu hỏi, tài nguyên đi kèm và luồng luyện đề.
- `features/exam/`: quản lý phiên làm bài, đáp án tạm thời, nộp bài, xem lại bài và kết nối AI trong lúc review.
- `features/history/`: truy xuất và hiển thị lịch sử học tập, bao gồm lịch sử làm đề và lịch sử hỏi đáp với AI.
- `features/dashboard/`: tổng hợp số liệu học tập và hiển thị thông tin tổng quan của người dùng.
- `features/profile/`: quản lý thông tin hồ sơ học sinh như trường học, lớp, năm thi và mục tiêu học tập.
- `features/admin-import/`: xử lý chức năng nhập đề, tải PDF, kiểm tra dữ liệu bằng AI, chỉnh sửa câu hỏi và lưu đề thi vào hệ thống.
- `lib/supabase/`: cấu hình kết nối Supabase để frontend thực hiện xác thực, truy vấn dữ liệu và thao tác với Storage.

AI Service được tổ chức trong thư mục `ai_service`, trong đó file `main.py` định nghĩa các API chính như:

- `GET /health`: kiểm tra tình trạng hoạt động của service.
- `POST /api/explain`: giải thích câu hỏi, đáp án đúng và đáp án học sinh đã chọn.
- `POST /api/analyze-weaknesses`: phân tích nhóm kiến thức học sinh còn yếu.
- `POST /api/admin/validate-exam`: kiểm tra và chuẩn hóa nội dung đề thi dạng text.
- `POST /api/admin/import-exam-pdf/validate`: trích xuất câu hỏi, đáp án và metadata từ file PDF.
- `POST /api/admin/backfill-school-exam-topics`: hỗ trợ gán bổ sung chuyên đề cho ngân hàng câu hỏi.

Ngoài ra, `docs/knowledge-base/` đóng vai trò là kho ngữ cảnh để AI tham chiếu khi giải thích. `data_scraper/` hỗ trợ quy trình xử lý dữ liệu đầu vào, từ việc tách nội dung từ PDF đến chuẩn hóa JSON và tạo script import. `scripts/` hỗ trợ thao tác vận hành như chạy service, seed dữ liệu và kiểm tra thủ công.

Luồng xử lý tổng quát giữa các thành phần có thể mô tả như sau:

`React/Tauri Client -> Supabase Auth/Database/Storage`

`React/Tauri Client -> FastAPI AI Service -> Gemini API`

## 3.2. Xây dựng cơ sở dữ liệu

Hệ thống sử dụng Supabase làm nền tảng quản lý cơ sở dữ liệu, xác thực người dùng và lưu trữ tài nguyên. Supabase cung cấp PostgreSQL Database, Supabase Auth và Supabase Storage, phù hợp với nhu cầu lưu trữ dữ liệu học tập, đề thi, kết quả bài làm và nội dung trao đổi với Chatbot AI.

### 3.2.1. Tổ chức cơ sở dữ liệu

Cơ sở dữ liệu được tổ chức theo mô hình quan hệ, trong đó dữ liệu được chia thành các nhóm chính như sau:

- Dữ liệu người dùng: lưu thông tin tài khoản, hồ sơ cá nhân và vai trò của người dùng.
- Dữ liệu đề thi: lưu thông tin đề thi trường, cấu trúc từng phần đề, câu hỏi, đáp án và tài nguyên minh họa.
- Dữ liệu bài làm: lưu thông tin mỗi lần học sinh làm bài, chi tiết từng câu trả lời và kết quả chấm điểm.
- Dữ liệu AI: lưu lịch sử hỏi đáp giữa học sinh và Chatbot AI trong quá trình xem lại bài làm.

Bên cạnh dữ liệu dạng bảng, hệ thống còn sử dụng Supabase Storage để lưu các file PDF đề thi, hình ảnh câu hỏi và các tài nguyên minh họa. Đường dẫn tới các tài nguyên này được lưu trong cơ sở dữ liệu để liên kết với từng đề thi hoặc từng câu hỏi cụ thể.

Hệ thống cũng áp dụng cơ chế Row Level Security (RLS) trên các bảng chính. Học sinh chỉ có quyền xem và cập nhật dữ liệu của chính mình, trong khi giáo viên và quản trị viên có thêm quyền thao tác trên dữ liệu đề thi thông qua các policy được cấu hình trong Supabase.

### 3.2.2. Các bảng dữ liệu chính

Một số bảng dữ liệu chính trong hệ thống gồm:

**1. Bảng `user_profiles`**

- `user_id`: khóa chính, liên kết với tài khoản trong `auth.users`.
- `username`: tên đăng nhập hiển thị hoặc tên viết tắt.
- `email`: địa chỉ email người dùng.
- `full_name`: họ tên người dùng.
- `role`: vai trò người dùng, thường gồm `student`, `teacher` hoặc `admin`.
- `status`: trạng thái tài khoản.
- `school_name`, `province_city`, `class_name`: thông tin trường, tỉnh thành và lớp học.
- `phone_number`: số điện thoại liên hệ.
- `thptqg_exam_year`, `admission_combo`, `target_score`, `target_university`, `target_major`, `study_note`: các trường mở rộng phục vụ mục tiêu học tập của học sinh.

**2. Bảng `school_exams`**

- `exam_id`: khóa chính của đề thi.
- `title`: tên đề thi.
- `school_name`: tên trường.
- `city`: địa phương hoặc tỉnh, thành phố.
- `subject_code`: mã môn học.
- `subject_name`: tên môn học.
- `year`: năm thi.
- `duration_minutes`: thời gian làm bài.
- `pdf_url`: đường dẫn file PDF đề thi.
- `display_variant_code`: mã hiển thị của đề.
- `answer_key_provided`: cho biết đề đã có đáp án hay chưa.
- `source_path`: đường dẫn nguồn gốc của đề.
- `tags`: nhóm nhãn phân loại đề thi.
- `is_active`: trạng thái kích hoạt đề thi.

**3. Bảng `school_exam_sections`**

- `section_id`: khóa chính của phần đề.
- `exam_id`: khóa ngoại liên kết với bảng `school_exams`.
- `part_code`: loại phần đề, gồm `multiple_choice`, `true_false` hoặc `short_answer`.
- `title`: tên phần trong đề thi.
- `instructions`: hướng dẫn làm bài cho phần đó.
- `start_question_number`, `end_question_number`: khoảng số thứ tự câu hỏi.
- `display_order`: thứ tự hiển thị các phần trong đề.
- `options_per_question`, `statement_count`: thông tin cấu hình bổ sung cho từng loại câu hỏi.

**4. Bảng `school_exam_questions`**

- `question_id`: khóa chính của câu hỏi.
- `exam_id`: khóa ngoại liên kết với đề thi.
- `section_id`: khóa ngoại liên kết với phần đề.
- `question_number`: số thứ tự câu hỏi trong đề.
- `difficulty_level`: mức độ khó của câu hỏi.
- `question_type`: loại câu hỏi.
- `question_text`: nội dung câu hỏi.
- `correct_answer`: đáp án đúng.
- `statement_json`: dữ liệu mô tả các mệnh đề, dùng cho câu hỏi đúng/sai.
- `explanation`: giải thích đáp án nếu có.
- `topic`: chuyên đề liên quan.
- `obsidian_source_path`: đường dẫn tài liệu tri thức liên kết với câu hỏi.
- `has_image`: xác định câu hỏi có tài nguyên hình ảnh hay không.
- `metadata`: thông tin mở rộng phục vụ xử lý và hiển thị.

**5. Bảng `school_exam_question_options`**

- `option_id`: khóa chính của phương án.
- `question_id`: khóa ngoại liên kết với bảng `school_exam_questions`.
- `option_label`: nhãn phương án như A, B, C, D.
- `option_text`: nội dung phương án trả lời.
- `display_order`: thứ tự hiển thị đáp án.

**6. Bảng `school_exam_question_assets`**

- `asset_id`: khóa chính của tài nguyên.
- `question_id`: khóa ngoại liên kết với bảng `school_exam_questions`.
- `asset_type`: loại tài nguyên như `question_block`, `figure`, `table` hoặc `other`.
- `asset_path`: đường dẫn tới file tài nguyên.
- `caption`: chú thích của tài nguyên nếu có.
- `display_order`: thứ tự hiển thị tài nguyên.

**7. Bảng `student_school_exam_attempts`**

- `attempt_id`: khóa chính của mỗi lần làm bài.
- `user_id`: mã học sinh thực hiện bài làm.
- `school_exam_id`: mã đề thi đã được chọn.
- `variant_code`: mã đề cụ thể nếu có nhiều biến thể.
- `score`: điểm số của bài làm.
- `correct_count`: số câu trả lời đúng.
- `wrong_count`: số câu trả lời sai.
- `skipped_count`: số câu bỏ qua.
- `total_count`: tổng số câu trong bài.
- `started_at`: thời điểm bắt đầu làm bài.
- `completed_at`: thời điểm nộp bài.
- `metadata`: dữ liệu mở rộng phục vụ thống kê và khôi phục trạng thái.

**8. Bảng `student_school_exam_answers`**

- `answer_id`: khóa chính của bản ghi câu trả lời.
- `attempt_id`: khóa ngoại liên kết với bảng `student_school_exam_attempts`.
- `question_number`: số thứ tự câu hỏi.
- `question_type`: loại câu hỏi.
- `selected_answer`: đáp án học sinh đã chọn.
- `correct_answer`: đáp án đúng.
- `is_correct`: trạng thái đúng hoặc sai.
- `question_content`: nội dung câu hỏi tại thời điểm lưu bài.
- `topic`: chuyên đề liên quan.
- `metadata`: thông tin bổ sung phục vụ review bài làm.

**9. Bảng `student_school_exam_ai_messages`**

- `message_id`: khóa chính của tin nhắn AI.
- `attempt_id`: mã lần làm bài liên kết.
- `question_number`: số câu hỏi mà cuộc trao đổi đang tham chiếu.
- `role`: vai trò của tin nhắn, gồm `user`, `assistant` hoặc `system`.
- `content`: nội dung trao đổi.
- `metadata`: thông tin bổ sung của tin nhắn.
- `created_at`: thời gian tạo tin nhắn.

Nhìn chung, mô hình dữ liệu được thiết kế để đáp ứng đồng thời ba mục tiêu: lưu trữ đề thi và câu hỏi có cấu trúc, theo dõi chi tiết quá trình học sinh làm bài, và hỗ trợ việc trò chuyện với AI để giải thích những câu học sinh chưa hiểu.

## 3.3. Triển khai các chức năng chính

### 3.3.1. Chức năng xác thực người dùng

Hệ thống sử dụng Supabase Auth để xử lý đăng ký, đăng nhập, đăng xuất và quản lý phiên người dùng. Trên giao diện, người dùng có thể tạo tài khoản mới bằng email và mật khẩu. Sau khi đăng ký thành công, frontend đồng bộ thông tin cơ bản sang bảng `user_profiles` để phục vụ cho việc phân quyền và quản lý hồ sơ học tập.

Khi đăng nhập, hệ thống hỗ trợ hai cách: đăng nhập bằng email hoặc đăng nhập bằng username. Trong trường hợp người dùng nhập username, frontend gọi hàm `resolve_login_email` trong Supabase để quy đổi sang email tương ứng, sau đó mới thực hiện xác thực bằng Supabase Auth. Sau khi đăng nhập thành công, hệ thống tải thông tin hồ sơ và vai trò người dùng để điều hướng giao diện phù hợp.

Cơ chế phân quyền được xây dựng dựa trên trường `role` trong bảng `user_profiles`. Học sinh được phép truy cập các chức năng học tập như luyện đề, làm bài, xem lịch sử và hỏi đáp với AI. Giáo viên và quản trị viên được cấp thêm quyền nhập đề, cập nhật câu hỏi và quản trị dữ liệu đề thi.

### 3.3.2. Chức năng ôn tập và làm bài thi

Học sinh có thể chọn đề thi trường hoặc nội dung ôn tập từ giao diện luyện tập. Frontend truy vấn danh sách đề thi, cấu trúc đề, câu hỏi, phương án trả lời và tài nguyên minh họa từ Supabase thông qua các service trong `features/practice/`.

Trong quá trình làm bài, hệ thống hỗ trợ các dạng câu hỏi chính:

- Trắc nghiệm nhiều lựa chọn.
- Câu hỏi đúng/sai.
- Câu hỏi trả lời ngắn.

Học sinh có thể chọn đáp án, thay đổi đáp án, di chuyển giữa các câu hỏi và nộp bài sau khi hoàn thành. Đối với bài thi có giới hạn thời gian, giao diện hiển thị đồng hồ đếm ngược để học sinh theo dõi. Trạng thái bài làm được quản lý bởi `exam-runtime-store` và `exam-draft-store`, giúp hệ thống có thể phục hồi dữ liệu trong một số tình huống refresh hoặc tiếp tục phiên đang làm.

Luồng xử lý chính:

`Practice/Exam Page -> Exam Runtime Store -> Supabase Service -> Database`

### 3.3.3. Chức năng chấm điểm, xem kết quả và lưu lịch sử

Sau khi học sinh nộp bài, hệ thống đối chiếu đáp án học sinh với đáp án đúng đã được lưu trong cơ sở dữ liệu. Kết quả được thống kê theo số câu đúng, số câu sai, số câu bỏ qua và điểm tổng kết. Thông tin tổng quan của mỗi lần làm bài được lưu vào bảng `student_school_exam_attempts`, trong khi chi tiết từng câu trả lời được lưu vào bảng `student_school_exam_answers`.

Sau khi dữ liệu được ghi thành công, học sinh có thể xem lại kết quả trên giao diện review. Hệ thống hiển thị chi tiết từng câu, đáp án đã chọn, đáp án đúng và chuyên đề liên quan. Chức năng lịch sử học tập cho phép học sinh xem lại nhiều lần làm bài trước đó, bao gồm tên đề, trường, năm thi, điểm số, thời điểm hoàn thành và nội dung hỏi đáp với AI nếu có.

### 3.3.4. Chức năng hỗ trợ học tập bằng Chatbot AI

Chatbot AI được tích hợp trong phần xem lại bài làm, nhằm giúp học sinh hiểu rõ hơn lý do đúng, sai của từng câu hỏi. Khi học sinh yêu cầu giải thích, frontend gửi dữ liệu tới endpoint:

`POST /api/explain`

Dữ liệu gửi đi bao gồm nội dung câu hỏi, đáp án học sinh đã chọn, đáp án đúng và đường dẫn tới tài liệu tri thức liên quan nếu có. AI Service đọc nội dung từ kho tri thức Markdown, xây dựng prompt phù hợp và gọi Gemini API để sinh câu trả lời.

Ngoài ra, hệ thống còn hỗ trợ phân tích nhóm kiến thức học sinh còn yếu thông qua endpoint:

`POST /api/analyze-weaknesses`

API này nhận danh sách các câu học sinh làm sai, tổng hợp theo chuyên đề và trả về nhận xét ngắn gọn về các nội dung cần ôn tập thêm. Trong quá trình review, lịch sử hỏi đáp với AI được lưu vào bảng `student_school_exam_ai_messages`, nhờ đó học sinh có thể xem lại các giải thích trước đây.

Luồng xử lý chính:

`Review Page -> FastAPI AI Service -> Knowledge Base -> Gemini API -> Review Page`

### 3.3.5. Chức năng quản trị dữ liệu đề thi

Chức năng quản trị dữ liệu đề thi dành cho giáo viên hoặc quản trị viên. Người quản trị có thể thêm đề thi mới, tải file PDF, kiểm tra nội dung do AI trích xuất, chỉnh sửa câu hỏi, cập nhật đáp án và lưu dữ liệu vào Supabase.

Hệ thống hỗ trợ quy trình nhập đề thi từ file PDF. Người quản trị tải file lên kèm theo các thông tin như tên trường, tỉnh thành, môn học, năm thi, mã đề và thời gian làm bài. Frontend gửi dữ liệu đến AI Service qua endpoint:

`POST /api/admin/import-exam-pdf/validate`

AI Service sử dụng Gemini API kết hợp với xử lý text/PDF để trích xuất metadata đề thi, phần đề, câu hỏi, đáp án, tài nguyên minh họa và các cảnh báo nếu dữ liệu chưa hợp lệ. Sau khi xử lý, hệ thống trả về cấu trúc dữ liệu để người quản trị kiểm tra và chỉnh sửa trước khi lưu vào các bảng `school_exams`, `school_exam_sections`, `school_exam_questions`, `school_exam_question_options` và `school_exam_question_assets`.

Ngoài ra, hệ thống còn có các chức năng hỗ trợ như:

- Kiểm tra nội dung đề thi dạng text qua `POST /api/admin/validate-exam`.
- Chuẩn hóa câu hỏi và đáp án trước khi import.
- Gán chuyên đề cho câu hỏi thông qua dữ liệu tri thức và endpoint backfill.
- Quản lý danh sách đề thi đã nhập, cập nhật trạng thái kích hoạt và xóa đề thi khi cần.

## 3.4. Kết quả giao diện thực tế

Dưới đây là một số giao diện thực tế của hệ thống, bao gồm giao diện đăng nhập, giao diện học sinh và giao diện quản trị. Khi đưa vào báo cáo Word, có thể chèn ảnh chụp màn hình từ ứng dụng thực tế vào đúng vị trí các chú thích hình dưới đây.

### 3.4.1. Giao diện thực tế của trang Đăng nhập và Đăng ký

Giao diện đăng nhập và đăng ký được thiết kế đơn giản, tập trung vào các trường thông tin cần thiết như họ tên, email, username và mật khẩu. Sau khi đăng nhập thành công, hệ thống điều hướng người dùng đến khu vực chức năng tương ứng với vai trò của tài khoản.

`Hình 3.1. Giao diện Đăng ký`

`Hình 3.2. Giao diện Đăng nhập`

### 3.4.2. Giao diện thực tế của Admin

Giao diện Admin hỗ trợ giáo viên hoặc quản trị viên quản lý dữ liệu đề thi. Các chức năng chính gồm nhập đề thi, tải file PDF, xem kết quả AI phân tích, chỉnh sửa metadata, quản lý câu hỏi và lưu đề thi vào hệ thống.

`Hình 3.3. Giao diện nhập đề thi`

`Hình 3.4. Giao diện kiểm tra dữ liệu đề thi`

`Hình 3.5. Giao diện quản lý câu hỏi`

### 3.4.3. Giao diện thực tế của User

Giao diện User dành cho học sinh bao gồm các chức năng luyện tập, chọn đề thi trường, làm bài thi, xem kết quả, xem lịch sử học tập, cập nhật hồ sơ và sử dụng Chatbot AI để giải thích câu hỏi.

`Hình 3.6. Giao diện trang tổng quan`

`Hình 3.7. Giao diện luyện tập`

`Hình 3.8. Giao diện làm bài thi`

`Hình 3.9. Giao diện kết quả bài làm`

`Hình 3.10. Giao diện lịch sử học tập`

`Hình 3.11. Giao diện Chatbot AI giải thích câu hỏi`

## 3.5. Kiểm thử và đánh giá hệ thống

Sau khi xây dựng các chức năng chính, hệ thống được kiểm thử nhằm đảm bảo hoạt động đúng theo yêu cầu đặt ra. Quá trình kiểm thử tập trung vào những luồng nghiệp vụ quan trọng nhất của hệ thống, bao gồm xác thực người dùng, làm bài thi, chấm điểm, lưu lịch sử, hỏi đáp với AI và quản trị dữ liệu đề thi.

Một số nội dung kiểm thử chính gồm:

- Kiểm thử đăng ký, đăng nhập và phân quyền người dùng.
- Kiểm thử hiển thị danh sách đề thi, nội dung câu hỏi, đáp án và tài nguyên minh họa.
- Kiểm thử thao tác chọn đáp án, đổi đáp án, điều hướng giữa các câu hỏi và nộp bài.
- Kiểm thử kết quả chấm điểm, số câu đúng, sai và bỏ qua.
- Kiểm thử lưu lịch sử làm bài và xem lại chi tiết bài làm.
- Kiểm thử chức năng Chatbot AI giải thích câu hỏi.
- Kiểm thử chức năng phân tích điểm yếu học tập.
- Kiểm thử chức năng nhập đề thi từ file PDF.
- Kiểm thử chức năng quản lý câu hỏi, đáp án và tài nguyên đề thi.

Kết quả kiểm thử cho thấy hệ thống đáp ứng được các chức năng cơ bản của một phần mềm ôn tập và luyện đề THPTQG có tích hợp AI. Học sinh có thể đăng nhập, chọn đề, làm bài, xem kết quả, lưu lịch sử và nhận hỗ trợ giải thích từ Chatbot AI. Giáo viên và quản trị viên có thể nhập đề thi, kiểm tra dữ liệu bằng AI và quản lý ngân hàng câu hỏi trên cùng một hệ thống.

Tuy nhiên, hệ thống vẫn còn một số hạn chế. Số lượng đề thi và dữ liệu minh họa hiện tại chưa thật sự phong phú cho mọi môn học. Chất lượng phản hồi của Chatbot AI vẫn phụ thuộc vào chất lượng dữ liệu đầu vào, kho tri thức và tính ổn định của Gemini API. Trong thời gian tới, hệ thống cần tiếp tục bổ sung kho đề thi, mở rộng kho tri thức, tối ưu giao diện và kiểm thử với nhiều người dùng hơn để đánh giá độ ổn định trong điều kiện vận hành thực tế.
