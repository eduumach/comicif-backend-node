import { Outlet } from "react-router-dom"
import Navigation from "./Navigation"

export default function Layout() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <Outlet />
      </main>
    </div>
  )
}