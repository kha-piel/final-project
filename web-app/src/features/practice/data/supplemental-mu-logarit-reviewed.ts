import type { SchoolExamQuestionRecord } from '../types/school-exam-types'
import { buildSupplementalMcQuestion } from './supplemental-reviewed-helper'

const config = {
  examId: 'supplemental-mu-logarit-reviewed',
  examTitle: 'Bộ câu phương trình mũ và logarit đã rà soát',
  topic: 'Phương trình mũ và logarit',
  obsidianSourcePath: 'Toan_Hoc/1_Ham_So/7_phuong_trinh_mu_va_logarit.md',
  tagSlug: 'mu-logarit',
}

const q = (
  questionNumber: number,
  difficultyLevel: 1 | 2 | 3 | 4,
  questionText: string,
  answerValue: 'A' | 'B' | 'C' | 'D',
  options: Array<{ label: 'A' | 'B' | 'C' | 'D'; text: string }>,
) => buildSupplementalMcQuestion(config, questionNumber, difficultyLevel, questionText, answerValue, options)

export const supplementalMuLogaritReviewedQuestions: SchoolExamQuestionRecord[] = [
  q(1, 1, 'Điều kiện xác định của $\\log_2(x-1)$ là', 'C', [{ label: 'A', text: '$x\\ge1$' }, { label: 'B', text: '$x>0$' }, { label: 'C', text: '$x>1$' }, { label: 'D', text: '$x\\ne1$' }]),
  q(2, 1, 'Giải phương trình $2^x=8$.', 'B', [{ label: 'A', text: '$x=1$' }, { label: 'B', text: '$x=3$' }, { label: 'C', text: '$x=8$' }, { label: 'D', text: '$x=\\dfrac{1}{3}$' }]),
  q(3, 1, 'Giá trị của $\\log_3 9$ bằng', 'A', [{ label: 'A', text: '2' }, { label: 'B', text: '3' }, { label: 'C', text: '$\\dfrac{1}{2}$' }, { label: 'D', text: '9' }]),
  q(4, 1, 'Hàm số mũ cơ bản có dạng', 'D', [{ label: 'A', text: '$y=\\log_a x$' }, { label: 'B', text: '$y=ax+b$' }, { label: 'C', text: '$y=x^a$' }, { label: 'D', text: '$y=a^x$ với $a>0,a\\ne1$' }]),
  q(5, 1, 'Ta có $\\ln e=$', 'B', [{ label: 'A', text: '0' }, { label: 'B', text: '1' }, { label: 'C', text: '$e$' }, { label: 'D', text: '$\\ln 1$' }]),
  q(6, 1, 'Phương trình $\\log_5 x=1$ có nghiệm là', 'C', [{ label: 'A', text: '1' }, { label: 'B', text: '0' }, { label: 'C', text: '5' }, { label: 'D', text: '25' }]),
  q(7, 1, 'Biểu thức $\\log_a 1$ với $a>0,a\\ne1$ bằng', 'A', [{ label: 'A', text: '0' }, { label: 'B', text: '1' }, { label: 'C', text: '$a$' }, { label: 'D', text: 'Không xác định' }]),
  q(8, 1, 'Phương trình $e^x=1$ có nghiệm', 'D', [{ label: 'A', text: '$x=1$' }, { label: 'B', text: '$x=e$' }, { label: 'C', text: '$x=-1$' }, { label: 'D', text: '$x=0$' }]),
  q(9, 2, 'Giải phương trình $3^{x+1}=27$.', 'B', [{ label: 'A', text: '$x=1$' }, { label: 'B', text: '$x=2$' }, { label: 'C', text: '$x=3$' }, { label: 'D', text: '$x=4$' }]),
  q(10, 2, 'Giải phương trình $\\log_2(x+3)=2$.', 'A', [{ label: 'A', text: '$x=1$' }, { label: 'B', text: '$x=4$' }, { label: 'C', text: '$x=-1$' }, { label: 'D', text: '$x=2$' }]),
  q(11, 2, 'Giải phương trình $5^{2x}=25$.', 'D', [{ label: 'A', text: '$x=0$' }, { label: 'B', text: '$x=\\dfrac{1}{4}$' }, { label: 'C', text: '$x=2$' }, { label: 'D', text: '$x=1$' }]),
  q(12, 2, 'Giá trị của $\\log_2 8 + \\log_2 4$ bằng', 'C', [{ label: 'A', text: '4' }, { label: 'B', text: '3' }, { label: 'C', text: '5' }, { label: 'D', text: '6' }]),
  q(13, 2, 'Giải phương trình $\\ln x=0$.', 'A', [{ label: 'A', text: '$x=1$' }, { label: 'B', text: '$x=0$' }, { label: 'C', text: '$x=e$' }, { label: 'D', text: '$x=-1$' }]),
  q(14, 2, 'Điều kiện xác định của $\\log_{1/2}(2x-3)$ là', 'D', [{ label: 'A', text: '$x>0$' }, { label: 'B', text: '$x\\ge\\dfrac{3}{2}$' }, { label: 'C', text: '$x\\ne\\dfrac{3}{2}$' }, { label: 'D', text: '$x>\\dfrac{3}{2}$' }]),
  q(15, 2, 'Giải phương trình $2^x=\\dfrac{1}{8}$.', 'B', [{ label: 'A', text: '$x=3$' }, { label: 'B', text: '$x=-3$' }, { label: 'C', text: '$x=-8$' }, { label: 'D', text: '$x=\\dfrac{1}{3}$' }]),
  q(16, 2, 'Nếu $\\log_a b =2$ thì $b$ bằng', 'A', [{ label: 'A', text: '$a^2$' }, { label: 'B', text: '$2a$' }, { label: 'C', text: '$a+2$' }, { label: 'D', text: '$\\dfrac{1}{a^2}$' }]),
  q(17, 3, 'Giải phương trình $4^x=2^{x+2}$.', 'A', [{ label: 'A', text: '$x=2$' }, { label: 'B', text: '$x=1$' }, { label: 'C', text: '$x=4$' }, { label: 'D', text: '$x=0$' }]),
  q(18, 3, 'Giải phương trình $\\log_3(x-1)+\\log_3(x-3)=1$.', 'D', [{ label: 'A', text: '$x=2$' }, { label: 'B', text: '$x=3$' }, { label: 'C', text: '$x=1+\\sqrt{7}$' }, { label: 'D', text: '$x=4$' }]),
  q(19, 3, 'Giải phương trình $9^x-10\\cdot 3^x+9=0$.', 'B', [{ label: 'A', text: '$x=1$ hoặc $x=3$' }, { label: 'B', text: '$x=0$ hoặc $x=2$' }, { label: 'C', text: '$x=-1$ hoặc $x=2$' }, { label: 'D', text: '$x=0$ hoặc $x=3$' }]),
  q(20, 3, 'Giải phương trình $\\log_2(x+1)=\\log_2(3x-1)$.', 'A', [{ label: 'A', text: '$x=1$' }, { label: 'B', text: '$x=0$' }, { label: 'C', text: '$x=2$' }, { label: 'D', text: 'Vô nghiệm' }]),
  q(21, 3, 'Giải phương trình $e^{2x}-3e^x+2=0$.', 'C', [{ label: 'A', text: '$x=0$' }, { label: 'B', text: '$x=\\ln 2$' }, { label: 'C', text: '$x=0$ hoặc $x=\\ln 2$' }, { label: 'D', text: '$x=1$ hoặc $x=2$' }]),
  q(22, 3, 'Giải phương trình $\\log_2 x + \\log_2(x-2)=3$.', 'D', [{ label: 'A', text: '$x=2$' }, { label: 'B', text: '$x=6$' }, { label: 'C', text: '$x=2+\\sqrt{6}$' }, { label: 'D', text: '$x=4$' }]),
  q(23, 3, 'Nếu $2^x=3$ thì $2^{x+1}$ bằng', 'B', [{ label: 'A', text: '3' }, { label: 'B', text: '6' }, { label: 'C', text: '9' }, { label: 'D', text: '$\\dfrac{3}{2}$' }]),
  q(24, 3, 'Giải phương trình $\\log_5(2x+1)=\\log_5 11$.', 'A', [{ label: 'A', text: '$x=5$' }, { label: 'B', text: '$x=11$' }, { label: 'C', text: '$x=6$' }, { label: 'D', text: '$x=\\dfrac{11}{2}$' }]),
  q(25, 4, 'Giải phương trình $2^{x+1}+2^x=12$.', 'C', [{ label: 'A', text: '$x=1$' }, { label: 'B', text: '$x=3$' }, { label: 'C', text: '$x=2$' }, { label: 'D', text: '$x=4$' }]),
  q(26, 4, 'Giải phương trình $\\log_2(x^2-5x+6)=1$.', 'B', [{ label: 'A', text: '$x=2$ hoặc $x=3$' }, { label: 'B', text: '$x=1$ hoặc $x=4$' }, { label: 'C', text: '$x=2$ hoặc $x=4$' }, { label: 'D', text: 'Vô nghiệm' }]),
  q(27, 4, 'Giải phương trình $3^{2x}-4\\cdot 3^x+3=0$.', 'A', [{ label: 'A', text: '$x=0$ hoặc $x=1$' }, { label: 'B', text: '$x=1$ hoặc $x=2$' }, { label: 'C', text: '$x=-1$ hoặc $x=1$' }, { label: 'D', text: '$x=0$ hoặc $x=2$' }]),
  q(28, 4, 'Tập nghiệm của phương trình $\\ln(x-1)+\\ln(x-3)=\\ln 4$ là', 'D', [{ label: 'A', text: '$\\{2,4\\}$' }, { label: 'B', text: '$\\{1+\\sqrt{5}\\}$' }, { label: 'C', text: '$\\{3+\\sqrt{5}\\}$' }, { label: 'D', text: '$\\{2+\\sqrt{5}\\}$' }]),
  q(29, 4, 'Giải phương trình $5^x+5^{-x}=\\dfrac{26}{5}$. Đặt $t=5^x>0$, ta được phương trình', 'C', [{ label: 'A', text: '$t^2+26t+5=0$' }, { label: 'B', text: '$5t^2-26t+1=0$' }, { label: 'C', text: '$5t^2-26t+5=0$' }, { label: 'D', text: '$t^2-26t+25=0$' }]),
  q(30, 4, 'Giải phương trình $\\log_3(x+2)-\\log_3(x-1)=1$.', 'A', [{ label: 'A', text: '$x=\\dfrac{5}{2}$' }, { label: 'B', text: '$x=2$' }, { label: 'C', text: '$x=4$' }, { label: 'D', text: '$x=1$' }]),
]
