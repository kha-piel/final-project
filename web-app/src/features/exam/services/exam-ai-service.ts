import { env } from '../../../lib/config/env'

type ExplainRequest = {
  questionContent: string
  studentAnswer: string
  correctAnswer: string
  obsidianSourcePath: string
}

type ExplainResponse = {
  status: string
  explanation: string
}

const AUTO_WRONG_PROMPT = 'Hoc sinh chon sai cau nay. Hay giai thich giup toi!'

export async function requestAutoExplanation(input: {
  questionContent: string
  selectedAnswer: string
  correctAnswer: string
  obsidianSourcePath?: string | null
}) {
  return requestExplanation({
    questionContent: input.questionContent,
    studentAnswer: buildStudentAnswerPayload(AUTO_WRONG_PROMPT, input.selectedAnswer, true),
    correctAnswer: input.correctAnswer,
    obsidianSourcePath: input.obsidianSourcePath ?? '',
  })
}

export async function sendExamChatMessage(input: {
  questionContent: string
  selectedAnswer: string
  correctAnswer: string
  prompt: string
  obsidianSourcePath?: string | null
}) {
  return requestExplanation({
    questionContent: input.questionContent,
    studentAnswer: buildStudentAnswerPayload(input.prompt, input.selectedAnswer, false),
    correctAnswer: input.correctAnswer,
    obsidianSourcePath: input.obsidianSourcePath ?? '',
  })
}

async function requestExplanation(input: ExplainRequest) {
  if (!env.aiApiBaseUrl) {
    throw new Error(
      'Missing VITE_AI_API_BASE_URL. Copy web-app/.env.example to web-app/.env.local before using AI chat.',
    )
  }

  const response = await fetch(`${env.aiApiBaseUrl}/api/explain`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      question_content: input.questionContent,
      student_answer: input.studentAnswer,
      correct_answer: input.correctAnswer,
      obsidian_source_path: input.obsidianSourcePath,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || `AI backend tra ve loi HTTP ${response.status}.`)
  }

  const data = (await response.json()) as ExplainResponse
  return data.explanation
}

function buildStudentAnswerPayload(prompt: string, selectedAnswer: string, systemPrompt: boolean) {
  const lines: string[] = []
  if (selectedAnswer) {
    lines.push(`Lua chon hien tai cua hoc sinh: ${selectedAnswer}`)
  }
  lines.push(`${systemPrompt ? 'Yeu cau he thong' : 'Cau hoi them cua hoc sinh'}: ${prompt}`)
  return lines.join('\n')
}
