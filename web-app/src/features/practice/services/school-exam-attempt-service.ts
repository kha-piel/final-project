import { getSupabaseBrowserClient } from '../../../lib/supabase/client'
import {
  formatSchoolExamDisplaySchoolName,
  formatSchoolExamDisplayTitle,
} from '../utils/school-exam-display'
import type { SchoolExamSectionPart } from '../types/school-exam-types'

export type SchoolExamAttemptAnswerInput = {
  questionNumber: number
  questionType: SchoolExamSectionPart
  selectedAnswer: string
  correctAnswer: string
  isCorrect: boolean
  questionContent: string
  topic: string
  metadata?: Record<string, unknown>
}

export type SchoolExamAiMessageInput = {
  questionNumber?: number | null
  role: 'user' | 'assistant' | 'system'
  content: string
  metadata?: Record<string, unknown>
}

export type PersistSchoolExamAttemptInput = {
  userId: string
  schoolExamId: string
  variantCode: string | null
  score: number
  correctCount: number
  wrongCount: number
  skippedCount: number
  totalCount: number
  startedAt: number
  completedAt: number
  answers: SchoolExamAttemptAnswerInput[]
  aiMessages: SchoolExamAiMessageInput[]
  metadata: Record<string, unknown>
}

export type SchoolExamAttemptHistoryItem = {
  attemptId: string
  schoolExamId: string
  examTitle: string
  schoolName: string
  subjectName: string
  year: number | null
  variantCode: string
  score: number | null
  correctCount: number
  wrongCount: number
  skippedCount: number
  totalCount: number
  completedAt: string
}

export type SchoolExamAttemptDetail = SchoolExamAttemptHistoryItem & {
  answers: Array<{
    questionNumber: number
    questionType: string
    selectedAnswer: string
    correctAnswer: string
    isCorrect: boolean
    questionContent: string
    topic: string
  }>
  aiMessages: SchoolExamAiHistoryMessage[]
}

export type SchoolExamAiHistoryMessage = {
  messageId: string
  attemptId: string
  examTitle: string
  schoolName: string
  questionNumber: number | null
  role: 'user' | 'assistant' | 'system'
  content: string
  createdAt: string
}

type CreatedAttemptRow = {
  attempt_id: string
}

type SchoolExamAttemptRow = {
  attempt_id: string
  school_exam_id: string
  variant_code: string | null
  score: number | null
  correct_count: number
  wrong_count: number
  skipped_count: number
  total_count: number
  completed_at: string
  school_exams:
    | {
        title: string
        school_name: string
        subject_name: string
        year: number | null
      }
    | {
        title: string
        school_name: string
        subject_name: string
        year: number | null
      }[]
    | null
}

type SchoolExamAttemptDetailRow = SchoolExamAttemptRow & {
  student_school_exam_answers:
    | {
        question_number: number
        question_type: string
        selected_answer: string | null
        correct_answer: string | null
        is_correct: boolean
        question_content: string | null
        topic: string | null
      }[]
    | null
  student_school_exam_ai_messages:
    | {
        message_id: string
        question_number: number | null
        role: 'user' | 'assistant' | 'system'
        content: string
        created_at: string
      }[]
    | null
}

type SchoolExamAiMessageRow = {
  message_id: string
  attempt_id: string
  question_number: number | null
  role: 'user' | 'assistant' | 'system'
  content: string
  created_at: string
  student_school_exam_attempts:
    | {
        school_exams:
          | {
              title: string
              school_name: string
            }
          | {
              title: string
              school_name: string
            }[]
          | null
      }
    | {
        school_exams:
          | {
              title: string
              school_name: string
            }
          | {
              title: string
              school_name: string
            }[]
          | null
      }[]
    | null
}

