import base, { TABLES } from './airtable'

// Get all companies
export async function getCompanies() {
  try {
    const records = await base(TABLES.COMPANIES).select().all()
    
    return records.map(record => ({
      id: record.id,
      companyName: record.get('Company Name') || '',
      industry: record.get('Industry') || '',
      website: record.get('Website') || '',
      phone: record.get('Phone') || '',
      address: record.get('Address') || '',
      logo: record.get('Logo')?.[0]?.url || null,
      owner: record.get('Owner') || [],
      createdAt: record.get('Created At') || '',
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
      companyName: record.get('Company Name') || '',
      industry: record.get('Industry') || '',
      website: record.get('Website') || '',
      phone: record.get('Phone') || '',
      address: record.get('Address') || '',
      logo: record.get('Logo')?.[0]?.url || null,
      owner: record.get('Owner') || [],
      createdAt: record.get('Created At') || '',
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
      'Company Name': data.companyName,
      'Industry': data.industry || '',
      'Website': data.website || '',
      'Phone': data.phone || '',
      'Address': data.address || '',
    }

    if (data.logo) {
      fields['Logo'] = [{ url: data.logo }]
    }

    if (data.owner && data.owner.length > 0) {
      fields['Owner'] = data.owner
    }

    const record = await base(TABLES.COMPANIES).create(fields)
    
    return {
      id: record.id,
      companyName: record.get('Company Name'),
      industry: record.get('Industry'),
      website: record.get('Website'),
      phone: record.get('Phone'),
      address: record.get('Address'),
      logo: record.get('Logo')?.[0]?.url || null,
      owner: record.get('Owner') || [],
      createdAt: record.get('Created At'),
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
    
    if (data.companyName !== undefined) fields['Company Name'] = data.companyName
    if (data.industry !== undefined) fields['Industry'] = data.industry
    if (data.website !== undefined) fields['Website'] = data.website
    if (data.phone !== undefined) fields['Phone'] = data.phone
    if (data.address !== undefined) fields['Address'] = data.address
    
    if (data.logo !== undefined) {
      fields['Logo'] = data.logo ? [{ url: data.logo }] : []
    }

    if (data.owner !== undefined) {
      fields['Owner'] = data.owner
    }

    const record = await base(TABLES.COMPANIES).update(id, fields)
    
    return {
      id: record.id,
      companyName: record.get('Company Name'),
      industry: record.get('Industry'),
      website: record.get('Website'),
      phone: record.get('Phone'),
      address: record.get('Address'),
      logo: record.get('Logo')?.[0]?.url || null,
      owner: record.get('Owner') || [],
      createdAt: record.get('Created At'),
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
