import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button.jsx'
import { LanguageToggle, useLanguage } from '@/components/LanguageToggle.jsx'
import { useTheme } from '@/components/ThemeProvider.jsx'
import { useAuth } from '@/context/AuthContext.jsx'
import { Menu, X, Sun, Moon, LogOut, ShieldCheck, User } from 'lucide-react'
import { cn } from '@/lib/utils.js'

export function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { t } = useLanguage()
  const { theme, toggleTheme } = useTheme()
  const { user, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { href: '/', label: t('home') },
    { href: '/about', label: t('about') },
    { href: '/designer', label: t('designer') },
    { href: '/marketplace', label: t('marketplace') },
    { href: '/help', label: t('help') },
  ]

  const handleLogout = () => {
    logout()
    navigate('/')
    setMobileMenuOpen(false)
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-md">
              <svg width="22" height="22" viewBox="0 0 20 20" fill="white" xmlns="http://www.w3.org/2000/svg">
                <rect x="9.3" y="0.5" width="1.4" height="2.5" rx="0.7"/>
                <polygon points="10,3 5.5,7.5 14.5,7.5"/>
                <rect x="8.5" y="7.5" width="3" height="2.5"/>
                <polygon points="10,10 3,15.5 17,15.5"/>
                <rect x="6" y="15.5" width="8" height="3" rx="1"/>
              </svg>
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-lg font-bold tracking-tight">
                <span className="text-primary">NEP</span>
                <span className="text-foreground">-Pro</span>
              </span>
              <span className="text-[9px] text-muted-foreground tracking-widest uppercase">Event Planner</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary',
                  location.pathname === item.href ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                {item.label}
              </Link>
            ))}
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary flex items-center gap-1',
                  location.pathname === '/admin' ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                <ShieldCheck className="h-4 w-4" />
                Admin
              </Link>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <LanguageToggle />

            {user ? (
              <div className="hidden md:flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium max-w-[120px] truncate">{user.name}</span>
                  <span className="text-xs text-muted-foreground capitalize bg-background px-1.5 py-0.5 rounded">
                    {user.role}
                  </span>
                </div>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-1">
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Button asChild variant="ghost" size="sm">
                  <Link to="/login">{t('login')}</Link>
                </Button>
                <Button asChild size="sm">
                  <Link to="/signup">{t('signup')}</Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              <span className="sr-only">Toggle menu</span>
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border py-4">
            <div className="flex flex-col gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'text-sm font-medium transition-colors hover:text-primary px-2 py-1',
                    location.pathname === item.href ? 'text-foreground' : 'text-muted-foreground',
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  className="text-sm font-medium text-muted-foreground hover:text-primary px-2 py-1 flex items-center gap-1"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <ShieldCheck className="h-4 w-4" />
                  Admin
                </Link>
              )}
              <div className="flex flex-col gap-2 pt-2 border-t border-border">
                {user ? (
                  <>
                    <div className="px-2 py-1 text-sm text-muted-foreground">
                      Signed in as <span className="font-medium text-foreground">{user.name}</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleLogout} className="justify-start gap-2">
                      <LogOut className="h-4 w-4" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button asChild variant="ghost" size="sm">
                      <Link to="/login" onClick={() => setMobileMenuOpen(false)}>{t('login')}</Link>
                    </Button>
                    <Button asChild size="sm">
                      <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>{t('signup')}</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
