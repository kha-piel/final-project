import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const webAppRoot = path.resolve(__dirname, '..')
const envPath = path.join(webAppRoot, '.env')

const envMap = Object.fromEntries(
  fs
    .readFileSync(envPath, 'utf8')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#') && line.includes('='))
    .map((line) => {
      const separatorIndex = line.indexOf('=')
      return [line.slice(0, separatorIndex), line.slice(separatorIndex + 1)]
    }),
)

const supabaseUrl = envMap.VITE_SUPABASE_URL
const supabaseAnonKey = envMap.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in web-app/.env')
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

const PAGE_SIZE = 500

const topicMapByExamId = {
  'chuyen-le-khiet-quang-2025': {
    7: 'Quan he vuong goc va khoi da dien',
    9: 'Khao sat ham so, cuc tri va GTLN/GTNN',
    13: 'Khao sat ham so, cuc tri va GTLN/GTNN',
  },
  'so-gddt-gialai-toan-2026-0101': {
    1: 'Hinh hoc khong gian va Oxyz',
    2: 'Xac suat, to hop va thong ke',
    3: 'Khao sat ham so, cuc tri va GTLN/GTNN',
    4: 'Khao sat ham so, cuc tri va GTLN/GTNN',
    5: 'Quan he vuong goc va khoi da dien',
    6: 'Hinh hoc khong gian va Oxyz',
    7: 'Cap so cong va cap so nhan',
    8: 'Nguyen ham va tich phan',
    9: 'Mu va logarit',
    10: 'Quan he vuong goc va khoi da dien',
    11: 'Mu va logarit',
    12: 'Nguyen ham va tich phan',
    13: 'Khao sat ham so, cuc tri va GTLN/GTNN',
    14: 'Nguyen ham va tich phan',
    15: 'Xac suat, to hop va thong ke',
    16: 'Hinh hoc khong gian va Oxyz',
    17: 'Quan he vuong goc va khoi da dien',
    18: 'Quy hoach tuyen tinh va bai toan toi uu',
    19: 'Khao sat ham so, cuc tri va GTLN/GTNN',
    20: 'Khao sat ham so, cuc tri va GTLN/GTNN',
    21: 'Khao sat ham so, cuc tri va GTLN/GTNN',
    22: 'Xac suat, to hop va thong ke',
  },
  'ssstudy-vat-ly-thi-thu-tot-nghiep-2026': {
    1: 'Hat nhan nguyen tu',
    2: 'Nhiet hoc va chat khi',
    3: 'Dao dong va song dien tu',
    4: 'Nhiet hoc va chat khi',
    5: 'Hat nhan nguyen tu',
    6: 'Nhiet hoc va chat khi',
    7: 'Nhiet hoc va chat khi',
    8: 'Tu truong',
    9: 'Nhiet hoc va chat khi',
    10: 'Nhiet hoc va chat khi',
    11: 'Tu truong',
    12: 'Tu truong',
    13: 'Tu truong',
    14: 'Hat nhan nguyen tu',
    15: 'Nhiet hoc va chat khi',
    16: 'Nhiet hoc va chat khi',
    17: 'Nhiet hoc va chat khi',
    18: 'Cam ung dien tu',
    19: 'Nhiet hoc va chat khi',
    20: 'Tu truong',
    21: 'Hat nhan nguyen tu',
    22: 'Nhiet hoc va chat khi',
    23: 'Nhiet hoc va chat khi',
    24: 'Nhiet hoc va chat khi',
    25: 'Hat nhan nguyen tu',
    26: 'Hat nhan nguyen tu',
    27: 'Cam ung dien tu',
    28: 'Cam ung dien tu',
  },
  'thpt-nguyen-du-toan-2026-1201': {
    1: 'Xac suat, to hop va thong ke',
    2: 'Hinh hoc khong gian va Oxyz',
    3: 'Nguyen ham va tich phan',
    4: 'Hinh hoc khong gian va Oxyz',
    5: 'Khao sat ham so, cuc tri va GTLN/GTNN',
    6: 'Hinh hoc khong gian va Oxyz',
    7: 'Hinh hoc khong gian va Oxyz',
    8: 'Quan he vuong goc va khoi da dien',
    9: 'Cap so cong va cap so nhan',
    10: 'Khao sat ham so, cuc tri va GTLN/GTNN',
    11: 'Khao sat ham so, cuc tri va GTLN/GTNN',
    12: 'Mu va logarit',
    13: 'Mu va logarit',
    14: 'Hinh hoc khong gian va Oxyz',
    15: 'Xac suat, to hop va thong ke',
    16: 'Khao sat ham so, cuc tri va GTLN/GTNN',
    17: 'Khao sat ham so, cuc tri va GTLN/GTNN',
    18: 'Nguyen ham va tich phan',
    19: 'Hinh hoc khong gian va Oxyz',
    20: 'Mu va logarit',
    21: 'Khao sat ham so, cuc tri va GTLN/GTNN',
    22: 'Quan he vuong goc va khoi da dien',
  },
  'thpt-nguyen-trai-toan-2026-1201': {
    1: 'Khao sat ham so, cuc tri va GTLN/GTNN',
    2: 'Mu va logarit',
    3: 'Xac suat, to hop va thong ke',
    4: 'Quan he vuong goc va khoi da dien',
    5: 'Quan he vuong goc va khoi da dien',
    6: 'Nguyen ham va tich phan',
    7: 'Hinh hoc khong gian va Oxyz',
    8: 'Nguyen ham va tich phan',
    9: 'Khao sat ham so, cuc tri va GTLN/GTNN',
    10: 'Hinh hoc khong gian va Oxyz',
    11: 'Quan he vuong goc va khoi da dien',
    12: 'Cap so cong va cap so nhan',
    13: 'Khao sat ham so, cuc tri va GTLN/GTNN',
    14: 'Nguyen ham va tich phan',
    15: 'Hinh hoc khong gian va Oxyz',
    16: 'Xac suat, to hop va thong ke',
    17: 'Quy hoach tuyen tinh va bai toan toi uu',
    18: 'Xac suat, to hop va thong ke',
    19: 'Quan he vuong goc va khoi da dien',
    20: 'Quan he vuong goc va khoi da dien',
    21: 'Khao sat ham so, cuc tri va GTLN/GTNN',
    22: 'Xac suat, to hop va thong ke',
  },
  'thpt-yen-lac-toan-2026-101': {
    1: 'Khao sat ham so, cuc tri va GTLN/GTNN',
    2: 'Hinh hoc khong gian va Oxyz',
    3: 'Xac suat, to hop va thong ke',
    4: 'Khao sat ham so, cuc tri va GTLN/GTNN',
    5: 'Hinh hoc khong gian va Oxyz',
    6: 'Khao sat ham so, cuc tri va GTLN/GTNN',
    7: 'Hinh hoc khong gian va Oxyz',
    8: 'Khao sat ham so, cuc tri va GTLN/GTNN',
    9: 'Hinh hoc khong gian va Oxyz',
    10: 'Nguyen ham va tich phan',
    11: 'Nguyen ham va tich phan',
    12: 'Mu va logarit',
    13: 'Xac suat, to hop va thong ke',
    14: 'Khao sat ham so, cuc tri va GTLN/GTNN',
    15: 'Hinh hoc khong gian va Oxyz',
    16: 'Nguyen ham va tich phan',
    17: 'Quan he vuong goc va khoi da dien',
    18: 'Quy hoach tuyen tinh va bai toan toi uu',
    19: 'Nguyen ham va tich phan',
    20: 'Hinh hoc khong gian va Oxyz',
    21: 'Xac suat, to hop va thong ke',
    22: 'Khao sat ham so, cuc tri va GTLN/GTNN',
  },
}

