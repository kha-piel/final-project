import { getSupabaseBrowserClient } from '../../../lib/supabase/client'
import { fetchSchoolExamCatalog, fetchSchoolExamQuestionBank } from '../../practice/services/school-exam-service'
import { normalizeSchoolExamMarkdown } from '../../practice/utils/school-exam-content'
import type {
  AttemptHistoryItem,
  DraftAnswer,
  DraftQuestion,
  QuestionType,
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
  question_type: QuestionType
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

const schoolExamBankCache = new Map<string, Promise<Awaited<ReturnType<typeof fetchSchoolExamQuestionBank>>>>()

export async function fetchSubjects(): Promise<SubjectOption[]> {
  try {
    const catalog = await fetchSchoolExamCatalog()
    const schoolExamSubjects = Array.from(
      catalog.reduce((acc, item) => {
        if (!item.subjectId || !item.subjectName) {
          return acc
        }

        const key = item.subjectId.trim().toUpperCase()
        if (!acc.has(key)) {
          acc.set(key, {
            subjectId: item.subjectId,
            subjectCode: item.subjectId,
            subjectName: item.subjectName,
          })
        }
        return acc
      }, new Map<string, SubjectOption>()),
    ).map(([, value]) => value)

    if (schoolExamSubjects.length > 0) {
      return schoolExamSubjects.sort((left, right) => left.subjectName.localeCompare(right.subjectName))
    }
  } catch {
    // Fall through to legacy subjects table.
  }

  return fetchLegacySubjects()
}

export async function fetchTopicsBySubjectId(subjectId: string): Promise<TopicOption[]> {
  try {
    const questionBank = await loadSchoolExamQuestionBank(subjectId)
    const schoolExamTopics = buildTopicOptionsFromQuestionBank(questionBank, subjectId)
    if (schoolExamTopics.length > 0) {
      return schoolExamTopics
    }
  } catch {
    // Fall through to legacy topics table.
  }

  return fetchLegacyTopicsBySubjectId(subjectId)
}

export async function fetchQuestionsForCustomExam(
  subjectId: string,
  topicId: string,
  level: number,
  questionType: 'all' | QuestionType,
): Promise<DraftQuestion[]> {
  try {
    const questionBank = await loadSchoolExamQuestionBank(subjectId)
    const questions = questionBank
      .filter((question) => buildSchoolExamTopicId(question.topic) === topicId)
      .filter((question) => question.difficultyLevel === level)
      .filter((question) => questionType === 'all' || question.questionType === questionType)
      .map((question) => mapSchoolExamQuestionToDraftQuestion(question))

    if (isSchoolExamTopicId(topicId)) {
      return shuffle(questions)
    }

    if (questions.length > 0) {
      return shuffle(questions)
    }
  } catch {
    // Fall through to legacy questions table.
  }

  return fetchLegacyQuestionsForCustomExam(topicId, level, questionType)
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

async function fetchLegacySubjects(): Promise<SubjectOption[]> {
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

async function fetchLegacyTopicsBySubjectId(subjectId: string): Promise<TopicOption[]> {
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

async function fetchLegacyQuestionsForCustomExam(
  topicId: string,
  level: number,
  questionType: 'all' | QuestionType,
): Promise<DraftQuestion[]> {
  const supabase = getSupabaseBrowserClient()
  let query = supabase
    .from('questions')
    .select(
      'question_id, topic_id, content, level, question_type, explanation, obsidian_source_path, answers(answer_id, option_label, content, is_correct, explanation, display_order)',
    )
    .eq('topic_id', topicId)
    .eq('level', level)
    .eq('is_active', true)

  if (questionType !== 'all') {
    query = query.eq('question_type', questionType)
  }

  const { data, error } = await query.returns<QuestionRow[]>()

  if (error) {
    throw new Error(`Khong the tai cau hoi cho de tu chon: ${error.message}`)
  }

  return data.map((question) => ({
    questionId: question.question_id,
    topicId: question.topic_id,
    content: question.content,
    level: question.level,
    questionType: question.question_type,
    explanation: question.explanation,
    obsidianSourcePath: question.obsidian_source_path,
    answers: normalizeAnswers(question.answers),
  }))
}

async function loadSchoolExamQuestionBank(subjectId: string) {
  const cacheKey = subjectId.trim().toUpperCase()
  const cached = schoolExamBankCache.get(cacheKey)
  if (cached) {
    return cached
  }

  const nextPromise = fetchSchoolExamQuestionBank(cacheKey)
  schoolExamBankCache.set(cacheKey, nextPromise)
  return nextPromise
}

function buildTopicOptionsFromQuestionBank(
  questionBank: Awaited<ReturnType<typeof fetchSchoolExamQuestionBank>>,
  subjectId: string,
): TopicOption[] {
  const topics = questionBank.reduce((acc, question) => {
    const topicName = normalizeTopicLabel(question.topic)
    if (!topicName) {
      return acc
    }

    const topicId = buildSchoolExamTopicId(topicName)
    if (!topicId) {
      return acc
    }

    if (!acc.has(topicId)) {
      acc.set(topicId, {
        topicId,
        subjectId,
        topicName,
        topicOrder: 999,
      })
    }

    return acc
  }, new Map<string, TopicOption>())

  return Array.from(topics.values()).sort((left, right) => left.topicName.localeCompare(right.topicName))
}

function mapSchoolExamQuestionToDraftQuestion(
  question: Awaited<ReturnType<typeof fetchSchoolExamQuestionBank>>[number],
): DraftQuestion {
  return {
    questionId: question.questionId,
    topicId: buildSchoolExamTopicId(question.topic),
    content: normalizeSchoolExamMarkdown(question.questionText),
    level: question.difficultyLevel,
    questionType: question.questionType,
    explanation: null,
    obsidianSourcePath: question.obsidianSourcePath,
    answers: question.options.map((option) => ({
      answerId: `${question.questionId}-opt-${option.optionLabel.toLowerCase()}`,
      optionLabel: option.optionLabel,
      content: normalizeSchoolExamMarkdown(option.optionText),
      isCorrect:
        question.questionType === 'multiple_choice'
          ? option.optionLabel.toUpperCase() === (question.answerValue ?? '').trim().toUpperCase()
          : false,
      explanation: null,
      displayOrder: option.displayOrder,
    })),
    statements:
      question.questionType === 'true_false'
        ? question.statements.map((statement, index) => ({
            statementId: `${question.questionId}-stmt-${statement.label || index + 1}`,
            content: normalizeSchoolExamMarkdown(statement.text),
            isCorrect: resolveTrueFalseCorrectness(question.answerValue ?? '', index),
          }))
        : undefined,
    acceptedResponses:
      question.questionType === 'short_answer'
        ? splitAcceptedResponses(question.answerValue ?? '')
        : undefined,
    assetUrls: buildSchoolExamAssetUrls(question),
    sourceMeta: {
      examId: question.examId,
      schoolName: question.schoolName,
      examTitle: question.examTitle,
      year: question.year,
      sourceQuestionNumber: question.sourceQuestionNumber,
      sourceSectionNumber: question.sourceSectionNumber,
    },
  }
}

function buildSchoolExamAssetUrls(
  question: Awaited<ReturnType<typeof fetchSchoolExamQuestionBank>>[number],
) {
  if (!question.pdfUrl) {
    return []
  }

  const examSlug = question.pdfUrl.split('/').pop()?.replace(/\.pdf$/i, '') ?? ''
  const renderableAssets = question.assets && question.assets.length > 0
    ? question.assets
      .filter((asset) => asset.assetType !== 'question_block')
      .map((asset) => asset.assetPath)
    : (question.assetPaths ?? []).filter((assetPath) => /_hinh\d+\./i.test(assetPath))

  return renderableAssets.map((assetPath) => `/school-exam-assets/${examSlug}/${assetPath}`)
}

function resolveTrueFalseCorrectness(answerValue: string, index: number) {
  return answerValue.replace(/\s+/g, '').toUpperCase()[index] === 'D'
}

function splitAcceptedResponses(input: string) {
  return input
    .split('|')
    .map((item) => item.trim())
    .filter(Boolean)
}

function normalizeTopicLabel(input: string | null | undefined) {
  return input?.trim().replace(/\s+/g, ' ') ?? ''
}

function buildSchoolExamTopicId(input: string | null | undefined) {
  const normalized = normalizeTopicLabel(input)
  if (!normalized) {
    return ''
  }

  return `school-exam/${normalized
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')}`
}

function isSchoolExamTopicId(topicId: string) {
  return topicId.trim().startsWith('school-exam/')
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

function shuffle<T>(items: T[]) {
  const shuffled = [...items]
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]]
  }

  return shuffled
}
