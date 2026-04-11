// Central config for all event types, their decoration subcategories, and design groups.
// Used in MarketplacePage (filter), VendorDashboard (upload), VendorProfilePage (tabs).

// Exactly 4 sub-categories per structured event type
export const EVENT_SUBCATEGORIES = {
  Wedding: [
    'Mandap Setup',
    'Entrance Decor',
    'Stage Decoration',
    'Photo Booth',
  ],
  Bratabandha: [
    'Mandap Setup',
    'Pooja Area',
    'Seating Arrangement',
    'Entrance Decor',
  ],
  Pooja: [
    'Pooja Mandap',
    'Ritual Setup',
    'Flower Decoration',
    'Seating Arrangement',
  ],
  Engagement: [
    'Stage Decoration',
    'Entrance Decor',
    'Floral Arrangement',
    'Photo Booth',
  ],
  'Birthday Party': [
    'Stage Backdrop',
    'Balloon Decor',
    'Cake Table Setup',
    'Photo Booth',
  ],
  'Corporate Event': [
    'Stage & Backdrop',
    'Entrance Decor',
    'Seating Arrangement',
    'AV & Lighting Setup',
  ],
  // Legacy event types kept for backward compatibility
  Pasni: [
    'Traditional Setup',
    'Decoration',
    'Seating Arrangement',
  ],
  'Osai Ceremony': [
    'Traditional Setup',
    'Decoration',
    'Seating Arrangement',
  ],
}

// Exactly 3 design group names per structured event type
export const DESIGN_GROUPS = {
  Wedding:          ['Floral Elegance', 'Traditional Newari', 'Royal Classic'],
  Bratabandha:      ['Simple Sacred', 'Traditional Gold', 'Modern Ceremony'],
  Pooja:            ['Simple Pooja', 'Grand Pooja', 'Traditional Setup'],
  Engagement:       ['Romantic Blush', 'Modern Chic', 'Garden Theme'],
  'Birthday Party': ['Colorful Fun', 'Elegant Celebration', 'Royal Theme'],
  'Corporate Event':['Professional', 'Modern Minimal', 'Grand Setup'],
}

// Backwards-compat alias used by existing imports
export const EVENT_CATEGORIES = EVENT_SUBCATEGORIES

// Ordered list of event type names for rendering buttons / dropdowns
export const EVENT_TYPES = Object.keys(EVENT_SUBCATEGORIES)
