# Toán Tích Phân

## 1. Khái niệm Nguyên hàm

**Định nghĩa:** Hàm số $F(x)$ được gọi là **nguyên hàm** của hàm số $f(x)$ trên khoảng $(a, b)$ nếu:

$$F'(x) = f(x), \quad \forall x \in (a, b)$$

**Tính chất:**
- Nếu $F(x)$ là một nguyên hàm của $f(x)$ thì $F(x) + C$ (với $C$ là hằng số tùy ý) cũng là nguyên hàm của $f(x)$.
- Mọi hàm liên tục trên $(a, b)$ đều có nguyên hàm trên $(a, b)$.

---

## 2. Bảng Nguyên hàm cơ bản

| Hàm số $f(x)$       | Nguyên hàm $F(x)$              |
|----------------------|-------------------------------|
| $x^n$ $(n \neq -1)$ | $\dfrac{x^{n+1}}{n+1} + C$   |
| $\dfrac{1}{x}$      | $\ln|x| + C$                  |
| $e^x$               | $e^x + C$                     |
| $a^x$               | $\dfrac{a^x}{\ln a} + C$      |
| $\sin x$            | $-\cos x + C$                 |
| $\cos x$            | $\sin x + C$                  |
| $\dfrac{1}{\cos^2 x}$ | $\tan x + C$               |
| $\dfrac{1}{\sin^2 x}$ | $-\cot x + C$              |

---

## 3. Tích phân xác định

**Định nghĩa (Tích phân Riemann):**

$$\int_{a}^{b} f(x)\, dx = \lim_{\lambda \to 0} \sum_{i=1}^{n} f(\xi_i) \Delta x_i$$

**Công thức Newton – Leibniz:**

$$\int_{a}^{b} f(x)\, dx = F(b) - F(a)$$

trong đó $F(x)$ là một nguyên hàm bất kỳ của $f(x)$ trên $[a, b]$.

---

## 4. Các phương pháp tính tích phân

### 4.1 Phương pháp đổi biến số (Substitution)

Đặt $t = \varphi(x)$, khi đó:

$$\int f(\varphi(x))\,\varphi'(x)\, dx = \int f(t)\, dt$$

**Ví dụ:**

$$\int 2x\,e^{x^2}\, dx \xrightarrow{t=x^2} \int e^t\, dt = e^t + C = e^{x^2} + C$$

---

### 4.2 Phương pháp tích phân từng phần (Integration by Parts)

$$\int u\, dv = uv - \int v\, du$$

**Quy tắc LIATE** (ưu tiên chọn $u$):
1. **L**ogarithm
2. **I**nverse trigonometric (Lượng giác ngược)
3. **A**lgebraic (Đại số / đa thức)
4. **T**rigonometric (Lượng giác)
5. **E**xponential (Hàm mũ)

**Ví dụ:**

$$\int x\,e^x\, dx = x\,e^x - \int e^x\, dx = x\,e^x - e^x + C = e^x(x-1) + C$$

---

## 5. Ứng dụng của Tích phân

### 5.1 Tính diện tích hình phẳng

Diện tích hình phẳng giới hạn bởi $y = f(x)$, $y = g(x)$, $x = a$, $x = b$ (với $f(x) \geq g(x)$):

$$S = \int_{a}^{b} [f(x) - g(x)]\, dx$$

### 5.2 Tính thể tích vật thể tròn xoay

Thể tích vật thể tạo ra khi quay hình phẳng giới hạn bởi $y = f(x)$, trục $Ox$, $x = a$, $x = b$ quanh trục $Ox$:

$$V = \pi \int_{a}^{b} [f(x)]^2\, dx$$

---

## 6. Dạng bài thi THPTQG thường gặp

> **Dạng 1:** Tính nguyên hàm $\int f(x)\,dx$ bằng bảng công thức.
>
> **Dạng 2:** Tính tích phân xác định $\int_{a}^{b} f(x)\,dx$ bằng Newton–Leibniz.
>
> **Dạng 3:** Ứng dụng tính diện tích / thể tích.
>
> **Dạng 4:** Tích phân từng phần hoặc đổi biến số.

---

*Nguồn: Knowledge Base – Ôn thi THPTQG Toán Học*
*Tags: #toan #giai-tich #tich-phan #nguyen-ham #THPTQG*
