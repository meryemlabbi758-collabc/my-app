import { useState } from "react"
import { useNavigate, useSearchParams, Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Clipboard, ChevronRight, X, ArrowLeft, Loader } from "lucide-react"
import { useClient, useEnvironments, useClientEnvironmentTickets, useTickets } from "@/hooks/useDataverse"

export default function TicketsPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const clientId = searchParams.get("clientId")
  const environment = searchParams.get("env")

  // Fetch data from Dataverse service
  const { client, loading: clientLoading } = useClient(clientId)
  const { environments, loading: envLoading } = useEnvironments(clientId)
  const { tickets: scopedTickets, loading: scopedLoading } = useClientEnvironmentTickets(clientId, environment)
  const { tickets: allTickets, loading: allLoading } = useTickets()
  const scoped = !!clientId && !!environment
  const envTickets = scoped ? scopedTickets : allTickets
  const ticketsLoading = scoped ? scopedLoading : allLoading

  const [fixVersion, setFixVersion] = useState("")
  const [buildId, setBuildId] = useState("")
  const [statusFilter, setStatusFilter] = useState("")

  // Get unique fix versions and build IDs from tickets
  const uniqueFixVersions = Array.from(new Set(envTickets.map(t => t.fixVersion).filter(Boolean))).sort()
  const uniqueBuildIds = Array.from(new Set(envTickets.map(t => t.buildId).filter(Boolean))).sort()

  // Filter tickets based on selected filters
  const filteredTickets = envTickets.filter((ticket) => {
    if (fixVersion && ticket.fixVersion !== fixVersion) return false
    if (buildId && ticket.buildId !== buildId) return false
    if (statusFilter && ticket.status !== statusFilter) return false
    return true
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "in-progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "review":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "done":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "high":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      case "medium":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (scoped && (clientLoading || envLoading)) {
    return (
      <div className="space-y-8 pb-8">
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 animate-spin text-primary" />
          <p className="ml-3 text-muted-foreground">Chargement des données...</p>
        </div>
      </div>
    )
  }

  if (scoped && (!client || !environments[environment!])) {
    return (
      <div className="space-y-4">
        <Link to="/clients">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux clients
          </Button>
        </Link>
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">Données non trouvées. Veuillez sélectionner un client et un environnement.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const envData = scoped && environment ? environments[environment] : null

  // Most common fix version and build ID shown in the banner
  const mostCommonFixVersion = uniqueFixVersions[0]
  const mostCommonBuildId = uniqueBuildIds[0]
  const hasFilters = !!(fixVersion || buildId || statusFilter)
  const clearFilters = () => {
    setFixVersion("")
    setBuildId("")
    setStatusFilter("")
  }

  return (
    <div className="space-y-5 pb-8">
      {/* Title + client/environment banner */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <Link to="/clients">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Clients
          </Button>
        </Link>

        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Clipboard className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold leading-tight tracking-tight">Jira Delivery Tickets</h1>
            <p className="text-sm text-muted-foreground">
              {scoped && client && envData ? `Tickets pour ${client.name} - ${envData.name}` : "Tous les tickets"}
            </p>
          </div>
        </div>

        {client && envData && environment && (
          <div className={`${envData.color} ml-auto flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border px-4 py-2.5`}>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{client.logo}</span>
              <span className="text-lg font-bold">{client.name}</span>
              <Badge className="px-2.5 py-0.5">
                {envData.icon} {envData.name}
              </Badge>
            </div>
            <div className="text-xs">
              <span className="text-muted-foreground">Build ID </span>
              <span className="font-mono font-semibold">{mostCommonBuildId || "—"}</span>
            </div>
            <div className="text-xs">
              <span className="text-muted-foreground">Fix Version </span>
              <span className="font-mono font-semibold">{mostCommonFixVersion || "—"}</span>
            </div>
          </div>
        )}
      </div>

      {/* Filters + total on one line */}
      <Card className="py-0">
        <CardContent className="flex flex-wrap items-end gap-x-5 gap-y-3 p-4">
          <h2 className="mr-1 self-center text-base font-semibold">Filtrer les Tickets</h2>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Fix version</label>
            <Select value={fixVersion} onValueChange={setFixVersion}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Toutes les versions" />
              </SelectTrigger>
              <SelectContent>
                {uniqueFixVersions.map((version) => (
                  <SelectItem key={version} value={version}>
                    {version}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Build ID</label>
            <Select value={buildId} onValueChange={setBuildId}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Tous les builds" />
              </SelectTrigger>
              <SelectContent>
                {uniqueBuildIds.map((id) => (
                  <SelectItem key={id} value={id}>
                    {id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Status</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="review">Review</SelectItem>
                <SelectItem value="done">Done</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 self-center pt-4 text-sm text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
              Effacer les filtres
            </button>
          )}

          <div className="ml-auto flex items-center gap-3 rounded-xl bg-primary/10 px-4 py-2">
            <Clipboard className="size-5 text-primary" />
            <div className="leading-tight">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Total Tickets</p>
              <p className="text-2xl font-bold">{filteredTickets.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tickets list */}
      <Card className="gap-0 py-0">
        {ticketsLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader className="w-6 h-6 animate-spin text-primary" />
            <p className="ml-3 text-muted-foreground">Chargement des tickets...</p>
          </div>
        ) : filteredTickets.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="px-4 text-[11px] font-semibold uppercase tracking-wide">ID</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wide">Title</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wide">Status</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wide">Priority</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wide">Assignee</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wide">Due Date</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets.map((ticket) => (
                  <TableRow
                    key={ticket.id}
                    onClick={() => navigate(`/tickets/${ticket.id}`)}
                    className="cursor-pointer transition-colors hover:bg-muted/50"
                  >
                    <TableCell className="px-4 font-semibold text-primary">{ticket.title}</TableCell>
                    <TableCell className="max-w-md truncate">{ticket.summary}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(ticket.status)}>{ticket.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(ticket.priority)}>{ticket.priority}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">{ticket.assignee}</TableCell>
                    <TableCell className="text-sm">{ticket.dueDate || "—"}</TableCell>
                    <TableCell>
                      <ChevronRight className="size-4 text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="py-10 text-center">
            <p className="text-muted-foreground">Aucun ticket trouvé pour cet environnement</p>
          </div>
        )}
      </Card>
    </div>
  )
}
