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

export default base
```

---

## ✅ PHASE 1 COMPLETE — WHAT YOU NEED TO DO NOW

### **FOLDER STRUCTURE YOU SHOULD HAVE:**
```
flux-crm/
├── app/
│   ├── layout.js
│   ├── page.js
│   └── globals.css
├── lib/
│   └── airtable.js
├── .env.local.example
├── .gitignore
├── next.config.js
└── package.json
