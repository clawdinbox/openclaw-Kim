import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import { getAllDocuments } from '@/lib/documents'
import { getTaskBoard } from '@/lib/tasks'

export const dynamic = 'force-dynamic'

export default function Home() {
  const documents = getAllDocuments()
  const allDocs = Object.values(documents).flat()
  const recentDocs = allDocs.slice(0, 5)
  const taskBoard = getTaskBoard()
  
  const tasksByStatus = {
    backlog: taskBoard.tasks.filter(t => t.status === 'backlog'),
    todo: taskBoard.tasks.filter(t => t.status === 'todo'),
    inProgress: taskBoard.tasks.filter(t => t.status === 'in-progress'),
    done: taskBoard.tasks.filter(t => t.status === 'done'),
  }
  
  const journalCount = documents['journal']?.length || 0
  const conceptCount = documents['concepts']?.length || 0
  
  return (
    <div className="flex h-screen">
      <Sidebar documents={documents} />
      
      <main className="flex-1 overflow-y-auto">
        {/* Mission Control Header */}
        <div className="bg-gradient-to-r from-accent-purple/10 to-accent-blue/10 border-b border-border">
          <div className="max-w-6xl mx-auto px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-3">
                  <span>🎯</span>
                  Mission Control
                </h1>
                <p className="text-text-secondary mt-1">Overview of your knowledge base and active work</p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href="/kanban"
                  className="px-4 py-2 bg-bg-tertiary hover:bg-border text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                  <span>📋</span>
                  Kanban Board
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        <div className="max-w-6xl mx-auto px-8 py-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-bg-secondary border border-border rounded-xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">📔</span>
                <span className="text-3xl font-bold">{journalCount}</span>
              </div>
              <div className="text-sm text-text-muted">Journal Entries</div>
            </div>
            <div className="bg-bg-secondary border border-border rounded-xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">💡</span>
                <span className="text-3xl font-bold">{conceptCount}</span>
              </div>
              <div className="text-sm text-text-muted">Concepts</div>
            </div>
            <div className="bg-bg-secondary border border-border rounded-xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">🔄</span>
                <span className="text-3xl font-bold">{tasksByStatus.inProgress.length}</span>
              </div>
              <div className="text-sm text-text-muted">In Progress</div>
            </div>
            <div className="bg-bg-secondary border border-border rounded-xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">✅</span>
                <span className="text-3xl font-bold">{tasksByStatus.done.length}</span>
              </div>
              <div className="text-sm text-text-muted">Completed</div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Task Overview */}
            <div className="lg:col-span-1 bg-bg-secondary border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold flex items-center gap-2">
                  <span>📋</span>
                  Tasks
                </h2>
                <Link href="/kanban" className="text-xs text-accent-purple hover:underline">
                  View all →
                </Link>
              </div>
              
              {taskBoard.tasks.length === 0 ? (
                <p className="text-text-muted text-sm py-4 text-center">No tasks yet</p>
              ) : (
                <div className="space-y-2">
                  {taskBoard.tasks.filter(t => t.status !== 'done').slice(0, 5).map(task => (
                    <div key={task.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-bg-tertiary">
                      <span className={`w-2 h-2 rounded-full ${
                        task.priority === 'high' ? 'bg-red-500' :
                        task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                      }`} />
                      <span className="text-sm flex-1 truncate">{task.title}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        task.status === 'in-progress' ? 'bg-accent-blue/20 text-accent-blue' :
                        task.status === 'todo' ? 'bg-accent-purple/20 text-accent-purple' :
                        'bg-bg-tertiary text-text-muted'
                      }`}>
                        {task.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Recent Documents */}
            <div className="lg:col-span-2 bg-bg-secondary border border-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold flex items-center gap-2">
                  <span>📄</span>
                  Recent Documents
                </h2>
              </div>
              
              {recentDocs.length === 0 ? (
                <p className="text-text-muted text-sm py-4 text-center">No documents yet</p>
              ) : (
                <div className="space-y-2">
                  {recentDocs.map((doc) => (
                    <Link
                      key={doc.slug}
                      href={`/doc/${doc.slug}`}
                      className="flex items-start gap-4 p-3 rounded-lg hover:bg-bg-tertiary transition-colors"
                    >
                      <span className="text-xl mt-0.5">
                        {doc.category === 'journal' ? '📔' : doc.category === 'concepts' ? '💡' : '📄'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-text-primary">{doc.title}</span>
                          <span className="px-1.5 py-0.5 text-xs bg-bg-tertiary text-text-muted rounded">
                            {doc.category}
                          </span>
                        </div>
                        <p className="text-sm text-text-muted line-clamp-1">
                          {doc.content.slice(0, 120)}...
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="mt-8 bg-bg-secondary border border-border rounded-xl p-5">
            <h2 className="font-semibold flex items-center gap-2 mb-4">
              <span>⚡</span>
              Quick Actions
            </h2>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/kanban"
                className="px-4 py-2 bg-bg-tertiary hover:bg-border rounded-lg text-sm transition-colors flex items-center gap-2"
              >
                <span>📋</span>
                Open Kanban
              </Link>
              <button
                className="px-4 py-2 bg-bg-tertiary hover:bg-border rounded-lg text-sm transition-colors flex items-center gap-2 opacity-50 cursor-not-allowed"
                disabled
              >
                <span>📝</span>
                New Document
              </button>
              <button
                className="px-4 py-2 bg-bg-tertiary hover:bg-border rounded-lg text-sm transition-colors flex items-center gap-2 opacity-50 cursor-not-allowed"
                disabled
              >
                <span>🔍</span>
                Search
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
