import Sidebar from '@/components/Sidebar'
import KanbanBoard from '@/components/KanbanBoard'
import { getAllDocuments } from '@/lib/documents'
import { getTaskBoard } from '@/lib/tasks'

export const dynamic = 'force-dynamic'

export default function KanbanPage() {
  const documents = getAllDocuments()
  const taskBoard = getTaskBoard()
  
  return (
    <div className="flex h-screen">
      <Sidebar documents={documents} />
      
      <main className="flex-1 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-bg-secondary border-b border-border px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <span>📋</span>
                Kanban Board
              </h1>
              <p className="text-sm text-text-muted mt-0.5">Track projects and tasks</p>
            </div>
            <div className="text-sm text-text-muted">
              {taskBoard.tasks.length} tasks
            </div>
          </div>
        </div>
        
        {/* Board */}
        <KanbanBoard initialTasks={taskBoard.tasks} />
      </main>
    </div>
  )
}
