import type { PracticeBlueprint } from '../types/practice-types'

export const practiceBlueprints: PracticeBlueprint[] = [
  {
    blueprintId: 'bo-gddt-toan-22',
    subjectId: 'TOAN',
    subjectName: 'Toán học',
    name: 'Đề thi thử Toán theo cấu trúc 22 câu',
    description:
      '12 câu trắc nghiệm nhiều lựa chọn, 4 câu trắc nghiệm Đúng/Sai, 6 câu trả lời ngắn với phân bố độ khó theo 4 mức.',
    durationMinutes: 50,
    sections: [
      {
        id: 'mc',
        title: 'Phần I. Trắc nghiệm nhiều lựa chọn',
        questionType: 'multiple_choice',
        count: 12,
        levelCounts: { 1: 4, 2: 4, 3: 3, 4: 1 },
      },
      {
        id: 'tf',
        title: 'Phần II. Trắc nghiệm Đúng/Sai',
        questionType: 'true_false',
        count: 4,
        levelCounts: { 1: 0, 2: 2, 3: 1, 4: 1 },
      },
      {
        id: 'sa',
        title: 'Phần III. Trả lời ngắn',
        questionType: 'short_answer',
        count: 6,
        levelCounts: { 1: 2, 2: 2, 3: 1, 4: 1 },
      },
    ],
  },
  {
    blueprintId: 'bo-gddt-vat-ly-28',
    subjectId: 'VAT_LY',
    subjectName: 'Vật lý',
    name: 'Đề thi thử Vật lý theo cấu trúc 28 câu',
    description:
      '18 câu trắc nghiệm nhiều lựa chọn, 4 câu trắc nghiệm Đúng/Sai, 6 câu trả lời ngắn theo định dạng tốt nghiệp THPT từ 2025.',
    durationMinutes: 50,
    sections: [
      {
        id: 'mc',
        title: 'Phần I. Trắc nghiệm nhiều lựa chọn',
        questionType: 'multiple_choice',
        count: 18,
        levelCounts: { 1: 6, 2: 6, 3: 4, 4: 2 },
      },
      {
        id: 'tf',
        title: 'Phần II. Trắc nghiệm Đúng/Sai',
        questionType: 'true_false',
        count: 4,
        levelCounts: { 1: 0, 2: 2, 3: 1, 4: 1 },
      },
      {
        id: 'sa',
        title: 'Phần III. Trả lời ngắn',
        questionType: 'short_answer',
        count: 6,
        levelCounts: { 1: 1, 2: 2, 3: 2, 4: 1 },
      },
    ],
  },
  {
    blueprintId: 'bo-gddt-hoa-hoc-28',
    subjectId: 'HOA_HOC',
    subjectName: 'Hóa học',
    name: 'Đề thi thử Hóa học theo cấu trúc 28 câu',
    description:
      '18 câu trắc nghiệm nhiều lựa chọn, 4 câu trắc nghiệm Đúng/Sai, 6 câu trả lời ngắn theo định dạng tốt nghiệp THPT từ 2025.',
    durationMinutes: 50,
    sections: [
      {
        id: 'mc',
        title: 'Phần I. Trắc nghiệm nhiều lựa chọn',
        questionType: 'multiple_choice',
        count: 18,
        levelCounts: { 1: 6, 2: 6, 3: 4, 4: 2 },
      },
      {
        id: 'tf',
        title: 'Phần II. Trắc nghiệm Đúng/Sai',
        questionType: 'true_false',
        count: 4,
        levelCounts: { 1: 0, 2: 2, 3: 1, 4: 1 },
      },
      {
        id: 'sa',
        title: 'Phần III. Trả lời ngắn',
        questionType: 'short_answer',
        count: 6,
        levelCounts: { 1: 1, 2: 2, 3: 2, 4: 1 },
      },
    ],
  },
]
