import { useEffect, useState } from 'react'
import { Save } from 'lucide-react'
import { useAuthSessionStore } from '../../features/auth/store/auth-session-store'
import {
  fetchStudentProfile,
  updateStudentProfile,
  validateStudentProfile,
  type StudentProfile,
} from '../../features/profile/services/student-profile-service'

export function StudentProfilePage() {
  const user = useAuthSessionStore((state) => state.user)
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    if (!user?.id) {
      setIsLoading(false)
      return
    }

    let isMounted = true
    setIsLoading(true)
    setErrorMessage('')

    void fetchStudentProfile(user.id)
      .then((row) => {
        if (!isMounted) {
          return
        }

        setProfile(
          row ?? {
            userId: user.id,
            email: user.email,
            username: user.username ?? '',
            fullName: user.fullName ?? '',
            role: user.role ?? 'student',
            status: user.status ?? 'active',
            schoolName: '',
            provinceCity: '',
            className: '',
            phoneNumber: '',
            thptqgExamYear: '',
            admissionCombo: '',
            targetScore: '',
            targetUniversity: '',
            targetMajor: '',
            studyNote: '',
          },
        )
      })
      .catch((error: unknown) => {
        if (isMounted) {
          setErrorMessage(error instanceof Error ? error.message : 'Khong the tai ho so hoc sinh.')
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [user])

  function updateField<Key extends keyof StudentProfile>(key: Key, value: StudentProfile[Key]) {
    setProfile((current) => (current ? { ...current, [key]: value } : current))
    setSuccessMessage('')
  }

  async function handleSave() {
    if (!profile) {
      return
    }

    const issues = validateStudentProfile(profile)
    if (issues.length > 0) {
      setErrorMessage(issues[0])
      return
    }

    setIsSaving(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      await updateStudentProfile(profile)
      setSuccessMessage('Da luu ho so hoc sinh.')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Khong the luu ho so hoc sinh.')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <section className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
        <p className="text-sm text-slate-600">Đang tải hồ sơ học sinh...</p>
      </section>
    )
  }

  if (!profile) {
    return (
      <section className="rounded-[28px] border border-rose-200 bg-rose-50 p-8 text-sm font-semibold text-rose-700">
        Không tìm thấy hồ sơ học sinh.
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
          Hồ sơ học sinh
        </div>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 md:text-4xl">
          Thông tin cá nhân và mục tiêu THPTQG
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
          Dữ liệu này giúp hệ thống cá nhân hóa lịch sử học tập, mục tiêu điểm và định hướng ôn thi.
        </p>
      </div>

      {errorMessage ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {errorMessage}
        </div>
      ) : null}

      {successMessage ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          {successMessage}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
          <SectionTitle title="Tài khoản" />
          <div className="mt-5 grid gap-4">
            <InputField label="Họ tên" onChange={(value) => updateField('fullName', value)} value={profile.fullName} />
            <ReadOnlyRow label="Email" value={profile.email || '--'} />
            <ReadOnlyRow label="Username" value={profile.username || '--'} />
            <ReadOnlyRow label="Vai trò" value={profile.role || 'student'} />
            <ReadOnlyRow label="Trạng thái" value={profile.status || 'active'} />
          </div>
        </section>

        <section className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
          <SectionTitle title="Thông tin ôn thi THPTQG" />
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <InputField label="Trường đang học" onChange={(value) => updateField('schoolName', value)} value={profile.schoolName} />
            <InputField label="Tỉnh / thành phố" onChange={(value) => updateField('provinceCity', value)} value={profile.provinceCity} />
            <InputField label="Lớp" onChange={(value) => updateField('className', value)} value={profile.className} />
            <InputField label="Số điện thoại" onChange={(value) => updateField('phoneNumber', value)} value={profile.phoneNumber} />
            <InputField label="Năm thi THPTQG" onChange={(value) => updateField('thptqgExamYear', value)} placeholder="2026" value={profile.thptqgExamYear} />
            <InputField label="Tổ hợp xét tuyển" onChange={(value) => updateField('admissionCombo', value)} placeholder="A00, A01, D01..." value={profile.admissionCombo} />
            <InputField label="Mục tiêu điểm" onChange={(value) => updateField('targetScore', value)} placeholder="27.5" value={profile.targetScore} />
            <InputField label="Trường đại học mục tiêu" onChange={(value) => updateField('targetUniversity', value)} value={profile.targetUniversity} />
            <InputField label="Ngành mục tiêu" onChange={(value) => updateField('targetMajor', value)} value={profile.targetMajor} />
            <label className="grid gap-2 md:col-span-2">
              <span className="text-sm font-semibold text-slate-900">Ghi chú học tập</span>
              <textarea
                className="min-h-[120px] rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-7 text-slate-800 outline-none transition focus:border-emerald-300 focus:bg-white"
                onChange={(event) => updateField('studyNote', event.target.value)}
                value={profile.studyNote}
              />
            </label>
          </div>

          <button
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:bg-slate-300"
            disabled={isSaving}
            onClick={() => void handleSave()}
            type="button"
          >
            <Save className="h-4 w-4" strokeWidth={1.8} />
            {isSaving ? 'Đang lưu...' : 'Lưu hồ sơ'}
          </button>
        </section>
      </div>
    </section>
  )
}

function SectionTitle({ title }: { title: string }) {
  return <h2 className="text-lg font-extrabold text-slate-950">{title}</h2>
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-slate-900">{label}</span>
      <input
        className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 outline-none transition focus:border-emerald-300 focus:bg-white"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        value={value}
      />
    </label>
  )
}

function ReadOnlyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
        {label}
      </div>
      <div className="mt-2 text-sm font-semibold text-slate-900">{value}</div>
    </div>
  )
}
