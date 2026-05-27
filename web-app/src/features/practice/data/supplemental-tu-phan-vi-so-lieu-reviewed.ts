import type { SchoolExamQuestionRecord } from '../types/school-exam-types'
import { buildSupplementalMcQuestion } from './supplemental-reviewed-helper'

const config = {
  examId: 'supplemental-tu-phan-vi-so-lieu-reviewed',
  examTitle: 'Bộ câu tứ phân vị và số liệu ghép nhóm đã rà soát',
  topic: 'Tứ phân vị và số liệu ghép nhóm',
  obsidianSourcePath: 'Toan_Hoc/3_Thong_Ke_Xac_Suat/1_tu_phan_vi_va_so_lieu_ghep_nhom.md',
  tagSlug: 'tu-phan-vi-so-lieu',
}

const q = (
  questionNumber: number,
  difficultyLevel: 1 | 2 | 3 | 4,
  questionText: string,
  answerValue: 'A' | 'B' | 'C' | 'D',
  options: Array<{ label: 'A' | 'B' | 'C' | 'D'; text: string }>,
) => buildSupplementalMcQuestion(config, questionNumber, difficultyLevel, questionText, answerValue, options)

export const supplementalTuPhanViSoLieuReviewedQuestions: SchoolExamQuestionRecord[] = [
  q(1, 1, 'Trung vị của dãy số đã sắp xếp là giá trị', 'C', [{ label: 'A', text: 'Lớn nhất' }, { label: 'B', text: 'Nhỏ nhất' }, { label: 'C', text: 'Đứng giữa theo vị trí' }, { label: 'D', text: 'Có tần số lớn nhất' }]),
  q(2, 1, 'Kí hiệu khoảng tứ phân vị là', 'A', [{ label: 'A', text: 'IQR' }, { label: 'B', text: 'AVG' }, { label: 'C', text: 'MED' }, { label: 'D', text: 'VAR' }]),
  q(3, 1, 'Khoảng tứ phân vị được tính bằng', 'B', [{ label: 'A', text: '$Q_1-Q_3$' }, { label: 'B', text: '$Q_3-Q_1$' }, { label: 'C', text: '$Q_2-Q_1$' }, { label: 'D', text: '$Q_1+Q_3$' }]),
  q(4, 1, 'Trong bảng ghép nhóm, “tần số” là', 'D', [{ label: 'A', text: 'Giá trị nhỏ nhất của lớp' }, { label: 'B', text: 'Giá trị trung bình của lớp' }, { label: 'C', text: 'Độ dài lớp' }, { label: 'D', text: 'Số phần tử thuộc lớp đó' }]),
  q(5, 1, 'Tần số tích lũy là', 'A', [{ label: 'A', text: 'Tổng tần số từ lớp đầu đến lớp đang xét' }, { label: 'B', text: 'Hiệu hai tần số liên tiếp' }, { label: 'C', text: 'Tỉ số giữa tần số và tổng mẫu' }, { label: 'D', text: 'Trung điểm lớp' }]),
  q(6, 1, 'Tứ phân vị thứ hai $Q_2$ chính là', 'C', [{ label: 'A', text: 'Mốt' }, { label: 'B', text: 'Trung bình cộng' }, { label: 'C', text: 'Trung vị' }, { label: 'D', text: 'Khoảng biến thiên' }]),
  q(7, 1, 'Nếu dữ liệu có độ phân tán trung tâm nhỏ thì IQR thường', 'B', [{ label: 'A', text: 'Rất lớn' }, { label: 'B', text: 'Nhỏ' }, { label: 'C', text: 'Âm' }, { label: 'D', text: 'Bằng 0 bắt buộc' }]),
  q(8, 1, 'Trong bảng số liệu ghép nhóm, mỗi lớp thường được cho bởi', 'D', [{ label: 'A', text: 'Một điểm duy nhất' }, { label: 'B', text: 'Một giá trị trung bình' }, { label: 'C', text: 'Một công thức' }, { label: 'D', text: 'Một khoảng giá trị' }]),
  q(9, 2, 'Dãy số đã sắp xếp: 1, 2, 3, 4, 5. Trung vị là', 'C', [{ label: 'A', text: '2' }, { label: 'B', text: '2,5' }, { label: 'C', text: '3' }, { label: 'D', text: '4' }]),
  q(10, 2, 'Dãy số đã sắp xếp: 2, 4, 6, 8. Trung vị là', 'B', [{ label: 'A', text: '4' }, { label: 'B', text: '5' }, { label: 'C', text: '6' }, { label: 'D', text: '8' }]),
  q(11, 2, 'Với dãy 1, 2, 3, 4, 5, 6, 7, 8 thì $Q_1$ bằng', 'A', [{ label: 'A', text: '2,5' }, { label: 'B', text: '3' }, { label: 'C', text: '4' }, { label: 'D', text: '6,5' }]),
  q(12, 2, 'Với dãy 1, 2, 3, 4, 5, 6, 7, 8 thì $Q_3$ bằng', 'D', [{ label: 'A', text: '4' }, { label: 'B', text: '5' }, { label: 'C', text: '5,5' }, { label: 'D', text: '6,5' }]),
  q(13, 2, 'Khoảng tứ phân vị của dãy ở câu 11 là', 'B', [{ label: 'A', text: '2' }, { label: 'B', text: '4' }, { label: 'C', text: '3,5' }, { label: 'D', text: '6,5' }]),
  q(14, 2, 'Tần suất của một lớp bằng', 'C', [{ label: 'A', text: 'Tần số nhân tổng mẫu' }, { label: 'B', text: 'Tần số trừ tổng mẫu' }, { label: 'C', text: 'Tần số chia tổng mẫu' }, { label: 'D', text: 'Độ dài lớp chia tổng mẫu' }]),
  q(15, 2, 'Bảng có các tần số 3, 5, 2 thì cỡ mẫu bằng', 'A', [{ label: 'A', text: '10' }, { label: 'B', text: '8' }, { label: 'C', text: '5' }, { label: 'D', text: '3' }]),
  q(16, 2, 'Nếu tần số tích lũy đến lớp thứ ba là 18 thì điều đó nghĩa là', 'D', [{ label: 'A', text: 'Lớp thứ ba có 18 phần tử' }, { label: 'B', text: 'Có 18 lớp' }, { label: 'C', text: 'Không có dữ liệu lớp đầu' }, { label: 'D', text: 'Có 18 phần tử thuộc ba lớp đầu' }]),
  q(17, 3, 'Dãy số 2, 3, 4, 5, 7, 8, 9, 10 có $Q_2$ bằng', 'B', [{ label: 'A', text: '5' }, { label: 'B', text: '6' }, { label: 'C', text: '7' }, { label: 'D', text: '6,5' }]),
  q(18, 3, 'Dãy số 2, 3, 4, 5, 7, 8, 9, 10 có IQR bằng', 'A', [{ label: 'A', text: '4' }, { label: 'B', text: '3,5' }, { label: 'C', text: '6' }, { label: 'D', text: '2' }]),
  q(19, 3, 'Cho bảng ghép nhóm có các lớp [0;2), [2;4), [4;6) với tần số tương ứng 3, 5, 2. Lớp chứa trung vị là', 'C', [{ label: 'A', text: '[0;2)' }, { label: 'B', text: '[4;6)' }, { label: 'C', text: '[2;4)' }, { label: 'D', text: '[6;8)' }]),
  q(20, 3, 'Trong bảng ghép nhóm, nếu tổng tần số là 40 thì vị trí của $Q_1$ gần với quan sát thứ', 'A', [{ label: 'A', text: '10' }, { label: 'B', text: '20' }, { label: 'C', text: '30' }, { label: 'D', text: '40' }]),
  q(21, 3, 'Trong bảng ghép nhóm, nếu tổng tần số là 40 thì vị trí của $Q_3$ gần với quan sát thứ', 'D', [{ label: 'A', text: '10' }, { label: 'B', text: '15' }, { label: 'C', text: '20' }, { label: 'D', text: '30' }]),
  q(22, 3, 'Nếu $Q_1=12$ và $Q_3=20$ thì IQR bằng', 'B', [{ label: 'A', text: '32' }, { label: 'B', text: '8' }, { label: 'C', text: '10' }, { label: 'D', text: '4' }]),
  q(23, 3, 'Bảng có tần số các lớp là 4, 6, 10. Tần số tích lũy đến lớp thứ hai là', 'A', [{ label: 'A', text: '10' }, { label: 'B', text: '6' }, { label: 'C', text: '14' }, { label: 'D', text: '20' }]),
  q(24, 3, 'Nếu tần suất một lớp là 0,25 và cỡ mẫu là 40 thì tần số của lớp đó là', 'C', [{ label: 'A', text: '5' }, { label: 'B', text: '8' }, { label: 'C', text: '10' }, { label: 'D', text: '16' }]),
  q(25, 4, 'Dãy số 1, 2, 4, 7, 9, 10, 13, 15, 18 có trung vị là', 'B', [{ label: 'A', text: '7' }, { label: 'B', text: '9' }, { label: 'C', text: '10' }, { label: 'D', text: '9,5' }]),
  q(26, 4, 'Với dãy ở câu 25, $Q_1$ bằng', 'A', [{ label: 'A', text: '3' }, { label: 'B', text: '4' }, { label: 'C', text: '5,5' }, { label: 'D', text: '7' }]),
  q(27, 4, 'Với dãy ở câu 25, $Q_3$ bằng', 'D', [{ label: 'A', text: '10' }, { label: 'B', text: '11,5' }, { label: 'C', text: '12' }, { label: 'D', text: '14' }]),
  q(28, 4, 'Với dãy ở câu 25, IQR bằng', 'C', [{ label: 'A', text: '9' }, { label: 'B', text: '10' }, { label: 'C', text: '11' }, { label: 'D', text: '14' }]),
  q(29, 4, 'Trong bảng ghép nhóm, lớp chứa trung vị được xác định nhờ', 'A', [{ label: 'A', text: 'Tần số tích lũy vượt qua vị trí giữa mẫu' }, { label: 'B', text: 'Lớp có độ dài lớn nhất' }, { label: 'C', text: 'Lớp đầu tiên' }, { label: 'D', text: 'Lớp có tần số nhỏ nhất' }]),
  q(30, 4, 'Nếu IQR của mẫu A lớn hơn IQR của mẫu B thì có thể kết luận', 'B', [{ label: 'A', text: 'Mẫu A có trung bình lớn hơn' }, { label: 'B', text: '50% số liệu trung tâm của mẫu A phân tán hơn' }, { label: 'C', text: 'Mẫu A có cỡ mẫu lớn hơn' }, { label: 'D', text: 'Mẫu B luôn có ngoại lệ' }]),
]
