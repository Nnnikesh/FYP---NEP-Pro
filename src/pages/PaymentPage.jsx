import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent } from '@/components/ui/card.jsx'
import { ArrowLeft, CreditCard, QrCode, CalendarDays, Store, Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import QRPaymentModal from '@/components/QRPaymentModal.jsx'

const API = 'http://localhost:5001'

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short', month: 'long', day: 'numeric', year: 'numeric',
  })
}

export default function PaymentPage() {
  const { bookingId } = useParams()
  const navigate = useNavigate()
  const { token } = useAuth()

  const [booking, setBooking]         = useState(null)
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState('')
  const [initiating, setInitiating]   = useState(false)
  const [showQR, setShowQR]           = useState(false)

  useEffect(() => {
    if (!token) { navigate('/login', { replace: true }); return }
    fetch(`${API}/api/bookings/${bookingId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { setError(data.error); return }
        setBooking(data)
      })
      .catch(() => setError('Could not load booking details.'))
      .finally(() => setLoading(false))
  }, [bookingId, token])

  // ── Pay via real eSewa redirect ──────────────────────────────────────────────
  const handleEsewaPayment = async () => {
    setInitiating(true)
    setError('')
    try {
      const res = await fetch(`${API}/api/payment/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ booking_id: bookingId, payment_type: 'deposit' }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Could not initiate payment.'); return }

      // Build and submit a POST form to eSewa (GET requests are rejected)
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
      setError('Payment initiation failed. Please try again.')
    } finally {
      setInitiating(false)
    }
  }

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-28 max-w-md text-center space-y-4">
        <Loader2 className="h-12 w-12 mx-auto animate-spin" style={{ color: '#c2410c' }} />
        <p className="text-muted-foreground">Loading booking details…</p>
      </div>
    )
  }

  // ── Already paid ─────────────────────────────────────────────────────────────
  if (booking && booking.deposit_status === 'paid') {
    return (
      <div className="container mx-auto px-4 py-24 max-w-md text-center space-y-6">
        <CheckCircle className="h-20 w-20 mx-auto text-green-500" />
        <h1 className="text-2xl font-bold">Deposit Already Paid</h1>
        <p className="text-muted-foreground">
          The 20% deposit for this booking has already been paid successfully.
        </p>
        <Button asChild className="w-full">
          <Link to="/dashboard/client">View My Bookings</Link>
        </Button>
      </div>
    )
  }

  // ── Error / not found ────────────────────────────────────────────────────────
  if (error || !booking) {
    return (
      <div className="container mx-auto px-4 py-24 max-w-md text-center space-y-6">
        <AlertCircle className="h-16 w-16 mx-auto text-destructive" />
        <h1 className="text-xl font-bold">Could Not Load Booking</h1>
        <p className="text-muted-foreground">{error || 'Booking not found.'}</p>
        <Button asChild variant="outline" className="bg-transparent">
          <Link to="/dashboard/client">Go to My Bookings</Link>
        </Button>
      </div>
    )
  }

  const totalAmount   = Number(booking.agreed_amount || 0)
  const depositAmount = (totalAmount * 0.20)
  const balanceAmount = (totalAmount * 0.80)

  return (
    <>
      {showQR && (
        <QRPaymentModal
          booking={booking}
          depositAmount={depositAmount}
          token={token}
          onClose={() => setShowQR(false)}
          onSuccess={() => navigate('/dashboard/client')}
        />
      )}

      <div className="container mx-auto px-4 py-10 max-w-lg space-y-6">
        {/* Back */}
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link to="/dashboard/client">
            <ArrowLeft className="h-4 w-4 mr-1" />Back to My Bookings
          </Link>
        </Button>

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Complete Payment</h1>
          <p className="text-muted-foreground mt-1">Pay your 20% deposit to confirm this booking</p>
        </div>

        {/* Booking Summary */}
        <Card className="border-2" style={{ borderColor: '#fed7aa' }}>
          <CardContent className="pt-5 space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium" style={{ color: '#c2410c' }}>
              <Store className="h-4 w-4" />
              Booking Summary
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <Store className="h-4 w-4" />Vendor
                </span>
                <span className="font-semibold">{booking.business_name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />Event Date
                </span>
                <span className="font-semibold">{formatDate(booking.event_date)}</span>
              </div>
              {booking.event_type && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Event Type</span>
                  <span className="font-semibold">{booking.event_type}</span>
                </div>
              )}
            </div>

            <div className="border-t border-border pt-3 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Agreed Amount</span>
                <span className="font-semibold">NPR {totalAmount.toLocaleString()}</span>
              </div>

              {/* Deposit row — highlighted */}
              <div className="flex justify-between items-center rounded-lg px-3 py-2" style={{ backgroundColor: '#fff7ed' }}>
                <div>
                  <p className="text-sm font-bold" style={{ color: '#c2410c' }}>Deposit Due Now (20%)</p>
                  <p className="text-xs text-muted-foreground">Pay to confirm your booking</p>
                </div>
                <span className="text-xl font-bold" style={{ color: '#c2410c' }}>
                  NPR {depositAmount.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Remaining Balance (80%)</p>
                  <p className="text-xs text-muted-foreground">Paid directly after the event</p>
                </div>
                <span className="font-semibold text-muted-foreground">
                  NPR {balanceAmount.toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Payment Buttons */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-center text-muted-foreground">Choose payment method</p>

          <div className="grid grid-cols-2 gap-3">
            {/* Option A: Real eSewa Redirect */}
            <button
              onClick={handleEsewaPayment}
              disabled={initiating}
              className="flex flex-col items-center gap-2.5 rounded-xl border-2 px-4 py-5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: '#60BB46', borderColor: '#4fa336' }}
            >
              {initiating
                ? <Loader2 className="h-6 w-6 animate-spin" />
                : <CreditCard className="h-6 w-6" />}
              <span>Pay via eSewa</span>
              <span className="text-xs font-normal opacity-90">Redirect to eSewa →</span>
            </button>

            {/* Option B: QR Code Demo */}
            <button
              onClick={() => setShowQR(true)}
              className="flex flex-col items-center gap-2.5 rounded-xl border-2 px-4 py-5 text-sm font-semibold transition-colors hover:opacity-90"
              style={{ borderColor: '#c2410c', color: '#c2410c', backgroundColor: '#fff7ed' }}
            >
              <QrCode className="h-6 w-6" />
              <span>Pay via QR Code</span>
              <span className="text-xs font-normal text-muted-foreground">📱 Demo Mode</span>
            </button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            eSewa UAT — test ID: <span className="font-mono">9806800001</span> &bull; Password: Nepal@123
          </p>
        </div>

        {/* Security note */}
        <p className="text-xs text-center text-muted-foreground">
          🔒 Payments are secured by eSewa EPay v2 with HMAC-SHA256 signature verification.
          Your remaining 80% (NPR {balanceAmount.toLocaleString()}) is settled directly with the vendor after the event.
        </p>
      </div>
    </>
  )
}
