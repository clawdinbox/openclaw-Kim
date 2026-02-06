'use client'

import { useState } from 'react'
import { Task } from '@/lib/tasks'

const columns = [
  { id: 'backlog', title: 'Backlog', icon: '📥', color: 'text-text-muted' },
  { id: 'todo', title: 'To Do', icon: '📋', color: 'text-accent-purple' },
  { id: 'in-progress', title: 'In Progress', icon: '🔄', color: 'text-accent-blue' },
  { id: 'done', title: 'Done', icon: '✅', color: 'text-green-500' },
] as const

const priorityColors = {
  high: 'bg-red-500',
  medium: 'bg-yellow-500',
  low: 'bg-green-500',
}

export default function KanbanBoard({ initialTasks }: { initialTasks: Task[] }) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [draggedTask, setDraggedTask] = useState<string | null>(null)

  const handleDragStart = (taskId: string) => {
    setDraggedTask(taskId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = async (status: Task['status']) => {
    if (!draggedTask) return
    
    const updatedTasks = tasks.map(task => 
      task.id === draggedTask 
        ? { ...task, status, updatedAt: new Date().toISOString() }
        : task
    )
    
    setTasks(updatedTasks)
    setDraggedTask(null)
    
    // Save to server
    await fetch('/api/tasks', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tasks: updatedTasks }),
    })
  }

  const getTasksByColumn = (status: Task['status']) => 
    tasks.filter(task => task.status === status)

  return (
    <div className="flex-1 overflow-x-auto p-6">
      <div className="flex gap-4 h-full min-w-max">
        {columns.map(column => (
          <div
            key={column.id}
            className="w-72 flex flex-col bg-bg-secondary rounded-xl border border-border"
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(column.id as Task['status'])}
          >
            {/* Column Header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>{column.icon}</span>
                  <span className={`font-medium ${column.color}`}>{column.title}</span>
                </div>
                <span className="text-xs bg-bg-tertiary px-2 py-0.5 rounded-full text-text-muted">
                  {getTasksByColumn(column.id as Task['status']).length}
                </span>
              </div>
            </div>
            
            {/* Tasks */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {getTasksByColumn(column.id as Task['status']).map(task => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={() => handleDragStart(task.id)}
                  className={`bg-bg-tertiary rounded-lg p-3 cursor-grab active:cursor-grabbing border border-transparent hover:border-border transition-all ${
                    draggedTask === task.id ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-2 mb-2">
                    <span className={`w-2 h-2 rounded-full mt-1.5 ${priorityColors[task.priority]}`} />
                    <span className="font-medium text-sm flex-1">{task.title}</span>
                  </div>
                  {task.description && (
                    <p className="text-xs text-text-muted ml-4 line-clamp-2">{task.description}</p>
                  )}
                  {task.tags && task.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2 ml-4">
                      {task.tags.map(tag => (
                        <span key={tag} className="text-xs px-1.5 py-0.5 bg-bg-secondary rounded text-text-muted">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              
              {getTasksByColumn(column.id as Task['status']).length === 0 && (
                <div className="text-center py-8 text-text-muted text-sm">
                  No tasks
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
