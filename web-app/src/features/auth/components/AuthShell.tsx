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
          <div className="legacy-auth-mark">{isLogin ? 'Dang nhap' : 'Dang ky'}</div>
          <h1 className="legacy-auth-title">{title}</h1>
          <p className="legacy-auth-description">{description}</p>
          {form}
          {statusMessage ? <div className="legacy-auth-status">{statusMessage}</div> : null}
        </section>

        <aside className="legacy-auth-overlay">
          <div className="legacy-auth-overlay-inner">
            <div className="legacy-auth-overlay-badge">Phien ban web</div>
            <h2>{isLogin ? 'Chao mung tro lai' : 'Bat dau ngay'}</h2>
            <p>
              {isLogin
                ? 'Dang nhap de tiep tuc lam bai, xem lich su va dong bo tien do hoc tap voi Supabase.'
                : 'Tao tai khoan de bat dau luong on tap, lam de va nhan giai thich AI tren web.'}
            </p>
            <Link className="legacy-auth-switch" to={isLogin ? '/register' : '/login'}>
              {isLogin ? 'Tao tai khoan' : 'Ve dang nhap'}
            </Link>
          </div>
        </aside>
      </div>
    </div>
  )
}
