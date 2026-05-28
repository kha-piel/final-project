import { NavLink } from 'react-router-dom'

const links = [
  { to: '/login', label: 'Login' },
  { to: '/register', label: 'Register' },
  { to: '/dashboard', label: 'Dashboard' },
]

export function NavLinks() {
  return (
    <nav style={styles.nav}>
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          style={({ isActive }) => ({
            ...styles.link,
            ...(isActive ? styles.linkActive : {}),
          })}
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  )
}

const styles = {
  nav: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '10px',
    marginBottom: '24px',
  },
  link: {
    padding: '10px 14px',
    borderRadius: '999px',
    border: '1px solid #c5d8eb',
    backgroundColor: '#f8fbff',
    color: '#39506b',
    fontWeight: 600,
  },
  linkActive: {
    backgroundColor: '#10233c',
    borderColor: '#10233c',
    color: '#ffffff',
  },
}
