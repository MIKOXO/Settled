import { Clock, ExternalLink, Info, Loader2, MapPin, Phone, Plus, Share2, UtensilsCrossed, Accessibility, X } from 'lucide-react';
import {
  buildPlaceDetailRows,
  formatCoordinates,
  formatPlaceAddress,
  humanizePlaceCategory,
} from '../../utils/placeDetails';

const ROW_ICONS = {
  openingHours: Clock,
  phone: Phone,
  website: ExternalLink,
  cuisine: UtensilsCrossed,
  wheelchair: Accessibility,
};

const DetailRow = ({ row }) => {
  const Icon = ROW_ICONS[row.id] ?? Info;
  const value = row.href ? (
    <a
      href={row.href}
      target={row.id === 'phone' ? undefined : '_blank'}
      rel={row.id === 'phone' ? undefined : 'noopener noreferrer'}
      className="break-words font-sans text-sm text-accent underline-offset-2 transition-colors duration-150 hover:underline"
    >
      {row.value}
    </a>
  ) : (
    <span className="break-words font-sans text-sm text-text-primary">{row.value}</span>
  );

  return (
    <div className="flex items-start gap-3 py-2">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-text-muted" />
      <div className="min-w-0 flex-1">
        <p className="font-sans text-xs text-text-muted">{row.label}</p>
        {value}
      </div>
    </div>
  );
};

const PlaceDetailsPanel = ({
  place,
  status,
  error,
  onClose,
  onPropose,
  onShareLocation,
}) => {
  if (!place && status !== 'loading') return null;

  const isLoading = status === 'loading';
  const name = place?.name ?? place?.displayName;
  const category = humanizePlaceCategory(place?.category, place?.type);
  const address = formatPlaceAddress(place?.address) ?? place?.displayName ?? null;
  const rows = buildPlaceDetailRows(place);
  const canAct = Boolean(place) && !isLoading;

  return (
    <div
      aria-live="polite"
      className="flex max-h-full flex-col overflow-y-auto rounded-t-2xl border border-border bg-surface/95 p-4 shadow-lg backdrop-blur-md lg:rounded-card"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {isLoading ? (
            <p className="flex items-center gap-2 font-sans text-sm text-text-muted">
              <Loader2 className="h-4 w-4 animate-spin" />
              Looking up this spot...
            </p>
          ) : (
            <>
              <h3 className="font-heading text-base font-semibold text-text-primary">
                {name ?? 'Unnamed place'}
              </h3>
              {category && (
                <p className="mt-0.5 font-sans text-xs text-accent">{category}</p>
              )}
              {place && (
                <p className="mt-1 flex items-center gap-1.5 font-sans text-xs text-text-muted">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">
                    {address ?? formatCoordinates(place.lat, place.lng)}
                  </span>
                </p>
              )}
            </>
          )}
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-btn p-1 text-text-muted transition-colors duration-150 hover:text-text-primary"
            aria-label="Close place details"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {error && !isLoading && (
        <p className="mt-3 font-sans text-xs text-error">{error}</p>
      )}

      {!isLoading && rows.length === 0 && !error && (
        <p className="mt-3 font-sans text-xs text-text-muted">
          No extra details on OpenStreetMap for this spot.
        </p>
      )}

      {rows.length > 0 && (
        <div className="mt-3 divide-y divide-border border-t border-border">
          {rows.map((row) => (
            <DetailRow key={row.id} row={row} />
          ))}
        </div>
      )}

      {canAct && (
        <div className="mt-4 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => onPropose(place)}
            className="flex items-center justify-center gap-2 rounded-btn bg-accent px-3 py-2 font-sans text-sm font-semibold text-background transition-all duration-200 hover:brightness-110"
          >
            <Plus className="h-4 w-4" />
            Propose as option
          </button>
          <button
            type="button"
            onClick={() => onShareLocation(place)}
            className="flex items-center justify-center gap-2 rounded-btn border border-border bg-surface-2 px-3 py-2 font-sans text-sm text-text-primary transition-colors duration-200 hover:border-accent"
          >
            <Share2 className="h-4 w-4" />
            Share as my location
          </button>
        </div>
      )}

      <p className="mt-4 border-t border-border pt-2 font-sans text-[11px] text-text-muted/70">
        Data © OpenStreetMap contributors
      </p>
    </div>
  );
};

export default PlaceDetailsPanel;
