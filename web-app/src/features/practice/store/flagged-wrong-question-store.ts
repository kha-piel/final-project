import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { DraftQuestion } from '../../dashboard/types/dashboard-types'

export type FlaggedWrongQuestion = {
  flaggedId: string
  questionId: string
  subjectId: string
  subjectName: string
  topicId: string
  topicName: string
  difficultyLevel: number
  difficultyLabel: string
  question: DraftQuestion
  flaggedAt: number
}

type FlaggedWrongQuestionStore = {
  items: Record<string, FlaggedWrongQuestion>
  upsertFlaggedQuestion: (item: Omit<FlaggedWrongQuestion, 'flaggedId' | 'flaggedAt'>) => void
  removeFlaggedQuestion: (input: { subjectId: string; topicId: string; questionId: string }) => void
  isFlaggedQuestion: (input: { subjectId: string; topicId: string; questionId: string }) => boolean
  clearAllFlaggedQuestions: () => void
}

export function buildFlaggedQuestionId(input: {
  subjectId: string
  topicId: string
  questionId: string
}) {
  return `${input.subjectId}::${input.topicId}::${input.questionId}`
}

export const useFlaggedWrongQuestionStore = create<FlaggedWrongQuestionStore>()(
  persist(
    (set, get) => ({
      items: {},
      upsertFlaggedQuestion: (item) =>
        set((state) => {
          const flaggedId = buildFlaggedQuestionId(item)
          return {
            items: {
              ...state.items,
              [flaggedId]: {
                ...item,
                flaggedId,
                flaggedAt: Date.now(),
              },
            },
          }
        }),
      removeFlaggedQuestion: (input) =>
        set((state) => {
          const flaggedId = buildFlaggedQuestionId(input)
          const nextItems = { ...state.items }
          delete nextItems[flaggedId]
          return { items: nextItems }
        }),
      isFlaggedQuestion: (input) => Boolean(get().items[buildFlaggedQuestionId(input)]),
      clearAllFlaggedQuestions: () => set({ items: {} }),
    }),
    {
      name: 'thptqg-web-flagged-wrong-questions',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
      version: 1,
    },
  ),
)
