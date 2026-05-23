import { getSupabaseBrowserClient } from '../../../lib/supabase/client'
import {
  buildSubmissionSummary,
  findCorrectAnswerId,
  type ExamRuntimeSession,
  type ExamSubmissionSummary,
} from '../core/exam-session'
import type { ExamDraftSession } from '../store/exam-draft-store'
import type { DraftQuestion } from '../../dashboard/types/dashboard-types'

type PersistAttemptInput = {
  userId: string
  session: ExamDraftSession
  runtime: ExamRuntimeSession
}

type SyncProgressInput = {
  userId: string
  session: ExamDraftSession
  runtime: ExamRuntimeSession
}

type StudentAttemptInsertRow = {
  user_id: string
  exam_id: string
  score: number | null
  correct_count: number
  wrong_count: number
  skipped_count: number
  total_time_taken_seconds: number
  status: 'completed' | 'in_progress'
  started_at: string
  completed_at: string | null
  ai_feedback: string | null
  metadata: Record<string, unknown>
}

type CreatedExamRow = {
  exam_id: string
  title: string
}

type CreatedAttemptRow = {
  attempt_id: string
}

type CloudSyncResult = {
  examId: string
  attemptId: string
  chatSessionId: string | null
  syncedChatMessageCount: number
}

type InProgressAttemptRow = {
  attempt_id: string
  exam_id: string
  started_at: string
  metadata: {
    local_session_id?: string
    subject_id?: string
    subject_name?: string
    topic_id?: string
    topic_name?: string
    difficulty_level?: number
    difficulty_label?: string
    current_index?: number
    duration_minutes?: number
    started_at_ms?: number
  } | null
  exams:
    | {
        title: string
        duration_minutes: number
        exam_questions:
          | {
              question_order: number
              question:
                | {
                    question_id: string
                    topic_id: string
                    content: string
                    level: number
                    explanation: string | null
                    obsidian_source_path: string | null
                    answers:
                      | {
                          answer_id: string
                          option_label: string
                          content: string
                          is_correct: boolean
                          explanation: string | null
                          display_order: number | null
                        }[]
                      | null
                  }
                | {
                    question_id: string
                    topic_id: string
                    content: string
                    level: number
                    explanation: string | null
                    obsidian_source_path: string | null
                    answers:
                      | {
                          answer_id: string
                          option_label: string
                          content: string
                          is_correct: boolean
                          explanation: string | null
                          display_order: number | null
                        }[]
                      | null
                  }[]
                | null
            }[]
          | null
      }
    | {
        title: string
        duration_minutes: number
        exam_questions:
          | {
              question_order: number
              question:
                | {
                    question_id: string
                    topic_id: string
                    content: string
                    level: number
                    explanation: string | null
                    obsidian_source_path: string | null
                    answers:
                      | {
                          answer_id: string
                          option_label: string
                          content: string
                          is_correct: boolean
                          explanation: string | null
                          display_order: number | null
                        }[]
                      | null
                  }
                | {
                    question_id: string
                    topic_id: string
                    content: string
                    level: number
                    explanation: string | null
                    obsidian_source_path: string | null
                    answers:
                      | {
                          answer_id: string
                          option_label: string
                          content: string
                          is_correct: boolean
                          explanation: string | null
                          display_order: number | null
                        }[]
                      | null
                  }[]
                | null
            }[]
          | null
      }[]
    | null
  attempt_answers:
    | {
        question_id: string
        selected_answer_id: string | null
        metadata: {
          ai_explanation?: string | null
          is_locked?: boolean
        } | null
      }[]
    | null
}

type ChatSessionRow = {
  session_id: string
}

type ChatMessageInsertRow = {
  session_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  related_question_id: string | null
  metadata: {
    local_message_id: string
    created_at_ms: number
  }
}

export type InProgressAttemptListItem = {
  attemptId: string
  examTitle: string
  topicName: string
  difficultyLabel: string
  progressCount: number
  totalQuestions: number
  updatedAt: string
}

export type RestoredCloudAttempt = {
  session: ExamDraftSession
  runtime: ExamRuntimeSession
}

