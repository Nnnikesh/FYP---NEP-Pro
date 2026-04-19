import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card.jsx'
import { useLanguage } from '@/components/LanguageToggle.jsx'
import { useAuth } from '@/context/AuthContext.jsx'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'

const API = 'http://localhost:5001'


export default function LoginPage() {
  const { language } = useLanguage()
  const { login } = useAuth()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Login failed.')
        return
      }

      login(data.user, data.token)

      if (data.user.role === 'admin') navigate('/admin')
      else if (data.user.role === 'vendor') navigate('/dashboard/vendor')
      else navigate('/')
    } catch {
      setError('Could not connect to server.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundImage: 'url("/luxury-floral.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
      }}
    >
      <div className="w-full max-w-md">
        {/* Logo + heading */}
        <div className="text-center mb-8 space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-12 w-12 rounded-lg flex items-center justify-center" style={{ background: '#C2570B' }}>
              <span className="text-white font-bold text-xl">NP</span>
            </div>
            <div className="text-left">
              <div className="text-2xl font-bold" style={{ color: '#C2570B' }}>NEP</div>
              <div className="text-xs -mt-1" style={{ color: '#9a6040' }}>PRO</div>
            </div>
          </div>
          <h1 className="text-2xl font-bold" style={{ color: '#2d1a0e' }}>
            {language === 'en' ? 'Welcome Back' : 'स्वागत छ'}
          </h1>
          <p className="text-sm" style={{ color: '#8a6a52' }}>
            {language === 'en'
              ? 'Sign in to continue planning your perfect event'
              : 'आफ्नो सिद्ध कार्यक्रम योजना जारी राख्न साइन इन गर्नुहोस्'}
          </p>
        </div>

        {/* Card */}
        <Card
          style={{
            background: 'rgba(255, 255, 255, 0.87)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(194, 87, 11, 0.15)',
            boxShadow: '0 8px 32px rgba(194, 87, 11, 0.1)',
          }}
        >
          <CardHeader>
            <CardTitle style={{ color: '#2d1a0e' }}>{language === 'en' ? 'Sign In' : 'साइन इन'}</CardTitle>
            <CardDescription>
              {language === 'en'
                ? 'Enter your credentials to access your account'
                : 'आफ्नो खाता पहुँच गर्न आफ्नो प्रमाणहरू प्रविष्ट गर्नुहोस्'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {language === 'en' ? 'Email' : 'इमेल'}
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={language === 'en' ? 'you@example.com' : 'तपाईं@example.com'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  style={{ background: 'rgba(255,255,255,0.7)' }}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    {language === 'en' ? 'Password' : 'पासवर्ड'}
                  </Label>
                  <Link
                    to="/forgot-password"
                    className="text-xs hover:underline"
                    style={{ color: '#C2570B' }}
                  >
                    {language === 'en' ? 'Forgot password?' : 'पासवर्ड भुल्नुभयो?'}
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={language === 'en' ? 'Enter your password' : 'आफ्नो पासवर्ड प्रविष्ट गर्नुहोस्'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    style={{ background: 'rgba(255,255,255,0.7)' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && <p className="text-sm text-destructive text-center">{error}</p>}

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
                style={{ background: '#C2570B', color: '#fff' }}
              >
                {isLoading
                  ? language === 'en' ? 'Signing in...' : 'साइन इन हुँदैछ...'
                  : language === 'en' ? 'Sign In' : 'साइन इन गर्नुहोस्'}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" style={{ borderColor: 'rgba(194,87,11,0.2)' }} />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="px-2 text-muted-foreground" style={{ background: 'rgba(255,255,255,0.87)' }}>
                  {language === 'en' ? 'or' : 'वा'}
                </span>
              </div>
            </div>
            <p className="text-center text-sm text-muted-foreground">
              {language === 'en' ? "Don't have an account?" : 'खाता छैन?'}{' '}
              <Link to="/signup" className="font-medium hover:underline" style={{ color: '#C2570B' }}>
                {language === 'en' ? 'Sign up' : 'साइन अप गर्नुहोस्'}
              </Link>
            </p>
          </CardFooter>
        </Card>

        <p className="text-center text-xs mt-6 leading-relaxed" style={{ color: '#9a7060' }}>
          {language === 'en'
            ? 'By signing in, you agree to our Terms of Service and Privacy Policy'
            : 'साइन इन गरेर, तपाईं हाम्रो सेवा सर्तहरू र गोपनीयता नीतिमा सहमत हुनुहुन्छ'}
        </p>
      </div>
    </div>
  )
}
