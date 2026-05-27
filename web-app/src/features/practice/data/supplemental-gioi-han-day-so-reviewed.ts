import type { SchoolExamQuestionRecord } from '../types/school-exam-types'

function mc(
  questionNumber: number,
  difficultyLevel: 1 | 2 | 3 | 4,
  questionText: string,
  answerValue: 'A' | 'B' | 'C' | 'D',
  options: Array<{ label: 'A' | 'B' | 'C' | 'D'; text: string }>,
): SchoolExamQuestionRecord {
  return {
    questionId: `supplemental-gioi-han-day-so-reviewed-q${String(questionNumber).padStart(2, '0')}`,
    examId: 'supplemental-gioi-han-day-so-reviewed',
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
    topic: 'Giới hạn dãy số',
    obsidianSourcePath: 'Toan_Hoc/5_Gioi_Han_Day_So/1_gioi_han_day_so.md',
    hasImage: false,
    answerValue,
    sourceQuestionNumber: questionNumber,
    sourceSectionNumber: 1,
    examTitle: 'Bộ câu giới hạn dãy số đã rà soát',
    schoolName: 'Nội bộ hệ thống',
    year: 2026,
    pdfUrl: '',
    tags: ['supplemental', 'knowledge-review', 'gioi-han-day-so', 'reviewed'],
  }
}

