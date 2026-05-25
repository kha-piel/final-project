import type { SchoolExamQuestionRecord } from '../types/school-exam-types'
import { buildSupplementalMcQuestion } from './supplemental-reviewed-helper'

const config = {
  examId: 'supplemental-nguyen-ham-reviewed',
  examTitle: 'Bộ câu nguyên hàm đã rà soát',
  topic: 'Nguyên hàm',
  obsidianSourcePath: 'Toan_Hoc/4_Nguyen_Ham_Tich_Phan/1_nguyen_ham.md',
  tagSlug: 'nguyen-ham',
}

const q = (
  questionNumber: number,
  difficultyLevel: 1 | 2 | 3 | 4,
  questionText: string,
  answerValue: 'A' | 'B' | 'C' | 'D',
  options: Array<{ label: 'A' | 'B' | 'C' | 'D'; text: string }>,
) => buildSupplementalMcQuestion(config, questionNumber, difficultyLevel, questionText, answerValue, options)

export const supplementalNguyenHamReviewedQuestions: SchoolExamQuestionRecord[] = [
  q(1, 1, 'Nguyên hàm của $x^2$ là', 'B', [{ label: 'A', text: '$2x$' }, { label: 'B', text: '$\\dfrac{x^3}{3}+C$' }, { label: 'C', text: '$x^3+C$' }, { label: 'D', text: '$\\dfrac{x^2}{2}+C$' }]),
  q(2, 1, 'Nguyên hàm của $\\cos x$ là', 'A', [{ label: 'A', text: '$\\sin x+C$' }, { label: 'B', text: '$-\\sin x+C$' }, { label: 'C', text: '$\\tan x+C$' }, { label: 'D', text: '$-\\cos x+C$' }]),
  q(3, 1, 'Nguyên hàm của $e^x$ là', 'C', [{ label: 'A', text: '$xe^x+C$' }, { label: 'B', text: '$\\ln x + C$' }, { label: 'C', text: '$e^x+C$' }, { label: 'D', text: '$\\dfrac{e^x}{x}+C$' }]),
  q(4, 1, 'Nguyên hàm của $\\dfrac{1}{x}$ trên mỗi khoảng xác định là', 'D', [{ label: 'A', text: '$\\dfrac{1}{x^2}+C$' }, { label: 'B', text: '$\\ln x + C$' }, { label: 'C', text: '$x\\ln x + C$' }, { label: 'D', text: '$\\ln |x| + C$' }]),
  q(5, 1, "Nếu $F'(x)=f(x)$ thì $F(x)$ được gọi là", 'B', [{ label: 'A', text: 'Đạo hàm của $f(x)$' }, { label: 'B', text: 'Một nguyên hàm của $f(x)$' }, { label: 'C', text: 'Giới hạn của $f(x)$' }, { label: 'D', text: 'Tích phân của $f(x)$' }]),
  q(6, 1, 'Nguyên hàm của $0$ là', 'C', [{ label: 'A', text: '0' }, { label: 'B', text: '1' }, { label: 'C', text: '$C$' }, { label: 'D', text: '$x+C$' }]),
  q(7, 1, 'Nguyên hàm của $2x$ là', 'A', [{ label: 'A', text: '$x^2+C$' }, { label: 'B', text: '$2x^2+C$' }, { label: 'C', text: '$x+C$' }, { label: 'D', text: '$\\dfrac{x^2}{2}+C$' }]),
  q(8, 1, 'Nguyên hàm của $\\sin x$ là', 'D', [{ label: 'A', text: '$\\sin x+C$' }, { label: 'B', text: '$\\cos x+C$' }, { label: 'C', text: '$\\tan x+C$' }, { label: 'D', text: '$-\\cos x+C$' }]),
  q(9, 2, 'Họ nguyên hàm của $3x^2-2$ là', 'A', [{ label: 'A', text: '$x^3-2x+C$' }, { label: 'B', text: '$3x^3-2x+C$' }, { label: 'C', text: '$x^3-x^2+C$' }, { label: 'D', text: '$x^2-2x+C$' }]),
  q(10, 2, 'Nếu $F(x)$ là một nguyên hàm của $f(x)$ thì mọi nguyên hàm của $f(x)$ có dạng', 'D', [{ label: 'A', text: '$F(x)+x$' }, { label: 'B', text: '$kF(x)$' }, { label: 'C', text: '$F(x)^2$' }, { label: 'D', text: '$F(x)+C$' }]),
  q(11, 2, 'Nguyên hàm của $\\dfrac{2x}{x^2+1}$ là', 'B', [{ label: 'A', text: '$\\dfrac{1}{x^2+1}+C$' }, { label: 'B', text: '$\\ln(x^2+1)+C$' }, { label: 'C', text: '$2\\ln|x|+C$' }, { label: 'D', text: '$\\arctan x + C$' }]),
  q(12, 2, 'Nguyên hàm của $\\dfrac{1}{\\cos^2 x}$ là', 'C', [{ label: 'A', text: '$\\sin x+C$' }, { label: 'B', text: '$-\\cot x + C$' }, { label: 'C', text: '$\\tan x+C$' }, { label: 'D', text: '$\\cos x+C$' }]),
  q(13, 2, "Biết $F'(x)=2x+1$ và $F(0)=3$. Khi đó $F(x)$ bằng", 'A', [{ label: 'A', text: '$x^2+x+3$' }, { label: 'B', text: '$x^2+x$' }, { label: 'C', text: '$2x^2+x+3$' }, { label: 'D', text: '$x^2+3$' }]),
  q(14, 2, 'Nguyên hàm của $5e^{5x}$ là', 'B', [{ label: 'A', text: '$e^{x}+C$' }, { label: 'B', text: '$e^{5x}+C$' }, { label: 'C', text: '$5e^x+C$' }, { label: 'D', text: '$\\dfrac{e^{5x}}{5}+C$' }]),
  q(15, 2, 'Nguyên hàm của $\\dfrac{1}{2x+1}$ là', 'D', [{ label: 'A', text: '$\\ln|2x+1|+C$' }, { label: 'B', text: '$2\\ln|2x+1|+C$' }, { label: 'C', text: '$\\dfrac{1}{2x+1}+C$' }, { label: 'D', text: '$\\dfrac{1}{2}\\ln|2x+1|+C$' }]),
  q(16, 2, 'Nguyên hàm của $(3x-1)^5$ là', 'C', [{ label: 'A', text: '$\\dfrac{(3x-1)^6}{6}+C$' }, { label: 'B', text: '$\\dfrac{(3x-1)^6}{3}+C$' }, { label: 'C', text: '$\\dfrac{(3x-1)^6}{18}+C$' }, { label: 'D', text: '$6(3x-1)^5+C$' }]),
  q(17, 3, 'Nếu $F(x)$ là một nguyên hàm của $f(x)$ và $G(x)$ là một nguyên hàm của $f(x)+2$ thì $G(x)-F(x)$ có thể là', 'A', [{ label: 'A', text: '$2x+1$' }, { label: 'B', text: '$x^2$' }, { label: 'C', text: '$\\sin x$' }, { label: 'D', text: '$e^x$' }]),
  q(18, 3, 'Nguyên hàm của $x\\sqrt{x^2+1}$ là', 'B', [{ label: 'A', text: '$\\sqrt{x^2+1}+C$' }, { label: 'B', text: '$\\dfrac{(x^2+1)^{3/2}}{3}+C$' }, { label: 'C', text: '$\\dfrac{x^2+1}{2}+C$' }, { label: 'D', text: '$\\ln(x^2+1)+C$' }]),
  q(19, 3, 'Tìm một nguyên hàm của $\\dfrac{x+1}{x^2+2x+5}$.', 'D', [{ label: 'A', text: '$\\ln(x^2+2x+5)+C$' }, { label: 'B', text: '$\\dfrac{1}{4}\\ln(x^2+2x+5)+C$' }, { label: 'C', text: '$\\arctan(x+1)+C$' }, { label: 'D', text: '$\\dfrac{1}{2}\\ln(x^2+2x+5)+C$' }]),
  q(20, 3, "Biết $F'(x)=\\dfrac{1}{x^2}$ và $F(1)=2$. Khi đó $F(2)$ bằng", 'C', [{ label: 'A', text: '$\\dfrac{1}{2}$' }, { label: 'B', text: '2' }, { label: 'C', text: '$\\dfrac{5}{2}$' }, { label: 'D', text: '3' }]),
  q(21, 3, 'Nguyên hàm của $\\sin 2x$ là', 'A', [{ label: 'A', text: '$-\\dfrac{1}{2}\\cos 2x+C$' }, { label: 'B', text: '$\\dfrac{1}{2}\\cos 2x+C$' }, { label: 'C', text: '$-2\\cos 2x+C$' }, { label: 'D', text: '$\\sin^2 x+C$' }]),
  q(22, 3, 'Nguyên hàm của $\\dfrac{3}{\\sqrt{3x+1}}$ là', 'B', [{ label: 'A', text: '$\\sqrt{3x+1}+C$' }, { label: 'B', text: '$2\\sqrt{3x+1}+C$' }, { label: 'C', text: '$\\dfrac{2}{3}\\sqrt{3x+1}+C$' }, { label: 'D', text: '$6\\sqrt{3x+1}+C$' }]),
  q(23, 3, 'Nếu $F(x)$ là nguyên hàm của $f(x)$ thì nguyên hàm của $-f(x)$ là', 'D', [{ label: 'A', text: '$F(x)+C$' }, { label: 'B', text: '$F(-x)+C$' }, { label: 'C', text: '$\\dfrac{1}{F(x)}+C$' }, { label: 'D', text: '$-F(x)+C$' }]),
  q(24, 3, 'Nguyên hàm của $\\dfrac{e^x}{1+e^x}$ là', 'C', [{ label: 'A', text: '$\\dfrac{1}{1+e^x}+C$' }, { label: 'B', text: '$e^x+C$' }, { label: 'C', text: '$\\ln(1+e^x)+C$' }, { label: 'D', text: '$\\ln x + C$' }]),
  q(25, 4, 'Họ nguyên hàm của $\\dfrac{2x-3}{x^2-3x+1}$ là', 'A', [{ label: 'A', text: '$\\ln|x^2-3x+1|+C$' }, { label: 'B', text: '$\\dfrac{1}{2}\\ln|x^2-3x+1|+C$' }, { label: 'C', text: '$\\ln|2x-3|+C$' }, { label: 'D', text: '$\\dfrac{1}{x^2-3x+1}+C$' }]),
  q(26, 4, "Biết $F'(x)=x^2+2x$ và $F(1)=0$. Khi đó $F(2)$ bằng", 'D', [{ label: 'A', text: '$\\dfrac{11}{3}$' }, { label: 'B', text: '4' }, { label: 'C', text: '$\\dfrac{5}{3}$' }, { label: 'D', text: '$\\dfrac{14}{3}$' }]),
  q(27, 4, 'Nguyên hàm của $\\dfrac{x}{\\sqrt{x^2+4}}$ là', 'B', [{ label: 'A', text: '$\\ln(x^2+4)+C$' }, { label: 'B', text: '$\\sqrt{x^2+4}+C$' }, { label: 'C', text: '$\\dfrac{x^2+4}{2}+C$' }, { label: 'D', text: '$\\arctan\\dfrac{x}{2}+C$' }]),
  q(28, 4, 'Nếu một nguyên hàm của $f(x)$ là $F(x)$ thì nguyên hàm của $f(ax+b)$ với $a\\ne0$ trong trường hợp mẫu trực tiếp là', 'C', [{ label: 'A', text: '$F(ax+b)+C$' }, { label: 'B', text: '$aF(ax+b)+C$' }, { label: 'C', text: '$\\dfrac{1}{a}F(ax+b)+C$' }, { label: 'D', text: '$F(x)+b$' }]),
  q(29, 4, 'Nguyên hàm của $\\dfrac{1-x}{x-1}$ trên mỗi khoảng xác định là', 'A', [{ label: 'A', text: '$-x+C$' }, { label: 'B', text: '$x+C$' }, { label: 'C', text: '$\\ln|x-1|+C$' }, { label: 'D', text: '$\\dfrac{1}{x-1}+C$' }]),
  q(30, 4, "Cho $F'(x)=\\cos x$ và $F\\left(\\dfrac{\\pi}{2}\\right)=1$. Khi đó $F(0)$ bằng", 'A', [{ label: 'A', text: '0' }, { label: 'B', text: '1' }, { label: 'C', text: '2' }, { label: 'D', text: '$-1$' }]),
]
