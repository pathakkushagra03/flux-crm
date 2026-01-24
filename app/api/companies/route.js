import { NextResponse } from 'next/server'
import { getCompanies, createCompany } from '@/lib/companies'

export async function GET() {
  try {
    const companies = await getCompanies()
    return NextResponse.json(companies)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch companies' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const data = await request.json()
    const company = await createCompany(data)
    return NextResponse.json(company, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create company' },
      { status: 500 }
    )
  }
}
