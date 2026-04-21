# Kiến thức cốt lõi: Khảo sát sự biến thiên và vẽ đồ thị hàm số

## 1. Sơ đồ khảo sát tổng quát
1. **Tập xác định.**
2. **Sự biến thiên:**
   - Tính $y'$, tìm nghiệm $y'=0$ hoặc nơi $y'$ không xác định.
   - Tìm giới hạn tại vô cực và các đường tiệm cận (nếu có).
   - Lập Bảng biến thiên (BBT).
3. **Đồ thị:**
   - Tìm giao điểm với các trục Ox, Oy.
   - Xác định tính đối xứng (tâm đối xứng, trục đối xứng).
   - Vẽ đồ thị dựa trên BBT và các điểm đặc biệt.

## 2. Các dạng đồ thị trọng tâm
### 2.1. Hàm bậc ba: $y = ax^3 + bx^2 + cx + d \quad (a \neq 0)$
- **Dấu của a:** $a > 0$ thì nhánh cuối đi lên, $a < 0$ thì nhánh cuối đi xuống.
- **Số điểm cực trị:** Luôn có 0 hoặc 2 điểm cực trị (tùy thuộc vào biệt thức $\Delta$ của $y'$).
- **Tâm đối xứng:** Điểm uốn (nghiệm của $y'' = 0$).

### 2.2. Hàm trùng phương: $y = ax^4 + bx^2 + c \quad (a \neq 0)$
- Đồ thị luôn đối xứng qua trục tung (Oy).
- **Trường hợp $a \cdot b \ge 0$:** Có 1 cực trị (tại $x=0$).
- **Trường hợp $a \cdot b < 0$:** Có 3 cực trị.

### 2.3. Hàm bậc nhất trên bậc nhất: $y = \frac{ax+b}{cx+d} \quad (c \neq 0, ad-bc \neq 0)$
- Luôn có 1 tiệm cận đứng $x = -\frac{d}{c}$ và 1 tiệm cận ngang $y = \frac{a}{c}$.
- Tâm đối xứng là giao điểm của hai đường tiệm cận.

## 3. Các sai lầm thường gặp (Dùng để AI phân tích)
- **Nhầm lẫn giữa các hàm số có hình dáng tương tự:** Ví dụ nhầm đồ thị hàm bậc 3 (có 2 cực trị) với đồ thị hàm bậc nhất trên bậc nhất (không có cực trị).
- **Sai dấu hệ số a:** Không quan sát nhánh cuối cùng bên phải của đồ thị để xác định dấu của $a$.
- **Bỏ qua điểm uốn:** Không kiểm tra vị trí điểm uốn để loại trừ các phương án nhiễu có cùng cực trị nhưng khác hệ số $b$ hoặc $c$.
- **Quên điều kiện $ad-bc \neq 0$:** Đối với hàm phân thức, nếu $ad-bc = 0$ thì hàm số trở thành hàm hằng (đồ thị là đường thẳng), học sinh đôi khi vẫn chọn nó làm đồ thị đường cong.