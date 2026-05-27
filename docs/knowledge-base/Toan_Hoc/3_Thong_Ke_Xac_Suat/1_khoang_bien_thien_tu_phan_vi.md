# Kiến thức cốt lõi: Tứ phân vị và số liệu ghép nhóm

## 1. Ý nghĩa của tứ phân vị
- `Q_1`, `Q_2`, `Q_3` lần lượt là các mốc chia dữ liệu thành bốn phần.
- `Q_2` chính là trung vị.
- `Q_3` là giá trị mà khoảng `75%` dữ liệu không vượt quá nó.

## 2. Với bảng tần số ghép nhóm
- Xác định tổng số phần tử `N`.
- Tìm vị trí cần xét:
  - `Q_1` ứng với vị trí `N/4`
  - `Q_2` ứng với vị trí `N/2`
  - `Q_3` ứng với vị trí `3N/4`
- Xác định lớp chứa tứ phân vị, rồi nội suy theo công thức của dữ liệu ghép nhóm.

## 3. Sai lầm thường gặp
- Chọn sai lớp chứa `Q_3` do cộng tần số tích lũy nhầm.
- Nhầm giữa cận lớp và giá trị đại diện của lớp.
- Quên đây là bài toán nội suy nên không thể chỉ lấy trung điểm lớp làm đáp án.
