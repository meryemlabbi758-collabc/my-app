import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TicketIcon, BarChart3, Package, ChevronRight, Loader } from "lucide-react"
import { Link } from "react-router-dom"
import { initializeDataverseTables, addSampleData } from "@/services/dataverse-init"

export default function HomePage() {
  const [initLoading, setInitLoading] = useState(false)
  const [initDone, setInitDone] = useState(false)

  const handleInitDataverse = async () => {
    setInitLoading(true)
    try {
      const success = await initializeDataverseTables()
      if (success) {
        await addSampleData()
        setInitDone(true)
      }
    } finally {
      setInitLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Main Section */}
      <section>
        <div className="mb-6">
          <h2 className="text-3xl font-bold mb-2">Power Apps Dashboard</h2>
          <p className="text-muted-foreground">Track and manage your application development and deployment</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Dataverse Connection Card */}
          <Card className={`hover:shadow-lg transition-shadow ${initDone ? 'border-green-500 bg-green-50 dark:bg-green-950' : ''}`}>
            <CardHeader>
              <CardTitle>Dataverse Connection</CardTitle>
              <CardDescription>Initialize and manage your Dataverse tables</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {initDone
                  ? '✅ Dataverse tables initialized successfully!'
                  : 'Create tables and sample data in your Dataverse environment'}
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={handleInitDataverse}
                  disabled={initLoading || initDone}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {initLoading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                  {initDone ? 'Initialized' : 'Initialize Dataverse'}
                </Button>
                <Button variant="outline">Learn More</Button>
              </div>
            </CardContent>
          </Card>

          {/* Development Status Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Development Status</CardTitle>
              <CardDescription>Current project metrics and progress</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span className="font-medium">45%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: "45%" }}></div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Continue building your application components
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-4">
          <Link to="/clients">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer group h-full">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center">
                    <span className="text-lg">🏢</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-indigo-600 transition-colors" />
                </div>
                <h3 className="font-semibold mb-1">Nos Clients</h3>
                <p className="text-sm text-muted-foreground">Voir les détails des clients</p>
                <Button className="mt-4 w-full" variant="outline">
                  Voir Clients →
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link to="/tickets">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer group h-full">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <TicketIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-blue-600 transition-colors" />
                </div>
                <h3 className="font-semibold mb-1">Browse Tickets</h3>
                <p className="text-sm text-muted-foreground">View and manage your delivery tickets</p>
                <Button className="mt-4 w-full" variant="outline">
                  Browse Tickets →
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-purple-600 transition-colors" />
              </div>
              <h3 className="font-semibold mb-1">Deployment Overview</h3>
              <p className="text-sm text-muted-foreground">Check deployment status and logs</p>
              <Button className="mt-4 w-full" variant="outline">
                Open Overview →
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-green-600" />
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-green-600 transition-colors" />
              </div>
              <h3 className="font-semibold mb-1">Deliverables</h3>
              <p className="text-sm text-muted-foreground">Track project deliverables and timeline</p>
              <Button className="mt-4 w-full" variant="outline">
                View Deliverables →
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer Text */}
      <div className="text-center text-xs text-muted-foreground py-4">
        <p>Secure. Reliable. Always. • Power Platform Dashboard</p>
      </div>
    </div>
  )
}