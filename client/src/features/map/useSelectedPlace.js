import { useCallback, useEffect, useRef, useState } from 'react';
import { reversePlace } from '../../services/location';

/**
 * The one place that owns "which place is being inspected".
 *
 * Map clicks, pin clicks, and search results all land here so the map and the
 * details panel can never disagree about the current selection.
 *
 * Reverse lookups are guarded two ways: the previous in-flight request is
 * aborted, and every request carries a sequence number that is re-checked
 * before it is allowed to write state. A fast double-click therefore shows the
 * second click's result and never the first click's late arrival.
 */
const useSelectedPlace = () => {
  const [place, setPlace] = useState(null);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);

  const requestIdRef = useRef(0);
  const abortRef = useRef(null);

  const abortInFlight = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
  }, []);

  const clearSelection = useCallback(() => {
    requestIdRef.current += 1;
    abortInFlight();
    setPlace(null);
    setStatus('idle');
    setError(null);
  }, [abortInFlight]);

  /** Select an already-resolved place (search result, or an existing pin). */
  const selectPlace = useCallback((next) => {
    if (!next) return;
    requestIdRef.current += 1;
    abortInFlight();
    setPlace(next);
    setStatus('ready');
    setError(null);
  }, [abortInFlight]);

  /** Select raw coordinates and resolve them through the reverse endpoint. */
  const inspectCoordinates = useCallback(async ({ lat, lng }) => {
    abortInFlight();

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    const controller = new AbortController();
    abortRef.current = controller;

    setStatus('loading');
    setError(null);

    try {
      const res = await reversePlace(lat, lng, { signal: controller.signal });
      if (requestIdRef.current !== requestId) return;
      setPlace({ ...res.place, source: 'map' });
      setStatus('ready');
    } catch (err) {
      if (controller.signal.aborted || requestIdRef.current !== requestId) return;
      setPlace({ lat, lng, name: null, displayName: null, details: {}, source: 'map' });
      setStatus('ready');
      setError(err.message ?? 'Could not look up this spot');
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
    }
  }, [abortInFlight]);

  useEffect(() => abortInFlight, [abortInFlight]);

  return {
    place,
    status,
    error,
    isOpen: Boolean(place) || status === 'loading',
    selectPlace,
    inspectCoordinates,
    clearSelection,
  };
};

export default useSelectedPlace;
