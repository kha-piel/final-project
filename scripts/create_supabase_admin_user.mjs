import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createClient } from '@supabase/supabase-js'

const rootDir = process.cwd()
const envPath = resolve(rootDir, '.env')

function readEnvFile(path) {
  const values = {}
  const lines = readFileSync(path, 'utf8').split(/\r?\n/)
  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#') || !line.includes('=')) {
      continue
    }

    const separatorIndex = line.indexOf('=')
    const key = line.slice(0, separatorIndex).trim()
    const value = line.slice(separatorIndex + 1).trim()
    values[key] = value
  }

  return values
}

function resolveConfig() {
  const env = readEnvFile(envPath)
  const url = env.SUPABASE_URL
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new Error('SUPABASE_URL hoac SUPABASE_SERVICE_ROLE_KEY dang thieu trong .env')
  }

  return {
    url,
    serviceRoleKey,
    email: process.env.ADMIN_EMAIL || 'admin@local.test',
    password: process.env.ADMIN_PASSWORD || 'Admin123!',
    username: process.env.ADMIN_USERNAME || 'admin',
    fullName: process.env.ADMIN_FULL_NAME || 'Local Admin',
  }
}

async function findUserByEmail(adminClient, email) {
  let page = 1
  const perPage = 200

  while (page <= 10) {
    const { data, error } = await adminClient.auth.admin.listUsers({
      page,
      perPage,
    })

    if (error) {
      throw new Error(`Khong the doc danh sach auth users: ${error.message}`)
    }

    const user = data.users.find((candidate) => candidate.email?.toLowerCase() === email.toLowerCase())
    if (user) {
      return user
    }

    if (data.users.length < perPage) {
      return null
    }

    page += 1
  }

  return null
}

async function createOrUpdateAdmin() {
  const config = resolveConfig()
  const supabase = createClient(config.url, config.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  const existingUser = await findUserByEmail(supabase, config.email)

  let user = existingUser
  let action = 'updated'

  if (!existingUser) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: config.email,
      password: config.password,
      email_confirm: true,
      user_metadata: {
        username: config.username,
        full_name: config.fullName,
      },
    })

    if (error) {
      throw new Error(`Khong the tao auth user admin: ${error.message}`)
    }

    user = data.user
    action = 'created'
  } else {
    const { data, error } = await supabase.auth.admin.updateUserById(existingUser.id, {
      password: config.password,
      email_confirm: true,
      user_metadata: {
        ...(existingUser.user_metadata ?? {}),
        username: config.username,
        full_name: config.fullName,
      },
    })

    if (error) {
      throw new Error(`Khong the cap nhat auth user admin: ${error.message}`)
    }

    user = data.user
  }

  const { error: profileError } = await supabase.from('user_profiles').upsert(
    {
      user_id: user.id,
      email: config.email,
      username: config.username,
      full_name: config.fullName,
      role: 'admin',
      status: 'active',
    },
    {
      onConflict: 'user_id',
    },
  )

  if (profileError) {
    throw new Error(`Khong the dong bo user_profiles admin: ${profileError.message}`)
  }

  const { data: profile, error: fetchProfileError } = await supabase
    .from('user_profiles')
    .select('user_id, email, username, role, status')
    .eq('user_id', user.id)
    .single()

  if (fetchProfileError) {
    throw new Error(`Khong the doc lai profile admin: ${fetchProfileError.message}`)
  }

  console.log(
    JSON.stringify(
      {
        action,
        userId: user.id,
        email: user.email,
        username: profile.username,
        role: profile.role,
        status: profile.status,
      },
      null,
      2,
    ),
  )
}

createOrUpdateAdmin().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
