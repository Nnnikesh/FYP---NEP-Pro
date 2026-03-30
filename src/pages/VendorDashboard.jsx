import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Card, CardContent } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { useAuth } from '@/context/AuthContext.jsx'
import { Upload, Trash2, CalendarDays, MapPin, Clock, CheckCircle, XCircle, Images } from 'lucide-react'
import { EVENT_CATEGORIES, EVENT_TYPES } from '@/lib/eventCategories.js'

const API = 'http://localhost:5001'

// ── Photo Upload Tab ───────────────────────────────────────────────────────────
function PhotosTab({ token, vendorId }) {
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [caption, setCaption] = useState('')
  const [eventType, setEventType] = useState('')
  const [subcategory, setSubcategory] = useState('')
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState('')

  // Subcategories available for the selected event type
  const subcategories = eventType ? (EVENT_CATEGORIES[eventType] || []) : []

  const loadPhotos = async () => {
    try {
      const res = await fetch(`${API}/api/vendors/${vendorId}/photos`)
      if (res.ok) setPhotos(await res.json())
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
    formData.append('caption', caption)
    formData.append('event_type', eventType)
    formData.append('subcategory', subcategory)

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
      setCaption('')
      setEventType('')
      setSubcategory('')
      loadPhotos()
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (photoId) => {
    if (!confirm('Delete this photo?')) return
    const res = await fetch(`${API}/api/vendors/photos/${photoId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (res.ok) loadPhotos()
  }

  return (
    <div className="space-y-6">
      {/* Upload form */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            Upload Event Photo
          </h3>
          <form onSubmit={handleUpload} className="space-y-4">
            {/* Preview */}
            {preview && (
              <img
                src={preview}
                alt="preview"
                className="w-48 h-48 object-cover rounded-lg border border-border"
              />
            )}

            <div>
              <Input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileChange}
                required
              />
              <p className="text-xs text-muted-foreground mt-1">JPG, PNG or WebP — max 5MB</p>
            </div>

            <Input
              placeholder="Caption (e.g. Traditional Newari Mandap Setup)"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />

            {/* Level 1 — Event Type */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Event Type <span className="text-destructive">*</span>
              </label>
              <select
                value={eventType}
                onChange={(e) => { setEventType(e.target.value); setSubcategory('') }}
                required
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">Select event type...</option>
                {EVENT_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Level 2 — Subcategory (appears after event type is selected) */}
            {eventType && subcategories.length > 0 && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Decoration Type <span className="text-destructive">*</span>
                </label>
                <select
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                  required
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="">Select decoration type...</option>
                  {subcategories.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            )}

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
          <p>No photos yet. Upload your first event photo!</p>
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
function BookingsTab({ token }) {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const res = await fetch(`${API}/api/bookings/vendor`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) setBookings(await res.json())
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
          <Card key={i}><CardContent className="pt-6"><div className="h-16 bg-muted animate-pulse rounded" /></CardContent></Card>
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
                <div>
                  <p className="font-semibold">{b.host_name || 'Client'}</p>
                  <div className="flex flex-wrap gap-3 mt-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><CalendarDays className="h-4 w-4" />{b.event_date}</span>
                    {b.event_location && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{b.event_location}</span>}
                  </div>
                </div>
                <Badge variant={statusColor[b.status] || 'secondary'} className="capitalize flex-shrink-0">
                  {b.status}
                </Badge>
              </div>
              {b.notes && <p className="text-sm text-muted-foreground border-l-2 border-border pl-3">{b.notes}</p>}
              {b.status === 'pending' && (
                <div className="flex gap-2 pt-1">
                  <Button size="sm" className="gap-1" onClick={() => updateStatus(b.id, 'confirmed')}>
                    <CheckCircle className="h-4 w-4" />Confirm
                  </Button>
                  <Button size="sm" variant="destructive" className="gap-1" onClick={() => updateStatus(b.id, 'cancelled')}>
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

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export default function VendorDashboard() {
  const { user, token } = useAuth()
  const [vendorId, setVendorId] = useState(null)

  // Load vendor ID from /api/vendors/me
  useEffect(() => {
    if (!token) return
    fetch(`${API}/api/vendors/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((v) => setVendorId(v.id))
      .catch(() => {})
  }, [token])

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Vendor Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back, {user?.name}</p>
      </div>

      <Tabs defaultValue="photos">
        <TabsList className="mb-6">
          <TabsTrigger value="photos" className="gap-2">
            <Images className="h-4 w-4" />Photos
          </TabsTrigger>
          <TabsTrigger value="bookings" className="gap-2">
            <CalendarDays className="h-4 w-4" />Bookings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="photos">
          <PhotosTab token={token} vendorId={vendorId} />
        </TabsContent>
        <TabsContent value="bookings">
          <BookingsTab token={token} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
