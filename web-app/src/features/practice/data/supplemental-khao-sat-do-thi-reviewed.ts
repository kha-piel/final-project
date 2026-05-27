import type { SchoolExamQuestionRecord } from '../types/school-exam-types'
import { buildSupplementalMcQuestion } from './supplemental-reviewed-helper'

const config = {
  examId: 'supplemental-khao-sat-do-thi-reviewed',
  examTitle: 'Bộ câu khảo sát và đọc đồ thị hàm số đã rà soát',
  topic: 'Khảo sát và đọc đồ thị hàm số',
  obsidianSourcePath: 'Toan_Hoc/1_Ham_So/5_khao_sat_do_thi.md',
  tagSlug: 'khao-sat-do-thi',
}

const q = (
  questionNumber: number,
  difficultyLevel: 1 | 2 | 3 | 4,
  questionText: string,
  answerValue: 'A' | 'B' | 'C' | 'D',
  options: Array<{ label: 'A' | 'B' | 'C' | 'D'; text: string }>,
) => buildSupplementalMcQuestion(config, questionNumber, difficultyLevel, questionText, answerValue, options)

export const supplementalKhaoSatDoThiReviewedQuestions: SchoolExamQuestionRecord[] = [
  q(1, 1, 'Đồ thị hàm số bậc ba thường có nhiều nhất bao nhiêu điểm cực trị?', 'B', [{ label: 'A', text: '1' }, { label: 'B', text: '2' }, { label: 'C', text: '3' }, { label: 'D', text: '4' }]),
  q(2, 1, 'Nếu đồ thị cắt trục tung tại điểm có tung độ bằng 3 thì giá trị $f(0)$ bằng', 'C', [{ label: 'A', text: '$-3$' }, { label: 'B', text: '0' }, { label: 'C', text: '3' }, { label: 'D', text: '1' }]),
  q(3, 1, 'Số giao điểm của đồ thị với trục hoành chính là số nghiệm của phương trình', 'A', [{ label: 'A', text: '$f(x)=0$' }, { label: 'B', text: "$f'(x)=0$" }, { label: 'C', text: '$f(x)=1$' }, { label: 'D', text: '$f(x)=x$' }]),
  q(4, 1, 'Nếu đồ thị đi lên từ trái sang phải trên một khoảng thì hàm số', 'D', [{ label: 'A', text: 'Âm trên khoảng đó' }, { label: 'B', text: 'Có cực trị trên mọi điểm' }, { label: 'C', text: 'Nghịch biến trên khoảng đó' }, { label: 'D', text: 'Đồng biến trên khoảng đó' }]),
  q(5, 1, 'Tiệm cận đứng của đồ thị có dạng', 'B', [{ label: 'A', text: '$y=a$' }, { label: 'B', text: '$x=a$' }, { label: 'C', text: '$x+y=a$' }, { label: 'D', text: '$y=ax+b$' }]),
  q(6, 1, 'Nếu đồ thị nhận đường thẳng $y=2$ làm tiệm cận ngang thì $\\lim\\limits_{x\\to +\\infty}f(x)$ có thể bằng', 'A', [{ label: 'A', text: '2' }, { label: 'B', text: '0' }, { label: 'C', text: '$+\\infty$' }, { label: 'D', text: '$-2$' }]),
  q(7, 1, 'Điểm cực đại của đồ thị là điểm mà hàm số đổi từ', 'C', [{ label: 'A', text: 'Nghịch biến sang đồng biến' }, { label: 'B', text: 'Âm sang dương' }, { label: 'C', text: 'Đồng biến sang nghịch biến' }, { label: 'D', text: 'Dương sang âm' }]),
  q(8, 1, 'Nếu đồ thị của $y=f(x)$ nhận gốc tọa độ làm tâm đối xứng thì hàm số thường thuộc loại', 'D', [{ label: 'A', text: 'Hàm chẵn' }, { label: 'B', text: 'Hàm hằng' }, { label: 'C', text: 'Hàm tuần hoàn' }, { label: 'D', text: 'Hàm lẻ' }]),
  q(9, 2, "Bảng biến thiên cho thấy $f'(x)>0$ trên $(-\\infty;1)$ và $f'(x)<0$ trên $(1;+\\infty)$. Khi đó hàm số đạt", 'B', [{ label: 'A', text: 'Cực tiểu tại $x=1$' }, { label: 'B', text: 'Cực đại tại $x=1$' }, { label: 'C', text: 'Không có cực trị' }, { label: 'D', text: 'GTLN trên $\\mathbb{R}$ tại $x=1$' }]),
  q(10, 2, 'Nếu đồ thị của $y=f(x)$ cắt đường thẳng $y=2$ tại 3 điểm phân biệt thì phương trình $f(x)=2$ có', 'D', [{ label: 'A', text: '0 nghiệm' }, { label: 'B', text: '1 nghiệm' }, { label: 'C', text: '2 nghiệm' }, { label: 'D', text: '3 nghiệm' }]),
  q(11, 2, 'Từ đồ thị của $y=f(x)$, muốn suy ra số nghiệm của phương trình $f(x)=m$ ta xét', 'A', [{ label: 'A', text: 'Số giao điểm của đồ thị với đường thẳng $y=m$' }, { label: 'B', text: 'Số giao điểm với trục tung' }, { label: 'C', text: 'Số điểm cực trị' }, { label: 'D', text: 'Số tiệm cận' }]),
  q(12, 2, 'Nếu đồ thị có tiệm cận đứng $x=1$ thì điều chắc chắn đúng là', 'C', [{ label: 'A', text: '$f(1)=0$' }, { label: 'B', text: '$f(1)$ luôn xác định' }, { label: 'C', text: 'Ít nhất một giới hạn một bên tại $x=1$ là vô cực' }, { label: 'D', text: 'Đồ thị đi qua điểm $(1;0)$' }]),
  q(13, 2, 'Đồ thị hàm số bậc ba có hai cực trị nằm hai phía trục hoành. Khi đó phương trình $f(x)=0$ thường có', 'B', [{ label: 'A', text: '1 nghiệm thực' }, { label: 'B', text: '3 nghiệm thực phân biệt' }, { label: 'C', text: '2 nghiệm thực phân biệt' }, { label: 'D', text: 'Không có nghiệm thực' }]),
  q(14, 2, 'Nếu đồ thị đối xứng qua trục tung thì điều kiện phù hợp nhất là', 'D', [{ label: 'A', text: '$f(-x)=-f(x)$' }, { label: 'B', text: '$f(x)>0$' }, { label: 'C', text: '$f(x)$ có chu kì' }, { label: 'D', text: '$f(-x)=f(x)$' }]),
  q(15, 2, 'Cho đồ thị của $f(x)$ có điểm cực tiểu tại $x=-2$. Kết luận đúng là', 'A', [{ label: 'A', text: '$f(-2)$ là tung độ của điểm cực tiểu' }, { label: 'B', text: '$f(-2)=0$ luôn đúng' }, { label: 'C', text: '$-2$ là giá trị cực tiểu' }, { label: 'D', text: '$f(x)$ đồng biến trên toàn trục số' }]),
  q(16, 2, 'Nếu đồ thị có đúng một tiệm cận ngang $y=-1$ thì số nào sau đây có thể là giới hạn ở vô cực?', 'C', [{ label: 'A', text: '$+\\infty$' }, { label: 'B', text: '0' }, { label: 'C', text: '$-1$' }, { label: 'D', text: '2' }]),
  q(17, 3, 'Giả sử đồ thị của $f(x)$ cắt trục hoành tại ba điểm phân biệt có hoành độ $a<b<c$. Khi đó trên đồ thị của $y=|f(x)|$, số điểm nằm trên trục hoành là', 'B', [{ label: 'A', text: '0' }, { label: 'B', text: '3' }, { label: 'C', text: '6' }, { label: 'D', text: '1' }]),
  q(18, 3, 'Nếu đồ thị của $y=f(x)$ nhận đường thẳng $x=2$ làm tiệm cận đứng và $y=1$ làm tiệm cận ngang thì đồ thị của $y=f(x-1)+3$ có một tiệm cận đứng là', 'D', [{ label: 'A', text: '$x=1$' }, { label: 'B', text: '$x=2$' }, { label: 'C', text: '$x=0$' }, { label: 'D', text: '$x=3$' }]),
  q(19, 3, 'Từ đồ thị của $y=f(x)$ biết hàm số đồng biến trên $(-\\infty;-1)$, nghịch biến trên $(-1;2)$, đồng biến trên $(2;+\\infty)$. Hàm số có', 'A', [{ label: 'A', text: 'Một cực đại và một cực tiểu' }, { label: 'B', text: 'Hai cực đại' }, { label: 'C', text: 'Hai cực tiểu' }, { label: 'D', text: 'Không có cực trị' }]),
  q(20, 3, 'Nếu đường thẳng $y=m$ tiếp xúc với đồ thị $y=f(x)$ tại điểm cực trị thì phương trình $f(x)=m$ có ít nhất', 'C', [{ label: 'A', text: '0 nghiệm' }, { label: 'B', text: '1 nghiệm đơn' }, { label: 'C', text: '1 nghiệm bội' }, { label: 'D', text: '3 nghiệm phân biệt' }]),
  q(21, 3, "Cho đồ thị của $f'(x)$ cắt trục hoành tại 2 điểm và tại mỗi điểm đều đổi dấu. Khi đó đồ thị của $f(x)$ có", 'D', [{ label: 'A', text: '0 cực trị' }, { label: 'B', text: '1 cực trị' }, { label: 'C', text: '3 cực trị' }, { label: 'D', text: '2 cực trị' }]),
  q(22, 3, 'Đồ thị của $y=f(x)$ không cắt trục hoành nhưng cắt đường thẳng $y=1$ tại hai điểm phân biệt. Khẳng định nào đúng?', 'A', [{ label: 'A', text: 'Phương trình $f(x)=0$ vô nghiệm, còn $f(x)=1$ có 2 nghiệm' }, { label: 'B', text: 'Phương trình $f(x)=0$ có 2 nghiệm' }, { label: 'C', text: '$f(x)$ luôn bằng 1' }, { label: 'D', text: '$f(x)$ có đúng 1 cực trị' }]),
  q(23, 3, 'Nếu đồ thị của hàm phân thức bậc nhất trên bậc nhất có tiệm cận đứng $x=-1$ và đi qua điểm $(0;2)$ thì kết luận nào sau đây chắc chắn đúng?', 'B', [{ label: 'A', text: '$f(-1)=2$' }, { label: 'B', text: 'Điểm $(0;2)$ nằm trên đồ thị' }, { label: 'C', text: 'Đồ thị không có tiệm cận ngang' }, { label: 'D', text: '$f(0)=0$' }]),
  q(24, 3, 'Đồ thị của $y=f(x)$ có tâm đối xứng $I(1;-2)$. Khi tịnh tiến hệ trục sao cho $I$ thành gốc mới thì đồ thị mới thường thuộc kiểu', 'C', [{ label: 'A', text: 'Đối xứng trục tung' }, { label: 'B', text: 'Luôn là parabol' }, { label: 'C', text: 'Đối xứng qua gốc tọa độ mới' }, { label: 'D', text: 'Luôn là đường tròn' }]),
  q(25, 4, 'Đồ thị của $f(x)$ cắt trục hoành tại đúng hai điểm phân biệt và có một điểm cực trị nằm trên trục hoành. Số nghiệm phân biệt của phương trình $f(x)=0$ là', 'A', [{ label: 'A', text: '2' }, { label: 'B', text: '1' }, { label: 'C', text: '3' }, { label: 'D', text: '4' }]),
  q(26, 4, 'Nếu đồ thị của $f(x)$ có ba giao điểm phân biệt với đường thẳng $y=m$ thì phát biểu nào có thể đúng?', 'D', [{ label: 'A', text: '$m$ lớn hơn mọi giá trị của $f(x)$' }, { label: 'B', text: '$m$ là tiệm cận ngang duy nhất' }, { label: 'C', text: '$f(x)$ luôn đồng biến' }, { label: 'D', text: '$m$ nằm giữa giá trị cực đại và cực tiểu thích hợp' }]),
  q(27, 4, 'Cho đồ thị $y=f(x)$ và đường thẳng $d:y=x$. Phương trình $f(x)=x$ có số nghiệm bằng', 'B', [{ label: 'A', text: 'Số cực trị của $f(x)$' }, { label: 'B', text: 'Số giao điểm của đồ thị với $d$' }, { label: 'C', text: 'Số tiệm cận đứng' }, { label: 'D', text: 'Số nghiệm của $f(x)=0$' }]),
  q(28, 4, 'Một đồ thị có hai nhánh nằm ở góc phần tư I và III, nhận hai trục tọa độ làm tiệm cận. Dạng hàm số quen thuộc nhất là', 'C', [{ label: 'A', text: '$y=ax^2+b$' }, { label: 'B', text: '$y=ax^3+bx$' }, { label: 'C', text: '$y=\\dfrac{k}{x}$ với $k>0$' }, { label: 'D', text: '$y=|x|$' }]),
  q(29, 4, "Nếu đồ thị của $f'(x)$ nằm phía trên trục hoành trên hai khoảng tách rời nhau, thì đồ thị của $f(x)$", 'A', [{ label: 'A', text: 'Đồng biến trên hai khoảng đó' }, { label: 'B', text: 'Luôn có đúng một cực đại' }, { label: 'C', text: 'Luôn là hàm bậc ba' }, { label: 'D', text: 'Không thể có tiệm cận' }]),
  q(30, 4, 'Một đường thẳng song song trục hoành cắt đồ thị của hàm bậc ba tại 1 điểm khi nằm ngoài dải giá trị cực trị và tại 3 điểm khi nằm giữa hai giá trị cực trị. Nhận định này', 'D', [{ label: 'A', text: 'Sai vì luôn cắt 2 điểm' }, { label: 'B', text: 'Sai vì luôn cắt 3 điểm' }, { label: 'C', text: 'Chỉ đúng với hàm bậc hai' }, { label: 'D', text: 'Đúng với dạng đồ thị bậc ba quen thuộc' }]),
]
