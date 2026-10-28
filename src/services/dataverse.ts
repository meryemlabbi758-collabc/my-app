/**
 * Dataverse Service
 * Integrates directly with Microsoft Dataverse for Power Apps
 */

import type { Client, Ticket, TicketDetail, EnvironmentData, TeamMember, TeamGroup } from './types'
import { Cra69_teammembersService } from '@/generated/services/Cra69_teammembersService'
import type { Cra69_teammembers } from '@/generated/models/Cra69_teammembersModel'
import { Cra69_clientsService } from '@/generated/services/Cra69_clientsService'
import { Cra69_environmentsService } from '@/generated/services/Cra69_environmentsService'
import { Cra69_dimassigneesService } from '@/generated/services/Cra69_dimassigneesService'
import { De_powerbi_delta_open_releasesesService } from '@/generated/services/De_powerbi_delta_open_releasesesService'
import type { De_powerbi_delta_open_releaseses } from '@/generated/models/De_powerbi_delta_open_releasesesModel'
import { Cra69_ticketsService } from '@/generated/services/Cra69_ticketsService'

export async function getClientsFromDataverse(): Promise<Client[]> {
  const result = await Cra69_clientsService.getAll({
    select: ['cra69_clientid', 'cra69_nameofclients', 'cra69_logo'],
    orderBy: ['cra69_nameofclients asc'],
  })
  if (result.error) {
    console.error('[Dataverse] clients error:', result.error)
    throw new Error(result.error.message)
  }

  return (result.data || []).map(client => ({
    id: client.cra69_clientid,
    name: client.cra69_nameofclients || '',
    logo: client.cra69_logo || '📊',
  }))
}

const ENV_STYLES: Record<string, { icon: string; color: string }> = {
  prod: { icon: '🔴', color: 'bg-red-100 dark:bg-red-900' },
  pprd: { icon: '🟡', color: 'bg-yellow-100 dark:bg-yellow-900' },
  pprod: { icon: '🟡', color: 'bg-yellow-100 dark:bg-yellow-900' },
  uat: { icon: '🔵', color: 'bg-blue-100 dark:bg-blue-900' },
  uat1: { icon: '🔵', color: 'bg-blue-100 dark:bg-blue-900' },
  hfprd: { icon: '🟢', color: 'bg-green-100 dark:bg-green-900' },
}
const DEFAULT_ENV_STYLE = { icon: '⚪', color: 'bg-gray-100 dark:bg-gray-800' }

export async function getClientEnvironmentsFromDataverse(
  clientId: string
): Promise<Record<string, EnvironmentData>> {
  const client = await getClientById(clientId)
  if (!client) return {}

  const result = await Cra69_environmentsService.getAll({
    select: ['cra69_environmentid', 'cra69_nameenv', 'cra69_client'],
    filter: `cra69_client eq '${client.name.replace(/'/g, "''")}'`,
    orderBy: ['cra69_nameenv asc'],
  })
  if (result.error) {
    console.error('[Dataverse] environments error:', result.error)
    throw new Error(result.error.message)
  }

  const environments: Record<string, EnvironmentData> = {}
  for (const env of result.data || []) {
    const name = env.cra69_nameenv.trim()
    const slug = name.toLowerCase()
    const style = ENV_STYLES[slug] || DEFAULT_ENV_STYLE
    environments[slug] = { name, buildId: '', fixVersion: '', icon: style.icon, color: style.color }
  }
  return environments
}

const TICKET_COLUMNS = [
  'de_powerbi_delta_open_releasesid', 'de_issuekey', 'de_summary', 'de_assignee', 'de_priority', 'de_status',
  'de_fixversions', 'de_buildversion', 'de_expectedsprint', 'de_issuetype', 'de_commitmenttype', 'de_resolution',
] as const

// The open-releases table is a virtual (external) table: read-only
export const TICKETS_EDITABLE = false

function toStatus(raw?: string): Ticket['status'] {
  const v = (raw || '').trim().toLowerCase()
  if (!v) return 'open'
  return /done|closed|resolved|deliver|complete/.test(v) ? 'done' : 'in-progress'
}

function toPriority(raw?: string): Ticket['priority'] {
  const v = (raw || '').trim().toLowerCase()
  if (/critical|blocker|highest|high|major/.test(v)) return 'critical'
  if (/low|minor|trivial/.test(v)) return 'low'
  return 'medium'
}

type AssigneeNames = Map<string, string>

