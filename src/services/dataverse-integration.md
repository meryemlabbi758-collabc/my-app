# Dataverse Integration Guide

## 📊 Data Lake Structure

Your data lake has the following tables:

### Dimension Tables
- **dim_ticket.parquet** - Ticket master data
- **dim_assignee.parquet** - Team member information
- **dim_project.parquet** - Project/Client information
- **dim_sprint.parquet** - Sprint metadata
- **dim_date.parquet** - Date dimension
- **dim_squad.parquet** - Squad/Team information
- **dim_status.parquet** - Status codes (open, in-progress, review, done)

### Fact Tables
- **fact_ticket_event.parquet** - Ticket events and history
- **fact_sprint_capacity.parquet** - Sprint capacity metrics
- **fact_sprint_outcome.parquet** - Sprint results
- **fact_sprint_scope.parquet** - Sprint scope changes

## 🔄 Data Mapping Strategy

### 1. Clients Mapping
```
dim_project.parquet → Client
├── project_id → client.id
├── project_name → client.name
└── project_logo → client.logo
```

### 2. Tickets Mapping
```
fact_ticket_event.parquet + dim_ticket.parquet → Ticket
├── ticket_id → ticket.id
├── ticket_title → ticket.title
├── status → ticket.status (join dim_status)
├── priority → ticket.priority
├── assignee_id → assignee (join dim_assignee)
├── due_date → ticket.dueDate
├── client_id → ticket.clientId (join dim_project)
└── environment → ticket.environment
```

### 3. Environments
Each client has environments (PROD, PPROD, UAT1, HFPRD) which could be:
- Stored as metadata in dim_project
- Or stored as a separate environment dimension
- Or derived from ticket deployment metadata

## 🚀 Implementation Steps

### Step 1: Setup Data Access Layer
Create a new service to fetch from your data source:

```typescript
// src/services/datalake.ts
export async function getClientsFromDatalake(): Promise<Client[]> {
  // Query: SELECT project_id, project_name, project_logo FROM dim_project
  const response = await fetch('/api/datalake/dim_project')
  return response.json()
}

export async function getTicketsFromDatalake(
  clientId: string, 
  environment: string
): Promise<Ticket[]> {
  // Query: SELECT ... FROM fact_ticket_event
  // JOIN dim_ticket, dim_assignee, dim_status, dim_project
  // WHERE project_id = ? AND environment = ?
  const query = `
    SELECT 
      t.ticket_id,
      t.ticket_title,
      s.status_name,
      t.priority,
      a.assignee_name,
      t.due_date,
      t.build_id,
      t.fix_version
    FROM fact_ticket_event fte
    JOIN dim_ticket t ON fte.ticket_id = t.ticket_id
    JOIN dim_assignee a ON fte.assignee_id = a.assignee_id
    JOIN dim_status s ON fte.status_id = s.status_id
    JOIN dim_project p ON t.project_id = p.project_id
    WHERE p.project_id = ? AND t.environment = ?
  `
  
  const response = await fetch('/api/datalake/query', {
    method: 'POST',
    body: JSON.stringify({ query, params: [clientId, environment] })
  })
  return response.json()
}
```

### Step 2: Update dataverse.ts Service
Modify the service to call real data:

```typescript
// src/services/dataverse.ts
import { getClientsFromDatalake, getTicketsFromDatalake } from './datalake'

export async function getClients(): Promise<Client[]> {
  try {
    const data = await getClientsFromDatalake()
    return data
  } catch (error) {
    console.error('Failed to fetch from datalake, using mock data:', error)
    return getMockClients()
  }
}

export async function getTicketsByClientAndEnvironment(
  clientId: string,
  environment: string
): Promise<Ticket[]> {
  try {
    const data = await getTicketsFromDatalake(clientId, environment)
    return data
  } catch (error) {
    console.error('Failed to fetch from datalake, using mock data:', error)
    const allTickets = await getTickets()
    return allTickets.filter(t => t.clientId === clientId && t.environment === environment)
  }
}
```

### Step 3: Backend API Setup

You need a backend API that can query your datalake. Options:

**Option A: Azure Data Lake (Recommended)**
```typescript
// Backend endpoint to query datalake
POST /api/datalake/query
Body: { query: string, params: any[] }
Returns: { data: any[], error?: string }
```

**Option B: Direct Parquet Files**
```typescript
// Use libraries like parquetjs
import parquet from 'parquetjs'

const reader = await parquet.openFile('dim_ticket.parquet')
const cursor = reader.getCursor()
const records = await cursor.toArray()
```

**Option C: SQL Query (if using SQL Server/Synapse)**
```typescript
import { Connection } from 'tedious'

async function queryDatalake(sql: string, params: any[]) {
  // Use Tedious or similar library
  // Execute SQL query against datalake
}
```

## 📋 Current Type Mapping Issues

Your current types need updates for real data:

```typescript
// Current in services/types.ts
interface Ticket {
  buildId: string        // ← From fact_ticket_event or dim_ticket?
  fixVersion: string     // ← From fact_ticket_event or dim_ticket?
  environment: string    // ← Not yet in dim_ticket, need to add or derive
}

interface Client {
  buildId: string        // ← Should this be per-client or per-environment?
  fixVersion: string     // ← Should this be per-client or per-environment?
}
```

**Question for you:**
- Is `buildId` and `fixVersion` stored **per ticket**? 
- Or **per environment per client**?
- Do you have an environment/deployment dimension?

## ✅ Next Steps

1. **Confirm data structure** - Which tables have build_id, fix_version, environment?
2. **Setup backend API** - Create endpoint(s) to query datalake
3. **Implement datalake.ts** - Create data fetching functions
4. **Test integration** - Verify data flows correctly
5. **Remove mock data** - Once verified, can remove getMock* functions

## 🔗 Suggested Backend Stack

For a Power Apps environment, consider:
- **Azure Functions** - Query datalake parquet/SQL
- **Power BI REST API** - If data is published there
- **Azure Data Explorer** - For fast queries
- **Node.js + DataLake SDK** - Direct file access

Would you like me to:
1. Create the `datalake.ts` service?
2. Setup a specific backend API integration?
3. Update the types based on your data schema?
