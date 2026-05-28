import { getSupabaseBrowserClient } from '../../../lib/supabase/client'
import { hasSupabaseEnv } from '../../../lib/config/env'
import type { PracticeExamCatalogItem } from '../types/practice-types'
import {
  formatSchoolExamDisplaySchoolName,
  formatSchoolExamDisplayTitle,
} from '../utils/school-exam-display'
import type {
  SchoolExamQuestionAssetRecord,
  SchoolExamPaper,
  SchoolExamPaperRecord,
  SchoolExamQuestionRecord,
  SchoolExamSectionPart,
} from '../types/school-exam-types'

type SchoolExamCatalogRow = {
  exam_id: string
  title: string
  school_name: string
  city: string
  subject_code: string
  subject_name: string
  year: number
  duration_minutes: number
  pdf_url: string | null
  source_path: string | null
  tags: string[] | null
}

type SchoolExamSectionRow = {
  section_id: string
  part_code: SchoolExamSectionPart
  title: string
  instructions: string | null
  start_question_number: number
  end_question_number: number
  display_order: number
  options_per_question: number | null
  statement_count: number | null
}

type SchoolExamDetailRow = {
  exam_id: string
  title: string
  school_name: string
  city: string
  subject_code: string
  subject_name: string
  year: number
  duration_minutes: number
  pdf_url: string
  display_variant_code: string
  answer_key_provided: boolean
  source_path: string | null
  tags: string[] | null
  sections: SchoolExamSectionRow[] | null
}

type SchoolExamDetailRowCompat = Omit<SchoolExamDetailRow, 'display_variant_code'> & {
  display_variant_code?: string
}

const MISSING_DISPLAY_VARIANT_CODE_PATTERNS = [
  "could not find the 'display_variant_code' column",
  'column "display_variant_code" does not exist',
]
const MISSING_CORRECT_ANSWER_PATTERNS = [
  "could not find the 'correct_answer' column",
  'column "correct_answer" does not exist',
]

type SchoolExamQuestionOptionRow = {
  option_label: string
  option_text: string
  display_order: number
}

type SchoolExamQuestionStatementRow = {
  label: string
  text: string
}

type SchoolExamQuestionMetadataRow = {
  source_question_number?: number
  section_number?: number
  difficulty_level?: number
  correct_answer_fallback?: string
}

type SchoolExamQuestionRow = {
  question_id: string
  exam_id: string
  question_number: number
  difficulty_level?: number | null
  question_type: SchoolExamSectionPart
  question_text: string
  correct_answer: string | null
  statement_json: SchoolExamQuestionStatementRow[] | null
  topic: string | null
  obsidian_source_path: string | null
  has_image: boolean
  metadata: SchoolExamQuestionMetadataRow | null
  options: SchoolExamQuestionOptionRow[] | null
  assets: SchoolExamQuestionAssetRow[] | null
}

type SchoolExamQuestionAssetRow = {
  asset_type: 'question_block' | 'figure' | 'table' | 'other'
  asset_path: string
  display_order: number
}

type SchoolExamQuestionBankRow = SchoolExamQuestionRow & {
  exam: {
    exam_id: string
    title: string
    school_name: string
    subject_code: string
    year: number
    pdf_url: string
    tags: string[] | null
    is_active: boolean
  } | null
}

const schoolExamCatalogCache = new Map<string, Promise<PracticeExamCatalogItem[]>>()
const schoolExamDetailCache = new Map<string, Promise<SchoolExamPaperRecord | null>>()
const schoolExamQuestionCache = new Map<string, Promise<SchoolExamQuestionRecord[]>>()
const schoolExamQuestionBankCache = new Map<string, Promise<SchoolExamQuestionRecord[]>>()
const schoolExamQuestionSummaryCache = new Map<string, Promise<SchoolExamQuestionSummary[]>>()

type SchoolExamQueryOptions = {
  includeSupplemental?: boolean
}

type SchoolExamQuestionSummary = {
  questionType: SchoolExamSectionPart
  difficultyLevel: 1 | 2 | 3 | 4
  topic: string
  schoolName: string
}

