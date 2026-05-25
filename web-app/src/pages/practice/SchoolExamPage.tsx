import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { PageCard } from '../../components/ui/PageCard'
import { MarkdownContent } from '../../components/ui/MarkdownContent'
import {
  fetchSchoolExamAnswerKey,
  fetchSchoolExamById,
  fetchSchoolExamQuestions,
  normalizeAnswer,
} from '../../features/practice/services/school-exam-service'
import {
  requestAutoExplanation,
  sendExamChatMessage,
  requestWeaknessAnalysis,
} from '../../features/exam/services/exam-ai-service'
import type {
  SchoolExamAnswerKeyEntry,
  SchoolExamPaperRecord,
  SchoolExamQuestionRecord,
} from '../../features/practice/types/school-exam-types'
import { RecommendedReviewLinks } from '../../features/review/components/RecommendedReviewLinks'
import {
  inferKnowledgeReviewTopics,
  type KnowledgeReviewTopic,
} from '../../features/review/knowledge-review-topics'

type QuestionSelectionMap = Record<string, string>
type TrueFalseSelectionMap = Record<string, Record<string, boolean>>
type ReviewItem = {
  questionNumber: number
  partCode: 'multiple_choice' | 'true_false' | 'short_answer'
  displayQuestionLabel: string
  selectedAnswer: string
  correctAnswer: string
  correct: boolean
  questionContent: string
  topic: string
  obsidianSourcePath: string
  explanation: string
  assetUrls: string[]
}

type ReviewChatMessage = {
  role: 'user' | 'ai'
  content: string
}

