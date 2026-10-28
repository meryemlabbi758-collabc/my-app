import { useEffect, useState } from 'react'
import { getContext } from '@microsoft/power-apps/app'
import type { VersionEntry, TeamMember, Client, Ticket, EnvironmentData, TicketDetail } from '@/services/types'
import {
  getClients,
  getClientById,
  getClientEnvironments,
  getTickets,
  getTicketsByClientAndEnvironment,
  getTicketById,
  getTeamMembers,
  getVersionEntries,
  getLatestVersionEntries,
  getVersionEnvironments
} from '@/services/dataverse'

/**
 * Hook for fetching clients from Dataverse
 */
export function useClients() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    getClients()
      .then(setClients)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [])

  return { clients, loading, error }
}

/**
 * Hook for fetching a specific client
 */
export function useClient(clientId: string | null) {
  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(!!clientId)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!clientId) {
      setLoading(false)
      return
    }

    getClientById(clientId)
      .then(setClient)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [clientId])

  return { client, loading, error }
}

/**
 * Hook for fetching environments for a client
 */
export function useEnvironments(clientId: string | null) {
  const [environments, setEnvironments] = useState<Record<string, EnvironmentData>>({})
  const [loading, setLoading] = useState(!!clientId)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!clientId) {
      setLoading(false)
      return
    }

    getClientEnvironments(clientId)
      .then(setEnvironments)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [clientId])

  return { environments, loading, error }
}

/**
 * Hook for fetching all tickets
 */
export function useTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    getTickets()
      .then(setTickets)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [])

  return { tickets, loading, error }
}

/**
 * Hook for fetching tickets for a specific client and environment
 */
export function useClientEnvironmentTickets(clientId: string | null, environment: string | null) {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(!!clientId && !!environment)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!clientId || !environment) {
      setLoading(false)
      return
    }

    getTicketsByClientAndEnvironment(clientId, environment)
      .then(setTickets)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [clientId, environment])

  return { tickets, loading, error }
}

/**
 * Hook for fetching a specific ticket
 */
export function useTicketDetail(ticketId: string | null) {
  const [ticket, setTicket] = useState<TicketDetail | null>(null)
  const [loading, setLoading] = useState(!!ticketId)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!ticketId) {
      setLoading(false)
      return
    }

    getTicketById(ticketId)
      .then((data: TicketDetail | null) => setTicket(data))
      .catch(setError)
      .finally(() => setLoading(false))
  }, [ticketId])

  return { ticket, loading, error }
}

/**
 * Hook for fetching team members (reload() refetches after an edit)
 */
export function useTeamMembers() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const reload = () =>
    getTeamMembers()
      .then(setMembers)
      .catch(setError)
      .finally(() => setLoading(false))

  useEffect(() => {
    reload()
  }, [])

  return { members, loading, error, reload }
}

/**
 * Hook for the signed-in user's email (UPN), used for role gating
 */
export function useCurrentUserEmail() {
  const [email, setEmail] = useState('')
  useEffect(() => {
    getContext()
      .then(ctx => setEmail((ctx.user.userPrincipalName || '').toLowerCase()))
      .catch(() => setEmail(''))
  }, [])
  return email
}

/**
 * Display name of the signed-in user (falls back to the email prefix)
 */
export function useCurrentUserName() {
  const [name, setName] = useState('')
  useEffect(() => {
    getContext()
      .then(ctx => {
        const upn = ctx.user.userPrincipalName || ''
        setName((ctx.user.fullName || '').trim() || upn.split('@')[0])
      })
      .catch(() => setName(''))
  }, [])
  return name
}

/**
 * Whether the signed-in user may edit tickets: member of the Developers or Build group
 */
export function useCanEditTickets() {
  const { members } = useTeamMembers()
  const email = useCurrentUserEmail()
  return !!email && members.some(m => (m.team === 'developers' || m.team === 'build') && m.email.toLowerCase() === email)
}

/**
 * Whether the signed-in user is a Delivery Lead (can edit the version calendar)
 */
export function useIsDeliveryLead() {
  const { members } = useTeamMembers()
  const email = useCurrentUserEmail()
  return !!email && members.some(m => m.email.toLowerCase() === email && m.role.trim().toLowerCase() === 'delivery lead')
}

/**
 * Version calendar entries of a client between two dates (reload() refetches after an edit)
 */
export function useVersionEntries(client: string | null, from: string, to: string) {
  const [entries, setEntries] = useState<VersionEntry[]>([])
  const [loading, setLoading] = useState(!!client)
  const [error, setError] = useState<Error | null>(null)

  const reload = () => {
    if (!client) return Promise.resolve()
    return getVersionEntries(client, from, to)
      .then(setEntries)
      .catch(setError)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    setLoading(!!client)
    reload()
  }, [client, from, to])

  return { entries, loading, error, reload }
}

/**
 * Latest version per environment for one kind of entry, up to today
 */
export function useCurrentVersions(client: string | null, kind: string, upTo: string, refreshKey: number) {
  const [byEnv, setByEnv] = useState<Record<string, VersionEntry>>({})
  useEffect(() => {
    if (!client) return
    getLatestVersionEntries(client, kind, upTo)
      .then(list => {
        const map: Record<string, VersionEntry> = {}
        for (const e of list) if (!map[e.environment]) map[e.environment] = e
        setByEnv(map)
      })
      .catch(() => setByEnv({}))
  }, [client, kind, upTo, refreshKey])
  return byEnv
}

/**
 * Environment columns of the version calendar for one client
 */
export function useVersionEnvironments(client: string | null, refreshKey: number) {
  const [envs, setEnvs] = useState<string[]>([])
  useEffect(() => {
    setEnvs([])
    if (!client) return
    getVersionEnvironments(client).then(setEnvs).catch(() => setEnvs([]))
  }, [client, refreshKey])
  return envs
}
