import type { SchoolExamQuestionRecord } from '../types/school-exam-types'

type ChoiceLabel = 'A' | 'B' | 'C' | 'D'

type PhysicsQuestionSeed = {
  questionText: string
  answerValue: ChoiceLabel
  options: Array<{
    label: ChoiceLabel
    text: string
  }>
}

function buildTopicQuestions(
  slug: string,
  topic: string,
  obsidianSourcePath: string,
  items: PhysicsQuestionSeed[],
): SchoolExamQuestionRecord[] {
  return items.map((item, index) => ({
    questionId: `supplemental-vat-ly-${slug}-q${String(index + 1).padStart(2, '0')}`,
    examId: `supplemental-vat-ly-${slug}`,
    questionNumber: index + 1,
    questionType: 'multiple_choice',
    difficultyLevel: 1,
    questionText: item.questionText,
    statements: [],
    options: item.options.map((option, optionIndex) => ({
      optionLabel: option.label,
      optionText: option.text,
      displayOrder: optionIndex + 1,
    })),
    assetPaths: [],
    assets: [],
    topic,
    obsidianSourcePath,
    hasImage: false,
    answerValue: item.answerValue,
    sourceQuestionNumber: index + 1,
    sourceSectionNumber: 1,
    examTitle: `Bo cau hoi bo sung ${topic}`,
    schoolName: 'Noi bo he thong',
    year: 2026,
    pdfUrl: '',
    tags: ['supplemental', 'vat-ly', 'thptqg', slug],
  }))
}

const daoDongCoQuestions = buildTopicQuestions('dao-dong-co', 'Dao động cơ', 'Vat_Ly/dao_dong_co.md', [
  {
    questionText: 'Một vật dao động điều hòa với tần số góc $\\omega$. Chu kì dao động của vật là',
    answerValue: 'B',
    options: [
      { label: 'A', text: '$T = \\dfrac{\\omega}{2\\pi}$' },
      { label: 'B', text: '$T = \\dfrac{2\\pi}{\\omega}$' },
      { label: 'C', text: '$T = 2\\pi\\omega$' },
      { label: 'D', text: '$T = \\dfrac{1}{\\pi\\omega}$' },
    ],
  },
  {
    questionText: 'Trong dao động điều hòa, khi vật đi qua vị trí cân bằng thì',
    answerValue: 'C',
    options: [
      { label: 'A', text: 'li độ cực đại, vận tốc bằng không.' },
      { label: 'B', text: 'gia tốc cực đại, vận tốc bằng không.' },
      { label: 'C', text: 'vận tốc có độ lớn cực đại.' },
      { label: 'D', text: 'động năng bằng không.' },
    ],
  },
  {
    questionText: 'Con lắc lò xo có độ cứng $k$, vật nặng khối lượng $m$ dao động điều hòa. Tần số góc của con lắc là',
    answerValue: 'A',
    options: [
      { label: 'A', text: '$\\omega = \\sqrt{\\dfrac{k}{m}}$' },
      { label: 'B', text: '$\\omega = \\sqrt{\\dfrac{m}{k}}$' },
      { label: 'C', text: '$\\omega = 2\\pi\\sqrt{\\dfrac{k}{m}}$' },
      { label: 'D', text: '$\\omega = \\dfrac{k}{m}$' },
    ],
  },
  {
    questionText: 'Một con lắc đơn dao động điều hòa tại nơi có gia tốc trọng trường $g$. Khi tăng chiều dài dây treo lên 4 lần thì chu kì dao động',
    answerValue: 'D',
    options: [
      { label: 'A', text: 'giảm 2 lần.' },
      { label: 'B', text: 'tăng 4 lần.' },
      { label: 'C', text: 'giảm 4 lần.' },
      { label: 'D', text: 'tăng 2 lần.' },
    ],
  },
  {
    questionText: 'Cơ năng của con lắc lò xo dao động điều hòa biên độ $A$ là',
    answerValue: 'A',
    options: [
      { label: 'A', text: '$W = \\dfrac{1}{2}kA^2$' },
      { label: 'B', text: '$W = kA^2$' },
      { label: 'C', text: '$W = \\dfrac{1}{2}mA^2$' },
      { label: 'D', text: '$W = \\dfrac{1}{2}kA$' },
    ],
  },
  {
    questionText: 'Trong dao động điều hòa, gia tốc của vật',
    answerValue: 'B',
    options: [
      { label: 'A', text: 'luôn cùng chiều với vận tốc.' },
      { label: 'B', text: 'luôn hướng về vị trí cân bằng.' },
      { label: 'C', text: 'luôn cùng chiều với li độ.' },
      { label: 'D', text: 'không phụ thuộc li độ.' },
    ],
  },
  {
    questionText: 'Hiện tượng cộng hưởng cơ xảy ra khi',
    answerValue: 'C',
    options: [
      { label: 'A', text: 'biên độ lực cưỡng bức bằng biên độ dao động riêng.' },
      { label: 'B', text: 'tần số dao động riêng nhỏ hơn tần số lực cưỡng bức.' },
      { label: 'C', text: 'tần số lực cưỡng bức bằng tần số riêng của hệ.' },
      { label: 'D', text: 'pha của lực cưỡng bức bằng pha của li độ.' },
    ],
  },
  {
    questionText: 'Một vật dao động điều hòa với biên độ $A$. Khi vật ở vị trí có li độ $x = \\dfrac{A}{2}$ thì tỉ số động năng trên cơ năng của vật là',
    answerValue: 'D',
    options: [
      { label: 'A', text: '$\\dfrac{1}{4}$' },
      { label: 'B', text: '$\\dfrac{1}{2}$' },
      { label: 'C', text: '$\\dfrac{1}{8}$' },
      { label: 'D', text: '$\\dfrac{3}{4}$' },
    ],
  },
  {
    questionText: 'Một vật dao động điều hòa có phương trình $x = A\\cos(\\omega t + \\varphi)$. Vận tốc của vật được xác định bởi biểu thức',
    answerValue: 'A',
    options: [
      { label: 'A', text: '$v = -\\omega A\\sin(\\omega t + \\varphi)$' },
      { label: 'B', text: '$v = \\omega A\\cos(\\omega t + \\varphi)$' },
      { label: 'C', text: '$v = -\\omega^2 A\\cos(\\omega t + \\varphi)$' },
      { label: 'D', text: '$v = \\omega^2 A\\sin(\\omega t + \\varphi)$' },
    ],
  },
  {
    questionText: 'Trong một chu kì dao động điều hòa, vật đi từ vị trí biên dương đến vị trí cân bằng mất thời gian',
    answerValue: 'B',
    options: [
      { label: 'A', text: '$\\dfrac{T}{2}$' },
      { label: 'B', text: '$\\dfrac{T}{4}$' },
      { label: 'C', text: '$\\dfrac{T}{6}$' },
      { label: 'D', text: '$\\dfrac{T}{8}$' },
    ],
  },
])

