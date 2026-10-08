import { useEffect, useState, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import * as maplibregl from 'maplibre-gl';
import { setWorkerUrl } from 'maplibre-gl';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Map, Satellite, Navigation } from 'lucide-react';

// Bundle MapLibre's module worker explicitly so Vite serves it as an asset.
// Without this, the map controls can render while the style/vector tiles fail.
setWorkerUrl(workerUrl);

const BASE_STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';
// Esri's imagery endpoints are keyless, so the satellite toggle survives the
// move off Leaflet. The paths are {z}/{y}/{x} because Esri orders rows before
// columns — MapLibre's own {z}/{x}/{y} placeholders make that template valid.
const SATELLITE_URL =
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
const SATELLITE_LABELS_URL =
  'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}';


const satelliteStyle = () => ({
  version: 8,
  sources: {
    esri: {
      type: 'raster',
      tiles: [SATELLITE_URL],
      tileSize: 256,
      maxzoom: 19,
      attribution: 'Imagery &copy; Esri, Maxar, Earthstar Geographics',
    },
    'esri-labels': {
      type: 'raster',
      tiles: [SATELLITE_LABELS_URL],
      tileSize: 256,
      maxzoom: 19,
      attribution: 'Labels &copy; Esri',
    },
  },
  layers: [
    { id: 'esri', type: 'raster', source: 'esri' },
    { id: 'esri-labels', type: 'raster', source: 'esri-labels', paint: { 'raster-opacity': 0.9 } },
  ],
});

// Pin element: the point-of-interest dot is the anchor 'center' of the marker
// box; the always-visible label hangs below it as an absolutely-positioned
// sibling so it never shifts the anchor. Same look as the old Leaflet divIcons.
const pinElement = (inner, label) => {
  const el = document.createElement('div');
  el.style.position = 'relative';
  el.innerHTML = `
    <div style="position:relative;width:${inner.size}px;height:${inner.size}px">
      ${inner.highlight ? '<div style="position:absolute;inset:-4px;border-radius:50%;border:2px solid var(--accent-primary);background:rgba(255,107,74,0.14);box-shadow:0 2px 10px rgba(0,0,0,.45)"></div>' : ''}
      <div style="position:absolute;inset:0;border-radius:50%;background:${inner.background};border:3px solid var(--bg-surface);display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,.4)">
        ${inner.icon}
      </div>
    </div>
    <div style="position:absolute;top:calc(100% + 2px);left:50%;transform:translateX(-50%);padding:2px 6px;border-radius:4px;background:var(--bg-surface);border:1px solid var(--border-default);white-space:nowrap;font-family:var(--font-sans);font-size:11px;font-weight:600;color:var(--text-primary);box-shadow:0 1px 4px rgba(0,0,0,.3);max-width:120px;overflow:hidden;text-overflow:ellipsis">
      ${label}
    </div>`;
  return el;
};

const TROPHY =
  '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--bg-surface)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>';

const PERSON =
  '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--bg-surface)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';

const optionPinElement = (isLeading, highlighted, label) =>
  pinElement(
    {
      size: isLeading ? 36 : 30,
      background: isLeading ? 'var(--accent-secondary)' : 'var(--accent-primary)',
      highlight: highlighted,
      icon: isLeading ? TROPHY : '<div style="width:8px;height:8px;border-radius:50%;background:var(--text-primary)"></div>',
    },
    `${isLeading ? '★ ' : ''}${label}`,
  );

const participantPinElement = (name, highlighted) =>
  pinElement(
    { size: 26, background: 'var(--accent-secondary)', highlight: highlighted, icon: PERSON },
    name,
  );

const currentPositionElement = () => {
  const el = document.createElement('div');
  el.style.position = 'relative';
  el.innerHTML = `
    <div style="position:relative;width:20px;height:20px">
      <div style="position:absolute;inset:-8px;border-radius:50%;background:rgb(var(--text-primary-rgb) / 0.22);animation:currentPulse 2s ease-out infinite"></div>
      <div style="position:absolute;inset:0;border-radius:50%;background:var(--text-primary);border:3px solid var(--bg-base);box-shadow:0 1px 6px rgba(0,0,0,.5)"></div>
    </div>
    <div style="position:absolute;top:calc(100% + 4px);left:50%;transform:translateX(-50%);padding:3px 8px;border-radius:4px;background:var(--bg-surface);border:1px solid var(--border-default);white-space:nowrap;font-family:var(--font-sans);font-size:11px;font-weight:600;color:var(--text-primary);box-shadow:0 1px 4px rgba(0,0,0,.3)">
      You are here
    </div>`;
  return el;
};

