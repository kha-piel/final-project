import { env } from '../../../lib/config/env'
import { getSupabaseBrowserClient } from '../../../lib/supabase/client'

export type AdminQuestionType = 'multiple_choice' | 'true_false' | 'short_answer'
export type SubjectCode = 'TOAN' | 'VAT_LY' | 'HOA_HOC'

export type AdminImportMetadata = {
  schoolName: string
  city: string
  subjectCode: SubjectCode
  subjectName: string
  year: string
  variantCode: string
  durationMinutes: string
}

export type AdminExamDraft = {
  examId: string
  title: string
  schoolName: string
  city: string
  subjectCode: SubjectCode
  subjectName: string
  year: number
  durationMinutes: number
  variantCode: string
  pdfStoragePath: string
  pdfUrl: string
}

export type AdminImportOption = {
  label: 'A' | 'B' | 'C' | 'D'
  text: string
}

export type AdminImportStatement = {
  label: 'a' | 'b' | 'c' | 'd'
  text: string
}

export type AdminImportAsset = {
  assetType: 'question_block' | 'figure' | 'table' | 'other'
  assetPath: string
  pageNumber?: number | null
  assetDataUrl?: string | null
  publicUrl?: string
}

export type AdminImportChange = {
  field: string
  original: string
  corrected: string
  reason: string
}

export type AdminImportQuestion = {
  questionNumber: number
  questionType: AdminQuestionType
  topic: string
  questionText: string
  options: AdminImportOption[]
  statements: AdminImportStatement[]
  correctAnswer: string
  isValid: boolean
  warnings: string[]
  changes: AdminImportChange[]
  assets: AdminImportAsset[]
  rawExcerpt?: string | null
}

export type AdminImportValidationResponse = {
  isValid: boolean
  warnings: string[]
  examDraft: AdminExamDraft
  questions: AdminImportQuestion[]
  rawModelResponse?: string | null
}

export type ManagedImportedExam = {
  examId: string
  title: string
  schoolName: string
  city: string
  subjectCode: SubjectCode
  subjectName: string
  year: number
  durationMinutes: number
  pdfUrl: string
  sourcePath: string | null
  isActive: boolean
  createdAt: string
  variantCode: string
}

type SaveAdminImportedExamInput = {
  pdfFile: File
  draft: AdminImportValidationResponse
}

type UpdateManagedImportedExamInput = {
  examId: string
  title: string
  schoolName: string
  city: string
  subjectCode: SubjectCode
  year: number
  durationMinutes: number
  variantCode: string
  isActive: boolean
}

type ManagedExamQuestionRow = {
  question_id: string
  exam_id: string
  question_number: number
  difficulty_level: number | null
  question_type: AdminQuestionType
  question_text: string
  correct_answer: string | null
  statement_json: Array<{ label: string; text: string }> | null
  topic: string | null
  obsidian_source_path: string | null
  has_image: boolean
  metadata: Record<string, unknown> | null
  options: Array<{
    option_label: 'A' | 'B' | 'C' | 'D'
    option_text: string
    display_order: number
  }> | null
  assets: Array<{
    asset_type: AdminImportAsset['assetType']
    asset_path: string
    display_order: number
  }> | null
}

type ManagedImportedExamRow = {
  exam_id: string
  title: string
  school_name: string
  city: string
  subject_code: SubjectCode
  subject_name: string
  year: number
  duration_minutes: number
  pdf_url: string
  source_path: string | null
  is_active: boolean
  created_at: string
  display_variant_code?: string | null
}

type ManagedImportedExamDraftRow = {
  exam_id: string
  title: string
  school_name: string
  city: string
  subject_code: SubjectCode
  subject_name: string
  year: number
  duration_minutes: number
  pdf_url: string
  display_variant_code?: string | null
}

type SectionPart = AdminQuestionType

const STORAGE_BUCKET = 'school-exams'
const MISSING_DISPLAY_VARIANT_CODE_PATTERNS = [
  "could not find the 'display_variant_code' column",
  'column "display_variant_code" does not exist',
]
const MISSING_CORRECT_ANSWER_PATTERNS = [
  "could not find the 'correct_answer' column",
  'column "correct_answer" does not exist',
]

export const subjectOptions: Array<{
  code: SubjectCode
  name: string
  durationMinutes: string
}> = [
  { code: 'TOAN', name: 'Toán học', durationMinutes: '90' },
  { code: 'VAT_LY', name: 'Vật lý', durationMinutes: '50' },
  { code: 'HOA_HOC', name: 'Hóa học', durationMinutes: '50' },
]

