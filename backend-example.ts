/**
 * Example Backend API for Datalake Integration
 *
 * This is a Node.js/Express backend that queries your parquet files
 * and provides a REST API for your React app.
 *
 * Install dependencies:
 * npm install express parquetjs cors dotenv
 *
 * Or use Azure Data Lake SDK:
 * npm install @azure/storage-file-datalake
 *
 * Or use Power BI API:
 * npm install axios
 */

import express, { Request, Response } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

/**
 * Option 1: Query Parquet Files Directly
 */
import parquet from 'parquetjs'

const parquetTables = {
  dim_project: './data/dim_project.parquet',
  dim_ticket: './data/dim_ticket.parquet',
  dim_assignee: './data/dim_assignee.parquet',
  dim_status: './data/dim_status.parquet',
  fact_ticket_event: './data/fact_ticket_event.parquet',
}

async function queryParquet(
  tablePath: string,
  filters?: Record<string, unknown>
): Promise<any[]> {
  try {
    const reader = await parquet.openFile(tablePath)
    const cursor = reader.getCursor()
    let records = await cursor.toArray()

    // Apply filters
    if (filters) {
      records = records.filter(record => {
        return Object.entries(filters).every(([key, value]) => {
          if (value === undefined) return true
          return record[key] === value
        })
      })
    }

    return records
  } catch (error) {
    console.error(`Error reading parquet file ${tablePath}:`, error)
    throw error
  }
}

/**
 * Option 2: Azure Data Lake SDK
 */
import { DataLakeServiceClient } from '@azure/storage-file-datalake'

async function queryAzureDataLake(
  table: string,
  filters?: Record<string, unknown>
): Promise<any[]> {
  try {
    const accountName = process.env.AZURE_STORAGE_ACCOUNT
    const accountKey = process.env.AZURE_STORAGE_KEY
    const containerName = process.env.AZURE_CONTAINER_NAME

    const serviceClient = new DataLakeServiceClient(
      `https://${accountName}.dfs.core.windows.net`,
      { accountName, accountKey }
    )

    const fileSystemClient = serviceClient.getFileSystemClient(containerName)
    const fileClient = fileSystemClient.getFileClient(`${table}.parquet`)

    // Download and parse parquet file
    const downloadResponse = await fileClient.read()
    const chunks = []

    for await (const chunk of downloadResponse.readableStreamBody!) {
      chunks.push(chunk)
    }

    const data = Buffer.concat(chunks)
    // Parse parquet file using parquetjs or similar library
    // This is a simplified example
    return JSON.parse(data.toString())
  } catch (error) {
    console.error(`Error querying Azure Data Lake for ${table}:`, error)
    throw error
  }
}

/**
 * Option 3: Power BI REST API
 */
import axios from 'axios'

async function queryPowerBIAPI(
  table: string,
  filters?: Record<string, unknown>
): Promise<any[]> {
  try {
    const accessToken = await getAccessToken()

    // Query Power BI dataset
    const response = await axios.post(
      `https://api.powerbi.com/v1.0/myorg/groups/${process.env.POWER_BI_GROUP_ID}/datasets/${process.env.POWER_BI_DATASET_ID}/executeQueries`,
      {
        queries: [{
          query: `EVALUATE ${table}${
            filters ? ' WHERE ' + Object.entries(filters)
              .map(([k, v]) => `[${k}] = "${v}"`)
              .join(' AND ')
              : ''
          }`
        }]
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    )

    return response.data.results[0].tables[0].rows
  } catch (error) {
    console.error(`Error querying Power BI for ${table}:`, error)
    throw error
  }
}

/**
 * Generic Query Endpoint
 */
app.post('/api/query', async (req: Request, res: Response) => {
  try {
    const { table, filters } = req.body

    // Choose your data source
    let data: any[]

    if (process.env.DATA_SOURCE === 'azure') {
      data = await queryAzureDataLake(table, filters)
    } else if (process.env.DATA_SOURCE === 'powerbi') {
      data = await queryPowerBIAPI(table, filters)
    } else {
      // Default: Parquet files
      const tablePath = parquetTables[table as keyof typeof parquetTables]
      if (!tablePath) {
        return res.status(400).json({ error: `Unknown table: ${table}` })
      }
      data = await queryParquet(tablePath, filters)
    }

    res.json({
      data,
      count: data.length
    })
  } catch (error) {
    console.error('Query error:', error)
    res.status(500).json({
      error: (error as Error).message,
      data: []
    })
  }
})

/**
 * Specific Endpoints
 */

// Get all clients
app.get('/api/clients', async (req: Request, res: Response) => {
  try {
    const data = await queryParquet(parquetTables.dim_project)
    const clients = data.map(row => ({
      id: row.project_id,
      name: row.project_name,
      logo: row.project_logo
    }))
    res.json({ data: clients, count: clients.length })
  } catch (error) {
    res.status(500).json({ error: (error as Error).message, data: [] })
  }
})

// Get client details
app.get('/api/clients/:clientId', async (req: Request, res: Response) => {
  try {
    const { clientId } = req.params
    const data = await queryParquet(parquetTables.dim_project, {
      project_id: clientId
    })

    if (data.length === 0) {
      return res.status(404).json({ error: 'Client not found', data: [] })
    }

    const client = data[0]
    res.json({
      data: [{
        id: client.project_id,
        name: client.project_name,
        logo: client.project_logo
      }],
      count: 1
    })
  } catch (error) {
    res.status(500).json({ error: (error as Error).message, data: [] })
  }
})

// Get tickets for client and environment
app.get('/api/clients/:clientId/environments/:env/tickets',
  async (req: Request, res: Response) => {
    try {
      const { clientId, env } = req.params

      const data = await queryParquet(parquetTables.fact_ticket_event, {
        project_id: clientId,
        environment: env
      })

      const tickets = data.map(row => ({
        id: row.ticket_id,
        title: row.ticket_title,
        status: row.status,
        fixVersion: row.fix_version,
        buildId: row.build_id,
        priority: row.priority,
        assignee: row.assignee_name,
        dueDate: row.due_date,
        clientId: clientId,
        environment: env
      }))

      res.json({ data: tickets, count: tickets.length })
    } catch (error) {
      res.status(500).json({ error: (error as Error).message, data: [] })
    }
  }
)

/**
 * Get Access Token for Power BI (implement based on your auth)
 */
async function getAccessToken(): Promise<string> {
  // Implement based on your authentication system
  // Examples:
  // - Service Principal
  // - User authentication
  // - Managed Identity
  return ''
}

/**
 * Health Check
 */
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', dataSource: process.env.DATA_SOURCE || 'parquet' })
})

/**
 * Start Server
 */
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Backend API running on http://localhost:${PORT}`)
  console.log(`Data source: ${process.env.DATA_SOURCE || 'parquet'}`)
})

export default app
