import { Button } from "@/components/ui/button"
import { Link, useLocation } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { Home, ImageIcon, Palette, Sparkles, LogIn, LogOut } from "lucide-react"

export default function Navigation() {
  const location = useLocation()
  const { isAuthenticated, logout } = useAuth()

  const isActive = (path: string) => location.pathname === path

  // Don't show nav on login page
  if (location.pathname === '/login') {
    return null
  }

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <Palette className="h-6 w-6" />
            <span className="font-bold text-xl">ComicIF</span>
          </Link>

          <div className="flex items-center space-x-4">
            <Button
              variant={isActive('/') ? 'default' : 'ghost'}
              size="sm"
              asChild
            >
              <Link to="/">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Link>
            </Button>

            <Button
              variant={isActive('/prompts') ? 'default' : 'ghost'}
              size="sm"
              asChild
            >
              <Link to="/prompts">
                <Sparkles className="h-4 w-4 mr-2" />
                Prompts
              </Link>
            </Button>

            <Button
              variant={isActive('/gallery') ? 'default' : 'ghost'}
              size="sm"
              asChild
            >
              <Link to="/gallery">
                <ImageIcon className="h-4 w-4 mr-2" />
                Gallery
              </Link>
            </Button>

            <Button
              variant={isActive('/generate') ? 'default' : 'ghost'}
              size="sm"
              asChild
            >
              <Link to="/generate">
                <Palette className="h-4 w-4 mr-2" />
                Generate
              </Link>
            </Button>

            <div className="border-l pl-4">
              {isAuthenticated ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                >
                  <Link to="/login">
                    <LogIn className="h-4 w-4 mr-2" />
                    Login
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}