import { RouterProvider } from 'react-router-dom'
import { Toaster } from 'sonner'
import { appRouter } from '../router/app-router'
import { AuthBootstrap } from '../../features/auth/components/AuthBootstrap'

export function AppProviders() {
  return (
    <AuthBootstrap>
      <Toaster
        position="top-right"
        richColors
        toastOptions={{
          style: {
            borderRadius: '18px',
            border: '1px solid rgba(148, 163, 184, 0.24)',
          },
        }}
      />
      <RouterProvider router={appRouter} />
    </AuthBootstrap>
  )
}
