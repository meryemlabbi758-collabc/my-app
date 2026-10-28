import { RouterProvider } from "react-router-dom"
import { router } from "@/router"
import { ThemeProvider } from "@/providers/theme-provider"

export default function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <RouterProvider router={router} />
    </ThemeProvider>
  )
}
