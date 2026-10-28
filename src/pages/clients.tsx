import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { Card } from "@/components/ui/card"
import { useClients } from "@/hooks/useDataverse"

export default function ClientsPage() {
  const { clients, loading } = useClients()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Nos Clients</h1>
        <p className="text-sm text-muted-foreground">
          {loading ? "Chargement des clients..." : "Sélectionnez un client pour voir ses environnements"}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading
          ? [...Array(6)].map((_, i) => <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />)
          : clients.map((client) => (
              <Link key={client.id} to={`/clients/${client.id}`} className="group">
                <Card className="h-full py-0 transition-all group-hover:-translate-y-0.5 group-hover:border-primary group-hover:shadow-md">
                  <div className="flex items-center gap-4 p-5">
                    <div className="grid size-14 shrink-0 place-items-center rounded-xl bg-navy text-lg font-bold text-navy-foreground">
                      {client.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-semibold">{client.name}</h3>
                      <p className="text-xs text-muted-foreground">Voir les environnements</p>
                    </div>
                    <ArrowRight className="size-4 text-muted-foreground transition-colors group-hover:text-primary" />
                  </div>
                </Card>
              </Link>
            ))}
      </div>
    </div>
  )
}
