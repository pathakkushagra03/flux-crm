import { NextResponse } from 'next/server'
import { getUser, updateUser, deleteUser } from '@/lib/users'

export async function GET(request, { params }) {
  try {
    const user = await getUser(params.id)
    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}

export async function PUT(request, { params }) {
  try {
    const data = await request.json()
    const user = await updateUser(params.id, data)
    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    await deleteUser(params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}