export const supplementalGioiHanDaySoReviewedQuestions: SchoolExamQuestionRecord[] = [
  mc(1, 1, 'Tính $\\lim\\limits_{n\\to\\infty} \\dfrac{1}{n}$.', 'A', [
    { label: 'A', text: '0' },
    { label: 'B', text: '1' },
    { label: 'C', text: '$+\\infty$' },
    { label: 'D', text: 'Không tồn tại' },
  ]),
  mc(2, 1, 'Tính $\\lim\\limits_{n\\to\\infty} \\dfrac{2n+1}{n+3}$.', 'C', [
    { label: 'A', text: '0' },
    { label: 'B', text: '1' },
    { label: 'C', text: '2' },
    { label: 'D', text: '3' },
  ]),
  mc(3, 1, 'Tính $\\lim\\limits_{n\\to\\infty} \\dfrac{3n^2-1}{n^2+2n}$.', 'D', [
    { label: 'A', text: '0' },
    { label: 'B', text: '1' },
    { label: 'C', text: '2' },
    { label: 'D', text: '3' },
  ]),
  mc(4, 1, 'Tính $\\lim\\limits_{n\\to\\infty} \\left(\\dfrac{1}{2}\\right)^n$.', 'B', [
    { label: 'A', text: '1' },
    { label: 'B', text: '0' },
    { label: 'C', text: '$-1$' },
    { label: 'D', text: '$+\\infty$' },
  ]),
  mc(5, 1, 'Cho dãy số $u_n=\\dfrac{5-2n}{n+1}$. Giới hạn của $u_n$ khi $n\\to\\infty$ là', 'A', [
    { label: 'A', text: '$-2$' },
    { label: 'B', text: '$2$' },
    { label: 'C', text: '$0$' },
    { label: 'D', text: '$5$' },
  ]),
  mc(6, 1, 'Tính $\\lim\\limits_{n\\to\\infty} \\dfrac{n^3+1}{2n^3-n}$.', 'C', [
    { label: 'A', text: '0' },
    { label: 'B', text: '2' },
    { label: 'C', text: '$\\dfrac{1}{2}$' },
    { label: 'D', text: '$1$' },
  ]),
  mc(7, 1, 'Tính $\\lim\\limits_{n\\to\\infty} \\sqrt[n]{3}$.', 'B', [
    { label: 'A', text: '0' },
    { label: 'B', text: '1' },
    { label: 'C', text: '3' },
    { label: 'D', text: '$+\\infty$' },
  ]),
  mc(8, 1, 'Nếu $u_n=\\dfrac{(-1)^n}{n}$ thì $\\lim\\limits_{n\\to\\infty}u_n$ bằng', 'D', [
    { label: 'A', text: '$1$' },
    { label: 'B', text: '$-1$' },
    { label: 'C', text: 'Không tồn tại' },
    { label: 'D', text: '$0$' },
  ]),

  mc(9, 2, 'Tính $\\lim\\limits_{n\\to\\infty} \\dfrac{\\sqrt{n^2+1}}{n}$.', 'B', [
    { label: 'A', text: '0' },
    { label: 'B', text: '1' },
    { label: 'C', text: '$\\sqrt{2}$' },
    { label: 'D', text: '$+\\infty$' },
  ]),
  mc(10, 2, 'Tính $\\lim\\limits_{n\\to\\infty} \\left(\\sqrt{n^2+3n}-n\\right)$.', 'A', [
    { label: 'A', text: '$\\dfrac{3}{2}$' },
    { label: 'B', text: '0' },
    { label: 'C', text: '3' },
    { label: 'D', text: '$+\\infty$' },
  ]),
  mc(11, 2, 'Tính $\\lim\\limits_{n\\to\\infty} \\dfrac{n^2-4}{\\sqrt{n^4+1}}$.', 'C', [
    { label: 'A', text: '0' },
    { label: 'B', text: '$-1$' },
    { label: 'C', text: '1' },
    { label: 'D', text: '2' },
  ]),
  mc(12, 2, 'Cho $u_n=\\dfrac{2n^2+3}{n^2-1}$ và $v_n=\\dfrac{n-1}{n+2}$. Khi đó $\\lim\\limits_{n\\to\\infty}(u_n+v_n)$ bằng', 'C', [
    { label: 'A', text: '0' },
    { label: 'B', text: '1' },
    { label: 'C', text: '3' },
    { label: 'D', text: '4' },
  ]),
  mc(13, 2, 'Tính $\\lim\\limits_{n\\to\\infty} \\dfrac{1+2+\\cdots+n}{n^2}$.', 'A', [
    { label: 'A', text: '$\\dfrac{1}{2}$' },
    { label: 'B', text: '1' },
    { label: 'C', text: '$0$' },
    { label: 'D', text: '$2$' },
  ]),
  mc(14, 2, 'Tính $\\lim\\limits_{n\\to\\infty} \\dfrac{\\sqrt{4n^2+n}+n}{3n+1}$.', 'B', [
    { label: 'A', text: '$\\dfrac{1}{3}$' },
    { label: 'B', text: '1' },
    { label: 'C', text: '$\\dfrac{2}{3}$' },
    { label: 'D', text: '$\\dfrac{4}{3}$' },
  ]),
  mc(15, 2, 'Biết $u_n=\\dfrac{n+1}{n^2+1}$. Khi đó $\\lim\\limits_{n\\to\\infty}(nu_n)$ bằng', 'B', [
    { label: 'A', text: '0' },
    { label: 'B', text: '1' },
    { label: 'C', text: '2' },
    { label: 'D', text: '$+\\infty$' },
  ]),
  mc(16, 2, 'Tính $\\lim\\limits_{n\\to\\infty} \\dfrac{2^n+3^n}{3^n-2^n}$.', 'C', [
    { label: 'A', text: '0' },
    { label: 'B', text: '$-1$' },
    { label: 'C', text: '1' },
    { label: 'D', text: '$2$' },
  ]),

  mc(17, 3, 'Tính $\\lim\\limits_{n\\to\\infty} n\\left(\\sqrt{n^2+1}-n\\right)$.', 'A', [
    { label: 'A', text: '$\\dfrac{1}{2}$' },
    { label: 'B', text: '1' },
    { label: 'C', text: '$0$' },
    { label: 'D', text: '$+\\infty$' },
  ]),
  mc(18, 3, 'Tính $\\lim\\limits_{n\\to\\infty} \\dfrac{n^2+n}{2n^2-3n+1}$.', 'C', [
    { label: 'A', text: '$0$' },
    { label: 'B', text: '$1$' },
    { label: 'C', text: '$\\dfrac{1}{2}$' },
    { label: 'D', text: '$2$' },
  ]),
  mc(19, 3, 'Cho dãy $u_n=\\dfrac{n^2+1}{n+1}-n$. Khi đó $\\lim\\limits_{n\\to\\infty}u_n$ bằng', 'B', [
    { label: 'A', text: '0' },
    { label: 'B', text: '$-1$' },
    { label: 'C', text: '1' },
    { label: 'D', text: '$+\\infty$' },
  ]),
  mc(20, 3, 'Tính $\\lim\\limits_{n\\to\\infty} \\dfrac{\\sqrt{n^2+2n}-n}{\\sqrt{n^2+n}-n}$.', 'D', [
    { label: 'A', text: '$\\dfrac{1}{2}$' },
    { label: 'B', text: '$\\sqrt{2}$' },
    { label: 'C', text: '$1$' },
    { label: 'D', text: '2' },
  ]),
  mc(21, 3, 'Cho $u_n=\\dfrac{3n^2-2n+1}{n^2+n}$, $v_n=\\dfrac{2n-1}{n+1}$. Tính $\\lim\\limits_{n\\to\\infty}\\dfrac{u_n}{v_n}$.', 'A', [
    { label: 'A', text: '$\\dfrac{3}{2}$' },
    { label: 'B', text: '$\\dfrac{2}{3}$' },
    { label: 'C', text: '1' },
    { label: 'D', text: '2' },
  ]),
  mc(22, 3, 'Giá trị của $a$ để $\\lim\\limits_{n\\to\\infty} \\dfrac{an^2+2n+1}{n^2-1}=5$ là', 'D', [
    { label: 'A', text: '2' },
    { label: 'B', text: '3' },
    { label: 'C', text: '4' },
    { label: 'D', text: '5' },
  ]),
  mc(23, 3, 'Nếu $u_n=n\\left(\\sqrt{1+\\dfrac{a}{n}}-1\\right)$ và $\\lim\\limits_{n\\to\\infty}u_n=3$ thì $a$ bằng', 'C', [
    { label: 'A', text: '2' },
    { label: 'B', text: '3' },
    { label: 'C', text: '6' },
    { label: 'D', text: '12' },
  ]),
  mc(24, 3, 'Tính $\\lim\\limits_{n\\to\\infty} \\left(\\dfrac{n+1}{n+3}+\\dfrac{n+2}{n+4}\\right)$.', 'B', [
    { label: 'A', text: '1' },
    { label: 'B', text: '2' },
    { label: 'C', text: '0' },
    { label: 'D', text: '4' },
  ]),

  mc(25, 4, 'Cho dãy $u_n=n\\left(\\sqrt{1+\\dfrac{a}{n}}-1\\right)$. Nếu $\\lim\\limits_{n\\to\\infty}u_n=2$ thì $a$ bằng', 'C', [
    { label: 'A', text: '1' },
    { label: 'B', text: '2' },
    { label: 'C', text: '4' },
    { label: 'D', text: '8' },
  ]),
  mc(26, 4, 'Giả sử $u_n=\\dfrac{n^3+an^2+1}{2n^3-n+3}$ và $\\lim\\limits_{n\\to\\infty}u_n=\\dfrac{1}{2}$. Khẳng định nào đúng?', 'A', [
    { label: 'A', text: 'Mọi giá trị thực của $a$ đều thỏa mãn.' },
    { label: 'B', text: 'Chỉ $a=0$ thỏa mãn.' },
    { label: 'C', text: 'Chỉ $a=1$ thỏa mãn.' },
    { label: 'D', text: 'Không có giá trị nào của $a$ thỏa mãn.' },
  ]),
  mc(27, 4, 'Tính $\\lim\\limits_{n\\to\\infty} n\\left(\\sqrt{1+\\dfrac{2}{n}}-\\sqrt{1-\\dfrac{1}{n}}\\right)$.', 'C', [
    { label: 'A', text: '$\\dfrac{1}{2}$' },
    { label: 'B', text: '1' },
    { label: 'C', text: '$\\dfrac{3}{2}$' },
    { label: 'D', text: '2' },
  ]),
  mc(28, 4, 'Cho dãy $u_n=\\dfrac{1^2+2^2+\\cdots+n^2}{n^3}$. Giới hạn của $u_n$ khi $n\\to\\infty$ là', 'B', [
    { label: 'A', text: '$\\dfrac{1}{2}$' },
    { label: 'B', text: '$\\dfrac{1}{3}$' },
    { label: 'C', text: '$\\dfrac{2}{3}$' },
    { label: 'D', text: '1' },
  ]),
  mc(29, 4, 'Biết $\\lim\\limits_{n\\to\\infty} \\dfrac{an^2+bn+1}{n^2-2n+3}=2$ và $\\lim\\limits_{n\\to\\infty} n\\left(\\dfrac{an+b}{n+1}-2\\right)=1$. Giá trị của $a+b$ là', 'B', [
    { label: 'A', text: '3' },
    { label: 'B', text: '5' },
    { label: 'C', text: '6' },
    { label: 'D', text: '7' },
  ]),
  mc(30, 4, 'Tính $\\lim\\limits_{n\\to\\infty} n^2\\left(\\sqrt{1+\\dfrac{1}{n}}-1-\\dfrac{1}{2n}\\right)$.', 'D', [
    { label: 'A', text: '$\\dfrac{1}{8}$' },
    { label: 'B', text: '$-\\dfrac{1}{4}$' },
    { label: 'C', text: '$\\dfrac{1}{4}$' },
    { label: 'D', text: '$-\\dfrac{1}{8}$' },
  ]),
]
