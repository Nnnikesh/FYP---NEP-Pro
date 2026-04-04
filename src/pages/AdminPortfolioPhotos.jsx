import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext.jsx'
import { Input } from '@/components/ui/input.jsx'
import AdminBottomNav from '@/components/AdminBottomNav.jsx'
import {
  Search, X, ArrowLeft, Images, ZoomIn, Calendar, Store,
  ChevronLeft, ChevronRight,
} from 'lucide-react'

const API = 'http://localhost:5001'

export default function AdminPortfolioPhotos() {
  const { token } = useAuth()
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [eventFilter, setEventFilter] = useState('all')
  const [lightbox, setLightbox] = useState(null) // { photo, index }

  useEffect(() => {
    fetch(`${API}/api/admin/photos`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => setPhotos(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token])

  // Close lightbox on Escape, navigate with arrow keys
  useEffect(() => {
    if (!lightbox) return
    const handleKey = (e) => {
      if (e.key === 'Escape') setLightbox(null)
      if (e.key === 'ArrowRight') navigate(1)
      if (e.key === 'ArrowLeft') navigate(-1)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [lightbox])

  const eventTypes = useMemo(() => {
    return [...new Set(photos.map(p => p.event_type).filter(Boolean))].sort()
  }, [photos])

  const filtered = useMemo(() => {
    return photos.filter(p => {
      const q = search.toLowerCase()
      const matchesSearch = !q || p.business_name.toLowerCase().includes(q)
      const matchesEvent = eventFilter === 'all' || p.event_type === eventFilter
      return matchesSearch && matchesEvent
    })
  }, [photos, search, eventFilter])

  const openLightbox = (photo) => {
    const index = filtered.findIndex(p => p.id === photo.id)
    setLightbox({ photo, index })
  }

  const navigate = (dir) => {
    if (!lightbox) return
    const next = lightbox.index + dir
    if (next < 0 || next >= filtered.length) return
    setLightbox({ photo: filtered[next], index: next })
  }

  return (
    <div className="min-h-screen bg-[#fdf6f0] pb-24">

      {/* ── Lightbox ──────────────────────────────────────────────────── */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
          onClick={() => setLightbox(null)}
        >
          {/* Prev */}
          {lightbox.index > 0 && (
            <button
              onClick={e => { e.stopPropagation(); navigate(-1) }}
              className="absolute left-3 sm:left-6 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-colors"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          {/* Modal */}
          <div
            className="relative max-w-2xl w-full rounded-2xl overflow-hidden shadow-2xl bg-white"
            onClick={e => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={() => setLightbox(null)}
              className="absolute top-3 right-3 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Image */}
            <div className="bg-gray-100 flex items-center justify-center max-h-[65vh] overflow-hidden">
              <img
                src={`${API}${lightbox.photo.photo_url}`}
                alt={lightbox.photo.caption || lightbox.photo.business_name}
                className="w-full max-h-[65vh] object-contain"
              />
            </div>

            {/* Info */}
            <div className="px-5 py-4 space-y-2 bg-white">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-gray-900 flex items-center gap-1.5 text-sm">
                  <Store className="h-4 w-4 text-[#C2570B]" />
                  {lightbox.photo.business_name}
                </span>
                {lightbox.photo.event_type && (
                  <span className="text-[11px] bg-orange-100 text-[#C2570B] px-2 py-0.5 rounded-full font-semibold">
                    {lightbox.photo.event_type}
                  </span>
                )}
                {lightbox.photo.subcategory && (
                  <span className="text-[11px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">
                    {lightbox.photo.subcategory}
                  </span>
                )}
              </div>
              {lightbox.photo.caption && (
                <p className="text-sm text-gray-600">{lightbox.photo.caption}</p>
              )}
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(lightbox.photo.created_at).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric',
                  })}
                </p>
                <span className="text-xs text-gray-400">
                  {lightbox.index + 1} / {filtered.length}
                </span>
              </div>
            </div>
          </div>

          {/* Next */}
          {lightbox.index < filtered.length - 1 && (
            <button
              onClick={e => { e.stopPropagation(); navigate(1) }}
              className="absolute right-3 sm:right-6 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-colors"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}
        </div>
      )}

      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-[#fdf6f0] border-b border-orange-200 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Link
            to="/admin"
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#C2570B] transition-colors shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>

          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Images className="h-5 w-5 text-[#C2570B] shrink-0" />
              Portfolio Photos
            </h1>
          </div>

          <span className="shrink-0 text-sm font-semibold text-[#C2570B] bg-orange-100 px-3 py-1 rounded-full">
            {photos.length} total
          </span>
        </div>
      </div>

      {/* ── Content ───────────────────────────────────────────────────── */}
      <div className="container mx-auto px-4 py-6 space-y-4">

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by vendor name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-9 bg-white border-orange-200 focus-visible:ring-[#C2570B]/30 focus-visible:border-[#C2570B]"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Event type filter chips */}
        {eventTypes.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setEventFilter('all')}
              className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
                eventFilter === 'all'
                  ? 'bg-[#C2570B] text-white border-[#C2570B]'
                  : 'bg-white border-orange-200 text-gray-600 hover:border-[#C2570B] hover:text-[#C2570B]'
              }`}
            >
              All Events
            </button>
            {eventTypes.map(et => (
              <button
                key={et}
                onClick={() => setEventFilter(eventFilter === et ? 'all' : et)}
                className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
                  eventFilter === et
                    ? 'bg-[#C2570B] text-white border-[#C2570B]'
                    : 'bg-white border-orange-200 text-gray-600 hover:border-[#C2570B] hover:text-[#C2570B]'
                }`}
              >
                {et}
              </button>
            ))}
          </div>
        )}

        {/* Result count */}
        {!loading && (
          <p className="text-xs text-gray-500">
            {filtered.length === photos.length
              ? `Showing all ${photos.length} photo${photos.length !== 1 ? 's' : ''}`
              : `${filtered.length} of ${photos.length} photos`}
          </p>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="rounded-xl overflow-hidden bg-white shadow-sm animate-pulse">
                <div className="aspect-[4/3] bg-orange-100/60" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-orange-100 rounded w-3/4" />
                  <div className="h-2.5 bg-orange-50 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-gray-400 space-y-3">
            <Images className="h-14 w-14 mx-auto opacity-20" />
            <p className="text-sm font-medium">
              {search ? `No photos match "${search}"` : 'No portfolio photos yet.'}
            </p>
            {search && (
              <button
                onClick={() => setSearch('')}
                className="text-xs text-[#C2570B] underline underline-offset-2"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map(photo => (
              <div
                key={photo.id}
                className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border border-orange-100 hover:border-orange-300"
                onClick={() => openLightbox(photo)}
              >
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden bg-orange-50">
                  <img
                    src={`${API}${photo.photo_url}`}
                    alt={photo.caption || photo.business_name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-all flex items-center justify-center">
                    <ZoomIn className="h-7 w-7 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
                  </div>
                  {/* Event type badge */}
                  {photo.event_type && (
                    <span className="absolute top-2 left-2 text-[10px] font-bold bg-[#C2570B] text-white px-2 py-0.5 rounded-full shadow-sm">
                      {photo.event_type}
                    </span>
                  )}
                </div>

                {/* Card footer */}
                <div className="px-3 py-2.5">
                  <p className="text-sm font-semibold text-gray-900 truncate leading-tight">
                    {photo.business_name}
                  </p>
                  {photo.caption && (
                    <p className="text-xs text-gray-500 truncate mt-0.5">{photo.caption}</p>
                  )}
                  <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-1">
                    <Calendar className="h-3 w-3 shrink-0" />
                    {new Date(photo.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AdminBottomNav />
    </div>
  )
}
