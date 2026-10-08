/**
 * SharePoint Datalake Integration
 *
 * Reads parquet files from SharePoint and provides data to the React app
 *
 * Environment Variables:
 * - REACT_APP_SHAREPOINT_SITE: SharePoint site URL
 * - REACT_APP_SHAREPOINT_DATA_FOLDER: Data folder path (e.g., 'gold')
 * - REACT_APP_SHAREPOINT_ENABLED: Set to 'true' to enable
 */

import type { Client, Ticket, EnvironmentData } from './types'


/**
 * ALTERNATIVELY: Use backend API to fetch converted data
 */
async function fetchFromBackendAPI<T>(
  endpoint: string,
  filters?: Record<string, unknown>
): Promise<T[]> {
  try {
    const baseUrl = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:3001/api'
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
    const fullUrl = `${baseUrl}${cleanEndpoint}`
    const url = new URL(fullUrl)

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        url.searchParams.append(key, String(value))
      })
    }

    console.log(`[SharePoint API] Fetching: ${url.toString()}`)

    const response = await fetch(url.toString())

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    console.log(`[SharePoint API] Got ${(data.data || []).length} records`)
    return data.data || []
  } catch (error) {
    console.error(`[SharePoint API] Error:`, error)
    return []
  }
}

/**
 * ============================================
 * DATA EXTRACTION & TRANSFORMATION FUNCTIONS
 * ============================================
 */

/**
 * Extract environment from ticket summary
 * [PROD] → prod, [PPRD] → pprod, [UAT] → uat, [LCT] → hfprd
 */
export function extractEnvironmentFromSummary(summary: string): string {
  const match = summary.match(/\[([A-Z0-9]+)\]/)
  if (!match) return 'prod'

  const envPrefix = match[1].toLowerCase()
  const envMap: Record<string, string> = {
    'prod': 'prod',
    'pprd': 'pprod',
    'prd': 'prod',
    'uat': 'uat',
    'lct': 'hfprd',
    'tc01': 'uat1',
    'tc02': 'uat1',
    'tc03': 'uat1',
    'tc04': 'uat1'
  }

  return envMap[envPrefix] || 'prod'
}

/**
 * Extract version/build number from summary
 */
export function extractVersionFromSummary(summary: string): string {
  if (!summary) return 'v1.0.0'

  // Match patterns like [22.2.0] or [22.2.1]
  const bracketed = summary.match(/\[(\d+\.\d+\.?\d*)\]/)
  if (bracketed) {
    return `v${bracketed[1]}`
  }

  // Match semantic versioning: 5.0.1.318010
  const semantic = summary.match(/(\d+\.\d+\.\d+\.\d+)/)
  if (semantic) {
    return `v${semantic[1]}`
  }

  // Match X.Y.Z pattern
  const xyz = summary.match(/(\d+\.\d+\.\d+)/)
  if (xyz) {
    return `v${xyz[1]}`
  }

  // Match simpler version: 5.0
  const simple = summary.match(/(\d+\.\d+)/)
  if (simple) {
    return `v${simple[1]}`
  }

  return 'v1.0.0'
}

/**
 * Map Jira status to app status
 */
export function mapJiraStatusToAppStatus(
  jiraStatus: string
): 'open' | 'in-progress' | 'review' | 'done' {
  const statusMap: Record<string, 'open' | 'in-progress' | 'review' | 'done'> = {
    'acknowledged': 'open',
    'analysis': 'in-progress',
    'build': 'in-progress',
    'dev in progress': 'in-progress',
    'dfs in progress': 'review',
    'awaiting review': 'review',
    'awaiting cab approval': 'review',
    'cab approved': 'review',
    'delivered': 'done',
    'completed': 'done',
    'closed': 'done',
    'archived': 'done',
    'canceled': 'done'
  }

  return statusMap[jiraStatus.toLowerCase()] || 'open'
}

/**
 * Map Jira priority to app priority
 */
export function mapJiraPriorityToAppPriority(
  jiraPriority: string
): 'low' | 'medium' | 'high' | 'critical' {
  const priorityMap: Record<string, 'low' | 'medium' | 'high' | 'critical'> = {
    'lowest': 'low',
    'low': 'low',
    'medium': 'medium',
    'high': 'high',
    'highest': 'critical',
    'critical': 'critical',
    'blocker': 'critical'
  }

  return priorityMap[jiraPriority.toLowerCase()] || 'medium'
}

/**
 * ============================================
 * PUBLIC API FUNCTIONS
 * ============================================
 */

/**
 * Get all clients from dim_project
 */
export async function getClientsFromSharePoint(): Promise<Client[]> {
  try {
    const rows = await fetchFromBackendAPI<any>('/datalake/dim_project')
    console.log('[SharePoint] getClientsFromSharePoint returned:', rows)

    return rows.map(row => ({
      id: (row.project_key || '').toLowerCase(),
      name: row.project_name || '',
      logo: getClientLogoEmoji(row.project_key)
    }))
  } catch (error) {
    console.error('[SharePoint] Error fetching clients:', error)
    return []
  }
}

/**
 * Get client by ID
 */
