// Central config for all event types and their decoration subcategories.
// Used in MarketplacePage (filter), VendorDashboard (upload), VendorProfilePage (tabs).

export const EVENT_CATEGORIES = {
  Wedding: [
    'Mandap Setup',
    'Entrance Decor',
    'Stage Decoration',
    'Chair & Table Setup',
    'Floral Arrangements',
    'Lighting Setup',
    'Wedding Ceremony Area',
  ],
  Bratabandha: [
    'Bratabandha Mandap',
    'Pooja Setup',
    'Traditional Decor',
    'Seating Arrangement',
    'Flower Decoration',
  ],
  Pooja: [
    'Pooja Setup',
    'Altar Decoration',
    'Flower Arrangements',
    'Lighting & Diyo Setup',
  ],
  'Birthday Party': [
    'Stage & Backdrop',
    'Balloon Decoration',
    'Table Setup',
    'Entrance Decoration',
    'Lighting',
  ],
  'Corporate Event': [
    'Stage Setup',
    'Banner & Backdrop',
    'Table & Chair Setup',
    'Entrance Decoration',
  ],
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
  Engagement: [
    'Stage Decoration',
    'Floral Arrangements',
    'Entrance Decor',
    'Table Setup',
    'Lighting',
  ],
}

// Ordered list of event type names for rendering buttons
export const EVENT_TYPES = Object.keys(EVENT_CATEGORIES)