export async function persistCompletedAttempt({
  userId,
  session,
  runtime,
}: PersistAttemptInput): Promise<string> {
  const supabase = getSupabaseBrowserClient()
  const summary = buildSubmissionSummary(session, runtime)
  const completedAtIso = new Date(runtime.submittedAt ?? Date.now()).toISOString()
  const startedAtIso = new Date(runtime.startedAt).toISOString()
  const cloudSync = await ensureCloudAttempt({
    userId,
    session,
    runtime,
  })

  const aiFeedback = buildAttemptAiFeedback(summary)
  const { data: createdAttempt, error: attemptError } = await supabase
    .from('student_attempts')
    .update(buildAttemptInsertRow({
      createdExamId: cloudSync.examId,
      completedAtIso,
      session,
      startedAtIso,
      summary,
      userId,
      aiFeedback,
    }))
    .eq('attempt_id', cloudSync.attemptId)
    .select('attempt_id')
    .single<CreatedAttemptRow>()

  if (attemptError || !createdAttempt) {
    throw new Error(`Khong the luu ket qua bai lam: ${attemptError?.message ?? 'Unknown error'}`)
  }

  const attemptAnswerRows = session.questions.map((question) => {
    const selectedAnswerId = runtime.selectedAnswerIdsByQuestionId[question.questionId] ?? null
    const correctAnswerId = findCorrectAnswerId(question)

    return {
      attempt_id: cloudSync.attemptId,
      question_id: question.questionId,
      selected_answer_id: selectedAnswerId,
      is_correct: selectedAnswerId ? selectedAnswerId === correctAnswerId : false,
      answered_at: completedAtIso,
      metadata: {
        ai_explanation: runtime.aiExplanationsByQuestionId[question.questionId] ?? null,
        question_content: question.content,
        is_locked: Boolean(runtime.lockedQuestionIds[question.questionId]),
      },
    }
  })

  const { error: attemptAnswersError } = await supabase
    .from('attempt_answers')
    .insert(attemptAnswerRows)

  if (attemptAnswersError) {
    throw new Error(`Khong the luu chi tiet dap an tung cau: ${attemptAnswersError.message}`)
  }

  return createdAttempt.attempt_id
}

export async function syncInProgressAttempt({
  userId,
  session,
  runtime,
}: SyncProgressInput): Promise<CloudSyncResult> {
  const supabase = getSupabaseBrowserClient()
  const cloudSync = await ensureCloudAttempt({
    userId,
    session,
    runtime,
  })
  const progressSummary = buildSubmissionSummary(session, runtime)

  const { error: attemptUpdateError } = await supabase
    .from('student_attempts')
    .update({
      score: null,
      correct_count: progressSummary.correctCount,
      wrong_count: progressSummary.wrongCount,
      skipped_count: progressSummary.skippedCount,
      total_time_taken_seconds: progressSummary.timeTakenSeconds,
      status: 'in_progress',
      completed_at: null,
      ai_feedback: null,
      metadata: {
        source: 'web-app',
        local_session_id: session.sessionId,
        topic_id: session.topicId,
        topic_name: session.topicName,
        subject_id: session.subjectId,
        subject_name: session.subjectName,
        difficulty_level: session.difficultyLevel,
        difficulty_label: session.difficultyLabel,
        total_questions: session.questions.length,
        duration_minutes: session.durationMinutes,
        current_index: runtime.currentIndex,
        started_at_ms: runtime.startedAt,
      },
    })
    .eq('attempt_id', cloudSync.attemptId)

  if (attemptUpdateError) {
    throw new Error(`Khong the dong bo tien do bai lam: ${attemptUpdateError.message}`)
  }

  const attemptAnswerRows = session.questions.map((question) => {
    const selectedAnswerId = runtime.selectedAnswerIdsByQuestionId[question.questionId] ?? null
    const correctAnswerId = findCorrectAnswerId(question)

    return {
      attempt_id: cloudSync.attemptId,
      question_id: question.questionId,
      selected_answer_id: selectedAnswerId,
      is_correct: selectedAnswerId ? selectedAnswerId === correctAnswerId : null,
      answered_at: new Date().toISOString(),
      metadata: {
        ai_explanation: runtime.aiExplanationsByQuestionId[question.questionId] ?? null,
        question_content: question.content,
        is_locked: Boolean(runtime.lockedQuestionIds[question.questionId]),
      },
    }
  })

  const { error: answerSyncError } = await supabase
    .from('attempt_answers')
    .upsert(attemptAnswerRows, { onConflict: 'attempt_id,question_id' })

  if (answerSyncError) {
    throw new Error(`Khong the dong bo dap an dang lam: ${answerSyncError.message}`)
  }

  return cloudSync
}

