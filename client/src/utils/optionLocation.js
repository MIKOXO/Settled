/**
 * The option form's place, in the shape the create/PATCH schemas accept.
 *
 * `placeName` is `.optional()`, not nullable — a manual map pin has no name, and
 * an explicit `null` fails Zod with a 400 — so it is spread in only when there
 * is something to send. Returns `null` for "clear the place", which is a
 * distinct instruction from omitting the field.
 */
export const toLocationPayload = (location) =>
  location
    ? {
        lat: location.lat,
        lng: location.lng,
        placeSource: location.placeSource,
        ...(location.placeName ? { placeName: location.placeName } : {}),
      }
    : null;