import type { User } from '@supabase/supabase-js'
import { getSupabaseBrowserClient } from '../../../lib/supabase/client'
import type { AuthUserSummary } from '../store/auth-session-store'

type RegisterInput = {
  fullName: string
  email: string
  password: string
}

type RegisterResult = {
  needsEmailConfirmation: boolean
}

type UserProfileRow = {
  user_id: string
  username: string | null
  email: string | null
  full_name: string | null
  role: string | null
  status: string | null
}

export async function loginWithEmail(email: string, password: string) {
  const supabase = getSupabaseBrowserClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: normalizeEmail(email),
    password,
  })

  if (error) {
    throw new Error(translateAuthError(error.message))
  }
}

export async function loginWithIdentity(identity: string, password: string) {
  const supabase = getSupabaseBrowserClient()
  const normalizedIdentity = identity.trim()

  if (!normalizedIdentity) {
    throw new Error('Vui long nhap email hoac username.')
  }

  let resolvedEmail = normalizedIdentity
  if (!normalizedIdentity.includes('@')) {
    const { data, error } = await supabase.rpc('resolve_login_email', {
      login_identity: normalizedIdentity,
    })

    if (error) {
      throw new Error(`Khong the xu ly tai khoan dang nhap: ${error.message}`)
    }

    if (!data || typeof data !== 'string') {
      throw new Error('Khong tim thay username phu hop.')
    }

    resolvedEmail = data
  }

  await loginWithEmail(resolvedEmail, password)
}

export async function registerWithEmail({
  fullName,
  email,
  password,
}: RegisterInput): Promise<RegisterResult> {
  const supabase = getSupabaseBrowserClient()
  const normalizedEmail = normalizeEmail(email)
  const username = normalizedEmail.split('@')[0] ?? normalizedEmail

  const { data, error } = await supabase.auth.signUp({
    email: normalizedEmail,
    password,
    options: {
      data: {
        full_name: fullName.trim(),
        username,
      },
    },
  })

  if (error) {
    throw new Error(translateAuthError(error.message))
  }

  if (data.user && data.session) {
    await ensureProfile({
      userId: data.user.id,
      email: normalizedEmail,
      username,
      fullName: fullName.trim(),
    })
  }

  return {
    needsEmailConfirmation: !data.session,
  }
}

export async function logout() {
  const supabase = getSupabaseBrowserClient()
  const { error } = await supabase.auth.signOut()
  if (error) {
    throw new Error(translateAuthError(error.message))
  }
}

export async function getCurrentAuthUserSummary(): Promise<AuthUserSummary | null> {
  const supabase = getSupabaseBrowserClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    throw new Error(translateAuthError(error.message))
  }

  if (!user) {
    return null
  }

  return resolveUserSummary(user)
}

export function onAuthStateChange(callback: (user: AuthUserSummary | null) => void) {
  const supabase = getSupabaseBrowserClient()
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(async (_event, session) => {
    const authUser = session?.user
    if (!authUser) {
      callback(null)
      return
    }

    try {
      const summary = await resolveUserSummary(authUser)
      callback(summary)
    } catch {
      callback(buildFallbackSummary(authUser))
    }
  })

  return () => {
    subscription.unsubscribe()
  }
}

async function resolveUserSummary(user: User): Promise<AuthUserSummary> {
  const profile = await fetchProfile(user.id)
  if (!profile) {
    return buildFallbackSummary(user)
  }

  return {
    id: user.id,
    email: profile.email ?? user.email ?? '',
    username: profile.username ?? undefined,
    fullName: profile.full_name ?? undefined,
    role: profile.role ?? undefined,
    status: profile.status ?? undefined,
  }
}

async function fetchProfile(userId: string): Promise<UserProfileRow | null> {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from('user_profiles')
    .select('user_id, username, email, full_name, role, status')
    .eq('user_id', userId)
    .maybeSingle<UserProfileRow>()

  if (error) {
    return null
  }

  return data
}

async function ensureProfile(input: {
  userId: string
  email: string
  username: string
  fullName: string
}) {
  const supabase = getSupabaseBrowserClient()
  await supabase.from('user_profiles').upsert(
    {
      user_id: input.userId,
      email: input.email,
      username: input.username,
      full_name: input.fullName,
      role: 'student',
      status: 'active',
    },
    {
      onConflict: 'user_id',
    },
  )
}

function buildFallbackSummary(user: User): AuthUserSummary {
  return {
    id: user.id,
    email: user.email ?? '',
    username: readStringMetadata(user, 'username') ?? user.email?.split('@')[0],
    fullName:
      readStringMetadata(user, 'full_name') ??
      readStringMetadata(user, 'name') ??
      user.email ??
      '',
  }
}

function readStringMetadata(user: User, key: string) {
  const value = user.user_metadata?.[key]
  return typeof value === 'string' ? value : undefined
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function translateAuthError(message: string) {
  const normalized = message.toLowerCase()

  if (normalized.includes('email_not_confirmed')) {
    return 'Tai khoan chua xac thuc email. Hay mo hop thu va xac nhan email truoc khi dang nhap.'
  }

  if (normalized.includes('invalid login credentials')) {
    return 'Email hoac mat khau khong dung.'
  }

  if (normalized.includes('invalid api key')) {
    return 'Cau hinh Supabase cua web app dang sai: anon key khong hop le.'
  }

  if (normalized.includes('forbidden') && normalized.includes('apikey')) {
    return 'Cau hinh Supabase cua web app dang sai hoac key da bi thu hoi.'
  }

  if (
    normalized.includes('email rate limit exceeded') ||
    normalized.includes('over_email_send_rate_limit')
  ) {
    return 'Supabase dang gioi han tan suat gui email. Hay doi mot luc roi thu lai.'
  }

  return message
}
