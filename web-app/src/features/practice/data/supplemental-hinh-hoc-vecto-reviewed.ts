import type { SchoolExamQuestionRecord } from '../types/school-exam-types'

function mc(
  questionNumber: number,
  difficultyLevel: 1 | 2 | 3 | 4,
  questionText: string,
  answerValue: 'A' | 'B' | 'C' | 'D',
  options: Array<{ label: 'A' | 'B' | 'C' | 'D'; text: string }>,
): SchoolExamQuestionRecord {
  return {
    questionId: `supplemental-hinh-hoc-vecto-reviewed-q${String(questionNumber).padStart(2, '0')}`,
    examId: 'supplemental-hinh-hoc-vecto-reviewed',
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
    topic: 'Hình học không gian - vectơ',
    obsidianSourcePath: 'Toan_Hoc/2_Hinh_Hoc_Khong_Gian/1_vecto_trong_khong_gian.md',
    hasImage: false,
    answerValue,
    sourceQuestionNumber: questionNumber,
    sourceSectionNumber: 1,
    examTitle: 'Bộ câu hình học không gian - vectơ đã rà soát',
    schoolName: 'Nội bộ hệ thống',
    year: 2026,
    pdfUrl: '',
    tags: ['supplemental', 'knowledge-review', 'hinh-hoc-vecto', 'reviewed'],
  }
}

