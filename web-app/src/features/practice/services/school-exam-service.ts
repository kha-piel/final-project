import { getSupabaseBrowserClient } from '../../../lib/supabase/client'
import { hasSupabaseEnv } from '../../../lib/config/env'
import { mockSchoolExams } from '../data/mock-school-exams'
import { supplementalDuongTiemCanReviewedQuestions } from '../data/supplemental-duong-tiem-can-reviewed'
import { supplementalGioiHanDaySoReviewedQuestions } from '../data/supplemental-gioi-han-day-so-reviewed'
import { supplementalGTLNGTNNReviewedQuestions } from '../data/supplemental-gtln-gtnn-reviewed'
import { supplementalHinhHocVectoReviewedQuestions } from '../data/supplemental-hinh-hoc-vecto-reviewed'
import { supplementalKhaoSatDoThiReviewedQuestions } from '../data/supplemental-khao-sat-do-thi-reviewed'
import { supplementalKnowledgeReviewQuestions } from '../data/supplemental-knowledge-review-questions'
import { supplementalMatPhangOxyzReviewedQuestions } from '../data/supplemental-mat-phang-oxyz-reviewed'
import { supplementalMuLogaritReviewedQuestions } from '../data/supplemental-mu-logarit-reviewed'
import { supplementalNguyenHamReviewedQuestions } from '../data/supplemental-nguyen-ham-reviewed'
import { supplementalOxyzReviewedQuestions } from '../data/supplemental-oxyz-reviewed'
import { supplementalQuyHoachTuyenTinhReviewedQuestions } from '../data/supplemental-quy-hoach-tuyen-tinh-reviewed'
import { supplementalTichPhanDienTichReviewedQuestions } from '../data/supplemental-tich-phan-dien-tich-reviewed'
import { supplementalToHopXacSuatDemReviewedQuestions } from '../data/supplemental-to-hop-xac-suat-dem-reviewed'
import { supplementalTuPhanViSoLieuReviewedQuestions } from '../data/supplemental-tu-phan-vi-so-lieu-reviewed'
import { supplementalXacSuatDocLapReviewedQuestions } from '../data/supplemental-xac-suat-doc-lap-reviewed'
import type { PracticeExamCatalogItem } from '../types/practice-types'
import type {
  SchoolExamAnswerKeyEntry,
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

type SchoolExamVariantRow = {
  variant_id: string
  variant_code: string
  display_order: number
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
  answer_key_provided: boolean
  source_path: string | null
  tags: string[] | null
  sections: SchoolExamSectionRow[] | null
  variants: SchoolExamVariantRow[] | null
}

type SchoolExamAnswerKeyRow = {
  question_number: number
  answer_value: string
}

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
}

