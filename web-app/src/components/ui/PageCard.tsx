import type { ReactNode } from 'react'

type PageCardProps = {
  title: string
  description: string
  children?: ReactNode
}

export function PageCard({ title, description, children }: PageCardProps) {
  return (
    <section style={styles.card}>
      <div style={styles.header}>
        <h2 style={styles.title}>{title}</h2>
        <p style={styles.description}>{description}</p>
      </div>
      {children}
    </section>
  )
}

const styles = {
  card: {
    borderRadius: '28px',
    padding: '28px',
    backgroundColor: '#ffffff',
    border: '1px solid #d6e3f1',
    boxShadow: '0 18px 50px rgba(18, 52, 77, 0.08)',
  },
  header: {
    marginBottom: '20px',
  },
  title: {
    margin: '0 0 8px',
    fontSize: '28px',
    lineHeight: 1.1,
    color: '#10233c',
  },
  description: {
    margin: 0,
    color: '#58708d',
  },
}
