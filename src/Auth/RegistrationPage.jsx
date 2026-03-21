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
import { Eye, EyeOff, Mail, Lock, User, Phone, Store } from 'lucide-react'

const API = 'http://localhost:5001'


export default function RegistrationPage() {
  const { language } = useLanguage()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [role, setRole] = useState('host')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    business_name: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError(language === 'en' ? "Passwords don't match!" : 'पासवर्डहरू मेल खाँदैनन्!')
      return
    }
    if (role === 'vendor' && !formData.business_name.trim()) {
      setError(language === 'en' ? 'Business name is required for vendors.' : 'व्यापार नाम आवश्यक छ।')
      return
    }

    setIsLoading(true)
    try {
      const body = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role,
      }
      if (role === 'vendor') body.business_name = formData.business_name

      const res = await fetch(`${API}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Registration failed.')
        return
      }
      navigate('/login')
    } catch {
      setError('Could not connect to server.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field) => (e) =>
    setFormData((prev) => ({ ...prev, [field]: e.target.value }))

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
            {language === 'en' ? 'Create Your Account' : 'आफ्नो खाता सिर्जना गर्नुहोस्'}
          </h1>
          <p className="text-sm" style={{ color: '#8a6a52' }}>
            {language === 'en'
              ? 'Start planning perfect cultural events today'
              : 'आज सिद्ध सांस्कृतिक कार्यक्रमहरू योजना गर्न सुरु गर्नुहोस्'}
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
            <CardTitle style={{ color: '#2d1a0e' }}>{language === 'en' ? 'Sign Up' : 'साइन अप'}</CardTitle>
            <CardDescription>
              {language === 'en'
                ? 'Fill in your details to create your account'
                : 'आफ्नो खाता सिर्जना गर्न आफ्नो विवरणहरू भर्नुहोस्'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Role selector */}
              <div className="space-y-2">
                <Label>{language === 'en' ? 'I am a' : 'म हुँ'}</Label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('host')}
                    className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-md border text-sm font-medium transition-colors"
                    style={
                      role === 'host'
                        ? { background: '#C2570B', color: '#fff', borderColor: '#C2570B' }
                        : { background: 'transparent', borderColor: '#e5d5c8', color: '#8a6a52' }
                    }
                  >
                    <User className="h-4 w-4" />
                    {language === 'en' ? 'Event Host' : 'आयोजक'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('vendor')}
                    className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-md border text-sm font-medium transition-colors"
                    style={
                      role === 'vendor'
                        ? { background: '#C2570B', color: '#fff', borderColor: '#C2570B' }
                        : { background: 'transparent', borderColor: '#e5d5c8', color: '#8a6a52' }
                    }
                  >
                    <Store className="h-4 w-4" />
                    {language === 'en' ? 'Vendor' : 'विक्रेता'}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {language === 'en' ? 'Full Name' : 'पूरा नाम'}
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder={language === 'en' ? 'Enter your full name' : 'आफ्नो पूरा नाम लेख्नुहोस्'}
                  value={formData.name}
                  onChange={handleChange('name')}
                  required
                  disabled={isLoading}
                  style={{ background: 'rgba(255,255,255,0.7)' }}
                />
              </div>

              {role === 'vendor' && (
                <div className="space-y-2">
                  <Label htmlFor="business_name" className="flex items-center gap-2">
                    <Store className="h-4 w-4" />
                    {language === 'en' ? 'Business Name' : 'व्यापार नाम'}
                  </Label>
                  <Input
                    id="business_name"
                    type="text"
                    placeholder={language === 'en' ? 'Your business / company name' : 'तपाईंको व्यापार नाम'}
                    value={formData.business_name}
                    onChange={handleChange('business_name')}
                    required={role === 'vendor'}
                    disabled={isLoading}
                    style={{ background: 'rgba(255,255,255,0.7)' }}
                  />
                  <p className="text-xs text-muted-foreground">
                    {language === 'en'
                      ? 'Your application will be reviewed by admin before approval.'
                      : 'तपाईंको आवेदन स्वीकृतिको लागि व्यवस्थापकद्वारा समीक्षा गरिनेछ।'}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {language === 'en' ? 'Email' : 'इमेल'}
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={language === 'en' ? 'you@example.com' : 'तपाईं@example.com'}
                  value={formData.email}
                  onChange={handleChange('email')}
                  required
                  disabled={isLoading}
                  style={{ background: 'rgba(255,255,255,0.7)' }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {language === 'en' ? 'Phone Number' : 'फोन नम्बर'}
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder={language === 'en' ? 'Enter your phone number' : 'आफ्नो फोन नम्बर लेख्नुहोस्'}
                  value={formData.phone}
                  onChange={handleChange('phone')}
                  required
                  disabled={isLoading}
                  style={{ background: 'rgba(255,255,255,0.7)' }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  {language === 'en' ? 'Password' : 'पासवर्ड'}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={language === 'en' ? 'Create a strong password' : 'बलियो पासवर्ड बनाउनुहोस्'}
                    value={formData.password}
                    onChange={handleChange('password')}
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

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  {language === 'en' ? 'Confirm Password' : 'पासवर्ड पुष्टि गर्नुहोस्'}
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder={language === 'en' ? 'Re-enter your password' : 'आफ्नो पासवर्ड पुन: प्रविष्ट गर्नुहोस्'}
                    value={formData.confirmPassword}
                    onChange={handleChange('confirmPassword')}
                    required
                    disabled={isLoading}
                    style={{ background: 'rgba(255,255,255,0.7)' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
                  ? language === 'en' ? 'Creating Account...' : 'खाता सिर्जना हुँदैछ...'
                  : language === 'en' ? 'Create Account' : 'खाता बनाउनुहोस्'}
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
              {language === 'en' ? 'Already have an account?' : 'पहिले नै खाता छ?'}{' '}
              <Link to="/login" className="font-medium hover:underline" style={{ color: '#C2570B' }}>
                {language === 'en' ? 'Sign in' : 'साइन इन गर्नुहोस्'}
              </Link>
            </p>
          </CardFooter>
        </Card>

        <p className="text-center text-xs mt-6 leading-relaxed" style={{ color: '#9a7060' }}>
          {language === 'en'
            ? 'By creating an account, you agree to our Terms of Service and Privacy Policy'
            : 'खाता सिर्जना गरेर, तपाईं हाम्रो सेवा सर्तहरू र गोपनीयता नीतिमा सहमत हुनुहुन्छ'}
        </p>
      </div>
    </div>
  )
}
