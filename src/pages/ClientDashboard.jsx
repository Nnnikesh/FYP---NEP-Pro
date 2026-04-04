import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { useAuth } from '@/context/AuthContext.jsx'
import {
  CalendarDays, MapPin, Clock, Store, Star,
  X, Send, CheckCircle, XCircle, CreditCard, Loader2,
} from 'lucide-react'

const API = 'http://localhost:5001'

const STATUS_COLOR = {
  pending:   'secondary',
  confirmed: 'default',
  cancelled: 'destructive',
  completed: 'outline',
}

// ── Star Rating Picker ────────────────────────────────────────────────────────
function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(0)}
        >
          <Star
            className={`h-7 w-7 transition-colors ${
              s <= (hovered || value)
                ? 'fill-primary text-primary'
                : 'text-muted-foreground'
            }`}
          />
        </button>
      ))}
    </div>
  )
}

// ── Review Modal ──────────────────────────────────────────────────────────────
function ReviewModal({ booking, token, onClose, onSubmitted }) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (rating === 0) { setErrorMsg('Please select a star rating.'); return }
    setStatus('loading')
    setErrorMsg('')
    try {
      const res = await fetch(`${API}/api/reviews/vendor/${booking.vendor_id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ rating, comment }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to submit review.')
      setStatus('success')
      setTimeout(() => { onSubmitted(); onClose() }, 1200)
    } catch (err) {
      setErrorMsg(err.message)
      setStatus('error')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-background rounded-xl border border-border shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border">
          <div>
            <h2 className="text-lg font-bold">Leave a Review</h2>
            <p className="text-sm text-muted-foreground">{booking.business_name}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-5">
          {status === 'success' ? (
            <div className="text-center space-y-3 py-4">
              <CheckCircle className="h-12 w-12 mx-auto text-primary" />
              <p className="font-semibold">Review submitted! Thank you.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Your Rating</label>
                <StarPicker value={rating} onChange={setRating} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Comment (optional)</label>
                <Textarea
                  placeholder="Share your experience with this vendor..."
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>
              {errorMsg && <p className="text-sm text-destructive">{errorMsg}</p>}
              <div className="flex gap-2 pt-1">
                <Button type="button" variant="outline" className="flex-1 bg-transparent" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 gap-2" disabled={status === 'loading'}>
                  <Send className="h-4 w-4" />
                  {status === 'loading' ? 'Submitting...' : 'Submit Review'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function ClientDashboard() {
  const { user, token } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [reviewBooking, setReviewBooking] = useState(null)
  const [payingId, setPayingId] = useState(null) // booking id currently being redirected to eSewa

  const load = async () => {
    try {
      const res = await fetch(`${API}/api/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) setBookings(await res.json())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [token])

  /**
   * Initiate eSewa payment for a confirmed booking.
   * Calls /api/payment/initiate → gets signed payload → dynamically submits
   * a POST form to eSewa's UAT payment URL.
   * The secret key never touches the frontend.
   */
  const payWithEsewa = async (bookingId) => {
    setPayingId(bookingId)
    try {
      const res = await fetch(`${API}/api/payment/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ booking_id: bookingId }),
      })
      const data = await res.json()
      if (!res.ok) { alert(data.error || 'Could not initiate payment.'); return }

      // Dynamically build and submit form to eSewa (required — GET won't work)
      const form = document.createElement('form')
      form.method = 'POST'
      form.action = data.payment_url
      Object.entries(data.payload).forEach(([key, value]) => {
        const input = document.createElement('input')
        input.type  = 'hidden'
        input.name  = key
        input.value = value
        form.appendChild(input)
      })
      document.body.appendChild(form)
      form.submit()
    } catch {
      alert('Payment initiation failed. Please try again.')
    } finally {
      setPayingId(null)
    }
  }

  const cancelBooking = async (bookingId) => {
    if (!confirm('Cancel this booking?')) return
    await fetch(`${API}/api/bookings/${bookingId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status: 'cancelled' }),
    })
    load()
  }

  return (
    <>
      {reviewBooking && (
        <ReviewModal
          booking={reviewBooking}
          token={token}
          onClose={() => setReviewBooking(null)}
          onSubmitted={load}
        />
      )}

      <div className="container mx-auto px-4 py-10 max-w-3xl space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Bookings</h1>
            <p className="text-muted-foreground mt-1">Welcome back, {user?.name}</p>
          </div>
          <Button asChild>
            <Link to="/marketplace">Browse Vendors</Link>
          </Button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="h-16 bg-muted animate-pulse rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center space-y-4">
              <CalendarDays className="h-14 w-14 mx-auto text-muted-foreground opacity-30" />
              <h3 className="text-xl font-semibold">No bookings yet</h3>
              <p className="text-muted-foreground">Browse vendors and send your first booking inquiry.</p>
              <Button asChild>
                <Link to="/marketplace">Browse Vendors</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => (
              <Card key={b.id} className="border-2 hover:border-primary/30 transition-colors">
                <CardContent className="pt-5 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold flex items-center gap-2">
                        <Store className="h-4 w-4 text-primary" />
                        {b.business_name || 'Vendor'}
                      </p>
                      <div className="flex flex-wrap gap-3 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-4 w-4" />
                          {new Date(b.event_date).toLocaleDateString()}
                        </span>
                        {b.event_location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />{b.event_location}
                          </span>
                        )}
                      </div>
                    </div>
                    <Badge
                      variant={STATUS_COLOR[b.status] || 'secondary'}
                      className="capitalize flex-shrink-0"
                    >
                      {b.status}
                    </Badge>
                  </div>

                  {b.notes && (
                    <p className="text-sm text-muted-foreground border-l-2 border-border pl-3 italic">
                      {b.notes}
                    </p>
                  )}

                  {b.agreed_amount && (
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-semibold text-primary">
                        Agreed: NPR {Number(b.agreed_amount).toLocaleString()}
                      </p>
                      {b.payment_status === 'paid' && (
                        <span className="text-xs font-semibold text-green-600 flex items-center gap-1">
                          <CheckCircle className="h-3.5 w-3.5" /> Paid via eSewa
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Sent on {new Date(b.created_at).toLocaleDateString()}
                    </p>
                    <div className="flex gap-2">
                      {b.status === 'pending' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1 text-destructive border-destructive/40 hover:bg-destructive/10 bg-transparent"
                          onClick={() => cancelBooking(b.id)}
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          Cancel
                        </Button>
                      )}
                      {/* Pay with eSewa — only for confirmed bookings with amount not yet paid */}
                      {b.status === 'confirmed' && b.agreed_amount && b.payment_status !== 'paid' && (
                        <Button
                          size="sm"
                          className="gap-1 bg-[#60BB46] hover:bg-[#4fa336] text-white"
                          disabled={payingId === b.id}
                          onClick={() => payWithEsewa(b.id)}
                        >
                          {payingId === b.id
                            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            : <CreditCard className="h-3.5 w-3.5" />}
                          Pay with eSewa
                        </Button>
                      )}
                      {b.status === 'completed' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1 bg-transparent"
                          onClick={() => setReviewBooking(b)}
                        >
                          <Star className="h-3.5 w-3.5" />
                          Leave Review
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" asChild>
                        <Link to={`/vendor/${b.vendor_id}`}>View Vendor</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
