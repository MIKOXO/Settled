import { catchAsync } from '../utils/catchAsync.js';
import { ok } from '../utils/respond.js';
import { reversePlaceSchema, searchPlacesSchema } from '../validators/places.js';
import * as placesService from '../services/placesService.js';

export const searchPlaces = catchAsync(async (req, res) => {
  const { q } = searchPlacesSchema.parse(req.query);
  return ok(res, { results: await placesService.searchPlaces(q) });
});

export const reversePlace = catchAsync(async (req, res) => {
  const { lat, lng } = reversePlaceSchema.parse(req.query);
  const { place, cacheStatus } = await placesService.reversePlace(lat, lng);
  res.set('X-Place-Cache', cacheStatus);
  return ok(res, { place });
});