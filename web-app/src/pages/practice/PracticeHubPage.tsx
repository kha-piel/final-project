import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useExamDraftStore } from '../../features/exam/store/exam-draft-store'
import { mockExamCatalog } from '../../features/practice/data/mock-exam-catalog'
import {
  createPracticeExamSession,
  getPracticeBlueprints,
  getPracticeQuestionBankOverview,
  searchPracticeExamCatalog,
} from '../../features/practice/services/practice-service'

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

  const catalogItems = useMemo(
    () =>
      searchPracticeExamCatalog({
        keyword,
        subjectId: SUBJECT_ID,
        year: yearFilter,
      }),
    [keyword, yearFilter],
  )

  const bankOverview = useMemo(() => getPracticeQuestionBankOverview(), [])
  const blueprints = useMemo(() => getPracticeBlueprints(), [])
  const years = useMemo(
    () => Array.from(new Set(mockExamCatalog.map((item) => item.year))).sort((left, right) => right - left),
    [],
  )
  const schoolOptions = useMemo(
    () => Array.from(new Set(mockExamCatalog.map((item) => item.schoolName))).sort((left, right) => left.localeCompare(right)),
    [],
  )

  const selectedBlueprint = blueprints.find((blueprint) => blueprint.blueprintId === selectedBlueprintId) ?? null

  function handleGenerateExam() {
    setErrorMessage('')

    try {
      const session = createPracticeExamSession({
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
              Hub này đang chạy bằng kho dữ liệu giả lập có cấu trúc sẵn để sau này bạn chỉ việc bơm
              dữ liệu cào thật vào cùng định dạng. Luồng thi dùng local mock, không phụ thuộc Supabase.
            </p>
          </div>

          <div className="grid gap-3 rounded-[28px] border border-white/70 bg-white/70 p-5 backdrop-blur">
            <StatCard label="De nguon mock" value={`${mockExamCatalog.length}`} />
            <StatCard label="Tong cau hoi mock" value={`${bankOverview.totalQuestions}`} />
            <StatCard label="So truong nguon" value={`${bankOverview.schools}`} />
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Thu vien de nguon
              </div>
              <h2 className="mt-2 text-2xl font-bold text-slate-950">Tìm kiếm đề theo trường</h2>
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
            {catalogItems.map((item) => (
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
                {item.sourcePath ? (
                  <p className="mt-4 text-xs text-slate-500">Nguon data: {item.sourcePath}</p>
                ) : null}
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <div className="rounded-[28px] border border-slate-200 bg-slate-950 p-6 text-white shadow-[0_20px_60px_rgba(15,23,42,0.14)]">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-200">
              Tao de thi thu
            </div>
            <h2 className="mt-3 text-2xl font-bold">Sinh de ngau nhien theo blueprint</h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              De se duoc boc ngau nhien tu kho cau hoi tong hop, uu tien cau cua truong ban chon,
              sau do fallback sang nhieu truong neu kho khong du.
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

          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Tinh trang kho du lieu
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <InfoTile label="Multiple choice" value={`${bankOverview.typeCounts.multiple_choice ?? 0}`} />
              <InfoTile label="Dung / Sai" value={`${bankOverview.typeCounts.true_false ?? 0}`} />
              <InfoTile label="Tra loi ngan" value={`${bankOverview.typeCounts.short_answer ?? 0}`} />
              <InfoTile label="Muc VDC" value={`${bankOverview.levelCounts[4] ?? 0}`} />
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Cac file mock da duoc tach rieng trong `features/practice/data`. Sau nay ban chi can
              thay noi dung mock bang du lieu cào that theo cung shape, service sinh de se dung lai
              duoc ngay.
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
