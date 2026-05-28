import { getSupabaseBrowserClient } from '../../../lib/supabase/client'
import {
  buildQuestionId,
  buildSectionRows,
  insertSchoolExamRow,
  subjectOptions,
  uploadQuestionAssets,
  type AdminExamDraft,
  type AdminImportAsset,
  type AdminImportOption,
  type AdminImportStatement,
  type AdminQuestionType,
  type SubjectCode,
} from './admin-import-service'
import { getQuestionValidationIssues } from './admin-import-service'

export type ReviewImportMetadata = {
  subjectCode: SubjectCode
  subjectName: string
  topicName: string
}

export type ReviewQuestionDraft = {
  questionNumber: number
  questionType: AdminQuestionType
  questionText: string
  options: AdminImportOption[]
  statements: AdminImportStatement[]
  correctAnswer: string
  obsidianSourcePath: string
  assets: AdminImportAsset[]
}

export function createEmptyReviewMetadata(): ReviewImportMetadata {
  const defaultSubject = subjectOptions[0]
  return {
    subjectCode: defaultSubject.code,
    subjectName: defaultSubject.name,
    topicName: '',
  }
}

function slugify(text: string) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function buildReviewExamId(metadata: ReviewImportMetadata) {
  const topicSlug = slugify(metadata.topicName || 'unknown-topic')
  return `supplemental-${topicSlug}-manual`
}

export async function saveReviewQuestions(input: {
  metadata: ReviewImportMetadata
  questions: ReviewQuestionDraft[]
}) {
  const supabase = getSupabaseBrowserClient()
  const examId = buildReviewExamId(input.metadata)

  const { data: existingExam, error: existingExamError } = await supabase
    .from('exams')
    .select('exam_id')
    .eq('exam_id', examId)
    .maybeSingle<{ exam_id: string }>()

  if (existingExamError) {
    throw new Error(`Không thể kiểm tra exam_id tồn tại: ${existingExamError.message}`)
  }

  // We will upsert the exam row to make sure it exists
  const examBaseRow = {
    exam_id: examId,
    title: `Ôn tập: ${input.metadata.topicName}`,
    school_name: 'Nội bộ hệ thống',
    city: 'Hệ thống',
    subject_code: input.metadata.subjectCode,
    subject_name: input.metadata.subjectName,
    year: new Date().getFullYear(),
    duration_minutes: 0,
    pdf_url: '',
    answer_key_provided: input.questions.every((question) =>
      Boolean(question.correctAnswer.trim()),
    ),
    source_path: `admin-review-import:${examId}`,
    tags: ['supplemental', 'knowledge-review', 'manual-import'],
    is_active: true,
  }

  // Map ReviewQuestionDraft to AdminImportQuestion to reuse helpers
  const adminImportQuestions = input.questions.map((q) => ({
    questionNumber: q.questionNumber,
    questionType: q.questionType,
    topic: input.metadata.topicName,
    questionText: q.questionText,
    options: q.options,
    statements: q.statements,
    correctAnswer: q.correctAnswer,
    obsidianSourcePath: q.obsidianSourcePath,
    isValid: true,
    warnings: [],
    changes: [],
    assets: q.assets,
  }))

  const mockExamDraft: AdminExamDraft = {
    examId,
    title: examBaseRow.title,
    schoolName: examBaseRow.school_name,
    city: examBaseRow.city,
    subjectCode: examBaseRow.subject_code,
    subjectName: examBaseRow.subject_name,
    year: examBaseRow.year,
    durationMinutes: examBaseRow.duration_minutes,
    variantCode: 'DEFAULT',
    pdfStoragePath: '',
    pdfUrl: '',
  }

  const questionsWithUploadedAssets = await uploadQuestionAssets(mockExamDraft, adminImportQuestions)

  const sectionRows = buildSectionRows(examId, questionsWithUploadedAssets)
  const sectionIdByType = new Map(sectionRows.map((section) => [section.part_code, section.section_id]))

  const questionRows = questionsWithUploadedAssets.map((question) => ({
    question_id: buildQuestionId(examId, question.questionNumber),
    exam_id: examId,
    section_id: sectionIdByType.get(question.questionType) ?? null,
    question_number: question.questionNumber,
    difficulty_level: null, // intentionally left null
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
    obsidian_source_path: question.obsidianSourcePath?.trim() || null,
    has_image: question.assets.length > 0,
    metadata: {
      source_question_number: question.questionNumber,
      import_source: 'manual_review_import',
      review_status: 'reviewed',
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

  // Start executing the save
  if (!existingExam) {
    const examError = await insertSchoolExamRow(supabase, examBaseRow, 'DEFAULT')
    if (examError) {
      throw new Error(`Không thể tạo bảng school_exams: ${examError.message}`)
    }

    // Insert sections if exam is newly created
    const { error: sectionError } = await supabase.from('exam_sections').insert(sectionRows)
    if (sectionError) {
      throw new Error(`Không thể tạo exam_sections: ${sectionError.message}`)
    }
  } else {
    // If the exam already exists, we ensure sections exist (upsert)
    if (sectionRows.length > 0) {
      const { error: sectionUpsertError } = await supabase
        .from('exam_sections')
        .upsert(sectionRows, { onConflict: 'section_id' })
      if (sectionUpsertError) {
        throw new Error(`Không thể cập nhật exam_sections: ${sectionUpsertError.message}`)
      }
    }
  }

  // Delete existing questions with the same question_number to allow replace/update
  // Wait, the user wants to add to the existing question bank. We should just append.
  // We need to resolve question numbers properly. If they already exist, it will conflict on question_id.
  
  // So instead of strictly appending blind, we upsert based on question_id
  const { error: questionsUpsertError } = await supabase.from('questions').upsert(questionRows, { onConflict: 'question_id' })
  if (questionsUpsertError) {
    throw new Error(`Không thể lưu school_exam_questions: ${questionsUpsertError.message}`)
  }

  // Clean old options and assets for these specific questions before inserting new ones
  if (questionRows.length > 0) {
      const questionIds = questionRows.map(q => q.question_id)
      
      await supabase.from('question_options').delete().in('question_id', questionIds)
      if (optionRows.length > 0) {
        const { error: optionsError } = await supabase
          .from('question_options')
          .insert(optionRows)
        if (optionsError) {
          throw new Error(`Không thể lưu question_options: ${optionsError.message}`)
        }
      }

      await supabase.from('question_assets').delete().in('question_id', questionIds)
      if (assetRows.length > 0) {
        const { error: assetsError } = await supabase
          .from('question_assets')
          .insert(assetRows)
        if (assetsError) {
          throw new Error(`Không thể lưu question_assets: ${assetsError.message}`)
        }
      }
  }

  return {
    examId,
    questionCount: questionsWithUploadedAssets.length,
  }
}

export { getQuestionValidationIssues as getReviewQuestionValidationIssues }
