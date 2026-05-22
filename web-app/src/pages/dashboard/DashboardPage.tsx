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
          progressText: `${Object.keys(runtime.selectedAnswerIdsByQuestionId).length}/${draftSession.questions.length}`,
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
        'Chua co env Supabase cho web-app. Copy web-app/.env.example thanh web-app/.env.local va dien gia tri that.',
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
          setErrorMessage(error instanceof Error ? error.message : 'Khong the tai mon hoc.')
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
            error instanceof Error ? error.message : 'Khong the tai lich su lam bai.',
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
            error instanceof Error ? error.message : 'Khong the tai bai dang lam tren cloud.',
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
          setErrorMessage(error instanceof Error ? error.message : 'Khong the tai chuyen de.')
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
      setErrorMessage('Vui long chon day du mon hoc, chuyen de, muc do va dang cau hoi.')
      return
    }

    setIsCreatingExam(true)

    try {
      const questions = await fetchQuestionsForCustomExam(
        selectedTopic.topicId,
        selectedDifficultyOption.level,
        selectedQuestionType,
      )

      if (questions.length === 0) {
        setErrorMessage('Chuyen de nay hien chua co cau hoi nao cho muc do da chon.')
        return
      }

      const sessionId = crypto.randomUUID()
      createSession({
        sessionId,
        title: `De tu chon - ${selectedSubject.subjectName} - ${selectedTopic.topicName} - ${selectedDifficultyOption.label}`,
        subjectId: selectedSubject.subjectId,
        subjectName: selectedSubject.subjectName,
        topicId: selectedTopic.topicId,
        topicName: selectedTopic.topicName,
        difficultyLevel: selectedDifficultyOption.level,
        difficultyLabel: selectedDifficultyOption.label,
        durationMinutes: CUSTOM_EXAM_DURATION_MINUTES,
        questions,
        createdAt: Date.now(),
      })

      navigate(`/exam/${sessionId}`)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Khong the tao de tu chon.')
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
        setCloudRestoreErrorMessage('Khong tim thay bai dang lam tren cloud de khoi phuc.')
        return
      }

      restoreDraftSession(restored.session)
      restoreRuntimeSession(restored.runtime)
      navigate(`/exam/${restored.session.sessionId}`)
    } catch (error) {
      setCloudRestoreErrorMessage(
        error instanceof Error ? error.message : 'Khong the khoi phuc bai dang lam tren cloud.',
      )
    } finally {
      setIsRestoringCloudAttemptId('')
    }
  }

  function handleDiscardLocalSession(sessionId: string) {
    clearRuntimeSession(sessionId)
    clearDraftSession(sessionId)
  }

  return (
    <PageCard
      title="Dashboard On Tap"
      description="Chon cau hinh bai lam, tiep tuc bai dang do va xem lai ket qua da luu tren cloud."
    >
      <section className="mb-6 rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_44px_rgba(15,23,42,0.05)]">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Bo loc on tap 2025
            </div>
            <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-950">
              Chon mon hoc, chu de, muc do va dang cau hoi
            </h2>
          </div>

          <button
            className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 active:translate-y-px disabled:cursor-not-allowed disabled:bg-slate-300"
            disabled={isCreatingExam || isLoadingSubjects || isLoadingTopics}
            onClick={handleCreateExam}
            type="button"
          >
            {isCreatingExam ? 'Dang tao de...' : 'Tao de va bat dau'}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <FilterField label="Mon hoc">
            <select
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-400 focus:bg-white"
              disabled={isLoadingSubjects}
              onChange={(event) => setSelectedSubjectId(event.target.value)}
              value={selectedSubjectId}
            >
              <option value="">Tat ca mon hoc</option>
              {subjects.map((subject) => (
                <option key={subject.subjectId} value={subject.subjectId}>
                  {subject.subjectName}
                </option>
              ))}
            </select>
          </FilterField>

          <FilterField label="Chu de">
            <select
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-400 focus:bg-white disabled:cursor-not-allowed disabled:bg-slate-100"
              disabled={!selectedSubjectId || isLoadingTopics}
              onChange={(event) => setSelectedTopicId(event.target.value)}
              value={selectedTopicId}
            >
              <option value="">Chon chuyen de</option>
              {topics.map((topic) => (
                <option key={topic.topicId} value={topic.topicId}>
                  {topic.topicName}
                </option>
              ))}
            </select>
          </FilterField>

          <FilterField label="Muc do">
            <select
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-400 focus:bg-white"
              onChange={(event) => setSelectedDifficulty(event.target.value)}
              value={selectedDifficulty}
            >
              <option value="">Chon muc do</option>
              {difficultyOptions.map((difficulty) => (
                <option key={difficulty.level} value={difficulty.level}>
                  {difficulty.label}
                </option>
              ))}
            </select>
          </FilterField>

          <FilterField label="Dang cau hoi">
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
          label="Mon hoc"
          value={selectedSubject?.subjectName ?? (isLoadingSubjects ? 'Dang tai...' : '--')}
        />
        <StatusBlock
          label="Chuyen de"
          value={selectedTopic?.topicName ?? (isLoadingTopics ? 'Dang tai...' : '--')}
        />
        <StatusBlock label="Do kho" value={selectedDifficultyOption?.label ?? '--'} />
        <StatusBlock
          label="Dang cau hoi"
          value={questionTypeOptions.find((item) => item.value === selectedQuestionType)?.label ?? '--'}
        />
        <StatusBlock label="Thoi gian" value={`${CUSTOM_EXAM_DURATION_MINUTES} phut`} />
      </div>

      {errorMessage ? <p style={styles.error}>{errorMessage}</p> : null}

      <section style={styles.history}>
        <strong>Bai dang lam do</strong>
        {resumableSessions.length === 0 ? (
          <p style={styles.historyText}>Khong co bai dang lam nao can khoi phuc.</p>
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
                  <div style={styles.scorePill}>Tien do {session.progressText}</div>
                </div>

                <div style={styles.historyFooter}>
                  <span>Dang o cau {session.currentQuestion}</span>
                  <div style={styles.historyActionRow}>
                    <button
                      onClick={() => handleDiscardLocalSession(session.sessionId)}
                      style={styles.discardButton}
                      type="button"
                    >
                      Bo session
                    </button>
                    <Link to={`/exam/${session.sessionId}`} style={styles.reviewLink}>
                      Tiep tuc lam bai
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section style={styles.history}>
        <strong>Bai dang lam tren cloud</strong>
        {cloudRestoreErrorMessage ? <p style={styles.error}>{cloudRestoreErrorMessage}</p> : null}
        {isLoadingCloudAttempts ? (
          <p style={styles.historyText}>Dang tai bai dang lam tren cloud...</p>
        ) : visibleCloudInProgressAttempts.length === 0 ? (
          <p style={styles.historyText}>Khong co bai dang lam tren cloud.</p>
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
                      ? 'Dang khoi phuc...'
                      : 'Khoi phuc tu cloud'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section style={styles.history}>
        <strong>Lich su lam bai</strong>
        {historyErrorMessage ? <p style={styles.error}>{historyErrorMessage}</p> : null}
        {isLoadingHistory ? (
          <p style={styles.historyText}>Dang tai lich su tu Supabase...</p>
        ) : attemptHistory.length === 0 ? (
          <p style={styles.historyText}>Chua co bai lam nao duoc luu tren web.</p>
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
                  <span>Dung: {attempt.correctCount}</span>
                  <span>Sai: {attempt.wrongCount}</span>
                  <span>Bo qua: {attempt.skippedCount}</span>
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
    return 'Chua hoan tat'
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
