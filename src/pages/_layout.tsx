import { Outlet, NavLink } from "react-router-dom"
import { LayoutDashboard, TicketIcon, Building2, Users, Settings, CalendarDays } from "lucide-react"
import { ModeToggle } from "@/components/mode-toggle"
import { useCurrentUserName } from "@/hooks/useDataverse"
import deltaLogo from "@/assets/delta-request-logo.png"

const navItems = [
  { label: "Overview", icon: LayoutDashboard, path: "/", end: true },
  { label: "Clients", icon: Building2, path: "/clients", end: false },
  { label: "Calendar", icon: CalendarDays, path: "/calendar", end: false },
  { label: "Team", icon: Users, path: "/team", end: false },
  { label: "Admin", icon: Settings, path: "/admin", end: false },
  { label: "Tickets", icon: TicketIcon, path: "/tickets", end: false },
]

export default function Layout() {
  const userName = useCurrentUserName()
  const initials =
    userName
      .split(/[\s._-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0].toUpperCase())
      .join("") || "?"

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-40 bg-navy text-navy-foreground shadow-sm">
        <div className="mx-auto flex h-14 w-full max-w-7xl items-center gap-8 px-6">
          <img src={deltaLogo} alt="Delta Delivery Request" className="h-12 w-auto" />

          <nav className="flex items-center gap-1">
            {navItems.map(({ label, icon: Icon, path, end }) => (
              <NavLink
                key={path}
                to={path}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-white/65 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                <Icon className="size-4" />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <ModeToggle />
            <div
              className="grid size-8 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground"
              title={userName}
            >
              {initials}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-8">
        <Outlet />
      </main>
    </div>
  )
}
