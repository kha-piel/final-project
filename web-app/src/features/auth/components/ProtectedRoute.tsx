import { useEffect, useRef, type ReactElement } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuthSessionStore } from '../store/auth-session-store'

type ProtectedRouteProps = {
  children: ReactElement
  allowedRoles?: string[]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const status = useAuthSessionStore((state) => state.status)
  const user = useAuthSessionStore((state) => state.user)

  if (status === 'booting') {
    return <RouteLoadingCard message="Dang khoi phuc auth session..." />
  }

  if (status !== 'authenticated') {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const normalizedRole = user?.role?.trim().toLowerCase() ?? ''
    if (!normalizedRole) {
      return (
        <MissingRoleRedirect
          email={user?.email ?? ''}
          message="Khong doc duoc role tu user_profiles. Kiem tra row profile theo dung user_id/email."
        />
      )
    }

    const isAllowed = allowedRoles.some((role) => role.toLowerCase() === normalizedRole)

    if (!isAllowed) {
      return <UnauthorizedRedirect />
    }
  }

  return children
}

function MissingRoleRedirect({ email, message }: { email: string; message: string }) {
  const navigate = useNavigate()
  const hasRedirectedRef = useRef(false)

  useEffect(() => {
    if (hasRedirectedRef.current) {
      return
    }

    hasRedirectedRef.current = true
    toast.error(email ? `${message} Email: ${email}` : message)
    navigate('/home', { replace: true })
  }, [email, message, navigate])

  return <RouteLoadingCard message="Khong doc duoc quyen truy cap, dang dieu huong ve trang chu..." />
}

function UnauthorizedRedirect() {
  const navigate = useNavigate()
  const hasRedirectedRef = useRef(false)

  useEffect(() => {
    if (hasRedirectedRef.current) {
      return
    }

    hasRedirectedRef.current = true
    toast.error('Ban khong co quyen truy cap khu vuc admin import.')
    navigate('/home', { replace: true })
  }, [navigate])

  return <RouteLoadingCard message="Dang dieu huong ve trang duoc phep truy cap..." />
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
