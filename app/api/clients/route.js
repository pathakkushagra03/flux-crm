import { NextResponse } from 'next/server'
import { getClients, createClient } from '@/lib/clients'

export async function GET() {
  try {
    const clients = await getClients()
    return NextResponse.json(clients)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const data = await request.json()
    const client = await createClient(data)
    return NextResponse.json(client, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create client' },
      { status: 500 }
    )
  }
}
```

---

## ✅ PHASE 3 — PART 2 COMPLETE

**NEW FOLDER STRUCTURE:**
```
flux-crm/
├── app/
│   ├── api/
│   │   ├── users/
│   │   │   ├── route.js
│   │   │   └── [id]/
│   │   │       └── route.js
│   │   ├── companies/
│   │   │   ├── route.js
│   │   │   └── [id]/
│   │   │       └── route.js
│   │   └── clients/
│   │       ├── route.js
│   │       └── [id]/ (need to create next)
├── lib/
│   ├── airtable.js
│   ├── users.js
│   ├── companies.js
│   ├── clients.js
│   ├── deals.js ← NEW
│   ├── tasks.js ← NEW
│   └── imageUpload.js ← NEW
