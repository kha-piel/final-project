import type { SchoolExamQuestionRecord } from '../types/school-exam-types'
import { buildSupplementalMcQuestion } from './supplemental-reviewed-helper'

const config = {
  examId: 'supplemental-quy-hoach-tuyen-tinh-reviewed',
  examTitle: 'Bộ câu quy hoạch tuyến tính và bài toán tối ưu đã rà soát',
  topic: 'Quy hoạch tuyến tính và bài toán tối ưu',
  obsidianSourcePath: 'Toan_Hoc/6_Quy_Hoach_Tuyen_Tinh/1_quy_hoach_tuyen_tinh_va_bai_toan_toi_uu.md',
  tagSlug: 'quy-hoach-tuyen-tinh',
}

const q = (
  questionNumber: number,
  difficultyLevel: 1 | 2 | 3 | 4,
  questionText: string,
  answerValue: 'A' | 'B' | 'C' | 'D',
  options: Array<{ label: 'A' | 'B' | 'C' | 'D'; text: string }>,
) => buildSupplementalMcQuestion(config, questionNumber, difficultyLevel, questionText, answerValue, options)

export const supplementalQuyHoachTuyenTinhReviewedQuestions: SchoolExamQuestionRecord[] = [
  q(1, 1, 'Miền nghiệm của một bất phương trình bậc nhất hai ẩn là', 'B', [{ label: 'A', text: 'Một điểm' }, { label: 'B', text: 'Một nửa mặt phẳng' }, { label: 'C', text: 'Một đường tròn' }, { label: 'D', text: 'Một parabol' }]),
  q(2, 1, 'Miền nghiệm của hệ bất phương trình là', 'D', [{ label: 'A', text: 'Hợp các miền nghiệm' }, { label: 'B', text: 'Phần ngoài cùng' }, { label: 'C', text: 'Tất cả các đường biên' }, { label: 'D', text: 'Giao các miền nghiệm' }]),
  q(3, 1, 'Trong bài toán quy hoạch tuyến tính, hàm cần tối ưu thường gọi là', 'A', [{ label: 'A', text: 'Hàm mục tiêu' }, { label: 'B', text: 'Hàm phụ' }, { label: 'C', text: 'Hàm đạo hàm' }, { label: 'D', text: 'Hàm điều kiện' }]),
  q(4, 1, 'Với bài toán tối ưu tuyến tính hai biến, GTLN hoặc GTNN nếu tồn tại thường đạt tại', 'C', [{ label: 'A', text: 'Mọi điểm trong miền' }, { label: 'B', text: 'Trung điểm các cạnh' }, { label: 'C', text: 'Các đỉnh của miền nghiệm' }, { label: 'D', text: 'Gốc tọa độ' }]),
  q(5, 1, 'Đường biên của bất phương trình $x+y\\le2$ là', 'B', [{ label: 'A', text: '$x+y<2$' }, { label: 'B', text: '$x+y=2$' }, { label: 'C', text: '$x-y=2$' }, { label: 'D', text: '$xy=2$' }]),
  q(6, 1, 'Điểm nào thuộc miền nghiệm của bất phương trình $x+y\\le3$?', 'A', [{ label: 'A', text: '$(1;1)$' }, { label: 'B', text: '$(2;2)$' }, { label: 'C', text: '$(4;0)$' }, { label: 'D', text: '$(0;5)$' }]),
  q(7, 1, 'Nếu hệ có điều kiện $x\\ge0, y\\ge0$ thì miền nghiệm nằm trong', 'D', [{ label: 'A', text: 'Góc phần tư II' }, { label: 'B', text: 'Góc phần tư III' }, { label: 'C', text: 'Góc phần tư IV' }, { label: 'D', text: 'Góc phần tư I hoặc trên các trục dương' }]),
  q(8, 1, 'Điểm thử thường dùng để xác định phía của đường thẳng là', 'C', [{ label: 'A', text: 'Một điểm bất kỳ trên đường biên' }, { label: 'B', text: 'Điểm vô cực' }, { label: 'C', text: 'Gốc tọa độ nếu không nằm trên đường biên' }, { label: 'D', text: 'Trung điểm đoạn chắn' }]),
  q(9, 2, 'Miền nghiệm của hệ $\\begin{cases}x\\ge0\\\\ y\\ge0\\\\ x+y\\le4\\end{cases}$ là tam giác có một đỉnh là', 'B', [{ label: 'A', text: '$(4;4)$' }, { label: 'B', text: '$(0;4)$' }, { label: 'C', text: '$(-4;0)$' }, { label: 'D', text: '$(2;4)$' }]),
  q(10, 2, 'Xét hàm mục tiêu $F=x+y$ trên miền nghiệm của hệ ở câu trên. GTLN của $F$ bằng', 'D', [{ label: 'A', text: '2' }, { label: 'B', text: '0' }, { label: 'C', text: '3' }, { label: 'D', text: '4' }]),
  q(11, 2, 'Giá trị của $F=2x+y$ tại điểm $(1;3)$ bằng', 'A', [{ label: 'A', text: '5' }, { label: 'B', text: '4' }, { label: 'C', text: '6' }, { label: 'D', text: '7' }]),
  q(12, 2, 'Miền nghiệm của hệ $x\\ge0, y\\ge0, x\\le2, y\\le3$ là', 'C', [{ label: 'A', text: 'Một tam giác' }, { label: 'B', text: 'Một nửa mặt phẳng' }, { label: 'C', text: 'Một hình chữ nhật' }, { label: 'D', text: 'Một đường thẳng' }]),
  q(13, 2, 'Trên miền nghiệm là tam giác đỉnh $(0;0)$, $(4;0)$, $(0;2)$, GTNN của $F=x+y$ bằng', 'A', [{ label: 'A', text: '0' }, { label: 'B', text: '1' }, { label: 'C', text: '2' }, { label: 'D', text: '4' }]),
  q(14, 2, 'Điểm nào không thuộc miền nghiệm của hệ $x\\ge0, y\\ge0, 2x+y\\le4$?', 'D', [{ label: 'A', text: '$(0;0)$' }, { label: 'B', text: '$(1;1)$' }, { label: 'C', text: '$(0;4)$' }, { label: 'D', text: '$(2;1)$' }]),
  q(15, 2, 'Để tìm GTLN của $F=ax+by$ trên miền đa giác lồi, ta thường', 'B', [{ label: 'A', text: 'Lấy đạo hàm theo $x$' }, { label: 'B', text: 'Tính $F$ tại các đỉnh' }, { label: 'C', text: 'Chọn điểm gần gốc nhất' }, { label: 'D', text: 'Chọn giao điểm với trục tung' }]),
  q(16, 2, 'Miền nghiệm của $x+y\\ge2$, $x\\ge0$, $y\\ge0$ là', 'C', [{ label: 'A', text: 'Miền tam giác hữu hạn' }, { label: 'B', text: 'Một đoạn thẳng' }, { label: 'C', text: 'Miền không bị chặn trong góc phần tư I' }, { label: 'D', text: 'Rỗng' }]),
  q(17, 3, 'Cho hệ $\\begin{cases}x\\ge0\\\\ y\\ge0\\\\ x+y\\le5\\\\ x+2y\\le6\\end{cases}$. Một đỉnh của miền nghiệm là', 'C', [{ label: 'A', text: '$(5;5)$' }, { label: 'B', text: '$(4;2)$' }, { label: 'C', text: '$(4;1)$' }, { label: 'D', text: '$(0;4)$' }]),
  q(18, 3, 'Trên miền nghiệm ở câu 17, GTLN của $F=x+y$ bằng', 'B', [{ label: 'A', text: '4' }, { label: 'B', text: '5' }, { label: 'C', text: '6' }, { label: 'D', text: '7' }]),
  q(19, 3, 'Với cùng miền nghiệm ở câu 17, GTNN của $F=2x+y$ bằng', 'A', [{ label: 'A', text: '0' }, { label: 'B', text: '1' }, { label: 'C', text: '2' }, { label: 'D', text: '3' }]),
  q(20, 3, 'Giao điểm của hai đường biên $x+y=4$ và $x+2y=5$ là', 'D', [{ label: 'A', text: '$(2;2)$' }, { label: 'B', text: '$(1;2)$' }, { label: 'C', text: '$(4;1)$' }, { label: 'D', text: '$(3;1)$' }]),
  q(21, 3, 'Nếu hàm mục tiêu $F=x-y$ và miền nghiệm có các đỉnh $(0;0)$, $(2;0)$, $(1;3)$ thì GTLN của $F$ bằng', 'B', [{ label: 'A', text: '0' }, { label: 'B', text: '2' }, { label: 'C', text: '3' }, { label: 'D', text: '4' }]),
  q(22, 3, 'Nếu miền nghiệm rỗng thì bài toán tối ưu', 'C', [{ label: 'A', text: 'Vẫn có GTLN' }, { label: 'B', text: 'Luôn có GTNN bằng 0' }, { label: 'C', text: 'Không có nghiệm khả thi' }, { label: 'D', text: 'Chỉ cần xét các đường biên' }]),
  q(23, 3, 'Miền nghiệm của hệ $x\\ge1, y\\ge1, x+y\\le3$ có dạng', 'A', [{ label: 'A', text: 'Tam giác' }, { label: 'B', text: 'Hình chữ nhật' }, { label: 'C', text: 'Nửa mặt phẳng' }, { label: 'D', text: 'Rỗng' }]),
  q(24, 3, 'Trên miền ở câu 23, GTLN của $F=3x+2y$ bằng', 'D', [{ label: 'A', text: '5' }, { label: 'B', text: '6' }, { label: 'C', text: '7' }, { label: 'D', text: '8' }]),
  q(25, 4, 'Một xưởng sản xuất hai loại sản phẩm $A,B$ với ràng buộc $\\begin{cases}x\\ge0\\\\ y\\ge0\\\\ 2x+y\\le10\\\\ x+y\\le6\\end{cases}$ và lợi nhuận $F=3x+2y$. GTLN của $F$ là', 'B', [{ label: 'A', text: '16' }, { label: 'B', text: '18' }, { label: 'C', text: '20' }, { label: 'D', text: '22' }]),
  q(26, 4, 'Trong câu 25, GTLN đạt tại', 'A', [{ label: 'A', text: '$(4;2)$' }, { label: 'B', text: '$(5;0)$' }, { label: 'C', text: '$(0;6)$' }, { label: 'D', text: '$(3;3)$' }]),
  q(27, 4, 'Cho miền nghiệm có các đỉnh $(0;0)$, $(0;4)$, $(2;3)$, $(3;0)$. GTNN của $F=x+2y$ bằng', 'A', [{ label: 'A', text: '0' }, { label: 'B', text: '3' }, { label: 'C', text: '4' }, { label: 'D', text: '5' }]),
  q(28, 4, 'Nếu đường mức của hàm mục tiêu song song với một cạnh của miền nghiệm và tiếp xúc trên cả cạnh đó thì', 'D', [{ label: 'A', text: 'Bài toán vô nghiệm' }, { label: 'B', text: 'Chỉ có một điểm tối ưu' }, { label: 'C', text: 'Không tồn tại GTLN' }, { label: 'D', text: 'Có vô số điểm tối ưu trên cạnh đó' }]),
  q(29, 4, 'Miền nghiệm của hệ $x\\ge0, y\\ge0, x+y\\ge2$ và $x+y\\le2$ là', 'C', [{ label: 'A', text: 'Rỗng' }, { label: 'B', text: 'Một tam giác' }, { label: 'C', text: 'Đoạn thẳng nối $(2;0)$ và $(0;2)$' }, { label: 'D', text: 'Một điểm duy nhất' }]),
  q(30, 4, 'Với miền ở câu 29, GTLN của $F=x-y$ bằng', 'B', [{ label: 'A', text: '0' }, { label: 'B', text: '2' }, { label: 'C', text: '1' }, { label: 'D', text: '4' }]),
]