export const topicOptionsBySubjectCode: Record<SubjectCode, string[]> = {
  TOAN: [
    'Hinh hoc khong gian va Oxyz',
    'Nguyen ham va tich phan',
    'Khao sat ham so, cuc tri va GTLN/GTNN',
    'Mu va logarit',
    'Xac suat, to hop va thong ke',
    'Quan he vuong goc va khoi da dien',
  ],
  VAT_LY: [
    'Dao dong co',
    'Song co',
    'Dien xoay chieu',
    'Dao dong va song dien tu',
    'Song anh sang',
    'Luong tu anh sang',
    'Hat nhan nguyen tu',
    'Dien tich va dien truong',
    'Dong dien khong doi',
    'Tu truong',
    'Cam ung dien tu',
    'Quang hoc',
  ],
  HOA_HOC: [
    'Cau tao nguyen tu, bang tuan hoan va lien ket hoa hoc',
    'Phan ung oxi hoa khu',
    'Toc do phan ung va can bang hoa hoc',
    'Dung dich, pH va chuan do',
    'Este va lipit',
    'Cacbohidrat',
    'Amin, amino axit va protein',
    'Polime',
    'Dai cuong kim loai',
    'Kim loai kiem, kiem tho va nhom',
    'Sat va hop chat cua sat',
    'Dien phan',
    'Tong hop hoa vo co',
    'Tong hop hoa huu co',
    'Hoa hoc voi thuc tien',
  ],
}

export function createEmptyMetadata(): AdminImportMetadata {
  const defaultSubject = subjectOptions[0]
  return {
    schoolName: '',
    city: '',
    subjectCode: defaultSubject.code,
    subjectName: defaultSubject.name,
    year: String(new Date().getFullYear()),
    variantCode: '101',
    durationMinutes: defaultSubject.durationMinutes,
  }
}

export function estimateExamId(metadata: AdminImportMetadata) {
  return [
    slugify(metadata.schoolName),
    metadata.subjectCode.toLowerCase(),
    metadata.year.trim(),
    slugify(metadata.variantCode),
  ]
    .filter(Boolean)
    .join('-')
}

export async function requestExamPdfValidation(input: {
  pdfFile: File
  metadata: AdminImportMetadata
  answerKeyText: string
  onStatusChange?: (message: string) => void
}) {
  if (!env.aiApiBaseUrl) {
    throw new Error(
      'Missing VITE_AI_API_BASE_URL. Copy web-app/.env.example to web-app/.env.local before using AI exam validation.',
    )
  }

  const formData = new FormData()
  formData.append('pdfFile', input.pdfFile)
  formData.append('subjectCode', input.metadata.subjectCode)
  formData.append('subjectName', input.metadata.subjectName)
  formData.append('schoolName', input.metadata.schoolName)
  formData.append('city', input.metadata.city)
  formData.append('year', input.metadata.year)
  formData.append('variantCode', input.metadata.variantCode)
  formData.append('durationMinutes', input.metadata.durationMinutes)
  formData.append('answerKeyText', input.answerKeyText)

  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), 240_000)
  const statusTimers = [
    window.setTimeout(() => {
      input.onStatusChange?.('Dang doc text tu PDF va gui sang AI...')
    }, 1_000),
    window.setTimeout(() => {
      input.onStatusChange?.('AI dang boc tach cau hoi va ghep dap an...')
    }, 12_000),
    window.setTimeout(() => {
      input.onStatusChange?.('Tac vu van dang chay. Neu PDF la file scan, Gemini co the mat vai phut...')
    }, 45_000),
  ]

  input.onStatusChange?.('Dang upload PDF len backend...')

  const response = await fetch(`${env.aiApiBaseUrl}/api/admin/import-exam-pdf/validate`, {
    method: 'POST',
    body: formData,
    signal: controller.signal,
  })
    .catch((error: unknown) => {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new Error('Qua thoi gian cho AI phan tich PDF. Hay thu lai voi PDF nho hon hoac restart ai_service.')
      }

      throw new Error(
        `Khong ket noi duoc toi AI backend (${env.aiApiBaseUrl}). Kiem tra ai_service co dang chay khong.`,
      )
    })
    .finally(() => {
      window.clearTimeout(timeoutId)
      for (const timerId of statusTimers) {
        window.clearTimeout(timerId)
      }
    })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || `AI backend tra ve loi HTTP ${response.status}.`)
  }

  const payload = (await response.json()) as AdminImportValidationResponse
  return normalizeValidationResponse(payload)
}

export function getQuestionValidationIssues(question: AdminImportQuestion) {
  const issues: string[] = []
  if (!question.questionText.trim()) {
    issues.push('Thieu de bai.')
  }

  if (!Number.isInteger(question.questionNumber) || question.questionNumber <= 0) {
    issues.push('So thu tu cau hoi phai la so nguyen duong.')
  }

  if (question.questionType === 'multiple_choice') {
    const optionMap = new Map(question.options.map((option) => [option.label, option.text.trim()]))
    for (const label of ['A', 'B', 'C', 'D'] as const) {
      if (!optionMap.get(label)) {
        issues.push(`Thieu noi dung dap an ${label}.`)
      }
    }
    if (!['A', 'B', 'C', 'D'].includes(question.correctAnswer.trim().toUpperCase())) {
      issues.push('Dap an dung phai la A, B, C hoac D.')
    }
  }

  if (question.questionType === 'true_false') {
    if (question.statements.length < 4) {
      issues.push('Can du 4 menh de a, b, c, d.')
    }
    const statementMap = new Map(
      question.statements.map((statement) => [statement.label, statement.text.trim()]),
    )
    for (const label of ['a', 'b', 'c', 'd'] as const) {
      if (!statementMap.get(label)) {
        issues.push(`Thieu noi dung menh de ${label}.`)
      }
    }
    if (!/^[DS]{4}$/.test(question.correctAnswer.trim().toUpperCase())) {
      issues.push('Dap an dung/sai phai co dang DDSS.')
    }
  }

  if (question.questionType === 'short_answer' && !question.correctAnswer.trim()) {
    issues.push('Thieu dap an tra loi ngan.')
  }

  return issues
}

