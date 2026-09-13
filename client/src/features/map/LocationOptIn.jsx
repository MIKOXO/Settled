import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MapPin, Trash2, Loader2 } from 'lucide-react';
import { setMyLocation, removeMyLocation } from '../../services/location';
import { upsertParticipantLocation, removeParticipantLocation } from '../../store/boardSlice';
import PlaceSearch from './PlaceSearch';
import BoardMap from './BoardMap';

const LocationOptIn = ({ boardId }) => {
  const dispatch = useDispatch();
  const myId = useSelector((state) => state.session?.id);
  const myLocation = useSelector((state) =>
    state.board.participantLocations.find((l) => l.participantId === myId),
  );

  const [pickMode, setPickMode] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSearchSelect = async (place) => {
    if (!place) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await setMyLocation(boardId, {
        lat: place.lat,
        lng: place.lng,
        label: place.placeName,
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
      const res = await setMyLocation(boardId, { lat, lng, label: null });
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

      {!pickMode && (
        <div className="mt-3 flex gap-2">
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
        <div className="mt-3 space-y-2">
          <PlaceSearch onSelect={handleSearchSelect} placeholder="Search for a place..." />
          <button
            type="button"
            onClick={() => setPickMode(null)}
            className="font-sans text-xs text-text-muted hover:text-text-primary transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      {pickMode === 'map' && (
        <div className="mt-3 space-y-2">
          <p className="font-sans text-xs text-accent">
            Tap anywhere on the map to set your location
          </p>
          <BoardMap onMapClick={handleMapClick} selectable />
          <button
            type="button"
            onClick={() => setPickMode(null)}
            className="font-sans text-xs text-text-muted hover:text-text-primary transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default LocationOptIn;