const songCoQuestions = buildTopicQuestions('song-co', 'Sóng cơ', 'Vat_Ly/song_co.md', [
  {
    questionText: 'Một sóng cơ truyền với tốc độ $v$ và tần số $f$. Bước sóng của sóng là',
    answerValue: 'C',
    options: [
      { label: 'A', text: '$\\lambda = vf$' },
      { label: 'B', text: '$\\lambda = \\dfrac{f}{v}$' },
      { label: 'C', text: '$\\lambda = \\dfrac{v}{f}$' },
      { label: 'D', text: '$\\lambda = 2vf$' },
    ],
  },
  {
    questionText: 'Trong sóng cơ hình sin, các phần tử môi trường dao động',
    answerValue: 'A',
    options: [
      { label: 'A', text: 'quanh vị trí cân bằng và không truyền theo sóng.' },
      { label: 'B', text: 'theo chiều truyền sóng với cùng tốc độ sóng.' },
      { label: 'C', text: 'với biên độ tăng dần theo thời gian.' },
      { label: 'D', text: 'cùng pha tại mọi vị trí.' },
    ],
  },
  {
    questionText: 'Điều kiện để tại điểm M trong vùng giao thoa của hai nguồn kết hợp có cực đại giao thoa là',
    answerValue: 'D',
    options: [
      { label: 'A', text: '$d_2 - d_1 = \\left(k + \\dfrac{1}{2}\\right)\\lambda$' },
      { label: 'B', text: '$d_2 - d_1 = \\dfrac{k\\lambda}{2}$' },
      { label: 'C', text: '$d_2 + d_1 = k\\lambda$' },
      { label: 'D', text: '$d_2 - d_1 = k\\lambda$' },
    ],
  },
  {
    questionText: 'Trên một sợi dây có sóng dừng. Khoảng cách giữa hai nút liên tiếp bằng',
    answerValue: 'B',
    options: [
      { label: 'A', text: '$\\lambda$' },
      { label: 'B', text: '$\\dfrac{\\lambda}{2}$' },
      { label: 'C', text: '$\\dfrac{\\lambda}{4}$' },
      { label: 'D', text: '$2\\lambda$' },
    ],
  },
  {
    questionText: 'Sóng âm không truyền được trong',
    answerValue: 'C',
    options: [
      { label: 'A', text: 'chất rắn.' },
      { label: 'B', text: 'chất lỏng.' },
      { label: 'C', text: 'chân không.' },
      { label: 'D', text: 'không khí.' },
    ],
  },
  {
    questionText: 'Tốc độ truyền sóng trên dây phụ thuộc chủ yếu vào',
    answerValue: 'A',
    options: [
      { label: 'A', text: 'lực căng dây và khối lượng trên một đơn vị dài của dây.' },
      { label: 'B', text: 'biên độ dao động của nguồn.' },
      { label: 'C', text: 'pha ban đầu của nguồn.' },
      { label: 'D', text: 'độ dài đoạn dây có sóng.' },
    ],
  },
  {
    questionText: 'Một sóng cơ có tần số $20\\,\\text{Hz}$, truyền với tốc độ $4\\,\\text{m/s}$. Bước sóng của sóng là',
    answerValue: 'D',
    options: [
      { label: 'A', text: '$0{,}1\\,\\text{m}$' },
      { label: 'B', text: '$0{,}15\\,\\text{m}$' },
      { label: 'C', text: '$0{,}25\\,\\text{m}$' },
      { label: 'D', text: '$0{,}2\\,\\text{m}$' },
    ],
  },
  {
    questionText: 'Hai điểm trên cùng một phương truyền sóng cách nhau một khoảng đúng bằng một bước sóng thì chúng dao động',
    answerValue: 'B',
    options: [
      { label: 'A', text: 'ngược pha.' },
      { label: 'B', text: 'cùng pha.' },
      { label: 'C', text: 'vuông pha.' },
      { label: 'D', text: 'lệch pha $\\dfrac{\\pi}{4}$.' },
    ],
  },
  {
    questionText: 'Trên sợi dây dài $1{,}2\\,\\text{m}$ có sóng dừng với hai đầu cố định. Biết trên dây có 4 bụng sóng. Bước sóng là',
    answerValue: 'A',
    options: [
      { label: 'A', text: '$0{,}6\\,\\text{m}$' },
      { label: 'B', text: '$0{,}3\\,\\text{m}$' },
      { label: 'C', text: '$0{,}8\\,\\text{m}$' },
      { label: 'D', text: '$0{,}4\\,\\text{m}$' },
    ],
  },
  {
    questionText: 'Trong hiện tượng giao thoa sóng nước, hai nguồn kết hợp là hai nguồn dao động',
    answerValue: 'C',
    options: [
      { label: 'A', text: 'cùng biên độ và ngược pha không đổi.' },
      { label: 'B', text: 'cùng tần số nhưng hiệu số biên độ không đổi.' },
      { label: 'C', text: 'cùng tần số và có độ lệch pha không đổi theo thời gian.' },
      { label: 'D', text: 'cùng phương và cùng biên độ.' },
    ],
  },
])

const dienXoayChieuQuestions = buildTopicQuestions('dien-xoay-chieu', 'Điện xoay chiều', 'Vat_Ly/dien_xoay_chieu.md', [
  {
    questionText: 'Dòng điện xoay chiều có cường độ tức thời $i = I_0\\cos(\\omega t + \\varphi)$. Giá trị hiệu dụng của dòng điện là',
    answerValue: 'A',
    options: [
      { label: 'A', text: '$I = \\dfrac{I_0}{\\sqrt{2}}$' },
      { label: 'B', text: '$I = \\sqrt{2}I_0$' },
      { label: 'C', text: '$I = \\dfrac{I_0}{2}$' },
      { label: 'D', text: '$I = 2I_0$' },
    ],
  },
  {
    questionText: 'Trong mạch chỉ có điện trở thuần, điện áp và cường độ dòng điện',
    answerValue: 'D',
    options: [
      { label: 'A', text: 'lệch pha $\\dfrac{\\pi}{2}$.' },
      { label: 'B', text: 'lệch pha $\\dfrac{\\pi}{4}$.' },
      { label: 'C', text: 'ngược pha.' },
      { label: 'D', text: 'cùng pha.' },
    ],
  },
  {
    questionText: 'Cảm kháng của cuộn cảm thuần được xác định bởi công thức',
    answerValue: 'B',
    options: [
      { label: 'A', text: '$Z_L = \\dfrac{1}{\\omega L}$' },
      { label: 'B', text: '$Z_L = \\omega L$' },
      { label: 'C', text: '$Z_L = \\omega C$' },
      { label: 'D', text: '$Z_L = \\dfrac{L}{\\omega}$' },
    ],
  },
  {
    questionText: 'Dung kháng của tụ điện thuần là',
    answerValue: 'C',
    options: [
      { label: 'A', text: '$Z_C = \\omega C$' },
      { label: 'B', text: '$Z_C = \\omega^2 C$' },
      { label: 'C', text: '$Z_C = \\dfrac{1}{\\omega C}$' },
      { label: 'D', text: '$Z_C = \\dfrac{C}{\\omega}$' },
    ],
  },
  {
    questionText: 'Điều kiện để xảy ra cộng hưởng điện trong mạch RLC nối tiếp là',
    answerValue: 'A',
    options: [
      { label: 'A', text: '$Z_L = Z_C$' },
      { label: 'B', text: '$R = Z_L + Z_C$' },
      { label: 'C', text: '$R = 0$' },
      { label: 'D', text: '$Z_L = R$' },
    ],
  },
  {
    questionText: 'Công suất tiêu thụ của mạch điện xoay chiều một pha được tính bằng',
    answerValue: 'D',
    options: [
      { label: 'A', text: '$P = UI$' },
      { label: 'B', text: '$P = UI\\sin\\varphi$' },
      { label: 'C', text: '$P = I^2Z$' },
      { label: 'D', text: '$P = UI\\cos\\varphi$' },
    ],
  },
  {
    questionText: 'Máy biến áp lí tưởng có số vòng dây cuộn sơ cấp $N_1$, cuộn thứ cấp $N_2$. Hệ thức đúng là',
    answerValue: 'B',
    options: [
      { label: 'A', text: '$\\dfrac{U_1}{U_2} = \\dfrac{N_2}{N_1}$' },
      { label: 'B', text: '$\\dfrac{U_2}{U_1} = \\dfrac{N_2}{N_1}$' },
      { label: 'C', text: '$U_1U_2 = N_1N_2$' },
      { label: 'D', text: '$\\dfrac{U_2}{U_1} = \\dfrac{N_1}{N_2}$' },
    ],
  },
  {
    questionText: 'Một dòng điện xoay chiều có tần số $50\\,\\text{Hz}$. Tần số góc của dòng điện là',
    answerValue: 'C',
    options: [
      { label: 'A', text: '$50\\pi\\,\\text{rad/s}$' },
      { label: 'B', text: '$100\\,\\text{rad/s}$' },
      { label: 'C', text: '$100\\pi\\,\\text{rad/s}$' },
      { label: 'D', text: '$25\\pi\\,\\text{rad/s}$' },
    ],
  },
  {
    questionText: 'Trong mạch chỉ có tụ điện thuần, cường độ dòng điện so với điện áp hai đầu tụ thì',
    answerValue: 'A',
    options: [
      { label: 'A', text: 'sớm pha $\\dfrac{\\pi}{2}$.' },
      { label: 'B', text: 'trễ pha $\\dfrac{\\pi}{2}$.' },
      { label: 'C', text: 'cùng pha.' },
      { label: 'D', text: 'ngược pha.' },
    ],
  },
  {
    questionText: 'Một điện trở thuần $R = 100\\,\\Omega$ mắc vào điện áp xoay chiều có giá trị hiệu dụng $U = 220\\,\\text{V}$. Cường độ dòng điện hiệu dụng qua điện trở là',
    answerValue: 'D',
    options: [
      { label: 'A', text: '$0{,}45\\,\\text{A}$' },
      { label: 'B', text: '$1{,}2\\,\\text{A}$' },
      { label: 'C', text: '$2\\,\\text{A}$' },
      { label: 'D', text: '$2{,}2\\,\\text{A}$' },
    ],
  },
])

