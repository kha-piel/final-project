import type { DraftQuestion, QuestionType } from '../../dashboard/types/dashboard-types'

export type PracticeExamCatalogItem = {
  examId: string
  schoolExamPageId?: string
  examTitle: string
  schoolName: string
  city: string
  subjectId: string
  subjectName: string
  year: number
  durationMinutes: number
  pdfUrl?: string
  sourcePath?: string
  tags: string[]
}

export type PracticeBlueprintSection = {
  id: string
  title: string
  questionType: QuestionType
  count: number
  levelCounts: Record<1 | 2 | 3 | 4, number>
}

export type PracticeBlueprint = {
  blueprintId: string
  subjectId: string
  subjectName: string
  name: string
  description: string
  durationMinutes: number
  sections: PracticeBlueprintSection[]
}

export type PracticeQuestion = DraftQuestion & {
  subjectId: string
  subjectName: string
  sourceExamId: string
  schoolName: string
  year: number
  tags: string[]
}

export type PracticeSearchFilters = {
  keyword: string
  subjectId: string
  year: 'all' | number
}
