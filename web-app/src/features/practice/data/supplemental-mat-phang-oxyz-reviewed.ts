import type { SchoolExamQuestionRecord } from '../types/school-exam-types'
import { buildSupplementalMcQuestion } from './supplemental-reviewed-helper'

const config = {
  examId: 'supplemental-mat-phang-oxyz-reviewed',
  examTitle: 'Bộ câu phương trình mặt phẳng trong Oxyz đã rà soát',
  topic: 'Phương trình mặt phẳng trong Oxyz',
  obsidianSourcePath: 'Toan_Hoc/2_Hinh_Hoc_Khong_Gian/4_phuong_trinh_mat_phang.md',
  tagSlug: 'mat-phang-oxyz',
}

const q = (
  questionNumber: number,
  difficultyLevel: 1 | 2 | 3 | 4,
  questionText: string,
  answerValue: 'A' | 'B' | 'C' | 'D',
  options: Array<{ label: 'A' | 'B' | 'C' | 'D'; text: string }>,
) => buildSupplementalMcQuestion(config, questionNumber, difficultyLevel, questionText, answerValue, options)

export const supplementalMatPhangOxyzReviewedQuestions: SchoolExamQuestionRecord[] = [
  q(1, 1, 'Vectơ nào sau đây là một vectơ pháp tuyến của mặt phẳng $2x-y+3z+1=0$?', 'C', [{ label: 'A', text: '$(2;1;3)$' }, { label: 'B', text: '$(1;2;3)$' }, { label: 'C', text: '$(2;-1;3)$' }, { label: 'D', text: '$(-2;1;3)$' }]),
  q(2, 1, 'Mặt phẳng đi qua điểm $A(1;2;3)$ và có vectơ pháp tuyến $\\vec n=(1;0;0)$ có phương trình là', 'A', [{ label: 'A', text: '$x-1=0$' }, { label: 'B', text: '$y-2=0$' }, { label: 'C', text: '$z-3=0$' }, { label: 'D', text: '$x+y+z-6=0$' }]),
  q(3, 1, 'Phương trình mặt phẳng tọa độ $(Oxy)$ là', 'D', [{ label: 'A', text: '$x=0$' }, { label: 'B', text: '$y=0$' }, { label: 'C', text: '$x+y=0$' }, { label: 'D', text: '$z=0$' }]),
  q(4, 1, 'Mặt phẳng nào song song với trục $Oz$?', 'B', [{ label: 'A', text: '$z=2$' }, { label: 'B', text: '$x-y+1=0$' }, { label: 'C', text: '$x+z=1$' }, { label: 'D', text: '$y+z=0$' }]),
  q(5, 1, 'Điểm nào thuộc mặt phẳng $x+y+z-3=0$?', 'A', [{ label: 'A', text: '$(1;1;1)$' }, { label: 'B', text: '$(1;1;2)$' }, { label: 'C', text: '$(0;0;0)$' }, { label: 'D', text: '$(2;2;2)$' }]),
  q(6, 1, 'Nếu hai mặt phẳng song song thì hai vectơ pháp tuyến của chúng', 'C', [{ label: 'A', text: 'Vuông góc' }, { label: 'B', text: 'Có tích vô hướng bằng 0' }, { label: 'C', text: 'Cùng phương' }, { label: 'D', text: 'Bằng nhau từng tọa độ' }]),
  q(7, 1, 'Mặt phẳng $x=0$ là mặt phẳng', 'D', [{ label: 'A', text: '$(Oxy)$' }, { label: 'B', text: '$(Oxz)$' }, { label: 'C', text: 'Qua điểm $(1;0;0)$' }, { label: 'D', text: '$(Oyz)$' }]),
  q(8, 1, 'Khoảng cách từ điểm nằm trên mặt phẳng đến chính mặt phẳng đó bằng', 'B', [{ label: 'A', text: '1' }, { label: 'B', text: '0' }, { label: 'C', text: '$\\sqrt{2}$' }, { label: 'D', text: 'Phụ thuộc pháp tuyến' }]),
  q(9, 2, 'Mặt phẳng đi qua $A(1;0;0)$ và vuông góc với trục $Ox$ có phương trình là', 'C', [{ label: 'A', text: '$y=0$' }, { label: 'B', text: '$z=0$' }, { label: 'C', text: '$x=1$' }, { label: 'D', text: '$x+y+z=1$' }]),
  q(10, 2, 'Mặt phẳng qua điểm $A(1;2;3)$ và có vectơ pháp tuyến $(2;-1;1)$ là', 'A', [{ label: 'A', text: '$2(x-1)-(y-2)+(z-3)=0$' }, { label: 'B', text: '$x+2y+3z=0$' }, { label: 'C', text: '$2x-y+z=0$' }, { label: 'D', text: '$x-2y+z+3=0$' }]),
  q(11, 2, 'Phương trình mặt phẳng đi qua ba điểm $A(1;0;0)$, $B(0;1;0)$, $C(0;0;1)$ là', 'D', [{ label: 'A', text: '$x+y+z=0$' }, { label: 'B', text: '$x-y+z=1$' }, { label: 'C', text: '$x+y-z=1$' }, { label: 'D', text: '$x+y+z=1$' }]),
  q(12, 2, 'Hai mặt phẳng $x+2y-z+1=0$ và $2x+4y-2z-3=0$ có vị trí tương đối là', 'B', [{ label: 'A', text: 'Trùng nhau' }, { label: 'B', text: 'Song song phân biệt' }, { label: 'C', text: 'Vuông góc' }, { label: 'D', text: 'Cắt nhau theo một đường thẳng và tạo góc 60°' }]),
  q(13, 2, 'Khoảng cách từ điểm $M(1;1;1)$ đến mặt phẳng $x+y+z=0$ bằng', 'A', [{ label: 'A', text: '$\\sqrt{3}$' }, { label: 'B', text: '1' }, { label: 'C', text: '$\\dfrac{1}{\\sqrt{3}}$' }, { label: 'D', text: '3' }]),
  q(14, 2, 'Mặt phẳng song song với mặt phẳng $x-y+2z+3=0$ có thể có phương trình', 'C', [{ label: 'A', text: '$x+y+2z-1=0$' }, { label: 'B', text: '$2x-y+2z=0$' }, { label: 'C', text: '$2x-2y+4z-5=0$' }, { label: 'D', text: '$x-y-z=0$' }]),
  q(15, 2, 'Mặt phẳng vuông góc với mặt phẳng $x+y+z=0$ có thể có vectơ pháp tuyến là', 'D', [{ label: 'A', text: '$(2;2;2)$' }, { label: 'B', text: '$(1;1;1)$' }, { label: 'C', text: '$(-1;-1;-1)$' }, { label: 'D', text: '$(1;-1;0)$' }]),
  q(16, 2, 'Khoảng cách từ gốc tọa độ đến mặt phẳng $2x-2y+z-6=0$ bằng', 'B', [{ label: 'A', text: '$\\dfrac{3}{2}$' }, { label: 'B', text: '$\\dfrac{6}{3}$' }, { label: 'C', text: '6' }, { label: 'D', text: '$\\sqrt{6}$' }]),
  q(17, 3, 'Phương trình mặt phẳng đi qua $A(1;1;1)$ và song song với mặt phẳng $2x-y+z-4=0$ là', 'A', [{ label: 'A', text: '$2x-y+z-2=0$' }, { label: 'B', text: '$2x-y+z-4=0$' }, { label: 'C', text: '$x-2y+z=0$' }, { label: 'D', text: '$2x+y-z=0$' }]),
  q(18, 3, 'Cho mặt phẳng $(P):x+my+2z-3=0$ vuông góc với mặt phẳng $(Q):2x-y+z+1=0$. Giá trị của $m$ là', 'C', [{ label: 'A', text: '$-1$' }, { label: 'B', text: '1' }, { label: 'C', text: '0' }, { label: 'D', text: '2' }]),
  q(19, 3, 'Mặt phẳng đi qua $A(1;0;0)$, $B(0;1;0)$ và song song với trục $Oz$ có phương trình là', 'B', [{ label: 'A', text: '$x+y+z=1$' }, { label: 'B', text: '$x+y=1$' }, { label: 'C', text: '$z=1$' }, { label: 'D', text: '$x-y=0$' }]),
  q(20, 3, 'Khoảng cách giữa hai mặt phẳng song song $x-2y+2z+1=0$ và $x-2y+2z-5=0$ bằng', 'D', [{ label: 'A', text: '$\\dfrac{6}{2}$' }, { label: 'B', text: '$\\sqrt{9}$' }, { label: 'C', text: '$\\dfrac{4}{3}$' }, { label: 'D', text: '$\\dfrac{6}{3}$' }]),
  q(21, 3, 'Điểm đối xứng của $M(1;2;3)$ qua mặt phẳng $(Oxy)$ là', 'A', [{ label: 'A', text: '$(1;2;-3)$' }, { label: 'B', text: '$(-1;2;3)$' }, { label: 'C', text: '$(1;-2;3)$' }, { label: 'D', text: '$(-1;-2;-3)$' }]),
  q(22, 3, 'Nếu mặt phẳng $(P)$ chứa trục $Oz$ thì phương trình của $(P)$ không chứa ẩn', 'C', [{ label: 'A', text: '$x$' }, { label: 'B', text: '$y$' }, { label: 'C', text: '$z$' }, { label: 'D', text: 'Không có đáp án đúng' }]),
  q(23, 3, 'Phương trình mặt phẳng trung trực của đoạn nối $A(1;0;0)$ và $B(3;0;0)$ là', 'C', [{ label: 'A', text: '$x=1$' }, { label: 'B', text: '$x=3$' }, { label: 'C', text: '$x=2$' }, { label: 'D', text: '$y=2$' }]),
  q(24, 3, 'Mặt phẳng qua điểm $A(0;0;1)$ và song song với $(Oxy)$ có phương trình', 'D', [{ label: 'A', text: '$x=1$' }, { label: 'B', text: '$y=1$' }, { label: 'C', text: '$x+y+z=1$' }, { label: 'D', text: '$z=1$' }]),
  q(25, 4, 'Cho mặt phẳng $(P)$ qua $A(1;2;0)$, $B(0;1;1)$, $C(2;0;1)$. Một vectơ pháp tuyến của $(P)$ là', 'D', [{ label: 'A', text: '$(1;1;1)$' }, { label: 'B', text: '$(1;1;2)$' }, { label: 'C', text: '$(2;1;1)$' }, { label: 'D', text: '$(1;2;3)$' }]),
  q(26, 4, 'Giá trị của $m$ để điểm $M(1;2;m)$ thuộc mặt phẳng $x-y+2z-3=0$ là', 'A', [{ label: 'A', text: '2' }, { label: 'B', text: '1' }, { label: 'C', text: '$\\dfrac{1}{2}$' }, { label: 'D', text: '0' }]),
  q(27, 4, 'Mặt phẳng qua $A(1;0;0)$ và cắt các trục tọa độ tại $A,B,C$ sao cho $OA=OB=OC$ có phương trình là', 'D', [{ label: 'A', text: '$x+y+z=0$' }, { label: 'B', text: '$x-y+z=1$' }, { label: 'C', text: '$2x+2y+2z=1$' }, { label: 'D', text: '$x+y+z=1$' }]),
  q(28, 4, 'Khoảng cách từ điểm $M(2;-1;1)$ đến mặt phẳng $2x-y+2z-2=0$ bằng', 'C', [{ label: 'A', text: '0' }, { label: 'B', text: '$\\dfrac{3}{2}$' }, { label: 'C', text: '$\\dfrac{5}{3}$' }, { label: 'D', text: '$\\dfrac{5}{2}$' }]),
  q(29, 4, 'Nếu hai mặt phẳng cắt nhau theo một đường thẳng thì hai vectơ pháp tuyến của chúng', 'A', [{ label: 'A', text: 'Không cùng phương' }, { label: 'B', text: 'Vuông góc bắt buộc' }, { label: 'C', text: 'Bằng nhau' }, { label: 'D', text: 'Đều có độ dài bằng 1' }]),
  q(30, 4, 'Cho họ mặt phẳng $(P_m):x+my+z-1=0$. Để $(P_m)$ song song với đường thẳng có vectơ chỉ phương $\\vec u=(1;0;-1)$ thì', 'D', [{ label: 'A', text: '$m=0$' }, { label: 'B', text: '$m=1$' }, { label: 'C', text: '$m=-1$' }, { label: 'D', text: 'Mọi $m$' }]),
]