export function getDraftValidationIssues(input: {
  draft: AdminImportValidationResponse | null
  pdfFile: File | null
}) {
  const issues: string[] = []
  if (!input.pdfFile) {
    issues.push('Chua co file PDF.')
  }

  if (!input.draft) {
    issues.push('Chua co ket qua phan tich AI.')
    return issues
  }

  const numbers = input.draft.questions.map((question) => question.questionNumber)
  const duplicateNumbers = numbers.filter((value, index) => numbers.indexOf(value) !== index)
  if (duplicateNumbers.length > 0) {
    issues.push(`Question number bi trung: ${Array.from(new Set(duplicateNumbers)).join(', ')}.`)
  }

  if (input.draft.questions.length === 0) {
    issues.push('Chua co cau hoi nao de luu.')
  }

  for (const question of input.draft.questions) {
    const questionIssues = getQuestionValidationIssues(question)
    if (questionIssues.length > 0) {
      issues.push(`Cau ${question.questionNumber}: ${questionIssues.join(' ')}`)
    }
  }

  return issues
}

export async function saveAdminImportedExam(input: SaveAdminImportedExamInput) {
  const supabase = getSupabaseBrowserClient()
  const draft = input.draft
  const examId = draft.examDraft.examId
  const issues = getDraftValidationIssues({
    draft,
    pdfFile: input.pdfFile,
  })

  if (issues.length > 0) {
    throw new Error(issues[0] ?? 'Du lieu import chua hop le.')
  }

  const { data: existingExam, error: existingExamError } = await supabase
    .from('school_exams')
    .select('exam_id')
    .eq('exam_id', examId)
    .maybeSingle<{ exam_id: string }>()

  if (existingExamError) {
    throw new Error(`Khong the kiem tra exam_id ton tai: ${existingExamError.message}`)
  }

  if (existingExam) {
    throw new Error(`Exam ID "${examId}" da ton tai. Hay doi metadata hoac ma de truoc khi luu.`)
  }

  const uploadedPdfUrl = await uploadPdfFile(input.pdfFile, draft.examDraft.pdfStoragePath)
  const questionsWithUploadedAssets = await uploadQuestionAssets(draft.examDraft, draft.questions)
  const sectionRows = buildSectionRows(examId, questionsWithUploadedAssets)
  const sectionIdByType = new Map(sectionRows.map((section) => [section.part_code, section.section_id]))

  const examBaseRow = {
    exam_id: examId,
    title: draft.examDraft.title,
    school_name: draft.examDraft.schoolName,
    city: draft.examDraft.city,
    subject_code: draft.examDraft.subjectCode,
    subject_name: draft.examDraft.subjectName,
    year: draft.examDraft.year,
    duration_minutes: draft.examDraft.durationMinutes,
    pdf_url: uploadedPdfUrl,
    answer_key_provided: questionsWithUploadedAssets.every((question) =>
      Boolean(question.correctAnswer.trim()),
    ),
    source_path: `admin-import:${input.pdfFile.name}`,
    tags: ['admin-import', draft.examDraft.subjectCode.toLowerCase()],
    is_active: true,
  }

  const questionRows = questionsWithUploadedAssets.map((question) => ({
    question_id: buildQuestionId(examId, question.questionNumber),
    exam_id: examId,
    section_id: sectionIdByType.get(question.questionType) ?? null,
    question_number: question.questionNumber,
    difficulty_level: null,
    question_type: question.questionType,
    question_text: question.questionText.trim(),
    correct_answer: question.correctAnswer.trim().toUpperCase(),
    statement_json:
      question.questionType === 'true_false'
        ? question.statements.map((statement) => ({
            label: statement.label,
            text: statement.text.trim(),
          }))
        : [],
    explanation: null,
    topic: question.topic.trim() || null,
    obsidian_source_path: null,
    has_image: question.assets.length > 0,
    metadata: {
      source_question_number: question.questionNumber,
      import_source: 'admin_pdf_dashboard',
      review_status: 'pending_review',
      correct_answer_fallback: question.correctAnswer.trim().toUpperCase(),
    },
  }))

  const optionRows = questionsWithUploadedAssets.flatMap((question) => {
    if (question.questionType !== 'multiple_choice') {
      return []
    }

    const questionId = buildQuestionId(examId, question.questionNumber)
    return question.options.map((option, index) => ({
      option_id: `${questionId}-option-${option.label.toLowerCase()}`,
      question_id: questionId,
      option_label: option.label,
      option_text: option.text.trim(),
      display_order: index + 1,
    }))
  })

  const assetRows = questionsWithUploadedAssets.flatMap((question) => {
    const questionId = buildQuestionId(examId, question.questionNumber)
    return question.assets
      .filter((asset) => asset.publicUrl)
      .map((asset, index) => ({
        asset_id: `${questionId}-asset-${index + 1}`,
        question_id: questionId,
        asset_type: asset.assetType,
        asset_path: asset.publicUrl,
        caption: asset.pageNumber ? `Trang ${asset.pageNumber}` : null,
        display_order: index + 1,
      }))
  })

  let hasInsertedExam = false
  try {
    const examError = await insertSchoolExamRow(supabase, examBaseRow, draft.examDraft.variantCode)
    if (examError) {
      throw new Error(`Khong the tao school_exams: ${examError.message}`)
    }
    hasInsertedExam = true

    const { error: sectionError } = await supabase.from('school_exam_sections').insert(sectionRows)
    if (sectionError) {
      throw new Error(`Khong the tao school_exam_sections: ${sectionError.message}`)
    }

    const questionsError = await insertSchoolExamQuestions(supabase, questionRows)
    if (questionsError) {
      throw new Error(`Khong the tao school_exam_questions: ${questionsError.message}`)
    }

    if (optionRows.length > 0) {
      const { error: optionsError } = await supabase
        .from('school_exam_question_options')
        .insert(optionRows)
      if (optionsError) {
        throw new Error(`Khong the tao school_exam_question_options: ${optionsError.message}`)
      }
    }

    if (assetRows.length > 0) {
      const { error: assetsError } = await supabase
        .from('school_exam_question_assets')
        .insert(assetRows)
      if (assetsError) {
        throw new Error(`Khong the tao school_exam_question_assets: ${assetsError.message}`)
      }
    }

    return {
      examId,
      questionCount: questionsWithUploadedAssets.length,
    }
  } catch (error) {
    if (hasInsertedExam) {
      await supabase.from('school_exams').delete().eq('exam_id', examId)
    }
    throw error
  }
}

