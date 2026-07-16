import { NextResponse } from 'next/server'
import { getTasks, createTask } from '@/lib/tasks'

export async function GET() {
  try {
    const tasks = await getTasks()
    return NextResponse.json(tasks)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch tasks', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const data = await request.json()
    const task = await createTask(data)
    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create task', details: error.message },
      { status: 500 }
    )
  }
}
