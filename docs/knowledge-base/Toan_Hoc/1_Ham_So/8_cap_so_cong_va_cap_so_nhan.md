# Kiến thức cốt lõi: Cấp số cộng và cấp số nhân

## 1. Cấp số cộng
- Dãy `(u_n)` là cấp số cộng nếu `u_{n+1} = u_n + d`.
- Công thức số hạng tổng quát:
  - `u_n = u_1 + (n - 1)d`
- Công thức tổng `n` số hạng đầu:
  - `S_n = \frac{n(u_1 + u_n)}{2}`

## 2. Cấp số nhân
- Dãy `(u_n)` là cấp số nhân nếu `u_{n+1} = u_n q`.
- Công thức số hạng tổng quát:
  - `u_n = u_1 q^{n-1}`
- Tổng `n` số hạng đầu khi `q != 1`:
  - `S_n = \frac{u_1(1-q^n)}{1-q}`

## 3. Sai lầm thường gặp
- Với cấp số cộng, học sinh hay dùng nhầm `u_n = u_1 + nd` thay vì `u_1 + (n-1)d`.
- Nhầm công sai `d` với công bội `q`.
- Khi tính tổng, quên xác định đúng loại dãy đang xét.
