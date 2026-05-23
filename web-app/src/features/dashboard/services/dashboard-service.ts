import { getSupabaseBrowserClient } from '../../../lib/supabase/client'
import type {
  AttemptHistoryItem,
  DraftAnswer,
  DraftQuestion,
  SubjectOption,
  TopicOption,
} from '../types/dashboard-types'

type SubjectRow = {
  subject_id: string
  subject_code: string
  subject_name: string
}

type TopicRow = {
  topic_id: string
  subject_id: string
  topic_name: string
  topic_order: number | null
}

type AnswerRow = {
  answer_id: string
  option_label: string
  content: string
  is_correct: boolean
  explanation: string | null
  display_order: number | null
}

type QuestionRow = {
  question_id: string
  topic_id: string
  content: string
  level: number
  explanation: string | null
  obsidian_source_path: string | null
  answers: AnswerRow[] | null
}

type AttemptHistoryRow = {
  attempt_id: string
  score: number | null
  correct_count: number
  wrong_count: number
  skipped_count: number
  completed_at: string | null
  status: string
  metadata: {
    subject_name?: string
    topic_name?: string
    difficulty_label?: string
  } | null
  exams:
    | {
        title: string
      }
    | {
        title: string
      }[]
    | null
}

export async function fetchSubjects(): Promise<SubjectOption[]> {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from('subjects')
    .select('subject_id, subject_code, subject_name')
    .eq('is_active', true)
    .order('subject_name', { ascending: true })
    .returns<SubjectRow[]>()

  if (error) {
    throw new Error(`Khong the tai danh sach mon hoc: ${error.message}`)
  }

  return data.map((subject) => ({
    subjectId: subject.subject_id,
    subjectCode: subject.subject_code,
    subjectName: subject.subject_name,
  }))
}

export async function fetchTopicsBySubjectId(subjectId: string): Promise<TopicOption[]> {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from('topics')
    .select('topic_id, subject_id, topic_name, topic_order')
    .eq('subject_id', subjectId)
    .eq('is_active', true)
    .order('topic_order', { ascending: true })
    .order('topic_name', { ascending: true })
    .returns<TopicRow[]>()

  if (error) {
    throw new Error(`Khong the tai danh sach chuyen de: ${error.message}`)
  }

  return data.map((topic) => ({
    topicId: topic.topic_id,
    subjectId: topic.subject_id,
    topicName: topic.topic_name,
    topicOrder: topic.topic_order ?? 0,
  }))
}

export async function fetchQuestionsForCustomExam(
  topicId: string,
  level: number,
): Promise<DraftQuestion[]> {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from('questions')
    .select(
      'question_id, topic_id, content, level, explanation, obsidian_source_path, answers(answer_id, option_label, content, is_correct, explanation, display_order)',
    )
    .eq('topic_id', topicId)
    .eq('level', level)
    .eq('is_active', true)
    .returns<QuestionRow[]>()

  if (error) {
    throw new Error(`Khong the tai cau hoi cho de tu chon: ${error.message}`)
  }

  return data.map((question) => ({
    questionId: question.question_id,
    topicId: question.topic_id,
    content: question.content,
    level: question.level,
    explanation: question.explanation,
    obsidianSourcePath: question.obsidian_source_path,
    answers: normalizeAnswers(question.answers),
  }))
}

export async function fetchAttemptHistory(userId: string): Promise<AttemptHistoryItem[]> {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from('student_attempts')
    .select('attempt_id, score, correct_count, wrong_count, skipped_count, completed_at, status, metadata, exams(title)')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false, nullsFirst: false })
    .returns<AttemptHistoryRow[]>()

  if (error) {
    throw new Error(`Khong the tai lich su lam bai: ${error.message}`)
  }

  return data.map((attempt) => ({
    attemptId: attempt.attempt_id,
    examTitle: unwrapSingle(attempt.exams)?.title ?? 'Custom Exam',
    subjectName: attempt.metadata?.subject_name ?? '--',
    topicName: attempt.metadata?.topic_name ?? '--',
    difficultyLabel: attempt.metadata?.difficulty_label ?? '--',
    score: attempt.score === null ? null : Math.round(attempt.score * 100) / 100,
    correctCount: attempt.correct_count,
    wrongCount: attempt.wrong_count,
    skippedCount: attempt.skipped_count,
    completedAt: attempt.completed_at,
    status: attempt.status,
  }))
}

function normalizeAnswers(rows: AnswerRow[] | null): DraftAnswer[] {
  if (!rows) {
    return []
  }

  return [...rows]
    .sort((left, right) => (left.display_order ?? 0) - (right.display_order ?? 0))
    .map((answer) => ({
      answerId: answer.answer_id,
      optionLabel: answer.option_label,
      content: answer.content,
      isCorrect: answer.is_correct,
      explanation: answer.explanation,
      displayOrder: answer.display_order ?? 0,
    }))
}

function unwrapSingle<T>(value: T | T[] | null | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? null
  }

  return value ?? null
}
