import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useExamDraftStore } from '../../features/exam/store/exam-draft-store'
import {
  createPracticeExamSession,
  getPracticeBlueprints,
  getPracticeQuestionBankOverview,
  searchPracticeExamCatalog,
} from '../../features/practice/services/practice-service'
import { fetchSchoolExamCatalog } from '../../features/practice/services/school-exam-service'
import type { PracticeExamCatalogItem } from '../../features/practice/types/practice-types'

const SUBJECT_ID = 'TOAN'
const SUBJECT_NAME = 'Toán học'

export function PracticeHubPage() {
  const navigate = useNavigate()
  const createSession = useExamDraftStore((state) => state.createSession)

  const [keyword, setKeyword] = useState('')
  const [yearFilter, setYearFilter] = useState<'all' | number>('all')
  const [selectedSchoolName, setSelectedSchoolName] = useState('')
  const [selectedBlueprintId, setSelectedBlueprintId] = useState(getPracticeBlueprints()[0]?.blueprintId ?? '')
  const [errorMessage, setErrorMessage] = useState('')
  const [catalogItemsRaw, setCatalogItemsRaw] = useState<PracticeExamCatalogItem[]>([])
  const [catalogErrorMessage, setCatalogErrorMessage] = useState('')
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(true)
  const [bankOverview, setBankOverview] = useState({
    totalQuestions: 0,
    typeCounts: {} as Record<string, number>,
    levelCounts: {} as Record<number, number>,
    schools: 0,
  })
  const [isLoadingQuestionBank, setIsLoadingQuestionBank] = useState(true)

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    let isMounted = true
    setIsLoadingCatalog(true)
    setCatalogErrorMessage('')

    void fetchSchoolExamCatalog()
      .then((items) => {
        if (isMounted) {
          setCatalogItemsRaw(items)
        }
      })
      .catch((error: unknown) => {
        if (isMounted) {
          setCatalogErrorMessage(
            error instanceof Error ? error.message : 'Không thể tải danh sách đề trường.',
          )
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingCatalog(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])
  /* eslint-enable react-hooks/set-state-in-effect */

  const catalogItems = useMemo(
    () =>
      searchPracticeExamCatalog(catalogItemsRaw, {
        keyword,
        subjectId: SUBJECT_ID,
        year: yearFilter,
      }),
    [catalogItemsRaw, keyword, yearFilter],
  )

  const blueprints = useMemo(() => getPracticeBlueprints(), [])
  const years = useMemo(
    () => Array.from(new Set(catalogItemsRaw.map((item) => item.year))).sort((left, right) => right - left),
    [catalogItemsRaw],
  )
  const schoolOptions = useMemo(
    () =>
      Array.from(new Set(catalogItemsRaw.map((item) => item.schoolName))).sort((left, right) =>
        left.localeCompare(right),
      ),
    [catalogItemsRaw],
  )

  const selectedBlueprint = blueprints.find((blueprint) => blueprint.blueprintId === selectedBlueprintId) ?? null

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    let isMounted = true
    setIsLoadingQuestionBank(true)

    void getPracticeQuestionBankOverview(SUBJECT_ID)
      .then((overview) => {
        if (isMounted) {
          setBankOverview(overview)
        }
      })
      .catch(() => {
        if (isMounted) {
          setBankOverview({
            totalQuestions: 0,
            typeCounts: {},
            levelCounts: {},
            schools: 0,
          })
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingQuestionBank(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])
  /* eslint-enable react-hooks/set-state-in-effect */

  async function handleGenerateExam() {
    setErrorMessage('')

    try {
      const session = await createPracticeExamSession({
        blueprintId: selectedBlueprintId,
        subjectId: SUBJECT_ID,
        subjectName: SUBJECT_NAME,
        preferredSchoolName: selectedSchoolName || undefined,
      })

      createSession(session)
      navigate(`/exam/${session.sessionId}`)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Không thể tạo đề thi thử.')
    }
  }

  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.18),_transparent_32%),linear-gradient(135deg,_#ffffff,_#eff6ff_58%,_#e0f2fe)] p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
        <div className="mb-4 inline-flex rounded-full border border-sky-300 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">
          Practice Engine
        </div>
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight text-slate-950 md:text-5xl">
              Tìm đề theo trường và tạo đề thi thử ngẫu nhiên theo đúng khung dạng bài.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-700">
              Đề trường được đọc từ Supabase kèm PDF, mã đề và answer key. Phần tạo đề tổng hợp vẫn
              dùng blueprint local để sinh session luyện tập nhanh.
            </p>
          </div>

          <div className="grid gap-3 rounded-[28px] border border-white/70 bg-white/70 p-5 backdrop-blur">
            <StatCard label="Đề trường" value={isLoadingCatalog ? '...' : `${catalogItemsRaw.length}`} />
            <StatCard label="Tổng câu hỏi thật" value={isLoadingQuestionBank ? '...' : `${bankOverview.totalQuestions}`} />
            <StatCard label="Số trường nguon" value={isLoadingQuestionBank ? '...' : `${bankOverview.schools}`} />
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Thư viện đề trường
              </div>
              <h2 className="mt-2 text-2xl font-bold text-slate-950">Tìm kiếm đề theo trường</h2>
            </div>
            <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
              {catalogItems.length} đề tìm thấy
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-[1fr_180px]">
            <input
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white"
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Tìm theo tên trường, tên đề, tag..."
              value={keyword}
            />
            <select
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white"
              onChange={(event) =>
                setYearFilter(event.target.value === 'all' ? 'all' : Number(event.target.value))
              }
              value={yearFilter}
            >
              <option value="all">Tất cả nam</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-5 grid gap-4">
            {catalogErrorMessage ? (
              <div className="rounded-[24px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-medium text-rose-700">
                {catalogErrorMessage}
              </div>
            ) : null}

            {isLoadingCatalog ? (
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-600">
                Đang tải danh sach đề trường...
              </div>
            ) : catalogItems.length === 0 ? (
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-600">
                Chưa có đề trường nao trong Supabase.
              </div>
            ) : (
              catalogItems.map((item) => (
                <article
                  key={item.examId}
                  className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 transition hover:border-sky-300 hover:bg-white"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{item.examTitle}</h3>
                      <p className="mt-1 text-sm text-slate-600">
                        {item.schoolName} | {item.city} | {item.year}
                      </p>
                    </div>
                    <button
                      className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-sky-300 hover:text-sky-700"
                      onClick={() => setSelectedSchoolName(item.schoolName)}
                      type="button"
                    >
                      Uu tien truong nay
                    </button>
                    {item.schoolExamPageId ? (
                      <Link
                        className="rounded-2xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                        to={`/practice/school-exams/${item.schoolExamPageId}`}
                      >
                        Lam đề trường
                      </Link>
                    ) : null}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  {item.sourcePath ? (
                    <p className="mt-4 text-xs text-slate-500">Nguồn data: {item.sourcePath}</p>
                  ) : null}
                </article>
              ))
            )}
          </div>
        </section>

        <section className="space-y-6">
          <div className="rounded-[28px] border border-slate-200 bg-slate-950 p-6 text-white shadow-[0_20px_60px_rgba(15,23,42,0.14)]">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-200">
              Tạo đề thi thử
            </div>
            <h2 className="mt-3 text-2xl font-bold">Sinh đề ngẫu nhiên theo blueprint</h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              Đề sẽ được bốc ngẫu nhiên từ kho câu hỏi đề trường trên Supabase, ưu tiên câu của trường
              bạn chọn, sau đó fallback sang nhiều trường nếu kho không đủ.
            </p>

            <div className="mt-5 grid gap-4">
              <label className="grid gap-2 text-sm">
                <span className="font-medium text-slate-200">Blueprint đang dùng</span>
                <select
                  className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400"
                  onChange={(event) => setSelectedBlueprintId(event.target.value)}
                  value={selectedBlueprintId}
                >
                  {blueprints.map((blueprint) => (
                    <option key={blueprint.blueprintId} value={blueprint.blueprintId}>
                      {blueprint.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2 text-sm">
                <span className="font-medium text-slate-200">Uu tien câu hỏi cua truong</span>
                <select
                  className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400"
                  onChange={(event) => setSelectedSchoolName(event.target.value)}
                  value={selectedSchoolName}
                >
                  <option value="">Tổng hợp nhieu truong</option>
                  {schoolOptions.map((schoolName) => (
                    <option key={schoolName} value={schoolName}>
                      {schoolName}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {selectedBlueprint ? (
              <div className="mt-5 rounded-[24px] border border-slate-800 bg-slate-900/70 p-5">
                <h3 className="text-lg font-semibold">{selectedBlueprint.name}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  {selectedBlueprint.description}
                </p>
                <div className="mt-4 grid gap-3">
                  {selectedBlueprint.sections.map((section) => (
                    <div
                      key={section.id}
                      className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3"
                    >
                      <div className="flex items-center justify-between gap-3 text-sm font-semibold">
                        <span>{section.title}</span>
                        <span>{section.count} câu</span>
                      </div>
                      <p className="mt-2 text-xs text-slate-400">
                        NB {section.levelCounts[1]} | TH {section.levelCounts[2]} | VD {section.levelCounts[3]} | VDC {section.levelCounts[4]}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {errorMessage ? <p className="mt-4 text-sm font-medium text-rose-300">{errorMessage}</p> : null}

            <button
              className="mt-5 w-full rounded-[22px] bg-sky-400 px-5 py-4 text-sm font-bold text-slate-950 transition hover:bg-sky-300"
              onClick={handleGenerateExam}
              type="button"
            >
              Tạo đề và vào bài ngay
            </button>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Tình trạng kho dữ liệu
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <InfoTile label="Multiple choice" value={`${bankOverview.typeCounts.multiple_choice ?? 0}`} />
              <InfoTile label="Đúng / Sai" value={`${bankOverview.typeCounts.true_false ?? 0}`} />
              <InfoTile label="Trả lời ngắn" value={`${bankOverview.typeCounts.short_answer ?? 0}`} />
              <InfoTile label="Mức VDC" value={`${bankOverview.levelCounts[4] ?? 0}`} />
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Blueprint tổng hợp đã dùng kho câu hỏi đề trường thật, có chống trùng câu và giới hạn
              số câu tối đa trên mỗi đề nguồn trước khi fallback.
            </p>
          </div>
        </section>
      </div>
    </section>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[24px] border border-white/80 bg-white px-5 py-4 shadow-[0_10px_30px_rgba(14,165,233,0.08)]">
      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</div>
      <div className="mt-2 text-3xl font-black text-slate-950">{value}</div>
    </div>
  )
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4">
      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</div>
      <div className="mt-2 text-2xl font-bold text-slate-950">{value}</div>
    </div>
  )
}
