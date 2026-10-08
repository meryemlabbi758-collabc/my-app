/**
 * Dataverse Service
 * Integrates directly with Microsoft Dataverse for Power Apps
 */

import type { Client, Ticket, EnvironmentData } from './types'
import { getDataverseHeaders } from './auth'

const DATAVERSE_URL = import.meta.env.VITE_DATAVERSE_URL || ''
const DATAVERSE_ENABLED = import.meta.env.VITE_DATAVERSE_ENABLED === 'true'

const TABLES = {
  CLIENTS: 'accounts',
  TICKETS: 'incidents',
  ENVIRONMENTS: 'new_environments',
}

interface DataverseResponse<T> {
  value: T[]
  '@odata.count'?: number
}

function getDataverseApiUrl(): string {
  if (!DATAVERSE_URL) {
    console.warn('[Dataverse] URL not configured')
    return ''
  }
  return `${DATAVERSE_URL}/api/data/v9.2`
}

async function queryDataverse<T>(
  tableName: string,
  filter?: string,
  select?: string[]
): Promise<T[]> {
  if (!DATAVERSE_ENABLED || !DATAVERSE_URL) {
    console.log(`[Dataverse] Disabled`)
    return []
  }

  try {
    const apiUrl = getDataverseApiUrl()
    let url = `${apiUrl}/${tableName}s`

    const params = new URLSearchParams()
    if (select && select.length > 0) {
      params.append('$select', select.join(','))
    }
    if (filter) {
      params.append('$filter', filter)
    }

    if (params.toString()) {
      url += `?${params.toString()}`
    }

    console.log(`[Dataverse] Querying: ${url}`)

    const headers = await getDataverseHeaders()
    const response = await fetch(url, {
      method: 'GET',
      headers,
    })

    if (!response.ok) {
      throw new Error(`Dataverse API error: ${response.status}`)
    }

    const result: DataverseResponse<T> = await response.json()
    console.log(`[Dataverse] Retrieved ${result.value.length} records`)
    return result.value
  } catch (error) {
    console.error(`[Dataverse] Error:`, error)
    return []
  }
}

export async function getClientsFromDataverse(): Promise<Client[]> {
  const select = ['accountid', 'name', 'websiteurl']
  const results = await queryDataverse<any>(TABLES.CLIENTS, undefined, select)

  return results.map(account => ({
    id: account.accountid,
    name: account.name || '',
    logo: '📊',
  }))
}

export async function getClientEnvironmentsFromDataverse(
  clientId: string
): Promise<Record<string, EnvironmentData>> {
  const filter = `_new_accountid_value eq ${clientId}`
  const results = await queryDataverse<any>(
    TABLES.ENVIRONMENTS,
    filter,
    ['new_environmentid', 'new_name', 'new_buildid', 'new_fixversion', 'new_icon', 'new_color']
  )

  const environments: Record<string, EnvironmentData> = {}
  results.forEach(env => {
    environments[env.new_environmentid] = {
      buildId: env.new_buildid || 'BUILD-001',
      fixVersion: env.new_fixversion || 'v1.0.0',
      icon: env.new_icon || '🔵',
      color: env.new_color || 'bg-blue-50',
    }
  })

  return environments
}

export async function getTicketsFromDataverse(
  clientId: string,
  environment?: string
): Promise<Ticket[]> {
  let filter = `_customerid_value eq ${clientId}`
  if (environment) {
    filter += ` and new_environment eq '${environment}'`
  }

  const results = await queryDataverse<any>(
    TABLES.TICKETS,
    filter,
    ['incidentid', 'title', 'statuscode', 'prioritycode', 'ownerid', 'followupby']
  )

  return results.map(incident => ({
    id: incident.incidentid,
    title: incident.title || '',
    status: mapDataverseStatus(incident.statuscode),
    fixVersion: 'v1.0.0',
    buildId: 'BUILD-001',
    priority: mapDataversePriority(incident.prioritycode),
    assignee: incident.ownerid?.name || 'Unassigned',
    dueDate: incident.followupby || '',
    clientId: clientId,
    environment: environment || '',
  }))
}

function mapDataverseStatus(code: number): 'open' | 'in-progress' | 'review' | 'done' {
  const map: Record<number, 'open' | 'in-progress' | 'review' | 'done'> = {
    1: 'open', 2: 'in-progress', 3: 'review', 4: 'done', 5: 'done',
  }
  return map[code] || 'open'
}

function mapDataversePriority(code: number): 'low' | 'medium' | 'high' | 'critical' {
  const map: Record<number, 'low' | 'medium' | 'high' | 'critical'> = {
    0: 'low', 1: 'medium', 2: 'high',
  }
  return map[code] || 'medium'
}

export async function getClients(): Promise<Client[]> {
  return getClientsFromDataverse()
}

export async function getClientById(clientId: string): Promise<Client | null> {
  const clients = await getClients()
  return clients.find(c => c.id === clientId) || null
}

export async function getClientEnvironments(clientId: string): Promise<Record<string, EnvironmentData>> {
  return getClientEnvironmentsFromDataverse(clientId)
}

export async function getTickets(): Promise<Ticket[]> {
  return getTicketsFromDataverse('', undefined)
}

export async function getTicketsByClientAndEnvironment(clientId: string, environment: string): Promise<Ticket[]> {
  return getTicketsFromDataverse(clientId, environment)
}

export async function getTicketById(ticketId: string): Promise<any> {
  const tickets = await getTickets()
  return tickets.find(t => t.id === ticketId) || null
}

export default { getClientsFromDataverse, getClientEnvironmentsFromDataverse, getTicketsFromDataverse }
