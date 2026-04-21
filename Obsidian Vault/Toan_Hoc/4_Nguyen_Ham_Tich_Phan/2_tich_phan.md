# Kiến thức cốt lõi: Tích phân

## 1. Định nghĩa và Công thức Newton-Leibniz
- Cho $f(x)$ là hàm số liên tục trên đoạn $[a; b]$. Giả sử $F(x)$ là một nguyên hàm của $f(x)$ trên đoạn $[a; b]$.
- Tích phân từ $a$ đến $b$ của $f(x)$ được xác định bởi công thức:
$$\int_{a}^{b} f(x) dx = \left. F(x) \right|_{a}^{b} = F(b) - F(a)$$
- *Ý nghĩa:* Tích phân là một CON SỐ cụ thể, không phụ thuộc vào biến số (tức là $\int_{a}^{b} f(x) dx = \int_{a}^{b} f(t) dt$).

## 2. Tính chất của Tích phân
- **Đổi cận (đổi dấu):** $\int_{a}^{b} f(x) dx = - \int_{b}^{a} f(x) dx$
- **Tích phân tại 1 điểm:** $\int_{a}^{a} f(x) dx = 0$
- **Chèn cận (Tách đoạn):** $\int_{a}^{b} f(x) dx = \int_{a}^{c} f(x) dx + \int_{c}^{b} f(x) dx$ (với mọi $c \in [a; b]$)
- **Tính chất tuyến tính:**
  $$\int_{a}^{b} [f(x) \pm g(x)] dx = \int_{a}^{b} f(x) dx \pm \int_{a}^{b} g(x) dx$$

## 3. Hai phương pháp tính cốt lõi
- **Phương pháp đổi biến số:** Đặt $u = u(x)$. 
  - *QUY TẮC SỐ 1: Đổi biến thì bắt buộc phải ĐỔI CẬN.*
- **Phương pháp từng phần:** $\int_{a}^{b} u dv = \left. (uv) \right|_{a}^{b} - \int_{a}^{b} v du$
  - *Thứ tự ưu tiên đặt u:* "Nhất lô, nhì đa, tam lượng, tứ mũ" (Logarit $\to$ Đa thức $\to$ Lượng giác $\to$ Hàm số mũ).

## 4. Các sai lầm thường gặp (Dùng để AI phân tích lỗi sai)
- **Quên đổi cận:** Khi dùng phương pháp đổi biến $t = u(x)$, học sinh tính xong nguyên hàm theo $t$ nhưng lại bê nguyên cận cũ của $x$ vào để thế số, dẫn đến kết quả sai hoàn toàn.
- **Tính tích phân của hàm không liên tục:** Cắm đầu bấm máy tính hoặc áp dụng công thức cho hàm số không xác định trên đoạn $[a; b]$ (Ví dụ: Tính $\int_{-1}^{1} \frac{1}{x} dx$ là sai vì hàm số gián đoạn tại $x=0$).
- **Sai dấu ở công thức Newton-Leibniz:** Lấy giá trị cận dưới trừ cận trên $F(a) - F(b)$ thay vì công thức đúng là cận trên trừ cận dưới $F(b) - F(a)$.
- **Nhầm lẫn giữa Diện tích và Tích phân:** Tích phân có thể ra số âm, nhưng diện tích bắt buộc phải là số dương (phải có trị tuyệt đối bên trong tích phân). Học sinh thường bỏ quên trị tuyệt đối khi tính diện tích.