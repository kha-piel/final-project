import type { SchoolExamQuestionRecord } from '../types/school-exam-types'

function mc(
  questionNumber: number,
  difficultyLevel: 1 | 2 | 3 | 4,
  questionText: string,
  answerValue: 'A' | 'B' | 'C' | 'D',
  options: Array<{ label: 'A' | 'B' | 'C' | 'D'; text: string }>,
): SchoolExamQuestionRecord {
  return {
    questionId: `supplemental-oxyz-reviewed-q${String(questionNumber).padStart(2, '0')}`,
    examId: 'supplemental-oxyz-reviewed',
    questionNumber,
    questionType: 'multiple_choice',
    difficultyLevel,
    questionText,
    statements: [],
    options: options.map((option, index) => ({
      optionLabel: option.label,
      optionText: option.text,
      displayOrder: index + 1,
    })),
    assetPaths: [],
    assets: [],
    topic: 'Hệ trục tọa độ Oxyz',
    obsidianSourcePath: 'Toan_Hoc/2_Hinh_Hoc_Khong_Gian/3_bieu_thuc_toa_do_vecto.md',
    hasImage: false,
    answerValue,
    sourceQuestionNumber: questionNumber,
    sourceSectionNumber: 1,
    examTitle: 'Bộ câu Oxyz đã rà soát',
    schoolName: 'Nội bộ hệ thống',
    year: 2026,
    pdfUrl: '',
    tags: ['supplemental', 'knowledge-review', 'oxyz', 'reviewed'],
  }
}

