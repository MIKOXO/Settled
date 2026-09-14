import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
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
import { Map, Satellite, Navigation, Trophy, MessageSquare, ThumbsUp, ExternalLink } from 'lucide-react';
import { fetchLocations } from '../../services/location';

const STANDARD_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const SATELLITE_URL = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

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

const PARTICIPANT_ICON = divIcon({
  className: '',
  html: `<div style="position:relative;display:flex;flex-direction:column;align-items:center">
    <div style="width:26px;height:26px;border-radius:50%;background:var(--accent-secondary);border:3px solid var(--bg-surface);display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,.4)">
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--bg-surface)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
    </div>
    <div style="margin-top:2px;padding:2px 6px;border-radius:4px;background:var(--bg-surface);border:1px solid var(--border-default);white-space:nowrap;font-family:var(--font-sans);font-size:11px;font-weight:600;color:var(--text-primary);box-shadow:0 1px 4px rgba(0,0,0,.3)">
      You
    </div>
  </div>`,
  iconSize: [26, 42],
  iconAnchor: [13, 42],
  popupAnchor: [0, -42],
});

const makeParticipantIcon = (name) => divIcon({
  className: '',
  html: `<div style="position:relative;display:flex;flex-direction:column;align-items:center">
    <div style="width:26px;height:26px;border-radius:50%;background:var(--accent-secondary);border:3px solid var(--bg-surface);display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,.4)">
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--bg-surface)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
    </div>
    <div style="margin-top:2px;padding:2px 6px;border-radius:4px;background:var(--bg-surface);border:1px solid var(--border-default);white-space:nowrap;font-family:var(--font-sans);font-size:11px;font-weight:600;color:var(--text-primary);box-shadow:0 1px 4px rgba(0,0,0,.3);max-width:100px;overflow:hidden;text-overflow:ellipsis">
      ${name}
    </div>
  </div>`,
  iconSize: [26, 42],
  iconAnchor: [13, 42],
  popupAnchor: [0, -42],
});

