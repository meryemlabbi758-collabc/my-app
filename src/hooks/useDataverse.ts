import { useEffect, useState } from 'react'
import type { Client, Ticket, EnvironmentData, TicketDetail } from '@/services/types'
import {
  getClients,
  getClientById,
  getClientEnvironments,
  getTickets,
  getTicketsByClientAndEnvironment,
  getTicketById
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
