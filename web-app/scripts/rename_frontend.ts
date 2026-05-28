import * as fs from 'fs';
import * as path from 'path';

const srcDir = path.join(process.cwd(), 'src');

function processDirectory(dir: string) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;

      const tableReplacements = [
        ["school_exam_question_options", "question_options"],
        ["school_exam_question_assets", "question_assets"],
        ["school_exam_sections", "exam_sections"],
        ["student_school_exam_attempts", "student_attempts"],
        ["student_school_exam_answers", "student_answers"],
        ["student_school_exam_ai_messages", "student_ai_messages"],
        ["school_exams!", "exams!"],
        ["school_exams(", "exams("],
      ];

      for (const [oldStr, newStr] of tableReplacements) {
        if (content.includes(oldStr)) {
          content = content.split(oldStr).join(newStr);
          changed = true;
        }
      }

      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

processDirectory(srcDir);