export async function fetchInProgressAttempts(userId: string): Promise<InProgressAttemptListItem[]> {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from('student_attempts')
    .select('attempt_id, started_at, metadata, exams(title, total_questions), attempt_answers(selected_answer_id)')
    .eq('user_id', userId)
    .eq('status', 'in_progress')
    .order('updated_at', { ascending: false })
    .returns<
      {
        attempt_id: string
        started_at: string
        metadata: {
          topic_name?: string
          difficulty_label?: string
        } | null
        exams:
          | {
              title: string
              total_questions: number
            }
          | {
              title: string
              total_questions: number
            }[]
          | null
        attempt_answers:
          | {
              selected_answer_id: string | null
            }[]
          | null
      }[]
    >()

  if (error) {
    throw new Error(`Khong the tai bai dang lam tren cloud: ${error.message}`)
  }

  return data.map((attempt) => {
    const exam = unwrapSingle(attempt.exams)
    const answeredCount = (attempt.attempt_answers ?? []).filter((item) => item.selected_answer_id).length

    return {
      attemptId: attempt.attempt_id,
      examTitle: exam?.title ?? 'Cloud Attempt',
      topicName: attempt.metadata?.topic_name ?? '--',
      difficultyLabel: attempt.metadata?.difficulty_label ?? '--',
      progressCount: answeredCount,
      totalQuestions: exam?.total_questions ?? 0,
      updatedAt: attempt.started_at,
    }
  })
}

export async function restoreInProgressAttempt(attemptId: string): Promise<RestoredCloudAttempt | null> {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from('student_attempts')
    .select(
      'attempt_id, exam_id, started_at, metadata, exams(title, duration_minutes, exam_questions(question_order, question:questions(question_id, topic_id, content, level, explanation, obsidian_source_path, answers(answer_id, option_label, content, is_correct, explanation, display_order)))), attempt_answers(question_id, selected_answer_id, metadata)',
    )
    .eq('attempt_id', attemptId)
    .eq('status', 'in_progress')
    .maybeSingle<InProgressAttemptRow>()

  if (error) {
    throw new Error(`Khong the khoi phuc bai dang lam tren cloud: ${error.message}`)
  }

  if (!data) {
    return null
  }

  const exam = unwrapSingle(data.exams)
  const sessionId = data.metadata?.local_session_id ?? `cloud-${data.attempt_id}`
  const examQuestions = (exam?.exam_questions ?? [])
    .slice()
    .sort((left, right) => left.question_order - right.question_order)
  const questions = examQuestions
    .map((item) => normalizeQuestion(unwrapSingle(item.question)))
    .filter((value): value is DraftQuestion => Boolean(value))

  const selectedAnswerIdsByQuestionId: Record<string, string> = {}
  const lockedQuestionIds: Record<string, true> = {}
  const aiExplanationsByQuestionId: Record<string, string> = {}

  for (const answerRow of data.attempt_answers ?? []) {
    if (answerRow.selected_answer_id) {
      selectedAnswerIdsByQuestionId[answerRow.question_id] = answerRow.selected_answer_id
    }
    if (answerRow.metadata?.is_locked) {
      lockedQuestionIds[answerRow.question_id] = true
    }
    if (answerRow.metadata?.ai_explanation?.trim()) {
      aiExplanationsByQuestionId[answerRow.question_id] = answerRow.metadata.ai_explanation
    }
  }

  const session: ExamDraftSession = {
    sessionId,
    title: exam?.title ?? 'Cloud Resume Exam',
    subjectId: data.metadata?.subject_id ?? '',
    subjectName: data.metadata?.subject_name ?? '--',
    topicId: data.metadata?.topic_id ?? '',
    topicName: data.metadata?.topic_name ?? '--',
    difficultyLevel: Number(data.metadata?.difficulty_level ?? 1),
    difficultyLabel: data.metadata?.difficulty_label ?? '--',
    durationMinutes: data.metadata?.duration_minutes ?? exam?.duration_minutes ?? 45,
    questions,
    createdAt: new Date(data.started_at).getTime(),
  }

  const runtime: ExamRuntimeSession = {
    sessionId,
    currentIndex: Math.max(0, Number(data.metadata?.current_index ?? 0)),
    selectedAnswerIdsByQuestionId,
    lockedQuestionIds,
    chatHistory: [],
    aiExplanationsByQuestionId,
    startedAt: Number(data.metadata?.started_at_ms ?? new Date(data.started_at).getTime()),
    submittedAt: null,
    persistedExamId: data.exam_id,
    persistedAttemptId: data.attempt_id,
    persistedChatSessionId: null,
    syncedChatMessageCount: 0,
    lastSyncedAt: Date.now(),
    lastCheckedResult: null,
  }

  const restoredChat = await fetchAttemptChatMessages(data.attempt_id)
  runtime.chatHistory = restoredChat.chatHistory
  runtime.persistedChatSessionId = restoredChat.chatSessionId
  runtime.syncedChatMessageCount = restoredChat.chatHistory.length

  return { session, runtime }
}

