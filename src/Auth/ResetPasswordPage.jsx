import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { useLanguage } from '@/components/LanguageToggle.jsx'
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react'

const API = 'http://localhost:5001'

export default function ResetPasswordPage() {
  const { language } = useLanguage()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <p className="text-destructive font-medium">
            {language === 'en' ? 'Invalid or missing reset token.' : 'अमान्य वा हराएको रिसेट टोकन।'}
          </p>
          <Link to="/forgot-password" className="text-sm hover:underline" style={{ color: '#C2570B' }}>
            {language === 'en' ? 'Request a new reset link' : 'नयाँ रिसेट लिंक अनुरोध गर्नुहोस्'}
          </Link>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (password !== confirm) {
      setError(language === 'en' ? 'Passwords do not match.' : 'पासवर्डहरू मेल खाँदैनन्।')
      return
    }
    if (password.length < 6) {
      setError(language === 'en' ? 'Password must be at least 6 characters.' : 'पासवर्ड कम्तीमा ६ वर्णको हुनुपर्छ।')
      return
    }
    setIsLoading(true)
    try {
      const res = await fetch(`${API}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Something went wrong.'); return }
      setSuccess(true)
      setTimeout(() => navigate('/login'), 3000)
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
            {language === 'en' ? 'Set New Password' : 'नयाँ पासवर्ड सेट गर्नुहोस्'}
          </h1>
        </div>

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
            <CardTitle style={{ color: '#2d1a0e' }}>
              {language === 'en' ? 'New Password' : 'नयाँ पासवर्ड'}
            </CardTitle>
            <CardDescription>
              {language === 'en'
                ? 'Choose a strong password for your account'
                : 'आफ्नो खाताको लागि बलियो पासवर्ड छान्नुहोस्'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {success ? (
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <CheckCircle className="h-12 w-12" style={{ color: '#C2570B' }} />
                <p className="font-medium" style={{ color: '#2d1a0e' }}>
                  {language === 'en' ? 'Password reset successfully!' : 'पासवर्ड सफलतापूर्वक रिसेट भयो!'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {language === 'en'
                    ? 'Redirecting you to sign in...'
                    : 'साइन इनमा रिडाइरेक्ट गर्दैछ...'}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    {language === 'en' ? 'New Password' : 'नयाँ पासवर्ड'}
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder={language === 'en' ? 'At least 6 characters' : 'कम्तीमा ६ वर्ण'}
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
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm" className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    {language === 'en' ? 'Confirm Password' : 'पासवर्ड पुष्टि गर्नुहोस्'}
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirm"
                      type={showConfirm ? 'text' : 'password'}
                      placeholder={language === 'en' ? 'Repeat your password' : 'आफ्नो पासवर्ड दोहोर्याउनुहोस्'}
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      required
                      disabled={isLoading}
                      style={{ background: 'rgba(255,255,255,0.7)' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
                    ? (language === 'en' ? 'Resetting...' : 'रिसेट गर्दैछ...')
                    : (language === 'en' ? 'Reset Password' : 'पासवर्ड रिसेट गर्नुहोस्')}
                </Button>
              </form>
            )}
          </CardContent>

          {!success && (
            <CardFooter className="flex justify-center">
              <Link to="/login" className="text-sm hover:underline" style={{ color: '#C2570B' }}>
                {language === 'en' ? 'Back to Sign In' : 'साइन इनमा फर्कनुहोस्'}
              </Link>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  )
}