type SchoolExamQuestionSummaryRow = {
  question_type: SchoolExamSectionPart
  difficulty_level?: number | null
  topic: string | null
  metadata: SchoolExamQuestionMetadataRow | null
  exam: {
    school_name: string
    subject_code: string
    is_active: boolean
  } | null
}

export async function fetchSchoolExamCatalog(): Promise<PracticeExamCatalogItem[]> {
  const cacheKey = hasSupabaseEnv() ? 'remote' : 'fallback'
  const cached = schoolExamCatalogCache.get(cacheKey)
  if (cached) {
    return cached
  }

  const nextPromise = fetchSchoolExamCatalogUncached()
  schoolExamCatalogCache.set(cacheKey, nextPromise)
  return withCacheInvalidation(schoolExamCatalogCache, cacheKey, nextPromise)
}

async function fetchSchoolExamCatalogUncached(): Promise<PracticeExamCatalogItem[]> {
  if (!hasSupabaseEnv()) {
    return buildFallbackCatalog()
  }

  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from('school_exams')
    .select(
      'exam_id, title, school_name, city, subject_code, subject_name, year, duration_minutes, pdf_url, source_path, tags',
    )
    .eq('is_active', true)
    .order('year', { ascending: false })
    .order('title', { ascending: true })
    .returns<SchoolExamCatalogRow[]>()

  if (error) {
    if (shouldFallbackToLocalMock(error.message)) {
      return buildFallbackCatalog()
    }

    throw new Error(`Không thể tải danh sách đề trường từ Supabase: ${error.message}`)
  }

  if (!data.length) {
    return buildFallbackCatalog()
  }

  const remoteCatalog = data.map((item) => ({
    examId: item.exam_id,
    schoolExamPageId: item.exam_id,
    examTitle: formatSchoolExamDisplayTitle({
      examId: item.exam_id,
      title: item.title,
      schoolName: item.school_name,
    }),
    schoolName: formatSchoolExamDisplaySchoolName(item.exam_id, item.school_name),
    city: item.city,
    subjectId: item.subject_code,
    subjectName: item.subject_name,
    year: item.year,
    durationMinutes: item.duration_minutes,
    pdfUrl: item.pdf_url ?? undefined,
    sourcePath: item.source_path ?? undefined,
    tags: item.tags ?? [],
  }))

  return mergeCatalogItems(
    remoteCatalog.filter((item) => !isSupplementalTags(item.tags)),
    await buildFallbackCatalog(),
  )
}

export async function fetchSchoolExamById(examId: string): Promise<SchoolExamPaperRecord | null> {
  const cacheKey = `${hasSupabaseEnv() ? 'remote' : 'fallback'}:${examId}`
  const cached = schoolExamDetailCache.get(cacheKey)
  if (cached) {
    return cached
  }

  const nextPromise = fetchSchoolExamByIdUncached(examId)
  schoolExamDetailCache.set(cacheKey, nextPromise)
  return withCacheInvalidation(schoolExamDetailCache, cacheKey, nextPromise)
}

