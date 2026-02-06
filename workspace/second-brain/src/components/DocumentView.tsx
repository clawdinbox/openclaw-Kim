'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Document } from '@/lib/documents'

export default function DocumentView({ document }: { document: Document }) {
  return (
    <article className="max-w-3xl mx-auto">
      {/* Header */}
      <header className="mb-8 pb-6 border-b border-border">
        <div className="flex items-center gap-2 mb-3">
          <span className="px-2 py-0.5 text-xs font-medium bg-bg-tertiary text-text-muted rounded">
            {document.category}
          </span>
          {document.date && (
            <span className="text-xs text-text-muted">{document.date}</span>
          )}
        </div>
        <h1 className="text-3xl font-bold text-text-primary">{document.title}</h1>
        {document.tags && document.tags.length > 0 && (
          <div className="flex gap-2 mt-3">
            {document.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 text-xs bg-accent-purple/20 text-accent-purple rounded"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </header>
      
      {/* Content */}
      <div className="prose">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {document.content}
        </ReactMarkdown>
      </div>
    </article>
  )
}
