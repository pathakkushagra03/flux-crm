import base, { TABLES } from './airtable'

// Get all users
export async function getUsers() {
  try {
    const records = await base(TABLES.USERS).select({
      sort: [{ field: 'Created At', direction: 'desc' }]
    }).all()
    
    return records.map(record => ({
      id: record.id,
      name: record.get('Name') || '',
      email: record.get('Email') || '',
      phone: record.get('Phone') || '',
      role: record.get('Role') || '',
      profilePhoto: record.get('Profile Photo')?.[0]?.url || null,
      status: record.get('Status') || '',
      createdAt: record.get('Created At') || '',
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
      name: record.get('Name') || '',
      email: record.get('Email') || '',
      phone: record.get('Phone') || '',
      role: record.get('Role') || '',
      profilePhoto: record.get('Profile Photo')?.[0]?.url || null,
      status: record.get('Status') || '',
      createdAt: record.get('Created At') || '',
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
      'Name': data.name,
      'Email': data.email,
      'Phone': data.phone || '',
      'Role': data.role,
      'Status': data.status || 'Active',
    }

    // Handle photo upload if provided
    if (data.profilePhoto) {
      fields['Profile Photo'] = [{ url: data.profilePhoto }]
    }

    const record = await base(TABLES.USERS).create(fields)
    
    return {
      id: record.id,
      name: record.get('Name'),
      email: record.get('Email'),
      phone: record.get('Phone'),
      role: record.get('Role'),
      profilePhoto: record.get('Profile Photo')?.[0]?.url || null,
      status: record.get('Status'),
      createdAt: record.get('Created At'),
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
    
    if (data.name !== undefined) fields['Name'] = data.name
    if (data.email !== undefined) fields['Email'] = data.email
    if (data.phone !== undefined) fields['Phone'] = data.phone
    if (data.role !== undefined) fields['Role'] = data.role
    if (data.status !== undefined) fields['Status'] = data.status
    
    // Handle photo upload if provided
    if (data.profilePhoto !== undefined) {
      fields['Profile Photo'] = data.profilePhoto ? [{ url: data.profilePhoto }] : []
    }

    const record = await base(TABLES.USERS).update(id, fields)
    
    return {
      id: record.id,
      name: record.get('Name'),
      email: record.get('Email'),
      phone: record.get('Phone'),
      role: record.get('Role'),
      profilePhoto: record.get('Profile Photo')?.[0]?.url || null,
      status: record.get('Status'),
      createdAt: record.get('Created At'),
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
