import { useEffect, type ReactNode } from 'react'
import { hasSupabaseEnv } from '../../../lib/config/env'
import {
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
      if (message) {
        setErrorMessage(message)
      }
    }

    const finishAsAuthenticated = (user: Awaited<ReturnType<typeof getCurrentAuthUserSummary>>) => {
      if (!isMounted || !user) {
        return
      }

      hasResolvedBootstrap = true
      setAuthenticated(user)
    }

    const bootstrapTimeout = window.setTimeout(() => {
      if (hasResolvedBootstrap) {
        return
      }

      finishAsAnonymous('Khoi tao auth session qua cham. App tam thoi quay ve che do anonymous.')
    }, 4000)

    void getCurrentAuthUserSummary()
      .then((user) => {
        if (!isMounted || hasResolvedBootstrap) {
          return
        }

        if (user) {
          finishAsAuthenticated(user)
        } else {
          finishAsAnonymous()
        }
      })
      .catch((error: unknown) => {
        if (!isMounted || hasResolvedBootstrap) {
          return
        }

        finishAsAnonymous(error instanceof Error ? error.message : 'Khong the khoi tao auth session.')
      })

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

    return () => {
      isMounted = false
      window.clearTimeout(bootstrapTimeout)
      unsubscribe()
    }
  }, [setAnonymous, setAuthenticated, setErrorMessage])

  return <>{children}</>
}