const daoDongVaSongDienTuQuestions = buildTopicQuestions(
  'dao-dong-va-song-dien-tu',
  'Dao động và sóng điện từ',
  'Vat_Ly/dao_dong_va_song_dien_tu.md',
  [
    {
      questionText: 'Trong mạch dao động LC lí tưởng, tần số dao động riêng được xác định bởi công thức',
      answerValue: 'A',
      options: [
        { label: 'A', text: '$f = \\dfrac{1}{2\\pi\\sqrt{LC}}$' },
        { label: 'B', text: '$f = 2\\pi\\sqrt{LC}$' },
        { label: 'C', text: '$f = \\dfrac{1}{\\sqrt{LC}}$' },
        { label: 'D', text: '$f = \\sqrt{LC}$' },
      ],
    },
    {
      questionText: 'Trong mạch dao động LC lí tưởng, khi điện tích trên tụ điện đạt giá trị cực đại thì',
      answerValue: 'C',
      options: [
        { label: 'A', text: 'dòng điện trong mạch cực đại.' },
        { label: 'B', text: 'năng lượng từ trường cực đại.' },
        { label: 'C', text: 'dòng điện trong mạch bằng không.' },
        { label: 'D', text: 'suất điện động trong mạch cực đại.' },
      ],
    },
    {
      questionText: 'Sóng điện từ truyền được trong',
      answerValue: 'D',
      options: [
        { label: 'A', text: 'chỉ chất khí.' },
        { label: 'B', text: 'chỉ chất rắn và chất lỏng.' },
        { label: 'C', text: 'môi trường vật chất, không truyền được trong chân không.' },
        { label: 'D', text: 'cả chân không và môi trường vật chất.' },
      ],
    },
    {
      questionText: 'Trong sóng điện từ, vectơ cường độ điện trường và vectơ cảm ứng từ',
      answerValue: 'B',
      options: [
        { label: 'A', text: 'cùng phương với phương truyền sóng.' },
        { label: 'B', text: 'vuông góc nhau và vuông góc với phương truyền sóng.' },
        { label: 'C', text: 'song song với nhau.' },
        { label: 'D', text: 'hợp với nhau góc $45^\\circ$.' },
      ],
    },
    {
      questionText: 'Trong chân không, sóng điện từ truyền với tốc độ xấp xỉ',
      answerValue: 'A',
      options: [
        { label: 'A', text: '$3\\cdot 10^8\\,\\text{m/s}$' },
        { label: 'B', text: '$3\\cdot 10^6\\,\\text{m/s}$' },
        { label: 'C', text: '$3\\cdot 10^5\\,\\text{km/s}$' },
        { label: 'D', text: '$3\\cdot 10^7\\,\\text{m/s}$' },
      ],
    },
    {
      questionText: 'Một mạch dao động gồm cuộn cảm $L$ và tụ điện $C$. Nếu tăng điện dung lên 4 lần, giữ nguyên $L$ thì chu kì dao động riêng của mạch',
      answerValue: 'D',
      options: [
        { label: 'A', text: 'giảm 2 lần.' },
        { label: 'B', text: 'giảm 4 lần.' },
        { label: 'C', text: 'tăng 4 lần.' },
        { label: 'D', text: 'tăng 2 lần.' },
      ],
    },
    {
      questionText: 'Trong quá trình dao động điện từ tự do của mạch LC lí tưởng, năng lượng điện trường và năng lượng từ trường',
      answerValue: 'C',
      options: [
        { label: 'A', text: 'đều không đổi theo thời gian.' },
        { label: 'B', text: 'đồng thời cực đại tại mọi thời điểm.' },
        { label: 'C', text: 'chuyển hóa qua lại lẫn nhau.' },
        { label: 'D', text: 'cùng triệt tiêu khi dòng điện bằng không.' },
      ],
    },
    {
      questionText: 'Sóng vô tuyến có bước sóng $300\\,\\text{m}$ trong chân không. Tần số của sóng là',
      answerValue: 'B',
      options: [
        { label: 'A', text: '$10^5\\,\\text{Hz}$' },
        { label: 'B', text: '$10^6\\,\\text{Hz}$' },
        { label: 'C', text: '$10^7\\,\\text{Hz}$' },
        { label: 'D', text: '$10^8\\,\\text{Hz}$' },
      ],
    },
    {
      questionText: 'Bộ phận dùng để thu sóng điện từ trong máy thu thanh, máy thu hình là',
      answerValue: 'A',
      options: [
        { label: 'A', text: 'ăng-ten thu.' },
        { label: 'B', text: 'loa.' },
        { label: 'C', text: 'nguồn điện một chiều.' },
        { label: 'D', text: 'nam châm điện.' },
      ],
    },
    {
      questionText: 'Phát biểu nào sau đây đúng về sóng điện từ?',
      answerValue: 'D',
      options: [
        { label: 'A', text: 'Sóng điện từ là sóng dọc.' },
        { label: 'B', text: 'Sóng điện từ không mang năng lượng.' },
        { label: 'C', text: 'Trong chân không, sóng điện từ truyền chậm hơn sóng âm.' },
        { label: 'D', text: 'Sóng điện từ là sóng ngang.' },
      ],
    },
  ],
)

