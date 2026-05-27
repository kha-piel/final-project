import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { MarkdownContent } from '../../components/ui/MarkdownContent'
import { PageCard } from '../../components/ui/PageCard'
import { buildSubmissionSummary } from '../../features/exam/core/exam-session'
import {
  requestAutoExplanation,
  requestWeaknessAnalysis,
  sendExamChatMessage,
} from '../../features/exam/services/exam-ai-service'
import {
  fetchPersistedAttemptReview,
  type PersistedAttemptReview,
} from '../../features/exam/services/exam-review-service'
import { useExamDraftStore } from '../../features/exam/store/exam-draft-store'
import { useExamRuntimeStore } from '../../features/exam/store/exam-runtime-store'
import { useFlaggedWrongQuestionStore } from '../../features/practice/store/flagged-wrong-question-store'
import { RecommendedReviewLinks } from '../../features/review/components/RecommendedReviewLinks'
import {
  inferKnowledgeReviewTopics,
  type KnowledgeReviewTopic,
} from '../../features/review/knowledge-review-topics'

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
        sessionDifficultyLabel={session.difficultyLabel}
        sessionDifficultyLevel={session.difficultyLevel}
        sessionQuestions={session.questions}
        sessionSubjectId={session.subjectId}
        sessionSubjectName={session.subjectName}
        sessionTopicId={session.topicId}
        sessionTitle={session.title}
        sessionTopicName={session.topicName}
        summary={summary}
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
    return <PersistedReviewContent review={persistedReview} />
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
  sessionDifficultyLabel,
  sessionDifficultyLevel,
  sessionQuestions,
  sessionSubjectId,
  sessionTopicName,
  sessionSubjectName,
  sessionTopicId,
  sessionTitle,
  summary,
}: {
  sessionDifficultyLabel: string
  sessionDifficultyLevel: number
  sessionQuestions: ReturnType<typeof useExamDraftStore.getState>['sessions'][string]['questions']
  sessionSubjectId: string
  sessionTopicName: string
  sessionSubjectName: string
  sessionTopicId: string
  sessionTitle: string
  summary: ReturnType<typeof buildSubmissionSummary>
}) {
  return (
    <PageCard
      title="Tổng kết Ôn tập"
      description={`${sessionTitle} | Điểm ${summary.score}/10 | ${summary.passed ? 'Đạt' : 'Chưa đạt'}`}
    >
      <ReviewActionRow />
      <ReviewSummaryBody
        allowFlagging
        difficultyLabel={sessionDifficultyLabel}
        questionBank={sessionQuestions}
        sessionDifficultyLevel={sessionDifficultyLevel}
        sessionSubjectId={sessionSubjectId}
        sessionSubjectName={sessionSubjectName}
        sessionTopicId={sessionTopicId}
        sessionTopicName={sessionTopicName}
        summary={summary}
        topicLabel={buildTopicLabel(sessionSubjectName, sessionTopicName)}
      />
    </PageCard>
  )
}

function PersistedReviewContent({ review }: { review: PersistedAttemptReview }) {
  return (
    <PageCard
      title="Tổng kết Ôn tập"
      description={`${review.examTitle} | ${review.subjectName} | ${review.topicName} | Điểm ${review.score}/10`}
    >
      <p className="mb-4 text-slate-500">
        Độ khó: {review.difficultyLabel} | Trạng thái: {review.status} | Hoàn tất:{' '}
        {review.completedAt ? new Date(review.completedAt).toLocaleString('vi-VN') : '--'}
      </p>
      <ReviewActionRow />
      <ReviewSummaryBody
        allowFlagging={false}
        difficultyLabel={review.difficultyLabel}
        sessionTopicName={review.topicName}
        summary={review}
        topicLabel={buildTopicLabel(review.subjectName, review.topicName)}
      />
    </PageCard>
  )
}