export async function getClientByIdFromSharePoint(clientId: string): Promise<Client | null> {
  try {
    const rows = await fetchFromBackendAPI<any>('/datalake/dim_project', {
      project_key: clientId
    })

    if (rows.length === 0) return null

    const row = rows[0]
    return {
      id: clientId,
      name: row.project_name || '',
      logo: getClientLogoEmoji(row.project_key)
    }
  } catch (error) {
    console.error('[SharePoint] Error fetching client:', error)
    return null
  }
}

/**
 * Get environments for a client
 * Derived from dim_ticket - fetch real data to get latest fix_version and build_id
 */
export async function getClientEnvironmentsFromSharePoint(
  clientId: string
): Promise<Record<string, EnvironmentData>> {
  try {
    const tickets = await fetchFromBackendAPI<any>('/datalake/dim_ticket', {
      project_key: clientId
    })

    const environments: Record<string, EnvironmentData> = {}

    // Build environment data from actual tickets
    const envMap: Record<string, { fixVersion: string; buildId: string }> = {}

    tickets.forEach(ticket => {
      const env = extractEnvironmentFromSummary(ticket.summary || '')
      if (!envMap[env]) {
        envMap[env] = {
          fixVersion: ticket.fix_version || extractVersionFromSummary(ticket.summary || ''),
          buildId: ticket.build_id || `BUILD-${clientId.toUpperCase()}-${env.toUpperCase()}-2024-001`
        }
      }
    })

    // Map with icons and colors
    const iconMap: Record<string, { icon: string; color: string }> = {
      prod: { icon: '🔴', color: 'bg-red-50 dark:bg-red-900/20' },
      pprod: { icon: '🟡', color: 'bg-yellow-50 dark:bg-yellow-900/20' },
      uat: { icon: '🔵', color: 'bg-blue-50 dark:bg-blue-900/20' },
      uat1: { icon: '🔵', color: 'bg-blue-50 dark:bg-blue-900/20' },
      hfprd: { icon: '🟢', color: 'bg-green-50 dark:bg-green-900/20' }
    }

    Object.entries(envMap).forEach(([env, data]) => {
      environments[env] = {
        buildId: data.buildId,
        fixVersion: data.fixVersion,
        ...iconMap[env]
      }
    })

    return environments
  } catch (error) {
    console.error('[SharePoint] Error fetching environments:', error)
    return {}
  }
}

/**
 * Get tickets for a client and environment
 */
export async function getTicketsFromSharePoint(
  clientId: string,
  environment: string
): Promise<Ticket[]> {
  try {
    const rows = await fetchFromBackendAPI<any>('/datalake/dim_ticket', {
      project_key: clientId,
      include_assignee: 'true'
    })


    // Filter and transform tickets
    const tickets: Ticket[] = rows
      .filter(row => extractEnvironmentFromSummary(row.summary || '') === environment)
      .map(row => ({
        id: row.issue_key || '',
        title: (row.summary || '').substring(0, 100),
        status: mapJiraStatusToAppStatus(row.current_status || ''),
        fixVersion: row.fix_version || extractVersionFromSummary(row.summary || ''),
        buildId: row.build_id || `BUILD-${clientId.toUpperCase()}-${environment.toUpperCase()}-2024-001`,
        priority: mapJiraPriorityToAppPriority(row.priority || 'medium'),
        assignee: row.assignee_name || 'Unassigned',
        dueDate: formatDate(row.due_date),
        clientId: clientId,
        environment: environment
      }))

    return tickets
  } catch (error) {
    console.error('[SharePoint] Error fetching tickets:', error)
    return []
  }
}

/**
 * Get ticket detail
 */
export async function getTicketDetailFromSharePoint(ticketId: string): Promise<Ticket | null> {
  try {
    const rows = await fetchFromBackendAPI<any>('/datalake/dim_ticket', {
      issue_key: ticketId,
      include_assignee: 'true'
    })

    if (rows.length === 0) return null

    const row = rows[0]
    const clientId = row.project_key || ''
    const environment = extractEnvironmentFromSummary(row.summary || '')

    return {
      id: ticketId,
      title: row.summary || '',
      status: mapJiraStatusToAppStatus(row.current_status || ''),
      fixVersion: row.fix_version || extractVersionFromSummary(row.summary || ''),
      buildId: row.build_id || `BUILD-${clientId.toUpperCase()}-${environment.toUpperCase()}-2024-001`,
      priority: mapJiraPriorityToAppPriority(row.priority || ''),
      assignee: row.assignee_name || 'Unassigned',
      dueDate: formatDate(row.due_date),
      clientId: clientId,
      environment: environment
    }
  } catch (error) {
    console.error('[SharePoint] Error fetching ticket detail:', error)
    return null
  }
}

/**
 * ============================================
 * UTILITY FUNCTIONS
 * ============================================
 */

/**
 * Get emoji logo for client
 */
function getClientLogoEmoji(clientKey?: string): string {
  const logoMap: Record<string, string> = {
    'anvzn': '🎯',
    'fed': '🏛️',
    'gsd': '📊',
    'irpauto': '🚗'
  }

  return logoMap[(clientKey || '').toLowerCase()] || '📦'
}

/**
 * Format date to YYYY-MM-DD
 */
function formatDate(dateStr?: string): string {
  if (!dateStr) return ''

  try {
    const date = new Date(dateStr)
    return date.toISOString().split('T')[0]
  } catch {
    return dateStr
  }
}
