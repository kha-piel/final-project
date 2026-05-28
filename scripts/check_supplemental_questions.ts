import { createClient } from '@supabase/supabase-js'

const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || ''
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''
const supabase = createClient(url, key)

async function main() {
  const { data } = await supabase
    .from('exams')
    .select('exam_id, subject_code, title')
    .like('exam_id', 'supplemental-%')
    .order('subject_code')
  
  console.log('Supplemental Exams in DB:')
  for (const e of data || []) {
    const { count } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true })
      .eq('exam_id', e.exam_id)
    console.log(`  [${e.subject_code}] ${e.exam_id} => "${e.title}" (${count} questions)`)
  }
}

main().catch(console.error)
