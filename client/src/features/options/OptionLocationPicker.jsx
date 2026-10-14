import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { MapPin, X } from 'lucide-react';
import PlaceSearch from '../map/PlaceSearch';
import BoardMap from '../map/BoardMap';

const iconButton =
  'flex h-7 w-7 shrink-0 items-center justify-center rounded-btn text-text-muted transition-colors duration-150 hover:bg-surface-2 hover:text-text-primary';

/**
 * The option's place, in the four states it can be in: unset, chosen, choosing
 * by search, choosing by map. Shared by the propose and edit forms so a place
 * set on creation and one swapped afterwards are reached the same way.
 *
 * Presentational — it owns only which picker is open. The value and the change
 * are the caller's.
 */
const OptionLocationPicker = ({ value, onChange }) => {
  const [mode, setMode] = useState(null);
  const reduceMotion = useReducedMotion();

  const setLocation = (next) => {
    onChange(next);
    setMode(null);
  };

  return (
    // One keyed wrapper per picker state, so chooser → search → map → set swaps
    // read as intentional transitions, not abrupt rewrites.
    <motion.div
      key={value ? 'set' : (mode ?? 'chooser')}
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
    >
      {value ? (
        <div className="flex items-center gap-2 rounded-btn border border-accent/50 bg-accent/5 px-3.5 py-2.5">
          <MapPin className="h-4 w-4 shrink-0 text-accent" />
          <span className="flex-1 truncate font-sans text-sm text-text-primary">
            {value.placeName ?? `${value.lat.toFixed(4)}, ${value.lng.toFixed(4)}`}
          </span>
          <button
            type="button"
            onClick={() => setLocation(null)}
            aria-label="Remove location"
            title="Remove location"
            className="shrink-0 text-text-muted transition-colors duration-150 hover:text-error"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : !mode ? (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode('search')}
            className="flex flex-1 items-center justify-center gap-2 rounded-btn border border-border bg-surface-2 px-3 py-2 font-sans text-sm text-text-muted transition-colors duration-200 hover:border-accent hover:text-text-primary"
          >
            <MapPin className="h-4 w-4" />
            Search for a place
          </button>
          <button
            type="button"
            onClick={() => setMode('map')}
            className="flex flex-1 items-center justify-center gap-2 rounded-btn border border-border bg-surface-2 px-3 py-2 font-sans text-sm text-text-muted transition-colors duration-200 hover:border-accent hover:text-text-primary"
          >
            <MapPin className="h-4 w-4" />
            Pick on map
          </button>
        </div>
      ) : mode === 'search' ? (
        // A revealed picker must offer an obvious way back — the other pick
        // option (Pick on map) is unreachable while this is open.
        <div className="flex items-stretch gap-2">
          <div className="min-w-0 flex-1">
            <PlaceSearch
              onSelect={(place) => {
                if (place) setLocation({ ...place, placeSource: 'search' });
              }}
              placeholder="Search for a place..."
            />
          </div>
          <button
            type="button"
            onClick={() => setMode(null)}
            aria-label="Close place search"
            title="Back to location choices"
            className="flex w-11 shrink-0 items-center justify-center rounded-btn text-text-muted transition-colors duration-200 hover:bg-surface-2 hover:text-text-primary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="font-sans text-xs text-accent">
              Tap anywhere on the map to set a location
            </p>
            <button
              type="button"
              onClick={() => setMode(null)}
              aria-label="Close map picker"
              title="Back to location choices"
              className={iconButton}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <BoardMap
            selectable
            onMapClick={(coords) => setLocation({ ...coords, placeName: null, placeSource: 'manual' })}
          />
        </div>
      )}
    </motion.div>
  );
};

export default OptionLocationPicker;