export async function persistCompletedSchoolExamAttempt(input: PersistSchoolExamAttemptInput) {
  const supabase = getSupabaseBrowserClient()
  const completedAtIso = new Date(input.completedAt).toISOString()

  const { data: createdAttempt, error: attemptError } = await supabase
    .from('student_school_exam_attempts')
    .insert({
      user_id: input.userId,
      school_exam_id: input.schoolExamId,
      variant_code: input.variantCode,
      score: input.score,
      correct_count: input.correctCount,
      wrong_count: input.wrongCount,
      skipped_count: input.skippedCount,
      total_count: input.totalCount,
      started_at: new Date(input.startedAt).toISOString(),
      completed_at: completedAtIso,
      metadata: input.metadata,
    })
    .select('attempt_id')
    .single<CreatedAttemptRow>()

  if (attemptError || !createdAttempt) {
    throw new Error(formatStudentLearningHistoryError(attemptError?.message, 'luu lich su de thi truong'))
  }

  if (input.answers.length > 0) {
    const { error: answersError } = await supabase.from('student_school_exam_answers').insert(
      input.answers.map((answer) => ({
        attempt_id: createdAttempt.attempt_id,
        question_number: answer.questionNumber,
        question_type: answer.questionType,
        selected_answer: answer.selectedAnswer,
        correct_answer: answer.correctAnswer,
        is_correct: answer.isCorrect,
        question_content: answer.questionContent,
        topic: answer.topic,
        metadata: answer.metadata ?? {},
      })),
    )

    if (answersError) {
      throw new Error(formatStudentLearningHistoryError(answersError.message, 'luu chi tiet dap an de truong'))
    }
  }

  if (input.aiMessages.length > 0) {
    await saveSchoolExamAiMessages(createdAttempt.attempt_id, input.aiMessages)
  }

  return createdAttempt.attempt_id
}

export async function saveSchoolExamAiMessages(
  attemptId: string,
  messages: SchoolExamAiMessageInput[],
) {
  if (messages.length === 0) {
    return
  }

  const supabase = getSupabaseBrowserClient()
  const { error } = await supabase.from('student_school_exam_ai_messages').insert(
    messages
      .filter((message) => message.content.trim())
      .map((message) => ({
        attempt_id: attemptId,
        question_number: message.questionNumber ?? null,
        role: message.role,
        content: message.content,
        metadata: message.metadata ?? {},
      })),
  )

  if (error) {
    throw new Error(formatStudentLearningHistoryError(error.message, 'luu lich su AI de truong'))
  }
}

export async function fetchSchoolExamAttemptHistory(
  userId: string,
): Promise<SchoolExamAttemptHistoryItem[]> {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from('student_school_exam_attempts')
    .select('attempt_id, school_exam_id, variant_code, score, correct_count, wrong_count, skipped_count, total_count, completed_at, school_exams(title, school_name, subject_name, year)')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false })
    .returns<SchoolExamAttemptRow[]>()

  if (error) {
    throw new Error(formatStudentLearningHistoryError(error.message, 'tai lich su de thi truong'))
  }

  return data.map(mapAttemptHistoryRow)
}

export async function fetchSchoolExamAttemptDetail(
  attemptId: string,
): Promise<SchoolExamAttemptDetail | null> {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from('student_school_exam_attempts')
    .select('attempt_id, school_exam_id, variant_code, score, correct_count, wrong_count, skipped_count, total_count, completed_at, school_exams(title, school_name, subject_name, year), student_school_exam_answers(question_number, question_type, selected_answer, correct_answer, is_correct, question_content, topic), student_school_exam_ai_messages(message_id, question_number, role, content, created_at)')
    .eq('attempt_id', attemptId)
    .maybeSingle<SchoolExamAttemptDetailRow>()

  if (error) {
    throw new Error(formatStudentLearningHistoryError(error.message, 'tai chi tiet de thi truong'))
  }

  if (!data) {
    return null
  }

  const base = mapAttemptHistoryRow(data)
  return {
    ...base,
    answers: [...(data.student_school_exam_answers ?? [])]
      .sort((left, right) => left.question_number - right.question_number)
      .map((answer) => ({
        questionNumber: answer.question_number,
        questionType: answer.question_type,
        selectedAnswer: answer.selected_answer ?? '',
        correctAnswer: answer.correct_answer ?? '',
        isCorrect: answer.is_correct,
        questionContent: answer.question_content ?? '',
        topic: answer.topic ?? '',
      })),
    aiMessages: [...(data.student_school_exam_ai_messages ?? [])]
      .sort((left, right) => new Date(left.created_at).getTime() - new Date(right.created_at).getTime())
      .map((message) => ({
        messageId: message.message_id,
        attemptId: data.attempt_id,
        examTitle: base.examTitle,
        schoolName: base.schoolName,
        questionNumber: message.question_number,
        role: message.role,
        content: message.content,
        createdAt: message.created_at,
      })),
  }
}

