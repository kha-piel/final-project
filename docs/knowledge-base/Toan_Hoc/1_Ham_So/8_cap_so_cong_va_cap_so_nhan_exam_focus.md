# Trọng tâm thi: Dãy số, cấp số cộng và cấp số nhân

Nguồn lọc: `he-thong-bai-tap-trac-nghiem-day-so-cap-so-cong-va-cap-so-nhan.pdf`.

File PDF gốc là ngân hàng bài tập lớn, không nên đưa toàn bộ vào phần ôn tập chính. Khi dùng cho học sinh, ưu tiên các dạng có tần suất cao trong đề thi thử và đề THPTQG.

## Ưu tiên học trước

### 1. Cấp số cộng

- Nhận biết một dãy là cấp số cộng.
- Tìm công sai `d`.
- Tính số hạng tổng quát:
  - `u_n = u_1 + (n - 1)d`
- Tìm số hạng thứ `n`.
- Tìm `n` khi biết `u_n`.
- Tính tổng `n` số hạng đầu:
  - `S_n = n(u_1 + u_n) / 2`
  - `S_n = n[2u_1 + (n - 1)d] / 2`

Mức độ ưu tiên: cao.

### 2. Cấp số nhân

- Nhận biết một dãy là cấp số nhân.
- Tìm công bội `q`.
- Tính số hạng tổng quát:
  - `u_n = u_1 q^{n-1}`
- Tính số hạng thứ `n`.
- Tìm `n` khi biết `u_n`.
- Tính tổng `n` số hạng đầu:
  - `S_n = u_1(1-q^n)/(1-q)` với `q != 1`.
- Bài toán thực tế theo cấp số nhân: lãi kép, tăng trưởng, gửi tiền, dân số.

Mức độ ưu tiên: cao.

## Ôn bổ trợ sau

### 3. Dãy số

- Tìm số hạng theo công thức tổng quát.
- Tìm số hạng theo công thức truy hồi.
- Xét tính tăng giảm của dãy số.
- Xét dãy bị chặn, chặn trên, chặn dưới.
- Tìm số hạng nguyên, số hạng chính phương.

Mức độ ưu tiên: trung bình. Chỉ đưa lên trước nếu học sinh sai nhiều ở nhóm này.

## Không đưa dày vào ôn tập chính

- Câu vận dụng cao quá dài hoặc nhiều mẹo số học.
- Câu trùng dạng quá nhiều.
- Câu chỉ kiểm tra biến đổi phụ, ít liên quan trực tiếp tới cấu trúc đề thi.

## Rule chọn câu khi sinh bài ôn

1. Nếu học sinh yếu cấp số cộng/cấp số nhân, lấy trước câu `examFrequency = high`.
2. Nếu học sinh chọn mức nhận biết, ưu tiên nhận dạng dãy, tìm `d`, tìm `q`, tìm `u_n`.
3. Nếu học sinh chọn mức thông hiểu, thêm câu tính `S_n`, tìm `n`, kết hợp nhiều dữ kiện.
4. Nếu học sinh chọn mức vận dụng, thêm bài thực tế lãi kép/tăng trưởng và bài tổng hợp.
5. Nếu thiếu câu, mới mở rộng sang dãy số tăng giảm, bị chặn và truy hồi.

## Sai lầm cần nhắc học sinh

- Nhầm `u_n = u_1 + nd` với `u_n = u_1 + (n - 1)d`.
- Nhầm công sai `d` với công bội `q`.
- Dùng công thức tổng cấp số cộng cho cấp số nhân hoặc ngược lại.
- Quên điều kiện `q != 1` khi dùng công thức tổng cấp số nhân.
- Với bài lãi kép, nhầm lãi đơn và lãi kép.
