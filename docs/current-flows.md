# Current Flows

## Muc tieu tai lieu

Tai lieu nay dong bang cac luong nguoi dung hien co trong du an Java hien tai truoc khi chuyen dan sang web.

Nguyen tac:
- Mo ta theo behavior trong code hien tai.
- Tach ro luong dang su dung va luong cu con ton tai trong repo.
- Ghi ro phu thuoc du lieu, auth, AI va cac cho chua hoan thien.

## Tong quan kien truc hien tai

Du an hien tai dang o trang thai lai giua:
- JavaFX cho app desktop.
- WebView + HTML/CSS/JS cho man auth.
- Supabase Auth cho dang ky/dang nhap.
- SQLite local cho du lieu on tap va de thi.
- Python AI service thong qua `AiServiceClient`.

Duong chinh hien tai:
1. `MainApp`
2. `auth/auth.html` trong `WebView`
3. `HomeView`
4. `DashboardView` + `DashboardController`
5. `ExamExecutionView` + `ExamController`
6. `ReviewSummaryView`

Luong cu van con trong repo nhung khong phai duong chinh hien tai:
- `QuizController`
- `ExamView`
- `ResultView`

## Nguon su that theo module

### Auth
- UI: `src/main/resources/auth/auth.html`, `auth-app.js`, `style.css`
- Bridge vao Java: `MainApp.AuthBridge`
- Auth service: `src/main/java/org/example/service/SupabaseAuthService.java`
- User profile DAO: `src/main/java/org/example/dao/UserDAO.java`

### Home va Dashboard
- Home: `src/main/java/org/example/ui/HomeView.java`
- Dashboard UI: `src/main/java/org/example/ui/DashboardView.java`
- Dashboard logic: `src/main/java/org/example/controller/DashboardController.java`

### Thi va on tap
- Exam UI moi: `src/main/java/org/example/ui/ExamExecutionView.java`
- Exam logic moi: `src/main/java/org/example/controller/ExamController.java`
- Tong ket moi: `src/main/java/org/example/ui/ReviewSummaryView.java`

### Data local
- Ket noi DB: `src/main/java/org/example/util/DatabaseConnection.java`
- Cau hoi/dap an: `QuestionDAO`, `AnswerDAO`
- Mon hoc/chuyen de: `SubjectDAO`, `TopicDAO`
- Lich su lam bai: `StudentAttemptDAO`

## Luong 1: Dang ky tai khoan

### Entry point
- Nguoi dung mo app.
- `MainApp` render `WebView` va load `/auth/auth.html`.
- JS tren trang auth goi `window.javaBridge.register(...)`.

### Validation hien tai
Trong `MainApp.handleRegister(...)`:
- Ho ten phai co it nhat 2 ky tu.
- Email phai dung regex email.
- Mat khau phai:
  - toi thieu 8 ky tu
  - co it nhat 1 chu hoa
  - co it nhat 1 ky tu dac biet
- Xac nhan mat khau phai trung khop.
- App phai co `SUPABASE_URL` va `SUPABASE_ANON_KEY`.

### Xu ly backend hien tai
1. Tao `User` tam.
2. Goi `SupabaseAuthService.signUp(...)`.
3. Neu Supabase tra ve `userId` va `email`, cap nhat lai `User`.
4. Neu `userDAO` san sang, ghi profile vao `public.user_profiles`.

### Ket qua
- Thanh cong:
  - hien thong bao dang ky thanh cong.
  - neu project Supabase bat confirm email, user phai xac thuc email truoc khi dang nhap.
- That bai:
  - hien loi validate hoac loi Supabase.
  - co xu ly mot so thong diep loi auth sang tieng Viet.

### Phu thuoc
- Supabase Auth
- `user_profiles` tren DB profile

## Luong 2: Dang nhap

### Entry point
- JS auth goi `window.javaBridge.login(identity, password)`.

### Validation hien tai
Trong `MainApp.handleLogin(...)`:
- bat buoc nhap tai khoan/email va mat khau
- bat buoc da cau hinh Supabase Auth

### Xu ly hien tai
Trong `MainApp.authenticateUser(...)`:
1. Neu `userDAO` san sang:
   - thu dang nhap qua `UserDAO.authenticate(identity, password)`.
   - `UserDAO` tim profile theo username/email.
   - neu tim thay profile, dung email profile de goi `SupabaseAuthService.signIn(...)`.
2. Neu `userDAO` khong san sang:
   - chi chap nhan dang nhap bang email.
   - goi thang `SupabaseAuthService.signIn(...)`.
