import { useEffect, useState } from 'react'
import { MarkdownContent } from '../../../components/ui/MarkdownContent'
import { sendExamChatMessage } from '../../../features/exam/services/exam-ai-service'
import { fetchAttemptChatMessages } from '../../../features/exam/services/exam-attempt-service'
import { fetchPersistedAttemptReview } from '../../../features/exam/services/exam-review-service'
import { savePracticeAiMessage, type UnifiedAiHistoryItem } from '../../../features/history/services/history-service'
import {
  fetchSchoolExamAttemptDetail,
  saveSchoolExamAiMessages,
} from '../../../features/practice/services/school-exam-attempt-service'

type HistoryAiChatModalProps = {
  item: UnifiedAiHistoryItem
  onClose: () => void
}

type ModalQuestionData = {
  isCorrect: boolean
  topic: string
  questionContent: string
  selectedAnswer: string
  correctAnswer: string
  obsidianSourcePath?: string
}

type ChatMessage = {
  role: 'user' | 'ai' | 'system'
  content: string
}

export function HistoryAiChatModal({ item, onClose }: HistoryAiChatModalProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [questionData, setQuestionData] = useState<ModalQuestionData | null>(null)
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])
  
  const [chatInput, setChatInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [sendError, setSendError] = useState('')

  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      setErrorMsg('')
      try {
        if (item.source === 'school_exam') {
          if (!item.attemptId || !item.questionNumber) {
            throw new Error('Dữ liệu không hợp lệ (thiếu attemptId hoặc questionNumber).')
          }
          const detail = await fetchSchoolExamAttemptDetail(item.attemptId)
          if (!detail) throw new Error('Không tìm thấy chi tiết bài làm.')
          
          const answer = detail.answers.find((a) => a.questionNumber === item.questionNumber)
          if (!answer) throw new Error('Không tìm thấy câu hỏi trong bài làm.')

          setQuestionData({
            isCorrect: answer.isCorrect,
            topic: answer.topic,
            questionContent: answer.questionContent,
            selectedAnswer: answer.selectedAnswer || 'Chưa chọn',
            correctAnswer: answer.correctAnswer || '--',
            obsidianSourcePath: undefined, // School exams might not have it attached easily
          })

          const messages = detail.aiMessages.filter((m) => m.questionNumber === item.questionNumber)
          setChatHistory(
            messages.map((m) => ({
              role: m.role === 'assistant' ? 'ai' : m.role === 'user' ? 'user' : 'system',
              content: m.content,
            }))
          )
        } else {
          // Practice source
          if (!item.attemptId && !item.sessionId) {
            throw new Error('Dữ liệu không hợp lệ (thiếu attemptId và sessionId).')
          }
          
          if (item.attemptId) {
             const detail = await fetchPersistedAttemptReview(item.attemptId)
             if (detail) {
               const reviewItem = detail.reviewItems.find((r) => r.questionId === item.questionId)
               if (reviewItem) {
                 setQuestionData({
                   isCorrect: reviewItem.correct,
                   topic: detail.topicName,
                   questionContent: reviewItem.questionContent,
                   selectedAnswer: reviewItem.selectedAnswerText,
                   correctAnswer: reviewItem.correctAnswerText,
                 })
               }
             }
          }
          
          if (!questionData) {
             // Fallback if not loaded
             setQuestionData({
               isCorrect: false,
               topic: 'Ôn tập kiến thức',
               questionContent: 'Không thể tải nội dung câu hỏi (chưa lưu hoặc đã bị xóa).',
               selectedAnswer: '--',
               correctAnswer: '--',
             })
          }

          if (item.attemptId) {
             const chatData = await fetchAttemptChatMessages(item.attemptId)
             const messages = chatData.chatHistory.filter((m: any) => item.questionId ? m.questionId === item.questionId : true)
             setChatHistory(messages)
          } else if (item.sessionId) {
             // We'd fetch by session_id, but fetchAttemptChatMessages only takes attemptId.
             // We can just rely on item.content as the single message if we can't fetch full history.
             setChatHistory([
               { role: item.role === 'assistant' ? 'ai' : item.role === 'user' ? 'user' : 'system', content: item.content }
             ])
          }
        }
      } catch (error) {
        setErrorMsg(error instanceof Error ? error.message : 'Lỗi tải dữ liệu.')
      } finally {
        setIsLoading(false)
      }
    }

    void loadData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item])

  async function handleSendChat() {
    const trimmed = chatInput.trim()
    if (!trimmed || !questionData) return

    setIsSending(true)
    setSendError('')
    setChatHistory((prev) => [...prev, { role: 'user', content: trimmed }])
    setChatInput('')

    try {
      const explanation = await sendExamChatMessage({
        questionContent: questionData.questionContent,
        selectedAnswer: questionData.selectedAnswer,
        correctAnswer: questionData.correctAnswer,
        prompt: trimmed,
        obsidianSourcePath: questionData.obsidianSourcePath,
      })

      setChatHistory((prev) => [...prev, { role: 'ai', content: explanation }])

      if (item.source === 'school_exam' && item.attemptId) {
        await saveSchoolExamAiMessages(item.attemptId, [
          { role: 'user', content: trimmed, questionNumber: item.questionNumber },
          { role: 'assistant', content: explanation, questionNumber: item.questionNumber },
        ])
      } else if (item.source === 'practice' && item.sessionId) {
        await savePracticeAiMessage(item.sessionId, item.questionId, 'user', trimmed)
        await savePracticeAiMessage(item.sessionId, item.questionId, 'assistant', explanation)
      }
    } catch (error) {
      setSendError(error instanceof Error ? error.message : 'Không thể gửi câu hỏi tới AI lúc này.')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 px-4 py-6 backdrop-blur-sm">
      <div className="flex h-[90vh] w-full max-w-7xl flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-slate-50 shadow-[0_40px_120px_rgba(15,23,42,0.24)]">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Review câu hỏi
            </div>
            <h2 className="mt-1 text-xl font-bold text-slate-950">{item.context}</h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-slate-500 font-medium">Đang tải dữ liệu...</div>
          </div>
        ) : errorMsg ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-rose-600 font-medium">{errorMsg}</div>
          </div>
        ) : questionData ? (
          <div className="grid flex-1 min-h-0 lg:grid-cols-[1fr_400px] xl:grid-cols-[1.2fr_1fr] divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
            {/* Left side: Question Details */}
            <section className="min-h-0 overflow-y-auto bg-slate-50/50 p-6">
              <div className="flex items-center justify-between gap-3">
                <div
                  className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] ${
                    questionData.isCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  {questionData.isCorrect ? 'Đúng' : 'Sai'}
                </div>
                <div className="text-sm leading-7 text-slate-600">Chuyên đề: {questionData.topic}</div>
              </div>

              <div className="mt-5 rounded-[24px] border border-slate-200 bg-white p-5">
                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Nội dung câu hỏi
                </div>
                <div className="mt-3 text-base leading-8 text-slate-800">
                  <MarkdownContent content={questionData.questionContent} />
                </div>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <div className="rounded-[22px] border border-slate-200 bg-white px-4 py-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Lựa chọn của học sinh
                  </div>
                  <div className="mt-2 text-lg font-bold text-slate-950">
                    <MarkdownContent content={questionData.selectedAnswer} />
                  </div>
                </div>
                <div className="rounded-[22px] border border-slate-200 bg-white px-4 py-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Đáp án đúng
                  </div>
                  <div className="mt-2 text-lg font-bold text-slate-950">
                    <MarkdownContent content={questionData.correctAnswer} />
                  </div>
                </div>
              </div>
            </section>

            {/* Right side: AI Chat */}
            <section className="flex min-h-0 flex-col bg-white p-6">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-slate-950">Trò chuyện với AI</h3>
                <p className="mt-1 text-sm text-slate-600">
                  AI đọc câu hỏi, đáp án đã chọn, đáp án đúng và file kiến thức liên quan để giải thích.
                </p>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                {chatHistory.length === 0 ? (
                  <div className="text-sm text-slate-500">Chưa có hội thoại nào.</div>
                ) : (
                  <div className="space-y-4">
                    {chatHistory.map((message, index) => (
                      <div
                        key={index}
                        className={`rounded-2xl px-4 py-3 text-sm leading-7 ${
                          message.role === 'user'
                            ? 'ml-8 border border-slate-200 bg-white text-slate-900'
                            : 'mr-8 border border-sky-200 bg-sky-50 text-slate-800'
                        }`}
                      >
                        <div className="mb-1 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                          {message.role === 'user' ? 'Học sinh' : 'AI gia sư'}
                        </div>
                        <MarkdownContent content={message.content} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-4 shrink-0 space-y-4">
                {sendError && <p className="text-sm font-medium text-rose-700">{sendError}</p>}
                <div className="flex gap-3">
                  <input
                    className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-sky-400 focus:bg-white transition"
                    disabled={isSending}
                    placeholder="Hỏi thêm AI về câu này..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') void handleSendChat()
                    }}
                  />
                  <button
                    onClick={() => void handleSendChat()}
                    disabled={isSending || !chatInput.trim()}
                    className="rounded-2xl bg-sky-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-sky-500 disabled:bg-slate-300"
                  >
                    {isSending ? 'Đang gửi...' : 'Gửi'}
                  </button>
                </div>
              </div>
            </section>
          </div>
        ) : null}
      </div>
    </div>
  )
}
