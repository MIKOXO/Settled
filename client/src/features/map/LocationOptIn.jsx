import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, useReducedMotion } from 'framer-motion';
import { MapPin, Trash2, Loader2, X } from 'lucide-react';
import { setMyLocation, removeMyLocation } from '../../services/location';
import { upsertParticipantLocation, removeParticipantLocation } from '../../store/boardSlice';
import PlaceSearch from './PlaceSearch';
import BoardMap from './BoardMap';

const LocationOptIn = ({ boardId, prefill }) => {
  const dispatch = useDispatch();
  const myId = useSelector((state) => state.session?.id);
  const myLocation = useSelector((state) =>
    state.board.participantLocations.find((l) => l.participantId === myId),
  );
  const reduceMotion = useReducedMotion();

  const [pickMode, setPickMode] = useState(null);
  const [pendingShare, setPendingShare] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // A place handed over from the map's details panel. It only fills the label —
  // sharing still has to be confirmed here so the disclosure below is read
  // before the exact location leaves the device. Each handoff is a fresh
  // object, so re-picking the same place still re-opens the confirmation.
  // Seeded with null, not `prefill`, so a prefill already present at mount
  // (this subtree unmounts on every tab change) is still applied.
  const [seenPrefill, setSeenPrefill] = useState(null);
  if (prefill && prefill !== seenPrefill) {
    setSeenPrefill(prefill);
    setPickMode(null);
    setError(null);
    setPendingShare(prefill);
  }

  // The location schema's `label` is .optional(), not nullable — omit it
  // rather than send null, same rule as the option form's placeName.
  const confirmShare = async () => {
    if (!pendingShare) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await setMyLocation(boardId, {
        lat: pendingShare.lat,
        lng: pendingShare.lng,
        ...(pendingShare.placeName ? { label: pendingShare.placeName } : {}),
      });
      dispatch(upsertParticipantLocation(res));
      setPendingShare(null);
    } catch (err) {
      setError(err.message ?? 'Could not save location');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSearchSelect = async (place) => {
    if (!place) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await setMyLocation(boardId, {
        lat: place.lat,
        lng: place.lng,
        ...(place.placeName ? { label: place.placeName } : {}),
      });
      dispatch(upsertParticipantLocation(res));
      setPickMode(null);
    } catch (err) {
      setError(err.message ?? 'Could not save location');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMapClick = async ({ lat, lng }) => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await setMyLocation(boardId, { lat, lng });
      dispatch(upsertParticipantLocation(res));
      setPickMode(null);
    } catch (err) {
      setError(err.message ?? 'Could not save location');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await removeMyLocation(boardId);
      dispatch(removeParticipantLocation(myId));
    } catch (err) {
      setError(err.message ?? 'Could not remove location');
    } finally {
      setSubmitting(false);
    }
  };

  if (pendingShare) {
    return (
      <div className="rounded-card border border-accent/50 bg-surface p-4">
        <div className="flex items-start gap-2.5">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
          <div className="min-w-0 flex-1">
            <p className="font-sans text-sm font-medium text-text-primary">
              Share this spot as your location
            </p>
            <p className="mt-0.5 truncate font-sans text-xs text-text-muted">
              {pendingShare.placeName ??
                `${pendingShare.lat.toFixed(4)}, ${pendingShare.lng.toFixed(4)}`}
            </p>
          </div>
        </div>

        <p className="mt-3 font-sans text-xs text-text-muted">
          Your exact location will be visible to everyone on this board.
        </p>

        {error && <p className="mt-2 font-sans text-xs text-error">{error}</p>}

        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={confirmShare}
            disabled={submitting}
            className="flex flex-1 items-center justify-center gap-2 rounded-btn bg-accent px-3 py-2 font-sans text-sm font-semibold text-background transition-all duration-200 hover:brightness-110 disabled:opacity-50"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
            Share location
          </button>
          <button
            type="button"
            onClick={() => { setPendingShare(null); setError(null); }}
            disabled={submitting}
            className="rounded-btn border border-border px-3 py-2 font-sans text-sm text-text-muted transition-colors duration-200 hover:text-text-primary disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  if (myLocation) {
    return (
      <div className="rounded-card border border-border bg-surface p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent-secondary" />
            <div>
              <p className="font-sans text-sm font-medium text-text-primary">
                Your location is shared
              </p>
              <p className="mt-0.5 font-sans text-xs text-text-muted">
                {myLocation.label ?? `${myLocation.lat.toFixed(4)}, ${myLocation.lng.toFixed(4)}`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            disabled={submitting}
            className="flex shrink-0 items-center gap-1.5 rounded-btn border border-border px-2.5 py-1.5 font-sans text-xs text-text-muted transition-colors duration-200 hover:border-error/50 hover:text-error disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
            Remove
          </button>
        </div>
        {error && (
          <p className="mt-2 font-sans text-xs text-error">{error}</p>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-card border border-border bg-surface p-4">
      <div className="flex items-center gap-2.5">
        <MapPin className="h-4 w-4 shrink-0 text-accent" />
        <h3 className="font-heading text-sm font-semibold text-text-primary">
          Share your location
        </h3>
      </div>

      <p className="mt-2 font-sans text-xs text-text-muted">
        Your exact location will be visible to everyone on this board.
      </p>

      {error && (
        <p className="mt-2 font-sans text-xs text-error">{error}</p>
      )}

      {/* Same pick-mode pattern as the option form's location picker: a
          revealed picker gets an explicit close that returns to the chooser. */}
      <motion.div
        key={pickMode ?? 'chooser'}
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        className="mt-3"
      >
        {!pickMode && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPickMode('search')}
              disabled={submitting}
              className="flex flex-1 items-center justify-center gap-2 rounded-btn border border-border px-3 py-2 font-sans text-sm text-text-primary transition-colors duration-200 hover:border-accent disabled:opacity-50"
            >
              Search for a place
            </button>
            <button
              type="button"
              onClick={() => setPickMode('map')}
              disabled={submitting}
              className="flex flex-1 items-center justify-center gap-2 rounded-btn border border-border px-3 py-2 font-sans text-sm text-text-primary transition-colors duration-200 hover:border-accent disabled:opacity-50"
            >
              Pick on map
            </button>
          </div>
        )}

        {pickMode === 'search' && (
          <div className="flex items-stretch gap-2">
            <div className="min-w-0 flex-1">
              <PlaceSearch onSelect={handleSearchSelect} placeholder="Search for a place..." />
            </div>
            <button
              type="button"
              onClick={() => setPickMode(null)}
              aria-label="Close place search"
              title="Back to location choices"
              className="flex w-11 shrink-0 items-center justify-center rounded-btn border border-border text-text-muted transition-colors duration-200 hover:border-accent hover:text-text-primary"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {pickMode === 'map' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <p className="font-sans text-xs text-accent">
                Tap anywhere on the map to set your location
              </p>
              <button
                type="button"
                onClick={() => setPickMode(null)}
                aria-label="Close map picker"
                title="Back to location choices"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-btn text-text-muted transition-colors duration-150 hover:bg-surface-2 hover:text-text-primary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <BoardMap onMapClick={handleMapClick} selectable />
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default LocationOptIn;