function buildAttemptInsertRow(input: {
  userId: string
  createdExamId: string
  summary: ExamSubmissionSummary
  session: ExamDraftSession
  startedAtIso: string
  completedAtIso: string
  aiFeedback: string | null
}): StudentAttemptInsertRow {
  const { userId, createdExamId, summary, session, startedAtIso, completedAtIso, aiFeedback } = input

  return {
    user_id: userId,
    exam_id: createdExamId,
    score: summary.score,
    correct_count: summary.correctCount,
    wrong_count: summary.wrongCount,
    skipped_count: summary.skippedCount,
    total_time_taken_seconds: summary.timeTakenSeconds,
    status: 'completed',
    started_at: startedAtIso,
    completed_at: completedAtIso,
    ai_feedback: aiFeedback,
    metadata: {
      source: 'web-app',
      local_session_id: session.sessionId,
      topic_id: session.topicId,
      topic_name: session.topicName,
      subject_name: session.subjectName,
      difficulty_level: session.difficultyLevel,
      difficulty_label: session.difficultyLabel,
      total_questions: summary.totalQuestions,
    },
  }
}

function buildAttemptAiFeedback(summary: ExamSubmissionSummary) {
  const interestingExplanations = summary.reviewItems
    .filter((item) => !item.correct && item.explanation?.trim())
    .slice(0, 3)
    .map((item) => item.explanation?.trim())
    .filter((value): value is string => Boolean(value))

  if (interestingExplanations.length === 0) {
    return null
  }

  return interestingExplanations.join('\n\n-----\n\n')
}

