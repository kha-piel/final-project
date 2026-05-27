import type { SchoolExamQuestionRecord } from '../types/school-exam-types'

function mc(
  questionNumber: number,
  difficultyLevel: 1 | 2 | 3 | 4,
  questionText: string,
  answerValue: 'A' | 'B' | 'C' | 'D',
  options: Array<{ label: 'A' | 'B' | 'C' | 'D'; text: string }>,
): SchoolExamQuestionRecord {
  return {
    questionId: `supplemental-duong-tiem-can-reviewed-q${String(questionNumber).padStart(2, '0')}`,
    examId: 'supplemental-duong-tiem-can-reviewed',
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
    topic: 'Đường tiệm cận',
    obsidianSourcePath: 'Toan_Hoc/1_Ham_So/4_duong_tiem_can.md',
    hasImage: false,
    answerValue,
    sourceQuestionNumber: questionNumber,
    sourceSectionNumber: 1,
    examTitle: 'Bộ câu đường tiệm cận đã rà soát',
    schoolName: 'Nội bộ hệ thống',
    year: 2026,
    pdfUrl: '',
    tags: ['supplemental', 'knowledge-review', 'duong-tiem-can', 'reviewed'],
  }
}

export const supplementalDuongTiemCanReviewedQuestions: SchoolExamQuestionRecord[] = [
  mc(1, 1, 'Cho hàm số $y=f(x)$ thỏa mãn $\\lim_{x\\to 0^+} f(x)=-\\infty$ và $\\lim_{x\\to 2^+} f(x)=-\\infty$. Khẳng định đúng là', 'D', [
    { label: 'A', text: 'Đồ thị hàm số đã cho không có tiệm cận đứng.' },
    { label: 'B', text: 'Đồ thị hàm số đã cho chỉ có đúng một tiệm cận đứng.' },
    { label: 'C', text: 'Đồ thị hàm số đã cho có hai tiệm cận đứng là $y=0$ và $y=2$.' },
    { label: 'D', text: 'Đồ thị hàm số đã cho có hai tiệm cận đứng là $x=0$ và $x=2$.' },
  ]),
  mc(2, 1, 'Tìm tiệm cận đứng và tiệm cận ngang của đồ thị hàm số $y=\\dfrac{2x-1}{x+1}$.', 'B', [
    { label: 'A', text: '$x=1$, $y=2$.' },
    { label: 'B', text: '$x=-1$, $y=2$.' },
    { label: 'C', text: '$x=1$, $y=-2$.' },
    { label: 'D', text: '$x=-1$, $y=\\dfrac{1}{2}$.' },
  ]),
  mc(3, 1, 'Trong các hàm số sau, đồ thị hàm số nào nhận $x=2$ và $y=1$ làm các đường tiệm cận?', 'D', [
    { label: 'A', text: '$y=\\dfrac{x+2}{x-1}$' },
    { label: 'B', text: '$y=\\dfrac{x-2}{x-1}$' },
    { label: 'C', text: '$y=\\dfrac{2x-1}{x-2}$' },
    { label: 'D', text: '$y=\\dfrac{x+1}{x-2}$' },
  ]),
  mc(4, 1, 'Đồ thị nào sau đây không có tiệm cận ngang?', 'A', [
    { label: 'A', text: '$y=\\dfrac{x^2+1}{x-1}$' },
    { label: 'B', text: '$y=\\dfrac{x-2}{x+1}$' },
    { label: 'C', text: '$y=\\dfrac{1}{x+2}$' },
    { label: 'D', text: '$y=\\dfrac{x}{x+1}$' },
  ]),
  mc(5, 1, 'Đồ thị hàm số nào dưới đây có tiệm cận đứng?', 'D', [
    { label: 'A', text: '$y=\\dfrac{x^2-3x+2}{x-1}$' },
    { label: 'B', text: '$y=\\dfrac{x^2}{x^2+1}$' },
    { label: 'C', text: '$y=x^2-1$' },
    { label: 'D', text: '$y=\\dfrac{x}{x+1}$' },
  ]),
  mc(6, 2, 'Số tiệm cận của đồ thị hàm số $y=\\dfrac{x^2-5x+4}{x-1}$ là', 'A', [
    { label: 'A', text: '2' },
    { label: 'B', text: '3' },
    { label: 'C', text: '0' },
    { label: 'D', text: '1' },
  ]),
  mc(7, 2, 'Số tiệm cận đứng của đồ thị hàm số $y=\\dfrac{x^2+9}{x+3}$ là', 'D', [
    { label: 'A', text: '3' },
    { label: 'B', text: '2' },
    { label: 'C', text: '0' },
    { label: 'D', text: '1' },
  ]),
  mc(8, 2, 'Đường thẳng nào dưới đây là tiệm cận ngang của đồ thị hàm số $y=\\dfrac{x^2-3x+1}{x^2-x}$?', 'D', [
    { label: 'A', text: '$y=2$' },
    { label: 'B', text: '$x=1$' },
    { label: 'C', text: '$y=0$' },
    { label: 'D', text: '$y=1$' },
  ]),
  mc(9, 2, 'Đồ thị hàm số $y=\\dfrac{\\sqrt{x^2+1}}{x}$ có bao nhiêu tiệm cận?', 'A', [
    { label: 'A', text: '3' },
    { label: 'B', text: '1' },
    { label: 'C', text: '0' },
    { label: 'D', text: '2' },
  ]),
  mc(10, 2, 'Đồ thị hàm số $y=\\dfrac{x^2+4}{x^2-4}$ có bao nhiêu tiệm cận?', 'D', [
    { label: 'A', text: '3' },
    { label: 'B', text: '1' },
    { label: 'C', text: '2' },
    { label: 'D', text: '4' },
  ]),
  mc(11, 2, 'Tìm tất cả các tiệm cận đứng của đồ thị hàm số $y=\\dfrac{(x-1)^2}{x^2+x-6}$.', 'D', [
    { label: 'A', text: '$x=-3$ và $x=-2$' },
    { label: 'B', text: '$x=-3$' },
    { label: 'C', text: '$x=3$ và $x=2$' },
    { label: 'D', text: '$x=3$' },
  ]),
  mc(12, 3, 'Tìm tất cả các giá trị thực của tham số $m$ sao cho đồ thị hàm số $y=\\dfrac{x^2-3x+m}{x-m}$ không có tiệm cận đứng.', 'D', [
    { label: 'A', text: '$m>1$' },
    { label: 'B', text: '$m\\ne 0$' },
    { label: 'C', text: '$m=1$' },
    { label: 'D', text: '$m=0$ hoặc $m=1$' },
  ]),
  mc(13, 3, 'Tìm tất cả các giá trị thực của $m$ để đồ thị hàm số $y=\\dfrac{x-1}{x^2-mx+m}$ có đúng một tiệm cận đứng.', 'C', [
    { label: 'A', text: '$m=0$' },
    { label: 'B', text: '$m\\le 0$' },
    { label: 'C', text: '$m\\in\\{0\\}\\cup[4;+\\infty)$' },
    { label: 'D', text: '$m\\ge 4$' },
  ]),
  mc(14, 3, 'Tìm tất cả các giá trị của $m$ để đồ thị hàm số $y=\\dfrac{x^2+m}{x^2-x-2}$ có đúng một tiệm cận đứng.', 'A', [
    { label: 'A', text: '$m\\in\\{-1,-4\\}$' },
    { label: 'B', text: '$m=-1$' },
    { label: 'C', text: '$m=-4$' },
    { label: 'D', text: '$m\\in\\{1,4\\}$' },
  ]),
  mc(15, 4, 'Tìm các giá trị thực của tham số $m$ sao cho đồ thị hàm số $y=\\dfrac{mx^2+x+1}{(x+1)^2}$ có đúng một tiệm cận ngang.', 'C', [
    { label: 'A', text: '$m<-1$ hoặc $m>1$' },
    { label: 'B', text: '$m>0$' },
    { label: 'C', text: '$m=\\pm 1$' },
    { label: 'D', text: 'Với mọi $m$' },
  ]),
  mc(16, 4, 'Biết đồ thị hàm số $y=\\dfrac{(a-b)x^2+bx+2}{x^2+x-b}$ có tiệm cận đứng là $x=1$ và tiệm cận ngang là $y=0$. Tính $2a+b$.', 'C', [
    { label: 'A', text: '6' },
    { label: 'B', text: '7' },
    { label: 'C', text: '8' },
    { label: 'D', text: '10' },
  ]),
]
