import base, { TABLES } from './airtable'

// Get all users
export async function getUsers() {
  try {
    const records = await base(TABLES.USERS).select().all()

    return records.map(record => ({
      id: record.id,
      name: record.get('User Name') || '',
      email: record.get('E-Mail') || '',
      phone: record.get('Phone Number') || '',
      role: record.get('Role') || '',
      companies: record.get('Companies') || [],
    }))
  } catch (error) {
    console.error('Error fetching users:', error)
    throw error
  }
}

// Get single user by ID
export async function getUser(id) {
  try {
    const record = await base(TABLES.USERS).find(id)

    return {
      id: record.id,
      name: record.get('User Name') || '',
      email: record.get('E-Mail') || '',
      phone: record.get('Phone Number') || '',
      role: record.get('Role') || '',
      companies: record.get('Companies') || [],
    }
  } catch (error) {
    console.error('Error fetching user:', error)
    throw error
  }
}

// Create new user
export async function createUser(data) {
  try {
    const fields = {
      'User Name': data.name,
      'E-Mail': data.email,
      'Phone Number': data.phone || '',
      'Role': data.role,
    }

    if (data.companies && data.companies.length > 0) {
      fields['Companies'] = data.companies
    }

    const record = await base(TABLES.USERS).create(fields)

    return {
      id: record.id,
      name: record.get('User Name'),
      email: record.get('E-Mail'),
      phone: record.get('Phone Number'),
      role: record.get('Role'),
      companies: record.get('Companies') || [],
    }
  } catch (error) {
    console.error('Error creating user:', error)
    throw error
  }
}

// Update user
export async function updateUser(id, data) {
  try {
    const fields = {}

    if (data.name !== undefined) fields['User Name'] = data.name
    if (data.email !== undefined) fields['E-Mail'] = data.email
    if (data.phone !== undefined) fields['Phone Number'] = data.phone
    if (data.role !== undefined) fields['Role'] = data.role
    if (data.companies !== undefined) fields['Companies'] = data.companies

    const record = await base(TABLES.USERS).update(id, fields)

    return {
      id: record.id,
      name: record.get('User Name'),
      email: record.get('E-Mail'),
      phone: record.get('Phone Number'),
      role: record.get('Role'),
      companies: record.get('Companies') || [],
    }
  } catch (error) {
    console.error('Error updating user:', error)
    throw error
  }
}

// Delete user
export async function deleteUser(id) {
  try {
    await base(TABLES.USERS).destroy(id)
    return { success: true }
  } catch (error) {
    console.error('Error deleting user:', error)
    throw error
  }
}
