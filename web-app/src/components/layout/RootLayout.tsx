import { Outlet, useLocation } from 'react-router-dom'

export function RootLayout() {
  const location = useLocation()
  const isAuthRoute = location.pathname === '/login' || location.pathname === '/register'

  if (isAuthRoute) {
    return <Outlet />
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <div style={styles.eyebrow}>THPTQG AI</div>
          <h1 style={styles.title}>Nen Tang On Tap Tren Web</h1>
          <p style={styles.subtitle}>Dang ky, lam bai, AI giai thich va lich su hoc tap tren mot flow thong nhat.</p>
        </div>
        <div style={styles.badge}>Web First</div>
      </header>
      <main style={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    padding: '32px',
  },
  header: {
    maxWidth: '1120px',
    margin: '0 auto 24px',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '24px',
  },
  eyebrow: {
    fontSize: '12px',
    fontWeight: 700,
    letterSpacing: '0.16em',
    textTransform: 'uppercase' as const,
    color: '#4f6b8a',
    marginBottom: '8px',
  },
  title: {
    margin: 0,
    fontSize: '32px',
    lineHeight: 1.1,
    color: '#10233c',
  },
  subtitle: {
    margin: '10px 0 0',
    maxWidth: '620px',
    color: '#58708d',
  },
  badge: {
    borderRadius: '999px',
    padding: '10px 16px',
    backgroundColor: '#10233c',
    color: '#f8fbff',
    fontWeight: 700,
  },
  main: {
    maxWidth: '1120px',
    margin: '0 auto',
  },
}
