import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageCard } from '../../components/ui/PageCard'
import { useAuthSessionStore } from '../../features/auth/store/auth-session-store'
import {
  allowedMainSubjects,
  fetchQuestionsForCustomExam,
  fetchSubjects,
  fetchTopicsBySubjectId,
} from '../../features/dashboard/services/dashboard-service'
import {
  questionTypeOptions,
  type QuestionType,
  type SubjectOption,
  type TopicOption,
} from '../../features/dashboard/types/dashboard-types'
import { useExamDraftStore } from '../../features/exam/store/exam-draft-store'
import { hasSupabaseEnv } from '../../lib/config/env'

const CUSTOM_EXAM_DURATION_MINUTES = 45

export function DashboardPage() {
  const navigate = useNavigate()
  const user = useAuthSessionStore((state) => state.user)
  const createSession = useExamDraftStore((state) => state.createSession)

  const [subjects, setSubjects] = useState<SubjectOption[]>([])
  const [topics, setTopics] = useState<TopicOption[]>([])
  const [selectedSubjectId, setSelectedSubjectId] = useState('')
  const [selectedTopicId, setSelectedTopicId] = useState('')
  const [selectedQuestionType, setSelectedQuestionType] = useState<'all' | QuestionType>('all')
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true)
  const [isLoadingTopics, setIsLoadingTopics] = useState(false)
  const [isCreatingExam, setIsCreatingExam] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const selectedSubject = useMemo(
    () => subjects.find((subject) => subject.subjectId === selectedSubjectId) ?? null,
    [selectedSubjectId, subjects],
  )

  const selectedTopic = useMemo(
    () => topics.find((topic) => topic.topicId === selectedTopicId) ?? null,
    [selectedTopicId, topics],
  )

  useEffect(() => {
    let isMounted = true

    if (!hasSupabaseEnv()) {
      setIsLoadingSubjects(false)
      setErrorMessage(
        'Chưa có env Supabase cho web-app. Copy web-app/.env.example thành web-app/.env.local và điền giá trị thật.',
      )
      return
    }

    setIsLoadingSubjects(true)
    setErrorMessage('')

    void fetchSubjects()
      .then((rows) => {
        if (isMounted) {
          const allowedSubjectIds = new Set(allowedMainSubjects.map((subject) => subject.subjectId))
          setSubjects(rows.filter((subject) => allowedSubjectIds.has(subject.subjectId)))
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

    if (!selectedSubject || !selectedTopic) {
      setErrorMessage('Vui lòng chọn đầy đủ môn học, chuyên đề và dạng câu hỏi.')
      return
    }

    setIsCreatingExam(true)

    try {
      const questions = await fetchQuestionsForCustomExam(
        selectedSubject.subjectId,
        selectedTopic.topicId,
        selectedQuestionType,
      )

      if (questions.length === 0) {
        setErrorMessage('Chuyên đề này hiện chưa có câu hỏi nào cho cấu hình đã chọn.')
        return
      }

      const sessionId = crypto.randomUUID()
      createSession({
        sessionId,
        title: `Đề tự chọn - ${selectedSubject.subjectName} - ${selectedTopic.topicName}`,
        subjectId: selectedSubject.subjectId,
        subjectName: selectedSubject.subjectName,
        topicId: selectedTopic.topicId,
        topicName: selectedTopic.topicName,
        difficultyLevel: resolveAverageDifficulty(questions),
        difficultyLabel: 'Tổng hợp',
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

  return (
    <PageCard
      title="Dashboard Ôn tập"
      description="Chọn môn học, chuyên đề và dạng câu hỏi để tạo phiên luyện tập riêng."
    >
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Ôn tập kiến thức
            </div>
            <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-950">
              Tạo đề luyện tập theo đúng phần kiến thức cần ôn
            </h2>
          </div>

          <button
            className="rounded-2xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:shadow active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
            disabled={isCreatingExam || isLoadingSubjects || isLoadingTopics}
            onClick={() => void handleCreateExam()}
            type="button"
          >
            {isCreatingExam ? 'Đang tạo đề...' : 'Tạo đề và bắt đầu'}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <FilterField label="Môn học">
            <select
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-400 focus:bg-white"
              disabled={isLoadingSubjects}
              onChange={(event) => setSelectedSubjectId(event.target.value)}
              value={selectedSubjectId}
            >
              <option value="">Chọn môn học</option>
              {subjects.map((subject) => (
                <option key={subject.subjectId} value={subject.subjectId}>
                  {subject.subjectName}
                </option>
              ))}
            </select>
          </FilterField>

          <FilterField label="Chuyên đề">
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

        {errorMessage ? (
          <p className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            {errorMessage}
          </p>
        ) : null}
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatusBlock label="Môn học" value={selectedSubject?.subjectName ?? (isLoadingSubjects ? 'Đang tải...' : '--')} />
        <StatusBlock label="Chuyên đề" value={selectedTopic?.topicName ?? (isLoadingTopics ? 'Đang tải...' : '--')} />
        <StatusBlock
          label="Dạng câu hỏi"
          value={questionTypeOptions.find((item) => item.value === selectedQuestionType)?.label ?? '--'}
        />
      </section>

      {user && ['admin', 'teacher'].includes(user?.role ?? '') ? (
        <section className="mt-8 rounded-[28px] border border-slate-200 bg-slate-50 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.04)]">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Quản trị viên</h3>
          <div className="mt-4 flex flex-wrap gap-4">
            <button
              className="inline-flex items-center justify-center rounded-2xl bg-white border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
              onClick={() => navigate('/admin/manage-review-questions')}
              type="button"
            >
              Quản lý câu hỏi ôn tập
            </button>
            <button
              className="inline-flex items-center justify-center rounded-2xl bg-white border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
              onClick={() => navigate('/admin/import-review-questions')}
              type="button"
            >
              Nhập câu hỏi ôn tập mới
            </button>
          </div>
        </section>
      ) : null}
    </PageCard>
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

function StatusBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] border border-slate-200 bg-white px-5 py-4 shadow-sm">
      <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
        {label}
      </div>
      <div className="mt-2 text-sm font-bold text-slate-900">{value}</div>
    </div>
  )
}

function resolveAverageDifficulty(questions: { level?: number | null }[]) {
  const average =
    Math.round(questions.reduce((sum, question) => sum + Number(question.level || 1), 0) / questions.length) || 1
  return Math.min(4, Math.max(1, average))
}
