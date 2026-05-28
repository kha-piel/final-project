import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
const GEMINI_API_KEY = process.env.GEMINI_API_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ Thiếu SUPABASE_URL / SUPABASE_ANON_KEY")
  process.exit(1)
}

if (!GEMINI_API_KEY) {
  console.error("❌ Thiếu GEMINI_API_KEY")
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const TOPICS = {
  VAT_LY: [
    'Vật lí nhiệt',
    'Khí lí tưởng',
    'Từ trường',
    'Vật lí hạt nhân',
    'Dao động cơ',
    'Sóng cơ và sóng âm',
    'Dòng điện xoay chiều',
    'Dao động và sóng điện từ',
    'Sóng ánh sáng',
    'Lượng tử ánh sáng',
  ],
  HOA_HOC: [
    'Ester – Lipid',
    'Carbohydrate',
    'Hợp chất chứa nitrogen',
    'Polymer',
    'Pin điện và điện phân',
    'Đại cương về kim loại',
    'Nguyên tố nhóm IA và nhóm IIA',
    'Sơ lược về dãy kim loại chuyển tiếp thứ nhất và phức chất',
    'Sắt và một số kim loại quan trọng',
  ]
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

async function generateQuestions(subjectCode: string, topic: string) {
  const subjectName = subjectCode === 'VAT_LY' ? 'Vật Lý' : 'Hóa Học'
  const prompt = `Bạn là một giáo viên chuyên ra đề thi THPT Quốc Gia môn ${subjectName} theo định hướng đổi mới năm 2025 của Bộ GD&ĐT Việt Nam.
Hãy tạo 10 câu hỏi trắc nghiệm (Phần 1: Trắc nghiệm nhiều lựa chọn, 4 đáp án A, B, C, D) cho chuyên đề: "${topic}".
Mức độ: Phân bổ từ Nhận biết, Thông hiểu đến Vận dụng. Nội dung phải chuẩn xác, KHÔNG sử dụng ký hiệu \`\\\` cho ngoặc đơn hoặc ngoặc nhọn, viết LaTeX bình thường. 

Chỉ trả về ĐÚNG MỘT MẢNG JSON, KHÔNG CÓ BẤT KỲ VĂN BẢN NÀO KHÁC BÊN NGOÀI (không markdown, không code block).
Định dạng JSON:
[
  {
    "question_text": "Nội dung câu hỏi...",
    "correct_answer": "A",
    "options": [
      {"label": "A", "text": "Nội dung đáp án A"},
      {"label": "B", "text": "Nội dung đáp án B"},
      {"label": "C", "text": "Nội dung đáp án C"},
      {"label": "D", "text": "Nội dung đáp án D"}
    ]
  }
]`

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.1 }
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })

  if (!res.ok) {
    throw new Error(`API Error: ${await res.text()}`)
  }

  const data = await res.json()
  let text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
  
  if (text.startsWith('```json')) text = text.slice(7)
  else if (text.startsWith('```')) text = text.slice(3)
  if (text.endsWith('```')) text = text.slice(0, -3)
  
  text = text.trim()
  try {
    return JSON.parse(text)
  } catch (e) {
    // Try some basic cleanup if JSON parse fails
    text = text.replace(/\\/g, '\\\\').replace(/\\\\"/g, '\\"').replace(/\\\\n/g, '\\n')
    return JSON.parse(text)
  }
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function main() {
  for (const [subjectCode, topics] of Object.entries(TOPICS)) {
    const subjectName = subjectCode === 'VAT_LY' ? 'Vật Lý' : 'Hóa Học'
    for (const topic of topics) {
      console.log(`\n[${subjectName}] Đang tạo 10 câu hỏi cho chuyên đề: ${topic}...`)
      const examId = `supplemental-${slugify(topic)}-manual`
      
      const { data: existing } = await supabase
        .from('exams')
        .select('exam_id')
        .eq('exam_id', examId)

      if (existing && existing.length > 0) {
        console.log(`  -> Bỏ qua, chuyên đề này đã có dữ liệu (exam_id: ${examId})`)
        continue
      }
      
      try {
        const questions = await generateQuestions(subjectCode, topic)
        if (!questions || questions.length === 0) {
          console.log(`  -> Lỗi: AI không trả về đủ câu hỏi.`)
          continue
        }
        
        console.log(`  -> Đang lưu vào CSDL...`)
        const { error: insertExamError } = await supabase.from('exams').insert({
          exam_id: examId,
          title: `Ôn tập: ${topic}`,
          school_name: 'Hệ Thống',
          city: 'Toàn Quốc',
          subject_code: subjectCode,
          subject_name: subjectName,
          year: 2025,
          duration_minutes: 15,
          display_variant_code: 'REV',
          pdf_url: '',
          is_active: true
        })
        if (insertExamError) throw new Error(`Insert exam failed: ${insertExamError.message}`)
        
        for (let i = 0; i < questions.length; i++) {
          const q = questions[i]
          const questionNumber = i + 1
          const questionId = `${examId}-q${questionNumber.toString().padStart(2, '0')}`
          
          const { error: insertQuestionError } = await supabase.from('questions').insert({
            question_id: questionId,
            exam_id: examId,
            topic: topic,
            question_number: questionNumber,
            question_type: 'multiple_choice',
            question_text: q.question_text,
            correct_answer: q.correct_answer.toUpperCase(),
            metadata: { ai_generated: true, correct_answer_fallback: q.correct_answer.toUpperCase() }
          })
          if (insertQuestionError) throw new Error(`Insert question failed: ${insertQuestionError.message}`)
          
          const optionsToInsert = q.options.map((opt: any, idx: number) => ({
            option_id: `${questionId}-option-${opt.label.toLowerCase()}`,
            question_id: questionId,
            option_label: opt.label.toUpperCase(),
            option_text: opt.text,
            display_order: idx + 1
          }))
          
          if (optionsToInsert.length > 0) {
            const { error: insertOptionsError } = await supabase.from('question_options').insert(optionsToInsert)
            if (insertOptionsError) throw new Error(`Insert options failed: ${insertOptionsError.message}`)
          }
        }
        console.log(`  ✅ Đã lưu ${questions.length} câu hỏi cho chuyên đề ${topic}.`)
        await sleep(1500)
      } catch (err: any) {
        console.error(`  -> Lỗi: ${err.message}`)
      }
    }
  }
}

main().catch(console.error)
