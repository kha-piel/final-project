import type { ReactElement } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthSessionStore } from '../store/auth-session-store'
import { AuthRouteLoading } from './AuthRouteLoading'

type PublicOnlyRouteProps = {
  children: ReactElement
}

export function PublicOnlyRoute({ children }: PublicOnlyRouteProps) {
  const status = useAuthSessionStore((state) => state.status)

  if (status === 'booting') {
    return <AuthRouteLoading message="Dang kiem tra auth session..." />
  }

  if (status === 'authenticated') {
    return <Navigate to="/home" replace />
  }

  return children
}