async function main() {
  const questions = await fetchQuestionsMissingTopic()
  if (questions.length === 0) {
    console.log('No school exam questions with empty topic were found.')
    return
  }

  const updates = []
  const unresolved = []

  for (const question of questions) {
    const topic = topicMapByExamId[question.exam_id]?.[question.question_number]?.trim() ?? ''
    if (topic) {
      updates.push({
        questionId: question.question_id,
        examId: question.exam_id,
        questionNumber: question.question_number,
        subjectCode: question.exam.subject_code,
        topic,
      })
      continue
    }

    unresolved.push({
      questionId: question.question_id,
      examId: question.exam_id,
      questionNumber: question.question_number,
      subjectCode: question.exam.subject_code,
      questionText: question.question_text,
    })
  }

  const outputDir = path.join(webAppRoot, 'supabase')
  const sqlPath = path.join(outputDir, 'backfill_school_exam_question_topics.sql')
  const reportPath = path.join(outputDir, 'backfill_school_exam_question_topics_report.json')

  const sql = buildSql(updates, unresolved)
  fs.writeFileSync(sqlPath, sql, 'utf8')
  fs.writeFileSync(
    reportPath,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        totalMissing: questions.length,
        updatedCount: updates.length,
        unresolvedCount: unresolved.length,
        updates,
        unresolved,
      },
      null,
      2,
    ),
    'utf8',
  )

  console.log(`Generated SQL: ${sqlPath}`)
  console.log(`Generated report: ${reportPath}`)
  console.log(`Resolved ${updates.length}/${questions.length} questions.`)
  if (unresolved.length > 0) {
    console.log(`Left unresolved: ${unresolved.length}`)
  }
}

