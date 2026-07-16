import { NextResponse } from 'next/server'
import { getDeal, updateDeal, deleteDeal } from '@/lib/deals'

export async function GET(request, { params }) {
  try {
    const deal = await getDeal(params.id)
    return NextResponse.json(deal)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch deal', details: error.message },
      { status: 500 }
    )
  }
}

export async function PUT(request, { params }) {
  try {
    const data = await request.json()
    const deal = await updateDeal(params.id, data)
    return NextResponse.json(deal)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update deal', details: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    await deleteDeal(params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete deal', details: error.message },
      { status: 500 }
    )
  }
}
