import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ Thiếu SUPABASE_URL / SUPABASE_ANON_KEY")
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function main() {
  const subjectCodes = ['VAT_LY', 'HOA_HOC']
  console.log(`Bắt đầu xóa câu hỏi ôn tập cho các môn: ${subjectCodes.join(', ')}`)

  for (const subjectCode of subjectCodes) {
    const { data: exams, error } = await supabase
      .from('school_exams')
      .select('exam_id')
      .eq('subject_code', subjectCode)
      .like('exam_id', 'supplemental-%-manual')

    if (error) {
      console.error(error)
      continue
    }

    if (!exams || exams.length === 0) {
      console.log(`Không tìm thấy đề nào cho môn ${subjectCode}.`)
      continue
    }

    console.log(`Môn ${subjectCode}: Tìm thấy ${exams.length} chuyên đề cần xóa.`)

    for (const exam of exams) {
      const examId = exam.exam_id
      
      const { data: questions } = await supabase
        .from('school_exam_questions')
        .select('question_id')
        .eq('exam_id', examId)

      if (questions && questions.length > 0) {
        console.log(`  - Exam ${examId}: Xóa ${questions.length} câu hỏi.`)
        for (const q of questions) {
          await supabase.from('school_exam_question_options').delete().eq('question_id', q.question_id)
          await supabase.from('school_exam_question_assets').delete().eq('question_id', q.question_id)
        }
      }

      await supabase.from('school_exam_questions').delete().eq('exam_id', examId)
      await supabase.from('school_exams').delete().eq('exam_id', examId)
      
      console.log(`  ✅ Đã xóa hoàn toàn ${examId}`)
    }
  }
}

main().catch(console.error)
