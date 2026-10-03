import { useEffect, useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  useMap,
  ZoomControl,
  AttributionControl,
} from 'react-leaflet';
import { divIcon, latLngBounds } from 'leaflet';
import { Map, Satellite, Navigation } from 'lucide-react';

const STANDARD_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const SATELLITE_URL = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
// Free Esri reference cartography, drawn on top of the imagery so place names
// stay readable in satellite mode. If the service is unreachable the tiles
// simply never paint — the imagery underneath is unaffected.
const SATELLITE_LABELS_URL =
  'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}';
const BLANK_TILE =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

const makeOptionIcon = (isLeading) => divIcon({
  className: '',
  html: `<div style="position:relative;display:flex;flex-direction:column;align-items:center">
    <div style="width:${isLeading ? 36 : 30}px;height:${isLeading ? 36 : 30}px;border-radius:50%;background:${isLeading ? 'var(--accent-secondary)' : 'var(--accent-primary)'};border:3px solid var(--bg-surface);display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,.4)">
      ${isLeading ? '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--bg-surface)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>' : '<div style="width:8px;height:8px;border-radius:50%;background:var(--text-primary)"></div>'}
    </div>
    <div style="margin-top:2px;padding:2px 6px;border-radius:4px;background:var(--bg-surface);border:1px solid var(--border-default);white-space:nowrap;font-family:var(--font-sans);font-size:11px;font-weight:600;color:var(--text-primary);box-shadow:0 1px 4px rgba(0,0,0,.3);max-width:120px;overflow:hidden;text-overflow:ellipsis">
      ${isLeading ? '★ ' : ''}${'Option'}
    </div>
  </div>`,
  iconSize: [isLeading ? 36 : 30, isLeading ? 52 : 46],
  iconAnchor: [isLeading ? 18 : 15, isLeading ? 52 : 46],
  popupAnchor: [0, isLeading ? -52 : -46],
});

/**
 * People pins. `highlighted` adds a coral ring — the map tab's focus treatment
 * for whoever the People tab handed over, since a plain marker at city zoom can
 * be easy to lose among the option pins.
 */
const makeParticipantIcon = (name, highlighted = false) => divIcon({
  className: '',
  html: `<div style="position:relative;display:flex;flex-direction:column;align-items:center">
    <div style="position:relative;width:26px;height:26px">
      ${highlighted ? '<div style="position:absolute;inset:-4px;border-radius:50%;border:2px solid var(--accent-primary);background:rgba(255,107,74,0.14);box-shadow:0 2px 10px rgba(0,0,0,.45)"></div>' : ''}
      <div style="position:absolute;inset:0;border-radius:50%;background:var(--accent-secondary);border:3px solid var(--bg-surface);display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,.4)">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--bg-surface)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      </div>
    </div>
    <div style="margin-top:2px;padding:2px 6px;border-radius:4px;background:var(--bg-surface);border:1px solid var(--border-default);white-space:nowrap;font-family:var(--font-sans);font-size:11px;font-weight:600;color:var(--text-primary);box-shadow:0 1px 4px rgba(0,0,0,.3);max-width:100px;overflow:hidden;text-overflow:ellipsis">
      ${name}
    </div>
  </div>`,
  iconSize: highlighted ? [34, 50] : [26, 42],
  iconAnchor: highlighted ? [17, 50] : [13, 42],
  popupAnchor: [0, highlighted ? -50 : -42],
});

