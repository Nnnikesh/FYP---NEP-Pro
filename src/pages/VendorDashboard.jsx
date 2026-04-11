import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { useAuth } from '@/context/AuthContext.jsx'
import {
  Upload, Trash2, CalendarDays, MapPin, Clock, CheckCircle, XCircle,
  Images, Mail, Phone, User, AlertTriangle, TrendingUp, Edit3, Plus, X,
} from 'lucide-react'
import { EVENT_SUBCATEGORIES, DESIGN_GROUPS, EVENT_TYPES } from '@/lib/eventCategories.js'

const API = 'http://localhost:5001'

// ── Confirm Modal ──────────────────────────────────────────────────────────────
function ConfirmModal({ confirm, onClose }) {
  if (!confirm) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-background rounded-xl p-6 shadow-2xl max-w-sm w-full mx-4 space-y-4 border">
        <h3 className="font-semibold text-lg">{confirm.title}</h3>
        <p className="text-sm text-muted-foreground">{confirm.description}</p>
        <div className="flex gap-3 justify-end pt-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            variant={confirm.variant || 'destructive'}
            onClick={() => { confirm.onConfirm(); onClose() }}
          >
            {confirm.confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ── Status Banner ──────────────────────────────────────────────────────────────
function StatusBanner({ status }) {
  if (status === 'approved') return null
  if (status === 'pending') {
    return (
      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-4 py-3 text-sm dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-300">
        <Clock className="h-4 w-4 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-semibold">Profile Under Review</p>
          <p className="text-xs mt-0.5 opacity-80">
            Your vendor application is pending admin approval. You won't appear in the marketplace until approved.
          </p>
        </div>
      </div>
    )
  }
  if (status === 'rejected') {
    return (
      <div className="flex items-start gap-3 bg-destructive/10 border border-destructive/30 text-destructive rounded-lg px-4 py-3 text-sm">
        <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-semibold">Application Rejected</p>
          <p className="text-xs mt-0.5 opacity-80">
            Your vendor application was not approved. Update your profile and contact support if you believe this is an error.
          </p>
        </div>
      </div>
    )
  }
  if (status === 'suspended') {
    return (
      <div className="flex items-start gap-3 bg-destructive/10 border border-destructive/30 text-destructive rounded-lg px-4 py-3 text-sm">
        <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-semibold">Account Suspended</p>
          <p className="text-xs mt-0.5 opacity-80">
            Your account has been suspended. Please contact support.
          </p>
        </div>
      </div>
    )
  }
  return null
}

// ── Stats Row ──────────────────────────────────────────────────────────────────
function StatsRow({ photos, bookings }) {
  const pending = bookings.filter(b => b.status === 'pending').length
  const confirmed = bookings.filter(b => b.status === 'confirmed').length
  const completed = bookings.filter(b => b.status === 'completed').length

  const cards = [
    { label: 'Photos', value: photos.length, icon: Images },
    { label: 'Pending', value: pending, icon: Clock, urgent: pending > 0 },
    { label: 'Confirmed', value: confirmed, icon: CheckCircle },
    { label: 'Completed', value: completed, icon: TrendingUp },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {cards.map(c => (
        <Card key={c.label} className={c.urgent ? 'border-amber-400' : ''}>
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <c.icon className={`h-4 w-4 ${c.urgent ? 'text-amber-500' : 'text-primary'}`} />
            </div>
            <div>
              <p className="text-xl font-bold leading-none">{c.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{c.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// ── Photo Upload Tab ───────────────────────────────────────────────────────────
function PhotosTab({ token, vendorId, onPhotosChange, setConfirm }) {
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [eventType, setEventType] = useState('')
  const [designGroup, setDesignGroup] = useState('')
  const [subcategory, setSubcategory] = useState('')
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [fileKey, setFileKey] = useState(0)
  const [error, setError] = useState('')

  const designGroups = eventType ? (DESIGN_GROUPS[eventType] || []) : []
  const subcategories = eventType ? (EVENT_SUBCATEGORIES[eventType] || []) : []

  const loadPhotos = async () => {
    try {
      const res = await fetch(`${API}/api/vendors/${vendorId}/photos`)
      if (res.ok) {
        const data = await res.json()
        setPhotos(data)
        onPhotosChange?.(data)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (vendorId) loadPhotos()
  }, [vendorId])

  const handleFileChange = (e) => {
    const selected = e.target.files[0]
    if (!selected) return
    setFile(selected)
    setPreview(URL.createObjectURL(selected))
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!file) return
    setUploading(true)
    setError('')

    const formData = new FormData()
    formData.append('photo', file)
    formData.append('caption', title)
    formData.append('event_type', eventType)
    formData.append('design_name', designGroup)
    formData.append('subcategory', subcategory)
    formData.append('description', description)

    try {
      const res = await fetch(`${API}/api/vendors/photos`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed.')
      setFile(null)
      setPreview(null)
      setTitle('')
      setDescription('')
      setEventType('')
      setDesignGroup('')
      setSubcategory('')
      setFileKey(k => k + 1)
      loadPhotos()
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = (photoId) => {
    setConfirm({
      title: 'Delete Photo?',
      description: 'This photo will be permanently removed from your portfolio.',
      confirmLabel: 'Delete',
      variant: 'destructive',
      onConfirm: async () => {
        const res = await fetch(`${API}/api/vendors/photos/${photoId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) loadPhotos()
      },
    })
  }

  return (
    <div className="space-y-6">
      {/* Upload form */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            Upload Portfolio Photo
          </h3>

          {/* Structure guide */}
          <div className="mb-4 p-3 rounded-lg bg-orange-50 border border-orange-200 text-orange-800 text-xs space-y-1 dark:bg-orange-950/30 dark:border-orange-800 dark:text-orange-300">
            <p className="font-semibold">Portfolio structure: 3 designs × 4 photos each</p>
            <p>Select the correct Event Type → Design Group → Sub-category so your portfolio stays consistently organised.</p>
          </div>

          <form onSubmit={handleUpload} className="space-y-4">
            {/* Event Type */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Event Type <span className="text-destructive">*</span>
              </label>
              <select
                value={eventType}
                onChange={(e) => { setEventType(e.target.value); setDesignGroup(''); setSubcategory('') }}
                required
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">Select event type...</option>
                {EVENT_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Design Group — only shown for structured event types */}
            {eventType && designGroups.length > 0 && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Design Group <span className="text-destructive">*</span>
                </label>
                <select
                  value={designGroup}
                  onChange={(e) => setDesignGroup(e.target.value)}
                  required
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="">Select design group...</option>
                  {designGroups.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Sub-category */}
            {eventType && subcategories.length > 0 && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Sub-category <span className="text-destructive">*</span>
                </label>
                <select
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                  required
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="">Select sub-category...</option>
                  {subcategories.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Photo upload */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Photo <span className="text-destructive">*</span>
              </label>
              {preview && (
                <img src={preview} alt="preview" className="w-48 h-48 object-cover rounded-lg border border-border mb-2" />
              )}
              <Input
                key={fileKey}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileChange}
                required
              />
              <p className="text-xs text-muted-foreground">JPG, PNG or WebP — max 5MB</p>
            </div>

            {/* Title */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Title</label>
              <Input
                placeholder="e.g. Traditional Newari Mandap Setup"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Description (optional) */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Description <span className="text-muted-foreground font-normal normal-case">(optional)</span>
              </label>
              <textarea
                className="w-full min-h-[72px] rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                placeholder="Describe this photo or decoration setup..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" disabled={uploading || !file} className="gap-2">
              <Upload className="h-4 w-4" />
              {uploading ? 'Uploading...' : 'Upload Photo'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Photo grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="aspect-square bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : photos.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Images className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>No photos yet. Upload your first portfolio photo!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {photos.map((p) => (
            <div key={p.id} className="group relative rounded-xl overflow-hidden shadow border border-border">
              <img
                src={`${API}${p.photo_url}`}
                alt={p.caption || ''}
                className="w-full h-48 object-cover"
              />
              <div className="p-2 bg-background">
                {p.caption && <p className="text-sm font-medium truncate">{p.caption}</p>}
                <div className="flex flex-wrap gap-1 mt-1">
                  {p.event_type && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      {p.event_type}
                    </span>
                  )}
                  {p.design_name && (
                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                      {p.design_name}
                    </span>
                  )}
                  {p.subcategory && (
                    <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                      {p.subcategory}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleDelete(p.id)}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-destructive text-destructive-foreground rounded-full p-1.5 transition-opacity"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Bookings Tab ───────────────────────────────────────────────────────────────
function BookingsTab({ token, onBookingsChange, setConfirm }) {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const res = await fetch(`${API}/api/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setBookings(data)
        onBookingsChange?.(data)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const updateStatus = async (id, status) => {
    await fetch(`${API}/api/bookings/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    })
    load()
  }

  const confirmDecline = (bookingId, hostName) => {
    setConfirm({
      title: 'Decline Booking?',
      description: `This will cancel the booking request from ${hostName || 'this client'}.`,
      confirmLabel: 'Decline',
      variant: 'destructive',
      onConfirm: () => updateStatus(bookingId, 'cancelled'),
    })
  }

  const statusColor = {
    pending: 'secondary',
    confirmed: 'default',
    cancelled: 'destructive',
    completed: 'outline',
  }

  return (
    <div className="space-y-4">
      {loading ? (
        [...Array(3)].map((_, i) => (
          <Card key={i}><CardContent className="pt-6"><div className="h-20 bg-muted animate-pulse rounded" /></CardContent></Card>
        ))
      ) : bookings.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <CalendarDays className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>No bookings yet.</p>
        </div>
      ) : (
        bookings.map((b) => (
          <Card key={b.id}>
            <CardContent className="pt-5 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <p className="font-semibold flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    {b.host_name || 'Client'}
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    {b.host_email && (
                      <a href={`mailto:${b.host_email}`} className="flex items-center gap-1 hover:text-primary">
                        <Mail className="h-3 w-3" />{b.host_email}
                      </a>
                    )}
                    {b.host_phone && (
                      <a href={`tel:${b.host_phone}`} className="flex items-center gap-1 hover:text-primary">
                        <Phone className="h-3 w-3" />{b.host_phone}
                      </a>
                    )}
                  </div>
                  <div className="mt-1 space-y-1.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                      🎉 {b.event_type || 'General Event'}
                    </span>
                    {b.design_name && (
                      <p className="text-xs font-semibold" style={{ color: '#c2410c' }}>
                        Design: {b.design_name}
                      </p>
                    )}
                    {b.selected_services && (
                      <div className="flex flex-wrap gap-1">
                        {b.selected_services.split(',').map(s => s.trim()).filter(Boolean).map(s => (
                          <span key={s} className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full border border-border">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3 mt-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-4 w-4" />
                      {b.event_date ? new Date(b.event_date).toLocaleDateString() : '—'}
                    </span>
                    {b.event_location && (
                      <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{b.event_location}</span>
                    )}
                    {b.agreed_amount && (
                      <span className="font-medium text-foreground">NPR {Number(b.agreed_amount).toLocaleString()}</span>
                    )}
                    {b.payment_method === 'cash' ? (
                      <span className="text-xs text-amber-600 font-medium">Cash</span>
                    ) : b.payment_status === 'paid' ? (
                      <span className="flex items-center gap-1 text-green-600 font-semibold text-xs">
                        <CheckCircle className="h-3.5 w-3.5" /> Fully Paid
                      </span>
                    ) : b.deposit_status === 'paid' ? (
                      <span className="flex items-center gap-1 text-blue-600 font-semibold text-xs">
                        <CheckCircle className="h-3.5 w-3.5" /> Deposit Paid (20%)
                      </span>
                    ) : null}
                  </div>
                </div>
                <Badge variant={statusColor[b.status] || 'secondary'} className="capitalize flex-shrink-0">
                  {b.status}
                </Badge>
              </div>

              {b.notes && (
                <p className="text-sm text-muted-foreground border-l-2 border-border pl-3">{b.notes}</p>
              )}

              {b.status === 'pending' && (
                <div className="flex gap-2 pt-1">
                  <Button size="sm" className="gap-1" onClick={() => updateStatus(b.id, 'confirmed')}>
                    <CheckCircle className="h-4 w-4" />Confirm
                  </Button>
                  <Button
                    size="sm" variant="destructive" className="gap-1"
                    onClick={() => confirmDecline(b.id, b.host_name)}
                  >
                    <XCircle className="h-4 w-4" />Decline
                  </Button>
                </div>
              )}

              {b.status === 'confirmed' && (
                <Button size="sm" variant="outline" className="gap-1 bg-transparent" onClick={() => updateStatus(b.id, 'completed')}>
                  <CheckCircle className="h-4 w-4" />Mark Completed
                </Button>
              )}

              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />Received {new Date(b.created_at).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}

// ── Profile Edit Tab ───────────────────────────────────────────────────────────
function ProfileTab({ token, vendor }) {
  const [form, setForm] = useState({
    business_name: vendor.business_name || '',
    description: vendor.description || '',
    location: vendor.location || '',
    price_range: vendor.price_range || '',
    image_url: vendor.image_url || '',
    specializations: vendor.specializations?.filter(Boolean) || [],
    services: vendor.services?.filter(Boolean) || [],
  })
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [newService, setNewService] = useState('')

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  const toggleSpec = (spec) => {
    setForm(f => ({
      ...f,
      specializations: f.specializations.includes(spec)
        ? f.specializations.filter(s => s !== spec)
        : [...f.specializations, spec],
    }))
  }

  const addService = () => {
    const s = newService.trim()
    if (s && !form.services.includes(s)) {
      setForm(f => ({ ...f, services: [...f.services, s] }))
      setNewService('')
    }
  }

  const removeService = (s) => setForm(f => ({ ...f, services: f.services.filter(x => x !== s) }))

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`${API}/api/vendors/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Save failed.')
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-2xl">
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg px-4 py-3 text-sm font-medium dark:bg-green-950/30 dark:border-green-800 dark:text-green-300">
          Profile updated successfully.
        </div>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}

      <Card>
        <CardHeader><CardTitle className="text-base">Business Information</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Business Name <span className="text-destructive">*</span></label>
            <Input value={form.business_name} onChange={set('business_name')} required />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Description</label>
            <textarea
              className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
              placeholder="Tell clients about your business, experience, and style..."
              value={form.description}
              onChange={set('description')}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Location</label>
              <Input placeholder="e.g. Kathmandu, Bhaktapur" value={form.location} onChange={set('location')} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Price Range</label>
              <Input placeholder="e.g. NPR 50,000 – 2,00,000" value={form.price_range} onChange={set('price_range')} />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Profile Image URL</label>
            <Input placeholder="https://..." value={form.image_url} onChange={set('image_url')} />
            <p className="text-xs text-muted-foreground">Paste a direct link to your business logo or photo.</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Event Specializations</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {EVENT_TYPES.map(spec => (
              <button
                key={spec}
                type="button"
                onClick={() => toggleSpec(spec)}
                className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
                  form.specializations.includes(spec)
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border text-muted-foreground hover:border-primary hover:text-foreground'
                }`}
              >
                {spec}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Services Offered</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="e.g. Flower Decoration"
              value={newService}
              onChange={(e) => setNewService(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addService() } }}
            />
            <Button type="button" variant="outline" size="sm" onClick={addService} className="gap-1 shrink-0">
              <Plus className="h-4 w-4" />Add
            </Button>
          </div>
          {form.services.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {form.services.map(s => (
                <span key={s} className="flex items-center gap-1 text-sm bg-muted px-3 py-1 rounded-full">
                  {s}
                  <button type="button" onClick={() => removeService(s)} className="ml-1 text-muted-foreground hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Button type="submit" disabled={saving} className="gap-2">
        <Edit3 className="h-4 w-4" />
        {saving ? 'Saving...' : 'Save Profile'}
      </Button>
    </form>
  )
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export default function VendorDashboard() {
  const { user, token } = useAuth()
  const [vendor, setVendor] = useState(null)
  const [photos, setPhotos] = useState([])
  const [bookings, setBookings] = useState([])
  const [confirm, setConfirm] = useState(null)

  useEffect(() => {
    if (!token) return
    fetch(`${API}/api/vendors/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((v) => setVendor(v))
      .catch(() => {})
  }, [token])

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl space-y-6">
      <ConfirmModal confirm={confirm} onClose={() => setConfirm(null)} />

      <div>
        <h1 className="text-3xl font-bold">Vendor Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back, {user?.name}</p>
      </div>

      {vendor && <StatusBanner status={vendor.status} />}

      <StatsRow photos={photos} bookings={bookings} />

      <Tabs defaultValue="photos">
        <TabsList className="mb-6">
          <TabsTrigger value="photos" className="gap-2">
            <Images className="h-4 w-4" />Photos
          </TabsTrigger>
          <TabsTrigger value="bookings" className="gap-2">
            <CalendarDays className="h-4 w-4" />Bookings
          </TabsTrigger>
          <TabsTrigger value="profile" className="gap-2">
            <Edit3 className="h-4 w-4" />Profile
          </TabsTrigger>
        </TabsList>

        <TabsContent value="photos">
          <PhotosTab
            token={token}
            vendorId={vendor?.id}
            onPhotosChange={setPhotos}
            setConfirm={setConfirm}
          />
        </TabsContent>

        <TabsContent value="bookings">
          <BookingsTab
            token={token}
            onBookingsChange={setBookings}
            setConfirm={setConfirm}
          />
        </TabsContent>

        <TabsContent value="profile">
          {vendor
            ? <ProfileTab token={token} vendor={vendor} />
            : <div className="h-40 bg-muted animate-pulse rounded-lg" />
          }
        </TabsContent>
      </Tabs>
    </div>
  )
}
