import type { PracticeQuestion } from '../types/practice-types'

function mc(
  questionId: string,
  content: string,
  level: 1 | 2 | 3 | 4,
  sourceExamId: string,
  schoolName: string,
  year: number,
  answers: Array<{ label: string; text: string; correct?: boolean }>,
): PracticeQuestion {
  return {
    questionId,
    topicId: 'TOAN-TONG-HOP',
    subjectId: 'TOAN',
    subjectName: 'Toán học',
    content,
    level,
    questionType: 'multiple_choice',
    sourceExamId,
    schoolName,
    year,
    tags: ['toan-12', 'tong-hop'],
    sourceMeta: {
      schoolName,
      examTitle: sourceExamId,
      year,
    },
    answers: answers.map((answer, index) => ({
      answerId: `${questionId}-A${index + 1}`,
      optionLabel: answer.label,
      content: answer.text,
      isCorrect: Boolean(answer.correct),
      displayOrder: index + 1,
    })),
  }
}

function tf(
  questionId: string,
  content: string,
  level: 1 | 2 | 3 | 4,
  sourceExamId: string,
  schoolName: string,
  year: number,
  statements: Array<{ content: string; isCorrect: boolean }>,
): PracticeQuestion {
  return {
    questionId,
    topicId: 'TOAN-TONG-HOP',
    subjectId: 'TOAN',
    subjectName: 'Toán học',
    content,
    level,
    questionType: 'true_false',
    sourceExamId,
    schoolName,
    year,
    tags: ['toan-12', 'dung-sai'],
    sourceMeta: {
      schoolName,
      examTitle: sourceExamId,
      year,
    },
    answers: [],
    statements: statements.map((statement, index) => ({
      statementId: `${questionId}-S${index + 1}`,
      content: statement.content,
      isCorrect: statement.isCorrect,
    })),
  }
}

function sa(
  questionId: string,
  content: string,
  level: 1 | 2 | 3 | 4,
  sourceExamId: string,
  schoolName: string,
  year: number,
  acceptedResponses: string[],
): PracticeQuestion {
  return {
    questionId,
    topicId: 'TOAN-TONG-HOP',
    subjectId: 'TOAN',
    subjectName: 'Toán học',
    content,
    level,
    questionType: 'short_answer',
    sourceExamId,
    schoolName,
    year,
    tags: ['toan-12', 'tra-loi-ngan'],
    sourceMeta: {
      schoolName,
      examTitle: sourceExamId,
      year,
    },
    answers: [],
    acceptedResponses,
  }
}

