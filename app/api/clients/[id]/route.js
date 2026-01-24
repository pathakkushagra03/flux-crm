import { NextResponse } from 'next/server'
import { getClient, updateClient, deleteClient } from '@/lib/clients'

export async function GET(request, { params }) {
  try {
    const client = await getClient(params.id)
    return NextResponse.json(client)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch client' },
      { status: 500 }
    )
  }
}

export async function PUT(request, { params }) {
  try {
    const data = await request.json()
    const client = await updateClient(params.id, data)
    return NextResponse.json(client)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update client' },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    await deleteClient(params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete client' },
      { status: 500 }
    )
  }
}
