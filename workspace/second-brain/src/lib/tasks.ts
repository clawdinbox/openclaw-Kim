import fs from 'fs'
import path from 'path'

const TASKS_PATH = path.join(process.cwd(), '..', 'documents', '.tasks.json')

export interface Task {
  id: string
  title: string
  description?: string
  status: 'backlog' | 'todo' | 'in-progress' | 'done'
  priority: 'low' | 'medium' | 'high'
  tags?: string[]
  createdAt: string
  updatedAt: string
}

export interface TaskBoard {
  tasks: Task[]
}

export function getTaskBoard(): TaskBoard {
  if (!fs.existsSync(TASKS_PATH)) {
    return { tasks: [] }
  }
  const content = fs.readFileSync(TASKS_PATH, 'utf8')
  return JSON.parse(content)
}

export function saveTaskBoard(board: TaskBoard): void {
  fs.writeFileSync(TASKS_PATH, JSON.stringify(board, null, 2))
}

export function getTasksByStatus(status: Task['status']): Task[] {
  const board = getTaskBoard()
  return board.tasks.filter(t => t.status === status)
}
