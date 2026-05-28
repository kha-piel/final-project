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
      setErrorMessage('Họ tên phải có ít nhất 2 ký tự.')
      return
    }

    if (!email.includes('@')) {
      setErrorMessage('Email không đúng định dạng.')
      return
    }

    if (password.length < 8) {
      setErrorMessage('Mật khẩu cần tối thiểu 8 ký tự.')
      return
    }

    if (password !== confirmPassword) {
      setErrorMessage('Xác nhận mật khẩu không khớp.')
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
          ? 'Đăng ký thành công. Hãy mở email để xác thực trước khi đăng nhập.'
          : 'Đăng ký thành công. Bạn có thể đăng nhập ngay.',
      )
      setPassword('')
      setConfirmPassword('')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Đăng ký thất bại.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthShell
      mode="register"
      title="Tạo tài khoản mới"
      description="Đăng ký để bắt đầu học trên bản web, đồng bộ tiến độ, lịch sử làm bài và khung giải thích AI."
      form={
        <form className="legacy-auth-form" onSubmit={handleSubmit}>
          <label className="legacy-auth-form-row">
            <span className="legacy-auth-label">Họ tên</span>
            <input
              autoComplete="name"
              className="legacy-auth-input"
              placeholder="Nhập họ tên"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
            />
          </label>
          <label className="legacy-auth-form-row">
            <span className="legacy-auth-label">Email</span>
            <input
              autoComplete="email"
              className="legacy-auth-input"
              placeholder="Nhập email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <label className="legacy-auth-form-row">
            <span className="legacy-auth-label">Mật khẩu</span>
            <input
              autoComplete="new-password"
              className="legacy-auth-input"
              placeholder="Nhập mật khẩu"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          <label className="legacy-auth-form-row">
            <span className="legacy-auth-label">Xác nhận mật khẩu</span>
            <input
              autoComplete="new-password"
              className="legacy-auth-input"
              placeholder="Nhập lại mật khẩu"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
          </label>
          <button className="legacy-auth-submit" disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Đang tạo tài khoản...' : 'Đăng ký'}
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
              Đã có tài khoản?{' '}
              <Link className="legacy-auth-inline-link" to="/login">
                Về đăng nhập
              </Link>
              .
            </p>
          ) : null}
        </>
      }
    />
  )
}
