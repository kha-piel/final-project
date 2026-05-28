import { createClient } from '@supabase/supabase-js'

const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || ''
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''
const supabase = createClient(url, key)

async function main() {
  // Check ALL exams
  const { data } = await supabase
    .from('exams')
    .select('exam_id, subject_code, subject_name, title')
    .order('subject_code')
  
  console.log('ALL exams in DB:')
  data?.forEach(e => console.log(`  [${e.subject_code}] ${e.exam_id} => "${e.title}"`))
  
  // Check questions by subject
  const { data: q, count } = await supabase
    .from('questions')
    .select('topic, exam_id', { count: 'exact' })
    .like('exam_id', '%vat-li%')
    .limit(3)
  console.log('\nVật Lý questions:', count, q)

  const { data: q2, count: c2 } = await supabase
    .from('questions')
    .select('topic, exam_id', { count: 'exact' })
    .like('exam_id', '%hoa%')
    .limit(3)
  console.log('Hóa Học questions:', c2, q2)
}

main().catch(console.error)
