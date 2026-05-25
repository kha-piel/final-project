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
        <p style={styles.text}>Vui lòng đợi trong giây lát.</p>
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
        {persistedReviewError ? <p style={styles.error}>{persistedReviewError}</p> : null}
        <p style={styles.text}>
          Hãy quay lại <Link to="/dashboard">dashboard</Link> và tạo đề mới.
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
      <p style={styles.text}>
        Do kho: {review.difficultyLabel} | Trang thai: {review.status} | Hoan tat:{' '}
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
    <div style={styles.actionRow}>
      <Link style={styles.secondaryLink} to="/dashboard">
        Quay lại dashboard
      </Link>
      <Link style={styles.primaryLink} to="/home">
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
  const [selectedReviewQuestionId, setSelectedReviewQuestionId] = useState<string | null>(null)
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

  const selectedReviewItem = useMemo(() => {
    if (!selectedReviewQuestionId) {
      return null
    }

    return summary.reviewItems.find((item) => item.questionId === selectedReviewQuestionId) ?? null
  }, [selectedReviewQuestionId, summary.reviewItems])
  const selectedReviewQuestion = selectedReviewItem ? questionMap[selectedReviewItem.questionId] : undefined

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
    <>
      <div style={styles.analysisSection}>
        <button
          disabled={isAnalyzing}
          onClick={() => void handleAnalyzeWeaknesses()}
          style={styles.analysisButton}
          type="button"
        >
          {isAnalyzing ? 'AI đang phân tích tổng quan...' : 'AI phân tích tổng quan điểm yếu'}
        </button>

        {isAnalyzing ? (
          <div style={styles.analysisCard}>
            <div style={styles.analysisHeader}>
              <div style={styles.analysisBadge}>AI</div>
              <div>
                <strong style={styles.analysisTitle}>Đang đọc bài làm và tổng hợp điểm yếu</strong>
                <p style={styles.analysisSubtitle}>
                  Gemini đang xem nhóm câu sai và tìm chuyên đề bạn hổng nhiều nhất.
                </p>
              </div>
            </div>
            <div style={styles.skeletonStack}>
              <div style={{ ...styles.skeletonBar, width: '38%' }} />
              <div style={{ ...styles.skeletonBar, width: '100%' }} />
              <div style={{ ...styles.skeletonBar, width: '92%' }} />
              <div style={{ ...styles.skeletonBar, width: '76%' }} />
            </div>
          </div>
        ) : null}

        {!isAnalyzing && weaknessAnalysis ? (
          <div style={styles.analysisCard}>
            <div style={styles.analysisHeader}>
              <div style={styles.analysisBadge}>AI</div>
              <div>
                <strong style={styles.analysisTitle}>AI phân tích tổng quan điểm yếu</strong>
                <p style={styles.analysisSubtitle}>
                  Tóm tắt nhanh các lỗ hổng kiến thức để ưu tiên ôn tập.
                </p>
              </div>
            </div>
            <p style={styles.analysisText}>{weaknessAnalysis}</p>
            <RecommendedReviewLinks topics={recommendedTopics} />
          </div>
        ) : null}

        {!isAnalyzing && analysisError ? <p style={styles.error}>{analysisError}</p> : null}
      </div>

      {allowFlagging ? (
        <div style={styles.flagPanel}>
          <div>
            <div style={styles.flagPanelTitle}>Cắm cờ câu sai để ôn lại</div>
            <p style={styles.flagPanelText}>
              Đã cắm cờ {flaggedCount}/{summary.wrongCount} câu sai trong bài này. Các câu này sẽ được đưa vào Dashboard để tạo phiên ôn tập lại.
            </p>
          </div>
          <button
            disabled={summary.wrongCount === 0}
            onClick={handleFlagAllWrongQuestions}
            style={styles.flagAllButton}
            type="button"
          >
            Cắm cờ tất cả câu sai
          </button>
        </div>
      ) : null}

      <div style={styles.metricRow}>
        <MetricPill label="Điểm" value={`${summary.score}/10`} />
        <MetricPill label="Đúng" value={`${summary.correctCount}`} />
        <MetricPill label="Sai" value={`${summary.wrongCount}`} />
        <MetricPill label="Bỏ qua" value={`${summary.skippedCount}`} />
        <MetricPill label="Tổng số câu" value={`${summary.totalQuestions}`} />
        <MetricPill label="Thời gian" value={formatDuration(summary.timeTakenSeconds)} />
      </div>

      <section style={styles.questionOverview}>
        <div style={styles.questionOverviewHeader}>
          <div>
            <div style={styles.questionOverviewKicker}>Chi tiết kết quả</div>
            <h2 style={styles.questionOverviewTitle}>Bấm vào từng câu để mở review và chat AI</h2>
          </div>
          <div style={styles.questionOverviewCount}>{summary.reviewItems.length} câu</div>
        </div>
        <div style={styles.questionButtonGrid}>
          {summary.reviewItems.map((item, index) => (
            <button
              key={item.questionId}
              onClick={() => {
                setSelectedReviewQuestionId(item.questionId)
                setReviewChatInput('')
              }}
              style={item.correct ? styles.questionButtonCorrect : styles.questionButtonWrong}
              type="button"
            >
              <strong>Câu {index + 1}</strong>
              <span>{item.correct ? 'Đúng' : 'Sai / chưa đúng'}</span>
            </button>
          ))}
        </div>
      </section>

      {selectedReviewItem ? (
        <div style={styles.modalOverlay}>
          <div style={styles.reviewModal}>
            <div style={styles.modalHeader}>
              <div>
                <div style={styles.modalKicker}>Review câu hỏi</div>
                <h2 style={styles.modalTitle}>
                  Câu {summary.reviewItems.findIndex((item) => item.questionId === selectedReviewItem.questionId) + 1}
                  {' | '}
                  {selectedReviewItem.correct ? 'Đúng' : 'Sai / chưa đúng'}
                </h2>
              </div>
              <button
                aria-label="Đóng review câu hỏi"
                onClick={() => {
                  setSelectedReviewQuestionId(null)
                  setReviewChatInput('')
                }}
                style={styles.closeButton}
                type="button"
              >
                X
              </button>
            </div>

            <div style={styles.modalBody}>
              <section style={styles.modalQuestionPane}>
                <div style={selectedReviewItem.correct ? styles.statusCorrect : styles.statusWrong}>
                  {selectedReviewItem.correct ? 'Đúng' : 'Sai'}
                </div>
                <div style={styles.topicPill}>Chuyên đề: {topicLabel}</div>

                <div style={styles.modalBlock}>
                  <div style={styles.modalBlockLabel}>Nội dung câu hỏi</div>
                  <MarkdownContent
                    content={selectedReviewItem.questionContent}
                    className="text-base leading-8 text-slate-900"
                  />
                </div>

                {selectedReviewQuestion ? (
                  <div style={styles.modalBlock}>
                    <div style={styles.modalBlockLabel}>Các lựa chọn trong câu hỏi</div>
                    <AnswerChoiceReview
                      correctAnswerText={selectedReviewItem.correctAnswerText}
                      questionContent={selectedReviewItem.questionContent}
                      question={selectedReviewQuestion}
                      selectedAnswerText={selectedReviewItem.selectedAnswerText}
                    />
                  </div>
                ) : null}

                {!selectedReviewQuestion || selectedReviewQuestion.questionType === 'short_answer' ? (
                  <div style={styles.answerGrid}>
                    <div style={styles.answerBox}>
                      <div style={styles.modalBlockLabel}>Lựa chọn của học sinh</div>
                      <MarkdownContent content={selectedReviewItem.selectedAnswerText} className="text-sm leading-7" />
                    </div>
                    <div style={styles.answerBox}>
                      <div style={styles.modalBlockLabel}>Đáp án đúng</div>
                      <MarkdownContent content={selectedReviewItem.correctAnswerText} className="text-sm leading-7" />
                    </div>
                  </div>
                ) : null}

                {allowFlagging && !selectedReviewItem.correct && sessionSubjectId && sessionTopicId ? (
                  <button
                    onClick={() => handleToggleFlag(selectedReviewItem.questionId)}
                    style={
                      flaggedItems[`${sessionSubjectId}::${sessionTopicId}::${selectedReviewItem.questionId}`]
                        ? styles.flaggedButton
                        : styles.flagButton
                    }
                    type="button"
                  >
                    {flaggedItems[`${sessionSubjectId}::${sessionTopicId}::${selectedReviewItem.questionId}`]
                      ? 'Bỏ cắm cờ'
                      : 'Cắm cờ câu này'}
                  </button>
                ) : null}
              </section>

              <section style={styles.modalAiPane}>
                <div style={styles.aiPaneHeader}>
                  <div>
                    <h3 style={styles.aiPaneTitle}>Trò chuyện với AI</h3>
                    <p style={styles.aiPaneSubtitle}>
                      AI đọc câu hỏi, đáp án đã chọn, đáp án đúng và file kiến thức liên quan để giải thích.
                    </p>
                  </div>
                  <button
                    disabled={Boolean(isAiBusyByQuestionId[selectedReviewItem.questionId])}
                    onClick={() => void handleExplainQuestion(selectedReviewItem)}
                    style={styles.explainButton}
                    type="button"
                  >
                    {isAiBusyByQuestionId[selectedReviewItem.questionId]
                      ? 'Đang giải thích...'
                      : 'Giải thích câu này'}
                  </button>
                </div>

                <div style={styles.chatBox}>
                  {(chatHistoryByQuestionId[selectedReviewItem.questionId] ?? []).length === 0 ? (
                    <div style={styles.emptyChat}>
                      Chưa có hội thoại nào. Bấm "Giải thích câu này" hoặc hỏi thêm để AI phân tích sâu hơn.
                    </div>
                  ) : (
                    (chatHistoryByQuestionId[selectedReviewItem.questionId] ?? []).map((message, index) => (
                      <div
                        key={`${selectedReviewItem.questionId}-${index}-${message.role}`}
                        style={message.role === 'user' ? styles.userMessage : styles.aiMessage}
                      >
                        <div style={styles.messageRole}>{message.role === 'user' ? 'Học sinh' : 'AI gia sư'}</div>
                        <MarkdownContent content={message.content} className="text-sm leading-7" />
                      </div>
                    ))
                  )}
                </div>

                {aiErrorByQuestionId[selectedReviewItem.questionId] ? (
                  <p style={styles.error}>{aiErrorByQuestionId[selectedReviewItem.questionId]}</p>
                ) : null}

                <div style={styles.chatInputRow}>
                  <input
                    disabled={Boolean(isAiBusyByQuestionId[selectedReviewItem.questionId])}
                    onChange={(event) => setReviewChatInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault()
                        void handleSendQuestionChat(selectedReviewItem)
                      }
                    }}
                    placeholder="Hỏi thêm AI về câu này..."
                    style={styles.chatInput}
                    type="text"
                    value={reviewChatInput}
                  />
                  <button
                    disabled={
                      Boolean(isAiBusyByQuestionId[selectedReviewItem.questionId]) ||
                      !reviewChatInput.trim()
                    }
                    onClick={() => void handleSendQuestionChat(selectedReviewItem)}
                    style={styles.sendButton}
                    type="button"
                  >
                    Gửi
                  </button>
                </div>
              </section>
            </div>
          </div>
        </div>
      ) : null}

    </>
  )
}