export async function fetchManagedImportedExams() {
  const supabase = getSupabaseBrowserClient()
  const queryWithVariant = () =>
    supabase
      .from('school_exams')
      .select(
        'exam_id, title, school_name, city, subject_code, subject_name, year, duration_minutes, pdf_url, display_variant_code, source_path, is_active, created_at',
      )
      .order('created_at', { ascending: false })
      .limit(24)
  const queryWithoutVariant = () =>
    supabase
      .from('school_exams')
      .select(
        'exam_id, title, school_name, city, subject_code, subject_name, year, duration_minutes, pdf_url, source_path, is_active, created_at',
      )
      .order('created_at', { ascending: false })
      .limit(24)

  let { data, error }: {
    data: ManagedImportedExamRow[] | null
    error: Awaited<ReturnType<typeof queryWithVariant>>['error']
  } = await queryWithVariant()
  let hasDisplayVariantCode = true

  if (error && isMissingDisplayVariantCodeError(error.message)) {
    hasDisplayVariantCode = false
    const fallbackResult = await queryWithoutVariant()
    data = fallbackResult.data
    error = fallbackResult.error
  }

  if (error) {
    throw new Error(`Khong the tai danh sach de da nhap: ${error.message}`)
  }

  return ((data ?? []) as ManagedImportedExamRow[]).map((row) => ({
      examId: row.exam_id,
      title: row.title,
      schoolName: row.school_name,
      city: row.city,
      subjectCode: row.subject_code as SubjectCode,
      subjectName: row.subject_name,
      year: row.year,
      durationMinutes: row.duration_minutes,
      pdfUrl: row.pdf_url,
      sourcePath: row.source_path ?? null,
      isActive: row.is_active,
      createdAt: row.created_at,
      variantCode:
        hasDisplayVariantCode && 'display_variant_code' in row
          ? ((row.display_variant_code as string | null) ?? deriveVariantCodeFromExamId(row.exam_id, 'DEFAULT'))
          : deriveVariantCodeFromExamId(row.exam_id, 'DEFAULT'),
    }) satisfies ManagedImportedExam)
}

export async function updateManagedImportedExam(input: UpdateManagedImportedExamInput) {
  const supabase = getSupabaseBrowserClient()
  const subject = subjectOptions.find((item) => item.code === input.subjectCode)

  if (!subject) {
    throw new Error('Mon hoc khong hop le.')
  }

  const payload = {
    title: input.title.trim(),
    school_name: input.schoolName.trim(),
    city: input.city.trim(),
    subject_code: input.subjectCode,
    subject_name: subject.name,
    year: input.year,
    duration_minutes: input.durationMinutes,
    is_active: input.isActive,
  }
  const payloadWithVariant = {
    ...payload,
    display_variant_code: input.variantCode.trim() || 'DEFAULT',
  }
  let { error: examError } = await supabase
    .from('school_exams')
    .update(payloadWithVariant)
    .eq('exam_id', input.examId)

  if (examError && isMissingDisplayVariantCodeError(examError.message)) {
    const fallback = await supabase.from('school_exams').update(payload).eq('exam_id', input.examId)
    examError = fallback.error
  }

  if (examError) {
    throw new Error(`Khong the cap nhat thong tin de thi: ${examError.message}`)
  }

}