type SchoolExamQuestionRow = {
  question_id: string
  exam_id: string
  question_number: number
  difficulty_level?: number | null
  question_type: SchoolExamSectionPart
  question_text: string
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

export async function fetchSchoolExamCatalog(): Promise<PracticeExamCatalogItem[]> {
  if (!hasSupabaseEnv()) {
    return buildFallbackCatalog()
  }

  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from('school_exams')
    .select(
      'exam_id, title, school_name, city, subject_code, subject_name, year, duration_minutes, source_path, tags',
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

  return data.map((item) => ({
    examId: item.exam_id,
    schoolExamPageId: item.exam_id,
    examTitle: item.title,
    schoolName: item.school_name,
    city: item.city,
    subjectId: item.subject_code,
    subjectName: item.subject_name,
    year: item.year,
    durationMinutes: item.duration_minutes,
    sourcePath: item.source_path ?? undefined,
    tags: item.tags ?? [],
  }))
}

export async function fetchSchoolExamById(examId: string): Promise<SchoolExamPaperRecord | null> {
  if (!hasSupabaseEnv()) {
    return buildFallbackExam(examId)
  }

  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from('school_exams')
    .select(
      'exam_id, title, school_name, city, subject_code, subject_name, year, duration_minutes, pdf_url, answer_key_provided, source_path, tags, sections:school_exam_sections(section_id, part_code, title, instructions, start_question_number, end_question_number, display_order, options_per_question, statement_count), variants:school_exam_variants(variant_id, variant_code, display_order)',
    )
    .eq('exam_id', examId)
    .eq('is_active', true)
    .maybeSingle<SchoolExamDetailRow>()

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
    examTitle: data.title,
    schoolName: data.school_name,
    city: data.city,
    subjectId: data.subject_code,
    subjectName: data.subject_name,
    year: data.year,
    durationMinutes: data.duration_minutes,
    pdfUrl: data.pdf_url,
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
    variants: [...(data.variants ?? [])]
      .sort((left, right) => left.display_order - right.display_order)
      .map((variant) => ({
        variantId: variant.variant_id,
        variantCode: variant.variant_code,
        displayOrder: variant.display_order,
      })),
  }
}

export async function fetchSchoolExamAnswerKey(variantId: string): Promise<SchoolExamAnswerKeyEntry[]> {
  if (!hasSupabaseEnv()) {
    return buildFallbackAnswerKeyEntries(variantId)
  }

  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from('school_exam_answer_keys')
    .select('question_number, answer_value')
    .eq('variant_id', variantId)
    .order('question_number', { ascending: true })
    .returns<SchoolExamAnswerKeyRow[]>()

  if (error) {
    if (shouldFallbackToLocalMock(error.message)) {
      return buildFallbackAnswerKeyEntries(variantId)
    }

    throw new Error(`Không thể tải answer key theo mã đề: ${error.message}`)
  }

  if (!data.length) {
    return buildFallbackAnswerKeyEntries(variantId)
  }

  return data.map((item) => ({
    questionNumber: item.question_number,
    answerValue: item.answer_value,
  }))
}

export async function fetchSchoolExamQuestions(examId: string): Promise<SchoolExamQuestionRecord[]> {
  if (!hasSupabaseEnv()) {
    return buildFallbackQuestionRecords(examId)
  }

  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from('school_exam_questions')
    .select(
      'question_id, exam_id, question_number, question_type, question_text, statement_json, topic, obsidian_source_path, has_image, metadata, options:school_exam_question_options(option_label, option_text, display_order), assets:school_exam_question_assets(asset_type, asset_path, display_order)',
    )
    .eq('exam_id', examId)
    .order('question_number', { ascending: true })
    .returns<SchoolExamQuestionRow[]>()

  if (error) {
    if (shouldFallbackToLocalMock(error.message)) {
      return buildFallbackQuestionRecords(examId)
    }

    throw new Error(`Không thể tải danh sách câu hỏi đề trường: ${error.message}`)
  }

  if (!data.length) {
    return buildFallbackQuestionRecords(examId)
  }

  return data.map((item) => ({
    questionId: item.question_id,
    examId: item.exam_id,
    questionNumber: item.question_number,
    difficultyLevel: normalizeDifficultyLevel(item.difficulty_level ?? null, item.metadata, item.question_type, item.question_number),
    questionType: item.question_type,
    questionText: item.question_text,
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

export async function fetchSchoolExamQuestionBank(subjectId: string): Promise<SchoolExamQuestionRecord[]> {
  if (!hasSupabaseEnv()) {
    return getSupplementalQuestionBank(subjectId)
  }

  const supabase = getSupabaseBrowserClient()
  const { data: variants, error: variantError } = await supabase
    .from('school_exam_variants')
    .select('variant_id, exam_id, variant_code')
    .eq('variant_code', 'DEFAULT')
    .returns<
      {
        variant_id: string
        exam_id: string
        variant_code: string
      }[]
    >()

  if (variantError) {
    throw new Error(`Không thể tải default variant cho kho câu hỏi: ${variantError.message}`)
  }

  const answerKeyByExamAndQuestion = new Map<string, string>()
  if (variants.length > 0) {
    const { data: answerKeys, error: answerKeyError } = await supabase
      .from('school_exam_answer_keys')
      .select('variant_id, question_number, answer_value')
      .in('variant_id', variants.map((variant) => variant.variant_id))
      .returns<
        {
          variant_id: string
          question_number: number
          answer_value: string
        }[]
      >()

    if (answerKeyError) {
      throw new Error(`Không thể tải answer key cho kho câu hỏi: ${answerKeyError.message}`)
    }

    const examIdByVariant = new Map(variants.map((variant) => [variant.variant_id, variant.exam_id]))
    for (const answerKey of answerKeys) {
      const examId = examIdByVariant.get(answerKey.variant_id)
      if (!examId) {
        continue
      }
      answerKeyByExamAndQuestion.set(
        `${examId}:${answerKey.question_number}`,
        answerKey.answer_value,
      )
    }
  }

  const { data, error } = await supabase
    .from('school_exam_questions')
    .select(
      'question_id, exam_id, question_number, question_type, question_text, statement_json, topic, obsidian_source_path, has_image, metadata, options:school_exam_question_options(option_label, option_text, display_order), assets:school_exam_question_assets(asset_type, asset_path, display_order), exam:school_exams!inner(exam_id, title, school_name, year, pdf_url, tags, is_active, subject_code)',
    )
    .eq('exam.subject_code', subjectId)
    .eq('exam.is_active', true)
    .order('question_number', { ascending: true })
    .returns<SchoolExamQuestionBankRow[]>()

  if (error) {
    if (shouldFallbackToLocalMock(error.message)) {
      return getSupplementalQuestionBank(subjectId)
    }

    throw new Error(`Không thể tải kho câu hỏi đề trường: ${error.message}`)
  }

  const remoteQuestions = data
    .filter((item) => item.exam?.is_active)
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
      answerValue: answerKeyByExamAndQuestion.get(`${item.exam_id}:${item.question_number}`) ?? '',
      sourceQuestionNumber: item.metadata?.source_question_number,
      sourceSectionNumber: item.metadata?.section_number,
      examTitle: item.exam?.title ?? '',
      schoolName: item.exam?.school_name ?? '',
      year: item.exam?.year ?? 0,
      pdfUrl: item.exam?.pdf_url ?? '',
      tags: item.exam?.tags ?? [],
    }))

  return [...remoteQuestions, ...getSupplementalQuestionBank(subjectId)]
}

export function normalizeAnswer(input: string) {
  return input.trim().replace(/\s+/g, ' ').toLowerCase()
}

function shouldFallbackToLocalMock(message: string) {
  const normalized = message.toLowerCase()
  return (
    normalized.includes("could not find the table 'public.school_exams'") ||
    normalized.includes("could not find the table 'public.school_exam_answer_keys'") ||
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

function buildFallbackCatalog(): PracticeExamCatalogItem[] {
  return mockSchoolExams.map((exam) => ({
    examId: exam.examId,
    schoolExamPageId: exam.examId,
    examTitle: exam.examTitle,
    schoolName: exam.schoolName,
    city: exam.city,
    subjectId: 'TOAN',
    subjectName: exam.subjectName,
    year: exam.year,
    durationMinutes: exam.durationMinutes,
    tags: ['fallback', 'local mock'],
  }))
}

function buildFallbackExam(examId: string): SchoolExamPaperRecord | null {
  const exam = mockSchoolExams.find((item) => item.examId === examId)
  if (!exam) {
    return null
  }

  return {
    examId: exam.examId,
    examTitle: exam.examTitle,
    schoolName: exam.schoolName,
    city: exam.city,
    subjectId: 'TOAN',
    subjectName: exam.subjectName,
    year: exam.year,
    durationMinutes: exam.durationMinutes,
    pdfUrl: exam.pdfUrl,
    answerKeyProvided: exam.answerKeyProvided,
    sourcePath: undefined,
    tags: ['fallback', 'local mock'],
    sections: buildFallbackSections(exam),
    variants: [
      {
        variantId: `${exam.examId}-default`,
        variantCode: 'DEFAULT',
        displayOrder: 1,
      },
    ],
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
      instructions: 'Nhap đáp án vao o trong.',
      startQuestionNumber: exam.shortAnswerQuestions[0]?.questionNumber ?? 0,
      endQuestionNumber:
        exam.shortAnswerQuestions[exam.shortAnswerQuestions.length - 1]?.questionNumber ?? 0,
      displayOrder: 3,
      optionsPerQuestion: 0,
      statementCount: 0,
    },
  ].filter((section) => section.startQuestionNumber > 0 && section.endQuestionNumber > 0)
}

function buildFallbackAnswerKeyEntries(variantId: string): SchoolExamAnswerKeyEntry[] {
  const examId = variantId.replace(/-default$/, '')
  const exam = mockSchoolExams.find((item) => item.examId === examId)
  if (!exam) {
    return []
  }

  return [
    ...exam.multipleChoiceQuestions.map((question) => ({
      questionNumber: question.questionNumber,
      answerValue: question.correctOptionId,
    })),
    ...exam.trueFalseQuestions.map((question) => ({
      questionNumber: question.questionNumber,
      answerValue: question.statements.map((statement) => (statement.isCorrect ? 'D' : 'S')).join(''),
    })),
    ...exam.shortAnswerQuestions.map((question) => ({
      questionNumber: question.questionNumber,
      answerValue: question.acceptedResponses.join('|'),
    })),
  ].sort((left, right) => left.questionNumber - right.questionNumber)
}

function buildFallbackQuestionRecords(examId: string): SchoolExamQuestionRecord[] {
  const exam = mockSchoolExams.find((item) => item.examId === examId)
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

function getSupplementalQuestionBank(subjectId: string) {
  if (subjectId !== 'TOAN') {
    return []
  }

  return [
    ...supplementalKnowledgeReviewQuestions,
    ...supplementalGTLNGTNNReviewedQuestions,
    ...supplementalKhaoSatDoThiReviewedQuestions,
    ...supplementalGioiHanDaySoReviewedQuestions,
    ...supplementalMuLogaritReviewedQuestions,
    ...supplementalNguyenHamReviewedQuestions,
    ...supplementalTichPhanDienTichReviewedQuestions,
    ...supplementalHinhHocVectoReviewedQuestions,
    ...supplementalMatPhangOxyzReviewedQuestions,
    ...supplementalOxyzReviewedQuestions,
    ...supplementalDuongTiemCanReviewedQuestions,
    ...supplementalQuyHoachTuyenTinhReviewedQuestions,
    ...supplementalToHopXacSuatDemReviewedQuestions,
    ...supplementalXacSuatDocLapReviewedQuestions,
    ...supplementalTuPhanViSoLieuReviewedQuestions,
  ]
}
