import { RouterProvider } from 'react-router-dom'
import { appRouter } from '../router/app-router'
import { AuthBootstrap } from '../../features/auth/components/AuthBootstrap'

export function AppProviders() {
  return (
    <AuthBootstrap>
      <RouterProvider router={appRouter} />
    </AuthBootstrap>
  )
}