const songAnhSangQuestions = buildTopicQuestions('song-anh-sang', 'Sóng ánh sáng', 'Vat_Ly/song_anh_sang.md', [
  {
    questionText: 'Trong thí nghiệm Y-âng về giao thoa ánh sáng, khoảng vân được tính theo công thức',
    answerValue: 'A',
    options: [
      { label: 'A', text: '$i = \\dfrac{\\lambda D}{a}$' },
      { label: 'B', text: '$i = \\dfrac{aD}{\\lambda}$' },
      { label: 'C', text: '$i = \\dfrac{\\lambda a}{D}$' },
      { label: 'D', text: '$i = \\lambda aD$' },
    ],
  },
  {
    questionText: 'Ánh sáng đơn sắc màu đỏ có bước sóng trong chân không',
    answerValue: 'D',
    options: [
      { label: 'A', text: 'ngắn hơn ánh sáng tím.' },
      { label: 'B', text: 'ngắn hơn ánh sáng lam.' },
      { label: 'C', text: 'bằng ánh sáng lục.' },
      { label: 'D', text: 'dài hơn ánh sáng tím.' },
    ],
  },
  {
    questionText: 'Hiện tượng tán sắc ánh sáng là hiện tượng',
    answerValue: 'C',
    options: [
      { label: 'A', text: 'giao thoa của ánh sáng trắng.' },
      { label: 'B', text: 'ánh sáng bị phản xạ toàn phần.' },
      { label: 'C', text: 'chùm sáng trắng bị phân tích thành nhiều chùm sáng đơn sắc.' },
      { label: 'D', text: 'ánh sáng đơn sắc đổi màu khi truyền qua lăng kính.' },
    ],
  },
  {
    questionText: 'Trong thí nghiệm Y-âng, tại vị trí có hiệu đường đi $\\delta = 2\\lambda$ thì vân quan sát được là',
    answerValue: 'B',
    options: [
      { label: 'A', text: 'vân tối thứ hai.' },
      { label: 'B', text: 'vân sáng.' },
      { label: 'C', text: 'vân tối thứ nhất.' },
      { label: 'D', text: 'không có vân.' },
    ],
  },
  {
    questionText: 'Điều kiện để tại M có vân tối trong thí nghiệm giao thoa ánh sáng là',
    answerValue: 'A',
    options: [
      { label: 'A', text: '$\\delta = \\left(k + \\dfrac{1}{2}\\right)\\lambda$' },
      { label: 'B', text: '$\\delta = k\\lambda$' },
      { label: 'C', text: '$\\delta = 2k\\lambda$' },
      { label: 'D', text: '$\\delta = \\dfrac{k\\lambda}{2}$' },
    ],
  },
  {
    questionText: 'Khi tăng khoảng cách từ hai khe đến màn quan sát trong thí nghiệm Y-âng thì khoảng vân',
    answerValue: 'C',
    options: [
      { label: 'A', text: 'giảm.' },
      { label: 'B', text: 'không đổi.' },
      { label: 'C', text: 'tăng.' },
      { label: 'D', text: 'ban đầu tăng rồi giảm.' },
    ],
  },
  {
    questionText: 'Ánh sáng dùng trong thí nghiệm giao thoa Y-âng thường phải là ánh sáng',
    answerValue: 'D',
    options: [
      { label: 'A', text: 'trắng có cường độ mạnh.' },
      { label: 'B', text: 'hỗn hợp nhiều ánh sáng đơn sắc.' },
      { label: 'C', text: 'không kết hợp.' },
      { label: 'D', text: 'đơn sắc.' },
    ],
  },
  {
    questionText: 'Trong thí nghiệm Y-âng, biết $a = 1\\,\\text{mm}$, $D = 2\\,\\text{m}$, $\\lambda = 0{,}5\\,\\mu\\text{m}$. Khoảng vân là',
    answerValue: 'B',
    options: [
      { label: 'A', text: '$0{,}5\\,\\text{mm}$' },
      { label: 'B', text: '$1\\,\\text{mm}$' },
      { label: 'C', text: '$2\\,\\text{mm}$' },
      { label: 'D', text: '$1{,}5\\,\\text{mm}$' },
    ],
  },
  {
    questionText: 'Hiện tượng giao thoa ánh sáng chứng tỏ ánh sáng có',
    answerValue: 'A',
    options: [
      { label: 'A', text: 'tính chất sóng.' },
      { label: 'B', text: 'tính chất hạt.' },
      { label: 'C', text: 'bản chất điện tích.' },
      { label: 'D', text: 'bản chất cơ học.' },
    ],
  },
  {
    questionText: 'Một trong những ứng dụng quan trọng của tia laze là',
    answerValue: 'D',
    options: [
      { label: 'A', text: 'tạo ra sóng âm tần số thấp.' },
      { label: 'B', text: 'khử hoàn toàn hiện tượng giao thoa.' },
      { label: 'C', text: 'tạo dòng điện không đổi.' },
      { label: 'D', text: 'đo khoảng cách rất chính xác.' },
    ],
  },
])

const luongTuAnhSangQuestions = buildTopicQuestions(
  'luong-tu-anh-sang',
  'Lượng tử ánh sáng',
  'Vat_Ly/luong_tu_anh_sang.md',
  [
    {
      questionText: 'Theo thuyết lượng tử ánh sáng, năng lượng của một phôtôn được xác định bởi',
      answerValue: 'B',
      options: [
        { label: 'A', text: '$\\varepsilon = \\dfrac{h}{f}$' },
        { label: 'B', text: '$\\varepsilon = hf$' },
        { label: 'C', text: '$\\varepsilon = h\\lambda$' },
        { label: 'D', text: '$\\varepsilon = \\dfrac{c}{\\lambda}$' },
      ],
    },
    {
      questionText: 'Hiện tượng quang điện ngoài là hiện tượng electron bị bứt ra khỏi bề mặt kim loại khi kim loại đó được chiếu bởi',
      answerValue: 'A',
      options: [
        { label: 'A', text: 'bức xạ điện từ có tần số thích hợp.' },
        { label: 'B', text: 'mọi bức xạ điện từ.' },
        { label: 'C', text: 'ánh sáng có cường độ đủ lớn.' },
        { label: 'D', text: 'sóng âm có năng lượng lớn.' },
      ],
    },
    {
      questionText: 'Điều kiện để xảy ra hiện tượng quang điện ngoài là',
      answerValue: 'D',
      options: [
        { label: 'A', text: '$\\lambda > \\lambda_0$' },
        { label: 'B', text: '$f < f_0$' },
        { label: 'C', text: 'cường độ chùm sáng đủ lớn.' },
        { label: 'D', text: '$f \\ge f_0$' },
      ],
    },
    {
      questionText: 'Giới hạn quang điện của một kim loại là bước sóng dài nhất của bức xạ có thể gây ra',
      answerValue: 'C',
      options: [
        { label: 'A', text: 'hiện tượng phát quang.' },
        { label: 'B', text: 'hiện tượng giao thoa.' },
        { label: 'C', text: 'hiện tượng quang điện ngoài.' },
        { label: 'D', text: 'sự truyền ánh sáng trong kim loại.' },
      ],
    },
    {
      questionText: 'Theo mẫu nguyên tử Bo, khi electron trong nguyên tử hiđrô chuyển từ quỹ đạo dừng có năng lượng cao xuống quỹ đạo dừng có năng lượng thấp hơn thì nguyên tử',
      answerValue: 'A',
      options: [
        { label: 'A', text: 'phát ra phôtôn.' },
        { label: 'B', text: 'hấp thụ phôtôn.' },
        { label: 'C', text: 'không trao đổi năng lượng.' },
        { label: 'D', text: 'bị ion hóa.' },
      ],
    },
    {
      questionText: 'Công thức Einstein về hiện tượng quang điện là',
      answerValue: 'B',
      options: [
        { label: 'A', text: '$hf = A + mv^2$' },
        { label: 'B', text: '$hf = A + \\dfrac{1}{2}mv_{\\max}^2$' },
        { label: 'C', text: '$hf = \\dfrac{1}{2}mv_{\\max}$' },
        { label: 'D', text: '$hf = A - \\dfrac{1}{2}mv_{\\max}^2$' },
      ],
    },
    {
      questionText: 'Khi tăng cường độ chùm sáng kích thích nhưng vẫn giữ nguyên tần số lớn hơn tần số giới hạn thì',
      answerValue: 'D',
      options: [
        { label: 'A', text: 'động năng ban đầu cực đại của electron quang điện tăng.' },
        { label: 'B', text: 'công thoát electron giảm.' },
        { label: 'C', text: 'giới hạn quang điện tăng.' },
        { label: 'D', text: 'số electron quang điện bật ra trong một giây tăng.' },
      ],
    },
    {
      questionText: 'Nếu bước sóng của bức xạ kích thích giảm thì năng lượng mỗi phôtôn của bức xạ đó',
      answerValue: 'C',
      options: [
        { label: 'A', text: 'giảm.' },
        { label: 'B', text: 'không đổi.' },
        { label: 'C', text: 'tăng.' },
        { label: 'D', text: 'bằng không.' },
      ],
    },
    {
      questionText: 'Tia tử ngoại, tia X và ánh sáng nhìn thấy đều là',
      answerValue: 'A',
      options: [
        { label: 'A', text: 'sóng điện từ.' },
        { label: 'B', text: 'sóng cơ.' },
        { label: 'C', text: 'dòng hạt mang điện.' },
        { label: 'D', text: 'bức xạ hạt nhân.' },
      ],
    },
    {
      questionText: 'Một phôtôn có tần số $6\\cdot 10^{14}\\,\\text{Hz}$. Lấy $h = 6{,}625\\cdot 10^{-34}\\,\\text{J.s}$. Năng lượng của phôtôn xấp xỉ bằng',
      answerValue: 'B',
      options: [
        { label: 'A', text: '$3{,}98\\cdot 10^{-20}\\,\\text{J}$' },
        { label: 'B', text: '$3{,}98\\cdot 10^{-19}\\,\\text{J}$' },
        { label: 'C', text: '$9{,}94\\cdot 10^{-20}\\,\\text{J}$' },
        { label: 'D', text: '$6{,}00\\cdot 10^{-19}\\,\\text{J}$' },
      ],
    },
  ],
)

