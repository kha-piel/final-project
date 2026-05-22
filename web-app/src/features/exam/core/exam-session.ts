import type { DraftQuestion } from '../../dashboard/types/dashboard-types'
import type { ExamDraftSession } from '../store/exam-draft-store'

export type ExamChatRole = 'user' | 'ai' | 'system'

export type ExamChatMessage = {
  id: string
  role: ExamChatRole
  content: string
  questionId?: string
  createdAt: number
}

export type CheckedQuestionResult = {
  questionId: string
  hasSelection: boolean
  isCorrect: boolean
  message: string
}

export type ExamRuntimeSession = {
  sessionId: string
  currentIndex: number
  selectedAnswerIdsByQuestionId: Record<string, string>
  selectedTrueFalseByQuestionId: Record<string, Record<string, boolean>>
  shortAnswerByQuestionId: Record<string, string>
  lockedQuestionIds: Record<string, true>
  chatHistory: ExamChatMessage[]
  aiExplanationsByQuestionId: Record<string, string>
  startedAt: number
  submittedAt: number | null
  persistedExamId: string | null
  persistedAttemptId: string | null
  persistedChatSessionId: string | null
  syncedChatMessageCount: number
  lastSyncedAt: number | null
  lastCheckedResult: CheckedQuestionResult | null
}

export type ReviewQuestionSummary = {
  questionId: string
  questionContent: string
  selectedAnswerText: string
  correctAnswerText: string
  correct: boolean
  explanation?: string
}

export type ExamSubmissionSummary = {
  score: number
  correctCount: number
  wrongCount: number
  skippedCount: number
  totalQuestions: number
  passed: boolean
  timeTakenSeconds: number
  reviewItems: ReviewQuestionSummary[]
}

export function createExamRuntimeSession(session: ExamDraftSession): ExamRuntimeSession {
  return {
    sessionId: session.sessionId,
    currentIndex: 0,
    selectedAnswerIdsByQuestionId: {},
    selectedTrueFalseByQuestionId: {},
    shortAnswerByQuestionId: {},
    lockedQuestionIds: {},
    chatHistory: [],
    aiExplanationsByQuestionId: {},
    startedAt: Date.now(),
    submittedAt: null,
    persistedExamId: null,
    persistedAttemptId: null,
    persistedChatSessionId: null,
    syncedChatMessageCount: 0,
    lastSyncedAt: null,
    lastCheckedResult: null,
  }
}

export function getRemainingSeconds(session: ExamDraftSession, runtime: ExamRuntimeSession) {
  const elapsedSeconds = Math.floor((Date.now() - runtime.startedAt) / 1000)
  const totalSeconds = session.durationMinutes * 60
  return Math.max(0, totalSeconds - elapsedSeconds)
}

export function isQuestionLocked(runtime: ExamRuntimeSession, questionId: string) {
  return Boolean(runtime.lockedQuestionIds[questionId])
}

export function getSelectedAnswerId(runtime: ExamRuntimeSession, questionId: string) {
  return runtime.selectedAnswerIdsByQuestionId[questionId] ?? null
}

export function getSelectedTrueFalseMap(runtime: ExamRuntimeSession, questionId: string) {
  return runtime.selectedTrueFalseByQuestionId[questionId] ?? {}
}

export function getShortAnswerValue(runtime: ExamRuntimeSession, questionId: string) {
  return runtime.shortAnswerByQuestionId[questionId] ?? ''
}

export function findCorrectAnswerId(question: DraftQuestion) {
  return question.answers.find((answer) => answer.isCorrect)?.answerId ?? null
}

export function findAnswerById(question: DraftQuestion, answerId: string | null) {
  if (!answerId) {
    return null
  }

  return question.answers.find((answer) => answer.answerId === answerId) ?? null
}

export function formatAnswerLabel(question: DraftQuestion, answerId: string | null) {
  const answer = findAnswerById(question, answerId)
  if (!answer) {
    return 'Chua chon dap an'
  }

  return `${answer.optionLabel}. ${answer.content}`
}

export function hasAnsweredQuestion(runtime: ExamRuntimeSession, question: DraftQuestion) {
  if (question.questionType === 'multiple_choice') {
    return Boolean(getSelectedAnswerId(runtime, question.questionId))
  }

  if (question.questionType === 'true_false') {
    const selectedMap = getSelectedTrueFalseMap(runtime, question.questionId)
    const statements = question.statements ?? []
    return statements.length > 0 && statements.every((statement) => statement.statementId in selectedMap)
  }

  return getShortAnswerValue(runtime, question.questionId).trim().length > 0
}

