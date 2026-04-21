\# Kiến thức cốt lõi: Đường tiệm cận của đồ thị hàm số



\## 1. Tiệm cận ngang (TCN)

\- Cho hàm số $y = f(x)$ xác định trên một khoảng vô hạn.

\- Đường thẳng $y = y\_0$ là tiệm cận ngang của đồ thị hàm số nếu ít nhất một trong các điều kiện sau thỏa mãn:

$$\\lim\_{x \\to +\\infty} f(x) = y\_0$$

$$\\lim\_{x \\to -\\infty} f(x) = y\_0$$



\## 2. Tiệm cận đứng (TCĐ)

\- Đường thẳng $x = x\_0$ là tiệm cận đứng của đồ thị hàm số nếu ít nhất một trong các điều kiện sau thỏa mãn:

$$\\lim\_{x \\to x\_0^+} f(x) = +\\infty \\quad \\text{hoặc} \\quad -\\infty$$

$$\\lim\_{x \\to x\_0^-} f(x) = +\\infty \\quad \\text{hoặc} \\quad -\\infty$$

\- \*Mẹo thực chiến cho hàm phân thức:\* Điểm $x\_0$ thường là nghiệm của mẫu số NHƯNG KHÔNG LÀ nghiệm của tử số (hoặc nếu là nghiệm của tử thì bậc của mẫu phải lớn hơn).



\## 3. Tiệm cận xiên (TCX) - \*Theo chương trình GDPT 2018\*

\- Đường thẳng $y = ax + b$ ($a \\neq 0$) là tiệm cận xiên của đồ thị hàm số $y = f(x)$ nếu:

$$\\lim\_{x \\to +\\infty} \[f(x) - (ax + b)] = 0 \\quad \\text{hoặc} \\quad \\lim\_{x \\to -\\infty} \[f(x) - (ax + b)] = 0$$

\- \*Dấu hiệu nhận biết:\* Thường xuất hiện ở hàm phân thức hữu tỉ có bậc của tử lớn hơn bậc của mẫu đúng 1 đơn vị. (Cách tìm: Lấy tử chia cho mẫu).



\## 4. Các sai lầm thường gặp (Dùng để AI phân tích)

\- \*\*Nhầm lẫn x và y:\*\* Học sinh hay kết luận phương trình tiệm cận đứng là $y = \\dots$ và tiệm cận ngang là $x = \\dots$.

\- \*\*Mắc bẫy TCĐ ở hàm phân thức:\*\* Chỉ cho mẫu số bằng 0 để tìm tiệm cận đứng mà quên thay nghiệm đó lên tử số để kiểm tra xem nó có bị triệt tiêu hay không. (Ví dụ: $y = \\frac{x-1}{x^2-1}$ chỉ có 1 TCĐ là $x=-1$, học sinh thường vội vàng kết luận có 2 TCĐ là $x=1$ và $x=-1$).

\- \*\*Thiếu TCN do chỉ xét một phía vô cực:\*\* Đối với các hàm số chứa căn thức (ví dụ $y = \\frac{x}{\\sqrt{x^2+1}}$), học sinh hay quên tính giới hạn tại $-\\infty$, dẫn đến thiếu mất một đường tiệm cận ngang.

