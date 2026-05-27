import type { SchoolExamQuestionRecord } from '../types/school-exam-types'
import { buildSupplementalMcQuestion } from './supplemental-reviewed-helper'

const config = {
  examId: 'supplemental-tich-phan-dien-tich-reviewed',
  examTitle: 'Bộ câu tích phân và diện tích hình phẳng đã rà soát',
  topic: 'Tích phân và diện tích hình phẳng',
  obsidianSourcePath: 'Toan_Hoc/4_Nguyen_Ham_Tich_Phan/2_tich_phan.md',
  tagSlug: 'tich-phan-dien-tich',
}

const q = (
  questionNumber: number,
  difficultyLevel: 1 | 2 | 3 | 4,
  questionText: string,
  answerValue: 'A' | 'B' | 'C' | 'D',
  options: Array<{ label: 'A' | 'B' | 'C' | 'D'; text: string }>,
) => buildSupplementalMcQuestion(config, questionNumber, difficultyLevel, questionText, answerValue, options)

export const supplementalTichPhanDienTichReviewedQuestions: SchoolExamQuestionRecord[] = [
  q(1, 1, 'Giá trị của $\\int_0^1 x\\,dx$ bằng', 'B', [{ label: 'A', text: '1' }, { label: 'B', text: '$\\dfrac{1}{2}$' }, { label: 'C', text: '2' }, { label: 'D', text: '$\\dfrac{1}{3}$' }]),
  q(2, 1, 'Giá trị của $\\int_0^1 1\\,dx$ bằng', 'A', [{ label: 'A', text: '1' }, { label: 'B', text: '0' }, { label: 'C', text: '2' }, { label: 'D', text: '$\\dfrac{1}{2}$' }]),
  q(3, 1, 'Theo công thức Newton-Leibniz, $\\int_a^b f(x)dx=$', 'C', [{ label: 'A', text: '$F(a)-F(b)$' }, { label: 'B', text: '$f(b)-f(a)$' }, { label: 'C', text: '$F(b)-F(a)$' }, { label: 'D', text: '$f(a)+f(b)$' }]),
  q(4, 1, 'Giá trị của $\\int_0^{\\pi} \\sin x\\,dx$ bằng', 'D', [{ label: 'A', text: '0' }, { label: 'B', text: '1' }, { label: 'C', text: '$\\pi$' }, { label: 'D', text: '2' }]),
  q(5, 1, "Diện tích hình phẳng giới hạn bởi $y=f(x)$ và trục hoành trên đoạn $[a,b]$ khi $f(x)\\ge0$ là", 'A', [{ label: 'A', text: '$\\int_a^b f(x)dx$' }, { label: 'B', text: '$f(b)-f(a)$' }, { label: 'C', text: '$\\left|f(b)-f(a)\\right|$' }, { label: 'D', text: '$\\int_a^b f(x)dx+1$' }]),
  q(6, 1, 'Tính chất đúng là', 'B', [{ label: 'A', text: '$\\int_a^b f(x)dx=\\int_b^a f(x)dx$' }, { label: 'B', text: '$\\int_a^a f(x)dx=0$' }, { label: 'C', text: '$\\int_a^b [f(x)+g(x)]dx=\\int_a^b f(x)dx+g(x)$' }, { label: 'D', text: '$\\int_a^b kf(x)dx=\\int_a^b f(x)dx+k$' }]),
  q(7, 1, 'Giá trị của $\\int_0^2 2x\\,dx$ bằng', 'C', [{ label: 'A', text: '2' }, { label: 'B', text: '3' }, { label: 'C', text: '4' }, { label: 'D', text: '6' }]),
  q(8, 1, 'Nếu $f(x)$ là hàm lẻ và liên tục trên $[-a;a]$ thì $\\int_{-a}^a f(x)dx$ bằng', 'D', [{ label: 'A', text: '$2\\int_0^a f(x)dx$' }, { label: 'B', text: '$\\int_0^a f(x)dx$' }, { label: 'C', text: '$a$' }, { label: 'D', text: '0' }]),
  q(9, 2, 'Tính $\\int_0^1 (3x^2+1)dx$.', 'A', [{ label: 'A', text: '2' }, { label: 'B', text: '1' }, { label: 'C', text: '$\\dfrac{4}{3}$' }, { label: 'D', text: '$\\dfrac{5}{2}$' }]),
  q(10, 2, 'Tính $\\int_1^e \\dfrac{1}{x}dx$.', 'C', [{ label: 'A', text: '$e-1$' }, { label: 'B', text: '$\\ln e + \\ln 1$' }, { label: 'C', text: '1' }, { label: 'D', text: '$\\dfrac{1}{e}$' }]),
  q(11, 2, 'Tính $\\int_0^1 e^x dx$.', 'B', [{ label: 'A', text: '$e$' }, { label: 'B', text: '$e-1$' }, { label: 'C', text: '$1-e$' }, { label: 'D', text: '$\\dfrac{e}{2}$' }]),
  q(12, 2, 'Diện tích hình phẳng giới hạn bởi $y=x$, trục hoành và đường thẳng $x=2$ bằng', 'D', [{ label: 'A', text: '1' }, { label: 'B', text: '4' }, { label: 'C', text: '$\\dfrac{2}{3}$' }, { label: 'D', text: '2' }]),
  q(13, 2, 'Tính $\\int_0^{\\pi/2} \\cos x\\,dx$.', 'A', [{ label: 'A', text: '1' }, { label: 'B', text: '0' }, { label: 'C', text: '$\\dfrac{\\pi}{2}$' }, { label: 'D', text: '2' }]),
  q(14, 2, 'Nếu $f(x)\\ge g(x)$ trên $[a,b]$ thì diện tích hình phẳng giới hạn bởi hai đồ thị là', 'C', [{ label: 'A', text: '$\\int_a^b [g(x)-f(x)]dx$' }, { label: 'B', text: '$\\left|\\int_a^b f(x)dx\\right|$' }, { label: 'C', text: '$\\int_a^b [f(x)-g(x)]dx$' }, { label: 'D', text: '$f(b)-g(a)$' }]),
  q(15, 2, 'Tính $\\int_0^1 (2x+3)dx$.', 'B', [{ label: 'A', text: '3' }, { label: 'B', text: '4' }, { label: 'C', text: '5' }, { label: 'D', text: '$\\dfrac{7}{2}$' }]),
  q(16, 2, 'Với hàm chẵn $f(x)$ liên tục trên $[-a;a]$, ta có', 'D', [{ label: 'A', text: '$\\int_{-a}^a f(x)dx=0$' }, { label: 'B', text: '$\\int_{-a}^a f(x)dx=\\int_0^a f(x)dx$' }, { label: 'C', text: '$\\int_{-a}^a f(x)dx=-2\\int_0^a f(x)dx$' }, { label: 'D', text: '$\\int_{-a}^a f(x)dx=2\\int_0^a f(x)dx$' }]),
  q(17, 3, 'Tính $\\int_0^1 x(x+1)dx$.', 'A', [{ label: 'A', text: '$\\dfrac{5}{6}$' }, { label: 'B', text: '$\\dfrac{1}{2}$' }, { label: 'C', text: '$\\dfrac{2}{3}$' }, { label: 'D', text: '1' }]),
  q(18, 3, 'Tính $\\int_0^1 \\dfrac{2x}{x^2+1}dx$.', 'D', [{ label: 'A', text: '1' }, { label: 'B', text: '$\\dfrac{1}{2}$' }, { label: 'C', text: '$\\ln 2 +1$' }, { label: 'D', text: '$\\ln 2$' }]),
  q(19, 3, 'Diện tích hình phẳng giới hạn bởi $y=x^2$ và $y=x$ trên đoạn $[0;1]$ bằng', 'B', [{ label: 'A', text: '$\\dfrac{1}{3}$' }, { label: 'B', text: '$\\dfrac{1}{6}$' }, { label: 'C', text: '$\\dfrac{1}{2}$' }, { label: 'D', text: '$\\dfrac{2}{3}$' }]),
  q(20, 3, 'Tính $\\int_0^1 (1-x)^2dx$.', 'C', [{ label: 'A', text: '$\\dfrac{1}{2}$' }, { label: 'B', text: '$\\dfrac{2}{3}$' }, { label: 'C', text: '$\\dfrac{1}{3}$' }, { label: 'D', text: '$\\dfrac{1}{4}$' }]),
  q(21, 3, 'Tính $\\int_0^{\\ln 2} e^x dx$.', 'A', [{ label: 'A', text: '1' }, { label: 'B', text: '$\\ln 2$' }, { label: 'C', text: '2' }, { label: 'D', text: '$\\dfrac{1}{2}$' }]),
  q(22, 3, 'Diện tích hình phẳng giới hạn bởi $y=2x$ và $y=x^2$ trên khoảng giữa hai giao điểm bằng', 'D', [{ label: 'A', text: '$\\dfrac{2}{3}$' }, { label: 'B', text: '$\\dfrac{8}{3}$' }, { label: 'C', text: '$\\dfrac{10}{3}$' }, { label: 'D', text: '$\\dfrac{4}{3}$' }]),
  q(23, 3, 'Tính $\\int_{-1}^1 (x^3+x)dx$.', 'B', [{ label: 'A', text: '2' }, { label: 'B', text: '0' }, { label: 'C', text: '$\\dfrac{1}{2}$' }, { label: 'D', text: '$-1$' }]),
  q(24, 3, 'Tính $\\int_0^1 \\left(\\dfrac{1}{\\sqrt{x+1}}\\right)dx$.', 'C', [{ label: 'A', text: '$\\sqrt{2}$' }, { label: 'B', text: '1' }, { label: 'C', text: '$2(\\sqrt{2}-1)$' }, { label: 'D', text: '$\\ln 2$' }]),
  q(25, 4, 'Diện tích hình phẳng giới hạn bởi $y=x^2-1$, trục hoành và hai đường thẳng $x=-1$, $x=1$ bằng', 'A', [{ label: 'A', text: '$\\dfrac{4}{3}$' }, { label: 'B', text: '$\\dfrac{2}{3}$' }, { label: 'C', text: '2' }, { label: 'D', text: '$\\dfrac{8}{3}$' }]),
  q(26, 4, 'Tính $\\int_0^1 (3x-1)^2dx$.', 'A', [{ label: 'A', text: '1' }, { label: 'B', text: '$\\dfrac{4}{3}$' }, { label: 'C', text: '$\\dfrac{2}{3}$' }, { label: 'D', text: '$\\dfrac{5}{6}$' }]),
  q(27, 4, 'Tính $\\int_0^1 \\dfrac{1}{(x+1)^2}dx$.', 'B', [{ label: 'A', text: '$\\ln 2$' }, { label: 'B', text: '$\\dfrac{1}{2}$' }, { label: 'C', text: '1' }, { label: 'D', text: '$\\dfrac{3}{2}$' }]),
  q(28, 4, 'Cho miền phẳng giới hạn bởi $y=x^2$, $y=0$, $x=1$, $x=2$. Diện tích miền đó bằng', 'B', [{ label: 'A', text: '$\\dfrac{5}{3}$' }, { label: 'B', text: '$\\dfrac{7}{3}$' }, { label: 'C', text: '$\\dfrac{8}{3}$' }, { label: 'D', text: '3' }]),
  q(29, 4, 'Tính $\\int_0^1 \\left(x+\\dfrac{1}{x+1}\\right)dx$.', 'A', [{ label: 'A', text: '$\\dfrac{1}{2}+\\ln 2$' }, { label: 'B', text: '$1+\\ln 2$' }, { label: 'C', text: '$\\ln 2$' }, { label: 'D', text: '$\\dfrac{3}{2}$' }]),
  q(30, 4, 'Diện tích hình phẳng giới hạn bởi $y=|x|$ và $y=x^2$ bằng', 'D', [{ label: 'A', text: '$\\dfrac{1}{3}$' }, { label: 'B', text: '$\\dfrac{2}{3}$' }, { label: 'C', text: '$\\dfrac{4}{3}$' }, { label: 'D', text: '1' }]),
]
