import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Card, CardContent } from '@/components/ui/card.jsx'
import { MapPin, Star, Phone, MessageSquare, Images, ArrowLeft, ZoomIn, Send } from 'lucide-react'
import { useAuth } from '@/context/AuthContext.jsx'
import Tilt from 'react-parallax-tilt'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'

const API = 'http://localhost:5001'

// ── Reviews section ───────────────────────────────────────────────────────────
function ReviewsSection({ vendorId }) {
  const { user, token } = useAuth()
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [reviewError, setReviewError] = useState('')

  const loadReviews = () => {
    fetch(`${API}/api/reviews/vendor/${vendorId}`)
      .then((r) => r.json())
      .then((data) => setReviews(Array.isArray(data) ? data : []))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadReviews() }, [vendorId])

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    if (!rating) return
    setSubmitting(true)
    setReviewError('')
    try {
      const res = await fetch(`${API}/api/reviews/vendor/${vendorId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ rating, comment }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to submit review.')
      setRating(0)
      setComment('')
      loadReviews()
    } catch (err) {
      setReviewError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const myReview = reviews.find(r => r.reviewer_name === user?.name)

  return (
    <div className="space-y-4">
      {/* Leave a review — only for hosts */}
      {user?.role === 'host' && (
        <Card className="border-dashed">
          <CardContent className="pt-5 pb-5">
            <h3 className="text-sm font-semibold mb-3">
              {myReview ? 'Update Your Review' : 'Leave a Review'}
            </h3>
            <form onSubmit={handleSubmitReview} className="space-y-3">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onMouseEnter={() => setHovered(s)}
                    onMouseLeave={() => setHovered(0)}
                    onClick={() => setRating(s)}
                  >
                    <Star
                      className={`h-6 w-6 transition-colors ${
                        s <= (hovered || rating) ? 'fill-primary text-primary' : 'text-muted-foreground'
                      }`}
                    />
                  </button>
                ))}
                {rating > 0 && <span className="text-sm text-muted-foreground ml-2">{rating}/5</span>}
              </div>
              <textarea
                className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                placeholder="Share your experience... (optional)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              {reviewError && <p className="text-xs text-destructive">{reviewError}</p>}
              <Button type="submit" size="sm" className="gap-2" disabled={!rating || submitting}>
                <Send className="h-3.5 w-3.5" />
                {submitting ? 'Submitting...' : myReview ? 'Update Review' : 'Submit Review'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="h-20 bg-muted animate-pulse rounded-lg" />
      ) : reviews.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          No reviews yet. Be the first to review!
        </p>
      ) : (
        reviews.map((r) => (
          <Card key={r.id}>
            <CardContent className="pt-4 pb-4 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-sm">{r.reviewer_name}</span>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`h-3.5 w-3.5 ${s <= r.rating ? 'fill-primary text-primary' : 'text-muted-foreground'}`}
                    />
                  ))}
                </div>
              </div>
              {r.comment && <p className="text-sm text-muted-foreground leading-relaxed">{r.comment}</p>}
              <p className="text-xs text-muted-foreground">
                {new Date(r.created_at).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}

// ── Photo card grid ────────────────────────────────────────────────────────────
function PhotoCardGrid({ photos, vendor, onOpen }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [vendorMsg, setVendorMsg] = useState(false)

  const handleBookNow = () => {
    if (!user) {
      navigate('/login')
    } else if (user.role === 'vendor') {
      setVendorMsg(true)
      setTimeout(() => setVendorMsg(false), 3000)
    } else {
      navigate(`/booking/${vendor.id}`)
    }
  }

  if (photos.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        No photos in this category yet.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {vendorMsg && (
        <div className="bg-orange-50 border border-orange-200 text-orange-800 text-sm px-4 py-2 rounded-lg text-center">
          Vendors cannot make bookings.
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {photos.map((p, i) => (
          <Tilt
            key={p.id}
            tiltMaxAngleX={6}
            tiltMaxAngleY={6}
            scale={1.02}
            transitionSpeed={400}
            glareEnable={true}
            glareMaxOpacity={0.12}
            glareColor="#ff6b35"
            glarePosition="all"
            className="rounded-xl"
          >
            <div className="bg-white rounded-xl shadow hover:shadow-lg transition-shadow duration-300 overflow-hidden group">
              {/* TOP: Image with badge and zoom */}
              <div className="relative h-[200px] overflow-hidden">
                <img
                  src={`${API}${p.photo_url}`}
                  alt={p.caption || vendor.business_name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 cursor-pointer"
                  onClick={() => onOpen(i)}
                />
                {p.subcategory && (
                  <span className="absolute top-2 right-2 bg-[#c2410c] text-white text-xs font-semibold px-2 py-1 rounded-full shadow">
                    {p.subcategory}
                  </span>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center pointer-events-none">
                  <ZoomIn className="h-7 w-7 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </div>

              {/* BOTTOM: Card body */}
              <div className="p-4 space-y-2">
                {p.caption && (
                  <p className="font-bold text-gray-900 text-sm leading-tight">{p.caption}</p>
                )}
                {p.event_type && (
                  <span className="inline-block text-xs border border-gray-300 text-gray-600 px-2 py-0.5 rounded-full">
                    {p.event_type}
                  </span>
                )}
                {vendor.price_range && (
                  <p className="text-sm font-semibold text-[#c2410c]">{vendor.price_range}</p>
                )}
                <div className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-[#c2410c] text-[#c2410c]" />
                  <span className="text-sm font-semibold text-gray-800">
                    {Number(vendor.rating || 0).toFixed(1)}
                  </span>
                  <span className="text-xs text-gray-400">({vendor.total_reviews || 0})</span>
                </div>
                <div className="flex gap-2 pt-1">
                  <Link
                    to={`/vendor/${vendor.id}`}
                    className="flex-1 text-center text-xs border border-[#c2410c] text-[#c2410c] rounded-lg py-1.5 hover:bg-orange-50 transition-colors font-medium"
                  >
                    View Details
                  </Link>
                  <button
                    onClick={handleBookNow}
                    className="flex-1 text-xs bg-[#c2410c] text-white rounded-lg py-1.5 hover:bg-[#9a3412] transition-colors font-medium"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          </Tilt>
        ))}
      </div>
    </div>
  )
}

// ── Event-type tab content with subcategory pills ─────────────────────────────
function EventTabContent({ et, grouped, vendorName, vendor }) {
  const subcategories = Object.keys(grouped[et] || {})
  const [activeSub, setActiveSub] = useState(null)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  const visible = activeSub
    ? grouped[et]?.[activeSub] || []
    : Object.values(grouped[et] || {}).flat()

  const slides = visible.map((p) => ({
    src: `${API}${p.photo_url}`,
    title: p.caption || vendorName,
    description: [p.event_type, p.subcategory].filter(Boolean).join(' › '),
  }))

  return (
    <div className="space-y-4">
      {/* Subcategory pills */}
      {subcategories.length > 1 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveSub(null)}
            className={`text-xs px-3 py-1 rounded-full border transition-colors ${
              activeSub === null
                ? 'bg-primary text-primary-foreground border-primary'
                : 'border-border text-muted-foreground hover:border-primary hover:text-foreground'
            }`}
          >
            All ({Object.values(grouped[et]).flat().length})
          </button>
          {subcategories.map((sub) => (
            <button
              key={sub}
              onClick={() => setActiveSub(activeSub === sub ? null : sub)}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                activeSub === sub
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border text-muted-foreground hover:border-primary hover:text-foreground'
              }`}
            >
              {sub} ({grouped[et][sub].length})
            </button>
          ))}
        </div>
      )}

      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={slides}
        index={lightboxIndex}
      />

      <PhotoCardGrid
        photos={visible}
        vendor={vendor}
        onOpen={(i) => { setLightboxIndex(i); setLightboxOpen(true) }}
      />

      {visible.length > 0 && (
        <p className="text-xs text-muted-foreground text-center">
          Click a photo to view fullscreen
        </p>
      )}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function VendorProfilePage() {
  const { id } = useParams()
  const { user } = useAuth()

  const [vendor, setVendor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API}/api/vendors/${id}`)
        if (!res.ok) throw new Error('Vendor not found.')
        setVendor(await res.json())
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const photos = vendor?.photos || []

  // Group photos: { eventType: { subcategory: [photos] } }
  const grouped = photos.reduce((acc, p) => {
    const et = p.event_type || 'Other'
    const sub = p.subcategory || 'General'
    if (!acc[et]) acc[et] = {}
    if (!acc[et][sub]) acc[et][sub] = []
    acc[et][sub].push(p)
    return acc
  }, {})

  const eventTypes = Object.keys(grouped)

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-4xl space-y-4">
        <div className="h-8 bg-muted animate-pulse rounded w-1/3" />
        <div className="h-48 bg-muted animate-pulse rounded-lg" />
        <div className="h-64 bg-muted animate-pulse rounded-lg" />
      </div>
    )
  }

  if (error || !vendor) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-destructive mb-4">{error || 'Vendor not found.'}</p>
        <Button asChild variant="outline">
          <Link to="/marketplace"><ArrowLeft className="h-4 w-4 mr-2" />Back to Marketplace</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl space-y-8">
      {/* Back */}
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link to="/marketplace"><ArrowLeft className="h-4 w-4 mr-1" />Back to Marketplace</Link>
      </Button>

      {/* ── Vendor Header ── */}
      <div className="flex flex-col sm:flex-row gap-6 items-start">
        <div className="h-24 w-24 rounded-xl bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden border border-border">
          {vendor.image_url ? (
            <img
              src={vendor.image_url.startsWith('http') ? vendor.image_url : `${API}${vendor.image_url}`}
              alt={vendor.business_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-4xl">🏪</span>
          )}
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold">{vendor.business_name}</h1>
            {vendor.is_verified && (
              <Badge className="bg-primary text-primary-foreground">✓ Verified</Badge>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-primary text-primary" />
              <span className="font-semibold text-foreground">
                {Number(vendor.rating || 0).toFixed(1)}
              </span>
              <span>({vendor.total_reviews || 0} reviews)</span>
            </span>
            {vendor.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />{vendor.location}
              </span>
            )}
          </div>
          {vendor.specializations?.filter(Boolean).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {vendor.specializations.filter(Boolean).map((s) => (
                <Badge key={s} variant="secondary">{s}</Badge>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 sm:min-w-[150px]">
          {vendor.phone && (
            <Button variant="outline" className="gap-2 bg-transparent" asChild>
              <a href={`tel:${vendor.phone}`}><Phone className="h-4 w-4" />Call</a>
            </Button>
          )}
          {user?.role === 'host' && (
            <Button asChild className="gap-2">
              <Link to={`/booking/${vendor.id}`}>
                <MessageSquare className="h-4 w-4" />Book Now
              </Link>
            </Button>
          )}
          {!user && (
            <Button asChild variant="outline" className="gap-2">
              <Link to="/login">
                <MessageSquare className="h-4 w-4" />Login to Book
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* ── About ── */}
      {vendor.description && (
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold mb-2">About</h2>
            <p className="text-muted-foreground leading-relaxed">{vendor.description}</p>
          </CardContent>
        </Card>
      )}

      {/* ── Services & Price ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {vendor.services?.filter(Boolean).length > 0 && (
          <Card>
            <CardContent className="pt-6 space-y-3">
              <h2 className="text-lg font-semibold">Services</h2>
              <div className="flex flex-wrap gap-2">
                {vendor.services.filter(Boolean).map((s) => (
                  <span key={s} className="text-sm bg-muted px-3 py-1 rounded-full">{s}</span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        {vendor.price_range && (
          <Card>
            <CardContent className="pt-6 space-y-2">
              <h2 className="text-lg font-semibold">Price Range</h2>
              <p className="text-2xl font-bold text-primary">{vendor.price_range}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ── Photo Portfolio grouped by Event Type → Subcategory ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Images className="h-5 w-5 text-primary" />
            Event Portfolio
          </h2>
          {photos.length > 0 && (
            <span className="text-sm text-muted-foreground">
              {photos.length} photo{photos.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {photos.length === 0 ? (
          <div className="aspect-video flex flex-col items-center justify-center bg-muted/30 rounded-lg text-muted-foreground gap-3">
            <Images className="h-12 w-12 opacity-30" />
            <p className="text-sm">No photos uploaded yet.</p>
          </div>
        ) : eventTypes.length === 1 ? (
          /* Single event type — no tabs needed */
          <EventTabContent
            et={eventTypes[0]}
            grouped={grouped}
            vendorName={vendor.business_name}
            vendor={vendor}
          />
        ) : (
          /* Multiple event types — show tabs */
          <Tabs defaultValue={eventTypes[0]}>
            <TabsList className="flex-wrap h-auto gap-1 mb-2">
              {eventTypes.map((et) => (
                <TabsTrigger key={et} value={et} className="text-xs sm:text-sm">
                  {et}
                  <span className="ml-1.5 text-muted-foreground">
                    ({Object.values(grouped[et]).flat().length})
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
            {eventTypes.map((et) => (
              <TabsContent key={et} value={et} className="mt-4">
                <EventTabContent
                  et={et}
                  grouped={grouped}
                  vendorName={vendor.business_name}
                  vendor={vendor}
                />
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>

      {/* ── Reviews ── */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Star className="h-5 w-5 text-primary" />
          Reviews
        </h2>
        <ReviewsSection vendorId={id} />
      </div>

      {/* ── Book CTA ── */}
      {user?.role === 'host' && (
        <Card className="border-2 border-primary/30 bg-primary/5">
          <CardContent className="pt-6 pb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-lg">Ready to book {vendor.business_name}?</p>
              <p className="text-sm text-muted-foreground">Send a booking inquiry and they'll get back to you.</p>
            </div>
            <Button asChild size="lg" className="gap-2 flex-shrink-0">
              <Link to={`/booking/${vendor.id}`}>
                <MessageSquare className="h-4 w-4" />Book This Vendor
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
