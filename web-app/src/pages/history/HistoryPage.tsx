import { Link } from 'react-router-dom'

export function HistoryPage() {
  return (
    <section className="space-y-6">
      <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
        <div className="mb-4 inline-flex rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
          Lich su lam bai
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-950 md:text-5xl">
          Khu tong hop lich su dang duoc tach rieng cho web-app.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
          Hien tai du lieu lich su chi tiet van nam trong dashboard. Trang nay la mock shell de
          hoan thien dieu huong sidebar ngay bay gio, sau do se noi thang vao data Supabase.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 active:translate-y-px"
            to="/dashboard"
          >
            Mo lich su trong dashboard
          </Link>
          <Link
            className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 active:translate-y-px"
            to="/practice"
          >
            Ve khu de thi thu
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {[
          ['Diem trung binh', '7.4/10', 'Se duoc dong bo tu attempt history trong Supabase.'],
          ['Lan nop bai gan day', '05 muc gan nhat', 'Trang nay se tro thanh bo loc lich su theo mon, topic va ket qua.'],
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
