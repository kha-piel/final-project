# Kiến thức cốt lõi: Xác suất có điều kiện và biến cố độc lập

## 1. Xác suất có điều kiện
- Với `P(B) > 0`, ta có:
  - `P(A|B) = \frac{P(A \cap B)}{P(B)}`
- Từ đó suy ra:
  - `P(A \cap B) = P(B)P(A|B) = P(A)P(B|A)`

## 2. Biến cố độc lập
- Hai biến cố `A`, `B` độc lập khi:
  - `P(A \cap B) = P(A)P(B)`
- Khi đó xác suất "ít nhất một biến cố xảy ra":
  - `P(A \cup B) = P(A) + P(B) - P(A)P(B)`

## 3. Áp dụng hay gặp
- Hai đối tượng bắn độc lập vào mục tiêu.
- Học sinh đoán ngẫu nhiên từng câu trắc nghiệm độc lập với nhau.
- Chọn mẫu nhiều bước nhưng đề khẳng định rõ các bước độc lập.

## 4. Sai lầm thường gặp
- Nhầm "ít nhất một lần thành công" với "đúng một lần thành công".
- Cộng trực tiếp `P(A) + P(B)` mà quên trừ phần giao.
- Dùng công thức độc lập cho bài toán thực chất không độc lập.
