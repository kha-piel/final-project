import { useMemo, useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { MarkdownContent } from '../../components/ui/MarkdownContent'
import { PageCard } from '../../components/ui/PageCard'
import type { DraftQuestion, QuestionType } from '../../features/dashboard/types/dashboard-types'
import { useExamDraftStore } from '../../features/exam/store/exam-draft-store'
import { fetchSchoolExamQuestionBank } from '../../features/practice/services/school-exam-service'
import { useFlaggedWrongQuestionStore } from '../../features/practice/store/flagged-wrong-question-store'
import type { SchoolExamQuestionRecord } from '../../features/practice/types/school-exam-types'
import {
  getKnowledgeReviewTopic,
  inferKnowledgeReviewTopics,
  knowledgeReviewTopics,
  type KnowledgeReviewTopic,
} from '../../features/review/knowledge-review-topics'

type DifficultyFilter = 'auto' | '1' | '2' | '3' | '4'
type QuestionTypeFilter = 'all' | QuestionType
type BuildMode = 'mixed' | 'progressive'

export function KnowledgeReviewPage() {
  const { topicKey = '' } = useParams()
  const navigate = useNavigate()
  const createSession = useExamDraftStore((state) => state.createSession)
  const flaggedItems = useFlaggedWrongQuestionStore((state) => state.items)
  const topic = getKnowledgeReviewTopic(topicKey)

  const [selectedLessonKey, setSelectedLessonKey] = useState(topic?.lessons[0]?.lessonKey ?? '')
  const [isCreatingExam, setIsCreatingExam] = useState(false)
  const [actionError, setActionError] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>('auto')
  const [questionTypeFilter, setQuestionTypeFilter] = useState<QuestionTypeFilter>('all')
  const [questionCount, setQuestionCount] = useState(12)
  const [buildMode, setBuildMode] = useState<BuildMode>('mixed')

  const selectedLesson = topic?.lessons.find((lesson) => lesson.lessonKey === selectedLessonKey) ?? topic?.lessons[0]
  const relatedFlaggedQuestions = useMemo(() => {
    if (!topic) {
      return []
    }

    return Object.values(flaggedItems).filter((item) =>
      inferKnowledgeReviewTopics([
        item.topicName,
        item.topicId,
        item.question.obsidianSourcePath ?? '',
        item.question.content,
      ]).some((matchedTopic) => matchedTopic.key === topic.key),
    )
  }, [flaggedItems, topic])

  async function handleCreateTopicExam() {
    if (!topic) {
      return
    }

    setIsCreatingExam(true)
    setActionError('')

    try {
      const questionBank = await fetchSchoolExamQuestionBank('TOAN')
      const matchedQuestions = questionBank
        .filter((question) => isQuestionRelatedToTopic(question, topic))
        .filter((question) => matchesDifficultyFilter(question, difficultyFilter))
        .filter((question) => matchesQuestionTypeFilter(question, questionTypeFilter))
        .map(mapSchoolExamQuestionToDraftQuestion)

      if (matchedQuestions.length === 0) {
        setActionError('Chưa có câu hỏi phù hợp với bộ lọc này trong ngân hàng đề trường.')
        return
      }

      const orderedQuestions =
        buildMode === 'progressive'
          ? [...matchedQuestions].sort((left, right) => left.level - right.level)
          : shuffle(matchedQuestions)
      const questions = orderedQuestions.slice(0, Math.min(questionCount, orderedQuestions.length))
      const sessionId = crypto.randomUUID()

      createSession({
        sessionId,
        title: `Ôn chuyên đề - ${topic.title}`,
        subjectId: 'TOAN',
        subjectName: 'Toán học',
        topicId: `knowledge-review/${topic.key}`,
        topicName: topic.title,
        difficultyLevel: resolveAverageDifficulty(questions),
        difficultyLabel: buildDifficultyLabel(difficultyFilter, buildMode),
        durationMinutes: Math.max(15, Math.min(60, questions.length * 3)),
        questions,
        deliveryMode: 'local_mock',
        createdAt: Date.now(),
      })

      navigate(`/exam/${sessionId}`)
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Không thể tạo bài ôn chuyên đề lúc này.')
    } finally {
      setIsCreatingExam(false)
    }
  }

  function handleReviewFlaggedQuestions() {
    if (!topic || relatedFlaggedQuestions.length === 0) {
      setActionError('Chưa có câu sai nào thuộc chuyên đề này được cắm cờ.')
      return
    }

    const questions = relatedFlaggedQuestions.map((item) => item.question)
    const sessionId = crypto.randomUUID()

    createSession({
      sessionId,
      title: `Làm lại câu sai - ${topic.title}`,
      subjectId: relatedFlaggedQuestions[0]?.subjectId ?? 'TOAN',
      subjectName: relatedFlaggedQuestions[0]?.subjectName ?? 'Toán học',
      topicId: `flagged/${topic.key}`,
      topicName: topic.title,
      difficultyLevel: resolveAverageDifficulty(questions),
      difficultyLabel: 'Câu sai đã cắm cờ',
      durationMinutes: Math.max(15, Math.min(60, questions.length * 3)),
      questions,
      deliveryMode: 'local_mock',
      createdAt: Date.now(),
    })

    navigate(`/exam/${sessionId}`)
  }

  if (!topic) {
    return (
      <PageCard title="Chưa tìm thấy chuyên đề" description="Chọn một chuyên đề ôn tập có trong kho kiến thức.">
        <div className="grid gap-3">
          {knowledgeReviewTopics.map((item) => (
            <Link
              className="rounded-[20px] border border-slate-200 bg-white px-4 py-4 text-sm font-bold text-slate-800 transition hover:border-sky-300 hover:text-sky-700"
              key={item.key}
              to={`/knowledge-review/${item.key}`}
            >
              {item.title}
            </Link>
          ))}
        </div>
      </PageCard>
    )
  }

  return (
    <section className="space-y-6">
      <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
        <Link className="text-sm font-bold text-sky-700" to="/practice">
          Quay lại khu ôn tập
        </Link>
        <div className="mt-4 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-3xl">
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
              Ôn tập kiến thức theo điểm yếu
            </div>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 md:text-4xl">
              {topic.title}
            </h1>
            <p className="mt-3 text-base leading-7 text-slate-600">{topic.summary}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
              disabled={isCreatingExam}
              onClick={() => void handleCreateTopicExam()}
              type="button"
            >
              {isCreatingExam ? 'Đang tạo bài ôn...' : 'Tạo bài ôn theo lựa chọn'}
            </button>
            <button
              className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-sky-300 hover:bg-white disabled:cursor-not-allowed disabled:text-slate-400"
              disabled={relatedFlaggedQuestions.length === 0}
              onClick={handleReviewFlaggedQuestions}
              type="button"
            >
              Làm lại câu sai ({relatedFlaggedQuestions.length})
            </button>
          </div>
        </div>
        {actionError ? <p className="mt-4 text-sm font-semibold text-rose-700">{actionError}</p> : null}
      </div>

      <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_18px_52px_rgba(15,23,42,0.05)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
              Tùy chỉnh bài ôn
            </div>
            <h2 className="mt-2 text-xl font-extrabold text-slate-950">
              Chọn mức độ, dạng câu và số câu
            </h2>
          </div>
          <div className="rounded-full border border-sky-100 bg-sky-50 px-4 py-2 text-xs font-bold text-sky-700">
            Mặc định: tự động theo điểm yếu
          </div>
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_1fr_180px]">
          <FilterGroup label="Mức độ">
            <SegmentButton active={difficultyFilter === 'auto'} onClick={() => setDifficultyFilter('auto')}>
              Tự động
            </SegmentButton>
            <SegmentButton active={difficultyFilter === '1'} onClick={() => setDifficultyFilter('1')}>
              Nhận biết
            </SegmentButton>
            <SegmentButton active={difficultyFilter === '2'} onClick={() => setDifficultyFilter('2')}>
              Thông hiểu
            </SegmentButton>
            <SegmentButton active={difficultyFilter === '3'} onClick={() => setDifficultyFilter('3')}>
              Vận dụng
            </SegmentButton>
            <SegmentButton active={difficultyFilter === '4'} onClick={() => setDifficultyFilter('4')}>
              VDC
            </SegmentButton>
          </FilterGroup>

          <FilterGroup label="Dạng câu">
            <SegmentButton active={questionTypeFilter === 'all'} onClick={() => setQuestionTypeFilter('all')}>
              Tất cả
            </SegmentButton>
            <SegmentButton active={questionTypeFilter === 'multiple_choice'} onClick={() => setQuestionTypeFilter('multiple_choice')}>
              Trắc nghiệm
            </SegmentButton>
            <SegmentButton active={questionTypeFilter === 'true_false'} onClick={() => setQuestionTypeFilter('true_false')}>
              Đúng/Sai
            </SegmentButton>
            <SegmentButton active={questionTypeFilter === 'short_answer'} onClick={() => setQuestionTypeFilter('short_answer')}>
              TLN
            </SegmentButton>
          </FilterGroup>

          <label className="grid gap-2 text-sm font-bold text-slate-700">
            Số câu
            <select
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-sky-300 focus:bg-white"
              onChange={(event) => setQuestionCount(Number(event.target.value))}
              value={questionCount}
            >
              <option value={8}>8 câu</option>
              <option value={12}>12 câu</option>
              <option value={16}>16 câu</option>
              <option value={22}>22 câu</option>
            </select>
          </label>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            className={`rounded-2xl border px-4 py-3 text-sm font-bold transition ${
              buildMode === 'mixed'
                ? 'border-slate-950 bg-slate-950 text-white'
                : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-sky-300 hover:bg-white'
            }`}
            onClick={() => setBuildMode('mixed')}
            type="button"
          >
            Trộn câu ngẫu nhiên
          </button>
          <button
            className={`rounded-2xl border px-4 py-3 text-sm font-bold transition ${
              buildMode === 'progressive'
                ? 'border-slate-950 bg-slate-950 text-white'
                : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-sky-300 hover:bg-white'
            }`}
            onClick={() => setBuildMode('progressive')}
            type="button"
          >
            Luyện từ dễ đến khó
          </button>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[280px_1fr_320px]">
        <aside className="rounded-[30px] border border-slate-200 bg-white p-5 shadow-[0_18px_46px_rgba(15,23,42,0.05)]">
          <div className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
            Lộ trình bài học
          </div>
          <div className="mt-4 grid gap-3">
            {topic.lessons.map((lesson, index) => (
              <button
                className={`rounded-2xl border px-4 py-4 text-left transition ${
                  selectedLesson?.lessonKey === lesson.lessonKey
                    ? 'border-slate-950 bg-slate-950 text-white'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-sky-300 hover:bg-white'
                }`}
                key={lesson.lessonKey}
                onClick={() => setSelectedLessonKey(lesson.lessonKey)}
                type="button"
              >
                <div className="text-xs font-bold uppercase tracking-[0.14em] opacity-70">
                  Bài {index + 1} | {lesson.estimatedMinutes} phút
                </div>
                <div className="mt-2 text-sm font-extrabold">{lesson.title}</div>
              </button>
            ))}
          </div>
        </aside>

        <article className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
          {selectedLesson ? (
            <>
              <div className="mb-5 rounded-[22px] border border-sky-100 bg-sky-50 px-5 py-4">
                <div className="text-xs font-bold uppercase tracking-[0.16em] text-sky-700">
                  Đang học
                </div>
                <h2 className="mt-2 text-2xl font-extrabold text-slate-950">{selectedLesson.title}</h2>
              </div>
              <MarkdownContent content={selectedLesson.content} className="text-base leading-8" />
            </>
          ) : null}
        </article>

        <aside className="rounded-[30px] border border-slate-200 bg-slate-50 p-6">
          <div className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
            Nguồn knowledge-base
          </div>
          <div className="mt-4 grid gap-3">
            {topic.sourcePaths.map((sourcePath) => (
              <div
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold leading-6 text-slate-600"
                key={sourcePath}
                title={sourcePath}
              >
                <span className="block truncate">{sourcePath}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-4">
            <div className="text-sm font-extrabold text-emerald-800">Ôn tập thật nằm ở đâu?</div>
            <p className="mt-2 text-sm leading-7 text-emerald-900">
              Đọc bài ở khung giữa, chọn mức độ và dạng câu, sau đó bấm “Tạo bài ôn theo lựa chọn”
              để làm câu hỏi thật lấy từ ngân hàng đề trường có cùng topic/source path.
            </p>
          </div>
        </aside>
      </div>
    </section>
  )
}

function FilterGroup({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div className="grid gap-2">
      <div className="text-sm font-bold text-slate-700">{label}</div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  )
}

function SegmentButton({
  active,
  children,
  onClick,
}: {
  active: boolean
  children: ReactNode
  onClick: () => void
}) {
  return (
    <button
      className={`rounded-2xl border px-3.5 py-2.5 text-sm font-bold transition ${
        active
          ? 'border-slate-950 bg-slate-950 text-white'
          : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-sky-300 hover:bg-white'
      }`}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  )
}

function isQuestionRelatedToTopic(question: SchoolExamQuestionRecord, topic: KnowledgeReviewTopic) {
  return inferKnowledgeReviewTopics([
    question.topic,
    question.obsidianSourcePath,
    question.questionText,
  ]).some((matchedTopic) => matchedTopic.key === topic.key)
}

function matchesDifficultyFilter(question: SchoolExamQuestionRecord, filter: DifficultyFilter) {
  return filter === 'auto' || question.difficultyLevel === Number(filter)
}

function matchesQuestionTypeFilter(question: SchoolExamQuestionRecord, filter: QuestionTypeFilter) {
  return filter === 'all' || question.questionType === filter
}

function mapSchoolExamQuestionToDraftQuestion(question: SchoolExamQuestionRecord): DraftQuestion {
  return {
    questionId: question.questionId,
    topicId: `school-exam/${question.topic || question.questionType}`,
    content: question.questionText,
    level: question.difficultyLevel,
    questionType: question.questionType,
    explanation: null,
    obsidianSourcePath: question.obsidianSourcePath,
    answers: question.options.map((option) => ({
      answerId: `${question.questionId}-opt-${option.optionLabel.toLowerCase()}`,
      optionLabel: option.optionLabel,
      content: option.optionText,
      isCorrect:
        question.questionType === 'multiple_choice'
          ? option.optionLabel.toUpperCase() === (question.answerValue ?? '').trim().toUpperCase()
          : false,
      explanation: null,
      displayOrder: option.displayOrder,
    })),
    statements:
      question.questionType === 'true_false'
        ? question.statements.map((statement, index) => ({
            statementId: `${question.questionId}-stmt-${statement.label || index + 1}`,
            content: statement.text,
            isCorrect: (question.answerValue ?? '').replace(/\s+/g, '').toUpperCase()[index] === 'D',
          }))
        : undefined,
    acceptedResponses:
      question.questionType === 'short_answer'
        ? (question.answerValue ?? '').split('|').map((item) => item.trim()).filter(Boolean)
        : undefined,
    assetUrls: buildAssetUrls(question),
    sourceMeta: {
      examId: question.examId,
      schoolName: question.schoolName,
      examTitle: question.examTitle,
      year: question.year,
      sourceQuestionNumber: question.sourceQuestionNumber,
      sourceSectionNumber: question.sourceSectionNumber,
    },
  }
}

function buildAssetUrls(question: SchoolExamQuestionRecord) {
  const pdfUrl = question.pdfUrl ?? ''
  if (!pdfUrl) {
    return []
  }

  const examSlug = pdfUrl.split('/').pop()?.replace(/\.pdf$/i, '') ?? ''
  const renderableAssets = question.assets && question.assets.length > 0
    ? question.assets.filter((asset) => asset.assetType !== 'question_block').map((asset) => asset.assetPath)
    : question.assetPaths.filter((assetPath) => /_hinh\d+\./i.test(assetPath))

  return renderableAssets.map((assetPath) => `/school-exam-assets/${examSlug}/${assetPath}`)
}

function buildDifficultyLabel(filter: DifficultyFilter, buildMode: BuildMode) {
  const filterLabel = {
    auto: 'Tự động theo điểm yếu',
    '1': 'Nhận biết',
    '2': 'Thông hiểu',
    '3': 'Vận dụng',
    '4': 'Vận dụng cao',
  }[filter]
  return buildMode === 'progressive' ? `${filterLabel} | từ dễ đến khó` : filterLabel
}

function resolveAverageDifficulty(questions: DraftQuestion[]) {
  const average =
    Math.round(questions.reduce((sum, question) => sum + Number(question.level || 1), 0) / questions.length) || 1
  return Math.min(4, Math.max(1, average))
}

function shuffle<T>(items: T[]) {
  const nextItems = [...items]
  for (let index = nextItems.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[nextItems[index], nextItems[swapIndex]] = [nextItems[swapIndex], nextItems[index]]
  }
  return nextItems
}
