import { useParams, Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { useClient, useEnvironments } from "@/hooks/useDataverse"

export default function ClientEnvironmentsPage() {
  const { id } = useParams<{ id: string }>()
  const { client } = useClient(id || null)
  const { environments: envMap, loading: envLoading } = useEnvironments(id || null)
  const environments = Object.entries(envMap).map(([envId, env]) => ({ id: envId, ...env }))

  if (!client) {
    return (
      <div className="space-y-4">
        <Link to="/clients">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to clients
          </Button>
        </Link>
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">Client not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <Link to="/clients">
        <Button variant="outline" size="sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to clients
        </Button>
      </Link>

      <section>
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="text-6xl">{client.logo}</div>
            <div>
              <h2 className="text-3xl font-bold">{client.name}</h2>
              <p className="text-muted-foreground mt-2">Select an environment</p>
            </div>
          </div>
        </div>

        {!envLoading && environments.length === 0 && (
          <p className="text-muted-foreground">No environment configured for this client.</p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {environments.map((env) => (
            <Link key={env.id} to={`/tickets?clientId=${client.id}&env=${env.id}`}>
              <Card className={`${env.color} transition-all cursor-pointer hover:shadow-lg h-full`}>
                <CardContent className="pt-8">
                  <div className="flex flex-col items-center justify-center gap-4 h-full min-h-[200px] group">
                    <div className="text-6xl">{env.icon}</div>
                    <h3 className="font-semibold text-lg">{env.name}</h3>
                    <p className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                      Click to view tickets →
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
