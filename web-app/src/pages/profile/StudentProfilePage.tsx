import { Link } from 'react-router-dom'
import { useAuthSessionStore } from '../../features/auth/store/auth-session-store'

export function StudentProfilePage() {
  const user = useAuthSessionStore((state) => state.user)

  return (
    <section className="space-y-6">
      <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
        <div className="mb-4 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
          Hồ sơ học sinh
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-950 md:text-5xl">
          Hồ sơ web-first để sau này mở rộng lên mobile mà không phải viết lại flow.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
          Trang này hiện là mock giao diện cho khu hồ sơ. Dữ liệu đang đọc trực tiếp từ auth
          session hiện tại để giữ router hoàn chỉnh và sẵn sàng cho các bước tiếp theo.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            Tài khoản
          </div>
          <div className="mt-5 space-y-4">
            <ProfileRow label="Ho ten" value={user?.fullName || '--'} />
            <ProfileRow label="Email" value={user?.email || '--'} />
            <ProfileRow label="Username" value={user?.username || '--'} />
            <ProfileRow label="Vai tro" value={user?.role || 'student'} />
            <ProfileRow label="Trang thai" value={user?.status || 'active'} />
          </div>
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            Mock module sap them
          </div>
          <div className="mt-5 grid gap-3">
            {[
              'Mục tiêu điểm theo môn học.',
              'Thong ke tiến độ theo tuan.',
              'Danh sách câu đã đánh dấu và mức cần ôn lại.',
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-medium text-slate-700"
              >
                {item}
              </div>
            ))}
          </div>

          <Link
            className="mt-6 inline-flex rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 active:translate-y-px"
            to="/dashboard"
          >
            Về khu ôn tập
          </Link>
        </div>
      </div>
    </section>
  )
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
        {label}
      </div>
      <div className="mt-2 text-sm font-semibold text-slate-900">{value}</div>
    </div>
  )
}
