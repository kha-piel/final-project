import type { SchoolExamQuestionRecord } from '../types/school-exam-types'

export type SupplementalOption = {
  label: 'A' | 'B' | 'C' | 'D'
  text: string
}

type SupplementalConfig = {
  examId: string
  examTitle: string
  topic: string
  obsidianSourcePath: string
  tagSlug: string
}

export function buildSupplementalMcQuestion(
  config: SupplementalConfig,
  questionNumber: number,
  difficultyLevel: 1 | 2 | 3 | 4,
  questionText: string,
  answerValue: 'A' | 'B' | 'C' | 'D',
  options: SupplementalOption[],
): SchoolExamQuestionRecord {
  return {
    questionId: `${config.examId}-q${String(questionNumber).padStart(2, '0')}`,
    examId: config.examId,
    questionNumber,
    questionType: 'multiple_choice',
    difficultyLevel,
    questionText,
    statements: [],
    options: options.map((option, index) => ({
      optionLabel: option.label,
      optionText: option.text,
      displayOrder: index + 1,
    })),
    assetPaths: [],
    assets: [],
    topic: config.topic,
    obsidianSourcePath: config.obsidianSourcePath,
    hasImage: false,
    answerValue,
    sourceQuestionNumber: questionNumber,
    sourceSectionNumber: 1,
    examTitle: config.examTitle,
    schoolName: 'Nội bộ hệ thống',
    year: 2026,
    pdfUrl: '',
    tags: ['supplemental', 'knowledge-review', config.tagSlug, 'reviewed'],
  }
}
