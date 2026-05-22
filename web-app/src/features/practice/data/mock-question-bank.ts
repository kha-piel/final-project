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
    subjectName: 'Toan hoc',
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
    subjectName: 'Toan hoc',
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
    subjectName: 'Toan hoc',
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
  mc('mc-01', 'Nghiem cua phuong trinh 2x - 6 = 0 la', 1, 'cau-giay-2025-lan-1', 'THPT Cau Giay', 2025, [
    { label: 'A', text: 'x = -3' },
    { label: 'B', text: 'x = 3', correct: true },
    { label: 'C', text: 'x = 6' },
    { label: 'D', text: 'x = -6' },
  ]),
  mc('mc-02', 'Dao ham cua ham so y = x^3 la', 1, 'cau-giay-2025-lan-1', 'THPT Cau Giay', 2025, [
    { label: 'A', text: '3x^2', correct: true },
    { label: 'B', text: 'x^2' },
    { label: 'C', text: '3x' },
    { label: 'D', text: 'x^3' },
  ]),
  mc('mc-03', 'Gia tri cua log2(8) bang', 1, 'yen-hoa-2024', 'THPT Yen Hoa', 2024, [
    { label: 'A', text: '2' },
    { label: 'B', text: '3', correct: true },
    { label: 'C', text: '4' },
    { label: 'D', text: '8' },
  ]),
  mc('mc-04', 'Tap nghiem cua bat phuong trinh x^2 < 9 la', 1, 'chuyen-su-pham-2025', 'THPT Chuyen Su Pham', 2025, [
    { label: 'A', text: '(-3; 3)', correct: true },
    { label: 'B', text: '(-inf; 3)' },
    { label: 'C', text: '(3; +inf)' },
    { label: 'D', text: '[-3; 3]' },
  ]),
  mc('mc-05', 'Nguyen ham cua f(x) = 2x la', 2, 'cau-giay-2025-lan-1', 'THPT Cau Giay', 2025, [
    { label: 'A', text: 'x^2 + C', correct: true },
    { label: 'B', text: '2x^2 + C' },
    { label: 'C', text: 'x + C' },
    { label: 'D', text: '2 + C' },
  ]),
  mc('mc-06', 'Ham so nao dong bien tren R?', 2, 'chuyen-su-pham-2025', 'THPT Chuyen Su Pham', 2025, [
    { label: 'A', text: 'y = -x' },
    { label: 'B', text: 'y = x^3', correct: true },
    { label: 'C', text: 'y = -x^3' },
    { label: 'D', text: 'y = -2x + 1' },
  ]),
  mc('mc-07', 'The tich khoi tru co dien tich day 5 va chieu cao 3 bang', 2, 'yen-hoa-2024', 'THPT Yen Hoa', 2024, [
    { label: 'A', text: '8' },
    { label: 'B', text: '15', correct: true },
    { label: 'C', text: '10' },
    { label: 'D', text: '30' },
  ]),
  mc('mc-08', 'So nghiem cua phuong trinh sin x = 0 tren doan [0; 2pi] la', 2, 'cau-giay-2025-lan-1', 'THPT Cau Giay', 2025, [
    { label: 'A', text: '1' },
    { label: 'B', text: '2' },
    { label: 'C', text: '3', correct: true },
    { label: 'D', text: '4' },
  ]),
  mc('mc-09', 'Cho cap so cong co u1 = 2, d = 3. Gia tri u5 bang', 3, 'chuyen-su-pham-2025', 'THPT Chuyen Su Pham', 2025, [
    { label: 'A', text: '11' },
    { label: 'B', text: '14', correct: true },
    { label: 'C', text: '15' },
    { label: 'D', text: '17' },
  ]),
  mc('mc-10', 'Cho z = 1 - 2i. Modun cua z bang', 3, 'yen-hoa-2024', 'THPT Yen Hoa', 2024, [
    { label: 'A', text: 'sqrt(2)' },
    { label: 'B', text: 'sqrt(3)' },
    { label: 'C', text: 'sqrt(5)', correct: true },
    { label: 'D', text: '5' },
  ]),
  mc('mc-11', 'Xac suat gieo mot con xuc xac duoc mat chan bang', 3, 'cau-giay-2025-lan-1', 'THPT Cau Giay', 2025, [
    { label: 'A', text: '1/6' },
    { label: 'B', text: '1/3' },
    { label: 'C', text: '1/2', correct: true },
    { label: 'D', text: '2/3' },
  ]),
  mc('mc-12', 'Gia tri lon nhat cua ham so y = -x^2 + 4x - 1 bang', 4, 'chuyen-su-pham-2025', 'THPT Chuyen Su Pham', 2025, [
    { label: 'A', text: '2' },
    { label: 'B', text: '3', correct: true },
    { label: 'C', text: '4' },
    { label: 'D', text: '5' },
  ]),
  mc('mc-13', 'Cho tich phan tu 0 den 1 cua 2x dx. Ket qua bang', 3, 'yen-hoa-2024', 'THPT Yen Hoa', 2024, [
    { label: 'A', text: '1', correct: true },
    { label: 'B', text: '2' },
    { label: 'C', text: '1/2' },
    { label: 'D', text: '0' },
  ]),
  mc('mc-14', 'Trong khong gian Oxyz, vectơ phap tuyen cua mat phang x + 2y - z = 0 la', 2, 'cau-giay-2025-lan-1', 'THPT Cau Giay', 2025, [
    { label: 'A', text: '(1;2;-1)', correct: true },
    { label: 'B', text: '(1;2;1)' },
    { label: 'C', text: '(-1;2;-1)' },
    { label: 'D', text: '(0;2;-1)' },
  ]),
  tf('tf-01', 'Xet ham so y = x^2 - 2x + 1.', 2, 'cau-giay-2025-lan-1', 'THPT Cau Giay', 2025, [
    { content: 'Ham so co dinh tai x = 1.', isCorrect: false },
    { content: 'Gia tri nho nhat cua ham so bang 0.', isCorrect: true },
    { content: 'Do thi co truc doi xung x = 1.', isCorrect: true },
    { content: 'Ham so nghich bien tren khoang (1; +inf).', isCorrect: false },
  ]),
  tf('tf-02', 'Cho cap so nhan (un) voi u1 = 3, q = 2.', 2, 'yen-hoa-2024', 'THPT Yen Hoa', 2024, [
    { content: 'u2 = 6.', isCorrect: true },
    { content: 'u4 = 24.', isCorrect: true },
    { content: 'Cong boi cua day la 3.', isCorrect: false },
    { content: 'Tong 3 so hang dau bang 21.', isCorrect: true },
  ]),
  tf('tf-03', 'Xet hinh chop S.ABCD co day la hinh vuong.', 3, 'chuyen-su-pham-2025', 'THPT Chuyen Su Pham', 2025, [
    { content: 'AB song song CD.', isCorrect: true },
    { content: 'Hai duong cheo AC va BD vuong goc nhau.', isCorrect: true },
    { content: 'AC = BD.', isCorrect: true },
    { content: 'AB vuong goc BC la sai.', isCorrect: false },
  ]),
  tf('tf-04', 'Xet ham so y = (x - 1)/(x + 1).', 4, 'chuyen-su-pham-2025', 'THPT Chuyen Su Pham', 2025, [
    { content: 'Tap xac dinh la R \\ {-1}.', isCorrect: true },
    { content: 'Do thi co tiem can ngang y = 1.', isCorrect: true },
    { content: 'Ham so dong bien tren tung khoang xac dinh.', isCorrect: true },
    { content: 'Do thi di qua diem (0;1).', isCorrect: false },
  ]),
  tf('tf-05', 'Xet bieu thuc P = log3(9x).', 3, 'yen-hoa-2024', 'THPT Yen Hoa', 2024, [
    { content: 'Dieu kien xac dinh la x > 0.', isCorrect: true },
    { content: 'P = 2 + log3(x).', isCorrect: true },
    { content: 'P = log3(9) . log3(x).', isCorrect: false },
    { content: 'Neu x = 1/9 thi P = 0.', isCorrect: true },
  ]),
  sa('sa-01', 'Tinh dao ham cua ham so y = 5x^2 tai x = 1.', 1, 'cau-giay-2025-lan-1', 'THPT Cau Giay', 2025, ['10']),
  sa('sa-02', 'Tinh tong cac nghiem cua phuong trinh x^2 - 5x + 6 = 0.', 1, 'yen-hoa-2024', 'THPT Yen Hoa', 2024, ['5']),
  sa('sa-03', 'Cho hinh hop chu nhat co kich thuoc 2, 3, 4. Tinh the tich.', 2, 'cau-giay-2025-lan-1', 'THPT Cau Giay', 2025, ['24']),
  sa('sa-04', 'Tinh gia tri cua bieu thuc C(5,2).', 2, 'chuyen-su-pham-2025', 'THPT Chuyen Su Pham', 2025, ['10']),
  sa('sa-05', 'Giai phuong trinh 2^x = 16. Nhap gia tri x.', 2, 'yen-hoa-2024', 'THPT Yen Hoa', 2024, ['4']),
  sa('sa-06', 'Cho cap so cong co u1 = 7, d = -2. Tinh u6.', 3, 'chuyen-su-pham-2025', 'THPT Chuyen Su Pham', 2025, ['-3']),
  sa('sa-07', 'Tinh khoang cach tu diem M(1,2) den truc hoanh Ox.', 3, 'cau-giay-2025-lan-1', 'THPT Cau Giay', 2025, ['2']),
  sa('sa-08', 'Gia tri cuc tieu cua ham so y = x^2 - 4x + 7 bang bao nhieu?', 4, 'chuyen-su-pham-2025', 'THPT Chuyen Su Pham', 2025, ['3']),
]
