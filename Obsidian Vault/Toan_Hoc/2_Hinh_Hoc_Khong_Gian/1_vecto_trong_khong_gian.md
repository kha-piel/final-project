# Kiến thức cốt lõi: Vectơ trong không gian

## 1. Khái niệm và Quy tắc cơ bản
- Các khái niệm về vectơ (phương, chiều, độ dài, hai vectơ bằng nhau) và các phép toán (cộng, trừ, nhân vectơ với một số) trong không gian hoàn toàn tương tự như trong mặt phẳng.
- **Quy tắc hình hộp:** Cho hình hộp $ABCD.A'B'C'D'$ (với $A, B, D, A'$ là 4 đỉnh kề nhau). Ta có quy tắc cộng 3 vectơ không đồng phẳng:
$$\vec{AB} + \vec{AD} + \vec{AA'} = \vec{AC'}$$
- **Trọng tâm tứ diện:** Nếu $G$ là trọng tâm của tứ diện $ABCD$ thì tổng các vectơ từ $G$ đến 4 đỉnh bằng vectơ không:
$$\vec{GA} + \vec{GB} + \vec{GC} + \vec{GD} = \vec{0}$$

## 2. Sự đồng phẳng của 3 vectơ
- **Định nghĩa:** Ba vectơ được gọi là đồng phẳng nếu các giá (đường thẳng chứa vectơ) của chúng cùng song song với một mặt phẳng.
- **Điều kiện đồng phẳng:** Cho ba vectơ $\vec{a}, \vec{b}, \vec{c}$ trong đó $\vec{a}$ và $\vec{b}$ không cùng phương. Khi đó $\vec{a}, \vec{b}, \vec{c}$ đồng phẳng khi và chỉ khi tồn tại duy nhất cặp số $m, n$ sao cho:
$$\vec{c} = m\vec{a} + n\vec{b}$$
- *Ý nghĩa thực chiến:* Nếu $\vec{c} = m\vec{a} + n\vec{b}$, ta có thể phân tích một vectơ bất kỳ theo 3 vectơ không đồng phẳng để giải các bài toán chứng minh vuông góc, song song.

## 3. Các sai lầm thường gặp (Dùng để AI phân tích)
- **Hiểu sai về chữ "Đồng phẳng":** Học sinh thường ngộ nhận ba vectơ đồng phẳng thì giá của chúng bắt buộc phải cùng *nằm trên* một mặt phẳng. Thực tế, chúng chỉ cần *cùng song song* với một mặt phẳng chung là đủ.
- **Áp dụng sai quy tắc hình hộp:** Thay vì cộng 3 cạnh xuất phát từ cùng một đỉnh để ra đường chéo không gian (từ A đến C'), học sinh hay nhầm với quy tắc hình bình hành ở không gian 2D, dẫn đến kết quả chỉ ra đường chéo của một mặt.
- **Nhầm lẫn công thức trọng tâm:** Sử dụng công thức trọng tâm tam giác ($\vec{GA} + \vec{GB} + \vec{GC} = \vec{0}$) áp đặt cho bài toán tứ diện (quên mất đỉnh D).