import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { PageCard } from '../../components/ui/PageCard'
import { getSchoolExamById, normalizeAnswer } from '../../features/practice/services/school-exam-service'

export function SchoolExamPage() {
  const { examId = '' } = useParams()
  const exam = useMemo(() => getSchoolExamById(examId), [examId])
  const [remainingSeconds, setRemainingSeconds] = useState(0)
  const [selectedChoices, setSelectedChoices] = useState<Record<string, string>>({})
  const [selectedTrueFalse, setSelectedTrueFalse] = useState<Record<string, Record<string, boolean>>>({})
  const [shortAnswers, setShortAnswers] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (!exam) {
      return
    }

    setRemainingSeconds(exam.durationMinutes * 60)
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

  const summary = useMemo(() => {
    if (!exam) {
      return null
    }

    let correctCount = 0
    let answeredCount = 0
    const totalCount =
      exam.multipleChoiceQuestions.length + exam.trueFalseQuestions.length + exam.shortAnswerQuestions.length

    exam.multipleChoiceQuestions.forEach((question) => {
      const selected = selectedChoices[question.questionId]
      if (selected) {
        answeredCount += 1
      }
      if (selected === question.correctOptionId) {
        correctCount += 1
      }
    })

    exam.trueFalseQuestions.forEach((question) => {
      const selectedMap = selectedTrueFalse[question.questionId] ?? {}
      const fullyAnswered = question.statements.every((statement) => statement.statementId in selectedMap)
      if (fullyAnswered) {
        answeredCount += 1
      }
      if (
        fullyAnswered &&
        question.statements.every((statement) => selectedMap[statement.statementId] === statement.isCorrect)
      ) {
        correctCount += 1
      }
    })

    exam.shortAnswerQuestions.forEach((question) => {
      const value = shortAnswers[question.questionId]?.trim() ?? ''
      if (value) {
        answeredCount += 1
      }
      if (question.acceptedResponses.some((candidate) => normalizeAnswer(candidate) === normalizeAnswer(value))) {
        correctCount += 1
      }
    })

    return {
      answeredCount,
      correctCount,
      totalCount,
      score: Math.round((correctCount / totalCount) * 10 * 100) / 100,
    }
  }, [exam, selectedChoices, selectedTrueFalse, shortAnswers])

  if (!exam) {
    return (
      <PageCard title="Khong tim thay de truong" description="Exam id nay chua duoc khai bao trong kho du lieu.">
        <p style={styles.text}>
          Quay lai <Link to="/practice">practice hub</Link> de chon de khac.
        </p>
      </PageCard>
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
            <MetricPill label="Dap an cung cap" value={exam.answerKeyProvided ? 'Co' : 'Chua'} />
          </div>
        </div>
      </div>

      {submitted && summary ? (
        <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-800">
          Da nop bai. So cau dung: {summary.correctCount}/{summary.totalCount} | Diem tam tinh: {summary.score}/10
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
              <div>
                <h2 className="text-lg font-bold text-slate-950">Phieu tra loi</h2>
                <p className="text-sm text-slate-600">PDF ben trai, bai lam ben phai.</p>
              </div>
              <button
                className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
                onClick={() => setSubmitted(true)}
                type="button"
              >
                Nop bai
              </button>
            </div>
          </div>

          <div className="space-y-8">
            <QuestionSection
              description="Cau 1 den cau 12, moi cau chon 1 trong 4 dap an."
              title="Phan I. Trac nghiem nhieu lua chon"
            >
              <div className="space-y-4">
                {exam.multipleChoiceQuestions.map((question) => (
                  <article key={question.questionId} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-3 text-sm font-semibold text-slate-900">
                      Cau {question.questionNumber}. {question.prompt}
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {question.options.map((option) => {
                        const isSelected = selectedChoices[question.questionId] === option.optionId
                        return (
                          <label
                            key={option.optionId}
                            className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 text-sm transition ${
                              isSelected
                                ? 'border-sky-400 bg-white text-slate-950'
                                : 'border-slate-200 bg-white text-slate-700'
                            }`}
                          >
                            <input
                              checked={isSelected}
                              name={question.questionId}
                              onChange={() =>
                                setSelectedChoices((state) => ({
                                  ...state,
                                  [question.questionId]: option.optionId,
                                }))
                              }
                              type="radio"
                            />
                            <span>
                              <strong>{option.label}.</strong> {option.content}
                            </span>
                          </label>
                        )
                      })}
                    </div>
                    {submitted ? (
                      <p className="mt-3 text-sm text-slate-600">Dap an dung: {question.correctOptionId}</p>
                    ) : null}
                  </article>
                ))}
              </div>
            </QuestionSection>

            <QuestionSection
              description="Moi y co 2 cot D va S, giu dung cach to chuc dang bo de moi."
              title="Phan II. Dung / Sai"
            >
              <div className="space-y-4">
                {exam.trueFalseQuestions.map((question) => (
                  <article key={question.questionId} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-3 text-sm font-semibold text-slate-900">
                      Cau {question.questionNumber}. {question.prompt}
                    </div>
                    <div className="overflow-hidden rounded-[18px] border border-slate-200 bg-white">
                      <div className="grid grid-cols-[1fr_64px_64px] border-b border-slate-200 bg-slate-100 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                        <div className="px-4 py-3">Menh de</div>
                        <div className="border-l border-slate-200 px-4 py-3 text-center">D</div>
                        <div className="border-l border-slate-200 px-4 py-3 text-center">S</div>
                      </div>
                      {question.statements.map((statement) => {
                        const selected = selectedTrueFalse[question.questionId]?.[statement.statementId]
                        return (
                          <div
                            key={statement.statementId}
                            className="grid grid-cols-[1fr_64px_64px] border-b border-slate-200 text-sm last:border-b-0"
                          >
                            <div className="px-4 py-3 text-slate-700">
                              <strong>{statement.label})</strong> {statement.content}
                            </div>
                            <label className="flex items-center justify-center border-l border-slate-200">
                              <input
                                checked={selected === true}
                                onChange={() =>
                                  setSelectedTrueFalse((state) => ({
                                    ...state,
                                    [question.questionId]: {
                                      ...(state[question.questionId] ?? {}),
                                      [statement.statementId]: true,
                                    },
                                  }))
                                }
                                type="radio"
                              />
                            </label>
                            <label className="flex items-center justify-center border-l border-slate-200">
                              <input
                                checked={selected === false}
                                onChange={() =>
                                  setSelectedTrueFalse((state) => ({
                                    ...state,
                                    [question.questionId]: {
                                      ...(state[question.questionId] ?? {}),
                                      [statement.statementId]: false,
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
                        Dap an dung:{' '}
                        {question.statements
                          .map((statement) => `${statement.label.toUpperCase()}: ${statement.isCorrect ? 'D' : 'S'}`)
                          .join(' | ')}
                      </p>
                    ) : null}
                  </article>
                ))}
              </div>
            </QuestionSection>

            <QuestionSection
              description="Nhap dap an vao o trong, phuc vu dang tra loi ngan cua de."
              title="Phan III. Tra loi ngan"
            >
              <div className="space-y-4">
                {exam.shortAnswerQuestions.map((question) => (
                  <article key={question.questionId} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-3 text-sm font-semibold text-slate-900">
                      Cau {question.questionNumber}. {question.prompt}
                    </div>
                    <input
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-sky-400"
                      onChange={(event) =>
                        setShortAnswers((state) => ({
                          ...state,
                          [question.questionId]: event.target.value,
                        }))
                      }
                      placeholder="Nhap dap an..."
                      type="text"
                      value={shortAnswers[question.questionId] ?? ''}
                    />
                    {submitted ? (
                      <p className="mt-3 text-sm text-slate-600">
                        Dap an dung: {question.acceptedResponses.join(' / ')}
                      </p>
                    ) : null}
                  </article>
                ))}
              </div>
            </QuestionSection>
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

const styles = {
  text: {
    margin: 0,
    color: '#5d7491',
  },
}
