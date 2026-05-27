import type { SchoolExamQuestionRecord } from '../types/school-exam-types'
import { buildSupplementalMcQuestion } from './supplemental-reviewed-helper'

const config = {
  examId: 'supplemental-xac-suat-doc-lap-reviewed',
  examTitle: 'Bộ câu xác suất biến cố độc lập đã rà soát',
  topic: 'Xác suất biến cố độc lập',
  obsidianSourcePath: 'Toan_Hoc/3_Thong_Ke_Xac_Suat/2_xac_suat_bien_co_doc_lap.md',
  tagSlug: 'xac-suat-doc-lap',
}

const q = (
  questionNumber: number,
  difficultyLevel: 1 | 2 | 3 | 4,
  questionText: string,
  answerValue: 'A' | 'B' | 'C' | 'D',
  options: Array<{ label: 'A' | 'B' | 'C' | 'D'; text: string }>,
) => buildSupplementalMcQuestion(config, questionNumber, difficultyLevel, questionText, answerValue, options)

export const supplementalXacSuatDocLapReviewedQuestions: SchoolExamQuestionRecord[] = [
  q(1, 1, 'Hai biến cố $A,B$ độc lập khi', 'B', [{ label: 'A', text: '$A\\cap B=\\varnothing$' }, { label: 'B', text: '$P(A\\cap B)=P(A)P(B)$' }, { label: 'C', text: '$P(A)=P(B)$' }, { label: 'D', text: '$A\\subset B$' }]),
  q(2, 1, 'Nếu $P(A)=0,4$ và $P(B)=0,5$, hai biến cố độc lập thì $P(A\\cap B)$ bằng', 'A', [{ label: 'A', text: '0,2' }, { label: 'B', text: '0,9' }, { label: 'C', text: '0,1' }, { label: 'D', text: '0,4' }]),
  q(3, 1, 'Trong các phép thử lặp lại độc lập, xác suất “không xảy ra lần nào” bằng', 'D', [{ label: 'A', text: 'Tổng các xác suất' }, { label: 'B', text: 'Tích các xác suất xảy ra' }, { label: 'C', text: 'Bằng 0' }, { label: 'D', text: 'Tích các xác suất không xảy ra' }]),
  q(4, 1, 'Nếu tung hai đồng xu cân đối, hai kết quả của từng đồng xu là', 'C', [{ label: 'A', text: 'Xung khắc' }, { label: 'B', text: 'Phụ thuộc' }, { label: 'C', text: 'Độc lập' }, { label: 'D', text: 'Đối nhau' }]),
  q(5, 1, 'Nếu $A$ và $B$ độc lập thì công thức đúng là', 'B', [{ label: 'A', text: '$P(A\\cup B)=P(A)P(B)$' }, { label: 'B', text: '$P(A\\cap B)=P(A)P(B)$' }, { label: 'C', text: '$P(A|B)=P(B)$' }, { label: 'D', text: '$P(A)=1-P(B)$' }]),
  q(6, 1, 'Biến cố đối của biến cố $A$ được kí hiệu là', 'A', [{ label: 'A', text: '$\\overline A$' }, { label: 'B', text: '$A^{-1}$' }, { label: 'C', text: '$A^2$' }, { label: 'D', text: '$A\\cup B$' }]),
  q(7, 1, 'Nếu xác suất thành công của một phép thử là $p$ thì xác suất thất bại là', 'D', [{ label: 'A', text: '$p^2$' }, { label: 'B', text: '$1+p$' }, { label: 'C', text: '$\\dfrac{1}{p}$' }, { label: 'D', text: '$1-p$' }]),
  q(8, 1, 'Tung một đồng xu 3 lần độc lập. Số phép thử là', 'C', [{ label: 'A', text: '1' }, { label: 'B', text: '2' }, { label: 'C', text: '3' }, { label: 'D', text: '6' }]),
  q(9, 2, 'Tung 2 đồng xu cân đối. Xác suất để cả hai đều ngửa là', 'A', [{ label: 'A', text: '$\\dfrac{1}{4}$' }, { label: 'B', text: '$\\dfrac{1}{2}$' }, { label: 'C', text: '$\\dfrac{3}{4}$' }, { label: 'D', text: '$\\dfrac{1}{8}$' }]),
  q(10, 2, 'Tung 2 đồng xu cân đối. Xác suất để có ít nhất một mặt ngửa là', 'D', [{ label: 'A', text: '$\\dfrac{1}{4}$' }, { label: 'B', text: '$\\dfrac{1}{2}$' }, { label: 'C', text: '$\\dfrac{5}{8}$' }, { label: 'D', text: '$\\dfrac{3}{4}$' }]),
  q(11, 2, 'Nếu $P(A)=0,6$, $P(B)=0,3$ và $A,B$ độc lập thì $P(A\\cup B)$ bằng', 'B', [{ label: 'A', text: '0,18' }, { label: 'B', text: '0,72' }, { label: 'C', text: '0,9' }, { label: 'D', text: '0,42' }]),
  q(12, 2, 'Gieo một xúc xắc 2 lần độc lập. Xác suất cả hai lần đều ra số chẵn là', 'C', [{ label: 'A', text: '$\\dfrac{1}{2}$' }, { label: 'B', text: '$\\dfrac{1}{3}$' }, { label: 'C', text: '$\\dfrac{1}{4}$' }, { label: 'D', text: '$\\dfrac{3}{4}$' }]),
  q(13, 2, 'Gieo một xúc xắc 2 lần độc lập. Xác suất không lần nào ra mặt 6 là', 'A', [{ label: 'A', text: '$\\left(\\dfrac{5}{6}\\right)^2$' }, { label: 'B', text: '$\\dfrac{1}{6}$' }, { label: 'C', text: '$\\dfrac{5}{6}$' }, { label: 'D', text: '$\\dfrac{11}{36}$' }]),
  q(14, 2, 'Nếu $P(A)=0,2$ thì xác suất để $A$ không xảy ra là', 'D', [{ label: 'A', text: '0,2' }, { label: 'B', text: '0,6' }, { label: 'C', text: '0,5' }, { label: 'D', text: '0,8' }]),
  q(15, 2, 'Tung đồng xu 4 lần độc lập. Xác suất tất cả đều sấp là', 'B', [{ label: 'A', text: '$\\dfrac{1}{8}$' }, { label: 'B', text: '$\\dfrac{1}{16}$' }, { label: 'C', text: '$\\dfrac{1}{4}$' }, { label: 'D', text: '$\\dfrac{3}{16}$' }]),
  q(16, 2, 'Nếu $A$ và $B$ độc lập, $P(A)=0,5$, $P(B)=0,4$ thì $P(\\overline A\\cap B)$ bằng', 'C', [{ label: 'A', text: '0,5' }, { label: 'B', text: '0,1' }, { label: 'C', text: '0,2' }, { label: 'D', text: '0,4' }]),
  q(17, 3, 'Bắn độc lập 2 phát vào bia, xác suất trúng mỗi phát lần lượt là 0,7 và 0,8. Xác suất trúng cả hai phát là', 'A', [{ label: 'A', text: '0,56' }, { label: 'B', text: '0,15' }, { label: 'C', text: '0,24' }, { label: 'D', text: '0,94' }]),
  q(18, 3, 'Trong câu 17, xác suất trượt cả hai phát là', 'D', [{ label: 'A', text: '0,44' }, { label: 'B', text: '0,30' }, { label: 'C', text: '0,20' }, { label: 'D', text: '0,06' }]),
  q(19, 3, 'Trong câu 17, xác suất trúng ít nhất một phát là', 'B', [{ label: 'A', text: '0,56' }, { label: 'B', text: '0,94' }, { label: 'C', text: '0,24' }, { label: 'D', text: '0,50' }]),
  q(20, 3, 'Tung đồng xu 3 lần độc lập. Xác suất có đúng 3 mặt ngửa là', 'A', [{ label: 'A', text: '$\\dfrac{1}{8}$' }, { label: 'B', text: '$\\dfrac{3}{8}$' }, { label: 'C', text: '$\\dfrac{7}{8}$' }, { label: 'D', text: '$\\dfrac{1}{4}$' }]),
  q(21, 3, 'Tung đồng xu 3 lần độc lập. Xác suất không có mặt ngửa nào là', 'D', [{ label: 'A', text: '$\\dfrac{7}{8}$' }, { label: 'B', text: '$\\dfrac{3}{8}$' }, { label: 'C', text: '$\\dfrac{1}{4}$' }, { label: 'D', text: '$\\dfrac{1}{8}$' }]),
  q(22, 3, 'Nếu $A,B$ độc lập với $P(A)=0,3$, $P(B)=0,4$ thì $P(\\overline A\\cap \\overline B)$ bằng', 'C', [{ label: 'A', text: '0,12' }, { label: 'B', text: '0,28' }, { label: 'C', text: '0,42' }, { label: 'D', text: '0,7' }]),
  q(23, 3, 'Gieo một xúc xắc 3 lần độc lập. Xác suất để cả 3 lần đều không ra số 1 là', 'A', [{ label: 'A', text: '$\\left(\\dfrac{5}{6}\\right)^3$' }, { label: 'B', text: '$\\dfrac{1}{6}$' }, { label: 'C', text: '$\\dfrac{5}{6}$' }, { label: 'D', text: '$1-\\left(\\dfrac{5}{6}\\right)^3$' }]),
  q(24, 3, 'Tung 2 đồng xu cân đối. Xác suất để hai kết quả giống nhau là', 'B', [{ label: 'A', text: '$\\dfrac{1}{4}$' }, { label: 'B', text: '$\\dfrac{1}{2}$' }, { label: 'C', text: '$\\dfrac{3}{4}$' }, { label: 'D', text: '1' }]),
  q(25, 4, 'Gieo một xúc xắc cân đối 4 lần độc lập. Xác suất để có ít nhất một lần ra mặt 6 là', 'C', [{ label: 'A', text: '$\\left(\\dfrac{1}{6}\\right)^4$' }, { label: 'B', text: '$\\left(\\dfrac{5}{6}\\right)^4$' }, { label: 'C', text: '$1-\\left(\\dfrac{5}{6}\\right)^4$' }, { label: 'D', text: '$1-\\left(\\dfrac{1}{6}\\right)^4$' }]),
  q(26, 4, 'Một máy có xác suất hoạt động tốt trong một ngày là 0,95. Trong 2 ngày độc lập, xác suất máy luôn hoạt động tốt là', 'A', [{ label: 'A', text: '0,9025' }, { label: 'B', text: '0,95' }, { label: 'C', text: '0,0975' }, { label: 'D', text: '0,19' }]),
  q(27, 4, 'Trong câu 26, xác suất máy hỏng ít nhất một ngày là', 'D', [{ label: 'A', text: '0,9025' }, { label: 'B', text: '0,95' }, { label: 'C', text: '0,05' }, { label: 'D', text: '0,0975' }]),
  q(28, 4, 'Nếu $P(A)=0,8$, $P(B)=0,6$, $A,B$ độc lập thì $P(A\\setminus B)$ bằng', 'B', [{ label: 'A', text: '0,48' }, { label: 'B', text: '0,32' }, { label: 'C', text: '0,20' }, { label: 'D', text: '0,14' }]),
  q(29, 4, 'Tung đồng xu 5 lần độc lập. Xác suất để tất cả đều cùng một mặt là', 'A', [{ label: 'A', text: '$\\dfrac{1}{16}$' }, { label: 'B', text: '$\\dfrac{1}{32}$' }, { label: 'C', text: '$\\dfrac{1}{8}$' }, { label: 'D', text: '$\\dfrac{1}{4}$' }]),
  q(30, 4, 'Nếu $A,B$ độc lập, $P(A)=0,4$, $P(B)=0,5$ thì $P(A\\cup \\overline B)$ bằng', 'C', [{ label: 'A', text: '0,20' }, { label: 'B', text: '0,50' }, { label: 'C', text: '0,70' }, { label: 'D', text: '0,90' }]),
]
