import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Card, CardContent } from '@/components/ui/card.jsx'
import { useAuth } from '@/context/AuthContext.jsx'
import { CalendarDays, MapPin, Send, ArrowLeft, CheckCircle, PartyPopper, CreditCard, Banknote, X, AlertTriangle } from 'lucide-react'
import LocationPicker from '@/components/LocationPicker.jsx'

const API = 'http://localhost:5001'

const HOTEL_VENUES = [
  'Norling Grand Resort',
  'Gokarna Forest Resort',
  'Hotel Soaltee Crowne Plaza',
  'Hotel Yak & Yeti',
  'Hyatt Regency Kathmandu',
  'Radisson Hotel Kathmandu',
]

function formatDate(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

export default function BookingPage() {
  const { vendorId } = useParams()
  const navigate = useNavigate()
  const { user, token } = useAuth()

  const [vendor, setVendor] = useState(null)
  const [form, setForm] = useState({
    event_dates: [],
    event_type: '',
    event_location: '',
    notes: '',
    payment_method: 'online',
  })
  const [dateInput, setDateInput] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('')
  const [conflictModal, setConflictModal] = useState(null) // null | { conflicting_dates: string[] }

  useEffect(() => {
    if (!token || user?.role !== 'host') {
      navigate('/login', { replace: true })
      return
    }
    fetch(`${API}/api/vendors/${vendorId}`)
      .then((r) => r.json())
      .then(setVendor)
      .catch(() => {})
  }, [vendorId, token, user])

  // Hotel conflict detection — fires when dates or location change
  useEffect(() => {
    if (!form.event_dates.length || !form.event_location) return
    const hotelName = HOTEL_VENUES.find((h) => form.event_location.startsWith(h))
    if (!hotelName) return

    fetch(`${API}/api/bookings/check-availability`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ venue_name: hotelName, dates: form.event_dates }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (!data.available && data.conflicting_dates?.length) {
          setConflictModal({ conflicting_dates: data.conflicting_dates })
        }
      })
      .catch(() => {})
  }, [form.event_dates, form.event_location])

  function addDate() {
    if (!dateInput) return
    if (form.event_dates.includes(dateInput)) return
    setForm((prev) => ({
      ...prev,
      event_dates: [...prev.event_dates, dateInput].sort(),
    }))
    setDateInput('')
  }

  function removeDate(date) {
    setForm((prev) => ({
      ...prev,
      event_dates: prev.event_dates.filter((d) => d !== date),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.event_dates.length) {
      setErrorMsg('Please select at least one event date.')
      setStatus('error')
      return
    }
    setStatus('loading')
    setErrorMsg('')
    try {
      const res = await fetch(`${API}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ vendor_id: vendorId, ...form }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Booking failed.')
      setStatus('success')
    } catch (err) {
      setErrorMsg(err.message)
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="container mx-auto px-4 py-24 max-w-md text-center space-y-6">
        <CheckCircle className="h-20 w-20 mx-auto text-primary" />
        <h1 className="text-2xl font-bold">Booking Inquiry Sent!</h1>
        <p className="text-muted-foreground">
          Your inquiry has been sent to <span className="font-semibold text-foreground">{vendor?.business_name}</span>.
          They will get back to you soon.
        </p>
        <div className="flex flex-col gap-2">
          <Button asChild>
            <Link to="/dashboard/client">View My Bookings</Link>
          </Button>
          <Button asChild variant="outline" className="bg-transparent">
            <Link to="/marketplace">Back to Marketplace</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Hotel conflict warning modal */}
      {conflictModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background rounded-xl border border-border shadow-xl max-w-sm w-full p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="rounded-full p-2 shrink-0" style={{ backgroundColor: '#FEF3EC' }}>
                <AlertTriangle className="h-5 w-5" style={{ color: '#C2570B' }} />
              </div>
              <div>
                <h2 className="font-semibold text-base">Venue Not Available</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  This venue is already booked for{' '}
                  <span className="font-medium text-foreground">
                    {conflictModal.conflicting_dates.map(formatDate).join(', ')}
                  </span>
                  . Please choose different dates or select another venue.
                </p>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setConflictModal(null)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#C2570B' }}
              >
                OK, I'll adjust
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-10 max-w-xl space-y-6">
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link to={vendor ? `/vendor/${vendorId}` : '/marketplace'}>
            <ArrowLeft className="h-4 w-4 mr-1" />Back
          </Link>
        </Button>

        <div>
          <h1 className="text-2xl font-bold">Send Booking Inquiry</h1>
          {vendor && <p className="text-muted-foreground mt-1">To: {vendor.business_name}</p>}
        </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Multi-date picker */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  Event Date(s) <span className="text-destructive">*</span>
                </label>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={dateInput}
                    onChange={(e) => setDateInput(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={addDate}
                    disabled={!dateInput}
                    variant="outline"
                    className="shrink-0 border-primary text-primary hover:bg-primary/5"
                  >
                    Add Date
                  </Button>
                </div>

                {form.event_dates.length > 0 ? (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {form.event_dates.map((date) => (
                      <span
                        key={date}
                        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium text-white"
                        style={{ backgroundColor: '#C2570B' }}
                      >
                        {formatDate(date)}
                        <button
                          type="button"
                          onClick={() => removeDate(date)}
                          className="rounded-full p-0.5 hover:bg-white/20 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Pick a date and click "Add Date". You can add multiple days for multi-day events.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <PartyPopper className="h-4 w-4" />
                  Event Type
                </label>
                <select
                  value={form.event_type}
                  onChange={(e) => setForm({ ...form, event_type: e.target.value })}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="">Select event type (optional)</option>
                  <option value="Wedding">Wedding (Vivaha)</option>
                  <option value="Bratabandha">Bratabandha</option>
                  <option value="Annaprasan">Annaprasan</option>
                  <option value="Pooja">Pooja / Puja</option>
                  <option value="Birthday">Birthday</option>
                  <option value="Corporate">Corporate Event</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Event Location
                </label>
                <LocationPicker
                  value={form.event_location}
                  onChange={(val) => setForm({ ...form, event_location: val })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Message to Vendor</label>
                <Textarea
                  placeholder="Describe your event requirements, expected guest count, cultural preferences..."
                  rows={5}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Payment Method</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, payment_method: 'online' })}
                    className={`flex flex-col items-center gap-1.5 rounded-lg border-2 px-4 py-3 text-sm font-medium transition-colors
                      ${form.payment_method === 'online'
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border bg-background text-muted-foreground hover:border-primary/40'}`}
                  >
                    <CreditCard className="h-5 w-5" />
                    Online (eSewa)
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, payment_method: 'cash' })}
                    className={`flex flex-col items-center gap-1.5 rounded-lg border-2 px-4 py-3 text-sm font-medium transition-colors
                      ${form.payment_method === 'cash'
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border bg-background text-muted-foreground hover:border-primary/40'}`}
                  >
                    <Banknote className="h-5 w-5" />
                    Cash
                  </button>
                </div>
                {form.payment_method === 'online' && (
                  <p className="text-xs text-muted-foreground">
                    20% deposit via eSewa on confirmation &bull; 80% balance after the event
                  </p>
                )}
                {form.payment_method === 'cash' && (
                  <p className="text-xs text-muted-foreground">
                    Payment settled directly with the vendor in cash
                  </p>
                )}
              </div>

              {status === 'error' && <p className="text-sm text-destructive">{errorMsg}</p>}

              <Button type="submit" className="w-full gap-2" disabled={status === 'loading'}>
                <Send className="h-4 w-4" />
                {status === 'loading' ? 'Sending...' : 'Send Inquiry'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