const hatNhanNguyenTuQuestions = buildTopicQuestions(
  'hat-nhan-nguyen-tu',
  'Hạt nhân nguyên tử',
  'Vat_Ly/hat_nhan_nguyen_tu.md',
  [
    {
      questionText: 'Số nuclôn trong hạt nhân được xác định bởi',
      answerValue: 'C',
      options: [
        { label: 'A', text: 'số proton.' },
        { label: 'B', text: 'số electron.' },
        { label: 'C', text: 'tổng số proton và nơtron.' },
        { label: 'D', text: 'tổng số proton và electron.' },
      ],
    },
  {
    questionText: 'Hạt nhân $^{23}_{11}\\text{Na}$ có số nơtron là',
    answerValue: 'D',
    options: [
      { label: 'A', text: '11' },
      { label: 'B', text: '10' },
      { label: 'C', text: '13' },
      { label: 'D', text: '12' },
    ],
  },
    {
      questionText: 'Phóng xạ là quá trình',
      answerValue: 'A',
      options: [
        { label: 'A', text: 'hạt nhân không bền tự phát biến đổi và phát ra bức xạ.' },
        { label: 'B', text: 'hạt nhân hấp thụ electron.' },
        { label: 'C', text: 'hạt nhân chỉ xảy ra khi được nung nóng.' },
        { label: 'D', text: 'các electron bật ra khỏi nguyên tử.' },
      ],
    },
    {
      questionText: 'Trong phóng xạ $\\beta^-$, hạt nhân con so với hạt nhân mẹ có',
      answerValue: 'B',
      options: [
        { label: 'A', text: 'số khối giảm 4, điện tích giảm 2.' },
        { label: 'B', text: 'số khối không đổi, điện tích tăng 1.' },
        { label: 'C', text: 'số khối không đổi, điện tích giảm 1.' },
        { label: 'D', text: 'số khối giảm 1, điện tích tăng 1.' },
      ],
    },
    {
      questionText: 'Chu kì bán rã là thời gian để',
      answerValue: 'C',
      options: [
        { label: 'A', text: 'toàn bộ các hạt nhân phóng xạ bị phân rã.' },
        { label: 'B', text: 'số hạt nhân phóng xạ tăng gấp đôi.' },
        { label: 'C', text: 'một nửa số hạt nhân phóng xạ ban đầu bị phân rã.' },
        { label: 'D', text: 'hoạt độ phóng xạ tăng gấp đôi.' },
      ],
    },
    {
      questionText: 'Sau 2 chu kì bán rã, lượng chất phóng xạ còn lại bằng',
      answerValue: 'A',
      options: [
        { label: 'A', text: '$\\dfrac{1}{4}$ lượng ban đầu.' },
        { label: 'B', text: '$\\dfrac{1}{2}$ lượng ban đầu.' },
        { label: 'C', text: '$\\dfrac{1}{8}$ lượng ban đầu.' },
        { label: 'D', text: '$\\dfrac{3}{4}$ lượng ban đầu.' },
      ],
    },
    {
      questionText: 'Phản ứng nhiệt hạch là phản ứng',
      answerValue: 'D',
      options: [
        { label: 'A', text: 'một hạt nhân nặng vỡ thành hai hạt nhân nhẹ hơn.' },
        { label: 'B', text: 'hạt nhân hấp thụ nơtron rồi phát ra tia gamma.' },
        { label: 'C', text: 'các hạt nhân tự phát bức xạ.' },
        { label: 'D', text: 'hai hạt nhân rất nhẹ tổng hợp thành hạt nhân nặng hơn.' },
      ],
    },
    {
      questionText: 'Hệ thức đúng của định luật phóng xạ là',
      answerValue: 'B',
      options: [
        { label: 'A', text: '$N = N_0e^{\\lambda t}$' },
        { label: 'B', text: '$N = N_0e^{-\\lambda t}$' },
        { label: 'C', text: '$N = N_0(1 - \\lambda t)$' },
        { label: 'D', text: '$N = N_0\\lambda t$' },
      ],
    },
    {
      questionText: 'Trong phóng xạ $\\alpha$, hạt nhân con có số khối và số proton thay đổi như thế nào so với hạt nhân mẹ?',
      answerValue: 'A',
      options: [
        { label: 'A', text: 'Số khối giảm 4, số proton giảm 2.' },
        { label: 'B', text: 'Số khối giảm 2, số proton giảm 4.' },
        { label: 'C', text: 'Số khối không đổi, số proton giảm 2.' },
        { label: 'D', text: 'Số khối giảm 4, số proton không đổi.' },
      ],
    },
    {
      questionText: 'Độ hụt khối của hạt nhân là',
      answerValue: 'C',
      options: [
        { label: 'A', text: 'khối lượng của các electron trong nguyên tử.' },
        { label: 'B', text: 'khối lượng của hạt nhân.' },
        { label: 'C', text: 'hiệu giữa tổng khối lượng các nuclôn riêng rẽ và khối lượng hạt nhân.' },
        { label: 'D', text: 'khối lượng bị mất đi khi nguyên tử ion hóa.' },
      ],
    },
  ],
)

