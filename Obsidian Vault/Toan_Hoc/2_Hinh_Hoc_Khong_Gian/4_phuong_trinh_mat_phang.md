# Kiến thức cốt lõi: Phương trình mặt phẳng

## 1. Vectơ pháp tuyến (VTPT) của mặt phẳng
- Vectơ $\vec{n} \neq \vec{0}$ được gọi là VTPT của mặt phẳng $(\alpha)$ nếu giá của $\vec{n}$ vuông góc với $(\alpha)$.
- *Chú ý:* Nếu $\vec{n}$ là một VTPT thì $k\vec{n}$ ($k \neq 0$) cũng là VTPT của mặt phẳng đó.
- Nếu mặt phẳng chứa hoặc song song với giá của hai vectơ không cùng phương $\vec{a}$ và $\vec{b}$ (gọi là cặp vectơ chỉ phương), thì VTPT của mặt phẳng được tính bằng tích có hướng: $\vec{n} = [\vec{a}, \vec{b}]$.

## 2. Phương trình tổng quát của mặt phẳng
- Mặt phẳng $(\alpha)$ đi qua điểm $M_0(x_0; y_0; z_0)$ và nhận $\vec{n} = (A; B; C)$ làm VTPT có phương trình là:
$$A(x - x_0) + B(y - y_0) + C(z - z_0) = 0$$
- Khai triển ra ta được dạng tổng quát: $Ax + By + Cz + D = 0$ (với $A^2 + B^2 + C^2 > 0$).

## 3. Các phương trình đặc biệt
- **Phương trình mặt phẳng theo đoạn chắn:** Mặt phẳng cắt 3 trục tọa độ tại $A(a; 0; 0)$, $B(0; b; 0)$, $C(0; 0; c)$ (với $a, b, c \neq 0$) có phương trình:
$$\frac{x}{a} + \frac{y}{b} + \frac{z}{c} = 1$$

## 4. Khoảng cách từ một điểm đến mặt phẳng
- Khoảng cách từ điểm $M_0(x_0; y_0; z_0)$ đến mặt phẳng $(\alpha): Ax + By + Cz + D = 0$ là:
$$d(M_0, \alpha) = \frac{|Ax_0 + By_0 + Cz_0 + D|}{\sqrt{A^2 + B^2 + C^2}}$$

## 5. Các sai lầm thường gặp (Dùng để AI phân tích lỗi sai)
- **Lắp ngược tọa độ:** Khi viết phương trình $A(x - x_0) + B(y - y_0) + C(z - z_0) = 0$, học sinh rất hay lấy tọa độ điểm $(x_0, y_0, z_0)$ làm hệ số ở ngoài, và lấy tọa độ VTPT $(A, B, C)$ nhét vào trong ngoặc.
- **Quên dấu trị tuyệt đối tính khoảng cách:** Tử số của công thức khoảng cách bắt buộc phải có trị tuyệt đối, học sinh hay quên dẫn đến tính ra khoảng cách bị âm (vô lý).
- **Nhầm lẫn Phương trình đoạn chắn:** Khi đề cho cắt 3 trục tại 3 điểm, học sinh áp dụng đúng công thức $\frac{x}{a} + \frac{y}{b} + \frac{z}{c} = 1$, nhưng lúc quy đồng khử mẫu lại thường quên nhân mẫu số chung lên số $1$ ở vế phải (mà cứ để vế phải bằng 1 hoặc bằng 0).
- **Thiếu điều kiện tồn tại VTPT:** Khi tìm VTPT từ hai vectơ chỉ phương bằng tích có hướng $\vec{n} = [\vec{a}, \vec{b}]$, học sinh quên kiểm tra xem $\vec{a}$ và $\vec{b}$ có cùng phương hay không. Nếu cùng phương thì tích có hướng bằng $\vec{0}$, không thể làm VTPT.