async function fetchSchoolExamByIdUncached(examId: string): Promise<SchoolExamPaperRecord | null> {
  if (!hasSupabaseEnv()) {
    return buildFallbackExam(examId)
  }

  const supabase = getSupabaseBrowserClient()
  const queryWithVariant = () =>
    supabase
      .from('school_exams')
      .select(
        'exam_id, title, school_name, city, subject_code, subject_name, year, duration_minutes, pdf_url, display_variant_code, answer_key_provided, source_path, tags, sections:school_exam_sections(section_id, part_code, title, instructions, start_question_number, end_question_number, display_order, options_per_question, statement_count)',
      )
      .eq('exam_id', examId)
      .eq('is_active', true)
      .maybeSingle<SchoolExamDetailRow>()
  const queryWithoutVariant = () =>
    supabase
      .from('school_exams')
      .select(
        'exam_id, title, school_name, city, subject_code, subject_name, year, duration_minutes, pdf_url, answer_key_provided, source_path, tags, sections:school_exam_sections(section_id, part_code, title, instructions, start_question_number, end_question_number, display_order, options_per_question, statement_count)',
      )
      .eq('exam_id', examId)
      .eq('is_active', true)
      .maybeSingle<
        Omit<SchoolExamDetailRow, 'display_variant_code'> & {
          display_variant_code?: string
        }
      >()

  let { data, error }: {
    data: SchoolExamDetailRowCompat | null
    error: Awaited<ReturnType<typeof queryWithVariant>>['error']
  } = await queryWithVariant()
  let hasDisplayVariantCode = true

  if (error && isMissingDisplayVariantCodeError(error.message)) {
    hasDisplayVariantCode = false
    const fallback = await queryWithoutVariant()
    data = fallback.data
    error = fallback.error
  }

  if (error) {
    if (shouldFallbackToLocalMock(error.message)) {
      return buildFallbackExam(examId)
    }

    throw new Error(`Không thể tải chi tiết đề trường: ${error.message}`)
  }

  if (!data) {
    return buildFallbackExam(examId)
  }

  return {
    examId: data.exam_id,
    examTitle: formatSchoolExamDisplayTitle({
      examId: data.exam_id,
      title: data.title,
      schoolName: data.school_name,
    }),
    schoolName: formatSchoolExamDisplaySchoolName(data.exam_id, data.school_name),
    city: data.city,
    subjectId: data.subject_code,
    subjectName: data.subject_name,
    year: data.year,
    durationMinutes: data.duration_minutes,
    pdfUrl: data.pdf_url,
    displayVariantCode:
      hasDisplayVariantCode
        ? (data.display_variant_code || deriveVariantCodeFromExamId(data.exam_id, 'DEFAULT'))
        : deriveVariantCodeFromExamId(data.exam_id, 'DEFAULT'),
    answerKeyProvided: data.answer_key_provided,
    sourcePath: data.source_path ?? undefined,
    tags: data.tags ?? [],
    sections: [...(data.sections ?? [])]
      .sort((left, right) => left.display_order - right.display_order)
      .map((section) => ({
        sectionId: section.section_id,
        partCode: section.part_code,
        title: section.title,
        instructions: section.instructions ?? '',
        startQuestionNumber: section.start_question_number,
        endQuestionNumber: section.end_question_number,
        displayOrder: section.display_order,
        optionsPerQuestion: section.options_per_question ?? 4,
        statementCount: section.statement_count ?? 4,
      })),
  }
}


export async function fetchSchoolExamQuestions(examId: string): Promise<SchoolExamQuestionRecord[]> {
  const cacheKey = `${hasSupabaseEnv() ? 'remote' : 'fallback'}:${examId}`
  const cached = schoolExamQuestionCache.get(cacheKey)
  if (cached) {
    return cached
  }

  const nextPromise = fetchSchoolExamQuestionsUncached(examId)
  schoolExamQuestionCache.set(cacheKey, nextPromise)
  return withCacheInvalidation(schoolExamQuestionCache, cacheKey, nextPromise)
}

