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

type SaveAdminImportedExamInput = {
  pdfFile: File
  draft: AdminImportValidationResponse
}

type SectionPart = AdminQuestionType

const STORAGE_BUCKET = 'school-exams'

export const subjectOptions: Array<{
  code: SubjectCode
  name: string
  durationMinutes: string
}> = [
  { code: 'TOAN', name: 'Toan hoc', durationMinutes: '50' },
  { code: 'VAT_LY', name: 'Vat ly', durationMinutes: '50' },
  { code: 'HOA_HOC', name: 'Hoa hoc', durationMinutes: '50' },
]

export function createEmptyMetadata(): AdminImportMetadata {
  return {
    schoolName: '',
    city: '',
    subjectCode: 'TOAN',
    subjectName: 'Toan hoc',
    year: String(new Date().getFullYear()),
    variantCode: '101',
    durationMinutes: '50',
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
  const variantId = `${examId}-${slugify(draft.examDraft.variantCode)}`
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

  const examRow = {
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

  const variantRow = {
    variant_id: variantId,
    exam_id: examId,
    variant_code: draft.examDraft.variantCode,
    display_order: 1,
  }

  const answerKeyRows = questionsWithUploadedAssets.map((question) => ({
    variant_id: variantId,
    question_number: question.questionNumber,
    answer_value: question.correctAnswer.trim().toUpperCase(),
  }))

  const questionRows = questionsWithUploadedAssets.map((question) => ({
    question_id: buildQuestionId(examId, question.questionNumber),
    exam_id: examId,
    section_id: sectionIdByType.get(question.questionType) ?? null,
    question_number: question.questionNumber,
    difficulty_level: null,
    question_type: question.questionType,
    question_text: question.questionText.trim(),
    statement_json:
      question.questionType === 'true_false'
        ? question.statements.map((statement) => ({
            label: statement.label,
            text: statement.text.trim(),
          }))
        : [],
    explanation: null,
    topic: null,
    obsidian_source_path: null,
    has_image: question.assets.length > 0,
    metadata: {
      source_question_number: question.questionNumber,
      import_source: 'admin_pdf_dashboard',
      review_status: 'pending_review',
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
    const { error: examError } = await supabase.from('school_exams').insert(examRow)
    if (examError) {
      throw new Error(`Khong the tao school_exams: ${examError.message}`)
    }
    hasInsertedExam = true

    const { error: sectionError } = await supabase.from('school_exam_sections').insert(sectionRows)
    if (sectionError) {
      throw new Error(`Khong the tao school_exam_sections: ${sectionError.message}`)
    }

    const { error: variantError } = await supabase.from('school_exam_variants').insert(variantRow)
    if (variantError) {
      throw new Error(`Khong the tao school_exam_variants: ${variantError.message}`)
    }

    const { error: answerKeyError } = await supabase
      .from('school_exam_answer_keys')
      .insert(answerKeyRows)
    if (answerKeyError) {
      throw new Error(`Khong the tao school_exam_answer_keys: ${answerKeyError.message}`)
    }

    const { error: questionsError } = await supabase
      .from('school_exam_questions')
      .insert(questionRows)
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

function normalizeValidationResponse(payload: AdminImportValidationResponse): AdminImportValidationResponse {
  return {
    ...payload,
    warnings: Array.isArray(payload.warnings) ? payload.warnings : [],
    questions: (payload.questions ?? []).map((question, index) =>
      normalizeQuestion(question, index + 1),
    ),
  }
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
