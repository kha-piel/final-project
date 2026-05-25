import type { SchoolExamQuestionRecord } from '../types/school-exam-types'

function mc(
  questionNumber: number,
  questionText: string,
  answerValue: 'A' | 'B' | 'C' | 'D',
  options: Array<{ label: 'A' | 'B' | 'C' | 'D'; text: string }>,
): SchoolExamQuestionRecord {
  return {
    questionId: `supplemental-cap-so-q${String(questionNumber).padStart(2, '0')}`,
    examId: 'supplemental-cap-so',
    questionNumber,
    questionType: 'multiple_choice',
    difficultyLevel: 2,
    questionText,
    statements: [],
    options: options.map((option, index) => ({
      optionLabel: option.label,
      optionText: option.text,
      displayOrder: index + 1,
    })),
    assetPaths: [],
    assets: [],
    topic: 'Cấp số cộng và cấp số nhân',
    obsidianSourcePath: 'Toan_Hoc/1_Ham_So/8_cap_so_cong_va_cap_so_nhan.md',
    hasImage: false,
    answerValue,
    sourceQuestionNumber: questionNumber,
    sourceSectionNumber: 1,
    examTitle: 'Bộ câu bổ sung ôn tập cấp số',
    schoolName: 'Nội bộ hệ thống',
    year: 2026,
    pdfUrl: '',
    tags: ['supplemental', 'knowledge-review', 'cap-so'],
  }
}

