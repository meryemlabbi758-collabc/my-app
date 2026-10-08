import { useParams, Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Copy } from "lucide-react"
import { toast } from "sonner"

interface Client {
  id: string
  name: string
  logo: string
  buildId: string
  fixVersion: string
}

const clientsData: Record<string, Client> = {
  federal: {
    id: "federal",
    name: "FEDERAL",
    logo: "🏛️",
    buildId: "BUILD-2024-FEDERAL-001",
    fixVersion: "v1.2.3"
  },
  argenta: {
    id: "argenta",
    name: "Argenta",
    logo: "🏦",
    buildId: "BUILD-2024-ARGENTA-001",
    fixVersion: "v2.1.0"
  },
  irpauto: {
    id: "irpauto",
    name: "IRP Auto",
    logo: "🚗",
    buildId: "BUILD-2024-IRPAUTO-001",
    fixVersion: "v3.0.5"
  },
  anvzn: {
    id: "anvzn",
    name: "ANVZN",
    logo: "🎯",
    buildId: "BUILD-2024-ANVZN-001",
    fixVersion: "v1.5.2"
  },
  baloise: {
    id: "baloise",
    name: "Baloise",
    logo: "🛡️",
    buildId: "BUILD-2024-BALOISE-001",
    fixVersion: "v2.3.1"
  },
  cardif: {
    id: "cardif",
    name: "CARDIF",
    logo: "💳",
    buildId: "BUILD-2024-CARDIF-001",
    fixVersion: "v1.8.0"
  }
}

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const client = id ? clientsData[id] : null

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

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copié!`)
  }

  return (
    <div className="space-y-6">
      <Link to="/clients">
        <Button variant="outline" size="sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour aux clients
        </Button>
      </Link>

      <section>
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-8xl">{client.logo}</div>
            <div>
              <h2 className="text-4xl font-bold">{client.name}</h2>
              <p className="text-muted-foreground mt-2">Détails de build et version</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Build ID Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Build ID</CardTitle>
              <CardDescription>Identifiant unique du build</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg font-mono text-sm break-all">
                {client.buildId}
              </div>
              <Button
                onClick={() => copyToClipboard(client.buildId, "Build ID")}
                variant="outline"
                size="sm"
                className="w-full"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copier Build ID
              </Button>
            </CardContent>
          </Card>

          {/* Fix Version Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Version Fix</CardTitle>
              <CardDescription>Version de correction actuelle</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg font-mono text-sm break-all">
                {client.fixVersion}
              </div>
              <Button
                onClick={() => copyToClipboard(client.fixVersion, "Version Fix")}
                variant="outline"
                size="sm"
                className="w-full"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copier Version Fix
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Additional Info */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Informations Supplémentaires</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Identifiant Client</p>
                <p className="font-mono">{client.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Nom du Client</p>
                <p className="font-semibold">{client.name}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
