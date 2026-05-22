import type { ReactElement } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthSessionStore } from '../store/auth-session-store'

type PublicOnlyRouteProps = {
  children: ReactElement
}

export function PublicOnlyRoute({ children }: PublicOnlyRouteProps) {
  const status = useAuthSessionStore((state) => state.status)

  if (status === 'booting') {
    return <RouteLoadingCard message="Dang kiem tra auth session..." />
  }

  if (status === 'authenticated') {
    return <Navigate to="/home" replace />
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
