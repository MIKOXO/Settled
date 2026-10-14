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

const assertNominatimConfigured = (message) => {
  if (!env.NOMINATIM_USER_AGENT) {
    throw createAppError(message, 503);
  }
};

const pickDetails = (extratags) => {
  if (!extratags) return {};

  const details = {};
  for (const [detail, sources] of Object.entries(DETAIL_SOURCES)) {
    const source = sources.find((key) => extratags[key]);
    if (source) details[detail] = String(extratags[source]);
  }
  return details;
};

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

/** Attaches the resolved Wikipedia summary (null when there isn't one). */
const withSummary = async (place) => {
  const { wikiTags, ...rest } = place;
  if (!wikiTags.wikipediaTag && !wikiTags.wikidataId) {
    return { ...rest, wikipedia: null };
  }
  return { ...rest, wikipedia: await fetchWikipediaSummary(wikiTags) };
};

export const searchPlaces = async (query) => {
  assertNominatimConfigured('Place search is not configured');

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
  assertNominatimConfigured('Place lookup is not configured');

  const key = `${lat.toFixed(COORDINATE_PRECISION)},${lng.toFixed(COORDINATE_PRECISION)}`;
  const cached = reverseCache.get(key);
  if (cached) {
    return { place: cached, cacheStatus: 'hit' };
  }

  const response = await request('/reverse', {
    lat,
    // Nominatim names the longitude param `lon`; ours stays `lng` to match the
    // rest of the app's coordinates.
    lon: lng,
    zoom: 18,
    format: 'jsonv2',
    addressdetails: 1,
    extratags: 1,
  });

  // jsonv2 /reverse resolves to one object; /search to an array. No match at all
  // comes back as an error payload, which becomes an empty place.
  const place = await withSummary(
    response.data ? toPlace(response.data, lat, lng) : toPlace({}, lat, lng),
  );
  reverseCache.set(key, place);

  return { place, cacheStatus: 'miss' };
};