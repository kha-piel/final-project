import { Link } from 'react-router-dom'

export function PracticeHubPage() {
  return (
    <section className="space-y-6">
      <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
        <div className="mb-4 inline-flex rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
          Lam de thi thu
        </div>
        <h1 className="max-w-2xl text-4xl font-extrabold tracking-tight text-slate-950 md:text-5xl">
          Khu tap trung cho nhung de thi mo phong co gio va co tong ket sau nop bai.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
          Luong nay dang duoc mock de chuan bi cho mode thi thu tach rieng. Hien tai ban co the
          bat dau tu dashboard on tap de tao de va vao bai ngay.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 active:translate-y-px"
            to="/dashboard"
          >
            Tao de va bat dau
          </Link>
          <Link
            className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 active:translate-y-px"
            to="/history"
          >
            Xem lich su bai da nop
          </Link>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
          <h2 className="text-lg font-bold text-slate-900">Mock flow sap co</h2>
          <div className="mt-4 grid gap-3">
            {[
              'Chon bo de thi thu theo mon va nam.',
              'Vao bai voi timer rieng cho tung de.',
              'Tong ket review sau nop bai va de xuat lo hong kien thuc.',
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-medium text-slate-700"
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 p-6 text-white shadow-[0_16px_40px_rgba(15,23,42,0.12)]">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-200">
            Mock state
          </div>
          <p className="mt-4 text-sm leading-7 text-slate-200">
            Trang nay duoc them de sidebar co route hoan chinh ngay ca khi mode de thi thu tach
            rieng chua ra mat.
          </p>
        </div>
      </div>
    </section>
  )
}