export function SchoolExamPage() {
  const { examId = '' } = useParams()
  const [exam, setExam] = useState<SchoolExamPaperRecord | null>(null)
  const [isLoadingExam, setIsLoadingExam] = useState(true)
  const [isLoadingAnswerKey, setIsLoadingAnswerKey] = useState(false)
  const [loadErrorMessage, setLoadErrorMessage] = useState('')
  const [remainingSeconds, setRemainingSeconds] = useState(0)
  const [selectedChoices, setSelectedChoices] = useState<QuestionSelectionMap>({})
  const [selectedTrueFalse, setSelectedTrueFalse] = useState<TrueFalseSelectionMap>({})
  const [shortAnswers, setShortAnswers] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [selectedVariantId, setSelectedVariantId] = useState('')
  const [answerKeyEntries, setAnswerKeyEntries] = useState<SchoolExamAnswerKeyEntry[]>([])
  const [questionRecords, setQuestionRecords] = useState<SchoolExamQuestionRecord[]>([])
  const [isAiBusyByQuestion, setIsAiBusyByQuestion] = useState<Record<number, boolean>>({})
  const [aiExplanationByQuestion, setAiExplanationByQuestion] = useState<Record<number, string>>({})
  const [aiErrorByQuestion, setAiErrorByQuestion] = useState<Record<number, string>>({})
  const [isAnalyzingWeaknesses, setIsAnalyzingWeaknesses] = useState(false)
  const [weaknessAnalysis, setWeaknessAnalysis] = useState('')
  const [recommendedTopics, setRecommendedTopics] = useState<KnowledgeReviewTopic[]>([])
  const [weaknessAnalysisError, setWeaknessAnalysisError] = useState('')
  const [selectedReviewQuestionNumber, setSelectedReviewQuestionNumber] = useState<number | null>(null)
  const [selectedReviewChatInput, setSelectedReviewChatInput] = useState('')
  const [aiChatHistoryByQuestion, setAiChatHistoryByQuestion] = useState<Record<number, ReviewChatMessage[]>>({})

  useEffect(() => {
    let isMounted = true
    setIsLoadingExam(true)
    setLoadErrorMessage('')

    void fetchSchoolExamById(examId)
      .then((data) => {
        if (!isMounted) {
          return
        }

        setExam(data)
        setSelectedVariantId(data?.variants[0]?.variantId ?? '')
        setSelectedChoices({})
        setSelectedTrueFalse({})
        setShortAnswers({})
        setSubmitted(false)
        setAnswerKeyEntries([])
        setQuestionRecords([])
        setAiExplanationByQuestion({})
        setAiErrorByQuestion({})
        setWeaknessAnalysis('')
        setRecommendedTopics([])
        setWeaknessAnalysisError('')
        setSelectedReviewQuestionNumber(null)
        setSelectedReviewChatInput('')
        setAiChatHistoryByQuestion({})
      })
      .catch((error: unknown) => {
        if (isMounted) {
          setLoadErrorMessage(error instanceof Error ? error.message : 'Khong the tai de truong.')
          setExam(null)
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingExam(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [examId])

  useEffect(() => {
    if (!exam) {
      return
    }

    setRemainingSeconds(exam.durationMinutes * 60)
  }, [exam])

  useEffect(() => {
    if (!exam || !selectedVariantId) {
      return
    }

    let isMounted = true
    setIsLoadingAnswerKey(true)
    setLoadErrorMessage('')

    void fetchSchoolExamAnswerKey(selectedVariantId)
      .then((entries) => {
        if (isMounted) {
          setAnswerKeyEntries(entries)
        }
      })
      .catch((error: unknown) => {
        if (isMounted) {
          setLoadErrorMessage(error instanceof Error ? error.message : 'Khong the tai answer key.')
          setAnswerKeyEntries([])
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingAnswerKey(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [exam, selectedVariantId])

  useEffect(() => {
    if (!exam) {
      return
    }

    let isMounted = true

    void fetchSchoolExamQuestions(exam.examId)
      .then((entries) => {
        if (isMounted) {
          setQuestionRecords(entries)
        }
      })
      .catch((error: unknown) => {
        if (isMounted) {
          setLoadErrorMessage(
            error instanceof Error ? error.message : 'Khong the tai noi dung cau hoi de truong.',
          )
          setQuestionRecords([])
        }
      })

    return () => {
      isMounted = false
    }
  }, [exam])

  useEffect(() => {
    if (!exam || submitted || remainingSeconds <= 0) {
      return
    }

    const timerId = window.setInterval(() => {
      setRemainingSeconds((value) => Math.max(0, value - 1))
    }, 1000)

    return () => window.clearInterval(timerId)
  }, [exam, remainingSeconds, submitted])

  const answerKeyByQuestionNumber = useMemo(() => {
    return answerKeyEntries.reduce<Record<number, string>>((acc, item) => {
      acc[item.questionNumber] = item.answerValue
      return acc
    }, {})
  }, [answerKeyEntries])

  const sectionsByPart = useMemo(() => {
    const sections = exam?.sections ?? []
    return {
      multipleChoice: sections.filter((section) => section.partCode === 'multiple_choice'),
      trueFalse: sections.filter((section) => section.partCode === 'true_false'),
      shortAnswer: sections.filter((section) => section.partCode === 'short_answer'),
    }
  }, [exam])

  const questionRecordByNumber = useMemo(() => {
    return questionRecords.reduce<Record<number, SchoolExamQuestionRecord>>((acc, item) => {
      acc[item.questionNumber] = item
      return acc
    }, {})
  }, [questionRecords])

  const summary = useMemo(() => {
    if (!exam) {
      return null
    }

    let correctCount = 0
    let answeredCount = 0
    let totalCount = 0

    for (const section of exam.sections) {
      for (const questionNumber of buildQuestionNumbers(section.startQuestionNumber, section.endQuestionNumber)) {
        totalCount += 1
        const questionKey = String(questionNumber)
        const answerKeyValue = answerKeyByQuestionNumber[questionNumber] ?? ''

        if (section.partCode === 'multiple_choice') {
          const selected = selectedChoices[questionKey]
          if (selected) {
            answeredCount += 1
          }
          if (selected && selected === answerKeyValue) {
            correctCount += 1
          }
          continue
        }

        if (section.partCode === 'true_false') {
          const labels = buildStatementLabels(section.statementCount)
          const selectedMap = selectedTrueFalse[questionKey] ?? {}
          const fullyAnswered = labels.every((label) => label in selectedMap)

          if (fullyAnswered) {
            answeredCount += 1
          }

          if (fullyAnswered && labels.length > 0) {
            const normalizedKey = normalizeTrueFalseAnswer(answerKeyValue)
            const isCorrect = labels.every((label, index) => {
              const expected = normalizedKey[index] === 'D'
              return selectedMap[label] === expected
            })
            if (normalizedKey.length === labels.length && isCorrect) {
              correctCount += 1
            }
          }
          continue
        }

        const value = shortAnswers[questionKey]?.trim() ?? ''
        if (value) {
          answeredCount += 1
        }

        if (value) {
          const acceptedResponses = splitAcceptedResponses(answerKeyValue)
          if (acceptedResponses.some((candidate) => normalizeAnswer(candidate) === normalizeAnswer(value))) {
            correctCount += 1
          }
        }
      }
    }

    return {
      answeredCount,
      correctCount,
      totalCount,
      score: totalCount > 0 ? Math.round((correctCount / totalCount) * 10 * 100) / 100 : 0,
    }
  }, [answerKeyByQuestionNumber, exam, selectedChoices, selectedTrueFalse, shortAnswers])

  const reviewItems = useMemo<ReviewItem[]>(() => {
    if (!exam) {
      return []
    }

    const items: ReviewItem[] = []

    for (const section of exam.sections) {
      for (const questionNumber of buildQuestionNumbers(section.startQuestionNumber, section.endQuestionNumber)) {
        const questionKey = String(questionNumber)
        const correctAnswer = formatAnswerKeyValue(answerKeyByQuestionNumber[questionNumber] ?? '--')
        const record = questionRecordByNumber[questionNumber]
        const displayQuestionLabel = buildDisplayQuestionLabel(section, questionNumber)
        const questionContent = buildQuestionContent(record, displayQuestionLabel)
        const topic = record?.topic ?? ''
        const obsidianSourcePath = record?.obsidianSourcePath ?? ''
        const explanation = aiExplanationByQuestion[questionNumber] ?? ''
        const assetUrls = buildRenderableAssetPaths(record).map((assetPath) =>
          buildSchoolExamAssetUrl(exam.pdfUrl, assetPath),
        )

        if (section.partCode === 'multiple_choice') {
          const selectedAnswer = selectedChoices[questionKey] ?? 'Chua chon'
          items.push({
            questionNumber,
            partCode: section.partCode,
            displayQuestionLabel,
            selectedAnswer,
            correctAnswer,
            correct: selectedChoices[questionKey] === (answerKeyByQuestionNumber[questionNumber] ?? ''),
            questionContent,
            topic,
            obsidianSourcePath,
            explanation,
            assetUrls,
          })
          continue
        }

        if (section.partCode === 'true_false') {
          const labels = buildStatementLabels(section.statementCount)
          const selectedMap = selectedTrueFalse[questionKey] ?? {}
          const selectedAnswer = labels
            .map((label) => {
              const value = selectedMap[label]
              if (value === true) {
                return 'D'
              }
              if (value === false) {
                return 'S'
              }
              return '-'
            })
            .join('')
          const normalizedKey = normalizeTrueFalseAnswer(answerKeyByQuestionNumber[questionNumber] ?? '')
          const correct =
            labels.length > 0 &&
            labels.every((label, index) => {
              const expected = normalizedKey[index] === 'D'
              return selectedMap[label] === expected
            })

          items.push({
            questionNumber,
            partCode: section.partCode,
            displayQuestionLabel,
            selectedAnswer,
            correctAnswer,
            correct,
            questionContent,
            topic,
            obsidianSourcePath,
            explanation,
            assetUrls,
          })
          continue
        }

        const selectedAnswer = shortAnswers[questionKey]?.trim() || 'Chua nhap'
        const acceptedResponses = splitAcceptedResponses(answerKeyByQuestionNumber[questionNumber] ?? '')
        items.push({
          questionNumber,
          partCode: section.partCode,
          displayQuestionLabel,
          selectedAnswer,
          correctAnswer,
          correct: acceptedResponses.some((candidate) => normalizeAnswer(candidate) === normalizeAnswer(selectedAnswer)),
          questionContent,
          topic,
          obsidianSourcePath,
          explanation,
          assetUrls,
        })
      }
    }

    return items
  }, [aiExplanationByQuestion, answerKeyByQuestionNumber, exam, questionRecords, selectedChoices, selectedTrueFalse, shortAnswers])

  const wrongReviewItems = useMemo(
    () => reviewItems.filter((item) => !item.correct),
    [reviewItems],
  )

  const selectedReviewItem = useMemo(() => {
    if (selectedReviewQuestionNumber === null) {
      return null
    }
    return reviewItems.find((item) => item.questionNumber === selectedReviewQuestionNumber) ?? null
  }, [reviewItems, selectedReviewQuestionNumber])

  async function handleExplainWrongAnswer(item: ReviewItem) {
    if (!item.questionContent.trim()) {
      setAiErrorByQuestion((state) => ({
        ...state,
        [item.questionNumber]: 'Chua co noi dung cau hoi de gui sang AI.',
      }))
      return
    }

    setIsAiBusyByQuestion((state) => ({ ...state, [item.questionNumber]: true }))
    setAiErrorByQuestion((state) => ({ ...state, [item.questionNumber]: '' }))

    try {
      const explanation = await requestAutoExplanation({
        questionContent: item.questionContent,
        selectedAnswer: item.selectedAnswer,
        correctAnswer: item.correctAnswer,
        obsidianSourcePath: item.obsidianSourcePath,
      })

      setAiExplanationByQuestion((state) => ({
        ...state,
        [item.questionNumber]: explanation,
      }))
      setAiChatHistoryByQuestion((state) => ({
        ...state,
        [item.questionNumber]: [
          ...(state[item.questionNumber] ?? []),
          { role: 'user', content: `Vi sao ${item.displayQuestionLabel.toLowerCase()} em lam sai?` },
          { role: 'ai', content: explanation },
        ],
      }))
    } catch (error) {
      setAiErrorByQuestion((state) => ({
        ...state,
        [item.questionNumber]:
          error instanceof Error ? error.message : 'Khong the lay giai thich tu AI luc nay.',
      }))
    } finally {
      setIsAiBusyByQuestion((state) => ({ ...state, [item.questionNumber]: false }))
    }
  }

  async function handleSendReviewChat(item: ReviewItem) {
    const trimmed = selectedReviewChatInput.trim()
    if (!trimmed) {
      return
    }

    setIsAiBusyByQuestion((state) => ({ ...state, [item.questionNumber]: true }))
    setAiErrorByQuestion((state) => ({ ...state, [item.questionNumber]: '' }))
    setAiChatHistoryByQuestion((state) => ({
      ...state,
      [item.questionNumber]: [...(state[item.questionNumber] ?? []), { role: 'user', content: trimmed }],
    }))
    setSelectedReviewChatInput('')

    try {
      const explanation = await sendExamChatMessage({
        questionContent: item.questionContent,
        selectedAnswer: item.selectedAnswer,
        correctAnswer: item.correctAnswer,
        prompt: trimmed,
        obsidianSourcePath: item.obsidianSourcePath,
      })

      setAiChatHistoryByQuestion((state) => ({
        ...state,
        [item.questionNumber]: [...(state[item.questionNumber] ?? []), { role: 'ai', content: explanation }],
      }))
    } catch (error) {
      setAiErrorByQuestion((state) => ({
        ...state,
        [item.questionNumber]:
          error instanceof Error ? error.message : 'Khong the gui cau hoi toi AI luc nay.',
      }))
    } finally {
      setIsAiBusyByQuestion((state) => ({ ...state, [item.questionNumber]: false }))
    }
  }

  async function handleAnalyzeWeaknesses() {
    if (wrongReviewItems.length === 0) {
      setWeaknessAnalysis('Ban khong co cau sai nao trong bai nay.')
      setRecommendedTopics([])
      setWeaknessAnalysisError('')
      return
    }

    setIsAnalyzingWeaknesses(true)
    setWeaknessAnalysisError('')

    try {
      const result = await requestWeaknessAnalysis(
        wrongReviewItems.map((item) => ({
          questionId: String(item.questionNumber),
          questionContent: item.questionContent || item.displayQuestionLabel,
          topic: item.topic || exam?.subjectName || 'Chua xac dinh chuyen de',
          userAnswer: item.selectedAnswer,
          correctAnswer: item.correctAnswer,
        })),
      )
      setWeaknessAnalysis(result)
      setRecommendedTopics(
        inferKnowledgeReviewTopics(
          wrongReviewItems.flatMap((item) => [
            item.topic,
            item.obsidianSourcePath,
            item.questionContent,
            result,
          ]),
        ),
      )
    } catch (error) {
      setWeaknessAnalysisError(
        error instanceof Error ? error.message : 'Khong the lay phan tich tong quan luc nay.',
      )
    } finally {
      setIsAnalyzingWeaknesses(false)
    }
  }

  if (isLoadingExam) {
    return (
      <PageCard title="Dang tai de truong" description="He thong dang doc metadata, PDF va danh sach ma de tu Supabase.">
        <p style={styles.text}>Dang tai du lieu...</p>
      </PageCard>
    )
  }

  if (!exam) {
    return (
      <PageCard title="Khong tim thay de truong" description="Exam id nay chua duoc khai bao trong kho du lieu.">
        <p style={styles.text}>
          {loadErrorMessage || 'Quay lai '}
          <Link to="/practice">practice hub</Link>
          {!loadErrorMessage ? ' de chon de khac.' : null}
        </p>
      </PageCard>
    )
  }

  const selectedVariant = exam.variants.find((variant) => variant.variantId === selectedVariantId) ?? null

  if (submitted && summary) {
    return (
      <section className="space-y-6">
        <div className="rounded-[28px] border border-emerald-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                Tong ket bai lam
              </div>
              <h1 className="mt-2 text-3xl font-extrabold text-slate-950">{exam.examTitle}</h1>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                {exam.schoolName} | {selectedVariant?.variantCode ?? '--'} | Da khoa bai lam
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <MetricPill label="Diem" value={`${summary.score}/10`} />
              <MetricPill label="So cau dung" value={`${summary.correctCount}/${summary.totalCount}`} />
              <MetricPill label="Da tra loi" value={`${summary.answeredCount}/${summary.totalCount}`} />
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
            <h2 className="text-xl font-bold text-slate-950">Thong ke nhanh</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <SummaryTile label="Dung" value={`${summary.correctCount}`} tone="emerald" />
              <SummaryTile label="Sai" value={`${wrongReviewItems.length}`} tone="rose" />
              <SummaryTile label="Bo qua" value={`${summary.totalCount - summary.answeredCount}`} tone="slate" />
              <SummaryTile label="Ma de" value={selectedVariant?.variantCode ?? '--'} tone="sky" />
            </div>

            <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
              <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-slate-700">
                Ghi chu AI
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                AI co the giai thich tung cau sai va phan tich tong quan diem yeu dua tren noi dung cau hoi,
                topic va obsidian source path da luu trong database.
              </p>
            </div>

            <div className="mt-6 rounded-[24px] border border-slate-200 bg-white p-5">
              <button
                className="rounded-2xl bg-sky-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:bg-slate-300"
                disabled={isAnalyzingWeaknesses}
                onClick={() => void handleAnalyzeWeaknesses()}
                type="button"
              >
                {isAnalyzingWeaknesses ? 'AI dang phan tich...' : 'AI phan tich tong quan diem yeu'}
              </button>
              {weaknessAnalysis ? (
                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <MarkdownContent content={weaknessAnalysis} />
                  <RecommendedReviewLinks topics={recommendedTopics} />
                </div>
              ) : null}
              {weaknessAnalysisError ? (
                <p className="mt-4 text-sm font-medium text-rose-700">{weaknessAnalysisError}</p>
              ) : null}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
                to="/practice"
              >
                Quay lai thu vien de
              </Link>
              <a
                className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-white"
                href={exam.pdfUrl}
                rel="noreferrer"
                target="_blank"
              >
                Mo lai PDF
              </a>
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-bold text-slate-950">Chi tiet ket qua</h2>
              <div className="text-sm text-slate-500">{reviewItems.length} cau</div>
            </div>

            <p className="mt-3 text-sm leading-7 text-slate-600">
              Bam vao tung cau de mo tab review. Tab nay hien cau hoi, hinh anh lien quan, dap an hoc sinh chon
              va khung tro chuyen voi AI.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              {reviewItems.map((item) => (
                <button
                  key={`${item.partCode}-${item.questionNumber}`}
                  className={`rounded-2xl border px-4 py-3 text-left transition ${
                    selectedReviewItem?.questionNumber === item.questionNumber
                      ? 'border-slate-950 bg-slate-950 text-white'
                      : item.correct
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:border-emerald-300'
                        : 'border-rose-200 bg-rose-50 text-rose-800 hover:border-rose-300'
                  }`}
                  onClick={() => setSelectedReviewQuestionNumber(item.questionNumber)}
                  type="button"
                >
                  <div className="text-sm font-bold">{item.displayQuestionLabel}</div>
                  <div className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] opacity-80">
                    {item.correct ? 'Dung' : 'Sai'} | {formatPartLabel(item.partCode)}
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>

        {selectedReviewItem ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 py-6 backdrop-blur-sm">
            <div className="flex h-[92vh] w-full max-w-[1320px] flex-col overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_40px_120px_rgba(15,23,42,0.24)]">
              <div className="shrink-0 flex items-center justify-between gap-4 border-b border-slate-200 px-6 py-5">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Review cau hoi
                  </div>
                  <h2 className="mt-2 text-2xl font-extrabold text-slate-950">
                    {selectedReviewItem.displayQuestionLabel} | {formatPartLabel(selectedReviewItem.partCode)}
                  </h2>
                </div>
                <button
                  aria-label="Dong tab review"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-lg font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                  onClick={() => {
                    setSelectedReviewQuestionNumber(null)
                    setSelectedReviewChatInput('')
                  }}
                  type="button"
                >
                  X
                </button>
              </div>

              <div className="grid min-h-0 flex-1 gap-0 overflow-hidden xl:grid-cols-[1.05fr_0.95fr]">
                <section className="min-h-0 overflow-y-auto border-b border-slate-200 bg-slate-50 p-6 xl:border-b-0 xl:border-r">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div
                      className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] ${
                        selectedReviewItem.correct
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {selectedReviewItem.correct ? 'Dung' : 'Sai'}
                    </div>
                    <div className="text-sm leading-7 text-slate-600">
                      Topic: {selectedReviewItem.topic || 'Chua gan topic'}
                    </div>
                  </div>

                  <div className="mt-5 rounded-[24px] border border-slate-200 bg-white p-5">
                    <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                      Noi dung cau hoi
                    </div>
                    <div className="mt-3 text-base leading-8 text-slate-800">
                      <MarkdownContent
                        content={selectedReviewItem.questionContent || 'Chua co noi dung cau hoi.'}
                        className="text-base leading-8 text-slate-800"
                      />
                    </div>
                  </div>

                  {selectedReviewItem.assetUrls.length > 0 ? (
                    <div className="mt-5 grid gap-4">
                      {selectedReviewItem.assetUrls.map((assetUrl, index) => (
                        <div
                          key={`${selectedReviewItem.questionNumber}-${assetUrl}`}
                          className="overflow-hidden rounded-[24px] border border-slate-200 bg-white"
                        >
                          <img
                            alt={`${selectedReviewItem.displayQuestionLabel} hinh ${index + 1}`}
                            className="h-auto w-full object-contain"
                            src={assetUrl}
                          />
                        </div>
                      ))}
                    </div>
                  ) : null}

                  <div className="mt-5 grid gap-3 md:grid-cols-2">
                    <div className="rounded-[22px] border border-slate-200 bg-white px-4 py-4">
                      <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                        Lua chon cua hoc sinh
                      </div>
                      <div className="mt-2 text-lg font-bold text-slate-950">{selectedReviewItem.selectedAnswer}</div>
                    </div>
                    <div className="rounded-[22px] border border-slate-200 bg-white px-4 py-4">
                      <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                        Dap an dung
                      </div>
                      <div className="mt-2 text-lg font-bold text-slate-950">{selectedReviewItem.correctAnswer}</div>
                    </div>
                  </div>
                </section>

                <section className="flex min-h-0 flex-col overflow-hidden bg-white p-6">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-bold text-slate-950">Tro chuyen voi AI</h3>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        AI doc cau hoi, dap an da chon, dap an dung va file kien thuc lien quan de giai thich.
                      </p>
                    </div>
                    {!selectedReviewItem.correct ? (
                      <button
                        className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                        disabled={Boolean(isAiBusyByQuestion[selectedReviewItem.questionNumber])}
                        onClick={() => void handleExplainWrongAnswer(selectedReviewItem)}
                        type="button"
                      >
                        {isAiBusyByQuestion[selectedReviewItem.questionNumber]
                          ? 'Dang giai thich...'
                          : 'Giai thich cau sai'}
                      </button>
                    ) : null}
                  </div>

                  <div className="mt-5 min-h-0 flex-1 overflow-y-auto rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                    <div className="space-y-4">
                      {(aiChatHistoryByQuestion[selectedReviewItem.questionNumber] ?? []).length === 0 ? (
                        <div className="text-sm leading-7 text-slate-500">
                          Chua co hoi thoai nao. Bam "Giai thich cau sai" hoac hoi them de AI phan tich sau hon.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {(aiChatHistoryByQuestion[selectedReviewItem.questionNumber] ?? []).map((message, index) => (
                            <div
                              key={`${selectedReviewItem.questionNumber}-${index}-${message.role}`}
                              className={`rounded-2xl px-4 py-3 text-sm leading-7 ${
                                message.role === 'user'
                                  ? 'ml-8 border border-slate-200 bg-white text-slate-900'
                                  : 'mr-8 border border-sky-200 bg-sky-50 text-slate-800'
                              }`}
                            >
                              <div className="mb-1 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                                {message.role === 'user' ? 'Hoc sinh' : 'AI gia su'}
                              </div>
                              {message.role === 'user' ? (
                                <MarkdownContent content={message.content} className="text-sm leading-7" />
                              ) : (
                                <MarkdownContent content={message.content} />
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                    </div>
                  </div>

                  <div className="mt-4 shrink-0 space-y-4 border-t border-slate-200 bg-white pt-4">
                    {aiErrorByQuestion[selectedReviewItem.questionNumber] ? (
                      <p className="text-sm font-medium text-rose-700">
                        {aiErrorByQuestion[selectedReviewItem.questionNumber]}
                      </p>
                    ) : null}

                    <div className="flex gap-3">
                    <input
                      className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white"
                      disabled={Boolean(isAiBusyByQuestion[selectedReviewItem.questionNumber])}
                      onChange={(event) => setSelectedReviewChatInput(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault()
                          void handleSendReviewChat(selectedReviewItem)
                        }
                      }}
                      placeholder="Hoi them AI ve cau nay..."
                      type="text"
                      value={selectedReviewChatInput}
                    />
                    <button
                      className="rounded-2xl bg-sky-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:bg-slate-300"
                      disabled={
                        Boolean(isAiBusyByQuestion[selectedReviewItem.questionNumber]) ||
                        !selectedReviewChatInput.trim()
                      }
                      onClick={() => void handleSendReviewChat(selectedReviewItem)}
                      type="button"
                    >
                      Gui
                    </button>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        ) : null}
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              De truong co PDF
            </div>
            <h1 className="mt-2 text-3xl font-extrabold text-slate-950">{exam.examTitle}</h1>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              {exam.schoolName} | {exam.city} | {exam.subjectName} | {exam.year}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <MetricPill label="Thoi gian con lai" value={formatDuration(remainingSeconds)} />
            <MetricPill label="Da tra loi" value={`${summary?.answeredCount ?? 0}/${summary?.totalCount ?? 0}`} />
            <MetricPill label="Ma de" value={selectedVariant?.variantCode ?? '--'} />
          </div>
        </div>
      </div>

      {submitted && summary ? (
        <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-800">
          Da nop bai. So cau dung: {summary.correctCount}/{summary.totalCount} | Diem tam tinh: {summary.score}/10
        </div>
      ) : null}

      {loadErrorMessage ? (
        <div className="rounded-[24px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-medium text-rose-700">
          {loadErrorMessage}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-slate-950">De goc PDF</h2>
            <a
              className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700"
              href={exam.pdfUrl}
              rel="noreferrer"
              target="_blank"
            >
              Mo PDF rieng
            </a>
          </div>
          <div className="h-[80vh] overflow-hidden rounded-[20px] border border-slate-200 bg-slate-100">
            <iframe className="h-full w-full" src={exam.pdfUrl} title={exam.examTitle} />
          </div>
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
          <div className="sticky top-0 z-10 -mx-6 -mt-6 mb-6 border-b border-slate-200 bg-white/95 px-6 py-4 backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-[220px]">
                <h2 className="text-lg font-bold text-slate-950">Phieu tra loi</h2>
                <p className="text-sm text-slate-600">PDF ben trai, answer key duoc doi chieu theo ma de.</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <label className="grid gap-1 text-sm">
                  <span className="font-semibold text-slate-600">Ma de</span>
                  <select
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white"
                    onChange={(event) => {
                      setSelectedVariantId(event.target.value)
                      setSubmitted(false)
                    }}
                    value={selectedVariantId}
                  >
                    {exam.variants.map((variant) => (
                      <option key={variant.variantId} value={variant.variantId}>
                        {variant.variantCode}
                      </option>
                    ))}
                  </select>
                </label>

                <button
                  className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                  disabled={!selectedVariantId || isLoadingAnswerKey || answerKeyEntries.length === 0}
                  onClick={() => setSubmitted(true)}
                  type="button"
                >
                  {isLoadingAnswerKey ? 'Dang tai dap an...' : 'Nop bai'}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {sectionsByPart.multipleChoice.map((section) => (
              <QuestionSection
                key={section.sectionId}
                description={section.instructions}
                title={section.title}
              >
                <div className="grid gap-4">
                  {buildQuestionNumbers(section.startQuestionNumber, section.endQuestionNumber).map((questionNumber) => {
                    const questionKey = String(questionNumber)
                    return (
                      <article
                        key={questionNumber}
                        className="rounded-[24px] border border-slate-200 bg-slate-50 p-4"
                      >
                        <div className="mb-3 text-sm font-semibold text-slate-900">
                          {buildDisplayQuestionLabel(section, questionNumber)}
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {buildChoiceLabels(section.optionsPerQuestion).map((label) => {
                            const isSelected = selectedChoices[questionKey] === label
                            return (
                              <label
                                key={label}
                                className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 text-sm transition ${
                                  isSelected
                                    ? 'border-sky-400 bg-white text-slate-950'
                                    : 'border-slate-200 bg-white text-slate-700'
                                }`}
                              >
                                <input
                                  checked={isSelected}
                                  disabled={submitted}
                                  name={`mc-${questionKey}`}
                                  onChange={() =>
                                    setSelectedChoices((state) => ({
                                      ...state,
                                      [questionKey]: label,
                                    }))
                                  }
                                  type="radio"
                                />
                                <span className="text-base font-bold tracking-[0.08em]">{label}</span>
                              </label>
                            )
                          })}
                        </div>
                        {submitted ? (
                          <p className="mt-3 text-sm text-slate-600">
                            Dap an dung: {formatAnswerKeyValue(answerKeyByQuestionNumber[questionNumber] ?? '--')}
                          </p>
                        ) : null}
                      </article>
                    )
                  })}
                </div>
              </QuestionSection>
            ))}

            {sectionsByPart.trueFalse.map((section) => (
              <QuestionSection
                key={section.sectionId}
                description={section.instructions}
                title={section.title}
              >
                <div className="grid gap-4">
                  {buildQuestionNumbers(section.startQuestionNumber, section.endQuestionNumber).map((questionNumber) => {
                    const questionKey = String(questionNumber)
                    const labels = buildStatementLabels(section.statementCount)
                    return (
                      <article
                        key={questionNumber}
                        className="rounded-[24px] border border-slate-200 bg-slate-50 p-4"
                      >
                        <div className="mb-3 text-sm font-semibold text-slate-900">
                          {buildDisplayQuestionLabel(section, questionNumber)}
                        </div>
                        <div className="overflow-hidden rounded-[18px] border border-slate-200 bg-white">
                          <div className="grid grid-cols-[1fr_64px_64px] border-b border-slate-200 bg-slate-100 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                            <div className="px-4 py-3">Y</div>
                            <div className="border-l border-slate-200 px-4 py-3 text-center">D</div>
                            <div className="border-l border-slate-200 px-4 py-3 text-center">S</div>
                          </div>
                          {labels.map((label) => {
                            const selected = selectedTrueFalse[questionKey]?.[label]
                            return (
                              <div
                                key={label}
                                className="grid grid-cols-[1fr_64px_64px] border-b border-slate-200 text-sm last:border-b-0"
                              >
                                <div className="px-4 py-3 font-semibold uppercase tracking-[0.08em] text-slate-700">
                                  {label}
                                </div>
                                <label className="flex items-center justify-center border-l border-slate-200">
                                  <input
                                    checked={selected === true}
                                    disabled={submitted}
                                    onChange={() =>
                                      setSelectedTrueFalse((state) => ({
                                        ...state,
                                        [questionKey]: {
                                          ...(state[questionKey] ?? {}),
                                          [label]: true,
                                        },
                                      }))
                                    }
                                    type="radio"
                                  />
                                </label>
                                <label className="flex items-center justify-center border-l border-slate-200">
                                  <input
                                    checked={selected === false}
                                    disabled={submitted}
                                    onChange={() =>
                                      setSelectedTrueFalse((state) => ({
                                        ...state,
                                        [questionKey]: {
                                          ...(state[questionKey] ?? {}),
                                          [label]: false,
                                        },
                                      }))
                                    }
                                    type="radio"
                                  />
                                </label>
                              </div>
                            )
                          })}
                        </div>
                        {submitted ? (
                          <p className="mt-3 text-sm text-slate-600">
                            Dap an dung: {formatAnswerKeyValue(answerKeyByQuestionNumber[questionNumber] ?? '--')}
                          </p>
                        ) : null}
                      </article>
                    )
                  })}
                </div>
              </QuestionSection>
            ))}

            {sectionsByPart.shortAnswer.map((section) => (
              <QuestionSection
                key={section.sectionId}
                description={section.instructions}
                title={section.title}
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  {buildQuestionNumbers(section.startQuestionNumber, section.endQuestionNumber).map((questionNumber) => {
                    const questionKey = String(questionNumber)
                    return (
                      <article
                        key={questionNumber}
                        className="rounded-[24px] border border-slate-200 bg-slate-50 p-4"
                      >
                        <div className="mb-3 text-sm font-semibold text-slate-900">
                          {buildDisplayQuestionLabel(section, questionNumber)}
                        </div>
                        <input
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-sky-400"
                          disabled={submitted}
                          onChange={(event) =>
                            setShortAnswers((state) => ({
                              ...state,
                              [questionKey]: event.target.value,
                            }))
                          }
                          placeholder="Nhap dap an..."
                          type="text"
                          value={shortAnswers[questionKey] ?? ''}
                        />
                        {submitted ? (
                          <p className="mt-3 text-sm text-slate-600">
                            Dap an dung: {formatAnswerKeyValue(answerKeyByQuestionNumber[questionNumber] ?? '--')}
                          </p>
                        ) : null}
                      </article>
                    )
                  })}
                </div>
              </QuestionSection>
            ))}
          </div>
        </section>
      </div>
    </section>
  )
}

function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700">
      <strong>{label}:</strong> {value}
    </div>
  )
}

function QuestionSection({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <section>
      <div className="mb-4">
        <h3 className="text-lg font-bold text-slate-950">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
      </div>
      {children}
    </section>
  )
}

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function buildQuestionNumbers(startQuestionNumber: number, endQuestionNumber: number) {
  if (startQuestionNumber <= 0 || endQuestionNumber < startQuestionNumber) {
    return []
  }

  return Array.from(
    { length: endQuestionNumber - startQuestionNumber + 1 },
    (_, index) => startQuestionNumber + index,
  )
}

function buildChoiceLabels(optionsPerQuestion: number) {
  return ['A', 'B', 'C', 'D', 'E', 'F'].slice(0, Math.max(0, optionsPerQuestion))
}

function buildStatementLabels(statementCount: number) {
  return ['a', 'b', 'c', 'd', 'e', 'f'].slice(0, Math.max(0, statementCount))
}

function normalizeTrueFalseAnswer(input: string) {
  return input.replace(/\s+/g, '').toUpperCase()
}

function splitAcceptedResponses(input: string) {
  return input
    .split('|')
    .map((item) => item.trim())
    .filter(Boolean)
}

function formatAnswerKeyValue(input: string) {
  if (!input) {
    return '--'
  }

  if (input.includes('|')) {
    return input
      .split('|')
      .map((item) => item.trim())
      .filter(Boolean)
      .join(' / ')
  }

  return input
}

function formatPartLabel(partCode: ReviewItem['partCode']) {
  switch (partCode) {
    case 'multiple_choice':
      return 'Trac nghiem'
    case 'true_false':
      return 'Dung / Sai'
    case 'short_answer':
      return 'Tra loi ngan'
    default:
      return partCode
  }
}

function buildDisplayQuestionLabel(
  section: SchoolExamPaperRecord['sections'][number],
  questionNumber: number,
) {
  const localQuestionNumber = questionNumber - section.startQuestionNumber + 1
  return `Cau ${localQuestionNumber}`
}

function buildQuestionContent(record: SchoolExamQuestionRecord | undefined, displayQuestionLabel: string) {
  if (!record) {
    return ''
  }

  const lines = [`${displayQuestionLabel}: ${record.questionText}`]

  if (record.options.length > 0) {
    for (const option of record.options) {
      lines.push(`${option.optionLabel}. ${option.optionText}`)
    }
  }

  if (record.statements.length > 0) {
    for (const statement of record.statements) {
      lines.push(`${statement.label}) ${statement.text}`)
    }
  }

  return lines.join('\n')
}

function buildRenderableAssetPaths(record: SchoolExamQuestionRecord | undefined) {
  if (!record) {
    return []
  }

  if (record.assets && record.assets.length > 0) {
    return record.assets
      .filter((asset) => asset.assetType !== 'question_block')
      .map((asset) => asset.assetPath)
  }

  return record.assetPaths.filter((assetPath) => /_hinh\d+\./i.test(assetPath))
}

function buildSchoolExamAssetUrl(pdfUrl: string, assetPath: string) {
  const normalizedAssetPath = assetPath.replace(/^\/+/, '')
  const pdfFileName = pdfUrl.split('/').pop() ?? ''
  const examSlug = pdfFileName.replace(/\.pdf$/i, '')
  return `/school-exam-assets/${examSlug}/${normalizedAssetPath}`
}

function SummaryTile({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone: 'emerald' | 'rose' | 'slate' | 'sky'
}) {
  const toneClass = {
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    rose: 'border-rose-200 bg-rose-50 text-rose-700',
    slate: 'border-slate-200 bg-slate-50 text-slate-700',
    sky: 'border-sky-200 bg-sky-50 text-sky-700',
  }[tone]

  return (
    <div className={`rounded-[22px] border px-4 py-4 ${toneClass}`}>
      <div className="text-xs font-semibold uppercase tracking-[0.12em]">{label}</div>
      <div className="mt-2 text-3xl font-black">{value}</div>
    </div>
  )
}

const styles = {
  text: {
    margin: 0,
    color: '#5d7491',
  },
}
