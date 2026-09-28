/**
 * Presentation helpers for the trimmed OSM place shape returned by
 * `GET /api/places/search` and `GET /api/places/reverse`.
 *
 * Everything here is pure and takes community-edited OpenStreetMap data, so
 * each helper treats its input as untrusted: no HTML is ever constructed, and
 * URLs are only handed back once their scheme is confirmed to be http(s).
 */

const LOCALITY_KEYS = [
  'suburb',
  'neighbourhood',
  'quarter',
  'city',
  'town',
  'village',
  'municipality',
  'state',
  'postcode',
  'country',
];

/** "amenity" + "fast_food" -> "Fast food"; "leisure" alone -> "Leisure". */
export const humanizePlaceCategory = (category, type) => {
  const raw = type || category;
  if (!raw) return null;
  const text = String(raw).replace(/[_-]+/g, ' ').trim();
  if (!text) return null;
  return text.charAt(0).toUpperCase() + text.slice(1);
};

/** One readable line from Nominatim's structured address object. */
export const formatPlaceAddress = (address) => {
  if (!address || typeof address !== 'object') return null;

  const parts = [];
  const push = (value) => {
    const text = typeof value === 'string' ? value.trim() : '';
    if (text && !parts.includes(text)) parts.push(text);
  };

  // Street and house number read as one line, so they are joined before the
  // remaining parts are walked — otherwise the number shows up twice.
  const { house_number: house, road } = address;
  if (house && road) push(`${house} ${road}`);
  else push(road ?? house);

  for (const key of LOCALITY_KEYS) {
    push(address[key]);
  }

  return parts.length > 0 ? parts.join(', ') : null;
};

export const formatCoordinates = (lat, lng) =>
  `${Number(lat).toFixed(5)}, ${Number(lng).toFixed(5)}`;

/** Only http(s) links are ever rendered — `javascript:` and friends are dropped. */
export const toSafeHttpUrl = (value) => {
  if (typeof value !== 'string' || !value.trim()) return null;
  try {
    const url = new URL(value.trim());
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null;
  } catch {
    return null;
  }
};

/** Strips everything a `tel:` URI cannot carry, leaving `+` and digits. */
export const toTelHref = (value) => {
  if (typeof value !== 'string') return null;
  const cleaned = value.replace(/[^\d+]/g, '');
  return cleaned ? `tel:${cleaned}` : null;
};

/** OSM wheelchair values are yes/no/limited — render them as prose. */
export const humanizeWheelchair = (value) => {
  const text = String(value ?? '').trim().toLowerCase();
  if (!text) return null;
  if (text === 'yes' || text === 'permissive') return 'Wheelchair accessible';
  if (text === 'no') return 'Not wheelchair accessible';
  if (text === 'limited') return 'Limited wheelchair access';
  return `Wheelchair access: ${text}`;
};

export const humanizeCuisine = (value) => {
  const text = String(value ?? '').trim();
  if (!text) return null;
  return text.replace(/[_-]+/g, ' ');
};

/** Detail rows the panel can render, in a fixed order, only when populated. */
export const buildPlaceDetailRows = (place) => {
  const details = place?.details ?? {};
  const rows = [];

  if (details.openingHours) {
    rows.push({ id: 'openingHours', label: 'Opening hours', value: details.openingHours });
  }

  if (details.phone) {
    rows.push({ id: 'phone', label: 'Phone', value: details.phone, href: toTelHref(details.phone) });
  }

  const website = toSafeHttpUrl(details.website);
  if (website) {
    rows.push({ id: 'website', label: 'Website', value: details.website, href: website });
  }

  if (details.cuisine) {
    rows.push({ id: 'cuisine', label: 'Cuisine', value: humanizeCuisine(details.cuisine) });
  }

  if (details.wheelchair) {
    rows.push({
      id: 'wheelchair',
      label: 'Accessibility',
      value: humanizeWheelchair(details.wheelchair),
    });
  }

  return rows;
};