export async function getAssigneeNames(): Promise<AssigneeNames> {
  const result = await Cra69_dimassigneesService.getAll({
    select: ['cra69_dimassigneeid', 'cra69_displayname', 'cra69_accountid'],
  })
  const names: AssigneeNames = new Map()
  if (result.error) {
    console.error('[Dataverse] assignees error:', result.error)
    return names
  }
  for (const a of result.data || []) {
    const name = a.cra69_displayname
    if (a.cra69_accountid) names.set(a.cra69_accountid.trim().toLowerCase(), name)
    names.set(name.trim().toLowerCase(), name)
  }
  return names
}

function resolveAssignee(raw: string | undefined, names: AssigneeNames): string {
  if (!raw) return 'Unassigned'
  return names.get(raw.trim().toLowerCase()) || raw
}

function toTicket(t: De_powerbi_delta_open_releaseses, names: AssigneeNames): TicketDetail {
  return {
    id: t.de_powerbi_delta_open_releasesid,
    title: t.de_issuekey,
    summary: t.de_summary || '',
    status: toStatus(t.de_status),
    priority: toPriority(t.de_priority),
    assignee: resolveAssignee(t.de_assignee, names),
    dueDate: '',
    fixVersion: t.de_fixversions || '',
    buildId: t.de_buildversion || '',
    sprint: t.de_expectedsprint || '',
    issueType: t.de_issuetype || '',
    commitmentType: t.de_commitmenttype || '',
    resolution: t.de_resolution || '',
    statusText: t.de_status || '',
    priorityText: t.de_priority || '',
    clientId: '',
    environment: '',
  }
}

async function fetchTickets(): Promise<TicketDetail[]> {
  const result = await De_powerbi_delta_open_releasesesService.getAll({
    select: [...TICKET_COLUMNS],
    orderBy: ['de_issuekey asc'],
  })
  if (result.error) {
    console.error('[Dataverse] tickets error:', result.error)
    throw new Error(result.error.message)
  }
  const names = await getAssigneeNames()
  return (result.data || []).map(t => toTicket(t, names))
}

// The source table has no client/environment column, so every client sees all open releases
export async function getTicketsFromDataverse(
  _client?: Pick<Client, 'id' | 'name'>
): Promise<Ticket[]> {
  return fetchTickets()
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
  return getTicketsFromDataverse()
}

export async function getTicketsByClientAndEnvironment(clientId: string, _environment: string): Promise<Ticket[]> {
  const client = await getClientById(clientId)
  return getTicketsFromDataverse(client ?? undefined)
}

export async function getTicketById(ticketId: string): Promise<TicketDetail | null> {
  const result = await De_powerbi_delta_open_releasesesService.get(ticketId, { select: [...TICKET_COLUMNS] })
  if (result.error || !result.data) return null
  return toTicket(result.data, await getAssigneeNames())
}

const TEAM_VALUES = {
  dxc: 902190000,
  customer: 902190001,
  developers: 902190002,
  build: 902190003,
  observers: 902190004,
} as const

const TEAM_BY_VALUE = Object.fromEntries(
  Object.entries(TEAM_VALUES).map(([group, value]) => [value, group])
) as Record<number, TeamGroup>

function toTeamMember(m: Cra69_teammembers): TeamMember {
  return {
    id: m.cra69_teammemberid,
    name: m.cra69_name,
    email: m.cra69_email || '',
    phone: m.cra69_phone || '',
    role: m.cra69_role || '',
    group: m.cra69_notifgroup || '',
    team: (m.cra69_team !== undefined && TEAM_BY_VALUE[m.cra69_team]) || 'dxc',
    color: m.cra69_color || '#004AAC',
  }
}

function fromTeamMember(m: Omit<TeamMember, 'id'>) {
  return {
    cra69_name: m.name,
    cra69_email: m.email,
    cra69_phone: m.phone,
    cra69_role: m.role,
    cra69_notifgroup: m.group,
    cra69_team: TEAM_VALUES[m.team],
    cra69_color: m.color,
  }
}

export async function getTeamMembers(): Promise<TeamMember[]> {
  const result = await Cra69_teammembersService.getAll({
    select: ['cra69_teammemberid', 'cra69_name', 'cra69_email', 'cra69_phone', 'cra69_role', 'cra69_notifgroup', 'cra69_team', 'cra69_color'],
    orderBy: ['createdon asc'],
  })
  if (result.error) {
    console.error('[Dataverse] team error:', result.error)
    throw new Error(result.error.message)
  }
  return (result.data || []).map(toTeamMember)
}

export async function createTeamMember(m: Omit<TeamMember, 'id'>): Promise<void> {
  const result = await Cra69_teammembersService.create({ ...fromTeamMember(m), statecode: 0 })
  if (result.error) throw new Error(result.error.message)
}

