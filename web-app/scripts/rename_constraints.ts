import { Client } from 'pg';

const connectionString = `postgresql://${process.env.SUPABASE_DB_USER}:${process.env.SUPABASE_DB_PASSWORD}@db.gdnifezsinailiqckwwh.supabase.co:5432/postgres`;

async function main() {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();
  
  // The constraints we need to rename:
  const queries = [
    // question_options
    `ALTER TABLE question_options RENAME CONSTRAINT school_exam_question_options_pkey TO question_options_pkey;`,
    `ALTER TABLE question_options RENAME CONSTRAINT school_exam_question_options_question_id_fkey TO question_options_question_id_fkey;`,
    
    // question_assets
    `ALTER TABLE question_assets RENAME CONSTRAINT school_exam_question_assets_pkey TO question_assets_pkey;`,
    `ALTER TABLE question_assets RENAME CONSTRAINT school_exam_question_assets_question_id_fkey TO question_assets_question_id_fkey;`,
    
    // questions
    `ALTER TABLE questions RENAME CONSTRAINT school_exam_questions_pkey TO questions_pkey;`,
    `ALTER TABLE questions RENAME CONSTRAINT school_exam_questions_exam_id_fkey TO questions_exam_id_fkey;`,
    `ALTER TABLE questions RENAME CONSTRAINT school_exam_questions_section_id_fkey TO questions_section_id_fkey;`,
    
    // exams
    `ALTER TABLE exams RENAME CONSTRAINT school_exams_pkey TO exams_pkey;`,
    
    // exam_sections
    `ALTER TABLE exam_sections RENAME CONSTRAINT school_exam_sections_pkey TO exam_sections_pkey;`,
    `ALTER TABLE exam_sections RENAME CONSTRAINT school_exam_sections_exam_id_fkey TO exam_sections_exam_id_fkey;`,
    
    // student_attempts
    `ALTER TABLE student_attempts RENAME CONSTRAINT student_school_exam_attempts_pkey TO student_attempts_pkey;`,
    `ALTER TABLE student_attempts RENAME CONSTRAINT student_school_exam_attempts_user_id_fkey TO student_attempts_user_id_fkey;`,
    `ALTER TABLE student_attempts RENAME CONSTRAINT student_school_exam_attempts_school_exam_id_fkey TO student_attempts_exam_id_fkey;`,
    
    // student_answers
    `ALTER TABLE student_answers RENAME CONSTRAINT student_school_exam_answers_pkey TO student_answers_pkey;`,
    `ALTER TABLE student_answers RENAME CONSTRAINT student_school_exam_answers_attempt_id_fkey TO student_answers_attempt_id_fkey;`,
    
    // student_ai_messages
    `ALTER TABLE student_ai_messages RENAME CONSTRAINT student_school_exam_ai_messages_pkey TO student_ai_messages_pkey;`,
    `ALTER TABLE student_ai_messages RENAME CONSTRAINT student_school_exam_ai_messages_attempt_id_fkey TO student_ai_messages_attempt_id_fkey;`,
    
    // also fix the column name in student_attempts: school_exam_id -> exam_id
    `ALTER TABLE student_attempts RENAME COLUMN school_exam_id TO exam_id;`
  ];

  for (const q of queries) {
    try {
      await client.query(q);
      console.log('Success:', q);
    } catch (e: any) {
      console.log('Failed:', q, '->', e.message);
    }
  }

  await client.query("NOTIFY pgrst, 'reload schema'");
  console.log('Schema reloaded!');
  await client.end();
}

main();