export async function fetchManagedImportedExamDraft(examId: string) {
  const supabase = getSupabaseBrowserClient()
  const queryWithVariant = () =>
    supabase
      .from('school_exams')
      .select(
        'exam_id, title, school_name, city, subject_code, subject_name, year, duration_minutes, pdf_url, display_variant_code',
      )
      .eq('exam_id', examId)
      .maybeSingle<{
        exam_id: string
        title: string
        school_name: string
        city: string
        subject_code: SubjectCode
        subject_name: string
        year: number
        duration_minutes: number
        pdf_url: string
        display_variant_code: string | null
      }>()
  const queryWithoutVariant = () =>
    supabase
      .from('school_exams')
      .select(
        'exam_id, title, school_name, city, subject_code, subject_name, year, duration_minutes, pdf_url',
      )
      .eq('exam_id', examId)
      .maybeSingle<{
        exam_id: string
        title: string
        school_name: string
        city: string
        subject_code: SubjectCode
        subject_name: string
        year: number
        duration_minutes: number
        pdf_url: string
      }>()

  let { data: examRow, error: examError }: {
    data: ManagedImportedExamDraftRow | null
    error: Awaited<ReturnType<typeof queryWithVariant>>['error']
  } = await queryWithVariant()
  let hasDisplayVariantCode = true

  if (examError && isMissingDisplayVariantCodeError(examError.message)) {
    hasDisplayVariantCode = false
    const fallback = await queryWithoutVariant()
    examRow = fallback.data
    examError = fallback.error
  }

  if (examError) {
    throw new Error(`Khong the tai thong tin de thi: ${examError.message}`)
  }

  if (!examRow) {
    throw new Error('Khong tim thay de thi can chinh sua.')
  }

  const queryQuestionsWithAnswer = () =>
    supabase
      .from('school_exam_questions')
      .select(
        'question_id, exam_id, question_number, difficulty_level, question_type, question_text, correct_answer, statement_json, topic, obsidian_source_path, has_image, metadata, options:school_exam_question_options(option_label, option_text, display_order), assets:school_exam_question_assets(asset_type, asset_path, display_order)',
      )
      .eq('exam_id', examId)
      .order('question_number', { ascending: true })
      .returns<ManagedExamQuestionRow[]>()
  const queryQuestionsWithoutAnswer = () =>
    supabase
      .from('school_exam_questions')
      .select(
        'question_id, exam_id, question_number, difficulty_level, question_type, question_text, statement_json, topic, obsidian_source_path, has_image, metadata, options:school_exam_question_options(option_label, option_text, display_order), assets:school_exam_question_assets(asset_type, asset_path, display_order)',
      )
      .eq('exam_id', examId)
      .order('question_number', { ascending: true })
      .returns<Array<Omit<ManagedExamQuestionRow, 'correct_answer'> & { correct_answer?: string | null }>>()

  let { data: questionRows, error: questionError }: {
    data: Array<ManagedExamQuestionRow | (Omit<ManagedExamQuestionRow, 'correct_answer'> & { correct_answer?: string | null })> | null
    error: Awaited<ReturnType<typeof queryQuestionsWithAnswer>>['error']
  } = await queryQuestionsWithAnswer()

  if (questionError && isMissingCorrectAnswerError(questionError.message)) {
    const fallback = await queryQuestionsWithoutAnswer()
    questionRows = fallback.data
    questionError = fallback.error
  }

  if (questionError) {
    throw new Error(`Khong the tai cau hoi cua de thi: ${questionError.message}`)
  }

  return {
    isValid: true,
    warnings: [],
    examDraft: {
      examId: examRow.exam_id,
      title: examRow.title,
      schoolName: examRow.school_name,
      city: examRow.city,
      subjectCode: examRow.subject_code,
      subjectName: examRow.subject_name,
      year: examRow.year,
      durationMinutes: examRow.duration_minutes,
      variantCode:
        hasDisplayVariantCode && 'display_variant_code' in examRow
          ? ((examRow.display_variant_code as string | null) ?? deriveVariantCodeFromExamId(examRow.exam_id))
          : deriveVariantCodeFromExamId(examRow.exam_id),
      pdfStoragePath: '',
      pdfUrl: examRow.pdf_url,
    },
    questions: (questionRows ?? []).map((question) =>
      normalizeQuestion(
        {
          questionNumber: question.question_number,
          questionType: question.question_type,
          topic: question.topic ?? '',
          questionText: question.question_text,
          options: (question.options ?? []).map((option) => ({
            label: option.option_label,
            text: option.option_text,
          })),
          statements: (question.statement_json ?? []).map((statement) => ({
            label: statement.label as AdminImportStatement['label'],
            text: statement.text,
          })),
          correctAnswer: resolveCorrectAnswer(question.correct_answer, question.metadata),
          isValid: true,
          warnings: [],
          changes: [],
          assets: (question.assets ?? []).map((asset) => ({
            assetType: asset.asset_type,
            assetPath: asset.asset_path,
            publicUrl: asset.asset_path,
          })),
          rawExcerpt: null,
        },
        question.question_number,
      ),
    ),
    rawModelResponse: null,
  } satisfies AdminImportValidationResponse
}

