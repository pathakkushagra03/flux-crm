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
```

---

## 📦 PHASE 1 — FILE 3/8

**File:** `.env.local.example`  
**Location:** Root of project  
**Action:** CREATE this file
```
NEXT_PUBLIC_AIRTABLE_API_KEY=your_airtable_api_key_here
NEXT_PUBLIC_AIRTABLE_BASE_ID=your_airtable_base_id_here
```

---

## 📦 PHASE 1 — FILE 4/8

**File:** `.gitignore`  
**Location:** Root of project  
**Action:** REPLACE existing `.gitignore` with this
```
# Dependencies
node_modules
/.pnp
.pnp.js

# Testing
/coverage

# Next.js
/.next/
/out/

# Production
/build

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env*.local
.env

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts
