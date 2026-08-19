import Airtable from 'airtable'

if (!process.env.AIRTABLE_API_KEY) {
  throw new Error('Missing AIRTABLE_API_KEY')
}

if (!process.env.AIRTABLE_BASE_ID) {
  throw new Error('Missing AIRTABLE_BASE_ID')
}

const base = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY,
}).base(process.env.AIRTABLE_BASE_ID)

// Table names - match your real Airtable base exactly
export const TABLES = {
  USERS: 'Users',
  COMPANIES: 'Companies',
  CLIENTS: 'Clients',
  GENERAL_TASKS: 'General To-Do List',
  CLIENT_TASKS: 'Client To-Do List',
}

export default base
