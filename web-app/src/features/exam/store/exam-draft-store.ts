import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { DraftQuestion } from '../../dashboard/types/dashboard-types'

export type ExamDraftSession = {
  sessionId: string
  title: string
  subjectId: string
  subjectName: string
  topicId: string
  topicName: string
  difficultyLevel: number
  difficultyLabel: string
  durationMinutes: number
  questions: DraftQuestion[]
  deliveryMode?: 'cloud' | 'local_mock'
  sourceExamId?: string
  blueprintId?: string
  createdAt: number
}

type ExamDraftState = {
  sessions: Record<string, ExamDraftSession>
  createSession: (session: ExamDraftSession) => void
  restoreSession: (session: ExamDraftSession) => void
  getSessionById: (sessionId: string) => ExamDraftSession | null
  clearSession: (sessionId: string) => void
}

export const useExamDraftStore = create<ExamDraftState>()(
  persist(
    (set, get) => ({
      sessions: {},
      createSession: (session) =>
        set((state) => ({
          sessions: {
            ...state.sessions,
            [session.sessionId]: session,
          },
        })),
      restoreSession: (session) =>
        set((state) => ({
          sessions: {
            ...state.sessions,
            [session.sessionId]: session,
          },
        })),
      getSessionById: (sessionId) => get().sessions[sessionId] ?? null,
      clearSession: (sessionId) =>
        set((state) => {
          const nextSessions = { ...state.sessions }
          delete nextSessions[sessionId]
          return {
            sessions: nextSessions,
          }
        }),
    }),
    {
      name: 'thptqg-web-exam-drafts',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        sessions: state.sessions,
      }),
      version: 1,
    },
  ),
)
