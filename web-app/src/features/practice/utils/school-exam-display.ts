type SchoolExamDisplayInput = {
  examId: string
  title: string
  schoolName?: string
}

const titleOverridesByExamId: Record<string, string> = {
  'chuyen-le-khiet-quang-2025': 'Đề Toán Chuyên Lê Khiết Quảng năm học 2025-2026',
  'so-gddt-gialai-toan-2026-0101': 'Đề thi Toán học Sở GDĐT Gia Lai 2026 - Mã 0101',
  'ssstudy-vat-ly-thi-thu-tot-nghiep-2026': 'Đề thi thử tốt nghiệp THPT môn Vật lý năm 2026 - SSStudy',
  'thpt-nguyen-du-toan-2026-1201': 'Đề thi Toán học THPT Nguyễn Du 2026 - Mã 1201',
  'thpt-nguyen-trai-toan-2026-1201': 'Đề thi Toán học THPT Nguyễn Trãi 2026 - Mã 1201',
  'thpt-tran-phu-quang-ninh-2026-lan-3': 'Đề thi Toán học THPT Trần Phú Quảng Ninh 2026 - Lần 3',
  'thpt-van-lang-ha-noi-2025': 'Đề thi Toán học THPT Văn Lang Hà Nội 2025',
  'thpt-yen-lac-toan-2026-101': 'Đề thi Toán học THPT Yên Lạc 2026 - Mã 101',
}

const schoolNameOverridesByExamId: Record<string, string> = {
  'chuyen-le-khiet-quang-2025': 'Chuyên Lê Khiết Quảng',
  'so-gddt-gialai-toan-2026-0101': 'Sở GDĐT Gia Lai',
  'ssstudy-vat-ly-thi-thu-tot-nghiep-2026': 'Hệ thống giáo dục SSStudy',
  'thpt-nguyen-du-toan-2026-1201': 'THPT Nguyễn Du',
  'thpt-nguyen-trai-toan-2026-1201': 'THPT Nguyễn Trãi',
  'thpt-tran-phu-quang-ninh-2026-lan-3': 'THPT Trần Phú Quảng Ninh',
  'thpt-van-lang-ha-noi-2025': 'THPT Văn Lang Hà Nội',
  'thpt-yen-lac-toan-2026-101': 'THPT Yên Lạc',
}

export function formatSchoolExamDisplayTitle(input: SchoolExamDisplayInput) {
  const override = titleOverridesByExamId[input.examId]
  if (override) {
    return override
  }

  return beautifyAsciiVietnamese(input.title)
}

export function formatSchoolExamDisplaySchoolName(examId: string, schoolName: string) {
  return schoolNameOverridesByExamId[examId] ?? beautifyAsciiVietnamese(schoolName)
}

function beautifyAsciiVietnamese(value: string) {
  return value
    .replace(/\bDe thi thu tot nghiep THPT mon Vat ly nam\b/g, 'Đề thi thử tốt nghiệp THPT môn Vật lý năm')
    .replace(/\bDe thi Toan hoc\b/g, 'Đề thi Toán học')
    .replace(/\bDe thi Vat ly\b/g, 'Đề thi Vật lý')
    .replace(/\bDe thi Hoa hoc\b/g, 'Đề thi Hóa học')
    .replace(/\bDe Toan\b/g, 'Đề Toán')
    .replace(/\bDe thi\b/g, 'Đề thi')
    .replace(/\bMa\b/g, 'Mã')
    .replace(/\bmon\b/g, 'môn')
    .replace(/\bnam hoc\b/g, 'năm học')
    .replace(/\bnam\b/g, 'năm')
    .replace(/\bToan hoc\b/g, 'Toán học')
    .replace(/\bVat ly\b/g, 'Vật lý')
    .replace(/\bHoa hoc\b/g, 'Hóa học')
    .replace(/\bthi thu\b/g, 'thi thử')
    .replace(/\btot nghiep\b/g, 'tốt nghiệp')
    .replace(/\s+/g, ' ')
    .trim()
}