export async function saveManagedImportedExamDraft(input: {
  draft: AdminImportValidationResponse
}) {
  const supabase = getSupabaseBrowserClient()
  const draft = input.draft
  const examId = draft.examDraft.examId

  const issues = getDraftValidationIssues({
    draft,
    pdfFile: new File(['managed-exam'], 'managed-exam.pdf', { type: 'application/pdf' }),
  }).filter((issue) => issue !== 'Chua co file PDF.')

  if (issues.length > 0) {
    throw new Error(issues[0] ?? 'Du lieu de thi chua hop le de cap nhat.')
  }

  const questionsWithUploadedAssets = await uploadQuestionAssets(draft.examDraft, draft.questions)
  const sectionRows = buildSectionRows(examId, questionsWithUploadedAssets)
  const sectionIdByType = new Map(sectionRows.map((section) => [section.part_code, section.section_id]))

  const questionRows = questionsWithUploadedAssets.map((question) => ({
    question_id: buildQuestionId(examId, question.questionNumber),
    exam_id: examId,
    section_id: sectionIdByType.get(question.questionType) ?? null,
    question_number: question.questionNumber,
    difficulty_level: null,
    question_type: question.questionType,
    question_text: question.questionText.trim(),
    correct_answer: question.correctAnswer.trim().toUpperCase(),
    statement_json:
      question.questionType === 'true_false'
        ? question.statements.map((statement) => ({
            label: statement.label,
            text: statement.text.trim(),
          }))
        : [],
    explanation: null,
    topic: question.topic.trim() || null,
    obsidian_source_path: null,
    has_image: question.assets.length > 0,
    metadata: {
      source_question_number: question.questionNumber,
      import_source: 'admin_pdf_dashboard',
      review_status: 'edited_after_import',
      correct_answer_fallback: question.correctAnswer.trim().toUpperCase(),
    },
  }))

  const optionRows = questionsWithUploadedAssets.flatMap((question) => {
    if (question.questionType !== 'multiple_choice') {
      return []
    }

    const questionId = buildQuestionId(examId, question.questionNumber)
    return question.options.map((option, index) => ({
      option_id: `${questionId}-option-${option.label.toLowerCase()}`,
      question_id: questionId,
      option_label: option.label,
      option_text: option.text.trim(),
      display_order: index + 1,
    }))
  })

  const assetRows = questionsWithUploadedAssets.flatMap((question) => {
    const questionId = buildQuestionId(examId, question.questionNumber)
    return question.assets
      .filter((asset) => asset.publicUrl || asset.assetPath)
      .map((asset, index) => ({
        asset_id: `${questionId}-asset-${index + 1}`,
        question_id: questionId,
        asset_type: asset.assetType,
        asset_path: asset.publicUrl ?? asset.assetPath,
        caption: asset.pageNumber ? `Trang ${asset.pageNumber}` : null,
        display_order: index + 1,
      }))
  })

  const examUpdateBase = {
    title: draft.examDraft.title,
    school_name: draft.examDraft.schoolName,
    city: draft.examDraft.city,
    subject_code: draft.examDraft.subjectCode,
    subject_name: draft.examDraft.subjectName,
    year: draft.examDraft.year,
    duration_minutes: draft.examDraft.durationMinutes,
    answer_key_provided: questionsWithUploadedAssets.every((question) =>
      Boolean(question.correctAnswer.trim()),
    ),
  }
  let { error: examUpdateError } = await supabase
    .from('school_exams')
    .update({
      ...examUpdateBase,
      display_variant_code: draft.examDraft.variantCode || 'DEFAULT',
    })
    .eq('exam_id', examId)

  if (examUpdateError && isMissingDisplayVariantCodeError(examUpdateError.message)) {
    const fallback = await supabase.from('school_exams').update(examUpdateBase).eq('exam_id', examId)
    examUpdateError = fallback.error
  }

  if (examUpdateError) {
    throw new Error(`Khong the cap nhat thong tin tong cua de: ${examUpdateError.message}`)
  }

  const { error: questionDeleteError } = await supabase
    .from('school_exam_questions')
    .delete()
    .eq('exam_id', examId)

  if (questionDeleteError) {
    throw new Error(`Khong the lam moi cau hoi cu: ${questionDeleteError.message}`)
  }

  const { error: sectionDeleteError } = await supabase
    .from('school_exam_sections')
    .delete()
    .eq('exam_id', examId)

  if (sectionDeleteError) {
    throw new Error(`Khong the lam moi phan de thi cu: ${sectionDeleteError.message}`)
  }

  if (sectionRows.length > 0) {
    const { error: sectionInsertError } = await supabase.from('school_exam_sections').insert(sectionRows)
    if (sectionInsertError) {
      throw new Error(`Khong the luu lai cac phan de thi: ${sectionInsertError.message}`)
    }
  }

  const questionInsertError = await insertSchoolExamQuestions(supabase, questionRows)

  if (questionInsertError) {
    throw new Error(`Khong the luu cau hoi moi: ${questionInsertError.message}`)
  }

  if (optionRows.length > 0) {
    const { error: optionInsertError } = await supabase
      .from('school_exam_question_options')
      .insert(optionRows)
    if (optionInsertError) {
      throw new Error(`Khong the luu dap an lua chon: ${optionInsertError.message}`)
    }
  }

  if (assetRows.length > 0) {
    const { error: assetInsertError } = await supabase
      .from('school_exam_question_assets')
      .insert(assetRows)
    if (assetInsertError) {
      throw new Error(`Khong the luu hinh anh cau hoi: ${assetInsertError.message}`)
    }
  }
}

