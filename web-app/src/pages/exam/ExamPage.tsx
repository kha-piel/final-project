import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { MarkdownContent } from '../../components/ui/MarkdownContent'
import { PageCard } from '../../components/ui/PageCard'
import { useAuthSessionStore } from '../../features/auth/store/auth-session-store'
import type { DraftQuestion } from '../../features/dashboard/types/dashboard-types'
import {
  formatCorrectResponse,
  formatQuestionResponse,
  getRemainingSeconds,
  getSelectedAnswerId,
  getSelectedTrueFalseMap,
  getShortAnswerValue,
  hasAnsweredQuestion,
  isQuestionLocked,
} from '../../features/exam/core/exam-session'
import {
  persistCompletedAttempt,
  syncInProgressAttempt,
} from '../../features/exam/services/exam-attempt-service'
import { requestAutoExplanation, sendExamChatMessage } from '../../features/exam/services/exam-ai-service'
import { useExamDraftStore } from '../../features/exam/store/exam-draft-store'
import { useExamRuntimeStore } from '../../features/exam/store/exam-runtime-store'

export function ExamPage() {
  const navigate = useNavigate()
  const { sessionId = '' } = useParams()
  const authUser = useAuthSessionStore((state) => state.user)
  const session = useExamDraftStore((state) => state.sessions[sessionId] ?? null)
  const runtime = useExamRuntimeStore((state) => state.sessions[sessionId] ?? null)
  const initializeSession = useExamRuntimeStore((state) => state.initializeSession)
  const selectAnswer = useExamRuntimeStore((state) => state.selectAnswer)
  const selectTrueFalseStatement = useExamRuntimeStore((state) => state.selectTrueFalseStatement)
  const setShortAnswer = useExamRuntimeStore((state) => state.setShortAnswer)
  const goToNextQuestion = useExamRuntimeStore((state) => state.goToNextQuestion)
  const goToPreviousQuestion = useExamRuntimeStore((state) => state.goToPreviousQuestion)
  const checkCurrentQuestion = useExamRuntimeStore((state) => state.checkCurrentQuestion)
  const addChatMessage = useExamRuntimeStore((state) => state.addChatMessage)
  const cacheAiExplanation = useExamRuntimeStore((state) => state.cacheAiExplanation)
  const markCloudSync = useExamRuntimeStore((state) => state.markCloudSync)
  const submitSession = useExamRuntimeStore((state) => state.submitSession)
  const clearRuntimeSession = useExamRuntimeStore((state) => state.clearRuntimeSession)
  const clearDraftSession = useExamDraftStore((state) => state.clearSession)

  const [remainingSeconds, setRemainingSeconds] = useState<number>(0)
  const [flashMessage, setFlashMessage] = useState<string>('')
  const [chatInput, setChatInput] = useState('')
  const [chatStatus, setChatStatus] = useState('')
  const [isAiBusy, setIsAiBusy] = useState(false)
  const hasCheckedRestoreStateRef = useRef(false)
  const hasShownRestoreNoticeRef = useRef(false)

  useEffect(() => {
    hasCheckedRestoreStateRef.current = false
    hasShownRestoreNoticeRef.current = false
  }, [sessionId])

  useEffect(() => {
    if (!session) {
      return
    }
    initializeSession(session)
  }, [initializeSession, session])

  useEffect(() => {
    if (!session || !runtime) {
      return
    }

    if (hasCheckedRestoreStateRef.current) {
      return
    }

    hasCheckedRestoreStateRef.current = true

    const hasProgress =
      runtime.currentIndex > 0 ||
      session.questions.some((question) => hasAnsweredQuestion(runtime, question)) ||
      runtime.chatHistory.length > 0

    if (hasProgress && !runtime.submittedAt && !hasShownRestoreNoticeRef.current) {
      hasShownRestoreNoticeRef.current = true
      setFlashMessage('Đã khôi phục bài đang làm từ local session trên trình duyệt.')
    }
  }, [runtime, session])

  useEffect(() => {
    if (!session || !runtime) {
      return
    }

    const updateRemaining = () => {
      const nextRemaining = getRemainingSeconds(session, runtime)
      setRemainingSeconds(nextRemaining)
      if (nextRemaining <= 0) {
        setFlashMessage('Đã hết giờ. Hãy nộp bài để xem tổng kết.')
      }
    }

    updateRemaining()
    const timerId = window.setInterval(updateRemaining, 1000)
    return () => window.clearInterval(timerId)
  }, [runtime, session])

  const currentQuestion = useMemo(() => {
    if (!session || !runtime) {
      return null
    }

    return session.questions[runtime.currentIndex] ?? null
  }, [runtime, session])

  const syncSignature = useMemo(() => {
    if (!runtime) {
      return ''
    }

    return JSON.stringify({
      currentIndex: runtime.currentIndex,
      selected: runtime.selectedAnswerIdsByQuestionId,
      trueFalse: runtime.selectedTrueFalseByQuestionId,
      shortAnswer: runtime.shortAnswerByQuestionId,
      locked: runtime.lockedQuestionIds,
      chatCount: runtime.chatHistory.length,
      submittedAt: runtime.submittedAt,
    })
  }, [runtime])

  useEffect(() => {
    if (!authUser?.id || !session || !runtime || runtime.submittedAt || session.deliveryMode === 'local_mock') {
      return
    }

    const hasProgress =
      runtime.currentIndex > 0 ||
      session.questions.some((question) => hasAnsweredQuestion(runtime, question)) ||
      runtime.chatHistory.length > 0

    if (!hasProgress) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      void syncInProgressAttempt({
        userId: authUser.id,
        session,
        runtime,
      })
        .then((result) => {
          markCloudSync(session.sessionId, {
            persistedExamId: result.examId,
            persistedAttemptId: result.attemptId,
            persistedChatSessionId: result.chatSessionId,
            syncedChatMessageCount: result.syncedChatMessageCount,
            lastSyncedAt: Date.now(),
          })
        })
        .catch(() => {
          // Keep the exam flow moving; sync errors are surfaced only when submit truly fails.
        })
    }, 1200)

    return () => window.clearTimeout(timeoutId)
  }, [authUser?.id, markCloudSync, runtime, session, syncSignature])

  if (!session) {
    return (
      <PageCard title="Exam Session Not Found" description="Session này hiện không tồn tại trong local app state.">
        <p style={styles.text}>
          Hãy quay lại <Link to="/practice">practice</Link> hoặc <Link to="/dashboard">dashboard</Link>.
        </p>
      </PageCard>
    )
  }

  if (!runtime || !currentQuestion) {
    return (
      <PageCard title={session.title} description="Đang khởi tạo exam runtime session...">
        <p style={styles.text}>Vui long doi trong giay lat.</p>
      </PageCard>
    )
  }

  const question = currentQuestion
  const selectedAnswerId = getSelectedAnswerId(runtime, question.questionId)
  const selectedTrueFalseMap = getSelectedTrueFalseMap(runtime, question.questionId)
  const shortAnswerValue = getShortAnswerValue(runtime, question.questionId)
  const questionLocked = isQuestionLocked(runtime, question.questionId)
  const answeredCount = session.questions.filter((item) => hasAnsweredQuestion(runtime, item)).length
  const isSubmitted = Boolean(runtime.submittedAt)
  const selectedAnswerLabel = formatQuestionResponse(runtime, question)
  const correctAnswerLabel = formatCorrectResponse(question)
  const syncStatus =
    session.deliveryMode === 'local_mock'
      ? 'Local mock'
      : runtime.lastSyncedAt
        ? `OK ${formatSyncTime(runtime.lastSyncedAt)}`
        : 'Đang chờ'

  function handleCheckAnswer() {
    const result = checkCurrentQuestion(session.sessionId, question)
    if (!result) {
      return
    }

    setFlashMessage(result.message)

    if (result.hasSelection && !result.isCorrect) {
      addChatMessage(session.sessionId, {
        role: 'system',
        content: 'Học sinh vừa sai câu này. Hãy giải thích ngắn gọn cách làm và lỗ hổng kiến thức.',
        questionId: question.questionId,
      })
      setChatStatus('AI đang phân tích câu hỏi...')
      void runAutoExplanation()
    }

    if (result.hasSelection && runtime.currentIndex < session.questions.length - 1) {
      goToNextQuestion(session.sessionId, session.questions.length)
    }
  }

  async function runAutoExplanation() {
    setIsAiBusy(true)

    try {
      const explanation = await requestAutoExplanation({
        questionContent: question.content,
        selectedAnswer: selectedAnswerLabel,
        correctAnswer: correctAnswerLabel,
        obsidianSourcePath: question.obsidianSourcePath,
      })

      addChatMessage(session.sessionId, {
        role: 'ai',
        content: explanation,
        questionId: question.questionId,
      })
      cacheAiExplanation(session.sessionId, question.questionId, explanation)
      setChatStatus('AI đã gửi giải thích cho câu hỏi này.')
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Không thể nhận phản hồi tu AI backend.'
      addChatMessage(session.sessionId, {
        role: 'ai',
        content: message,
        questionId: question.questionId,
      })
      setChatStatus('Lỗi kết nối AI.')
    } finally {
      setIsAiBusy(false)
    }
  }

  function handleGoNext() {
    if (!isSubmitted) {
      goToNextQuestion(session.sessionId, session.questions.length)
    }
  }

  function handleGoPrevious() {
    if (!isSubmitted) {
      goToPreviousQuestion(session.sessionId)
    }
  }

  async function handleSubmitAttempt() {
    if (isSubmitted) {
      return
    }

    submitSession(session.sessionId)
    const latestRuntime = useExamRuntimeStore.getState().sessions[session.sessionId]

    if (!latestRuntime) {
      setFlashMessage('Không thể đọc exam runtime để lưu bài làm.')
      return
    }

    if (session.deliveryMode === 'local_mock') {
      navigate(`/review/${session.sessionId}`)
      return
    }

    if (!authUser?.id) {
      setFlashMessage('Không tìm thấy user đăng nhập để lưu kết quả bài làm.')
      return
    }

    setFlashMessage('Đang lưu kết quả bài làm lên Supabase...')

    try {
      const attemptId = await persistCompletedAttempt({
        userId: authUser.id,
        session,
        runtime: latestRuntime,
      })

      clearRuntimeSession(session.sessionId)
      clearDraftSession(session.sessionId)
      navigate(`/review/${attemptId}`)
    } catch (error) {
      setFlashMessage(
        error instanceof Error ? error.message : 'Không thể lưu kết quả bài làm lên Supabase.',
      )
    }
  }

  async function handleSendChat() {
    if (isSubmitted) {
      return
    }

    const trimmed = chatInput.trim()
    if (!trimmed) {
      return
    }

    addChatMessage(session.sessionId, {
      role: 'user',
      content: trimmed,
      questionId: question.questionId,
    })
    setChatInput('')
    setChatStatus('Đang gửi câu hỏi cho AI...')
    setIsAiBusy(true)

    try {
      const explanation = await sendExamChatMessage({
        questionContent: question.content,
        selectedAnswer: selectedAnswerLabel,
        correctAnswer: correctAnswerLabel,
        prompt: trimmed,
        obsidianSourcePath: question.obsidianSourcePath,
      })

      addChatMessage(session.sessionId, {
        role: 'ai',
        content: explanation,
        questionId: question.questionId,
      })
      cacheAiExplanation(session.sessionId, question.questionId, explanation)
      setChatStatus('AI đã trả lời.')
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Không thể nhận phản hồi tu AI backend.'
      addChatMessage(session.sessionId, {
        role: 'ai',
        content: message,
        questionId: question.questionId,
      })
      setChatStatus('Lỗi kết nối AI.')
    } finally {
      setIsAiBusy(false)
    }
  }

  return (
    <PageCard
      title={session.title}
      description="Exam engine đã hỗ trợ nhiều lựa chọn, Đúng/Sai và trả lời ngắn trong cùng một luồng thi."
    >
      <div style={styles.summaryRow}>
        <SummaryPill label="Tiến độ" value={`Câu ${runtime.currentIndex + 1}/${session.questions.length}`} />
        <SummaryPill label="Đã trả lời" value={`${answeredCount}/${session.questions.length}`} />
        <SummaryPill label="Do kho" value={session.difficultyLabel} />
        <SummaryPill label="Côn lại" value={formatDuration(remainingSeconds)} />
        <SummaryPill label="Sync" value={syncStatus} />
      </div>

      {flashMessage ? <div style={styles.flash}>{flashMessage}</div> : null}
      {isSubmitted ? (
        <div style={styles.successFlash}>Bài làm đã được nộp. Bạn có thể xem tổng kết và review chi tiết.</div>
      ) : null}

      <div style={styles.grid}>
        <section style={styles.panel}>
          <div style={styles.kicker}>Question {runtime.currentIndex + 1}</div>
          <div style={styles.panelTitleBlock}>
            <MarkdownContent content={question.content} className="text-base leading-8 text-slate-900" />
          </div>
          <p style={styles.text}>
            Topic: {session.topicName} | Dạng bài: {formatQuestionType(question)} | Nguồn:{' '}
            {question.sourceMeta?.schoolName ?? 'Tổng hợp'}
          </p>

          {question.assetUrls && question.assetUrls.length > 0 ? (
            <div style={styles.assetGrid}>
              {question.assetUrls.map((assetUrl, index) => (
                <div key={`${question.questionId}-${assetUrl}`} style={styles.assetCard}>
                  <img
                    alt={`Question asset ${index + 1}`}
                    src={assetUrl}
                    style={styles.assetImage}
                  />
                </div>
              ))}
            </div>
          ) : null}

          <QuestionComposer
            isSubmitted={isSubmitted}
            question={question}
            questionLocked={questionLocked}
            selectedAnswerId={selectedAnswerId}
            selectedTrueFalseMap={selectedTrueFalseMap}
            sessionId={session.sessionId}
            shortAnswerValue={shortAnswerValue}
            onSelectAnswer={selectAnswer}
            onSelectTrueFalse={selectTrueFalseStatement}
            onSetShortAnswer={setShortAnswer}
          />

          <div style={styles.buttonRow}>
            <button
              disabled={runtime.currentIndex === 0}
              onClick={handleGoPrevious}
              style={styles.secondaryButton}
              type="button"
            >
              Câu truoc
            </button>
            <button
              disabled={runtime.currentIndex === session.questions.length - 1}
              onClick={handleGoNext}
              style={styles.secondaryButton}
              type="button"
            >
              Câu tiep theo
            </button>
            <button
              disabled={remainingSeconds <= 0 || questionLocked || isSubmitted}
              onClick={handleCheckAnswer}
              style={styles.primaryButton}
              type="button"
            >
              Kiem tra đáp án
            </button>
            <button onClick={() => void handleSubmitAttempt()} style={styles.submitButton} type="button">
              Nộp bài
            </button>
          </div>
        </section>

        <section style={styles.panel}>
          <h3 style={styles.panelTitle}>AI Chat</h3>
          <p style={styles.text}>Lịch sử chat được giữ xuyên suốt trong exam session hiện tại.</p>
          <div style={styles.chatHistory}>
            {runtime.chatHistory.length === 0 ? (
              <div style={styles.emptyChat}>
                Chưa có tin nhắn nào. AI sẽ được gọi khi bạn trả lời sai hoặc hỏi thêm.
              </div>
            ) : (
              runtime.chatHistory.map((message) => (
                <div
                  key={message.id}
                  style={{
                    ...styles.chatBubble,
                    ...(message.role === 'user'
                      ? styles.userBubble
                      : message.role === 'ai'
                        ? styles.aiBubble
                        : styles.systemBubble),
                  }}
                >
                  <strong style={styles.chatRole}>
                    {message.role === 'user' ? 'Học sinh' : message.role === 'ai' ? 'AI gia sư' : 'He thong'}
                  </strong>
                  <div>{message.content}</div>
                </div>
              ))
            )}
          </div>
          <div style={styles.chatComposer}>
            <input
              disabled={isAiBusy || isSubmitted}
              onChange={(event) => setChatInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  void handleSendChat()
                }
              }}
              placeholder="Hỏi AI về câu đang làm..."
              style={styles.chatInput}
              value={chatInput}
            />
            <button
              disabled={isAiBusy || !chatInput.trim() || isSubmitted}
              onClick={() => void handleSendChat()}
              style={styles.primaryButton}
              type="button"
            >
              Gửi
            </button>
          </div>
          {chatStatus ? <p style={styles.chatStatus}>{chatStatus}</p> : null}
          <div style={styles.metaBox}>
            <strong>Trạng thái câu hiện tại</strong>
            <p style={styles.metaText}>
              {questionLocked
                ? `Đã khóa. Dap an cua ban: ${selectedAnswerLabel}`
                : 'Chưa khóa, bạn vẫn có thể đổi đáp án trước khi check.'}
            </p>
            <p style={styles.metaText}>Đáp án đúng: {correctAnswerLabel}</p>
          </div>
        </section>
      </div>
    </PageCard>
  )
}

