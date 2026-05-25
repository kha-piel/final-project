# Kiến thức cốt lõi: Cấp số cộng và cấp số nhân

## 1. Cấp số cộng

- Dãy `(u_n)` là cấp số cộng nếu `u_{n+1} = u_n + d`.
- `d` là công sai.
- Số hạng tổng quát:
  - `u_n = u_1 + (n - 1)d`
- Tổng `n` số hạng đầu:
  - `S_n = n(u_1 + u_n) / 2`
  - `S_n = n[2u_1 + (n - 1)d] / 2`

## 2. Cấp số nhân

- Dãy `(u_n)` là cấp số nhân nếu `u_{n+1} = u_n q`.
- `q` là công bội.
- Số hạng tổng quát:
  - `u_n = u_1 q^{n-1}`
- Tổng `n` số hạng đầu khi `q != 1`:
  - `S_n = u_1(1-q^n)/(1-q)`

## 3. Dạng bài hay gặp

- Nhận biết cấp số cộng/cấp số nhân.
- Tìm công sai, công bội.
- Tính số hạng thứ `n`.
- Tính tổng `n` số hạng đầu.
- Tìm `n` khi biết `u_n` hoặc `S_n`.
- Bài toán lãi kép, tăng trưởng, gửi tiền.

## 4. Sai lầm thường gặp

- Với cấp số cộng, dùng nhầm `u_n = u_1 + nd` thay vì `u_1 + (n-1)d`.
- Nhầm công sai `d` với công bội `q`.
- Dùng công thức tổng cấp số cộng cho cấp số nhân hoặc ngược lại.
- Với cấp số nhân, quên xét riêng trường hợp `q = 1`.
- Với bài lãi kép, nhầm lãi đơn và lãi kép.
