import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { NavLinks } from '../../components/ui/NavLinks'
import { PageCard } from '../../components/ui/PageCard'
import { useAuthSessionStore } from '../../features/auth/store/auth-session-store'
import {
  formatAnswerLabel,
  getRemainingSeconds,
  getSelectedAnswerId,
  isQuestionLocked,
} from '../../features/exam/core/exam-session'
import { persistCompletedAttempt } from '../../features/exam/services/exam-attempt-service'
import { syncInProgressAttempt } from '../../features/exam/services/exam-attempt-service'
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
  const hasShownRestoreNoticeRef = useRef(false)

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

    const hasProgress =
      runtime.currentIndex > 0 ||
      Object.keys(runtime.selectedAnswerIdsByQuestionId).length > 0 ||
      runtime.chatHistory.length > 0

    if (hasProgress && !runtime.submittedAt && !hasShownRestoreNoticeRef.current) {
      hasShownRestoreNoticeRef.current = true
      setFlashMessage('Da khoi phuc bai dang lam tu local session tren trinh duyet.')
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
        setFlashMessage('Da het gio. Buoc 9 se noi flow nop bai va tong ket.')
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
      locked: runtime.lockedQuestionIds,
      chatCount: runtime.chatHistory.length,
      submittedAt: runtime.submittedAt,
    })
  }, [runtime])

  useEffect(() => {
    if (!authUser?.id || !session || !runtime || runtime.submittedAt) {
      return
    }

    const hasProgress =
      runtime.currentIndex > 0 ||
      Object.keys(runtime.selectedAnswerIdsByQuestionId).length > 0 ||
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
      <>
        <NavLinks />
        <PageCard
          title="Exam Session Not Found"
          description="Session nay hien khong ton tai trong local app state."
        >
          <p style={styles.text}>
            Hay quay lai <Link to="/dashboard">dashboard</Link> va tao de moi.
          </p>
        </PageCard>
      </>
    )
  }

  if (!runtime || !currentQuestion) {
    return (
      <>
        <NavLinks />
        <PageCard
          title={session.title}
          description="Dang khoi tao exam runtime session..."
        >
          <p style={styles.text}>Vui long doi trong giay lat.</p>
        </PageCard>
      </>
    )
  }

  const question = currentQuestion

  const selectedAnswerId = getSelectedAnswerId(runtime, question.questionId)
  const questionLocked = isQuestionLocked(runtime, question.questionId)
  const answeredCount = Object.keys(runtime.selectedAnswerIdsByQuestionId).length
  const isSubmitted = Boolean(runtime.submittedAt)
  const selectedAnswerLabel = formatAnswerLabel(question, selectedAnswerId)
  const correctAnswerLabel = formatAnswerLabel(
    question,
    question.answers.find((answer) => answer.isCorrect)?.answerId ?? null,
  )

  function handleCheckAnswer() {
    const result = checkCurrentQuestion(session.sessionId, question)
    if (!result) {
      return
    }

    setFlashMessage(result.message)

    if (result.hasSelection && !result.isCorrect) {
      const systemMessage = 'Hoc sinh chon sai cau nay. Hay giai thich giup toi!'
      addChatMessage(session.sessionId, {
        role: 'system',
        content: systemMessage,
        questionId: question.questionId,
      })
      setChatStatus('AI dang phan tich cau hoi...')
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
      setChatStatus('AI da gui giai thich cho cau hoi nay.')
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Khong the nhan phan hoi tu AI backend.'
      addChatMessage(session.sessionId, {
        role: 'ai',
        content: message,
        questionId: question.questionId,
      })
      setChatStatus('Loi ket noi AI.')
    } finally {
      setIsAiBusy(false)
    }
  }

  function handleGoNext() {
    if (isSubmitted) {
      return
    }
    goToNextQuestion(session.sessionId, session.questions.length)
  }

  function handleGoPrevious() {
    if (isSubmitted) {
      return
    }
    goToPreviousQuestion(session.sessionId)
  }

  async function handleSubmitAttempt() {
    if (isSubmitted) {
      return
    }

    if (!authUser?.id) {
      setFlashMessage('Khong tim thay user dang nhap de luu ket qua bai lam.')
      return
    }

    submitSession(session.sessionId)
    const latestRuntime = useExamRuntimeStore.getState().sessions[session.sessionId]

    if (!latestRuntime) {
      setFlashMessage('Khong the doc exam runtime de luu bai lam.')
      return
    }

    setFlashMessage('Dang luu ket qua bai lam len Supabase...')

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
        error instanceof Error ? error.message : 'Khong the luu ket qua bai lam len Supabase.',
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
    setChatStatus('Dang gui cau hoi cho AI...')
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
      setChatStatus('AI da tra loi.')
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Khong the nhan phan hoi tu AI backend.'
      addChatMessage(session.sessionId, {
        role: 'ai',
        content: message,
        questionId: question.questionId,
      })
      setChatStatus('Loi ket noi AI.')
    } finally {
      setIsAiBusy(false)
    }
  }

  return (
    <>
      <NavLinks />
      <PageCard
        title={session.title}
        description="Buoc 7 da co exam engine co ban: current question, timer, chon dap an, next/prev, check dung sai va khoa cau."
      >
        <div style={styles.summaryRow}>
          <SummaryPill
            label="Tien do"
            value={`Cau ${runtime.currentIndex + 1}/${session.questions.length}`}
          />
          <SummaryPill label="Da chon" value={`${answeredCount}/${session.questions.length}`} />
          <SummaryPill label="Do kho" value={session.difficultyLabel} />
          <SummaryPill label="Con lai" value={formatDuration(remainingSeconds)} />
          <SummaryPill
            label="Cloud sync"
            value={runtime.lastSyncedAt ? `OK ${formatSyncTime(runtime.lastSyncedAt)}` : 'Dang cho'}
          />
        </div>

        {flashMessage ? <div style={styles.flash}>{flashMessage}</div> : null}
        {isSubmitted ? (
          <div style={styles.successFlash}>
            Bai lam da duoc nop. Ban co the xem tong ket va giai thich AI ben trang review.
          </div>
        ) : null}

        <div style={styles.grid}>
          <section style={styles.panel}>
            <div style={styles.kicker}>Question {runtime.currentIndex + 1}</div>
            <h3 style={styles.panelTitle}>{question.content}</h3>
            <p style={styles.text}>
              Topic: {session.topicName} | Answers: {question.answers.length}
            </p>

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
                      onChange={() => selectAnswer(session.sessionId, question.questionId, answer.answerId)}
                      style={styles.radio}
                      type="radio"
                    />
                    <div>
                      <strong>
                        {answer.optionLabel}. {answer.content}
                      </strong>
                    </div>
                  </label>
                )
              })}
            </div>

            <div style={styles.buttonRow}>
              <button
                disabled={runtime.currentIndex === 0}
                onClick={handleGoPrevious}
                style={styles.secondaryButton}
                type="button"
              >
                Cau truoc
              </button>
              <button
                disabled={runtime.currentIndex === session.questions.length - 1}
                onClick={handleGoNext}
                style={styles.secondaryButton}
                type="button"
              >
                Cau tiep theo
              </button>
              <button
                disabled={remainingSeconds <= 0 || questionLocked || isSubmitted}
                onClick={handleCheckAnswer}
                style={styles.primaryButton}
                type="button"
              >
                Kiem tra dap an
              </button>
              <button
                onClick={() => void handleSubmitAttempt()}
                style={styles.submitButton}
                type="button"
              >
                Nop bai
              </button>
            </div>
          </section>

          <section style={styles.panel}>
            <h3 style={styles.panelTitle}>AI Chat</h3>
            <p style={styles.text}>Lich su chat duoc giu xuyen suot trong exam session hien tai.</p>
            <div style={styles.chatHistory}>
              {runtime.chatHistory.length === 0 ? (
                <div style={styles.emptyChat}>Chua co tin nhan nao. AI se duoc goi khi ban tra loi sai hoac hoi them.</div>
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
                      {message.role === 'user'
                        ? 'Hoc sinh'
                        : message.role === 'ai'
                          ? 'AI gia su'
                          : 'He thong'}
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
                placeholder="Hoi AI ve cau dang lam..."
                style={styles.chatInput}
                value={chatInput}
              />
              <button
                disabled={isAiBusy || !chatInput.trim() || isSubmitted}
                onClick={() => void handleSendChat()}
                style={styles.primaryButton}
                type="button"
              >
                Gui
              </button>
            </div>
            {chatStatus ? <p style={styles.chatStatus}>{chatStatus}</p> : null}
            <div style={styles.metaBox}>
              <strong>Trang thai cau hien tai</strong>
              <p style={styles.metaText}>
                {questionLocked
                  ? 'Cau nay da khoa sau khi kiem tra.'
                  : 'Cau nay chua khoa, user van co the doi dap an truoc khi check.'}
              </p>
            </div>
          </section>
        </div>
      </PageCard>
    </>
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
    return 'vua xong'
  }

  if (deltaSeconds < 60) {
    return `${deltaSeconds}s`
  }

  return `${Math.floor(deltaSeconds / 60)}p`
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
  text: {
    margin: 0,
    color: '#5d7491',
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
  list: {
    margin: '12px 0 18px',
    paddingLeft: '18px',
    color: '#5d7491',
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
