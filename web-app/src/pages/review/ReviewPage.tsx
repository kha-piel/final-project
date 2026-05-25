import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { MarkdownContent } from '../../components/ui/MarkdownContent'
import { PageCard } from '../../components/ui/PageCard'
import { buildSubmissionSummary } from '../../features/exam/core/exam-session'
import { requestWeaknessAnalysis } from '../../features/exam/services/exam-ai-service'
import {
  fetchPersistedAttemptReview,
  type PersistedAttemptReview,
} from '../../features/exam/services/exam-review-service'
import { useExamDraftStore } from '../../features/exam/store/exam-draft-store'
import { useExamRuntimeStore } from '../../features/exam/store/exam-runtime-store'
import { useFlaggedWrongQuestionStore } from '../../features/practice/store/flagged-wrong-question-store'
import { RecommendedReviewLinks } from '../../features/review/components/RecommendedReviewLinks'
import {
  inferKnowledgeReviewTopics,
  type KnowledgeReviewTopic,
} from '../../features/review/knowledge-review-topics'

export function ReviewPage() {
  const { sessionId = '' } = useParams()
  const session = useExamDraftStore((state) => state.sessions[sessionId] ?? null)
  const runtime = useExamRuntimeStore((state) => state.sessions[sessionId] ?? null)

  const summary = useMemo(() => {
    if (!session || !runtime) {
      return null
    }
    return buildSubmissionSummary(session, runtime)
  }, [runtime, session])

  const [persistedReview, setPersistedReview] = useState<PersistedAttemptReview | null>(null)
  const [isLoadingPersistedReview, setIsLoadingPersistedReview] = useState(false)
  const [persistedReviewError, setPersistedReviewError] = useState('')

  useEffect(() => {
    if (session && runtime && summary) {
      return
    }

    let isMounted = true
    setIsLoadingPersistedReview(true)
    setPersistedReviewError('')

    void fetchPersistedAttemptReview(sessionId)
      .then((result) => {
        if (!isMounted) {
          return
        }
        setPersistedReview(result)
      })
      .catch((error: unknown) => {
        if (!isMounted) {
          return
        }
        setPersistedReviewError(
          error instanceof Error ? error.message : 'Khong the tai review da luu.',
        )
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingPersistedReview(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [runtime, session, sessionId, summary])

  if (session && runtime && summary) {
    return (
      <LocalReviewContent
        sessionDifficultyLabel={session.difficultyLabel}
        sessionDifficultyLevel={session.difficultyLevel}
        sessionQuestions={session.questions}
        sessionSubjectId={session.subjectId}
        sessionSubjectName={session.subjectName}
        sessionTopicId={session.topicId}
        sessionTitle={session.title}
        sessionTopicName={session.topicName}
        summary={summary}
      />
    )
  }

  if (isLoadingPersistedReview) {
    return (
      <PageCard title="Dang tai review" description="Dang doc ket qua bai lam tu Supabase.">
        <p style={styles.text}>Vui long doi trong giay lat.</p>
      </PageCard>
    )
  }

  if (persistedReview) {
    return <PersistedReviewContent review={persistedReview} />
  }

  if (!session || !runtime || !summary) {
    return (
      <PageCard
        title="Review Session Not Found"
        description="Khong tim thay du lieu tong ket cho session nay."
      >
        {persistedReviewError ? <p style={styles.error}>{persistedReviewError}</p> : null}
        <p style={styles.text}>
          Hay quay lai <Link to="/dashboard">dashboard</Link> va tao de moi.
        </p>
      </PageCard>
    )
  }
}

function LocalReviewContent({
  sessionDifficultyLabel,
  sessionDifficultyLevel,
  sessionQuestions,
  sessionSubjectId,
  sessionTopicName,
  sessionSubjectName,
  sessionTopicId,
  sessionTitle,
  summary,
}: {
  sessionDifficultyLabel: string
  sessionDifficultyLevel: number
  sessionQuestions: ReturnType<typeof useExamDraftStore.getState>['sessions'][string]['questions']
  sessionSubjectId: string
  sessionTopicName: string
  sessionSubjectName: string
  sessionTopicId: string
  sessionTitle: string
  summary: ReturnType<typeof buildSubmissionSummary>
}) {
  return (
    <PageCard
      title="Tong ket On Tap"
      description={`${sessionTitle} | Diem ${summary.score}/10 | ${summary.passed ? 'Dat' : 'Chua dat'}`}
    >
      <ReviewActionRow />
      <ReviewSummaryBody
        allowFlagging
        difficultyLabel={sessionDifficultyLabel}
        questionBank={sessionQuestions}
        sessionDifficultyLevel={sessionDifficultyLevel}
        sessionSubjectId={sessionSubjectId}
        sessionSubjectName={sessionSubjectName}
        sessionTopicId={sessionTopicId}
        sessionTopicName={sessionTopicName}
        summary={summary}
        topicLabel={buildTopicLabel(sessionSubjectName, sessionTopicName)}
      />
    </PageCard>
  )
}

function PersistedReviewContent({ review }: { review: PersistedAttemptReview }) {
  return (
    <PageCard
      title="Tong ket On Tap"
      description={`${review.examTitle} | ${review.subjectName} | ${review.topicName} | Diem ${review.score}/10`}
    >
      <p style={styles.text}>
        Do kho: {review.difficultyLabel} | Trang thai: {review.status} | Hoan tat:{' '}
        {review.completedAt ? new Date(review.completedAt).toLocaleString('vi-VN') : '--'}
      </p>
      <ReviewActionRow />
      <ReviewSummaryBody
        allowFlagging={false}
        difficultyLabel={review.difficultyLabel}
        sessionTopicName={review.topicName}
        summary={review}
        topicLabel={buildTopicLabel(review.subjectName, review.topicName)}
      />
    </PageCard>
  )
}

function ReviewActionRow() {
  return (
    <div style={styles.actionRow}>
      <Link style={styles.secondaryLink} to="/dashboard">
        Quay lai dashboard
      </Link>
      <Link style={styles.primaryLink} to="/home">
        Ve trang chu
      </Link>
    </div>
  )
}

function ReviewSummaryBody({
  allowFlagging,
  difficultyLabel,
  questionBank,
  sessionDifficultyLevel,
  sessionSubjectId,
  sessionSubjectName,
  sessionTopicId,
  sessionTopicName,
  summary,
  topicLabel,
}: {
  allowFlagging: boolean
  difficultyLabel: string
  questionBank?: ReturnType<typeof useExamDraftStore.getState>['sessions'][string]['questions']
  sessionDifficultyLevel?: number
  sessionSubjectId?: string
  sessionSubjectName?: string
  sessionTopicId?: string
  sessionTopicName: string
  summary: {
    score: number
    correctCount: number
    wrongCount: number
    skippedCount: number
    totalQuestions: number
    timeTakenSeconds: number
    reviewItems: {
      questionId: string
      questionContent: string
      selectedAnswerText: string
      correctAnswerText: string
      correct: boolean
      explanation?: string
    }[]
  }
  topicLabel: string
}) {
  const [weaknessAnalysis, setWeaknessAnalysis] = useState('')
  const [recommendedTopics, setRecommendedTopics] = useState<KnowledgeReviewTopic[]>([])
  const [analysisError, setAnalysisError] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const flaggedItems = useFlaggedWrongQuestionStore((state) => state.items)
  const upsertFlaggedQuestion = useFlaggedWrongQuestionStore((state) => state.upsertFlaggedQuestion)
  const removeFlaggedQuestion = useFlaggedWrongQuestionStore((state) => state.removeFlaggedQuestion)

  const questionMap = useMemo(
    () =>
      (questionBank ?? []).reduce<Record<string, NonNullable<typeof questionBank>[number]>>((acc, item) => {
        acc[item.questionId] = item
        return acc
      }, {}),
    [questionBank],
  )

  const flaggedCount = useMemo(() => {
    if (!allowFlagging || !sessionSubjectId || !sessionTopicId) {
      return 0
    }

    return summary.reviewItems.filter((item) => {
      if (item.correct) {
        return false
      }

      return Boolean(flaggedItems[`${sessionSubjectId}::${sessionTopicId}::${item.questionId}`])
    }).length
  }, [allowFlagging, flaggedItems, sessionSubjectId, sessionTopicId, summary.reviewItems])

  async function handleAnalyzeWeaknesses() {
    const wrongItems = summary.reviewItems
      .filter((item) => !item.correct)
      .map((item) => ({
        questionId: item.questionId,
        questionContent: item.questionContent,
        topic: buildWeaknessTopicLabel({
          fallbackTopicLabel: topicLabel,
          question: questionMap[item.questionId],
          sessionTopicName,
        }),
        userAnswer: item.selectedAnswerText,
        correctAnswer: item.correctAnswerText,
      }))
    const recommendationInputs = summary.reviewItems
      .filter((item) => !item.correct)
      .flatMap((item) => {
        const question = questionMap[item.questionId]
        return [
          item.questionContent,
          topicLabel,
          sessionTopicName,
          question?.topicId ?? '',
          question?.obsidianSourcePath ?? '',
        ]
      })

    if (wrongItems.length === 0) {
      setAnalysisError('')
      setRecommendedTopics([])
      setWeaknessAnalysis(
        'Ban khong co cau sai nao trong bai nay. Hay tiep tuc nang do kho de kiem tra do vung kien thuc.',
      )
      return
    }

    setIsAnalyzing(true)
    setAnalysisError('')

    try {
      const result = await requestWeaknessAnalysis(wrongItems)
      setWeaknessAnalysis(result)
      setRecommendedTopics(
        inferKnowledgeReviewTopics([...recommendationInputs, result]),
      )
    } catch (error) {
      setAnalysisError(
        error instanceof Error ? error.message : 'Khong the lay phan tich tong quan luc nay.',
      )
    } finally {
      setIsAnalyzing(false)
    }
  }

  function handleToggleFlag(questionId: string) {
    if (!allowFlagging || !sessionSubjectId || !sessionSubjectName || !sessionTopicId || sessionDifficultyLevel === undefined) {
      return
    }

    const flaggedId = `${sessionSubjectId}::${sessionTopicId}::${questionId}`
    if (flaggedItems[flaggedId]) {
      removeFlaggedQuestion({
        subjectId: sessionSubjectId,
        topicId: sessionTopicId,
        questionId,
      })
      return
    }

    const question = questionMap[questionId]
    if (!question) {
      return
    }

    upsertFlaggedQuestion({
      questionId,
      subjectId: sessionSubjectId,
      subjectName: sessionSubjectName,
      topicId: sessionTopicId,
      topicName: sessionTopicName,
      difficultyLevel: sessionDifficultyLevel,
      difficultyLabel,
      question,
    })
  }

  function handleFlagAllWrongQuestions() {
    if (!allowFlagging || !sessionSubjectId || !sessionSubjectName || !sessionTopicId || sessionDifficultyLevel === undefined) {
      return
    }

    summary.reviewItems.forEach((item) => {
      if (item.correct) {
        return
      }

      const question = questionMap[item.questionId]
      if (!question) {
        return
      }

      upsertFlaggedQuestion({
        questionId: item.questionId,
        subjectId: sessionSubjectId,
        subjectName: sessionSubjectName,
        topicId: sessionTopicId,
        topicName: sessionTopicName,
        difficultyLevel: sessionDifficultyLevel,
        difficultyLabel,
        question,
      })
    })
  }

  return (
    <>
      <div style={styles.analysisSection}>
        <button
          disabled={isAnalyzing}
          onClick={() => void handleAnalyzeWeaknesses()}
          style={styles.analysisButton}
          type="button"
        >
          {isAnalyzing ? 'AI dang phan tich tong quan...' : 'AI Phan tich tong quan diem yeu'}
        </button>

        {isAnalyzing ? (
          <div style={styles.analysisCard}>
            <div style={styles.analysisHeader}>
              <div style={styles.analysisBadge}>AI</div>
              <div>
                <strong style={styles.analysisTitle}>Dang doc bai lam va tong hop diem yeu</strong>
                <p style={styles.analysisSubtitle}>
                  Gemini dang xem nhom cau sai va tim chuyen de ban hong nhieu nhat.
                </p>
              </div>
            </div>
            <div style={styles.skeletonStack}>
              <div style={{ ...styles.skeletonBar, width: '38%' }} />
              <div style={{ ...styles.skeletonBar, width: '100%' }} />
              <div style={{ ...styles.skeletonBar, width: '92%' }} />
              <div style={{ ...styles.skeletonBar, width: '76%' }} />
            </div>
          </div>
        ) : null}

        {!isAnalyzing && weaknessAnalysis ? (
          <div style={styles.analysisCard}>
            <div style={styles.analysisHeader}>
              <div style={styles.analysisBadge}>AI</div>
              <div>
                <strong style={styles.analysisTitle}>AI phan tich tong quan diem yeu</strong>
                <p style={styles.analysisSubtitle}>
                  Tom tat nhanh cac lo hong kien thuc de uu tien on tap.
                </p>
              </div>
            </div>
            <p style={styles.analysisText}>{weaknessAnalysis}</p>
            <RecommendedReviewLinks topics={recommendedTopics} />
          </div>
        ) : null}

        {!isAnalyzing && analysisError ? <p style={styles.error}>{analysisError}</p> : null}
      </div>

      {allowFlagging ? (
        <div style={styles.flagPanel}>
          <div>
            <div style={styles.flagPanelTitle}>Cam co cau sai de on lai</div>
            <p style={styles.flagPanelText}>
              Da cam co {flaggedCount}/{summary.wrongCount} cau sai trong bai nay. Cac cau nay se duoc dua vao Dashboard de tao phien on tap lai.
            </p>
          </div>
          <button
            disabled={summary.wrongCount === 0}
            onClick={handleFlagAllWrongQuestions}
            style={styles.flagAllButton}
            type="button"
          >
            Cam co tat ca cau sai
          </button>
        </div>
      ) : null}

      <div style={styles.metricRow}>
        <MetricPill label="Diem" value={`${summary.score}/10`} />
        <MetricPill label="Dung" value={`${summary.correctCount}`} />
        <MetricPill label="Sai" value={`${summary.wrongCount}`} />
        <MetricPill label="Bo qua" value={`${summary.skippedCount}`} />
        <MetricPill label="Tong so cau" value={`${summary.totalQuestions}`} />
        <MetricPill label="Thoi gian" value={formatDuration(summary.timeTakenSeconds)} />
      </div>

      <div style={styles.reviewList}>
        {summary.reviewItems.map((item, index) => (
          <article key={item.questionId} style={styles.card}>
            <div style={styles.cardTopRow}>
              <div style={styles.cardOrder}>Cau {index + 1}</div>
              {allowFlagging && !item.correct && sessionSubjectId && sessionTopicId ? (
                <button
                  onClick={() => handleToggleFlag(item.questionId)}
                  style={
                    flaggedItems[`${sessionSubjectId}::${sessionTopicId}::${item.questionId}`]
                      ? styles.flaggedButton
                      : styles.flagButton
                  }
                  type="button"
                >
                  {flaggedItems[`${sessionSubjectId}::${sessionTopicId}::${item.questionId}`]
                    ? 'Bo cam co'
                    : 'Cam co cau nay'}
                </button>
              ) : null}
            </div>
            <div style={styles.topicPill}>Chuyen de: {topicLabel}</div>
            <div style={styles.cardQuestion}>
              <MarkdownContent content={item.questionContent} className="text-base leading-8 text-slate-900" />
            </div>
            <div
              style={{
                ...styles.cardAnswer,
                color: item.correct ? '#15803d' : '#b91c1c',
              }}
            >
              <strong>Ban chon:</strong>
              <div style={styles.answerMarkdown}>
                <MarkdownContent content={item.selectedAnswerText} className="text-sm leading-7" />
              </div>
            </div>
            <div style={{ ...styles.cardAnswer, color: '#0f766e' }}>
              <strong>Dap an dung:</strong>
              <div style={styles.answerMarkdown}>
                <MarkdownContent content={item.correctAnswerText} className="text-sm leading-7" />
              </div>
            </div>
            <div style={styles.cardTag}>{item.correct ? 'Dung' : 'Sai / chua dung'}</div>
            <div style={styles.explanationWrap}>
              <div style={styles.explanationLabel}>AI giai thich</div>
              <div style={styles.explanationBox}>
                <MarkdownContent
                  content={
                    item.explanation?.trim()
                      ? item.explanation
                      : 'Chua co giai thich AI cho cau hoi nay.'
                  }
                  className="text-sm leading-7 text-slate-700"
                />
              </div>
            </div>
          </article>
        ))}
      </div>
    </>
  )
}

function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <div style={styles.metric}>
      <strong>{label}:</strong> {value}
    </div>
  )
}

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function buildTopicLabel(subjectName?: string | null, topicName?: string | null) {
  const subject = subjectName?.trim()
  const topic = topicName?.trim()

  if (subject && topic) {
    return `${subject} - ${topic}`
  }
  if (topic) {
    return topic
  }
  if (subject) {
    return subject
  }
  return 'Chua xac dinh chuyen de'
}

function buildWeaknessTopicLabel(input: {
  fallbackTopicLabel: string
  question?: ReturnType<typeof useExamDraftStore.getState>['sessions'][string]['questions'][number]
  sessionTopicName: string
}) {
  const sourcePath = input.question?.obsidianSourcePath?.trim()
  if (sourcePath) {
    return `${input.fallbackTopicLabel} | ${sourcePath}`
  }

  const topicId = input.question?.topicId?.trim()
  if (topicId && topicId !== 'practice-mock') {
    return `${input.sessionTopicName} | ${topicId}`
  }

  return input.fallbackTopicLabel
}

const styles = {
  text: {
    margin: 0,
    color: '#5d7491',
  },
  error: {
    color: '#b42318',
    fontWeight: 600,
    marginBottom: '12px',
  },
  actionRow: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '10px',
    marginBottom: '18px',
  },
  analysisSection: {
    marginBottom: '22px',
  },
  analysisButton: {
    display: 'inline-block',
    borderRadius: '18px',
    border: 0,
    padding: '14px 18px',
    background: 'linear-gradient(135deg, #0f766e 0%, #2563eb 100%)',
    color: '#ffffff',
    fontWeight: 800,
    marginBottom: '16px',
  },
  analysisCard: {
    borderRadius: '22px',
    padding: '18px',
    background:
      'linear-gradient(#ffffff, #ffffff) padding-box, linear-gradient(135deg, #38bdf8, #2563eb, #f59e0b) border-box',
    border: '1.5px solid transparent',
    boxShadow: '0 14px 30px rgba(16, 35, 60, 0.08)',
  },
  analysisHeader: {
    display: 'flex',
    gap: '14px',
    alignItems: 'flex-start',
    marginBottom: '12px',
  },
  analysisBadge: {
    width: '42px',
    height: '42px',
    borderRadius: '999px',
    background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
    color: '#ffffff',
    fontWeight: 800,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  analysisTitle: {
    display: 'block',
    color: '#10233c',
    marginBottom: '4px',
  },
  analysisSubtitle: {
    margin: 0,
    color: '#607a97',
  },
  analysisText: {
    margin: 0,
    color: '#24415e',
    lineHeight: 1.6,
    whiteSpace: 'pre-wrap' as const,
  },
  skeletonStack: {
    display: 'grid',
    gap: '10px',
  },
  skeletonBar: {
    height: '12px',
    borderRadius: '999px',
    background: 'linear-gradient(90deg, #e2e8f0 0%, #f8fafc 50%, #e2e8f0 100%)',
  },
  primaryLink: {
    display: 'inline-block',
    borderRadius: '999px',
    padding: '10px 14px',
    backgroundColor: '#10233c',
    color: '#ffffff',
    fontWeight: 700,
    textDecoration: 'none',
  },
  secondaryLink: {
    display: 'inline-block',
    borderRadius: '999px',
    padding: '10px 14px',
    backgroundColor: '#ffffff',
    border: '1px solid #d7e3ef',
    color: '#24415e',
    fontWeight: 700,
    textDecoration: 'none',
  },
  metricRow: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '12px',
    marginBottom: '20px',
  },
  flagPanel: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap' as const,
    marginBottom: '20px',
    borderRadius: '20px',
    padding: '16px 18px',
    border: '1px solid #fde68a',
    backgroundColor: '#fffbeb',
  },
  flagPanelTitle: {
    color: '#92400e',
    fontWeight: 800,
    marginBottom: '4px',
  },
  flagPanelText: {
    margin: 0,
    color: '#a16207',
  },
  flagAllButton: {
    borderRadius: '999px',
    border: 0,
    padding: '10px 14px',
    backgroundColor: '#f59e0b',
    color: '#ffffff',
    fontWeight: 800,
  },
  metric: {
    borderRadius: '999px',
    padding: '10px 14px',
    backgroundColor: '#edf5ff',
    border: '1px solid #d4e4f6',
    color: '#24415e',
    fontWeight: 700,
  },
  reviewList: {
    display: 'grid',
    gap: '16px',
  },
  card: {
    borderRadius: '22px',
    padding: '20px',
    backgroundColor: '#ffffff',
    border: '1px solid #d7e3ef',
    boxShadow: '0 12px 28px rgba(16, 35, 60, 0.06)',
  },
  cardTopRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '10px',
  },
  cardOrder: {
    color: '#2563eb',
    fontWeight: 700,
  },
  flagButton: {
    borderRadius: '999px',
    border: '1px solid #fcd34d',
    padding: '8px 12px',
    backgroundColor: '#fffbeb',
    color: '#b45309',
    fontWeight: 700,
  },
  flaggedButton: {
    borderRadius: '999px',
    border: '1px solid #f59e0b',
    padding: '8px 12px',
    backgroundColor: '#f59e0b',
    color: '#ffffff',
    fontWeight: 700,
  },
  cardQuestion: {
    margin: '0 0 10px',
    color: '#10233c',
  },
  topicPill: {
    display: 'inline-block',
    borderRadius: '999px',
    padding: '8px 12px',
    backgroundColor: '#ecfdf5',
    border: '1px solid #a7f3d0',
    color: '#0f766e',
    fontWeight: 700,
    marginBottom: '12px',
  },
  cardAnswer: {
    margin: '8px 0',
    fontWeight: 600,
  },
  answerMarkdown: {
    marginTop: '4px',
    fontWeight: 400,
  },
  cardTag: {
    display: 'inline-block',
    borderRadius: '999px',
    padding: '8px 12px',
    backgroundColor: '#f8fbff',
    border: '1px solid #d7e3ef',
    color: '#24415e',
    fontWeight: 700,
    marginTop: '6px',
  },
  explanationWrap: {
    marginTop: '16px',
  },
  explanationLabel: {
    color: '#1d4ed8',
    fontWeight: 700,
    marginBottom: '10px',
  },
  explanationBox: {
    borderRadius: '16px',
    padding: '16px',
    backgroundColor: '#f8fbff',
    border: '1px solid #d7e3ef',
    color: '#36506c',
  },
}
