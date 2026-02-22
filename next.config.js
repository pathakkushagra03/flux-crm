/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['dl.airtable.com', 'v5.airtableusercontent.com'],
  },
  env: {
    NEXT_PUBLIC_AIRTABLE_API_KEY: process.env.NEXT_PUBLIC_AIRTABLE_API_KEY,
    NEXT_PUBLIC_AIRTABLE_BASE_ID: process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID,
  },
}

module.exports = nextConfig
