import type { PracticeBlueprint } from '../types/practice-types'

export const practiceBlueprints: PracticeBlueprint[] = [
  {
    blueprintId: 'bo-gddt-toan-22',
    name: 'Đề thi thử Toán theo cấu trúc 22 câu',
    description:
      '12 câu nhiều lựa chọn, 4 câu Đúng/Sai, 6 câu trả lời ngắn với phân bố độ khó theo 4 mức.',
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
]
