import Airtable from 'airtable'

if (!process.env.NEXT_PUBLIC_AIRTABLE_API_KEY) {
  throw new Error('Missing NEXT_PUBLIC_AIRTABLE_API_KEY')
}

if (!process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID) {
  throw new Error('Missing NEXT_PUBLIC_AIRTABLE_BASE_ID')
}

const base = new Airtable({
  apiKey: process.env.NEXT_PUBLIC_AIRTABLE_API_KEY,
}).base(process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID)

// Table names - match your Airtable exactly
export const TABLES = {
  USERS: 'Users',
  COMPANIES: 'Companies',
  CLIENTS: 'Clients',
  DEALS: 'Deals',
  TASKS: 'Tasks',
}

export default base