const dienTichDienTruongQuestions = buildTopicQuestions(
  'dien-tich-dien-truong',
  'Điện tích và điện trường',
  'Vat_Ly/dien_tich_va_dien_truong.md',
  [
    {
      questionText: 'Theo định luật Cu-lông, lực tương tác giữa hai điện tích điểm trong chân không tỉ lệ',
      answerValue: 'A',
      options: [
        { label: 'A', text: 'thuận với tích độ lớn hai điện tích và nghịch với bình phương khoảng cách giữa chúng.' },
        { label: 'B', text: 'thuận với tổng độ lớn hai điện tích và nghịch với khoảng cách giữa chúng.' },
        { label: 'C', text: 'thuận với khoảng cách giữa chúng.' },
        { label: 'D', text: 'nghịch với tích độ lớn hai điện tích.' },
      ],
    },
    {
      questionText: 'Điện trường là dạng vật chất tồn tại xung quanh điện tích và',
      answerValue: 'D',
      options: [
        { label: 'A', text: 'chỉ tác dụng lên nam châm.' },
        { label: 'B', text: 'không tác dụng lực lên điện tích khác.' },
        { label: 'C', text: 'chỉ tồn tại trong kim loại.' },
        { label: 'D', text: 'tác dụng lực điện lên điện tích đặt trong nó.' },
      ],
    },
    {
      questionText: 'Cường độ điện trường tại một điểm đặc trưng cho',
      answerValue: 'B',
      options: [
        { label: 'A', text: 'khả năng sinh công của nguồn điện.' },
        { label: 'B', text: 'tác dụng lực của điện trường tại điểm đó.' },
        { label: 'C', text: 'số lượng điện tích đặt tại điểm đó.' },
        { label: 'D', text: 'thế năng của điện tích tại điểm đó.' },
      ],
    },
    {
      questionText: 'Cường độ điện trường do điện tích điểm $Q$ gây ra tại điểm cách nó khoảng $r$ trong chân không có độ lớn',
      answerValue: 'C',
      options: [
        { label: 'A', text: '$E = k\\dfrac{Qr}{1}$' },
        { label: 'B', text: '$E = k\\dfrac{Q}{r}$' },
        { label: 'C', text: '$E = k\\dfrac{|Q|}{r^2}$' },
        { label: 'D', text: '$E = k\\dfrac{r^2}{|Q|}$' },
      ],
    },
    {
      questionText: 'Đường sức điện của điện trường tĩnh',
      answerValue: 'A',
      options: [
        { label: 'A', text: 'không cắt nhau.' },
        { label: 'B', text: 'có thể cắt nhau.' },
        { label: 'C', text: 'luôn là các đường tròn kín.' },
        { label: 'D', text: 'luôn song song với nhau.' },
      ],
    },
    {
      questionText: 'Trong điện trường đều, công của lực điện trường khi điện tích $q$ di chuyển quãng đường $d$ theo phương đường sức điện là',
      answerValue: 'D',
      options: [
        { label: 'A', text: '$A = qEd^2$' },
        { label: 'B', text: '$A = \\dfrac{qE}{d}$' },
        { label: 'C', text: '$A = qd$' },
        { label: 'D', text: '$A = qEd$' },
      ],
    },
    {
      questionText: 'Hiệu điện thế giữa hai điểm M và N là đại lượng đặc trưng cho',
      answerValue: 'C',
      options: [
        { label: 'A', text: 'độ lớn của điện tích.' },
        { label: 'B', text: 'điện trở giữa hai điểm.' },
        { label: 'C', text: 'khả năng thực hiện công của điện trường khi dịch chuyển điện tích giữa hai điểm đó.' },
        { label: 'D', text: 'cường độ điện trường tại trung điểm MN.' },
      ],
    },
    {
      questionText: 'Một electron bay vào điện trường đều theo chiều ngược với chiều đường sức điện. Lực điện tác dụng lên electron có hướng',
      answerValue: 'B',
      options: [
        { label: 'A', text: 'cùng chiều đường sức điện.' },
        { label: 'B', text: 'ngược chiều đường sức điện.' },
        { label: 'C', text: 'vuông góc với đường sức điện.' },
        { label: 'D', text: 'không xác định.' },
      ],
    },
    {
      questionText: 'Hai điện tích cùng dấu đặt gần nhau sẽ',
      answerValue: 'A',
      options: [
        { label: 'A', text: 'đẩy nhau.' },
        { label: 'B', text: 'hút nhau.' },
        { label: 'C', text: 'không tương tác.' },
        { label: 'D', text: 'lúc hút lúc đẩy.' },
      ],
    },
    {
      questionText: 'Điện thế tại một điểm trong điện trường đặc trưng cho',
      answerValue: 'D',
      options: [
        { label: 'A', text: 'khả năng truyền sóng điện từ của điểm đó.' },
        { label: 'B', text: 'điện trở của môi trường tại điểm đó.' },
        { label: 'C', text: 'độ mạnh yếu của từ trường tại điểm đó.' },
        { label: 'D', text: 'thế năng điện của một đơn vị điện tích dương đặt tại điểm đó.' },
      ],
    },
  ],
)

const dongDienKhongDoiQuestions = buildTopicQuestions(
  'dong-dien-khong-doi',
  'Dòng điện không đổi',
  'Vat_Ly/dong_dien_khong_doi.md',
  [
    {
      questionText: 'Cường độ dòng điện không đổi được xác định bằng',
      answerValue: 'B',
      options: [
        { label: 'A', text: '$I = qt$' },
        { label: 'B', text: '$I = \\dfrac{q}{t}$' },
        { label: 'C', text: '$I = \\dfrac{t}{q}$' },
        { label: 'D', text: '$I = q + t$' },
      ],
    },
    {
      questionText: 'Định luật Ôm cho đoạn mạch chỉ có điện trở thuần là',
      answerValue: 'A',
      options: [
        { label: 'A', text: '$I = \\dfrac{U}{R}$' },
        { label: 'B', text: '$I = UR$' },
        { label: 'C', text: '$U = \\dfrac{R}{I}$' },
        { label: 'D', text: '$R = UI$' },
      ],
    },
    {
      questionText: 'Điện trở tương đương của hai điện trở $R_1$, $R_2$ mắc nối tiếp là',
      answerValue: 'C',
      options: [
        { label: 'A', text: '$R = \\dfrac{R_1R_2}{R_1 + R_2}$' },
        { label: 'B', text: '$R = \\dfrac{R_1 + R_2}{R_1R_2}$' },
        { label: 'C', text: '$R = R_1 + R_2$' },
        { label: 'D', text: '$R = |R_1 - R_2|$' },
      ],
    },
    {
      questionText: 'Điện trở tương đương của hai điện trở $R_1$, $R_2$ mắc song song thỏa mãn',
      answerValue: 'D',
      options: [
        { label: 'A', text: '$R = R_1 + R_2$' },
        { label: 'B', text: '$R = \\dfrac{R_1}{R_2}$' },
        { label: 'C', text: '$R = R_1R_2$' },
        { label: 'D', text: '$\\dfrac{1}{R} = \\dfrac{1}{R_1} + \\dfrac{1}{R_2}$' },
      ],
    },
    {
      questionText: 'Công suất điện tiêu thụ trên đoạn mạch được tính bằng',
      answerValue: 'A',
      options: [
        { label: 'A', text: '$P = UI$' },
        { label: 'B', text: '$P = \\dfrac{U}{I}$' },
        { label: 'C', text: '$P = IR$' },
        { label: 'D', text: '$P = U + I$' },
      ],
    },
    {
      questionText: 'Một điện trở $R = 10\\,\\Omega$ mắc vào hiệu điện thế $20\\,\\text{V}$. Cường độ dòng điện qua điện trở là',
      answerValue: 'B',
      options: [
        { label: 'A', text: '$0{,}5\\,\\text{A}$' },
        { label: 'B', text: '$2\\,\\text{A}$' },
        { label: 'C', text: '$10\\,\\text{A}$' },
        { label: 'D', text: '$200\\,\\text{A}$' },
      ],
    },
    {
      questionText: 'Suất điện động của nguồn điện đặc trưng cho',
      answerValue: 'C',
      options: [
        { label: 'A', text: 'khả năng cản trở dòng điện của nguồn.' },
        { label: 'B', text: 'nhiệt lượng tỏa ra trên mạch ngoài.' },
        { label: 'C', text: 'khả năng thực hiện công của nguồn điện.' },
        { label: 'D', text: 'điện trở trong của nguồn điện.' },
      ],
    },
    {
      questionText: 'Điện năng tiêu thụ của đoạn mạch trong thời gian $t$ được tính bằng',
      answerValue: 'D',
      options: [
        { label: 'A', text: '$A = \\dfrac{U}{It}$' },
        { label: 'B', text: '$A = IRt$' },
        { label: 'C', text: '$A = Pt^2$' },
        { label: 'D', text: '$A = UIt$' },
      ],
    },
    {
      questionText: 'Nhiệt lượng tỏa ra trên điện trở $R$ khi có dòng điện $I$ chạy qua trong thời gian $t$ được tính theo định luật Jun - Lenxơ là',
      answerValue: 'A',
      options: [
        { label: 'A', text: '$Q = I^2Rt$' },
        { label: 'B', text: '$Q = IRt$' },
        { label: 'C', text: '$Q = \\dfrac{Rt}{I^2}$' },
        { label: 'D', text: '$Q = U^2I$' },
      ],
    },
    {
      questionText: 'Đối với nguồn điện có suất điện động $\\mathcal{E}$ và điện trở trong $r$, khi mạch ngoài có điện trở $R$ thì cường độ dòng điện mạch kín là',
      answerValue: 'C',
      options: [
        { label: 'A', text: '$I = \\dfrac{\\mathcal{E}}{R - r}$' },
        { label: 'B', text: '$I = \\dfrac{\\mathcal{E} + r}{R}$' },
        { label: 'C', text: '$I = \\dfrac{\\mathcal{E}}{R + r}$' },
        { label: 'D', text: '$I = \\dfrac{R + r}{\\mathcal{E}}$' },
      ],
    },
  ],
)

