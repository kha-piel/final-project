# Data Mapping

## Muc tieu

Tai lieu nay chot hien trang du lieu cua app Java hien tai va mapping sang schema dich cho web-first tren Supabase/Postgres.

No tra loi 4 cau hoi:
- Hien tai app dang doc/ghi du lieu o dau?
- Schema nao dang la runtime truth?
- Schema dich cho web la gi?
- Se migrate theo thu tu nao de it rui ro nhat?

## Ket luan nhanh

### Runtime truth hien tai
- Auth: `Supabase Auth`
- Du lieu nghiep vu thi/on tap: `SQLite local`
- Schema runtime cho SQLite: `database/schema.sql`
- Bootstrapping runtime: `src/main/java/org/example/util/DatabaseInitializer.java`

### Target truth cho web
- Auth: `Supabase Auth`
- Tat ca du lieu nghiep vu: `Supabase Postgres`
- Schema dich can chot ve sau trong `supabase/schema.sql`

### Ket luan quan trong
App hien tai dang o mo hinh hybrid:
- Auth da o cloud
- Question bank, exam, attempts van o local DB

Muon len web thi phai ket thuc mo hinh hybrid nay.

## Nguon du lieu hien tai theo lop

### 1. Auth va profile

#### Auth
- `SupabaseAuthService.java`
- dung `SUPABASE_URL` va `SUPABASE_ANON_KEY`
- goi REST API Supabase Auth cho:
  - sign up
  - sign in

#### User profile
- `UserDAO.java`
- query bang `public.user_profiles`
- model `User.java` da co `UUID userId`

#### Danh gia
- lop auth/profile dang di theo huong Supabase/Postgres
- day la phan gan voi dich web nhat

### 2. Question bank va exam data

#### Runtime connection
- `DatabaseConnection.java`
- hien tai mo file SQLite local `data/thptqg_ai.db`

#### Runtime schema init
- `DatabaseInitializer.java`
- load `database/schema.sql`
- seed de mac dinh va mot so question/topic/answer mau

#### DAOs dang doc tu SQLite
- `SubjectDAO`
- `TopicDAO`
- `QuestionDAO`
- `AnswerDAO`
- `ExamDAO`
- `StudentAttemptDAO`

#### Danh gia
- day la phan bat buoc phai migrate sang cloud data neu muon co web app that

## Schema runtime hien tai: SQLite

Schema runtime hien tai nam o `database/schema.sql`.

### Bang hien co trong SQLite
- `users`
- `user_profiles`
- `subjects`
- `topics`
- `questions`
- `answers`
- `exams`
- `exam_questions`
- `student_attempts`
- `chat_sessions`
- `chat_messages`

### Ghi chu
- App hien tai khong dung het toan bo schema.
- Co bang ton tai tren schema nhung runtime flow hien tai chua persist het.
- Vi du:
  - chat AI hien tai chu yeu o memory state trong `ExamController`
  - chua thay ghi `chat_sessions`/`chat_messages` trong flow chinh

## Runtime usage that su theo code

### Auth/Profile

#### `public.user_profiles`
Dang duoc `UserDAO` dung cho:
- tim user theo identity
- tim user theo `user_id`
- dong bo profile sau sign up

#### `users`
- ton tai trong SQLite schema
- duoc `DatabaseInitializer` migrate sang `user_profiles`
- nhung flow auth moi dang khong dua vao bang nay lam truth chinh

### Subject/Topic

#### `subjects`
Dung boi:
- `SubjectDAO`
- `DashboardController`

#### `topics`
Dung boi:
- `TopicDAO`
- `DashboardController`

### Question/Answer

#### `questions`
Dung boi:
- `QuestionDAO`
- `DashboardController`
- `ExamController`

Cot dang duoc su dung ro rang:
- `question_id`
- `topic_id`
- `content`
- `level` hoac fallback `difficulty`
- `obsidian_source_path`
- `explanation` co doc neu co

#### `answers`
Dung boi:
- `AnswerDAO`
- `QuestionDAO`
- `ExamController`

Cot dang duoc su dung ro rang:
- `answer_id`
- `question_id`
- `option_label`
- `content`
- `is_correct`
- `explanation`
- `display_order`

### Exam

#### `exams`
Dung boi:
- `ExamDAO`
- `ExamController`
- `StudentAttemptDAO` khi join lich su

Cot dang duoc su dung ro rang:
- `exam_id`
- `title`
- `description`
- `subject_id`
- `exam_type`
- `duration`
- `total_questions`
- `pass_score`
- `shuffle_answers`
- `shuffle_questions`
- `is_public`

#### `exam_questions`
Dung boi:
- `ExamDAO`
- `DatabaseInitializer`

Cot dang duoc su dung ro rang:
- `exam_id`
- `question_id`
- `question_order`
- `point_weight`

### Attempt

#### `student_attempts`
Dung boi:
- `StudentAttemptDAO`
- `DashboardController`
- `ExamController`

Cot dang duoc su dung ro rang:
- `attempt_id`
- `user_id`
- `exam_id`
- `score`
- `correct_count`
- `wrong_count`
- `skipped_count`
- `total_time_taken`
- `status`
- `started_at`
- `completed_at`
- `ai_feedback`

### Chat persistence

#### `chat_sessions`, `chat_messages`
- co trong SQLite schema
- nhung flow exam moi hien tai chua ghi ra DB
- `ExamController` chi luu chat trong memory:
  - `chatHistory`
  - `aiExplanationsMap`

