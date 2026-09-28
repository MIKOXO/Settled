import { z } from 'zod';

export const searchPlacesSchema = z.object({
  q: z.string().trim().min(1, 'Query parameter q is required').max(200),
});

// `z.coerce.number()` turns an empty query param into 0, which would silently
// geocode null island. Blank params are turned into `undefined` first so they
// fail validation instead — a literal `0` is still a valid coordinate.
const coordinate = (min, max) =>
  z.preprocess(
    (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
    z.coerce.number().min(min).max(max),
  );

export const reversePlaceSchema = z.object({
  lat: coordinate(-90, 90),
  lng: coordinate(-180, 180),
});
