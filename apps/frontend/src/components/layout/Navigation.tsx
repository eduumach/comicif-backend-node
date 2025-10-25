import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Link, useLocation } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import ThemeToggle from "@/components/ThemeToggle"
import { Home, ImageIcon, Palette, Sparkles, LogIn, LogOut, Menu, X, Dices, Camera } from "lucide-react"

export default function Navigation() {
  const location = useLocation()
  const { isAuthenticated, isAdmin, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isActive = (path: string) => location.pathname === path

  const closeMobileMenu = () => setMobileMenuOpen(false)

  // Don't show nav on login page
  if (location.pathname === '/login') {
    return null
  }

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex h-14 sm:h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 min-h-[44px]" onClick={closeMobileMenu}>
            <Palette className="h-5 w-5 sm:h-6 sm:w-6" />
            <span className="font-bold text-lg sm:text-xl">ComicIF</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Button
              variant={isActive('/') || isActive('/gallery') ? 'default' : 'ghost'}
              size="sm"
              asChild
            >
              <Link to="/">
                <ImageIcon className="h-4 w-4 mr-2" />
                Galeria
              </Link>
            </Button>

            {/* <Button
              variant={isActive('/home') ? 'default' : 'ghost'}
              size="sm"
              asChild
            >
              <Link to="/home">
                <Home className="h-4 w-4 mr-2" />
                Sobre
              </Link>
            </Button> */}

            {isAdmin && (
              <Button
                variant={isActive('/roulette') ? 'default' : 'ghost'}
                size="sm"
                asChild
              >
                <Link to="/roulette">
                  <Dices className="h-4 w-4 mr-2" />
                  Roleta
                </Link>
              </Button>
            )}

            {isAuthenticated && (
              <>
                <Button
                  variant={isActive('/original-photos') ? 'default' : 'ghost'}
                  size="sm"
                  asChild
                >
                  <Link to="/original-photos">
                    <Camera className="h-4 w-4 mr-2" />
                    Fotos
                  </Link>
                </Button>

                {isAdmin && (
                  <>
                    <Button
                      variant={isActive('/admin/prompts') ? 'default' : 'ghost'}
                      size="sm"
                      asChild
                    >
                      <Link to="/admin/prompts">
                        <Sparkles className="h-4 w-4 mr-2" />
                        Prompts
                      </Link>
                    </Button>

                    <Button
                      variant={isActive('/admin/generate') ? 'default' : 'ghost'}
                      size="sm"
                      asChild
                    >
                      <Link to="/admin/generate">
                        <Palette className="h-4 w-4 mr-2" />
                        Gerar
                      </Link>
                    </Button>
                  </>
                )}
              </>
            )}

            <div className="border-l pl-4 flex items-center space-x-2">
              <ThemeToggle />
              {isAuthenticated ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                >
                  <Link to="/login">
                    <LogIn className="h-4 w-4 mr-2" />
                    Entrar
                  </Link>
                </Button>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              className="h-11 w-11 p-0"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-background/95 backdrop-blur">
            <div className="px-2 pt-2 pb-3 space-y-1.5">
              <Button
                variant={isActive('/') || isActive('/gallery') ? 'default' : 'ghost'}
                size="sm"
                asChild
                className="w-full justify-start h-12 text-base"
              >
                <Link to="/" onClick={closeMobileMenu}>
                  <ImageIcon className="h-5 w-5 mr-3" />
                  Galeria
                </Link>
              </Button>

              {/* <Button
                variant={isActive('/home') ? 'default' : 'ghost'}
                size="sm"
                asChild
                className="w-full justify-start h-12 text-base"
              >
                <Link to="/home" onClick={closeMobileMenu}>
                  <Home className="h-5 w-5 mr-3" />
                  Sobre
                </Link>
              </Button> */}

              {isAdmin && (
                <Button
                  variant={isActive('/roulette') ? 'default' : 'ghost'}
                  size="sm"
                  asChild
                  className="w-full justify-start h-12 text-base"
                >
                  <Link to="/roulette" onClick={closeMobileMenu}>
                    <Dices className="h-5 w-5 mr-3" />
                    Roleta
                  </Link>
                </Button>
              )}

              {isAuthenticated && (
                <>
                  <Button
                    variant={isActive('/original-photos') ? 'default' : 'ghost'}
                    size="sm"
                    asChild
                    className="w-full justify-start h-12 text-base"
                  >
                    <Link to="/original-photos" onClick={closeMobileMenu}>
                      <Camera className="h-5 w-5 mr-3" />
                      Fotos
                    </Link>
                  </Button>

                  {isAdmin && (
                    <>
                      <Button
                        variant={isActive('/admin/prompts') ? 'default' : 'ghost'}
                        size="sm"
                        asChild
                        className="w-full justify-start h-12 text-base"
                      >
                        <Link to="/admin/prompts" onClick={closeMobileMenu}>
                          <Sparkles className="h-5 w-5 mr-3" />
                          Prompts
                        </Link>
                      </Button>

                      <Button
                        variant={isActive('/admin/generate') ? 'default' : 'ghost'}
                        size="sm"
                        asChild
                        className="w-full justify-start h-12 text-base"
                      >
                        <Link to="/admin/generate" onClick={closeMobileMenu}>
                          <Palette className="h-5 w-5 mr-3" />
                          Gerar
                        </Link>
                      </Button>
                    </>
                  )}
                </>
              )}

              <div className="border-t pt-2 mt-2">
                {isAuthenticated ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      logout()
                      closeMobileMenu()
                    }}
                    className="w-full justify-start h-12 text-base"
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    Sair
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="w-full justify-start h-12 text-base"
                  >
                    <Link to="/login" onClick={closeMobileMenu}>
                      <LogIn className="h-5 w-5 mr-3" />
                      Entrar
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