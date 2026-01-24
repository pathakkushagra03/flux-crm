import { NextResponse } from 'next/server'
import { getTask, updateTask, deleteTask } from '@/lib/tasks'

export async function GET(request, { params }) {
  try {
    const task = await getTask(params.id)
    return NextResponse.json(task)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch task' },
      { status: 500 }
    )
  }
}

export async function PUT(request, { params }) {
  try {
    const data = await request.json()
    const task = await updateTask(params.id, data)
    return NextResponse.json(task)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    await deleteTask(params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    )
  }
}
