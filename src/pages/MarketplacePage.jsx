import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Card, CardContent } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { useLanguage } from '@/components/LanguageToggle.jsx'
import { useAuth } from '@/context/AuthContext.jsx'
import { Search, MapPin, Star, Phone, MessageSquare, X, CalendarDays, Send, CheckCircle } from 'lucide-react'

const API = 'http://localhost:5001'

const specializations = ['all', 'Newari', 'Brahmin', 'Thakuri', 'Corporate', 'Floral', 'Traditional', 'Modern', 'Luxury']

// ── Booking Inquiry Modal ─────────────────────────────────────────────────────
function BookingModal({ vendor, token, userRole, onClose }) {
  const [form, setForm] = useState({ event_date: '', event_location: '', notes: '' })
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')
    try {
      const res = await fetch(`${API}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ vendor_id: vendor.id, ...form }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to send inquiry.')
      setStatus('success')
    } catch (err) {
      setErrorMsg(err.message)
      setStatus('error')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-background rounded-xl border border-border shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border">
          <div>
            <h2 className="text-lg font-bold">Send Inquiry</h2>
            <p className="text-sm text-muted-foreground">{vendor.business_name}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          {/* Not logged in */}
          {!token && (
            <div className="text-center space-y-4 py-4">
              <MessageSquare className="h-10 w-10 mx-auto text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">Please sign in to send an inquiry to this vendor.</p>
              <Button asChild className="w-full">
                <Link to="/login" onClick={onClose}>Sign In</Link>
              </Button>
            </div>
          )}

          {/* Vendor or admin viewing */}
          {token && userRole !== 'host' && (
            <div className="text-center space-y-3 py-4">
              <p className="text-muted-foreground text-sm">Only event hosts can send booking inquiries.</p>
              <div className="text-sm space-y-1">
                <div className="flex items-center gap-2 justify-center text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  {vendor.phone || 'Phone not available'}
                </div>
              </div>
            </div>
          )}

          {/* Host — inquiry form */}
          {token && userRole === 'host' && status !== 'success' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  Event Date <span className="text-destructive">*</span>
                </label>
                <Input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={form.event_date}
                  onChange={(e) => setForm({ ...form, event_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Event Location
                </label>
                <Input
                  placeholder="e.g. Banquet Hall, Thamel, Kathmandu"
                  value={form.event_location}
                  onChange={(e) => setForm({ ...form, event_location: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Message to Vendor</label>
                <Textarea
                  placeholder="Describe your event requirements, expected guest count, cultural preferences..."
                  rows={4}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>
              {status === 'error' && (
                <p className="text-sm text-destructive">{errorMsg}</p>
              )}
              <div className="flex gap-2 pt-1">
                <Button type="button" variant="outline" className="flex-1 bg-transparent" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 gap-2" disabled={status === 'loading'}>
                  <Send className="h-4 w-4" />
                  {status === 'loading' ? 'Sending...' : 'Send Inquiry'}
                </Button>
              </div>
            </form>
          )}

          {/* Success state */}
          {status === 'success' && (
            <div className="text-center space-y-4 py-4">
              <CheckCircle className="h-12 w-12 mx-auto text-primary" />
              <div>
                <p className="font-semibold">Inquiry Sent!</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Your booking inquiry has been sent to {vendor.business_name}. They will be in touch soon.
                </p>
              </div>
              <Button className="w-full" onClick={onClose}>Done</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function MarketplacePage() {
  const { t } = useLanguage()
  const { user, token } = useAuth()

  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSpecialization, setSelectedSpecialization] = useState('all')
  const [inquiryVendor, setInquiryVendor] = useState(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setFetchError(null)
      try {
        const res = await fetch(`${API}/api/vendors`)
        if (!res.ok) throw new Error('Failed to load vendors.')
        setVendors(await res.json())
      } catch (e) {
        setFetchError(e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filteredVendors = vendors.filter((vendor) => {
    const q = searchQuery.toLowerCase()
    const matchesSearch =
      q === '' ||
      vendor.business_name?.toLowerCase().includes(q) ||
      vendor.description?.toLowerCase().includes(q) ||
      vendor.location?.toLowerCase().includes(q) ||
      vendor.services?.some((s) => s?.toLowerCase().includes(q))

    const matchesSpec =
      selectedSpecialization === 'all' ||
      vendor.specializations?.includes(selectedSpecialization)

    return matchesSearch && matchesSpec
  })

  return (
    <>
      {inquiryVendor && (
        <BookingModal
          vendor={inquiryVendor}
          token={token}
          userRole={user?.role}
          onClose={() => setInquiryVendor(null)}
        />
      )}

      {/* Hero Section */}
      <section className="bg-muted/20 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-balance">{t('marketplace_title')}</h1>
            <p className="text-lg text-muted-foreground leading-relaxed">{t('marketplace_subtitle')}</p>
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder={t('search_vendors_placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-base"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="border-b border-border bg-muted/30 py-6">
        <div className="container mx-auto px-4">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              {t('cultural_specialization')}
            </h3>
            <div className="flex flex-wrap gap-2">
              {specializations.map((spec) => (
                <Button
                  key={spec}
                  variant={selectedSpecialization === spec ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedSpecialization(spec)}
                  className={selectedSpecialization !== spec ? 'bg-transparent' : ''}
                >
                  {spec === 'all' ? t('all_vendors') : spec}
                </Button>
              ))}
            </div>
            <div className="text-sm text-muted-foreground">
              {loading ? 'Loading vendors...' : `${t('showing')} ${filteredVendors.length} ${t('of')} ${vendors.length} ${t('vendors_text')}`}
            </div>
          </div>
        </div>
      </section>

      {/* Vendors Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">

          {/* Loading skeleton */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="aspect-video bg-muted animate-pulse" />
                  <CardContent className="p-5 space-y-3">
                    <div className="h-5 bg-muted animate-pulse rounded w-3/4" />
                    <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
                    <div className="h-12 bg-muted animate-pulse rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Error */}
          {fetchError && !loading && (
            <div className="text-center py-16">
              <p className="text-destructive">{fetchError}</p>
              <Button variant="outline" className="mt-4 bg-transparent" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          )}

          {/* Vendor cards */}
          {!loading && !fetchError && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVendors.map((vendor) => (
                <Card key={vendor.id} className="border-2 hover:border-primary/50 transition-all overflow-hidden">
                  <div className="relative aspect-video bg-muted">
                    {vendor.image_url ? (
                      <img
                        src={vendor.image_url}
                        alt={vendor.business_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-4xl">
                        🏪
                      </div>
                    )}
                    {vendor.is_verified && (
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-primary text-primary-foreground">{t('verified')}</Badge>
                      </div>
                    )}
                  </div>

                  <CardContent className="p-5 space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-lg font-bold leading-tight">{vendor.business_name}</h3>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-primary text-primary" />
                          <span className="text-sm font-semibold">{Number(vendor.rating || 0).toFixed(1)}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">({vendor.total_reviews || 0} {t('reviews_label')})</span>
                      </div>
                      {vendor.location && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          {vendor.location}
                        </div>
                      )}
                    </div>

                    {vendor.specializations?.filter(Boolean).length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {vendor.specializations.filter(Boolean).map((spec) => (
                          <Badge key={spec} variant="secondary">{spec}</Badge>
                        ))}
                      </div>
                    )}

                    {vendor.description && (
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                        {vendor.description}
                      </p>
                    )}

                    {vendor.services?.filter(Boolean).length > 0 && (
                      <div className="space-y-1.5">
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          {t('services_label')}
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {vendor.services.filter(Boolean).map((service) => (
                            <span key={service} className="text-xs bg-muted px-2 py-1 rounded">
                              {service}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {vendor.price_range && (
                      <div className="pt-3 border-t border-border">
                        <div className="text-sm font-semibold text-primary">{vendor.price_range}</div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      {vendor.phone && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2 bg-transparent"
                          asChild
                        >
                          <a href={`tel:${vendor.phone}`}>
                            <Phone className="h-4 w-4" />
                            {t('call')}
                          </a>
                        </Button>
                      )}
                      <Button
                        size="sm"
                        className={`gap-2 ${!vendor.phone ? 'col-span-2' : ''}`}
                        onClick={() => setInquiryVendor(vendor)}
                      >
                        <MessageSquare className="h-4 w-4" />
                        {t('message')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!loading && !fetchError && filteredVendors.length === 0 && (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto space-y-4">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold">{t('no_vendors_found')}</h3>
                <p className="text-muted-foreground">
                  {vendors.length === 0
                    ? 'No approved vendors yet. Check back soon!'
                    : t('no_vendors_desc')}
                </p>
                {vendors.length > 0 && (
                  <Button onClick={() => { setSearchQuery(''); setSelectedSpecialization('all') }}>
                    {t('reset_filters')}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Become Vendor CTA */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <Card className="border-2 border-primary/50 bg-primary/5 max-w-3xl mx-auto">
            <CardContent className="pt-12 pb-12 text-center space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">{t('are_you_vendor')}</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                {t('vendor_cta_subtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button size="lg" className="text-base" asChild>
                  <Link to="/signup">{t('register_as_vendor')}</Link>
                </Button>
                <Button variant="outline" size="lg" className="text-base bg-transparent" asChild>
                  <Link to="/about">{t('learn_more')}</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  )
}
