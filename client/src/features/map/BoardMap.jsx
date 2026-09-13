import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { divIcon } from 'leaflet';
import { fetchLocations } from '../../services/location';

const OPTION_ICON = divIcon({
  className: '',
  html: '<div style="width:28px;height:28px;border-radius:50%;background:#FF6B4A;border:3px solid #221C17;display:flex;align-items:center;justify-content:center"><div style="width:8px;height:8px;border-radius:50;background:#F5F1E8"></div></div>',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const PARTICIPANT_ICON = divIcon({
  className: '',
  html: '<div style="width:24px;height:24px;border-radius:50%;background:#F4B942;border:3px solid #221C17;display:flex;align-items:center;justify-content:center"><div style="width:6px;height:6px;border-radius:50%;background:#221C17"></div></div>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const MapClickHandler = ({ onMapClick }) => {
  useMapEvents({
    click: (e) => {
      onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
};

const BoardMap = ({ onMapClick, selectable = false }) => {
  const { boardId } = useParams();
  const [participantLocations, setParticipantLocations] = useState([]);
  const [optionLocations, setOptionLocations] = useState([]);

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
        // silent — map shows empty
      }
    };

    load();
    return () => { cancelled = true; };
  }, [boardId]);

  const center = participantLocations[0]
    ? [participantLocations[0].lat, participantLocations[0].lng]
    : optionLocations[0]
      ? [optionLocations[0].lat, optionLocations[0].lng]
      : [40.7128, -74.006];

  return (
    <div className={`relative overflow-hidden rounded-card border border-border ${selectable ? 'cursor-crosshair' : ''}`}>
      <MapContainer
        center={center}
        zoom={participantLocations.length > 0 || optionLocations.length > 0 ? 13 : 10}
        className="h-72 w-full sm:h-96"
        scrollWheelZoom={selectable}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {selectable && <MapClickHandler onMapClick={onMapClick} />}

        {optionLocations.map((loc, i) => (
          <Marker
            key={`opt-${i}`}
            position={[loc.lat, loc.lng]}
            icon={OPTION_ICON}
          >
            <Popup>
              <span className="font-sans text-sm">{loc.placeName ?? 'Option location'}</span>
            </Popup>
          </Marker>
        ))}

        {participantLocations.map((loc) => (
          <Marker
            key={`p-${loc.participantId}`}
            position={[loc.lat, loc.lng]}
            icon={PARTICIPANT_ICON}
          >
            <Popup>
              <span className="font-sans text-sm">{loc.label ?? 'Participant location'}</span>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <div className="absolute bottom-2 left-2 z-[400] flex gap-2 rounded-btn bg-surface/90 px-2.5 py-1.5 backdrop-blur-sm">
        <span className="flex items-center gap-1.5 font-sans text-xs text-text-muted">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-accent" />
          Options
        </span>
        <span className="flex items-center gap-1.5 font-sans text-xs text-text-muted">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-accent-secondary" />
          Participants
        </span>
      </div>
    </div>
  );
};

export default BoardMap;
