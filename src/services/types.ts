// Types for Dataverse integration

export interface Client {
  id: string
  name: string
  logo: string
}

export interface EnvironmentData {
  buildId: string
  fixVersion: string
  icon: string
  color: string
}

export interface Ticket {
  id: string
  title: string
  status: "open" | "in-progress" | "review" | "done"
  fixVersion: string
  buildId: string
  priority: "low" | "medium" | "high" | "critical"
  assignee: string
  dueDate: string
  clientId: string
  environment: string
}

export interface ClientWithEnvironments {
  client: Client
  environments: Record<string, EnvironmentData>
}

export interface TicketDetail extends Ticket {
  description?: string
  createdDate?: string
  updatedDate?: string
  summary?: string
  sprint?: string
}