export async function updateTeamMember(id: string, m: Omit<TeamMember, 'id'>): Promise<void> {
  const result = await Cra69_teammembersService.update(id, fromTeamMember(m))
  if (result.error) throw new Error(result.error.message)
}

export async function deleteTeamMember(id: string): Promise<void> {
  await Cra69_teammembersService.delete(id)
}

const STATUS_TO_VALUE = { 'in-progress': 902190000, 'done': 902190001 } as const
const PRIORITY_TO_VALUE = { medium: 902190000, critical: 902190001, low: 902190003 } as const

export async function updateTicket(
  id: string,
  t: Pick<TicketDetail, 'status' | 'priority' | 'assignee' | 'dueDate'>
): Promise<void> {
  const fields: Parameters<typeof Cra69_ticketsService.update>[1] = { cra69_assenee: t.assignee }
  if (t.status in STATUS_TO_VALUE) fields.cra69_status = STATUS_TO_VALUE[t.status as keyof typeof STATUS_TO_VALUE]
  if (t.priority in PRIORITY_TO_VALUE) fields.cra69_priority = PRIORITY_TO_VALUE[t.priority as keyof typeof PRIORITY_TO_VALUE]
  if (t.dueDate) fields.cra69_deadline = t.dueDate
  const result = await Cra69_ticketsService.update(id, fields)
  if (result.error) throw new Error(result.error.message)
}

export default { getClientsFromDataverse, getClientEnvironmentsFromDataverse, getTicketsFromDataverse }

import { Cra69_versionentriesService } from '@/generated/services/Cra69_versionentriesService'
import type { Cra69_versionentries } from '@/generated/models/Cra69_versionentriesModel'
import type { VersionEntry } from './types'

const VERSION_COLUMNS = ['cra69_versionentryid', 'cra69_name', 'cra69_client', 'cra69_date', 'cra69_environment', 'cra69_kind']

function toVersionEntry(v: Cra69_versionentries): VersionEntry {
  return {
    id: v.cra69_versionentryid,
    client: v.cra69_client || '',
    date: (v.cra69_date || '').slice(0, 10),
    environment: v.cra69_environment || '',
    label: v.cra69_name,
    kind: v.cra69_kind || 'note',
  }
}

const quote = (s: string) => `'${s.replace(/'/g, "''")}'`

async function fetchVersionEntries(filter: string, top?: number): Promise<VersionEntry[]> {
  const result = await Cra69_versionentriesService.getAll({
    select: VERSION_COLUMNS,
    filter,
    orderBy: ['cra69_date desc'],
    top,
  })
  if (result.error) throw new Error(result.error.message)
  return (result.data || []).map(toVersionEntry)
}

export function getVersionEntries(client: string, from: string, to: string) {
  return fetchVersionEntries(`cra69_client eq ${quote(client)} and cra69_date ge ${from} and cra69_date le ${to}`)
}

// Latest entries of one kind up to a date, newest first (used for the "current version" header rows)
export function getLatestVersionEntries(client: string, kind: string, upTo: string) {
  return fetchVersionEntries(`cra69_client eq ${quote(client)} and cra69_kind eq ${quote(kind)} and cra69_date le ${upTo}`, 300)
}

function fromVersionEntry(v: Omit<VersionEntry, 'id'>) {
  return {
    cra69_name: v.label,
    cra69_client: v.client,
    cra69_date: v.date,
    cra69_environment: v.environment,
    cra69_kind: v.kind,
  }
}

export async function createVersionEntry(v: Omit<VersionEntry, 'id'>): Promise<void> {
  const result = await Cra69_versionentriesService.create({ ...fromVersionEntry(v), statecode: 0 })
  if (result.error) throw new Error(result.error.message)
}

export async function updateVersionEntry(id: string, v: Omit<VersionEntry, 'id'>): Promise<void> {
  const result = await Cra69_versionentriesService.update(id, fromVersionEntry(v))
  if (result.error) throw new Error(result.error.message)
}

export async function deleteVersionEntry(id: string): Promise<void> {
  await Cra69_versionentriesService.delete(id)
}

// Environment columns of a client = distinct environments used by its version entries
// (a placeholder entry of kind "column" keeps an environment that has no entry yet)
export async function getVersionEnvironments(client: string): Promise<string[]> {
  const result = await Cra69_versionentriesService.getAll({
    select: ['cra69_environment'],
    filter: `cra69_client eq ${quote(client)}`,
    top: 5000,
  })
  if (result.error) throw new Error(result.error.message)
  return Array.from(new Set((result.data || []).map(v => v.cra69_environment || '').filter(Boolean)))
}