function QuestionComposer({
  sessionId,
  question,
  questionLocked,
  isSubmitted,
  selectedAnswerId,
  selectedTrueFalseMap,
  shortAnswerValue,
  onSelectAnswer,
  onSelectTrueFalse,
  onSetShortAnswer,
}: {
  sessionId: string
  question: DraftQuestion
  questionLocked: boolean
  isSubmitted: boolean
  selectedAnswerId: string | null
  selectedTrueFalseMap: Record<string, boolean>
  shortAnswerValue: string
  onSelectAnswer: (sessionId: string, questionId: string, answerId: string) => void
  onSelectTrueFalse: (
    sessionId: string,
    questionId: string,
    statementId: string,
    value: boolean,
  ) => void
  onSetShortAnswer: (sessionId: string, questionId: string, value: string) => void
}) {
  if (question.questionType === 'multiple_choice') {
    return (
      <div style={styles.answerList}>
        {question.answers.map((answer) => {
          const isSelected = selectedAnswerId === answer.answerId
          return (
            <label
              key={answer.answerId}
              style={{
                ...styles.answerCard,
                ...(isSelected ? styles.answerCardSelected : {}),
                ...(questionLocked ? styles.answerCardLocked : {}),
              }}
            >
              <input
                checked={isSelected}
                disabled={questionLocked || isSubmitted}
                name={`question-${question.questionId}`}
                onChange={() => onSelectAnswer(sessionId, question.questionId, answer.answerId)}
                style={styles.radio}
                type="radio"
              />
              <div>
                <div style={styles.answerContent}>
                  <strong>{answer.optionLabel}.</strong>
                  <div style={styles.answerMarkdown}>
                    <MarkdownContent content={answer.content} className="text-sm leading-7 text-slate-900" />
                  </div>
                </div>
              </div>
            </label>
          )
        })}
      </div>
    )
  }

  if (question.questionType === 'true_false') {
    return (
      <div style={styles.answerList}>
        {(question.statements ?? []).map((statement, index) => {
          const currentValue = selectedTrueFalseMap[statement.statementId]
          return (
            <div
              key={statement.statementId}
              style={{
                ...styles.answerCard,
                ...(questionLocked ? styles.answerCardLocked : {}),
              }}
            >
              <div style={styles.statementContent}>
                <strong>{String.fromCharCode(97 + index)})</strong>
                <div style={styles.answerMarkdown}>
                  <MarkdownContent content={statement.content} className="text-sm leading-7 text-slate-900" />
                </div>
              </div>
              <div style={styles.trueFalseActions}>
                <button
                  disabled={questionLocked || isSubmitted}
                  onClick={() => onSelectTrueFalse(sessionId, question.questionId, statement.statementId, true)}
                  style={{
                    ...styles.trueFalseButton,
                    ...(currentValue === true ? styles.trueFalseButtonSelected : {}),
                  }}
                  type="button"
                >
                  Đúng
                </button>
                <button
                  disabled={questionLocked || isSubmitted}
                  onClick={() => onSelectTrueFalse(sessionId, question.questionId, statement.statementId, false)}
                  style={{
                    ...styles.trueFalseButton,
                    ...(currentValue === false ? styles.trueFalseButtonSelected : {}),
                  }}
                  type="button"
                >
                  Sai
                </button>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div style={styles.answerList}>
      <div style={styles.shortAnswerCard}>
        <label style={styles.shortAnswerLabel}>
          Đáp án ngắn
          <input
            disabled={questionLocked || isSubmitted}
            onChange={(event) => onSetShortAnswer(sessionId, question.questionId, event.target.value)}
            placeholder="Nhap đáp án cua ban..."
            style={styles.shortAnswerInput}
            type="text"
            value={shortAnswerValue}
          />
        </label>
      </div>
    </div>
  )
}

function SummaryPill({ label, value }: { label: string; value: string }) {
  return (
    <div style={styles.pill}>
      <strong>{label}:</strong> {value}
    </div>
  )
}

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function formatSyncTime(timestamp: number) {
  const deltaSeconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000))

  if (deltaSeconds < 5) {
    return 'vừa xong'
  }

  if (deltaSeconds < 60) {
    return `${deltaSeconds}s`
  }

  return `${Math.floor(deltaSeconds / 60)}p`
}

function formatQuestionType(question: DraftQuestion) {
  if (question.questionType === 'multiple_choice') {
    return 'Nhieu lựa chọn'
  }

  if (question.questionType === 'true_false') {
    return 'Đúng / Sai'
  }

  return 'Trả lời ngắn'
}

const styles = {
  summaryRow: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '12px',
    marginBottom: '20px',
  },
  pill: {
    borderRadius: '999px',
    padding: '10px 14px',
    backgroundColor: '#edf5ff',
    border: '1px solid #d4e4f6',
    color: '#24415e',
  },
  flash: {
    marginBottom: '18px',
    borderRadius: '16px',
    padding: '14px 16px',
    backgroundColor: '#fff7ed',
    border: '1px solid #fdba74',
    color: '#9a3412',
    fontWeight: 600,
  },
  successFlash: {
    marginBottom: '18px',
    borderRadius: '16px',
    padding: '14px 16px',
    backgroundColor: '#ecfdf5',
    border: '1px solid #86efac',
    color: '#166534',
    fontWeight: 600,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.4fr) minmax(280px, 0.9fr)',
    gap: '18px',
  },
  panel: {
    borderRadius: '22px',
    padding: '22px',
    border: '1px solid #d7e3ef',
    backgroundColor: '#f9fbff',
    minHeight: '320px',
  },
  kicker: {
    color: '#4e6b8d',
    fontWeight: 700,
    marginBottom: '12px',
  },
  panelTitle: {
    margin: '0 0 8px',
    color: '#10233c',
  },
  panelTitleBlock: {
    marginBottom: '8px',
  },
  text: {
    margin: 0,
    color: '#5d7491',
  },
  assetGrid: {
    display: 'grid',
    gap: '12px',
    marginTop: '18px',
  },
  assetCard: {
    borderRadius: '18px',
    overflow: 'hidden' as const,
    border: '1px solid #d7e3ef',
    backgroundColor: '#ffffff',
  },
  assetImage: {
    display: 'block',
    width: '100%',
    height: 'auto',
    objectFit: 'contain' as const,
  },
  answerList: {
    display: 'grid',
    gap: '12px',
    marginTop: '18px',
    marginBottom: '18px',
  },
  answerCard: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    borderRadius: '16px',
    padding: '14px',
    backgroundColor: '#ffffff',
    border: '1px solid #d7e3ef',
  },
  answerContent: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr',
    gap: '8px',
    alignItems: 'start',
    color: '#10233c',
  },
  answerMarkdown: {
    minWidth: 0,
  },
  answerCardSelected: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  answerCardLocked: {
    opacity: 0.8,
  },
  radio: {
    marginTop: '2px',
  },
  statementContent: {
    flex: 1,
    display: 'grid',
    gridTemplateColumns: 'auto 1fr',
    gap: '8px',
    alignItems: 'start',
    color: '#10233c',
    lineHeight: 1.6,
  },
  trueFalseActions: {
    display: 'flex',
    gap: '8px',
  },
  trueFalseButton: {
    borderRadius: '999px',
    border: '1px solid #c7d7e8',
    padding: '8px 14px',
    backgroundColor: '#ffffff',
    color: '#24415e',
    fontWeight: 700,
  },
  trueFalseButtonSelected: {
    borderColor: '#2563eb',
    backgroundColor: '#dbeafe',
    color: '#1d4ed8',
  },
  shortAnswerCard: {
    borderRadius: '16px',
    padding: '16px',
    backgroundColor: '#ffffff',
    border: '1px solid #d7e3ef',
  },
  shortAnswerLabel: {
    display: 'grid',
    gap: '10px',
    color: '#24415e',
    fontWeight: 700,
  },
  shortAnswerInput: {
    borderRadius: '12px',
    border: '1px solid #c7d7e8',
    padding: '12px 14px',
    backgroundColor: '#ffffff',
  },
  buttonRow: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '12px',
  },
  secondaryButton: {
    borderRadius: '12px',
    border: '1px solid #c7d7e8',
    padding: '12px 14px',
    backgroundColor: '#ffffff',
    color: '#24415e',
    fontWeight: 700,
  },
  primaryButton: {
    borderRadius: '12px',
    border: 0,
    padding: '12px 14px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    fontWeight: 700,
  },
  submitButton: {
    borderRadius: '12px',
    border: 0,
    padding: '12px 14px',
    backgroundColor: '#15803d',
    color: '#ffffff',
    fontWeight: 700,
  },
  chatHistory: {
    display: 'grid',
    gap: '10px',
    margin: '14px 0 16px',
    maxHeight: '320px',
    overflowY: 'auto' as const,
    paddingRight: '4px',
  },
  emptyChat: {
    borderRadius: '14px',
    padding: '14px',
    backgroundColor: '#ffffff',
    border: '1px dashed #c7d7e8',
    color: '#5d7491',
  },
  chatBubble: {
    borderRadius: '16px',
    padding: '12px 14px',
    border: '1px solid transparent',
  },
  userBubble: {
    backgroundColor: '#dbeafe',
    borderColor: '#93c5fd',
    color: '#1d4ed8',
  },
  aiBubble: {
    backgroundColor: '#ecfdf5',
    borderColor: '#86efac',
    color: '#166534',
  },
  systemBubble: {
    backgroundColor: '#fff7ed',
    borderColor: '#fdba74',
    color: '#c2410c',
  },
  chatRole: {
    display: 'block',
    marginBottom: '6px',
  },
  chatComposer: {
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    gap: '10px',
    marginBottom: '10px',
  },
  chatInput: {
    borderRadius: '12px',
    border: '1px solid #c7d7e8',
    padding: '12px 14px',
    backgroundColor: '#ffffff',
  },
  chatStatus: {
    margin: '0 0 14px',
    color: '#5d7491',
    fontSize: '14px',
  },
  metaBox: {
    borderRadius: '16px',
    padding: '16px',
    border: '1px dashed #c7d7e8',
    backgroundColor: '#ffffff',
  },
  metaText: {
    margin: '10px 0 0',
    color: '#5d7491',
  },
}