async function fetchSchoolExamQuestionsUncached(examId: string): Promise<SchoolExamQuestionRecord[]> {
  if (!hasSupabaseEnv()) {
    return buildFallbackQuestionRecords(examId)
  }

  const supabase = getSupabaseBrowserClient()
  const queryWithAnswer = () =>
    supabase
      .from('school_exam_questions')
      .select(
        'question_id, exam_id, question_number, question_type, question_text, correct_answer, statement_json, topic, obsidian_source_path, has_image, metadata, options:school_exam_question_options(option_label, option_text, display_order), assets:school_exam_question_assets(asset_type, asset_path, display_order)',
      )
      .eq('exam_id', examId)
      .order('question_number', { ascending: true })
      .returns<SchoolExamQuestionRow[]>()
  const queryWithoutAnswer = () =>
    supabase
      .from('school_exam_questions')
      .select(
        'question_id, exam_id, question_number, question_type, question_text, statement_json, topic, obsidian_source_path, has_image, metadata, options:school_exam_question_options(option_label, option_text, display_order), assets:school_exam_question_assets(asset_type, asset_path, display_order)',
      )
      .eq('exam_id', examId)
      .order('question_number', { ascending: true })
      .returns<Array<Omit<SchoolExamQuestionRow, 'correct_answer'> & { correct_answer?: string | null }>>()

  let { data, error }: {
    data: Array<SchoolExamQuestionRow | (Omit<SchoolExamQuestionRow, 'correct_answer'> & { correct_answer?: string | null })> | null
    error: Awaited<ReturnType<typeof queryWithAnswer>>['error']
  } = await queryWithAnswer()

  if (error && isMissingCorrectAnswerError(error.message)) {
    const fallback = await queryWithoutAnswer()
    data = fallback.data
    error = fallback.error
  }

  if (error) {
    if (shouldFallbackToLocalMock(error.message)) {
      return buildFallbackQuestionRecords(examId)
    }

    throw new Error(`Không thể tải danh sách câu hỏi đề trường: ${error.message}`)
  }

  if (!(data ?? []).length) {
    return buildFallbackQuestionRecords(examId)
  }

  return (data ?? []).map((item) => ({
    questionId: item.question_id,
    examId: item.exam_id,
    questionNumber: item.question_number,
    difficultyLevel: normalizeDifficultyLevel(item.difficulty_level ?? null, item.metadata, item.question_type, item.question_number),
    questionType: item.question_type,
    questionText: item.question_text,
    answerValue: resolveCorrectAnswer(item.correct_answer, item.metadata),
    statements: item.statement_json ?? [],
    options: [...(item.options ?? [])].sort((left, right) => left.display_order - right.display_order).map((option) => ({
      optionLabel: option.option_label,
      optionText: option.option_text,
      displayOrder: option.display_order,
    })),
    assetPaths: mapAssetPaths(item.assets),
    assets: mapQuestionAssets(item.assets),
    topic: item.topic ?? '',
    obsidianSourcePath: item.obsidian_source_path ?? '',
    hasImage: item.has_image,
    sourceQuestionNumber: item.metadata?.source_question_number,
    sourceSectionNumber: item.metadata?.section_number,
  }))
}

export async function fetchSchoolExamQuestionBank(
  subjectId: string,
  options: SchoolExamQueryOptions = {},
): Promise<SchoolExamQuestionRecord[]> {
  const cacheKey = `${subjectId.trim().toUpperCase()}:${options.includeSupplemental ? 'with-supplemental' : 'base'}`
  const cached = schoolExamQuestionBankCache.get(cacheKey)
  if (cached) {
    return cached
  }

  const nextPromise = fetchSchoolExamQuestionBankUncached(subjectId.trim().toUpperCase(), options)
  schoolExamQuestionBankCache.set(cacheKey, nextPromise)
  return withCacheInvalidation(schoolExamQuestionBankCache, cacheKey, nextPromise)
}

export async function fetchSchoolExamQuestionSummary(
  subjectId: string,
  options: SchoolExamQueryOptions = {},
): Promise<SchoolExamQuestionSummary[]> {
  const cacheKey = `${subjectId.trim().toUpperCase()}:${options.includeSupplemental ? 'with-supplemental' : 'base'}`
  const cached = schoolExamQuestionSummaryCache.get(cacheKey)
  if (cached) {
    return cached
  }

  const nextPromise = fetchSchoolExamQuestionSummaryUncached(subjectId.trim().toUpperCase(), options)
  schoolExamQuestionSummaryCache.set(cacheKey, nextPromise)
  return withCacheInvalidation(schoolExamQuestionSummaryCache, cacheKey, nextPromise)
}

