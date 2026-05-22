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
