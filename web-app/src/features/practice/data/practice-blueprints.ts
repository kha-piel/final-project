import type { PracticeBlueprint } from '../types/practice-types'

export const practiceBlueprints: PracticeBlueprint[] = [
  {
    blueprintId: 'bo-gddt-toan-22',
    name: 'De thi thu Toan theo cau truc 22 cau',
    description:
      '12 cau nhieu lua chon, 4 cau Dung/Sai, 6 cau tra loi ngan voi phan bo do kho theo 4 muc.',
    durationMinutes: 50,
    sections: [
      {
        id: 'mc',
        title: 'Phan I. Trac nghiem nhieu lua chon',
        questionType: 'multiple_choice',
        count: 12,
        levelCounts: { 1: 4, 2: 4, 3: 3, 4: 1 },
      },
      {
        id: 'tf',
        title: 'Phan II. Trac nghiem Dung/Sai',
        questionType: 'true_false',
        count: 4,
        levelCounts: { 1: 0, 2: 2, 3: 1, 4: 1 },
      },
      {
        id: 'sa',
        title: 'Phan III. Tra loi ngan',
        questionType: 'short_answer',
        count: 6,
        levelCounts: { 1: 2, 2: 2, 3: 1, 4: 1 },
      },
    ],
  },
]
