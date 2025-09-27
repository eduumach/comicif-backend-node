import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Link, useLocation } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { Home, ImageIcon, Palette, Sparkles, LogIn, LogOut, Menu, X } from "lucide-react"

export default function Navigation() {
  const location = useLocation()
  const { isAuthenticated, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isActive = (path: string) => location.pathname === path

  const closeMobileMenu = () => setMobileMenuOpen(false)

  // Don't show nav on login page
  if (location.pathname === '/login') {
    return null
  }

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2" onClick={closeMobileMenu}>
            <Palette className="h-6 w-6" />
            <span className="font-bold text-xl">ComicIF</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
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

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden h-10 w-10 p-0"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-background/95 backdrop-blur">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Button
                variant={isActive('/') ? 'default' : 'ghost'}
                size="sm"
                asChild
                className="w-full justify-start h-12"
              >
                <Link to="/" onClick={closeMobileMenu}>
                  <Home className="h-5 w-5 mr-3" />
                  Home
                </Link>
              </Button>

              <Button
                variant={isActive('/prompts') ? 'default' : 'ghost'}
                size="sm"
                asChild
                className="w-full justify-start h-12"
              >
                <Link to="/prompts" onClick={closeMobileMenu}>
                  <Sparkles className="h-5 w-5 mr-3" />
                  Prompts
                </Link>
              </Button>

              <Button
                variant={isActive('/gallery') ? 'default' : 'ghost'}
                size="sm"
                asChild
                className="w-full justify-start h-12"
              >
                <Link to="/gallery" onClick={closeMobileMenu}>
                  <ImageIcon className="h-5 w-5 mr-3" />
                  Gallery
                </Link>
              </Button>

              <Button
                variant={isActive('/generate') ? 'default' : 'ghost'}
                size="sm"
                asChild
                className="w-full justify-start h-12"
              >
                <Link to="/generate" onClick={closeMobileMenu}>
                  <Palette className="h-5 w-5 mr-3" />
                  Generate
                </Link>
              </Button>

              <div className="border-t pt-2 mt-2">
                {isAuthenticated ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      logout()
                      closeMobileMenu()
                    }}
                    className="w-full justify-start h-12"
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    Logout
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="w-full justify-start h-12"
                  >
                    <Link to="/login" onClick={closeMobileMenu}>
                      <LogIn className="h-5 w-5 mr-3" />
                      Login
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}