export const supplementalHinhHocVectoReviewedQuestions: SchoolExamQuestionRecord[] = [
  mc(1, 1, 'Trong không gian, nếu $\\vec a=(1;2;-1)$ và $\\vec b=(2;-1;3)$ thì $\\vec a+\\vec b$ bằng', 'C', [
    { label: 'A', text: '$(3;-1;2)$' },
    { label: 'B', text: '$(1;1;4)$' },
    { label: 'C', text: '$(3;1;2)$' },
    { label: 'D', text: '$(-1;3;-4)$' },
  ]),
  mc(2, 1, 'Nếu $\\vec a=(2;1;-3)$ thì vectơ đối của $\\vec a$ là', 'B', [
    { label: 'A', text: '$(2;-1;3)$' },
    { label: 'B', text: '$(-2;-1;3)$' },
    { label: 'C', text: '$(-2;1;-3)$' },
    { label: 'D', text: '$(2;1;3)$' },
  ]),
  mc(3, 1, 'Độ dài của vectơ $\\vec u=(1;2;2)$ là', 'A', [
    { label: 'A', text: '3' },
    { label: 'B', text: '$\\sqrt{5}$' },
    { label: 'C', text: '$2\\sqrt{2}$' },
    { label: 'D', text: '$\\sqrt{10}$' },
  ]),
  mc(4, 1, 'Hai vectơ $\\vec a=(1;2;3)$ và $\\vec b=(2;4;6)$ có quan hệ', 'D', [
    { label: 'A', text: 'Vuông góc' },
    { label: 'B', text: 'Bằng nhau' },
    { label: 'C', text: 'Cùng phương và ngược hướng' },
    { label: 'D', text: 'Cùng phương và cùng hướng' },
  ]),
  mc(5, 1, 'Nếu $A(1;0;2)$, $B(3;-1;5)$ thì $\\overrightarrow{AB}$ bằng', 'A', [
    { label: 'A', text: '$(2;-1;3)$' },
    { label: 'B', text: '$(2;1;3)$' },
    { label: 'C', text: '$(-2;1;-3)$' },
    { label: 'D', text: '$(4;-1;7)$' },
  ]),
  mc(6, 1, 'Cho $\\vec a=(1;0;2)$, $\\vec b=(2;1;-1)$. Tích vô hướng $\\vec a\\cdot\\vec b$ bằng', 'C', [
    { label: 'A', text: '$-1$' },
    { label: 'B', text: '$1$' },
    { label: 'C', text: '0' },
    { label: 'D', text: '3' },
  ]),
  mc(7, 1, 'Điều kiện để hai vectơ khác $\\vec 0$ vuông góc là', 'B', [
    { label: 'A', text: 'Chúng cùng phương' },
    { label: 'B', text: 'Tích vô hướng của chúng bằng 0' },
    { label: 'C', text: 'Tổng tọa độ của chúng bằng 0' },
    { label: 'D', text: 'Độ dài của chúng bằng nhau' },
  ]),
  mc(8, 1, 'Nếu $M$ là trung điểm của $AB$ với $A(1;2;3)$, $B(5;0;-1)$ thì $M$ có tọa độ', 'D', [
    { label: 'A', text: '$(3;2;1)$' },
    { label: 'B', text: '$(2;1;1)$' },
    { label: 'C', text: '$(3;1;2)$' },
    { label: 'D', text: '$(3;1;1)$' },
  ]),

  mc(9, 2, 'Cho $\\vec a=(1;2;-1)$ và $\\vec b=(2;4;-2)$. Khẳng định đúng là', 'A', [
    { label: 'A', text: '$\\vec a$ và $\\vec b$ cùng phương' },
    { label: 'B', text: '$\\vec a$ và $\\vec b$ vuông góc' },
    { label: 'C', text: '$\\vec a$ và $\\vec b$ bằng nhau' },
    { label: 'D', text: '$\\vec a$ và $\\vec b$ không cùng phương' },
  ]),
  mc(10, 2, 'Cho tam giác $ABC$ với $A(1;0;0)$, $B(0;1;0)$, $C(0;0;1)$. Trọng tâm $G$ của tam giác có tọa độ', 'B', [
    { label: 'A', text: '$\\left(\\dfrac{1}{2};\\dfrac{1}{2};\\dfrac{1}{2}\\right)$' },
    { label: 'B', text: '$\\left(\\dfrac{1}{3};\\dfrac{1}{3};\\dfrac{1}{3}\\right)$' },
    { label: 'C', text: '$(1;1;1)$' },
    { label: 'D', text: '$\\left(\\dfrac{2}{3};\\dfrac{2}{3};\\dfrac{2}{3}\\right)$' },
  ]),
  mc(11, 2, 'Cho hình bình hành $ABCD$. Khi đó đẳng thức vectơ nào đúng?', 'C', [
    { label: 'A', text: '$\\overrightarrow{AB}=\\overrightarrow{DC}$' },
    { label: 'B', text: '$\\overrightarrow{AB}=\\overrightarrow{CD}$' },
    { label: 'C', text: '$\\overrightarrow{AB}=\\overrightarrow{DC}$ và $\\overrightarrow{AD}=\\overrightarrow{BC}$' },
    { label: 'D', text: '$\\overrightarrow{AC}=\\overrightarrow{BD}$' },
  ]),
  mc(12, 2, 'Nếu $\\vec a=(1;2;3)$ và $\\vec b=(2;-1;0)$ thì $2\\vec a-\\vec b$ bằng', 'D', [
    { label: 'A', text: '$(4;1;6)$' },
    { label: 'B', text: '$(4;1;3)$' },
    { label: 'C', text: '$(1;5;6)$' },
    { label: 'D', text: '$(0;5;6)$' },
  ]),
  mc(13, 2, 'Cho tứ diện $ABCD$. Mệnh đề nào đúng?', 'A', [
    { label: 'A', text: '$\\overrightarrow{AB}+\\overrightarrow{BC}=\\overrightarrow{AC}$' },
    { label: 'B', text: '$\\overrightarrow{AB}+\\overrightarrow{CD}=\\overrightarrow{AD}$' },
    { label: 'C', text: '$\\overrightarrow{AB}=\\overrightarrow{CB}$' },
    { label: 'D', text: '$\\overrightarrow{AC}+\\overrightarrow{BD}=\\vec 0$' },
  ]),
  mc(14, 2, 'Cho điểm $A(1;2;3)$ và vectơ $\\vec u=(2;-1;4)$. Điểm $B$ sao cho $\\overrightarrow{AB}=\\vec u$ có tọa độ', 'B', [
    { label: 'A', text: '$(3;1;4)$' },
    { label: 'B', text: '$(3;1;7)$' },
    { label: 'C', text: '$(2;1;7)$' },
    { label: 'D', text: '$(-1;3;-1)$' },
  ]),
  mc(15, 2, 'Giá trị của $m$ để hai vectơ $\\vec a=(1;m;2)$ và $\\vec b=(2;4;4)$ cùng phương là', 'A', [
    { label: 'A', text: '2' },
    { label: 'B', text: '4' },
    { label: 'C', text: '1' },
    { label: 'D', text: '$-2$' },
  ]),
  mc(16, 2, 'Cho $\\vec a=(1;1;0)$, $\\vec b=(0;1;1)$. Góc giữa $\\vec a$ và $\\vec b$ bằng', 'B', [
    { label: 'A', text: '$30^\\circ$' },
    { label: 'B', text: '$60^\\circ$' },
    { label: 'C', text: '$45^\\circ$' },
    { label: 'D', text: '$90^\\circ$' },
  ]),

  mc(17, 3, 'Cho ba điểm $A(1;0;0)$, $B(0;1;0)$, $C(2;1;0)$. Ba điểm này', 'C', [
    { label: 'A', text: 'Không thẳng hàng và không đồng phẳng' },
    { label: 'B', text: 'Thẳng hàng' },
    { label: 'C', text: 'Không thẳng hàng nhưng đồng phẳng' },
    { label: 'D', text: 'Tạo thành tam giác vuông cân tại $A$' },
  ]),
  mc(18, 3, 'Cho hình hộp $ABCD.A' + "'" + 'B' + "'" + 'C' + "'" + 'D' + "'" + '$. Đẳng thức nào sau đây đúng?', 'D', [
    { label: 'A', text: '$\\overrightarrow{AC}=\\overrightarrow{AB}+\\overrightarrow{AD}+\\overrightarrow{AA' + "'" + '}$' },
    { label: 'B', text: '$\\overrightarrow{AB}+\\overrightarrow{AD}=\\overrightarrow{AA' + "'" + '}$' },
    { label: 'C', text: '$\\overrightarrow{AB}+\\overrightarrow{BC}=\\overrightarrow{BD}$' },
    { label: 'D', text: '$\\overrightarrow{AC' + "'" + '}=\\overrightarrow{AB}+\\overrightarrow{AD}+\\overrightarrow{AA' + "'" + '}$' },
  ]),
  mc(19, 3, 'Cho $A(1;2;3), B(2;1;0), C(3;0;1)$. Khi đó vectơ $\\overrightarrow{AB}+\\overrightarrow{BC}$ bằng', 'A', [
    { label: 'A', text: '$\\overrightarrow{AC}$' },
    { label: 'B', text: '$\\overrightarrow{CA}$' },
    { label: 'C', text: '$\\overrightarrow{BA}$' },
    { label: 'D', text: '$\\vec 0$' },
  ]),
  mc(20, 3, 'Cho tam giác $ABC$ với $A(1;0;0), B(0;2;0), C(0;0;3)$. Độ dài đường trung tuyến kẻ từ $A$ bằng', 'D', [
    { label: 'A', text: '$\\sqrt{2}$' },
    { label: 'B', text: '$\\sqrt{3}$' },
    { label: 'C', text: '$\\sqrt{5}$' },
    { label: 'D', text: '$\\dfrac{\\sqrt{17}}{2}$' },
  ]),
  mc(21, 3, 'Cho $\\vec a=(1;2;3)$, $\\vec b=(2;1;m)$. Để $\\vec a\\perp\\vec b$ thì $m$ bằng', 'B', [
    { label: 'A', text: '$-1$' },
    { label: 'B', text: '$-\\dfrac{4}{3}$' },
    { label: 'C', text: '$\\dfrac{4}{3}$' },
    { label: 'D', text: '$1$' },
  ]),
  mc(22, 3, 'Cho tứ diện $ABCD$. Nếu $\\overrightarrow{AB}+\\overrightarrow{AC}+\\overrightarrow{AD}=\\vec 0$ thì $A$ là', 'B', [
    { label: 'A', text: 'Trung điểm của $BC$' },
    { label: 'B', text: 'Trọng tâm tam giác $BCD$' },
    { label: 'C', text: 'Trọng tâm tứ diện $ABCD$' },
    { label: 'D', text: 'Tâm mặt cầu ngoại tiếp tứ diện $ABCD$' },
  ]),
  mc(23, 3, 'Cho $A(1;2;0), B(0;1;1), C(2;0;1)$. Diện tích tam giác $ABC$ bằng', 'A', [
    { label: 'A', text: '$\\dfrac{\\sqrt{14}}{2}$' },
    { label: 'B', text: '$\\sqrt{35}$' },
    { label: 'C', text: '$\\dfrac{5}{2}$' },
    { label: 'D', text: '$5$' },
  ]),
  mc(24, 3, 'Cho điểm $M(1;1;1)$ là trọng tâm tam giác $ABC$ với $A(1;0;0), B(0;2;1)$. Tọa độ điểm $C$ là', 'D', [
    { label: 'A', text: '$(2;1;1)$' },
    { label: 'B', text: '$(1;1;2)$' },
    { label: 'C', text: '$(1;0;2)$' },
    { label: 'D', text: '$(2;1;2)$' },
  ]),

  mc(25, 4, 'Cho bốn điểm $A(1;0;0), B(0;1;0), C(0;0;1), D(1;1;1)$. Khẳng định nào đúng?', 'A', [
    { label: 'A', text: 'Tứ diện $ABCD$ có trọng tâm là $\\left(\\dfrac{1}{2};\\dfrac{1}{2};\\dfrac{1}{2}\\right)$' },
    { label: 'B', text: 'Bốn điểm đồng phẳng' },
    { label: 'C', text: '$\\overrightarrow{AB},\\overrightarrow{AC},\\overrightarrow{AD}$ cùng phương' },
    { label: 'D', text: '$D$ là trung điểm của $BC$' },
  ]),
  mc(26, 4, 'Cho tam giác $ABC$ với $A(1;0;0), B(0;1;0), C(0;0;1)$. Điểm $M$ thỏa $\\overrightarrow{MA}+\\overrightarrow{MB}+\\overrightarrow{MC}=\\vec 0$ có tọa độ', 'B', [
    { label: 'A', text: '$(1;1;1)$' },
    { label: 'B', text: '$\\left(\\dfrac{1}{3};\\dfrac{1}{3};\\dfrac{1}{3}\\right)$' },
    { label: 'C', text: '$\\left(\\dfrac{1}{2};\\dfrac{1}{2};\\dfrac{1}{2}\\right)$' },
    { label: 'D', text: '$(0;0;0)$' },
  ]),
  mc(27, 4, 'Cho $\\vec a=(1;2;3), \\vec b=(2;1;0), \\vec c=(m;3;3)$. Để ba vectơ đồng phẳng thì $m$ bằng', 'D', [
    { label: 'A', text: '0' },
    { label: 'B', text: '1' },
    { label: 'C', text: '2' },
    { label: 'D', text: '3' },
  ]),
  mc(28, 4, 'Cho hình tứ diện $ABCD$. Nếu $I$ là trung điểm của $BC$, $J$ là trung điểm của $AD$ thì vectơ $\\overrightarrow{IJ}$ bằng', 'A', [
    { label: 'A', text: '$\\dfrac{1}{2}(\\overrightarrow{BA}+\\overrightarrow{CD})$' },
    { label: 'B', text: '$\\dfrac{1}{2}(\\overrightarrow{AB}+\\overrightarrow{CD})$' },
    { label: 'C', text: '$\\overrightarrow{AD}+\\overrightarrow{BC}$' },
    { label: 'D', text: '$\\dfrac{1}{2}(\\overrightarrow{AC}+\\overrightarrow{BD})$' },
  ]),
  mc(29, 4, 'Trong không gian, cho ba vectơ đơn vị đôi một vuông góc. Độ dài của tổng ba vectơ đó bằng', 'D', [
    { label: 'A', text: '1' },
    { label: 'B', text: '$\\sqrt{2}$' },
    { label: 'C', text: '2' },
    { label: 'D', text: '$\\sqrt{3}$' },
  ]),
  mc(30, 4, 'Cho $A(1;2;3), B(2;3;1), C(3;1;2)$. Giá trị nhỏ nhất của biểu thức $P=MA^2+MB^2+MC^2$ khi $M$ thay đổi trong không gian là', 'B', [
    { label: 'A', text: '4' },
    { label: 'B', text: '6' },
    { label: 'C', text: '8' },
    { label: 'D', text: '10' },
  ]),
]
