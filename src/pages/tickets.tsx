import { useState } from "react"
import { useNavigate, useSearchParams, Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { useClient, useEnvironments, useClientEnvironmentTickets } from "@/hooks/useDataverse"

const environmentNames: Record<string, string> = {
  prod: "PROD",
  pprod: "PPROD",
  uat1: "UAT1",
  hfprd: "HFPRD"
}

export default function TicketsPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const clientId = searchParams.get("clientId")
  const environment = searchParams.get("env")

  // Fetch data from Dataverse service
  const { client, loading: clientLoading } = useClient(clientId)
  const { environments, loading: envLoading } = useEnvironments(clientId)
  const { tickets: envTickets, loading: ticketsLoading } = useClientEnvironmentTickets(clientId, environment)

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

  if (clientLoading || envLoading) {
    return (
      <div className="space-y-8 pb-8">
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 animate-spin text-blue-600" />
          <p className="ml-3 text-muted-foreground">Chargement des données...</p>
        </div>
      </div>
    )
  }

  if (!client || !environment || !environments[environment]) {
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

  const envData = environments[environment]

  // Get the most common fix version and build ID from tickets
  const mostCommonFixVersion = uniqueFixVersions.length > 0
    ? uniqueFixVersions[0]
    : envData.fixVersion
  const mostCommonBuildId = uniqueBuildIds.length > 0
    ? uniqueBuildIds[0]
    : envData.buildId

  return (
    <div className="space-y-8 pb-8">
      {/* Client & Environment Header */}
      <div className="space-y-4">
        <Link to="/clients">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux clients
          </Button>
        </Link>

        <Card className={`${envData.color} border-2 transition-all`}>
          <CardContent className="pt-8">
            <div className="flex items-start gap-6">
              <div className="text-5xl">{client.logo}</div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-3xl font-bold">{client.name}</h2>
                  <Badge className="text-lg px-3 py-1">{envData.icon} {environmentNames[environment]}</Badge>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Build ID</p>
                    <p className="font-mono text-sm font-semibold">{mostCommonBuildId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Fix Version</p>
                    <p className="font-mono text-sm font-semibold">{mostCommonFixVersion}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Clipboard className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Jira Delivery Tickets</h1>
            <p className="text-muted-foreground">Tickets pour {client.name} - {environmentNames[environment]}</p>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtrer les Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Fix version</label>
              <Select value={fixVersion} onValueChange={setFixVersion}>
                <SelectTrigger>
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
            <div className="space-y-2">
              <label className="text-sm font-medium">Build ID</label>
              <Select value={buildId} onValueChange={setBuildId}>
                <SelectTrigger>
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
          </div>
        </CardContent>
      </Card>

      {/* Total Tickets Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Total Tickets</p>
              <p className="text-4xl font-bold">{filteredTickets.length}</p>
              <p className="text-xs text-muted-foreground mt-2">Pour cet environnement</p>
            </div>
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <Clipboard className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tickets List Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Tickets List</CardTitle>
            {statusFilter && (
              <button
                onClick={() => setStatusFilter("")}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
                Clear Status Filter
              </button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
              <ChevronRight className="w-5 h-5 text-blue-600" />
            </div>
          </div>

          {/* Table */}
          {ticketsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader className="w-6 h-6 animate-spin text-blue-600" />
              <p className="ml-3 text-muted-foreground">Chargement des tickets...</p>
            </div>
          ) : filteredTickets.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Assignee</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTickets.map((ticket) => (
                    <TableRow
                      key={ticket.id}
                      onClick={() => navigate(`/tickets/${ticket.id}`)}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <TableCell className="font-medium text-blue-600">{ticket.id}</TableCell>
                      <TableCell>{ticket.title}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(ticket.status)}>
                          {ticket.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(ticket.priority)}>
                          {ticket.priority}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{ticket.assignee}</TableCell>
                      <TableCell className="text-sm">{ticket.dueDate}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="ghost">
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Aucun ticket trouvé pour cet environnement</p>
            </div>
          )}

          {/* Pagination info */}
          <div className="mt-6 text-sm text-muted-foreground">
            Affichage de {filteredTickets.length} ticket(s)
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
