import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext.jsx'
import { Button } from '@/components/ui/button.jsx'
import { ArrowLeft, Sparkles, Loader2, AlertCircle, ZoomIn } from 'lucide-react'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'

const API = 'http://localhost:5001'

export default function BookingDesignPage() {
  const { bookingId } = useParams()
  const { token } = useAuth()
  const navigate = useNavigate()

  const [booking, setBooking] = useState(null)
  const [vendor, setVendor]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [lightboxIdx, setLightboxIdx] = useState(-1)

  useEffect(() => {
    if (!token) { navigate('/login', { replace: true }); return }
    fetch(`${API}/api/bookings/${bookingId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(async data => {
        if (data.error) { setError(data.error); return }
        setBooking(data)
        const vRes = await fetch(`${API}/api/vendors/${data.vendor_id}`)
        const vData = await vRes.json()
        setVendor(vData)
      })
      .catch(() => setError('Could not load design.'))
      .finally(() => setLoading(false))
  }, [bookingId, token])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-28 max-w-3xl text-center space-y-4">
        <Loader2 className="h-12 w-12 mx-auto animate-spin" style={{ color: '#c2410c' }} />
        <p className="text-muted-foreground">Loading your design…</p>
      </div>
    )
  }

  if (error || !booking || !vendor) {
    return (
      <div className="container mx-auto px-4 py-24 max-w-md text-center space-y-6">
        <AlertCircle className="h-16 w-16 mx-auto text-destructive" />
        <p className="text-muted-foreground">{error || 'Design not found.'}</p>
        <Button asChild variant="outline" className="bg-transparent">
          <Link to="/dashboard/client">Go to My Bookings</Link>
        </Button>
      </div>
    )
  }

  const selectedServices = booking.selected_services
    ? booking.selected_services.split(',').map(s => s.trim()).filter(Boolean)
    : []

  const allPhotos = vendor.photos || []
  const matchedPhotos = selectedServices.length > 0
    ? allPhotos.filter(p => selectedServices.includes(p.subcategory))
    : allPhotos

  const lightboxSlides = matchedPhotos.map(p => ({
    src: p.photo_url.startsWith('http') ? p.photo_url : `${API}${p.photo_url}`,
  }))

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl space-y-8">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link to="/dashboard/client">
          <ArrowLeft className="h-4 w-4 mr-1" />Back to My Bookings
        </Link>
      </Button>

      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="h-6 w-6" style={{ color: '#c2410c' }} />
          Your Selected Design
        </h1>
        <p className="text-muted-foreground">
          {vendor.business_name} — {booking.event_type || 'Event'}
        </p>
      </div>

      {/* Selected service tags */}
      {selectedServices.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedServices.map(s => (
            <span
              key={s}
              className="text-xs font-medium px-3 py-1 rounded-full text-white"
              style={{ backgroundColor: '#c2410c' }}
            >
              {s}
            </span>
          ))}
        </div>
      )}

      {/* Photo grid */}
      {matchedPhotos.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p>No portfolio photos found for your selected services.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {matchedPhotos.map((p, i) => {
            const imgSrc = p.photo_url.startsWith('http') ? p.photo_url : `${API}${p.photo_url}`
            return (
              <div
                key={p.id}
                className="rounded-xl overflow-hidden border border-border shadow hover:shadow-lg transition-all cursor-pointer group"
                onClick={() => setLightboxIdx(i)}
              >
                <div className="relative h-52 overflow-hidden bg-muted">
                  <img
                    src={imgSrc}
                    alt={p.caption || p.subcategory}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <span
                    className="absolute top-2 right-2 text-white text-xs font-semibold px-2 py-1 rounded-full shadow"
                    style={{ backgroundColor: '#c2410c' }}
                  >
                    {p.subcategory}
                  </span>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-all flex items-center justify-center">
                    <ZoomIn className="h-7 w-7 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                <div className="p-3 space-y-0.5">
                  {p.caption && <p className="text-sm font-semibold text-foreground">{p.caption}</p>}
                  {p.design_name && <p className="text-xs font-medium" style={{ color: '#c2410c' }}>{p.design_name}</p>}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Lightbox
        open={lightboxIdx >= 0}
        index={lightboxIdx}
        close={() => setLightboxIdx(-1)}
        slides={lightboxSlides}
      />
    </div>
  )
}
