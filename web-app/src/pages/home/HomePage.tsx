import { useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PageCard } from '../../components/ui/PageCard'
import { logout } from '../../features/auth/services/auth-service'
import { useAuthSessionStore } from '../../features/auth/store/auth-session-store'

export function HomePage() {
  const navigate = useNavigate()
  const user = useAuthSessionStore((state) => state.user)
  const [displayError, setDisplayError] = useState<string | null>(null)

  async function handleLogout() {
    try {
      await logout()
      navigate('/login', { replace: true })
    } catch (error) {
      setDisplayError(error instanceof Error ? error.message : 'Đăng xuất thất bại.')
    }
  }

  return (
    <PageCard
      title={`Xin chào ${user?.fullName || user?.email || 'học sinh'}`}
      description="Chọn nhanh để tiếp tục ôn tập, xem lịch sử bài làm và quản lý tài khoản học sinh."
    >
      <div style={styles.metaRow}>
        <MetaPill label="Email" value={user?.email ?? '--'} />
        <MetaPill label="Username" value={user?.username ?? '--'} />
        <MetaPill label="Role" value={user?.role ?? 'dang tai...'} />
        <MetaPill label="Status" value={user?.status ?? 'dang tai...'} />
      </div>

      <div style={styles.grid}>
        <FeatureTile
          title="Ôn tập kiến thức"
          description="Vào dashboard để chọn môn học, chuyên đề, độ khó và bắt đầu bài mới."
          action={<Link style={styles.linkButton} to="/dashboard">Mở dashboard</Link>}
        />
        <FeatureTile
          title="Tiến độ học tập"
          description="Bài đang làm dở, bài đang làm trên cloud và lịch sử review được tập trung tại dashboard."
          action={<Link style={styles.linkButton} to="/history">Xem lịch sử</Link>}
        />
        <FeatureTile
          title="Đăng xuất"
          description="Xóa session Supabase trên web và quay về login."
          action={
            <button onClick={handleLogout} style={styles.logoutButton} type="button">
              Đăng xuất
            </button>
          }
        />
      </div>

      {displayError ? <p style={styles.error}>{displayError}</p> : null}
    </PageCard>
  )
}

function MetaPill({ label, value }: { label: string; value: string }) {
  return (
    <div style={styles.pill}>
      <strong>{label}:</strong> {value}
    </div>
  )
}

function FeatureTile({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action: ReactNode
}) {
  return (
    <div style={styles.tile}>
      <h3 style={styles.tileTitle}>{title}</h3>
      <p style={styles.tileText}>{description}</p>
      <div>{action}</div>
    </div>
  )
}

const styles = {
  metaRow: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '12px',
    marginBottom: '20px',
  },
  pill: {
    borderRadius: '999px',
    padding: '10px 14px',
    backgroundColor: '#edf5ff',
    border: '1px solid #d4e4f6',
    color: '#24415e',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '16px',
  },
  tile: {
    borderRadius: '22px',
    padding: '18px',
    border: '1px solid #d8e3ee',
    backgroundColor: '#f9fbff',
    minHeight: '210px',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'space-between',
  },
  tileTitle: {
    margin: '0 0 10px',
    color: '#10233c',
  },
  tileText: {
    margin: 0,
    color: '#5d7491',
  },
  linkButton: {
    display: 'inline-block',
    padding: '10px 14px',
    borderRadius: '12px',
    backgroundColor: '#10233c',
    color: '#ffffff',
    fontWeight: 700,
  },
  logoutButton: {
    borderRadius: '12px',
    border: 0,
    padding: '10px 14px',
    backgroundColor: '#b42318',
    color: '#ffffff',
    fontWeight: 700,
  },
  error: {
    color: '#b42318',
    fontWeight: 600,
    marginTop: '16px',
  },
}
