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

export function checkQuestion(
  runtime: ExamRuntimeSession,
  question: DraftQuestion,
): CheckedQuestionResult {
  const selectedAnswerId = getSelectedAnswerId(runtime, question.questionId)

  if (!selectedAnswerId) {
    return {
      questionId: question.questionId,
      hasSelection: false,
      isCorrect: false,
      message: 'Ban can chon mot dap an truoc khi kiem tra.',
    }
  }

  const correctAnswerId = findCorrectAnswerId(question)
  const isCorrect = selectedAnswerId === correctAnswerId

  return {
    questionId: question.questionId,
    hasSelection: true,
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
    const selectedAnswerId = getSelectedAnswerId(runtime, question.questionId)
    const correctAnswerId = findCorrectAnswerId(question)
    const selectedAnswerText = formatAnswerLabel(question, selectedAnswerId)
    const correctAnswerText = formatAnswerLabel(question, correctAnswerId)
    const correct = Boolean(selectedAnswerId && selectedAnswerId === correctAnswerId)

    if (!selectedAnswerId) {
      skippedCount += 1
    } else if (correct) {
      correctCount += 1
    } else {
      wrongCount += 1
    }

    return {
      questionId: question.questionId,
      questionContent: question.content,
      selectedAnswerText,
      correctAnswerText,
      correct,
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
