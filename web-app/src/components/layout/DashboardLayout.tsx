import { useState } from 'react'
import {
  BookOpen,
  BookPlus,
  Clock3,
  FileText,
  LogOut,
  Menu,
  Shield,
  User,
  X,
  type LucideIcon,
} from 'lucide-react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { logout } from '../../features/auth/services/auth-service'
import { useAuthSessionStore } from '../../features/auth/store/auth-session-store'

type NavigationItem = {
  label: string
  to: string
  icon: LucideIcon
  match: string[]
}

const baseNavigationItems: NavigationItem[] = [
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
]

export function DashboardLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAuthSessionStore((state) => state.user)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [logoutError, setLogoutError] = useState('')
  const navigationItems = getNavigationItems(user?.role)

  async function handleLogout() {
    try {
      setLogoutError('')
      await logout()
      navigate('/login', { replace: true })
    } catch (error) {
      setLogoutError(error instanceof Error ? error.message : 'Dang xuat that bai.')
    }
  }

  const isFullScreenMode = location.pathname.includes('/school-exams/') || location.pathname.includes('/exam/')

  return (
    <div className="min-h-[100dvh] bg-slate-50 text-slate-950">
      <div className="flex min-h-[100dvh]">
        {!isFullScreenMode && (
          <aside className="hidden h-screen w-64 shrink-0 border-r border-slate-200 bg-white md:flex md:flex-col">
            <SidebarContent
              currentPath={location.pathname}
              logoutError={logoutError}
              navigationItems={navigationItems}
              onNavigate={() => setIsMobileMenuOpen(false)}
              onLogout={handleLogout}
              userLabel={user?.fullName || user?.username || user?.email || 'Hoc sinh'}
            />
          </aside>
        )}

        <div className="flex min-h-[100dvh] flex-1 flex-col">
          {!isFullScreenMode && (
            <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur md:hidden">
              <NavLink
              className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-lg font-extrabold tracking-tight text-transparent"
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
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" strokeWidth={1.8} />
              ) : (
                <Menu className="h-5 w-5" strokeWidth={1.8} />
                )}
              </button>
            </header>
          )}

          {!isFullScreenMode && isMobileMenuOpen ? (
            <div
              className="fixed inset-0 z-30 bg-slate-950/30 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <aside
                className="h-full w-[80vw] max-w-sm border-r border-slate-200 bg-white shadow-2xl"
                onClick={(event) => event.stopPropagation()}
              >
                <SidebarContent
                  currentPath={location.pathname}
                  logoutError={logoutError}
                  navigationItems={navigationItems}
                  onNavigate={() => setIsMobileMenuOpen(false)}
                  onLogout={handleLogout}
                  userLabel={user?.fullName || user?.username || user?.email || 'Học sinh'}
                />
              </aside>
            </div>
          ) : null}

          <main className={isFullScreenMode ? "flex-1 bg-slate-50 px-2 py-4 sm:px-4 sm:py-6" : "flex-1 bg-slate-50 px-4 py-6 md:px-8 md:py-8"}>
            <div className={isFullScreenMode ? "mx-auto w-full max-w-[1800px]" : "mx-auto max-w-[1400px]"}>
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
  navigationItems,
  onNavigate,
  userLabel,
}: {
  currentPath: string
  onLogout: () => void | Promise<void>
  logoutError: string
  navigationItems: NavigationItem[]
  onNavigate: () => void
  userLabel: string
}) {
  return (
    <div className="flex h-full flex-col px-4 py-6">
      {/* Logo */}
      <div className="mb-10 px-2">
        <NavLink
          className="inline-block bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-2xl font-black tracking-tight text-transparent"
          to="/home"
        >
          THPTQG AI
        </NavLink>
      </div>

      {/* Nav items */}
      <nav className="space-y-1 flex-1">
        {navigationItems.map((item) => {
          const isActive = item.match.some((prefix) => currentPath.startsWith(prefix))
          const Icon = item.icon

          return (
            <NavLink
              key={item.to}
              className={[
                'group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors duration-200',
                isActive
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
              ].join(' ')}
              onClick={onNavigate}
              to={item.to}
            >
              <Icon className="h-5 w-5 shrink-0" strokeWidth={2} />
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>

      {/* Bottom Profile and Logout */}
      <div className="mt-auto border-t border-slate-200 pt-6">
        <div className="mb-4 rounded-2xl bg-slate-50 p-4 border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-bold shadow-sm border border-indigo-200/50">
              {userLabel.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="truncate text-sm font-bold text-slate-800">{userLabel}</p>
              <p className="truncate text-xs font-medium text-slate-500">Học sinh</p>
            </div>
          </div>
        </div>

        {logoutError ? (
          <p className="mb-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
            {logoutError}
          </p>
        ) : null}

        <button
          className="group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 transition-colors duration-200 hover:bg-rose-50 hover:text-rose-600"
          onClick={() => void onLogout()}
          type="button"
        >
          <LogOut className="h-5 w-5 shrink-0 transition-transform group-hover:-translate-x-1" strokeWidth={2} />
          <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  )
}

function getNavigationItems(userRole?: string) {
  const items = [...baseNavigationItems]
  const normalizedRole = userRole?.trim().toLowerCase() ?? ''

  if (normalizedRole === 'admin' || normalizedRole === 'teacher') {
    items.push(
      {
        label: 'Nhap de thi',
        to: '/admin/import-exam',
        icon: Shield,
        match: ['/admin/import-exam'],
      },
      {
        label: 'Nhap cau on tap',
        to: '/admin/import-review-questions',
        icon: BookPlus,
        match: ['/admin/import-review-questions'],
      }
    )
  }

  return items
}
