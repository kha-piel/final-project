import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Link, useBlocker, useParams } from 'react-router-dom'
import { PageCard } from '../../components/ui/PageCard'
import { MarkdownContent } from '../../components/ui/MarkdownContent'
import { useAuthSessionStore } from '../../features/auth/store/auth-session-store'
import {
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
  SchoolExamPaperRecord,
  SchoolExamQuestionOptionRecord,
  SchoolExamQuestionRecord,
  SchoolExamQuestionStatementRecord,
} from '../../features/practice/types/school-exam-types'

import { RecommendedReviewLinks } from '../../features/review/components/RecommendedReviewLinks'
import {
  inferKnowledgeReviewTopics,
  type KnowledgeReviewTopic,
} from '../../features/review/knowledge-review-topics'
import {
  persistCompletedSchoolExamAttempt,
  saveSchoolExamAiMessages,
  type SchoolExamAiMessageInput,
} from '../../features/practice/services/school-exam-attempt-service'

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
  questionStem: string
  options: SchoolExamQuestionOptionRecord[]
  statements: SchoolExamQuestionStatementRecord[]
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
  const authUser = useAuthSessionStore((state) => state.user)
  const [exam, setExam] = useState<SchoolExamPaperRecord | null>(null)
  const [isLoadingExam, setIsLoadingExam] = useState(true)
  const [loadErrorMessage, setLoadErrorMessage] = useState('')
  const [remainingSeconds, setRemainingSeconds] = useState(0)
  const [selectedChoices, setSelectedChoices] = useState<QuestionSelectionMap>({})
  const [selectedTrueFalse, setSelectedTrueFalse] = useState<TrueFalseSelectionMap>({})
  const [shortAnswers, setShortAnswers] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
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
  const [isSavingAttempt, setIsSavingAttempt] = useState(false)
  const [schoolAttemptId, setSchoolAttemptId] = useState('')
  const [isConfirmSubmitOpen, setIsConfirmSubmitOpen] = useState(false)
  const startedAtRef = useRef(Date.now())

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
        setSelectedChoices({})
        setSelectedTrueFalse({})
        setShortAnswers({})
        setSubmitted(false)
        setQuestionRecords([])
        setAiExplanationByQuestion({})
        setAiErrorByQuestion({})
        setWeaknessAnalysis('')
        setRecommendedTopics([])
        setWeaknessAnalysisError('')
        setSelectedReviewQuestionNumber(null)
        setSelectedReviewChatInput('')
        setAiChatHistoryByQuestion({})
        setSchoolAttemptId('')
        startedAtRef.current = Date.now()
      })
      .catch((error: unknown) => {
        if (isMounted) {
          setLoadErrorMessage(error instanceof Error ? error.message : 'KhÃ´ng thá»ƒ táº£i Ä‘á» trÆ°á»ng.')
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
            error instanceof Error ? error.message : 'KhÃ´ng thá»ƒ táº£i ná»™i dung cÃ¢u há»i Ä‘á» trÆ°á»ng.',
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

  const hasStartedAttempt = useMemo(() => {
    return (
      Object.keys(selectedChoices).length > 0 ||
      Object.keys(selectedTrueFalse).length > 0 ||
      Object.values(shortAnswers).some((value) => value.trim()) ||
      Object.values(aiChatHistoryByQuestion).some((messages) => messages.length > 0)
    )
  }, [aiChatHistoryByQuestion, selectedChoices, selectedTrueFalse, shortAnswers])

  const shouldWarnBeforeExit = Boolean(exam && hasStartedAttempt && !submitted)
  const navigationBlocker = useBlocker(shouldWarnBeforeExit)

  useEffect(() => {
    if (navigationBlocker.state !== 'blocked') {
      return
    }

    const shouldLeave = window.confirm(
      'Bai lam de thi thu cua truong se bi reset neu ban roi trang luc nay. Ban van muon thoat?',
    )

    if (shouldLeave) {
      navigationBlocker.proceed()
      return
    }

    navigationBlocker.reset()
  }, [navigationBlocker])

  useEffect(() => {
    if (!shouldWarnBeforeExit) {
      return
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [shouldWarnBeforeExit])

  const answerKeyByQuestionNumber = useMemo(() => {
    return questionRecords.reduce<Record<number, string>>((acc, item) => {
      acc[item.questionNumber] = item.answerValue ?? ''
      return acc
    }, {})
  }, [questionRecords])

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
        const questionStem = record?.questionText ?? ''
        const options = record?.options ?? []
        const statements = record?.statements ?? []
        const topic = record?.topic ?? ''
        const obsidianSourcePath = record?.obsidianSourcePath ?? ''
        const explanation = aiExplanationByQuestion[questionNumber] ?? ''
        const assetUrls = buildRenderableAssetPaths(record).map((assetPath) =>
          buildSchoolExamAssetUrl(exam.pdfUrl, assetPath),
        )

        if (section.partCode === 'multiple_choice') {
          const selectedAnswer = selectedChoices[questionKey] ?? 'ChÆ°a chá»n'
          items.push({
            questionNumber,
            partCode: section.partCode,
            displayQuestionLabel,
            selectedAnswer,
            correctAnswer,
            correct: selectedChoices[questionKey] === (answerKeyByQuestionNumber[questionNumber] ?? ''),
            questionContent,
            questionStem,
            options,
            statements,
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
            questionStem,
            options,
            statements,
            topic,
            obsidianSourcePath,
            explanation,
            assetUrls,
          })
          continue
        }

        const selectedAnswer = shortAnswers[questionKey]?.trim() || 'ChÆ°a nháº­p'
        const acceptedResponses = splitAcceptedResponses(answerKeyByQuestionNumber[questionNumber] ?? '')
        items.push({
          questionNumber,
          partCode: section.partCode,
          displayQuestionLabel,
          selectedAnswer,
          correctAnswer,
          correct: acceptedResponses.some((candidate) => normalizeAnswer(candidate) === normalizeAnswer(selectedAnswer)),
          questionContent,
          questionStem,
          options,
          statements,
          topic,
          obsidianSourcePath,
          explanation,
          assetUrls,
        })
      }
    }

    return items
  }, [aiExplanationByQuestion, answerKeyByQuestionNumber, exam, questionRecordByNumber, selectedChoices, selectedTrueFalse, shortAnswers])

  const wrongReviewItems = useMemo(
    () => reviewItems.filter((item) => !item.correct),
    [reviewItems],
  )

  const reviewItemsByPart = useMemo(
    () => ({
      multipleChoice: reviewItems.filter((item) => item.partCode === 'multiple_choice'),
      trueFalse: reviewItems.filter((item) => item.partCode === 'true_false'),
      shortAnswer: reviewItems.filter((item) => item.partCode === 'short_answer'),
    }),
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
        [item.questionNumber]: 'ChÆ°a cÃ³ ná»™i dung cÃ¢u há»i Ä‘á»ƒ gá»­i sang AI.',
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
          { role: 'user', content: `VÃ¬ sao ${item.displayQuestionLabel.toLowerCase()} em lÃ m sai?` },
          { role: 'ai', content: explanation },
        ],
      }))
      await persistReviewAiMessages(item.questionNumber, [
        {
          role: 'user',
          content: `Vi sao ${item.displayQuestionLabel.toLowerCase()} em lam sai?`,
        },
        {
          role: 'assistant',
          content: explanation,
        },
      ])
    } catch (error) {
      setAiErrorByQuestion((state) => ({
        ...state,
        [item.questionNumber]:
          error instanceof Error ? error.message : 'KhÃ´ng thá»ƒ láº¥y giáº£i thÃ­ch tá»« AI lÃºc nÃ y.',
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
      await persistReviewAiMessages(item.questionNumber, [
        {
          role: 'user',
          content: trimmed,
        },
        {
          role: 'assistant',
          content: explanation,
        },
      ])
    } catch (error) {
      setAiErrorByQuestion((state) => ({
        ...state,
        [item.questionNumber]:
          error instanceof Error ? error.message : 'KhÃ´ng thá»ƒ gá»­i cÃ¢u há»i tá»›i AI lÃºc nÃ y.',
      }))
    } finally {
      setIsAiBusyByQuestion((state) => ({ ...state, [item.questionNumber]: false }))
    }
  }

  async function handleSubmitSchoolExam() {
    if (!exam || !summary || submitted || isSavingAttempt) {
      return
    }

    setLoadErrorMessage('')
    setIsSavingAttempt(true)

    try {
      if (!authUser?.id) {
        throw new Error('Khong tim thay tai khoan dang nhap de luu lich su bai lam.')
      }

      const attemptId = await persistCompletedSchoolExamAttempt({
        userId: authUser.id,
        schoolExamId: exam.examId,
        variantCode: exam.displayVariantCode,
        score: summary.score,
        correctCount: summary.correctCount,
        wrongCount: wrongReviewItems.length,
        skippedCount: Math.max(0, summary.totalCount - summary.answeredCount),
        totalCount: summary.totalCount,
        startedAt: startedAtRef.current,
        completedAt: Date.now(),
        answers: reviewItems.map((item) => ({
          questionNumber: item.questionNumber,
          questionType: item.partCode,
          selectedAnswer: item.selectedAnswer,
          correctAnswer: item.correctAnswer,
          isCorrect: item.correct,
          questionContent: item.questionContent,
          topic: item.topic,
          metadata: {
            display_question_label: item.displayQuestionLabel,
            obsidian_source_path: item.obsidianSourcePath,
            asset_urls: item.assetUrls,
          },
        })),
        aiMessages: buildPersistableAiMessages(aiChatHistoryByQuestion),
        metadata: {
          exam_title: exam.examTitle,
          school_name: exam.schoolName,
          city: exam.city,
          subject_name: exam.subjectName,
          year: exam.year,
          duration_minutes: exam.durationMinutes,
          answered_count: summary.answeredCount,
        },
      })

      setSchoolAttemptId(attemptId)
      setSubmitted(true)
    } catch (error) {
      setLoadErrorMessage(error instanceof Error ? error.message : 'Khong the luu lich su bai lam.')
    } finally {
      setIsSavingAttempt(false)
    }
  }

  async function persistReviewAiMessages(
    questionNumber: number,
    messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
  ) {
    if (!schoolAttemptId) {
      return
    }

    await saveSchoolExamAiMessages(
      schoolAttemptId,
      messages.map((message) => ({
        questionNumber,
        role: message.role,
        content: message.content,
      })),
    )
  }



  async function handleAnalyzeWeaknesses() {
    if (wrongReviewItems.length === 0) {
      setWeaknessAnalysis('Báº¡n khÃ´ng cÃ³ cÃ¢u sai nÃ o trong bÃ i nÃ y.')
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
          topic: item.topic || exam?.subjectName || 'ChÆ°a xÃ¡c Ä‘á»‹nh chuyÃªn Ä‘á»',
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
        error instanceof Error ? error.message : 'KhÃ´ng thá»ƒ láº¥y phÃ¢n tÃ­ch tá»•ng quan lÃºc nÃ y.',
      )
    } finally {
      setIsAnalyzingWeaknesses(false)
    }
  }

  if (isLoadingExam) {
    return (
      <PageCard title="Äang táº£i Ä‘á» trÆ°á»ng" description="Há»‡ thá»‘ng Ä‘ang Ä‘á»c metadata, PDF vÃ  danh sÃ¡ch mÃ£ Ä‘á» tá»« Supabase.">
        <p style={styles.text}>Äang táº£i dá»¯ liá»‡u...</p>
      </PageCard>
    )
  }

  if (!exam) {
    return (
      <PageCard title="KhÃ´ng tÃ¬m tháº¥y Ä‘á» trÆ°á»ng" description="Exam id nÃ y chÆ°a Ä‘Æ°á»£c khai bÃ¡o trong kho dá»¯ liá»‡u.">
        <p style={styles.text}>
          {loadErrorMessage || 'Quay láº¡i '}
          <Link to="/practice">practice hub</Link>
          {!loadErrorMessage ? ' Ä‘á»ƒ chá»n Ä‘á» khÃ¡c.' : null}
        </p>
      </PageCard>
    )
  }

  if (submitted && summary) {
    return (
      <section className="space-y-6">
        <div className="rounded-[28px] border border-emerald-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                Tá»•ng káº¿t bÃ i lÃ m
              </div>
              <h1 className="mt-2 text-3xl font-extrabold text-slate-950">{exam.examTitle}</h1>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                {exam.schoolName} | {exam.displayVariantCode || '--'} | ÄÃ£ khÃ³a bÃ i lÃ m
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <MetricPill label="Äiá»ƒm" value={`${summary.score}/10`} />
              <MetricPill label="Sá»‘ cÃ¢u Ä‘Ãºng" value={`${summary.correctCount}/${summary.totalCount}`} />
              <MetricPill label="ÄÃ£ tráº£ lá»i" value={`${summary.answeredCount}/${summary.totalCount}`} />
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr] items-start">
          <section className="sticky top-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
<<<<<<< HEAD
            <h2 className="text-xl font-bold text-slate-950">Thá»‘ng kÃª nhanh</h2>
=======
            <h2 className="text-xl font-bold text-slate-950">Thống kê nhanh</h2>
>>>>>>> b0f699ec5b4f32512b2665e363b62a98f41c77d6
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <SummaryTile label="ÄÃºng" value={`${summary.correctCount}`} tone="emerald" />
              <SummaryTile label="Sai" value={`${wrongReviewItems.length}`} tone="rose" />
              <SummaryTile label="Bá» qua" value={`${summary.totalCount - summary.answeredCount}`} tone="slate" />
              <SummaryTile label="MÃ£ Ä‘á»" value={exam.displayVariantCode || '--'} tone="sky" />
            </div>

            <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
              <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-slate-700">
<<<<<<< HEAD
                Ghi chÃº AI
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                AI sáº½ giÃºp báº¡n phÃ¢n tÃ­ch chi tiáº¿t cÃ¡c lá»—i sai, Ä‘Ã¡nh giÃ¡ tá»•ng quan Ä‘iá»ƒm yáº¿u vÃ  Ä‘Æ°a ra Ä‘á»‹nh hÆ°á»›ng Ã´n táº­p hiá»‡u quáº£ dá»±a trÃªn káº¿t quáº£ bÃ i lÃ m cá»§a báº¡n.
=======
                Ghi chú AI
              </h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                AI sẽ giúp bạn phân tích chi tiết các lỗi sai, đánh giá tổng quan điểm yếu và đưa ra định hướng ôn tập hiệu quả dựa trên kết quả bài làm của bạn.
>>>>>>> b0f699ec5b4f32512b2665e363b62a98f41c77d6
              </p>
            </div>

            <div className="mt-6 rounded-[24px] border border-slate-200 bg-white p-5">
              <button
                className="rounded-2xl bg-sky-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:bg-slate-300"
                disabled={isAnalyzingWeaknesses}
                onClick={() => void handleAnalyzeWeaknesses()}
                type="button"
              >
                {isAnalyzingWeaknesses ? 'AI Ä‘ang phÃ¢n tÃ­ch...' : 'AI phÃ¢n tÃ­ch tá»•ng quan Ä‘iá»ƒm yáº¿u'}
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
                className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                to="/practice"
              >
                Quay láº¡i thÆ° viá»‡n Ä‘á»
              </Link>
              <a
                className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-white"
                href={exam.pdfUrl}
                rel="noreferrer"
                target="_blank"
              >
                Má»Ÿ láº¡i PDF
              </a>
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-bold text-slate-950">Chi tiáº¿t káº¿t quáº£</h2>
              <div className="text-sm text-slate-500">{reviewItems.length} cÃ¢u</div>
            </div>

            <p className="mt-3 text-sm leading-7 text-slate-600">
              Báº¥m vÃ o tá»«ng cÃ¢u Ä‘á»ƒ má»Ÿ tab review. Tab nÃ y hiá»‡n cÃ¢u há»i, hÃ¬nh áº£nh liÃªn quan, Ä‘Ã¡p Ã¡n há»c sinh chá»n
              va khung tro chuyen voi AI.
            </p>

            <div className="mt-5 space-y-5">
              <ReviewItemSection
                items={reviewItemsByPart.multipleChoice}
                selectedQuestionNumber={selectedReviewItem?.questionNumber ?? null}
<<<<<<< HEAD
                title="Pháº§n I. Tráº¯c nghiá»‡m 4 lá»±a chá»n"
=======
                title="Phần I. Trắc nghiệm 4 lựa chọn"
>>>>>>> b0f699ec5b4f32512b2665e363b62a98f41c77d6
                onSelect={setSelectedReviewQuestionNumber}
              />
              <ReviewItemSection
                items={reviewItemsByPart.trueFalse}
                selectedQuestionNumber={selectedReviewItem?.questionNumber ?? null}
<<<<<<< HEAD
                title="Pháº§n II. Tráº¯c nghiá»‡m Ä‘Ãºng sai"
=======
                title="Phần II. Trắc nghiệm đúng sai"
>>>>>>> b0f699ec5b4f32512b2665e363b62a98f41c77d6
                onSelect={setSelectedReviewQuestionNumber}
              />
              <ReviewItemSection
                items={reviewItemsByPart.shortAnswer}
                selectedQuestionNumber={selectedReviewItem?.questionNumber ?? null}
<<<<<<< HEAD
                title="Pháº§n III. Tráº¯c nghiá»‡m tráº£ lá»i ngáº¯n"
=======
                title="Phần III. Trắc nghiệm trả lời ngắn"
>>>>>>> b0f699ec5b4f32512b2665e363b62a98f41c77d6
                onSelect={setSelectedReviewQuestionNumber}
              />
            </div>
          </section>
        </div>

        {selectedReviewItem ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 py-6 backdrop-blur-sm">
            <div className="flex h-[92vh] w-full max-w-[1320px] flex-col overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_40px_120px_rgba(15,23,42,0.24)]">
              <div className="shrink-0 flex items-center justify-between gap-4 border-b border-slate-200 px-6 py-5">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Review cÃ¢u há»i
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
                      {selectedReviewItem.correct ? 'ÄÃºng' : 'Sai'}
                    </div>
                    <div className="text-sm leading-7 text-slate-600">
<<<<<<< HEAD
                      Topic: {selectedReviewItem.topic || 'ChÆ°a gÃ¡n topic'}
=======
                      Topic: {selectedReviewItem.topic || 'Chưa gán topic'}
>>>>>>> b0f699ec5b4f32512b2665e363b62a98f41c77d6
                    </div>
                  </div>

                  <div className="mt-5 rounded-[24px] border border-slate-200 bg-white p-5">
                    <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                      Ná»™i dung cÃ¢u há»i
                    </div>
                    <div className="mt-3 text-base leading-8 text-slate-800">
                      <MarkdownContent
                        content={selectedReviewItem.questionStem || 'ChÆ°a cÃ³ ná»™i dung cÃ¢u há»i.'}
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
                            alt={`${selectedReviewItem.displayQuestionLabel} hÃ¬nh ${index + 1}`}
                            className="h-auto w-full object-contain"
                            src={assetUrl}
                          />
                        </div>
                      ))}
                    </div>
                  ) : null}



                  {selectedReviewItem.partCode === 'multiple_choice' ? (
                    <div className="mt-5 rounded-[24px] border border-slate-200 bg-white p-5">
                      <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                        CÃ¡c lá»±a chá»n trong cÃ¢u há»i
                      </div>
                      <SchoolExamChoiceReview
                        correctAnswer={selectedReviewItem.correctAnswer}
                        options={selectedReviewItem.options}
                        selectedAnswer={selectedReviewItem.selectedAnswer}
                      />
                    </div>
                  ) : null}

                  {selectedReviewItem.partCode === 'true_false' ? (
                    <div className="mt-5 rounded-[24px] border border-slate-200 bg-white p-5">
                      <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                        CÃ¡c má»‡nh Ä‘á» trong cÃ¢u há»i
                      </div>
                      <SchoolExamTrueFalseReview
                        correctAnswer={selectedReviewItem.correctAnswer}
                        statements={selectedReviewItem.statements}
                        selectedAnswer={selectedReviewItem.selectedAnswer}
                      />
                    </div>
                  ) : null}


                  <div className="mt-5 grid gap-3 md:grid-cols-2">
                    <div className="rounded-[22px] border border-slate-200 bg-white px-4 py-4">
                      <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                        Lá»±a chá»n cá»§a há»c sinh
                      </div>
                      <div className="mt-2 text-lg font-bold text-slate-950">{selectedReviewItem.selectedAnswer}</div>
                    </div>
                    <div className="rounded-[22px] border border-slate-200 bg-white px-4 py-4">
                      <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                        ÄÃ¡p Ã¡n Ä‘Ãºng
                      </div>
                      <div className="mt-2 text-lg font-bold text-slate-950">{selectedReviewItem.correctAnswer}</div>
                    </div>
                  </div>
                </section>

                <section className="flex min-h-0 flex-col overflow-hidden bg-white p-6">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-bold text-slate-950">TrÃ² chuyá»‡n vá»›i AI</h3>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        AI Ä‘á»c cÃ¢u há»i, Ä‘Ã¡p Ã¡n Ä‘Ã£ chá»n, Ä‘Ã¡p Ã¡n Ä‘Ãºng vÃ  file kiáº¿n thá»©c liÃªn quan Ä‘á»ƒ giáº£i thÃ­ch.
                      </p>
                    </div>
                    <button
                      className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                      disabled={Boolean(isAiBusyByQuestion[selectedReviewItem.questionNumber])}
                      onClick={() => void handleExplainWrongAnswer(selectedReviewItem)}
                      type="button"
                    >
                      {isAiBusyByQuestion[selectedReviewItem.questionNumber]
<<<<<<< HEAD
                        ? 'Äang giáº£i thÃ­ch...'
                        : 'Giáº£i thÃ­ch cÃ¢u nÃ y'}
