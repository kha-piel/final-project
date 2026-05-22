import { mockSchoolExams } from '../data/mock-school-exams'

export function getSchoolExamById(examId: string) {
  return mockSchoolExams.find((exam) => exam.examId === examId) ?? null
}

export function listSchoolExams() {
  return mockSchoolExams
}

export function normalizeAnswer(input: string) {
  return input.trim().replace(/\s+/g, ' ').toLowerCase()
}
