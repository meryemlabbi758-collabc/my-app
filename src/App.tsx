import { RouterProvider } from "react-router-dom"
import { router } from "@/router"

console.log('App rendering with router')

export default function App() {
  return (
    <div style={{ backgroundColor: 'white', minHeight: '100vh' }}>
      <RouterProvider router={router} />
    </div>
  )
}
