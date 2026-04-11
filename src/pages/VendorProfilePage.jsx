import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Card, CardContent } from '@/components/ui/card.jsx'
import { MapPin, Star, Phone, MessageSquare, Images, ArrowLeft, ZoomIn, Send, ChevronLeft } from 'lucide-react'
import { useAuth } from '@/context/AuthContext.jsx'
import Tilt from 'react-parallax-tilt'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { DESIGN_GROUPS, EVENT_SUBCATEGORIES } from '@/lib/eventCategories.js'

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
function PhotoCardGrid({ photos, vendor, onOpen, selectedItems, onToggle }) {
  if (photos.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        No photos in this category yet.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {photos.map((p, i) => {
        // Use design_name as part of the key so same subcategory across packages stays distinct
        const itemName = p.design_name
          ? `${p.design_name} — ${p.subcategory || p.caption}`
          : (p.subcategory || p.caption || null)
        const isSelected = itemName ? selectedItems.includes(itemName) : false
        const imgSrc = p.photo_url.startsWith('http') ? p.photo_url : `${API}${p.photo_url}`

        return (
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
            <div className={`bg-white rounded-xl shadow hover:shadow-lg transition-all duration-300 overflow-hidden group ${isSelected ? 'ring-2 ring-[#c2410c]' : ''}`}>
              {/* TOP: Image with badge and zoom */}
              <div className="relative h-[200px] overflow-hidden">
                <img
                  src={imgSrc}
                  alt={p.caption || vendor.business_name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 cursor-pointer"
                  onClick={() => onOpen(i)}
                />
                {p.subcategory && (
                  <span className="absolute top-2 right-2 bg-[#c2410c] text-white text-xs font-semibold px-2 py-1 rounded-full shadow">
                    {p.subcategory}
                  </span>
                )}
                {isSelected && (
                  <div className="absolute top-2 left-2 bg-[#c2410c] text-white rounded-full p-1 shadow">
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
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
                {p.design_name && (
                  <p className="text-xs text-[#c2410c] font-medium tracking-wide">{p.design_name}</p>
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
                  {itemName && (
                    <button
                      onClick={() => onToggle(itemName)}
                      className={`flex-1 text-xs rounded-lg py-1.5 transition-colors font-medium border ${
                        isSelected
                          ? 'bg-[#c2410c] text-white border-[#c2410c] hover:bg-[#9a3412]'
                          : 'border-[#c2410c] text-[#c2410c] hover:bg-orange-50'
                      }`}
                    >
                      {isSelected ? '✓ Selected' : 'Select'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </Tilt>
        )
      })}
    </div>
  )
}

// ── Per-subcategory pricing ───────────────────────────────────────────────────
const SUBCAT_PRICES = {
  'Mandap Setup':        'Rs. 85,000',
  'Entrance Decor':      'Rs. 25,000',
  'Stage Decoration':    'Rs. 45,000',
  'Photo Booth':         'Rs. 15,000',
  'Pooja Area':          'Rs. 20,000',
  'Seating Arrangement': 'Rs. 18,000',
  'Pooja Mandap':        'Rs. 30,000',
  'Ritual Setup':        'Rs. 12,000',
  'Flower Decoration':   'Rs. 22,000',
  'Stage Backdrop':      'Rs. 35,000',
  'Balloon Decor':       'Rs. 18,000',
  'Cake Table Setup':    'Rs. 12,000',
  'Floral Arrangement':  'Rs. 28,000',
  'Stage & Backdrop':    'Rs. 40,000',
  'AV & Lighting Setup': 'Rs. 55,000',
}

// ── Per-subcategory descriptions ──────────────────────────────────────────────
const SUBCAT_DESCRIPTIONS = {
  'Mandap Setup':        'Beautifully crafted mandap with floral pillars, draped fabric and traditional seating for the ceremony.',
  'Entrance Decor':      'Grand floral entrance arch with marigold garlands and fabric draping to welcome guests.',
  'Stage Decoration':    'Elegant stage backdrop with flowers, lighting and themed decor for the couple\'s seating area.',
  'Photo Booth':         'Decorative floral frame and backdrop for memorable guest photos at your event.',
  'Pooja Area':          'Sacred pooja space with ritual arrangements, diyas, flowers and traditional setup.',
  'Seating Arrangement': 'Comfortable and elegant guest seating with floral center pieces and themed covers.',
  'Pooja Mandap':        'Traditional pooja mandap with brass items, flowers, incense and ritual decorations.',
  'Ritual Setup':        'Complete ritual arrangement with all traditional items, incense and sacred flowers.',
  'Flower Decoration':   'Fresh floral arrangements and garlands throughout the venue in traditional style.',
  'Stage Backdrop':      'Colorful themed stage backdrop with balloons, drapes and personalized elements.',
  'Balloon Decor':       'Vibrant balloon arrangements and arches in themed colors for a festive atmosphere.',
  'Cake Table Setup':    'Elegantly decorated cake table with florals, candles and themed accessories.',
  'Floral Arrangement':  'Romantic floral arrangements with fresh blooms for engagement ceremonies.',
  'Stage & Backdrop':    'Professional stage with branded backdrop, podium and corporate themed decor.',
  'AV & Lighting Setup': 'Complete audio-visual and lighting setup including sound system and stage lighting.',
}

// ── Structured design layout: Zara-style gallery → detail drill-in ────────────
function StructuredDesignLayout({ et, allPhotos, vendor, selectedItems, onToggle, onSelectAll, onOpenLightbox }) {
  const designs = DESIGN_GROUPS[et] || []
  const expectedSubs = EVENT_SUBCATEGORIES[et] || []
  // null = gallery front view; number = index of open design (detail view)
  const [openDesignIndex, setOpenDesignIndex] = useState(null)

  // ── DETAIL VIEW ─────────────────────────────────────────────────────────────
  if (openDesignIndex !== null) {
    const designName = designs[openDesignIndex]
    const designPhotos = allPhotos.filter(p => p.design_name === designName)
    const slotMap = designPhotos.reduce((acc, p) => {
      if (p.subcategory) acc[p.subcategory] = p
      return acc
    }, {})
    const pkgItemNames = designPhotos
      .filter(p => p.subcategory)
      .map(p => `${p.design_name} — ${p.subcategory}`)
    const allPkgSelected = pkgItemNames.length > 0 && pkgItemNames.every(n => selectedItems.includes(n))
    const selectedCount = pkgItemNames.filter(n => selectedItems.includes(n)).length

    return (
      <div className="space-y-5">
        {/* ── Detail header ── */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <button
            onClick={() => setOpenDesignIndex(null)}
            className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ChevronLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            All Designs
          </button>
          {pkgItemNames.length > 0 && (
            <button
              onClick={() => onSelectAll(pkgItemNames)}
              className={`text-xs px-4 py-2 rounded-lg border font-semibold transition-colors flex-shrink-0 ${
                allPkgSelected
                  ? 'bg-[#c2410c] text-white border-[#c2410c] hover:bg-[#9a3412]'
                  : 'border-[#c2410c] text-[#c2410c] hover:bg-orange-50 dark:hover:bg-orange-950/30'
              }`}
            >
              {allPkgSelected ? '✓ Deselect All' : 'Select Entire Design'}
            </button>
          )}
        </div>

        {/* ── Design heading ── */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
            {designName}
            <span className="text-[#c2410c] mx-2">—</span>
            <span className="font-normal">{et}</span>
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            {selectedCount > 0
              ? `${selectedCount} of ${expectedSubs.length} setups selected`
              : `${expectedSubs.length} setups · select individual items or the whole design`
            }
          </p>
        </div>

        {/* ── Pinterest × Zara 2-column setup grid ── */}
        <div className="grid grid-cols-2 gap-3">
          {expectedSubs.map((subcat) => {
            const photo = slotMap[subcat]
            const price = SUBCAT_PRICES[subcat] || null
            const description = SUBCAT_DESCRIPTIONS[subcat] || ''

            if (photo) {
              const itemName = `${designName} — ${subcat}`
              const isSelected = selectedItems.includes(itemName)
              const imgSrc = photo.photo_url.startsWith('http') ? photo.photo_url : `${API}${photo.photo_url}`

              return (
                <Tilt
                  key={subcat}
                  tiltMaxAngleX={10}
                  tiltMaxAngleY={10}
                  perspective={1000}
                  scale={1.03}
                  transitionSpeed={400}
                  gyroscope={true}
                  glareEnable={true}
                  glareMaxOpacity={0.12}
                  glareColor="#C2570B"
                  glarePosition="all"
                >
                  <div
                    className={`group bg-white dark:bg-card transition-all duration-200 ${
                      isSelected
                        ? 'outline outline-2 outline-[#C2570B]'
                        : 'outline outline-1 outline-transparent hover:outline-[#C2570B]'
                    }`}
                  >
                    {/* Photo — natural aspect ratio, no crop */}
                    <div className="relative w-full overflow-hidden bg-[#f5f0eb]">
                      <img
                        src={imgSrc}
                        alt={photo.caption || subcat}
                        className="w-full h-auto block transition-transform duration-500 group-hover:scale-[1.03] cursor-pointer"
                        onClick={() => onOpenLightbox(allPhotos.indexOf(photo))}
                      />
                      {/* Selected checkmark — top-left corner */}
                      {isSelected && (
                        <div className="absolute top-2 left-2 bg-[#C2570B] text-white rounded-full p-1 shadow">
                          <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Zara-style text block */}
                    <div style={{ padding: '10px 6px 12px' }}>
                      {/* 1. Sub-category — uppercase, spaced, medium weight */}
                      <p style={{
                        fontSize: '12px',
                        fontWeight: 500,
                        letterSpacing: '1.5px',
                        color: '#1a1a1a',
                        textTransform: 'uppercase',
                        lineHeight: 1.4,
                      }}>
                        {subcat}
                      </p>

                      {/* 2. Description */}
                      {description && (
                        <p style={{
                          fontSize: '12px',
                          color: '#888',
                          marginTop: '4px',
                          lineHeight: 1.5,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}>
                          {description}
                        </p>
                      )}

                      {/* 3. Price */}
                      {price && (
                        <p style={{
                          fontSize: '13px',
                          fontWeight: 500,
                          color: '#C2570B',
                          marginTop: '6px',
                        }}>
                          {price}
                        </p>
                      )}

                      {/* 4. Select button */}
                      <button
                        onClick={() => onToggle(itemName)}
                        style={{ marginTop: '8px' }}
                        className={`w-full text-xs py-1.5 border transition-colors font-medium ${
                          isSelected
                            ? 'bg-[#C2570B] text-white border-[#C2570B] hover:bg-[#9a3412]'
                            : 'border-[#C2570B] text-[#C2570B] hover:bg-orange-50 dark:hover:bg-orange-950/30'
                        }`}
                      >
                        {isSelected ? '✓ Selected' : 'Select'}
                      </button>
                    </div>
                  </div>
                </Tilt>
              )
            }

            // Placeholder
            return (
              <div
                key={subcat}
                className="bg-[#f5f0eb] dark:bg-muted/20"
              >
                <div className="aspect-[4/5] flex flex-col items-center justify-center gap-2 px-4">
                  <span className="text-3xl opacity-15">✦</span>
                  <p style={{
                    fontSize: '11px',
                    fontWeight: 500,
                    letterSpacing: '1.5px',
                    color: '#a0785a',
                    textTransform: 'uppercase',
                    textAlign: 'center',
                  }}>
                    {subcat}
                  </p>
                  <p style={{ fontSize: '10px', color: '#c4a48a', textAlign: 'center' }}>
                    Photo coming soon
                  </p>
                </div>
                <div style={{ padding: '10px 6px 12px' }}>
                  <p style={{
                    fontSize: '12px',
                    fontWeight: 500,
                    letterSpacing: '1.5px',
                    color: '#c4a48a',
                    textTransform: 'uppercase',
                  }}>
                    {subcat}
                  </p>
                  {price && (
                    <p style={{ fontSize: '13px', fontWeight: 500, color: '#C2570B', opacity: 0.4, marginTop: '6px' }}>
                      {price}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // ── GALLERY VIEW (front — 3 design cards) ───────────────────────────────────

  // Event-type decorative SVG icons for placeholder cards
  const eventIcons = {
    Wedding: (
      <svg viewBox="0 0 80 80" fill="none" className="w-20 h-20 opacity-25">
        {/* Mandap arch */}
        <path d="M10 68 Q10 30 40 18 Q70 30 70 68" stroke="#7a3d1a" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <line x1="10" y1="68" x2="70" y2="68" stroke="#7a3d1a" strokeWidth="2.5" strokeLinecap="round"/>
        {/* Columns */}
        <line x1="10" y1="50" x2="10" y2="68" stroke="#7a3d1a" strokeWidth="3" strokeLinecap="round"/>
        <line x1="70" y1="50" x2="70" y2="68" stroke="#7a3d1a" strokeWidth="3" strokeLinecap="round"/>
        {/* Garland swag */}
        <path d="M15 42 Q27 50 40 44 Q53 50 65 42" stroke="#c2410c" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
        {/* Flame */}
        <path d="M40 28 Q38 22 40 18 Q42 22 40 28Z" fill="#c2410c" opacity="0.7"/>
      </svg>
    ),
    Bratabandha: (
      <svg viewBox="0 0 80 80" fill="none" className="w-20 h-20 opacity-25">
        {/* Diya bowl */}
        <path d="M22 52 Q40 60 58 52 L55 62 Q40 68 25 62Z" fill="#7a3d1a"/>
        {/* Wick */}
        <line x1="40" y1="52" x2="40" y2="42" stroke="#7a3d1a" strokeWidth="2" strokeLinecap="round"/>
        {/* Flame outer */}
        <path d="M40 42 Q34 32 37 24 Q40 18 43 24 Q46 32 40 42Z" fill="#c2410c" opacity="0.6"/>
        {/* Flame inner */}
        <path d="M40 40 Q37 33 39 27 Q40 23 41 27 Q43 33 40 40Z" fill="#f5a623" opacity="0.8"/>
        {/* Glow dots */}
        <circle cx="28" cy="44" r="1.5" fill="#c2410c" opacity="0.5"/>
        <circle cx="52" cy="44" r="1.5" fill="#c2410c" opacity="0.5"/>
        <circle cx="33" cy="38" r="1" fill="#c2410c" opacity="0.4"/>
        <circle cx="47" cy="38" r="1" fill="#c2410c" opacity="0.4"/>
      </svg>
    ),
    Pooja: (
      <svg viewBox="0 0 80 80" fill="none" className="w-20 h-20 opacity-25">
        {/* Lotus petals outer */}
        {[0,45,90,135,180,225,270,315].map((deg, i) => (
          <ellipse key={i}
            cx={40 + 18 * Math.sin(deg * Math.PI / 180)}
            cy={40 - 18 * Math.cos(deg * Math.PI / 180)}
            rx="7" ry="13"
            transform={`rotate(${deg} ${40 + 18 * Math.sin(deg * Math.PI / 180)} ${40 - 18 * Math.cos(deg * Math.PI / 180)})`}
            fill="#c2410c" opacity="0.35"
          />
        ))}
        {/* Inner petals */}
        {[22,67,112,157,202,247,292,337].map((deg, i) => (
          <ellipse key={i}
            cx={40 + 10 * Math.sin(deg * Math.PI / 180)}
            cy={40 - 10 * Math.cos(deg * Math.PI / 180)}
            rx="5" ry="9"
            transform={`rotate(${deg} ${40 + 10 * Math.sin(deg * Math.PI / 180)} ${40 - 10 * Math.cos(deg * Math.PI / 180)})`}
            fill="#7a3d1a" opacity="0.5"
          />
        ))}
        {/* Centre */}
        <circle cx="40" cy="40" r="6" fill="#c2410c" opacity="0.6"/>
        <circle cx="40" cy="40" r="3" fill="#f5a623" opacity="0.9"/>
      </svg>
    ),
    Engagement: (
      <svg viewBox="0 0 80 80" fill="none" className="w-20 h-20 opacity-25">
        {/* Ring 1 */}
        <circle cx="30" cy="40" r="14" stroke="#7a3d1a" strokeWidth="4" fill="none"/>
        {/* Ring 2 */}
        <circle cx="50" cy="40" r="14" stroke="#c2410c" strokeWidth="4" fill="none"/>
        {/* Diamond on ring 1 */}
        <polygon points="30,20 26,26 30,30 34,26" fill="#c2410c" opacity="0.7"/>
        <polygon points="30,30 26,26 30,34 34,26" fill="#7a3d1a" opacity="0.5"/>
      </svg>
    ),
    'Birthday Party': (
      <svg viewBox="0 0 80 80" fill="none" className="w-20 h-20 opacity-25">
        {/* Cake tiers */}
        <rect x="18" y="54" width="44" height="16" rx="3" fill="#7a3d1a"/>
        <rect x="24" y="40" width="32" height="16" rx="3" fill="#c2410c" opacity="0.7"/>
        <rect x="30" y="28" width="20" height="14" rx="3" fill="#7a3d1a" opacity="0.8"/>
        {/* Candles */}
        <rect x="35" y="20" width="3" height="9" rx="1" fill="#c2410c" opacity="0.6"/>
        <rect x="42" y="20" width="3" height="9" rx="1" fill="#c2410c" opacity="0.6"/>
        {/* Flames */}
        <path d="M36.5 20 Q35.5 16 36.5 13 Q37.5 16 36.5 20Z" fill="#f5a623"/>
        <path d="M43.5 20 Q42.5 16 43.5 13 Q44.5 16 43.5 20Z" fill="#f5a623"/>
        {/* Dots decoration */}
        <circle cx="26" cy="62" r="2" fill="#fdf6ef" opacity="0.7"/>
        <circle cx="40" cy="62" r="2" fill="#fdf6ef" opacity="0.7"/>
        <circle cx="54" cy="62" r="2" fill="#fdf6ef" opacity="0.7"/>
      </svg>
    ),
    'Corporate Event': (
      <svg viewBox="0 0 80 80" fill="none" className="w-20 h-20 opacity-25">
        {/* Podium */}
        <rect x="28" y="50" width="24" height="18" rx="2" fill="#7a3d1a"/>
        <polygon points="20,50 40,30 60,50" fill="#c2410c" opacity="0.7"/>
        {/* Microphone */}
        <rect x="37" y="38" width="6" height="10" rx="3" fill="#7a3d1a" opacity="0.9"/>
        <path d="M33 45 Q33 52 40 52 Q47 52 47 45" stroke="#7a3d1a" strokeWidth="2" fill="none" strokeLinecap="round"/>
        <line x1="40" y1="52" x2="40" y2="56" stroke="#7a3d1a" strokeWidth="2" strokeLinecap="round"/>
        {/* Stars */}
        <circle cx="22" cy="34" r="2" fill="#c2410c" opacity="0.5"/>
        <circle cx="58" cy="34" r="2" fill="#c2410c" opacity="0.5"/>
        <circle cx="40" cy="22" r="2.5" fill="#f5a623" opacity="0.7"/>
      </svg>
    ),
  }
  const defaultIcon = (
    <svg viewBox="0 0 80 80" fill="none" className="w-20 h-20 opacity-20">
      <path d="M40 12 L44 28 L60 28 L48 38 L52 54 L40 44 L28 54 L32 38 L20 28 L36 28Z"
        fill="#7a3d1a" stroke="#c2410c" strokeWidth="1.5"/>
    </svg>
  )

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
      {designs.map((designName, designIndex) => {
        const designPhotos = allPhotos.filter(p => p.design_name === designName)
        // Cover = first uploaded photo in this design group
        const coverPhoto = designPhotos.find(p => p.photo_url)
        const pkgItemNames = designPhotos
          .filter(p => p.subcategory)
          .map(p => `${p.design_name} — ${p.subcategory}`)
        const selectedCount = pkgItemNames.filter(n => selectedItems.includes(n)).length
        const allSelected = pkgItemNames.length > 0 && pkgItemNames.every(n => selectedItems.includes(n))
        const uploadedCount = designPhotos.filter(p => p.subcategory).length

        return (
          <Tilt
            key={designName}
            tiltMaxAngleX={6}
            tiltMaxAngleY={6}
            perspective={1200}
            scale={1.02}
            transitionSpeed={300}
            glareEnable={true}
            glareMaxOpacity={0.12}
            glareColor="#C2570B"
            glarePosition="all"
            className="rounded-2xl"
          >
          <button
            onClick={() => setOpenDesignIndex(designIndex)}
            className="group text-left w-full rounded-2xl overflow-hidden bg-white dark:bg-card border border-border shadow-sm hover:shadow-xl hover:border-[#c2410c]/60 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c2410c]"
          >
            {/* ── Cover area ── */}
            <div className="relative h-[240px] overflow-hidden">
              {coverPhoto ? (
                <>
                  <img
                    src={coverPhoto.photo_url.startsWith('http') ? coverPhoto.photo_url : `${API}${coverPhoto.photo_url}`}
                    alt={designName}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Bottom scrim + design name — no floating white box */}
                  <div className="absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />
                  <div className="absolute inset-x-0 bottom-0 px-4 pb-4 pointer-events-none">
                    <p className="text-base font-bold text-white leading-tight drop-shadow-md tracking-wide">
                      {designName}
                    </p>
                  </div>
                </>
              ) : (
                /* Warm gradient placeholder with event-type icon + design name */
                <div className="w-full h-full bg-gradient-to-br from-[#f5ede4] to-[#eddcc8] dark:from-muted/40 dark:to-muted/20 flex flex-col items-center justify-center gap-4 px-5">
                  {eventIcons[et] ?? defaultIcon}
                  <p
                    className="text-lg font-bold text-center leading-snug tracking-wide"
                    style={{ color: '#2d1a0e' }}
                  >
                    {designName}
                  </p>
                </div>
              )}

              {/* Selection badge */}
              {selectedCount > 0 && (
                <div className={`absolute top-3 right-3 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md ${
                  allSelected ? 'bg-green-600' : 'bg-[#c2410c]'
                }`}>
                  {allSelected ? '✓ Full' : `${selectedCount}/${expectedSubs.length}`}
                </div>
              )}
            </div>

            {/* ── Card footer ── */}
            <div className="p-4 space-y-1.5">
              <p className="font-bold text-gray-900 dark:text-gray-100 text-sm leading-tight">{designName}</p>
              <p className="text-xs text-muted-foreground">
                {expectedSubs.length} setups
                {uploadedCount > 0 && ` · ${uploadedCount} photo${uploadedCount !== 1 ? 's' : ''} uploaded`}
              </p>
              {vendor.price_range && (
                <p className="text-sm font-bold text-[#c2410c] pt-0.5">{vendor.price_range}</p>
              )}
              <p className="text-[11px] font-semibold text-[#c2410c] pt-0.5 group-hover:underline group-hover:text-[#9a3412] transition-colors">
                View setups →
              </p>
            </div>
          </button>
          </Tilt>
        )
      })}
    </div>
  )
}

// ── Event-type tab content with subcategory pills or package groups ───────────
function EventTabContent({ et, grouped, vendorName, vendor, selectedItems, onToggle, onSelectAll }) {
  const subcategories = Object.keys(grouped[et] || {})
  const [activeSub, setActiveSub] = useState(null)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  const allPhotos = Object.values(grouped[et] || {}).flat()

  // Structured mode: event type has defined DESIGN_GROUPS
  const isStructured = Boolean(DESIGN_GROUPS[et])

  // Legacy package mode: any photo has a design_name (but no DESIGN_GROUPS entry)
  const hasPackages = !isStructured && allPhotos.some(p => p.design_name)

  // Build legacy package groups
  const packageGroups = hasPackages
    ? allPhotos.reduce((acc, p) => {
        const pkg = p.design_name || 'Other'
        if (!acc[pkg]) acc[pkg] = []
        acc[pkg].push(p)
        return acc
      }, {})
    : null

  // Subcategory-pill mode: filter by active pill
  const visible = activeSub ? grouped[et]?.[activeSub] || [] : allPhotos

  const slides = allPhotos.map((p) => ({
    src: p.photo_url.startsWith('http') ? p.photo_url : `${API}${p.photo_url}`,
    title: p.caption || vendorName,
    description: [p.design_name, p.event_type, p.subcategory].filter(Boolean).join(' › '),
  }))

  return (
    <div className="space-y-5">
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={slides}
        index={lightboxIndex}
      />

      {isStructured ? (
        // ── Structured 3×4 design layout ──────────────────────────────────────
        <StructuredDesignLayout
          et={et}
          allPhotos={allPhotos}
          vendor={vendor}
          selectedItems={selectedItems}
          onToggle={onToggle}
          onSelectAll={onSelectAll}
          onOpenLightbox={(i) => { setLightboxIndex(i); setLightboxOpen(true) }}
        />
      ) : hasPackages ? (
        // ── Legacy package / design view ──────────────────────────────────────
        <>
          <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-orange-50 border border-orange-200 text-orange-800 text-sm">
            <span className="mt-0.5">💡</span>
            <span>Select items from the same design for best results</span>
          </div>

          {Object.entries(packageGroups).map(([pkgName, pkgPhotos], designIndex) => {
            const pkgItemNames = pkgPhotos.map(p =>
              `${p.design_name} — ${p.subcategory || p.caption}`
            )
            const allPkgSelected = pkgItemNames.every(n => selectedItems.includes(n))
            const selectedCount = pkgItemNames.filter(n => selectedItems.includes(n)).length

            return (
              <div key={pkgName} className="space-y-3">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-base text-gray-900">
                      Design {designIndex + 1} — {pkgName}
                    </h3>
                    {allPkgSelected ? (
                      <span className="text-xs bg-green-100 text-green-700 border border-green-200 px-2 py-0.5 rounded-full font-medium">
                        ✓ Full Design Selected
                      </span>
                    ) : selectedCount > 0 ? (
                      <span className="text-xs bg-orange-100 text-orange-700 border border-orange-200 px-2 py-0.5 rounded-full font-medium">
                        {selectedCount}/{pkgItemNames.length} selected
                      </span>
                    ) : null}
                  </div>
                  <button
                    onClick={() => onSelectAll(pkgItemNames)}
                    className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors flex-shrink-0 ${
                      allPkgSelected
                        ? 'bg-[#c2410c] text-white border-[#c2410c] hover:bg-[#9a3412]'
                        : 'border-[#c2410c] text-[#c2410c] hover:bg-orange-50'
                    }`}
                  >
                    {allPkgSelected ? '✓ Deselect Design' : 'Select Entire Design'}
                  </button>
                </div>

                <PhotoCardGrid
                  photos={pkgPhotos}
                  vendor={vendor}
                  onOpen={(i) => {
                    setLightboxIndex(allPhotos.indexOf(pkgPhotos[i]))
                    setLightboxOpen(true)
                  }}
                  selectedItems={selectedItems}
                  onToggle={onToggle}
                />
              </div>
            )
          })}
        </>
      ) : (
        // ── Subcategory-pill view ──────────────────────────────────────────────
        <>
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
                All ({allPhotos.length})
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

          <PhotoCardGrid
            photos={visible}
            vendor={vendor}
            onOpen={(i) => {
              setLightboxIndex(allPhotos.indexOf(visible[i]))
              setLightboxOpen(true)
            }}
            selectedItems={selectedItems}
            onToggle={onToggle}
          />
        </>
      )}

      {allPhotos.length > 0 && (
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
  const navigate = useNavigate()

  const [vendor, setVendor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState(null)
  // Per-tab selection: { [eventType]: string[] }
  const [tabSelections, setTabSelections] = useState({})

  const toggleItem = (et, itemName) => {
    setTabSelections(prev => {
      const current = prev[et] || []
      const next = current.includes(itemName)
        ? current.filter(n => n !== itemName)
        : [...current, itemName]
      return { ...prev, [et]: next }
    })
  }

  // Toggle an entire design's items at once (select all / deselect all)
  const selectAllItems = (et, itemNames) => {
    setTabSelections(prev => {
      const current = prev[et] || []
      const allSelected = itemNames.every(n => current.includes(n))
      const next = allSelected
        ? current.filter(n => !itemNames.includes(n))
        : [...new Set([...current, ...itemNames])]
      return { ...prev, [et]: next }
    })
  }

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

  // Initialise activeTab once event types are known
  useEffect(() => {
    if (eventTypes.length > 0 && activeTab === null) {
      setActiveTab(eventTypes[0])
    }
  }, [eventTypes.join(',')])

  const bookingUrl = activeTab
    ? `/booking/${id}?eventType=${encodeURIComponent(activeTab)}`
    : `/booking/${id}`

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
    <>
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
              <Link to={bookingUrl}>
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
        ) : (
          /* Always show pill tabs — one per distinct event_type in the vendor's photos */
          <Tabs value={activeTab ?? eventTypes[0]} onValueChange={setActiveTab}>
            <TabsList className="flex-wrap h-auto gap-1 mb-2">
              {eventTypes.map((et) => {
                const count = Object.values(grouped[et]).flat().length
                const selected = tabSelections[et]?.length ?? 0
                return (
                  <TabsTrigger key={et} value={et} className="text-xs sm:text-sm">
                    {et}
                    {selected > 0 && (
                      <span className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full bg-[#c2410c] text-white text-[10px] font-bold">
                        {selected}
                      </span>
                    )}
                  </TabsTrigger>
                )
              })}
            </TabsList>
            {eventTypes.map((et) => (
              <TabsContent key={et} value={et} className="mt-4">
                <EventTabContent
                  et={et}
                  grouped={grouped}
                  vendorName={vendor.business_name}
                  vendor={vendor}
                  selectedItems={tabSelections[et] || []}
                  onToggle={(itemName) => toggleItem(et, itemName)}
                  onSelectAll={(names) => selectAllItems(et, names)}
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
              <Link to={bookingUrl}>
                <MessageSquare className="h-4 w-4" />Book This Vendor
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>

    {/* ── Sticky selection bar ── */}
    {(() => {
      const currentTab = activeTab ?? eventTypes[0]
      const activeItems = tabSelections[currentTab] || []
      if (!user || user.role !== 'host' || activeItems.length === 0) return null

      // For design-based items ("Floral Elegance — Mandap Setup"), split into
      // design name (for ?design=) and clean subcategory (for ?items=)
      const hasDesignItems = activeItems.some(n => n.includes(' — '))
      const cleanItems = activeItems.map(n => n.includes(' — ') ? n.split(' — ').slice(1).join(' — ') : n)
      const designNames = [...new Set(
        activeItems.filter(n => n.includes(' — ')).map(n => n.split(' — ')[0])
      )]
      const primaryDesign = designNames[0] || null

      let dest = `/booking/${id}?eventType=${encodeURIComponent(currentTab)}&items=${encodeURIComponent(cleanItems.join(','))}`
      if (primaryDesign) dest += `&design=${encodeURIComponent(primaryDesign)}`

      // Display label: show clean subcategory names in the bar
      const displayNames = hasDesignItems ? cleanItems : activeItems
      const designLabel = designNames.length === 1 ? ` · ${primaryDesign}` : designNames.length > 1 ? ` · ${designNames.length} designs` : ''

      return (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur-sm shadow-lg">
          <div className="container mx-auto px-4 py-3 max-w-4xl flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold truncate">
                {activeItems.length} item{activeItems.length !== 1 ? 's' : ''} selected &middot; {currentTab}{designLabel}
              </p>
              <p className="text-xs text-muted-foreground truncate">{displayNames.join(', ')}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setTabSelections(prev => ({ ...prev, [currentTab]: [] }))}
                className="text-xs text-muted-foreground hover:text-foreground px-2 py-1.5"
              >
                Clear
              </button>
              <button
                onClick={() => navigate(dest)}
                className="text-sm font-semibold px-5 py-2 rounded-lg text-white transition-colors"
                style={{ backgroundColor: '#C2410C' }}
                onMouseOver={e => e.currentTarget.style.backgroundColor = '#9a3412'}
                onMouseOut={e => e.currentTarget.style.backgroundColor = '#C2410C'}
              >
                Book {currentTab}
              </button>
            </div>
          </div>
        </div>
      )
    })()}
    </>
  )
}
