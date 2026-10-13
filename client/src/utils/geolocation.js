/**
 * Device position, best-effort.
 *
 * Two stages, because a single high-accuracy request is unreliable in a way
 * that is easy to miss. `enableHighAccuracy: true` forces a GPS hardware lock,
 * and a cold one can take far longer than any timeout you'd be willing to make
 * the user sit through — 10s is not unusual to blow. `maximumAge: 0` makes it
 * worse by refusing to reuse a recent fix. The result is a button that times
 * out on the devices that most need it.
 *
 * So: ask for the accurate fix first, and if it times out, fall back to the
 * network/Wi-Fi position, which typically returns in about a second. The
 * fallback is coarse, so `accuracy` comes back large and the caller can warn
 * the user rather than silently pinning everyone to the middle of a district.
 *
 * Permission denial is deliberately NOT retried — the user already said no,
 * and asking again is worse than telling them where to go instead.
 */

const PERMISSION_DENIED = 1;
const POSITION_UNAVAILABLE = 2;
const TIMEOUT = 3;

const requestPosition = ({ enableHighAccuracy, timeout, maximumAge }) =>
  new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      const err = new Error('This browser cannot detect your location.');
      err.code = null;
      reject(err);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy ?? null,
        }),
      (error) => {
        // Matched against the literal codes, not `error.PERMISSION_DENIED`:
        // those constants are declared on the GeolocationPositionError
        // *interface*, so whether a given instance carries them is up to the
        // browser. The numbers themselves are fixed by the spec.
        const err = new Error(
          error.code === PERMISSION_DENIED
            ? 'Location permission denied. You can still pick your spot on the map.'
            : error.code === TIMEOUT
              ? 'Timed out finding you — try picking your spot on the map.'
              : 'Could not get a location fix. Try picking on the map.',
        );
        err.code = error.code;
        reject(err);
      },
      { enableHighAccuracy, timeout, maximumAge },
    );
  });

export const getAccuratePosition = async ({
  timeout = 12000,
  maximumAge = 30000,
  fallbackTimeout = 6000,
} = {}) => {
  try {
    return await requestPosition({
      enableHighAccuracy: true,
      timeout,
      // Not 0: a fix from the last half minute is still accurate to where the
      // user is standing, and reusing it is the difference between an instant
      // answer and waiting on the hardware.
      maximumAge,
    });
  } catch (err) {
    const retryable =
      err.code === TIMEOUT || err.code === POSITION_UNAVAILABLE;
    if (!retryable) throw err;

    // Coarse, but far better than failing outright. `maximumAge` is generous
    // here because the whole point of the fallback is speed.
    return requestPosition({
      enableHighAccuracy: false,
      timeout: fallbackTimeout,
      maximumAge: 60000,
    });
  }
};

// The radius a fix is actually good to. "Accurate" is only a meaningful claim
// if the user can see how accurate.
export const formatAccuracy = (meters) => {
  if (meters == null || Number.isNaN(meters)) return null;
  if (meters < 1000) return `±${Math.round(meters / 10) * 10} m`;
  return `±${(meters / 1000).toFixed(1)} km`;
};

// A fix worse than this is usually a cell-tower or Wi-Fi guess rather than a
// real position — indoors, or a device that never got a GPS lock. Worth
// flagging rather than silently pinning everyone to the middle of a district.
export const WEAK_ACCURACY_METERS = 200;

export const isWeakAccuracy = (meters) =>
  meters != null && meters > WEAK_ACCURACY_METERS;