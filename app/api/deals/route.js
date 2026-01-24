import { NextResponse } from 'next/server'
import { getDeals, createDeal } from '@/lib/deals'

export async function GET() {
  try {
    const deals = await getDeals()
    return NextResponse.json(deals)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch deals' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const data = await request.json()
    const deal = await createDeal(data)
    return NextResponse.json(deal, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create deal' },
      { status: 500 }
    )
  }
}
