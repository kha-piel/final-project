import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { NavLinks } from '../../components/ui/NavLinks'
import { PageCard } from '../../components/ui/PageCard'
import { buildSubmissionSummary } from '../../features/exam/core/exam-session'
import {
  fetchPersistedAttemptReview,
  type PersistedAttemptReview,
} from '../../features/exam/services/exam-review-service'
import { useExamDraftStore } from '../../features/exam/store/exam-draft-store'
import { useExamRuntimeStore } from '../../features/exam/store/exam-runtime-store'

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
    return <LocalReviewContent sessionTitle={session.title} summary={summary} />
  }

  if (isLoadingPersistedReview) {
    return (
      <>
        <NavLinks />
        <PageCard title="Dang tai review" description="Dang doc ket qua bai lam tu Supabase.">
          <p style={styles.text}>Vui long doi trong giay lat.</p>
        </PageCard>
      </>
    )
  }

  if (persistedReview) {
    return <PersistedReviewContent review={persistedReview} />
  }

  if (!session || !runtime || !summary) {
    return (
      <>
        <NavLinks />
        <PageCard
          title="Review Session Not Found"
          description="Khong tim thay du lieu tong ket cho session nay."
        >
          {persistedReviewError ? <p style={styles.error}>{persistedReviewError}</p> : null}
          <p style={styles.text}>
            Hay quay lai <Link to="/dashboard">dashboard</Link> va tao de moi.
          </p>
        </PageCard>
      </>
    )
  }
}

function LocalReviewContent({
  sessionTitle,
  summary,
}: {
  sessionTitle: string
  summary: ReturnType<typeof buildSubmissionSummary>
}) {
  return (
    <>
      <NavLinks />
      <PageCard
        title="Tong ket On Tap"
        description={`${sessionTitle} | Diem ${summary.score}/10 | ${summary.passed ? 'Dat' : 'Chua dat'}`}
      >
        <ReviewActionRow />
        <ReviewSummaryBody summary={summary} />
      </PageCard>
    </>
  )
}

function PersistedReviewContent({ review }: { review: PersistedAttemptReview }) {
  return (
    <>
      <NavLinks />
      <PageCard
        title="Tong ket On Tap"
        description={`${review.examTitle} | ${review.subjectName} | ${review.topicName} | Diem ${review.score}/10`}
      >
        <p style={styles.text}>
          Do kho: {review.difficultyLabel} | Trang thai: {review.status} | Hoan tat:{' '}
          {review.completedAt ? new Date(review.completedAt).toLocaleString('vi-VN') : '--'}
        </p>
        <ReviewActionRow />
        <ReviewSummaryBody summary={review} />
      </PageCard>
    </>
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
  summary,
}: {
  summary: {
    score: number
    correctCount: number
    wrongCount: number
    skippedCount: number
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
}) {
  return (
    <>
      <div style={styles.metricRow}>
        <MetricPill label="Diem" value={`${summary.score}/10`} />
        <MetricPill label="Dung" value={`${summary.correctCount}`} />
        <MetricPill label="Sai" value={`${summary.wrongCount}`} />
        <MetricPill label="Bo qua" value={`${summary.skippedCount}`} />
        <MetricPill label="Thoi gian" value={formatDuration(summary.timeTakenSeconds)} />
      </div>

      <div style={styles.reviewList}>
        {summary.reviewItems.map((item, index) => (
          <article key={item.questionId} style={styles.card}>
            <div style={styles.cardOrder}>Cau {index + 1}</div>
            <h3 style={styles.cardQuestion}>{item.questionContent}</h3>
            <p
              style={{
                ...styles.cardAnswer,
                color: item.correct ? '#15803d' : '#b91c1c',
              }}
            >
              Ban chon: {item.selectedAnswerText}
            </p>
            <p style={{ ...styles.cardAnswer, color: '#0f766e' }}>
              Dap an dung: {item.correctAnswerText}
            </p>
            <div style={styles.cardTag}>{item.correct ? 'Dung' : 'Sai / chua dung'}</div>

            <details style={styles.details}>
              <summary style={styles.summaryToggle}>Xem lai giai thich AI</summary>
              <div style={styles.explanationBox}>
                {item.explanation?.trim()
                  ? item.explanation
                  : 'Chua co giai thich AI cho cau hoi nay.'}
              </div>
            </details>
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
  cardOrder: {
    color: '#2563eb',
    fontWeight: 700,
    marginBottom: '10px',
  },
  cardQuestion: {
    margin: '0 0 10px',
    color: '#10233c',
  },
  cardAnswer: {
    margin: '8px 0',
    fontWeight: 600,
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
  details: {
    marginTop: '16px',
  },
  summaryToggle: {
    cursor: 'pointer',
    color: '#1d4ed8',
    fontWeight: 700,
  },
  explanationBox: {
    marginTop: '12px',
    borderRadius: '16px',
    padding: '16px',
    backgroundColor: '#f8fbff',
    border: '1px solid #d7e3ef',
    whiteSpace: 'pre-wrap' as const,
    color: '#36506c',
  },
}
