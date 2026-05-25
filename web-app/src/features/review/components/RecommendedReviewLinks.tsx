import { Link } from 'react-router-dom'
import type { KnowledgeReviewTopic } from '../knowledge-review-topics'

type RecommendedReviewLinksProps = {
  topics: KnowledgeReviewTopic[]
}

export function RecommendedReviewLinks({ topics }: RecommendedReviewLinksProps) {
  if (topics.length === 0) {
    return null
  }

  return (
    <div className="mt-5 rounded-[24px] border border-sky-100 bg-sky-50/70 p-4">
      <div className="text-xs font-bold uppercase tracking-[0.16em] text-sky-700">
        Gợi ý ôn tập liên quan
      </div>
      <div className="mt-3 grid gap-3">
        {topics.map((topic) => (
          <Link
            className="group rounded-[20px] border border-slate-200 bg-white px-4 py-4 transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-[0_14px_34px_rgba(14,116,144,0.10)] active:translate-y-0"
            key={topic.key}
            to={`/knowledge-review/${topic.key}`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-base font-extrabold text-slate-950">{topic.title}</div>
                <p className="mt-1 text-sm leading-6 text-slate-600">{topic.summary}</p>
              </div>
              <span className="rounded-full bg-slate-950 px-3 py-1.5 text-xs font-bold text-white transition group-hover:bg-sky-700">
                Ôn tập ngay
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