export async function deleteManagedImportedExam(input: {
  examId: string
  subjectCode: SubjectCode
  year: number
}) {
  const supabase = getSupabaseBrowserClient()
  const storagePrefix = `${input.subjectCode}/${input.year}/${input.examId}`

  try {
    await removeStoragePrefix(storagePrefix)
  } catch {
    // Keep delete resilient even if some orphaned files cannot be removed from Storage.
  }

  const { error } = await supabase.from('school_exams').delete().eq('exam_id', input.examId)
  if (error) {
    throw new Error(`Khong the xoa de thi: ${error.message}`)
  }
}

function normalizeValidationResponse(payload: AdminImportValidationResponse): AdminImportValidationResponse {
  return {
    ...payload,
    warnings: Array.isArray(payload.warnings) ? payload.warnings : [],
    questions: (payload.questions ?? []).map((question, index) =>
      normalizeQuestion(question, index + 1),
    ),
  }
}

async function insertSchoolExamRow(
  supabase: ReturnType<typeof getSupabaseBrowserClient>,
  examBaseRow: Record<string, unknown>,
  variantCode: string,
) {
  const withVariantResult = await supabase.from('school_exams').insert({
    ...examBaseRow,
    display_variant_code: variantCode,
  })

  if (!withVariantResult.error || !isMissingDisplayVariantCodeError(withVariantResult.error.message)) {
    return withVariantResult.error
  }

  const fallbackResult = await supabase.from('school_exams').insert(examBaseRow)
  return fallbackResult.error
}

async function insertSchoolExamQuestions(
  supabase: ReturnType<typeof getSupabaseBrowserClient>,
  questionRows: Array<Record<string, unknown>>,
) {
  const withAnswerResult = await supabase.from('school_exam_questions').insert(questionRows)
  if (!withAnswerResult.error || !isMissingCorrectAnswerError(withAnswerResult.error.message)) {
    return withAnswerResult.error
  }

  const fallbackRows = questionRows.map(({ correct_answer: _correctAnswer, ...row }) => row)
  const fallbackResult = await supabase.from('school_exam_questions').insert(fallbackRows)
  return fallbackResult.error
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
  metadata: Record<string, unknown> | null | undefined,
) {
  if (typeof directAnswer === 'string' && directAnswer.trim()) {
    return directAnswer
  }

  const metadataAnswer = metadata?.correct_answer_fallback
  return typeof metadataAnswer === 'string' ? metadataAnswer : ''
}

function deriveVariantCodeFromExamId(examId: string, fallback = '101') {
  const segments = examId
    .split('-')
    .map((segment) => segment.trim())
    .filter(Boolean)
  return segments.at(-1)?.toUpperCase() ?? fallback
}

async function removeStoragePrefix(prefix: string) {
  const supabase = getSupabaseBrowserClient()
  const directFiles = await listStoragePaths(prefix)
  const assetFiles = await listStoragePaths(`${prefix}/assets`)
  const allPaths = Array.from(new Set([...directFiles, ...assetFiles]))

  if (allPaths.length === 0) {
    return
  }

  const { error } = await supabase.storage.from(STORAGE_BUCKET).remove(allPaths)
  if (error) {
    throw new Error(`Khong the xoa file Storage cua de thi: ${error.message}`)
  }
}

async function listStoragePaths(prefix: string) {
  const supabase = getSupabaseBrowserClient()
  const normalizedPrefix = prefix.replace(/^\/+/, '').replace(/\/+$/, '')
  const segments = normalizedPrefix.split('/')
  const path = segments.slice(0, -1).join('/')
  const search = segments[segments.length - 1]

  const { data, error } = await supabase.storage.from(STORAGE_BUCKET).list(path, {
    limit: 100,
    search,
  })

  if (error) {
    throw new Error(`Khong the doc file Storage cua de thi: ${error.message}`)
  }

  return (data ?? [])
    .filter((item) => item.name && !item.id?.endsWith('/'))
    .map((item) => (path ? `${path}/${item.name}` : item.name))
}

function normalizeQuestion(question: AdminImportQuestion, fallbackNumber: number): AdminImportQuestion {
  const optionMap = new Map(
    (Array.isArray(question.options) ? question.options : []).map((option) => [
      String(option.label).trim().toUpperCase(),
      String(option.text ?? '').trim(),
    ]),
  )
  const statementMap = new Map(
    (Array.isArray(question.statements) ? question.statements : []).map((statement) => [
      String(statement.label).trim().toLowerCase(),
      String(statement.text ?? '').trim(),
    ]),
  )

  const questionType = ['multiple_choice', 'true_false', 'short_answer'].includes(
    question.questionType,
  )
    ? question.questionType
    : 'multiple_choice'

  return {
    questionNumber: Number(question.questionNumber) || fallbackNumber,
    questionType,
    topic: String(question.topic ?? '').trim(),
    questionText: String(question.questionText ?? '').trim(),
    options:
      questionType === 'multiple_choice'
        ? (['A', 'B', 'C', 'D'] as const).map((label) => ({
            label,
            text: optionMap.get(label) ?? '',
          }))
        : [],
    statements:
      questionType === 'true_false'
        ? (['a', 'b', 'c', 'd'] as const).map((label) => ({
            label,
            text: statementMap.get(label) ?? '',
          }))
        : [],
    correctAnswer: String(question.correctAnswer ?? '').trim().toUpperCase(),
    isValid: Boolean(question.isValid),
    warnings: Array.isArray(question.warnings) ? question.warnings : [],
    changes: Array.isArray(question.changes) ? question.changes : [],
    assets: Array.isArray(question.assets)
      ? question.assets.filter((asset) => asset.assetType !== 'question_block')
      : [],
    rawExcerpt: question.rawExcerpt ?? null,
  }
}

