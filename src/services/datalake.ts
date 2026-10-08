/**
 * Data Lake Service
 * Handles queries to your parquet/data lake files
 *
 * Configure these environment variables:
 * - REACT_APP_DATALAKE_API_URL: Your backend API URL
 * - REACT_APP_DATALAKE_ENABLED: Set to 'true' to use real data
 */

import type { Client, Ticket, EnvironmentData } from './types'

const DATALAKE_API_URL = process.env.REACT_APP_DATALAKE_API_URL || 'http://localhost:3001/api'
const DATALAKE_ENABLED = process.env.REACT_APP_DATALAKE_ENABLED === 'true'

interface QueryRequest {
  table: string
  filters?: Record<string, unknown>
  select?: string[]
}

interface QueryResponse<T> {
  data: T[]
  error?: string
  count: number
}

/**
 * Generic query function to fetch from datalake
 */
async function queryDatalake<T>(request: QueryRequest): Promise<T[]> {
  if (!DATALAKE_ENABLED) {
    console.log('[Datalake] Datalake is disabled, returning empty array')
    return []
  }

  try {
    const response = await fetch(`${DATALAKE_API_URL}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(request)
    })

    if (!response.ok) {
      throw new Error(`Datalake API error: ${response.status}`)
    }

    const result: QueryResponse<T> = await response.json()

    if (result.error) {
      throw new Error(result.error)
    }

    console.log(`[Datalake] Fetched ${result.count} records from ${request.table}`)
    return result.data
  } catch (error) {
    console.error(`[Datalake] Error querying ${request.table}:`, error)
    throw error
  }
}

/**
 * Get auth token (implement based on your auth system)
 */
function getAuthToken(): string {
  // TODO: Implement based on your authentication system
  // Examples:
  // - localStorage.getItem('auth_token')
  // - sessionStorage.getItem('token')
  // - From Entra ID / Azure AD
  return ''
}

/**
 * Fetch clients from dim_project table
 */
export async function getClientsFromDatalake(): Promise<Client[]> {
  const result = await queryDatalake<any>({
    table: 'dim_project',
    select: ['project_id', 'project_name', 'project_logo']
  })

  return result.map(client => ({
    id: (client.id || client.project_id) as string,
    name: (client.name || client.project_name) as string,
    logo: (client.logo || client.project_logo) as string
  }))
}

/**
 * Fetch environments for a specific client
 */
export async function getClientEnvironmentsFromDatalake(
  clientId: string
): Promise<Record<string, EnvironmentData>> {
  // Query both dim_project and environment metadata
  const result = await queryDatalake<any>({
    table: 'dim_project_environments',
    filters: { project_id: clientId },
    select: [
      'environment_id',
      'environment_name',
      'build_id',
      'fix_version',
      'environment_icon',
      'environment_color'
    ]
  })

  const environments: Record<string, EnvironmentData> = {}

  result.forEach((env: any) => {
    const envId = (env.environment_id || env.id) as string
    environments[envId] = {
      buildId: (env.buildId || env.build_id) as string,
      fixVersion: (env.fixVersion || env.fix_version) as string,
      icon: (env.icon || env.environment_icon) as string,
      color: (env.color || env.environment_color) as string
    }
  })

  return environments
}

/**
 * Fetch tickets for a specific client and environment
 * Joins multiple dimension tables
 */
export async function getTicketsFromDatalake(
  clientId: string,
  environment: string
): Promise<Ticket[]> {
  const result = await queryDatalake<any>({
    table: 'fact_ticket_event',
    filters: {
      project_id: clientId,
      environment: environment
    },
    select: [
      'ticket_id',
      'ticket_title',
      'status',
      'priority',
      'assignee_name',
      'due_date',
      'build_id',
      'fix_version',
      'client_id'
    ]
  })

  return result.map((ticket: any) => ({
    id: (ticket.id || ticket.ticket_id) as string,
    title: (ticket.title || ticket.ticket_title) as string,
    status: (ticket.status || ticket.status) as 'open' | 'in-progress' | 'review' | 'done',
    fixVersion: (ticket.fixVersion || ticket.fix_version) as string,
    buildId: (ticket.buildId || ticket.build_id) as string,
    priority: (ticket.priority || ticket.priority) as 'low' | 'medium' | 'high' | 'critical',
    assignee: (ticket.assignee || ticket.assignee_name) as string,
    dueDate: (ticket.dueDate || ticket.due_date) as string,
    clientId: clientId,
    environment: environment
  }))
}

/**
 * Fetch a specific ticket with full details
 */
export async function getTicketDetailFromDatalake(ticketId: string): Promise<Ticket | null> {
  const result = await queryDatalake<any>({
    table: 'fact_ticket_event',
    filters: { ticket_id: ticketId },
    select: [
      'ticket_id',
      'ticket_title',
      'description',
      'status',
      'priority',
      'assignee_name',
      'due_date',
      'created_date',
      'updated_date',
      'build_id',
      'fix_version',
      'project_id',
      'environment'
    ]
  })

  if (result.length === 0) return null

  const ticket = result[0]
  return {
    id: ticket.id || ticket.ticket_id,
    title: ticket.title || ticket.ticket_title,
    status: ticket.status || 'open',
    fixVersion: ticket.fixVersion || ticket.fix_version,
    buildId: ticket.buildId || ticket.build_id,
    priority: ticket.priority || 'medium',
    assignee: ticket.assignee || ticket.assignee_name,
    dueDate: ticket.dueDate || ticket.due_date,
    clientId: ticket.clientId || ticket.project_id,
    environment: ticket.environment || ''
  }
}

/**
 * Search tickets across all clients and environments
 */
export async function searchTicketsInDatalake(
  searchTerm: string,
  filters?: {
    status?: string
    priority?: string
    clientId?: string
  }
): Promise<Ticket[]> {
  const result = await queryDatalake<Ticket>({
    table: 'fact_ticket_event',
    filters: {
      ...filters,
      search_term: searchTerm
    }
  })

  return result as Ticket[]
}

/**
 * Get ticket statistics for a client
 */
export async function getTicketStatsFromDatalake(
  clientId: string
): Promise<{
  totalTickets: number
  openCount: number
  inProgressCount: number
  reviewCount: number
  doneCount: number
}> {
  const result = await queryDatalake<{ status: string; count: number }>({
    table: 'fact_ticket_stats',
    filters: { project_id: clientId }
  })

  const stats = {
    totalTickets: 0,
    openCount: 0,
    inProgressCount: 0,
    reviewCount: 0,
    doneCount: 0
  }

  result.forEach(row => {
    stats.totalTickets += row.count
    switch (row.status) {
      case 'open':
        stats.openCount += row.count
        break
      case 'in-progress':
        stats.inProgressCount += row.count
        break
      case 'review':
        stats.reviewCount += row.count
        break
      case 'done':
        stats.doneCount += row.count
        break
    }
  })

  return stats
}

/**
 * Get environment deployment history
 */
export async function getDeploymentHistoryFromDatalake(
  clientId: string,
  environment: string,
  limit: number = 10
): Promise<Array<{
  deploymentId: string
  timestamp: string
  version: string
  status: string
  duration: number
}>> {
  const result = await queryDatalake<any>({
    table: 'fact_deployment_history',
    filters: {
      project_id: clientId,
      environment: environment
    },
    select: ['deployment_id', 'timestamp', 'version', 'status', 'duration']
  })

  return result.slice(0, limit).map(row => ({
    deploymentId: row.deployment_id,
    timestamp: row.timestamp,
    version: row.version,
    status: row.status,
    duration: row.duration
  }))
}
