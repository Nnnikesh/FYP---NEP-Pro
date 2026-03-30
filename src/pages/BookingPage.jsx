import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Card, CardContent } from '@/components/ui/card.jsx'
import { useAuth } from '@/context/AuthContext.jsx'
import { CalendarDays, MapPin, Send, ArrowLeft, CheckCircle, PartyPopper } from 'lucide-react'

const API = 'http://localhost:5001'

export default function BookingPage() {
  const { vendorId } = useParams()
  const navigate = useNavigate()
  const { user, token } = useAuth()

  const [vendor, setVendor] = useState(null)
  const [form, setForm] = useState({ event_date: '', event_type: '', event_location: '', notes: '' })
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('')

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

  const handleSubmit = async (e) => {
    e.preventDefault()
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
                rows={5}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
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
  )
}
