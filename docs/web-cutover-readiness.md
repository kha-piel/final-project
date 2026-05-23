# Web Cutover Readiness

## Muc tieu

Tai lieu nay chot nhanh muc do san sang de dua flow on tap chinh tu Java sang web.

No khong thay the:
- [current-flows.md](/abs/path/c:/Users/ADMIIN/VScode/final-project/docs/current-flows.md)
- [java-web-parity.md](/abs/path/c:/Users/ADMIIN/VScode/final-project/docs/java-web-parity.md)

No tra loi cau hoi:
- Web da thay duoc Java den dau?
- Can test gi truoc khi cat Java khoi flow chinh?
- Can giu Java lai cho phan nao?

## Trang thai hien tai

### Da san sang
- Dang ky va dang nhap qua Supabase
- Dang nhap bang `email` hoac `username`
- Dashboard chon mon/chuyen de/do kho
- Tao de va vao bai lam
- Chon dap an, check dung/sai, khoa cau, auto-next
- Goi AI khi tra loi sai
- Chat hoi them trong bai lam
- Nop bai va persist `student_attempts`
- Persist `attempt_answers`
- Review sau khi nop bai
- History cloud tren dashboard
- Resume local sau refresh
- Resume cloud cho `in_progress attempt`
- Resume lai core AI chat context

### Chua nen cat Java ngay
- Chua co dot test nghiem ngat multi-tab / multi-device
- Chua chot quy trinh rollback neu Supabase env/schema bi lech
- Chua co vong UAT voi du lieu that va user that

## Danh gia tong the

### Ve flow nguoi dung
- Dat

### Ve persistence
- Dat

### Ve parity voi Java cho flow on tap chinh
- Dat muc kha cao

### Ve readiness de cat Java khoi flow on tap chinh
- Gan dat

## Checklist truoc khi cat Java

1. Apply dung `supabase/schema.sql` len environment dang dung
2. Test login bang ca `email` va `username`
3. Test tao de, lam bai, nop bai, review tren du lieu that
4. Test refresh giua bai
5. Test resume cloud tren trinh duyet khac hoac may khac
6. Test 1 truong hop mo cung mot attempt o 2 tab va xac nhan behavior mong muon
7. Test review/history sau khi reload trang

## Khuyen nghi van hanh

### Pha 1
- Giu Java la fallback
- Dung web cho nhom test noi bo

### Pha 2
- Dung web la flow chinh cho on tap
- Java chi giu de fallback tam thoi

### Pha 3
- Dong bang phat trien flow on tap tren Java
- Chi bao tri toi thieu neu can

## Ket luan

Neu ban muon dat moc "web la ban chinh cho flow on tap", du an da rat gan moc do.

Phan con lai khong con la "thieu chuc nang lon", ma la:
- test thuc chien
- chot behavior edge case
- quyet dinh van hanh cat Java theo pha
