import base, { TABLES } from './airtable'

// Get all deals
export async function getDeals() {
  try {
    const records = await base(TABLES.DEALS).select({
      sort: [{ field: 'Created At', direction: 'desc' }]
    }).all()
    
    return records.map(record => ({
      id: record.id,
      dealName: record.get('Deal Name') || '',
      client: record.get('Client') || [],
      company: record.get('Company') || [],
      dealValue: record.get('Deal Value') || 0,
      stage: record.get('Stage') || '',
      expectedCloseDate: record.get('Expected Close Date') || '',
      assignedUser: record.get('Assigned User') || [],
      notes: record.get('Notes') || '',
      createdAt: record.get('Created At') || '',
    }))
  } catch (error) {
    console.error('Error fetching deals:', error)
    throw error
  }
}

// Get single deal by ID
export async function getDeal(id) {
  try {
    const record = await base(TABLES.DEALS).find(id)
    
    return {
      id: record.id,
      dealName: record.get('Deal Name') || '',
      client: record.get('Client') || [],
      company: record.get('Company') || [],
      dealValue: record.get('Deal Value') || 0,
      stage: record.get('Stage') || '',
      expectedCloseDate: record.get('Expected Close Date') || '',
      assignedUser: record.get('Assigned User') || [],
      notes: record.get('Notes') || '',
      createdAt: record.get('Created At') || '',
    }
  } catch (error) {
    console.error('Error fetching deal:', error)
    throw error
  }
}

// Create new deal
export async function createDeal(data) {
  try {
    const fields = {
      'Deal Name': data.dealName,
      'Deal Value': data.dealValue || 0,
      'Stage': data.stage || 'Lead',
      'Expected Close Date': data.expectedCloseDate || '',
      'Notes': data.notes || '',
    }

    if (data.client && data.client.length > 0) {
      fields['Client'] = data.client
    }

    if (data.company && data.company.length > 0) {
      fields['Company'] = data.company
    }

    if (data.assignedUser && data.assignedUser.length > 0) {
      fields['Assigned User'] = data.assignedUser
    }

    const record = await base(TABLES.DEALS).create(fields)
    
    return {
      id: record.id,
      dealName: record.get('Deal Name'),
      client: record.get('Client') || [],
      company: record.get('Company') || [],
      dealValue: record.get('Deal Value'),
      stage: record.get('Stage'),
      expectedCloseDate: record.get('Expected Close Date'),
      assignedUser: record.get('Assigned User') || [],
      notes: record.get('Notes'),
      createdAt: record.get('Created At'),
    }
  } catch (error) {
    console.error('Error creating deal:', error)
    throw error
  }
}

// Update deal
export async function updateDeal(id, data) {
  try {
    const fields = {}
    
    if (data.dealName !== undefined) fields['Deal Name'] = data.dealName
    if (data.dealValue !== undefined) fields['Deal Value'] = data.dealValue
    if (data.stage !== undefined) fields['Stage'] = data.stage
    if (data.expectedCloseDate !== undefined) fields['Expected Close Date'] = data.expectedCloseDate
    if (data.notes !== undefined) fields['Notes'] = data.notes
    
    if (data.client !== undefined) fields['Client'] = data.client
    if (data.company !== undefined) fields['Company'] = data.company
    if (data.assignedUser !== undefined) fields['Assigned User'] = data.assignedUser

    const record = await base(TABLES.DEALS).update(id, fields)
    
    return {
      id: record.id,
      dealName: record.get('Deal Name'),
      client: record.get('Client') || [],
      company: record.get('Company') || [],
      dealValue: record.get('Deal Value'),
      stage: record.get('Stage'),
      expectedCloseDate: record.get('Expected Close Date'),
      assignedUser: record.get('Assigned User') || [],
      notes: record.get('Notes'),
      createdAt: record.get('Created At'),
    }
  } catch (error) {
    console.error('Error updating deal:', error)
    throw error
  }
}

// Delete deal
export async function deleteDeal(id) {
  try {
    await base(TABLES.DEALS).destroy(id)
    return { success: true }
  } catch (error) {
    console.error('Error deleting deal:', error)
    throw error
  }
}
