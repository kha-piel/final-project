import * as fs from 'fs';

const files = [
  'src/features/exam/services/exam-attempt-service.ts',
  'src/features/exam/services/exam-review-service.ts',
  'src/features/dashboard/services/dashboard-service.ts',
  'src/features/history/services/history-service.ts'
];

for (const f of files) {
  let c = fs.readFileSync(f, 'utf8');
  
  const replacements = [
    [/from\('exams'\)/g, "from('legacy_exams')"],
    [/from\('questions'\)/g, "from('legacy_questions')"],
    [/from\('attempt_answers'\)/g, "from('legacy_attempt_answers')"],
    [/from\('student_attempts'\)/g, "from('legacy_student_attempts')"],
    [/from\('chat_sessions'\)/g, "from('legacy_chat_sessions')"],
    [/from\('chat_messages'\)/g, "from('legacy_chat_messages')"],
    
    // Select relations
    [/exams\(/g, "legacy_exams("],
    [/questions\(/g, "legacy_questions("],
    [/attempt_answers\(/g, "legacy_attempt_answers("],
    [/student_attempts\(/g, "legacy_student_attempts("],
    [/chat_sessions\(/g, "legacy_chat_sessions("],
    [/chat_messages\(/g, "legacy_chat_messages("],
    [/answers\(/g, "legacy_answers("],
  ];

  for (const [pattern, replacement] of replacements) {
    c = c.replace(pattern as RegExp, replacement as string);
  }

  // Also fix the ensureCloudAttempt insert that I modified earlier
  c = c.replace(/from\('legacy_exams'\)\s*\.insert\(\{/, "from('legacy_exams').insert({");

  fs.writeFileSync(f, c);
  console.log('Updated', f);
}