function ReviewActionRow() {
  return (
    <div className="mb-6 flex flex-wrap gap-3">
      <Link className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50" to="/dashboard">
        Quay lại dashboard
      </Link>
      <Link className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800" to="/home">
        Về trang chủ
      </Link>
    </div>
  )
}

function ReviewSummaryBody({
  allowFlagging,
  difficultyLabel,
  questionBank,
  sessionDifficultyLevel,
  sessionSubjectId,
  sessionSubjectName,
  sessionTopicId,
  sessionTopicName,
  summary,
  topicLabel,
}: {
  allowFlagging: boolean
  difficultyLabel: string
  questionBank?: ReturnType<typeof useExamDraftStore.getState>['sessions'][string]['questions']
  sessionDifficultyLevel?: number
  sessionSubjectId?: string
  sessionSubjectName?: string
  sessionTopicId?: string
  sessionTopicName: string
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
}) {
  const [weaknessAnalysis, setWeaknessAnalysis] = useState('')
  const [recommendedTopics, setRecommendedTopics] = useState<KnowledgeReviewTopic[]>([])
  const [analysisError, setAnalysisError] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [reviewChatInput, setReviewChatInput] = useState('')
  const [isAiBusyByQuestionId, setIsAiBusyByQuestionId] = useState<Record<string, boolean>>({})
  const [aiErrorByQuestionId, setAiErrorByQuestionId] = useState<Record<string, string>>({})
  const [chatHistoryByQuestionId, setChatHistoryByQuestionId] = useState<
    Record<string, { role: 'user' | 'ai'; content: string }[]>
  >({})
  const flaggedItems = useFlaggedWrongQuestionStore((state) => state.items)
  const upsertFlaggedQuestion = useFlaggedWrongQuestionStore((state) => state.upsertFlaggedQuestion)
  const removeFlaggedQuestion = useFlaggedWrongQuestionStore((state) => state.removeFlaggedQuestion)

  const questionMap = useMemo(
    () =>
      (questionBank ?? []).reduce<Record<string, NonNullable<typeof questionBank>[number]>>((acc, item) => {
        acc[item.questionId] = item
        return acc
      }, {}),
    [questionBank],
  )

  const flaggedCount = useMemo(() => {
    if (!allowFlagging || !sessionSubjectId || !sessionTopicId) {
      return 0
    }

    return summary.reviewItems.filter((item) => {
      if (item.correct) {
        return false
      }

      return Boolean(flaggedItems[`${sessionSubjectId}::${sessionTopicId}::${item.questionId}`])
    }).length
  }, [allowFlagging, flaggedItems, sessionSubjectId, sessionTopicId, summary.reviewItems])

  async function handleAnalyzeWeaknesses() {
    const wrongItems = summary.reviewItems
      .filter((item) => !item.correct)
      .map((item) => ({
        questionId: item.questionId,
        questionContent: item.questionContent,
        topic: buildWeaknessTopicLabel({
          fallbackTopicLabel: topicLabel,
          question: questionMap[item.questionId],
          sessionTopicName,
        }),
        userAnswer: item.selectedAnswerText,
        correctAnswer: item.correctAnswerText,
      }))
    const recommendationInputs = summary.reviewItems
      .filter((item) => !item.correct)
      .flatMap((item) => {
        const question = questionMap[item.questionId]
        return [
          item.questionContent,
          topicLabel,
          sessionTopicName,
          question?.topicId ?? '',
          question?.obsidianSourcePath ?? '',
        ]
      })

    if (wrongItems.length === 0) {
      setAnalysisError('')
      setRecommendedTopics([])
      setWeaknessAnalysis(
        'Bạn không có câu sai nào trong bài này. Hãy tiếp tục nâng độ khó để kiểm tra độ vững kiến thức.',
      )
      return
    }

    setIsAnalyzing(true)
    setAnalysisError('')

    try {
      const result = await requestWeaknessAnalysis(wrongItems)
      setWeaknessAnalysis(result)
      setRecommendedTopics(
        inferKnowledgeReviewTopics([...recommendationInputs, result]),
      )
    } catch (error) {
      setAnalysisError(
        error instanceof Error ? error.message : 'Không thể lấy phân tích tổng quan lúc này.',
      )
    } finally {
      setIsAnalyzing(false)
    }
  }

  function handleToggleFlag(questionId: string) {
    if (!allowFlagging || !sessionSubjectId || !sessionSubjectName || !sessionTopicId || sessionDifficultyLevel === undefined) {
      return
    }

    const flaggedId = `${sessionSubjectId}::${sessionTopicId}::${questionId}`
    if (flaggedItems[flaggedId]) {
      removeFlaggedQuestion({
        subjectId: sessionSubjectId,
        topicId: sessionTopicId,
        questionId,
      })
      return
    }

    const question = questionMap[questionId]
    if (!question) {
      return
    }

    upsertFlaggedQuestion({
      questionId,
      subjectId: sessionSubjectId,
      subjectName: sessionSubjectName,
      topicId: sessionTopicId,
      topicName: sessionTopicName,
      difficultyLevel: sessionDifficultyLevel,
      difficultyLabel,
      question,
    })
  }

  function handleFlagAllWrongQuestions() {
    if (!allowFlagging || !sessionSubjectId || !sessionSubjectName || !sessionTopicId || sessionDifficultyLevel === undefined) {
      return
    }

    summary.reviewItems.forEach((item) => {
      if (item.correct) {
        return
      }

      const question = questionMap[item.questionId]
      if (!question) {
        return
      }

      upsertFlaggedQuestion({
        questionId: item.questionId,
        subjectId: sessionSubjectId,
        subjectName: sessionSubjectName,
        topicId: sessionTopicId,
        topicName: sessionTopicName,
        difficultyLevel: sessionDifficultyLevel,
        difficultyLabel,
        question,
      })
    })
  }

  async function handleExplainQuestion(item: (typeof summary.reviewItems)[number]) {
    const question = questionMap[item.questionId]
    setIsAiBusyByQuestionId((state) => ({ ...state, [item.questionId]: true }))
    setAiErrorByQuestionId((state) => ({ ...state, [item.questionId]: '' }))

    try {
      const explanation = await requestAutoExplanation({
        questionContent: item.questionContent,
        selectedAnswer: item.selectedAnswerText,
        correctAnswer: item.correctAnswerText,
        obsidianSourcePath: question?.obsidianSourcePath ?? '',
      })

      setChatHistoryByQuestionId((state) => ({
        ...state,
        [item.questionId]: [
          ...(state[item.questionId] ?? []),
          { role: 'user', content: 'Em muốn AI giải thích câu này.' },
          { role: 'ai', content: explanation },
        ],
      }))
    } catch (error) {
      setAiErrorByQuestionId((state) => ({
        ...state,
        [item.questionId]: error instanceof Error ? error.message : 'Không thể lấy giải thích AI lúc này.',
      }))
    } finally {
      setIsAiBusyByQuestionId((state) => ({ ...state, [item.questionId]: false }))
    }
  }

  async function handleSendQuestionChat(item: (typeof summary.reviewItems)[number]) {
    const trimmed = reviewChatInput.trim()
    if (!trimmed) {
      return
    }

    const question = questionMap[item.questionId]
    setIsAiBusyByQuestionId((state) => ({ ...state, [item.questionId]: true }))
    setAiErrorByQuestionId((state) => ({ ...state, [item.questionId]: '' }))
    setChatHistoryByQuestionId((state) => ({
      ...state,
      [item.questionId]: [...(state[item.questionId] ?? []), { role: 'user', content: trimmed }],
    }))
    setReviewChatInput('')

    try {
      const explanation = await sendExamChatMessage({
        questionContent: item.questionContent,
        selectedAnswer: item.selectedAnswerText,
        correctAnswer: item.correctAnswerText,
        prompt: trimmed,
        obsidianSourcePath: question?.obsidianSourcePath ?? '',
      })

      setChatHistoryByQuestionId((state) => ({
        ...state,
        [item.questionId]: [...(state[item.questionId] ?? []), { role: 'ai', content: explanation }],
      }))
    } catch (error) {
      setAiErrorByQuestionId((state) => ({
        ...state,
        [item.questionId]: error instanceof Error ? error.message : 'Không thể gửi câu hỏi tới AI lúc này.',
      }))
    } finally {
      setIsAiBusyByQuestionId((state) => ({ ...state, [item.questionId]: false }))
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
        <button
          disabled={isAnalyzing}
          onClick={() => void handleAnalyzeWeaknesses()}
          className="mb-4 inline-block rounded-2xl bg-gradient-to-r from-teal-600 to-blue-600 px-5 py-3 font-bold text-white transition hover:from-teal-500 hover:to-blue-500 disabled:opacity-50"
          type="button"
        >
          {isAnalyzing ? 'AI đang phân tích tổng quan...' : 'AI phân tích tổng quan điểm yếu'}
        </button>

        {isAnalyzing ? (
          <div className="rounded-[22px] border border-transparent bg-white bg-clip-padding p-5 shadow-[0_14px_30px_rgba(16,35,60,0.08)] [background-image:linear-gradient(white,white),linear-gradient(135deg,#38bdf8,#2563eb,#f59e0b)] [background-origin:border-box]">
            <div className="mb-3 flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-500 font-bold text-white">
                AI
              </div>
              <div>
                <strong className="block text-slate-900">Đang đọc bài làm và tổng hợp điểm yếu</strong>
                <p className="m-0 text-slate-500">
                  Gemini đang xem nhóm câu sai và tìm chuyên đề bạn hổng nhiều nhất.
                </p>
              </div>
            </div>
            <div className="grid gap-3">
              <div className="h-3 w-[38%] rounded-full bg-gradient-to-r from-slate-200 via-slate-50 to-slate-200" />
              <div className="h-3 w-full rounded-full bg-gradient-to-r from-slate-200 via-slate-50 to-slate-200" />
              <div className="h-3 w-[92%] rounded-full bg-gradient-to-r from-slate-200 via-slate-50 to-slate-200" />
              <div className="h-3 w-[76%] rounded-full bg-gradient-to-r from-slate-200 via-slate-50 to-slate-200" />
            </div>
          </div>
        ) : null}

        {!isAnalyzing && weaknessAnalysis ? (
          <div className="rounded-[22px] border border-transparent bg-white bg-clip-padding p-5 shadow-[0_14px_30px_rgba(16,35,60,0.08)] [background-image:linear-gradient(white,white),linear-gradient(135deg,#38bdf8,#2563eb,#f59e0b)] [background-origin:border-box]">
            <div className="mb-3 flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-500 font-bold text-white">
                AI
              </div>
              <div>
                <strong className="block text-slate-900">AI phân tích tổng quan điểm yếu</strong>
                <p className="m-0 text-slate-500">
                  Tóm tắt nhanh các lỗ hổng kiến thức để ưu tiên ôn tập.
                </p>
              </div>
            </div>
            <p className="m-0 whitespace-pre-wrap leading-relaxed text-slate-700">{weaknessAnalysis}</p>
            <RecommendedReviewLinks topics={recommendedTopics} />
          </div>
        ) : null}

        {!isAnalyzing && analysisError ? <p className="mb-3 font-semibold text-red-600">{analysisError}</p> : null}
      </div>

      {allowFlagging ? (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-[20px] border border-amber-200 bg-amber-50 p-5">
          <div>
            <div className="mb-1 font-extrabold text-amber-900">Cắm cờ câu sai để ôn lại</div>
            <p className="m-0 text-amber-700">
              Đã cắm cờ {flaggedCount}/{summary.wrongCount} câu sai trong bài này. Các câu này sẽ được đưa vào Dashboard để tạo phiên ôn tập lại.
            </p>
          </div>
          <button
            disabled={summary.wrongCount === 0}
            onClick={handleFlagAllWrongQuestions}
            className="rounded-full bg-amber-500 px-4 py-2 font-extrabold text-white transition hover:bg-amber-600 disabled:opacity-50"
            type="button"
          >
            Cắm cờ tất cả câu sai
          </button>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <MetricPill label="Điểm" value={`${summary.score}/10`} />
        <MetricPill label="Đúng" value={`${summary.correctCount}`} />
        <MetricPill label="Sai" value={`${summary.wrongCount}`} />
        <MetricPill label="Bỏ qua" value={`${summary.skippedCount}`} />
        <MetricPill label="Tổng số câu" value={`${summary.totalQuestions}`} />
        <MetricPill label="Thời gian" value={formatDuration(summary.timeTakenSeconds)} />
      </div>

      <div className="space-y-6">
        {summary.reviewItems.map((item, index) => {
          const question = questionMap[item.questionId]
          const isFlagged = allowFlagging && sessionSubjectId && sessionTopicId && flaggedItems[`${sessionSubjectId}::${sessionTopicId}::${item.questionId}`]

          return (
            <section key={item.questionId} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <h3 className="text-xl font-bold text-slate-900">Câu {index + 1}</h3>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-3 py-1 text-sm font-bold ${item.correct ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {item.correct ? 'Đúng' : 'Sai / chưa đúng'}
                  </span>
                  {allowFlagging && !item.correct && sessionSubjectId && sessionTopicId ? (
                    <button
                      onClick={() => handleToggleFlag(item.questionId)}
                      className={`rounded-full border px-3 py-1 text-sm font-bold transition ${isFlagged ? 'border-amber-500 bg-amber-500 text-white' : 'border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100'}`}
                      type="button"
                    >
                      {isFlagged ? 'Bỏ cắm cờ' : 'Cắm cờ câu này'}
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="mb-4 inline-block rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700">
                Chuyên đề: {topicLabel}
              </div>

              <div className="mb-6">
                <div className="mb-2 text-xs font-extrabold uppercase tracking-widest text-slate-500">Nội dung câu hỏi</div>
                <MarkdownContent
                  content={item.questionContent}
                  className="text-base leading-loose text-slate-800"
                />
              </div>

              {question ? (
                <div className="mb-6">
                  <div className="mb-2 text-xs font-extrabold uppercase tracking-widest text-slate-500">Các lựa chọn</div>
                  <AnswerChoiceReview
                    correctAnswerText={item.correctAnswerText}
                    questionContent={item.questionContent}
                    question={question}
                    selectedAnswerText={item.selectedAnswerText}
                  />
                </div>
              ) : null}

              {!question || question.questionType === 'short_answer' ? (
                <div className="mb-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-2 text-xs font-extrabold uppercase tracking-widest text-slate-500">Lựa chọn của học sinh</div>
                    <MarkdownContent content={item.selectedAnswerText} className="text-sm leading-relaxed text-slate-800" />
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-2 text-xs font-extrabold uppercase tracking-widest text-slate-500">Đáp án đúng</div>
                    <MarkdownContent content={item.correctAnswerText} className="text-sm leading-relaxed text-slate-800" />
                  </div>
                </div>
              ) : null}

              {/* AI Explanation Box */}
              <div className="mt-8 overflow-hidden rounded-2xl border border-indigo-100 bg-indigo-50/50">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-indigo-100 bg-indigo-50/80 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 font-bold text-white">AI</div>
                    <div>
                      <h4 className="text-base font-bold text-indigo-950">Trò chuyện với AI</h4>
                      <p className="text-xs text-indigo-700">AI giải thích câu hỏi dựa trên đáp án đúng và file kiến thức.</p>
                    </div>
                  </div>
                  <button
                    disabled={Boolean(isAiBusyByQuestionId[item.questionId])}
                    onClick={() => void handleExplainQuestion(item)}
                    className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-indigo-500 disabled:opacity-50"
                    type="button"
                  >
                    {isAiBusyByQuestionId[item.questionId] ? 'Đang giải thích...' : 'Giải thích câu này'}
                  </button>
                </div>

                <div className="p-5">
                  {(chatHistoryByQuestionId[item.questionId] ?? []).length === 0 ? (
                    <div className="text-sm italic text-indigo-400">
                      Chưa có hội thoại nào. Bấm "Giải thích câu này" hoặc hỏi thêm để AI phân tích sâu hơn.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {(chatHistoryByQuestionId[item.questionId] ?? []).map((message, idx) => (
                        <div
                          key={`${item.questionId}-${idx}-${message.role}`}
                          className={`rounded-2xl border px-4 py-3 text-sm leading-relaxed ${
                            message.role === 'user'
                              ? 'ml-8 border-indigo-100 bg-white text-slate-800'
                              : 'mr-8 border-indigo-200 bg-indigo-100 text-indigo-900'
                          }`}
                        >
                          <div className="mb-1 text-[11px] font-extrabold uppercase tracking-widest text-indigo-400">
                            {message.role === 'user' ? 'Học sinh' : 'AI gia sư'}
                          </div>
                          <MarkdownContent content={message.content} className="text-sm leading-7" />
                        </div>
                      ))}
                    </div>
                  )}

                  {aiErrorByQuestionId[item.questionId] ? (
                    <p className="mt-3 text-sm font-semibold text-red-600">{aiErrorByQuestionId[item.questionId]}</p>
                  ) : null}

                  <div className="mt-4 flex gap-3 border-t border-indigo-100 pt-4">
                    <input
                      disabled={Boolean(isAiBusyByQuestionId[item.questionId])}
                      onChange={(event) => setReviewChatInput(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault()
                          void handleSendQuestionChat(item)
                        }
                      }}
                      placeholder="Hỏi thêm AI về câu này..."
                      className="flex-1 rounded-xl border border-indigo-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-indigo-400"
                      type="text"
                      value={reviewChatInput}
                    />
                    <button
                      disabled={Boolean(isAiBusyByQuestionId[item.questionId]) || !reviewChatInput.trim()}
                      onClick={() => void handleSendQuestionChat(item)}
                      className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-500 disabled:opacity-50"
                      type="button"
                    >
                      Gửi
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}

function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm text-slate-800">
      <strong className="font-bold text-blue-900">{label}:</strong> {value}
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

function extractMultipleChoiceOptions(questionContent: string) {
  const labelMatches = [...questionContent.matchAll(/(?:^|\s)([A-D])\.\s*/g)]
  if (labelMatches.length < 2) {
    return []
  }

  return labelMatches.map((match, index) => {
    const nextMatch = labelMatches[index + 1]
    const start = (match.index ?? 0) + match[0].length
    const end = nextMatch?.index ?? questionContent.length
    return {
      id: `parsed-${match[1]}`,
      label: match[1],
      content: questionContent.slice(start, end).trim(),
      isCorrect: false,
    }
  }).filter((answer) => answer.content.length > 0)
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

function buildWeaknessTopicLabel(input: {
  fallbackTopicLabel: string
  question?: ReturnType<typeof useExamDraftStore.getState>['sessions'][string]['questions'][number]
  sessionTopicName: string
}) {
  const sourcePath = input.question?.obsidianSourcePath?.trim()
  if (sourcePath) {
    return `${input.fallbackTopicLabel} | ${sourcePath}`
  }

  const topicId = input.question?.topicId?.trim()
  if (topicId && topicId !== 'practice-mock') {
    return `${input.sessionTopicName} | ${topicId}`
  }

  return input.fallbackTopicLabel
}
