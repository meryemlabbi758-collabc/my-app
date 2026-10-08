import { Outlet, NavLink } from "react-router-dom"
import { LayoutDashboard, TicketIcon, BarChart3, Users, Settings, Package } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"

type LayoutProps = { showHeader?: boolean }

export default function Layout({ showHeader = true }: LayoutProps) {
  const navItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard, path: "/" },
    { id: "tickets", label: "Tickets", icon: TicketIcon, path: "/tickets" },
    { id: "quality", label: "Quality", icon: BarChart3, path: "/quality" },
    { id: "raci", label: "RACI", icon: Users, path: "/raci" },
    { id: "settings", label: "Settings", icon: Settings, path: "/settings" },
    { id: "deliverables", label: "Deliverables", icon: Package, path: "/deliverables" },
  ]

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div className="w-32 border-r bg-muted/30 flex flex-col items-center py-8 space-y-6">
        {/* DXC Logo */}
        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
          <span className="text-3xl font-bold text-white">DXC</span>
        </div>

        {/* Navigation */}
        <nav className="w-full px-3 space-y-3">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.id}
                to={item.path}
                end={item.path === "/"}
                className={({ isActive }) =>
                  `w-full p-3 rounded-lg flex flex-col items-center gap-2 transition-all ${
                    isActive
                      ? "bg-white dark:bg-slate-800 shadow-md"
                      : "hover:bg-white/50 dark:hover:bg-slate-700/50"
                  }`
                }
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs font-medium text-center">{item.label}</span>
              </NavLink>
            )
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {showHeader && (
          <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
            <div className="px-8 py-4 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Welcome back, Meryem Lebbi 👋</h1>
                <p className="text-sm text-muted-foreground mt-1">Here's what's happening with your deliverables today.</p>
              </div>
              <ModeToggle />
            </div>
          </header>
        )}

        <main className="flex-1 overflow-auto">
          <div className="p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}