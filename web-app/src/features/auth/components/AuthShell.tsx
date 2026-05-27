import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import './auth-shell.css'

type AuthShellProps = {
  mode: 'login' | 'register'
  title: string
  description: string
  form: ReactNode
  statusMessage?: ReactNode
}

export function AuthShell({ mode, title, description, form, statusMessage }: AuthShellProps) {
  const isLogin = mode === 'login'

  return (
    <div className="legacy-auth-page">
      <div className="legacy-auth-particles" />
      <div className={`legacy-auth-container ${isLogin ? 'mode-login' : 'mode-register'}`}>
        <section className="legacy-auth-form-panel">
          <div className="legacy-auth-brand">THPTQG AI</div>
          <div className="legacy-auth-mark">{isLogin ? 'Đăng nhập' : 'Đăng ký'}</div>
          <h1 className="legacy-auth-title">{title}</h1>
          <p className="legacy-auth-description">{description}</p>
          {form}
          {statusMessage ? <div className="legacy-auth-status">{statusMessage}</div> : null}
        </section>

        <aside className="legacy-auth-overlay">
          <div className="legacy-auth-overlay-inner">
            <div className="legacy-auth-overlay-badge">Phiên bản web</div>
            <h2>{isLogin ? 'Chao mung tro lai' : 'Bat dau ngay'}</h2>
            <p>
              {isLogin
                ? 'Đăng nhập để tiếp tục làm bài, xem lịch sử và đồng bộ tiến độ học tập với Supabase.'
                : 'Tạo tài khoản để bắt đầu luồng ôn tập, làm đề và nhận giải thích AI trên web.'}
            </p>
            <Link className="legacy-auth-switch" to={isLogin ? '/register' : '/login'}>
              {isLogin ? 'Tạo tài khoản' : 'Về đăng nhập'}
            </Link>
          </div>
        </aside>
      </div>
    </div>
  )
}
