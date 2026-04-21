# Kiến thức cốt lõi: Phương trình mặt cầu

## 1. Phương trình chính tắc (Dạng 1)
- Mặt cầu $(S)$ có tâm $I(a; b; c)$ và bán kính $R > 0$ có phương trình là:
$$(x - a)^2 + (y - b)^2 + (z - c)^2 = R^2$$

## 2. Phương trình tổng quát (Dạng 2)
- Phương trình $x^2 + y^2 + z^2 - 2ax - 2by - 2cz + d = 0$ là phương trình của một mặt cầu khi và chỉ khi thỏa mãn điều kiện:
$$a^2 + b^2 + c^2 - d > 0$$
- Khi đó, mặt cầu có:
  - Tâm $I(a; b; c)$
  - Bán kính $R = \sqrt{a^2 + b^2 + c^2 - d}$

## 3. Vị trí tương đối giữa Mặt phẳng và Mặt cầu
Cho mặt phẳng $(P)$ và mặt cầu $(S)$ tâm $I$, bán kính $R$. Gọi $d = d(I, (P))$ là khoảng cách từ tâm $I$ đến mặt phẳng $(P)$.
- **Trường hợp 1 ($d > R$):** Mặt phẳng không cắt mặt cầu.
- **Trường hợp 2 ($d = R$):** Mặt phẳng tiếp xúc với mặt cầu tại 1 điểm duy nhất (gọi là tiếp điểm). $(P)$ được gọi là tiếp diện.
- **Trường hợp 3 ($d < R$):** Mặt phẳng cắt mặt cầu theo giao tuyến là một **đường tròn**.
  - Bán kính $r$ của đường tròn giao tuyến được tính bằng định lý Pytago:
  $$R^2 = d^2 + r^2 \Rightarrow r = \sqrt{R^2 - d^2}$$

## 4. Các sai lầm thường gặp (Dùng để AI phân tích lỗi sai)
- **Sai dấu khi tìm tâm ở Dạng 2:** Để tìm tọa độ tâm $I(a,b,c)$ từ phương trình khai triển, ta phải chia các hệ số của $x, y, z$ cho **$-2$**. Học sinh rất hay quên dấu trừ, dẫn đến tâm bị ngược dấu hoàn toàn.
- **Quên bình phương bán kính ở Dạng 1:** Đề bài cho bán kính $R = 3$, nhưng khi lắp vào phương trình $(x-a)^2 + (y-b)^2 + (z-c)^2 = \dots$, học sinh lại ghi bằng $3$ thay vì bằng $9$ ($3^2$).
- **Không kiểm tra điều kiện mặt cầu:** Đề bài cho phương trình chứa tham số $m$ và hỏi có bao nhiêu giá trị $m$ để đây là mặt cầu. Học sinh thường quên giải bất phương trình điều kiện $a^2 + b^2 + c^2 - d > 0$.
- **Nhầm lẫn $R$ và $r$:** Trong bài toán mặt phẳng cắt mặt cầu, học sinh hay nhầm lẫn giữa Bán kính mặt cầu ($R$) và Bán kính đường tròn giao tuyến ($r$).