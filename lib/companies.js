import base, { TABLES } from './airtable'

// Get all companies
export async function getCompanies() {
  try {
    const records = await base(TABLES.COMPANIES).select().all()

    return records.map(record => ({
      id: record.id,
      companyName: record.get('CompanyName') || '',
      photo: record.get('Photo')?.[0]?.url || null,
      users: record.get('Users') || [],
    }))
  } catch (error) {
    console.error('Error fetching companies:', error)
    throw error
  }
}

// Get single company by ID
export async function getCompany(id) {
  try {
    const record = await base(TABLES.COMPANIES).find(id)

    return {
      id: record.id,
      companyName: record.get('CompanyName') || '',
      photo: record.get('Photo')?.[0]?.url || null,
      users: record.get('Users') || [],
    }
  } catch (error) {
    console.error('Error fetching company:', error)
    throw error
  }
}

// Create new company
export async function createCompany(data) {
  try {
    const fields = {
      'CompanyName': data.companyName,
    }

    if (data.photo) {
      fields['Photo'] = [{ url: data.photo }]
    }

    if (data.users && data.users.length > 0) {
      fields['Users'] = data.users
    }

    const record = await base(TABLES.COMPANIES).create(fields)

    return {
      id: record.id,
      companyName: record.get('CompanyName'),
      photo: record.get('Photo')?.[0]?.url || null,
      users: record.get('Users') || [],
    }
  } catch (error) {
    console.error('Error creating company:', error)
    throw error
  }
}

// Update company
export async function updateCompany(id, data) {
  try {
    const fields = {}

    if (data.companyName !== undefined) fields['CompanyName'] = data.companyName

    if (data.photo !== undefined) {
      fields['Photo'] = data.photo ? [{ url: data.photo }] : []
    }

    if (data.users !== undefined) {
      fields['Users'] = data.users
    }

    const record = await base(TABLES.COMPANIES).update(id, fields)

    return {
      id: record.id,
      companyName: record.get('CompanyName'),
      photo: record.get('Photo')?.[0]?.url || null,
      users: record.get('Users') || [],
    }
  } catch (error) {
    console.error('Error updating company:', error)
    throw error
  }
}

// Delete company
export async function deleteCompany(id) {
  try {
    await base(TABLES.COMPANIES).destroy(id)
    return { success: true }
  } catch (error) {
    console.error('Error deleting company:', error)
    throw error
  }
}
