import { getSupabaseBrowserClient } from '../../../lib/supabase/client'

export type StudentProfile = {
  userId: string
  email: string
  username: string
  fullName: string
  role: string
  status: string
  schoolName: string
  provinceCity: string
  className: string
  phoneNumber: string
  thptqgExamYear: string
  admissionCombo: string
  targetScore: string
  targetUniversity: string
  targetMajor: string
  studyNote: string
}

type StudentProfileRow = {
  user_id: string
  email: string | null
  username: string | null
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

export async function fetchStudentProfile(userId: string): Promise<StudentProfile | null> {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from('user_profiles')
    .select('user_id, email, username, full_name, role, status, school_name, province_city, class_name, phone_number, thptqg_exam_year, admission_combo, target_score, target_university, target_major, study_note')
    .eq('user_id', userId)
    .maybeSingle<StudentProfileRow>()

  if (error) {
    throw new Error(`Khong the tai ho so hoc sinh: ${error.message}`)
  }

  return data ? mapProfileRow(data) : null
}

export async function updateStudentProfile(profile: StudentProfile) {
  const supabase = getSupabaseBrowserClient()
  const examYear = profile.thptqgExamYear.trim()
    ? Number(profile.thptqgExamYear.trim())
    : null
  const targetScore = profile.targetScore.trim() ? Number(profile.targetScore.trim()) : null

  const { error } = await supabase
    .from('user_profiles')
    .update({
      full_name: profile.fullName.trim(),
      school_name: profile.schoolName.trim() || null,
      province_city: profile.provinceCity.trim() || null,
      class_name: profile.className.trim() || null,
      phone_number: profile.phoneNumber.trim() || null,
      thptqg_exam_year: examYear,
      admission_combo: profile.admissionCombo.trim() || null,
      target_score: targetScore,
      target_university: profile.targetUniversity.trim() || null,
      target_major: profile.targetMajor.trim() || null,
      study_note: profile.studyNote.trim() || null,
    })
    .eq('user_id', profile.userId)

  if (error) {
    throw new Error(`Khong the cap nhat ho so hoc sinh: ${error.message}`)
  }
}

export function validateStudentProfile(profile: StudentProfile) {
  const issues: string[] = []
  const phone = profile.phoneNumber.trim()
  const examYear = profile.thptqgExamYear.trim()
  const targetScore = profile.targetScore.trim()

  if (!profile.fullName.trim()) {
    issues.push('Ho ten khong duoc de trong.')
  }

  if (phone && !/^[0-9+\-\s().]{8,20}$/.test(phone)) {
    issues.push('So dien thoai khong hop le.')
  }

  if (examYear) {
    const numericYear = Number(examYear)
    if (!Number.isInteger(numericYear) || numericYear < 2024 || numericYear > 2035) {
      issues.push('Nam thi THPTQG phai nam trong khoang 2024-2035.')
    }
  }

  if (targetScore) {
    const numericScore = Number(targetScore)
    if (Number.isNaN(numericScore) || numericScore < 0 || numericScore > 30) {
      issues.push('Muc tieu diem phai nam trong khoang 0-30.')
    }
  }

  return issues
}

function mapProfileRow(row: StudentProfileRow): StudentProfile {
  return {
    userId: row.user_id,
    email: row.email ?? '',
    username: row.username ?? '',
    fullName: row.full_name ?? '',
    role: row.role ?? '',
    status: row.status ?? '',
    schoolName: row.school_name ?? '',
    provinceCity: row.province_city ?? '',
    className: row.class_name ?? '',
    phoneNumber: row.phone_number ?? '',
    thptqgExamYear: row.thptqg_exam_year ? String(row.thptqg_exam_year) : '',
    admissionCombo: row.admission_combo ?? '',
    targetScore: row.target_score === null ? '' : String(row.target_score),
    targetUniversity: row.target_university ?? '',
    targetMajor: row.target_major ?? '',
    studyNote: row.study_note ?? '',
  }
}
