import { Outlet, useLocation } from 'react-router-dom'
import { DashboardLayout } from './DashboardLayout'

export function RootLayout() {
  const location = useLocation()
  const isAuthRoute = location.pathname === '/login' || location.pathname === '/register'

  if (isAuthRoute) {
    return <Outlet />
  }

  return <DashboardLayout />
}
