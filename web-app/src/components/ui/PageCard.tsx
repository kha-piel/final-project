import type { ReactNode } from 'react'

type PageCardProps = {
  title: string
  description: string
  children?: ReactNode
}

export function PageCard({ title, description, children }: PageCardProps) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
      <div className="mb-6">
        <h2 className="mb-2 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">{title}</h2>
        <p className="text-slate-500 leading-relaxed max-w-3xl">{description}</p>
      </div>
      {children}
    </section>
  )
}
