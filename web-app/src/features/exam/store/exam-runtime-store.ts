import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { DraftQuestion } from '../../dashboard/types/dashboard-types'
import {
  checkQuestion,
  createExamRuntimeSession,
  type CheckedQuestionResult,
  type ExamChatMessage,
  type ExamChatRole,
  type ExamRuntimeSession,
} from '../core/exam-session'
import type { ExamDraftSession } from './exam-draft-store'

type ExamRuntimeState = {
  sessions: Record<string, ExamRuntimeSession>
  initializeSession: (session: ExamDraftSession) => void
  restoreRuntimeSession: (runtime: ExamRuntimeSession) => void
  selectAnswer: (sessionId: string, questionId: string, answerId: string) => void
  setCurrentIndex: (sessionId: string, nextIndex: number) => void
  goToNextQuestion: (sessionId: string, totalQuestions: number) => void
  goToPreviousQuestion: (sessionId: string) => void
  checkCurrentQuestion: (
    sessionId: string,
    question: DraftQuestion,
  ) => CheckedQuestionResult | null
  addChatMessage: (
    sessionId: string,
    message: {
      role: ExamChatRole
      content: string
      questionId?: string
    },
  ) => void
  cacheAiExplanation: (sessionId: string, questionId: string, explanation: string) => void
  markCloudSync: (
    sessionId: string,
    syncInfo: {
      persistedExamId: string
      persistedAttemptId: string
      persistedChatSessionId?: string | null
      syncedChatMessageCount?: number
      lastSyncedAt: number
    },
  ) => void
  submitSession: (sessionId: string) => void
  clearRuntimeSession: (sessionId: string) => void
}

export const useExamRuntimeStore = create<ExamRuntimeState>()(
  persist(
    (set, get) => ({
      sessions: {},
      initializeSession: (session) =>
        set((state) => {
          if (state.sessions[session.sessionId]) {
            return state
          }

          return {
            sessions: {
              ...state.sessions,
              [session.sessionId]: createExamRuntimeSession(session),
            },
          }
        }),
      restoreRuntimeSession: (runtime) =>
        set((state) => ({
          sessions: {
            ...state.sessions,
            [runtime.sessionId]: runtime,
          },
        })),
      selectAnswer: (sessionId, questionId, answerId) =>
        set((state) => {
          const runtime = state.sessions[sessionId]
          if (!runtime || runtime.lockedQuestionIds[questionId]) {
            return state
          }

          return {
            sessions: {
              ...state.sessions,
              [sessionId]: {
                ...runtime,
                selectedAnswerIdsByQuestionId: {
                  ...runtime.selectedAnswerIdsByQuestionId,
                  [questionId]: answerId,
                },
              },
            },
          }
        }),
      setCurrentIndex: (sessionId, nextIndex) =>
        set((state) => {
          const runtime = state.sessions[sessionId]
          if (!runtime) {
            return state
          }

          return {
            sessions: {
              ...state.sessions,
              [sessionId]: {
                ...runtime,
                currentIndex: nextIndex,
              },
            },
          }
        }),
      goToNextQuestion: (sessionId, totalQuestions) =>
        set((state) => {
          const runtime = state.sessions[sessionId]
          if (!runtime) {
            return state
          }

          return {
            sessions: {
              ...state.sessions,
              [sessionId]: {
                ...runtime,
                currentIndex: Math.min(runtime.currentIndex + 1, totalQuestions - 1),
              },
            },
          }
        }),
      goToPreviousQuestion: (sessionId) =>
        set((state) => {
          const runtime = state.sessions[sessionId]
          if (!runtime) {
            return state
          }

          return {
            sessions: {
              ...state.sessions,
              [sessionId]: {
                ...runtime,
                currentIndex: Math.max(runtime.currentIndex - 1, 0),
              },
            },
          }
        }),
      checkCurrentQuestion: (sessionId, question) => {
        const runtime = get().sessions[sessionId]
        if (!runtime) {
          return null
        }

        const result = checkQuestion(runtime, question)
        if (!result.hasSelection) {
          set((state) => ({
            sessions: {
              ...state.sessions,
              [sessionId]: {
                ...runtime,
                lastCheckedResult: result,
              },
            },
          }))
          return result
        }

        set((state) => ({
          sessions: {
            ...state.sessions,
            [sessionId]: {
              ...runtime,
              lockedQuestionIds: {
                ...runtime.lockedQuestionIds,
                [question.questionId]: true,
              },
              lastCheckedResult: result,
            },
          },
        }))

        return result
      },
      addChatMessage: (sessionId, message) =>
        set((state) => {
          const runtime = state.sessions[sessionId]
          if (!runtime) {
            return state
          }

          const nextMessage: ExamChatMessage = {
            id: crypto.randomUUID(),
            role: message.role,
            content: message.content,
            questionId: message.questionId,
            createdAt: Date.now(),
          }

          return {
            sessions: {
              ...state.sessions,
              [sessionId]: {
                ...runtime,
                chatHistory: [...runtime.chatHistory, nextMessage],
              },
            },
          }
        }),
      cacheAiExplanation: (sessionId, questionId, explanation) =>
        set((state) => {
          const runtime = state.sessions[sessionId]
          if (!runtime || !explanation.trim()) {
            return state
          }

          const existing = runtime.aiExplanationsByQuestionId[questionId]
          const nextExplanation = existing
            ? `${existing}\n\n-----\n\n${explanation}`
            : explanation

          return {
            sessions: {
              ...state.sessions,
              [sessionId]: {
                ...runtime,
                aiExplanationsByQuestionId: {
                  ...runtime.aiExplanationsByQuestionId,
                  [questionId]: nextExplanation,
                },
              },
            },
          }
        }),
      markCloudSync: (sessionId, syncInfo) =>
        set((state) => {
          const runtime = state.sessions[sessionId]
          if (!runtime) {
            return state
          }

          return {
            sessions: {
              ...state.sessions,
              [sessionId]: {
                ...runtime,
                persistedExamId: syncInfo.persistedExamId,
                persistedAttemptId: syncInfo.persistedAttemptId,
                persistedChatSessionId:
                  syncInfo.persistedChatSessionId ?? runtime.persistedChatSessionId,
                syncedChatMessageCount:
                  syncInfo.syncedChatMessageCount ?? runtime.syncedChatMessageCount,
                lastSyncedAt: syncInfo.lastSyncedAt,
              },
            },
          }
        }),
      submitSession: (sessionId) =>
        set((state) => {
          const runtime = state.sessions[sessionId]
          if (!runtime || runtime.submittedAt) {
            return state
          }

          return {
            sessions: {
              ...state.sessions,
              [sessionId]: {
                ...runtime,
                submittedAt: Date.now(),
              },
            },
          }
        }),
      clearRuntimeSession: (sessionId) =>
        set((state) => {
          const nextSessions = { ...state.sessions }
          delete nextSessions[sessionId]
          return {
            sessions: nextSessions,
          }
        }),
    }),
    {
      name: 'thptqg-web-exam-runtime',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        sessions: state.sessions,
      }),
      version: 1,
    },
  ),
)
