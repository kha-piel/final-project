import * as fs from 'fs';
import * as path from 'path';

const srcDir = path.join(process.cwd(), 'src');

// These are files that use the OLD schema (practice exam flow)
// They need to reference legacy_* tables
const oldSchemaFiles = [
  'src/features/exam/services/exam-attempt-service.ts',
  'src/features/exam/services/exam-review-service.ts',
  'src/features/dashboard/services/dashboard-service.ts',
];

// Table name mappings: old name -> legacy name
// IMPORTANT: Order matters - longer strings first to avoid partial matches
const fromTableReplacements: [string, string][] = [
  ["from('exam_questions')", "from('legacy_exam_questions')"],
  ["from('attempt_answers')", "from('legacy_attempt_answers')"],
  ["from('student_attempts')", "from('legacy_student_attempts')"],
  ["from('chat_sessions')", "from('legacy_chat_sessions')"],
  ["from('chat_messages')", "from('legacy_chat_messages')"],
  ["from('exams')", "from('legacy_exams')"],
  ["from('questions')", "from('legacy_questions')"],
  ["from('answers')", "from('legacy_answers')"],
];

// Select relation references inside query strings
const selectRelationReplacements: [string, string][] = [
  ['exam_questions(', 'legacy_exam_questions('],
  ['attempt_answers(', 'legacy_attempt_answers('],
  ['attempt_answers_selected_answer_id_fkey', 'legacy_attempt_answers_selected_answer_id_fkey'],
  // Be careful: 'exams(' inside select strings only
  // We handle these with targeted replacements
];

for (const filePath of oldSchemaFiles) {
  if (!fs.existsSync(filePath)) {
    console.log(`SKIP (not found): ${filePath}`);
    continue;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Apply from() replacements - these are safe exact matches
  for (const [oldStr, newStr] of fromTableReplacements) {
    if (content.includes(oldStr)) {
      content = content.split(oldStr).join(newStr);
      changed = true;
    }
  }

  // Apply select relation replacements
  for (const [oldStr, newStr] of selectRelationReplacements) {
    if (content.includes(oldStr)) {
      content = content.split(oldStr).join(newStr);
      changed = true;
    }
  }

  // Fix select strings that reference 'exams(' as a join - but ONLY inside .select() query strings
  // Pattern: "exams(" inside backtick or quote strings that are select queries
  // We need to be careful not to replace "exams(" in from('exams') calls
  // The from() calls are already handled above, so any remaining "exams(" in strings should be joins
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Skip if this is a from() call (already handled)
    if (line.includes("from(")) continue;
    // Skip if already has legacy_
    if (line.includes("legacy_exams(")) continue;
    
    // If line contains 'exams(' in a select string context
    if (line.includes("exams(") && (line.includes(".select(") || line.includes("'") || line.includes("`"))) {
      lines[i] = line.split("exams(").join("legacy_exams(");
      changed = true;
    }
    
    // Same for 'questions(' in select strings  
    if (!line.includes("from(") && !line.includes("legacy_questions(") && line.includes("questions(")) {
      if (line.includes(".select(") || line.includes("'") || line.includes("`")) {
        lines[i] = lines[i].split("questions(").join("legacy_questions(");
        changed = true;
      }
    }
    
    // Same for 'answers(' in select strings
    if (!line.includes("from(") && !line.includes("legacy_answers(") && line.includes("answers(")) {
      if (line.includes(".select(") || line.includes("'") || line.includes("`")) {
        lines[i] = lines[i].split("answers(").join("legacy_answers(");
        changed = true;
      }
    }
  }
  content = lines.join('\n');

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated: ${filePath}`);
  } else {
    console.log(`⏭️  No changes needed: ${filePath}`);
  }
}

console.log('\nDone!');
