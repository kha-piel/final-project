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

const SUBJECT_OPTIONS = [
  { subjectId: 'TOAN', subjectName: 'Toán học', label: 'Toán' },
  { subjectId: 'VAT_LY', subjectName: 'Vật lý', label: 'Vật lý' },
  { subjectId: 'HOA_HOC', subjectName: 'Hóa học', label: 'Hóa học' },
]

const DEFAULT_SUBJECT_ID = SUBJECT_OPTIONS[0].subjectId

export function PracticeHubPage() {
  const navigate = useNavigate()
  const createSession = useExamDraftStore((state) => state.createSession)

  const [keyword, setKeyword] = useState('')
  const [yearFilter, setYearFilter] = useState<'all' | number>('all')
  const [selectedSubjectId, setSelectedSubjectId] = useState(DEFAULT_SUBJECT_ID)
  const [selectedSchoolName, setSelectedSchoolName] = useState('')
  const [selectedBlueprintId, setSelectedBlueprintId] = useState(getPracticeBlueprints()[0]?.blueprintId ?? '')
  const [errorMessage, setErrorMessage] = useState('')
  const [catalogItemsRaw, setCatalogItemsRaw] = useState<PracticeExamCatalogItem[]>([])
  const [catalogErrorMessage, setCatalogErrorMessage] = useState('')
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(true)

  const [activeTab, setActiveTab] = useState<'school' | 'random'>('school')

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
        subjectId: selectedSubjectId,
        year: yearFilter,
      }),
    [catalogItemsRaw, keyword, selectedSubjectId, yearFilter],
  )

  const blueprints = useMemo(() => getPracticeBlueprints(), [])
  const subjectBlueprints = useMemo(
    () => blueprints.filter((blueprint) => blueprint.subjectId === selectedSubjectId),
    [blueprints, selectedSubjectId],
  )
  const years = useMemo(
    () =>
      Array.from(
        new Set(
          catalogItemsRaw
            .filter((item) => item.subjectId === selectedSubjectId)
            .map((item) => item.year),
        ),
      ).sort((left, right) => right - left),
    [catalogItemsRaw, selectedSubjectId],
  )
  const schoolOptions = useMemo(
    () =>
      Array.from(
        new Set(
          catalogItemsRaw
            .filter((item) => item.subjectId === selectedSubjectId)
            .map((item) => item.schoolName),
        ),
      ).sort((left, right) => left.localeCompare(right)),
    [catalogItemsRaw, selectedSubjectId],
  )

  const selectedBlueprint =
    subjectBlueprints.find((blueprint) => blueprint.blueprintId === selectedBlueprintId) ??
    subjectBlueprints[0] ??
    null
  const selectedSubject = SUBJECT_OPTIONS.find((subject) => subject.subjectId === selectedSubjectId) ?? SUBJECT_OPTIONS[0]

  function handleSubjectChange(subjectId: string) {
    const nextBlueprint = blueprints.find((blueprint) => blueprint.subjectId === subjectId)
    setSelectedSubjectId(subjectId)
    setSelectedBlueprintId(nextBlueprint?.blueprintId ?? '')
    setSelectedSchoolName('')
    setYearFilter('all')
  }

  async function handleGenerateExam() {
    setErrorMessage('')

    try {
      const session = await createPracticeExamSession({
        blueprintId: selectedBlueprint?.blueprintId ?? selectedBlueprintId,
        subjectId: selectedSubject.subjectId,
        subjectName: selectedSubject.subjectName,
        preferredSchoolName: selectedSchoolName || undefined,
      })

      createSession(session)
      navigate(`/exam/${session.sessionId}`)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Khong the tao de thi thu.')
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8 flex justify-center">
        <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 p-1">
          <button
            className={`rounded-full px-6 py-2.5 text-sm font-semibold transition ${
              activeTab === 'school'
                ? 'bg-white text-blue-700 shadow-sm ring-1 ring-slate-200'
                : 'text-slate-500 hover:text-slate-700'
            }`}
            onClick={() => setActiveTab('school')}
            type="button"
          >
            Làm đề theo trường
          </button>
          <button
            className={`rounded-full px-6 py-2.5 text-sm font-semibold transition ${
              activeTab === 'random'
                ? 'bg-white text-blue-700 shadow-sm ring-1 ring-slate-200'
                : 'text-slate-500 hover:text-slate-700'
            }`}
            onClick={() => setActiveTab('random')}
            type="button"
          >
            Tạo đề thi thử ngẫu nhiên
          </button>
        </div>
      </div>

      <div className="transition-all duration-300">
        {activeTab === 'school' ? (
          <section className="rounded-[28px] border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
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

        <div className="mt-5 grid gap-3 md:grid-cols-[220px_1fr_180px]">
          <select
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white"
            onChange={(event) => handleSubjectChange(event.target.value)}
            value={selectedSubjectId}
          >
            {SUBJECT_OPTIONS.map((subject) => (
              <option key={subject.subjectId} value={subject.subjectId}>
                {subject.label}
              </option>
            ))}
          </select>
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
            <option value="all">Tất cả năm</option>
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
              Đang tải danh sách đề trường...
            </div>
          ) : catalogItems.length === 0 ? (
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-600">
              Chưa có đề trường nào.
            </div>
          ) : (
            catalogItems.map((item) => (
              <article
                key={item.examId}
                className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900 leading-snug">{item.examTitle}</h3>
                    <p className="mt-1.5 text-sm text-slate-500 font-medium">
                      {item.schoolName} &bull; {item.city} &bull; {item.year}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    {item.pdfUrl ? (
                      <a
                        className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
                        href={item.pdfUrl}
                        rel="noreferrer"
                        target="_blank"
                      >
                        Xem PDF trước
                      </a>
                    ) : null}
                    <button
                      className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
                      onClick={() => setSelectedSchoolName(item.schoolName)}
                      type="button"
                    >
                      Ưu tiên trường này
                    </button>
                    {item.schoolExamPageId ? (
                      <Link
                        className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:shadow"
                        to={`/practice/school-exams/${item.schoolExamPageId}`}
                      >
                        Làm đề trường
                      </Link>
                    ) : null}
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600 shadow-sm"
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
        ) : (
          <section className="mx-auto max-w-2xl">
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Tạo đề thi thử
              </div>
              <h2 className="mt-2 text-2xl font-bold text-slate-950">Sinh đề ngẫu nhiên theo blueprint</h2>

          <div className="mt-6 grid gap-4">
            <label className="grid gap-2 text-sm">
              <span className="font-medium text-slate-700">Môn thi</span>
              <select
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white"
                onChange={(event) => handleSubjectChange(event.target.value)}
                value={selectedSubjectId}
              >
                {SUBJECT_OPTIONS.map((subject) => (
                  <option key={subject.subjectId} value={subject.subjectId}>
                    {subject.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-sm">
              <span className="font-medium text-slate-700">Blueprint đang dùng</span>
              <select
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white"
                onChange={(event) => setSelectedBlueprintId(event.target.value)}
                value={selectedBlueprint?.blueprintId ?? ''}
              >
                {subjectBlueprints.map((blueprint) => (
                  <option key={blueprint.blueprintId} value={blueprint.blueprintId}>
                    {blueprint.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-sm">
              <span className="font-medium text-slate-700">Ưu tiên câu hỏi của trường</span>
              <select
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-sky-400 focus:bg-white"
                onChange={(event) => setSelectedSchoolName(event.target.value)}
                value={selectedSchoolName}
              >
                <option value="">Tổng hợp nhiều trường</option>
                {schoolOptions.map((schoolName) => (
                  <option key={schoolName} value={schoolName}>
                    {schoolName}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {selectedBlueprint ? (
            <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50/50 p-5">
              <h3 className="text-lg font-semibold text-slate-900">{selectedBlueprint.name}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{selectedBlueprint.description}</p>
              <div className="mt-4 grid gap-3">
                {selectedBlueprint.sections.map((section) => (
                  <div
                    key={section.id}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-3 text-sm font-semibold text-slate-900">
                      <span>{section.title}</span>
                      <span className="text-slate-500">{section.count} câu</span>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      NB {section.levelCounts[1]} | TH {section.levelCounts[2]} | VD {section.levelCounts[3]} | VDC {section.levelCounts[4]}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {errorMessage ? <p className="mt-4 text-sm font-medium text-rose-600">{errorMessage}</p> : null}

          <button
            className="mt-6 w-full rounded-[22px] bg-blue-600 px-6 py-4 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 hover:shadow active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
            disabled={!selectedBlueprint}
            onClick={handleGenerateExam}
            type="button"
          >
            Tạo đề và vào bài ngay
          </button>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
