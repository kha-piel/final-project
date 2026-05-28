import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bot, BookOpen, FileText } from 'lucide-react'
import { useAuthSessionStore } from '../../features/auth/store/auth-session-store'
import { fetchAttemptHistory } from '../../features/dashboard/services/dashboard-service'
import type { AttemptHistoryItem } from '../../features/dashboard/types/dashboard-types'
import { hasAnsweredQuestion } from '../../features/exam/core/exam-session'
import {
  fetchInProgressAttempts as fetchCloudInProgressAttempts,
  restoreInProgressAttempt as restoreCloudAttempt,
  type InProgressAttemptListItem,
} from '../../features/exam/services/exam-attempt-service'
import { useExamDraftStore } from '../../features/exam/store/exam-draft-store'
import { useExamRuntimeStore } from '../../features/exam/store/exam-runtime-store'
import { fetchUnifiedAiHistory, type UnifiedAiHistoryItem } from '../../features/history/services/history-service'
import {
  fetchSchoolExamAttemptHistory,
  type SchoolExamAttemptHistoryItem,
} from '../../features/practice/services/school-exam-attempt-service'
import { HistoryAiChatModal } from './components/HistoryAiChatModal'
import { hasSupabaseEnv } from '../../lib/config/env'

type HistoryTab = 'exams' | 'practice' | 'ai'

