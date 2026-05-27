import type { PracticeExamCatalogItem } from '../types/practice-types'

export const mockExamCatalog: PracticeExamCatalogItem[] = [
  {
    examId: 'cau-giay-2025-lan-1',
    schoolExamPageId: 'cau-giay-pdf-2025',
    examTitle: 'Đề khảo sát Toán 12 lần 1',
    schoolName: 'THPT Cầu Giấy',
    city: 'Hà Nội',
    subjectId: 'TOAN',
    subjectName: 'Toán học',
    year: 2025,
    durationMinutes: 50,
    sourcePath:
      'obsidian_vault/Toan/de-khao-sat-toan-12-nam-2025-2026-truong-thpt-cau-giay-ha-noi.json',
    tags: ['khao sat', 'ha noi', 'toan 12'],
  },
  {
    examId: 'chuyen-su-pham-2025',
    examTitle: 'Đề thi thử Toán 12 chuyên đề tổng hợp',
    schoolName: 'THPT Chuyên Sư Phạm',
    city: 'Hà Nội',
    subjectId: 'TOAN',
    subjectName: 'Toán học',
    year: 2025,
    durationMinutes: 50,
    tags: ['thi thu', 'tổng hợp', 'ha noi'],
  },
  {
    examId: 'yen-hoa-2024',
    examTitle: 'Đề thi thử Toán học học kỳ II',
    schoolName: 'THPT Yên Hòa',
    city: 'Hà Nội',
    subjectId: 'TOAN',
    subjectName: 'Toán học',
    year: 2024,
    durationMinutes: 50,
    tags: ['hoc ky ii', 'on thi', 'ha noi'],
  },
]