const MapClickHandler = ({ onMapClick }) => {
  useMapEvents({
    click: (e) => {
      onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
};

const CURRENT_POS_ICON = divIcon({
  className: '',
  html: `<div style="position:relative;display:flex;flex-direction:column;align-items:center">
    <div style="position:relative;width:20px;height:20px">
      <div style="position:absolute;inset:-8px;border-radius:50%;background:rgba(59,130,246,0.18);animation:currentPulse 2s ease-out infinite"></div>
      <div style="position:absolute;inset:0;border-radius:50%;background:#3B82F6;border:3px solid #fff;box-shadow:0 1px 6px rgba(0,0,0,.4)"></div>
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

const BoardMap = ({ onMapClick, selectable = false }) => {
  const { boardId } = useParams();
  const participants = useSelector((state) => state.board.participants);
  const options = useSelector((state) => state.board.options);
  const session = useSelector((state) => state.session);
  const [participantLocations, setParticipantLocations] = useState([]);
  const [optionLocations, setOptionLocations] = useState([]);
  const [satellite, setSatellite] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetchLocations(boardId);
        if (!cancelled) {
          setParticipantLocations(res.participantLocations ?? []);
          setOptionLocations(res.optionLocations ?? []);
        }
      } catch {
        // silent
      }
    };

    load();
    return () => { cancelled = true; };
  }, [boardId]);

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

  const allLocations = useMemo(() => {
    const points = [];
    for (const loc of optionLocations) {
      points.push([loc.lat, loc.lng]);
    }
    for (const loc of participantLocations) {
      points.push([loc.lat, loc.lng]);
    }
    if (session) {
      // include user's own location from participantLocations if present
    }
    return points;
  }, [optionLocations, participantLocations, session]);

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
    ? 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ'
    : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

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
        <ZoomControl position="topright" />
        <AttributionControl position="bottomright" prefix={false} />

        <Geolocate />
        <CurrentPositionMarker />
        {bounds && <FitBounds bounds={bounds} />}
        {selectable && <MapClickHandler onMapClick={onMapClick} />}

        {optionLocations.map((loc, i) => {
          const option = optionByOptionId[loc.optionId];
          const isLeading = option?.isLeading;
          const icon = makeOptionIcon(isLeading);

          return (
            <Marker key={`opt-${loc.optionId ?? i}`} position={[loc.lat, loc.lng]} icon={icon}>
              <Popup maxWidth={280} minWidth={220} className="board-map-popup">
                <div style={{ fontFamily: 'var(--font-sans)' }}>
                  {option?.photoUrl && (
                    <div style={{ margin: '-9px -20px 10px', overflow: 'hidden', borderRadius: '8px 8px 0 0' }}>
                      <img
                        src={option.photoUrl}
                        alt={option.title}
                        style={{ width: '100%', height: 120, objectFit: 'cover', display: 'block' }}
                      />
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <div style={{
                      flex: 1,
                      minWidth: 0,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                        {isLeading && (
                          <span style={{ color: 'var(--accent-secondary)', fontSize: 12 }}>
                            <Trophy style={{ width: 14, height: 14, display: 'inline' }} />
                          </span>
                        )}
                        <h3 style={{
                          fontFamily: 'var(--font-heading)',
                          fontSize: 14,
                          fontWeight: 700,
                          color: 'var(--text-primary)',
                          margin: 0,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}>
                          {option?.title ?? loc.placeName ?? 'Option'}
                        </h3>
                      </div>

                      {option?.notes && (
                        <p style={{
                          fontSize: 12,
                          color: 'var(--text-muted)',
                          margin: '4px 0 0',
                          lineHeight: 1.4,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}>
                          {option.notes}
                        </p>
                      )}

                      {!option && loc.placeName && (
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '4px 0 0' }}>
                          {loc.placeName}
                        </p>
                      )}
                    </div>
                  </div>

                  {option && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      marginTop: 10,
                      paddingTop: 8,
                      borderTop: '1px solid var(--border-default)',
                      fontSize: 12,
                      color: 'var(--text-muted)',
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <ThumbsUp style={{ width: 12, height: 12 }} />
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {option.score ?? 0}
                        </span>
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <MessageSquare style={{ width: 12, height: 12 }} />
                        {option.commentCount ?? 0}
                      </span>
                      {option.link && (
                        <a
                          href={option.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          style={{ display: 'flex', alignItems: 'center', gap: 3, color: 'var(--accent-primary)', textDecoration: 'none', marginLeft: 'auto' }}
                        >
                          <ExternalLink style={{ width: 12, height: 12 }} />
                          Link
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {participantLocations.map((loc) => {
          const name = participantNameMap[loc.participantId] ?? 'Participant';
          const isMe = session && loc.participantId === session.id;
          const icon = isMe ? PARTICIPANT_ICON : makeParticipantIcon(name);

          return (
            <Marker key={`p-${loc.participantId}`} position={[loc.lat, loc.lng]} icon={icon}>
              <Popup maxWidth={220} minWidth={160}>
                <div style={{ fontFamily: 'var(--font-sans)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: 'var(--accent-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <span style={{ fontFamily: 'var(--font-heading)', fontSize: 13, fontWeight: 700, color: 'var(--bg-surface)' }}>
                        {name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{
                        fontFamily: 'var(--font-heading)',
                        fontSize: 14,
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        margin: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {isMe ? 'You' : name}
                      </p>
                      {loc.label && (
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0' }}>
                          {loc.label}
                        </p>
                      )}
                    </div>
                  </div>
                  <p style={{
                    fontSize: 11,
                    color: 'var(--text-muted)',
                    margin: '8px 0 0',
                    paddingTop: 6,
                    borderTop: '1px solid var(--border-default)',
                  }}>
                    Shared their location with the board
                  </p>
                </div>
              </Popup>
            </Marker>
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
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: '#3B82F6' }} />
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
