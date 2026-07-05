import base, { TABLES } from './airtable'

// Get all clients
export async function getClients() {
  try {
    const records = await base(TABLES.CLIENTS).select().all()
    
    return records.map(record => ({
      id: record.id,
      clientName: record.get('Client Name') || '',
      email: record.get('Email') || '',
      phone: record.get('Phone') || '',
      company: record.get('Company') || [],
      assignedUser: record.get('Assigned User') || [],
      profilePhoto: record.get('Profile Photo')?.[0]?.url || null,
      status: record.get('Status') || '',
      notes: record.get('Notes') || '',
      createdAt: record.get('Created At') || '',
    }))
  } catch (error) {
    console.error('Error fetching clients:', error)
    throw error
  }
}

// Get single client by ID
export async function getClient(id) {
  try {
    const record = await base(TABLES.CLIENTS).find(id)
    
    return {
      id: record.id,
      clientName: record.get('Client Name') || '',
      email: record.get('Email') || '',
      phone: record.get('Phone') || '',
      company: record.get('Company') || [],
      assignedUser: record.get('Assigned User') || [],
      profilePhoto: record.get('Profile Photo')?.[0]?.url || null,
      status: record.get('Status') || '',
      notes: record.get('Notes') || '',
      createdAt: record.get('Created At') || '',
    }
  } catch (error) {
    console.error('Error fetching client:', error)
    throw error
  }
}

// Create new client
export async function createClient(data) {
  try {
    const fields = {
      'Client Name': data.clientName,
      'Email': data.email || '',
      'Phone': data.phone || '',
      'Status': data.status || 'New',
      'Notes': data.notes || '',
    }

    if (data.profilePhoto) {
      fields['Profile Photo'] = [{ url: data.profilePhoto }]
    }

    if (data.company && data.company.length > 0) {
      fields['Company'] = data.company
    }

    if (data.assignedUser && data.assignedUser.length > 0) {
      fields['Assigned User'] = data.assignedUser
    }

    const record = await base(TABLES.CLIENTS).create(fields)
    
    return {
      id: record.id,
      clientName: record.get('Client Name'),
      email: record.get('Email'),
      phone: record.get('Phone'),
      company: record.get('Company') || [],
      assignedUser: record.get('Assigned User') || [],
      profilePhoto: record.get('Profile Photo')?.[0]?.url || null,
      status: record.get('Status'),
      notes: record.get('Notes'),
      createdAt: record.get('Created At'),
    }
  } catch (error) {
    console.error('Error creating client:', error)
    throw error
  }
}

// Update client
export async function updateClient(id, data) {
  try {
    const fields = {}
    
    if (data.clientName !== undefined) fields['Client Name'] = data.clientName
    if (data.email !== undefined) fields['Email'] = data.email
    if (data.phone !== undefined) fields['Phone'] = data.phone
    if (data.status !== undefined) fields['Status'] = data.status
    if (data.notes !== undefined) fields['Notes'] = data.notes
    
    if (data.profilePhoto !== undefined) {
      fields['Profile Photo'] = data.profilePhoto ? [{ url: data.profilePhoto }] : []
    }

    if (data.company !== undefined) {
      fields['Company'] = data.company
    }

    if (data.assignedUser !== undefined) {
      fields['Assigned User'] = data.assignedUser
    }

    const record = await base(TABLES.CLIENTS).update(id, fields)
    
    return {
      id: record.id,
      clientName: record.get('Client Name'),
      email: record.get('Email'),
      phone: record.get('Phone'),
      company: record.get('Company') || [],
      assignedUser: record.get('Assigned User') || [],
      profilePhoto: record.get('Profile Photo')?.[0]?.url || null,
      status: record.get('Status'),
      notes: record.get('Notes'),
      createdAt: record.get('Created At'),
    }
  } catch (error) {
    console.error('Error updating client:', error)
    throw error
  }
}

// Delete client
export async function deleteClient(id) {
  try {
    await base(TABLES.CLIENTS).destroy(id)
    return { success: true }
  } catch (error) {
    console.error('Error deleting client:', error)
    throw error
  }
}
