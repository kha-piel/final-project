import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageCard } from '../../components/ui/PageCard'
import {
  fetchQuestionsForCustomExam,
  fetchSubjects,
  fetchTopicsBySubjectId,
} from '../../features/dashboard/services/dashboard-service'
import {
  difficultyOptions,
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
  const createSession = useExamDraftStore((state) => state.createSession)

  const [subjects, setSubjects] = useState<SubjectOption[]>([])
  const [topics, setTopics] = useState<TopicOption[]>([])
  const [selectedSubjectId, setSelectedSubjectId] = useState('')
  const [selectedTopicId, setSelectedTopicId] = useState('')
  const [selectedDifficulty, setSelectedDifficulty] = useState('')
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

  const selectedDifficultyOption = useMemo(
    () => difficultyOptions.find((item) => item.level.toString() === selectedDifficulty) ?? null,
    [selectedDifficulty],
  )

  useEffect(() => {
    let isMounted = true

    if (!hasSupabaseEnv()) {
      setIsLoadingSubjects(false)
      setErrorMessage(
        'Chua co env Supabase cho web-app. Copy web-app/.env.example thanh web-app/.env.local va dien gia tri that.',
      )
      return
    }

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
        selectedSubject.subjectId,
        selectedTopic.topicId,
        selectedDifficultyOption.level,
        selectedQuestionType,
      )

      if (questions.length === 0) {
        setErrorMessage('Chuyen de nay hien chua co cau hoi nao cho cau hinh da chon.')
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
        deliveryMode: 'local_mock',
        createdAt: Date.now(),
      })

      navigate(`/exam/${sessionId}`)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Khong the tao de tu chon.')
    } finally {
      setIsCreatingExam(false)
    }
  }

  return (
    <PageCard
      title="Dashboard Ôn tập"
      description="Chọn môn học, chuyên đề, mức độ và dạng câu hỏi để tạo phiên luyện tập riêng."
    >
      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_44px_rgba(15,23,42,0.05)]">
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
            className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 active:translate-y-px disabled:cursor-not-allowed disabled:bg-slate-300"
            disabled={isCreatingExam || isLoadingSubjects || isLoadingTopics}
            onClick={() => void handleCreateExam()}
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

        {errorMessage ? (
          <p className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            {errorMessage}
          </p>
        ) : null}
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatusBlock label="Môn học" value={selectedSubject?.subjectName ?? (isLoadingSubjects ? 'Đang tải...' : '--')} />
        <StatusBlock label="Chuyên đề" value={selectedTopic?.topicName ?? (isLoadingTopics ? 'Đang tải...' : '--')} />
        <StatusBlock label="Độ khó" value={selectedDifficultyOption?.label ?? '--'} />
        <StatusBlock
          label="Dạng câu hỏi"
          value={questionTypeOptions.find((item) => item.value === selectedQuestionType)?.label ?? '--'}
        />
      </section>
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
    <div className="rounded-[18px] border border-slate-200 bg-white px-4 py-4 shadow-[0_14px_34px_rgba(15,23,42,0.04)]">
      <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
        {label}
      </div>
      <div className="mt-2 text-sm font-bold text-slate-900">{value}</div>
    </div>
  )
}
