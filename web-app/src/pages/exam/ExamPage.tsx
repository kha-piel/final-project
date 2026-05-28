import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { MarkdownContent } from '../../components/ui/MarkdownContent'
import { PageCard } from '../../components/ui/PageCard'
import { useAuthSessionStore } from '../../features/auth/store/auth-session-store'
import type { DraftQuestion } from '../../features/dashboard/types/dashboard-types'
import {
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
  const markCloudSync = useExamRuntimeStore((state) => state.markCloudSync)
  const submitSession = useExamRuntimeStore((state) => state.submitSession)
  const clearRuntimeSession = useExamRuntimeStore((state) => state.clearRuntimeSession)
  const clearDraftSession = useExamDraftStore((state) => state.clearSession)

  const [remainingSeconds, setRemainingSeconds] = useState<number>(0)
  const [flashMessage, setFlashMessage] = useState<string>('')
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
        <p className="mt-4 text-slate-500">
          Hãy quay lại <Link to="/practice" className="font-semibold text-blue-600 hover:underline">practice</Link> hoặc <Link to="/dashboard" className="font-semibold text-blue-600 hover:underline">dashboard</Link>.
        </p>
      </PageCard>
    )
  }

  if (!runtime || !currentQuestion) {
    return (
      <PageCard title={session.title} description="Đang khởi tạo exam runtime session...">
        <p className="mt-4 text-slate-500">Vui lòng đợi trong giây lát.</p>
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
  const syncStatus =
    session.deliveryMode === 'local_mock'
      ? 'Local mock'
      : runtime.lastSyncedAt
        ? `OK ${formatSyncTime(runtime.lastSyncedAt)}`
        : 'Đang chờ'


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

  return (
    <PageCard
      title={session.title}
      description="Exam engine đã hỗ trợ nhiều lựa chọn, Đúng/Sai và trả lời ngắn trong cùng một luồng thi."
    >
      <div className="mb-6 flex flex-wrap gap-3">
        <SummaryPill label="Tiến độ" value={`Câu ${runtime.currentIndex + 1}/${session.questions.length}`} />
        <SummaryPill label="Đã trả lời" value={`${answeredCount}/${session.questions.length}`} />
        <SummaryPill label="Độ khó" value={session.difficultyLabel} />
        <SummaryPill label="Còn lại" value={formatDuration(remainingSeconds)} />
        <SummaryPill label="Sync" value={syncStatus} />
      </div>

      {flashMessage ? <div className="mb-5 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3.5 font-semibold text-orange-900 shadow-sm">{flashMessage}</div> : null}
      {isSubmitted ? (
        <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 font-semibold text-emerald-800 shadow-sm">Bài làm đã được nộp. Bạn có thể xem tổng kết và review chi tiết.</div>
      ) : null}

      <div className="mx-auto max-w-4xl grid gap-5">
        <section className="flex min-h-[320px] flex-col rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6 lg:p-8">
          <div className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-400">Câu {runtime.currentIndex + 1}</div>
          <div className="mb-3">
            <MarkdownContent content={question.content} className="text-lg leading-8 text-slate-900" />
          </div>
          <p className="m-0 text-sm text-slate-500">
            Topic: {session.topicName} | Dạng bài: {formatQuestionType(question)} | Nguồn:{' '}
            {question.sourceMeta?.schoolName ?? 'Tổng hợp'}
          </p>

          {question.assetUrls && question.assetUrls.length > 0 ? (
            <div className="mt-5 grid gap-3">
              {question.assetUrls.map((assetUrl, index) => (
                <div key={`${question.questionId}-${assetUrl}`} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <img
                    alt={`Question asset ${index + 1}`}
                    src={assetUrl}
                    className="block h-auto w-full object-contain"
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

          <div className="mt-auto pt-6 flex flex-wrap justify-between gap-3">
            <div className="flex flex-wrap gap-3">
              <button
                disabled={runtime.currentIndex === 0}
                onClick={handleGoPrevious}
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
                type="button"
              >
                Câu trước
              </button>
              <button
                disabled={runtime.currentIndex === session.questions.length - 1}
                onClick={handleGoNext}
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
                type="button"
              >
                Câu tiếp theo
              </button>
            </div>
            <button onClick={() => void handleSubmitAttempt()} className="rounded-xl bg-emerald-600 px-8 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-700 shadow-sm disabled:opacity-50" type="button">
              Nộp bài
            </button>
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
      <div className="my-5 grid gap-3">
        {question.answers.map((answer) => {
          const isSelected = selectedAnswerId === answer.answerId
          return (
            <label
              key={answer.answerId}
              className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-all duration-200 ${
                isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50'
              } ${questionLocked ? 'opacity-80 cursor-default' : ''}`}
            >
              <input
                checked={isSelected}
                disabled={questionLocked || isSubmitted}
                name={`question-${question.questionId}`}
                onChange={() => onSelectAnswer(sessionId, question.questionId, answer.answerId)}
                className="mt-1 h-4 w-4 shrink-0 accent-blue-600"
                type="radio"
              />
              <div className="flex-1 text-slate-900">
                <div className="grid grid-cols-[auto_1fr] items-start gap-2">
                  <strong className="text-lg">{answer.optionLabel}.</strong>
                  <div className="min-w-0">
                    <MarkdownContent content={answer.content} className="text-base leading-7 text-slate-900" />
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
      <div className="my-5 grid gap-3">
        {(question.statements ?? []).map((statement, index) => {
          const currentValue = selectedTrueFalseMap[statement.statementId]
          return (
            <div
              key={statement.statementId}
              className={`flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition-colors hover:border-blue-200 md:flex-row md:items-start ${
                questionLocked ? 'opacity-80' : ''
              }`}
            >
              <div className="grid flex-1 grid-cols-[auto_1fr] items-start gap-2 leading-relaxed text-slate-900">
                <strong className="text-lg">{String.fromCharCode(97 + index)})</strong>
                <div className="min-w-0">
                  <MarkdownContent content={statement.content} className="text-base leading-7 text-slate-900" />
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  disabled={questionLocked || isSubmitted}
                  onClick={() => onSelectTrueFalse(sessionId, question.questionId, statement.statementId, true)}
                  className={`rounded-full border px-4 py-2 font-bold transition-colors disabled:cursor-not-allowed ${
                    currentValue === true
                      ? 'border-blue-500 bg-blue-100 text-blue-700'
                      : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                  type="button"
                >
                  Đúng
                </button>
                <button
                  disabled={questionLocked || isSubmitted}
                  onClick={() => onSelectTrueFalse(sessionId, question.questionId, statement.statementId, false)}
                  className={`rounded-full border px-4 py-2 font-bold transition-colors disabled:cursor-not-allowed ${
                    currentValue === false
                      ? 'border-blue-500 bg-blue-100 text-blue-700'
                      : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
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
    <div className="my-5 grid gap-3">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <label className="grid gap-3 text-lg font-bold text-slate-900">
          Đáp án ngắn
          <input
            disabled={questionLocked || isSubmitted}
            onChange={(event) => onSetShortAnswer(sessionId, question.questionId, event.target.value)}
            placeholder="Nhập đáp án của bạn..."
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-base font-normal outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-slate-50"
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
    <div className="rounded-full border border-blue-100 bg-blue-50/70 px-4 py-2 text-sm text-blue-900 shadow-sm">
      <strong className="mr-1">{label}:</strong> {value}
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