=======
                        ? 'Đang giải thích...'
                        : 'Giải thích câu này'}
>>>>>>> b0f699ec5b4f32512b2665e363b62a98f41c77d6
                    </button>
                  </div>

                  <div className="mt-5 min-h-0 flex-1 overflow-y-auto rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                    <div className="space-y-4">
                      {(aiChatHistoryByQuestion[selectedReviewItem.questionNumber] ?? []).length === 0 ? (
                        <div className="text-sm leading-7 text-slate-500">
                          ChÆ°a cÃ³ há»™i thoáº¡i nÃ o. Báº¥m "Giáº£i thÃ­ch cÃ¢u sai" hoáº·c há»i thÃªm Ä‘á»ƒ AI phÃ¢n tÃ­ch sÃ¢u hÆ¡n.
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
                                {message.role === 'user' ? 'Há»c sinh' : 'AI gia sÆ°'}
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
                      placeholder="Há»i thÃªm AI vá» cÃ¢u nÃ y..."
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
                      Gá»­i
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
              Äá» trÆ°á»ng co PDF
            </div>
            <h1 className="mt-2 text-3xl font-extrabold text-slate-950">{exam.examTitle}</h1>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              {exam.schoolName} | {exam.city} | {exam.subjectName} | {exam.year}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <MetricPill label="Thá»i gian cÃ²n láº¡i" value={formatDuration(remainingSeconds)} />
            <MetricPill label="ÄÃ£ tráº£ lá»i" value={`${summary?.answeredCount ?? 0}/${summary?.totalCount ?? 0}`} />
            <MetricPill label="MÃ£ Ä‘á»" value={exam.displayVariantCode || '--'} />
          </div>
        </div>
      </div>

      {submitted && summary ? (
        <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-800">
          ÄÃ£ ná»™p bÃ i. Sá»‘ cÃ¢u Ä‘Ãºng: {summary.correctCount}/{summary.totalCount} | Äiá»ƒm táº¡m tÃ­nh: {summary.score}/10
        </div>
      ) : null}

      {loadErrorMessage ? (
        <div className="rounded-[24px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-medium text-rose-700">
          {loadErrorMessage}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr] items-start">
        <section className="sticky top-6 rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-slate-950">Äá» gá»‘c PDF</h2>
            <a
              className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              href={exam.pdfUrl}
              rel="noreferrer"
              target="_blank"
            >
<<<<<<< HEAD
              Má»Ÿ PDF riÃªng
=======
              Mở PDF riêng
>>>>>>> b0f699ec5b4f32512b2665e363b62a98f41c77d6
            </a>
          </div>
          <div className="h-[calc(100vh-140px)] min-h-[600px] overflow-hidden rounded-[20px] border border-slate-200 bg-slate-100">
            <iframe className="h-full w-full" src={`${exam.pdfUrl}#toolbar=0`} title={exam.examTitle} />
          </div>
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
          <div className="sticky top-0 z-10 -mx-6 -mt-6 mb-6 border-b border-slate-200 bg-white/95 px-6 py-4 backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-[220px]">
                <h2 className="text-lg font-bold text-slate-950">Phiáº¿u tráº£ lá»i</h2>
                <p className="text-sm text-slate-600">PDF bÃªn trÃ¡i, answer key Ä‘Æ°á»£c Ä‘á»‘i chiáº¿u theo mÃ£ Ä‘á».</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="grid gap-1 text-sm">
                  <span className="font-semibold text-slate-600">MÃ£ Ä‘á»</span>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                    {exam.displayVariantCode || '--'}
                  </div>
                </div>

                <button
                  className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
<<<<<<< HEAD
                  disabled={questionRecords.length === 0 || isSavingAttempt}
=======
                  disabled={!selectedVariantId || isLoadingAnswerKey || answerKeyEntries.length === 0 || isSavingAttempt}
>>>>>>> b0f699ec5b4f32512b2665e363b62a98f41c77d6
                  onClick={() => setIsConfirmSubmitOpen(true)}
                  type="button"
                >
                  {isSavingAttempt ? 'Äang lÆ°u...' : 'Ná»™p bÃ i'}
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
                    const displayQuestionLabel = buildDisplayQuestionLabel(section, questionNumber)
                    return (
                      <article
                        key={questionNumber}
                        className="rounded-[24px] border border-slate-200 bg-slate-50 p-4"
                      >
                        <div className="mb-3 text-sm font-semibold text-slate-900">{displayQuestionLabel}</div>
                        <div className="grid grid-cols-4 gap-2">
                          {buildChoiceLabels(section.optionsPerQuestion).map((label) => {
                            const isSelected = selectedChoices[questionKey] === label
                            return (
                              <label
                                key={label}
                                className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border px-2 py-2 text-sm font-bold transition ${
                                  isSelected
                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
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
                                <span className="text-base tracking-[0.08em]">{label}</span>
                              </label>
                            )
                          })}
                        </div>
                        {submitted ? (
                          <p className="mt-3 text-sm text-slate-600">
                            ÄÃ¡p Ã¡n Ä‘Ãºng: {formatAnswerKeyValue(answerKeyByQuestionNumber[questionNumber] ?? '--')}
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
                    const displayQuestionLabel = buildDisplayQuestionLabel(section, questionNumber)
                    return (
                      <article
                        key={questionNumber}
                        className="rounded-[24px] border border-slate-200 bg-slate-50 p-4"
                      >
                        <div className="mb-3 text-sm font-semibold text-slate-900">{displayQuestionLabel}</div>
                        <div className="overflow-hidden rounded-[18px] border border-slate-200 bg-white">
                          <div className="grid grid-cols-[72px_1fr_1fr] border-b border-slate-200 bg-slate-100 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                            <div className="px-4 py-3">Y</div>
                            <div className="border-l border-slate-200 px-4 py-3 text-center">D</div>
                            <div className="border-l border-slate-200 px-4 py-3 text-center">S</div>
                          </div>
                          {labels.map((label) => {
                            const selected = selectedTrueFalse[questionKey]?.[label]
                            return (
                              <div
                                key={label}
                                className="grid grid-cols-[72px_1fr_1fr] border-b border-slate-200 text-sm last:border-b-0"
                              >
                                <div className="px-4 py-3 text-center font-semibold uppercase tracking-[0.08em] text-slate-700">
                                  {label}
                                </div>
                                <label className={`flex cursor-pointer items-center justify-center border-l border-slate-200 transition ${selected === true ? 'bg-blue-50' : 'hover:bg-slate-50'}`}>
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
                                <label className={`flex cursor-pointer items-center justify-center border-l border-slate-200 transition ${selected === false ? 'bg-blue-50' : 'hover:bg-slate-50'}`}>
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
                            ÄÃ¡p Ã¡n Ä‘Ãºng: {formatAnswerKeyValue(answerKeyByQuestionNumber[questionNumber] ?? '--')}
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
                    const displayQuestionLabel = buildDisplayQuestionLabel(section, questionNumber)
                    return (
                      <article
                        key={questionNumber}
                        className="rounded-[24px] border border-slate-200 bg-slate-50 p-4"
                      >
                        <div className="mb-3 text-sm font-semibold text-slate-900">{displayQuestionLabel}</div>
                        <input
                          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-sky-400"
                          disabled={submitted}
                          onChange={(event) =>
                            setShortAnswers((state) => ({
                              ...state,
                              [questionKey]: event.target.value,
                            }))
                          }
                          placeholder="Nhap Ä‘Ã¡p Ã¡n..."
                          type="text"
                          value={shortAnswers[questionKey] ?? ''}
                        />
                        {submitted ? (
                          <p className="mt-3 text-sm text-slate-600">
                            ÄÃ¡p Ã¡n Ä‘Ãºng: {formatAnswerKeyValue(answerKeyByQuestionNumber[questionNumber] ?? '--')}
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

      {isConfirmSubmitOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
<<<<<<< HEAD
            <h3 className="mb-2 text-xl font-bold text-slate-900">XÃ¡c nháº­n ná»™p bÃ i</h3>
            <p className="mb-8 text-slate-600">
              Báº¡n cÃ³ cháº¯c cháº¯n muá»‘n ná»™p bÃ i? Sau khi ná»™p, báº¡n sáº½ khÃ´ng thá»ƒ thay Ä‘á»•i Ä‘Ã¡p Ã¡n Ä‘Æ°á»£c ná»¯a.
=======
            <h3 className="mb-2 text-xl font-bold text-slate-900">Xác nhận nộp bài</h3>
            <p className="mb-8 text-slate-600">
              Bạn có chắc chắn muốn nộp bài? Sau khi nộp, bạn sẽ không thể thay đổi đáp án được nữa.
>>>>>>> b0f699ec5b4f32512b2665e363b62a98f41c77d6
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
                onClick={() => setIsConfirmSubmitOpen(false)}
                type="button"
              >
<<<<<<< HEAD
                Há»§y
=======
                Hủy
>>>>>>> b0f699ec5b4f32512b2665e363b62a98f41c77d6
              </button>
              <button
                className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800"
                onClick={() => {
                  setIsConfirmSubmitOpen(false)
                  void handleSubmitSchoolExam()
                }}
                type="button"
              >
<<<<<<< HEAD
                Ná»™p bÃ i ngay
=======
                Nộp bài ngay
>>>>>>> b0f699ec5b4f32512b2665e363b62a98f41c77d6
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

function buildPersistableAiMessages(
  messagesByQuestion: Record<number, ReviewChatMessage[]>,
): SchoolExamAiMessageInput[] {
  return Object.entries(messagesByQuestion).flatMap(([questionNumber, messages]) =>
    messages.map((message) => ({
      questionNumber: Number(questionNumber),
      role: message.role === 'ai' ? 'assistant' : message.role,
      content: message.content,
    })),
  )
}

function SchoolExamChoiceReview({
  correctAnswer,
  options,
  selectedAnswer,
}: {
  correctAnswer: string
  options: SchoolExamQuestionOptionRecord[]
  selectedAnswer: string
}) {
  const choices = options.map((option) => ({
    label: option.optionLabel,
    content: option.optionText,
  }))

  if (choices.length === 0) {
    return (
      <p className="mt-3 text-sm leading-7 text-slate-500">
        ChÆ°a tÃ¡ch Ä‘Æ°á»£c phÆ°Æ¡ng Ã¡n A/B/C/D tá»« dá»¯ liá»‡u cÃ¢u há»i.
      </p>
    )
  }

  return (
    <div className="mt-4 grid gap-3">
      {choices.map((choice) => {
        const isSelected = isAnswerLabelMatch(selectedAnswer, choice.label)
        const isCorrect = isAnswerLabelMatch(correctAnswer, choice.label)
        return (
          <div
            className={[
              'rounded-[18px] border px-4 py-3 text-sm leading-7',
              isCorrect ? 'border-emerald-300 bg-emerald-50 text-emerald-950' : 'border-slate-200 bg-white text-slate-800',
              isSelected && !isCorrect ? 'border-rose-300 bg-rose-50 text-rose-950' : '',
              isSelected && isCorrect ? 'border-emerald-500 bg-emerald-100' : '',
            ].join(' ')}
            key={choice.label}
          >
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <strong className="text-base">{choice.label}</strong>
              {isSelected ? (
                <span className="rounded-full bg-blue-100 px-2 py-1 text-[11px] font-bold text-blue-700">
                  Báº¡n chá»n
                </span>
              ) : null}
              {isCorrect ? (
                <span className="rounded-full bg-emerald-200 px-2 py-1 text-[11px] font-bold text-emerald-800">
                  ÄÃ¡p Ã¡n Ä‘Ãºng
                </span>
              ) : null}
            </div>
            <MarkdownContent content={choice.content} className="text-sm leading-7" />
          </div>
        )
      })}
    </div>
  )
}

function SchoolExamTrueFalseReview({
  correctAnswer,
  statements,
  selectedAnswer,
}: {
  correctAnswer: string
  statements: SchoolExamQuestionStatementRecord[]
  selectedAnswer: string
}) {
  const selectedValues = normalizeTrueFalseAnswer(selectedAnswer)
  const correctValues = normalizeTrueFalseAnswer(correctAnswer)

  if (statements.length === 0) {
    return (
      <p className="mt-3 text-sm leading-7 text-slate-500">
        ChÆ°a tÃ¡ch Ä‘Æ°á»£c cÃ¡c má»‡nh Ä‘á» a/b/c/d tá»« dá»¯ liá»‡u cÃ¢u há»i.
      </p>
    )
  }

  return (
    <div className="mt-4 grid gap-3">
      {statements.map((statement, index) => {
        const studentValue = selectedValues[index] ?? '-'
        const correctValue = correctValues[index] ?? '-'
        const hasAnswered = studentValue === 'D' || studentValue === 'S'
        const isCorrect = hasAnswered && studentValue === correctValue

        return (
          <div
            className={[
              'rounded-[18px] border px-4 py-3 text-sm leading-7',
              isCorrect ? 'border-emerald-300 bg-emerald-50 text-emerald-950' : 'border-slate-200 bg-white text-slate-800',
              hasAnswered && !isCorrect ? 'border-rose-300 bg-rose-50 text-rose-950' : '',
            ].join(' ')}
            key={statement.label}
          >
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <strong className="text-base">{statement.label})</strong>
              <span className="rounded-full bg-blue-100 px-2 py-1 text-[11px] font-bold text-blue-700">
                Báº¡n chá»n: {formatTrueFalseLetter(studentValue)}
              </span>
              <span className="rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-bold text-emerald-800">
                ÄÃ¡p Ã¡n Ä‘Ãºng: {formatTrueFalseLetter(correctValue)}
              </span>
            </div>
            <MarkdownContent content={statement.text} className="text-sm leading-7" />
          </div>
        )
      })}
    </div>
  )
}

function formatTrueFalseLetter(value: string) {
  if (value === 'D') {
    return 'ÄÃºng'
  }
  if (value === 'S') {
    return 'Sai'
  }
  return 'ChÆ°a chá»n'
}

function isAnswerLabelMatch(answerText: string, optionLabel: string) {
  const normalized = answerText.trim().toUpperCase()
  const label = optionLabel.trim().toUpperCase()
  return normalized === label || normalized.startsWith(`${label}.`) || normalized.startsWith(`${label} `)
}

function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700">
      <strong>{label}:</strong> {value}
    </div>
  )
}

function formatSectionTitle(title: string) {
  const lower = title.toLowerCase()
  if (lower.includes('phan i') || lower.includes('nhieu lua chon')) {
<<<<<<< HEAD
    return 'Pháº§n I. Tráº¯c nghiá»‡m nhiá»u lá»±a chá»n'
  }
  if (lower.includes('phan ii') || lower.includes('dung sai')) {
    return 'Pháº§n II. Tráº¯c nghiá»‡m Ä‘Ãºng sai'
  }
  if (lower.includes('phan iii') || lower.includes('tra loi ngan')) {
    return 'Pháº§n III. Tráº£ lá»i ngáº¯n'
=======
    return 'Phần I. Trắc nghiệm nhiều lựa chọn'
  }
  if (lower.includes('phan ii') || lower.includes('dung sai')) {
    return 'Phần II. Trắc nghiệm đúng sai'
  }
  if (lower.includes('phan iii') || lower.includes('tra loi ngan')) {
    return 'Phần III. Trả lời ngắn'
>>>>>>> b0f699ec5b4f32512b2665e363b62a98f41c77d6
  }
  return title
}

function formatSectionDescription(description: string) {
  if (description.toLowerCase().includes('moi cau chon 1 trong 4')) {
<<<<<<< HEAD
    return 'Má»—i cÃ¢u chá»n 1 trong 4 Ä‘Ã¡p Ã¡n.'
  }
  if (description.toLowerCase().includes('moi y (a), (b), (c), (d)')) {
    return 'Trong má»—i cÃ¢u, thÃ­ sinh chá»n Ä‘Ãºng hoáº·c sai.'
  }
  if (description.toLowerCase().includes('thi sinh dien dap an')) {
    return 'ThÃ­ sinh Ä‘iá»n Ä‘Ã¡p Ã¡n.'
=======
    return 'Mỗi câu chọn 1 trong 4 đáp án.'
  }
  if (description.toLowerCase().includes('moi y (a), (b), (c), (d)')) {
    return 'Trong mỗi câu, thí sinh chọn đúng hoặc sai.'
  }
  if (description.toLowerCase().includes('thi sinh dien dap an')) {
    return 'Thí sinh điền đáp án.'
>>>>>>> b0f699ec5b4f32512b2665e363b62a98f41c77d6
  }
  return description
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
        <h3 className="text-lg font-bold text-slate-950">{formatSectionTitle(title)}</h3>
        <p className="mt-1 text-sm leading-6 text-slate-600">{formatSectionDescription(description)}</p>
      </div>
      {children}
    </section>
  )
}

function ReviewItemSection({
  title,
  items,
  selectedQuestionNumber,
  onSelect,
}: {
  title: string
  items: ReviewItem[]
  selectedQuestionNumber: number | null
  onSelect: (questionNumber: number) => void
}) {
  if (items.length === 0) {
    return null
  }

  return (
    <section className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-slate-700">{title}</h3>
        <div className="text-xs font-semibold text-slate-500">{items.length} cÃ¢u</div>
      </div>

      <div className="flex flex-wrap gap-3">
        {items.map((item) => (
          <button
            key={`${item.partCode}-${item.questionNumber}`}
            className={`rounded-2xl border px-4 py-3 text-left transition ${
              selectedQuestionNumber === item.questionNumber
                ? 'border-slate-950 bg-slate-950 text-white'
                : item.correct
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:border-emerald-300'
                  : 'border-rose-200 bg-rose-50 text-rose-800 hover:border-rose-300'
            }`}
            onClick={() => onSelect(item.questionNumber)}
            type="button"
          >
            <div className="text-sm font-bold">{item.displayQuestionLabel}</div>
            <div className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] opacity-80">
              {item.correct ? 'ÄÃºng' : 'Sai'} | {formatPartLabel(item.partCode)}
            </div>
          </button>
        ))}
      </div>
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
      return 'Tráº¯c nghiá»‡m'
    case 'true_false':
      return 'ÄÃºng / Sai'
    case 'short_answer':
      return 'Tráº£ lá»i ngáº¯n'
    default:
      return partCode
  }
}

function buildDisplayQuestionLabel(
  section: SchoolExamPaperRecord['sections'][number],
  questionNumber: number,
) {
  const localQuestionNumber = questionNumber - section.startQuestionNumber + 1
  return `CÃ¢u ${localQuestionNumber}`
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
    const figureAssetPaths = [...record.assets]
      .sort((left, right) => left.displayOrder - right.displayOrder)
      .filter((asset) => asset.assetType === 'figure')
      .map((asset) => asset.assetPath)

    return [...new Set(figureAssetPaths)]
  }

  return [...new Set(record.assetPaths.filter((assetPath) => /_hinh\d+\.(png|jpe?g|webp)$/i.test(assetPath)))]
}

function buildSchoolExamAssetUrl(pdfUrl: string, assetPath: string) {
  if (/^https?:\/\//i.test(assetPath)) {
    return assetPath
  }

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

