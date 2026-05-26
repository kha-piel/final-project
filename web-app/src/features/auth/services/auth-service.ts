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
  school_name: string | null
  province_city: string | null
  class_name: string | null
  phone_number: string | null
  thptqg_exam_year: number | null
  admission_combo: string | null
  target_score: number | null
  target_university: string | null
  target_major: string | null
  study_note: string | null
}

const profileSelect =
  'user_id, username, email, full_name, role, status, school_name, province_city, class_name, phone_number, thptqg_exam_year, admission_combo, target_score, target_university, target_major, study_note'

const localDevelopmentAdminEmails = new Set(['admin@local.test'])

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
      throw new Error(`Không thể xu ly tài khoản đăng nhập: ${error.message}`)
    }

    if (!data || typeof data !== 'string') {
      throw new Error('Không tìm thấy username phu hop.')
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

export async function getCachedAuthUserSummary(): Promise<AuthUserSummary | null> {
  const supabase = getSupabaseBrowserClient()
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()

  if (error) {
    throw new Error(translateAuthError(error.message))
  }

  const authUser = session?.user
  if (!authUser) {
    return null
  }

  return resolveUserSummary(authUser)
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
  const profile = await fetchProfileWithTimeout(user)
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
    schoolName: profile.school_name ?? undefined,
    provinceCity: profile.province_city ?? undefined,
    className: profile.class_name ?? undefined,
    phoneNumber: profile.phone_number ?? undefined,
    thptqgExamYear: profile.thptqg_exam_year ?? undefined,
    admissionCombo: profile.admission_combo ?? undefined,
    targetScore: profile.target_score ?? undefined,
    targetUniversity: profile.target_university ?? undefined,
    targetMajor: profile.target_major ?? undefined,
    studyNote: profile.study_note ?? undefined,
  }
}

async function fetchProfile(userId: string): Promise<UserProfileRow | null> {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from('user_profiles')
    .select(profileSelect)
    .eq('user_id', userId)
    .maybeSingle<UserProfileRow>()

  if (error) {
    return null
  }

  return data
}

async function fetchProfileByEmail(email: string): Promise<UserProfileRow | null> {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from('user_profiles')
    .select(profileSelect)
    .eq('email', normalizeEmail(email))
    .maybeSingle<UserProfileRow>()

  if (error) {
    return null
  }

  return data
}

async function fetchProfileForUser(user: User) {
  const profileById = await fetchProfile(user.id)
  if (profileById) {
    return profileById
  }

  if (!user.email) {
    return null
  }

  return fetchProfileByEmail(user.email)
}

async function fetchProfileWithTimeout(user: User, timeoutMs = 6000) {
  try {
    const profile = await Promise.race([
      fetchProfileForUser(user),
      new Promise<null>((resolve) => {
        window.setTimeout(() => resolve(null), timeoutMs)
      }),
    ])

    return profile
  } catch {
    return null
  }
}

async function ensureProfile(input: {
  userId: string
  email: string
  username: string
  fullName: string
}) {
  const supabase = getSupabaseBrowserClient()

  const existingProfile = await fetchProfile(input.userId)
  if (existingProfile) {
    await supabase
      .from('user_profiles')
      .update({
        email: input.email,
        username: input.username,
        full_name: input.fullName,
      })
      .eq('user_id', input.userId)
    return
  }

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
  const email = user.email ?? ''
  const normalizedEmail = normalizeEmail(email)
  const isLocalDevelopmentAdmin = localDevelopmentAdminEmails.has(normalizedEmail)

  return {
    id: user.id,
    email,
    username: readStringMetadata(user, 'username') ?? email.split('@')[0],
    fullName:
      readStringMetadata(user, 'full_name') ??
      readStringMetadata(user, 'name') ??
      email ??
      '',
    role: readStringMetadata(user, 'role') ?? (isLocalDevelopmentAdmin ? 'admin' : undefined),
    status: readStringMetadata(user, 'status') ?? (isLocalDevelopmentAdmin ? 'active' : undefined),
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
    return 'Tài khoản chưa xác thực email. Hãy mở hộp thư và xác nhận email trước khi đăng nhập.'
  }

  if (normalized.includes('invalid login credentials')) {
    return 'Email hoặc mật khẩu không đúng.'
  }

  if (normalized.includes('invalid api key')) {
    return 'Cấu hình Supabase của web app đang sai: anon key không hợp lệ.'
  }

  if (normalized.includes('forbidden') && normalized.includes('apikey')) {
    return 'Cấu hình Supabase của web app đang sai hoặc key đã bị thu hồi.'
  }

  if (
    normalized.includes('email rate limit exceeded') ||
    normalized.includes('over_email_send_rate_limit')
  ) {
    return 'Supabase đang giới hạn tần suất gửi email. Hãy đợi một lúc rồi thử lại.'
  }

  return message
}
