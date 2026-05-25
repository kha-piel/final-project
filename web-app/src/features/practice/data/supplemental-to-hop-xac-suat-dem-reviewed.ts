import type { SchoolExamQuestionRecord } from '../types/school-exam-types'
import { buildSupplementalMcQuestion } from './supplemental-reviewed-helper'

const config = {
  examId: 'supplemental-to-hop-xac-suat-dem-reviewed',
  examTitle: 'Bộ câu tổ hợp, xác suất và đếm đã rà soát',
  topic: 'Tổ hợp, xác suất và đếm',
  obsidianSourcePath: 'Toan_Hoc/5_To_Hop_Xac_Suat/1_quy_tac_dem_va_hoan_vi_to_hop.md',
  tagSlug: 'to-hop-xac-suat-dem',
}

const q = (
  questionNumber: number,
  difficultyLevel: 1 | 2 | 3 | 4,
  questionText: string,
  answerValue: 'A' | 'B' | 'C' | 'D',
  options: Array<{ label: 'A' | 'B' | 'C' | 'D'; text: string }>,
) => buildSupplementalMcQuestion(config, questionNumber, difficultyLevel, questionText, answerValue, options)

export const supplementalToHopXacSuatDemReviewedQuestions: SchoolExamQuestionRecord[] = [
  q(1, 1, 'Có bao nhiêu cách chọn 1 học sinh từ 10 học sinh?', 'A', [{ label: 'A', text: '10' }, { label: 'B', text: '1' }, { label: 'C', text: '20' }, { label: 'D', text: '45' }]),
  q(2, 1, 'Giá trị của $C_5^2$ bằng', 'C', [{ label: 'A', text: '5' }, { label: 'B', text: '8' }, { label: 'C', text: '10' }, { label: 'D', text: '20' }]),
  q(3, 1, 'Số hoán vị của 4 phần tử phân biệt là', 'D', [{ label: 'A', text: '4' }, { label: 'B', text: '8' }, { label: 'C', text: '12' }, { label: 'D', text: '24' }]),
  q(4, 1, 'Khi chọn 3 học sinh từ 8 học sinh và không xét thứ tự, ta dùng', 'B', [{ label: 'A', text: 'Chỉnh hợp' }, { label: 'B', text: 'Tổ hợp' }, { label: 'C', text: 'Hoán vị' }, { label: 'D', text: 'Quy tắc nhân' }]),
  q(5, 1, 'Xác suất của một biến cố chắc chắn bằng', 'A', [{ label: 'A', text: '1' }, { label: 'B', text: '0' }, { label: 'C', text: '$\\dfrac{1}{2}$' }, { label: 'D', text: 'Không xác định' }]),
  q(6, 1, 'Tung một con xúc xắc cân đối một lần. Số phần tử của không gian mẫu là', 'C', [{ label: 'A', text: '2' }, { label: 'B', text: '3' }, { label: 'C', text: '6' }, { label: 'D', text: '12' }]),
  q(7, 1, 'Quy tắc cộng áp dụng khi', 'B', [{ label: 'A', text: 'Các công việc diễn ra liên tiếp' }, { label: 'B', text: 'Các trường hợp loại trừ nhau' }, { label: 'C', text: 'Các biến cố độc lập' }, { label: 'D', text: 'Phải xét thứ tự' }]),
  q(8, 1, 'Xác suất của biến cố không thể bằng', 'D', [{ label: 'A', text: '$\\dfrac{1}{2}$' }, { label: 'B', text: '0' }, { label: 'C', text: '$\\dfrac{3}{4}$' }, { label: 'D', text: '1' }]),
  q(9, 2, 'Số cách chọn 2 học sinh từ 6 học sinh là', 'A', [{ label: 'A', text: '15' }, { label: 'B', text: '12' }, { label: 'C', text: '30' }, { label: 'D', text: '6' }]),
  q(10, 2, 'Số chỉnh hợp chập 2 của 5 phần tử là', 'B', [{ label: 'A', text: '10' }, { label: 'B', text: '20' }, { label: 'C', text: '25' }, { label: 'D', text: '5' }]),
  q(11, 2, 'Gieo đồng thời hai đồng xu cân đối. Xác suất để xuất hiện đúng một mặt ngửa là', 'C', [{ label: 'A', text: '$\\dfrac{1}{4}$' }, { label: 'B', text: '$\\dfrac{3}{4}$' }, { label: 'C', text: '$\\dfrac{1}{2}$' }, { label: 'D', text: '1' }]),
  q(12, 2, 'Từ 5 nam và 4 nữ, số cách chọn 1 nam và 1 nữ là', 'D', [{ label: 'A', text: '9' }, { label: 'B', text: '10' }, { label: 'C', text: '18' }, { label: 'D', text: '20' }]),
  q(13, 2, 'Tung một xúc xắc cân đối. Xác suất để được số chẵn là', 'A', [{ label: 'A', text: '$\\dfrac{1}{2}$' }, { label: 'B', text: '$\\dfrac{1}{3}$' }, { label: 'C', text: '$\\dfrac{2}{3}$' }, { label: 'D', text: '$\\dfrac{1}{6}$' }]),
  q(14, 2, 'Số cách lập số tự nhiên có 2 chữ số khác nhau từ các chữ số 1,2,3 là', 'B', [{ label: 'A', text: '3' }, { label: 'B', text: '6' }, { label: 'C', text: '9' }, { label: 'D', text: '12' }]),
  q(15, 2, 'Nếu một công việc gồm 3 bước lần lượt có 2, 4, 5 cách thực hiện thì số cách thực hiện công việc là', 'C', [{ label: 'A', text: '11' }, { label: 'B', text: '20' }, { label: 'C', text: '40' }, { label: 'D', text: '60' }]),
  q(16, 2, 'Từ một hộp có 3 bi đỏ và 2 bi xanh, lấy ngẫu nhiên 1 bi. Xác suất lấy được bi đỏ là', 'D', [{ label: 'A', text: '$\\dfrac{2}{5}$' }, { label: 'B', text: '$\\dfrac{1}{5}$' }, { label: 'C', text: '$\\dfrac{1}{2}$' }, { label: 'D', text: '$\\dfrac{3}{5}$' }]),
  q(17, 3, 'Từ 7 học sinh chọn ra 3 học sinh rồi xếp thành một hàng ngang. Số cách chọn và xếp là', 'A', [{ label: 'A', text: '$A_7^3=210$' }, { label: 'B', text: '$C_7^3=35$' }, { label: 'C', text: '$7^3=343$' }, { label: 'D', text: '21' }]),
  q(18, 3, 'Lập một số tự nhiên có 3 chữ số khác nhau từ các chữ số 1,2,3,4,5. Số cách lập là', 'B', [{ label: 'A', text: '30' }, { label: 'B', text: '60' }, { label: 'C', text: '125' }, { label: 'D', text: '15' }]),
  q(19, 3, 'Gieo hai xúc xắc cân đối. Xác suất để tổng số chấm bằng 7 là', 'D', [{ label: 'A', text: '$\\dfrac{1}{12}$' }, { label: 'B', text: '$\\dfrac{1}{3}$' }, { label: 'C', text: '$\\dfrac{1}{18}$' }, { label: 'D', text: '$\\dfrac{1}{6}$' }]),
  q(20, 3, 'Từ 6 nữ và 4 nam, số cách chọn 3 học sinh sao cho có đúng 2 nữ là', 'A', [{ label: 'A', text: '$C_6^2\\cdot C_4^1=60$' }, { label: 'B', text: '$C_{10}^3=120$' }, { label: 'C', text: '$C_6^1\\cdot C_4^2=36$' }, { label: 'D', text: '24' }]),
  q(21, 3, 'Một tổ có 8 người, số cách chọn tổ trưởng, tổ phó là', 'C', [{ label: 'A', text: '16' }, { label: 'B', text: '28' }, { label: 'C', text: '56' }, { label: 'D', text: '64' }]),
  q(22, 3, 'Tung đồng thời 3 đồng xu cân đối. Xác suất để có ít nhất 1 mặt ngửa là', 'D', [{ label: 'A', text: '$\\dfrac{1}{8}$' }, { label: 'B', text: '$\\dfrac{3}{8}$' }, { label: 'C', text: '$\\dfrac{1}{2}$' }, { label: 'D', text: '$\\dfrac{7}{8}$' }]),
  q(23, 3, 'Từ tập $\\{1,2,3,4,5,6\\}$, số cách chọn 2 số sao cho tổng là số chẵn là', 'B', [{ label: 'A', text: '5' }, { label: 'B', text: '6' }, { label: 'C', text: '9' }, { label: 'D', text: '12' }]),
  q(24, 3, 'Gieo một xúc xắc. Biến cố “ra số nguyên tố” có xác suất', 'A', [{ label: 'A', text: '$\\dfrac{1}{2}$' }, { label: 'B', text: '$\\dfrac{1}{3}$' }, { label: 'C', text: '$\\dfrac{2}{3}$' }, { label: 'D', text: '$\\dfrac{5}{6}$' }]),
  q(25, 4, 'Từ các chữ số 0,1,2,3,4 lập số tự nhiên có 3 chữ số khác nhau và không bắt đầu bằng 0. Số cách lập là', 'C', [{ label: 'A', text: '36' }, { label: 'B', text: '40' }, { label: 'C', text: '48' }, { label: 'D', text: '60' }]),
  q(26, 4, 'Một lớp có 6 nam, 5 nữ. Số cách chọn 4 học sinh sao cho có ít nhất 1 nữ là', 'B', [{ label: 'A', text: '$C_{11}^4$' }, { label: 'B', text: '$C_{11}^4-C_6^4$' }, { label: 'C', text: '$C_5^1\\cdot C_6^3$' }, { label: 'D', text: '$C_5^4$' }]),
  q(27, 4, 'Gieo hai xúc xắc. Xác suất để tích số chấm là số chẵn bằng', 'D', [{ label: 'A', text: '$\\dfrac{1}{4}$' }, { label: 'B', text: '$\\dfrac{1}{2}$' }, { label: 'C', text: '$\\dfrac{5}{9}$' }, { label: 'D', text: '$\\dfrac{3}{4}$' }]),
  q(28, 4, 'Số cách xếp 5 cuốn sách khác nhau lên giá sao cho hai cuốn A, B đứng cạnh nhau là', 'A', [{ label: 'A', text: '48' }, { label: 'B', text: '24' }, { label: 'C', text: '60' }, { label: 'D', text: '120' }]),
  q(29, 4, 'Từ 4 chữ số 1,2,3,4 lập các số chẵn có 3 chữ số khác nhau. Số cách lập là', 'C', [{ label: 'A', text: '8' }, { label: 'B', text: '10' }, { label: 'C', text: '12' }, { label: 'D', text: '16' }]),
  q(30, 4, 'Một hộp có 4 bi đỏ, 3 bi xanh. Lấy ngẫu nhiên 2 bi cùng lúc. Xác suất để hai bi cùng màu là', 'B', [{ label: 'A', text: '$\\dfrac{2}{7}$' }, { label: 'B', text: '$\\dfrac{3}{7}$' }, { label: 'C', text: '$\\dfrac{4}{7}$' }, { label: 'D', text: '$\\dfrac{1}{2}$' }]),
]
