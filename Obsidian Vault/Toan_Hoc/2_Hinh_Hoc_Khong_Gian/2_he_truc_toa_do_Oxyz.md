# Kiến thức cốt lõi: Hệ trục tọa độ trong không gian Oxyz

## 1. Định nghĩa Hệ tọa độ Oxyz
- Hệ trục tọa độ Đề-các vuông góc trong không gian gồm 3 trục Ox, Oy, Oz đôi một vuông góc với nhau tại gốc tọa độ O.
- Các vectơ đơn vị trên các trục Ox, Oy, Oz lần lượt là $\vec{i}, \vec{j}, \vec{k}$. Độ dài của chúng bằng 1 và đôi một vuông góc: 
$$\vec{i}^2 = \vec{j}^2 = \vec{k}^2 = 1 \quad \text{và} \quad \vec{i}\cdot\vec{j} = \vec{j}\cdot\vec{k} = \vec{k}\cdot\vec{i} = 0$$

## 2. Tọa độ của Vectơ và Điểm
- **Tọa độ vectơ:** $\vec{u} = (x; y; z) \Leftrightarrow \vec{u} = x\vec{i} + y\vec{j} + z\vec{k}$
- **Tọa độ điểm:** $M(x; y; z) \Leftrightarrow \vec{OM} = x\vec{i} + y\vec{j} + z\vec{k}$
- **Tọa độ vectơ giữa 2 điểm:** Cho $A(x_A; y_A; z_A)$ và $B(x_B; y_B; z_B)$, ta có:
$$\vec{AB} = (x_B - x_A; y_B - y_A; z_B - z_A)$$
*(Quy tắc: Lấy tọa độ điểm ngọn (B) trừ điểm gốc (A)).*

## 3. Các công thức tọa độ quan trọng
- **Trung điểm của đoạn thẳng AB:** $$I\left( \frac{x_A+x_B}{2}; \frac{y_A+y_B}{2}; \frac{z_A+z_B}{2} \right)$$
- **Trọng tâm tam giác ABC:** $$G\left( \frac{x_A+x_B+x_C}{3}; \frac{y_A+y_B+y_C}{3}; \frac{z_A+z_B+z_C}{3} \right)$$

## 4. Các sai lầm thường gặp (Dùng để AI phân tích)
- **Tính sai tọa độ vectơ $\vec{AB}$:** Học sinh cực kỳ hay lấy điểm đầu (A) trừ điểm cuối (B), dẫn đến kết quả bị ngược dấu toàn bộ (tức là tính nhầm thành $\vec{BA}$).
- **Nhầm lẫn hoành độ, tung độ, cao độ:** Khi đề bài cho $M = 2\vec{j} - 3\vec{i} + \vec{k}$, học sinh đọc lướt và ghi ngay tọa độ là $M(2; -3; 1)$ thay vì kết quả đúng phải xếp lại theo đúng thứ tự $\vec{i}, \vec{j}, \vec{k}$ là $M(-3; 2; 1)$.
- **Sai lầm khi chiếu điểm lên các trục/mặt phẳng:** - Chiếu điểm $M(x;y;z)$ lên mặt phẳng (Oxy) thì điểm chiếu sẽ giữ nguyên $x, y$ và $z = 0$. Tọa độ chiếu là $(x; y; 0)$. 
  - Học sinh thường bối rối không biết cho tọa độ nào bằng 0, hoặc nhầm lẫn giữa chiếu lên Trục (chỉ giữ 1 tọa độ) và chiếu lên Mặt phẳng (giữ 2 tọa độ).