async function fetchSchoolExamQuestionSummaryUncached(
  subjectId: string,
  options: SchoolExamQueryOptions = {},
): Promise<SchoolExamQuestionSummary[]> {
  if (!hasSupabaseEnv()) {
    return (await getMockQuestionBankBySubject(subjectId)).map((question) => ({
      questionType: question.questionType,
      difficultyLevel: question.difficultyLevel,
      topic: question.topic ?? '',
      schoolName: question.schoolName ?? '',
    }))
  }

  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from('school_exam_questions')
    .select(
      'question_type, difficulty_level, topic, metadata, exam:school_exams!inner(school_name, subject_code, is_active)',
    )
    .eq('exam.subject_code', subjectId)
    .eq('exam.is_active', true)
    .returns<SchoolExamQuestionSummaryRow[]>()

  if (error) {
    if (shouldFallbackToLocalMock(error.message)) {
      return (await getMockQuestionBankBySubject(subjectId)).map((question) => ({
        questionType: question.questionType,
        difficultyLevel: question.difficultyLevel,
        topic: question.topic ?? '',
        schoolName: question.schoolName ?? '',
      }))
    }

    throw new Error(`Không thể tải tổng quan kho câu hỏi đề trường: ${error.message}`)
  }

  return data
    .filter((item) => item.exam?.is_active)
    .filter((item) => options.includeSupplemental || !isSupplementalSchoolName(item.exam?.school_name))
    .map((item) => ({
      questionType: item.question_type,
      difficultyLevel: normalizeDifficultyLevel(
        item.difficulty_level ?? null,
        item.metadata,
        item.question_type,
        Number(item.metadata?.source_question_number ?? 0),
      ),
      topic: item.topic ?? '',
      schoolName: item.exam?.school_name ?? '',
    }))
}

async function fetchSchoolExamQuestionBankUncached(
  subjectId: string,
  options: SchoolExamQueryOptions = {},
): Promise<SchoolExamQuestionRecord[]> {
  if (!hasSupabaseEnv()) {
    return getMockQuestionBankBySubject(subjectId)
  }

  const supabase = getSupabaseBrowserClient()

  const queryBankWithAnswer = () =>
    supabase
      .from('school_exam_questions')
      .select(
        'question_id, exam_id, question_number, question_type, question_text, correct_answer, statement_json, topic, obsidian_source_path, has_image, metadata, options:school_exam_question_options(option_label, option_text, display_order), assets:school_exam_question_assets(asset_type, asset_path, display_order), exam:school_exams!inner(exam_id, title, school_name, year, pdf_url, tags, is_active, subject_code)',
      )
      .eq('exam.subject_code', subjectId)
      .eq('exam.is_active', true)
      .order('question_number', { ascending: true })
      .returns<SchoolExamQuestionBankRow[]>()
  const queryBankWithoutAnswer = () =>
    supabase
      .from('school_exam_questions')
      .select(
        'question_id, exam_id, question_number, question_type, question_text, statement_json, topic, obsidian_source_path, has_image, metadata, options:school_exam_question_options(option_label, option_text, display_order), assets:school_exam_question_assets(asset_type, asset_path, display_order), exam:school_exams!inner(exam_id, title, school_name, year, pdf_url, tags, is_active, subject_code)',
      )
      .eq('exam.subject_code', subjectId)
      .eq('exam.is_active', true)
      .order('question_number', { ascending: true })
      .returns<Array<Omit<SchoolExamQuestionBankRow, 'correct_answer'> & { correct_answer?: string | null }>>()

  let { data, error }: {
    data: Array<SchoolExamQuestionBankRow | (Omit<SchoolExamQuestionBankRow, 'correct_answer'> & { correct_answer?: string | null })> | null
    error: Awaited<ReturnType<typeof queryBankWithAnswer>>['error']
  } = await queryBankWithAnswer()

  if (error && isMissingCorrectAnswerError(error.message)) {
    const fallback = await queryBankWithoutAnswer()
    data = fallback.data
    error = fallback.error
  }

  if (error) {
    if (shouldFallbackToLocalMock(error.message)) {
      return getMockQuestionBankBySubject(subjectId)
    }

    throw new Error(`Không thể tải kho câu hỏi đề trường: ${error.message}`)
  }

  const remoteQuestions = (data ?? [])
    .filter((item) => item.exam?.is_active)
    .filter((item) => options.includeSupplemental || !isSupplementalTags(item.exam?.tags))
    .map((item) => ({
      questionId: item.question_id,
      examId: item.exam_id,
      questionNumber: item.question_number,
      difficultyLevel: normalizeDifficultyLevel(item.difficulty_level ?? null, item.metadata, item.question_type, item.question_number),
      questionType: item.question_type,
      questionText: item.question_text,
      statements: item.statement_json ?? [],
      options: [...(item.options ?? [])]
        .sort((left, right) => left.display_order - right.display_order)
        .map((option) => ({
          optionLabel: option.option_label,
          optionText: option.option_text,
          displayOrder: option.display_order,
        })),
      assetPaths: mapAssetPaths(item.assets),
      assets: mapQuestionAssets(item.assets),
      topic: item.topic ?? '',
      obsidianSourcePath: item.obsidian_source_path ?? '',
      hasImage: item.has_image,
      answerValue: resolveCorrectAnswer(item.correct_answer, item.metadata),
      sourceQuestionNumber: item.metadata?.source_question_number,
      sourceSectionNumber: item.metadata?.section_number,
      examTitle: formatSchoolExamDisplayTitle({
        examId: item.exam?.exam_id ?? item.exam_id,
        title: item.exam?.title ?? '',
        schoolName: item.exam?.school_name ?? '',
      }),
      schoolName: formatSchoolExamDisplaySchoolName(item.exam?.exam_id ?? item.exam_id, item.exam?.school_name ?? ''),
      year: item.exam?.year ?? 0,
      pdfUrl: item.exam?.pdf_url ?? '',
      tags: item.exam?.tags ?? [],
    }))

  return remoteQuestions
}

