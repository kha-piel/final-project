# Java Web Parity

## Muc tieu

Tai lieu nay dong vai tro la moc kiem soat cho Buoc 10:
- doi chieu behavior giua app Java hien tai va web app moi
- danh dau phan nao da parity
- ghi ro phan nao moi dat partial parity
- chot dieu kien truoc khi coi web la ban chinh

Tai lieu nay khong thay the [current-flows.md](/abs/path/c:/Users/ADMIIN/VScode/final-project/docs/current-flows.md).
`current-flows.md` mo ta app Java dang hoat dong the nao.
Tai lieu nay tra loi cau hoi: web da theo sat den muc nao.

## Pham vi doi chieu

Flow doi chieu trong dot nay:
1. Dang ky
2. Dang nhap
3. Dang xuat
4. Home
5. Dashboard on tap
6. Chon mon/chuyen de/do kho
7. Tao de va bat dau thi
8. Chon dap an
9. Kiem tra dung sai
10. Goi AI khi chon sai
11. Chuyen cau
12. Nop bai
13. Xem tong ket va review

Ngoai pham vi parity dot nay:
- ho so hoc sinh day du
- lich su lam bai that tu DB cloud
- bookmark that
- card `Lam bai thi thu` rieng

## Bang parity hien tai

| Flow | Java hien tai | Web hien tai | Trang thai |
|---|---|---|---|
| Dang ky | WebView auth + Supabase Auth + co gang upsert `user_profiles` | React auth page + Supabase Auth + upsert `user_profiles` | Parity |
| Dang nhap | Co the dang nhap qua identity, nhung auth cuoi van di qua Supabase email/password | Dang nhap bang email hoac username, resolve qua RPC roi auth bang `supabase-js` | Parity |
| Dang xuat | Quay lai man auth trong process JavaFX | Xoa session Supabase client va quay ve route public | Parity |
| Home | Hien user + cac card, trong do nhanh thuc su la `On tap kien thuc` | Da co home page va dieu huong den dashboard | Parity |
| Dashboard load du lieu | Subject/topic tu DB, history tu `StudentAttemptDAO` | Subject/topic tu Supabase, history attempts tu Supabase | Parity |
| Chon mon/chuyen de/do kho | Co | Co | Parity |
| Tao de va bat dau thi | Lay cau hoi, shuffle, tao exam session, vao man thi | Lay cau hoi, tao draft session, vao exam route | Parity |
| Chon dap an | Co | Co | Parity |
| Kiem tra dung sai | Co feedback, khoa cau, auto-next | Co feedback, khoa cau, auto-next | Parity |
| Goi AI khi chon sai | Goi Python AI service, day chat history | Goi AI backend qua HTTP, day chat history | Parity |
| Chat hoi them | Co | Co | Parity |
| Chuyen cau | Co prev/next, giu state | Co prev/next, giu state | Parity |
| Nop bai | Co ket thuc bai va tong ket | Co submit va persist `student_attempts`, `attempt_answers`, sau do sang review | Parity |
| Tong ket/review | Co tong ket app Java | Co tong ket, diem, dung/sai/bo qua, review tung cau, explanation cache, doc lai duoc tu Supabase | Parity |

## Diem da parity tot

### 1. Core learning flow da di thong tu dau den cuoi
Web hien tai da di duoc full flow:
- login
- home
- dashboard
- tao de
- lam bai
- kiem tra dap an
- AI giai thich
- nop bai
- review

Day la moc quan trong nhat cua dot migration.

### 2. Logic kiem tra dap an da gan voi Java
Behavior da khop:
- phai chon dap an truoc khi check
- sau khi check thi khoa cau hoi
- tra loi sai thi AI duoc moi vao
- sau khi check thi tu chuyen sang cau tiep theo neu con

### 3. Chat AI da duoc dua vao session web
Behavior da khop muc tieu migration:
- co system prompt khi tra loi sai
- co chat hoi them
- lich su chat song theo exam session
- explanation co the duoc dung lai o review

## Diem con lech giua Java va Web

### 2. Session thi tren web da co resume local va cloud
Java desktop giu state trong process app.
Web hien tai:
- giu draft/runtime session trong `localStorage`
- dong bo `in_progress attempt` len Supabase trong luc dang lam
- co the khoi phuc bai dang lam tu cloud vao web session
- co the khoi phuc lai core chat AI cua attempt dang lam

Tac dong:
- refresh cung trinh duyet van co the quay lai bai dang lam
- dashboard web da co muc `Bai dang lam do`
- dashboard web da co muc `Bai dang lam tren cloud`
- co the resume tren trinh duyet/thiet bi khac neu cung user va du lieu Supabase con do

## Ket luan trang thai Buoc 10

Neu danh gia theo hai lop:

### Parity ve flow nguoi dung
- Dat muc tot
- Web da cover duoc core flow chinh cua du an

### Parity ve persistence va san sang cat Java
- Dat muc kha
- Da co lop luu attempts, answers va history that
- Da co resume local khi reload cung trinh duyet
- Da co resume `in_progress attempt` tu cloud
- Da co cloud chat context co ban cho attempt dang lam
- Con thieu mot so flow phu va can test thuc chien de chot cat Java

Vi vay:
- web da du tot de tiep tuc phat trien va test song song
- chua nen cat bo app Java ngay

## Checklist test song song

Moi khi muon so sanh Java/Web, test theo thu tu nay:

1. Dang ky tai khoan moi
- Java dang ky duoc
- Web dang ky duoc
- profile co trong `user_profiles`

2. Dang nhap
- dang nhap bang email tren web
- dang nhap bang flow hien tai tren Java
- cung vao duoc dashboard

3. Dashboard
- subject load dung
- topic phu thuoc subject load dung
- difficulty mapping dung

4. Tao de
- cung topic + difficulty
- co lay duoc question list
- thu tu cau/thu tu dap an co shuffle

5. Lam bai
- chon dap an
- check dung
- check sai
- khoa cau
- auto-next
- prev/next giu selection

6. AI
- sai cau hoi thi AI duoc goi
- gui cau hoi them duoc
- lich su chat hien dung

7. Nop bai
- co tong ket
- diem tinh dung
- dung/sai/bo qua dung
- review tung cau dung
- dashboard hien lai duoc attempt vua luu

## Dieu kien truoc khi cat Java khoi core flow

Can dat it nhat 4 dieu kien nay:

1. Refresh browser sau submit van xem lai duoc review
2. Dashboard web load duoc history that on dinh voi du lieu that
3. Test song song Java/Web cho core flow on tap khong con sai lech nghiem trong
4. RPC auth identity va policy Supabase phai duoc apply dung tren moi environment

## Khuyen nghi buoc tiep theo sau Buoc 10

Neu giu dung lo trinh an toan, buoc tiep theo nen la:
- them dashboard/history/review polish va test thuc chien
- toi uu bundle web va tach chunk
- sau do moi tinh den cat bo Java o flow on tap chinh
