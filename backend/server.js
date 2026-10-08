import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()

app.use(cors())
app.use(express.json())

// Path to parquet files (adjust if needed)
const DATA_PATH = process.env.DATA_PATH || 'C:\\Users\\mlebbi\\Downloads\\OneDrive_1_02-10-2026'

// Map table names to JSON files
const jsonTables = {
  dim_project: 'dim_project.json',
  dim_ticket: 'dim_ticket.json',
  dim_assignee: 'dim_assignee.json',
  dim_status: 'dim_status.json',
  dim_sprint: 'dim_sprint.json',
  dim_squad: 'dim_squad.json',
  dim_date: 'dim_date.json',
  fact_ticket_event: 'fact_ticket_event.json',
  fact_ticket_link: 'fact_ticket_link.json',
  fact_sprint_capacity: 'fact_sprint_capacity.json',
  fact_sprint_outcome: 'fact_sprint_outcome.json',
  fact_sprint_scope: 'fact_sprint_scope.json'
}

/**
 * Query JSON data file with optional filters and limit
 */
async function queryJSON(tableName, filters = {}, limit = null) {
  try {
    const jsonFile = jsonTables[tableName]
    if (!jsonFile) {
      throw new Error(`Unknown table: ${tableName}`)
    }

    const jsonPath = path.join('data', jsonFile)

    // Check if JSON file exists
    if (!fs.existsSync(jsonPath)) {
      throw new Error(`Data file not found: ${jsonPath}. Run convert_parquet.py first to convert parquet files to JSON.`)
    }

    console.log(`[${new Date().toISOString()}] Querying ${tableName}`)

    // Read JSON file
    const data = fs.readFileSync(jsonPath, 'utf-8')
    const records = JSON.parse(data)

    console.log(`  Found ${records.length} total records`)

    // Apply filters
    let result = records
    if (Object.keys(filters).length > 0) {
      result = records.filter(record => {
        return Object.entries(filters).every(([key, value]) => {
          if (value === undefined || value === null) return true
          // Case-insensitive string comparison
          const recordValue = String(record[key] || '').toLowerCase()
          const filterValue = String(value).toLowerCase()
          return recordValue === filterValue
        })
      })
      console.log(`  Filtered to ${result.length} records`)
    }

    // Apply limit
    if (limit && limit > 0) {
      result = result.slice(0, limit)
      console.log(`  Limited to ${result.length} records`)
    }

    return result
  } catch (error) {
    console.error(`Error reading data file ${tableName}:`, error.message)
    throw error
  }
}

/**
 * Health Check
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    dataPath: DATA_PATH,
    timestamp: new Date().toISOString()
  })
})

/**
 * Generic Query Endpoint
 */
app.post('/api/query', async (req, res) => {
  try {
    const { table, filters } = req.body

    if (!table) {
      return res.status(400).json({ error: 'table parameter required', data: [] })
    }

    const data = await queryJSON(table, filters || {})
    res.json({ data, count: data.length })
  } catch (error) {
    console.error('Query error:', error)
    res.status(500).json({
      error: error.message,
      data: []
    })
  }
})

/**
 * ========== DATALAKE ENDPOINTS ==========
 */

/**
 * GET /datalake/dim_project
 * Get all projects/clients
 */
app.get('/api/datalake/dim_project', async (req, res) => {
  try {
    const filters = {}
    if (req.query.project_key) filters.project_key = req.query.project_key
    if (req.query.project_id) filters.project_id = req.query.project_id

    const data = await queryJSON('dim_project', filters)
    res.json({ data, count: data.length })
  } catch (error) {
    res.status(500).json({ error: error.message, data: [] })
  }
})

/**
 * GET /datalake/dim_sprint
 * Get sprints for a project
 */
app.get('/api/datalake/dim_sprint', async (req, res) => {
  try {
    const filters = {}
    if (req.query.project_key) filters.project_key = req.query.project_key
    if (req.query.project_id) filters.project_id = req.query.project_id

    const data = await queryJSON('dim_sprint', filters)
    res.json({ data, count: data.length })
  } catch (error) {
    res.status(500).json({ error: error.message, data: [] })
  }
})

/**
 * GET /datalake/dim_ticket
 * Get ticket details with optional assignee enrichment
 */
app.get('/api/datalake/dim_ticket', async (req, res) => {
  try {
    const filters = {}
    if (req.query.issue_key) filters.issue_key = req.query.issue_key
    if (req.query.ticket_id) filters.ticket_id = req.query.ticket_id
    if (req.query.project_key) filters.project_key = req.query.project_key

    // Default limit to 500 to load more tickets and find ones with fix_version/build_id data
    const limit = req.query.limit ? parseInt(req.query.limit) : 500

    let data = await queryJSON('dim_ticket', filters, limit)

    // Enrich with assignee names if requested
    if (req.query.include_assignee === 'true') {
      const assignees = await queryJSON('dim_assignee', {})
      const assigneeMap = {}
      assignees.forEach(a => {
        assigneeMap[a.assignee_sk] = a.display_name || 'Unassigned'
      })

      data = data.map(ticket => ({
        ...ticket,
        assignee_name: assigneeMap[ticket.current_assignee_sk] || 'Unassigned'
      }))
    }

    res.json({ data, count: data.length })
  } catch (error) {
    res.status(500).json({ error: error.message, data: [] })
  }
})

/**
 * GET /datalake/fact_ticket_event
 * Get ticket events for a project
 */
app.get('/api/datalake/fact_ticket_event', async (req, res) => {
  try {
    const filters = {}
    if (req.query.project_key) filters.project_key = req.query.project_key
    if (req.query.issue_key) filters.issue_key = req.query.issue_key

    // Default limit to 500 to load more tickets and find ones with fix_version/build_id data
    const limit = req.query.limit ? parseInt(req.query.limit) : 500

    const data = await queryJSON('fact_ticket_event', filters, limit)
    res.json({ data, count: data.length })
  } catch (error) {
    res.status(500).json({ error: error.message, data: [] })
  }
})

/**
 * GET /datalake/dim_assignee
 * Get assignee information
 */
app.get('/api/datalake/dim_assignee', async (req, res) => {
  try {
    const filters = {}
    if (req.query.assignee_id) filters.assignee_id = req.query.assignee_id

    const data = await queryJSON('dim_assignee', filters)
    res.json({ data, count: data.length })
  } catch (error) {
    res.status(500).json({ error: error.message, data: [] })
  }
})

/**
 * GET /datalake/dim_status
 * Get status information
 */
app.get('/api/datalake/dim_status', async (req, res) => {
  try {
    const data = await queryJSON('dim_status', {})
    res.json({ data, count: data.length })
  } catch (error) {
    res.status(500).json({ error: error.message, data: [] })
  }
})

/**
 * Start Server
 */
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`\n🚀 Backend API running on http://localhost:${PORT}`)
  console.log(`📂 Data path: ${DATA_PATH}`)
  console.log(`\n📊 Available endpoints:`)
  console.log(`   GET  /api/health`)
  console.log(`   POST /api/query`)
  console.log(`   GET  /api/datalake/dim_project`)
  console.log(`   GET  /api/datalake/dim_sprint`)
  console.log(`   GET  /api/datalake/dim_ticket`)
  console.log(`   GET  /api/datalake/fact_ticket_event`)
  console.log(`   GET  /api/datalake/dim_assignee`)
  console.log(`   GET  /api/datalake/dim_status\n`)
})

export default app
