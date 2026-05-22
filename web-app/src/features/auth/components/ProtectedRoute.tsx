import type { ReactElement } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthSessionStore } from '../store/auth-session-store'

type ProtectedRouteProps = {
  children: ReactElement
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const status = useAuthSessionStore((state) => state.status)

  if (status === 'booting') {
    return <RouteLoadingCard message="Dang khoi phuc auth session..." />
  }

  if (status !== 'authenticated') {
    return <Navigate to="/login" replace />
  }

  return children
}

function RouteLoadingCard({ message }: { message: string }) {
  return (
    <div
      style={{
        borderRadius: '24px',
        padding: '24px',
        backgroundColor: '#ffffff',
        border: '1px solid #d8e3ef',
        color: '#49627f',
      }}
    >
      {message}
    </div>
  )
}
