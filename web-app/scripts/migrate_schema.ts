import { Client } from 'pg';

const connectionString = `postgresql://${process.env.SUPABASE_DB_USER}:${process.env.SUPABASE_DB_PASSWORD}@db.gdnifezsinailiqckwwh.supabase.co:5432/postgres`;

async function main() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();

  console.log('Connected to DB. Starting migration...');

  try {
    await client.query('BEGIN');

    // 1. Rename legacy tables
    const legacyTables = [
      ['exams', 'legacy_exams'],
      ['questions', 'legacy_questions'],
      ['exam_questions', 'legacy_exam_questions'],
      ['answers', 'legacy_answers'],
      ['student_attempts', 'legacy_student_attempts'],
      ['attempt_answers', 'legacy_attempt_answers'],
      ['chat_sessions', 'legacy_chat_sessions'],
      ['chat_messages', 'legacy_chat_messages'],
    ];

    for (const [oldName, newName] of legacyTables) {
      console.log(`Renaming ${oldName} to ${newName}...`);
      await client.query(`ALTER TABLE IF EXISTS public.${oldName} RENAME TO ${newName};`);
    }

    // 2. Rename new tables to standard names
    const newTables = [
      ['school_exams', 'exams'],
      ['school_exam_questions', 'questions'],
      ['school_exam_question_options', 'question_options'],
      ['school_exam_question_assets', 'question_assets'],
      ['school_exam_sections', 'exam_sections'],
      ['student_school_exam_attempts', 'student_attempts'],
      ['student_school_exam_answers', 'student_answers'],
      ['student_school_exam_ai_messages', 'student_ai_messages'],
    ];

    for (const [oldName, newName] of newTables) {
      console.log(`Renaming ${oldName} to ${newName}...`);
      await client.query(`ALTER TABLE IF EXISTS public.${oldName} RENAME TO ${newName};`);
    }

    await client.query('COMMIT');
    console.log('Migration successful!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', err);
  } finally {
    await client.end();
  }
}

main();
