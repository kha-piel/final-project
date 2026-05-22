# Practice Data Contracts

Thu muc nay dang chua du lieu mock de chay local:

- `mock-exam-catalog.ts`: danh sach de nguon de tim theo truong, nam, tag.
- `mock-question-bank.ts`: ngan hang cau hoi tong hop de sinh de ngau nhien.
- `practice-blueprints.ts`: cau truc de thi thu va phan bo do kho.

Khi bom du lieu that:

1. Them de nguon vao `mock-exam-catalog.ts` hoac doi ten file thanh data that nhung giu nguyen shape `PracticeExamCatalogItem`.
2. Them cau hoi vao `mock-question-bank.ts` theo shape `PracticeQuestion`.
3. Neu Bo thay doi cau truc de, sua `practice-blueprints.ts`.

Quy tac toi thieu cho moi cau hoi:

- `questionType`: `multiple_choice` | `true_false` | `short_answer`
- `level`: `1` nhan biet, `2` thong hieu, `3` van dung, `4` van dung cao
- `sourceExamId`, `schoolName`, `year`
- `answers` cho `multiple_choice`
- `statements` cho `true_false`
- `acceptedResponses` cho `short_answer`

Service sinh de dang doc truc tiep tu cac file nay, nen ban co the bom du lieu that ma khong can sua UI.