function buildSectionRows(examId: string, questions: AdminImportQuestion[]) {
  const order: SectionPart[] = ['multiple_choice', 'true_false', 'short_answer']
  return order
    .map((partCode, index) => {
      const partQuestions = questions
        .filter((question) => question.questionType === partCode)
        .sort((left, right) => left.questionNumber - right.questionNumber)
      if (partQuestions.length === 0) {
        return null
      }

      return {
        section_id: `${examId}-section-${partCode}`,
        exam_id: examId,
        part_code: partCode,
        title:
          partCode === 'multiple_choice'
            ? 'Phan I. Trac nghiem nhieu lua chon'
            : partCode === 'true_false'
              ? 'Phan II. Dung sai'
              : 'Phan III. Tra loi ngan',
        instructions:
          partCode === 'multiple_choice'
            ? 'Moi cau chon 1 trong 4 dap an.'
            : partCode === 'true_false'
              ? 'Moi cau gom 4 menh de dung/sai.'
              : 'Nhap dap an ngan.',
        start_question_number: partQuestions[0].questionNumber,
        end_question_number: partQuestions[partQuestions.length - 1].questionNumber,
        display_order: index + 1,
        options_per_question: partCode === 'multiple_choice' ? 4 : 0,
        statement_count: partCode === 'true_false' ? 4 : 0,
      }
    })
    .filter((section) => section !== null)
}

async function uploadPdfFile(file: File, storagePath: string) {
  const supabase = getSupabaseBrowserClient()
  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(storagePath, file, {
    cacheControl: '3600',
    contentType: 'application/pdf',
    upsert: true,
  })

  if (error) {
    throw new Error(buildStorageUploadErrorMessage('PDF', error.message))
  }

  return getStoragePublicUrl(storagePath)
}

async function uploadQuestionAssets(examDraft: AdminExamDraft, questions: AdminImportQuestion[]) {
  const supabase = getSupabaseBrowserClient()
  const nextQuestions: AdminImportQuestion[] = []

  for (const question of questions) {
    const nextAssets: AdminImportAsset[] = []
    for (const asset of question.assets) {
      if (!asset.assetDataUrl) {
        nextAssets.push(asset)
        continue
      }

      const storagePath = normalizeAssetStoragePath(examDraft, asset.assetPath)
      const blob = dataUrlToBlob(asset.assetDataUrl)
      const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(storagePath, blob, {
        cacheControl: '3600',
        contentType: blob.type || 'image/png',
        upsert: true,
      })

      if (error) {
        throw new Error(buildStorageUploadErrorMessage(`asset cau ${question.questionNumber}`, error.message))
      }

      nextAssets.push({
        ...asset,
        assetPath: storagePath,
        publicUrl: getStoragePublicUrl(storagePath),
      })
    }

    nextQuestions.push({
      ...question,
      assets: nextAssets,
    })
  }

  return nextQuestions
}

function buildStorageUploadErrorMessage(target: string, message: string) {
  if (message.toLowerCase().includes('bucket not found')) {
    return `Khong the upload ${target}: bucket "${STORAGE_BUCKET}" chua ton tai. Hay chay web-app/supabase/setup_school_exam_storage_bucket.sql trong Supabase SQL Editor.`
  }

  return `Khong the upload ${target} len Storage: ${message}`
}

function normalizeAssetStoragePath(examDraft: AdminExamDraft, assetPath: string) {
  const normalizedPath = assetPath.replace(/^\/+/, '')
  const expectedPrefix = `${examDraft.subjectCode}/${examDraft.year}/${examDraft.examId}/`
  if (normalizedPath.startsWith(expectedPrefix)) {
    return normalizedPath
  }

  const assetSuffix = normalizedPath.includes('/assets/')
    ? `assets/${normalizedPath.split('/assets/').pop() ?? ''}`
    : normalizedPath.replace(/^.*?assets\//, 'assets/')

  return `${expectedPrefix}${assetSuffix}`
}

function getStoragePublicUrl(path: string) {
  const supabase = getSupabaseBrowserClient()
  return supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path).data.publicUrl
}

function dataUrlToBlob(dataUrl: string) {
  const [metadata, base64Data] = dataUrl.split(',')
  const contentType = metadata.match(/data:(.*?);base64/)?.[1] ?? 'image/png'
  const binary = window.atob(base64Data)
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }
  return new Blob([bytes], { type: contentType })
}

function buildQuestionId(examId: string, questionNumber: number) {
  return `${examId}-q${String(questionNumber).padStart(2, '0')}`
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}
