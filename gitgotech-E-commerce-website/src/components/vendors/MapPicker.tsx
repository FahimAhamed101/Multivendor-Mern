"use client";
import { useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface Props {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
}

function ClickHandler({ onChange }: { onChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function FlyTo({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  map.flyTo([lat, lng], 14);
  return null;
}

export default function MapPicker({ lat, lng, onChange }: Props) {
  const [query, setQuery] = useState('');
  const [flyTarget, setFlyTarget] = useState<{ lat: number; lng: number } | null>(null);
  const [searching, setSearching] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&accept-language=en`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      if (data.length > 0) {
        const { lat: resLat, lon: resLng } = data[0];
        const newLat = parseFloat(resLat);
        const newLng = parseFloat(resLng);
        onChange(newLat, newLng);
        setFlyTarget({ lat: newLat, lng: newLng });
      }
    } catch {
      // silently fail
    } finally {
      setSearching(false);
    }
  };

  return (
    <div>
      {/* Search Box */}
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Search location..."
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
        />
        <button
          type="button"
          onClick={handleSearch}
          disabled={searching}
          className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 rounded-lg text-white text-sm transition disabled:opacity-50"
        >
          {searching ? '...' : 'Search'}
        </button>
      </div>

      <MapContainer
        center={[lat || 23.8103, lng || 90.4125]}
        zoom={13}
        style={{ height: '350px', width: '100%', borderRadius: '12px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <ClickHandler onChange={onChange} />
        {flyTarget && <FlyTo lat={flyTarget.lat} lng={flyTarget.lng} />}
        {lat !== 0 && lng !== 0 && <Marker position={[lat, lng]} />}
      </MapContainer>
    </div>
  );
}
