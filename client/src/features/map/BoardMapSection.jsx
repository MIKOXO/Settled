import { useCallback, useState } from 'react';
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
const BoardMapSection = ({ boardId, onProposePlace }) => {
  const { place, status, error, isOpen, selectPlace, inspectCoordinates, clearSelection } =
    useSelectedPlace();
  const [sharePrefill, setSharePrefill] = useState(null);

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
    <section aria-label="Board map" className="space-y-4">
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
          />
        </div>

        {isOpen && (
          <div className="absolute inset-x-0 bottom-0 z-[500] max-h-[70%] lg:static lg:max-h-none lg:w-80 lg:shrink-0 lg:self-stretch">
            <PlaceDetailsPanel
              place={place}
              status={status}
              error={error}
              onClose={clearSelection}
              onPropose={handlePropose}
              onShareLocation={handleShareLocation}
            />
          </div>
        )}
      </div>

      <LocationOptIn boardId={boardId} prefill={sharePrefill} />
    </section>
  );
};

export default BoardMapSection;