const BoardMap = ({ onMapClick, onSelectPin, selectable = false, focus = null }) => {
  const participants = useSelector((state) => state.board.participants);
  const options = useSelector((state) => state.board.options);
  const myId = useSelector((state) => state.session?.id);
  const participantLocations = useSelector((state) => state.board.participantLocations);
  const optionLocations = useSelector((state) => state.board.optionLocations);
  const [satellite, setSatellite] = useState(false);

  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const posMarkerRef = useRef(null);

  const participantNameMap = useMemo(() => {
    const map = {};
    for (const p of participants) map[p.id] = p.displayName;
    return map;
  }, [participants]);

  const optionByOptionId = useMemo(() => {
    const map = {};
    for (const o of options) map[o.id] = o;
    return map;
  }, [options]);

  const allLocations = useMemo(() => {
    const points = [];
    for (const loc of optionLocations) points.push([loc.lng, loc.lat]);
    for (const loc of participantLocations) points.push([loc.lng, loc.lat]);
    return points;
  }, [optionLocations, participantLocations]);

  // Map creation — once. Layers/pins update through their own effects below.
  useEffect(() => {
    const center = participantLocations[0]
      ? [participantLocations[0].lng, participantLocations[0].lat]
      : optionLocations[0]
        ? [optionLocations[0].lng, optionLocations[0].lat]
        : [-74.006, 40.7128];

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: BASE_STYLE_URL,
      center,
      zoom: 12,
      attributionControl: true,
      // Keep the standard map gestures active in both browse and pick modes.
      // In particular, disabling scroll zoom outside pick mode made the map
      // feel unresponsive even though the +/- buttons were visible.
      scrollZoom: true,
    });
    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl(), 'top-right');


    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => map.flyTo({ center: [pos.coords.longitude, pos.coords.latitude], zoom: 13, duration: 1200 }),
        () => {},
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 },
      );
    }

    const watchId = navigator.geolocation
      ? navigator.geolocation.watchPosition(
          (p) => {
            const lngLat = [p.coords.longitude, p.coords.latitude];
            if (!posMarkerRef.current) {
              posMarkerRef.current = new maplibregl.Marker({ element: currentPositionElement(), anchor: 'center' })
                .setLngLat(lngLat)
                .addTo(map);
            } else {
              posMarkerRef.current.setLngLat(lngLat);
            }
          },
          () => {},
          { enableHighAccuracy: true, maximumAge: 10000 },
        )
      : null;

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
      posMarkerRef.current?.remove();
      posMarkerRef.current = null;
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Click-to-pick + crosshair + scroll zoom follow the interaction mode.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const handleClick = (e) => onMapClick?.({ lat: e.lngLat.lat, lng: e.lngLat.lng });
    map.on('click', handleClick);
    map.getCanvasContainer().style.cursor = selectable ? 'crosshair' : onMapClick ? 'pointer' : '';
    map.scrollZoom.enable();

    return () => {
      map.off('click', handleClick);
      map.getCanvasContainer().style.cursor = '';
    };
  }, [onMapClick, selectable]);

  // Satellite toggle swaps the whole style — but only on an actual flip.
  // Calling setStyle with the style the map already has (i.e. on mount)
  // aborts the initial style load and wedges the vector TileJSON source.
  const didMountRef = useRef(false);
  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }
    const map = mapRef.current;
    if (!map) return;
    map.setStyle(satellite ? satelliteStyle() : BASE_STYLE_URL);
  }, [satellite]);

  // Pin markers, rebuilt when data changes. Markers are imperative in
  // MapLibre; each carries its always-visible label.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const markers = [];
    for (const loc of optionLocations) {
      const option = optionByOptionId[loc.optionId];
      const isFocused = focus?.optionId === loc.optionId;
      const el = optionPinElement(Boolean(option?.isLeading), isFocused, option?.title ?? loc.placeName ?? 'Option');
      if (isFocused) el.style.zIndex = 1000;
      const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat([loc.lng, loc.lat])
        .addTo(map);
      el.addEventListener('click', () =>
        onSelectPin?.({
          name: option?.title ?? loc.placeName ?? null,
          displayName: loc.placeName ?? null,
          lat: loc.lat,
          lng: loc.lng,
          address: null,
          details: {},
          source: 'option',
        }),
      );
      markers.push(marker);
    }

    for (const loc of participantLocations) {
      const name = loc.participantId === myId ? 'You' : (participantNameMap[loc.participantId] ?? 'Participant');
      const isFocused = focus?.participantId === loc.participantId;
      const el = participantPinElement(name, isFocused);
      if (isFocused) el.style.zIndex = 1000;
      const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat([loc.lng, loc.lat])
        .addTo(map);
      el.addEventListener('click', () =>
        onSelectPin?.({
          name,
          displayName: loc.label ?? null,
          lat: loc.lat,
          lng: loc.lng,
          address: null,
          details: {},
          source: 'participant',
        }),
      );
      markers.push(marker);
    }

    return () => markers.forEach((m) => m.remove());
  }, [optionLocations, participantLocations, optionByOptionId, participantNameMap, myId, focus, onSelectPin]);

  // Fit to all pins; a focus handoff wins so the pointed-at pin stays put.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || allLocations.length === 0 || focus) return;
    const pad = 40;
    const lngs = allLocations.map(([lng]) => lng);
    const lats = allLocations.map(([, lat]) => lat);
    map.fitBounds(
      [
        [Math.min(...lngs), Math.min(...lats)],
        [Math.max(...lngs), Math.max(...lats)],
      ],
      { padding: pad, maxZoom: 15, duration: 800 },
    );
  }, [allLocations, focus]);

  const focusId = focus ? (focus.optionId ? `o-${focus.optionId}` : `p-${focus.participantId}`) : null;
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !focus) return;
    map.flyTo({ center: [focus.lng, focus.lat], zoom: Math.max(map.getZoom(), 14), duration: 900 });
  }, [focusId, focus]);

  return (
    <div className={`relative overflow-hidden rounded-card border border-border ${selectable ? 'cursor-crosshair' : ''}`}>
      <div ref={containerRef} className="h-96 w-full sm:h-[40rem]" />

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

      <button
        type="button"
        onClick={() => {
          if (!navigator.geolocation || !mapRef.current) return;
          navigator.geolocation.getCurrentPosition(
            (pos) => mapRef.current.flyTo({ center: [pos.coords.longitude, pos.coords.latitude], zoom: 14, duration: 1000 }),
            () => {},
            { enableHighAccuracy: true, timeout: 5000 },
          );
        }}
        className="absolute right-2 top-28 z-[400] flex h-8 w-8 items-center justify-center rounded-btn border border-border bg-surface/90 text-text-muted backdrop-blur-sm transition-colors duration-150 hover:text-accent"
        title="Go to my location"
      >
        <Navigation className="h-4 w-4" />
      </button>
    </div>
  );
};

export default BoardMap;