export function HistoryPage() {
  const navigate = useNavigate()
  const authUser = useAuthSessionStore((state) => state.user)
  const [activeTab, setActiveTab] = useState<HistoryTab>('exams')
  const [schoolExamHistory, setSchoolExamHistory] = useState<SchoolExamAttemptHistoryItem[]>([])
  const [selectedSubject, setSelectedSubject] = useState<string>('all')
  const [practiceHistory, setPracticeHistory] = useState<AttemptHistoryItem[]>([])
  const [cloudInProgressAttempts, setCloudInProgressAttempts] = useState<InProgressAttemptListItem[]>([])
  const [aiHistory, setAiHistory] = useState<UnifiedAiHistoryItem[]>([])
  const [selectedAiHistoryMessage, setSelectedAiHistoryMessage] = useState<UnifiedAiHistoryItem | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRestoringCloudAttemptId, setIsRestoringCloudAttemptId] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const draftSessions = useExamDraftStore((state) => state.sessions)
  const restoreDraftSession = useExamDraftStore((state) => state.restoreSession)
  const clearDraftSession = useExamDraftStore((state) => state.clearSession)
  const runtimeSessions = useExamRuntimeStore((state) => state.sessions)
  const restoreRuntimeSession = useExamRuntimeStore((state) => state.restoreRuntimeSession)
  const clearRuntimeSession = useExamRuntimeStore((state) => state.clearRuntimeSession)

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

  const localSubmittedSessions = useMemo(() => {
    return Object.values(draftSessions)
      .map((draftSession) => {
        const runtime = runtimeSessions[draftSession.sessionId] ?? null
        if (!runtime?.submittedAt) {
          return null
        }

        return {
          sessionId: draftSession.sessionId,
          title: draftSession.title,
          topicName: draftSession.topicName,
          difficultyLabel: draftSession.difficultyLabel,
          completedAt: runtime.submittedAt,
        }
      })
      .filter((value) => value !== null)
      .sort((left, right) => right.completedAt - left.completedAt)
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

  const uniqueSubjects = useMemo(() => {
    const subjects = new Set<string>()
    schoolExamHistory.forEach((attempt) => {
      if (attempt.subjectName) subjects.add(attempt.subjectName)
    })
    return Array.from(subjects).sort()
  }, [schoolExamHistory])

  const filteredSchoolExamHistory = useMemo(() => {
    if (selectedSubject === 'all') return schoolExamHistory
    return schoolExamHistory.filter((attempt) => attempt.subjectName === selectedSubject)
  }, [schoolExamHistory, selectedSubject])

  useEffect(() => {
    if (!authUser?.id) {
      setIsLoading(false)
      return
    }

    if (!hasSupabaseEnv()) {
      setErrorMessage('Chua co cau hinh Supabase cho web-app.')
      setIsLoading(false)
      return
    }

    let isMounted = true
    setIsLoading(true)
    setErrorMessage('')

    void Promise.all([
      fetchSchoolExamAttemptHistory(authUser.id),
      fetchAttemptHistory(authUser.id),
      fetchCloudInProgressAttempts(authUser.id),
      fetchUnifiedAiHistory(authUser.id),
    ])
      .then(([schoolRows, practiceRows, cloudRows, aiRows]) => {
        if (!isMounted) {
          return
        }

        setSchoolExamHistory(schoolRows)
        setPracticeHistory(practiceRows)
        setCloudInProgressAttempts(cloudRows)
        setAiHistory(aiRows)
      })
      .catch((error: unknown) => {
        if (isMounted) {
          setErrorMessage(error instanceof Error ? error.message : 'Khong the tai lich su hoc tap.')
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [authUser?.id])

  async function handleRestoreCloudAttempt(attemptId: string) {
    setErrorMessage('')
    setIsRestoringCloudAttemptId(attemptId)

    try {
      const restored = await restoreCloudAttempt(attemptId)
      if (!restored) {
        setErrorMessage('Khong tim thay bai dang lam tren cloud de khoi phuc.')
        return
      }

      restoreDraftSession(restored.session)
      restoreRuntimeSession(restored.runtime)
      navigate(`/exam/${restored.session.sessionId}`)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Khong the khoi phuc bai dang lam.')
    } finally {
      setIsRestoringCloudAttemptId('')
    }
  }

  function handleDiscardLocalSession(sessionId: string) {
    clearRuntimeSession(sessionId)
    clearDraftSession(sessionId)
  }

  function handleOpenSchoolAttempt(attemptId: string, examId: string) {
    navigate(`/practice/school-exams/${examId}?reviewAttemptId=${attemptId}`)
  }

  return (
    <section className="space-y-6">
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Lịch sử học tập
        </div>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 md:text-4xl">
          Xem lại đề thi, phiên ôn tập và trao đổi với AI
        </h1>

        <div className="mt-6 flex flex-wrap gap-2">
          <TabButton active={activeTab === 'exams'} icon={<FileText className="h-4 w-4" />} onClick={() => setActiveTab('exams')}>
            Lịch sử làm đề thi
          </TabButton>
          <TabButton active={activeTab === 'practice'} icon={<BookOpen className="h-4 w-4" />} onClick={() => setActiveTab('practice')}>
            Lịch sử ôn tập
          </TabButton>
          <TabButton active={activeTab === 'ai'} icon={<Bot className="h-4 w-4" />} onClick={() => setActiveTab('ai')}>
            Lịch sử AI
          </TabButton>
        </div>
      </div>

      {errorMessage ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {errorMessage}
        </div>
      ) : null}

      {isLoading ? (
        <Panel>
          <p className="text-sm text-slate-600">Đang tải lịch sử...</p>
        </Panel>
      ) : null}

      {!isLoading && activeTab === 'exams' ? (
        <Panel>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <SectionTitle title="Lịch sử làm đề thi thử của trường" description="Các bài đã nộp được lưu theo tài khoản học sinh." />
            {uniqueSubjects.length > 0 && (
              <select
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-sky-400 focus:bg-white transition"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
              >
                <option value="all">Tất cả môn</option>
                {uniqueSubjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            )}
          </div>
          {filteredSchoolExamHistory.length === 0 ? (
            <EmptyState text={schoolExamHistory.length === 0 ? "Chưa có bài làm đề trường nào được lưu." : "Không có bài làm nào cho môn này."} />
          ) : (
            <div className="mt-5 grid gap-4">
              {filteredSchoolExamHistory.map((attempt) => (
                <article key={attempt.attemptId} className="rounded-[20px] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-950">{attempt.examTitle}</h3>
                      <p className="mt-1 text-sm text-slate-600">
                        {attempt.schoolName} | {attempt.subjectName} | Mã đề {attempt.variantCode}
                      </p>
                    </div>
                    <ScorePill value={attempt.score === null ? '--' : `${attempt.score}/10`} />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold text-slate-600">
                    <span>Đúng: {attempt.correctCount}</span>
                    <span>Sai: {attempt.wrongCount}</span>
                    <span>Bỏ qua: {attempt.skippedCount}</span>
                    <span>{formatDateTime(attempt.completedAt)}</span>
                  </div>
                  <button
                    className="mt-4 rounded-2xl bg-slate-950 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-800"
                    onClick={() => handleOpenSchoolAttempt(attempt.attemptId, attempt.schoolExamId)}
                    type="button"
                  >
                    Xem chi tiết
                  </button>
                </article>
              ))}
            </div>
          )}
        </Panel>
      ) : null}

      {!isLoading && activeTab === 'practice' ? (
        <div className="space-y-5">
          <Panel>
            <SectionTitle title="Bài ôn tập đang làm dở" description="Các phiên còn trong trình duyệt hoặc đã đồng bộ cloud." />
            {resumableSessions.length === 0 && visibleCloudInProgressAttempts.length === 0 ? (
              <EmptyState text="Không có bài ôn tập đang làm dở." />
            ) : null}
            <div className="mt-5 grid gap-4">
              {resumableSessions.map((session) => (
                <article key={session.sessionId} className="rounded-[20px] border border-slate-200 bg-slate-50 p-4">
                  <h3 className="font-bold text-slate-950">{session.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    {session.topicName} | {session.difficultyLabel} | Tiến độ {session.progressText}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-bold text-rose-700" onClick={() => handleDiscardLocalSession(session.sessionId)} type="button">
                      Bỏ session
                    </button>
                    <Link className="rounded-xl bg-slate-950 px-3 py-2 text-sm font-bold text-white" to={`/exam/${session.sessionId}`}>
                      Tiếp tục
                    </Link>
                  </div>
                </article>
              ))}
              {visibleCloudInProgressAttempts.map((attempt) => (
                <article key={attempt.attemptId} className="rounded-[20px] border border-slate-200 bg-slate-50 p-4">
                  <h3 className="font-bold text-slate-950">{attempt.examTitle}</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    {attempt.topicName} | {attempt.difficultyLabel} | {attempt.progressCount}/{attempt.totalQuestions}
                  </p>
                  <button
                    className="mt-4 rounded-xl bg-slate-950 px-3 py-2 text-sm font-bold text-white disabled:bg-slate-300"
                    disabled={isRestoringCloudAttemptId === attempt.attemptId}
                    onClick={() => void handleRestoreCloudAttempt(attempt.attemptId)}
                    type="button"
                  >
                    {isRestoringCloudAttemptId === attempt.attemptId ? 'Đang khôi phục...' : 'Khôi phục từ cloud'}
                  </button>
                </article>
              ))}
            </div>
          </Panel>

          <Panel>
            <SectionTitle title="Bài ôn tập đã nộp" description="Các phiên luyện tập đã lưu trong Supabase." />
            {practiceHistory.length === 0 && localSubmittedSessions.length === 0 ? (
              <EmptyState text="Chưa có bài ôn tập đã nộp." />
            ) : (
              <div className="mt-5 grid gap-4">
                {localSubmittedSessions.map((attempt) => (
                  <article key={attempt.sessionId} className="rounded-[20px] border border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-slate-950">{attempt.title}</h3>
                        <p className="mt-1 text-sm text-slate-600">
                          {attempt.topicName} | {attempt.difficultyLabel} | Local review
                        </p>
                      </div>
                      <ScorePill value="Đã nộp" />
                    </div>
                    <Link className="mt-4 inline-flex rounded-xl bg-slate-950 px-3 py-2 text-sm font-bold text-white" to={`/review/${attempt.sessionId}`}>
                      Xem review
                    </Link>
                  </article>
                ))}
                {practiceHistory.map((attempt) => (
                  <article key={attempt.attemptId} className="rounded-[20px] border border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-slate-950">{attempt.examTitle}</h3>
                        <p className="mt-1 text-sm text-slate-600">
                          {attempt.subjectName} | {attempt.topicName} | {attempt.difficultyLabel}
                        </p>
                      </div>
                      <ScorePill value={attempt.score === null ? '--' : `${attempt.score}/10`} />
                    </div>
                    <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold text-slate-600">
                      <span>Đúng: {attempt.correctCount}</span>
                      <span>Sai: {attempt.wrongCount}</span>
                      <span>Bỏ qua: {attempt.skippedCount}</span>
                    </div>
                    <Link className="mt-4 inline-flex rounded-xl bg-slate-950 px-3 py-2 text-sm font-bold text-white" to={`/review/${attempt.attemptId}`}>
                      Xem review
                    </Link>
                  </article>
                ))}
              </div>
            )}
          </Panel>
        </div>
      ) : null}

      {!isLoading && activeTab === 'ai' ? (
        <Panel>
          <SectionTitle title="Lịch sử AI" description="Tin nhắn AI trong bài ôn tập và phần review đề thi thử." />
          {aiHistory.length === 0 ? (
            <EmptyState text="Chưa có lịch sử AI nào." />
          ) : (
            <div className="mt-5 grid gap-4">
              {aiHistory.map((message) => (
                <article 
                  key={message.id} 
                  onClick={() => setSelectedAiHistoryMessage(message)}
                  className="rounded-[20px] border border-slate-200 bg-slate-50 p-4 cursor-pointer hover:border-sky-300 hover:bg-sky-50 transition"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-slate-950">{message.title}</h3>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                        {message.source === 'school_exam' ? 'Đề thi thử' : 'Ôn tập'} | {message.context}
                      </p>
                    </div>
                    <div className="text-xs font-semibold text-slate-500">{formatDateTime(message.createdAt)}</div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </Panel>
      ) : null}

      {selectedAiHistoryMessage ? (
        <HistoryAiChatModal 
          item={selectedAiHistoryMessage} 
          onClose={() => setSelectedAiHistoryMessage(null)} 
        />
      ) : null}
    </section>
  )
}

function TabButton({
  active,
  children,
  icon,
  onClick,
}: {
  active: boolean
  children: string
  icon: ReactNode
  onClick: () => void
}) {
  return (
    <button
      className={[
        'inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-bold transition',
        active
          ? 'border-slate-950 bg-slate-950 text-white'
          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-white',
      ].join(' ')}
      onClick={onClick}
      type="button"
    >
      {icon}
      {children}
    </button>
  )
}

function Panel({ children }: { children: ReactNode }) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
      {children}
    </section>
  )
}

function SectionTitle({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h2 className="text-xl font-extrabold text-slate-950">{title}</h2>
      <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
    </div>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
      {text}
    </div>
  )
}

function ScorePill({ value }: { value: string }) {
  return (
    <div className="inline-flex rounded-full bg-slate-900 px-3 py-1 text-xs font-bold text-white">
      {value}
    </div>
  )
}


function formatDateTime(value: string | null) {
  if (!value) {
    return 'Chưa hoàn tất'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString('vi-VN')
}