function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <div style={styles.metric}>
      <strong>{label}:</strong> {value}
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
        <p style={styles.choiceEmpty}>
          Chưa tách được phương án A/B/C/D từ dữ liệu câu hỏi. Xem đáp án đã chọn và đáp án đúng bên dưới.
        </p>
      )
    }

    return (
      <div style={styles.choiceList}>
        {choices.map((answer) => {
          const selected = isAnswerLabelMatch(selectedAnswerText, answer.label)
          const correct = answer.isCorrect || isAnswerLabelMatch(correctAnswerText, answer.label)

          return (
            <div
              key={answer.id}
              style={{
                ...styles.choiceItem,
                ...(correct ? styles.choiceCorrect : {}),
                ...(selected && !correct ? styles.choiceSelectedWrong : {}),
                ...(selected && correct ? styles.choiceSelectedCorrect : {}),
              }}
            >
              <div style={styles.choiceMeta}>
                <strong>{answer.label}</strong>
                {selected ? <span style={styles.choiceBadgeSelected}>Bạn chọn</span> : null}
                {correct ? <span style={styles.choiceBadgeCorrect}>Đáp án đúng</span> : null}
              </div>
              <MarkdownContent content={answer.content} className="text-sm leading-7" />
            </div>
          )
        })}
      </div>
    )
  }

  if (question.questionType === 'true_false' && question.statements?.length) {
    return (
      <div style={styles.choiceList}>
        {question.statements.map((statement, index) => (
          <div key={statement.statementId} style={styles.choiceItem}>
            <div style={styles.choiceMeta}>
              <strong>{String.fromCharCode(97 + index)})</strong>
              <span style={statement.isCorrect ? styles.choiceBadgeCorrect : styles.choiceBadgeMuted}>
                Đáp án đúng: {statement.isCorrect ? 'Đúng' : 'Sai'}
              </span>
            </div>
            <MarkdownContent content={statement.content} className="text-sm leading-7" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <p style={styles.choiceEmpty}>
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

const styles = {
  text: {
    margin: 0,
    color: '#5d7491',
  },
  error: {
    color: '#b42318',
    fontWeight: 600,
    marginBottom: '12px',
  },
  actionRow: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '10px',
    marginBottom: '18px',
  },
  analysisSection: {
    marginBottom: '22px',
  },
  analysisButton: {
    display: 'inline-block',
    borderRadius: '18px',
    border: 0,
    padding: '14px 18px',
    background: 'linear-gradient(135deg, #0f766e 0%, #2563eb 100%)',
    color: '#ffffff',
    fontWeight: 800,
    marginBottom: '16px',
  },
  analysisCard: {
    borderRadius: '22px',
    padding: '18px',
    background:
      'linear-gradient(#ffffff, #ffffff) padding-box, linear-gradient(135deg, #38bdf8, #2563eb, #f59e0b) border-box',
    border: '1.5px solid transparent',
    boxShadow: '0 14px 30px rgba(16, 35, 60, 0.08)',
  },
  analysisHeader: {
    display: 'flex',
    gap: '14px',
    alignItems: 'flex-start',
    marginBottom: '12px',
  },
  analysisBadge: {
    width: '42px',
    height: '42px',
    borderRadius: '999px',
    background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
    color: '#ffffff',
    fontWeight: 800,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  analysisTitle: {
    display: 'block',
    color: '#10233c',
    marginBottom: '4px',
  },
  analysisSubtitle: {
    margin: 0,
    color: '#607a97',
  },
  analysisText: {
    margin: 0,
    color: '#24415e',
    lineHeight: 1.6,
    whiteSpace: 'pre-wrap' as const,
  },
  skeletonStack: {
    display: 'grid',
    gap: '10px',
  },
  skeletonBar: {
    height: '12px',
    borderRadius: '999px',
    background: 'linear-gradient(90deg, #e2e8f0 0%, #f8fafc 50%, #e2e8f0 100%)',
  },
  primaryLink: {
    display: 'inline-block',
    borderRadius: '999px',
    padding: '10px 14px',
    backgroundColor: '#10233c',
    color: '#ffffff',
    fontWeight: 700,
    textDecoration: 'none',
  },
  secondaryLink: {
    display: 'inline-block',
    borderRadius: '999px',
    padding: '10px 14px',
    backgroundColor: '#ffffff',
    border: '1px solid #d7e3ef',
    color: '#24415e',
    fontWeight: 700,
    textDecoration: 'none',
  },
  metricRow: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '12px',
    marginBottom: '20px',
  },
  flagPanel: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap' as const,
    marginBottom: '20px',
    borderRadius: '20px',
    padding: '16px 18px',
    border: '1px solid #fde68a',
    backgroundColor: '#fffbeb',
  },
  flagPanelTitle: {
    color: '#92400e',
    fontWeight: 800,
    marginBottom: '4px',
  },
  flagPanelText: {
    margin: 0,
    color: '#a16207',
  },
  flagAllButton: {
    borderRadius: '999px',
    border: 0,
    padding: '10px 14px',
    backgroundColor: '#f59e0b',
    color: '#ffffff',
    fontWeight: 800,
  },
  metric: {
    borderRadius: '999px',
    padding: '10px 14px',
    backgroundColor: '#edf5ff',
    border: '1px solid #d4e4f6',
    color: '#24415e',
    fontWeight: 700,
  },
  reviewList: {
    display: 'grid',
    gap: '16px',
  },
  card: {
    borderRadius: '22px',
    padding: '20px',
    backgroundColor: '#ffffff',
    border: '1px solid #d7e3ef',
    boxShadow: '0 12px 28px rgba(16, 35, 60, 0.06)',
  },
  cardTopRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '10px',
  },
  cardOrder: {
    color: '#2563eb',
    fontWeight: 700,
  },
  flagButton: {
    borderRadius: '999px',
    border: '1px solid #fcd34d',
    padding: '8px 12px',
    backgroundColor: '#fffbeb',
    color: '#b45309',
    fontWeight: 700,
  },
  flaggedButton: {
    borderRadius: '999px',
    border: '1px solid #f59e0b',
    padding: '8px 12px',
    backgroundColor: '#f59e0b',
    color: '#ffffff',
    fontWeight: 700,
  },
  cardQuestion: {
    margin: '0 0 10px',
    color: '#10233c',
  },
  topicPill: {
    display: 'inline-block',
    borderRadius: '999px',
    padding: '8px 12px',
    backgroundColor: '#ecfdf5',
    border: '1px solid #a7f3d0',
    color: '#0f766e',
    fontWeight: 700,
    marginBottom: '12px',
  },
  cardAnswer: {
    margin: '8px 0',
    fontWeight: 600,
  },
  answerMarkdown: {
    marginTop: '4px',
    fontWeight: 400,
  },
  cardTag: {
    display: 'inline-block',
    borderRadius: '999px',
    padding: '8px 12px',
    backgroundColor: '#f8fbff',
    border: '1px solid #d7e3ef',
    color: '#24415e',
    fontWeight: 700,
    marginTop: '6px',
  },
  explanationWrap: {
    marginTop: '16px',
  },
  explanationLabel: {
    color: '#1d4ed8',
    fontWeight: 700,
    marginBottom: '10px',
  },
  explanationBox: {
    borderRadius: '16px',
    padding: '16px',
    backgroundColor: '#f8fbff',
    border: '1px solid #d7e3ef',
    color: '#36506c',
  },
  questionOverview: {
    borderRadius: '22px',
    padding: '20px',
    backgroundColor: '#ffffff',
    border: '1px solid #d7e3ef',
    boxShadow: '0 12px 28px rgba(16, 35, 60, 0.06)',
  },
  questionOverviewHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '16px',
    flexWrap: 'wrap' as const,
    marginBottom: '16px',
  },
  questionOverviewKicker: {
    color: '#64748b',
    fontSize: '12px',
    fontWeight: 800,
    letterSpacing: '0.14em',
    textTransform: 'uppercase' as const,
  },
  questionOverviewTitle: {
    margin: '6px 0 0',
    color: '#10233c',
    fontSize: '20px',
  },
  questionOverviewCount: {
    borderRadius: '999px',
    padding: '8px 12px',
    backgroundColor: '#f8fbff',
    border: '1px solid #d7e3ef',
    color: '#24415e',
    fontWeight: 800,
  },
  questionButtonGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(118px, 1fr))',
    gap: '10px',
  },
  questionButtonCorrect: {
    borderRadius: '16px',
    border: '1px solid #bbf7d0',
    backgroundColor: '#f0fdf4',
    color: '#166534',
    padding: '12px',
    textAlign: 'left' as const,
    display: 'grid',
    gap: '4px',
  },
  questionButtonWrong: {
    borderRadius: '16px',
    border: '1px solid #fecdd3',
    backgroundColor: '#fff1f2',
    color: '#be123c',
    padding: '12px',
    textAlign: 'left' as const,
    display: 'grid',
    gap: '4px',
  },
  modalOverlay: {
    position: 'fixed' as const,
    inset: 0,
    zIndex: 50,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    backdropFilter: 'blur(6px)',
  },
  reviewModal: {
    width: 'min(1320px, 100%)',
    height: 'min(92vh, 880px)',
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
    borderRadius: '30px',
    backgroundColor: '#ffffff',
    border: '1px solid #d7e3ef',
    boxShadow: '0 40px 120px rgba(15, 23, 42, 0.24)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    padding: '20px 24px',
    borderBottom: '1px solid #d7e3ef',
  },
  modalKicker: {
    color: '#64748b',
    fontSize: '12px',
    fontWeight: 800,
    letterSpacing: '0.14em',
    textTransform: 'uppercase' as const,
  },
  modalTitle: {
    margin: '6px 0 0',
    color: '#0f172a',
    fontSize: '24px',
  },
  closeButton: {
    width: '44px',
    height: '44px',
    borderRadius: '999px',
    border: '1px solid #d7e3ef',
    backgroundColor: '#ffffff',
    color: '#334155',
    fontWeight: 800,
  },
  modalBody: {
    minHeight: 0,
    flex: 1,
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.05fr) minmax(360px, 0.95fr)',
    overflow: 'hidden',
  },
  modalQuestionPane: {
    minHeight: 0,
    overflowY: 'auto' as const,
    padding: '24px',
    backgroundColor: '#f8fbff',
    borderRight: '1px solid #d7e3ef',
  },
  modalAiPane: {
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column' as const,
    padding: '24px',
    backgroundColor: '#ffffff',
  },
  statusCorrect: {
    display: 'inline-block',
    borderRadius: '999px',
    padding: '6px 10px',
    backgroundColor: '#dcfce7',
    color: '#166534',
    fontSize: '12px',
    fontWeight: 800,
    marginBottom: '12px',
  },
  statusWrong: {
    display: 'inline-block',
    borderRadius: '999px',
    padding: '6px 10px',
    backgroundColor: '#ffe4e6',
    color: '#be123c',
    fontSize: '12px',
    fontWeight: 800,
    marginBottom: '12px',
  },
  modalBlock: {
    borderRadius: '22px',
    padding: '18px',
    backgroundColor: '#ffffff',
    border: '1px solid #d7e3ef',
    marginTop: '16px',
  },
  modalBlockLabel: {
    color: '#64748b',
    fontSize: '12px',
    fontWeight: 800,
    letterSpacing: '0.12em',
    textTransform: 'uppercase' as const,
    marginBottom: '10px',
  },
  answerGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '12px',
    marginTop: '16px',
  },
  answerBox: {
    borderRadius: '20px',
    padding: '16px',
    backgroundColor: '#ffffff',
    border: '1px solid #d7e3ef',
  },
  aiPaneHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '14px',
    flexWrap: 'wrap' as const,
  },
  aiPaneTitle: {
    margin: 0,
    color: '#0f172a',
    fontSize: '20px',
  },
  aiPaneSubtitle: {
    margin: '6px 0 0',
    color: '#64748b',
    lineHeight: 1.6,
  },
  explainButton: {
    borderRadius: '16px',
    border: 0,
    padding: '12px 14px',
    backgroundColor: '#0f172a',
    color: '#ffffff',
    fontWeight: 800,
  },
  chatBox: {
    minHeight: 0,
    flex: 1,
    overflowY: 'auto' as const,
    borderRadius: '22px',
    border: '1px solid #d7e3ef',
    backgroundColor: '#f8fbff',
    padding: '16px',
    marginTop: '18px',
  },
  emptyChat: {
    color: '#64748b',
    lineHeight: 1.7,
  },
  userMessage: {
    borderRadius: '16px',
    padding: '12px 14px',
    backgroundColor: '#ffffff',
    border: '1px solid #d7e3ef',
    color: '#0f172a',
    marginLeft: '28px',
    marginBottom: '12px',
  },
  aiMessage: {
    borderRadius: '16px',
    padding: '12px 14px',
    backgroundColor: '#eff6ff',
    border: '1px solid #bfdbfe',
    color: '#1e293b',
    marginRight: '28px',
    marginBottom: '12px',
  },
  messageRole: {
    color: '#64748b',
    fontSize: '11px',
    fontWeight: 800,
    letterSpacing: '0.12em',
    textTransform: 'uppercase' as const,
    marginBottom: '4px',
  },
  chatInputRow: {
    display: 'flex',
    gap: '10px',
    paddingTop: '14px',
    borderTop: '1px solid #d7e3ef',
    marginTop: '14px',
  },
  chatInput: {
    flex: 1,
    borderRadius: '16px',
    border: '1px solid #d7e3ef',
    backgroundColor: '#f8fbff',
    padding: '12px 14px',
    color: '#334155',
    outline: 'none',
  },
  sendButton: {
    borderRadius: '16px',
    border: 0,
    padding: '12px 18px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    fontWeight: 800,
  },
  choiceList: {
    display: 'grid',
    gap: '10px',
  },
  choiceItem: {
    borderRadius: '16px',
    border: '1px solid #d7e3ef',
    backgroundColor: '#ffffff',
    padding: '12px 14px',
    color: '#1e293b',
  },
  choiceCorrect: {
    borderColor: '#86efac',
    backgroundColor: '#f0fdf4',
  },
  choiceSelectedWrong: {
    borderColor: '#fda4af',
    backgroundColor: '#fff1f2',
  },
  choiceSelectedCorrect: {
    borderColor: '#22c55e',
    backgroundColor: '#dcfce7',
  },
  choiceMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap' as const,
    marginBottom: '6px',
    color: '#0f172a',
  },
  choiceBadgeSelected: {
    borderRadius: '999px',
    padding: '4px 8px',
    backgroundColor: '#dbeafe',
    color: '#1d4ed8',
    fontSize: '11px',
    fontWeight: 800,
  },
  choiceBadgeCorrect: {
    borderRadius: '999px',
    padding: '4px 8px',
    backgroundColor: '#bbf7d0',
    color: '#166534',
    fontSize: '11px',
    fontWeight: 800,
  },
  choiceBadgeMuted: {
    borderRadius: '999px',
    padding: '4px 8px',
    backgroundColor: '#e2e8f0',
    color: '#475569',
    fontSize: '11px',
    fontWeight: 800,
  },
  choiceEmpty: {
    margin: 0,
    color: '#64748b',
    lineHeight: 1.7,
  },
}
