# Kiến thức cốt lõi: Giới hạn dãy số

## 1. Dạng cơ bản
- Nếu tử và mẫu là đa thức theo `n`, chia cả tử và mẫu cho lũy thừa bậc cao nhất của `n`.
- Với căn thức, thường đưa biểu thức trong căn về dạng `n^k` nhân với phần còn lại.

## 2. Mẫu xử lý hay gặp
- `\lim \frac{P(n)}{Q(n)}`:
  - Nếu `deg(P) < deg(Q)` thì giới hạn bằng `0`.
  - Nếu `deg(P) = deg(Q)` thì giới hạn bằng tỉ số hệ số bậc cao nhất.
- Với căn thức:
  - `\sqrt{n^2 + a} = n\sqrt{1 + a/n^2}` khi `n > 0`.

## 3. Sai lầm thường gặp
- Rút gọn sai bậc lớn nhất của `n`.
- Quên đưa `n` ra ngoài dấu căn.
- Kết luận giới hạn bằng tỉ số hai số hạng không cùng bậc.
