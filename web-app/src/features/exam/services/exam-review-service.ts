import type { ExamSubmissionSummary, ReviewQuestionSummary } from '../core/exam-session'
import { getSupabaseBrowserClient } from '../../../lib/supabase/client'

type AttemptReviewRow = {
  attempt_id: string
  score: number | null
  correct_count: number
  wrong_count: number
  skipped_count: number
  total_time_taken_seconds: number | null
  completed_at: string | null
  status: string
  metadata: {
    difficulty_label?: string
    subject_name?: string
    topic_name?: string
  } | null
  exams:
    | {
        title: string
      }
    | {
        title: string
      }[]
    | null
  attempt_answers: PersistedAttemptAnswerRow[] | null
}

type PersistedAttemptAnswerRow = {
  question_id: string
  is_correct: boolean | null
  metadata: {
    ai_explanation?: string | null
    question_content?: string | null
  } | null
  question:
    | {
        content: string
        answers: PersistedQuestionAnswerRow[] | null
      }
    | {
        content: string
        answers: PersistedQuestionAnswerRow[] | null
      }[]
    | null
  selected_answer:
    | {
        answer_id: string
        option_label: string
        content: string
      }
    | {
        answer_id: string
        option_label: string
        content: string
      }[]
    | null
}

type PersistedQuestionAnswerRow = {
  answer_id: string
  option_label: string
  content: string
  is_correct: boolean
}

export type PersistedAttemptReview = ExamSubmissionSummary & {
  attemptId: string
  examTitle: string
  topicName: string
  subjectName: string
  difficultyLabel: string
  completedAt: string | null
  status: string
}

export async function fetchPersistedAttemptReview(attemptId: string) {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from('student_attempts')
    .select(
      'attempt_id, score, correct_count, wrong_count, skipped_count, total_time_taken_seconds, completed_at, status, metadata, exams(title), attempt_answers(question_id, is_correct, metadata, question:questions(content, answers(answer_id, option_label, content, is_correct)), selected_answer:answers!attempt_answers_selected_answer_id_fkey(answer_id, option_label, content))',
    )
    .eq('attempt_id', attemptId)
    .maybeSingle<AttemptReviewRow>()

  if (error) {
    throw new Error(`Khong the tai du lieu review da luu: ${error.message}`)
  }

  if (!data) {
    return null
  }

  const examTitle = unwrapSingle(data.exams)?.title ?? 'Attempt Review'
  const reviewItems = (data.attempt_answers ?? []).map(mapPersistedReviewItem)

  return {
    attemptId: data.attempt_id,
    examTitle,
    topicName: data.metadata?.topic_name ?? '--',
    subjectName: data.metadata?.subject_name ?? '--',
    difficultyLabel: data.metadata?.difficulty_label ?? '--',
    score: roundScore(data.score),
    correctCount: data.correct_count,
    wrongCount: data.wrong_count,
    skippedCount: data.skipped_count,
    totalQuestions: reviewItems.length,
    passed: (data.score ?? 0) >= 5,
    timeTakenSeconds: data.total_time_taken_seconds ?? 0,
    reviewItems,
    completedAt: data.completed_at,
    status: data.status,
  } satisfies PersistedAttemptReview
}

function mapPersistedReviewItem(row: PersistedAttemptAnswerRow): ReviewQuestionSummary {
  const question = unwrapSingle(row.question)
  const selectedAnswer = unwrapSingle(row.selected_answer)
  const correctAnswer = (question?.answers ?? []).find((answer) => answer.is_correct) ?? null

  return {
    questionId: row.question_id,
    questionContent: question?.content ?? row.metadata?.question_content ?? 'Question not found',
    selectedAnswerText: selectedAnswer
      ? `${selectedAnswer.option_label}. ${selectedAnswer.content}`
      : 'Chua chon dap an',
    correctAnswerText: correctAnswer
      ? `${correctAnswer.option_label}. ${correctAnswer.content}`
      : 'Khong ro dap an dung',
    correct: Boolean(row.is_correct),
    explanation: row.metadata?.ai_explanation ?? undefined,
  }
}

function roundScore(score: number | null) {
  if (score === null) {
    return 0
  }

  return Math.round(score * 100) / 100
}

function unwrapSingle<T>(value: T | T[] | null | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? null
  }

  return value ?? null
}
