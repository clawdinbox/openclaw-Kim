'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { DocumentTree } from '@/lib/documents'

const categoryIcons: Record<string, string> = {
  journal: '📔',
  concepts: '💡',
  general: '📄',
}

const categoryOrder = ['journal', 'concepts', 'general']

export default function Sidebar({ documents }: { documents: DocumentTree }) {
  const pathname = usePathname()
  
  const sortedCategories = Object.keys(documents).sort((a, b) => {
    const indexA = categoryOrder.indexOf(a)
    const indexB = categoryOrder.indexOf(b)
    if (indexA === -1 && indexB === -1) return a.localeCompare(b)
    if (indexA === -1) return 1
    if (indexB === -1) return -1
    return indexA - indexB
  })

  const navItems = [
    { href: '/', icon: '🎯', label: 'Mission Control' },
    { href: '/kanban', icon: '📋', label: 'Kanban Board' },
  ]

  return (
    <aside className="w-64 h-screen bg-bg-secondary border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl">🧠</span>
          <span className="font-semibold text-text-primary">2nd Brain</span>
        </Link>
      </div>
      
      {/* Main Navigation */}
      <div className="p-3 border-b border-border">
        {navItems.map(item => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-accent-purple/20 text-accent-purple'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
      
      {/* Documents Navigation */}
      <nav className="flex-1 overflow-y-auto p-3">
        <div className="px-2 py-1.5 text-xs font-medium text-text-muted uppercase tracking-wider mb-2">
          Documents
        </div>
        {sortedCategories.map((category) => (
          <div key={category} className="mb-4">
            <div className="flex items-center gap-2 px-2 py-1.5 text-xs font-medium text-text-muted">
              <span>{categoryIcons[category] || '📁'}</span>
              <span className="capitalize">{category}</span>
              <span className="ml-auto text-text-muted/50">{documents[category].length}</span>
            </div>
            <ul className="mt-1">
              {documents[category].map((doc) => {
                const href = `/doc/${doc.slug}`
                const isActive = pathname === href
                return (
                  <li key={doc.slug}>
                    <Link
                      href={href}
                      className={`block px-3 py-1.5 rounded-md text-sm transition-colors ${
                        isActive
                          ? 'bg-bg-tertiary text-text-primary'
                          : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary/50'
                      }`}
                    >
                      {doc.title}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>
      
      {/* Footer */}
      <div className="p-3 border-t border-border">
        <div className="px-2 py-1 text-xs text-text-muted flex items-center justify-between">
          <span>{Object.values(documents).flat().length} documents</span>
          <span className="text-accent-purple">Kim 🦞</span>
        </div>
      </div>
    </aside>
  )
}
