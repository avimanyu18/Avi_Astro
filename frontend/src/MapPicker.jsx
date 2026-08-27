import React, { useEffect, useRef, useState } from 'react';

export default function MapPicker({ selectedLat, selectedLon, onLocationSelect }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [displayLocationName, setDisplayLocationName] = useState('Selected Location');

  useEffect(() => {
    if (!window.L || !mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialLat = selectedLat || 28.6139;
      const initialLon = selectedLon || 77.2090;

      const map = window.L.map(mapContainerRef.current).setView([initialLat, initialLon], 10);
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
      }).addTo(map);

      const customIcon = window.L.divIcon({
        className: 'custom-map-pin',
        html: `<div style="background-color:#f59e0b; width:22px; height:22px; border-radius:50%; border:3px solid #ffffff; box-shadow:0 0 12px rgba(245,158,11,0.8); cursor:pointer;"></div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11]
      });

      const marker = window.L.marker([initialLat, initialLon], {
        draggable: true,
        icon: customIcon
      }).addTo(map);

      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        handleNewCoordinates(pos.lat, pos.lng);
      });

      map.on('click', (e) => {
        marker.setLatLng(e.latlng);
        handleNewCoordinates(e.latlng.lat, e.latlng.lng);
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;
    }
  }, []);

  const handleNewCoordinates = async (lat, lon) => {
    const approxTz = Math.round((lon / 15.0) * 2) / 2.0;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
      if (res.ok) {
        const data = await res.json();
        const name = data.display_name || `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
        setDisplayLocationName(name);
        onLocationSelect({ name, lat: roundCoord(lat), lon: roundCoord(lon), tz: approxTz });
        return;
      }
    } catch (e) {
      console.warn("Reverse geocode error:", e);
    }
    const fallbackName = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
    setDisplayLocationName(fallbackName);
    onLocationSelect({ name: fallbackName, lat: roundCoord(lat), lon: roundCoord(lon), tz: approxTz });
  };

  const roundCoord = (val) => Math.round(val * 10000) / 10000;

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data);
      }
    } catch (e) {
      console.warn("Search error:", e);
    }
    setIsSearching(false);
  };

  const selectSearchResult = (item) => {
    const lat = parseFloat(item.lat);
    const lon = parseFloat(item.lon);

    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.setView([lat, lon], 12);
      markerRef.current.setLatLng([lat, lon]);
    }
    setSearchResults([]);
    setSearchQuery(item.display_name);
    handleNewCoordinates(lat, lon);
  };

  const handleUseGPS = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser/device.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setView([lat, lon], 13);
          markerRef.current.setLatLng([lat, lon]);
        }
        handleNewCoordinates(lat, lon);
      },
      (err) => {
        alert("GPS Error: " + err.message);
      }
    );
  };

  return (
    <div className="space-y-2">
      {/* Search & GPS Controls */}
      <div className="space-y-1.5">
        <div className="flex space-x-1.5">
          <input
            type="text"
            placeholder="Search city/birthplace on map..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1 bg-slate-900 border border-amber-500/30 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-400"
          />
          <button
            onClick={handleSearch}
            className="px-3 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-semibold transition"
          >
            {isSearching ? '...' : 'Search'}
          </button>
          <button
            onClick={handleUseGPS}
            title="Use My Device GPS Location"
            className="px-3 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-semibold transition"
          >
            📍 GPS
          </button>
        </div>

        {/* Search Results Dropdown */}
        {searchResults.length > 0 && (
          <div className="bg-slate-900 border border-amber-500/40 rounded-xl overflow-hidden shadow-2xl max-h-36 overflow-y-auto">
            {searchResults.map((item, idx) => (
              <button
                key={idx}
                onClick={() => selectSearchResult(item)}
                className="w-full p-2 text-left text-xs hover:bg-amber-500/20 border-b border-slate-800 text-slate-200 transition truncate"
              >
                {item.display_name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Map Element */}
      <div
        ref={mapContainerRef}
        className="w-full h-44 rounded-2xl border border-amber-500/30 overflow-hidden shadow-md"
        style={{ zIndex: 10 }}
      />

      {/* Selected Location Summary */}
      <div className="text-[11px] text-amber-200/90 font-medium bg-slate-900/80 p-2 rounded-xl border border-slate-800 flex justify-between items-center">
        <span className="truncate max-w-[240px]">📍 {displayLocationName}</span>
        <span className="font-bold text-amber-400 text-[10px]">
          {selectedLat?.toFixed(2)}°, {selectedLon?.toFixed(2)}°
        </span>
      </div>
    </div>
  );
}