3. Neu auth thanh cong ma co `userId`:
   - thu doc profile tu `findByUserId(...)`.
   - neu khong doc duoc thi tao `auth-only user`.

### Ket qua
- Thanh cong:
  - tao `currentUser`
  - chuyen sang `HomeView`
- That bai:
  - hien thong diep loi auth tren man login

### Luu y
- Session Supabase hien tai khong duoc quan ly nhu app web thuần.
- Trang thai dang nhap hien tai song trong process JavaFX.

## Luong 3: Trang chu sau dang nhap

### UI hien tai
`HomeView` hien:
- ten user
- nut `Dang xuat`
- 4 card tinh nang:
  - `Lam bai thi thu`
  - `On tap kien thuc`
  - `Ho so hoc sinh`
  - `Lich su lam bai`

### Behavior hien tai
- `Dang xuat`: quay ve man auth.
- `On tap kien thuc`: mo `DashboardView`.
- `Lam bai thi thu`: hien `Thong bao - Tinh nang dang duoc phat trien!`
- `Ho so hoc sinh`: chua lam
- `Lich su lam bai`: chua lam

### Ket luan
Trong duong chinh hien tai, home chi co 1 nhanh thuc su hoat dong:
- `On tap kien thuc`

## Luong 4: Dashboard on tap kien thuc

### Entry point
- Tu `HomeView.openDashboard()`

### UI hien tai
`DashboardView` gom:
- nut quay lai trang chu
- combo mon hoc
- combo chuyen de
- combo do kho
- nut `Tao de & Bat dau thi`
- bang lich su lam bai

### Data load hien tai
Trong `DashboardController.loadData()`:
- load danh sach mon hoc tu `SubjectDAO`
- load lich su lam bai tu `StudentAttemptDAO.getHistoryByUserId(currentUserId)`

### Tuong tac hien tai
1. Chon mon hoc:
   - load lai danh sach chuyen de theo mon.
2. Chon chuyen de + do kho.
3. Bam `Tao de & Bat dau thi`.

### Rule tao de hien tai
Trong `DashboardController.handleStartCustomExam()`:
- bat buoc chon day du mon hoc, chuyen de, do kho
- lay cau hoi theo:
  - `topicId`
  - `difficulty`
- neu khong co cau hoi thi bao loi
- shuffle:
  - shuffle danh sach cau hoi
  - shuffle dap an tung cau
- tao `ExamController`
- goi `startCustomExam(...)`
- chuyen sang `ExamExecutionView`

### Cau hinh de hien tai
- de tu chon
- thoi gian: 45 phut
- title theo mon/chuyen de/do kho

## Luong 5: Lam bai tren ExamExecutionView

### Entry point
- tu dashboard sau khi tao de thanh cong

### UI hien tai
Man hinh chia 2 cot:
- trai:
  - so thu tu cau
  - dem nguoc thoi gian
  - noi dung cau hoi
  - 4 lua chon
  - thong bao feedback
  - nut `Kiem tra dap an`
  - nut `Cau truoc`
  - nut `Cau tiep theo`
  - nut `Nop bai`
- phai:
  - chat AI
  - lich su chat
  - o nhap cau hoi them

### State hien tai
`ExamController` giu:
- `examQuestions`
- `studentSelections`
- `lockedQuestionIds`
- `chatHistory`
- `aiExplanationsMap`
- `examStartTime`
- `examInProgress`

### Behavior chon dap an
- Khi user tick radio:
  - chua luu ngay lap tuc
  - luu khi:
    - bam `Kiem tra dap an`
    - bam `Cau truoc`
    - bam `Cau tiep theo`

### Behavior kiem tra dap an
Trong `ExamExecutionView.handleCheckAnswer()`:
1. Luu lua chon hien tai.
2. Goi `examController.checkAnswer(currentIndex)`.
3. Neu chua chon dap an:
   - hien thong bao yeu cau chon dap an.
4. Neu chon dung:
   - khoa cau hoi hien tai
   - hien thong bao dung
   - tu dong chuyen sang cau tiep theo neu con
5. Neu chon sai:
   - khoa cau hoi hien tai
   - them system prompt vao chat history
   - goi AI de giai thich
   - tu dong chuyen sang cau tiep theo neu con

### Rule khoa cau hoi
Sau khi kiem tra:
- cau hoi bi khoa
- dap an khong doi duoc nua
- nut `Kiem tra dap an` bi disable

### Chat AI hien tai
Co 2 cach:
1. Tu dong khi user chon sai
2. Thu cong khi user nhap cau hoi them

