import { NextResponse } from 'next/server'
import { getCompany, updateCompany, deleteCompany } from '@/lib/companies'

export async function GET(request, { params }) {
  try {
    const company = await getCompany(params.id)
    return NextResponse.json(company)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch company' },
      { status: 500 }
    )
  }
}

export async function PUT(request, { params }) {
  try {
    const data = await request.json()
    const company = await updateCompany(params.id, data)
    return NextResponse.json(company)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update company' },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    await deleteCompany(params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete company' },
      { status: 500 }
    )
  }
}
