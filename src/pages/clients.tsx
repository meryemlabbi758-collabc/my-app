import { Card } from "@/components/ui/card"
import { Link } from "react-router-dom"
import { useClients } from "@/hooks/useDataverse"

export default function ClientsPage() {
  const { clients, loading } = useClients()

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Nos Clients</h2>
          <p className="text-muted-foreground">Chargement des clients...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }
  return (
    <div className="space-y-8">
      <section>
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Nos Clients</h2>
          <p className="text-muted-foreground">Sélectionnez un client pour voir les détails de build et version</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map((client) => (
            <Link key={client.id} to={`/clients/${client.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <div className="p-8 flex flex-col items-center justify-center gap-4 h-full min-h-[200px] group hover:bg-muted/50 transition-colors">
                  <div className="text-6xl">{client.logo}</div>
                  <h3 className="font-semibold text-center">{client.name}</h3>
                  <p className="text-xs text-muted-foreground text-center group-hover:text-foreground transition-colors">
                    Cliquez pour voir les détails →
                  </p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <div className="text-center text-xs text-muted-foreground py-4">
        <p>Sélectionnez un client pour afficher les informations de build et version</p>
      </div>
    </div>
  )
}
