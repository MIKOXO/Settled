import axios from 'axios';
import { env } from '../config/env.js';
import { createAppError } from '../utils/AppError.js';

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';

export const searchPlaces = async (query) => {
  if (!env.NOMINATIM_USER_AGENT) {
    throw createAppError('Place search is not configured', 503);
  }

  const response = await axios.get(`${NOMINATIM_BASE}/search`, {
    params: {
      q: query,
      format: 'json',
      limit: 10,
      addressdetails: 0,
      extratags: 0,
      namedetails: 0,
    },
    headers: {
      'User-Agent': env.NOMINATIM_USER_AGENT,
    },
    timeout: 5000,
  });

  const results = response.data.map((item) => ({
    name: item.display_name,
    lat: parseFloat(item.lat),
    lng: parseFloat(item.lon),
  }));

  return results;
};
