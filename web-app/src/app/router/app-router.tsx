/* eslint-disable react-refresh/only-export-components */
import { Suspense, lazy, type ReactNode } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { RootLayout } from '../../components/layout/RootLayout'
import { ProtectedRoute } from '../../features/auth/components/ProtectedRoute'
import { PublicOnlyRoute } from '../../features/auth/components/PublicOnlyRoute'
import { ExamPage } from '../../pages/exam/ExamPage'

const LoginPage = lazy(() =>
  import('../../pages/auth/LoginPage').then((module) => ({ default: module.LoginPage })),
)
const RegisterPage = lazy(() =>
  import('../../pages/auth/RegisterPage').then((module) => ({ default: module.RegisterPage })),
)
const HomePage = lazy(() =>
  import('../../pages/home/HomePage').then((module) => ({ default: module.HomePage })),
)
const PracticeHubPage = lazy(() =>
  import('../../pages/practice/PracticeHubPage').then((module) => ({
    default: module.PracticeHubPage,
  })),
)
const SchoolExamPage = lazy(() =>
  import('../../pages/practice/SchoolExamPage').then((module) => ({
    default: module.SchoolExamPage,
  })),
)
const DashboardPage = lazy(() =>
  import('../../pages/dashboard/DashboardPage').then((module) => ({ default: module.DashboardPage })),
)
const HistoryPage = lazy(() =>
  import('../../pages/history/HistoryPage').then((module) => ({ default: module.HistoryPage })),
)
const StudentProfilePage = lazy(() =>
  import('../../pages/profile/StudentProfilePage').then((module) => ({
    default: module.StudentProfilePage,
  })),
)
const ReviewPage = lazy(() =>
  import('../../pages/review/ReviewPage').then((module) => ({ default: module.ReviewPage })),
)
const KnowledgeReviewPage = lazy(() =>
  import('../../pages/review/KnowledgeReviewPage').then((module) => ({
    default: module.KnowledgeReviewPage,
  })),
)
const ImportExamPage = lazy(() =>
  import('../../pages/admin/ImportExamPage').then((module) => ({
    default: module.ImportExamPage,
  })),
)
const ImportReviewQuestionsPage = lazy(() =>
  import('../../pages/admin/ImportReviewQuestionsPage').then((module) => ({
    default: module.ImportReviewQuestionsPage,
  })),
)
const ManageReviewQuestionsPage = lazy(() =>
  import('../../pages/admin/ManageReviewQuestionsPage').then((module) => ({
    default: module.ManageReviewQuestionsPage,
  })),
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
        path: 'practice',
        element: (
          <ProtectedRoute>
            {withSuspense(<PracticeHubPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'practice/school-exams/:examId',
        element: (
          <ProtectedRoute>
            {withSuspense(<SchoolExamPage />)}
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
        path: 'history',
        element: (
          <ProtectedRoute>
            {withSuspense(<HistoryPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            {withSuspense(<StudentProfilePage />)}
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
      {
        path: 'knowledge-review/:topicKey',
        element: (
          <ProtectedRoute>
            {withSuspense(<KnowledgeReviewPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/import-exam',
        element: (
          <ProtectedRoute allowedRoles={['admin', 'teacher']}>
            {withSuspense(<ImportExamPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/import-review-questions',
        element: (
          <ProtectedRoute allowedRoles={['admin', 'teacher']}>
            {withSuspense(<ImportReviewQuestionsPage />)}
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/manage-review-questions',
        element: (
          <ProtectedRoute allowedRoles={['admin', 'teacher']}>
            {withSuspense(<ManageReviewQuestionsPage />)}
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
      Đang tải du lieu...
    </div>
  )
}