export const supplementalKnowledgeReviewQuestions: SchoolExamQuestionRecord[] = [
  mc(1, 'Cho cấp số cộng $(u_n)$ với $u_1 = 5$ và $d = 3$. Giá trị của $u_6$ bằng', 'A', [
    { label: 'A', text: '20' },
    { label: 'B', text: '18' },
    { label: 'C', text: '17' },
    { label: 'D', text: '23' },
  ]),
  mc(2, 'Cho cấp số cộng $(u_n)$ với $u_1 = -2$ và $d = 4$. Số hạng thứ $8$ là', 'D', [
    { label: 'A', text: '18' },
    { label: 'B', text: '24' },
    { label: 'C', text: '30' },
    { label: 'D', text: '26' },
  ]),
  mc(3, 'Cho cấp số cộng $(u_n)$ có $u_1 = 3$, $u_5 = 15$. Công sai $d$ bằng', 'B', [
    { label: 'A', text: '2' },
    { label: 'B', text: '3' },
    { label: 'C', text: '4' },
    { label: 'D', text: '5' },
  ]),
  mc(4, 'Cho cấp số cộng $(u_n)$ có $u_3 = 7$ và $d = -2$. Giá trị của $u_1$ bằng', 'C', [
    { label: 'A', text: '1' },
    { label: 'B', text: '9' },
    { label: 'C', text: '11' },
    { label: 'D', text: '13' },
  ]),
  mc(5, 'Tổng $10$ số hạng đầu của cấp số cộng có $u_1 = 2$ và $d = 3$ bằng', 'D', [
    { label: 'A', text: '145' },
    { label: 'B', text: '150' },
    { label: 'C', text: '160' },
    { label: 'D', text: '155' },
  ]),
  mc(6, 'Cho cấp số cộng có $u_1 = 4$, $u_2 = 9$. Khi đó công sai $d$ bằng', 'A', [
    { label: 'A', text: '5' },
    { label: 'B', text: '9' },
    { label: 'C', text: '13' },
    { label: 'D', text: '1' },
  ]),
  mc(7, 'Cho cấp số cộng $(u_n)$ có $u_1 = 10$, $d = -3$. Giá trị của $u_5$ là', 'B', [
    { label: 'A', text: '-5' },
    { label: 'B', text: '-2' },
    { label: 'C', text: '1' },
    { label: 'D', text: '4' },
  ]),
  mc(8, 'Cho cấp số cộng $(u_n)$ có $u_1 = 1$ và $d = 2$. Tổng $6$ số hạng đầu bằng', 'C', [
    { label: 'A', text: '30' },
    { label: 'B', text: '33' },
    { label: 'C', text: '36' },
    { label: 'D', text: '39' },
  ]),
  mc(9, 'Cho cấp số nhân $(u_n)$ với $u_1 = 3$ và $q = 2$. Giá trị của $u_5$ bằng', 'C', [
    { label: 'A', text: '24' },
    { label: 'B', text: '36' },
    { label: 'C', text: '48' },
    { label: 'D', text: '54' },
  ]),
  mc(10, 'Cho cấp số nhân $(u_n)$ có $u_1 = 5$, $q = -2$. Giá trị của $u_4$ là', 'D', [
    { label: 'A', text: '-20' },
    { label: 'B', text: '20' },
    { label: 'C', text: '-30' },
    { label: 'D', text: '-40' },
  ]),
  mc(11, 'Cho cấp số nhân $(u_n)$ có $u_1 = 2$, $u_2 = 6$. Công bội $q$ bằng', 'B', [
    { label: 'A', text: '2' },
    { label: 'B', text: '3' },
    { label: 'C', text: '4' },
    { label: 'D', text: '6' },
  ]),
  mc(12, 'Cho cấp số nhân $(u_n)$ có $u_3 = 12$ và $q = 2$. Giá trị của $u_1$ bằng', 'A', [
    { label: 'A', text: '3' },
    { label: 'B', text: '4' },
    { label: 'C', text: '6' },
    { label: 'D', text: '8' },
  ]),
  mc(13, 'Tổng $4$ số hạng đầu của cấp số nhân có $u_1 = 1$ và $q = 3$ bằng', 'D', [
    { label: 'A', text: '27' },
    { label: 'B', text: '36' },
    { label: 'C', text: '39' },
    { label: 'D', text: '40' },
  ]),
  mc(14, 'Cho cấp số nhân $(u_n)$ với $u_1 = 16$, $q = \\frac{1}{2}$. Giá trị của $u_5$ là', 'B', [
    { label: 'A', text: '\\(\\frac{1}{2}\\)' },
    { label: 'B', text: '1' },
    { label: 'C', text: '2' },
    { label: 'D', text: '4' },
  ]),
  mc(15, 'Cho cấp số nhân $(u_n)$ có $u_2 = 6$, $u_3 = 18$. Công bội $q$ bằng', 'C', [
    { label: 'A', text: '1' },
    { label: 'B', text: '2' },
    { label: 'C', text: '3' },
    { label: 'D', text: '6' },
  ]),
  mc(16, 'Cho cấp số nhân $(u_n)$ có $u_1 = 4$ và $q = 2$. Tổng $5$ số hạng đầu bằng', 'A', [
    { label: 'A', text: '124' },
    { label: 'B', text: '120' },
    { label: 'C', text: '128' },
    { label: 'D', text: '132' },
  ]),
  mc(17, 'Trong các dãy sau, dãy nào là cấp số cộng?', 'D', [
    { label: 'A', text: '1, 2, 4, 8' },
    { label: 'B', text: '3, 6, 12, 24' },
    { label: 'C', text: '2, 5, 10, 17' },
    { label: 'D', text: '7, 10, 13, 16' },
  ]),
  mc(18, 'Trong các dãy sau, dãy nào là cấp số nhân?', 'A', [
    { label: 'A', text: '2, 6, 18, 54' },
    { label: 'B', text: '1, 4, 7, 10' },
    { label: 'C', text: '5, 10, 20, 41' },
    { label: 'D', text: '3, 5, 7, 9' },
  ]),
  mc(19, 'Cho cấp số cộng $(u_n)$ có $u_n = 4n - 1$. Công sai của dãy số bằng', 'C', [
    { label: 'A', text: '1' },
    { label: 'B', text: '2' },
    { label: 'C', text: '4' },
    { label: 'D', text: '5' },
  ]),
  mc(20, 'Cho cấp số nhân $(u_n)$ có $u_n = 5 \\cdot 2^{n-1}$. Khi đó $u_4$ bằng', 'B', [
    { label: 'A', text: '20' },
    { label: 'B', text: '40' },
    { label: 'C', text: '45' },
    { label: 'D', text: '80' },
  ]),
]