const tuTruongQuestions = buildTopicQuestions('tu-truong', 'Từ trường', 'Vat_Ly/tu_truong.md', [
  {
    questionText: 'Từ trường là dạng vật chất tồn tại xung quanh',
    answerValue: 'A',
    options: [
      { label: 'A', text: 'nam châm và dòng điện.' },
      { label: 'B', text: 'mọi vật đứng yên.' },
      { label: 'C', text: 'điện tích đứng yên.' },
      { label: 'D', text: 'mọi hạt nhân nguyên tử.' },
    ],
  },
  {
    questionText: 'Đường sức từ có tính chất',
    answerValue: 'D',
    options: [
      { label: 'A', text: 'có điểm đầu và điểm cuối.' },
      { label: 'B', text: 'không khép kín.' },
      { label: 'C', text: 'có thể cắt nhau.' },
      { label: 'D', text: 'là những đường cong khép kín.' },
    ],
  },
  {
    questionText: 'Lực từ tác dụng lên đoạn dây dẫn mang dòng điện đặt trong từ trường đều có độ lớn cực đại khi góc giữa dây dẫn và vectơ cảm ứng từ bằng',
    answerValue: 'B',
    options: [
      { label: 'A', text: '$0^\\circ$' },
      { label: 'B', text: '$90^\\circ$' },
      { label: 'C', text: '$45^\\circ$' },
      { label: 'D', text: '$180^\\circ$' },
    ],
  },
  {
    questionText: 'Độ lớn lực từ tác dụng lên đoạn dây dài $l$, có dòng điện $I$ đặt trong từ trường đều $B$ và vuông góc với đường sức từ là',
    answerValue: 'C',
    options: [
      { label: 'A', text: '$F = \\dfrac{BI}{l}$' },
      { label: 'B', text: '$F = BIl^2$' },
      { label: 'C', text: '$F = BIl$' },
      { label: 'D', text: '$F = \\dfrac{Bl}{I}$' },
    ],
  },
  {
    questionText: 'Chiều của lực từ tác dụng lên đoạn dây dẫn mang dòng điện được xác định bằng',
    answerValue: 'A',
    options: [
      { label: 'A', text: 'quy tắc bàn tay trái.' },
      { label: 'B', text: 'quy tắc nắm tay phải.' },
      { label: 'C', text: 'quy tắc bàn tay phải.' },
      { label: 'D', text: 'quy tắc hình bình hành.' },
    ],
  },
  {
    questionText: 'Cảm ứng từ tại tâm của dòng điện tròn không phụ thuộc vào',
    answerValue: 'D',
    options: [
      { label: 'A', text: 'cường độ dòng điện.' },
      { label: 'B', text: 'bán kính vòng dây.' },
      { label: 'C', text: 'môi trường đặt vòng dây.' },
      { label: 'D', text: 'điện tích của electron.' },
    ],
  },
  {
    questionText: 'Lực Lo-ren-xơ tác dụng lên hạt mang điện chuyển động trong từ trường có phương',
    answerValue: 'B',
    options: [
      { label: 'A', text: 'cùng phương với vectơ vận tốc của hạt.' },
      { label: 'B', text: 'vuông góc với vectơ vận tốc và vectơ cảm ứng từ.' },
      { label: 'C', text: 'cùng phương với vectơ cảm ứng từ.' },
      { label: 'D', text: 'không phụ thuộc vào hướng chuyển động của hạt.' },
    ],
  },
  {
    questionText: 'Một hạt mang điện chuyển động song song với đường sức từ thì lực Lo-ren-xơ tác dụng lên hạt có độ lớn',
    answerValue: 'C',
    options: [
      { label: 'A', text: 'cực đại.' },
      { label: 'B', text: 'bằng $qvB$.' },
      { label: 'C', text: 'bằng 0.' },
      { label: 'D', text: 'phụ thuộc khối lượng hạt.' },
    ],
  },
  {
    questionText: 'Đơn vị của cảm ứng từ trong hệ SI là',
    answerValue: 'A',
    options: [
      { label: 'A', text: 'tesla (T).' },
      { label: 'B', text: 'weber (Wb).' },
      { label: 'C', text: 'vôn (V).' },
      { label: 'D', text: 'ampe (A).' },
    ],
  },
  {
    questionText: 'Từ trường đều là từ trường có',
    answerValue: 'D',
    options: [
      { label: 'A', text: 'đường sức từ là các đường tròn đồng tâm.' },
      { label: 'B', text: 'cảm ứng từ tại mọi điểm bằng 0.' },
      { label: 'C', text: 'độ lớn cảm ứng từ thay đổi tuần hoàn theo thời gian.' },
      { label: 'D', text: 'các đường sức từ song song, cùng chiều và cách đều nhau.' },
    ],
  },
])

const camUngDienTuQuestions = buildTopicQuestions(
  'cam-ung-dien-tu',
  'Cảm ứng điện từ',
  'Vat_Ly/cam_ung_dien_tu.md',
  [
    {
      questionText: 'Hiện tượng xuất hiện suất điện động cảm ứng trong mạch kín khi từ thông qua mạch biến thiên được gọi là',
      answerValue: 'B',
      options: [
        { label: 'A', text: 'hiện tượng quang điện.' },
        { label: 'B', text: 'hiện tượng cảm ứng điện từ.' },
        { label: 'C', text: 'hiện tượng tán sắc ánh sáng.' },
        { label: 'D', text: 'hiện tượng cộng hưởng.' },
      ],
    },
    {
      questionText: 'Định luật Fa-ra-đây về cảm ứng điện từ cho biết độ lớn suất điện động cảm ứng tỉ lệ với',
      answerValue: 'D',
      options: [
        { label: 'A', text: 'từ thông qua mạch.' },
        { label: 'B', text: 'điện trở của mạch.' },
        { label: 'C', text: 'cường độ dòng điện trong mạch.' },
        { label: 'D', text: 'tốc độ biến thiên của từ thông qua mạch.' },
      ],
    },
    {
      questionText: 'Biểu thức của từ thông qua một diện tích $S$ đặt trong từ trường đều là',
      answerValue: 'A',
      options: [
        { label: 'A', text: '$\\Phi = BScos\\alpha$' },
        { label: 'B', text: '$\\Phi = BSsin\\alpha$' },
        { label: 'C', text: '$\\Phi = \\dfrac{BS}{\\alpha}$' },
        { label: 'D', text: '$\\Phi = B + S + \\alpha$' },
      ],
    },
    {
      questionText: 'Theo định luật Len-xơ, chiều dòng điện cảm ứng có tác dụng',
      answerValue: 'C',
      options: [
        { label: 'A', text: 'làm tăng nguyên nhân sinh ra nó.' },
        { label: 'B', text: 'luôn cùng chiều với dòng điện ngoài.' },
        { label: 'C', text: 'chống lại sự biến thiên từ thông sinh ra nó.' },
        { label: 'D', text: 'không phụ thuộc vào sự biến thiên từ thông.' },
      ],
    },
    {
      questionText: 'Suất điện động cảm ứng trong một mạch kín được xác định bởi công thức',
      answerValue: 'B',
      options: [
        { label: 'A', text: '$e = \\Delta \\Phi \\Delta t$' },
        { label: 'B', text: '$e = -\\dfrac{\\Delta \\Phi}{\\Delta t}$' },
        { label: 'C', text: '$e = -\\Delta \\Phi \\cdot \\Delta t$' },
        { label: 'D', text: '$e = \\dfrac{\\Delta t}{\\Delta \\Phi}$' },
      ],
    },
    {
      questionText: 'Một thanh dẫn dài $l$ chuyển động với vận tốc $v$ vuông góc với từ trường đều $B$ và vuông góc với chính thanh dẫn. Suất điện động cảm ứng xuất hiện giữa hai đầu thanh là',
      answerValue: 'D',
      options: [
        { label: 'A', text: '$e = \\dfrac{B}{lv}$' },
        { label: 'B', text: '$e = Bl + v$' },
        { label: 'C', text: '$e = \\dfrac{lv}{B}$' },
        { label: 'D', text: '$e = Blv$' },
      ],
    },
    {
      questionText: 'Hiện tượng tự cảm là hiện tượng cảm ứng điện từ xảy ra trong mạch điện do',
      answerValue: 'A',
      options: [
        { label: 'A', text: 'sự biến thiên của chính cường độ dòng điện trong mạch.' },
        { label: 'B', text: 'sự biến thiên nhiệt độ của dây dẫn.' },
        { label: 'C', text: 'sự thay đổi điện trở của nguồn điện.' },
        { label: 'D', text: 'sự dịch chuyển của các electron tự do.' },
      ],
    },
    {
      questionText: 'Năng lượng từ trường của ống dây có độ tự cảm $L$ khi có dòng điện $I$ chạy qua là',
      answerValue: 'C',
      options: [
        { label: 'A', text: '$W = LI$' },
        { label: 'B', text: '$W = L I^2$' },
        { label: 'C', text: '$W = \\dfrac{1}{2}LI^2$' },
        { label: 'D', text: '$W = \\dfrac{1}{2}LI$' },
      ],
    },
    {
      questionText: 'Máy phát điện xoay chiều hoạt động dựa trên hiện tượng',
      answerValue: 'B',
      options: [
        { label: 'A', text: 'cộng hưởng điện.' },
        { label: 'B', text: 'cảm ứng điện từ.' },
        { label: 'C', text: 'quang điện ngoài.' },
        { label: 'D', text: 'tỏa nhiệt Jun - Lenxơ.' },
      ],
    },
    {
      questionText: 'Khi góc giữa vectơ cảm ứng từ và pháp tuyến của mặt phẳng khung dây bằng $90^\\circ$ thì từ thông qua khung dây bằng',
      answerValue: 'A',
      options: [
        { label: 'A', text: '0.' },
        { label: 'B', text: '$BS$.' },
        { label: 'C', text: '$\\dfrac{BS}{2}$' },
        { label: 'D', text: '$2BS$.' },
      ],
    },
  ],
)