export function formatQuestionResponse(runtime: ExamRuntimeSession, question: DraftQuestion) {
  if (question.questionType === 'multiple_choice') {
    return formatAnswerLabel(question, getSelectedAnswerId(runtime, question.questionId))
  }

  if (question.questionType === 'true_false') {
    const selectedMap = getSelectedTrueFalseMap(runtime, question.questionId)
    const statements = question.statements ?? []
    const answeredLines = statements
      .filter((statement) => statement.statementId in selectedMap)
      .map((statement, index) => `${String.fromCharCode(97 + index)}) ${selectedMap[statement.statementId] ? 'Dung' : 'Sai'}`)

    return answeredLines.length > 0 ? answeredLines.join(' | ') : 'Chua chon dap an'
  }

  const value = getShortAnswerValue(runtime, question.questionId).trim()
  return value || 'Chua nhap dap an'
}

export function formatCorrectResponse(question: DraftQuestion) {
  if (question.questionType === 'multiple_choice') {
    return formatAnswerLabel(question, findCorrectAnswerId(question))
  }

  if (question.questionType === 'true_false') {
    return (question.statements ?? [])
      .map((statement, index) => `${String.fromCharCode(97 + index)}) ${statement.isCorrect ? 'Dung' : 'Sai'}`)
      .join(' | ')
  }

  return question.acceptedResponses?.[0] ?? 'Khong ro dap an dung'
}

export function checkQuestion(
  runtime: ExamRuntimeSession,
  question: DraftQuestion,
): CheckedQuestionResult {
  let hasSelection = false
  let isCorrect = false

  if (question.questionType === 'multiple_choice') {
    const selectedAnswerId = getSelectedAnswerId(runtime, question.questionId)
    if (!selectedAnswerId) {
      return {
        questionId: question.questionId,
        hasSelection: false,
        isCorrect: false,
        message: 'Ban can chon mot dap an truoc khi kiem tra.',
      }
    }

    hasSelection = true
    isCorrect = selectedAnswerId === findCorrectAnswerId(question)
  } else if (question.questionType === 'true_false') {
    const statements = question.statements ?? []
    const selectedMap = getSelectedTrueFalseMap(runtime, question.questionId)
    if (statements.length === 0 || statements.some((statement) => !(statement.statementId in selectedMap))) {
      return {
        questionId: question.questionId,
        hasSelection: false,
        isCorrect: false,
        message: 'Ban can tra loi day du tung menh de Dung/Sai truoc khi kiem tra.',
      }
    }

    hasSelection = true
    isCorrect = statements.every((statement) => selectedMap[statement.statementId] === statement.isCorrect)
  } else {
    const normalizedInput = normalizeShortAnswer(getShortAnswerValue(runtime, question.questionId))
    if (!normalizedInput) {
      return {
        questionId: question.questionId,
        hasSelection: false,
        isCorrect: false,
        message: 'Ban can nhap dap an ngan truoc khi kiem tra.',
      }
    }

    hasSelection = true
    isCorrect = (question.acceptedResponses ?? []).some(
      (candidate) => normalizeShortAnswer(candidate) === normalizedInput,
    )
  }

  return {
    questionId: question.questionId,
    hasSelection,
    isCorrect,
    message: isCorrect
      ? 'Chinh xac! Ban da chon dung dap an.'
      : 'Chua dung. Cau hoi da duoc khoa sau khi kiem tra.',
  }
}

export function buildSubmissionSummary(
  session: ExamDraftSession,
  runtime: ExamRuntimeSession,
): ExamSubmissionSummary {
  let correctCount = 0
  let wrongCount = 0
  let skippedCount = 0

  const reviewItems = session.questions.map((question) => {
    const selectedAnswerText = formatQuestionResponse(runtime, question)
    const correctAnswerText = formatCorrectResponse(question)
    const result = checkQuestion(runtime, question)
    const answered = hasAnsweredQuestion(runtime, question)

    if (!answered) {
      skippedCount += 1
    } else if (result.isCorrect) {
      correctCount += 1
    } else {
      wrongCount += 1
    }

    return {
      questionId: question.questionId,
      questionContent: question.content,
      selectedAnswerText,
      correctAnswerText,
      correct: answered && result.isCorrect,
      explanation: runtime.aiExplanationsByQuestionId[question.questionId],
    }
  })

  const totalQuestions = session.questions.length
  const score =
    totalQuestions === 0
      ? 0
      : Math.round(((correctCount / totalQuestions) * 10) * 100) / 100
  const timeTakenSeconds = Math.floor(
    ((runtime.submittedAt ?? Date.now()) - runtime.startedAt) / 1000,
  )

  return {
    score,
    correctCount,
    wrongCount,
    skippedCount,
    totalQuestions,
    passed: score >= 5,
    timeTakenSeconds,
    reviewItems,
  }
}

function normalizeShortAnswer(input: string) {
  return input.trim().replace(/\s+/g, ' ').toLowerCase()
}
