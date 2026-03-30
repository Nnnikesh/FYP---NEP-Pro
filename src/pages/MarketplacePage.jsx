import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Card, CardContent } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { useLanguage } from '@/components/LanguageToggle.jsx'
import { useAuth } from '@/context/AuthContext.jsx'
import {
  Search, MapPin, Star, Phone, MessageSquare,
  X, CalendarDays, Send, CheckCircle, ExternalLink,
  ChevronDown, ChevronRight,
} from 'lucide-react'
import { EVENT_CATEGORIES, EVENT_TYPES } from '@/lib/eventCategories.js'

const API = 'http://localhost:5001'

// ── Subcategory Popup ─────────────────────────────────────────────────────────
function SubcategoryPopup({ eventType, onSelect, onClose }) {
  const ref = useRef(null)
  const subcategories = EVENT_CATEGORIES[eventType] || []

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center pt-[180px] px-4 bg-black/40 backdrop-blur-sm">
      <div
        ref={ref}
        className="bg-background rounded-2xl border border-border shadow-2xl w-full max-w-md overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border">
          <div>
            <h2 className="text-lg font-bold">{eventType}</h2>
            <p className="text-sm text-muted-foreground">Select a decoration type</p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors rounded-full p-1 hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Subcategory list */}
        <div className="p-3">
          {/* "All in <eventType>" option */}
          <button
            onClick={() => onSelect(null)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-left hover:bg-primary/10 hover:text-primary transition-colors group mb-1"
          >
            <span className="font-medium">All {eventType} vendors</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
          </button>

          <div className="h-px bg-border my-2" />

          {subcategories.map((sub) => (
            <button
              key={sub}
              onClick={() => onSelect(sub)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-left hover:bg-primary/10 hover:text-primary transition-colors group"
            >
              <span className="text-sm font-medium">{sub}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Booking Inquiry Modal ─────────────────────────────────────────────────────
function BookingModal({ vendor, token, userRole, onClose }) {
  const [form, setForm] = useState({ event_date: '', event_location: '', notes: '' })
  const [status, setStatus] = useState('idle')
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
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border">
          <div>
            <h2 className="text-lg font-bold">Send Inquiry</h2>
            <p className="text-sm text-muted-foreground">{vendor.business_name}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-5">
          {!token && (
            <div className="text-center space-y-4 py-4">
              <MessageSquare className="h-10 w-10 mx-auto text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">Please sign in to send an inquiry.</p>
              <Button asChild className="w-full">
                <Link to="/login" onClick={onClose}>Sign In</Link>
              </Button>
            </div>
          )}

          {token && userRole !== 'host' && (
            <div className="text-center space-y-3 py-4">
              <p className="text-muted-foreground text-sm">Only event hosts can send booking inquiries.</p>
              {vendor.phone && (
                <div className="flex items-center gap-2 justify-center text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />{vendor.phone}
                </div>
              )}
            </div>
          )}

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
                  <MapPin className="h-4 w-4" />Event Location
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
                  placeholder="Describe your event requirements..."
                  rows={4}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>
              {status === 'error' && <p className="text-sm text-destructive">{errorMsg}</p>}
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

          {status === 'success' && (
            <div className="text-center space-y-4 py-4">
              <CheckCircle className="h-12 w-12 mx-auto text-primary" />
              <div>
                <p className="font-semibold">Inquiry Sent!</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {vendor.business_name} will be in touch soon.
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

  // 2-level filter state
  const [activeEventType, setActiveEventType] = useState(null)   // null = All
  const [activeSubcategory, setActiveSubcategory] = useState(null)
  const [popupEventType, setPopupEventType] = useState(null)      // which type's popup is open

  const [inquiryVendor, setInquiryVendor] = useState(null)

  // Fetch vendors whenever filter changes
  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setFetchError(null)
      try {
        const params = new URLSearchParams()
        if (activeEventType) params.set('event_type', activeEventType)
        if (activeSubcategory) params.set('subcategory', activeSubcategory)
        const qs = params.toString()
        const res = await fetch(`${API}/api/vendors${qs ? `?${qs}` : ''}`)
        if (!res.ok) throw new Error('Failed to load vendors.')
        setVendors(await res.json())
      } catch (e) {
        setFetchError(e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [activeEventType, activeSubcategory])

  // Client-side search filter
  const filteredVendors = vendors.filter((v) => {
    const q = searchQuery.toLowerCase()
    return (
      q === '' ||
      v.business_name?.toLowerCase().includes(q) ||
      v.description?.toLowerCase().includes(q) ||
      v.location?.toLowerCase().includes(q) ||
      v.services?.some((s) => s?.toLowerCase().includes(q))
    )
  })

  // Handle clicking an event type button
  const handleEventTypeClick = (type) => {
    if (type === null) {
      // "All Events" — clear everything
      setActiveEventType(null)
      setActiveSubcategory(null)
      setPopupEventType(null)
      return
    }
    // Open subcategory popup for this type
    setPopupEventType(type)
  }

  // Handle picking a subcategory from the popup
  const handleSubcategorySelect = (sub) => {
    setActiveEventType(popupEventType)
    setActiveSubcategory(sub)  // null means "All in this event type"
    setPopupEventType(null)
  }

  const clearFilter = () => {
    setActiveEventType(null)
    setActiveSubcategory(null)
  }

  const isActive = (type) => activeEventType === type

  return (
    <>
      {/* Subcategory popup */}
      {popupEventType && (
        <SubcategoryPopup
          eventType={popupEventType}
          onSelect={handleSubcategorySelect}
          onClose={() => setPopupEventType(null)}
        />
      )}

      {/* Booking modal */}
      {inquiryVendor && (
        <BookingModal
          vendor={inquiryVendor}
          token={token}
          userRole={user?.role}
          onClose={() => setInquiryVendor(null)}
        />
      )}

      {/* ── Hero ── */}
      <section className="bg-muted/20 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-balance">
              {t('marketplace_title')}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {t('marketplace_subtitle')}
            </p>
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

      {/* ── Level 1 Filter — Event Type buttons ── */}
      <section className="sticky top-16 z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 py-4 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-2 items-center">
            {/* All Events */}
            <Button
              variant={activeEventType === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleEventTypeClick(null)}
              className={activeEventType !== null ? 'bg-transparent' : ''}
            >
              All Events
            </Button>

            {/* Event type buttons */}
            {EVENT_TYPES.map((type) => (
              <Button
                key={type}
                variant={isActive(type) ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleEventTypeClick(type)}
                className={`gap-1.5 ${!isActive(type) ? 'bg-transparent' : ''}`}
              >
                {type}
                <ChevronDown className="h-3.5 w-3.5 opacity-60" />
              </Button>
            ))}
          </div>

          {/* Active filter breadcrumb */}
          {activeEventType && (
            <div className="flex items-center gap-2 mt-3">
              <span className="text-sm text-muted-foreground">Showing:</span>
              <Badge className="gap-1.5 pl-2 pr-1 py-1 bg-primary/10 text-primary border border-primary/30 font-medium">
                {activeEventType}
                {activeSubcategory && (
                  <>
                    <span className="opacity-50">›</span>
                    {activeSubcategory}
                  </>
                )}
                <button
                  onClick={clearFilter}
                  className="ml-1 rounded-full hover:bg-primary/20 p-0.5 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
              <span className="text-sm text-muted-foreground">
                — {loading ? '...' : filteredVendors.length} vendor{filteredVendors.length !== 1 ? 's' : ''} found
              </span>
            </div>
          )}

          {!activeEventType && !loading && (
            <p className="text-sm text-muted-foreground mt-2">
              {filteredVendors.length} vendor{filteredVendors.length !== 1 ? 's' : ''} available
            </p>
          )}
        </div>
      </section>

      {/* ── Vendors Grid ── */}
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
          {!loading && !fetchError && filteredVendors.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVendors.map((vendor) => {
                // Use filtered_preview photo when a subcategory is active
                const coverImage = vendor.filtered_preview
                  ? `${API}${vendor.filtered_preview}`
                  : vendor.image_url || null

                return (
                  <Card key={vendor.id} className="border-2 hover:border-primary/50 transition-all overflow-hidden group">
                    {/* Cover image */}
                    <Link to={`/vendor/${vendor.id}`} className="block relative aspect-video bg-muted overflow-hidden">
                      {coverImage ? (
                        <img
                          src={coverImage}
                          alt={vendor.business_name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-4xl">
                          🏪
                        </div>
                      )}
                      {vendor.is_verified && (
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-primary text-primary-foreground text-xs">
                            {t('verified')}
                          </Badge>
                        </div>
                      )}
                      {/* Subcategory tag on the photo */}
                      {activeSubcategory && vendor.filtered_preview && (
                        <div className="absolute bottom-3 left-3">
                          <Badge className="bg-black/60 text-white border-0 text-xs backdrop-blur-sm">
                            {activeSubcategory}
                          </Badge>
                        </div>
                      )}
                    </Link>

                    <CardContent className="p-5 space-y-4">
                      <div className="space-y-1.5">
                        <h3 className="text-lg font-bold leading-tight">{vendor.business_name}</h3>
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 fill-primary text-primary" />
                          <span className="text-sm font-semibold">{Number(vendor.rating || 0).toFixed(1)}</span>
                          <span className="text-sm text-muted-foreground">
                            ({vendor.total_reviews || 0} {t('reviews_label')})
                          </span>
                        </div>
                        {vendor.location && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4" />{vendor.location}
                          </div>
                        )}
                      </div>

                      {vendor.specializations?.filter(Boolean).length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {vendor.specializations.filter(Boolean).map((spec) => (
                            <Badge key={spec} variant="secondary" className="text-xs">{spec}</Badge>
                          ))}
                        </div>
                      )}

                      {vendor.description && (
                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                          {vendor.description}
                        </p>
                      )}

                      {vendor.services?.filter(Boolean).length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {vendor.services.filter(Boolean).slice(0, 3).map((service) => (
                            <span key={service} className="text-xs bg-muted px-2 py-1 rounded">
                              {service}
                            </span>
                          ))}
                          {vendor.services.filter(Boolean).length > 3 && (
                            <span className="text-xs text-muted-foreground py-1">
                              +{vendor.services.filter(Boolean).length - 3} more
                            </span>
                          )}
                        </div>
                      )}

                      {vendor.price_range && (
                        <div className="pt-2 border-t border-border">
                          <div className="text-sm font-semibold text-primary">{vendor.price_range}</div>
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" size="sm" className="gap-1.5 bg-transparent" asChild>
                          <Link to={`/vendor/${vendor.id}`}>
                            <ExternalLink className="h-3.5 w-3.5" />
                            View Profile
                          </Link>
                        </Button>
                        <Button
                          size="sm"
                          className="gap-1.5"
                          onClick={() => setInquiryVendor(vendor)}
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          {t('message')}
                        </Button>
                      </div>

                      {vendor.phone && (
                        <Button variant="outline" size="sm" className="w-full gap-1.5 bg-transparent" asChild>
                          <a href={`tel:${vendor.phone}`}>
                            <Phone className="h-3.5 w-3.5" />
                            {t('call')} {vendor.phone}
                          </a>
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {/* Empty state */}
          {!loading && !fetchError && filteredVendors.length === 0 && (
            <div className="text-center py-20">
              <div className="max-w-md mx-auto space-y-4">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold">{t('no_vendors_found')}</h3>
                <p className="text-muted-foreground">
                  {activeEventType
                    ? `No vendors found for "${activeSubcategory || activeEventType}" yet. Check back soon!`
                    : vendors.length === 0
                    ? 'No approved vendors yet. Check back soon!'
                    : t('no_vendors_desc')}
                </p>
                <Button onClick={clearFilter}>{t('reset_filters')}</Button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Become Vendor CTA ── */}
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