async function fetchQuestionsMissingTopic() {
  const rows = []
  rows.push(...(await fetchQuestionsByTopicPredicate('null')))
  rows.push(...(await fetchQuestionsByTopicPredicate('empty')))

  const uniqueByQuestionId = new Map(rows.map((row) => [row.question_id, row]))
  return Array.from(uniqueByQuestionId.values())
}

async function fetchQuestionsByTopicPredicate(predicate) {
  const rows = []
  let offset = 0

  while (true) {
    let query = supabase
      .from('school_exam_questions')
      .select(
        'question_id, exam_id, question_number, question_type, question_text, topic, exam:school_exams!inner(exam_id, title, school_name, subject_code, is_active)',
      )
      .eq('exam.is_active', true)
      .order('exam_id', { ascending: true })
      .order('question_number', { ascending: true })
      .range(offset, offset + PAGE_SIZE - 1)

    if (predicate === 'null') {
      query = query.is('topic', null)
    } else {
      query = query.eq('topic', '')
    }

    const { data, error } = await query
    if (error) {
      throw new Error(`Cannot load school_exam_questions (${predicate}): ${error.message}`)
    }

    if (!data || data.length === 0) {
      break
    }

    rows.push(...data)
    if (data.length < PAGE_SIZE) {
      break
    }
    offset += PAGE_SIZE
  }

  return rows
}

function buildSql(updates, unresolved) {
  const lines = [
    '-- Generated by web-app/scripts/backfill-school-exam-topics.mjs',
    `-- Generated at ${new Date().toISOString()}`,
    `-- Resolved updates: ${updates.length}`,
    `-- Unresolved rows: ${unresolved.length}`,
    'begin;',
    '',
  ]

  for (const update of updates) {
    lines.push(
      `update public.school_exam_questions set topic = '${escapeSql(update.topic)}' where question_id = '${escapeSql(update.questionId)}';`,
    )
  }

  lines.push('', 'commit;', '')

  if (unresolved.length > 0) {
    lines.push('-- Unresolved questions that still need manual topic review:')
    for (const row of unresolved) {
      lines.push(
        `-- ${row.subjectCode} | ${row.examId} | Q${row.questionNumber} | ${sanitizeComment(row.questionText)}`,
      )
    }
  }

  return `${lines.join('\n')}\n`
}

function escapeSql(value) {
  return String(value).replace(/'/g, "''")
}

function sanitizeComment(value) {
  return String(value).replace(/\s+/g, ' ').replace(/--/g, ' ').trim().slice(0, 180)
}

await main()
