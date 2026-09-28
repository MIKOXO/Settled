import { catchAsync } from '../utils/catchAsync.js';
import { reversePlaceSchema, searchPlacesSchema } from '../validators/places.js';
import * as placesService from '../services/placesService.js';

export const searchPlaces = catchAsync(async (req, res) => {
  const { q } = searchPlacesSchema.parse(req.query);
  const results = await placesService.searchPlaces(q);
  res.status(200).json({
    success: true,
    data: { results },
    error: null,
  });
});

export const reversePlace = catchAsync(async (req, res) => {
  const { lat, lng } = reversePlaceSchema.parse(req.query);
  const { place, cacheStatus } = await placesService.reversePlace(lat, lng);
  res.set('X-Place-Cache', cacheStatus);
  res.status(200).json({
    success: true,
    data: { place },
    error: null,
  });
});
