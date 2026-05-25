export type SubjectOption = {
  subjectId: string
  subjectCode: string
  subjectName: string
}

export type TopicOption = {
  topicId: string
  subjectId: string
  topicName: string
  topicOrder: number
}

export type DifficultyOption = {
  label: string
  level: 1 | 2 | 3 | 4
}

export type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer'

export type QuestionTypeOption = {
  label: string
  value: 'all' | QuestionType
}

export type TrueFalseStatement = {
  statementId: string
  content: string
  isCorrect: boolean
}

export type QuestionSourceMeta = {
  examId?: string
  schoolName?: string
  examTitle?: string
  examCode?: string
  year?: number
  sourceQuestionNumber?: number
  sourceSectionNumber?: number
}

export type DraftAnswer = {
  answerId: string
  optionLabel: string
  content: string
  isCorrect: boolean
  explanation?: string | null
  displayOrder: number
}

export type DraftQuestion = {
  questionId: string
  topicId: string
  content: string
  level: number
  questionType: QuestionType
  explanation?: string | null
  obsidianSourcePath?: string | null
  answers: DraftAnswer[]
  statements?: TrueFalseStatement[]
  acceptedResponses?: string[]
  assetUrls?: string[]
  sourceMeta?: QuestionSourceMeta
}

export type AttemptHistoryItem = {
  attemptId: string
  examTitle: string
  subjectName: string
  topicName: string
  difficultyLabel: string
  score: number | null
  correctCount: number
  wrongCount: number
  skippedCount: number
  completedAt: string | null
  status: string
}

export const difficultyOptions: DifficultyOption[] = [
  { label: 'Nhan biet', level: 1 },
  { label: 'Thong hieu', level: 2 },
  { label: 'Van dung', level: 3 },
  { label: 'Van dung cao', level: 4 },
]

export const questionTypeOptions: QuestionTypeOption[] = [
  { label: 'Tat ca dang bai', value: 'all' },
  { label: 'Trac nghiem nhieu lua chon', value: 'multiple_choice' },
  { label: 'Trac nghiem Dung/Sai', value: 'true_false' },
  { label: 'Tra loi ngan', value: 'short_answer' },
]
