import { NextRequest, NextResponse } from 'next/server'
import { saveTaskBoard, Task } from '@/lib/tasks'

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const tasks: Task[] = body.tasks
    
    saveTaskBoard({ tasks })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save tasks' }, { status: 500 })
  }
}
