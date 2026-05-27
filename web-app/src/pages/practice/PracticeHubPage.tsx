import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useExamDraftStore } from '../../features/exam/store/exam-draft-store'
import {
  createPracticeExamSession,
  getPracticeBlueprints,
  searchPracticeExamCatalog,
} from '../../features/practice/services/practice-service'
import { fetchSchoolExamCatalog } from '../../features/practice/services/school-exam-service'
import type { PracticeExamCatalogItem } from '../../features/practice/types/practice-types'

const SUBJECT_ID = 'TOAN'
const SUBJECT_NAME = 'Toan hoc'

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
            error instanceof Error ? error.message : 'Khong the tai danh sach de truong.',
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
      setErrorMessage(error instanceof Error ? error.message : 'Khong the tao de thi thu.')
    }
  }

  return (
    <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Thu vien de truong
            </div>
            <h2 className="mt-2 text-2xl font-bold text-slate-950">Tim kiem de theo truong</h2>
          </div>
          <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
            {catalogItems.length} de tim thay
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-[1fr_180px]">
          <input
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white"
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Tim theo ten truong, ten de, tag..."
            value={keyword}
          />
          <select
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white"
            onChange={(event) =>
              setYearFilter(event.target.value === 'all' ? 'all' : Number(event.target.value))
            }
            value={yearFilter}
          >
            <option value="all">Tat ca nam</option>
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
              Dang tai danh sach de truong...
            </div>
          ) : catalogItems.length === 0 ? (
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-600">
              Chua co de truong nao trong Supabase.
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
                      Lam de truong
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
              </article>
            ))
          )}
        </div>
      </section>

      <section className="space-y-6">
        <div className="rounded-[28px] border border-slate-200 bg-slate-950 p-6 text-white shadow-[0_20px_60px_rgba(15,23,42,0.14)]">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-200">
            Tao de thi thu
          </div>
          <h2 className="mt-3 text-2xl font-bold">Sinh de ngau nhien theo blueprint</h2>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            De se duoc boc ngau nhien tu kho cau hoi de truong tren Supabase, uu tien cau cua truong
            ban chon, sau do fallback sang nhieu truong neu kho khong du.
          </p>

          <div className="mt-5 grid gap-4">
            <label className="grid gap-2 text-sm">
              <span className="font-medium text-slate-200">Blueprint dang dung</span>
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
              <span className="font-medium text-slate-200">Uu tien cau hoi cua truong</span>
              <select
                className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400"
                onChange={(event) => setSelectedSchoolName(event.target.value)}
                value={selectedSchoolName}
              >
                <option value="">Tong hop nhieu truong</option>
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
              <p className="mt-2 text-sm leading-6 text-slate-300">{selectedBlueprint.description}</p>
              <div className="mt-4 grid gap-3">
                {selectedBlueprint.sections.map((section) => (
                  <div
                    key={section.id}
                    className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3"
                  >
                    <div className="flex items-center justify-between gap-3 text-sm font-semibold">
                      <span>{section.title}</span>
                      <span>{section.count} cau</span>
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
            Tao de va vao bai ngay
          </button>
        </div>
      </section>
    </section>
  )
}