const quangHocQuestions = buildTopicQuestions('quang-hoc', 'Quang học', 'Vat_Ly/quang_hoc.md', [
  {
    questionText: 'Công thức của thấu kính mỏng là',
    answerValue: 'C',
    options: [
      { label: 'A', text: "$\\dfrac{1}{f} = d + d'$" },
      { label: 'B', text: "$f = d + d'$" },
      { label: 'C', text: "$\\dfrac{1}{f} = \\dfrac{1}{d} + \\dfrac{1}{d'}$" },
      { label: 'D', text: "$\\dfrac{1}{d} = \\dfrac{1}{f} + \\dfrac{1}{d'}$" },
    ],
  },
  {
    questionText: 'Thấu kính hội tụ có tiêu cự',
    answerValue: 'A',
    options: [
      { label: 'A', text: 'dương.' },
      { label: 'B', text: 'âm.' },
      { label: 'C', text: 'bằng 0.' },
      { label: 'D', text: 'luôn nhỏ hơn 0,5 m.' },
    ],
  },
  {
    questionText: 'Khi vật thật đặt ngoài khoảng tiêu cự của thấu kính hội tụ thì ảnh thu được trên màn là',
    answerValue: 'D',
    options: [
      { label: 'A', text: 'ảnh ảo, cùng chiều với vật.' },
      { label: 'B', text: 'ảnh ảo, ngược chiều với vật.' },
      { label: 'C', text: 'ảnh thật, cùng chiều với vật.' },
      { label: 'D', text: 'ảnh thật, ngược chiều với vật.' },
    ],
  },
  {
    questionText: 'Độ tụ của thấu kính được tính bằng',
    answerValue: 'B',
    options: [
      { label: 'A', text: '$D = f$' },
      { label: 'B', text: '$D = \\dfrac{1}{f}$ (với $f$ tính bằng mét).' },
      { label: 'C', text: '$D = 2f$' },
      { label: 'D', text: '$D = f^2$' },
    ],
  },
  {
    questionText: 'Góc giới hạn phản xạ toàn phần là góc tới khi tia khúc xạ',
    answerValue: 'C',
    options: [
      { label: 'A', text: 'trùng với pháp tuyến.' },
      { label: 'B', text: 'tạo với mặt phân cách góc $45^\\circ$.' },
      { label: 'C', text: 'đi sát mặt phân cách giữa hai môi trường.' },
      { label: 'D', text: 'không đổi hướng truyền.' },
    ],
  },
  {
    questionText: 'Điều kiện để xảy ra phản xạ toàn phần là ánh sáng truyền từ môi trường',
    answerValue: 'A',
    options: [
      { label: 'A', text: 'chiết quang hơn sang môi trường kém chiết quang hơn với góc tới lớn hơn góc giới hạn.' },
      { label: 'B', text: 'kém chiết quang hơn sang môi trường chiết quang hơn.' },
      { label: 'C', text: 'bất kì sang chân không.' },
      { label: 'D', text: 'trong chân không vào nước.' },
    ],
  },
  {
    questionText: 'Một gương phẳng tạo ảnh của vật là',
    answerValue: 'D',
    options: [
      { label: 'A', text: 'ảnh thật, ngược chiều.' },
      { label: 'B', text: 'ảnh thật, cùng chiều.' },
      { label: 'C', text: 'ảnh ảo, ngược chiều.' },
      { label: 'D', text: 'ảnh ảo, cùng chiều và bằng vật.' },
    ],
  },
  {
    questionText: 'Chiết suất tuyệt đối của một môi trường được xác định bởi',
    answerValue: 'B',
    options: [
      { label: 'A', text: '$n = \\dfrac{v}{c}$' },
      { label: 'B', text: '$n = \\dfrac{c}{v}$' },
      { label: 'C', text: '$n = cv$' },
      { label: 'D', text: '$n = c + v$' },
    ],
  },
  {
    questionText: 'Nếu đặt vật trong khoảng từ quang tâm đến tiêu điểm của thấu kính hội tụ thì ảnh của vật là',
    answerValue: 'A',
    options: [
      { label: 'A', text: 'ảnh ảo, cùng chiều và lớn hơn vật.' },
      { label: 'B', text: 'ảnh thật, ngược chiều và nhỏ hơn vật.' },
      { label: 'C', text: 'ảnh thật, cùng chiều và lớn hơn vật.' },
      { label: 'D', text: 'ảnh ảo, ngược chiều và nhỏ hơn vật.' },
    ],
  },
  {
    questionText: 'Ứng dụng phổ biến của hiện tượng phản xạ toàn phần là',
    answerValue: 'C',
    options: [
      { label: 'A', text: 'máy biến áp.' },
      { label: 'B', text: 'động cơ điện.' },
      { label: 'C', text: 'cáp quang.' },
      { label: 'D', text: 'pin quang điện.' },
    ],
  },
])

export const supplementalPhysicsTopicQuestions: SchoolExamQuestionRecord[] = [
  ...daoDongCoQuestions,
  ...songCoQuestions,
  ...dienXoayChieuQuestions,
  ...daoDongVaSongDienTuQuestions,
  ...songAnhSangQuestions,
  ...luongTuAnhSangQuestions,
  ...hatNhanNguyenTuQuestions,
  ...dienTichDienTruongQuestions,
  ...dongDienKhongDoiQuestions,
  ...tuTruongQuestions,
  ...camUngDienTuQuestions,
  ...quangHocQuestions,
]
