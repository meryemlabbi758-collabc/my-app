import { Link } from "react-router-dom"
import { ArrowRight, Building2, CircleCheck, Clock, TicketIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useClients, useCurrentUserName, useTickets } from "@/hooks/useDataverse"
import type { Ticket } from "@/services/types"

const statusStyle: Record<Ticket["status"], string> = {
  "in-progress": "bg-warning text-navy",
  done: "bg-success text-white",
  open: "bg-info text-white",
  review: "bg-muted text-foreground",
}

const statusLabel: Record<Ticket["status"], string> = {
  "in-progress": "In progress",
  done: "Delivered",
  open: "Open",
  review: "Review",
}

function Ring({ value }: { value: number }) {
  const r = 46
  const c = 2 * Math.PI * r
  return (
    <div className="relative size-28 shrink-0">
      <svg viewBox="0 0 110 110" className="size-full -rotate-90">
        <circle cx="55" cy="55" r={r} fill="none" strokeWidth="9" className="stroke-muted" />
        <circle
          cx="55"
          cy="55"
          r={r}
          fill="none"
          strokeWidth="9"
          strokeLinecap="round"
          className="stroke-warning transition-all"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - value / 100)}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="text-3xl font-bold leading-none">{value}</div>
          <div className="text-xs text-muted-foreground">%</div>
        </div>
      </div>
    </div>
  )
}

function Kpi({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string
  value: string | number
  icon: typeof Clock
  accent: string
}) {
  return (
    <Card className={`gap-0 border-l-4 py-0 ${accent}`}>
      <CardContent className="flex items-center justify-between p-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-bold">{value}</p>
        </div>
        <Icon className="size-5 text-muted-foreground" />
      </CardContent>
    </Card>
  )
}

export default function HomePage() {
  const { clients, loading: clientsLoading } = useClients()
  const { tickets, loading: ticketsLoading } = useTickets()
  const userName = useCurrentUserName()

  const total = tickets.length
  const delivered = tickets.filter((t) => t.status === "done").length
  const inProgress = tickets.filter((t) => t.status === "in-progress").length
  const rate = total ? Math.round((delivered / total) * 100) : 0
  const health = rate >= 80 ? "On track" : rate >= 50 ? "Watch" : "At risk"
  const healthColor = ticketsLoading ? "text-muted-foreground" : rate >= 80 ? "text-success" : rate >= 50 ? "text-brand-ink" : "text-destructive"
  const dash = (loading: boolean, v: number) => (loading ? "—" : v)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{userName ? `Welcome back, ${userName}` : "Welcome back"}</h1>
        <p className="text-sm text-muted-foreground">Here is what is happening with your deliverables today.</p>
      </div>

      <Card className="py-0">
        <CardContent className="space-y-5 p-6">
          <p className="text-xs font-bold uppercase tracking-wider text-brand-ink">Delivery health</p>
          <div className="flex flex-wrap items-center gap-8">
            <Ring value={rate} />
            <div>
              <p className="text-lg font-semibold">Delivery rate</p>
              <p className={`text-sm font-medium ${healthColor}`}>{ticketsLoading ? "Loading…" : health}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {delivered} delivered out of {total} tickets
              </p>
            </div>
            <div className="ml-auto flex flex-wrap gap-2">
              {Object.entries(statusLabel).map(([key, label]) => (
                <span
                  key={key}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyle[key as Ticket["status"]]}`}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Clients" value={dash(clientsLoading, clients.length)} icon={Building2} accent="border-l-primary" />
        <Kpi label="Total tickets" value={dash(ticketsLoading, total)} icon={TicketIcon} accent="border-l-info" />
        <Kpi label="In progress" value={dash(ticketsLoading, inProgress)} icon={Clock} accent="border-l-warning" />
        <Kpi label="Delivered" value={dash(ticketsLoading, delivered)} icon={CircleCheck} accent="border-l-success" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="py-0 lg:col-span-2">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-info">Latest tickets</p>
              <Link to="/tickets" className="flex items-center gap-1 text-sm font-medium text-brand-ink hover:underline">
                View all <ArrowRight className="size-4" />
              </Link>
            </div>
            {ticketsLoading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : tickets.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tickets yet.</p>
            ) : (
              <ul className="divide-y">
                {tickets.slice(0, 6).map((t) => (
                  <li key={t.id}>
                    <Link
                      to={`/tickets/${t.id}`}
                      className="-mx-2 flex items-center gap-4 rounded-md px-2 py-3 hover:bg-accent/60"
                    >
                      <span className="w-24 shrink-0 text-sm font-semibold text-brand-ink">{t.title}</span>
                      <span className="min-w-0 flex-1 truncate text-sm">{t.summary}</span>
                      <span className="hidden text-xs text-muted-foreground sm:block">{t.assignee}</span>
                      <span className={`rounded-full px-3 py-0.5 text-xs font-medium ${statusStyle[t.status]}`}>
                        {statusLabel[t.status]}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="py-0">
          <CardContent className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-success">Clients</p>
              <Link to="/clients" className="flex items-center gap-1 text-sm font-medium text-brand-ink hover:underline">
                View all <ArrowRight className="size-4" />
              </Link>
            </div>
            {clientsLoading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : (
              <ul className="space-y-1">
                {clients.map((c) => (
                  <li key={c.id}>
                    <Link
                      to={`/clients/${c.id}`}
                      className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-accent/60"
                    >
                      <span className="grid size-8 place-items-center rounded-md bg-navy text-xs font-bold text-navy-foreground">
                        {c.name.slice(0, 2).toUpperCase()}
                      </span>
                      <span className="text-sm font-medium">{c.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