export async function fetchSchoolExamAiHistory(
  userId: string,
): Promise<SchoolExamAiHistoryMessage[]> {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from('student_school_exam_ai_messages')
    .select('message_id, attempt_id, question_number, role, content, created_at, student_school_exam_attempts!inner(user_id, school_exams(title, school_name))')
    .eq('student_school_exam_attempts.user_id', userId)
    .order('created_at', { ascending: false })
    .returns<SchoolExamAiMessageRow[]>()

  if (error) {
    throw new Error(formatStudentLearningHistoryError(error.message, 'tai lich su AI de truong'))
  }

  return data.map((message) => {
    const attempt = unwrapSingle(message.student_school_exam_attempts)
    const exam = unwrapSingle(attempt?.school_exams)
    return {
      messageId: message.message_id,
      attemptId: message.attempt_id,
      examTitle: exam
        ? formatSchoolExamDisplayTitle({
            examId: '',
            title: exam.title,
            schoolName: exam.school_name,
          })
        : 'De thi truong',
      schoolName: exam ? formatSchoolExamDisplaySchoolName('', exam.school_name) : '--',
      questionNumber: message.question_number,
      role: message.role,
      content: message.content,
      createdAt: message.created_at,
    }
  })
}

function mapAttemptHistoryRow(row: SchoolExamAttemptRow): SchoolExamAttemptHistoryItem {
  const exam = unwrapSingle(row.school_exams)
  return {
    attemptId: row.attempt_id,
    schoolExamId: row.school_exam_id,
    examTitle: exam
      ? formatSchoolExamDisplayTitle({
          examId: row.school_exam_id,
          title: exam.title,
          schoolName: exam.school_name,
        })
      : 'De thi truong',
    schoolName: exam ? formatSchoolExamDisplaySchoolName(row.school_exam_id, exam.school_name) : '--',
    subjectName: exam?.subject_name ?? '--',
    year: exam?.year ?? null,
    variantCode: row.variant_code ?? '--',
    score: row.score === null ? null : Math.round(Number(row.score) * 100) / 100,
    correctCount: row.correct_count,
    wrongCount: row.wrong_count,
    skippedCount: row.skipped_count,
    totalCount: row.total_count,
    completedAt: row.completed_at,
  }
}

function unwrapSingle<T>(value: T | T[] | null | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? null
  }

  return value ?? null
}

function formatStudentLearningHistoryError(rawMessage: string | undefined, action: string) {
  const message = rawMessage?.trim() || 'Unknown error'

  if (
    message.includes('student_school_exam_attempts')
    && (message.includes('schema cache') || message.toLowerCase().includes('could not find the table'))
  ) {
    return `Khong the ${action}: Supabase chua co bang student_school_exam_attempts. Hay chay file web-app/supabase/setup_student_learning_history.sql trong SQL Editor roi thu lai.`
  }

  if (
    (message.includes('student_school_exam_answers') || message.includes('student_school_exam_ai_messages'))
    && (message.includes('schema cache') || message.toLowerCase().includes('could not find the table'))
  ) {
    return `Khong the ${action}: Supabase chua co bang lich su hoc tap de truong. Hay chay file web-app/supabase/setup_student_learning_history.sql trong SQL Editor roi thu lai.`
  }

  return `Khong the ${action}: ${message}`
}
