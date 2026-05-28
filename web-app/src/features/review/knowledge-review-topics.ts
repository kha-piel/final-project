export type KnowledgeReviewTopic = {
  key: string
  title: string
  summary: string
  aliases: string[]
  sourcePaths: string[]
  lessons: KnowledgeReviewLesson[]
}

export type KnowledgeReviewLesson = {
  lessonKey: string
  title: string
  estimatedMinutes: number
  content: string
}

export const knowledgeReviewTopics: KnowledgeReviewTopic[] = [
  {
    key: 'hinh-hoc-khong-gian-oxyz',
    title: 'Hình học không gian và Oxyz',
    summary: 'Ôn vectơ, mặt phẳng, đường thẳng, mặt cầu, khoảng cách và góc trong Oxyz.',
    aliases: [
      'hinh hoc khong gian',
      'oxyz',
      'toa do oxyz',
      'phuong trinh mat phang',
      'mat cau',
      'duong thang',
      'vecto khong gian',
    ],
    sourcePaths: [
      'Toan_Hoc/2_Hinh_Hoc_Khong_Gian/1_vecto_trong_khong_gian.md',
      'Toan_Hoc/2_Hinh_Hoc_Khong_Gian/3_bieu_thuc_toa_do_vecto.md',
      'Toan_Hoc/2_Hinh_Hoc_Khong_Gian/4_phuong_trinh_mat_phang.md',
      'Toan_Hoc/2_Hinh_Hoc_Khong_Gian/5_phuong_trinh_duong_thang.md',
      'Toan_Hoc/2_Hinh_Hoc_Khong_Gian/7_phuong_trinh_mat_cau.md',
    ],
    lessons: [
      {
        lessonKey: 'nen-tang-oxyz',
        title: 'Nền tảng Oxyz cần nắm',
        estimatedMinutes: 12,
        content: `
## Cần nắm chắc

- Vectơ trong không gian: tọa độ, độ dài, tích vô hướng, điều kiện vuông góc và song song.
- Mặt phẳng: dạng tổng quát $Ax + By + Cz + D = 0$, vectơ pháp tuyến $\\vec n=(A,B,C)$.
- Đường thẳng: điểm đi qua và vectơ chỉ phương; đối chiếu quan hệ đường thẳng - mặt phẳng.
- Mặt cầu: tâm $I(a,b,c)$, bán kính $R$, dạng $(x-a)^2+(y-b)^2+(z-c)^2=R^2$.
- Khoảng cách và góc: luôn xác định đúng đối tượng trước khi thay công thức.

## Cách ôn nhanh

1. Vẽ lại sơ đồ quan hệ: điểm, đường thẳng, mặt phẳng, mặt cầu.
2. Gạch chân dữ liệu cho sẵn: vectơ pháp tuyến, vectơ chỉ phương, điểm thuộc đối tượng.
3. Đổi mỗi câu về một mẫu: lập phương trình, tính khoảng cách, tính góc, kiểm tra tiếp xúc/cắt nhau.
4. Làm lại câu sai bằng cách viết rõ công thức trước, thay số sau.
`,
      },
      {
        lessonKey: 'vecto-khong-gian',
        title: 'Vectơ trong không gian',
        estimatedMinutes: 10,
        content: `
## Trọng tâm cần nhớ

- Tọa độ vectơ, tổng - hiệu vectơ, nhân vectơ với số.
- Vectơ cùng phương: các tọa độ tỉ lệ.
- Vectơ vuông góc: tích vô hướng bằng 0.
- Trung điểm, trọng tâm, hệ thức vectơ cơ bản trong tam giác và tứ diện.
- Biết điểm đầu và vectơ để tìm điểm cuối, hoặc ngược lại.

## Dạng đề THPT hay hỏi

1. Tính nhanh $\\overrightarrow{AB}$, độ dài, trung điểm, trọng tâm.
2. Xét song song, vuông góc giữa hai vectơ.
3. Dùng hệ thức vectơ trong tam giác, hình bình hành, hình hộp.
4. Bài tham số thường đưa về điều kiện cùng phương, vuông góc hoặc đồng phẳng.
`,
      },
      {
        lessonKey: 'mat-phang-oxyz',
        title: 'Phương trình mặt phẳng trong Oxyz',
        estimatedMinutes: 11,
        content: `
## Dạng trọng tâm

- Viết mặt phẳng khi biết một điểm và một vectơ pháp tuyến.
- Viết mặt phẳng qua ba điểm không thẳng hàng.
- Nhận diện hai mặt phẳng song song, vuông góc qua vectơ pháp tuyến.
- Tính khoảng cách từ điểm đến mặt phẳng và xét vị trí tương đối cơ bản.

## Mẹo làm nhanh

1. Luôn xác định ngay vectơ pháp tuyến nếu đề chưa cho trực tiếp.
2. Nếu mặt phẳng đi qua ba điểm, lấy hai vectơ chỉ phương rồi tích có hướng để tìm pháp tuyến.
3. Với khoảng cách, viết chuẩn công thức rồi mới thay số.
4. Bài tham số nên quy về điều kiện để hệ số của pháp tuyến thỏa mãn quan hệ song song/vuông góc.
`,
      },
      {
        lessonKey: 'oxyz-dang-thpt',
        title: 'Dạng THPT quốc gia trong Oxyz',
        estimatedMinutes: 10,
        content: `
## Các dạng ra rất nhiều

- Tọa độ vectơ, trung điểm, độ dài đoạn thẳng.
- Phương trình mặt phẳng: biết điểm và vectơ pháp tuyến, hoặc qua ba điểm.
- Phương trình đường thẳng: biết điểm và vectơ chỉ phương, hoặc qua hai điểm.
- Mặt cầu: tìm tâm, bán kính, phương trình theo tâm - bán kính hoặc đường kính.
- Khoảng cách và góc: điểm đến mặt phẳng, điểm đến đường thẳng, góc giữa hai đường, đường và mặt.

## Mẹo làm nhanh

1. Đọc đề và xác định đối tượng cần tìm trước: vectơ, đường thẳng, mặt phẳng hay mặt cầu.
2. Với đường thẳng và mặt phẳng, ưu tiên tìm vectơ chỉ phương hoặc pháp tuyến trước khi lập phương trình.
3. Với khoảng cách, viết đúng công thức rồi mới thay số.
4. Gặp bài tham số, đưa về điều kiện vuông góc, song song, tiếp xúc hoặc cách đều.
`,
      },
    ],
  },
  {
    key: 'nguyen-ham-tich-phan',
    title: 'Nguyên hàm và tích phân',
    summary: 'Ôn bảng nguyên hàm cơ bản, đổi biến, từng phần và ứng dụng diện tích.',
    aliases: ['nguyen ham', 'tich phan', 'ung dung hinh hoc tich phan', 'dien tich hinh phang'],
    sourcePaths: [
      'Toan_Hoc/4_Nguyen_Ham_Tich_Phan/1_nguyen_ham.md',
      'Toan_Hoc/4_Nguyen_Ham_Tich_Phan/2_tich_phan.md',
      'Toan_Hoc/4_Nguyen_Ham_Tich_Phan/3_ung_dung_hinh_hoc_tich_phan.md',
    ],
    lessons: [
      {
        lessonKey: 'nguyen-ham-co-ban',
        title: 'Nguyên hàm cơ bản',
        estimatedMinutes: 10,
        content: `
## Cần nắm chắc

- Nguyên hàm cơ bản: lũy thừa, mũ, logarit, lượng giác.
- Tích phân xác định: cận đúng, thứ tự cận đúng và dùng tính chất tuyến tính.
- Đổi biến khi biểu thức có hàm hợp rõ ràng.
- Từng phần khi có tích của hai nhóm hàm, thường gặp đa thức với mũ/log/lượng giác.
- Diện tích hình phẳng: $S=\\int_a^b |f(x)-g(x)|dx$.

## Cách ôn nhanh

1. Học lại bảng nguyên hàm trước khi làm bài biến đổi.
2. Mỗi bài tích phân hãy thu gọn biểu thức và nhận diện mẫu.
3. Nếu có cận là giao điểm, giải phương trình giao trước rồi mới tính diện tích.
`,
      },
      {
        lessonKey: 'nguyen-ham-thpt',
        title: 'Nguyên hàm bám sát đề THPT',
        estimatedMinutes: 9,
        content: `
## Dạng hay gặp

- Tìm nguyên hàm trực tiếp bằng công thức.
- Chọn hằng số để nguyên hàm thỏa điều kiện $F(x_0)=y_0$.
- Nhận diện nhanh dạng đổi biến đơn giản như $f'(x)e^{f(x)}$, $f'(x)\\cos(f(x))$.
- So sánh các đáp án bằng đạo hàm ngược lại để kiểm tra.

## Lỗi cần tránh

1. Quên cộng hằng số $C$.
2. Nhầm dấu của nguyên hàm lượng giác.
3. Áp dụng đổi biến khi chưa xuất hiện đạo hàm đi kèm ở mức phù hợp.
`,
      },
      {
        lessonKey: 'tich-phan-dien-tich',
        title: 'Tích phân và diện tích hình phẳng',
        estimatedMinutes: 11,
        content: `
## Trọng tâm

- Tính tích phân xác định bằng công thức nguyên hàm.
- Dùng tính chất tuyến tính và đối xứng trong các bài rút gọn nhanh.
- Tính diện tích giữa hai đồ thị sau khi tìm giao điểm.
- Xét dấu của $f(x)-g(x)$ để tránh sai trị tuyệt đối.

## Cách làm nhanh

1. Tìm cận trước, nhất là khi cận là nghiệm giao của hai đồ thị.
2. Viết biểu thức diện tích bằng trị tuyệt đối rồi mới tách khoảng nếu cần.
3. Kiểm tra lại dấu của kết quả vì diện tích luôn không âm.
`,
      },
      {
        lessonKey: 'sai-lam-thuong-gap',
        title: 'Sai lầm thường gặp',
        estimatedMinutes: 8,
        content: `
## Các lỗi cần tránh

- Quên cộng hằng số $C$ khi tìm họ nguyên hàm.
- Dùng sai công thức: không có quy tắc $\\int f(x)g(x)dx=\\int f(x)dx \\cdot \\int g(x)dx$.
- Quên trị tuyệt đối trong $\\int \\frac{1}{x}dx=\\ln |x|+C$.
- Nhầm dấu của nguyên hàm lượng giác, đặc biệt $\\int \\sin xdx=-\\cos x+C$.

## Checklist khi làm bài

1. Xác định bài hỏi nguyên hàm hay tích phân xác định.
2. Ghi công thức hoặc mẫu biến đổi trước khi thay số.
3. Kiểm tra lại dấu, cận và điều kiện xác định.
`,
      },
    ],
  },
  {
    key: 'khao-sat-ham-so-cuc-tri',
    title: 'Khảo sát hàm số, cực trị và GTLN/GTNN',
    summary: 'Ôn đạo hàm, bảng biến thiên, cực trị, đơn điệu, tiệm cận và đọc đồ thị hàm số.',
    aliases: [
      'khao sat ham so',
      'cuc tri',
      'dong bien',
      'nghich bien',
      'gia tri lon nhat',
      'gia tri nho nhat',
      'gtln',
      'gtnn',
      'dao ham',
      'duong tiem can',
      'tiem can',
      'doc do thi',
    ],
    sourcePaths: [
      'Toan_Hoc/1_Ham_So/1_tinh_don_dieu.md',
      'Toan_Hoc/1_Ham_So/2_cuc_tri_ham_so.md',
      'Toan_Hoc/1_Ham_So/3_gia_tri_lon_nhat_nho_nhat.md',
      'Toan_Hoc/1_Ham_So/4_duong_tiem_can.md',
      'Toan_Hoc/1_Ham_So/5_khao_sat_do_thi.md',
    ],
    lessons: [
      {
        lessonKey: 'bang-bien-thien',
        title: 'Đạo hàm và bảng biến thiên',
        estimatedMinutes: 12,
        content: `
## Cần nắm chắc

- Tính đạo hàm và xét dấu $f'(x)$.
- Hàm số đồng biến khi $f'(x)>0$, nghịch biến khi $f'(x)<0$ trên khoảng đang xét.
- Điểm cực trị thường xuất hiện khi $f'(x)=0$ hoặc $f'(x)$ không xác định và $f'(x)$ đổi dấu.
- GTLN/GTNN trên đoạn: tính giá trị tại điểm tới hạn và hai đầu mút.

## Cách ôn nhanh

1. Lập bảng biến thiên đầy đủ, không nhảy thẳng sang kết luận.
2. Tách rõ bài hỏi cực trị, đơn điệu hay GTLN/GTNN.
3. Với bài thực tế, đặt hàm mục tiêu trước rồi mới đạo hàm.
`,
      },
      {
        lessonKey: 'duong-tiem-can',
        title: 'Đường tiệm cận',
        estimatedMinutes: 10,
        content: `
## Cần nắm chắc

- Tiệm cận đứng $x=x_0$: xảy ra khi ít nhất một giới hạn một bên của $f(x)$ tại $x_0$ bằng $\\pm\\infty$.
- Tiệm cận ngang $y=y_0$: xét $\\lim_{x\\to +\\infty}f(x)$ và $\\lim_{x\\to -\\infty}f(x)$.
- Với hàm phân thức $y=\\dfrac{P(x)}{Q(x)}$:
  - Nghiệm của $Q(x)=0$ sau khi rút gọn là ứng viên tiệm cận đứng.
  - Nếu $\\deg P < \\deg Q$ thì thường có tiệm cận ngang $y=0$.
  - Nếu $\\deg P = \\deg Q$ thì tiệm cận ngang là tỉ số hai hệ số bậc cao nhất.
- Nếu tử và mẫu cùng triệt tiêu tại một điểm, phải rút gọn trước rồi mới kết luận có tiệm cận đứng hay không.

## Cách ôn nhanh

1. Tìm tập xác định trước.
2. Rút gọn biểu thức nếu có nhân tử chung hoặc liên hợp.
3. Xét riêng tiệm cận đứng rồi mới xét tiệm cận ngang.
4. Với bài tham số, quy về điều kiện để mẫu bằng 0 nhưng tử khác 0.
`,
      },
      {
        lessonKey: 'khao-sat-do-thi',
        title: 'Khảo sát và đọc đồ thị hàm số',
        estimatedMinutes: 11,
        content: `
## Dạng cần luyện

- Đọc số giao điểm với trục tọa độ và các điểm cực trị từ đồ thị.
- Suy ra khoảng đồng biến, nghịch biến từ hình dạng đường cong.
- Liên hệ đồ thị của $f(x)$ với đồ thị của $f'(x)$ ở các câu nhận biết và thông hiểu.
- Nhận dạng nhanh dạng đồ thị bậc ba, trùng phương, phân thức quen thuộc.

## Mẹo làm nhanh

1. Đọc chiều đi của đồ thị từ trái sang phải trước khi kết luận đơn điệu.
2. Chú ý các điểm gãy, tiệm cận và vị trí tương đối với trục hoành.
3. Với câu hỏi về số nghiệm, nghĩ ngay đến số giao điểm giữa đồ thị và đường thẳng tương ứng.
`,
      },
    ],
  },
  {
    key: 'xac-suat-to-hop',
    title: 'Tổ hợp, xác suất và đếm',
    summary: 'Ôn quy tắc cộng/nhân, chỉnh hợp, tổ hợp, xác suất cổ điển và biến cố độc lập.',
    aliases: [
      'xac suat',
      'quy tac dem',
      'to hop',
      'hoan vi',
      'chinh hop',
      'xac suat co dieu kien',
      'bayes',
      'bien co doc lap',
    ],
    sourcePaths: [
      'Toan_Hoc/5_To_Hop_Xac_Suat/1_quy_tac_dem_va_hoan_vi_to_hop.md',
      'Toan_Hoc/3_Thong_Ke_Xac_Suat/3_xac_suat_co_dieu_kien.md',
      'Toan_Hoc/3_Thong_Ke_Xac_Suat/4_xac_suat_toan_phan_bayes.md',
      'Toan_Hoc/3_Thong_Ke_Xac_Suat/2_xac_suat_bien_co_doc_lap.md',
    ],
    lessons: [
      {
        lessonKey: 'quy-tac-dem',
        title: 'Tổ hợp, xác suất và đếm',
        estimatedMinutes: 12,
        content: `
## Cần nắm chắc

- Quy tắc cộng: các trường hợp loại trừ nhau.
- Quy tắc nhân: các bước liên tiếp cùng xảy ra.
- Tổ hợp $C_n^k$: chọn không xét thứ tự.
- Chỉnh hợp/hoán vị: có xét thứ tự.
- Xác suất cổ điển: số phần tử thuận lợi chia cho số phần tử của không gian mẫu.

## Cách ôn nhanh

1. Viết rõ không gian mẫu và biến cố cần tính.
2. Tự hỏi: bài có xét thứ tự không, có lặp không, các trường hợp có giao nhau không.
3. Khi đếm nhiều bước, chốt từng bước rồi mới nhân.
`,
      },
      {
        lessonKey: 'xac-suat-doc-lap',
        title: 'Xác suất biến cố độc lập',
        estimatedMinutes: 10,
        content: `
## Trọng tâm

- Hai biến cố độc lập thỏa $P(A\\cap B)=P(A)P(B)$.
- Với các phép thử độc lập, xác suất “ít nhất một lần xảy ra” thường tính qua biến cố đối.
- Cần phân biệt độc lập với xung khắc: xung khắc không đồng nghĩa độc lập.

## Mẹo xử lý nhanh

1. Nếu bài cho các phép thử lặp lại độc lập, chuyển ngay về mô hình nhân xác suất.
2. Với “không xảy ra lần nào”, tính từng lần rồi nhân.
3. Khi thấy “ít nhất một”, ưu tiên $1-P(\\text{không lần nào xảy ra})$.
`,
      },
    ],
  },
  {
    key: 'cap-so-cong-cap-so-nhan',
    title: 'Cấp số cộng và cấp số nhân',
    summary: 'Ôn nhận diện CSC/CSN, công sai, công bội, số hạng tổng quát và tổng n số hạng đầu.',
    aliases: ['cap so cong', 'cap so nhan', 'day so cap so cong', 'day so cap so nhan', 'cong sai', 'cong boi', 'u1', 'sn'],
    sourcePaths: [
      'Toan_Hoc/1_Ham_So/8_cap_so_cong_va_cap_so_nhan.md',
      'Toan_Hoc/1_Ham_So/8_cap_so_cong_va_cap_so_nhan_exam_focus.md',
    ],
    lessons: [
      {
        lessonKey: 'cap-so-trong-tam-thi',
        title: 'Trọng tâm thi: cấp số cộng và cấp số nhân',
        estimatedMinutes: 14,
        content: `
## Học trước vì hay xuất hiện

### Cấp số cộng

- Nhận biết dãy là cấp số cộng.
- Tìm công sai $d$.
- Tính số hạng tổng quát: $u_n=u_1+(n-1)d$.
- Tính tổng $n$ số hạng đầu: $S_n=\\frac{n(u_1+u_n)}{2}$ hoặc $S_n=\\frac{n[2u_1+(n-1)d]}{2}$.
- Tìm $n$ khi biết $u_n$ hoặc $S_n$.

### Cấp số nhân

- Nhận biết dãy là cấp số nhân.
- Tìm công bội $q$.
- Tính số hạng tổng quát: $u_n=u_1q^{n-1}$.
- Tính tổng $n$ số hạng đầu: $S_n=\\frac{u_1(1-q^n)}{1-q}$ với $q \\ne 1$.
- Bài toán thực tế: lãi kép, tăng trưởng, gửi tiền, dân số.

## Cách lọc câu khi luyện

1. Ưu tiên câu nhận biết cấp số, tìm $d$, tìm $q$.
2. Sau đó luyện câu tính $u_n$, $S_n$.
3. Mức vận dụng mới thêm bài lãi kép/tăng trưởng.
4. Gặp dãy truy hồi hoặc biến đổi dãy, hãy quy về nhận diện cấp số trước khi thế số.
`,
      },
      {
        lessonKey: 'nhan-dien-va-cong-thuc',
        title: 'Nhận diện nhanh và đúng công thức',
        estimatedMinutes: 10,
        content: `
## Checklist làm nhanh

- Đọc kỹ xem đề cho $u_1$, $d$, $q$, $u_n$ hay $S_n$.
- Nếu hiệu hai số hạng liên tiếp không đổi, nghĩ nhiều đến CSC.
- Nếu tỉ số hai số hạng liên tiếp không đổi, nghĩ nhiều đến CSN.
- Không nhầm công thức $u_n$ với $S_n$.

## Lỗi hay gặp

- Quên điều kiện $q \\ne 1$ khi dùng công thức tổng CSN.
- Thay sai vị trí $n-1$ trong công thức số hạng tổng quát.
- Nhầm giữa dãy số bất kỳ và dãy là cấp số.
`,
      },
    ],
  },
  {
    key: 'mu-logarit-gioi-han',
    title: 'Mũ, logarit và giới hạn dãy số',
    summary: 'Ôn phương trình mũ - logarit, điều kiện logarit và các mẫu giới hạn dãy số hay gặp.',
    aliases: ['mu', 'logarit', 'phuong trinh mu', 'phuong trinh logarit', 'gioi han day so', 'day so'],
    sourcePaths: [
      'Toan_Hoc/1_Ham_So/7_phuong_trinh_mu_va_logarit.md',
      'Toan_Hoc/5_Gioi_Han_Day_So/1_gioi_han_day_so.md',
    ],
    lessons: [
      {
        lessonKey: 'mu-log-gioi-han',
        title: 'Mũ, logarit và giới hạn dãy số',
        estimatedMinutes: 12,
        content: `
## Cần nắm chắc

- Điều kiện của logarit: cơ số dương khác 1, biểu thức trong log lớn hơn 0.
- Biến đổi mũ - log cần giữ đúng cơ số và điều kiện.
- Giới hạn dãy số: rút gọn bậc cao nhất hoặc đưa về dạng quen thuộc.
- Nếu dãy cho bằng công thức truy hồi hay phân thức, xác định xu hướng trước khi kết luận giới hạn.

## Cách ôn nhanh

1. Ghi điều kiện ngay đầu bài với logarit.
2. Đổi về cùng cơ số nếu có thể.
3. Với giới hạn dãy số, tìm mẫu chuẩn: chia cả tử mẫu cho lũy thừa bậc cao nhất, dùng kẹp, hoặc đưa về dãy hình học quen thuộc.
`,
      },
      {
        lessonKey: 'phuong-trinh-mu-logarit',
        title: 'Phương trình mũ và logarit',
        estimatedMinutes: 10,
        content: `
## Dạng cần nắm

- Đưa về cùng cơ số để so sánh số mũ.
- Dùng tính đơn điệu của hàm mũ và logarit ở các câu nhận biết nhanh.
- Đặt ẩn phụ khi xuất hiện nhiều mũ cùng kiểu.
- Kết hợp điều kiện xác định để loại nghiệm ngoại lai.

## Lỗi dễ gặp

1. Bỏ quên điều kiện của biểu thức trong logarit.
2. Đồng nhất hai biểu thức mũ khi cơ số chưa phù hợp.
3. Quên đối chiếu nghiệm với điều kiện sau khi giải.
`,
      },
      {
        lessonKey: 'gioi-han-day-so-thi-thpt',
        title: 'Giới hạn dãy số trong đề thi THPT',
        estimatedMinutes: 10,
        content: `
## Trọng tâm cần nhớ

- Nhập dạng nhanh: phân thức hữu tỉ, căn thức, dãy mũ, dãy có dấu $(-1)^n$.
- Nếu bậc tử và mẫu bằng nhau, lấy tỉ số hệ số bậc cao nhất.
- Nếu có căn, ưu tiên nhân liên hợp hoặc đưa thừa số lớn nhất ra ngoài căn.
- Các dãy dạng $q^n$ với $|q|<1$ đều có giới hạn bằng 0.
- Bài tham số thường quy về việc cho giới hạn bằng một số cụ thể để tìm hệ số.

## Lỗi dễ mất điểm

- Chia sai cho lũy thừa bậc cao nhất.
- Quên xét dấu khi có $(-1)^n$.
- Thay ngay vô hạn mà không rút gọn.
- Gặp căn thức nhưng không liên hợp nên kết quả bị sai.
`,
      },
    ],
  },
  {
    key: 'quy-hoach-tuyen-tinh-toi-uu',
    title: 'Quy hoạch tuyến tính và bài toán tối ưu',
    summary: 'Ôn miền nghiệm hệ bất phương trình, đỉnh miền đa giác và tối ưu hàm mục tiêu.',
    aliases: ['quy hoach tuyen tinh', 'bai toan toi uu', 'mien nghiem', 'ham muc tieu'],
    sourcePaths: ['Toan_Hoc/6_Quy_Hoach_Tuyen_Tinh/1_quy_hoach_tuyen_tinh_va_bai_toan_toi_uu.md'],
    lessons: [
      {
        lessonKey: 'mien-nghiem-quy-hoach',
        title: 'Miền nghiệm và đường biên',
        estimatedMinutes: 10,
        content: `
## Cần nắm chắc

- Biểu diễn từng bất phương trình bậc nhất hai ẩn bằng một nửa mặt phẳng.
- Miền nghiệm của hệ là phần giao các nửa mặt phẳng thỏa tất cả điều kiện.
- Các điểm đỉnh của miền nghiệm là nơi cần kiểm tra hàm mục tiêu trong bài toán tối ưu tuyến tính.

## Cách làm nhanh

1. Vẽ từng đường biên dưới dạng đẳng thức.
2. Dùng điểm thử, thường là gốc tọa độ, để chọn đúng phía của đường thẳng.
3. Chốt các đỉnh của miền nghiệm trước khi tính GTLN/GTNN.
`,
      },
      {
        lessonKey: 'toi-uu-tuyen-tinh',
        title: 'Tối ưu hàm mục tiêu',
        estimatedMinutes: 11,
        content: `
## Dạng trọng tâm

- Tính giá trị $F=ax+by$ tại các đỉnh của miền nghiệm.
- Xác định GTLN, GTNN của hàm mục tiêu.
- Dịch bài toán thực tế về biến số, ràng buộc và hàm mục tiêu tuyến tính.

## Lưu ý

1. Không thử giá trị ngẫu nhiên trong miền nếu chưa xét các đỉnh.
2. Nếu miền nghiệm không bị chặn, cần kiểm tra khả năng không tồn tại GTLN hoặc GTNN.
3. Bài thực tế phải ghi rõ đơn vị của hàm mục tiêu trước khi kết luận.
`,
      },
    ],
  },
  {
    key: 'tu-phan-vi-so-lieu-ghep-nhom',
    title: 'Tứ phân vị và số liệu ghép nhóm',
    summary: 'Ôn trung vị, tứ phân vị, khoảng tứ phân vị và đọc bảng tần số/tần suất ghép nhóm.',
    aliases: ['tu phan vi', 'so lieu ghep nhom', 'trung vi', 'tan so', 'tan suat', 'iqr'],
    sourcePaths: ['Toan_Hoc/3_Thong_Ke_Xac_Suat/1_tu_phan_vi_va_so_lieu_ghep_nhom.md'],
    lessons: [
      {
        lessonKey: 'tu-phan-vi',
        title: 'Tứ phân vị và trung vị',
        estimatedMinutes: 9,
        content: `
## Cần nhớ

- Trung vị chia mẫu số liệu đã sắp xếp thành hai nửa bằng nhau.
- $Q_1$ là trung vị của nửa dưới, $Q_3$ là trung vị của nửa trên.
- Khoảng tứ phân vị $IQR = Q_3 - Q_1$ phản ánh độ phân tán trung tâm của dữ liệu.

## Mẹo làm nhanh

1. Sắp thứ tự dữ liệu trước khi xác định trung vị hoặc tứ phân vị.
2. Với số phần tử chẵn/lẻ, xác định đúng cách chia hai nửa mẫu.
3. Nếu đề cho bảng tần số, quy về vị trí của quan sát trong mẫu.
`,
      },
      {
        lessonKey: 'so-lieu-ghep-nhom',
        title: 'Số liệu ghép nhóm',
        estimatedMinutes: 10,
        content: `
## Trọng tâm

- Đọc lớp ghép nhóm, tần số, tần suất và tần số tích lũy.
- Xác định lớp chứa trung vị hoặc tứ phân vị từ tần số tích lũy.
- Nội suy tuyến tính ở mức THPT khi đề yêu cầu giá trị gần đúng trong lớp chứa trung vị hoặc $Q_1$, $Q_3$.

## Lỗi cần tránh

1. Nhầm cận lớp với trung điểm lớp.
2. Cộng thiếu tần số tích lũy.
3. Dùng sai độ dài lớp khi nội suy.
`,
      },
    ],
  },
  {
    key: 'hoa-hoc-polymer',
    title: 'Polymer',
    summary: 'Đại cương về polymer, phản ứng trùng hợp, trùng ngưng và các loại vật liệu polymer.',
    aliases: ['polymer', 'trung hop', 'trung ngung', 'nhua', 'cao su', 'to'],
    sourcePaths: ['Hoa_Hoc/4_Polymer/1_dai_cuong_ve_polymer.md'],
    lessons: [
      {
        lessonKey: 'tong-quan-polymer',
        title: 'Tổng quan Polymer',
        estimatedMinutes: 10,
        content: `
## Trọng tâm

- Khái niệm, danh pháp, cấu trúc và phân loại polymer.
- Phản ứng trùng hợp và phản ứng trùng ngưng.
- Các loại vật liệu polymer phổ biến: chất dẻo, tơ, cao su, keo dán.

## Mẹo làm bài

- Nắm chắc điều kiện để một monomer có thể tham gia trùng hợp (có liên kết đôi) hoặc trùng ngưng (có ít nhất 2 nhóm chức có thể phản ứng).
- Phân biệt các loại tơ (tơ tự nhiên, tơ tổng hợp, tơ bán tổng hợp).
`
      }
    ]
  },
  {
    key: 'hoa-hoc-carbohydrate',
    title: 'Carbohydrate',
    summary: 'Cấu tạo, tính chất hóa học của glucose, fructose, saccharose, tinh bột và cellulose.',
    aliases: ['carbohydrate', 'glucose', 'fructose', 'saccharose', 'tinh bot', 'cellulose'],
    sourcePaths: ['Hoa_Hoc/2_Carbohydrate/1_dai_cuong_carbohydrate.md'],
    lessons: [
      {
        lessonKey: 'tinh-chat-carbohydrate',
        title: 'Tính chất Carbohydrate',
        estimatedMinutes: 12,
        content: `
## Trọng tâm

- Phân loại carbohydrate: monosaccharide, disaccharide, polysaccharide.
- Tính chất của nhóm aldehyde trong glucose (tráng bạc, tác dụng Cu(OH)2 đun nóng).
- Tính chất của polyalcohol (hòa tan Cu(OH)2 tạo dung dịch xanh lam).
- Phản ứng thủy phân của disaccharide và polysaccharide.

## Mẹo làm bài

- Lập bảng so sánh tính chất của các carbohydrate để dễ nhớ.
- Chú ý môi trường phản ứng (ví dụ: fructose có thể chuyển thành glucose trong môi trường kiềm).
`
      }
    ]
  },
  {
    key: 'vat-ly-dao-dong-co',
    title: 'Dao động cơ',
    summary: 'Dao động điều hòa, con lắc lò xo, con lắc đơn, năng lượng dao động và tổng hợp dao động.',
    aliases: ['dao dong co', 'dao dong dieu hoa', 'con lac lo xo', 'con lac don'],
    sourcePaths: ['Vat_Ly/1_Dao_Dong_Co/1_dao_dong_dieu_hoa.md'],
    lessons: [
      {
        lessonKey: 'phuong-trinh-dao-dong',
        title: 'Phương trình và các đại lượng',
        estimatedMinutes: 15,
        content: `
## Trọng tâm

- Phương trình li độ: $x = A\\cos(\\omega t + \\varphi)$.
- Vận tốc, gia tốc, lực kéo về.
- Năng lượng: động năng, thế năng, cơ năng.
- Con lắc lò xo và con lắc đơn (chu kì, tần số).

## Mẹo làm bài

- Dùng đường tròn lượng giác để giải nhanh các bài toán về thời gian và quãng đường.
- Nhớ các công thức độc lập với thời gian.
`
      }
    ]
  }
]

export function getKnowledgeReviewTopic(topicKey: string) {
  return knowledgeReviewTopics.find((topic) => topic.key === topicKey) ?? null
}

export function inferKnowledgeReviewTopics(inputs: string[], maxCount = 4) {
  const scores = new Map<string, number>()

  for (const input of inputs) {
    const normalized = normalizeForMatch(input)
    if (!normalized) {
      continue
    }

    for (const topic of knowledgeReviewTopics) {
      const matchedAlias = topic.aliases.some((alias) => normalized.includes(normalizeForMatch(alias)))
      const matchedPath = topic.sourcePaths.some((path) => normalized.includes(normalizeForMatch(path)))
      const matchedTitle = normalized.includes(normalizeForMatch(topic.title))

      if (matchedAlias || matchedPath || matchedTitle) {
        scores.set(topic.key, (scores.get(topic.key) ?? 0) + 1)
      }
    }
  }

  return knowledgeReviewTopics
    .map((topic) => ({ topic, score: scores.get(topic.key) ?? 0 }))
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, maxCount)
    .map((item) => item.topic)
}

function normalizeForMatch(input: string) {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[_/-]+/g, ' ')
    .replace(/[^a-z0-9\s]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}
