# 🚀 Quick Start: Data Lake Integration

## 📊 Your Data Structure

You have a structured data lake with:
- **Dimension tables**: dim_project, dim_ticket, dim_assignee, dim_status, dim_sprint, dim_squad, dim_date
- **Fact tables**: fact_ticket_event, fact_sprint_capacity, fact_sprint_outcome, fact_sprint_scope

## ⚡ 3 Options to Connect Your Data

### Option 1: Direct Parquet Files (Simplest)
Perfect if you have access to `.parquet` files locally or on Azure Blob Storage.

**Setup:**
```bash
# 1. Copy your parquet files to backend/data/
cp dim_project.parquet backend/data/
cp fact_ticket_event.parquet backend/data/
# ... copy all other files

# 2. Create your backend
node backend-example.ts

# 3. Enable in React app
echo "REACT_APP_DATALAKE_ENABLED=true" >> .env
echo "REACT_APP_DATALAKE_API_URL=http://localhost:3001/api" >> .env
```

### Option 2: Azure Data Lake (Recommended for Enterprise)
Use Azure Data Lake Storage SDK for secure, scalable access.

**Setup:**
```bash
# 1. Install Azure SDK
npm install @azure/storage-file-datalake

# 2. Configure environment
echo "DATA_SOURCE=azure" >> .env
echo "AZURE_STORAGE_ACCOUNT=youraccountname" >> .env
echo "AZURE_STORAGE_KEY=yourkey" >> .env
echo "AZURE_CONTAINER_NAME=burndown" >> .env
```

### Option 3: Power BI REST API (If using Power BI)
Query directly from Power BI Premium dataset.

**Setup:**
```bash
# 1. Install dependencies
npm install axios

# 2. Configure
echo "DATA_SOURCE=powerbi" >> .env
echo "POWER_BI_GROUP_ID=your-group-id" >> .env
echo "POWER_BI_DATASET_ID=your-dataset-id" >> .env
```

---

## 📋 Key Mapping: Your Data → App Types

### Clients
```
YOUR DATA                    →  APP TYPE
dim_project.project_id       →  client.id
dim_project.project_name     →  client.name
dim_project.project_logo     →  client.logo
```

### Tickets
```
YOUR DATA                           →  APP TYPE
fact_ticket_event.ticket_id         →  ticket.id
fact_ticket_event.ticket_title      →  ticket.title
fact_ticket_event.status            →  ticket.status
fact_ticket_event.priority          →  ticket.priority
fact_ticket_event.assignee_name     →  ticket.assignee
fact_ticket_event.due_date          →  ticket.dueDate
fact_ticket_event.build_id          →  ticket.buildId
fact_ticket_event.fix_version       →  ticket.fixVersion
dim_project.project_id              →  ticket.clientId
(from query params)                 →  ticket.environment
```

### Environments (⚠️ IMPORTANT)
Your current data structure doesn't seem to have a separate environment dimension.

**Questions to answer:**
1. ❓ How are environments (PROD, PPROD, UAT1, HFPRD) stored in your data?
   - As a separate column in fact_ticket_event?
   - In a separate dim_environment table?
   - Derived from deployment information?

2. ❓ Are build_id and fix_version:
   - Per ticket?
   - Per client per environment?

---

## 🔧 Implementation Steps

### Step 1: Create Backend API
```bash
# Copy backend-example.ts
cp backend-example.ts backend/api.ts

# Install dependencies
npm install express cors parquetjs

# Run backend
node backend/api.ts
```

### Step 2: Update dataverse.ts
Currently, the `dataverse.ts` service uses mock data. Modify it to call real data:

**Current (mock):**
```typescript
export async function getClients(): Promise<Client[]> {
  return getMockClients()
}
```

**Updated (real data):**
```typescript
export async function getClients(): Promise<Client[]> {
  try {
    const response = await fetch(`${DATALAKE_API_URL}/clients`)
    const { data } = await response.json()
    return data
  } catch (error) {
    console.error('Failed to fetch from datalake, using mock:', error)
    return getMockClients()
  }
}
```

### Step 3: Enable in .env
```
REACT_APP_DATALAKE_ENABLED=true
REACT_APP_DATALAKE_API_URL=http://localhost:3001/api
```

### Step 4: Test
```bash
# Terminal 1: Backend
node backend/api.ts

# Terminal 2: Frontend (existing)
npm run dev

# Browser: http://localhost:5173/clients
# Should now show real data from your datalake!
```

---

## 🔄 Complete Flow

```
Your Data Lake (parquet files)
           ↓
Backend API (queries parquet)
           ↓
React Service (src/services/datalake.ts)
           ↓
React Components (use hooks)
           ↓
User Interface
```

---

## ✅ Checklist

- [ ] Understand your data structure (where is environment? buildId? fixVersion?)
- [ ] Choose data source (Parquet, Azure, Power BI)
- [ ] Create backend API
- [ ] Configure environment variables
- [ ] Test with real data
- [ ] Remove mock data (optional)

---

## 🆘 Need Help?

Before proceeding, please clarify:

1. **Environment Column**: Where is the environment (PROD/PPROD/UAT1/HFPRD) stored?
2. **Build & Version**: Are these per-ticket or per-client-per-environment?
3. **Data Access**: What's the best way to access your parquet files?
4. **Backend Preference**: Do you have existing backend infra, or should I help set one up?

Reply with:
```
Environment location: [table.column]
Build ID location: [table.column]
Fix Version location: [table.column]
Data access: [Parquet files / Azure Data Lake / Power BI]
```

I'll customize the integration based on your specific schema!
