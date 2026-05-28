import { getSupabaseBrowserClient } from '../../../lib/supabase/client'
import {
  fetchSchoolExamAiHistory,
  type SchoolExamAiHistoryMessage,
} from '../../practice/services/school-exam-attempt-service'

export type PracticeAiHistoryMessage = {
  messageId: string
  sessionId: string
  attemptId: string | null
  examTitle: string
  role: 'user' | 'assistant' | 'system'
  content: string
  questionId: string | null
  createdAt: string
}

export type UnifiedAiHistoryItem = {
  id: string
  source: 'practice' | 'school_exam'
  title: string
  context: string
  role: 'user' | 'assistant' | 'system'
  content: string
  createdAt: string
  attemptId: string | null
  sessionId: string | null
  questionId: string | null
  questionNumber: number | null
}

type PracticeAiMessageRow = {
  message_id: string
  session_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  related_question_id: string | null
  created_at: string
  legacy_chat_sessions:
    | {
        title: string | null
        related_attempt_id: string | null
        exams:
          | {
              title: string
            }
          | {
              title: string
            }[]
          | null
      }
    | {
        title: string | null
        related_attempt_id: string | null
        exams:
          | {
              title: string
            }
          | {
              title: string
            }[]
          | null
      }[]
    | null
}

export async function fetchPracticeAiHistory(userId: string): Promise<PracticeAiHistoryMessage[]> {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from('legacy_chat_messages')
    .select('message_id, session_id, role, content, related_question_id, created_at, legacy_chat_sessions!inner(user_id, title, related_attempt_id, legacy_exams(title))')
    .eq('legacy_chat_sessions.user_id', userId)
    .order('created_at', { ascending: false })
    .returns<PracticeAiMessageRow[]>()

  if (error) {
    throw new Error(`Khong the tai lich su AI on tap: ${error.message}`)
  }

  return data.map((message) => {
    const session = unwrapSingle(message.legacy_chat_sessions)
    const exam = unwrapSingle(session?.exams)
    return {
      messageId: message.message_id,
      sessionId: message.session_id,
      attemptId: session?.related_attempt_id ?? null,
      examTitle: exam?.title ?? session?.title ?? 'AI on tap',
      role: message.role,
      content: message.content,
      questionId: message.related_question_id,
      createdAt: message.created_at,
    }
  })
}

export async function fetchUnifiedAiHistory(userId: string): Promise<UnifiedAiHistoryItem[]> {
  const [practiceMessages, schoolExamMessages] = await Promise.all([
    fetchPracticeAiHistory(userId),
    fetchSchoolExamAiHistory(userId),
  ])

  return [
    ...practiceMessages.map((message) => ({
      id: `practice-${message.messageId}`,
      source: 'practice' as const,
      title: message.examTitle,
      context: message.questionId ? `Câu hỏi` : 'Ôn tập kiến thức',
      role: message.role,
      content: message.content,
      createdAt: message.createdAt,
      attemptId: message.attemptId,
      sessionId: message.sessionId,
      questionId: message.questionId,
      questionNumber: null,
    })),
    ...schoolExamMessages.map(mapSchoolExamAiMessage),
  ].sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
}

function mapSchoolExamAiMessage(message: SchoolExamAiHistoryMessage): UnifiedAiHistoryItem {
  return {
    id: `school-${message.messageId}`,
    source: 'school_exam',
    title: message.examTitle,
    context: message.questionNumber ? `${message.schoolName} - Câu ${message.questionNumber}` : message.schoolName,
    role: message.role,
    content: message.content,
    createdAt: message.createdAt,
    attemptId: message.attemptId,
    sessionId: null,
    questionId: null,
    questionNumber: message.questionNumber,
  }
}

function unwrapSingle<T>(value: T | T[] | null | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? null
  }

  return value ?? null
}

export async function savePracticeAiMessage(sessionId: string, questionId: string | null, role: 'user' | 'assistant' | 'system', content: string) {
  const supabase = getSupabaseBrowserClient()
  const { error } = await supabase.from('legacy_chat_messages').insert({
    session_id: sessionId,
    related_question_id: questionId,
    role,
    content,
    metadata: { local_message_id: crypto.randomUUID(), created_at_ms: Date.now() },
  })

  if (error) {
    console.error('Error saving practice ai message', error)
  }
}
