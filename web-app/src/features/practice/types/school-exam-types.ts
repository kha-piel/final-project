export type SchoolExamChoiceQuestion = {
  questionId: string
  questionNumber: number
  prompt: string
  options: Array<{
    optionId: string
    label: string
    content: string
  }>
  correctOptionId: string
}

export type SchoolExamTrueFalseStatement = {
  statementId: string
  label: string
  content: string
  isCorrect: boolean
}

export type SchoolExamTrueFalseQuestion = {
  questionId: string
  questionNumber: number
  prompt: string
  statements: SchoolExamTrueFalseStatement[]
}

export type SchoolExamShortAnswerQuestion = {
  questionId: string
  questionNumber: number
  prompt: string
  acceptedResponses: string[]
}

export type SchoolExamPaper = {
  examId: string
  examTitle: string
  schoolName: string
  city: string
  subjectName: string
  year: number
  durationMinutes: number
  pdfUrl: string
  answerKeyProvided: boolean
  multipleChoiceQuestions: SchoolExamChoiceQuestion[]
  trueFalseQuestions: SchoolExamTrueFalseQuestion[]
  shortAnswerQuestions: SchoolExamShortAnswerQuestion[]
}

export type SchoolExamSectionPart = 'multiple_choice' | 'true_false' | 'short_answer'

export type SchoolExamSectionRecord = {
  sectionId: string
  partCode: SchoolExamSectionPart
  title: string
  instructions: string
  startQuestionNumber: number
  endQuestionNumber: number
  displayOrder: number
  optionsPerQuestion: number
  statementCount: number
}

export type SchoolExamVariantRecord = {
  variantId: string
  variantCode: string
  displayOrder: number
}

export type SchoolExamPaperRecord = {
  examId: string
  examTitle: string
  schoolName: string
  city: string
  subjectId: string
  subjectName: string
  year: number
  durationMinutes: number
  pdfUrl: string
  answerKeyProvided: boolean
  sourcePath?: string
  tags: string[]
  sections: SchoolExamSectionRecord[]
  variants: SchoolExamVariantRecord[]
}

export type SchoolExamAnswerKeyEntry = {
  questionNumber: number
  answerValue: string
}

export type SchoolExamQuestionOptionRecord = {
  optionLabel: string
  optionText: string
  displayOrder: number
}

export type SchoolExamQuestionStatementRecord = {
  label: string
  text: string
}

export type SchoolExamQuestionAssetRecord = {
  assetType: 'question_block' | 'figure' | 'table' | 'other'
  assetPath: string
  displayOrder: number
}

export type SchoolExamQuestionRecord = {
  questionId: string
  examId: string
  questionNumber: number
  questionType: SchoolExamSectionPart
  difficultyLevel: 1 | 2 | 3 | 4
  questionText: string
  statements: SchoolExamQuestionStatementRecord[]
  options: SchoolExamQuestionOptionRecord[]
  assetPaths: string[]
  assets?: SchoolExamQuestionAssetRecord[]
  topic: string
  obsidianSourcePath: string
  hasImage: boolean
  answerValue?: string
  sourceQuestionNumber?: number
  sourceSectionNumber?: number
  examTitle?: string
  schoolName?: string
  year?: number
  pdfUrl?: string
  tags?: string[]
}
