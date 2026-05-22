import { useEffect, useState } from 'react'
import {
  BookOpen,
  Clock3,
  FileText,
  LogOut,
  Menu,
  User,
  X,
} from 'lucide-react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { logout } from '../../features/auth/services/auth-service'
import { useAuthSessionStore } from '../../features/auth/store/auth-session-store'

const navigationItems = [
  {
    label: 'Lam de thi thu',
    to: '/practice',
    icon: FileText,
    match: ['/practice'],
  },
  {
    label: 'On tap kien thuc',
    to: '/dashboard',
    icon: BookOpen,
    match: ['/dashboard', '/exam', '/review'],
  },
  {
    label: 'Lich su lam bai',
    to: '/history',
    icon: Clock3,
    match: ['/history'],
  },
  {
    label: 'Ho so hoc sinh',
    to: '/profile',
    icon: User,
    match: ['/profile', '/home'],
  },
] as const

export function DashboardLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAuthSessionStore((state) => state.user)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [logoutError, setLogoutError] = useState('')

  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location.pathname])

  async function handleLogout() {
    try {
      setLogoutError('')
      await logout()
      navigate('/login', { replace: true })
    } catch (error) {
      setLogoutError(error instanceof Error ? error.message : 'Dang xuat that bai.')
    }
  }

  return (
    <div className="min-h-[100dvh] bg-slate-100 text-slate-950">
      <div className="flex min-h-[100dvh]">
        <aside className="hidden h-screen w-64 shrink-0 border-r border-slate-200 bg-white md:flex md:flex-col">
          <SidebarContent
            currentPath={location.pathname}
            logoutError={logoutError}
            onLogout={handleLogout}
            userLabel={user?.fullName || user?.username || user?.email || 'Hoc sinh'}
          />
        </aside>

        <div className="flex min-h-[100dvh] flex-1 flex-col">
          <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur md:hidden">
            <NavLink
              className="bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 bg-clip-text text-lg font-extrabold tracking-tight text-transparent"
              to="/home"
            >
              THPTQG AI
            </NavLink>

            <button
              aria-label={isMobileMenuOpen ? 'Dong menu' : 'Mo menu'}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-2 text-slate-700 transition active:scale-[0.98]"
              onClick={() => setIsMobileMenuOpen((value) => !value)}
              type="button"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" strokeWidth={1.8} /> : <Menu className="h-5 w-5" strokeWidth={1.8} />}
            </button>
          </header>

          {isMobileMenuOpen ? (
            <div className="fixed inset-0 z-30 bg-slate-950/30 md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
              <aside
                className="h-full w-[86vw] max-w-xs border-r border-slate-200 bg-white px-4 py-5 shadow-[0_24px_64px_rgba(15,23,42,0.16)]"
                onClick={(event) => event.stopPropagation()}
              >
                <SidebarContent
                  currentPath={location.pathname}
                  logoutError={logoutError}
                  onLogout={handleLogout}
                  userLabel={user?.fullName || user?.username || user?.email || 'Hoc sinh'}
                />
              </aside>
            </div>
          ) : null}

          <main className="flex-1 bg-slate-100 px-4 py-4 md:px-8 md:py-8">
            <div className="mx-auto max-w-[1400px]">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}

function SidebarContent({
  currentPath,
  onLogout,
  logoutError,
  userLabel,
}: {
  currentPath: string
  onLogout: () => void | Promise<void>
  logoutError: string
  userLabel: string
}) {
  return (
    <div className="flex h-full flex-col px-4 py-5">
      <div className="mb-8">
        <NavLink
          className="inline-block bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 bg-clip-text text-2xl font-extrabold tracking-tight text-transparent"
          to="/home"
        >
          THPTQG AI
        </NavLink>
        <p className="mt-3 max-w-[22ch] text-sm leading-6 text-slate-500">
          Luong hoc tap tren web duoc sap xep gon, ro va san sang mo rong len mobile.
        </p>
      </div>

      <div className="mb-6 rounded-3xl border border-slate-200 bg-slate-50 p-4">
        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
          Tai khoan dang dung
        </div>
        <div className="mt-2 text-sm font-semibold text-slate-800">{userLabel}</div>
      </div>

      <nav className="space-y-2">
        {navigationItems.map((item) => {
          const isActive = item.match.some((prefix) => currentPath.startsWith(prefix))
          const Icon = item.icon

          return (
            <NavLink
              key={item.to}
              className={[
                'group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition',
                'active:translate-y-px',
                isActive
                  ? 'bg-blue-100 text-blue-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
              ].join(' ')}
              to={item.to}
            >
              <span
                className={[
                  'flex h-10 w-10 items-center justify-center rounded-2xl border transition',
                  isActive
                    ? 'border-blue-200 bg-white text-blue-700'
                    : 'border-slate-200 bg-white text-slate-500 group-hover:border-slate-300 group-hover:text-slate-800',
                ].join(' ')}
              >
                <Icon className="h-4.5 w-4.5" strokeWidth={1.8} />
              </span>
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>

      <div className="mt-auto border-t border-slate-200 pt-5">
        {logoutError ? (
          <p className="mb-3 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {logoutError}
          </p>
        ) : null}

        <button
          className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-rose-500 transition hover:bg-rose-50 hover:text-rose-600 active:translate-y-px"
          onClick={() => void onLogout()}
          type="button"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-rose-100 bg-rose-50/70">
            <LogOut className="h-4.5 w-4.5" strokeWidth={1.8} />
          </span>
          <span>Dang xuat</span>
        </button>
      </div>
    </div>
  )
}
