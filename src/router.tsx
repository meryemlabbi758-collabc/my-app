import { createBrowserRouter } from "react-router-dom"
import Layout from "@/pages/_layout"
import HomePage from "@/pages/home"
import TicketsPage from "@/pages/tickets"
import TicketDetailPage from "@/pages/ticket-detail"
import ClientsPage from "@/pages/clients"
import ClientEnvironmentsPage from "@/pages/client-environments"
import TeamPage from "@/pages/team"
import AdminPage from "@/pages/admin"
import CalendarPage from "@/pages/calendar"
import NotFoundPage from "@/pages/not-found"

console.log('router.tsx loading')

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "tickets", element: <TicketsPage /> },
      { path: "tickets/:id", element: <TicketDetailPage /> },
      { path: "clients", element: <ClientsPage /> },
      { path: "clients/:id", element: <ClientEnvironmentsPage /> },
      { path: "team", element: <TeamPage /> },
      { path: "admin", element: <AdminPage /> },
      { path: "calendar", element: <CalendarPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
])

console.log('router created successfully')
