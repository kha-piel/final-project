import { useEffect, type ReactNode } from 'react'
import { hasSupabaseEnv } from '../../../lib/config/env'
import {
  getCachedAuthUserSummary,
  getCurrentAuthUserSummary,
  onAuthStateChange,
} from '../services/auth-service'
import { useAuthSessionStore } from '../store/auth-session-store'

type AuthBootstrapProps = {
  children: ReactNode
}

export function AuthBootstrap({ children }: AuthBootstrapProps) {
  const setAuthenticated = useAuthSessionStore((state) => state.setAuthenticated)
  const setAnonymous = useAuthSessionStore((state) => state.setAnonymous)
  const setErrorMessage = useAuthSessionStore((state) => state.setErrorMessage)

  useEffect(() => {
    if (!hasSupabaseEnv()) {
      setAnonymous()
      setErrorMessage(
        'Missing web-app Supabase env. Copy web-app/.env.example to web-app/.env.local before using auth.',
      )
      return
    }

    let isMounted = true
    let hasResolvedBootstrap = false

    const finishAsAnonymous = (message?: string) => {
      if (!isMounted) {
        return
      }

      hasResolvedBootstrap = true
      setAnonymous()
      setErrorMessage(message ?? null)
    }

    const finishAsAuthenticated = (
      user: Awaited<ReturnType<typeof getCurrentAuthUserSummary>>,
    ) => {
      if (!isMounted || !user) {
        return
      }

      hasResolvedBootstrap = true
      setAuthenticated(user)
      setErrorMessage(null)
    }

    const unsubscribe = onAuthStateChange((user) => {
      if (!isMounted) {
        return
      }

      if (user) {
        finishAsAuthenticated(user)
      } else {
        finishAsAnonymous()
      }
    })

    void getCachedAuthUserSummary()
      .then((user) => {
        if (!isMounted || hasResolvedBootstrap) {
          return
        }

        if (user) {
          finishAsAuthenticated(user)
          return
        }

        finishAsAnonymous()
      })
      .catch((error: unknown) => {
        if (!isMounted || hasResolvedBootstrap) {
          return
        }

        finishAsAnonymous(
          error instanceof Error ? error.message : 'Không thể khởi tạo auth session từ local cache.',
        )
      })

    void getCurrentAuthUserSummary()
      .then((user) => {
        if (!isMounted) {
          return
        }

        if (user) {
          finishAsAuthenticated(user)
          return
        }

        if (!hasResolvedBootstrap) {
          finishAsAnonymous()
        }
      })
      .catch((error: unknown) => {
        if (!isMounted || hasResolvedBootstrap) {
          return
        }

        finishAsAnonymous(error instanceof Error ? error.message : 'Không thể khởi tạo auth session.')
      })

    return () => {
      isMounted = false
      unsubscribe()
    }
  }, [setAnonymous, setAuthenticated, setErrorMessage])

  return <>{children}</>
}
