import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import BoardMap from './BoardMap';
import LocationOptIn from './LocationOptIn';
import PlaceDetailsPanel from './PlaceDetailsPanel';
import PlaceSearch from './PlaceSearch';
import useSelectedPlace from './useSelectedPlace';

/**
 * Owns the map tab's single "selected place" — map clicks, pin clicks, and
 * search results all feed the same state, so the details panel always describes
 * exactly one thing. Cross-feature handoff (proposing the place as an option)
 * is delegated upward to BoardPage via `onProposePlace`, which keeps this
 * feature from reaching into the options feature.
 */
const BoardMapSection = ({ boardId, onProposePlace, focus }) => {
  const { place, status, error, isOpen, selectPlace, inspectCoordinates, clearSelection } =
    useSelectedPlace();
  const participants = useSelector((state) => state.board.participants);
  const options = useSelector((state) => state.board.options);
  const participantLocations = useSelector((state) => state.board.participantLocations);
  const optionLocations = useSelector((state) => state.board.optionLocations);
  const [sharePrefill, setSharePrefill] = useState(null);
  const reduceMotion = useReducedMotion();

  // A pin handed over from another tab — a person from People, an option from
  // its card's place chip. Coordinates come from the store — the same pins
  // the map is already drawing — so there is nothing extra to resolve. A
  // `nonce` keeps repeat handoffs distinguishable.
  const focusTarget = useMemo(() => {
    if (!focus) return null;
    if (focus.optionId) {
      const loc = optionLocations.find((l) => l.optionId === focus.optionId);
      if (!loc) return null;
      return { optionId: loc.optionId, lat: loc.lat, lng: loc.lng, nonce: focus.nonce };
    }
    if (focus.participantId) {
      const loc = participantLocations.find(
        (l) => l.participantId === focus.participantId,
      );
      if (!loc) return null;
      return {
        participantId: loc.participantId,
        lat: loc.lat,
        lng: loc.lng,
        nonce: focus.nonce,
      };
    }
    return null;
  }, [focus, optionLocations, participantLocations]);

  // Selects the handed-over pin so the map and the details panel agree on what
  // is being looked at. Guarded by nonce so a later location update can't
  // reopen a panel the user has already dismissed.
  const handledFocus = useRef(null);
  useEffect(() => {
    if (!focusTarget || handledFocus.current === focusTarget.nonce) return;

    if (focusTarget.optionId) {
      const loc = optionLocations.find((l) => l.optionId === focusTarget.optionId);
      if (!loc) return;

      handledFocus.current = focusTarget.nonce;
      selectPlace({
        name:
          options.find((o) => o.id === loc.optionId)?.title ?? loc.placeName ?? 'Option',
        displayName: loc.placeName ?? null,
        lat: loc.lat,
        lng: loc.lng,
        address: null,
        details: {},
        source: 'option',
      });
      return;
    }

    const loc = participantLocations.find(
      (l) => l.participantId === focusTarget.participantId,
    );
    if (!loc) return;

    handledFocus.current = focusTarget.nonce;
    selectPlace({
      name:
        participants.find((p) => p.id === loc.participantId)?.displayName ?? 'Participant',
      displayName: loc.label ?? null,
      lat: loc.lat,
      lng: loc.lng,
      address: null,
      details: {},
      source: 'participant',
    });
  }, [focusTarget, optionLocations, participantLocations, options, participants, selectPlace]);

  const handleSearchSelect = useCallback(
    (result) => {
      if (!result?.place) return;
      selectPlace({ ...result.place, source: 'search' });
    },
    [selectPlace],
  );

  const handlePropose = useCallback(
    (selected) => {
      onProposePlace?.({
        lat: selected.lat,
        lng: selected.lng,
        placeName: selected.name ?? selected.displayName ?? null,
        placeSource: selected.source === 'search' ? 'search' : 'manual',
        // Existing pins are already on the board, so only a real OSM place
        // name is worth carrying over as a starting title.
        title: selected.source === 'option' || selected.source === 'participant'
          ? ''
          : (selected.name ?? ''),
      });
      clearSelection();
    },
    [onProposePlace, clearSelection],
  );

  const handleShareLocation = useCallback((selected) => {
    setSharePrefill({
      lat: selected.lat,
      lng: selected.lng,
      placeName: selected.name ?? selected.displayName ?? null,
    });
    clearSelection();
  }, [clearSelection]);

  return (
    <motion.section
      aria-label="Board map"
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-4"
    >
      <PlaceSearch
        onSelect={handleSearchSelect}
        placeholder="Search this area for a place..."
      />

      {/* `relative` anchors the bottom sheet on mobile; `lg:flex` hands the
          panel back to normal flow as a side panel on desktop. */}
      <div className="relative lg:flex lg:items-start lg:gap-4">
        <div className="min-w-0 flex-1">
          <BoardMap
            onMapClick={inspectCoordinates}
            onSelectPin={selectPlace}
            focus={focusTarget}
          />
        </div>

        {/* The sheet settles up from the map edge on mobile and reads the
            same on desktop — a tapped pin should feel like it surfaced
            something, not flipped a panel on. */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              key="place-details"
              initial={reduceMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? false : { opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 380, damping: 34 }}
              className="absolute inset-x-0 bottom-0 z-[500] max-h-[70%] lg:static lg:max-h-none lg:w-80 lg:shrink-0 lg:self-stretch"
            >
              <PlaceDetailsPanel
                place={place}
                status={status}
                error={error}
                onClose={clearSelection}
                onPropose={handlePropose}
                onShareLocation={handleShareLocation}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <LocationOptIn boardId={boardId} prefill={sharePrefill} />
    </motion.section>
  );
};

export default BoardMapSection;
