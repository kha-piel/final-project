import { getSupabaseBrowserClient } from '../../../lib/supabase/client'
import {
  type AdminImportAsset,
  type AdminImportOption,
  type AdminImportStatement,
  type AdminQuestionType,
  type SubjectCode,
} from './admin-import-service'
import { type ReviewImportMetadata } from './import-review-service'

export type ManagedReviewQuestion = {
  questionId: string
  examId: string
  questionNumber: number
  questionType: AdminQuestionType
  questionText: string
  topic: string
  options: AdminImportOption[]
  statements: AdminImportStatement[]
  correctAnswer: string
  obsidianSourcePath: string
  assets: AdminImportAsset[]
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

export async function fetchReviewTopics(subjectCode: SubjectCode): Promise<string[]> {
  const supabase = getSupabaseBrowserClient()
  
  // Find all exams for this subject that have exam_id starting with 'supplemental-'
  const { data, error } = await supabase
    .from('exams')
    .select('title')
    .eq('subject_code', subjectCode)
    .like('exam_id', 'supplemental-%')
    
  if (error) {
    throw new Error(`Lỗi khi lấy danh sách chuyên đề: ${error.message}`)
  }
  
  // Extract topic from titles:
  //   "Ôn tập: [Topic Name]" (Lý/Hóa manual)
  //   "Bộ câu [topic] đã rà soát" (Toán reviewed)
  //   "Bộ câu bổ sung ôn tập [topic]" (Toán supplemental)
  const topics = data
    .map(row => {
      let t = row.title
      t = t.replace(/^Ôn tập:\s*/, '')
      t = t.replace(/^Bộ câu bổ sung ôn tập\s*/, '')
      t = t.replace(/^Bộ câu\s*/, '')
      t = t.replace(/\s*đã rà soát$/, '')
      return t.trim()
    })
    .filter(Boolean)
    
  return Array.from(new Set(topics))
}

export async function fetchReviewQuestionsByTopic(metadata: ReviewImportMetadata): Promise<ManagedReviewQuestion[]> {
  const supabase = getSupabaseBrowserClient()
  const topicSlug = slugify(metadata.topicName || 'unknown-topic')
  const examIdPattern = `supplemental-${topicSlug}%`
  
  const { data, error } = await supabase
    .from('questions')
    .select(`
      question_id, 
      exam_id, 
      question_number, 
      question_type, 
      question_text, 
      correct_answer, 
      statement_json, 
      topic, 
      obsidian_source_path,
      metadata,
      options:question_options(option_label, option_text, display_order), 
      assets:question_assets(asset_type, asset_path, display_order)
    `)
    .like('exam_id', examIdPattern)
    .order('question_number', { ascending: true })
    
  if (error) {
    throw new Error(`Lỗi khi lấy danh sách câu hỏi: ${error.message}`)
  }
  
  return (data || []).map(row => {
    // Determine fallback answer if missing
    let answer = row.correct_answer
    if (!answer && row.metadata && typeof row.metadata === 'object' && 'correct_answer_fallback' in row.metadata) {
       answer = row.metadata.correct_answer_fallback as string
    }
    
    return {
      questionId: row.question_id,
      examId: row.exam_id,
      questionNumber: row.question_number,
      questionType: row.question_type as AdminQuestionType,
      questionText: row.question_text || '',
      topic: row.topic || metadata.topicName,
      correctAnswer: answer || '',
      obsidianSourcePath: row.obsidian_source_path || '',
      options: (row.options || []).map((o: any) => ({
        label: o.option_label,
        text: o.option_text
      })),
      statements: (row.statement_json || []).map((s: any) => ({
        label: s.label,
        text: s.text
      })),
      assets: (row.assets || []).map((a: any) => ({
        assetType: a.asset_type,
        assetPath: a.asset_path,
        publicUrl: a.asset_path
      }))
    }
  })
}

export async function deleteReviewQuestion(questionId: string): Promise<void> {
  const supabase = getSupabaseBrowserClient()
  
  // Since we don't know if foreign keys cascade, we should delete options and assets first
  await supabase.from('question_options').delete().eq('question_id', questionId)
  await supabase.from('question_assets').delete().eq('question_id', questionId)
  
  const { error } = await supabase.from('questions').delete().eq('question_id', questionId)
  if (error) {
    throw new Error(`Lỗi khi xóa câu hỏi: ${error.message}`)
  }
}

export async function updateReviewQuestion(question: ManagedReviewQuestion): Promise<void> {
  const supabase = getSupabaseBrowserClient()
  
  const questionRow = {
    question_text: question.questionText.trim(),
    correct_answer: question.correctAnswer.trim().toUpperCase(),
    statement_json: question.questionType === 'true_false' ? question.statements : [],
    obsidian_source_path: question.obsidianSourcePath.trim() || null,
    metadata: {
      correct_answer_fallback: question.correctAnswer.trim().toUpperCase()
    }
  }
  
  const { error: updateError } = await supabase
    .from('questions')
    .update(questionRow)
    .eq('question_id', question.questionId)
    
  if (updateError) {
    throw new Error(`Lỗi khi cập nhật câu hỏi: ${updateError.message}`)
  }
  
  // Update options if multiple choice
  if (question.questionType === 'multiple_choice') {
    // Delete existing options
    await supabase.from('question_options').delete().eq('question_id', question.questionId)
    
    // Insert new options
    const optionRows = question.options.map((opt, i) => ({
      option_id: `${question.questionId}-option-${opt.label.toLowerCase()}`,
      question_id: question.questionId,
      option_label: opt.label,
      option_text: opt.text.trim(),
      display_order: i + 1
    }))
    
    if (optionRows.length > 0) {
      const { error: optError } = await supabase.from('question_options').insert(optionRows)
      if (optError) {
        throw new Error(`Lỗi khi cập nhật đáp án: ${optError.message}`)
      }
    }
  }
}