export function normalizeAnswer(input: string) {
  return input.trim().replace(/\s+/g, ' ').toLowerCase()
}

async function withCacheInvalidation<T>(
  cache: Map<string, Promise<T>>,
  cacheKey: string,
  promise: Promise<T>,
) {
  try {
    return await promise
  } catch (error) {
    if (cache.get(cacheKey) === promise) {
      cache.delete(cacheKey)
    }
    throw error
  }
}

function shouldFallbackToLocalMock(message: string) {
  const normalized = message.toLowerCase()
  return (
    normalized.includes("could not find the table 'public.school_exams'") ||
    normalized.includes("could not find the table 'public.school_exam_questions'") ||
    normalized.includes('schema cache')
  )
}

function normalizeDifficultyLevel(
  difficultyLevel: number | null,
  metadata: SchoolExamQuestionMetadataRow | null,
  questionType: SchoolExamSectionPart,
  questionNumber: number,
): 1 | 2 | 3 | 4 {
  const fromColumn = Number(difficultyLevel ?? 0)
  if ([1, 2, 3, 4].includes(fromColumn)) {
    return fromColumn as 1 | 2 | 3 | 4
  }

  const fromMetadata = Number(metadata?.difficulty_level ?? 0)
  if ([1, 2, 3, 4].includes(fromMetadata)) {
    return fromMetadata as 1 | 2 | 3 | 4
  }

  const sourceQuestionNumber = Number(metadata?.source_question_number ?? questionNumber)

  if (questionType === 'multiple_choice') {
    if (sourceQuestionNumber <= 4) {
      return 1
    }
    if (sourceQuestionNumber <= 8) {
      return 2
    }
    if (sourceQuestionNumber <= 11) {
      return 3
    }
    return 4
  }

  if (questionType === 'true_false') {
    if (sourceQuestionNumber <= 2) {
      return 2
    }
    if (sourceQuestionNumber === 3) {
      return 3
    }
    return 4
  }

  if (sourceQuestionNumber <= 2) {
    return 1
  }
  if (sourceQuestionNumber <= 4) {
    return 2
  }
  if (sourceQuestionNumber === 5) {
    return 3
  }
  return 4
}

async function buildFallbackCatalog(): Promise<PracticeExamCatalogItem[]> {
  const exams = await loadMockSchoolExams()
  return exams.map((exam) => ({
    examId: exam.examId,
    schoolExamPageId: exam.examId,
    examTitle: exam.examTitle,
    schoolName: exam.schoolName,
    city: exam.city,
    subjectId: inferSubjectIdFromName(exam.subjectName),
    subjectName: exam.subjectName,
    year: exam.year,
    durationMinutes: exam.durationMinutes,
    pdfUrl: exam.pdfUrl,
    tags: ['fallback', 'local mock'],
  }))
}

function isMissingDisplayVariantCodeError(message: string) {
  const normalized = message.toLowerCase()
  return MISSING_DISPLAY_VARIANT_CODE_PATTERNS.some((pattern) => normalized.includes(pattern))
}

