import type { Components } from 'react-markdown'
import ReactMarkdown from 'react-markdown'
import rehypeKatex from 'rehype-katex'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'

type MarkdownContentProps = {
  content: string
  className?: string
}

const components: Components = {
  h1: ({ children }) => <h1 className="mt-5 text-xl font-bold text-slate-950 first:mt-0">{children}</h1>,
  h2: ({ children }) => <h2 className="mt-5 text-lg font-bold text-slate-950 first:mt-0">{children}</h2>,
  h3: ({ children }) => <h3 className="mt-4 text-base font-bold text-slate-900 first:mt-0">{children}</h3>,
  p: ({ children }) => <p className="mt-3 leading-8 first:mt-0">{children}</p>,
  table: ({ children }) => (
    <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
      <table className="min-w-full border-collapse text-left text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-slate-50 text-slate-700">{children}</thead>,
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => <tr className="border-b border-slate-200 last:border-b-0">{children}</tr>,
  th: ({ children }) => <th className="px-4 py-3 font-semibold">{children}</th>,
  td: ({ children }) => <td className="px-4 py-3 align-top">{children}</td>,
  ul: ({ children }) => <ul className="mt-3 list-disc space-y-2 pl-6">{children}</ul>,
  ol: ({ children }) => <ol className="mt-3 list-decimal space-y-2 pl-6">{children}</ol>,
  li: ({ children }) => <li className="leading-8">{children}</li>,
  hr: () => <hr className="my-5 border-slate-200" />,
  strong: ({ children }) => <strong className="font-bold text-slate-950">{children}</strong>,
  code: ({ children }) => (
    <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[0.95em] text-slate-900">
      {children}
    </code>
  ),
}

function normalizeMarkdown(content: string) {
  return content
    .replace(/\\\$/g, '$')
    .replace(/\\\(([\s\S]*?)\\\)/g, (_match, expression: string) => `$${expression}$`)
    .replace(/\\\[([\s\S]*?)\\\]/g, (_match, expression: string) => `$$${expression}$$`)
    .trim()
}

export function MarkdownContent({ content, className = '' }: MarkdownContentProps) {
  return (
    <div className={`text-sm text-slate-800 ${className}`.trim()}>
      <ReactMarkdown
        components={components}
        rehypePlugins={[rehypeKatex]}
        remarkPlugins={[remarkGfm, remarkMath]}
      >
        {normalizeMarkdown(content)}
      </ReactMarkdown>
    </div>
  )
}
