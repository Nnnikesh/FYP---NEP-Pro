import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Card, CardContent } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Trash2, PlusCircle, Wallet, CheckCircle2, Circle, Store, Loader2 } from 'lucide-react'

const API = 'http://localhost:5001'

const CATEGORIES = [
  'Venue', 'Catering', 'Decoration', 'Mandap', 'Flowers',
  'Photography', 'Videography', 'Music / Band', 'Lighting',
  'Invitation Cards', 'Priest / Pandit', 'Transportation',
  'Clothing', 'Jewellery', 'Miscellaneous',
]

let nextId = 100

const fmt = (n) =>
  new Intl.NumberFormat('ne-NP', {
    style: 'currency',
    currency: 'NPR',
    maximumFractionDigits: 0,
  }).format(n || 0)

function categoryFromBooking(b) {
  const s = (b.selected_services || '').toLowerCase()
  if (s.includes('mandap'))      return 'Mandap'
  if (s.includes('photo'))       return 'Photography'
  if (s.includes('catering'))    return 'Catering'
  if (s.includes('music'))       return 'Music / Band'
  if (s.includes('light'))       return 'Lighting'
  if (s.includes('transport'))   return 'Transportation'
  return 'Decoration'
}

function paidAmountFromBooking(b) {
  const total = Number(b.agreed_amount || 0)
  if (b.payment_method === 'cash' && b.payment_status === 'paid') return total
  if (b.payment_status === 'paid') return total
  if (b.deposit_status === 'paid') return total * 0.2
  return 0
}

