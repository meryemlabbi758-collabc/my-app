import { createBrowserRouter } from "react-router-dom"
import Layout from "@/pages/_layout"
import HomePage from "@/pages/home"
import TicketsPage from "@/pages/tickets"
import TicketDetailPage from "@/pages/ticket-detail"
import ClientsPage from "@/pages/clients"
import ClientEnvironmentsPage from "@/pages/client-environments"
import NotFoundPage from "@/pages/not-found"

console.log('router.tsx loading')

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout showHeader={true} />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "tickets", element: <TicketsPage /> },
      { path: "tickets/:id", element: <TicketDetailPage /> },
      { path: "clients", element: <ClientsPage /> },
      { path: "clients/:id", element: <ClientEnvironmentsPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
])

console.log('router created successfully')
