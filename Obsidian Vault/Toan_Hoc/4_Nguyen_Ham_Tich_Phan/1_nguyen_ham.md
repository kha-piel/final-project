# Kiến thức cốt lõi: Nguyên hàm

## 1. Định nghĩa và Tính chất
- **Định nghĩa:** Hàm số $F(x)$ được gọi là một nguyên hàm của hàm số $f(x)$ trên $K$ nếu $F'(x) = f(x)$ với mọi $x \in K$.
- **Họ nguyên hàm:** Nếu $F(x)$ là một nguyên hàm của $f(x)$ thì họ tất cả các nguyên hàm của $f(x)$ được ký hiệu là:
$$\int f(x) dx = F(x) + C \quad (C \text{ là hằng số})$$
- **Tính chất cốt lõi:**
  - $\int k \cdot f(x) dx = k \int f(x) dx \quad (k \neq 0)$
  - $\int [f(x) \pm g(x)] dx = \int f(x) dx \pm \int g(x) dx$

## 2. Bảng nguyên hàm cơ bản (Thường dùng)
- $\int x^{\alpha} dx = \frac{x^{\alpha + 1}}{\alpha + 1} + C \quad (\alpha \neq -1)$
- $\int \frac{1}{x} dx = \ln|x| + C$
- $\int e^x dx = e^x + C$
- $\int \cos x dx = \sin x + C$
- $\int \sin x dx = -\cos x + C$

## 3. Các sai lầm thường gặp (Dùng để AI phân tích)
- **Quên cộng hằng số C:** Lỗi kinh điển nhất. Khi giải phương trình tìm một nguyên hàm cụ thể (đi qua một điểm), nếu quên $C$ sẽ mất toàn bộ điểm của bài toán.
- **Tích của nguyên hàm:** Học sinh tự sáng tạo ra công thức sai: $\int [f(x) \cdot g(x)] dx = \int f(x) dx \cdot \int g(x) dx$. (Phải dùng phương pháp Từng phần).
- **Quên trị tuyệt đối của Ln:** Khi tính $\int \frac{1}{x} dx$, học sinh thường chỉ ghi $\ln(x) + C$ mà quên mất dấu trị tuyệt đối $\ln|x| + C$, dẫn đến sai tập xác định nếu $x < 0$.
- **Nhầm lẫn dấu của Sin và Cos:** Đạo hàm của $\sin x$ là $\cos x$, nhưng NGUYÊN HÀM của $\sin x$ lại là $-\cos x$. Học sinh thường bị loạn dấu trừ ở cặp công thức này.