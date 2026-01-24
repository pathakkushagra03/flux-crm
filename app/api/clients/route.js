import { NextResponse } from 'next/server'
import { getClients, createClient } from '@/lib/clients'

export async function GET() {
  try {
    const clients = await getClients()
    return NextResponse.json(clients)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const data = await request.json()
    const client = await createClient(data)
    return NextResponse.json(client, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create client' },
      { status: 500 }
    )
  }
}