#### Ket luan
- 2 bang chat hien chua la runtime truth cua flow chinh
- khi len web, co the:
  - bo qua o dot dau
  - hoac thiet ke lai sau khi exam flow da on

## Schema dich hien co trong repo

Repo da co file:
- `database/supabase_schema.sql`

Danh gia:
- day la draft dich tot
- phu hop lam nen cho web migration
- nhung chua phai vi tri canonical moi cho qua trinh chuyen doi

## Khac biet giua SQLite runtime va Supabase target

### 1. ID strategy

#### Hien tai
- SQLite dung `INTEGER AUTOINCREMENT`
- nhieu DAO/model van nghi theo `int`

#### Dich
- Supabase/Postgres nen dung `uuid`
- `User.java` da bat dau theo huong nay o profile

#### Tac dong
- web app phai coi `uuid` la truth moi
- Java app cu se can bo qua hoac adapter neu con song song

### 2. User model

#### Hien tai
- SQLite co ca `users` va `user_profiles`
- Supabase auth da ton tai rieng

#### Dich
- bo bang `users` noi bo theo kieu SQLite
- chi giu:
  - `auth.users` cua Supabase
  - `public.user_profiles`

### 3. Bool va enum

#### Hien tai
- SQLite dung `INTEGER 0/1`
- enum bang `CHECK (...)`

#### Dich
- Postgres dung:
  - `boolean`
  - enum type that

### 4. Timestamps

#### Hien tai
- `TEXT datetime(...)`

#### Dich
- `timestamptz`

### 5. Attempt detail

#### Hien tai
- `student_attempts` luu tong hop
- chua co bang answer-per-attempt runtime that

#### Dich
- can co `attempt_answers`
- vi web can:
  - review chi tiet
  - analytics
  - resume/trace behavior

### 6. Chat persistence

#### Hien tai
- chat exam session dang o memory

#### Dich
- co the giu in-memory o dot 1 cua web
- ve sau persist vao `chat_sessions` / `chat_messages` neu can

## Mapping bang hien tai sang dich

### Nhom User
- `SQLite.users` -> khong migrate 1:1 lam truth dich
- `SQLite.user_profiles` -> `public.user_profiles`
- `Supabase auth.users` -> nguon auth chinh

### Nhom Subject/Topic
- `SQLite.subjects` -> `public.subjects`
- `SQLite.topics` -> `public.topics`

### Nhom Question Bank
- `SQLite.questions` -> `public.questions`
- `SQLite.answers` -> `public.answers`

### Nhom Exam
- `SQLite.exams` -> `public.exams`
- `SQLite.exam_questions` -> `public.exam_questions`

### Nhom Attempt
- `SQLite.student_attempts` -> `public.student_attempts`
- runtime derived selections hien tai -> `public.attempt_answers`

### Nhom Chat
- `SQLite.chat_sessions` -> `public.chat_sessions`
- `SQLite.chat_messages` -> `public.chat_messages`

Luu y:
- Trong dot migration dau, chat co the chua can import neu du lieu chat hien tai khong phai truth can bao ton.

## Bang can coi la canonical cho web migration

Tu Bước 3 tro di, can coi canonical target schema la:
- `supabase/schema.sql`

File `database/supabase_schema.sql` la draft tham chieu tu lich su repo.

## Quyet dinh migration ve du lieu

### Dot 1: Core tables bat buoc
- `user_profiles`
- `subjects`
- `topics`
- `questions`
- `answers`
- `exams`
- `exam_questions`
- `student_attempts`

### Dot 2: Tables mo rong
- `attempt_answers`
- `chat_sessions`
- `chat_messages`
- `bookmarks` neu co thiet ke sau

## Thu tu migrate de xuat

1. Tao schema dich tren Supabase/Postgres.
2. Migrate `subjects`.
3. Migrate `topics`.
4. Migrate `questions`.
5. Migrate `answers`.
6. Migrate `exams`.
7. Migrate `exam_questions`.
8. Chuan hoa va migrate `user_profiles`.
9. Migrate `student_attempts`.
10. Sinh `attempt_answers` neu co du lieu nguon du.

## Rui ro can ghi nho

### 1. User IDs khac he quy chieu
- SQLite user cu la `int`
- Supabase auth/profile la `uuid`

### 2. DAOs hien tai van phu thuoc `int`
- `SubjectDAO`, `TopicDAO`, `QuestionDAO`, `StudentAttemptDAO` dang map theo `int`
- khi web-first bat dau, khong nen keo logic `int` nay sang thang TypeScript

### 3. Chat persistence hien tai khong day du
- khong nen gia dinh chat DB la du lieu that de import

### 4. `database/schema.sql` co nhieu bang phong hon runtime thuc te
- can uu tien theo code dang goi den

## Output cua Buoc 3

Sau buoc nay, ta da chot:
- schema runtime truth hien tai la SQLite
- auth truth hien tai la Supabase
- schema dich cho web la Supabase/Postgres
- danh sach bang core can migrate truoc
- ID strategy dich la `uuid`

## Pham vi chot cho Buoc 4

Buoc tiep theo co the bat dau dung web skeleton ma khong mo ho ve data strategy nua.
Nhung truoc khi code data layer that, can co:
- `supabase/schema.sql`
- `supabase/migration-plan.md`
