import axios from 'axios';
import { env } from '../config/env.js';
import { createAppError } from '../utils/AppError.js';
import { createTtlCache } from '../utils/ttlCache.js';
import { fetchWikipediaSummary } from '../utils/wikipedia.js';

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';

const REVERSE_CACHE_TTL_MS = 10 * 60 * 1000;
const COORDINATE_PRECISION = 5;

const DETAIL_SOURCES = {
  openingHours: ['opening_hours'],
  phone: ['phone', 'contact:phone'],
  website: ['website', 'contact:website'],
  cuisine: ['cuisine'],
  wheelchair: ['wheelchair'],
};

const reverseCache = createTtlCache({ ttlMs: REVERSE_CACHE_TTL_MS });

const coordinateKey = (lat, lng) =>
  `${lat.toFixed(COORDINATE_PRECISION)},${lng.toFixed(COORDINATE_PRECISION)}`;

const requireNominatim = (feature) => {
  if (!env.NOMINATIM_USER_AGENT) {
    throw createAppError(feature, 503);
  }
};

const pickDetails = (extratags) => {
  const details = {};
  if (!extratags) return details;

  for (const [detail, sources] of Object.entries(DETAIL_SOURCES)) {
    for (const source of sources) {
      const value = extratags[source];
      if (value) {
        details[detail] = String(value);
        break;
      }
    }
  }

  return details;
};

/** Place shape for coordinates with no OSM feature behind them. */
const emptyPlace = (lat, lng) => ({
  osmType: null,
  osmId: null,
  name: null,
  category: null,
  type: null,
  displayName: null,
  lat,
  lng,
  address: null,
  details: {},
  wikipedia: null,
  wikiTags: { wikipediaTag: null, wikidataId: null },
});

/** Trims a Nominatim jsonv2 object down to the fields the client renders. */
const toPlace = (item, lat, lng) => ({
  osmType: item.osm_type ?? null,
  osmId: item.osm_id ?? null,
  name: item.name ?? null,
  category: item.category ?? null,
  type: item.type ?? null,
  displayName: item.display_name ?? null,
  lat: Number(item.lat ?? lat),
  lng: Number(item.lon ?? lng),
  address: item.address ?? null,
  details: pickDetails(item.extratags),
  // Raw OSM wikipedia/wikidata pointers, plus the resolved Wikipedia summary
  // (null when no article exists or the lookup fails).
  wikipedia: null,
  wikiTags: {
    wikipediaTag: item.extratags?.wikipedia ?? null,
    wikidataId: item.extratags?.wikidata ?? null,
  },
});

const request = (path, params) =>
  axios.get(`${NOMINATIM_BASE}${path}`, {
    params,
    headers: { 'User-Agent': env.NOMINATIM_USER_AGENT },
    timeout: 5000,
  });

/** Attaches the Wikipedia summary for the place's wikidata/wikipedia pointer. */
const withSummary = async (place) => {
  const { wikiTags = { wikipediaTag: null, wikidataId: null }, ...rest } = place;
  if (!wikiTags.wikipediaTag && !wikiTags.wikidataId) {
    return { ...rest, wikipedia: null };
  }
  const summary = await fetchWikipediaSummary(wikiTags);
  return { ...rest, wikipedia: summary };
};

export const searchPlaces = async (query) => {
  requireNominatim('Place search is not configured');

  const response = await request('/search', {
    q: query,
    format: 'jsonv2',
    limit: 10,
    addressdetails: 1,
    extratags: 1,
  });

  const places = response.data.map((item) =>
    toPlace(item, parseFloat(item.lat), parseFloat(item.lon)),
  );

  return Promise.all(places.map(withSummary));
};

export const reversePlace = async (lat, lng) => {
  requireNominatim('Place lookup is not configured');

  const key = coordinateKey(lat, lng);
  const cached = reverseCache.get(key);
  if (cached) {
    return { place: cached, cacheStatus: 'hit' };
  }

  const response = await request('/reverse', {
    lat,
    // Nominatim's reverse endpoint names the longitude param `lon`; our own
    // query param stays `lng` to match the rest of the app's coordinates.
    lon: lng,
    zoom: 18,
    format: 'jsonv2',
    addressdetails: 1,
    extratags: 1,
  });

  // jsonv2 /reverse resolves to a single object; /search to an array.
  const base = response.data
    ? toPlace(response.data, lat, lng)
    : emptyPlace(lat, lng);
  const place = await withSummary(base);
  reverseCache.set(key, place);

  return { place, cacheStatus: 'miss' };
};
