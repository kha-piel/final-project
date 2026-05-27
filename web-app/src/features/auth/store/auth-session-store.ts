import { create } from 'zustand'

export type AuthUserSummary = {
  id: string
  email: string
  username?: string
  fullName?: string
  role?: string
  status?: string
  schoolName?: string
  provinceCity?: string
  className?: string
  phoneNumber?: string
  thptqgExamYear?: number
  admissionCombo?: string
  targetScore?: number
  targetUniversity?: string
  targetMajor?: string
  studyNote?: string
}

type AuthSessionState = {
  status: 'booting' | 'authenticated' | 'anonymous'
  user: AuthUserSummary | null
  errorMessage: string | null
  setAuthenticated: (user: AuthUserSummary) => void
  setAnonymous: () => void
  setErrorMessage: (message: string | null) => void
}

export const useAuthSessionStore = create<AuthSessionState>((set) => ({
  status: 'booting',
  user: null,
  errorMessage: null,
  setAuthenticated: (user) =>
    set({
      status: 'authenticated',
      user,
      errorMessage: null,
    }),
  setAnonymous: () =>
    set({
      status: 'anonymous',
      user: null,
    }),
  setErrorMessage: (message) =>
    set({
      errorMessage: message,
    }),
}))
