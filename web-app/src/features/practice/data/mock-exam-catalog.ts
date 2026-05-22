import type { PracticeExamCatalogItem } from '../types/practice-types'

export const mockExamCatalog: PracticeExamCatalogItem[] = [
  {
    examId: 'cau-giay-2025-lan-1',
    schoolExamPageId: 'cau-giay-pdf-2025',
    examTitle: 'De khao sat Toan 12 lan 1',
    schoolName: 'THPT Cau Giay',
    city: 'Ha Noi',
    subjectId: 'TOAN',
    subjectName: 'Toan hoc',
    year: 2025,
    durationMinutes: 50,
    sourcePath:
      'obsidian_vault/Toan/de-khao-sat-toan-12-nam-2025-2026-truong-thpt-cau-giay-ha-noi.json',
    tags: ['khao sat', 'ha noi', 'toan 12'],
  },
  {
    examId: 'chuyen-su-pham-2025',
    examTitle: 'De thi thu Toan 12 chuyen de tong hop',
    schoolName: 'THPT Chuyen Su Pham',
    city: 'Ha Noi',
    subjectId: 'TOAN',
    subjectName: 'Toan hoc',
    year: 2025,
    durationMinutes: 50,
    tags: ['thi thu', 'tong hop', 'ha noi'],
  },
  {
    examId: 'yen-hoa-2024',
    examTitle: 'De thi thu Toan hoc hoc ky II',
    schoolName: 'THPT Yen Hoa',
    city: 'Ha Noi',
    subjectId: 'TOAN',
    subjectName: 'Toan hoc',
    year: 2024,
    durationMinutes: 50,
    tags: ['hoc ky ii', 'on thi', 'ha noi'],
  },
]
