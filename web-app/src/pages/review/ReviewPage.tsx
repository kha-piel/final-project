import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { MarkdownContent } from '../../components/ui/MarkdownContent'
import { PageCard } from '../../components/ui/PageCard'
import { buildSubmissionSummary } from '../../features/exam/core/exam-session'
import {
  fetchPersistedAttemptReview,
  type PersistedAttemptReview,
} from '../../features/exam/services/exam-review-service'
import { useExamDraftStore } from '../../features/exam/store/exam-draft-store'
import { useExamRuntimeStore } from '../../features/exam/store/exam-runtime-store'
import { sendExamChatMessage } from '../../features/exam/services/exam-ai-service'
import { savePracticeAiMessage } from '../../features/history/services/history-service'

export function ReviewPage() {
  const { sessionId = '' } = useParams()
  const session = useExamDraftStore((state) => state.sessions[sessionId] ?? null)
  const runtime = useExamRuntimeStore((state) => state.sessions[sessionId] ?? null)

  const summary = useMemo(() => {
    if (!session || !runtime) {
      return null
    }
    return buildSubmissionSummary(session, runtime)
  }, [runtime, session])

  const [persistedReview, setPersistedReview] = useState<PersistedAttemptReview | null>(null)
  const [isLoadingPersistedReview, setIsLoadingPersistedReview] = useState(false)
  const [persistedReviewError, setPersistedReviewError] = useState('')

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (session && runtime && summary) {
      return
    }

    let isMounted = true
    setIsLoadingPersistedReview(true)
    setPersistedReviewError('')

    void fetchPersistedAttemptReview(sessionId)
      .then((result) => {
        if (!isMounted) {
          return
        }
        setPersistedReview(result)
      })
      .catch((error: unknown) => {
        if (!isMounted) {
          return
        }
        setPersistedReviewError(
          error instanceof Error ? error.message : 'Không thể tải review đã lưu.',
        )
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingPersistedReview(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [runtime, session, sessionId, summary])
  /* eslint-enable react-hooks/set-state-in-effect */

  if (session && runtime && summary) {
    return (
      <LocalReviewContent
        sessionQuestions={session.questions}
        sessionSubjectName={session.subjectName}
        sessionTitle={session.title}
        sessionTopicName={session.topicName}
        summary={summary}
        sessionId={sessionId}
      />
    )
  }

  if (isLoadingPersistedReview) {
    return (
      <PageCard title="Đang tải review" description="Đang đọc kết quả bài làm từ Supabase.">
        <p className="m-0 text-slate-500">Vui lòng đợi trong giây lát.</p>
      </PageCard>
    )
  }

  if (persistedReview) {
    return <PersistedReviewContent review={persistedReview} sessionId={sessionId} />
  }

  if (!session || !runtime || !summary) {
    return (
      <PageCard
        title="Review Session Not Found"
        description="Không tìm thấy dữ liệu tổng kết cho session này."
      >
        {persistedReviewError ? <p className="mb-3 font-semibold text-red-600">{persistedReviewError}</p> : null}
        <p className="m-0 text-slate-500">
          Hãy quay lại <Link to="/dashboard" className="text-blue-600 underline hover:text-blue-700">dashboard</Link> và tạo đề mới.
        </p>
      </PageCard>
    )
  }
}

function LocalReviewContent({
  sessionQuestions,
  sessionSubjectName,
  sessionTitle,
  sessionTopicName,
  summary,
  sessionId,
}: {
  sessionQuestions: ReturnType<typeof useExamDraftStore.getState>['sessions'][string]['questions']
  sessionSubjectName: string
  sessionTitle: string
  sessionTopicName: string
  summary: ReturnType<typeof buildSubmissionSummary>
  sessionId: string
}) {
  return (
    <ReviewSummaryBody
      questionBank={sessionQuestions}
      summary={summary}
      topicLabel={buildTopicLabel(sessionSubjectName, sessionTopicName)}
      title={sessionTitle}
      sessionId={sessionId}
    />
  )
}

function PersistedReviewContent({ review, sessionId }: { review: PersistedAttemptReview, sessionId: string }) {
  return (
    <ReviewSummaryBody
      summary={review}
      topicLabel={buildTopicLabel(review.subjectName, review.topicName)}
      title={review.examTitle}
      sessionId={sessionId}
    />
  )
}

function ReviewSummaryBody({
  questionBank,
  summary,
  topicLabel,
  title,
  sessionId,
}: {
  questionBank?: ReturnType<typeof useExamDraftStore.getState>['sessions'][string]['questions']
  summary: {
    score: number
    correctCount: number
    wrongCount: number
    skippedCount: number
    totalQuestions: number
    timeTakenSeconds: number
    reviewItems: {
      questionId: string
      questionContent: string
      selectedAnswerText: string
      correctAnswerText: string
      correct: boolean
      explanation?: string
    }[]
  }
  topicLabel: string
  title: string
  sessionId: string
}) {
  
  const [selectedReviewQuestionId, setSelectedReviewQuestionId] = useState<string | null>(null)



  const questionMap = useMemo(
    () =>
      (questionBank ?? []).reduce<Record<string, NonNullable<typeof questionBank>[number]>>((acc, item) => {
        acc[item.questionId] = item
        return acc
      }, {}),
    [questionBank],
  )


  const reviewItemsByType = useMemo(() => {
    const mc: typeof summary.reviewItems = []
    const tf: typeof summary.reviewItems = []
    const sa: typeof summary.reviewItems = []
    
    summary.reviewItems.forEach((item) => {
      const qType = questionMap[item.questionId]?.questionType
      if (qType === 'multiple_choice') {
        mc.push(item)
      } else if (qType === 'true_false') {
        tf.push(item)
      } else if (qType === 'short_answer') {
        sa.push(item)
      } else {
        mc.push(item) // fallback
      }
    })
    return { mc, tf, sa }
  }, [summary.reviewItems, questionMap])

  const selectedItem = selectedReviewQuestionId ? summary.reviewItems.find(i => i.questionId === selectedReviewQuestionId) : null
  const selectedQuestionIndex = selectedItem ? summary.reviewItems.findIndex(i => i.questionId === selectedItem.questionId) : -1

  return (
    <section className="space-y-6">
      <div className="rounded-[28px] border border-emerald-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
              Tổng kết bài làm
            </div>
            <h1 className="mt-2 text-3xl font-extrabold text-slate-950">{title}</h1>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              {topicLabel} | Điểm {summary.score}/10 | {summary.score >= 5 ? 'Đạt' : 'Chưa đạt'}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <MetricPill label="Điểm" value={`${summary.score}/10`} />
            <MetricPill label="Số câu đúng" value={`${summary.correctCount}/${summary.totalQuestions}`} />
            <MetricPill label="Bỏ qua" value={`${summary.skippedCount}/${summary.totalQuestions}`} />
            <MetricPill label="Thời gian" value={formatDuration(summary.timeTakenSeconds)} />
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr] items-start">
        <section className="sticky top-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
          <h2 className="text-xl font-bold text-slate-950">Thống kê nhanh</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <SummaryTile label="Đúng" value={`${summary.correctCount}`} tone="emerald" />
            <SummaryTile label="Sai" value={`${summary.wrongCount}`} tone="rose" />
            <SummaryTile label="Bỏ qua" value={`${summary.skippedCount}`} tone="slate" />
            <SummaryTile label="Tổng" value={`${summary.totalQuestions}`} tone="sky" />
          </div>



          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              to="/dashboard"
            >
              Quay lại dashboard
            </Link>
            <Link
              className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
              to="/dashboard"
            >
              Về trang chủ
            </Link>
          </div>
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-slate-950">Chi tiết kết quả</h2>
            <div className="text-sm text-slate-500">{summary.reviewItems.length} câu</div>
          </div>

          <p className="mt-3 text-sm leading-7 text-slate-600">
            Bấm vào từng câu để mở tab review. Tab này hiện câu hỏi, hình ảnh liên quan, đáp án học sinh chọn
            và khung trò chuyện với AI.
          </p>

          <div className="mt-5 space-y-5">
            <ReviewItemSection
              items={reviewItemsByType.mc}
              selectedQuestionId={selectedReviewQuestionId}
              title="Phần I. Trắc nghiệm 4 lựa chọn"
              onSelect={setSelectedReviewQuestionId}
              summary={summary}
            />
            <ReviewItemSection
              items={reviewItemsByType.tf}
              selectedQuestionId={selectedReviewQuestionId}
              title="Phần II. Trắc nghiệm đúng sai"
              onSelect={setSelectedReviewQuestionId}
              summary={summary}
            />
            <ReviewItemSection
              items={reviewItemsByType.sa}
              selectedQuestionId={selectedReviewQuestionId}
              title="Phần III. Trả lời ngắn"
              onSelect={setSelectedReviewQuestionId}
              summary={summary}
            />
          </div>
        </section>
      </div>

      {selectedItem ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 py-6 backdrop-blur-sm">
          <div className="flex h-[92vh] w-full max-w-[1320px] flex-col overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_40px_120px_rgba(15,23,42,0.24)]">
            <div className="shrink-0 flex items-center justify-between gap-4 border-b border-slate-200 px-6 py-5">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Review câu hỏi
                </div>
                <h2 className="mt-2 text-2xl font-extrabold text-slate-950">
                  Câu {selectedQuestionIndex + 1}
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <button
                  aria-label="Đóng tab review"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-lg font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                  onClick={() => {
                    setSelectedReviewQuestionId(null)
                  }}
                  type="button"
                >
                  X
                </button>
              </div>
            </div>

            <div className={`min-h-0 flex-1 overflow-hidden ${!selectedItem.correct ? 'grid lg:grid-cols-[1fr_400px] xl:grid-cols-[1.2fr_1fr]' : ''}`}>
              <section className={`min-h-0 overflow-y-auto p-6 ${!selectedItem.correct ? '' : 'mx-auto max-w-4xl'}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div
                    className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] ${
                      selectedItem.correct
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {selectedItem.correct ? 'Đúng' : 'Sai'}
                  </div>
                  <div className="text-sm leading-7 text-slate-600">
                    Topic: {topicLabel}
                  </div>
                </div>

                <div className="mt-5 rounded-[24px] border border-slate-200 bg-white p-5">
                  <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Nội dung câu hỏi
                  </div>
                  <div className="mt-3 text-base leading-8 text-slate-800">
                    <MarkdownContent
                      content={selectedItem.questionContent || 'Chưa có nội dung câu hỏi.'}
                      className="text-base leading-8 text-slate-800"
                    />
                  </div>
                </div>

                {questionMap[selectedItem.questionId] ? (
                  <div className="mt-5 rounded-[24px] border border-slate-200 bg-white p-5">
                    <div className="mb-4 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                      Chi tiết lựa chọn
                    </div>
                    <AnswerChoiceReview
                      correctAnswerText={selectedItem.correctAnswerText}
                      questionContent={selectedItem.questionContent}
                      question={questionMap[selectedItem.questionId]!}
                      selectedAnswerText={selectedItem.selectedAnswerText}
                    />
                  </div>
                ) : null}

                {!questionMap[selectedItem.questionId] || questionMap[selectedItem.questionId]?.questionType === 'short_answer' ? (
                  <div className="mt-5 grid gap-3 md:grid-cols-2">
                    <div className="rounded-[22px] border border-slate-200 bg-white px-4 py-4">
                      <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                        Lựa chọn của học sinh
                      </div>
                      <div className="mt-2 text-lg font-bold text-slate-950">
                        <MarkdownContent content={selectedItem.selectedAnswerText} />
                      </div>
                    </div>
                    <div className="rounded-[22px] border border-slate-200 bg-white px-4 py-4">
                      <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                        Đáp án đúng
                      </div>
                      <div className="mt-2 text-lg font-bold text-slate-950">
                        <MarkdownContent content={selectedItem.correctAnswerText} />
                      </div>
                    </div>
                  </div>
                ) : null}
              </section>

              {!selectedItem.correct && (
                <section className="flex min-h-0 flex-col border-l border-slate-200 bg-white p-6">
                  <PracticeAiChatPanel 
                    questionId={selectedItem.questionId}
                    questionContent={selectedItem.questionContent}
                    selectedAnswer={selectedItem.selectedAnswerText}
                    correctAnswer={selectedItem.correctAnswerText}
                    sessionId={sessionId}
                  />
                </section>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}

function ReviewItemSection({
  title,
  items,
  selectedQuestionId,
  onSelect,
  summary,
}: {
  title: string
  items: any[]
  selectedQuestionId: string | null
  onSelect: (questionId: string) => void
  summary: any
}) {
  if (items.length === 0) {
    return null
  }

  return (
    <section className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-slate-700">{title}</h3>
        <div className="text-xs font-semibold text-slate-500">{items.length} câu</div>
      </div>

      <div className="flex flex-wrap gap-3">
        {items.map((item) => {
          const index = summary.reviewItems.findIndex((i: any) => i.questionId === item.questionId)
          return (
            <button
              key={item.questionId}
              className={`rounded-2xl border px-4 py-3 text-left transition ${
                selectedQuestionId === item.questionId
                  ? 'border-slate-950 bg-slate-950 text-white'
                  : item.correct
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:border-emerald-300'
                    : 'border-rose-200 bg-rose-50 text-rose-800 hover:border-rose-300'
              }`}
              onClick={() => onSelect(item.questionId)}
              type="button"
            >
              <div className="text-sm font-bold">Câu {index + 1}</div>
              <div className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] opacity-80">
                {item.correct ? 'Đúng' : 'Sai'}
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}

function SummaryTile({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone: 'emerald' | 'rose' | 'slate' | 'sky'
}) {
  const toneClass = {
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    rose: 'border-rose-200 bg-rose-50 text-rose-700',
    slate: 'border-slate-200 bg-slate-50 text-slate-700',
    sky: 'border-sky-200 bg-sky-50 text-sky-700',
  }[tone]

  return (
    <div className={`rounded-[22px] border px-4 py-4 ${toneClass}`}>
      <div className="text-xs font-semibold uppercase tracking-[0.12em]">{label}</div>
      <div className="mt-2 text-3xl font-black">{value}</div>
    </div>
  )
}

function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-800">
      <strong className="font-bold text-slate-900">{label}:</strong> {value}
    </div>
  )
}

function AnswerChoiceReview({
  correctAnswerText,
  questionContent,
  question,
  selectedAnswerText,
}: {
  correctAnswerText: string
  questionContent: string
  question: NonNullable<ReturnType<typeof useExamDraftStore.getState>['sessions'][string]>['questions'][number]
  selectedAnswerText: string
}) {
  if (question.questionType === 'multiple_choice') {
    const choices =
      question.answers.length > 0
        ? question.answers.map((answer) => ({
            id: answer.answerId,
            label: answer.optionLabel,
            content: answer.content,
            isCorrect: answer.isCorrect,
          }))
        : extractMultipleChoiceOptions(questionContent)

    if (choices.length === 0) {
      return (
        <p className="text-sm italic text-slate-500">
          Chưa tách được phương án A/B/C/D từ dữ liệu câu hỏi. Xem đáp án đã chọn và đáp án đúng bên dưới.
        </p>
      )
    }

    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {choices.map((answer) => {
          const selected = isAnswerLabelMatch(selectedAnswerText, answer.label)
          const correct = answer.isCorrect || isAnswerLabelMatch(correctAnswerText, answer.label)

          return (
            <div
              key={answer.id}
              className={`flex flex-col gap-2 rounded-xl border p-4 transition-all ${
                selected && correct
                  ? 'border-green-400 bg-green-50'
                  : selected && !correct
                    ? 'border-red-400 bg-red-50'
                    : !selected && correct
                      ? 'border-green-400 border-dashed bg-white'
                      : 'border-slate-200 bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <strong
                  className={`text-lg font-bold ${
                    selected && correct
                      ? 'text-green-800'
                      : selected && !correct
                        ? 'text-red-800'
                        : !selected && correct
                          ? 'text-green-600'
                          : 'text-slate-700'
                  }`}
                >
                  {answer.label}.
                </strong>
                {selected && correct ? <span className="text-green-600">✔️</span> : null}
                {selected && !correct ? <span className="text-red-600">❌</span> : null}
                {selected ? (
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${correct ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                    Bạn chọn
                  </span>
                ) : null}
                {correct ? (
                  <span className="rounded-full bg-green-200 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-green-800">
                    Đáp án đúng
                  </span>
                ) : null}
              </div>
              <MarkdownContent
                content={answer.content}
                className={`text-sm leading-relaxed ${
                  selected && correct
                    ? 'text-green-900'
                    : selected && !correct
                      ? 'text-red-900'
                      : !selected && correct
                        ? 'text-green-800'
                        : 'text-slate-800'
                }`}
              />
            </div>
          )
        })}
      </div>
    )
  }

  if (question.questionType === 'true_false' && question.statements?.length) {
    return (
      <div className="grid gap-3">
        {question.statements.map((statement, index) => (
          <div key={statement.statementId} className="flex gap-4 rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex shrink-0 flex-col items-center gap-1 border-r border-slate-100 pr-4">
              <strong className="text-lg text-slate-800">{String.fromCharCode(97 + index)})</strong>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${
                  statement.isCorrect ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {statement.isCorrect ? 'Đúng' : 'Sai'}
              </span>
            </div>
            <MarkdownContent content={statement.content} className="text-sm leading-relaxed text-slate-800" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <p className="text-sm italic text-slate-500">
      Câu trả lời ngắn không có phương án A/B/C/D. Hãy đối chiếu ô "Lựa chọn của học sinh" với
      "Đáp án đúng" bên dưới.
    </p>
  )
}

function isAnswerLabelMatch(answerText: string, optionLabel: string) {
  const normalized = answerText.trim().toUpperCase()
  const label = optionLabel.trim().toUpperCase()
  return normalized === label || normalized.startsWith(`${label}.`) || normalized.startsWith(`${label} `)
}

function extractMultipleChoiceOptions(content: string) {
  const options = content.match(/^[A-D]\.\s.*(?:(?:\r\n|\r|\n)(?!^[A-D]\.\s).*)*$/gm)
  if (!options) return []

  return options.map((option) => {
    const match = option.match(/^([A-D])\.\s(.*)$/s)
    if (!match) return { id: option, label: 'A', content: option, isCorrect: false }

    return {
      id: option,
      label: match[1],
      content: match[2].trim(),
      isCorrect: false,
    }
  }).filter((answer) => answer.content.length > 0)
}

function PracticeAiChatPanel({
  questionId,
  questionContent,
  selectedAnswer,
  correctAnswer,
  sessionId,
}: {
  questionId: string
  questionContent: string
  selectedAnswer: string
  correctAnswer: string
  sessionId: string
}) {
  const runtimeSession = useExamRuntimeStore((state) => state.sessions[sessionId] ?? null)
  
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'ai' | 'system'; content: string }[]>([])
  const [chatInput, setChatInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [sendError, setSendError] = useState('')

  useEffect(() => {
    if (runtimeSession) {
      const messages = runtimeSession.chatHistory
        .filter((m) => m.questionId === questionId)
        .map((m) => ({
          role: m.role,
          content: m.content
        }))
      setChatHistory(messages)
    } else {
      setChatHistory([])
    }
  }, [runtimeSession, questionId])

  async function handleSendChat() {
    const trimmed = chatInput.trim()
    if (!trimmed) return

    setIsSending(true)
    setSendError('')
    setChatHistory((prev) => [...prev, { role: 'user', content: trimmed }])
    setChatInput('')

    try {
      const explanation = await sendExamChatMessage({
        questionContent,
        selectedAnswer,
        correctAnswer,
        prompt: trimmed,
      })

      setChatHistory((prev) => [...prev, { role: 'ai', content: explanation }])

      void savePracticeAiMessage(sessionId, questionId, 'user', trimmed)
      void savePracticeAiMessage(sessionId, questionId, 'assistant', explanation)

      if (runtimeSession) {
        useExamRuntimeStore.getState().addChatMessage(sessionId, {
           role: 'user',
           content: trimmed,
           questionId,
        })
        useExamRuntimeStore.getState().addChatMessage(sessionId, {
           role: 'ai',
           content: explanation,
           questionId,
        })
      }
    } catch (error) {
      setSendError(error instanceof Error ? error.message : 'Không thể gửi câu hỏi tới AI lúc này.')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <>
      <div className="mb-4">
        <h3 className="text-xl font-bold text-slate-950">Trò chuyện với AI</h3>
        <p className="mt-1 text-sm text-slate-600">
          AI đọc câu hỏi, đáp án đã chọn và đáp án đúng để hỗ trợ giải thích.
        </p>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto rounded-[24px] border border-slate-200 bg-slate-50 p-4">
        {chatHistory.length === 0 ? (
          <div className="text-sm text-slate-500">
            Chưa có hội thoại nào. Gõ vào ô bên dưới để AI giải thích tại sao bạn chọn sai.
          </div>
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
    </>
  )
}

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function buildTopicLabel(subjectName?: string | null, topicName?: string | null) {
  const subject = subjectName?.trim()
  const topic = topicName?.trim()

  if (subject && topic) {
    return `${subject} - ${topic}`
  }
  if (topic) {
    return topic
  }
  if (subject) {
    return subject
  }
  return 'Chưa xác định chuyên đề'
}


