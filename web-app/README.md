# Web App

Web app nay la ban migration web-first cua flow on tap hien tai.

## Muc tieu hien tai

Ban web da cover duoc core flow:
- register
- login
- home
- dashboard
- tao de
- lam bai
- AI giai thich
- submit
- review

Hien trang:
- core flow UI da chay duoc
- auth da noi Supabase that
- login da ho tro `email hoac username`
- submit da persist `student_attempts` va `attempt_answers`
- dashboard da doc duoc history that tu Supabase
- review co the doc lai tu attempt da luu
- runtime trong luc dang lam bai duoc giu trong `localStorage` de refresh van tiep tuc duoc
- `in_progress attempt` duoc dong bo len Supabase va co the khoi phuc lai tu cloud
- cloud resume da keo lai duoc core chat history cua AI session

## Chay local

Yeu cau:
- Node.js 20+
- Supabase project da cau hinh schema va seed du lieu
- AI backend neu muon test flow giai thich

Schema:
- apply [schema.sql](/abs/path/c:/Users/ADMIIN/VScode/final-project/supabase/schema.sql) hoac migration tuong duong len Supabase truoc khi test
- neu muon luu lich su lam bai de truong, can chay them `web-app/supabase/setup_student_learning_history.sql` trong Supabase SQL Editor
- neu dang dung SQLite local cua repo nay, co the migrate content len Supabase bang:

```bash
python -m pip install pg8000
python supabase/scripts/migrate_sqlite_to_supabase.py
```

Tao file `web-app/.env.local`:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_AI_API_BASE_URL=http://127.0.0.1:8000
```

Chay app:

```bash
npm install
npm run dev
```

Neu muon test day du luong AI giai thich:

```powershell
.\scripts\run-ai-service.ps1
```

Build production:

```bash
npm run build
```

## Route hien co

- `/login`
- `/register`
- `/home`
- `/dashboard`
- `/exam/:sessionId`
- `/review/:sessionId`

## Test parity voi app Java

Test theo dung thu tu:
1. login/register
2. vao dashboard
3. chon subject/topic/difficulty
4. tao de
5. chon dap an
6. check dung/sai
7. AI giai thich
8. nop bai
9. review

Tai lieu doi chieu:
- [docs/current-flows.md](/abs/path/c:/Users/ADMIIN/VScode/final-project/docs/current-flows.md)
- [docs/java-web-parity.md](/abs/path/c:/Users/ADMIIN/VScode/final-project/docs/java-web-parity.md)

## Gioi han hien tai

- Dang nhap web ho tro `email + password` va `username + password`
- Dang nhap qua username phu thuoc RPC `resolve_login_email` trong `supabase/schema.sql`
- Cloud chat da duoc persist co ban, nhung van can test them de chot behavior o bai lam dai va nhieu lan resume
- Can test thuc chien them de chot behavior khi mo cung mot attempt o nhieu tab/thiet bi