function isMissingCorrectAnswerError(message: string) {
  const normalized = message.toLowerCase()
  return MISSING_CORRECT_ANSWER_PATTERNS.some((pattern) => normalized.includes(pattern))
}

function resolveCorrectAnswer(
  directAnswer: string | null | undefined,
  metadata: SchoolExamQuestionMetadataRow | null | undefined,
) {
  if (typeof directAnswer === 'string' && directAnswer.trim()) {
    return directAnswer
  }

  const metadataAnswer = metadata?.correct_answer_fallback
  return typeof metadataAnswer === 'string' ? metadataAnswer : ''
}

function inferSubjectIdFromName(subjectName: string) {
  const normalized = subjectName
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

  if (normalized.includes('vat ly') || normalized.includes('ly hoc')) {
    return 'VAT_LY'
  }

  if (normalized.includes('hoa hoc')) {
    return 'HOA_HOC'
  }

  return 'TOAN'
}

function isSupplementalTags(tags: string[] | null | undefined) {
  return (tags ?? []).some((tag) => tag.trim().toLowerCase() === 'supplemental')
}

function isSupplementalSchoolName(schoolName: string | null | undefined) {
  const normalized = (schoolName ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

  return normalized === 'noi bo he thong'
}

function mergeCatalogItems(
  primary: PracticeExamCatalogItem[],
  secondary: PracticeExamCatalogItem[],
) {
  const merged = new Map<string, PracticeExamCatalogItem>()

  for (const item of secondary) {
    merged.set(item.examId, item)
  }

  for (const item of primary) {
    merged.set(item.examId, item)
  }

  return Array.from(merged.values()).sort((left, right) => {
    if (right.year !== left.year) {
      return right.year - left.year
    }

    return left.examTitle.localeCompare(right.examTitle)
  })
}

function deriveVariantCodeFromExamId(examId: string, fallback = 'DEFAULT') {
  const segments = examId
    .split('-')
    .map((segment) => segment.trim())
    .filter(Boolean)
  return segments.at(-1)?.toUpperCase() ?? fallback
}

async function buildFallbackExam(examId: string): Promise<SchoolExamPaperRecord | null> {
  const exams = await loadMockSchoolExams()
  const exam = exams.find((item) => item.examId === examId)
  if (!exam) {
    return null
  }

  return {
    examId: exam.examId,
    examTitle: exam.examTitle,
    schoolName: exam.schoolName,
    city: exam.city,
    subjectId: inferSubjectIdFromName(exam.subjectName),
    subjectName: exam.subjectName,
    year: exam.year,
    durationMinutes: exam.durationMinutes,
    pdfUrl: exam.pdfUrl,
    displayVariantCode: exam.displayVariantCode ?? 'DEFAULT',
    answerKeyProvided: exam.answerKeyProvided,
    sourcePath: undefined,
    tags: ['fallback', 'local mock'],
    sections: buildFallbackSections(exam),
  }
}

function buildFallbackSections(exam: SchoolExamPaper) {
  return [
    {
      sectionId: `${exam.examId}-section-1`,
      partCode: 'multiple_choice' as const,
      title: 'Phần I. Trắc nghiệm nhiều lựa chọn',
      instructions: 'Mỗi câu chọn 1 trong 4 đáp án.',
      startQuestionNumber: exam.multipleChoiceQuestions[0]?.questionNumber ?? 1,
      endQuestionNumber:
        exam.multipleChoiceQuestions[exam.multipleChoiceQuestions.length - 1]?.questionNumber ?? 0,
      displayOrder: 1,
      optionsPerQuestion: 4,
      statementCount: 0,
    },
    {
      sectionId: `${exam.examId}-section-2`,
      partCode: 'true_false' as const,
      title: 'Phần II. Đúng / Sai',
      instructions: 'Mỗi câu gồm các ý a, b, c, d.',
      startQuestionNumber: exam.trueFalseQuestions[0]?.questionNumber ?? 0,
      endQuestionNumber:
        exam.trueFalseQuestions[exam.trueFalseQuestions.length - 1]?.questionNumber ?? 0,
      displayOrder: 2,
      optionsPerQuestion: 0,
      statementCount: exam.trueFalseQuestions[0]?.statements.length ?? 4,
    },
    {
      sectionId: `${exam.examId}-section-3`,
      partCode: 'short_answer' as const,
      title: 'Phần III. Trả lời ngắn',
      instructions: 'Nhập đáp án vào ô trống.',
      startQuestionNumber: exam.shortAnswerQuestions[0]?.questionNumber ?? 0,
      endQuestionNumber:
        exam.shortAnswerQuestions[exam.shortAnswerQuestions.length - 1]?.questionNumber ?? 0,
      displayOrder: 3,
      optionsPerQuestion: 0,
      statementCount: 0,
    },
  ].filter((section) => section.startQuestionNumber > 0 && section.endQuestionNumber > 0)
}

async function buildFallbackQuestionRecords(examId: string): Promise<SchoolExamQuestionRecord[]> {
  const exams = await loadMockSchoolExams()
  const exam = exams.find((item) => item.examId === examId)
  if (!exam) {
    return []
  }

  return [
    ...exam.multipleChoiceQuestions.map((question) => ({
      questionId: question.questionId,
      examId: exam.examId,
      questionNumber: question.questionNumber,
      difficultyLevel: 2 as const,
      questionType: 'multiple_choice' as const,
      questionText: question.prompt,
      answerValue: question.correctOptionId,
      statements: [],
      options: question.options.map((option, index) => ({
        optionLabel: option.label,
        optionText: option.content,
        displayOrder: index + 1,
      })),
      assetPaths: [],
      assets: [],
      topic: '',
      obsidianSourcePath: '',
      hasImage: false,
    })),
    ...exam.trueFalseQuestions.map((question) => ({
      questionId: question.questionId,
      examId: exam.examId,
      questionNumber: question.questionNumber,
      difficultyLevel: 3 as const,
      questionType: 'true_false' as const,
      questionText: question.prompt,
      answerValue: question.statements.map((statement) => (statement.isCorrect ? 'D' : 'S')).join(''),
      statements: question.statements.map((statement) => ({
        label: statement.label,
        text: statement.content,
      })),
      options: [],
      assetPaths: [],
      assets: [],
      topic: '',
      obsidianSourcePath: '',
      hasImage: false,
    })),
    ...exam.shortAnswerQuestions.map((question) => ({
      questionId: question.questionId,
      examId: exam.examId,
      questionNumber: question.questionNumber,
      difficultyLevel: 2 as const,
      questionType: 'short_answer' as const,
      questionText: question.prompt,
      answerValue: question.acceptedResponses.join('|'),
      statements: [],
      options: [],
      assetPaths: [],
      assets: [],
      topic: '',
      obsidianSourcePath: '',
      hasImage: false,
    })),
  ].sort((left, right) => left.questionNumber - right.questionNumber)
}

function mapQuestionAssets(
  assets: SchoolExamQuestionAssetRow[] | null | undefined,
): SchoolExamQuestionAssetRecord[] {
  return [...(assets ?? [])]
    .sort((left, right) => left.display_order - right.display_order)
    .map((asset) => ({
      assetType: asset.asset_type,
      assetPath: asset.asset_path,
      displayOrder: asset.display_order,
    }))
}

function mapAssetPaths(assets: SchoolExamQuestionAssetRow[] | null | undefined) {
  return mapQuestionAssets(assets).map((asset) => asset.assetPath)
}

async function loadMockSchoolExams() {
  return (await import('../data/mock-school-exams')).mockSchoolExams
}

async function getMockQuestionBankBySubject(subjectId: string): Promise<SchoolExamQuestionRecord[]> {
  const exams = await loadMockSchoolExams()
  const matchingExams = exams.filter((exam) => inferSubjectIdFromName(exam.subjectName) === subjectId)

  if (matchingExams.length === 0) {
    return []
  }

  const questionGroups = await Promise.all(
    matchingExams.map((exam) => buildFallbackQuestionRecords(exam.examId)),
  )

  return questionGroups.flat()
}
