import { useParams, Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { useClient } from "@/hooks/useDataverse"

const environments = [
  { id: "prod", name: "PROD", color: "bg-red-100 dark:bg-red-900 hover:bg-red-200", icon: "🔴" },
  { id: "pprod", name: "PPROD", color: "bg-yellow-100 dark:bg-yellow-900 hover:bg-yellow-200", icon: "🟡" },
  { id: "uat1", name: "UAT1", color: "bg-blue-100 dark:bg-blue-900 hover:bg-blue-200", icon: "🔵" },
  { id: "hfprd", name: "HFPRD", color: "bg-green-100 dark:bg-green-900 hover:bg-green-200", icon: "🟢" }
]

export default function ClientEnvironmentsPage() {
  const { id } = useParams<{ id: string }>()
  const { client } = useClient(id || null)

  if (!client) {
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
            <p className="text-destructive">Client non trouvé</p>
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
          Retour aux clients
        </Button>
      </Link>

      <section>
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="text-6xl">{client.logo}</div>
            <div>
              <h2 className="text-3xl font-bold">{client.name}</h2>
              <p className="text-muted-foreground mt-2">Sélectionnez un environnement</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {environments.map((env) => (
            <Link key={env.id} to={`/tickets?clientId=${client.id}&env=${env.id}`}>
              <Card className={`${env.color} transition-all cursor-pointer hover:shadow-lg h-full`}>
                <CardContent className="pt-8">
                  <div className="flex flex-col items-center justify-center gap-4 h-full min-h-[200px] group">
                    <div className="text-6xl">{env.icon}</div>
                    <h3 className="font-semibold text-lg">{env.name}</h3>
                    <p className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                      Cliquez pour voir les tickets →
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
