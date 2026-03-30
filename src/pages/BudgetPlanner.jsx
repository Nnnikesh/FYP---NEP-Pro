import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Card, CardContent } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Trash2, PlusCircle, Wallet, CheckCircle2, Circle } from 'lucide-react'

const CATEGORIES = [
  'Venue', 'Catering', 'Decoration', 'Mandap', 'Flowers',
  'Photography', 'Videography', 'Music / Band', 'Lighting',
  'Invitation Cards', 'Priest / Pandit', 'Transportation',
  'Clothing', 'Jewellery', 'Miscellaneous',
]

let nextId = 1

const fmt = (n) =>
  new Intl.NumberFormat('ne-NP', {
    style: 'currency',
    currency: 'NPR',
    maximumFractionDigits: 0,
  }).format(n || 0)

export default function BudgetPlanner() {
  const [totalBudget, setTotalBudget] = useState('')
  const [items, setItems] = useState([
    { id: nextId++, category: 'Venue', description: '', estimated: '', actual: '', paid: false },
  ])

  const addItem = () =>
    setItems((prev) => [
      ...prev,
      { id: nextId++, category: 'Decoration', description: '', estimated: '', actual: '', paid: false },
    ])

  const removeItem = (id) => setItems((prev) => prev.filter((i) => i.id !== id))

  const update = (id, field, value) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, [field]: value } : i)))

  const togglePaid = (id) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, paid: !i.paid } : i)))

  const budget = parseFloat(totalBudget) || 0
  const totalEstimated = items.reduce((s, i) => s + (parseFloat(i.estimated) || 0), 0)
  const totalActual    = items.reduce((s, i) => s + (parseFloat(i.actual)    || 0), 0)
  const totalPaid      = items.filter((i) => i.paid).reduce((s, i) => s + (parseFloat(i.actual || i.estimated) || 0), 0)
  const remaining      = budget - totalEstimated
  const overBudget     = budget > 0 && remaining < 0
  const budgetUsedPct  = budget > 0 ? Math.min((totalEstimated / budget) * 100, 100) : 0
  const paidPct        = totalEstimated > 0 ? Math.min((totalPaid / totalEstimated) * 100, 100) : 0
  const paidCount      = items.filter((i) => i.paid).length

  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl space-y-8">

      {/* ── Header ── */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Wallet className="h-8 w-8 text-primary" />
          NPR Budget Planner
        </h1>
        <p className="text-muted-foreground mt-1">Plan your event budget in Nepalese Rupees</p>
      </div>

      {/* ── Total Budget Input ── */}
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
                  className={`h-full rounded-full transition-all duration-500 ${
                    overBudget ? 'bg-destructive' : 'bg-primary'
                  }`}
                  style={{ width: `${budgetUsedPct}%` }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Budget',    value: fmt(budget),         color: 'text-foreground' },
          { label: 'Total Estimated', value: fmt(totalEstimated), color: 'text-primary' },
          { label: 'Total Actual',    value: fmt(totalActual),    color: 'text-blue-600 dark:text-blue-400' },
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

      {/* ── Payment Progress ── */}
      {items.length > 0 && (
        <Card>
          <CardContent className="pt-5 pb-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span className="font-medium text-sm">Payment Progress</span>
              </div>
              <Badge variant="outline">
                {paidCount} / {items.length} paid
              </Badge>
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

      {/* ── Items Table ── */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          {/* Header row */}
          <div className="hidden sm:grid grid-cols-[auto_2fr_2fr_1fr_1fr_auto_auto] gap-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide pb-2 border-b border-border">
            <span>Paid</span>
            <span>Category</span>
            <span>Description</span>
            <span>Estimated (NPR)</span>
            <span>Actual (NPR)</span>
            <span />
          </div>

          {items.map((item) => (
            <div
              key={item.id}
              className={`grid grid-cols-1 sm:grid-cols-[auto_2fr_2fr_1fr_1fr_auto_auto] gap-3 items-center rounded-lg p-2 -mx-2 transition-colors ${
                item.paid ? 'bg-green-50 dark:bg-green-950/20' : ''
              }`}
            >
              {/* Paid toggle */}
              <button
                type="button"
                onClick={() => togglePaid(item.id)}
                className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-muted transition-colors mx-auto"
                title={item.paid ? 'Mark unpaid' : 'Mark paid'}
              >
                {item.paid ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground" />
                )}
              </button>

              {/* Category */}
              <select
                value={item.category}
                onChange={(e) => update(item.id, 'category', e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>

              {/* Description */}
              <Input
                placeholder="Description"
                value={item.description}
                onChange={(e) => update(item.id, 'description', e.target.value)}
                className={item.paid ? 'line-through text-muted-foreground' : ''}
              />

              {/* Estimated */}
              <Input
                type="number"
                min="0"
                placeholder="0"
                value={item.estimated}
                onChange={(e) => update(item.id, 'estimated', e.target.value)}
              />

              {/* Actual */}
              <Input
                type="number"
                min="0"
                placeholder="0"
                value={item.actual}
                onChange={(e) => update(item.id, 'actual', e.target.value)}
              />

              {/* Paid badge (mobile) */}
              {item.paid && (
                <Badge variant="outline" className="sm:hidden text-green-600 border-green-400 w-fit">
                  Paid
                </Badge>
              )}

              {/* Delete */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeItem(item.id)}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <Button
            variant="outline"
            className="gap-2 bg-transparent mt-2"
            onClick={addItem}
          >
            <PlusCircle className="h-4 w-4" />
            Add Item
          </Button>
        </CardContent>
      </Card>

      {/* ── Over budget warning ── */}
      {overBudget && (
        <div className="rounded-lg border border-destructive bg-destructive/10 px-4 py-3 text-sm text-destructive font-medium">
          ⚠ You are over budget by {fmt(Math.abs(remaining))}. Consider reducing some estimated costs.
        </div>
      )}
    </div>
  )
}
