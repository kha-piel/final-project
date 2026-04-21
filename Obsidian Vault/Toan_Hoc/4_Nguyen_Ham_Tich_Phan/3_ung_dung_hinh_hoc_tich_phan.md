# Kiến thức cốt lõi: Ứng dụng hình học của Tích phân

## 1. Diện tích hình phẳng
- **Dạng 1: Giới hạn bởi 1 đồ thị và trục hoành**
  - Hình phẳng $(H)$ giới hạn bởi đồ thị $y = f(x)$, trục $Ox$ ($y=0$), và hai đường thẳng $x = a, x = b$.
  - Công thức: $S = \int_{a}^{b} |f(x)| dx$
- **Dạng 2: Giới hạn bởi 2 đồ thị**
  - Hình phẳng $(H)$ giới hạn bởi hai đồ thị $y = f(x)$, $y = g(x)$, và hai đường thẳng $x = a, x = b$.
  - Công thức: $S = \int_{a}^{b} |f(x) - g(x)| dx$
  - *Mẹo phá trị tuyệt đối:* Giải phương trình $f(x) = g(x)$ để tìm các nghiệm $x_i \in (a; b)$. Sau đó chèn các nghiệm này vào để tách thành các tích phân nhỏ không còn chứa nghiệm bên trong, rồi đưa dấu trị tuyệt đối ra ngoài mỗi tích phân.

## 2. Thể tích vật thể và Khối tròn xoay
- **Thể tích vật thể (Biết diện tích thiết diện):**
  - Vật thể $V$ giới hạn bởi hai mặt phẳng vuông góc với trục $Ox$ tại $x=a, x=b$. Diện tích thiết diện cắt bởi mặt phẳng vuông góc với trục $Ox$ tại điểm $x$ là $S(x)$.
  - Công thức: $V = \int_{a}^{b} S(x) dx$
- **Thể tích khối tròn xoay (Quay quanh trục Ox):**
  - Hình phẳng giới hạn bởi $y = f(x)$, trục $Ox$, $x=a, x=b$ quay quanh trục $Ox$.
  - Công thức: $V = \pi \int_{a}^{b} [f(x)]^2 dx$

## 3. Các sai lầm thường gặp (Dùng để AI phân tích lỗi sai)
- **Quên nhân $\pi$ hoặc quên bình phương:** Khi tính thể tích khối tròn xoay, học sinh cực kỳ hay viết thiếu hằng số $\pi$ ở ngoài hoặc quên bình phương hàm số $f(x)$ ở trong.
- **Râu ông nọ cắm cằm bà kia:** Nhầm lẫn công thức Diện tích (có trị tuyệt đối, không có $\pi$) sang Thể tích (có $\pi$, có bình phương, không cần trị tuyệt đối).
- **Tách sai cận:** Khi diện tích bị chia làm nhiều phần (đồ thị cắt nhau), học sinh bấm máy tính thẳng một lèo mà không thêm dấu trị tuyệt đối, dẫn đến các phần diện tích âm dương tự triệt tiêu lẫn nhau ra kết quả sai.
- **Lấy $\pi$ ra ngoài trị tuyệt đối sai cách:** Khi tính thể tích giới hạn bởi 2 đường cong $f(x)$ và $g(x)$, công thức chuẩn là $V = \pi \int_{a}^{b} |f^2(x) - g^2(x)| dx$. Học sinh thường viết nhầm thành $V = \pi \int_{a}^{b} [f(x) - g(x)]^2 dx$.