export const mockQuestionBank: PracticeQuestion[] = [
  mc('mc-01', 'Nghiệm của phương trình 2x - 6 = 0 là', 1, 'cau-giay-2025-lan-1', 'THPT Cầu Giấy', 2025, [
    { label: 'A', text: 'x = -3' },
    { label: 'B', text: 'x = 3', correct: true },
    { label: 'C', text: 'x = 6' },
    { label: 'D', text: 'x = -6' },
  ]),
  mc('mc-02', 'Đạo hàm của hàm số y = x^3 là', 1, 'cau-giay-2025-lan-1', 'THPT Cầu Giấy', 2025, [
    { label: 'A', text: '3x^2', correct: true },
    { label: 'B', text: 'x^2' },
    { label: 'C', text: '3x' },
    { label: 'D', text: 'x^3' },
  ]),
  mc('mc-03', 'Giá trị của log2(8) bằng', 1, 'yen-hoa-2024', 'THPT Yên Hòa', 2024, [
    { label: 'A', text: '2' },
    { label: 'B', text: '3', correct: true },
    { label: 'C', text: '4' },
    { label: 'D', text: '8' },
  ]),
  mc('mc-04', 'Tập nghiệm của bất phương trình x^2 < 9 là', 1, 'chuyen-su-pham-2025', 'THPT Chuyên Sư Phạm', 2025, [
    { label: 'A', text: '(-3; 3)', correct: true },
    { label: 'B', text: '(-inf; 3)' },
    { label: 'C', text: '(3; +inf)' },
    { label: 'D', text: '[-3; 3]' },
  ]),
  mc('mc-05', 'Nguyên hàm của f(x) = 2x là', 2, 'cau-giay-2025-lan-1', 'THPT Cầu Giấy', 2025, [
    { label: 'A', text: 'x^2 + C', correct: true },
    { label: 'B', text: '2x^2 + C' },
    { label: 'C', text: 'x + C' },
    { label: 'D', text: '2 + C' },
  ]),
  mc('mc-06', 'Hàm số nào đồng biến trên R?', 2, 'chuyen-su-pham-2025', 'THPT Chuyên Sư Phạm', 2025, [
    { label: 'A', text: 'y = -x' },
    { label: 'B', text: 'y = x^3', correct: true },
    { label: 'C', text: 'y = -x^3' },
    { label: 'D', text: 'y = -2x + 1' },
  ]),
  mc('mc-07', 'Thể tích khối trụ có diện tích đáy 5 và chiều cao 3 bằng', 2, 'yen-hoa-2024', 'THPT Yên Hòa', 2024, [
    { label: 'A', text: '8' },
    { label: 'B', text: '15', correct: true },
    { label: 'C', text: '10' },
    { label: 'D', text: '30' },
  ]),
  mc('mc-08', 'Số nghiệm của phương trình sin x = 0 trên đoạn [0; 2pi] là', 2, 'cau-giay-2025-lan-1', 'THPT Cầu Giấy', 2025, [
    { label: 'A', text: '1' },
    { label: 'B', text: '2' },
    { label: 'C', text: '3', correct: true },
    { label: 'D', text: '4' },
  ]),
  mc('mc-09', 'Cho cấp số cộng có u1 = 2, d = 3. Giá trị u5 bằng', 3, 'chuyen-su-pham-2025', 'THPT Chuyên Sư Phạm', 2025, [
    { label: 'A', text: '11' },
    { label: 'B', text: '14', correct: true },
    { label: 'C', text: '15' },
    { label: 'D', text: '17' },
  ]),
  mc('mc-10', 'Cho z = 1 - 2i. Môđun của z bằng', 3, 'yen-hoa-2024', 'THPT Yên Hòa', 2024, [
    { label: 'A', text: 'sqrt(2)' },
    { label: 'B', text: 'sqrt(3)' },
    { label: 'C', text: 'sqrt(5)', correct: true },
    { label: 'D', text: '5' },
  ]),
  mc('mc-11', 'Xác suất gieo một con xúc xắc được mặt chẵn bằng', 3, 'cau-giay-2025-lan-1', 'THPT Cầu Giấy', 2025, [
    { label: 'A', text: '1/6' },
    { label: 'B', text: '1/3' },
    { label: 'C', text: '1/2', correct: true },
    { label: 'D', text: '2/3' },
  ]),
  mc('mc-12', 'Giá trị lớn nhất của hàm số y = -x^2 + 4x - 1 bằng', 4, 'chuyen-su-pham-2025', 'THPT Chuyên Sư Phạm', 2025, [
    { label: 'A', text: '2' },
    { label: 'B', text: '3', correct: true },
    { label: 'C', text: '4' },
    { label: 'D', text: '5' },
  ]),
  mc('mc-13', 'Cho tích phân từ 0 đến 1 của 2x dx. Kết quả bằng', 3, 'yen-hoa-2024', 'THPT Yên Hòa', 2024, [
    { label: 'A', text: '1', correct: true },
    { label: 'B', text: '2' },
    { label: 'C', text: '1/2' },
    { label: 'D', text: '0' },
  ]),
  mc('mc-14', 'Trong không gian Oxyz, vectơ pháp tuyến của mặt phẳng x + 2y - z = 0 là', 2, 'cau-giay-2025-lan-1', 'THPT Cầu Giấy', 2025, [
    { label: 'A', text: '(1;2;-1)', correct: true },
    { label: 'B', text: '(1;2;1)' },
    { label: 'C', text: '(-1;2;-1)' },
    { label: 'D', text: '(0;2;-1)' },
  ]),
  tf('tf-01', 'Xét hàm số y = x^2 - 2x + 1.', 2, 'cau-giay-2025-lan-1', 'THPT Cầu Giấy', 2025, [
    { content: 'Hàm số có đỉnh tại x = 1.', isCorrect: false },
    { content: 'Giá trị nhỏ nhất của hàm số bằng 0.', isCorrect: true },
    { content: 'Đồ thị có trục đối xứng x = 1.', isCorrect: true },
    { content: 'Hàm số nghịch biến trên khoảng (1; +inf).', isCorrect: false },
  ]),
  tf('tf-02', 'Cho cấp số nhân (un) với u1 = 3, q = 2.', 2, 'yen-hoa-2024', 'THPT Yên Hòa', 2024, [
    { content: 'u2 = 6.', isCorrect: true },
    { content: 'u4 = 24.', isCorrect: true },
    { content: 'Công bội của dãy là 3.', isCorrect: false },
    { content: 'Tổng 3 số hạng đầu bằng 21.', isCorrect: true },
  ]),
  tf('tf-03', 'Xét hình chóp S.ABCD có đáy là hình vuông.', 3, 'chuyen-su-pham-2025', 'THPT Chuyên Sư Phạm', 2025, [
    { content: 'AB song song CD.', isCorrect: true },
    { content: 'Hai đường chéo AC và BD vuông góc nhau.', isCorrect: true },
    { content: 'AC = BD.', isCorrect: true },
    { content: 'AB vuông góc BC là sai.', isCorrect: false },
  ]),
  tf('tf-04', 'Xét hàm số y = (x - 1)/(x + 1).', 4, 'chuyen-su-pham-2025', 'THPT Chuyên Sư Phạm', 2025, [
    { content: 'Tập xác định là R \\ {-1}.', isCorrect: true },
    { content: 'Đồ thị có tiệm cận ngang y = 1.', isCorrect: true },
    { content: 'Hàm số đồng biến trên từng khoảng xác định.', isCorrect: true },
    { content: 'Đồ thị đi qua điểm (0;1).', isCorrect: false },
  ]),
  tf('tf-05', 'Xét biểu thức P = log3(9x).', 3, 'yen-hoa-2024', 'THPT Yên Hòa', 2024, [
    { content: 'Điều kiện xác định là x > 0.', isCorrect: true },
    { content: 'P = 2 + log3(x).', isCorrect: true },
    { content: 'P = log3(9) . log3(x).', isCorrect: false },
    { content: 'Nếu x = 1/9 thì P = 0.', isCorrect: true },
  ]),
  sa('sa-01', 'Tính đạo hàm của hàm số y = 5x^2 tại x = 1.', 1, 'cau-giay-2025-lan-1', 'THPT Cầu Giấy', 2025, ['10']),
  sa('sa-02', 'Tính tổng các nghiệm của phương trình x^2 - 5x + 6 = 0.', 1, 'yen-hoa-2024', 'THPT Yên Hòa', 2024, ['5']),
  sa('sa-03', 'Cho hình hộp chữ nhật có kích thước 2, 3, 4. Tính thể tích.', 2, 'cau-giay-2025-lan-1', 'THPT Cầu Giấy', 2025, ['24']),
  sa('sa-04', 'Tính giá trị của biểu thức C(5,2).', 2, 'chuyen-su-pham-2025', 'THPT Chuyên Sư Phạm', 2025, ['10']),
  sa('sa-05', 'Giải phương trình 2^x = 16. Nhập giá trị x.', 2, 'yen-hoa-2024', 'THPT Yên Hòa', 2024, ['4']),
  sa('sa-06', 'Cho cấp số cộng có u1 = 7, d = -2. Tính u6.', 3, 'chuyen-su-pham-2025', 'THPT Chuyên Sư Phạm', 2025, ['-3']),
  sa('sa-07', 'Tính khoảng cách từ điểm M(1,2) đến trục hoành Ox.', 3, 'cau-giay-2025-lan-1', 'THPT Cầu Giấy', 2025, ['2']),
  sa('sa-08', 'Giá trị cực tiểu của hàm số y = x^2 - 4x + 7 bằng bao nhiêu?', 4, 'chuyen-su-pham-2025', 'THPT Chuyên Sư Phạm', 2025, ['3']),
]
