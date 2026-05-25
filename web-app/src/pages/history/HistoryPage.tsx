import { Link } from 'react-router-dom'

export function HistoryPage() {
  return (
    <section className="space-y-6">
      <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
        <div className="mb-4 inline-flex rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
          Lịch sử làm bài
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-950 md:text-5xl">
          Khu tổng hợp lịch sử đang được tách riêng cho web-app.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
          Hiện tại dữ liệu lịch sử chi tiết vẫn nằm trong dashboard. Trang này là mock shell để
          hoan thien dieu huong sidebar ngay bay gio, sau do se noi thang vao data Supabase.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 active:translate-y-px"
            to="/dashboard"
          >
            Mo lịch sử trong dashboard
          </Link>
          <Link
            className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 active:translate-y-px"
            to="/practice"
          >
            Về khu đề thi thử
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {[
          ['Điểm trung bình', '7.4/10', 'Sẽ được đồng bộ từ attempt history trong Supabase.'],
          ['Lần nộp bài gần đây', '05 mục gần nhất', 'Trang này sẽ trở thành bộ lọc lịch sử theo môn, topic và kết quả.'],
        ].map(([label, value, description]) => (
          <div
            key={label}
            className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.05)]"
          >
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              {label}
            </div>
            <div className="mt-3 text-3xl font-bold tracking-tight text-slate-950">{value}</div>
            <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