async function ensureCloudAttempt(input: {
  userId: string
  session: ExamDraftSession
  runtime: ExamRuntimeSession
}): Promise<CloudSyncResult> {
  const supabase = getSupabaseBrowserClient()
  const existingExamId = input.runtime.persistedExamId
  const existingAttemptId = input.runtime.persistedAttemptId

  let examId = existingExamId
  if (!examId) {
    const { data: createdExam, error: examError } = await supabase
      .from('exams')
      .insert({
        title: input.session.title,
        description: `Custom web practice session for ${input.session.topicName}`,
        subject_id: input.session.subjectId,
        exam_type: 'custom',
        duration_minutes: input.session.durationMinutes,
        total_questions: input.session.questions.length,
        pass_score: 5,
        shuffle_answers: true,
        shuffle_questions: true,
        is_public: false,
        created_by: input.userId,
        metadata: {
          source: 'web-app',
          local_session_id: input.session.sessionId,
          topic_id: input.session.topicId,
          topic_name: input.session.topicName,
          subject_id: input.session.subjectId,
          subject_name: input.session.subjectName,
          difficulty_level: input.session.difficultyLevel,
          difficulty_label: input.session.difficultyLabel,
        },
      })
      .select('exam_id, title')
      .single<CreatedExamRow>()

    if (examError || !createdExam) {
      throw new Error(`Khong the tao exam record tren Supabase: ${examError?.message ?? 'Unknown error'}`)
    }

    examId = createdExam.exam_id

    const examQuestionRows = input.session.questions.map((question, index) => ({
      exam_id: examId,
      question_id: question.questionId,
      question_order: index + 1,
      point_weight: 1,
    }))

    const { error: examQuestionsError } = await supabase.from('exam_questions').insert(examQuestionRows)
    if (examQuestionsError) {
      throw new Error(`Khong the luu exam questions: ${examQuestionsError.message}`)
    }
  }

  let attemptId = existingAttemptId
  if (!attemptId) {
    const { data: createdAttempt, error: attemptError } = await supabase
      .from('student_attempts')
      .insert({
        user_id: input.userId,
        exam_id: examId,
        score: null,
        correct_count: 0,
        wrong_count: 0,
        skipped_count: input.session.questions.length,
        total_time_taken_seconds: 0,
        status: 'in_progress',
        started_at: new Date(input.runtime.startedAt).toISOString(),
        completed_at: null,
        ai_feedback: null,
        metadata: {
          source: 'web-app',
          local_session_id: input.session.sessionId,
          topic_id: input.session.topicId,
          topic_name: input.session.topicName,
          subject_id: input.session.subjectId,
          subject_name: input.session.subjectName,
          difficulty_level: input.session.difficultyLevel,
          difficulty_label: input.session.difficultyLabel,
          total_questions: input.session.questions.length,
          duration_minutes: input.session.durationMinutes,
          current_index: input.runtime.currentIndex,
          started_at_ms: input.runtime.startedAt,
        },
      })
      .select('attempt_id')
      .single<CreatedAttemptRow>()

    if (attemptError || !createdAttempt) {
      throw new Error(`Khong the tao attempt dang lam tren Supabase: ${attemptError?.message ?? 'Unknown error'}`)
    }

    attemptId = createdAttempt.attempt_id
  }

  const chatSync = await ensureCloudChatSessionAndMessages({
    attemptId,
    examId,
    runtime: input.runtime,
    userId: input.userId,
  })

  return {
    examId,
    attemptId,
    chatSessionId: chatSync.chatSessionId,
    syncedChatMessageCount: chatSync.syncedChatMessageCount,
  }
}

async function ensureCloudChatSessionAndMessages(input: {
  userId: string
  examId: string
  attemptId: string
  runtime: ExamRuntimeSession
}): Promise<{ chatSessionId: string | null; syncedChatMessageCount: number }> {
  const supabase = getSupabaseBrowserClient()

  if (input.runtime.chatHistory.length === 0) {
    return {
      chatSessionId: input.runtime.persistedChatSessionId,
      syncedChatMessageCount: input.runtime.syncedChatMessageCount,
    }
  }

  let chatSessionId = input.runtime.persistedChatSessionId

  if (!chatSessionId) {
    const { data: existingChatSession, error: existingChatSessionError } = await supabase
      .from('chat_sessions')
      .select('session_id')
      .eq('related_attempt_id', input.attemptId)
      .maybeSingle<ChatSessionRow>()

    if (existingChatSessionError) {
      throw new Error(`Khong the doc cloud chat session: ${existingChatSessionError.message}`)
    }

    chatSessionId = existingChatSession?.session_id ?? null
  }

  if (!chatSessionId) {
    const { data: createdChatSession, error: createdChatSessionError } = await supabase
      .from('chat_sessions')
      .insert({
        user_id: input.userId,
        title: 'AI gia su trong bai lam',
        context_summary: 'Chat history for in-progress exam attempt',
        related_exam_id: input.examId,
        related_attempt_id: input.attemptId,
        total_messages: input.runtime.chatHistory.length,
        status: 'active',
        last_message_at: new Date().toISOString(),
      })
      .select('session_id')
      .single<ChatSessionRow>()

    if (createdChatSessionError || !createdChatSession) {
      throw new Error(
        `Khong the tao cloud chat session: ${createdChatSessionError?.message ?? 'Unknown error'}`,
      )
    }

    chatSessionId = createdChatSession.session_id
  }

  const pendingMessages = input.runtime.chatHistory.slice(input.runtime.syncedChatMessageCount)
  if (pendingMessages.length > 0) {
    const rows: ChatMessageInsertRow[] = pendingMessages.map((message) => ({
      session_id: chatSessionId,
      role: message.role === 'ai' ? 'assistant' : message.role,
      content: message.content,
      related_question_id: message.questionId ?? null,
      metadata: {
        local_message_id: message.id,
        created_at_ms: message.createdAt,
      },
    }))

    const { error: insertChatMessagesError } = await supabase.from('chat_messages').insert(rows)
    if (insertChatMessagesError) {
      throw new Error(`Khong the dong bo cloud chat messages: ${insertChatMessagesError.message}`)
    }
  }

  const { error: updateChatSessionError } = await supabase
    .from('chat_sessions')
    .update({
      total_messages: input.runtime.chatHistory.length,
      last_message_at: new Date().toISOString(),
    })
    .eq('session_id', chatSessionId)

  if (updateChatSessionError) {
    throw new Error(`Khong the cap nhat cloud chat session: ${updateChatSessionError.message}`)
  }

  return {
    chatSessionId,
    syncedChatMessageCount: input.runtime.chatHistory.length,
  }
}

