// Types for Dataverse integration

export interface Client {
  id: string
  name: string
  logo: string
}

export interface EnvironmentData {
  name?: string
  buildId: string
  fixVersion: string
  icon: string
  color: string
}

export interface Ticket {
  id: string
  title: string
  summary?: string
  status: "open" | "in-progress" | "review" | "done"
  fixVersion: string
  buildId: string
  priority: "low" | "medium" | "high" | "critical"
  assignee: string
  dueDate: string
  clientId: string
  environment: string
  sprint?: string
  issueType?: string
  commitmentType?: string
  resolution?: string
  statusText?: string
  priorityText?: string
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

export type TeamGroup = "dxc" | "customer" | "developers" | "build" | "observers"

export interface TeamMember {
  id: string
  name: string
  email: string
  phone: string
  role: string
  group: string
  team: TeamGroup
  color: string
}

export interface VersionEntry {
  id: string
  client: string
  date: string
  environment: string
  label: string
  kind: string
}
