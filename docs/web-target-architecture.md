# Web Target Architecture

## Muc tieu

Tai lieu nay chot kien truc web-first cho qua trinh chuyen du an Java hien tai sang web theo tung buoc, trong khi van giu duoc cac luong da dong bang trong [current-flows.md](/abs/path/c:/Users/ADMIIN/VScode/final-project/docs/current-flows.md).

Nguyen tac:
- Khong rewrite mot lan.
- Web moi va app Java cu song song trong thoi gian chuyen doi.
- Flow chinh can giu la flow moi:
  - auth
  - home
  - dashboard on tap
  - exam execution
  - review summary
- Kien truc duoc chot mot lan de cac buoc sau khong doi stack giua chung.

## Ket luan kien truc

Huong chon:
- Web-first application rieng trong thu muc `web-app/`
- Frontend: `React + TypeScript + Vite`
- Routing: `react-router-dom`
- State mỏng o UI, state nghiep vu tach rieng theo feature
- Data + auth: `Supabase`
- AI: khong goi truc tiep tu browser, di qua server layer
- Desktop sau nay: dong goi web app bang `Tauri` hoac `Electron`, uu tien `Tauri`

## Tai sao chon huong nay

### 1. Phu hop voi flow hien tai
Flow auth hien tai da co thanh phan web nhung dang nam trong `WebView`.
Chuyen sang React web la buoc tiep noi tu nhien nhat.

### 2. Tach rieng UI va nghiep vu de giam rui ro
Phan thi/on tap hien tai co nghiep vu kha ro trong `ExamController`.
Len web can giu nghiep vu nay trong module thuần TypeScript, khong de dinh chat vao component.

### 3. Giu duong cho desktop app sau nay
Neu lam dung web-first ngay tu dau, ve sau chi can boc shell desktop.
Khong nen port lai sang native desktop lan hai.

### 4. Giai quyet duoc nut that SQLite local
Web khong nen phu thuoc vao SQLite local tren may client.
Nguon du lieu dich phai la `Supabase Postgres`.

## Pham vi can chot trong dot migration

### Core flow phai duoc giu
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

### Ngoai pham vi dot migration dau
- Ho so hoc sinh day du
- Bookmark that
- Man lich su chi tiet
- Feature `Lam bai thi thu` card rieng neu chua co backend ro

## Cau truc repo de xuat

Trong repo hien tai:
- giu nguyen phan Java
- bo sung web app rieng

De xuat:

```text
final-project/
  docs/
  src/                      # app Java hien tai
  ai_service/               # Python AI service hien tai
  web-app/                  # app web moi
  supabase/                 # schema, migration, seed
```

## Stack chi tiet

### Frontend
- `React`
- `TypeScript`
- `Vite`
- `react-router-dom`
- `react-hook-form`
- `zod`
- `@supabase/supabase-js`

### State va business logic
- React state cho state cuc bo
- `Zustand` cho session/global app state
- Module thuần TypeScript cho exam engine

### Styling
Chon 1 trong 2:
- `Tailwind CSS`
- hoac CSS Modules

Khuyen nghi:
- dung `Tailwind CSS` cho toc do va de dong goi component
- neu muon giong sat giao dien hien tai co the them mot file token/theme rieng

### Data fetching
- query truc tiep `Supabase` o nhung use case don gian
- nhung luong nghiep vu phuc tap dong goi qua service layer trong app

### AI boundary
- browser khong giu secret key model
- browser goi:
  - Supabase Edge Function
  - hoac mot backend nho rieng

## Kien truc app web

De xuat theo feature:

```text
web-app/src/
  app/
    router/
    providers/
  pages/
    auth/
    home/
    dashboard/
    exam/
    review/
  features/
    auth/
    dashboard/
    exam/
    review/
    history/
  lib/
    supabase/
    api/
    utils/
    config/
  components/
    ui/
    layout/
```

## Phan chia trach nhiem

### `pages/`
- chi lam vai tro route-level composition
- khong chua business logic chinh

### `features/auth`
- login/register/logout
- session hydration
- current user profile

### `features/dashboard`
- load subject/topic/difficulty
- tao custom exam input
- load bang lich su tong quan

### `features/exam`
- exam session state
- answer checking
- timer
- lock question
- chat AI

### `features/review`
- exam result summary
- review tung cau
- hien giai thich AI da luu

### `lib/supabase`
- tao Supabase client
- auth helpers
- data access wrappers

### `lib/api`
- AI explain API client
- bat ky service backend nao khong nen goi truc tiep tu UI

## Routing de xuat

De xuat route map:

- `/login`
- `/register`
- `/home`
- `/dashboard`
- `/exam/:sessionId`
- `/review/:sessionId`

Ghi chu:
- `sessionId` co the la local in-memory id trong giai doan dau, sau nay doi sang attempt/session id that
- neu can don gian hon giai doan som:
  - `/exam`
  - `/review`

## Auth architecture

### Dich den
Auth web dung `supabase-js`, khong can layer Java bridge nua.

### Tranh nhiem
- sign up
- sign in
- sign out
- read session
- restore session sau refresh
- load user profile tu bang profile

### Quy tac
- chi mot nguon su that cho session: Supabase session
- thong tin ho so user load rieng sau auth

## Data architecture

### Van de hien tai
Auth dang o Supabase, con on tap/de thi dang o SQLite local.

### Dich den
Tat ca du lieu cho web se dua ve `Supabase Postgres`.

### Nhom du lieu can co
- users/profile
- subjects
- topics
- questions
- answers
- exam attempts
- attempt answers hoac attempt snapshots
- bookmarks neu can sau

### Nguyen tac
- frontend khong duoc phu thuoc vao file DB local
- schema phai ho tro multi-user va truy cap tu xa

## Exam engine architecture

Day la phan quan trong nhat, phai doc lap voi UI.

### Dich den
Tao module thuần TypeScript, vi du:

`web-app/src/features/exam/core/exam-session.ts`

### Module nay phai quan ly
- current question index
- question list
- selected answers
- locked questions
- timer
- answer checking
- next/prev navigation
- submit result
- AI chat history
- cached AI explanations

### Tai sao
Neu gom logic vao React component:
- kho test
- kho dong goi thanh desktop app
- kho doi UI sau nay

## AI architecture

### Hien tai
Java goi `AiServiceClient`, service nay goi Python FastAPI local.

### Dich den
Co 2 lua chon:

1. Giu `ai_service/` va cho web goi toi backend nay
2. Chuyen logic AI sang Supabase Edge Function hoac backend JS

Khuyen nghi giai doan dau:
- giu `ai_service/` de giam bien dong
- web goi toi AI backend qua HTTP API

### Rule bao mat
- khong de model key trong frontend
- khong de prompt business-critical nam tung component
- dong goi prompt tao giai thich trong service layer

## Session va persistence

### Auth session
- Supabase session luu theo web standard

### Exam session
Trong giai doan dau:
- exam session co the o local app state

Trong giai doan sau:
- luu attempt dang lam dang do vao server neu can resume

### Chat history
Giai doan dau:
- luu trong exam session state

Giai doan sau:
- neu can, persist theo attempt

## Testing strategy can chot tu dau

### Manual regression
Moi buoc migration deu doi chieu voi Java app theo `docs/current-flows.md`

### Unit test
Uu tien test cho:
- exam-session core
- auth validation helpers
- result calculator

### Integration test
Sau khi co web skeleton:
- login
- tao de
- lam bai
- submit

## Environment strategy

Hien co:
- `.env`
- `.env.example`

Web app moi nen co:
- `web-app/.env.example`
- `web-app/.env.local`

Bien moi de xuat:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_AI_API_BASE_URL`

Khong dua secret model key vao `VITE_*`.

## Migration boundary giua Java va Web

Trong giai doan chuyen doi:
- Java app van la app dang chay chinh
- web app la implementation moi chay song song

Khong lam:
- sua Java thanh nửa web nửa native them nua
- dung chung business logic runtime giua Java va web

Nen lam:
- dung chung docs
- dung chung schema dich
- dung chung API contracts

## Deliverable can co sau Buoc 2

Sau buoc nay, ta phai coi nhu da khoa:
- stack frontend
- kieu auth
- dich den du lieu
- AI boundary
- route structure
- folder structure
- nguyen tac exam engine

Neu nhung dieu nay chua chot, khong nen sang Buoc 3.

## Quyet dinh chot cho du an nay

1. Tao app moi trong `web-app/`
2. Dung `React + TypeScript + Vite`
3. Dung `react-router-dom`
4. Dung `Supabase` cho auth va data dich
5. Dung `Zustand` cho global session state nhe
6. Tach exam engine thanh module thuần TypeScript
7. AI di qua backend layer, khong goi secret tu browser
8. Java app va web app song song den khi web dat parity flow

## Pham vi chot cho Buoc 3

Buoc tiep theo can lam:
- map schema du lieu hien tai
- xac dinh bang nao dang o SQLite
- xac dinh bang nao da o Supabase
- chot schema dich tren `Supabase Postgres`
- lap ke hoach migrate du lieu
