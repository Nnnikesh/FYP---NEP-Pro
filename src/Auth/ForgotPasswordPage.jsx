import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { useLanguage } from '@/components/LanguageToggle.jsx'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'

const API = 'http://localhost:5001'

export default function ForgotPasswordPage() {
  const { language } = useLanguage()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      const res = await fetch(`${API}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Something went wrong.'); return }
      setSent(true)
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
            {language === 'en' ? 'Forgot Password' : 'पासवर्ड भुल्नुभयो'}
          </h1>
          <p className="text-sm" style={{ color: '#8a6a52' }}>
            {language === 'en'
              ? "Enter your email and we'll send you a reset link"
              : 'आफ्नो इमेल प्रविष्ट गर्नुहोस् र हामी तपाईंलाई रिसेट लिंक पठाउनेछौं'}
          </p>
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
              {language === 'en' ? 'Reset Password' : 'पासवर्ड रिसेट'}
            </CardTitle>
            <CardDescription>
              {language === 'en'
                ? "We'll email you a secure link to reset your password"
                : 'हामी तपाईंको पासवर्ड रिसेट गर्न एक सुरक्षित लिंक इमेल गर्नेछौं'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {sent ? (
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <CheckCircle className="h-12 w-12" style={{ color: '#C2570B' }} />
                <p className="font-medium" style={{ color: '#2d1a0e' }}>
                  {language === 'en' ? 'Check your email!' : 'आफ्नो इमेल जाँच गर्नुहोस्!'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {language === 'en'
                    ? `If ${email} is registered, you'll receive a reset link shortly. Check your spam folder too.`
                    : `यदि ${email} दर्ता छ भने, तपाईंले चाँडै रिसेट लिंक प्राप्त गर्नुहुनेछ।`}
                </p>
              </div>
            ) : (
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

                {error && <p className="text-sm text-destructive text-center">{error}</p>}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                  style={{ background: '#C2570B', color: '#fff' }}
                >
                  {isLoading
                    ? (language === 'en' ? 'Sending...' : 'पठाउँदैछ...')
                    : (language === 'en' ? 'Send Reset Link' : 'रिसेट लिंक पठाउनुहोस्')}
                </Button>
              </form>
            )}
          </CardContent>

          <CardFooter className="flex justify-center">
            <Link
              to="/login"
              className="flex items-center gap-1 text-sm hover:underline"
              style={{ color: '#C2570B' }}
            >
              <ArrowLeft className="h-4 w-4" />
              {language === 'en' ? 'Back to Sign In' : 'साइन इनमा फर्कनुहोस्'}
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
