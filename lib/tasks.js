import base, { TABLES } from './airtable'

// Get all tasks
export async function getTasks() {
  try {
    const records = await base(TABLES.TASKS).select().all()
    
    return records.map(record => ({
      id: record.id,
      title: record.get('Title') || '',
      description: record.get('Description') || '',
      priority: record.get('Priority') || '',
      status: record.get('Status') || '',
      dueDate: record.get('Due Date') || '',
      assignedUser: record.get('Assigned User') || [],
      relatedClient: record.get('Related Client') || [],
    }))
  } catch (error) {
    console.error('Error fetching tasks:', error)
    throw error
  }
}

// Get single task by ID
export async function getTask(id) {
  try {
    const record = await base(TABLES.TASKS).find(id)
    
    return {
      id: record.id,
      title: record.get('Title') || '',
      description: record.get('Description') || '',
      priority: record.get('Priority') || '',
      status: record.get('Status') || '',
      dueDate: record.get('Due Date') || '',
      assignedUser: record.get('Assigned User') || [],
      relatedClient: record.get('Related Client') || [],
    }
  } catch (error) {
    console.error('Error fetching task:', error)
    throw error
  }
}

// Create new task
export async function createTask(data) {
  try {
    const fields = {
      'Title': data.title,
      'Description': data.description || '',
      'Priority': data.priority || 'Medium',
      'Status': data.status || 'Pending',
      'Due Date': data.dueDate || '',
    }

    if (data.assignedUser && data.assignedUser.length > 0) {
      fields['Assigned User'] = data.assignedUser
    }

    if (data.relatedClient && data.relatedClient.length > 0) {
      fields['Related Client'] = data.relatedClient
    }

    const record = await base(TABLES.TASKS).create(fields)
    
    return {
      id: record.id,
      title: record.get('Title'),
      description: record.get('Description'),
      priority: record.get('Priority'),
      status: record.get('Status'),
      dueDate: record.get('Due Date'),
      assignedUser: record.get('Assigned User') || [],
      relatedClient: record.get('Related Client') || [],
    }
  } catch (error) {
    console.error('Error creating task:', error)
    throw error
  }
}

// Update task
export async function updateTask(id, data) {
  try {
    const fields = {}
    
    if (data.title !== undefined) fields['Title'] = data.title
    if (data.description !== undefined) fields['Description'] = data.description
    if (data.priority !== undefined) fields['Priority'] = data.priority
    if (data.status !== undefined) fields['Status'] = data.status
    if (data.dueDate !== undefined) fields['Due Date'] = data.dueDate
    
    if (data.assignedUser !== undefined) fields['Assigned User'] = data.assignedUser
    if (data.relatedClient !== undefined) fields['Related Client'] = data.relatedClient

    const record = await base(TABLES.TASKS).update(id, fields)
    
    return {
      id: record.id,
      title: record.get('Title'),
      description: record.get('Description'),
      priority: record.get('Priority'),
      status: record.get('Status'),
      dueDate: record.get('Due Date'),
      assignedUser: record.get('Assigned User') || [],
      relatedClient: record.get('Related Client') || [],
    }
  } catch (error) {
    console.error('Error updating task:', error)
    throw error
  }
}

// Delete task
export async function deleteTask(id) {
  try {
    await base(TABLES.TASKS).destroy(id)
    return { success: true }
  } catch (error) {
    console.error('Error deleting task:', error)
    throw error
  }
}