async function fetchAttemptChatMessages(attemptId: string) {
  const supabase = getSupabaseBrowserClient()
  const { data: chatSession, error: chatSessionError } = await supabase
    .from('chat_sessions')
    .select('session_id')
    .eq('related_attempt_id', attemptId)
    .maybeSingle<ChatSessionRow>()

  if (chatSessionError) {
    throw new Error(`Khong the tai chat session cua attempt: ${chatSessionError.message}`)
  }

  if (!chatSession) {
    return {
      chatSessionId: null,
      chatHistory: [],
    }
  }

  const { data: chatMessages, error: chatMessagesError } = await supabase
    .from('chat_messages')
    .select('message_id, role, content, related_question_id, metadata, created_at')
    .eq('session_id', chatSession.session_id)
    .order('created_at', { ascending: true })
    .returns<
      {
        message_id: string
        role: 'user' | 'assistant' | 'system'
        content: string
        related_question_id: string | null
        metadata: {
          local_message_id?: string
          created_at_ms?: number
        } | null
        created_at: string
      }[]
    >()

  if (chatMessagesError) {
    throw new Error(`Khong the tai chat messages cua attempt: ${chatMessagesError.message}`)
  }

  const chatHistory = chatMessages.map((message) => {
    const role: 'user' | 'ai' | 'system' =
      message.role === 'assistant'
        ? 'ai'
        : message.role === 'system'
          ? 'system'
          : 'user'

    return {
      id: message.metadata?.local_message_id ?? message.message_id,
      role,
      content: message.content,
      questionId: message.related_question_id ?? undefined,
      createdAt:
        message.metadata?.created_at_ms ?? new Date(message.created_at).getTime(),
    }
  })

  return {
    chatSessionId: chatSession.session_id,
    chatHistory,
  }
}

function normalizeQuestion(
  row:
    | {
        question_id: string
        topic_id: string
        content: string
        level: number
        explanation: string | null
        obsidian_source_path: string | null
        answers:
          | {
              answer_id: string
              option_label: string
              content: string
              is_correct: boolean
              explanation: string | null
              display_order: number | null
            }[]
          | null
      }
    | null,
): DraftQuestion | null {
  if (!row) {
    return null
  }

  return {
    questionId: row.question_id,
    topicId: row.topic_id,
    content: row.content,
    level: row.level,
    explanation: row.explanation,
    obsidianSourcePath: row.obsidian_source_path,
    answers: [...(row.answers ?? [])]
      .sort((left, right) => (left.display_order ?? 0) - (right.display_order ?? 0))
      .map((answer) => ({
        answerId: answer.answer_id,
        optionLabel: answer.option_label,
        content: answer.content,
        isCorrect: answer.is_correct,
        explanation: answer.explanation,
        displayOrder: answer.display_order ?? 0,
      })),
  }
}

function unwrapSingle<T>(value: T | T[] | null | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? null
  }

  return value ?? null
}
