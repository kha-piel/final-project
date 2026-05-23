import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AuthShell } from '../../features/auth/components/AuthShell'
import { registerWithEmail } from '../../features/auth/services/auth-service'
import { useAuthSessionStore } from '../../features/auth/store/auth-session-store'

export function RegisterPage() {
  const globalErrorMessage = useAuthSessionStore((state) => state.errorMessage)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    if (fullName.trim().length < 2) {
      setErrorMessage('Ho ten phai co it nhat 2 ky tu.')
      return
    }

    if (!email.includes('@')) {
      setErrorMessage('Email khong dung dinh dang.')
      return
    }

    if (password.length < 8) {
      setErrorMessage('Mat khau can toi thieu 8 ky tu.')
      return
    }

    if (password !== confirmPassword) {
      setErrorMessage('Xac nhan mat khau khong khop.')
      return
    }

    setIsSubmitting(true)

    try {
      const result = await registerWithEmail({
        fullName,
        email,
        password,
      })

      setSuccessMessage(
        result.needsEmailConfirmation
          ? 'Dang ky thanh cong. Hay mo email de xac thuc truoc khi dang nhap.'
          : 'Dang ky thanh cong. Ban co the dang nhap ngay.',
      )
      setPassword('')
      setConfirmPassword('')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Dang ky that bai.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthShell
      mode="register"
      title="Tao tai khoan moi"
      description="Dang ky de bat dau hoc tren ban web, dong bo tien do, lich su lam bai va khung giai thich AI."
      form={
        <form className="legacy-auth-form" onSubmit={handleSubmit}>
          <label className="legacy-auth-form-row">
            <span className="legacy-auth-label">Ho ten</span>
            <input
              autoComplete="name"
              className="legacy-auth-input"
              placeholder="Nhap ho ten"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
            />
          </label>
          <label className="legacy-auth-form-row">
            <span className="legacy-auth-label">Email</span>
            <input
              autoComplete="email"
              className="legacy-auth-input"
              placeholder="Nhap email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label className="legacy-auth-form-row">
            <span className="legacy-auth-label">Mat khau</span>
            <input
              autoComplete="new-password"
              className="legacy-auth-input"
              placeholder="Nhap mat khau"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          <label className="legacy-auth-form-row">
            <span className="legacy-auth-label">Xac nhan mat khau</span>
            <input
              autoComplete="new-password"
              className="legacy-auth-input"
              placeholder="Nhap lai mat khau"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
          </label>
          <button className="legacy-auth-submit" disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Dang tao tai khoan...' : 'Dang ky'}
          </button>
        </form>
      }
      statusMessage={
        <>
          {errorMessage ? <p className="legacy-auth-status-text error">{errorMessage}</p> : null}
          {!errorMessage && successMessage ? (
            <p className="legacy-auth-status-text success">{successMessage}</p>
          ) : null}
          {!errorMessage && !successMessage && globalErrorMessage ? (
            <p className="legacy-auth-status-text warning">{globalErrorMessage}</p>
          ) : null}
          {!errorMessage && !successMessage && !globalErrorMessage ? (
            <p className="legacy-auth-status-text">
              Da co tai khoan?{' '}
              <Link className="legacy-auth-inline-link" to="/login">
                Ve dang nhap
              </Link>
              .
            </p>
          ) : null}
        </>
      }
    />
  )
}
