import { Suspense, lazy, type ReactNode } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { RootLayout } from '../../components/layout/RootLayout'
import { ProtectedRoute } from '../../features/auth/components/ProtectedRoute'
import { PublicOnlyRoute } from '../../features/auth/components/PublicOnlyRoute'

const LoginPage = lazy(() =>
  import('../../pages/auth/LoginPage').then((module) => ({ default: module.LoginPage })),
)
const RegisterPage = lazy(() =>
  import('../../pages/auth/RegisterPage').then((module) => ({ default: module.RegisterPage })),
)
const HomePage = lazy(() =>
  import('../../pages/home/HomePage').then((module) => ({ default: module.HomePage })),
)
const DashboardPage = lazy(() =>
  import('../../pages/dashboard/DashboardPage').then((module) => ({ default: module.DashboardPage })),
)
const ExamPage = lazy(() =>
  import('../../pages/exam/ExamPage').then((module) => ({ default: module.ExamPage })),
)
const ReviewPage = lazy(() =>
  import('../../pages/review/ReviewPage').then((module) => ({ default: module.ReviewPage })),
)

function withSuspense(children: ReactNode) {
  return <Suspense fallback={<RouteLoading />}>{children}</Suspense>
}

export const appRouter = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/login" replace />,
      },
      {
        path: 'login',
        element: (
          <PublicOnlyRoute>
            {withSuspense(<LoginPage />)}
          </PublicOnlyRoute>
        ),
      },
      {
        path: 'register',
        element: (
          <PublicOnlyRoute>
            {withSuspense(<RegisterPage />)}
          </PublicOnlyRoute>
        ),
      },
      {
        path: 'home',
        element: (
          <ProtectedRoute>
            {withSuspense(<HomePage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            {withSuspense(<DashboardPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'exam/:sessionId',
        element: (
          <ProtectedRoute>
            {withSuspense(<ExamPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'review/:sessionId',
        element: (
          <ProtectedRoute>
            {withSuspense(<ReviewPage />)}
          </ProtectedRoute>
        ),
      },
    ],
  },
])

function RouteLoading() {
  return (
    <div
      style={{
        borderRadius: '22px',
        padding: '18px 20px',
        backgroundColor: '#ffffff',
        border: '1px solid #d6e3f1',
        color: '#58708d',
        boxShadow: '0 12px 28px rgba(18, 52, 77, 0.06)',
      }}
    >
      Dang tai du lieu...
    </div>
  )
}
