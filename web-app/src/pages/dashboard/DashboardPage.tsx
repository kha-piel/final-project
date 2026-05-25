import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PageCard } from '../../components/ui/PageCard'
import {
  fetchAttemptHistory,
  fetchQuestionsForCustomExam,
  fetchSubjects,
  fetchTopicsBySubjectId,
} from '../../features/dashboard/services/dashboard-service'
import {
  difficultyOptions,
  questionTypeOptions,
  type AttemptHistoryItem,
  type QuestionType,
  type SubjectOption,
  type TopicOption,
} from '../../features/dashboard/types/dashboard-types'
import { useAuthSessionStore } from '../../features/auth/store/auth-session-store'
import { useExamDraftStore } from '../../features/exam/store/exam-draft-store'
import { useExamRuntimeStore } from '../../features/exam/store/exam-runtime-store'
import { hasAnsweredQuestion } from '../../features/exam/core/exam-session'
import { useFlaggedWrongQuestionStore } from '../../features/practice/store/flagged-wrong-question-store'
import {
  fetchInProgressAttempts as fetchCloudInProgressAttempts,
  restoreInProgressAttempt as restoreCloudAttempt,
  type InProgressAttemptListItem,
} from '../../features/exam/services/exam-attempt-service'
import { hasSupabaseEnv } from '../../lib/config/env'

const CUSTOM_EXAM_DURATION_MINUTES = 45

