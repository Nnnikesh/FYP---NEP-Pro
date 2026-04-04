import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapPin, Building2, Home } from 'lucide-react'
import { Input } from '@/components/ui/input.jsx'

// Fix leaflet default marker icon broken in Vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const VENUES = [
  {
    id: 'norling',
    name: 'Norling Grand Resort',
    area: 'Bhaktapur',
    stars: 5,
    lat: 27.6728,
    lng: 85.4298,
  },
  {
    id: 'gokarna',
    name: 'Gokarna Forest Resort',
    area: 'Gokarna, Kathmandu',
    stars: 5,
    lat: 27.7344,
    lng: 85.3799,
  },
  {
    id: 'soaltee',
    name: 'Hotel Soaltee Crowne Plaza',
    area: 'Tahachal, Kathmandu',
    stars: 5,
    lat: 27.7000,
    lng: 85.2955,
  },
  {
    id: 'yak',
    name: 'Hotel Yak & Yeti',
    area: 'Durbar Marg, Kathmandu',
    stars: 5,
    lat: 27.7042,
    lng: 85.3194,
  },
  {
    id: 'hyatt',
    name: 'Hyatt Regency Kathmandu',
    area: 'Boudha, Kathmandu',
    stars: 5,
    lat: 27.7173,
    lng: 85.3620,
  },
  {
    id: 'radisson',
    name: 'Radisson Hotel Kathmandu',
    area: 'Lazimpat, Kathmandu',
    stars: 4,
    lat: 27.7187,
    lng: 85.3159,
  },
  {
    id: 'own',
    name: 'Own Venue',
    area: 'Your custom location',
    stars: null,
    lat: 27.7172,
    lng: 85.3240,
  },
]

function StarBadge({ count }) {
  if (!count) return null
  return (
    <span className="text-xs text-amber-500 font-semibold">
      {'★'.repeat(count)} {count}-star
    </span>
  )
}

// Moves map view when selected venue changes
function FlyTo({ lat, lng }) {
  const map = useMap()
  useEffect(() => {
    map.flyTo([lat, lng], 14, { duration: 1 })
  }, [lat, lng])
  return null
}

// Lets user click map to place custom marker
function ClickHandler({ onMapClick, enabled }) {
  useMapEvents({
    click(e) {
      if (enabled) onMapClick(e.latlng)
    },
  })
  return null
}

export default function LocationPicker({ value, onChange }) {
  const [selected, setSelected] = useState(null)
  const [ownText, setOwnText] = useState('')
  const [customPin, setCustomPin] = useState(null)

  // Init from existing value string
  useEffect(() => {
    if (value && !selected) {
      const match = VENUES.find((v) => value.startsWith(v.name))
      if (match) setSelected(match)
    }
  }, [])

  function selectVenue(venue) {
    setSelected(venue)
    if (venue.id !== 'own') {
      setOwnText('')
      setCustomPin(null)
      onChange(`${venue.name} — ${venue.area}`)
    } else {
      onChange(ownText || '')
    }
  }

  function handleOwnText(e) {
    setOwnText(e.target.value)
    onChange(e.target.value)
  }

  function handleMapClick(latlng) {
    setCustomPin(latlng)
    const label = ownText
      ? `${ownText} (${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)})`
      : `Custom location (${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)})`
    onChange(label)
  }

  const mapCenter = selected
    ? [selected.lat, selected.lng]
    : [27.7172, 85.324]

  const pinPos = selected?.id === 'own' && customPin
    ? [customPin.lat, customPin.lng]
    : selected
    ? [selected.lat, selected.lng]
    : null

  return (
    <div className="space-y-3">
      {/* Venue cards */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {VENUES.map((venue) => {
          const isOwn = venue.id === 'own'
          const active = selected?.id === venue.id
          return (
            <button
              key={venue.id}
              type="button"
              onClick={() => selectVenue(venue)}
              className={`flex flex-col items-start gap-1 rounded-lg border p-3 text-left text-sm transition-all
                ${active
                  ? 'border-primary bg-primary/10 ring-1 ring-primary'
                  : 'border-border bg-background hover:border-primary/50 hover:bg-accent'
                }`}
            >
              {isOwn
                ? <Home className="h-4 w-4 text-primary" />
                : <Building2 className="h-4 w-4 text-primary" />}
              <span className="font-medium leading-tight">{venue.name}</span>
              {isOwn
                ? <span className="text-xs text-muted-foreground">Your place</span>
                : <StarBadge count={venue.stars} />}
              <span className="text-xs text-muted-foreground">{venue.area}</span>
            </button>
          )
        })}
      </div>

      {/* Own venue text input */}
      {selected?.id === 'own' && (
        <div className="space-y-1">
          <Input
            placeholder="Enter your venue address or name"
            value={ownText}
            onChange={handleOwnText}
          />
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            Or click on the map below to pin your exact location
          </p>
        </div>
      )}

      {/* Map */}
      {selected && (
        <div className="rounded-lg overflow-hidden border border-border" style={{ height: 260 }}>
          <MapContainer
            center={mapCenter}
            zoom={14}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <FlyTo lat={selected.lat} lng={selected.lng} />
            <ClickHandler
              enabled={selected.id === 'own'}
              onMapClick={handleMapClick}
            />
            {pinPos && (
              <Marker position={pinPos}>
                <Popup>
                  {selected.id === 'own'
                    ? ownText || 'Your venue'
                    : `${selected.name}\n${selected.area}`}
                </Popup>
              </Marker>
            )}
          </MapContainer>
        </div>
      )}
    </div>
  )
}