Payload AI duoc tao tu:
- noi dung cau hoi
- lua chon hien tai cua hoc sinh
- dap an dung
- obsidian source path neu co

### Chat history hien tai
- duoc giu xuyen suot trong ca bai
- khong reset khi chuyen cau
- message role gom:
  - `SYSTEM`
  - `USER`
  - `AI`

### Timer hien tai
- dem nguoc theo giay
- het gio thi auto `submitExam()`

## Luong 6: Nop bai va tong ket

### Entry point
- user bam `Nop bai`
- hoac het gio

### Xu ly hien tai
Trong `ExamController.submitExam()`:
- dem so cau dung
- dem so cau sai
- dem so cau bo qua
- tinh diem thang 10
- tinh thoi gian lam bai
- neu co `StudentAttemptDAO`:
  - cap nhat ket qua vao `student_attempts`

### Output hien tai
`ExamResult` chua:
- ten de
- diem
- so cau dung
- so cau sai
- so cau bo qua
- tong so cau
- thoi gian lam bai
- thoi luong de
- trang thai dat/chua dat

## Luong 7: ReviewSummaryView sau nop bai

### Entry point
- man tong ket duoc mo sau khi submit theo flow moi

### UI hien tai
- tieu de tong ket
- thong tin tong quan diem/dung/sai/bo qua
- danh sach tung cau

Moi card cau hoi hien:
- noi dung cau
- dap an user da chon
- dap an dung
- nut danh dau cau hoi
- nut xem lai giai thich AI

### Behavior hien tai
- `Xem lai giai thich AI`:
  - mo/thu gon explanation da luu trong `aiExplanationsMap`
- `Danh dau cau hoi`:
  - hien tai moi chi la UI
  - `saveBookmark(...)` dang la TODO
- `Quay lai khu On tap`:
  - quay ve scene dashboard truoc do

## Luong 8: Lich su lam bai

### Hien dang hoat dong o muc nao
- Dashboard co bang lich su
- data den tu `StudentAttemptDAO.getHistoryByUserId(...)`

### Hien dang chua co
- chua co man chi tiet lich su rieng
- chua co luong click vao 1 dong lich su de xem lai bai

## Luong 9: Dang xuat

### Entry point
- tu `HomeView`

### Hanh vi
- xoa `currentUser`
- clear auth form tren WebView
- hien lai login form
- quay ve `loginScene`

### Luu y
- khong thay co revoke session Supabase ro rang
- chu yeu la reset state phia app

## Luong cu/legacy con ton tai trong repo

### Nhan dien
Nhung class sau van ton tai:
- `QuizController`
- `ExamView`
- `ResultView`

### Muc dich hien tai
- doan code cu cho flow thi kieu truoc
- khong phai flow chinh duoc `HomeView -> DashboardController` goi hien nay

### Tac dong den ke hoach chuyen web
Khi chuyen sang web, khong nen map theo luong cu nay lam su that chinh.
Luong can uu tien giu la:
- `MainApp` auth
- `HomeView`
- `DashboardController`
- `ExamController`
- `ExamExecutionView`
- `ReviewSummaryView`

## Diem can ghi nho cho buoc chuyen web

### 1. Auth va data hien dang tach doi
- Auth dang dua vao Supabase.
- Du lieu on tap/de thi dang dua vao SQLite local.
- Day la diem can thay doi kien truc lon nhat khi len web.

### 2. Co 2 exam flow song song trong repo
- Phai chot flow moi la flow chinh.
- Khong port nham `QuizController/ExamView/ResultView`.

### 3. Nhieu tinh nang home moi la placeholder
- `Lam bai thi thu`
- `Ho so hoc sinh`
- `Lich su lam bai`

### 4. Bookmark chua co backend that
- UI co roi.
- logic luu bookmark chua co.

### 5. AI hien dang la service rieng
- Web sau nay nen di qua API/server layer an toan.

## Pham vi chot cho Buoc 2

Luong can giu nguyen khi chuyen sang web:
1. Dang ky
2. Dang nhap
3. Dang xuat
4. Vao home
5. Vao dashboard on tap
6. Chon mon/chuyen de/do kho
7. Tao de va bat dau lam bai
8. Chon dap an
9. Kiem tra dung/sai
10. Goi AI khi chon sai
11. Chuyen cau
12. Nop bai
13. Xem tong ket va giai thich AI da luu

Luong chua can coi la core cho dot migration dau:
- Ho so hoc sinh
- Lich su chi tiet
- Bookmark that
- Lam bai thi thu card rieng