export function DashboardPage() {
  const navigate = useNavigate()
  const authUser = useAuthSessionStore((state) => state.user)

  const createSession = useExamDraftStore((state) => state.createSession)
  const restoreDraftSession = useExamDraftStore((state) => state.restoreSession)
  const clearDraftSession = useExamDraftStore((state) => state.clearSession)
  const draftSessions = useExamDraftStore((state) => state.sessions)

  const runtimeSessions = useExamRuntimeStore((state) => state.sessions)
  const restoreRuntimeSession = useExamRuntimeStore((state) => state.restoreRuntimeSession)
  const clearRuntimeSession = useExamRuntimeStore((state) => state.clearRuntimeSession)
  const flaggedQuestionMap = useFlaggedWrongQuestionStore((state) => state.items)
  const clearAllFlaggedQuestions = useFlaggedWrongQuestionStore((state) => state.clearAllFlaggedQuestions)

  const [subjects, setSubjects] = useState<SubjectOption[]>([])
  const [topics, setTopics] = useState<TopicOption[]>([])
  const [attemptHistory, setAttemptHistory] = useState<AttemptHistoryItem[]>([])
  const [cloudInProgressAttempts, setCloudInProgressAttempts] = useState<
    InProgressAttemptListItem[]
  >([])
  const [selectedSubjectId, setSelectedSubjectId] = useState('')
  const [selectedTopicId, setSelectedTopicId] = useState('')
  const [selectedDifficulty, setSelectedDifficulty] = useState('')
  const [selectedQuestionType, setSelectedQuestionType] = useState<'all' | QuestionType>('all')
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true)
  const [isLoadingTopics, setIsLoadingTopics] = useState(false)
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)
  const [isLoadingCloudAttempts, setIsLoadingCloudAttempts] = useState(true)
  const [isCreatingExam, setIsCreatingExam] = useState(false)
  const [isRestoringCloudAttemptId, setIsRestoringCloudAttemptId] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [historyErrorMessage, setHistoryErrorMessage] = useState('')
  const [cloudRestoreErrorMessage, setCloudRestoreErrorMessage] = useState('')

  const selectedSubject = useMemo(
    () => subjects.find((subject) => subject.subjectId === selectedSubjectId) ?? null,
    [selectedSubjectId, subjects],
  )

  const selectedTopic = useMemo(
    () => topics.find((topic) => topic.topicId === selectedTopicId) ?? null,
    [selectedTopicId, topics],
  )

  const selectedDifficultyOption = useMemo(
    () => difficultyOptions.find((item) => item.level.toString() === selectedDifficulty) ?? null,
    [selectedDifficulty],
  )

  const flaggedQuestionItems = useMemo(
    () => Object.values(flaggedQuestionMap),
    [flaggedQuestionMap],
  )

  const visibleFlaggedQuestions = useMemo(() => {
    const filtered = selectedSubjectId
      ? flaggedQuestionItems.filter((item) => item.subjectId === selectedSubjectId)
      : flaggedQuestionItems

    return [...filtered].sort((left, right) => right.flaggedAt - left.flaggedAt)
  }, [flaggedQuestionItems, selectedSubjectId])

  const resumableSessions = useMemo(() => {
    return Object.values(draftSessions)
      .map((draftSession) => {
        const runtime = runtimeSessions[draftSession.sessionId] ?? null
        if (!runtime || runtime.submittedAt) {
          return null
        }

        return {
          sessionId: draftSession.sessionId,
          title: draftSession.title,
          topicName: draftSession.topicName,
          difficultyLabel: draftSession.difficultyLabel,
          progressText: `${draftSession.questions.filter((question) => hasAnsweredQuestion(runtime, question)).length}/${draftSession.questions.length}`,
          currentQuestion: runtime.currentIndex + 1,
          updatedAt:
            runtime.chatHistory[runtime.chatHistory.length - 1]?.createdAt ?? runtime.startedAt,
        }
      })
      .filter((value) => value !== null)
      .sort((left, right) => right.updatedAt - left.updatedAt)
  }, [draftSessions, runtimeSessions])

  const localPersistedAttemptIds = useMemo(
    () =>
      new Set(
        Object.values(runtimeSessions)
          .map((runtime) => runtime.persistedAttemptId)
          .filter((value): value is string => Boolean(value)),
      ),
    [runtimeSessions],
  )

  const visibleCloudInProgressAttempts = useMemo(
    () =>
      cloudInProgressAttempts.filter(
        (attempt) => !localPersistedAttemptIds.has(attempt.attemptId),
      ),
    [cloudInProgressAttempts, localPersistedAttemptIds],
  )

  useEffect(() => {
    if (!hasSupabaseEnv()) {
      setIsLoadingSubjects(false)
      setIsLoadingHistory(false)
      setIsLoadingCloudAttempts(false)
      setErrorMessage(
        'Chưa có env Supabase cho web-app. Copy web-app/.env.example thành web-app/.env.local và điền giá trị thật.',
      )
      return
    }

    let isMounted = true
    setIsLoadingSubjects(true)
    setErrorMessage('')

    void fetchSubjects()
      .then((rows) => {
        if (isMounted) {
          setSubjects(rows)
        }
      })
      .catch((error: unknown) => {
        if (isMounted) {
          setErrorMessage(error instanceof Error ? error.message : 'Không thể tải môn học.')
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingSubjects(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (!authUser?.id) {
      setAttemptHistory([])
      setCloudInProgressAttempts([])
      setIsLoadingHistory(false)
      setIsLoadingCloudAttempts(false)
      return
    }

    let isMounted = true
    setIsLoadingHistory(true)
    setIsLoadingCloudAttempts(true)
    setHistoryErrorMessage('')
    setCloudRestoreErrorMessage('')

    void fetchAttemptHistory(authUser.id)
      .then((rows) => {
        if (isMounted) {
          setAttemptHistory(rows)
        }
      })
      .catch((error: unknown) => {
        if (isMounted) {
          setHistoryErrorMessage(
            error instanceof Error ? error.message : 'Không thể tải lịch sử làm bài.',
          )
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingHistory(false)
        }
      })

    void fetchCloudInProgressAttempts(authUser.id)
      .then((rows) => {
        if (isMounted) {
          setCloudInProgressAttempts(rows)
        }
      })
      .catch((error: unknown) => {
        if (isMounted) {
          setCloudRestoreErrorMessage(
            error instanceof Error ? error.message : 'Không thể tải bài đang làm trên cloud.',
          )
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingCloudAttempts(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [authUser?.id])

  useEffect(() => {
    if (!selectedSubjectId) {
      setTopics([])
      setSelectedTopicId('')
      return
    }

    let isMounted = true
    setIsLoadingTopics(true)
    setTopics([])
    setSelectedTopicId('')
    setErrorMessage('')

    void fetchTopicsBySubjectId(selectedSubjectId)
      .then((rows) => {
        if (isMounted) {
          setTopics(rows)
        }
      })
      .catch((error: unknown) => {
        if (isMounted) {
          setErrorMessage(error instanceof Error ? error.message : 'Không thể tải chuyên đề.')
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingTopics(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [selectedSubjectId])

  async function handleCreateExam() {
    setErrorMessage('')

    if (!selectedSubject || !selectedTopic || !selectedDifficultyOption) {
      setErrorMessage('Vui lòng chọn đầy đủ môn học, chuyên đề, mức độ và dạng câu hỏi.')
      return
    }

    setIsCreatingExam(true)

    try {
      const questions = await fetchQuestionsForCustomExam(
        selectedSubject.subjectId,
        selectedTopic.topicId,
        selectedDifficultyOption.level,
        selectedQuestionType,
      )

      if (questions.length === 0) {
        setErrorMessage('Chuyên đề này hiện chưa có câu hỏi nào cho mức độ đã chọn.')
        return
      }

      const sessionId = crypto.randomUUID()
      createSession({
        sessionId,
        title: `Đề tự chọn - ${selectedSubject.subjectName} - ${selectedTopic.topicName} - ${selectedDifficultyOption.label}`,
        subjectId: selectedSubject.subjectId,
        subjectName: selectedSubject.subjectName,
        topicId: selectedTopic.topicId,
        topicName: selectedTopic.topicName,
        difficultyLevel: selectedDifficultyOption.level,
        difficultyLabel: selectedDifficultyOption.label,
        durationMinutes: CUSTOM_EXAM_DURATION_MINUTES,
        questions,
        deliveryMode: 'local_mock',
        createdAt: Date.now(),
      })

      navigate(`/exam/${sessionId}`)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Không thể tạo đề tự chọn.')
    } finally {
      setIsCreatingExam(false)
    }
  }

  async function handleRestoreCloudAttempt(attemptId: string) {
    setCloudRestoreErrorMessage('')
    setIsRestoringCloudAttemptId(attemptId)

    try {
      const restored = await restoreCloudAttempt(attemptId)
      if (!restored) {
        setCloudRestoreErrorMessage('Không tìm thấy bài đang làm trên cloud để khôi phục.')
        return
      }

      restoreDraftSession(restored.session)
      restoreRuntimeSession(restored.runtime)
      navigate(`/exam/${restored.session.sessionId}`)
    } catch (error) {
      setCloudRestoreErrorMessage(
        error instanceof Error ? error.message : 'Không thể khôi phục bài đang làm trên cloud.',
      )
    } finally {
      setIsRestoringCloudAttemptId('')
    }
  }

  function handleDiscardLocalSession(sessionId: string) {
    clearRuntimeSession(sessionId)
    clearDraftSession(sessionId)
  }

  function handleCreateFlaggedReviewExam() {
    setErrorMessage('')

    if (visibleFlaggedQuestions.length === 0) {
      setErrorMessage('Chưa có câu sai nào được cắm cờ để tạo phiên ôn tập.')
      return
    }

    const questions = visibleFlaggedQuestions.map((item) => item.question)
    const firstItem = visibleFlaggedQuestions[0]
    const sameTopic = visibleFlaggedQuestions.every((item) => item.topicId === firstItem.topicId)
    const averageDifficulty =
      Math.round(
        visibleFlaggedQuestions.reduce((sum, item) => sum + item.difficultyLevel, 0) /
          visibleFlaggedQuestions.length,
      ) || 1
    const sessionId = crypto.randomUUID()
    const durationMinutes = Math.max(15, Math.min(60, visibleFlaggedQuestions.length * 2))

    createSession({
      sessionId,
      title: `Ôn lại câu sai đã cắm cờ - ${firstItem.subjectName}`,
      subjectId: firstItem.subjectId,
      subjectName: firstItem.subjectName,
      topicId: sameTopic ? firstItem.topicId : 'flagged-wrong-questions',
      topicName: sameTopic ? firstItem.topicName : 'Câu sai đã cắm cờ',
      difficultyLevel: averageDifficulty,
      difficultyLabel: 'Tổng hợp câu sai đã cắm cờ',
      durationMinutes,
      questions,
      deliveryMode: 'local_mock',
      createdAt: Date.now(),
    })

    navigate(`/exam/${sessionId}`)
  }

  return (
    <PageCard
      title="Dashboard Ôn tập"
      description="Chọn cấu hình bài làm, tiếp tục bài đang dở và xem lại kết quả đã lưu trên cloud."
    >
      <section className="mb-6 rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_44px_rgba(15,23,42,0.05)]">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Bộ lọc ôn tập 2025
            </div>
            <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-950">
              Chọn môn học, chủ đề, mức độ và dạng câu hỏi
            </h2>
          </div>

          <button
            className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 active:translate-y-px disabled:cursor-not-allowed disabled:bg-slate-300"
            disabled={isCreatingExam || isLoadingSubjects || isLoadingTopics}
            onClick={handleCreateExam}
            type="button"
          >
            {isCreatingExam ? 'Đang tạo đề...' : 'Tạo đề và bắt đầu'}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <FilterField label="Môn học">
            <select
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-400 focus:bg-white"
              disabled={isLoadingSubjects}
              onChange={(event) => setSelectedSubjectId(event.target.value)}
              value={selectedSubjectId}
            >
              <option value="">Tất cả môn học</option>
              {subjects.map((subject) => (
                <option key={subject.subjectId} value={subject.subjectId}>
                  {subject.subjectName}
                </option>
              ))}
            </select>
          </FilterField>

          <FilterField label="Chủ đề">
            <select
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-400 focus:bg-white disabled:cursor-not-allowed disabled:bg-slate-100"
              disabled={!selectedSubjectId || isLoadingTopics}
              onChange={(event) => setSelectedTopicId(event.target.value)}
              value={selectedTopicId}
            >
              <option value="">Chọn chuyên đề</option>
              {topics.map((topic) => (
                <option key={topic.topicId} value={topic.topicId}>
                  {topic.topicName}
                </option>
              ))}
            </select>
          </FilterField>

          <FilterField label="Mức độ">
            <select
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-400 focus:bg-white"
              onChange={(event) => setSelectedDifficulty(event.target.value)}
              value={selectedDifficulty}
            >
              <option value="">Chọn mức độ</option>
              {difficultyOptions.map((difficulty) => (
                <option key={difficulty.level} value={difficulty.level}>
                  {difficulty.label}
                </option>
              ))}
            </select>
          </FilterField>

          <FilterField label="Dạng câu hỏi">
            <select
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-400 focus:bg-white"
              onChange={(event) =>
                setSelectedQuestionType(event.target.value as 'all' | QuestionType)
              }
              value={selectedQuestionType}
            >
              {questionTypeOptions.map((questionType) => (
                <option key={questionType.value} value={questionType.value}>
                  {questionType.label}
                </option>
              ))}
            </select>
          </FilterField>
        </div>
      </section>

      <div style={styles.statusGrid}>
        <StatusBlock
          label="Môn học"
          value={selectedSubject?.subjectName ?? (isLoadingSubjects ? 'Đang tải...' : '--')}
        />
        <StatusBlock
          label="Chuyên đề"
          value={selectedTopic?.topicName ?? (isLoadingTopics ? 'Đang tải...' : '--')}
        />
        <StatusBlock label="Độ khó" value={selectedDifficultyOption?.label ?? '--'} />
        <StatusBlock
          label="Dạng câu hỏi"
          value={questionTypeOptions.find((item) => item.value === selectedQuestionType)?.label ?? '--'}
        />
        <StatusBlock label="Thời gian" value={`${CUSTOM_EXAM_DURATION_MINUTES} phút`} />
      </div>

      {errorMessage ? <p style={styles.error}>{errorMessage}</p> : null}

      <section style={styles.history}>
        <strong>Câu sai đã cắm cờ</strong>
        <p style={styles.historyText}>
          {selectedSubjectId
            ? `Đang hiện ${visibleFlaggedQuestions.length} câu theo môn đã chọn.`
            : `Đang lưu ${visibleFlaggedQuestions.length} câu sai đã cắm cờ trên trình duyệt.`}
        </p>
        <div style={styles.historyActionRow}>
          <button
            disabled={visibleFlaggedQuestions.length === 0}
            onClick={handleCreateFlaggedReviewExam}
            style={styles.restoreButton}
            type="button"
          >
            Ôn lại các câu đã cắm cờ
          </button>
          <button
            disabled={flaggedQuestionItems.length === 0}
            onClick={clearAllFlaggedQuestions}
            style={styles.discardButton}
            type="button"
          >
            Xóa danh sách cắm cờ
          </button>
        </div>
        {visibleFlaggedQuestions.length > 0 ? (
          <div style={styles.historyList}>
            {visibleFlaggedQuestions.slice(0, 6).map((item) => (
              <article key={item.flaggedId} style={styles.historyCard}>
                <div style={styles.historyHeader}>
                  <div>
                    <div style={styles.historyTitle}>{item.topicName}</div>
                    <div style={styles.historyMeta}>
                      {item.subjectName} | {item.difficultyLabel}
                    </div>
                  </div>
                  <div style={styles.scorePill}>{formatCompletedAt(new Date(item.flaggedAt).toISOString())}</div>
                </div>
                <div style={styles.historyText}>{item.question.content.slice(0, 160)}...</div>
              </article>
            ))}
          </div>
        ) : null}
      </section>

      <section style={styles.history}>
        <strong>Bài đang làm dở</strong>
        {resumableSessions.length === 0 ? (
          <p style={styles.historyText}>Không có bài đang làm nào cần khôi phục.</p>
        ) : (
          <div style={styles.historyList}>
            {resumableSessions.map((session) => (
              <article key={session.sessionId} style={styles.historyCard}>
                <div style={styles.historyHeader}>
                  <div>
                    <div style={styles.historyTitle}>{session.title}</div>
                    <div style={styles.historyMeta}>
                      {session.topicName} | {session.difficultyLabel}
                    </div>
                  </div>
                  <div style={styles.scorePill}>Tiến độ {session.progressText}</div>
                </div>

                <div style={styles.historyFooter}>
                  <span>Đang ở câu {session.currentQuestion}</span>
                  <div style={styles.historyActionRow}>
                    <button
                      onClick={() => handleDiscardLocalSession(session.sessionId)}
                      style={styles.discardButton}
                      type="button"
                    >
                      Bỏ session
                    </button>
                    <Link to={`/exam/${session.sessionId}`} style={styles.reviewLink}>
                      Tiếp tục làm bài
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section style={styles.history}>
        <strong>Bài đang làm trên cloud</strong>
        {cloudRestoreErrorMessage ? <p style={styles.error}>{cloudRestoreErrorMessage}</p> : null}
        {isLoadingCloudAttempts ? (
          <p style={styles.historyText}>Đang tải bài đang làm trên cloud...</p>
        ) : visibleCloudInProgressAttempts.length === 0 ? (
          <p style={styles.historyText}>Không có bài đang làm trên cloud.</p>
        ) : (
          <div style={styles.historyList}>
            {visibleCloudInProgressAttempts.map((attempt) => (
              <article key={attempt.attemptId} style={styles.historyCard}>
                <div style={styles.historyHeader}>
                  <div>
                    <div style={styles.historyTitle}>{attempt.examTitle}</div>
                    <div style={styles.historyMeta}>
                      {attempt.topicName} | {attempt.difficultyLabel}
                    </div>
                  </div>
                  <div style={styles.scorePill}>
                    {attempt.progressCount}/{attempt.totalQuestions}
                  </div>
                </div>

                <div style={styles.historyFooter}>
                  <span>{formatCompletedAt(attempt.updatedAt)}</span>
                  <button
                    disabled={isRestoringCloudAttemptId === attempt.attemptId}
                    onClick={() => void handleRestoreCloudAttempt(attempt.attemptId)}
                    style={styles.restoreButton}
                    type="button"
                  >
                    {isRestoringCloudAttemptId === attempt.attemptId
                      ? 'Đang khôi phục...'
                      : 'Khôi phục từ cloud'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section style={styles.history}>
        <strong>Lịch sử làm bài</strong>
        {historyErrorMessage ? <p style={styles.error}>{historyErrorMessage}</p> : null}
        {isLoadingHistory ? (
          <p style={styles.historyText}>Đang tải lịch sử từ Supabase...</p>
        ) : attemptHistory.length === 0 ? (
          <p style={styles.historyText}>Chưa có bài làm nào được lưu trên web.</p>
        ) : (
          <div style={styles.historyList}>
            {attemptHistory.map((attempt) => (
              <article key={attempt.attemptId} style={styles.historyCard}>
                <div style={styles.historyHeader}>
                  <div>
                    <div style={styles.historyTitle}>{attempt.examTitle}</div>
                    <div style={styles.historyMeta}>
                      {attempt.subjectName} | {attempt.topicName} | {attempt.difficultyLabel}
                    </div>
                  </div>
                  <div style={styles.scorePill}>
                    {attempt.score === null ? '--' : `${attempt.score}/10`}
                  </div>
                </div>

                <div style={styles.historyStats}>
                  <span>Đúng: {attempt.correctCount}</span>
                  <span>Sai: {attempt.wrongCount}</span>
                  <span>Bỏ qua: {attempt.skippedCount}</span>
                </div>

                <div style={styles.historyFooter}>
                  <span>{formatCompletedAt(attempt.completedAt)}</span>
                  <Link to={`/review/${attempt.attemptId}`} style={styles.reviewLink}>
                    Xem review
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </PageCard>
  )
}

function StatusBlock({ label, value }: { label: string; value: string }) {
  return (
    <div style={styles.statusBlock}>
      <div style={styles.statusLabel}>{label}</div>
      <div style={styles.statusValue}>{value}</div>
    </div>
  )
}

function FilterField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-2">
      <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
        {label}
      </span>
      {children}
    </label>
  )
}

function formatCompletedAt(value: string | null) {
  if (!value) {
    return 'Chưa hoàn tất'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString('vi-VN')
}

const styles = {
  filters: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '12px',
    marginBottom: '20px',
  },
  select: {
    borderRadius: '14px',
    border: '1px solid #c7d7e8',
    padding: '14px 16px',
    backgroundColor: '#fbfdff',
  },
  primaryButton: {
    borderRadius: '14px',
    border: 0,
    padding: '14px 18px',
    backgroundColor: '#0f766e',
    color: '#ffffff',
    fontWeight: 700,
  },
  statusGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '12px',
    marginBottom: '18px',
  },
  statusBlock: {
    borderRadius: '18px',
    padding: '16px',
    border: '1px solid #d7e3ef',
    backgroundColor: '#f9fbff',
  },
  statusLabel: {
    marginBottom: '6px',
    color: '#607a97',
    fontSize: '12px',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
  },
  statusValue: {
    color: '#10233c',
    fontWeight: 700,
  },
  error: {
    color: '#b42318',
    fontWeight: 600,
    marginBottom: '18px',
  },
  history: {
    borderRadius: '18px',
    border: '1px dashed #c7d7e8',
    padding: '18px',
    backgroundColor: '#f7fbff',
    marginTop: '18px',
  },
  historyList: {
    display: 'grid',
    gap: '12px',
    marginTop: '12px',
  },
  historyCard: {
    borderRadius: '16px',
    padding: '16px',
    backgroundColor: '#ffffff',
    border: '1px solid #d7e3ef',
  },
  historyHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '12px',
    alignItems: 'flex-start',
    marginBottom: '10px',
  },
  historyTitle: {
    color: '#10233c',
    fontWeight: 700,
  },
  historyMeta: {
    color: '#607a97',
    fontSize: '13px',
    marginTop: '4px',
  },
  historyStats: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '10px',
    color: '#36506c',
    fontWeight: 600,
    marginBottom: '12px',
  },
  historyFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '12px',
    alignItems: 'center',
    color: '#607a97',
    fontSize: '13px',
  },
  historyActionRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  scorePill: {
    borderRadius: '999px',
    padding: '8px 12px',
    backgroundColor: '#edf5ff',
    border: '1px solid #d7e3ef',
    color: '#1d4ed8',
    fontWeight: 700,
  },
  reviewLink: {
    color: '#0f766e',
    fontWeight: 700,
    textDecoration: 'none',
  },
  discardButton: {
    borderRadius: '10px',
    border: '1px solid #d7e3ef',
    padding: '8px 12px',
    backgroundColor: '#ffffff',
    color: '#b42318',
    fontWeight: 700,
  },
  restoreButton: {
    borderRadius: '10px',
    border: 0,
    padding: '8px 12px',
    backgroundColor: '#10233c',
    color: '#ffffff',
    fontWeight: 700,
  },
  historyText: {
    margin: '8px 0 0',
    color: '#5d7491',
  },
}
