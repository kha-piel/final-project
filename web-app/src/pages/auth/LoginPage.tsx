import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthShell } from '../../features/auth/components/AuthShell'
import { loginWithIdentity } from '../../features/auth/services/auth-service'
import { useAuthSessionStore } from '../../features/auth/store/auth-session-store'

export function LoginPage() {
  const navigate = useNavigate()
  const globalErrorMessage = useAuthSessionStore((state) => state.errorMessage)
  const [identity, setIdentity] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage('')

    if (!identity.trim() || !password.trim()) {
      setErrorMessage('Vui lòng nhập đầy đủ email/username và mật khẩu.')
      return
    }

    setIsSubmitting(true)

    try {
      await loginWithIdentity(identity, password)
      navigate('/dashboard', { replace: true })
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Đăng nhập thất bại.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthShell
      mode="login"
      title="Đăng nhập vào hệ thống"
      description="Dùng email hoặc username để vào lại luồng ôn tập, làm đề và tiếp tục tiến độ đã đồng bộ."
      form={
        <form className="legacy-auth-form" onSubmit={handleSubmit}>
          <label className="legacy-auth-form-row">
            <span className="legacy-auth-label">Email hoặc username</span>
            <input
              autoComplete="username"
              className="legacy-auth-input"
              placeholder="Nhập email hoặc username"
              value={identity}
              onChange={(event) => setIdentity(event.target.value)}
            />
          </label>
          <label className="legacy-auth-form-row">
            <span className="legacy-auth-label">Mật khẩu</span>
            <input
              autoComplete="current-password"
              className="legacy-auth-input"
              placeholder="Nhập mật khẩu"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          <button className="legacy-auth-submit" disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
      }
      statusMessage={
        <>
          {errorMessage ? <p className="legacy-auth-status-text error">{errorMessage}</p> : null}
          {!errorMessage && globalErrorMessage ? (
            <p className="legacy-auth-status-text warning">{globalErrorMessage}</p>
          ) : null}
          {!errorMessage && !globalErrorMessage ? (
            <p className="legacy-auth-status-text">
              Chưa có tài khoản?{' '}
              <Link className="legacy-auth-inline-link" to="/register">
                Đăng ký ngay
              </Link>
              .
            </p>
          ) : null}
        </>
      }
    />
  )
}