const MapClickHandler = ({ onMapClick }) => {
  useMapEvents({
    click: (e) => {
      onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
};

// The device's own position. Warm-neutral rather than the usual map-blue —
// blue is off-palette for this product, and white-on-dark reads on both the
// standard and satellite tiles.
const CURRENT_POS_ICON = divIcon({
  className: '',
  html: `<div style="position:relative;display:flex;flex-direction:column;align-items:center">
    <div style="position:relative;width:20px;height:20px">
      <div style="position:absolute;inset:-8px;border-radius:50%;background:rgb(var(--text-primary-rgb) / 0.22);animation:currentPulse 2s ease-out infinite"></div>
      <div style="position:absolute;inset:0;border-radius:50%;background:var(--text-primary);border:3px solid var(--bg-base);box-shadow:0 1px 6px rgba(0,0,0,.5)"></div>
    </div>
    <div style="margin-top:4px;padding:3px 8px;border-radius:4px;background:var(--bg-surface);border:1px solid var(--border-default);white-space:nowrap;font-family:var(--font-sans);font-size:11px;font-weight:600;color:var(--text-primary);box-shadow:0 1px 4px rgba(0,0,0,.3)">
      You are here
    </div>
  </div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -14],
});

const Geolocate = () => {
  const map = useMap();

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        map.flyTo([pos.coords.latitude, pos.coords.longitude], 13, { duration: 1.2 });
      },
      () => {},
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 },
    );
  }, [map]);

  return null;
};

const CurrentPositionMarker = () => {
  const [pos, setPos] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (p) => setPos({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => {},
      { enableHighAccuracy: true, maximumAge: 10000 },
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  if (!pos) return null;

  return (
    <Marker position={[pos.lat, pos.lng]} icon={CURRENT_POS_ICON}>
      <Popup>
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
          You are here
        </span>
      </Popup>
    </Marker>
  );
};

const FitBounds = ({ bounds }) => {
  const map = useMap();

  useEffect(() => {
    if (bounds && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15, duration: 0.8 });
    }
  }, [map, bounds]);

  return null;
};

/** Flies to a single pin handed over from another tab, at least close enough to read. */
const FlyToFocus = ({ focus }) => {
  const map = useMap();

  useEffect(() => {
    if (!focus) return;
    map.flyTo([focus.lat, focus.lng], Math.max(map.getZoom(), 14), { duration: 0.9 });
  }, [map, focus]);

  return null;
};

const BoardMap = ({ onMapClick, onSelectPin, selectable = false, focus = null }) => {
  const participants = useSelector((state) => state.board.participants);
  const options = useSelector((state) => state.board.options);
  const myId = useSelector((state) => state.session?.id);
  // Pins come from the store, which BoardPage hydrates on load and the socket
  // handlers keep current — the map never runs its own copy of this fetch, so
  // a location shared a moment ago is on the map immediately.
  const participantLocations = useSelector((state) => state.board.participantLocations);
  const optionLocations = useSelector((state) => state.board.optionLocations);
  const [satellite, setSatellite] = useState(false);

  const participantNameMap = useMemo(() => {
    const map = {};
    for (const p of participants) {
      map[p.id] = p.displayName;
    }
    return map;
  }, [participants]);

  const optionByOptionId = useMemo(() => {
    const map = {};
    for (const o of options) {
      map[o.id] = o;
    }
    return map;
  }, [options]);

  // A fresh divIcon makes react-leaflet swap the marker's DOM node, so the
  // icons are built once per real change instead of once per render.
  const participantIcons = useMemo(() => {
    const map = {};
    for (const loc of participantLocations) {
      const participant = participants.find((p) => p.id === loc.participantId);
      const isMe = loc.participantId === myId;
      map[loc.participantId] = makeParticipantIcon(
        isMe ? 'You' : (participant?.displayName ?? 'Participant'),
        focus?.participantId === loc.participantId,
      );
    }
    return map;
  }, [participantLocations, participants, myId, focus?.participantId]);

  const allLocations = useMemo(() => {
    const points = [];
    for (const loc of optionLocations) {
      points.push([loc.lat, loc.lng]);
    }
    for (const loc of participantLocations) {
      points.push([loc.lat, loc.lng]);
    }
    return points;
  }, [optionLocations, participantLocations]);

  const bounds = useMemo(() => {
    if (allLocations.length === 0) return null;
    return latLngBounds(allLocations);
  }, [allLocations]);

  const defaultCenter = participantLocations[0]
    ? [participantLocations[0].lat, participantLocations[0].lng]
    : optionLocations[0]
      ? [optionLocations[0].lat, optionLocations[0].lng]
      : [40.7128, -74.006];

  const tileUrl = satellite ? SATELLITE_URL : STANDARD_URL;
  const tileAttrib = satellite
    ? 'Imagery &copy; Esri, Maxar, Earthstar Geographics'
    : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
  const picksOnClick = Boolean(onMapClick);

  return (
    <div className={`relative overflow-hidden rounded-card border border-border ${selectable ? 'cursor-crosshair' : ''}`}>
      <MapContainer
        center={defaultCenter}
        zoom={12}
        className="h-96 w-full sm:h-[40rem]"
        scrollWheelZoom={selectable}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer key={satellite ? 'sat' : 'std'} url={tileUrl} attribution={tileAttrib} />
        {satellite && (
          <TileLayer
            key="sat-labels"
            url={SATELLITE_LABELS_URL}
            attribution="Labels &copy; Esri"
            opacity={0.9}
            errorTileUrl={BLANK_TILE}
            maxNativeZoom={19}
          />
        )}
        <ZoomControl position="topright" />
        <AttributionControl position="bottomright" prefix={false} />

        <Geolocate />
        <CurrentPositionMarker />
        {/* Focus wins over fit-all: the pin the People tab pointed at is the
            one thing the user asked to look at. */}
        {bounds && !focus && <FitBounds bounds={bounds} />}
        <FlyToFocus focus={focus} />
        {(selectable || picksOnClick) && <MapClickHandler onMapClick={onMapClick} />}

        {optionLocations.map((loc, i) => {
          const option = optionByOptionId[loc.optionId];
          const isLeading = option?.isLeading;
          const icon = makeOptionIcon(isLeading);

          return (
            <Marker
              key={`opt-${loc.optionId ?? i}`}
              position={[loc.lat, loc.lng]}
              icon={icon}
              eventHandlers={{
                click: () =>
                  onSelectPin?.({
                    name: option?.title ?? loc.placeName ?? null,
                    displayName: loc.placeName ?? null,
                    lat: loc.lat,
                    lng: loc.lng,
                    address: null,
                    details: {},
                    source: 'option',
                  }),
              }}
            />
          );
        })}

        {participantLocations.map((loc) => {
          const name = participantNameMap[loc.participantId] ?? 'Participant';
          const isMe = loc.participantId === myId;
          const isFocused = focus?.participantId === loc.participantId;

          return (
            <Marker
              key={`p-${loc.participantId}`}
              position={[loc.lat, loc.lng]}
              icon={participantIcons[loc.participantId]}
              zIndexOffset={isFocused ? 1000 : 0}
              eventHandlers={{
                click: () =>
                  onSelectPin?.({
                    name: isMe ? 'You' : name,
                    displayName: loc.label ?? null,
                    lat: loc.lat,
                    lng: loc.lng,
                    address: null,
                    details: {},
                    source: 'participant',
                  }),
              }}
            />
          );
        })}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-2 left-2 z-[400] flex gap-3 rounded-btn bg-surface/90 px-3 py-2 backdrop-blur-sm">
        <span className="flex items-center gap-1.5 font-sans text-xs text-text-muted">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-accent" />
          Options
        </span>
        <span className="flex items-center gap-1.5 font-sans text-xs text-text-muted">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-accent-secondary" />
          People
        </span>
        <span className="flex items-center gap-1.5 font-sans text-xs text-text-muted">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-text-primary ring-1 ring-background" />
          You
        </span>
      </div>

      {/* Satellite / Standard toggle */}
      <div className="absolute top-2 right-14 z-[400] flex overflow-hidden rounded-btn border border-border bg-surface/90 backdrop-blur-sm">
        <button
          type="button"
          onClick={() => setSatellite(false)}
          className={`flex items-center gap-1.5 px-3 py-1.5 font-sans text-xs font-medium transition-colors duration-150 ${
            !satellite ? 'bg-accent text-background' : 'text-text-muted hover:text-text-primary'
          }`}
        >
          <Map className="h-3.5 w-3.5" />
          Map
        </button>
        <button
          type="button"
          onClick={() => setSatellite(true)}
          className={`flex items-center gap-1.5 px-3 py-1.5 font-sans text-xs font-medium transition-colors duration-150 ${
            satellite ? 'bg-accent text-background' : 'text-text-muted hover:text-text-primary'
          }`}
        >
          <Satellite className="h-3.5 w-3.5" />
          Satellite
        </button>
      </div>

      {/* Locate me button */}
      <button
        type="button"
        onClick={() => {
          if (!navigator.geolocation) return;
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const mapEl = document.querySelector('.leaflet-container');
              if (mapEl && mapEl._leaflet_map) {
                mapEl._leaflet_map.flyTo([pos.coords.latitude, pos.coords.longitude], 14, { duration: 1 });
              }
            },
            () => {},
            { enableHighAccuracy: true, timeout: 5000 },
          );
        }}
        className="absolute top-2 right-2 z-[400] flex h-8 w-8 items-center justify-center rounded-btn border border-border bg-surface/90 text-text-muted backdrop-blur-sm transition-colors duration-150 hover:text-accent"
        title="Go to my location"
      >
        <Navigation className="h-4 w-4" />
      </button>
    </div>
  );
};

export default BoardMap;
