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

type WeaknessAnalysisItem = {
  questionId: string
  questionContent: string
  topic: string
  userAnswer: string
  correctAnswer: string
}

const AUTO_WRONG_PROMPT = 'Học sinh chọn sai câu này. Hãy giải thích giúp tôi!'

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

export async function requestWeaknessAnalysis(items: WeaknessAnalysisItem[]) {
  if (!env.aiApiBaseUrl) {
    throw new Error(
      'Missing VITE_AI_API_BASE_URL. Copy web-app/.env.example to web-app/.env.local before using AI chat.',
    )
  }

  const response = await callAiEndpoint('/api/analyze-weaknesses', {
    wrong_questions: items.map((item) => ({
      question_id: Number(item.questionId) || 0,
      question_content: item.questionContent,
      topic: item.topic,
      user_answer: item.userAnswer,
      correct_answer: item.correctAnswer,
    })),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || `AI backend trả về lỗi HTTP ${response.status}.`)
  }

  const data = (await response.json()) as ExplainResponse
  return data.explanation
}

async function requestExplanation(input: ExplainRequest) {
  if (!env.aiApiBaseUrl) {
    throw new Error(
      'Missing VITE_AI_API_BASE_URL. Copy web-app/.env.example to web-app/.env.local before using AI chat.',
    )
  }

  const response = await callAiEndpoint('/api/explain', {
    question_content: input.questionContent,
    student_answer: input.studentAnswer,
    correct_answer: input.correctAnswer,
    obsidian_source_path: input.obsidianSourcePath,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || `AI backend trả về lỗi HTTP ${response.status}.`)
  }

  const data = (await response.json()) as ExplainResponse
  return data.explanation
}

function buildStudentAnswerPayload(prompt: string, selectedAnswer: string, systemPrompt: boolean) {
  const lines: string[] = []
  lines.push(`MODE: ${systemPrompt ? 'auto_explain' : 'follow_up'}`)
  lines.push(`SELECTED_ANSWER: ${selectedAnswer || 'Chưa chọn'}`)
  lines.push(`MESSAGE: ${prompt}`)
  return lines.join('\n')
}

async function callAiEndpoint(path: string, payload: unknown) {
  try {
    return await fetch(`${env.aiApiBaseUrl}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
  } catch {
    throw new Error(
      `Không kết nối được tới AI backend (${env.aiApiBaseUrl}). Kiểm tra ai_service có đang chạy không.`,
    )
  }
}