export const supplementalOxyzReviewedQuestions: SchoolExamQuestionRecord[] = [
  mc(1, 1, 'Trong không gian $Oxyz$, cho $A(1;2;-1)$ và $B(3;-1;4)$. Tọa độ vectơ $\\overrightarrow{AB}$ là', 'A', [
    { label: 'A', text: '$(2;-3;5)$' },
    { label: 'B', text: '$(2;3;5)$' },
    { label: 'C', text: '$(-2;3;-5)$' },
    { label: 'D', text: '$(4;1;3)$' },
  ]),
  mc(2, 1, 'Cho $\\vec a=(1;2;-1)$ và $\\vec b=(2;-1;3)$. Tích vô hướng $\\vec a\\cdot\\vec b$ bằng', 'B', [
    { label: 'A', text: '3' },
    { label: 'B', text: '$-3$' },
    { label: 'C', text: '1' },
    { label: 'D', text: '$-1$' },
  ]),
  mc(3, 1, 'Độ dài của vectơ $\\vec u=(2;-1;2)$ là', 'C', [
    { label: 'A', text: '$\\sqrt{5}$' },
    { label: 'B', text: '$2\\sqrt{2}$' },
    { label: 'C', text: '3' },
    { label: 'D', text: '$\\sqrt{10}$' },
  ]),
  mc(4, 1, 'Trung điểm của đoạn thẳng nối $A(1;2;3)$ và $B(3;0;-1)$ là', 'D', [
    { label: 'A', text: '$(2;2;1)$' },
    { label: 'B', text: '$(1;1;1)$' },
    { label: 'C', text: '$(2;0;1)$' },
    { label: 'D', text: '$(2;1;1)$' },
  ]),
  mc(5, 1, 'Mặt cầu tâm $I(1;-2;3)$, bán kính $R=2$ có phương trình là', 'A', [
    { label: 'A', text: '$(x-1)^2+(y+2)^2+(z-3)^2=4$' },
    { label: 'B', text: '$(x+1)^2+(y-2)^2+(z+3)^2=4$' },
    { label: 'C', text: '$(x-1)^2+(y-2)^2+(z-3)^2=2$' },
    { label: 'D', text: '$(x+1)^2+(y+2)^2+(z-3)^2=4$' },
  ]),
  mc(6, 1, 'Phương trình mặt phẳng đi qua $M(1;2;-1)$ và nhận $\\vec n=(2;-1;3)$ làm vectơ pháp tuyến là', 'D', [
    { label: 'A', text: '$2x-y+3z+1=0$' },
    { label: 'B', text: '$2x+y+3z-1=0$' },
    { label: 'C', text: '$x-2y+3z+3=0$' },
    { label: 'D', text: '$2x-y+3z+3=0$' },
  ]),
  mc(7, 1, 'Đường thẳng đi qua $A(1;-2;0)$ và có vectơ chỉ phương $\\vec u=(2;1;-1)$ có phương trình tham số là', 'B', [
    { label: 'A', text: '$\\begin{cases}x=1+t\\\\y=-2-t\\\\z=t\\end{cases}$' },
    { label: 'B', text: '$\\begin{cases}x=1+2t\\\\y=-2+t\\\\z=-t\\end{cases}$' },
    { label: 'C', text: '$\\begin{cases}x=1+t\\\\y=-2+2t\\\\z=-t\\end{cases}$' },
    { label: 'D', text: '$\\begin{cases}x=2+t\\\\y=-2+t\\\\z=-1+t\\end{cases}$' },
  ]),
  mc(8, 1, 'Khoảng cách từ gốc tọa độ $O$ đến điểm $M(2;-1;2)$ bằng', 'C', [
    { label: 'A', text: '$\\sqrt{7}$' },
    { label: 'B', text: '$2\\sqrt{2}$' },
    { label: 'C', text: '3' },
    { label: 'D', text: '$\\sqrt{10}$' },
  ]),

  mc(9, 2, 'Mặt phẳng đi qua ba điểm $A(1;0;0), B(0;1;0), C(0;0;1)$ có phương trình là', 'A', [
    { label: 'A', text: '$x+y+z=1$' },
    { label: 'B', text: '$x+y+z=0$' },
    { label: 'C', text: '$x-y+z=1$' },
    { label: 'D', text: '$x+y-z=1$' },
  ]),
  mc(10, 2, 'Khoảng cách từ điểm $M(1;2;3)$ đến mặt phẳng $(P):x+2y+2z-9=0$ là', 'B', [
    { label: 'A', text: '$\\dfrac{1}{3}$' },
    { label: 'B', text: '$\\dfrac{2}{3}$' },
    { label: 'C', text: '$\\dfrac{4}{3}$' },
    { label: 'D', text: '$2$' },
  ]),
  mc(11, 2, 'Góc giữa hai đường thẳng có các vectơ chỉ phương lần lượt là $\\vec u=(1;2;2)$ và $\\vec v=(2;1;-2)$ bằng', 'D', [
    { label: 'A', text: '$30^\\circ$' },
    { label: 'B', text: '$45^\\circ$' },
    { label: 'C', text: '$60^\\circ$' },
    { label: 'D', text: '$90^\\circ$' },
  ]),
  mc(12, 2, 'Đường thẳng đi qua hai điểm $A(1;0;2)$, $B(3;-2;1)$ có một vectơ chỉ phương là', 'A', [
    { label: 'A', text: '$(2;-2;-1)$' },
    { label: 'B', text: '$(1;-2;3)$' },
    { label: 'C', text: '$(3;-2;1)$' },
    { label: 'D', text: '$(2;2;1)$' },
  ]),
  mc(13, 2, 'Mặt cầu có đường kính $AB$ với $A(1;2;3)$, $B(3;0;1)$ có phương trình là', 'C', [
    { label: 'A', text: '$(x-2)^2+(y-1)^2+(z-2)^2=1$' },
    { label: 'B', text: '$(x-2)^2+(y+1)^2+(z-2)^2=3$' },
    { label: 'C', text: '$(x-2)^2+(y-1)^2+(z-2)^2=3$' },
    { label: 'D', text: '$(x-1)^2+(y-2)^2+(z-3)^2=3$' },
  ]),
  mc(14, 2, 'Mặt phẳng song song với mặt phẳng $Oxy$ và đi qua điểm $A(1;-2;3)$ có phương trình là', 'C', [
    { label: 'A', text: '$x=3$' },
    { label: 'B', text: '$y=3$' },
    { label: 'C', text: '$z=3$' },
    { label: 'D', text: '$x+y+z=3$' },
  ]),
  mc(15, 2, 'Điểm đối xứng của $A(1;-2;3)$ qua gốc tọa độ $O$ là', 'D', [
    { label: 'A', text: '$(1;2;-3)$' },
    { label: 'B', text: '$(-1;-2;-3)$' },
    { label: 'C', text: '$(1;-2;-3)$' },
    { label: 'D', text: '$(-1;2;-3)$' },
  ]),
  mc(16, 2, 'Điểm nào sau đây thuộc mặt phẳng $(P):x-y+2z-3=0$?', 'B', [
    { label: 'A', text: '$M(1;1;1)$' },
    { label: 'B', text: '$N(1;2;2)$' },
    { label: 'C', text: '$P(0;1;1)$' },
    { label: 'D', text: '$Q(2;0;0)$' },
  ]),

  mc(17, 3, 'Cho $\\vec a=(1;m;2)$ và $\\vec b=(2;-1;3)$. Để $\\vec a\\perp\\vec b$ thì $m$ bằng', 'C', [
    { label: 'A', text: '$-8$' },
    { label: 'B', text: '7' },
    { label: 'C', text: '8' },
    { label: 'D', text: '$-7$' },
  ]),
  mc(18, 3, 'Khoảng cách giữa hai điểm $A(1;2;-1)$ và $B(4;-2;3)$ bằng', 'A', [
    { label: 'A', text: '$\\sqrt{41}$' },
    { label: 'B', text: '$\\sqrt{29}$' },
    { label: 'C', text: '$\\sqrt{21}$' },
    { label: 'D', text: '$\\sqrt{34}$' },
  ]),
  mc(19, 3, 'Mặt phẳng đi qua điểm $A(1;0;0)$ và song song với mặt phẳng $2x-y+2z-3=0$ có phương trình là', 'D', [
    { label: 'A', text: '$2x-y+2z-3=0$' },
    { label: 'B', text: '$2x-y+2z+2=0$' },
    { label: 'C', text: '$x-2y+2z-1=0$' },
    { label: 'D', text: '$2x-y+2z-2=0$' },
  ]),
  mc(20, 3, 'Đường thẳng đi qua $A(1;2;3)$ và vuông góc với mặt phẳng $(P):x-2y+2z+1=0$ có phương trình tham số là', 'A', [
    { label: 'A', text: '$\\begin{cases}x=1+t\\\\y=2-2t\\\\z=3+2t\\end{cases}$' },
    { label: 'B', text: '$\\begin{cases}x=1+t\\\\y=2+t\\\\z=3+2t\\end{cases}$' },
    { label: 'C', text: '$\\begin{cases}x=1+2t\\\\y=2-t\\\\z=3+2t\\end{cases}$' },
    { label: 'D', text: '$\\begin{cases}x=1+t\\\\y=2-2t\\\\z=3-t\\end{cases}$' },
  ]),
  mc(21, 3, 'Khoảng cách từ điểm $M(1;1;1)$ đến đường thẳng $d:\\begin{cases}x=1+t\\\\y=2-t\\\\z=3+2t\\end{cases}$ bằng', 'B', [
    { label: 'A', text: '$\\dfrac{\\sqrt{21}}{3}$' },
    { label: 'B', text: '$\\sqrt{\\dfrac{7}{2}}$' },
    { label: 'C', text: '$\\sqrt{7}$' },
    { label: 'D', text: '$\\dfrac{\\sqrt{42}}{3}$' },
  ]),
  mc(22, 3, 'Mặt cầu tâm $I(1;-1;2)$ tiếp xúc với mặt phẳng $(P):x+2y+2z-5=0$ có bán kính bằng', 'A', [
    { label: 'A', text: '$\\dfrac{2}{3}$' },
    { label: 'B', text: '$\\dfrac{1}{3}$' },
    { label: 'C', text: '$1$' },
    { label: 'D', text: '$2$' },
  ]),
  mc(23, 3, 'Giao tuyến của hai mặt phẳng $x+y+z-1=0$ và $x-y+z-3=0$ có một vectơ chỉ phương là', 'C', [
    { label: 'A', text: '$(1;1;1)$' },
    { label: 'B', text: '$(1;0;1)$' },
    { label: 'C', text: '$(1;0;-1)$' },
    { label: 'D', text: '$(0;1;1)$' },
  ]),
  mc(24, 3, 'Mặt phẳng đi qua $A(1;2;-1)$ và vuông góc với đường thẳng $\\dfrac{x-1}{2}=\\dfrac{y+1}{-1}=\\dfrac{z-3}{2}$ có phương trình là', 'D', [
    { label: 'A', text: '$2x-y+2z-2=0$' },
    { label: 'B', text: '$x-2y+2z+2=0$' },
    { label: 'C', text: '$2x+y+2z+2=0$' },
    { label: 'D', text: '$2x-y+2z+2=0$' },
  ]),

  mc(25, 4, 'Để mặt phẳng $(P):x+my+z-1=0$ song song với đường thẳng $d:\\begin{cases}x=1+2t\\\\y=t\\\\z=-1+t\\end{cases}$ thì $m$ bằng', 'A', [
    { label: 'A', text: '$-3$' },
    { label: 'B', text: '3' },
    { label: 'C', text: '$-1$' },
    { label: 'D', text: '1' },
  ]),
  mc(26, 4, 'Khoảng cách giữa hai đường thẳng chéo nhau $d_1:\\begin{cases}x=t\\\\y=1+t\\\\z=2t\\end{cases}$ và $d_2:\\begin{cases}x=1+s\\\\y=s\\\\z=1\\end{cases}$ bằng', 'C', [
    { label: 'A', text: '$1$' },
    { label: 'B', text: '$\\dfrac{\\sqrt{2}}{2}$' },
    { label: 'C', text: '$\\sqrt{2}$' },
    { label: 'D', text: '$2$' },
  ]),
  mc(27, 4, 'Để mặt cầu $x^2+y^2+z^2-2x+4y-6z+m=0$ có bán kính bằng $3$ thì $m$ bằng', 'B', [
    { label: 'A', text: '4' },
    { label: 'B', text: '5' },
    { label: 'C', text: '9' },
    { label: 'D', text: '14' },
  ]),
  mc(28, 4, 'Mặt phẳng chứa giao tuyến của hai mặt phẳng $x+y+z-1=0$ và $2x-y+z-3=0$, đồng thời song song với đường thẳng có vectơ chỉ phương $\\vec u=(1;1;0)$, có phương trình là', 'D', [
    { label: 'A', text: '$x-y+z-1=0$' },
    { label: 'B', text: '$2x-y+z-3=0$' },
    { label: 'C', text: '$x+y+z-1=0$' },
    { label: 'D', text: '$3x-3y+z-5=0$' },
  ]),
  mc(29, 4, 'Để mặt phẳng $(P):x+2y+2z+m=0$ tiếp xúc với mặt cầu $(S):x^2+y^2+z^2=9$ thì $m$ thỏa mãn', 'C', [
    { label: 'A', text: '$m=\\pm 3$' },
    { label: 'B', text: '$m=\\pm 6$' },
    { label: 'C', text: '$m=\\pm 9$' },
    { label: 'D', text: '$m=9$' },
  ]),
  mc(30, 4, 'Mặt cầu đi qua bốn điểm $O(0;0;0)$, $A(1;0;0)$, $B(0;1;0)$, $C(0;0;1)$ có bán kính bằng', 'B', [
    { label: 'A', text: '$\\dfrac{1}{2}$' },
    { label: 'B', text: '$\\dfrac{\\sqrt{3}}{2}$' },
    { label: 'C', text: '$1$' },
    { label: 'D', text: '$\\sqrt{3}$' },
  ]),
]