export default function BudgetPlanner() {
  const { token, user } = useAuth()

  const [totalBudget, setTotalBudget] = useState('')
  const [bookingItems, setBookingItems] = useState([])
  const [manualItems, setManualItems]   = useState([
    { id: nextId++, category: 'Venue', description: '', estimated: '', actual: '', paid: false },
  ])
  const [loadingBookings, setLoadingBookings] = useState(false)

  useEffect(() => {
    if (!token || user?.role !== 'host') return
    setLoadingBookings(true)
    fetch(`${API}/api/bookings`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data) ? data : []
        const withAmount = list.filter(b => b.agreed_amount && Number(b.agreed_amount) > 0)
        setBookingItems(withAmount.map(b => ({
          id: `booking-${b.id}`,
          bookingId: b.id,
          vendorId: b.vendor_id,
          category: categoryFromBooking(b),
          description: b.business_name || 'Vendor',
          services: b.selected_services || '',
          estimated: Number(b.agreed_amount),
          paidAmount: paidAmountFromBooking(b),
          depositPaid: b.deposit_status === 'paid',
          fullPaid: b.payment_status === 'paid',
          status: b.status,
          fromBooking: true,
        })))
      })
      .catch(() => {})
      .finally(() => setLoadingBookings(false))
  }, [token, user])

  const addItem = () =>
    setManualItems(prev => [
      ...prev,
      { id: nextId++, category: 'Decoration', description: '', estimated: '', actual: '', paid: false },
    ])

  const removeManual = (id) => setManualItems(prev => prev.filter(i => i.id !== id))

  const updateManual = (id, field, value) =>
    setManualItems(prev => prev.map(i => (i.id === id ? { ...i, [field]: value } : i)))

  const togglePaid = (id) =>
    setManualItems(prev => prev.map(i => (i.id === id ? { ...i, paid: !i.paid } : i)))

  const budget           = parseFloat(totalBudget) || 0
  const bookingEstimated = bookingItems.reduce((s, i) => s + i.estimated, 0)
  const manualEstimated  = manualItems.reduce((s, i) => s + (parseFloat(i.estimated) || 0), 0)
  const totalEstimated   = bookingEstimated + manualEstimated

  const bookingPaid  = bookingItems.reduce((s, i) => s + i.paidAmount, 0)
  const manualPaid   = manualItems.filter(i => i.paid).reduce((s, i) => s + (parseFloat(i.actual || i.estimated) || 0), 0)
  const totalPaid    = bookingPaid + manualPaid

  const manualActual = manualItems.reduce((s, i) => s + (parseFloat(i.actual) || 0), 0)
  const totalActual  = bookingPaid + manualActual

  const remaining      = budget - totalEstimated
  const overBudget     = budget > 0 && remaining < 0
  const budgetUsedPct  = budget > 0 ? Math.min((totalEstimated / budget) * 100, 100) : 0
  const paidPct        = totalEstimated > 0 ? Math.min((totalPaid / totalEstimated) * 100, 100) : 0
  const allItems       = bookingItems.length + manualItems.length
  const paidCount      = bookingItems.filter(i => i.fullPaid || (i.depositPaid && i.status !== 'completed')).length
                       + manualItems.filter(i => i.paid).length

  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Wallet className="h-8 w-8 text-primary" />
          NPR Budget Planner
        </h1>
        <p className="text-muted-foreground mt-1">Your confirmed bookings are tracked automatically</p>
      </div>

      {/* Total Budget Input */}
      <Card>
        <CardContent className="pt-6 space-y-3">
          <label className="text-sm font-medium block">Total Budget (NPR)</label>
          <Input
            type="number"
            min="0"
            placeholder="e.g. 500000"
            value={totalBudget}
            onChange={(e) => setTotalBudget(e.target.value)}
            className="max-w-xs text-lg font-semibold"
          />
          {budget > 0 && (
            <div className="max-w-xs space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Budget used</span>
                <span>{budgetUsedPct.toFixed(0)}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${overBudget ? 'bg-destructive' : 'bg-primary'}`}
                  style={{ width: `${budgetUsedPct}%` }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Budget',    value: fmt(budget),         color: 'text-foreground' },
          { label: 'Total Estimated', value: fmt(totalEstimated), color: 'text-primary' },
          { label: 'Total Paid',      value: fmt(totalPaid),      color: 'text-blue-600 dark:text-blue-400' },
          {
            label: budget > 0 ? (overBudget ? 'Over Budget' : 'Remaining') : 'Remaining',
            value: budget > 0 ? fmt(Math.abs(remaining)) : '—',
            color: overBudget ? 'text-destructive' : 'text-green-600 dark:text-green-400',
          },
        ].map(({ label, value, color }) => (
          <Card key={label}>
            <CardContent className="pt-4 pb-4 text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
              <p className={`text-xl font-bold ${color}`}>{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Payment Progress */}
      {allItems > 0 && (
        <Card>
          <CardContent className="pt-5 pb-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span className="font-medium text-sm">Payment Progress</span>
              </div>
              <Badge variant="outline">{paidCount} / {allItems} paid</Badge>
            </div>
            <div className="h-2.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all duration-500"
                style={{ width: `${paidPct}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Paid: {fmt(totalPaid)}</span>
              <span>Unpaid: {fmt(totalEstimated - totalPaid)}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Booking Items (auto) */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center gap-2">
            <Store className="h-4 w-4 text-primary" />
            <span className="font-semibold text-sm">From Your Bookings</span>
            {loadingBookings && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
          </div>

          {!loadingBookings && bookingItems.length === 0 && (
            <p className="text-sm text-muted-foreground py-3">
              No confirmed bookings with a set price yet.{' '}
              <Link to="/dashboard/client" className="text-primary underline underline-offset-2">
                View My Bookings
              </Link>
            </p>
          )}

          {bookingItems.length > 0 && (
            <div className="space-y-3">
              <div className="hidden sm:grid grid-cols-[2fr_2fr_1fr_1fr_auto] gap-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide pb-2 border-b border-border">
                <span>Vendor</span>
                <span>Services</span>
                <span>Agreed Amount</span>
                <span>Paid So Far</span>
                <span>Status</span>
              </div>

              {bookingItems.map(item => (
                <div
                  key={item.id}
                  className={`grid grid-cols-1 sm:grid-cols-[2fr_2fr_1fr_1fr_auto] gap-3 items-center rounded-lg p-3 border border-border ${
                    item.fullPaid ? 'bg-green-50 dark:bg-green-950/20' : item.depositPaid ? 'bg-orange-50/50 dark:bg-orange-950/10' : ''
                  }`}
                >
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold">{item.description}</p>
                    <Badge variant="outline" className="text-xs">{item.category}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{item.services || '—'}</p>
                  <p className="text-sm font-semibold">{fmt(item.estimated)}</p>
                  <p className={`text-sm font-semibold ${item.paidAmount > 0 ? 'text-green-600' : 'text-muted-foreground'}`}>
                    {item.paidAmount > 0 ? fmt(item.paidAmount) : '—'}
                  </p>
                  <div className="flex items-center gap-1.5">
                    {item.fullPaid ? (
                      <Badge className="bg-green-600 text-white text-xs">Paid</Badge>
                    ) : item.depositPaid ? (
                      <Badge className="bg-orange-500 text-white text-xs">Deposit Paid</Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs capitalize">{item.status}</Badge>
                    )}
                    <Link
                      to={`/booking/${item.bookingId}/design`}
                      className="text-xs text-primary underline underline-offset-2 whitespace-nowrap"
                    >
                      View Design
                    </Link>
                  </div>
                </div>
              ))}

              <div className="flex justify-between items-center pt-2 border-t border-border text-sm font-semibold">
                <span className="text-muted-foreground">Bookings Subtotal</span>
                <span>{fmt(bookingEstimated)}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manual Items */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <span className="font-semibold text-sm">Other Expenses</span>

          <div className="hidden sm:grid grid-cols-[auto_2fr_2fr_1fr_1fr_auto] gap-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide pb-2 border-b border-border">
            <span>Paid</span>
            <span>Category</span>
            <span>Description</span>
            <span>Estimated (NPR)</span>
            <span>Actual (NPR)</span>
            <span />
          </div>

          {manualItems.map(item => (
            <div
              key={item.id}
              className={`grid grid-cols-1 sm:grid-cols-[auto_2fr_2fr_1fr_1fr_auto] gap-3 items-center rounded-lg p-2 -mx-2 transition-colors ${
                item.paid ? 'bg-green-50 dark:bg-green-950/20' : ''
              }`}
            >
              <button
                type="button"
                onClick={() => togglePaid(item.id)}
                className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-muted transition-colors mx-auto"
              >
                {item.paid
                  ? <CheckCircle2 className="h-5 w-5 text-green-600" />
                  : <Circle className="h-5 w-5 text-muted-foreground" />}
              </button>

              <select
                value={item.category}
                onChange={e => updateManual(item.id, 'category', e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>

              <Input
                placeholder="Description"
                value={item.description}
                onChange={e => updateManual(item.id, 'description', e.target.value)}
                className={item.paid ? 'line-through text-muted-foreground' : ''}
              />

              <Input
                type="number"
                min="0"
                placeholder="0"
                value={item.estimated}
                onChange={e => updateManual(item.id, 'estimated', e.target.value)}
              />

              <Input
                type="number"
                min="0"
                placeholder="0"
                value={item.actual}
                onChange={e => updateManual(item.id, 'actual', e.target.value)}
              />

              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeManual(item.id)}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <Button variant="outline" className="gap-2 bg-transparent mt-2" onClick={addItem}>
            <PlusCircle className="h-4 w-4" />
            Add Item
          </Button>
        </CardContent>
      </Card>

      {overBudget && (
        <div className="rounded-lg border border-destructive bg-destructive/10 px-4 py-3 text-sm text-destructive font-medium">
          ⚠ You are over budget by {fmt(Math.abs(remaining))}. Consider reducing some estimated costs.
        </div>
      )}
    </div>
  )
}
