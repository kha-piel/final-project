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
    aliases: ['hinh hoc khong gian', 'oxyz', 'toa do oxyz', 'phuong trinh mat phang', 'mat cau', 'duong thang'],
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
2. Ghi công thức/mẫu biến đổi trước khi thay số.
3. Kiểm tra lại dấu, cận và điều kiện xác định.
`,
      },
    ],
  },
  {
    key: 'khao-sat-ham-so-cuc-tri',
    title: 'Khảo sát hàm số, cực trị và GTLN/GTNN',
    summary: 'Ôn đạo hàm, bảng biến thiên, cực trị, đơn điệu và giá trị lớn nhất nhỏ nhất.',
    aliases: ['khao sat ham so', 'cuc tri', 'dong bien', 'nghich bien', 'gia tri lon nhat', 'gia tri nho nhat', 'gtln', 'gtnn', 'dao ham'],
    sourcePaths: [
      'Toan_Hoc/1_Ham_So/1_tinh_don_dieu.md',
      'Toan_Hoc/1_Ham_So/2_cuc_tri_ham_so.md',
      'Toan_Hoc/1_Ham_So/3_gia_tri_lon_nhat_nho_nhat.md',
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
    ],
  },
  {
    key: 'xac-suat-to-hop',
    title: 'Xác suất, quy tắc đếm và tổ hợp',
    summary: 'Ôn quy tắc cộng/nhân, hoán vị, chỉnh hợp, tổ hợp, xác suất có điều kiện.',
    aliases: ['xac suat', 'quy tac dem', 'to hop', 'hoan vi', 'chinh hop', 'xac suat co dieu kien', 'bayes'],
    sourcePaths: [
      'Toan_Hoc/5_To_Hop_Xac_Suat/1_quy_tac_dem_va_hoan_vi_to_hop.md',
      'Toan_Hoc/3_Thong_Ke_Xac_Suat/3_xac_suat_co_dieu_kien.md',
      'Toan_Hoc/3_Thong_Ke_Xac_Suat/4_xac_suat_toan_phan_bayes.md',
    ],
    lessons: [
      {
        lessonKey: 'quy-tac-dem',
        title: 'Quy tắc đếm và xác suất',
        estimatedMinutes: 12,
        content: `
## Cần nắm chắc

- Quy tắc cộng: các trường hợp loại trừ nhau.
- Quy tắc nhân: các bước liên tiếp cùng xảy ra.
- Tổ hợp $C_n^k$: chọn không xét thứ tự.
- Chỉnh hợp/hoán vị: có xét thứ tự.
- Xác suất có điều kiện: $P(A|B)=\\frac{P(A\\cap B)}{P(B)}$.

## Cách ôn nhanh

1. Viết rõ không gian mẫu và biến cố cần tính.
2. Tự hỏi: bài có xét thứ tự không, có lặp không, các trường hợp có giao nhau không.
3. Với Bayes/toàn phần, vẽ cây xác suất để tránh nhầm điều kiện.
`,
      },
    ],
  },
  {
    key: 'mu-logarit-cap-so',
    title: 'Mũ, logarit, cấp số và giới hạn',
    summary: 'Ôn phương trình mũ-logarit, cấp số cộng/nhân và giới hạn dãy số.',
    aliases: ['mu', 'logarit', 'phuong trinh mu', 'phuong trinh logarit', 'cap so cong', 'cap so nhan', 'gioi han day so', 'day so'],
    sourcePaths: [
      'Toan_Hoc/1_Ham_So/7_phuong_trinh_mu_va_logarit.md',
      'Toan_Hoc/1_Ham_So/8_cap_so_cong_va_cap_so_nhan.md',
      'Toan_Hoc/1_Ham_So/8_cap_so_cong_va_cap_so_nhan_exam_focus.md',
      'Toan_Hoc/5_Gioi_Han_Day_So/1_gioi_han_day_so.md',
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

## Ôn sau nếu còn yếu

- Dãy số tăng/giảm.
- Dãy bị chặn, chặn trên, chặn dưới.
- Dãy truy hồi.
- Tìm số hạng nguyên, số hạng chính phương.

## Cách lọc câu khi luyện

1. Ưu tiên câu nhận biết cấp số, tìm $d$, tìm $q$.
2. Sau đó luyện câu tính $u_n$, $S_n$.
3. Mức vận dụng mới thêm bài lãi kép/tăng trưởng.
4. Câu dãy số thuần túy chỉ dùng để bổ trợ, không trộn quá nhiều vào bài ôn chính.
`,
      },
      {
        lessonKey: 'mu-log-cap-so',
        title: 'Mũ, logarit và cấp số',
        estimatedMinutes: 12,
        content: `
## Cần nắm chắc

- Điều kiện của logarit: cơ số dương khác 1, biểu thức trong log lớn hơn 0.
- Biến đổi mũ-log cần giữ đúng cơ số và điều kiện.
- Cấp số cộng: $u_n=u_1+(n-1)d$.
- Cấp số nhân: $u_n=u_1q^{n-1}$.
- Giới hạn dãy số: rút gọn bậc cao nhất hoặc đưa về dạng quen thuộc.

## Cách ôn nhanh

1. Ghi điều kiện ngay đầu bài với logarit.
2. Đổi về cùng cơ số nếu có thể.
3. Với cấp số, xác định $u_1$, công sai/công bội trước khi thay công thức.
`,
      },
    ],
  },
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
